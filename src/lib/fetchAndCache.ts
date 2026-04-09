import { supabase } from './supabase';
import { getCharacterProfile } from '../api/getCharacterProfile';
import { getCharacterEquipment } from '../api/getCharacterEquipment';
import { getCharacterEngravings } from '../api/getCharacterEngravings';
import { getCharacterGems } from '../api/getCharacterGems';
import { getCharacterSkills } from '../api/getCharacterSkills';
import type { CharacterProfile, Equipment, EngravingsResponse, GemsResponse, Skill } from '../models/character';

export interface CachedCharacter {
  character_name: string;
  server_name: string | null;
  class_name: string | null;
  item_avg_level: number | null;
  ark_passive_pattern: string | null;
  profile: CharacterProfile | null;
  equipment: Equipment[] | null;
  engravings: EngravingsResponse | null;
  gems: GemsResponse | null;
  skills: Skill[] | null;
  updated_at: string;
}

function extractArkPassivePattern(profile: CharacterProfile): string | null {
  const arkPassive = (profile as unknown as Record<string, unknown>).ArkPassive;
  if (!arkPassive || typeof arkPassive !== 'object') return null;

  const ap = arkPassive as Record<string, unknown>;
  const points = ap.Points;
  if (!Array.isArray(points) || points.length < 3) return null;

  return points
    .slice(0, 3)
    .map((p: unknown) => {
      if (typeof p === 'object' && p !== null && 'Value' in p) {
        return String((p as Record<string, unknown>).Value);
      }
      return '0';
    })
    .join('-');
}

export async function getCharacterFromCache(name: string): Promise<CachedCharacter | null> {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('character_name', name)
    .single();

  if (error || !data) return null;
  return data as CachedCharacter;
}

export async function fetchAndCacheCharacter(name: string): Promise<CachedCharacter> {
  const [profile, equipment, engravings, gems, skills] = await Promise.all([
    getCharacterProfile(name),
    getCharacterEquipment(name),
    getCharacterEngravings(name),
    getCharacterGems(name),
    getCharacterSkills(name),
  ]);

  const arkPassivePattern = extractArkPassivePattern(profile);

  const row = {
    character_name: profile.CharacterName,
    server_name: profile.ServerName,
    class_name: profile.CharacterClassName,
    item_avg_level: profile.ItemAvgLevel ? parseFloat(profile.ItemAvgLevel.replace(',', '')) : null,
    ark_passive_pattern: arkPassivePattern,
    profile,
    equipment,
    engravings,
    gems,
    skills,
  };

  // 백그라운드 upsert — 실패해도 UX에 영향 없음
  supabase
    .from('characters')
    .upsert(row, { onConflict: 'character_name' })
    .then(({ error }) => {
      if (error) console.warn('[cache] upsert failed:', error.message);
    });

  return { ...row, updated_at: new Date().toISOString() };
}

export async function getOrFetchCharacter(name: string): Promise<CachedCharacter> {
  const cached = await getCharacterFromCache(name);
  if (cached) return cached;
  return fetchAndCacheCharacter(name);
}
