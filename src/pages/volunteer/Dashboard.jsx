import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Star, MapPin, Calendar, ClipboardList, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function VolunteerDashboard() {
    const { user } = useSelector((state) => state.auth);
    const [motivation, setMotivation] = useState('');
    const [contact, setContact] = useState('');

    const { data: events } = useQuery({
        queryKey: ['my-events'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:4000/api/events');
            return data.filter(e => e.participants.some(p => p._id === user.id));
        }
    });

    const mutation = useMutation({
        mutationFn: async (payload) => {
            return axios.post('http://localhost:4000/api/organizer/apply', payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
        },
        onSuccess: () => {
            alert('Application submitted successfully!');
            setMotivation('');
            setContact('');
        }
    });

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Profile & Application Sidebar */}
                <div className="md:w-1/3 space-y-8">
                    <Card className="rounded-2xl overflow-hidden border-border shadow-sm">
                        <CardHeader className="bg-primary/5 pb-8">
                            <div className="w-20 h-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold mb-4">
                                {user?.name?.[0]}
                            </div>
                            <CardTitle className="text-2xl">{user?.name}</CardTitle>
                            <CardDescription>{user?.email}</CardDescription>
                            <Badge variant="secondary" className="mt-2">{user?.role.toUpperCase()}</Badge>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                <Star className="w-4 h-4 text-primary" />
                                <span>4.8 Volunteer Rating</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <ClipboardList className="w-4 h-4 text-primary" />
                                <span>{events?.length || 0} Events Attended</span>
                            </div>
                        </CardContent>
                    </Card>

                    {user?.role === 'volunteer' && (
                        <Card className="rounded-2xl border-primary/20 bg-primary/5">
                            <CardHeader>
                                <CardTitle className="text-lg">Become an Organizer</CardTitle>
                                <CardDescription>Upgrade your role to create and manage coastal cleanup events.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <textarea
                                    placeholder="Motivation..."
                                    className="w-full p-3 rounded-xl border border-border bg-white text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    rows={3}
                                    value={motivation}
                                    onChange={(e) => setMotivation(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Contact details"
                                    className="w-full p-3 rounded-xl border border-border bg-white text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                />
                                <Button
                                    className="w-full rounded-xl"
                                    onClick={() => mutation.mutate({ motivation, contactDetails: contact })}
                                    disabled={mutation.isPending}
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    {mutation.isPending ? 'Submitting...' : 'Apply Now'}
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Main Content: Joined Events */}
                <div className="md:w-2/3">
                    <h2 className="text-2xl font-bold mb-6">My Participation</h2>

                    <div className="grid gap-6">
                        {events?.map(event => (
                            <Card key={event._id} className="rounded-2xl transition-all hover:shadow-md">
                                <CardContent className="flex items-center p-6 gap-6">
                                    <div className="w-16 h-16 rounded-xl bg-secondary/10 flex flex-col items-center justify-center text-secondary">
                                        <span className="text-xs font-bold uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                        <span className="text-xl font-bold">{new Date(event.date).getDate()}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg">{event.title}</h3>
                                        <div className="flex gap-4 mt-2">
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <MapPin className="w-3 h-3 mr-1" />
                                                {event.beach?.name}
                                            </div>
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {event.time}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant={event.status === 'completed' ? 'success' : 'outline'}>
                                        {event.status.toUpperCase()}
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                        {events?.length === 0 && (
                            <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed flex flex-col items-center justify-center">
                                <p className="text-muted-foreground mb-4">You haven't joined any events yet.</p>
                                <Button variant="outline" className="rounded-xl">Browse Events</Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
