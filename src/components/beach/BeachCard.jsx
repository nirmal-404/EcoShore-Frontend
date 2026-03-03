import { Info, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Waves } from 'lucide-react';
import React from 'react';

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

export default BeachCard;
