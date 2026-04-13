// 아크그리드 젬 가공 로직
// 참조: .claude/arkgrid.md, 공식 확률: lostark.game.onstove.com/Probability
import type { GemOption, ArkgridRec } from '../models/gem';
export type { GemOption, ArkgridRec, ActionKind, OptionKind, ArkgridStep } from '../models/gem';

// ─── 공식 확률 데이터 ─────────────────────────────────────────────
const WILL_WEIGHTS = [
  { delta: 4, w: 0.45 },
  { delta: 3, w: 1.75 },
  { delta: 2, w: 4.40 },
  { delta: 1, w: 11.65 },
  { delta: -1, w: 3.00 },
];
const WILL_TOTAL = WILL_WEIGHTS.reduce((s, x) => s + x.w, 0); // 21.25

export const WILL_PROBS = WILL_WEIGHTS.map(({ delta, w }) => ({
  delta,
  prob: w / WILL_TOTAL,
}));

// ─── 젬 등급 설정 ────────────────────────────────────────────────
export const GEM_GRADES: Record<string, { label: string; rounds: number; rerolls: number }> = {
  '고급': { label: '고급', rounds: 5, rerolls: 0 },
  '희귀': { label: '희귀', rounds: 7, rerolls: 1 },
  '영웅': { label: '영웅', rounds: 9, rerolls: 2 },
};

// ─── 발사대 프리셋 ────────────────────────────────────────────────
// arkgrid.md: "의지력 5, 포인트 4 이상 목표 (3-4, 3-5 젬)"
export const BALSADAE_PRESETS = [
  { label: '3-4', willTarget: 3, ptsTarget: 4, desc: '최소 발사대' },
  { label: '3-5', willTarget: 3, ptsTarget: 5, desc: '좋은 발사대' },
  { label: '5-4', willTarget: 5, ptsTarget: 4, desc: '이상적 발사대' },
  { label: '5-5', willTarget: 5, ptsTarget: 5, desc: '고급 발사대' },
] as const;

// ─── DP: (willEff 누적, pts 누적) 결합 분포 ─────────────────────
// 발사대: will = 의지력효율 누적합, chaos = 질혼포인트 누적합
// 고점: 동일 DP, 더 높은 목표값 사용
// 의지력과 질혼 포인트는 4개 선택지에 고정 포함, 각 25%로 선택

const ROUND_TRANSITIONS = [
  ...WILL_WEIGHTS.map(({ delta, w }) => ({
    will: delta, chaos: 0,
    prob: (w / WILL_TOTAL) * 0.25,
  })),
  { will: 0, chaos: 1, prob: 0.25 },
  { will: 0, chaos: 0, prob: 0.50 },
];

export type Distribution = Map<string, number>;

function makeKey(w: number, c: number) { return `${w},${c}`; }

const distCache = new Map<number, Distribution>();

export function calcDistribution(rounds: number): Distribution {
  if (distCache.has(rounds)) return distCache.get(rounds)!;
  let dp: Distribution = new Map([[makeKey(0, 0), 1.0]]);
  for (let r = 0; r < rounds; r++) {
    const next: Distribution = new Map();
    for (const [key, prob] of dp) {
      const [w, c] = key.split(',').map(Number);
      for (const t of ROUND_TRANSITIONS) {
        const nk = makeKey(w + t.will, c + t.chaos);
        next.set(nk, (next.get(nk) ?? 0) + prob * t.prob);
      }
    }
    dp = next;
  }
  distCache.set(rounds, dp);
  return dp;
}

export function calcSuccessProb(dist: Distribution, needWill: number, needChaos: number): number {
  let total = 0;
  for (const [key, prob] of dist) {
    const [w, c] = key.split(',').map(Number);
    if (w >= needWill && c >= needChaos) total += prob;
  }
  return total;
}

export function calcExpected(dist: Distribution): { will: number; chaos: number } {
  let will = 0, chaos = 0;
  for (const [key, prob] of dist) {
    const [w, c] = key.split(',').map(Number);
    will += w * prob; chaos += c * prob;
  }
  return { will, chaos };
}

// ─── arkgrid.md 기반 추천 로직 ──────────────────────────────────

export function arkgridRecommend(params: {
  options: GemOption[];
  mode: 'balsadae' | 'gopjeom';
  isFirstRound: boolean;        // STEP 1 판단
  remainingRounds: number;      // 이번 라운드 포함
  currentWill: number;          // 누적 의지력효율
  currentChaos: number;         // 누적 포인트
  targetWill: number;
  targetChaos: number;
  rerollsLeft: number;
}): ArkgridRec {
  const {
    options, mode, isFirstRound, remainingRounds,
    currentWill, currentChaos, targetWill, targetChaos, rerollsLeft,
  } = params;

  const afterRound = remainingRounds - 1;
  const needWill = targetWill - currentWill;
  const needChaos = targetChaos - currentChaos;
  const alreadyDone = needWill <= 0 && needChaos <= 0;

  // 현재 달성 확률
  const currentProb = alreadyDone ? 1 :
    remainingRounds <= 0 ? 0 :
    calcSuccessProb(calcDistribution(remainingRounds), needWill, needChaos);

  // 각 옵션 선택 후 달성 확률
  const optionEvals = options.map((opt) => ({
    option: opt,
    prob: alreadyDone ? 1 :
      afterRound <= 0 && needWill - opt.willDelta <= 0 && needChaos - opt.chaosDelta <= 0 ? 1 :
      afterRound <= 0 ? 0 :
      calcSuccessProb(
        calcDistribution(afterRound),
        needWill - opt.willDelta,
        needChaos - opt.chaosDelta,
      ),
  })).sort((a, b) => b.prob - a.prob);

  const best = optionEvals[0];
  const probIfPick = best?.prob ?? 0;

  // 리롤 기대 달성 확률
  let rerollProb = 0;
  if (rerollsLeft > 0 && !alreadyDone && afterRound > 0) {
    const chaosP = calcSuccessProb(calcDistribution(afterRound), needWill, needChaos - 1);
    let expWill = 0;
    for (const { delta, w } of WILL_WEIGHTS) {
      expWill += (w / WILL_TOTAL) * Math.max(
        calcSuccessProb(calcDistribution(afterRound), needWill - delta, needChaos),
        chaosP,
      );
    }
    rerollProb = expWill;
  }

  // ── STEP 3: 조기 종료 판단 ──────────────────────────────────
  // arkgrid.md: "목표 달성 + 다음에 -N 포함 시 종료", "달성 불가 시 종료"

  // 이미 달성
  if (alreadyDone) {
    return {
      action: 'done', pickOption: null,
      stepInfo: { step: 3, label: 'STEP 3 조기종료' },
      reason: '목표 달성 — 지금 가공 완료 클릭!',
      currentProb: 1, probIfPick: 1, rerollProb, optionEvals,
    };
  }

  // 남은 라운드로 물리적으로 달성 불가
  // 최대 획득: 의지력 최대 = +4 × rounds, 질혼 최대 = +1 × rounds
  const maxWillGain = 4 * remainingRounds;
  const maxChaosGain = remainingRounds;
  const impossible =
    (currentWill + maxWillGain < targetWill) ||
    (currentChaos + maxChaosGain < targetChaos);

  if (impossible) {
    return {
      action: 'exit', pickOption: null,
      stepInfo: { step: 3, label: 'STEP 3 조기종료' },
      reason: '남은 횟수로 목표 달성 불가 — 가공 완료하세요',
      currentProb, probIfPick, rerollProb, optionEvals,
    };
  }

  // STEP 3: 현재 달성 직전 + 다음 선택지에 의지력 -1 포함 → 안전하게 종료
  const atRisk =
    (needWill <= 1 && needChaos <= 0) ||
    (needWill <= 0 && needChaos <= 1);
  const hasNegative = options.some((o) => o.willDelta < 0);

  if (atRisk && hasNegative && !alreadyDone && remainingRounds > 1) {
    return {
      action: 'exit', pickOption: null,
      stepInfo: { step: 3, label: 'STEP 3 조기종료' },
      reason: `목표 직전에 의지력 -N 등장 — 지금 가공 완료가 안전`,
      currentProb, probIfPick, rerollProb, optionEvals,
    };
  }

  // ── STEP 1: 첫 번째 라운드 진입 판단 ─────────────────────────
  // arkgrid.md: "의지력 +2 이상 당첨 시 진행, +1 이하 즉시 종료"
  if (isFirstRound && mode === 'balsadae') {
    const bestWillDelta = Math.max(...options.map((o) => o.willDelta));
    const hasChaosOrEffect = options.some((o) => o.chaosDelta > 0);

    if (bestWillDelta < 2 && !hasChaosOrEffect) {
      return {
        action: 'exit', pickOption: null,
        stepInfo: { step: 1, label: 'STEP 1 진입판단' },
        reason: `첫 칸 최선 +${bestWillDelta} — 즉시 가공 완료로 900골드 절약`,
        currentProb, probIfPick, rerollProb, optionEvals,
      };
    }
    if (bestWillDelta < 2) {
      return {
        action: 'exit', pickOption: null,
        stepInfo: { step: 1, label: 'STEP 1 진입판단' },
        reason: `첫 칸 의지력 최대 +${bestWillDelta} — 발전 가능성 낮음, 종료 권장`,
        currentProb, probIfPick, rerollProb, optionEvals,
      };
    }
  }

  // ── STEP 2: 리롤 조건 ─────────────────────────────────────────
  // arkgrid.md: "유효 옵션 0개" or "역성장 2개 이상"
  if (rerollsLeft > 0) {
    const usefulCount = options.filter((o) => o.willDelta > 0 || o.chaosDelta > 0).length;
    const negativeCount = options.filter((o) => o.willDelta < 0).length;

    if (usefulCount === 0) {
      return {
        action: 'reroll', pickOption: null,
        stepInfo: { step: 2, label: 'STEP 2 리롤' },
        reason: '유효 옵션(의지력+/포인트+) 없음 — 새로고침',
        currentProb, probIfPick, rerollProb, optionEvals,
      };
    }
    if (negativeCount >= 2) {
      return {
        action: 'reroll', pickOption: null,
        stepInfo: { step: 2, label: 'STEP 2 리롤' },
        reason: `역성장 옵션 ${negativeCount}개 — 새로고침`,
        currentProb, probIfPick, rerollProb, optionEvals,
      };
    }
    // 리롤이 기대값 상 유리할 때
    if (rerollProb > probIfPick + 0.02 && rerollsLeft > 0) {
      return {
        action: 'reroll', pickOption: null,
        stepInfo: { step: 2, label: 'STEP 2 리롤' },
        reason: `리롤 기대확률 ${(rerollProb * 100).toFixed(1)}% > 현재 최선 ${(probIfPick * 100).toFixed(1)}%`,
        currentProb, probIfPick, rerollProb, optionEvals,
      };
    }
  }

  // ── 최선 옵션으로 가공 ────────────────────────────────────────
  const b = best?.option;
  let reason = '';
  if (b?.willDelta && b.willDelta >= 3) reason = `대성공! 의지력 +${b.willDelta} 선택`;
  else if (b?.willDelta && b.willDelta >= 2) reason = `의지력 +${b.willDelta} 선택`;
  else if (b?.chaosDelta) reason = '포인트 +1 선택 (의지력 부재)';
  else reason = '가공 진행';

  return {
    action: 'craft', pickOption: b ?? null,
    stepInfo: { step: null, label: '가공' },
    reason,
    currentProb, probIfPick, rerollProb, optionEvals,
  };
}
