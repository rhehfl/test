import { useEffect, useRef, useState } from 'react';
import Tesseract from 'tesseract.js';
import { Monitor, Camera } from 'lucide-react';
import { Button } from '../../ui/Button';

type Roi = { x: number; y: number; w: number; h: number };

export function WebCaptureAdvisor() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [roi, setRoi] = useState<Roi | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (!roi || !isStreaming) return;

    let raf: number;

    const draw = () => {
      const ctx = previewRef.current?.getContext('2d');
      if (ctx && videoRef.current) {
        ctx.drawImage(
          videoRef.current,
          roi.x,
          roi.y,
          roi.w,
          roi.h,
          0,
          0,
          ctx.canvas.width,
          ctx.canvas.height, // preview canvas 전체에 확대
        );
      }
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(raf); // roi/isStreaming 바뀌면 이전 루프 정리
  }, [roi, isStreaming]);

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    dragStart.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x2 = e.clientX - rect.left;
    const y2 = e.clientY - rect.top;

    if (!videoRef.current || !dragStart.current) return;
    const scaleX = videoRef.current.videoWidth / rect.width;
    const scaleY = videoRef.current.videoHeight / rect.height;
    setRoi({
      x: dragStart.current.x * scaleX,
      y: dragStart.current.y * scaleY,
      w: (x2 - dragStart.current.x) * scaleX,
      h: (y2 - dragStart.current.y) * scaleY,
    });
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

  const runOCR = async (imageSource: HTMLCanvasElement) => {
    const {
      data: { text },
    } = await Tesseract.recognize(imageSource, 'eng', {
      logger: (m) => console.log(m.status, Math.round(m.progress * 100) + '%'),
    });
    console.log('인식된 텍스트:\n', text);
  };

  return (
    <div className="space-y-4">
      <div className="bg-bg-surface border-border-default relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border">
        <div className="absolute size-full">
          <video ref={videoRef} className="absolute inset-0" />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 cursor-crosshair"
            onMouseDown={onMouseDown}
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
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-400 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
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
