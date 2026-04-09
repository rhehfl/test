import { fetcher } from '../lib/fetcher';
import type { EngravingsResponse } from '../models/character';

export const getCharacterEngravings = async (name: string): Promise<EngravingsResponse> => {
  const res = await fetcher(`/armories/characters/${encodeURIComponent(name)}/engravings`);
  return res.json();
};
