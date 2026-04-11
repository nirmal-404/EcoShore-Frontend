import React from 'react';
import ManageUsers from '@/components/agent/ManageUsers';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function UserManagementPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mx-auto mb-6 flex w-full max-w-[1400px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="m-0 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Manage Users
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor accounts and control user access across EcoShore.
          </p>
        </div>

        <Button
          className="w-full sm:w-auto"
          onClick={() => navigate('/agent-form')}
        >
          + Invite Agent
        </Button>
      </div>

      {/* Content Card */}
      <div className="mx-auto w-full max-w-[1400px]">
        <ManageUsers />
      </div>
    </div>
  );
}
