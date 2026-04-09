import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  component: Badge,
  parameters: { backgrounds: { default: 'dark' } },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Playground: Story = {
  args: { grade: 'ancient' },
};

export const AllGrades: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge grade="ancient" />
      <Badge grade="relic" />
      <Badge grade="legendary" />
      <Badge grade="epic" />
      <Badge grade="rare" />
      <Badge grade="uncommon" />
      <Badge grade="normal" />
    </div>
  ),
};

export const CustomLabel: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge grade="ancient" label="Lv.3" />
      <Badge grade="epic" label="Lv.1" />
      <Badge label="+25" />
    </div>
  ),
};
