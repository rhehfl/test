import { useEffect, useRef, useState } from 'react';
import Tesseract from 'tesseract.js';
import { Monitor } from 'lucide-react';
import { Button } from '../../ui/Button';

type Roi = { x: number; y: number; w: number; h: number };

export function WebCaptureAdvisor() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [roi, setRoi] = useState<Roi | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(([entry]) => {
      canvas.width = entry.contentRect.width;
      canvas.height = entry.contentRect.height;
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!roi || !videoRef.current || !dragStart.current) return;
    const scale = Math.min(
      videoRef.current.clientWidth / roi.w,
      videoRef.current.clientHeight / roi.h,
    );
    videoRef.current.style.transformOrigin = '0 0';
    videoRef.current.style.transform = `scale(${scale}) translate(-${dragStart.current.x}px, -${dragStart.current.y}px)`;
  }, [roi]);

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !isStreaming) return;
    const rect = e.currentTarget.getBoundingClientRect();
    dragStart.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.buttons !== 1 || !isStreaming) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    const ctx = canvasRef.current?.getContext('2d');

    if (!ctx || !dragStart.current || !canvasRef.current) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.strokeStyle = 'rgba(255, 105, 180, 1)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    ctx.strokeRect(
      dragStart.current.x,
      dragStart.current.y,
      currentX - dragStart.current.x,
      currentY - dragStart.current.y,
    );
  };

  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ctx = canvasRef.current?.getContext('2d');

    const dragEndX = e.clientX - rect.left;
    const dragEndY = e.clientY - rect.top;

    if (!videoRef.current || !dragStart.current || !ctx || !canvasRef.current) return;
    setRoi({
      x: Math.min(dragStart.current.x, dragEndX),
      y: Math.min(dragStart.current.y, dragEndY),
      w: Math.abs(dragEndX - dragStart.current.x),
      h: Math.abs(dragEndY - dragStart.current.y),
    });

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      if (videoRef.current) {
        setIsStreaming(true);
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        stream.getVideoTracks()[0].onended = () => setIsStreaming(false);
      }
    } catch (err) {
      console.error('화면 공유 취소 또는 에러:', err);
    }
  };

  const endStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-bg-surface border-border-default relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border">
        <div className="absolute size-full">
          <video ref={videoRef} className="absolute inset-0 object-fill" />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 size-full cursor-crosshair"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
          />
        </div>
        {!isStreaming && (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="bg-bg-raised rounded-full p-5">
              <Monitor size={40} className="text-text-secondary" />
            </div>
            <p className="text-text-secondary text-sm">화면 공유를 시작하면 여기에 표시됩니다</p>
          </div>
        )}
        {isStreaming && (
          <div className="text-smr absolute top-3 left-3 flex items-center gap-1.5 font-semibold text-red-600">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-600" />
            LIVE
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        {isStreaming ? (
          <Button
            variant={isStreaming ? 'danger' : 'primary'}
            size="lg"
            onClick={endStream}
            className="flex-1"
          >
            <Monitor size={16} />
            화면 공유 중단
          </Button>
        ) : (
          <Button
            variant={isStreaming ? 'danger' : 'primary'}
            size="lg"
            onClick={startStream}
            className="flex-1"
          >
            <Monitor size={16} />
            화면 공유 시작
          </Button>
        )}
      </div>
    </div>
  );
}
