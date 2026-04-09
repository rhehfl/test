import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const LOA_API_BASE = 'https://developer-lostark.game.onstove.com';
const LOA_API_KEY = Deno.env.get('LOA_API_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const headers = {
  'content-type': 'application/json',
  accept: 'application/json',
  authorization: LOA_API_KEY,
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loaFetch(path: string) {
  const res = await fetch(`${LOA_API_BASE}${path}`, { headers });
  if (!res.ok) return null;
  return res.json();
}

function extractArkPassivePattern(profile: Record<string, unknown>): string | null {
  const arkPassive = profile.ArkPassive as Record<string, unknown> | undefined;
  if (!arkPassive) return null;
  const points = arkPassive.Points as unknown[];
  if (!Array.isArray(points) || points.length < 3) return null;
  return points
    .slice(0, 3)
    .map((p) => String((p as Record<string, unknown>).Value ?? '0'))
    .join('-');
}

async function collectClass(classId: number): Promise<string[]> {
  const data = await loaFetch(`/ranking/classes/${classId}/worlds/0?page=0`);
  if (!Array.isArray(data)) return [];
  return data.map((r: Record<string, unknown>) => String(r.CharacterName)).filter(Boolean);
}

async function fetchCharacterData(name: string) {
  const encoded = encodeURIComponent(name);
  const [profile, equipment, engravings, gems, skills] = await Promise.all([
    loaFetch(`/armories/characters/${encoded}/profiles`),
    loaFetch(`/armories/characters/${encoded}/equipment`),
    loaFetch(`/armories/characters/${encoded}/engravings`),
    loaFetch(`/armories/characters/${encoded}/gems`),
    loaFetch(`/armories/characters/${encoded}/combat-skills`),
  ]);
  return { profile, equipment, engravings, gems, skills };
}

Deno.serve(async () => {
  // 직업 ID 1~25 순회 (Lost Ark 직업 범위)
  const CLASS_IDS = Array.from({ length: 25 }, (_, i) => i + 1);

  let total = 0;
  let failed = 0;

  for (const classId of CLASS_IDS) {
    const names = await collectClass(classId);
    await delay(200);

    for (const name of names.slice(0, 50)) { // 직업당 최대 50명
      try {
        const { profile, equipment, engravings, gems, skills } = await fetchCharacterData(name);
        if (!profile) continue;

        const p = profile as Record<string, unknown>;
        const row = {
          character_name: String(p.CharacterName ?? name),
          server_name: String(p.ServerName ?? ''),
          class_name: String(p.CharacterClassName ?? ''),
          item_avg_level: p.ItemAvgLevel
            ? parseFloat(String(p.ItemAvgLevel).replace(',', ''))
            : null,
          ark_passive_pattern: extractArkPassivePattern(p),
          profile,
          equipment,
          engravings,
          gems,
          skills,
        };

        const { error } = await supabase
          .from('characters')
          .upsert(row, { onConflict: 'character_name' });

        if (error) failed++;
        else total++;

        await delay(200); // 레이트 리밋 대응
      } catch {
        failed++;
      }
    }
  }

  return new Response(
    JSON.stringify({ ok: true, saved: total, failed }),
    { headers: { 'content-type': 'application/json' } },
  );
});
