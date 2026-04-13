import { Link } from '@tanstack/react-router';

export default function Header() {
  return (
    <header className="border-b border-border-default bg-bg-surface px-6 py-3">
      <nav className="flex items-center gap-6">
        <Link to="/" className="font-display text-lg font-bold text-text-primary">
          LOA
        </Link>
        <Link
          to="/stats"
          className="text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          통계
        </Link>
        <Link
          to="/gempago"
          className="text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          젬파고
        </Link>
      </nav>
    </header>
  );
}
