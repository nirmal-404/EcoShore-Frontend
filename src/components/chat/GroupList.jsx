import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserChatGroups } from '@/api/chatApi';
import { useSelector } from 'react-redux';
import { Users, Loader2, Plus, MessageSquare, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreateGroupModal } from './CreateGroupModal';

const TYPE_TABS = ['All', 'Event', 'Volunteer', 'Organizer'];

function avatarColor(name = '') {
  const palette = ['#605DFF', '#FF6B6B', '#FFB347', '#4ECDC4', '#A78BFA', '#34D399', '#F472B6'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % palette.length;
  return palette[h];
}

function typeLabel(type) {
  if (type === 'EVENT_GROUP') return 'Event';
  if (type === 'ORGANIZER_PRIVATE') return 'Organizer';
  return 'Volunteer';
}

export function GroupList({ selectedGroupId, onSelectGroup }) {
  const { user } = useSelector((s) => s.auth);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const canCreateGroup = user?.role === 'organizer' || user?.role === 'admin';

  const { data, isLoading, error } = useQuery({
    queryKey: ['chat-groups'],
    queryFn: getUserChatGroups,
  });

  let groups = data?.data || [];

  // Filter by tab
  if (activeTab !== 'All') {
    groups = groups.filter((g) => typeLabel(g.type) === activeTab);
  }

  // Filter by search
  if (search.trim()) {
    groups = groups.filter((g) => g.name?.toLowerCase().includes(search.toLowerCase()));
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#605DFF]" />
            My Chats
          </h2>
          {canCreateGroup && (
            <button
              onClick={() => setShowCreate((v) => !v)}
              title="Create new group"
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                showCreate
                  ? 'bg-[#605DFF] text-white shadow'
                  : 'bg-gray-100 text-gray-500 hover:bg-[#605DFF]/10 hover:text-[#605DFF]'
              )}
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-100 rounded-full pl-9 pr-4 py-2 text-[14px] text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#605DFF]/30 transition"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 px-5 pb-2 shrink-0 border-b border-gray-100">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'text-[13px] font-semibold pb-2 border-b-2 transition-colors',
              activeTab === tab
                ? 'text-[#605DFF] border-[#605DFF]'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            )}
          >
            {tab}
            {tab === 'All' && (data?.data?.length ?? 0) > 0 && (
              <span className="ml-1.5 bg-[#605DFF] text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                {data.data.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Create Group Panel */}
      <CreateGroupModal isOpen={showCreate} onClose={() => setShowCreate(false)} />

      {/* List */}
      <div className="flex-1 overflow-y-auto py-1">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-7 h-7 animate-spin text-[#605DFF]/60" />
          </div>
        ) : error ? (
          <div className="text-center text-sm text-red-500 p-4">Failed to load groups.</div>
        ) : groups.length === 0 ? (
          <div className="text-center p-8 mt-4">
            <div className="w-14 h-14 rounded-full bg-[#605DFF]/10 flex items-center justify-center mx-auto mb-3">
              <Users className="w-7 h-7 text-[#605DFF]/40" />
            </div>
            <p className="text-sm font-medium text-gray-500">
              {search ? 'No results found' : canCreateGroup ? 'Create a group to start.' : 'Join an event to get added.'}
            </p>
          </div>
        ) : (
          groups.map((group) => {
            const isSelected = selectedGroupId === group._id;
            const bg = avatarColor(group.name);
            return (
              <button
                key={group._id}
                onClick={() => onSelectGroup(group._id)}
                className={cn(
                  'w-full text-left px-4 py-3 flex items-center gap-3 transition-all',
                  isSelected ? 'bg-[#605DFF]/8 border-l-[3px] border-[#605DFF]' : 'hover:bg-gray-50 border-l-[3px] border-transparent'
                )}
              >
                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-[15px] text-white shrink-0 shadow-sm"
                  style={{ background: bg }}
                >
                  {group.name?.charAt(0)?.toUpperCase() || '?'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={cn('font-semibold text-[14px] truncate', isSelected ? 'text-[#605DFF]' : 'text-gray-900')}>
                      {group.name}
                    </span>
                    <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-400 truncate mt-0.5">
                    {group.members?.length ?? 0} members · {typeLabel(group.type)}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
