import { useState, useRef, useEffect, useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { GEM_GRADES, BALSADAE_PRESETS, arkgridRecommend } from '../../lib/gemPagoCalc';
import type { GemOption, ArkgridRec, ActionKind } from '../../models/gem';
import { initOcr, ocrRegion, parseOptions, parseRoundInfo, isOcrReady } from '../../lib/gemOcr';
import { GemRecPanel } from '../../components/GemRecPanel';

export const Route = createFileRoute('/gempago/')({
  component: GemPagoPage,
});

interface GemState {
  phase: 'idle' | 'capturing' | 'region_set' | 'analyzed';
  stream: MediaStream | null;
  region: { x: number; y: number; w: number; h: number } | null;
  options: GemOption[];
  rec: ArkgridRec | null;
  regionDisplay: { x: number; y: number; w: number; h: number } | null;
  // 화면인식으로 자동 감지
  grade: string;
  strategyMode: 'balsadae' | 'gopjeom';
  doneRounds: number;
  currentWill: number;
  currentChaos: number;
  rerollsLeft: number;
  targetWill: number;
  targetChaos: number;
}

function GemPagoPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const [state, setState] = useState<GemState>({
    phase: 'idle',
    stream: null,
    region: null,
    options: [],
    rec: null,
    regionDisplay: null,
    grade: '영웅',
    strategyMode: 'balsadae',
    doneRounds: 0,
    currentWill: 0,
    currentChaos: 0,
    rerollsLeft: GEM_GRADES['영웅'].rerolls,
    targetWill: 3,
    targetChaos: 4,
  });

  const [selBox, setSelBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [ocrStatus, setOcrStatus] = useState<'idle' | 'loading' | 'ready' | 'analyzing'>('idle');
  const [ocrError, setOcrError] = useState<string | null>(null);

  const config = GEM_GRADES[state.grade];

  const ensureOcr = useCallback(async () => {
    if (isOcrReady()) return;
    setOcrStatus('loading');
    try {
      await initOcr();
      setOcrStatus('ready');
    } catch (e) {
      setOcrError('OCR 초기화 실패: ' + String(e));
      setOcrStatus('idle');
    }
  }, []);

  const startCapture = useCallback(async () => {
    await ensureOcr();
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 5 }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        setState((s) => ({ ...s, phase: 'idle', stream: null }));
      });
      setState((s) => ({ ...s, phase: 'capturing', stream }));
      setOcrStatus('ready');
    } catch {
      setOcrError('화면 캡처를 시작할 수 없습니다. 브라우저에서 권한을 허용해주세요.');
    }
  }, [ensureOcr]);

  const stopCapture = useCallback(() => {
    setState((s) => {
      s.stream?.getTracks().forEach((t) => t.stop());
      return { ...s, phase: 'idle', stream: null, region: null, regionDisplay: null, options: [], rec: null };
    });
    setSelBox(null);
  }, []);

  useEffect(() => {
    if (state.phase !== 'capturing' && state.phase !== 'region_set') return;
    let rafId: number;
    const draw = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')!.drawImage(video, 0, 0);
      }
      rafId = requestAnimationFrame(draw);
    };
    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, [state.phase]);

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (state.phase !== 'capturing' && state.phase !== 'region_set') return;
    const rect = e.currentTarget.getBoundingClientRect();
    dragStart.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, [state.phase]);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const sx = dragStart.current.x, sy = dragStart.current.y;
    setSelBox({ x: Math.min(sx, x), y: Math.min(sy, y), w: Math.abs(x - sx), h: Math.abs(y - sy) });
  }, []);

  const onMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragStart.current || !selBox || selBox.w < 5 || selBox.h < 5) {
      dragStart.current = null;
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const canvas = canvasRef.current;
    if (!canvas) { dragStart.current = null; return; }
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    setState((s) => ({
      ...s,
      phase: 'region_set',
      region: {
        x: Math.round(selBox.x * scaleX), y: Math.round(selBox.y * scaleY),
        w: Math.round(selBox.w * scaleX), h: Math.round(selBox.h * scaleY),
      },
      regionDisplay: { x: selBox.x, y: selBox.y, w: selBox.w, h: selBox.h },
    }));
    dragStart.current = null;
    setSelBox(null);
  }, [selBox]);

  const analyze = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setOcrStatus('analyzing');
    setOcrError(null);
    try {
      const text = await ocrRegion(canvas, state.region);
      const roundInfo = parseRoundInfo(text);

      // 라운드 정보로 등급 자동 감지
      let grade = state.grade;
      let rerollsLeft = state.rerollsLeft;
      let doneRounds = roundInfo?.done ?? state.doneRounds;
      if (roundInfo) {
        const detected = roundInfo.total === 5 ? '고급' : roundInfo.total === 7 ? '희귀' : '영웅';
        if (detected !== grade) {
          grade = detected;
          rerollsLeft = GEM_GRADES[grade].rerolls;
          doneRounds = roundInfo.done;
        }
      }

      const cfg = GEM_GRADES[grade];
      const rem = cfg.rounds - doneRounds;
      const options = parseOptions(text);
      const rec = options.length >= 2
        ? arkgridRecommend({
            options,
            mode: state.strategyMode,
            isFirstRound: doneRounds === 0,
            remainingRounds: rem,
            currentWill: state.currentWill,
            currentChaos: state.currentChaos,
            targetWill: state.targetWill,
            targetChaos: state.targetChaos,
            rerollsLeft,
          })
        : null;

      setState((s) => ({ ...s, phase: 'analyzed', grade, doneRounds, rerollsLeft, options, rec }));
      setOcrStatus('ready');
    } catch (e) {
      setOcrError('OCR 실패: ' + String(e));
      setOcrStatus('ready');
    }
  }, [state]);

  const applyAction = useCallback((action: ActionKind, chosen?: GemOption) => {
    setState((s) => {
      const cfg = GEM_GRADES[s.grade];
      if (action === 'craft' && chosen) {
        return {
          ...s, phase: 'capturing',
          doneRounds: s.doneRounds + 1,
          currentWill: s.currentWill + chosen.willDelta,
          currentChaos: s.currentChaos + chosen.chaosDelta,
          options: [], rec: null,
        };
      }
      if (action === 'reroll') {
        return { ...s, phase: 'capturing', rerollsLeft: s.rerollsLeft - 1, options: [], rec: null };
      }
      // done or exit → 다음 젬 준비
      return {
        ...s, phase: s.stream ? 'capturing' : 'idle',
        doneRounds: 0, currentWill: 0, currentChaos: 0,
        rerollsLeft: cfg.rerolls, options: [], rec: null,
      };
    });
  }, []);

  const resetGem = useCallback(() => {
    setState((s) => ({
      ...s, phase: s.stream ? 'capturing' : 'idle',
      doneRounds: 0, currentWill: 0, currentChaos: 0,
      rerollsLeft: GEM_GRADES[s.grade].rerolls,
      options: [], rec: null, regionDisplay: null,
    }));
    setSelBox(null);
  }, []);

  const GRADE_LABEL: Record<string, string> = { '고급': '고급 (5회)', '희귀': '희귀 (7회)', '영웅': '영웅 (9회)' };
  const GRADE_COLOR: Record<string, string> = { '고급': 'text-blue-400', '희귀': 'text-purple-400', '영웅': 'text-orange-400' };

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-text-primary">젬파고</h1>
        <p className="mt-0.5 text-sm text-text-muted">아크그리드 젬 가공 화면인식 계산기</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* 전략 + 목표 */}
        <section className="rounded-lg border border-border-default bg-bg-surface p-4">
          <div className="mb-3 flex items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">전략</p>
            <div className="flex gap-1">
              {(['balsadae', 'gopjeom'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setState((s) => ({ ...s, strategyMode: m }))}
                  className={`rounded-md border px-3 py-1 text-xs font-semibold transition-colors ${
                    state.strategyMode === m
                      ? 'border-gold bg-gold-subtle text-text-primary'
                      : 'border-border-default text-text-secondary hover:border-border-strong'
                  }`}
                >
                  {m === 'balsadae' ? '발사대' : '고점'}
                </button>
              ))}
            </div>
          </div>

          {state.strategyMode === 'balsadae' ? (
            <div className="flex flex-wrap gap-1.5">
              {BALSADAE_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  title={p.desc}
                  onClick={() => setState((s) => ({ ...s, targetWill: p.willTarget, targetChaos: p.ptsTarget }))}
                  className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition-colors ${
                    state.targetWill === p.willTarget && state.targetChaos === p.ptsTarget
                      ? 'border-gold bg-gold-subtle text-text-primary'
                      : 'border-border-default text-text-secondary hover:border-border-strong'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {[
                { label: '의지력', key: 'targetWill' as const, val: state.targetWill, max: 20 },
                { label: '포인트', key: 'targetChaos' as const, val: state.targetChaos, max: 9 },
              ].map(({ label, key, val, max }) => (
                <label key={key} className="flex items-center gap-3">
                  <span className="w-14 text-sm text-text-secondary">{label}</span>
                  <input
                    type="range" min={0} max={max} value={val}
                    onChange={(e) => setState((s) => ({ ...s, [key]: Number(e.target.value) }))}
                    className="flex-1 accent-gold"
                  />
                  <span className="w-8 text-right text-sm font-bold text-text-primary">{val}+</span>
                </label>
              ))}
            </div>
          )}
        </section>

        {/* 진행 상태 바 */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-border-default bg-bg-surface px-4 py-3 text-sm">
          <span className={`text-xs font-semibold ${GRADE_COLOR[state.grade]}`}>
            {GRADE_LABEL[state.grade]}
          </span>
          <span className="text-text-muted">|</span>
          <span className="text-text-secondary">{state.doneRounds}/{config.rounds}회</span>
          <span className="text-text-secondary">의지력 <b className="text-text-primary">{state.currentWill}</b></span>
          <span className="text-text-secondary">포인트 <b className="text-text-primary">{state.currentChaos}</b></span>
          {config.rerolls > 0 && (
            <span className="text-text-secondary">리롤 <b className="text-text-primary">{state.rerollsLeft}</b>회</span>
          )}
          <span className="text-text-secondary">목표 <b className="text-text-primary">{state.targetWill}-{state.targetChaos}</b></span>
          <button type="button" onClick={resetGem} className="ml-auto text-xs text-text-muted hover:text-text-secondary">
            초기화
          </button>
        </div>

        {/* 화면 캡처 */}
        <section className="rounded-lg border border-border-default bg-bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">화면 캡처</p>
            <div className="flex gap-2">
              {state.phase === 'idle' ? (
                <button
                  type="button"
                  onClick={startCapture}
                  className="rounded-md bg-gold px-4 py-1.5 text-sm font-semibold text-bg-surface transition-opacity hover:opacity-80"
                >
                  {ocrStatus === 'loading' ? 'OCR 로딩중…' : '캡처 시작'}
                </button>
              ) : (
                <>
                  {(state.phase === 'region_set' || state.phase === 'analyzed') && (
                    <button
                      type="button"
                      onClick={analyze}
                      disabled={ocrStatus === 'analyzing'}
                      className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                    >
                      {ocrStatus === 'analyzing' ? '분석중…' : '분석'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={stopCapture}
                    className="rounded-md border border-border-default px-3 py-1.5 text-sm text-text-secondary hover:border-border-strong"
                  >
                    캡처 중단
                  </button>
                </>
              )}
            </div>
          </div>

          {ocrError && (
            <div className="mb-3 rounded-md border border-red-800 bg-red-900/20 px-3 py-2 text-sm text-red-400">
              {ocrError}
            </div>
          )}

          {state.phase === 'idle' ? (
            <div className="flex flex-col items-center gap-2 py-8 text-text-muted">
              <span className="text-3xl">🖥️</span>
              <p className="text-sm">캡처 시작 후 가공 선택지 영역을 드래그해서 지정하세요</p>
              <p className="text-xs">등급은 화면 인식으로 자동 감지됩니다 (고급 5회 / 희귀 7회 / 영웅 9회)</p>
            </div>
          ) : (
            <div>
              {state.phase === 'capturing' && (
                <p className="mb-2 text-xs text-text-muted">가공 선택지 영역을 드래그해서 지정하세요</p>
              )}
              <div
                className="relative cursor-crosshair overflow-hidden rounded-lg border border-border-default"
                style={{ maxHeight: 360 }}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
              >
                <canvas ref={canvasRef} className="w-full" style={{ display: 'block' }} />
                {selBox && selBox.w > 4 && selBox.h > 4 && (
                  <div
                    className="pointer-events-none absolute border-2 border-blue-400 bg-blue-400/10"
                    style={{ left: selBox.x, top: selBox.y, width: selBox.w, height: selBox.h }}
                  />
                )}
                {state.regionDisplay && state.phase !== 'capturing' && (
                  <div
                    className="pointer-events-none absolute border-2 border-green-400 bg-green-400/5"
                    style={{
                      left: state.regionDisplay.x, top: state.regionDisplay.y,
                      width: state.regionDisplay.w, height: state.regionDisplay.h,
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </section>

        {state.phase === 'analyzed' && state.rec && (
          <GemRecPanel rec={state.rec} rerollsLeft={state.rerollsLeft} onAction={applyAction} />
        )}

        {state.phase === 'analyzed' && !state.rec && (
          <div className="rounded-lg border border-orange-800 bg-orange-900/20 p-4 text-sm text-orange-300">
            선택지를 인식하지 못했습니다. 영역을 다시 지정하거나 화면이 잘 보이는지 확인해주세요.
          </div>
        )}
      </div>

      <video ref={videoRef} className="hidden" muted playsInline />
    </main>
  );
}
