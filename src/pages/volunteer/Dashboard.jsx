import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock3,
  MapPin,
  Send,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import API from '@/api';

const getSafeUserId = (value) => String(value?._id || value?.id || value || '');

const getEventStatusLabel = (event) => {
  if (event?.status) {
    return String(event.status).toUpperCase();
  }

  const eventDate = new Date(event?.date || '').getTime();
  if (!Number.isNaN(eventDate) && eventDate < Date.now()) {
    return 'COMPLETED';
  }

  return 'SCHEDULED';
};

const getEventStatusClasses = (statusLabel) => {
  if (statusLabel === 'COMPLETED') {
    return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
  }

  if (statusLabel === 'ONGOING') {
    return 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300';
  }

  return 'border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300';
};

const formatDate = (date) => {
  const parsed = new Date(date || '');

  if (Number.isNaN(parsed.getTime())) {
    return 'Date TBA';
  }

  return parsed.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getCalendarDay = (date) => {
  const parsed = new Date(date || '');

  if (Number.isNaN(parsed.getTime())) {
    return { month: 'TBD', day: '--' };
  }

  return {
    month: parsed.toLocaleString(undefined, { month: 'short' }).toUpperCase(),
    day: parsed.getDate().toString(),
  };
};

export default function VolunteerDashboard() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [motivation, setMotivation] = useState('');
  const [contact, setContact] = useState('');
  const currentUserId = String(user?.id || user?._id || '');

  const {
    data: events = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['my-events', currentUserId],
    enabled: Boolean(currentUserId),
    queryFn: async () => {
      const { data } = await API.get('/events');

      return (data || []).filter((event) => {
        return (event?.participants || []).some((participant) => {
          return getSafeUserId(participant) === currentUserId;
        });
      });
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload) => {
      return API.post('/organizer/apply', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
    },
    onSuccess: () => {
      toast.success('Application submitted successfully.');
      setMotivation('');
      setContact('');
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          'Could not submit the organizer application.'
      );
    },
  });

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const dateA = new Date(a?.date || '').getTime();
      const dateB = new Date(b?.date || '').getTime();

      if (Number.isNaN(dateA) || Number.isNaN(dateB)) {
        return 0;
      }

      return dateB - dateA;
    });
  }, [events]);

  const completedEventsCount = useMemo(() => {
    return sortedEvents.filter((event) => {
      return getEventStatusLabel(event) === 'COMPLETED';
    }).length;
  }, [sortedEvents]);

  const upcomingEventsCount = Math.max(
    sortedEvents.length - completedEventsCount,
    0
  );
  const completionRate =
    sortedEvents.length > 0
      ? Math.round((completedEventsCount / sortedEvents.length) * 100)
      : 0;

  const nextEvent = useMemo(() => {
    return sortedEvents.find((event) => {
      const statusLabel = getEventStatusLabel(event);
      return statusLabel === 'SCHEDULED' || statusLabel === 'ONGOING';
    });
  }, [sortedEvents]);

  const canSubmitOrganizerApplication =
    motivation.trim().length >= 10 && contact.trim().length >= 5;

  const roleLabel = String(user?.role || 'VOLUNTEER').toUpperCase();
  const avatarLetter = (user?.name || 'V').charAt(0).toUpperCase();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Volunteer Dashboard
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Track your participation, manage role applications, and stay ready
            for upcoming cleanups.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? 'Refreshing...' : 'Refresh data'}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="space-y-6 lg:col-span-4">
          <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
            <CardHeader className="bg-primary/5 pb-6">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-3xl font-bold text-primary-foreground shadow-sm">
                {avatarLetter}
              </div>
              <CardTitle className="text-2xl">
                {user?.name || 'Volunteer'}
              </CardTitle>
              <CardDescription className="break-all">
                {user?.email || '-'}
              </CardDescription>
              <Badge variant="secondary" className="mt-2 w-fit">
                {roleLabel}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between rounded-xl border border-border/70 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 text-amber-500" />
                  Volunteer Rating
                </div>
                <span className="text-sm font-semibold text-foreground">
                  4.8
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border/70 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  Events Attended
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {sortedEvents.length}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border/70 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Completion Rate
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {completionRate}%
                </span>
              </div>
            </CardContent>
          </Card>

          {user?.role === 'volunteer' && (
            <Card className="rounded-2xl border-primary/25 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">Become an Organizer</CardTitle>
                <CardDescription>
                  Share why you are ready to lead and include a contact channel
                  for follow-up.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="motivation">Motivation</Label>
                  <Textarea
                    id="motivation"
                    placeholder="Tell us about your leadership experience and motivation..."
                    rows={4}
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact">Contact details</Label>
                  <Input
                    id="contact"
                    type="text"
                    placeholder="Email, phone number, or LinkedIn"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full rounded-xl"
                  onClick={() =>
                    mutation.mutate({
                      motivation: motivation.trim(),
                      contactDetails: contact.trim(),
                    })
                  }
                  disabled={
                    mutation.isPending || !canSubmitOrganizerApplication
                  }
                >
                  <Send className="mr-2 h-4 w-4" />
                  {mutation.isPending ? 'Submitting...' : 'Submit application'}
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        <section className="space-y-6 lg:col-span-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="rounded-2xl border-border/70">
              <CardContent className="p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Total joined
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {sortedEvents.length}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/70">
              <CardContent className="p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Upcoming
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {upcomingEventsCount}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/70">
              <CardContent className="p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Completed
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {completedEventsCount}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl border-border/70 bg-gradient-to-br from-primary/10 via-background to-background">
            <CardHeader>
              <CardTitle className="text-lg">Next Highlight</CardTitle>
              <CardDescription>
                {nextEvent
                  ? 'Your next scheduled participation at a glance.'
                  : 'Join an event to see your next activity here.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {nextEvent ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-base font-semibold text-foreground">
                      {nextEvent.title || 'Untitled event'}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(nextEvent.date)} •{' '}
                      {nextEvent.time || 'Time TBA'}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/events')}
                    className="w-full sm:w-auto"
                  >
                    View all events
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/events')}
                >
                  Browse available events
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/70">
            <CardHeader>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-xl">My Participation</CardTitle>
                  <CardDescription>
                    A timeline of events where you have joined as a volunteer.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full sm:w-auto"
                  onClick={() => navigate('/events')}
                >
                  Browse events
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading && (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-20 animate-pulse rounded-xl border border-border/60 bg-muted/40"
                    />
                  ))}
                </div>
              )}

              {isError && !isLoading && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                  Could not load your participation data.
                  <Button
                    type="button"
                    variant="outline"
                    className="ml-3"
                    onClick={() => refetch()}
                  >
                    Retry
                  </Button>
                </div>
              )}

              {!isLoading && !isError && sortedEvents.length === 0 && (
                <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-10 text-center">
                  <h3 className="text-lg font-semibold text-foreground">
                    No joined events yet
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Start by joining a cleanup event to build your participation
                    history.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/events')}
                  >
                    Browse Events
                  </Button>
                </div>
              )}

              {!isLoading &&
                !isError &&
                sortedEvents.map((event) => {
                  const { month, day } = getCalendarDay(event?.date);
                  const statusLabel = getEventStatusLabel(event);

                  return (
                    <article
                      key={event?._id}
                      className="rounded-xl border border-border/70 bg-card p-4 transition-colors hover:bg-accent/20"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg border border-border/60 bg-muted/40">
                          <span className="text-[10px] font-semibold tracking-wide text-muted-foreground">
                            {month}
                          </span>
                          <span className="text-lg font-bold text-foreground">
                            {day}
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-base font-semibold text-foreground">
                              {event?.title || 'Untitled event'}
                            </h3>
                            <Badge
                              variant="outline"
                              className={getEventStatusClasses(statusLabel)}
                            >
                              {statusLabel}
                            </Badge>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" />
                              <span>{event?.beach?.name || 'Beach TBA'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{formatDate(event?.date)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock3 className="h-3.5 w-3.5" />
                              <span>{event?.time || 'Time TBA'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
