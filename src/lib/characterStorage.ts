export interface CharacterSnapshot {
  name: string;
  serverName: string;
  className: string;
  itemAvgLevel: string;
  characterImage: string;
}

const FAVORITES_KEY = 'loa-favorites';
const RECENT_KEY = 'loa-recent';
const RECENT_MAX = 10;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Favorites ─────────────────────────────────────────────────────────────

export function getFavorites(): CharacterSnapshot[] {
  return readJson<CharacterSnapshot[]>(FAVORITES_KEY, []);
}

export function isFavorite(name: string): boolean {
  return getFavorites().some((c) => c.name === name);
}

export function addFavorite(snapshot: CharacterSnapshot): void {
  const list = getFavorites().filter((c) => c.name !== snapshot.name);
  writeJson(FAVORITES_KEY, [...list, snapshot]);
}

export function removeFavorite(name: string): void {
  writeJson(FAVORITES_KEY, getFavorites().filter((c) => c.name !== name));
}

export function toggleFavorite(snapshot: CharacterSnapshot): boolean {
  if (isFavorite(snapshot.name)) {
    removeFavorite(snapshot.name);
    return false;
  } else {
    addFavorite(snapshot);
    return true;
  }
}

// ── Recent ────────────────────────────────────────────────────────────────

export function getRecent(): CharacterSnapshot[] {
  return readJson<CharacterSnapshot[]>(RECENT_KEY, []);
}

export function addRecent(snapshot: CharacterSnapshot): void {
  const list = getRecent().filter((c) => c.name !== snapshot.name);
  writeJson(RECENT_KEY, [snapshot, ...list].slice(0, RECENT_MAX));
}

export function clearRecent(): void {
  localStorage.removeItem(RECENT_KEY);
}
