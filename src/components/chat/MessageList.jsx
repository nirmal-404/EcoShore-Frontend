import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMessages } from '@/api/chatApi';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';

function avatarColor(name = '') {
  const colors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-violet-500',
    'bg-rose-500', 'bg-amber-500', 'bg-cyan-500', 'bg-pink-500',
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % colors.length;
  return colors[h];
}

function groupByDate(messages) {
  const groups = [];
  let currentDate = null;
  messages.forEach((msg) => {
    const d = new Date(msg.createdAt).toLocaleDateString(undefined, {
      day: 'numeric', month: 'short', year: 'numeric',
    });
    if (d !== currentDate) {
      currentDate = d;
      groups.push({ type: 'date', label: d });
    }
    groups.push({ type: 'message', msg });
  });
  return groups;
}

export function MessageList({ groupId }) {
  const { user } = useSelector((s) => s.auth);
  const scrollRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ['chat-messages', groupId],
    queryFn: () => getMessages(groupId, { limit: 100 }),
    enabled: !!groupId,
    refetchInterval: 3000,
  });

  const rawData = data?.data;
  const messages = Array.isArray(rawData) ? rawData : rawData?.messages || [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!groupId) return null;

  if (isLoading && messages.length === 0) {
    return (
      <div className="w-full h-full flex justify-center items-center bg-white dark:bg-gray-800">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const items = groupByDate(messages);

  return (
    <div
      ref={scrollRef}
      className="w-full h-full overflow-y-auto overflow-x-hidden px-4 md:px-6 py-4 bg-white dark:bg-gray-800 flex flex-col gap-4"
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 rounded-full text-sm text-gray-600 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-600">
            No messages yet. Start the conversation! 👋
          </div>
        </div>
      ) : (
        items.map((item, idx) => {
          if (item.type === 'date') {
            return (
              <div key={`date-${idx}`} className="flex items-center justify-center my-2">
                <span className="bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 font-medium px-3 py-1 rounded-full shadow-sm border border-gray-200 dark:border-gray-600">
                  {item.label}
                </span>
              </div>
            );
          }

          const msg = item.msg;
          const senderIdStr = typeof msg.senderId === 'object' ? msg.senderId?._id?.toString() : msg.senderId?.toString();
          const senderName = typeof msg.senderId === 'object' ? msg.senderId?.name : null;
          const myId = user?.id?.toString() || user?._id?.toString();
          const isMine = !!myId && senderIdStr === myId;

          const prevItem = items[idx - 1];
          const prevSenderId = prevItem?.type === 'message'
            ? (typeof prevItem.msg.senderId === 'object' ? prevItem.msg.senderId?._id?.toString() : prevItem.msg.senderId?.toString())
            : null;
          const isFirstInGroup = prevItem?.type !== 'message' || prevSenderId !== senderIdStr;

          const timeStr = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <div
              key={msg._id || msg.id || idx}
              className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              {!isMine && isFirstInGroup && (
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${avatarColor(senderName || '')}`}
                >
                  {(senderName || 'U').slice(0, 2).toUpperCase()}
                </div>
              )}
              {!isMine && !isFirstInGroup && <div className="w-8 shrink-0" />}

              <div className={`flex flex-col max-w-xs lg:max-w-md ${isMine ? 'items-end' : 'items-start'}`}>
                {/* Sender name */}
                {!isMine && isFirstInGroup && (
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold ml-1 mb-1">
                    {senderName || 'User'}
                  </span>
                )}

                {/* Message bubble */}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${isMine
                      ? 'bg-blue-600 dark:bg-blue-500 text-white rounded-br-none'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-none'
                    } shadow-sm`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span className={`text-xs mt-1 block ${isMine ? 'text-blue-100 dark:text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
                    {timeStr}
                  </span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
