import { createFileRoute } from '@tanstack/react-router';
import CharacterSearchForm from '../components/CharacterSearchForm';
import { CharacterShortcuts } from '../components/CharacterShortcuts';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <main className="p-4">
      <CharacterSearchForm />
      <CharacterShortcuts />
    </main>
  );
}
