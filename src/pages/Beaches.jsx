import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBeaches } from '@/api/beachApi';
import { useDispatch, useSelector } from 'react-redux';
import { setBeaches, setLoading, setError } from '@/store/beachSlice';
import { MapPin, Info, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BeachesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const dispatch = useDispatch();
  const { beaches: reduxBeaches } = useSelector((state) => state.beaches);

  const {
    data: beaches,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['beaches'],
    queryFn: getBeaches,
  });

  useEffect(() => {
    dispatch(setLoading(isLoading));
    if (beaches?.data) {
      dispatch(setBeaches(beaches.data));
    }
    if (isError) {
      dispatch(setError(error?.message));
    }
  }, [beaches, isLoading, isError, error, dispatch]);

  const displayBeaches = reduxBeaches || [];

  const filteredBeaches = displayBeaches.filter((beach) =>
    beach.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
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

      {isLoading ? (
        <div className="grid md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-destructive/5 rounded-2xl border border-destructive/10">
          <p className="text-destructive font-medium">
            Unable to fetch beach data. Please ensure the backend is running.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 gap-6">
          {filteredBeaches?.map((beach) => (
            <BeachCard key={beach.id} beach={beach} />
          ))}
          {displayBeaches?.length === 0 && (
            <div className="col-span-full text-center py-20 text-muted-foreground bg-secondary/20 rounded-2xl border border-dashed border-border">
              No beaches are currently registered in the system.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BeachCard({ beach }) {
  return (
    <div className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-xl transition-all h-full flex flex-col justify-between">
      <div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
          <Waves className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold mb-2">{beach.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {beach.description ||
            'A beautiful beach location prioritized for cleanup efforts.'}
        </p>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center text-xs font-medium text-muted-foreground">
          <MapPin className="w-3 h-3 mr-1 text-primary" />
          {beach.location?.city || 'View on Map'}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 group-hover:text-primary"
        >
          <Info className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
