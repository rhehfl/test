import { Tabs } from '../ui/Tabs';

export type CharacterTab = 'equipment' | 'engravings' | 'gems' | 'skills';

const TAB_ITEMS = [
  { key: 'equipment', label: '장비', icon: '⚔' },
  { key: 'engravings', label: '각인', icon: '✦' },
  { key: 'gems', label: '보석', icon: '💎' },
  { key: 'skills', label: '스킬', icon: '🌀' },
];

interface CharacterSidebarProps {
  activeTab: CharacterTab;
  onChange: (tab: CharacterTab) => void;
}

export function CharacterSidebar({ activeTab, onChange }: CharacterSidebarProps) {
  return (
    <aside className="w-28 shrink-0 border-r border-border-default bg-bg-surface">
      <Tabs
        items={TAB_ITEMS}
        activeKey={activeTab}
        onChange={(key) => onChange(key as CharacterTab)}
      />
    </aside>
  );
}
