import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { getCharacter } from '../../../api/getCharacter';
import CharacterSearchForm from '../../../components/CharacterSearchForm';
import { getCharacterProfile } from '../../../api/getCharacterProfile';

export const Route = createFileRoute('/char/$id/')({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['character', 'my'],
    queryFn: () => getCharacter(id),
  });

  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useQuery({
    queryKey: ['character', 'profile'],
    queryFn: () => getCharacterProfile(id),
    enabled: !!data,
  });
  console.log({ profileData, isProfileLoading, isProfileError });

  const character = data?.find((char) => char.CharacterName === id);

  return (
    <main>
      <CharacterSearchForm defaultValue={id} />
      {character && (
        <div>
          <h2>{character.CharacterName}</h2>
          <p>Level: {character.CharacterLevel}</p>
          <p>Class: {character.CharacterClassName}</p>
          <p>Item Average Level: {character.ItemAvgLevel}</p>
        </div>
      )}
    </main>
  );
}
