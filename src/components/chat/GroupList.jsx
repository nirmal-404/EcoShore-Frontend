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
    <div className="flex flex-col h-full bg-gray-800 dark:bg-gray-800">
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">

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
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                isSelected
                  ? 'bg-gray-700/60 dark:bg-gray-700/60'
                  : 'hover:bg-gray-700/40 dark:hover:bg-gray-700/40'
              }`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${bg}`}>
                  {group.name?.charAt(0)?.toUpperCase()}
                </div>

                {/* Online indicator */}
                {group.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 dark:border-gray-800 rounded-full"></span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Top row - Name and Time */}
                <div className="flex justify-between items-baseline gap-2">
                  <p className="text-sm font-bold text-white truncate">
                    {group.name}
                  </p>
                  {lastTime && (
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(lastTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>

                {/* Bottom row - Last message */}
                <p className="text-xs text-gray-400 truncate mt-1">
                  {lastMessage}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}