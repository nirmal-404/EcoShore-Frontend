import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUserChatGroups } from '@/api/chatApi';

export function GroupList({ selectedGroupId, onSelectGroup, searchTerm = '', chatFilter = 'all' }) {
  const { user } = useSelector((s) => s.auth);

  const { data, isLoading, error } = useQuery({
    queryKey: ['chat-groups'],
    queryFn: getUserChatGroups,
  });

  let groups = data?.data || [];

  // Search filter
  if (searchTerm.trim()) {
    groups = groups.filter((g) =>
      g.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Filter by unread and favorites
  if (chatFilter === 'unread') {
    groups = groups.filter((g) => (g.unreadCount || 0) > 0);
  } else if (chatFilter === 'favorites') {
    // Could add favorites logic here if available in group data
    groups = groups.filter((g) => g.isFavorite === true);
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-1">

        {isLoading && (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-blue-600" />
          </div>
        )}

        {error && (
          <p className="text-center text-red-500 py-4">
            Failed to load chats
          </p>
        )}

        {!isLoading && groups.length === 0 && (
          <p className="text-center text-gray-500 py-6">
            No chats available
          </p>
        )}

        {groups.map((group) => {
          const isSelected = selectedGroupId === group._id;

          const lastMessage = group.lastMessage?.text || "No messages yet";
          const lastTime = group.lastMessage?.createdAt;
          const unread = group.unreadCount || 0;

          // Avatar color generator
          const colors = [
            'bg-blue-500',
            'bg-green-500',
            'bg-purple-500',
            'bg-pink-500',
            'bg-yellow-500',
          ];

          let hash = 0;
          for (let i = 0; i < group.name.length; i++) {
            hash = group.name.charCodeAt(i) + ((hash << 5) - hash);
          }
          const bg = colors[Math.abs(hash) % colors.length];

          return (
            <button
              key={group._id}
              onClick={() => onSelectGroup(group._id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 mx-1 transition-all duration-200 rounded-xl border border-transparent',
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
              )}
            >

              {/* Avatar */}
              <div className="relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${bg}`}>
                  {group.name?.charAt(0)?.toUpperCase()}
                </div>

                {/* Online indicator */}
                {group.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">

                {/* Top row */}
                <div className="flex justify-between items-center">
                  <p className={cn(
                    "text-sm font-semibold truncate",
                    isSelected
                      ? "text-blue-600"
                      : "text-gray-900 dark:text-white"
                  )}>
                    {group.name}
                  </p>

                  {/* Time */}
                  {lastTime && (
                    <span className="text-xs text-gray-400">
                      {new Date(lastTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>

                {/* Bottom row */}
                <div className="flex justify-between items-center mt-1">

                  {/* Last message */}
                  <p className="text-xs text-gray-500 truncate">
                    {lastMessage}
                  </p>

                  {/* Unread badge */}
                  {unread > 0 && (
                    <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}