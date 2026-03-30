import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getPosts } from '@/api/communityApi';
import { getUserChatGroups } from '@/api/chatApi';
import { PostCard } from '@/components/community/PostCard';
import { CreatePostModal } from '@/components/community/CreatePostModal';
import { Loader2, Users, MessageSquare, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

/* ── helpers ─────────────────────────────────────────────────────── */
function avatarColor(name = '') {
  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-cyan-500', 'bg-pink-500'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % colors.length;
  return colors[h];
}

/* ── Left sidebar (profile card) ────────────────────────────────── */
function LeftSidebar({ user }) {
  return (
    <aside className="hidden lg:flex flex-col gap-4">
      {user ? (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${avatarColor(user.name)}`}>
              {user.name?.slice(0, 2).toUpperCase() || '??'}
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">Community Member</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-sm text-gray-500 mb-3">
            <a href="/login" className="text-blue-600 font-semibold hover:underline">Log in</a> to see your profile.
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4 space-y-2">
        {[
          { icon: '🌊', label: 'Community Feed', href: '#' },
          { icon: '💬', label: 'Group Chats', href: '/chat' },
          { icon: '🗓️', label: 'Events', href: '/events' },
          { icon: '🏖️', label: 'Beaches', href: '/beaches' },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-100 transition"
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-4 text-center">
        <p className="text-xs text-gray-400 font-medium">
          EchoShore · Privacy · Terms · Cookies · &copy; {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  );
}

/* ── Right sidebar (Trending / Groups / Contacts) ──────────── */
function RightSidebar({ user }) {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['chat-groups'],
    queryFn: getUserChatGroups,
    enabled: !!user,
  });
  const groups = data?.data || [];

  // Mock trending data
  const trending = [
    { tag: '#DESIGNSYSTEM', title: 'The Architectural Blueprint', posts: '1.2k posts today' },
    { tag: '#GROWTH', title: 'Community Engagement 101', posts: '850 posts today' },
    { tag: '#TECHTRENDS', title: 'React 19 Server Components', posts: '2.4k posts today' },
  ];

  // Mock contacts
  const contacts = [
    { id: 1, name: 'Mark Verdes', role: 'Product Designer' },
    { id: 2, name: 'Lydia Frost', role: 'Engineer' },
  ];

  // Mock recent activity
  const activity = [
    { type: 'joined', user: 'You', action: 'joined the Typography Masters community' },
    { type: 'liked', user: 'Elena R.', action: 'liked your post from 3 hours ago' },
  ];

  return (
    <aside className="hidden lg:flex flex-col gap-6">
      {/* TRENDING NOW */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-sm tracking-wide">TRENDING NOW</h3>
          <a href="#" className="text-blue-600 text-xs font-medium hover:underline">SEE ALL</a>
        </div>

        <div className="space-y-4">
          {trending.map((item, idx) => (
            <button
              key={idx}
              className="w-full text-left hover:bg-gray-50 p-2 rounded transition"
            >
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {item.tag}
              </p>
              <p className="text-sm font-bold text-gray-900 mb-1">{item.title}</p>
              <p className="text-xs text-gray-500">{item.posts}</p>
            </button>
          ))}
        </div>
      </div>

      {/* CONNECT */}
      {user && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-sm tracking-wide">CONNECT</h3>
            <a href="#" className="text-blue-600 text-xs font-medium hover:underline">VIEW ALL</a>
          </div>

          <div className="space-y-3">
            {contacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${avatarColor(contact.name)}`}>
                    {contact.name?.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{contact.name}</p>
                    <p className="text-xs text-gray-500">{contact.role}</p>
                  </div>
                </div>
                <button className="text-xs font-semibold text-gray-600 hover:text-blue-600 transition px-2 py-1">
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECENT ACTIVITY */}
      {user && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-bold text-gray-900 text-sm tracking-wide mb-4">RECENT ACTIVITY</h3>
          <div className="space-y-3">
            {activity.map((item, idx) => (
              <div key={idx} className="flex gap-3 text-sm">
                <span className="text-blue-600 font-semibold text-xs mt-1">●</span>
                <p className="text-gray-700">
                  <span className="font-semibold text-gray-900">{item.user}</span>
                  {' '}{item.action}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!user && (
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 font-medium mb-3">Connect with your community</p>
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
  const { user } = useSelector((s) => s.auth);

  const { data, isLoading, error } = useQuery({
    queryKey: ['community-posts', page],
    queryFn: () => getPosts({ page, limit: 10 }),
    keepPreviousData: true,
  });

  const posts = data?.data?.posts || [];
  const pagination = data?.data?.pagination || { page: 1, pages: 1 };

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      {/* ── Three-column layout ── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-6 items-start">

          {/* Left sidebar */}
          <LeftSidebar user={user} />

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
          <RightSidebar user={user} />
        </div>
      </div>
    </div>
  );
}
