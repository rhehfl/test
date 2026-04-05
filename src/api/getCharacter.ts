import { fetcher } from '../lib/fetcher';

export const getCharacter = async (name: string) => {
  const res = await fetcher(`/characters/${name}/siblings`);
  return res.json();
};
