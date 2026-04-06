import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getPosts } from '@/services/api';
import { getUserChatGroups } from '@/api/chatApi';
import { getMyMeetings } from '@/api/meetingsApi';
import PostCard from '@/components/PostCard';
import PostCreate from '@/components/PostCreate';
import ChatApp from '@/pages/chat/ChatApp';
import {
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';

/* ── helpers ─────────────────────────────────────────────────────── */
function avatarColor(name = '') {
  const colors = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-violet-500',
    'bg-rose-500',
    'bg-amber-500',
    'bg-cyan-500',
    'bg-pink-500',
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++)
    h = (h + name.charCodeAt(i)) % colors.length;
  return colors[h];
}

function formatChatTimestamp(timestamp) {
  if (!timestamp) {
    return '';
  }

  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatMeetingTimestamp(timestamp) {
  if (!timestamp) {
    return 'Instant meeting';
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function sortMeetingsForSidebar(meetings = []) {
  const statusPriority = {
    ongoing: 0,
    scheduled: 1,
    ended: 2,
  };

  const getTime = (meeting) =>
    new Date(
      meeting?.scheduledAt || meeting?.updatedAt || meeting?.createdAt || 0
    ).getTime();

  return [...meetings].sort((a, b) => {
    const priorityDiff =
      (statusPriority[a?.status] ?? Number.MAX_SAFE_INTEGER) -
      (statusPriority[b?.status] ?? Number.MAX_SAFE_INTEGER);

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    if (a?.status === 'scheduled') {
      return getTime(a) - getTime(b);
    }

    return getTime(b) - getTime(a);
  });
}

/* ── Left sidebar (Meetings quick panel) ────────────────────────── */
function LeftSidebar({ user }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-meetings'],
    queryFn: getMyMeetings,
    enabled: Boolean(user),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const topMeetings = sortMeetingsForSidebar(data || []).slice(0, 5);

  if (!user) {
    return null;
  }

  return (
    <aside className="hidden lg:flex flex-col gap-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 dark:text-white">Meetings</h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
            {topMeetings.length}
          </span>
        </div>

        {isLoading && (
          <div className="py-6 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500 py-4 text-center">
            Failed to load meetings.
          </p>
        )}

        {!isLoading && !error && topMeetings.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
            No meetings yet.
          </p>
        )}

        {!isLoading && !error && topMeetings.length > 0 && (
          <div className="space-y-2">
            {topMeetings.map((meeting) => {
              const isOngoing = meeting.status === 'ongoing';

              return (
                <div
                  key={meeting._id}
                  className="rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {meeting.title}
                    </p>
                    <span
                      className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full shrink-0 ${
                        meeting.status === 'ongoing'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : meeting.status === 'scheduled'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {meeting.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                    {formatMeetingTimestamp(meeting.scheduledAt)}
                  </p>

                  {isOngoing && (
                    <Link
                      to="/meetings"
                      state={{ autoJoinMeetingId: meeting._id }}
                      className="inline-flex mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Join now
                    </Link>
                  )}
                </div>
              );
            })}

            <Link
              to="/meetings"
              className="inline-flex text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white pt-1"
            >
              View all meetings
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}

/* ── Right sidebar (Chat List) ──────────── */
function RightSidebar({ user, onOpenConversation }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['community-sidebar-chat-groups'],
    queryFn: getUserChatGroups,
    enabled: !!user,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const chatGroups = data?.data || [];
  const recentChatGroups = [...chatGroups]
    .sort((a, b) => {
      const aTime = new Date(
        a?.lastMessage?.createdAt || a?.updatedAt || a?.createdAt || 0
      ).getTime();
      const bTime = new Date(
        b?.lastMessage?.createdAt || b?.updatedAt || b?.createdAt || 0
      ).getTime();
      return bTime - aTime;
    })
    .slice(0, 5);

  if (!user) {
    return null;
  }

  return (
    <aside className="hidden lg:flex flex-col gap-6">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 dark:text-white">Chats</h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
            {recentChatGroups.length}
          </span>
        </div>

        {isLoading && (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500 py-8 text-center">
            Failed to load chat list.
          </p>
        )}

        {!isLoading && !error && recentChatGroups.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
            No conversations yet.
          </p>
        )}

        {!isLoading && !error && recentChatGroups.length > 0 && (
          <div className="space-y-1 max-h-[28rem] overflow-y-auto pr-1">
            {recentChatGroups.map((group) => {
              const displayName = (
                group.displayName ||
                group.name ||
                'Chat'
              ).trim();
              const unreadCount = Number(group.unreadCount || 0);
              const lastMessage = group.lastMessage?.text || 'No messages yet';
              const lastMessageTime = formatChatTimestamp(
                group.lastMessage?.createdAt
              );

              return (
                <button
                  key={group._id}
                  onClick={() => onOpenConversation(group._id)}
                  className="w-full flex items-center gap-3 rounded-lg px-2.5 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-left"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${avatarColor(displayName)}`}
                  >
                    {displayName.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {displayName}
                      </p>
                      <span className="text-[11px] text-gray-400 shrink-0">
                        {lastMessageTime}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <p
                        className={`text-xs truncate ${unreadCount > 0 ? 'text-gray-700 dark:text-gray-200 font-medium' : 'text-gray-500 dark:text-gray-400'}`}
                      >
                        {lastMessage}
                      </p>
                      {unreadCount > 0 && (
                        <span className="min-w-5 h-5 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}

/* ══════ Main Community Page ════════════════════════════════════ */
export default function Community() {
  const [page, setPage] = useState(1);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatLaunchMode, setChatLaunchMode] = useState('full');
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const { user } = useSelector((s) => s.auth);
  const feedScope = user ? 'all' : 'public';

  const { data, isLoading, error } = useQuery({
    queryKey: ['posts', feedScope, page],
    queryFn: () =>
      getPosts({
        page,
        limit: 10,
        visibility: user ? undefined : 'public',
      }),
    keepPreviousData: true,
  });

  const posts = data?.data?.posts || [];
  const pagination = data?.data?.pagination || { page: 1, pages: 1 };

  const openConversationOnly = (groupId) => {
    setChatLaunchMode('conversation-only');
    setSelectedConversationId(groupId);
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setChatLaunchMode('full');
    setSelectedConversationId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 pt-4">
      {/* ── Three-column layout ── */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6">
          {/* Left sidebar */}
          {user && (
            <div className="sticky top-4 h-fit">
              <LeftSidebar user={user} />
            </div>
          )}
          {!user && <div className="hidden lg:block" aria-hidden="true" />}

          {/* Center feed */}
          <main className="space-y-4 min-w-0">
            {/* Create Post */}
            {user && <PostCreate />}

            {/* Posts */}
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <PostCard key={`post-skeleton-${index}`} loading />
                ))}
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow p-8 text-center text-red-500 font-medium">
                Failed to load posts. Please try again later.
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  It's quiet here…
                </h3>
                <p className="text-gray-500 text-sm">
                  {user
                    ? 'Be the first to share an update with the community!'
                    : 'No public posts yet.'}
                </p>
              </div>
            ) : (
              <>
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    showActions={Boolean(user)}
                  />
                ))}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-3 py-4">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <span className="text-sm font-medium text-gray-500">
                      Page {page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(pagination.pages, p + 1))
                      }
                      disabled={page === pagination.pages}
                      className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>

          {/* Right sidebar */}
          {user && (
            <div className="sticky top-4 h-fit">
              <RightSidebar
                user={user}
                onOpenConversation={openConversationOnly}
              />
            </div>
          )}
          {!user && <div className="hidden lg:block" aria-hidden="true" />}
        </div>
      </div>

      {/* Chat Modal */}
      {user && (
        <ChatApp
          isOpen={isChatOpen}
          onOpen={() => setIsChatOpen(true)}
          onClose={closeChat}
          showFloatingButton={Boolean(user)}
          initialSelectedGroupId={selectedConversationId}
          hideConversationList={chatLaunchMode === 'conversation-only'}
        />
      )}
    </div>
  );
}
