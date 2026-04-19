import { useEffect, useRef } from 'react';

export type Roi = { x: number; y: number; w: number; h: number };

type Props = {
  isStreaming: boolean;
  onRoiSelect: (roi: Roi) => void;
};

export function DragZoom({ isStreaming, onRoiSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

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

    if (!dragStart.current || !ctx || !canvasRef.current) return;
    onRoiSelect({
      x: Math.min(dragStart.current.x, dragEndX),
      y: Math.min(dragStart.current.y, dragEndY),
      w: Math.abs(dragEndX - dragStart.current.x),
      h: Math.abs(dragEndY - dragStart.current.y),
    });
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    dragStart.current = null;
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 size-full cursor-crosshair"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    />
  );
}
