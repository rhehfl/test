import { createFileRoute } from '@tanstack/react-router';
import { WebCaptureAdvisor } from '../../features/gempago/WebCaptureAdvisor';

export const Route = createFileRoute('/gempago/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <h1 className="font-display text-text-primary text-2xl font-bold">젬파고</h1>
      </div>
      <WebCaptureAdvisor />
    </div>
  );
}
