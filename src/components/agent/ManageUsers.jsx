import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Briefcase,
  Loader,
  Lock,
  Mail,
  MapPin,
  Power,
  PowerOff,
  Shield,
  Trash2,
  User,
  Users2,
  Zap,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  activateUser,
  deactivateUser,
  deleteUser,
  getAllUsers,
} from '@/api/authApi';
import { useSelector } from 'react-redux';

const ROLE_TABS = [
  {
    key: 'volunteers',
    role: 'volunteer',
    label: 'Volunteers',
    icon: Users2,
    cardClass: 'border-sky-500/25 bg-sky-500/10',
    accentClass: 'text-sky-600 dark:text-sky-400',
    ringClass: 'ring-sky-500/45',
    emptyText: 'No volunteers found',
  },
  {
    key: 'agents',
    role: 'agent',
    label: 'Agents',
    icon: Zap,
    cardClass: 'border-cyan-500/25 bg-cyan-500/10',
    accentClass: 'text-cyan-600 dark:text-cyan-400',
    ringClass: 'ring-cyan-500/45',
    emptyText: 'No agents found',
  },
  {
    key: 'organizers',
    role: 'organizer',
    label: 'Organizers',
    icon: Briefcase,
    cardClass: 'border-emerald-500/25 bg-emerald-500/10',
    accentClass: 'text-emerald-600 dark:text-emerald-400',
    ringClass: 'ring-emerald-500/45',
    emptyText: 'No organizers found',
  },
  {
    key: 'admins',
    role: 'admin',
    label: 'Admins',
    icon: Lock,
    cardClass: 'border-rose-500/25 bg-rose-500/10',
    accentClass: 'text-rose-600 dark:text-rose-400',
    ringClass: 'ring-rose-500/45',
    emptyText: 'No admins found',
  },
];

const getRoleBadgeClass = (role) => {
  switch (role) {
    case 'volunteer':
      return 'border-sky-500/35 bg-sky-500/10 text-sky-700 dark:text-sky-300';
    case 'agent':
      return 'border-cyan-500/35 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300';
    case 'organizer':
      return 'border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
    case 'admin':
      return 'border-rose-500/35 bg-rose-500/10 text-rose-700 dark:text-rose-300';
    default:
      return 'border-border bg-muted/60 text-muted-foreground';
  }
};

const getRoleMetaByRole = (role) => {
  return ROLE_TABS.find((tab) => tab.role === role) || ROLE_TABS[0];
};

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
        setUsers(response.data || []);
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
    if (!window.confirm(`Are you sure you want to activate ${userName}?`)) {
      return;
    }

    try {
      setActioningId(userId);
      const response = await activateUser(userId);

      if (response.success) {
        setUsers((previousUsers) =>
          previousUsers.map((item) =>
            item._id === userId ? { ...item, isActive: true } : item
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
    if (!window.confirm(`Are you sure you want to deactivate ${userName}?`)) {
      return;
    }

    try {
      setActioningId(userId);
      const response = await deactivateUser(userId);

      if (response.success) {
        setUsers((previousUsers) =>
          previousUsers.map((item) =>
            item._id === userId ? { ...item, isActive: false } : item
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
        setUsers((previousUsers) =>
          previousUsers.map((item) =>
            item._id === userId ? { ...item, isDeleted: true } : item
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

  const usersByRole = useMemo(() => {
    const visibleUsers = users.filter((item) => !item.isDeleted);

    return {
      volunteers: visibleUsers.filter((item) => item.role === 'volunteer'),
      agents: visibleUsers.filter((item) => item.role === 'agent'),
      organizers: visibleUsers.filter((item) => item.role === 'organizer'),
      admins: visibleUsers.filter((item) => item.role === 'admin'),
    };
  }, [users]);

  const selectedTab =
    ROLE_TABS.find((tab) => tab.key === activeRole) || ROLE_TABS[0];
  const selectedUsers = usersByRole[selectedTab.key] || [];

  const totalVisibleUsers =
    usersByRole.volunteers.length +
    usersByRole.agents.length +
    usersByRole.organizers.length +
    usersByRole.admins.length;

  const renderUserTable = (userList, roleLabel) => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-foreground">
        {roleLabel} ({userList.length})
      </h3>

      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
        <table className="w-full min-w-[980px] text-sm">
          <thead className="bg-muted/45">
            <tr className="border-b border-border/70">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Name
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Email
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Role
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Beach
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {userList.map((item) => {
              const roleMeta = getRoleMetaByRole(item.role);
              const RoleIcon = roleMeta.icon;
              const isActioning = actioningId === item._id;

              return (
                <tr
                  key={item._id}
                  className="border-b border-border/60 last:border-b-0 hover:bg-accent/30"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-foreground">
                        {item.name || '-'}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-3 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{item.email}</span>
                    </div>
                  </td>

                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getRoleBadgeClass(
                        item.role
                      )}`}
                    >
                      <RoleIcon className="h-3.5 w-3.5" />
                      {item.role}
                    </span>
                  </td>

                  <td className="px-5 py-3 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{item.assignedBeach?.name || 'Not assigned'}</span>
                    </div>
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-2">
                      {!item.isActive && (
                        <Button
                          onClick={() =>
                            handleActivateUser(
                              item._id,
                              item.name || item.email
                            )
                          }
                          disabled={isActioning}
                          size="sm"
                          className="h-8 whitespace-nowrap"
                        >
                          {isActioning ? (
                            <>
                              <Loader className="mr-1 h-3.5 w-3.5 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <Power className="mr-1 h-3.5 w-3.5" />
                              Activate
                            </>
                          )}
                        </Button>
                      )}

                      {item.isActive && (
                        <Button
                          onClick={() =>
                            handleDeactivateUser(
                              item._id,
                              item.name || item.email
                            )
                          }
                          disabled={isActioning}
                          variant="outline"
                          size="sm"
                          className="h-8 whitespace-nowrap border-amber-500/30 text-amber-700 hover:bg-amber-500/10 dark:text-amber-300"
                        >
                          {isActioning ? (
                            <>
                              <Loader className="mr-1 h-3.5 w-3.5 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <PowerOff className="mr-1 h-3.5 w-3.5" />
                              Deactivate
                            </>
                          )}
                        </Button>
                      )}

                      <Button
                        onClick={() =>
                          handleDeleteUser(item._id, item.name || item.email)
                        }
                        disabled={isActioning}
                        variant="destructive"
                        size="sm"
                        className="h-8 whitespace-nowrap"
                      >
                        {isActioning ? (
                          <>
                            <Loader className="mr-1 h-3.5 w-3.5 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (!isAdmin) {
    return (
      <Card className="rounded-2xl border-amber-500/25 bg-amber-500/10">
        <CardContent className="flex items-start gap-3 pt-6">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            You do not have permission to access this section.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="rounded-3xl border-border/70 bg-card/80 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Manage Users
          </CardTitle>
          <CardDescription>Loading user records...</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-xl border border-border/60 bg-muted/35"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="rounded-3xl border-destructive/30 bg-destructive/10">
        <CardContent className="flex items-start gap-3 pt-6">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="font-semibold text-destructive">
              Error loading users
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
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

  return (
    <Card className="rounded-3xl border-border/70 bg-card/85 shadow-sm backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Shield className="h-5 w-5 text-primary" />
          Manage Users (Total: {totalVisibleUsers})
        </CardTitle>
        <CardDescription>
          Filter users by role and manage account status securely.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {totalVisibleUsers === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 py-12 text-center">
            <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">No users found.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {ROLE_TABS.map((tab) => {
                const TabIcon = tab.icon;
                const tabUsers = usersByRole[tab.key] || [];
                const activeCount = tabUsers.filter(
                  (item) => item.isActive
                ).length;
                const isSelected = activeRole === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveRole(tab.key)}
                    className={`rounded-2xl border p-5 text-left transition-all ${tab.cardClass} ${
                      isSelected
                        ? `ring-2 ${tab.ringClass} shadow-sm`
                        : 'hover:border-primary/30 hover:bg-accent/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={`text-sm font-semibold ${tab.accentClass}`}
                        >
                          {tab.label}
                        </p>
                        <p className="mt-1 text-3xl font-bold text-foreground">
                          {tabUsers.length}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Active: {activeCount}
                        </p>
                      </div>

                      <TabIcon
                        className={`h-9 w-9 opacity-80 ${tab.accentClass}`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="space-y-4">
              {selectedUsers.length > 0 ? (
                renderUserTable(selectedUsers, selectedTab.label)
              ) : (
                <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 py-12 text-center">
                  <selectedTab.icon className="mx-auto mb-4 h-12 w-12 text-muted-foreground/60" />
                  <p className="text-sm text-muted-foreground">
                    {selectedTab.emptyText}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
