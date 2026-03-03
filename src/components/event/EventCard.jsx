import { Badge } from '@/components/ui/badge.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Calendar, MapPin, Users } from 'lucide-react';
import React from 'react';

function EventCard({ event }) {
  const date = new Date(event.startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-2xl hover:border-primary/20 transition-all">
      <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 relative">
        <Badge className="absolute top-4 right-4 bg-white/90 text-foreground hover:bg-white">
          {event.status.toUpperCase()}
        </Badge>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="secondary" className="rounded-full shadow-lg">
            View Details
          </Button>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold mb-4 line-clamp-1">{event.title}</h3>

        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2 text-primary" />
            {event.beachId.name || 'Unknown Location'}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2 text-primary" />
            {date}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="w-4 h-4 mr-2 text-primary" />
            {event.volunteers?.length || 0} / {event.maxVolunteers || '∞'}{' '}
            Volunteers
          </div>
        </div>

        <Button className="w-full rounded-xl group-hover:bg-primary transition-colors">
          Join Event
        </Button>
      </div>
    </div>
  );
}
