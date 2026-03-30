import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getChatGroupById } from '@/api/chatApi';
import { Loader2, PanelLeftOpen, Share2, Search, MoreHorizontal, Waves } from 'lucide-react';
import { GroupList } from '@/components/chat/GroupList';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';

function avatarColor(name = '') {
  const palette = ['#605DFF', '#FF6B6B', '#FFB347', '#4ECDC4', '#A78BFA', '#34D399', '#F472B6'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % palette.length;
  return palette[h];
}

export default function ChatApp() {
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: activeGroupData, isLoading: isLoadingGroup } = useQuery({
    queryKey: ['chat-group-details', selectedGroupId],
    queryFn: () => getChatGroupById(selectedGroupId),
    enabled: !!selectedGroupId,
  });

  const activeGroup = activeGroupData?.data;

  const handleSelectGroup = (id) => {
    setSelectedGroupId(id);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-full overflow-hidden relative bg-[#f5f6fa]">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Left Sidebar ── */}
      <div
        className={[
          'w-[320px] flex-shrink-0 flex flex-col',
          'md:relative md:translate-x-0 md:z-auto',
          sidebarOpen
            ? 'fixed top-[60px] bottom-0 left-0 z-30 translate-x-0 shadow-2xl'
            : 'fixed top-[60px] bottom-0 left-0 z-30 -translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        <GroupList selectedGroupId={selectedGroupId} onSelectGroup={handleSelectGroup} />
      </div>

      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedGroupId && activeGroup ? (
          <>
            {/* Chat Header */}
            <div className="h-[64px] flex items-center justify-between px-5 bg-white border-b border-gray-100 shrink-0 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile toggle */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition -ml-1 mr-1 shrink-0"
                >
                  <PanelLeftOpen className="w-5 h-5" />
                </button>

                {/* Group avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-base shrink-0 shadow-sm"
                  style={{ background: avatarColor(activeGroup.name) }}
                >
                  {activeGroup.name?.charAt(0)?.toUpperCase() || '?'}
                </div>

                <div className="min-w-0">
                  <h2 className="font-bold text-[15px] text-gray-900 leading-tight truncate">
                    {activeGroup.name}
                  </h2>
                  <p className="text-[12px] text-gray-400 mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    {activeGroup.members?.length || 0} members
                  </p>
                </div>
              </div>

              {/* Right action icons — matching reference */}
              <div className="flex items-center gap-1 shrink-0">
                <button className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition">
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition">
                  <Search className="w-4 h-4" />
                </button>
                <button className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <MessageList groupId={selectedGroupId} />

            {/* Input */}
            <MessageInput groupId={selectedGroupId} />
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#f5f6fa]">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden absolute top-4 left-4 p-2 rounded-lg text-gray-400 hover:bg-white transition"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </button>

            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
              style={{ background: 'linear-gradient(135deg,#605DFF,#9b89ff)' }}
            >
              <Waves className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to EcoChat</h2>
            <p className="max-w-sm text-gray-500 text-[15px] leading-relaxed">
              Select a group from the sidebar to coordinate cleanups, share updates, and connect with fellow volunteers.
            </p>
            <p className="text-xs text-gray-400 mt-6 md:hidden">
              Tap <span className="font-semibold">☰</span> to browse your groups
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
