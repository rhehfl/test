import { fetcher } from '../lib/fetcher';
import type { Character } from '../models/character';

export const getCharacter = async (name: string): Promise<Character[]> => {
  const res = await fetcher(`/characters/${name}/siblings`);
  return res.json();
};
