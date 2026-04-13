import type { ArkgridRec, GemOption, ActionKind } from '../models/gem';

function fmtPct(p: number) { return (p * 100).toFixed(1) + '%'; }

function kindLabel(o: GemOption): string {
  if (o.kind === 'will') return `의지력 효율 ${o.willDelta > 0 ? '+' : ''}${o.willDelta}`;
  if (o.kind === 'chaos') return '질서/혼돈 포인트 +1';
  if (o.kind === 'effect_up') return '효과 Lv 증가';
  if (o.kind === 'effect_change') return '효과 변경';
  if (o.kind === 'cost') return '가공 비용 변경';
  if (o.kind === 'preserve') return '가공 상태 유지';
  if (o.kind === 'reroll_bonus') return '다른 항목 보기 +1';
  return '기타 옵션';
}

const STEP_COLOR: Record<string, string> = {
  'STEP 1 진입판단': 'text-blue-400',
  'STEP 2 리롤': 'text-yellow-400',
  'STEP 3 조기종료': 'text-red-400',
  '가공': 'text-green-400',
};

export function GemRecPanel({
  rec,
  rerollsLeft,
  onAction,
}: {
  rec: ArkgridRec;
  rerollsLeft: number;
  onAction: (action: ActionKind, chosen?: GemOption) => void;
}) {
  const isExit = rec.action === 'exit' || rec.action === 'done';
  const actionBg = isExit
    ? 'border-red-700 bg-red-900/30'
    : rec.action === 'reroll'
      ? 'border-yellow-700 bg-yellow-900/30'
      : 'border-green-700 bg-green-900/30';
  const stepColor = STEP_COLOR[rec.stepInfo.label] ?? 'text-text-secondary';

  return (
    <section className="rounded-lg border border-border-default bg-bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">추천 행동</p>
        <span className={`text-xs font-semibold ${stepColor}`}>{rec.stepInfo.label}</span>
      </div>

      <div className={`mb-4 rounded-lg border p-3 text-sm font-semibold ${actionBg}`}>
        {rec.action === 'done' && '✅ 목표 달성! 지금 가공 완료를 클릭하세요.'}
        {rec.action === 'exit' && `⛔ 가공 종료 — ${rec.reason}`}
        {rec.action === 'reroll' && `🔄 리롤 — ${rec.reason}`}
        {rec.action === 'craft' && rec.pickOption && `✅ 가공 — ${kindLabel(rec.pickOption)} (${fmtPct(rec.probIfPick)})`}
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 text-center text-xs">
        {[
          { label: '현재 달성확률', val: rec.currentProb },
          { label: '선택 후 확률', val: rec.probIfPick },
          { label: '리롤 기대확률', val: rec.rerollProb },
        ].map(({ label, val }) => (
          <div key={label} className="rounded-md bg-bg-raised px-2 py-2">
            <p className="text-text-muted">{label}</p>
            <p className={`mt-0.5 text-base font-bold ${val >= 0.5 ? 'text-green-400' : val >= 0.2 ? 'text-yellow-400' : 'text-red-400'}`}>
              {fmtPct(val)}
            </p>
          </div>
        ))}
      </div>

      {rec.optionEvals.length > 0 && (
        <div className="mb-4 flex flex-col gap-1.5">
          <p className="text-xs text-text-muted">선택지별 달성 확률 (클릭 시 선택 기록)</p>
          {rec.optionEvals.map((ev, i) => {
            const isBest = ev.option === rec.pickOption;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onAction('craft', ev.option)}
                className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors hover:border-border-strong ${
                  isBest ? 'border-green-700 bg-green-900/30 text-green-300' : 'border-border-default text-text-secondary'
                }`}
              >
                <span>{isBest && '★ '}{kindLabel(ev.option)}</span>
                <span className={`font-mono text-xs ${ev.prob >= 0.3 ? 'text-green-400' : ev.prob >= 0.1 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {fmtPct(ev.prob)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex gap-2">
        {!isExit && rec.pickOption && (
          <button
            type="button"
            onClick={() => onAction('craft', rec.pickOption!)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80 ${
              rec.action === 'craft' ? 'bg-green-700' : 'border border-green-700 text-green-400'
            }`}
          >
            가공 완료
          </button>
        )}
        {rerollsLeft > 0 && !isExit && (
          <button
            type="button"
            onClick={() => onAction('reroll')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-opacity hover:opacity-80 ${
              rec.action === 'reroll' ? 'bg-yellow-600 text-white' : 'border border-yellow-700 text-yellow-400'
            }`}
          >
            리롤 ({rerollsLeft}회)
          </button>
        )}
        <button
          type="button"
          onClick={() => onAction(isExit ? rec.action : 'exit')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-opacity hover:opacity-80 ${
            isExit ? 'bg-red-800 text-white' : 'border border-red-800 text-red-400'
          }`}
        >
          {rec.action === 'done' ? '젬 완성 (다음 젬)' : '가공 종료'}
        </button>
      </div>
    </section>
  );
}
