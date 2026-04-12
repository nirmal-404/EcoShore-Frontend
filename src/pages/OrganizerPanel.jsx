import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Users, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import API from '@/api';

export default function OrganizerPanel() {
  const { user } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    beach: '',
    date: '',
    time: '',
    capacity: '',
  });

  const { data: beaches } = useQuery({
    queryKey: ['beaches'],
    queryFn: async () => {
      const { data } = await API.get('beaches');
      return data;
    },
  });

  const { data: events } = useQuery({
    queryKey: ['my-organized-events'],
    queryFn: async () => {
      const { data } = await API.get('/events');
      return data.filter((e) => e.organizer?._id === user.id);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      return API.post('/events', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-organized-events']);
      setShowCreate(false);
      setFormData({
        title: '',
        description: '',
        beach: '',
        date: '',
        time: '',
        capacity: '',
      });
    },
  });

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Organizer Control Panel
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your coastal cleanup initiatives.
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(!showCreate)}
          className="rounded-xl shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Event
        </Button>
      </div>

      {showCreate && (
        <Card className="mb-12 border-primary/20 bg-primary/5 rounded-2xl animate-in zoom-in-95 duration-300">
          <CardHeader>
            <CardTitle>Plan a New Cleanup</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Event Title
                </label>
                <input
                  className="w-full p-3 rounded-xl border bg-white focus:ring-2 focus:ring-primary/10 outline-none"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Beach Location
                </label>
                <select
                  className="w-full p-3 rounded-xl border bg-white focus:ring-2 focus:ring-primary/10 outline-none"
                  value={formData.beach}
                  onChange={(e) =>
                    setFormData({ ...formData, beach: e.target.value })
                  }
                >
                  <option value="">Select a beach...</option>
                  {beaches?.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-3 rounded-xl border bg-white outline-none"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Time
                  </label>
                  <input
                    type="time"
                    className="w-full p-3 rounded-xl border bg-white outline-none"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Description
                </label>
                <textarea
                  className="w-full p-3 rounded-xl border bg-white outline-none"
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Target Capacity (Optional)
                </label>
                <input
                  type="number"
                  className="w-full p-3 rounded-xl border bg-white outline-none"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t">
              <Button variant="ghost" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createMutation.mutate(formData)}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Publishing...' : 'Publish Event'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events?.map((event) => (
          <Card
            key={event._id}
            className="rounded-2xl border-border bg-card hover:border-primary/20 transition-all overflow-hidden group"
          >
            <CardHeader className="bg-secondary/5 pb-6">
              <div className="flex justify-between items-start mb-4">
                <Badge
                  variant={
                    event.status === 'approved' ? 'default' : 'secondary'
                  }
                  className="rounded-full"
                >
                  {event.status.toUpperCase()}
                </Badge>
                <div className="text-xs text-muted-foreground flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(event.createdAt).toLocaleDateString()}
                </div>
              </div>
              <CardTitle className="leading-tight group-hover:text-primary transition-colors">
                {event.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center text-sm text-muted-foreground mb-4">
                <Users className="w-4 h-4 mr-2" />
                <span className="font-medium text-foreground">
                  {event.participants?.length || 0}
                </span>{' '}
                / {event.capacity || '∞'} Volunteers Joined
              </div>
              <div className="w-full bg-secondary/20 h-2 rounded-full mb-6">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{
                    width: `${Math.min(100, (event.participants?.length / (event.capacity || 100)) * 100)}%`,
                  }}
                />
              </div>
              <Button
                variant="outline"
                className="w-full rounded-xl group-hover:bg-primary group-hover:text-white transition-all"
              >
                Manage Attendees
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
