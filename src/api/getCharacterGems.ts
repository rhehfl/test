import { fetcher } from '../lib/fetcher';
import type { GemsResponse } from '../models/character';

export const getCharacterGems = async (name: string): Promise<GemsResponse> => {
  const res = await fetcher(`/armories/characters/${encodeURIComponent(name)}/gems`);
  return res.json();
};
