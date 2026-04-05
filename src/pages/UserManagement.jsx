import React from 'react';
import ManageUsers from '@/components/agent/ManageUsers';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function UserManagementPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold m-0">Manage Users</h1>
        <Button
          className="hover:cursor-default"
          onClick={() => navigate('/agent-form')}
        >
          + Invite Agent
        </Button>
      </div>

      {/* Content Card */}
      <div className="bg-white shadow-md rounded-2xl p-4">
        <ManageUsers />
      </div>
    </div>
  );
}
