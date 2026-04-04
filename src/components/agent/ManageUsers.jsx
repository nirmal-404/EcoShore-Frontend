import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  User,
  Mail,
  MapPin,
  Shield,
  Power,
  PowerOff,
  Trash2,
  Loader,
  Users,
  CheckCircle,
  XCircle,
  Zap,
  Users2,
  Lock,
  Briefcase,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAllUsers, activateUser, deactivateUser, deleteUser } from '@/api/authApi';
import { useSelector } from 'react-redux';

export default function ManageUsers() {
  const { user: currentUser } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actioningId, setActioningId] = useState(null);
  const [activeRole, setActiveRole] = useState('volunteers');

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getAllUsers();
      if (response.success) {
        setUsers(response.data);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateUser = async (userId, userName) => {
    if (
      !window.confirm(
        `Are you sure you want to activate ${userName}?`
      )
    ) {
      return;
    }

    try {
      setActioningId(userId);
      const response = await activateUser(userId);
      if (response.success) {
        setUsers(
          users.map((u) =>
            u._id === userId
              ? { ...u, isActive: true }
              : u
          )
        );
      } else {
        alert('Failed to activate user');
      }
    } catch (err) {
      alert('Error activating user: ' + err.message);
      console.error('Error activating user:', err);
    } finally {
      setActioningId(null);
    }
  };

  const handleDeactivateUser = async (userId, userName) => {
    if (
      !window.confirm(
        `Are you sure you want to deactivate ${userName}?`
      )
    ) {
      return;
    }

    try {
      setActioningId(userId);
      const response = await deactivateUser(userId);
      if (response.success) {
        setUsers(
          users.map((u) =>
            u._id === userId
              ? { ...u, isActive: false }
              : u
          )
        );
      } else {
        alert('Failed to deactivate user');
      }
    } catch (err) {
      alert('Error deactivating user: ' + err.message);
      console.error('Error deactivating user:', err);
    } finally {
      setActioningId(null);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (
      !window.confirm(
        `Are you absolutely sure you want to delete ${userName}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setActioningId(userId);
      const response = await deleteUser(userId);
      if (response.success) {
        setUsers(
          users.map((u) =>
            u._id === userId
              ? { ...u, isDeleted: true }
              : u
          )
        );
      } else {
        alert('Failed to delete user');
      }
    } catch (err) {
      alert('Error deleting user: ' + err.message);
      console.error('Error deleting user:', err);
    } finally {
      setActioningId(null);
    }
  };

  if (!isAdmin) {
    return (
      <Card className="rounded-2xl border-amber-200/50 bg-amber-50/30">
        <CardContent className="pt-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            You do not have permission to access this section
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="rounded-2xl border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Manage Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border border-border animate-pulse bg-muted/20 h-20"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="rounded-2xl border-destructive/20 bg-destructive/5">
        <CardContent className="pt-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-destructive">Error loading users</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button
              onClick={fetchUsers}
              size="sm"
              variant="outline"
              className="mt-3"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeUsers = users.filter(u => !u.isDeleted && u.isActive);
  const inactiveUsers = users.filter(u => !u.isDeleted && !u.isActive);
  const deletedUsers = users.filter(u => u.isDeleted);

  // Role-based filters - exclude deleted users
  const volunteers = users.filter(u => u.role === 'volunteer' && !u.isDeleted);
  const agents = users.filter(u => u.role === 'agent' && !u.isDeleted);
  const admins = users.filter(u => u.role === 'admin' && !u.isDeleted);
  const organizers = users.filter(u => u.role === 'organizer' && !u.isDeleted);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'volunteer':
        return <Users2 className="w-5 h-5" />;
      case 'agent':
        return <Zap className="w-5 h-5" />;
      case 'admin':
        return <Lock className="w-5 h-5" />;
      case 'organizer':
        return <Briefcase className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'volunteer':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-700';
      case 'agent':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-700';
      case 'admin':
        return ' bg-blue-500/10 border-blue-500/20 text-blue-700';
      case 'organizer':
        return ' bg-blue-500/10 border-blue-500/20 text-blue-700';
      default:
        return ' ';
    }
  };

  const renderUserTable = (userList, title) => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">{title} ({userList.length})</h3>
      {userList.length === 0 ? (
        <div className="text-center py-8 bg-muted/20 rounded-lg">
          <User className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-muted-foreground text-sm">No users in this category</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Name</th>
                <th className="text-left py-3 px-4 font-semibold">Email</th>
                <th className="text-left py-3 px-4 font-semibold">Role</th>
                <th className="text-left py-3 px-4 font-semibold">Beach</th>
                <th className="text-left py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {userList.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="py-3 px-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium">{user.name || '-'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="capitalize font-medium">{user.role}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {user.assignedBeach?.name || 'Not Assigned'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 flex-wrap">
                      {!user.isActive && (
                        <Button
                          onClick={() =>
                            handleActivateUser(user._id, user.name || user.email)
                          }
                          disabled={actioningId === user._id}
                          variant="default"
                          size="sm"
                          className="whitespace-nowrap"
                        >
                          {actioningId === user._id ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin mr-1" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <Power className="w-4 h-4 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                      )}
                      {user.isActive && (
                        <Button
                          onClick={() =>
                            handleDeactivateUser(user._id, user.name || user.email)
                          }
                          disabled={actioningId === user._id}
                          variant="secondary"
                          size="sm"
                          className="whitespace-nowrap"
                        >
                          {actioningId === user._id ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin mr-1" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <PowerOff className="w-4 h-4 mr-1" />
                              Deactivate
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        onClick={() =>
                          handleDeleteUser(user._id, user.name || user.email)
                        }
                        disabled={actioningId === user._id}
                        variant="destructive"
                        size="sm"
                        className="whitespace-nowrap"
                      >
                        {actioningId === user._id ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin mr-1" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <Card className="rounded-2xl border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Manage Users (Total: {users.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Role Summary Stats */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {/* Volunteers */}
              <Card className={`rounded-2xl border cursor-pointer transition-all ${getRoleColor('volunteer')} ${activeRole === 'volunteers' ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setActiveRole('volunteers')}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Volunteers</p>
                      <p className="text-3xl font-bold mt-1">
                        {volunteers.length}
                      </p>
                      <p className="text-xs mt-2 opacity-70">
                        Active: {volunteers.filter(u => u.isActive && !u.isDeleted).length}
                      </p>
                    </div>
                    <Users2 className="w-10 h-10 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              {/* Agents */}
              <Card className={`rounded-2xl border cursor-pointer transition-all ${getRoleColor('agent')} ${activeRole === 'agents' ? 'ring-2 ring-purple-500' : ''}`} onClick={() => setActiveRole('agents')}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Agents</p>
                      <p className="text-3xl font-bold mt-1">
                        {agents.length}
                      </p>
                      <p className="text-xs mt-2 opacity-70">
                        Active: {agents.filter(u => u.isActive && !u.isDeleted).length}
                      </p>
                    </div>
                    <Zap className="w-10 h-10 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              {/* Organizers */}
              <Card className={`rounded-2xl border cursor-pointer transition-all ${getRoleColor('organizer')} ${activeRole === 'organizers' ? 'ring-2 ring-green-500' : ''}`} onClick={() => setActiveRole('organizers')}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Organizers</p>
                      <p className="text-3xl font-bold mt-1">
                        {organizers.length}
                      </p>
                      <p className="text-xs mt-2 opacity-70">
                        Active: {organizers.filter(u => u.isActive && !u.isDeleted).length}
                      </p>
                    </div>
                    <Briefcase className="w-10 h-10 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              {/* Admins */}
              <Card className={`rounded-2xl border cursor-pointer transition-all ${getRoleColor('admin')} ${activeRole === 'admins' ? 'ring-2 ring-red-500' : ''}`} onClick={() => setActiveRole('admins')}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Admins</p>
                      <p className="text-3xl font-bold mt-1">
                        {admins.length}
                      </p>
                      <p className="text-xs mt-2 opacity-70">
                        Active: {admins.filter(u => u.isActive && !u.isDeleted).length}
                      </p>
                    </div>
                    <Lock className="w-10 h-10 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeRole === 'volunteers' && volunteers.length > 0 && (
                renderUserTable(volunteers, ' Volunteers')
              )}
              {activeRole === 'volunteers' && volunteers.length === 0 && (
                <div className="text-center py-12 bg-muted/20 rounded-lg">
                  <Users2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No volunteers found</p>
                </div>
              )}

              {activeRole === 'agents' && agents.length > 0 && (
                renderUserTable(agents, ' Agents')
              )}
              {activeRole === 'agents' && agents.length === 0 && (
                <div className="text-center py-12 bg-muted/20 rounded-lg">
                  <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No agents found</p>
                </div>
              )}

              {activeRole === 'organizers' && organizers.length > 0 && (
                renderUserTable(organizers, ' Organizers')
              )}
              {activeRole === 'organizers' && organizers.length === 0 && (
                <div className="text-center py-12 bg-muted/20 rounded-lg">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No organizers found</p>
                </div>
              )}

              {activeRole === 'admins' && admins.length > 0 && (
                renderUserTable(admins, ' Admins')
              )}
              {activeRole === 'admins' && admins.length === 0 && (
                <div className="text-center py-12 bg-muted/20 rounded-lg">
                  <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No admins found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
