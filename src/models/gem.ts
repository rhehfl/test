// 아크그리드 젬 가공 공통 타입 정의

export type OptionKind =
  | 'will'          // 의지력 효율 ±N
  | 'chaos'         // 질서/혼돈 포인트 +1
  | 'effect_up'     // 효과 Lv 증가
  | 'effect_change'
  | 'cost'
  | 'preserve'
  | 'reroll_bonus'
  | 'unknown';

export interface GemOption {
  kind: OptionKind;
  willDelta: number;    // 'will' 옵션: ±N
  chaosDelta: number;   // 'chaos' 옵션: +1
  qualityGain: number;  // 발사대/고점 총합 기여도 (음수 포함)
  raw: string;
}

export type ActionKind = 'craft' | 'reroll' | 'exit' | 'done';

export interface ArkgridStep {
  step: 1 | 2 | 3 | null;
  label: string;
}

export interface ArkgridRec {
  action: ActionKind;
  pickOption: GemOption | null;
  stepInfo: ArkgridStep;
  reason: string;
  currentProb: number;
  probIfPick: number;
  rerollProb: number;
  optionEvals: Array<{ option: GemOption; prob: number }>;
}
