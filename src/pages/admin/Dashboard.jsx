import React, { useState } from 'react';
import {
  Shield,
  Check,
  X,
  Plus,
  Trash2,
  MapPin,
  BarChart2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import ManageUsers from '@/components/agent/ManageUsers';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('events');

  // Queries
  const requests = [];
  const beaches = [];

  const eventsList = [];
  const pendingEvents = eventsList.filter((e) => e.status === 'pending');

  // Mutations
  const approveEvent = '';

  const approveOrganizer = '';

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 italic">
            <Shield className="w-8 h-8 text-primary" />
            Admin Console
          </h1>
          <p className="text-muted-foreground mt-1 text-sm tracking-wide">
            Governance and management of the EcoShore ecosystem.
          </p>
        </div>

        <div className="flex bg-secondary/30 p-1 rounded-2xl border border-border">
          {['events', 'organizers', 'beaches', 'users', 'analytics'].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === tab ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {activeTab === 'events' && (
        <div className="grid gap-6">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
            Pending Event Approvals
          </h2>
          {pendingEvents.map((event) => (
            <Card
              key={event._id}
              className="rounded-2xl border-border hover:border-primary/20 transition-all"
            >
              <CardContent className="flex items-center p-6 gap-6">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{event.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {event.description}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs">
                    <span className="flex items-center text-primary">
                      <MapPin className="w-3 h-3 mr-1" /> {event.beach?.name}
                    </span>
                    <span className="text-muted-foreground">
                      Organizer: {event.organizer?.name}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg h-9 text-destructive border-destructive/20 hover:bg-destructive/5"
                    onClick={() =>
                      approveEvent.mutate({
                        id: event._id,
                        status: 'rejected',
                      })
                    }
                  >
                    <X className="w-4 h-4 mr-1" /> Reject
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-lg h-9"
                    onClick={() =>
                      approveEvent.mutate({
                        id: event._id,
                        status: 'approved',
                      })
                    }
                  >
                    <Check className="w-4 h-4 mr-1" /> Approve
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {pendingEvents.length === 0 && (
            <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border text-muted-foreground">
              No pending events for approval.
            </div>
          )}
        </div>
      )}

      {activeTab === 'organizers' && (
        <div className="grid gap-6">
          <h2 className="text-xl font-bold mb-2">
            Organizer Privilege Requests
          </h2>
          {requests
            ?.filter((r) => r.status === 'pending')
            .map((req) => (
              <Card
                key={req._id}
                className="rounded-2xl border-border overflow-hidden"
              >
                <CardHeader className="bg-primary/5 pb-4">
                  <CardTitle className="text-lg">{req.user?.name}</CardTitle>
                  <CardDescription>{req.user?.email}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm italic text-muted-foreground">
                      "{req.motivation}"
                    </p>
                    <p className="text-xs font-semibold mt-2">
                      Contact: {req.contactDetails}
                    </p>
                  </div>
                  <div className="flex gap-2 self-end">
                    <Button
                      variant="ghost"
                      className="text-destructive h-9"
                      onClick={() =>
                        approveOrganizer.mutate({
                          id: req._id,
                          status: 'rejected',
                        })
                      }
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="h-9 px-6 rounded-lg"
                      onClick={() =>
                        approveOrganizer.mutate({
                          id: req._id,
                          status: 'approved',
                        })
                      }
                    >
                      Approve Application
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <ManageUsers />
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-8">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="rounded-2xl bg-primary text-primary-foreground border-none shadow-lg shadow-primary/20">
              <CardHeader>
                <CardTitle className="flex justify-between items-center text-primary-foreground/80 text-sm font-medium">
                  Total Plastic Collected
                  <BarChart2 className="w-4 h-4" />
                </CardTitle>
                <div className="text-4xl font-bold mt-2">428.5 kg</div>
              </CardHeader>
            </Card>
            <Card className="rounded-2xl border-border bg-card">
              <CardHeader>
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Events Completed
                </CardTitle>
                <div className="text-4xl font-bold mt-2">12</div>
              </CardHeader>
            </Card>
            <Card className="rounded-2xl border-border bg-card">
              <CardHeader>
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Registered Volunteers
                </CardTitle>
                <div className="text-4xl font-bold mt-2">1,024</div>
              </CardHeader>
            </Card>
          </div>

          <Card className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle>Pollution Categories (kg)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {['Plastic', 'Glass', 'Metal', 'Organic'].map((cat, i) => (
                  <div key={cat} className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>{cat}</span>
                      <span>{[124, 56, 32, 89][i]} kg</span>
                    </div>
                    <div className="w-full bg-secondary/20 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{
                          width: `${([124, 56, 32, 89][i] / 150) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'beaches' && (
        <div className="grid gap-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-foreground">
              Beach Resource Management
            </h2>
            <Button className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Add Beach
            </Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {beaches?.map((beach) => (
              <div
                key={beach._id}
                className="p-4 rounded-2xl border border-border bg-card flex justify-between items-center group"
              >
                <div>
                  <h3 className="font-bold">{beach.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    ID: {beach._id.slice(-6)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
