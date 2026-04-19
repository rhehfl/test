import { useEffect, useRef, useState } from 'react';
import { Monitor } from 'lucide-react';
import { Button } from '../../ui/Button';
import { DragZoom, type Roi } from './DragZoom';

export function WebCaptureAdvisor() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [roi, setRoi] = useState<Roi | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (!roi || !videoRef.current) return;
    const scale = Math.max(
      videoRef.current.clientWidth / roi.w,
      videoRef.current.clientHeight / roi.h,
    );
    videoRef.current.style.transformOrigin = '0 0';
    const offsetX = (videoRef.current.clientWidth / scale - roi.w) / 2;
    const offsetY = (videoRef.current.clientHeight / scale - roi.h) / 2;
    videoRef.current.style.transform = `scale(${scale}) translate(-${roi.x - offsetX}px, -${roi.y - offsetY}px)`;
  }, [roi]);

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
      resetRoi();
    }
  };

  const resetRoi = () => {
    if (videoRef.current) videoRef.current.style.transform = '';
    setRoi(null);
  };

  return (
    <div className="space-y-4">
      <div
        style={{ aspectRatio: roi ? `${roi.w} / ${roi.h}` : '16 / 9' }}
        className="bg-bg-surface border-border-default relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border"
      >
        <div className="absolute size-full">
          <video ref={videoRef} className="absolute inset-0 object-fill" />
          <DragZoom isStreaming={isStreaming} onRoiSelect={setRoi} />
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
          <Button variant="danger" size="lg" onClick={endStream} className="flex-1">
            <Monitor size={16} />
            화면 공유 중단
          </Button>
        ) : (
          <Button variant="primary" size="lg" onClick={startStream} className="flex-1">
            <Monitor size={16} />
            화면 공유 시작
          </Button>
        )}
        {roi && (
          <Button variant="ghost" size="lg" onClick={resetRoi}>
            영역 재지정
          </Button>
        )}
      </div>
    </div>
  );
}
