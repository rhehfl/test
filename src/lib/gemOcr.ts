// Tesseract.js Korean OCR - lazy loaded to avoid bloating initial bundle
import type { GemOption, OptionKind } from '../models/gem';

let workerInstance: Awaited<ReturnType<typeof import('tesseract.js')['createWorker']>> | null = null;
let initPromise: Promise<void> | null = null;

export function initOcr(): Promise<void> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const { createWorker } = await import('tesseract.js');
    workerInstance = await createWorker('kor', 1, { logger: () => {} });
  })();
  return initPromise;
}

export function isOcrReady(): boolean {
  return workerInstance !== null;
}

export async function ocrRegion(
  source: HTMLVideoElement | HTMLCanvasElement,
  region: { x: number; y: number; w: number; h: number } | null,
): Promise<string> {
  if (!workerInstance) throw new Error('OCR worker not initialized');

  const canvas = document.createElement('canvas');
  let sx = 0, sy = 0, sw: number, sh: number;

  if (source instanceof HTMLVideoElement) {
    sw = source.videoWidth; sh = source.videoHeight;
  } else {
    sw = source.width; sh = source.height;
  }

  if (region) { sx = region.x; sy = region.y; sw = region.w; sh = region.h; }

  canvas.width = sw; canvas.height = sh;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh);

  const imgData = ctx.getImageData(0, 0, sw, sh);
  enhanceContrast(imgData);
  ctx.putImageData(imgData, 0, 0);

  const { data } = await workerInstance.recognize(canvas);
  return data.text;
}

function enhanceContrast(imgData: ImageData) {
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const v = gray > 128 ? 255 : 0;
    d[i] = d[i + 1] = d[i + 2] = v;
  }
}

// ─── OCR 텍스트 → GemOption[] 파싱 ────────────────────────────────
const PATTERNS: Array<{
  re: RegExp;
  kind: OptionKind;
  extract?: (m: RegExpMatchArray) => Partial<Pick<GemOption, 'willDelta' | 'chaosDelta'>>;
}> = [
  { re: /의지력[^+\d-]*([+-]?\d+)/, kind: 'will', extract: (m) => ({ willDelta: parseInt(m[1]) }) },
  { re: /(?:질서|혼돈)[^+]*포인트/, kind: 'chaos', extract: () => ({ chaosDelta: 1 }) },
  { re: /(?:첫|두)[^번]*번째.*(?:효과|Lv).*증가/, kind: 'effect_up' },
  { re: /(?:첫|두)[^번]*번째.*변경/, kind: 'effect_change' },
  { re: /비용/, kind: 'cost' },
  { re: /상태\s*유지/, kind: 'preserve' },
  { re: /항목\s*보기/, kind: 'reroll_bonus' },
];

export function parseOptions(text: string): GemOption[] {
  const lines = text
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter((l) => l.length > 1);

  const found: GemOption[] = [];
  for (const line of lines) {
    for (const { re, kind, extract } of PATTERNS) {
      const m = line.match(re);
      if (m) {
        const extra = extract?.(m) ?? {};
        found.push({ kind, willDelta: extra.willDelta ?? 0, chaosDelta: extra.chaosDelta ?? 0, qualityGain: 0, raw: line });
        break;
      }
    }
    if (found.length === 4) break;
  }
  return found;
}

// 라운드 카운터 파싱: "3/9" 형태
export function parseRoundInfo(text: string): { done: number; total: number } | null {
  const m = text.match(/(\d)\s*\/\s*(5|7|9)/);
  if (!m) return null;
  return { done: parseInt(m[1]) - 1, total: parseInt(m[2]) };
}
