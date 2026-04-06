import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  AlertCircle,
  UserCheck,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEventsByAgent } from '@/hooks/agent';

export default function AgentEvents({ agentId }) {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error } = useEventsByAgent(agentId);

  if (!agentId) {
    return (
      <Card className="rounded-2xl border-amber-200/50 bg-amber-50/30">
        <CardContent className="pt-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">No agent selected</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="rounded-2xl border-border animate-pulse">
            <CardContent className="p-6 h-40 bg-muted/20" />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="rounded-2xl border-destructive/20 bg-destructive/5">
        <CardContent className="pt-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-destructive">
              Error loading events
            </p>
            <p className="text-sm text-muted-foreground">
              {error?.message || 'Failed to fetch events'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const events = data?.data?.events || [];
  const pagination = data?.data?.pagination || {};
  const totalPages = pagination.pages || 0;

  if (events.length === 0) {
    return (
      <Card className="rounded-2xl border-dashed border-border">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 opacity-30 mx-auto mb-3" />
            <p className="text-muted-foreground">No events assigned yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      UPCOMING: 'bg-blue-500/10 text-blue-700 border border-blue-200',
      ONGOING: 'bg-green-500/10 text-green-700 border border-green-200',
      COMPLETED: 'bg-gray-500/10 text-gray-700 border border-gray-200',
      CANCELLED: 'bg-red-500/10 text-red-700 border border-red-200',
    };
    return colors[status] || colors.UPCOMING;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="grid gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Assigned Events
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Total: {pagination.total || 0} events
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {events.map((event) => (
          <Card
            key={event._id}
            className="rounded-2xl border-border hover:border-primary/30 transition-all overflow-hidden group"
          >
            <CardContent className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {event.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {event.description}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(
                    event.status
                  )}`}
                >
                  {event.status}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-border">
                {/* Date */}
                <div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Calendar className="w-3 h-3" /> Start Date
                  </div>
                  <p className="text-sm font-semibold">
                    {formatDate(event.startDate)}
                  </p>
                </div>

                {/* End Date */}
                <div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Clock className="w-3 h-3" /> End Date
                  </div>
                  <p className="text-sm font-semibold">
                    {formatDate(event.endDate)}
                  </p>
                </div>

                {/* Location */}
                <div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <MapPin className="w-3 h-3" /> Beach
                  </div>
                  <p className="text-sm font-semibold">
                    {event.beachId?.name || 'N/A'}
                  </p>
                </div>

                {/* Volunteers */}
                <div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Users className="w-3 h-3" /> Volunteers
                  </div>
                  <p className="text-sm font-semibold">
                    {event.volunteers?.length || 0}
                    {event.maxVolunteers ? ` / ${event.maxVolunteers}` : ''}
                  </p>
                </div>
              </div>

              {/* Organizer Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Organizer</p>
                    <p className="text-sm font-semibold">
                      {event.organizerId?.name || 'Unknown'}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-end">
                    {event.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-secondary/50 text-xs rounded-lg font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" className="rounded-lg" variant="default">
                  View Details
                </Button>
                <Button size="sm" className="rounded-lg" variant="outline">
                  Chat Group
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={page === p ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
