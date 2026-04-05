import { fetcher } from '../lib/fetcher';
import type { CharacterProfile } from '../models/character';

export const getCharacterProfile = async (name: string): Promise<CharacterProfile> => {
  const res = await fetcher(`/armories/characters/${name}/profiles`);
  return res.json();
};
