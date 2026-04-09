import { fetcher } from '../lib/fetcher';
import type { Skill } from '../models/character';

export const getCharacterSkills = async (name: string): Promise<Skill[]> => {
  const res = await fetcher(`/armories/characters/${encodeURIComponent(name)}/combat-skills`);
  return res.json();
};
