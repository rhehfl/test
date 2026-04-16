import { createFileRoute } from '@tanstack/react-router';
import { ScreenCaptureZone } from '../../features/gempago/ScreenCaptureZone';

export const Route = createFileRoute('/gempago/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div>
        <h1 className="font-display text-text-primary text-2xl font-bold">젬파고</h1>
        <p className="text-text-secondary mt-1 text-sm">
          보석 화면 스크린샷을 인식하여 최적 파고 방법을 계산합니다.
        </p>
      </div>

      <ScreenCaptureZone />
    </div>
  );
}
