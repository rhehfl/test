import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatsChart } from './StatsChart';

const meta: Meta<typeof StatsChart> = {
  component: StatsChart,
  parameters: { backgrounds: { default: 'light' } },
};
export default meta;

type Story = StoryObj<typeof StatsChart>;

export const Default: Story = {
  render: () => (
    <div className="w-96 p-4">
      <StatsChart
        data={[
          { ark_passive_pattern: '1-1-1', count: 320, avg_item_level: 1632 },
          { ark_passive_pattern: '1-2-1', count: 180, avg_item_level: 1645 },
          { ark_passive_pattern: '2-1-1', count: 95, avg_item_level: 1620 },
          { ark_passive_pattern: '1-1-2', count: 40, avg_item_level: 1615 },
        ]}
      />
    </div>
  ),
};

export const Empty: Story = {
  render: () => <StatsChart data={[]} />,
};
