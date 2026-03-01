import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getChatGroupById } from '@/api/chatApi';
import { Loader2, Info, PanelLeftOpen, Waves } from 'lucide-react';
import { GroupList } from '@/components/chat/GroupList';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { cn } from '@/lib/utils';

const TYPE_BADGE = {
    GLOBAL_VOLUNTEER: { label: 'Global Volunteer', color: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20' },
    ORGANIZER_PRIVATE: { label: 'Organizer Private', color: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
    EVENT_GROUP: { label: 'Event Group', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
};

export default function ChatApp() {
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { data: activeGroupData, isLoading: isLoadingGroup } = useQuery({
        queryKey: ['chat-group-details', selectedGroupId],
        queryFn: () => getChatGroupById(selectedGroupId),
        enabled: !!selectedGroupId,
    });

    const activeGroup = activeGroupData?.data;
    const typeBadge = TYPE_BADGE[activeGroup?.type] || TYPE_BADGE.GLOBAL_VOLUNTEER;

    const handleSelectGroup = (id) => {
        setSelectedGroupId(id);
        setSidebarOpen(false); // close mobile sidebar after selecting
    };

    return (
        <div className="flex h-full bg-background overflow-hidden relative">

            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={cn(
                'w-80 flex-shrink-0 flex flex-col border-r border-border/50 transition-all duration-300',
                // Desktop: always visible, part of normal flow
                'md:relative md:translate-x-0 md:z-auto md:flex',
                // Mobile: slide in/out over the page
                sidebarOpen
                    ? 'fixed top-[73px] bottom-0 left-0 z-30 translate-x-0 shadow-2xl'
                    : 'fixed top-[73px] bottom-0 left-0 z-30 -translate-x-full md:translate-x-0'
            )}>
                <GroupList
                    selectedGroupId={selectedGroupId}
                    onSelectGroup={handleSelectGroup}
                />
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden">
                {selectedGroupId && activeGroup ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-[68px] flex items-center justify-between px-4 md:px-6 border-b border-border/50 bg-card/80 backdrop-blur-md z-10 shrink-0 shadow-sm gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                {/* Mobile toggle */}
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors -ml-1 mr-1 shrink-0"
                                >
                                    <PanelLeftOpen className="w-5 h-5" />
                                </button>

                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary/60 flex items-center justify-center font-bold text-white text-base shadow-md shrink-0">
                                    {activeGroup.name?.charAt(0) || '?'}
                                </div>

                                <div className="min-w-0">
                                    <h2 className="font-bold text-foreground text-[16px] leading-tight truncate">
                                        {activeGroup.name}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                        <span className={cn(
                                            'text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border',
                                            typeBadge.color
                                        )}>
                                            {typeBadge.label}
                                        </span>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                                            {activeGroup.members?.length || 0} members
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button className="p-2 text-muted-foreground hover:bg-secondary/50 rounded-full transition-colors shrink-0">
                                <Info className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <MessageList groupId={selectedGroupId} />

                        {/* Input */}
                        <MessageInput groupId={selectedGroupId} />
                    </>
                ) : (
                    /* Empty State */
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        {/* Mobile sidebar toggle in empty state */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden absolute top-4 left-4 p-2 rounded-lg text-muted-foreground hover:bg-secondary/50 transition-colors"
                        >
                            <PanelLeftOpen className="w-5 h-5" />
                        </button>

                        <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-lg shadow-primary/5">
                            <Waves className="w-10 h-10 text-primary/60" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to EcoChat</h2>
                        <p className="max-w-sm text-muted-foreground text-[15px] leading-relaxed">
                            Select a group from the sidebar to coordinate cleanups, share updates, and connect with fellow volunteers.
                        </p>
                        <p className="text-xs text-muted-foreground/50 mt-6 md:hidden">
                            Tap the <span className="font-semibold">☰</span> icon to browse your groups
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
