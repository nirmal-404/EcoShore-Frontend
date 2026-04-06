import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '@/api/chatApi';
import { Loader2, Search, UserPlus, X } from 'lucide-react';

export function AddMembersModal({
  isOpen,
  onClose,
  onAddMember,
  currentMemberIds = [],
  isAdding = false,
  addingUserId = null,
}) {
  const [search, setSearch] = useState('');

  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['all-users'],
    queryFn: getAllUsers,
    staleTime: 60_000,
    enabled: isOpen,
  });

  const memberIdSet = useMemo(
    () => new Set(currentMemberIds.map((id) => id?.toString())),
    [currentMemberIds]
  );

  const filteredUsers = useMemo(() => {
    const candidates = users.filter(
      (user) => !memberIdSet.has(user._id?.toString())
    );

    if (!search.trim()) {
      return candidates;
    }

    const query = search.toLowerCase();
    return candidates.filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
    );
  }, [users, memberIdSet, search]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Add Members
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              autoFocus
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2
                size={24}
                className="text-blue-600 dark:text-blue-400 animate-spin"
              />
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-600 dark:text-red-400 text-sm">
              Failed to load users
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
              No users available to add
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => {
                const isCurrentAdding = addingUserId === user._id;

                return (
                  <div
                    key={user._id}
                    className="w-full px-4 py-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                        {user.role && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                            {user.role}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onAddMember(user)}
                      disabled={isAdding}
                      className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isCurrentAdding ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <UserPlus className="w-3.5 h-3.5" />
                      )}
                      Add
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
