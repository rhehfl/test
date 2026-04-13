import { RefreshCw, Star } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import type { CharacterProfile } from '../models/character';
import { isFavorite, toggleFavorite } from '../lib/characterStorage';

interface CharacterHeaderProps {
  profile: CharacterProfile;
  updatedAt: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}초 전`;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export function CharacterHeader({ profile, updatedAt, onRefresh, isRefreshing }: CharacterHeaderProps) {
  const [starred, setStarred] = useState(() => isFavorite(profile.CharacterName));

  return (
    <div className="flex items-center gap-4 border-b border-border-default bg-bg-surface px-6 py-4">
      {profile.CharacterImage ? (
        <img
          src={profile.CharacterImage}
          alt={profile.CharacterName}
          className="h-16 w-16 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-bg-overlay text-2xl">
          ⚔
        </div>
      )}

      <div className="flex-1">
        <h1 className="text-xl font-bold text-text-primary">{profile.CharacterName}</h1>
        <p className="mt-0.5 text-sm text-text-secondary">
          {profile.ServerName} · {profile.CharacterClassName} · {profile.ItemAvgLevel}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-text-muted">{timeAgo(updatedAt)} 업데이트</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const next = toggleFavorite({
              name: profile.CharacterName,
              serverName: profile.ServerName,
              className: profile.CharacterClassName,
              itemAvgLevel: profile.ItemAvgLevel,
              characterImage: profile.CharacterImage ?? '',
            });
            setStarred(next);
          }}
        >
          <Star
            size={14}
            className={starred ? 'fill-gold text-gold' : 'text-text-muted'}
          />
          {starred ? '즐겨찾기 해제' : '즐겨찾기'}
        </Button>
        <Button variant="ghost" size="sm" onClick={onRefresh} loading={isRefreshing}>
          <RefreshCw size={14} />
          새로고침
        </Button>
      </div>
    </div>
  );
}

export function CharacterHeaderSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-border-default bg-bg-surface px-6 py-4">
      <Skeleton width="64px" height="64px" rounded="lg" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton width="140px" height="20px" />
        <Skeleton width="200px" height="14px" />
      </div>
    </div>
  );
}
