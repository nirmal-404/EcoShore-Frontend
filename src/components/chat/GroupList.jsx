import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserChatGroups } from '@/api/chatApi';
import { useSelector } from 'react-redux';
import { Users, Loader2, Plus, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateGroupModal } from './CreateGroupModal';

const TYPE_BADGE = {
  GLOBAL_VOLUNTEER: {
    label: 'Volunteer',
    color: 'bg-emerald-500/15 text-emerald-400',
  },
  ORGANIZER_PRIVATE: {
    label: 'Organizer',
    color: 'bg-purple-500/15 text-purple-400',
  },
  EVENT_GROUP: { label: 'Event', color: 'bg-blue-500/15 text-blue-400' },
};

export function GroupList({ selectedGroupId, onSelectGroup }) {
  const { user } = useSelector((state) => state.auth);
  const [showCreate, setShowCreate] = useState(false);

  const canCreateGroup = user?.role === 'organizer' || user?.role === 'admin';

  const { data, isLoading, error } = useQuery({
    queryKey: ['chat-groups'],
    queryFn: getUserChatGroups,
  });

  const groups = data?.data || [];

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-border/50 bg-secondary/5 flex items-center justify-between shrink-0">
        <h2 className="text-[15px] font-bold flex items-center gap-2 text-foreground">
          <MessageSquare className="w-4 h-4 text-primary" />
          My Chats
          {groups.length > 0 && (
            <span className="text-[11px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {groups.length}
            </span>
          )}
        </h2>
        {canCreateGroup && (
          <button
            onClick={() => setShowCreate((v) => !v)}
            title="Create new group"
            className={cn(
              'p-1.5 rounded-lg transition-all duration-200',
              showCreate
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-primary hover:bg-secondary/50'
            )}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Create Group Panel */}
      <CreateGroupModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
      />

      {/* Group List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-7 h-7 animate-spin text-primary/60" />
          </div>
        ) : error ? (
          <div className="text-center text-sm text-destructive/80 bg-destructive/5 rounded-xl p-4 m-2 border border-destructive/10">
            Failed to load groups.
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center p-6 mt-4">
            <div className="w-14 h-14 rounded-full bg-primary/8 flex items-center justify-center mx-auto mb-3">
              <Users className="w-7 h-7 text-primary/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              No chats yet
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1 leading-relaxed">
              {canCreateGroup
                ? 'Create a group to start coordinating.'
                : 'Join an event to get added to a chat group.'}
            </p>
          </div>
        ) : (
          groups.map((group) => {
            const badge = TYPE_BADGE[group.type] || TYPE_BADGE.GLOBAL_VOLUNTEER;
            const isSelected = selectedGroupId === group._id;
            return (
              <button
                key={group._id}
                onClick={() => onSelectGroup(group._id)}
                className={cn(
                  'w-full text-left p-3 flex items-center gap-3 rounded-xl transition-all duration-200 group',
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'hover:bg-secondary/30 text-foreground'
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm',
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-gradient-to-tr from-primary/70 to-primary/40 text-primary-foreground'
                  )}
                >
                  {group.name?.charAt(0)?.toUpperCase() || '?'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[14px] leading-tight truncate">
                      {group.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={cn(
                        'text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full',
                        isSelected ? 'bg-white/20 text-white' : badge.color
                      )}
                    >
                      {badge.label}
                    </span>
                    <span
                      className={cn(
                        'text-[11px] truncate',
                        isSelected
                          ? 'text-primary-foreground/70'
                          : 'text-muted-foreground'
                      )}
                    >
                      {group.members?.length ?? 0} members
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
