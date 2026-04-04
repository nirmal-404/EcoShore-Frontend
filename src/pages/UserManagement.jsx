import React from "react";
import ManageUsers from "@/components/agent/ManageUsers";

export default function UserManagementPage()  {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Page Header */}
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>

      {/* Content Card */}
      <div className="bg-white shadow-md rounded-2xl p-4">
        <ManageUsers />
      </div>
    </div>
  );    
};
