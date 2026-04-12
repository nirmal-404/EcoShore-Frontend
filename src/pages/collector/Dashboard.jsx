import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Weight, Box, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import API from '@/api';

export default function CollectorDashboard() {
  const { user } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [wasteData, setWasteData] = useState({
    wasteType: '',
    weight: '',
    category: 'Plastic',
  });

  const { data: events, isLoading } = useQuery({
    queryKey: ['collector-events'],
    queryFn: async () => {
      const { data } = await API.get('/events');
      // Only show approved events that aren't completed yet
      return data.filter((e) => e.status === 'approved');
    },
  });

  const recordMutation = useMutation({
    mutationFn: async (payload) => {
      return API.post('/waste/record', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['collector-events']);
      setSelectedEvent(null);
      setWasteData({ wasteType: '', weight: '', category: 'Plastic' });
      alert('Waste record submitted successfully!');
    },
  });

  const handleRecord = (e) => {
    e.preventDefault();
    if (!selectedEvent) return;
    recordMutation.mutate({
      event: selectedEvent._id,
      ...wasteData,
      weight: parseFloat(wasteData.weight),
    });
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Trash2 className="w-8 h-8 text-primary" />
          Waste Collection Panel
        </h1>
        <p className="text-muted-foreground mt-2">
          Enter collection data for completed beach cleanup events.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Event List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Box className="w-5 h-5 text-primary" />
            Select Event
          </h2>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : events?.length === 0 ? (
            <div className="p-10 text-center border border-dashed rounded-2xl text-muted-foreground">
              No active events available for recording.
            </div>
          ) : (
            events?.map((event) => (
              <Card
                key={event._id}
                className={`cursor-pointer transition-all border-2 ${selectedEvent?._id === event._id ? 'border-primary bg-primary/5 shadow-md' : 'border-transparent hover:border-border'}`}
                onClick={() => setSelectedEvent(event)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold truncate max-w-[150px]">
                      {event.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {event.beach?.name}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {new Date(event.date).toLocaleDateString()}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Recording Form */}
        <div className="lg:col-span-2">
          {selectedEvent ? (
            <Card className="rounded-2xl border-primary/20 bg-card overflow-hidden">
              <CardHeader className="bg-primary/5 border-b pb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">
                      {selectedEvent.title}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1" />{' '}
                      {selectedEvent.beach?.name}
                    </CardDescription>
                  </div>
                  <Badge variant="default">EVENT READY FOR LOGGING</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-8">
                <form onSubmit={handleRecord} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">
                        Waste Type Description
                      </label>
                      <input
                        placeholder="e.g. Mixed beverage containers"
                        className="w-full p-3 rounded-xl border bg-white focus:ring-2 focus:ring-primary/10 outline-none"
                        value={wasteData.wasteType}
                        onChange={(e) =>
                          setWasteData({
                            ...wasteData,
                            wasteType: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">
                        Waste Category
                      </label>
                      <select
                        className="w-full p-3 rounded-xl border bg-white focus:ring-2 focus:ring-primary/10 outline-none"
                        value={wasteData.category}
                        onChange={(e) =>
                          setWasteData({
                            ...wasteData,
                            category: e.target.value,
                          })
                        }
                      >
                        <option value="Plastic">Plastic</option>
                        <option value="Glass">Glass</option>
                        <option value="Metal">Metal</option>
                        <option value="Organic">Organic</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        <Weight className="w-4 h-4" /> Total Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        className="w-full p-3 rounded-xl border bg-white focus:ring-2 focus:ring-primary/10 outline-none"
                        value={wasteData.weight}
                        onChange={(e) =>
                          setWasteData({ ...wasteData, weight: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-secondary/20 flex gap-3 text-sm text-secondary-foreground items-start">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p>
                      Submitting this record will automatically mark the event
                      as <strong>Completed</strong>. This action cannot be
                      undone by the collector.
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => setSelectedEvent(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="rounded-xl px-10"
                      disabled={recordMutation.isPending}
                    >
                      {recordMutation.isPending
                        ? 'Saving...'
                        : 'Finalize Record'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-border rounded-2xl bg-secondary/5">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Ready to Record</h3>
              <p className="text-muted-foreground max-w-sm">
                Please select a cleanup event from the list on the left to start
                logging waste collection data.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MapPin({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
