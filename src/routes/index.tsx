import { createFileRoute } from '@tanstack/react-router';
import CharacterSearchForm from '../components/CharacterSearchForm';

export const Route = createFileRoute('/')({
  component: Index,
});

// eslint-disable-next-line react-refresh/only-export-components
function Index() {
  return (
    <main className="p-2">
      <h3>Welcome Home!</h3>
      <CharacterSearchForm />
    </main>
  );
}
