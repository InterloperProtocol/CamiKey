import { StartForm } from '@/components/start-form';
import { TopNav } from '@/components/top-nav';

export default function StartPage() {
  return (
    <main className="shell">
      <TopNav />
      <StartForm />
    </main>
  );
}
