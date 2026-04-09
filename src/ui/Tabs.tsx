export interface TabItem {
  key: string;
  label: string;
  icon?: string;
}

interface TabsProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

export function Tabs({ items, activeKey, onChange, className = '' }: TabsProps) {
  return (
    <nav className={`flex flex-col ${className}`}>
      {items.map((item) => {
        const isActive = item.key === activeKey;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors duration-100 ${
              isActive
                ? 'border-l-2 border-gold bg-gold-subtle font-semibold text-text-primary'
                : 'border-l-2 border-transparent text-text-secondary hover:bg-bg-raised hover:text-text-primary'
            }`}
          >
            {item.icon && <span>{item.icon}</span>}
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
