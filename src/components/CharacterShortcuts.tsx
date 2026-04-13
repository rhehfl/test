import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Star, Clock, X } from 'lucide-react';
import {
  getFavorites,
  getRecent,
  removeFavorite,
  clearRecent,
  type CharacterSnapshot,
} from '../lib/characterStorage';

function CharacterCard({
  character,
  onRemove,
}: {
  character: CharacterSnapshot;
  onRemove?: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div
      className="group relative flex cursor-pointer items-center gap-3 rounded-lg border border-border-default bg-bg-surface px-3 py-2.5 transition-colors hover:border-border-strong hover:bg-bg-raised"
      onClick={() => navigate({ to: `/char/${character.name}` })}
    >
      {character.characterImage ? (
        <img
          src={character.characterImage}
          alt={character.name}
          className="h-10 w-10 shrink-0 rounded-md object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-bg-overlay text-lg">
          ⚔
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text-primary">{character.name}</p>
        <p className="truncate text-xs text-text-muted">
          {character.className} · {character.itemAvgLevel}
        </p>
      </div>
      {onRemove && (
        <button
          type="button"
          className="shrink-0 rounded p-0.5 text-text-muted opacity-0 transition-opacity hover:text-text-primary group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export function CharacterShortcuts() {
  const [favorites, setFavorites] = useState(getFavorites);
  const [recent, setRecent] = useState(getRecent);

  const visibleRecent = recent.filter((r) => !favorites.some((f) => f.name === r.name));

  if (favorites.length === 0 && visibleRecent.length === 0) return null;

  return (
    <div className="mt-6 flex flex-col gap-5">
      {favorites.length > 0 && (
        <section>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-text-muted">
            <Star size={12} className="fill-gold text-gold" />
            즐겨찾기
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {favorites.map((c) => (
              <CharacterCard
                key={c.name}
                character={c}
                onRemove={() => {
                  removeFavorite(c.name);
                  setFavorites(getFavorites());
                }}
              />
            ))}
          </div>
        </section>
      )}

      {visibleRecent.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-muted">
              <Clock size={12} />
              최근 방문
            </div>
            <button
              type="button"
              className="text-xs text-text-muted hover:text-text-secondary"
              onClick={() => {
                clearRecent();
                setRecent([]);
              }}
            >
              전체 삭제
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {visibleRecent.map((c) => (
              <CharacterCard key={c.name} character={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
