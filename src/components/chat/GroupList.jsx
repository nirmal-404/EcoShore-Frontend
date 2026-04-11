import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Archive, Loader2, Pin, Star, Trash2 } from 'lucide-react';
import { getUserChatGroups } from '@/api/chatApi';

const CHAT_GROUP_PREFERENCES_PREFIX = 'chat-group-preferences-v1';

function getPreferenceStorageKey(userId) {
  return `${CHAT_GROUP_PREFERENCES_PREFIX}:${userId || 'guest'}`;
}

function readGroupPreferences(userId) {
  if (!userId) {
    return {};
  }

  try {
    const raw = localStorage.getItem(getPreferenceStorageKey(userId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeGroupPreferences(userId, preferences) {
  if (!userId) {
    return;
  }

  try {
    localStorage.setItem(
      getPreferenceStorageKey(userId),
      JSON.stringify(preferences)
    );
  } catch {
    // Ignore localStorage failures (private mode/quota limits)
  }
}

export function GroupList({
  currentUserId,
  selectedGroupId,
  onSelectGroup,
  onDeleteGroup,
  deletingGroupId = null,
  searchTerm = '',
  chatFilter = 'all',
}) {
  const [groupPreferences, setGroupPreferences] = useState({});
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    setGroupPreferences(readGroupPreferences(currentUserId));
  }, [currentUserId]);

  useEffect(() => {
    writeGroupPreferences(currentUserId, groupPreferences);
  }, [currentUserId, groupPreferences]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['chat-groups'],
    queryFn: getUserChatGroups,
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  let groups = (data?.data || []).map((group) => {
    const preferences = groupPreferences[group._id] || {};
    const isOnline =
      group.type === 'DIRECT_MESSAGE'
        ? Boolean(group.recipientIsOnline)
        : Boolean(group.isOnline);

    return {
      ...group,
      isFavorite: preferences.isFavorite ?? group.isFavorite ?? false,
      isArchived: preferences.isArchived ?? false,
      isPinned: preferences.isPinned ?? false,
      isOnline,
    };
  });

  // Search filter
  if (searchTerm.trim()) {
    groups = groups.filter((g) => {
      const displayName = g.displayName || g.name || '';
      return displayName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }

  // Filter by unread/favorites/archive
  if (chatFilter === 'unread') {
    groups = groups.filter((g) => !g.isArchived && (g.unreadCount || 0) > 0);
  } else if (chatFilter === 'favorites') {
    groups = groups.filter((g) => !g.isArchived && g.isFavorite === true);
  } else if (chatFilter === 'archived') {
    groups = groups.filter((g) => g.isArchived === true);
  } else {
    groups = groups.filter((g) => !g.isArchived);
  }

  groups = [...groups].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }

    const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return bTime - aTime;
  });

  const toggleGroupPreference = (groupId, key) => {
    setGroupPreferences((prev) => ({
      ...prev,
      [groupId]: {
        ...(prev[groupId] || {}),
        [key]: !(prev[groupId]?.[key] || false),
      },
    }));
  };

  const handleOpenContextMenu = (event, group) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      group,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleTogglePinned = () => {
    if (!contextMenu?.group) {
      return;
    }

    toggleGroupPreference(contextMenu.group._id, 'isPinned');
    handleCloseContextMenu();
  };

  const handleToggleFavorite = () => {
    if (!contextMenu?.group) {
      return;
    }

    toggleGroupPreference(contextMenu.group._id, 'isFavorite');
    handleCloseContextMenu();
  };

  const handleToggleArchived = () => {
    if (!contextMenu?.group) {
      return;
    }

    const shouldArchive = !contextMenu.group.isArchived;
    toggleGroupPreference(contextMenu.group._id, 'isArchived');

    if (
      shouldArchive &&
      selectedGroupId === contextMenu.group._id &&
      chatFilter !== 'archived'
    ) {
      onSelectGroup(null);
    }

    handleCloseContextMenu();
  };

  const handleDeleteConversation = () => {
    if (!contextMenu?.group || !onDeleteGroup) {
      return;
    }

    onDeleteGroup(contextMenu.group);
    handleCloseContextMenu();
  };

  const menuPosition = (() => {
    if (!contextMenu) {
      return { left: 0, top: 0 };
    }

    const width = typeof window !== 'undefined' ? window.innerWidth : 0;
    const height = typeof window !== 'undefined' ? window.innerHeight : 0;
    const menuWidth = 220;
    const menuHeight = 210;

    return {
      left:
        width > 0
          ? Math.min(Math.max(contextMenu.x, 8), width - menuWidth)
          : contextMenu.x,
      top:
        height > 0
          ? Math.min(Math.max(contextMenu.y, 8), height - menuHeight)
          : contextMenu.y,
    };
  })();

  return (
    <div className="relative flex flex-col h-full bg-gray-50 dark:bg-gray-800">
      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        )}

        {error && (
          <p className="text-center text-red-500 dark:text-red-400 py-4">
            Failed to load chats
          </p>
        )}

        {!isLoading && groups.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-6">
            No chats available
          </p>
        )}

        {groups.map((group) => {
          const isSelected = selectedGroupId === group._id;
          const groupDisplayName = (
            group.displayName ||
            group.name ||
            'Chat'
          ).trim();

          const lastMessage = group.lastMessage?.text || 'No messages yet';
          const lastTime = group.lastMessage?.createdAt;
          const unreadCount = Number(group.unreadCount || 0);

          // Avatar color generator
          const colors = [
            'bg-blue-500',
            'bg-green-500',
            'bg-purple-500',
            'bg-pink-500',
            'bg-yellow-500',
          ];

          let hash = 0;
          for (let i = 0; i < groupDisplayName.length; i++) {
            hash = groupDisplayName.charCodeAt(i) + ((hash << 5) - hash);
          }
          const bg = colors[Math.abs(hash) % colors.length];

          return (
            <div
              key={group._id}
              onContextMenu={(event) => handleOpenContextMenu(event, group)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                isSelected
                  ? 'bg-blue-50 dark:bg-gray-700/60'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700/40'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectGroup(group._id)}
                className="flex items-center gap-3 min-w-0 flex-1 text-left"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${bg}`}
                  >
                    {groupDisplayName.charAt(0)?.toUpperCase()}
                  </div>

                  {/* Online indicator */}
                  {group.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Top row - Name and Time */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {groupDisplayName}
                      </p>
                      {group.isPinned && (
                        <Pin className="h-3.5 w-3.5 text-blue-500 dark:text-blue-300 shrink-0" />
                      )}
                      {group.isFavorite && (
                        <Star className="h-3.5 w-3.5 text-amber-500 dark:text-amber-300 shrink-0 fill-amber-500 dark:fill-amber-300" />
                      )}
                    </div>
                    {lastTime && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                        {new Date(lastTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>

                  {/* Bottom row - Last message */}
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p
                      className={`text-xs truncate min-w-0 flex-1 ${
                        unreadCount > 0
                          ? 'text-gray-700 dark:text-gray-100 font-medium'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {lastMessage}
                    </p>

                    {unreadCount > 0 && (
                      <span className="min-w-5 h-5 px-1 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {contextMenu && (
        <div
          className="fixed inset-0 z-50"
          onClick={handleCloseContextMenu}
          onContextMenu={(event) => {
            event.preventDefault();
            handleCloseContextMenu();
          }}
        >
          <div
            className="absolute w-52 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl py-1"
            style={{ left: menuPosition.left, top: menuPosition.top }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleTogglePinned}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Pin className="h-4 w-4" />
              {contextMenu.group.isPinned ? 'Unpin chat' : 'Pin chat'}
            </button>

            <button
              type="button"
              onClick={handleToggleFavorite}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Star className="h-4 w-4" />
              {contextMenu.group.isFavorite
                ? 'Remove from favorites'
                : 'Add to favorites'}
            </button>

            <button
              type="button"
              onClick={handleToggleArchived}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
            >
              <Archive className="h-4 w-4" />
              {contextMenu.group.isArchived ? 'Unarchive chat' : 'Archive chat'}
            </button>

            {onDeleteGroup && (
              <button
                type="button"
                onClick={handleDeleteConversation}
                disabled={deletingGroupId === contextMenu.group._id}
                className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deletingGroupId === contextMenu.group._id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete conversation
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
