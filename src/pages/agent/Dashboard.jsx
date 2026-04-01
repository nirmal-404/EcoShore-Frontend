import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AgentDashboard() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Agent Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome to your agent portal
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 text-foreground rounded-lg transition-colors"
          >
            <Button>
              <ArrowLeft />
              Back to
            </Button>
          </Link>
        </div>

        <div className="grid gap-6">
          {/* Sample Card 1 */}
          <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/40 transition-colors">
            <h2 className="text-xl font-semibold mb-2">Sample Content 1</h2>
            <p className="text-muted-foreground">
              This is sample content for the agent dashboard.
            </p>
          </div>

          {/* Sample Card 2 */}
          <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/40 transition-colors">
            <h2 className="text-xl font-semibold mb-2">Sample Content 2</h2>
            <p className="text-muted-foreground">
              Add your agent-specific features here.
            </p>
          </div>

          {/* Sample Card 3 */}
          <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/40 transition-colors">
            <h2 className="text-xl font-semibold mb-2">Sample Content 3</h2>
            <p className="text-muted-foreground">
              More sample placeholder content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
