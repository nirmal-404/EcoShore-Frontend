import React from 'react';
import { Calendar, MapPin, TrendingUp, Users } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import AgentEvents from '@/components/agent/AgentEvents';
import { useSelector } from 'react-redux';

export default function AgentDashboard() {
  const { user } = useSelector((state) => state.auth);
  const agentId = user?._id;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Calendar className="w-8 h-8 text-primary" />
              Agent Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your assigned events and track progress
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <Card className="rounded-2xl bg-primary text-primary-foreground border-none shadow-lg shadow-primary/20">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex justify-between items-center opacity-90">
                Upcoming Events
                <Calendar className="w-4 h-4" />
              </CardTitle>
              <div className="text-4xl font-bold mt-2">0</div>
            </CardHeader>
          </Card>

          <Card className="rounded-2xl border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex justify-between items-center text-muted-foreground">
                Total Volunteers
                <Users className="w-4 h-4" />
              </CardTitle>
              <div className="text-4xl font-bold mt-2">0</div>
            </CardHeader>
          </Card>

          <Card className="rounded-2xl border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex justify-between items-center text-muted-foreground">
                Assigned Beach
                <MapPin className="w-4 h-4" />
              </CardTitle>
              <div className="text-xl font-bold mt-2 truncate">
                {user?.assignedBeach?.name || 'Not Assigned'}
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Events Section */}
        <div className="mb-10">
          <AgentEvents agentId={agentId} />
        </div>

        {/* Quick Stats */}
        <Card className="rounded-2xl border-border">
          <CardHeader>
            <CardTitle>Event Performance</CardTitle>
            <CardDescription>Your event management metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Completed Events
                </p>
                <p className="text-3xl font-bold">0</p>
                <p className="text-xs text-muted-foreground mt-1">
                  All time completion rate
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Average Volunteers
                </p>
                <p className="text-3xl font-bold">0</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Per event average
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
