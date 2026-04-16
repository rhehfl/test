import { useEffect, useRef, useState } from 'react';
import Tesseract from 'tesseract.js';
interface ScreenCaptureZoneProps {
  onCapture?: (file: File) => void;
  preview?: string | null;
}

export function ScreenCaptureZone() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  useEffect(() => {
    async function startCapture() {
      // 💡 핵심: electron 모듈을 직접 import 하지 않고, preload 브릿지를 통해 호출
      const sourceId = await window.electronAPI.getScreenSource();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sourceId,
          },
        },
      });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
    startCapture();
  }, []);
  const runOCR = async (imageDataUrl: string) => {
    // Tesseract.js 로컬 구동
    const {
      data: { text },
    } = await Tesseract.recognize(
      imageDataUrl,
      'eng', // 한글이 필요 없으므로 영문(숫자) 모델 사용
      { logger: (m) => console.log(m) },
    );
    console.log('인식된 텍스트:', text);
  };
  return (
    <div
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-10 transition-colors duration-150`}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
      <p className="text-sm font-medium">스크린샷을 끌어다 놓거나 클릭하세요</p>
      <p className="text-xs">Ctrl+V 붙여넣기도 가능합니다 · PNG, JPG</p>
      <input type="file" accept="image/*" className="hidden" />
    </div>
  );
}
