import { useBeaches } from '@/hooks/beaches.js';
import Spinner from '@/components/common/LoadingSpinner.jsx';
import BeachCard from '@/components/beach/BeachCard.jsx';

export default function BeachesPage() {
  const { data, isLoading, isError } = useBeaches();

  if (isLoading) return <Spinner />;
  if (isError) return <p>Something went wrong.</p>;

  if (data.length === 0) {
    return (
      <div className="col-span-full text-center py-20 text-muted-foreground bg-secondary/20 rounded-2xl border border-dashed border-border">
        No beaches are currently registered in the system.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground">
          Our Beaches
        </h1>
        <p className="text-muted-foreground text-lg">
          Discover the coastlines we're working to protect.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {data &&
          data.map((beach) => <BeachCard key={beach.id} beach={beach} />)}
      </div>
    </div>
  );
}
