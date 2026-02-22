import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getEvents } from '@/api/eventApi';
import { useDispatch, useSelector } from 'react-redux';
import { setEvents, setLoading, setError } from '@/store/eventSlice';
import { Calendar, MapPin, Users, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function EventPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const dispatch = useDispatch();
  const { events: reduxEvents } = useSelector((state) => state.events);

  const {
    data: events,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
  });

  useEffect(() => {
    dispatch(setLoading(isLoading));
    if (events?.data?.events) {
      dispatch(setEvents(events.data.events));
    }
    if (isError) {
      dispatch(setError(error?.message));
    }
  }, [events, isLoading, isError, error, dispatch]);

  const displayEvents = reduxEvents || [];

  const filteredEvents = displayEvents.filter(
    (event) =>
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.beachId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Cleanup Events
          </h1>
          <p className="text-muted-foreground">
            Find and join cleanup initiatives near you.
          </p>
        </div>

        <div className="flex w-full md:w-auto gap-4">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="rounded-xl">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-destructive/5 rounded-2xl border border-destructive/10">
          <p className="text-destructive font-medium">
            Failed to load events. Please check your connection.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {filteredEvents?.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
          {filteredEvents?.length === 0 && (
            <div className="col-span-full text-center py-20 text-muted-foreground">
              No events found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
