import { Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { useNavigate } from '@tanstack/react-router';

interface CharacterSearchFormProps {
  defaultValue?: string;
}
export default function CharacterSearchForm({ defaultValue }: CharacterSearchFormProps) {
  const navigate = useNavigate();

  return (
    <search>
      <form
        className="flex w-full justify-center"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const searchValue = formData.get('search') as string;
          if (searchValue) {
            navigate({ to: `/char/${searchValue}` });
          }
        }}
      >
        <div className="focus-within:ring-gold flex w-150 items-center justify-between rounded-md bg-white px-2 ring-2 ring-amber-200 transition-shadow duration-200">
          <Search className="mx-3" />
          <input
            id="search"
            name="search"
            type="search"
            placeholder="캐릭터 검색"
            className="w-full bg-white py-3 outline-none"
            defaultValue={defaultValue}
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
