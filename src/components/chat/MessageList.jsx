import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMessages } from '@/api/chatApi';
import { useSelector } from 'react-redux';
import { Loader2, MessageSquareOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MessageList({ groupId }) {
  const { user } = useSelector((state) => state.auth);
  const scrollRef = useRef(null);

  // Polling every 3 seconds for new messages
  const { data, isLoading } = useQuery({
    queryKey: ['chat-messages', groupId],
    queryFn: () => getMessages(groupId, { limit: 100 }),
    enabled: !!groupId,
    refetchInterval: 3000,
  });

  const rawData = data?.data;
  const messages = Array.isArray(rawData) ? rawData : rawData?.messages || [];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!groupId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-secondary/5">
        <MessageSquareOff className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg font-medium">Select a group to start chatting</p>
      </div>
    );
  }

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex justify-center items-center bg-secondary/5">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 bg-secondary/5 flex flex-col gap-1"
    >
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <p className="bg-background px-4 py-2 rounded-full text-sm shadow-sm border border-border/50">
            No messages yet. Say hello! 👋
          </p>
        </div>
      ) : (
        messages.map((msg, index) => {
          // senderId can be a plain string (Firebase) or a populated object (Mongoose)
          const senderIdStr =
            typeof msg.senderId === 'object'
              ? msg.senderId?._id?.toString()
              : msg.senderId?.toString();

          const senderName =
            typeof msg.senderId === 'object' ? msg.senderId?.name : null;

          // Compare against all known user ID formats
          const myId = user?.id?.toString() || user?._id?.toString();
          const isMine = !!myId && senderIdStr === myId;

          const prevMsg = messages[index - 1];
          const prevSenderId = prevMsg
            ? typeof prevMsg.senderId === 'object'
              ? prevMsg.senderId?._id?.toString()
              : prevMsg.senderId?.toString()
            : null;
          const isFirstInGroup = index === 0 || prevSenderId !== senderIdStr;

          // Small gap between consecutive messages from same sender, larger gap on new sender
          const topGap = isFirstInGroup ? 'mt-3' : 'mt-0.5';

          return (
            <div
              key={msg._id || msg.id || index}
              className={cn(
                'flex flex-col max-w-[72%]',
                topGap,
                isMine ? 'self-end items-end' : 'self-start items-start'
              )}
            >
              {/* Sender name — only for others, only first in group */}
              {isFirstInGroup && !isMine && (
                <span className="text-[11px] text-muted-foreground font-semibold ml-3 mb-1">
                  {senderName || 'User'}
                </span>
              )}

              {/* Message bubble */}
              <div
                className={cn(
                  'px-4 py-2.5 text-[15px] leading-relaxed shadow-sm',
                  isMine
                    ? // Current user — RIGHT side, blue bubble
                      'bg-blue-500 text-white rounded-2xl rounded-tr-sm'
                    : // Other users — LEFT side, white bubble
                      'bg-white dark:bg-card text-gray-900 dark:text-foreground border border-gray-100 dark:border-border/50 rounded-2xl rounded-tl-sm'
                )}
              >
                {msg.text}
              </div>

              {/* Timestamp */}
              <span
                className={cn(
                  'text-[10px] text-muted-foreground/70 mt-1',
                  isMine ? 'pr-1' : 'pl-1'
                )}
              >
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}
