import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Tabs } from './Tabs';

const meta: Meta<typeof Tabs> = {
  component: Tabs,
  parameters: { backgrounds: { default: 'light' } },
};
export default meta;

type Story = StoryObj<typeof Tabs>;

const CHAR_TABS = [
  { key: 'equipment', label: '장비', icon: '⚔' },
  { key: 'engravings', label: '각인', icon: '✦' },
  { key: 'gems', label: '보석', icon: '💎' },
  { key: 'skills', label: '스킬', icon: '🌀' },
];

export const CharacterSidebar: Story = {
  render: () => {
    const [active, setActive] = useState('equipment');
    return (
      <div className="w-32 border border-border-default bg-bg-surface">
        <Tabs items={CHAR_TABS} activeKey={active} onChange={setActive} />
      </div>
    );
  },
};
