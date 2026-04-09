import { fetcher } from '../lib/fetcher';
import type { Equipment } from '../models/character';

export const getCharacterEquipment = async (name: string): Promise<Equipment[]> => {
  const res = await fetcher(`/armories/characters/${encodeURIComponent(name)}/equipment`);
  return res.json();
};
