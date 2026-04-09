import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressBar } from './ProgressBar';

const meta: Meta<typeof ProgressBar> = {
  component: ProgressBar,
  parameters: { backgrounds: { default: 'light' } },
};
export default meta;

type Story = StoryObj<typeof ProgressBar>;

export const Playground: Story = {
  args: { value: 75 },
};

export const Qualities: Story = {
  render: () => (
    <div className="flex w-48 flex-col gap-3">
      {[100, 85, 60, 30, 5].map((v) => (
        <div key={v}>
          <div className="mb-1 text-xs text-text-secondary">품질 {v}</div>
          <ProgressBar value={v} />
        </div>
      ))}
    </div>
  ),
};
