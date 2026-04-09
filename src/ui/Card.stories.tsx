import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  component: Card,
  parameters: { backgrounds: { default: 'light' } },
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => <Card>기본 카드 내용</Card>,
};

export const Hoverable: Story = {
  render: () => (
    <div className="flex gap-3">
      <Card hoverable>
        <div className="text-sm font-semibold">+25 고대 무기</div>
        <div className="mt-1 text-xs text-text-secondary">품질 100 · 재련 20</div>
      </Card>
      <Card hoverable>
        <div className="text-sm font-semibold">+25 고대 투구</div>
        <div className="mt-1 text-xs text-text-secondary">품질 85 · 재련 20</div>
      </Card>
    </div>
  ),
};
