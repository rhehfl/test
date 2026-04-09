import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  component: Skeleton,
  parameters: { backgrounds: { default: 'light' } },
};
export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  args: { width: '200px', height: '20px' },
};

export const CharacterHeaderSkeleton: Story = {
  render: () => (
    <div className="flex items-center gap-4 p-4">
      <Skeleton width="64px" height="64px" rounded="lg" />
      <div className="flex flex-col gap-2">
        <Skeleton width="120px" height="20px" />
        <Skeleton width="180px" height="14px" />
      </div>
    </div>
  ),
};

export const EquipmentSkeleton: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-3 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton width="40px" height="40px" rounded="md" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton height="14px" />
            <Skeleton width="60%" height="12px" />
          </div>
        </div>
      ))}
    </div>
  ),
};
