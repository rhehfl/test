import { Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { useQuery } from '@tanstack/react-query';
import { getCharacter } from '../api/getCharacter';

export default function CharacterSearchForm() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['character'],
    queryFn: () => getCharacter('rhehfl0101'),
  });

  console.log({ data, isLoading, isError });
  return (
    <search>
      <form className="flex w-full justify-center">
        <div className="focus-within:ring-gold flex w-150 items-center justify-between rounded-md bg-white px-2 transition-shadow duration-200 focus-within:ring-2">
          <Search className="mx-3" />
          <input
            id="search"
            name="search"
            type="search"
            placeholder="캐릭터 검색"
            className="w-full bg-white py-3 outline-none"
          />
          <div className="hidden shrink-0 md:block">
            <Button type="submit" variant="ghost" size="md">
              검색
            </Button>
          </div>
        </div>
      </form>
    </search>
  );
}
