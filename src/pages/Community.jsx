import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getPosts } from '@/api/communityApi';
import { getUserChatGroups } from '@/api/chatApi';
import { PostCard } from '@/components/community/PostCard';
import { CreatePostModal } from '@/components/community/CreatePostModal';
import ChatApp from '@/pages/chat/ChatApp';
import { Loader2, Users, MessageSquare, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

/* ── helpers ─────────────────────────────────────────────────────── */
function avatarColor(name = '') {
  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500', 'bg-pink-500'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % colors.length;
  return colors[h];
}

/* ── Left sidebar (profile card) ────────────────────────────────── */
function LeftSidebar({ user, onOpenChat }) {
  return (
    <aside className="hidden lg:flex flex-col gap-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 space-y-2">
        <button
          onClick={onOpenChat}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition w-full text-left"
        >
          <span className="text-lg">💬</span>
          Chats
        </button>
        {[
          { icon: '🗓️', label: 'Events', href: '/events' },
          { icon: '🏖️', label: 'Beaches', href: '/beaches' },
        ].map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>


    </aside>
  );
}

/* ── Right sidebar (Profile View) ──────────── */
function RightSidebar({ user }) {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['chat-groups'],
    queryFn: getUserChatGroups,
    enabled: !!user,
  });
  const groups = data?.data || [];

  return (
    <aside className="hidden lg:flex flex-col gap-6">
      {/* PROFILE VIEW */}
      {user && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <div className="text-center mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold ${avatarColor(user.name)} mx-auto mb-3`}>
              {user.name?.slice(0, 2).toUpperCase() || '??'}
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{user.name}</h3>
            {user.role && (
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mt-1">{user.role}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 text-center border-t border-gray-200 dark:border-gray-700 pt-4">
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">0</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Posts</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">0</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Followers</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">0</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Following</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/profile')}
            className="w-full mt-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition"
          >
            View Profile
          </button>
        </div>
      )}



      {!user && (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 text-center">
          <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-3">Connect with your community</p>
          <a href="/login" className="block w-full py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition">
            Log In
          </a>
          <a href="/register" className="block w-full mt-2 py-2 bg-green-500 text-white text-sm font-bold rounded-lg hover:bg-green-600 transition">
            Create Account
          </a>
        </div>
      )}
    </aside>
  );
}

/* ══════ Main Community Page ════════════════════════════════════ */
export default function Community() {
  const [page, setPage] = useState(1);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user } = useSelector((s) => s.auth);

  const { data, isLoading, error } = useQuery({
    queryKey: ['community-posts', page],
    queryFn: () => getPosts({ page, limit: 10 }),
    keepPreviousData: true,
  });

  const posts = data?.data?.posts || [];
  const pagination = data?.data?.pagination || { page: 1, pages: 1 };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 pt-4">
      {/* ── Three-column layout ── */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6">

          {/* Left sidebar */}
          <div className="sticky top-4 h-fit">
            <LeftSidebar user={user} onOpenChat={() => setIsChatOpen(true)} />
          </div>

          {/* Center feed */}
          <main className="space-y-4 min-w-0">
            {/* Create Post */}
            <CreatePostModal />

            {/* Posts */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
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
                <h3 className="text-lg font-bold text-gray-900 mb-1">It's quiet here…</h3>
                <p className="text-gray-500 text-sm">Be the first to share an update with the community!</p>
              </div>
            ) : (
              <>
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
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
                      onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
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
          <div className="sticky top-4 h-fit">
            <RightSidebar user={user} />
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      <ChatApp isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
