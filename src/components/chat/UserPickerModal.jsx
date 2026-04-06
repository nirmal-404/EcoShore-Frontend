import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllUsers, createChatGroup } from '@/api/chatApi';
import { X, Search, Loader2, MessageSquare } from 'lucide-react';

export function UserPickerModal({ isOpen, onClose, onUserSelected }) {
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);

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

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  }, [users, search]);

  const handleSelectUser = (user) => {
    setSelectedUserId(user._id);
    // Small delay to show selection state before closing
    setTimeout(() => {
      onUserSelected(user);
      setSelectedUserId(null);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-md w-full max-h-96 flex flex-col border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Start Direct Chat
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Search */}
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
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              autoFocus
            />
          </div>
        </div>

        {/* Users List */}
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
          ) : filtered.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
              No users found
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleSelectUser(user)}
                  disabled={selectedUserId !== null}
                  className={`w-full px-4 py-3 transition-colors flex items-center justify-between group ${
                    selectedUserId === user._id
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  } ${selectedUserId !== null && selectedUserId !== user._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {user.name?.slice(0, 2).toUpperCase() || 'U'}
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
                  {selectedUserId === user._id ? (
                    <Loader2
                      size={18}
                      className="text-blue-600 dark:text-blue-400 animate-spin shrink-0 ml-2"
                    />
                  ) : (
                    <MessageSquare
                      size={18}
                      className="text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0 ml-2"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
