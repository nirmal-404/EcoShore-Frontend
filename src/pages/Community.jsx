import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getPosts } from '@/api/communityApi';
import { getUserChatGroups } from '@/api/chatApi';
import { useSelector } from 'react-redux';
import { PostCard } from '@/components/community/PostCard';
import { CreatePostModal } from '@/components/community/CreatePostModal';
import {
  Loader2,
  Users,
  MessageSquare,
  BookOpen,
  ArrowRight,
  Waves,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TYPE_BADGE = {
  GLOBAL_VOLUNTEER: {
    label: 'Volunteer',
    color: 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20',
  },
  ORGANIZER_PRIVATE: {
    label: 'Organizer',
    color: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
  },
  EVENT_GROUP: {
    label: 'Event',
    color: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  },
};

function GroupChatsTab() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const { data, isLoading, error } = useQuery({
    queryKey: ['chat-groups'],
    queryFn: getUserChatGroups,
    enabled: !!user,
  });

  const groups = data?.data || [];

  if (!user) {
    return (
      <div className="text-center py-14 bg-secondary/10 rounded-3xl border border-dashed border-border/60">
        <MessageSquare className="w-14 h-14 text-muted-foreground/25 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-foreground">
          Sign in to access group chats
        </h3>
        <p className="text-muted-foreground mt-2 font-medium">
          Group chats are available for registered volunteers and organizers.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary/60" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 bg-destructive/5 rounded-2xl border border-destructive/10 text-destructive/80 font-medium">
        Failed to load groups. Please try again later.
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-16 bg-secondary/5 rounded-3xl border border-dashed border-border/60">
        <div className="w-16 h-16 rounded-full bg-primary/8 flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-primary/35" />
        </div>
        <h3 className="text-xl font-bold text-foreground">No groups yet</h3>
        <p className="text-muted-foreground mt-2 font-medium max-w-sm mx-auto text-sm leading-relaxed">
          Group chats are automatically created for events you join. Check back
          after registering for a cleanup!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-4">
        {groups.length} group{groups.length !== 1 ? 's' : ''} you're part of
      </p>
      {groups.map((group) => {
        const badge = TYPE_BADGE[group.type] || TYPE_BADGE.GLOBAL_VOLUNTEER;
        return (
          <button
            key={group._id}
            onClick={() => navigate('/chat')}
            className="w-full flex items-center gap-4 p-4 bg-card/60 hover:bg-card border border-border/50 hover:border-primary/30 rounded-2xl text-left transition-all duration-200 group shadow-sm hover:shadow-md"
          >
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary/70 to-primary/40 flex items-center justify-center font-bold text-white text-lg shrink-0 shadow-inner">
              {group.name?.charAt(0)?.toUpperCase() || '?'}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-[15px] truncate">
                {group.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full',
                    badge.color
                  )}
                >
                  {badge.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {group.members?.length ?? 0} members
                </span>
                {group.description && (
                  <span className="text-xs text-muted-foreground/60 truncate hidden sm:block">
                    · {group.description}
                  </span>
                )}
              </div>
            </div>

            {/* Arrow */}
            <div className="shrink-0 flex items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors">
              <span className="text-xs font-medium hidden sm:block">
                Open Chat
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        );
      })}

      {/* CTA */}
      <div className="pt-4 text-center">
        <button
          onClick={() => navigate('/chat')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md hover:shadow-primary/20"
        >
          <MessageSquare className="w-4 h-4" />
          Open Full Chat View
        </button>
      </div>
    </div>
  );
}

export default function Community() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('posts');

  const { data, isLoading, error } = useQuery({
    queryKey: ['community-posts', page],
    queryFn: () => getPosts({ page, limit: 10 }),
    keepPreviousData: true,
    enabled: activeTab === 'posts',
  });

  const posts = data?.data?.posts || [];
  const pagination = data?.data?.pagination || { page: 1, pages: 1 };

  const TABS = [
    { id: 'posts', label: 'Posts', icon: BookOpen },
    { id: 'groups', label: 'Group Chats', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-secondary/5 pt-28 pb-16 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-2 border border-primary/20 shadow-sm text-primary">
            <Users className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground italic">
            Community Hub
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto font-medium leading-relaxed">
            Connect, share updates, and inspire others through environmental
            action.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-secondary/20 border border-border/40 rounded-2xl max-w-xs mx-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-semibold transition-all duration-200',
                  activeTab === tab.id
                    ? 'bg-background text-foreground shadow-sm border border-border/40'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {/* Create Post */}
            <CreatePostModal />

            {/* Feed */}
            <div className="space-y-6 max-w-2xl mx-auto">
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center text-destructive py-10 bg-destructive/5 rounded-2xl border border-destructive/20 font-medium">
                  Failed to load community posts. Please try again later.
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border/60">
                  <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground">
                    It's quiet here...
                  </h3>
                  <p className="text-muted-foreground mt-2 font-medium">
                    Be the first to share an update with the community!
                  </p>
                </div>
              ) : (
                <>
                  {posts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}

                  {pagination.pages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-10 p-4 bg-card/30 rounded-2xl backdrop-blur-sm border border-border/50 w-full">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-6 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-bold hover:bg-secondary/80 disabled:opacity-50 transition-colors"
                      >
                        Previous
                      </button>
                      <span className="text-sm font-semibold text-muted-foreground px-4 bg-card py-2 rounded-lg border border-border/50">
                        Page {page} of {pagination.pages}
                      </span>
                      <button
                        onClick={() =>
                          setPage((p) => Math.min(pagination.pages, p + 1))
                        }
                        disabled={page === pagination.pages}
                        className="px-6 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-sm"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Group Chats Tab */}
        {activeTab === 'groups' && <GroupChatsTab />}
      </div>
    </div>
  );
}
