import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMessages } from '@/api/chatApi';
import { useSelector } from 'react-redux';
import { Loader2, CheckCheck } from 'lucide-react';

function avatarColor(name = '') {
  const palette = ['#605DFF', '#FF6B6B', '#FFB347', '#4ECDC4', '#A78BFA', '#34D399', '#F472B6'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % palette.length;
  return palette[h];
}

function groupByDate(messages) {
  const groups = [];
  let currentDate = null;
  messages.forEach((msg) => {
    const d = new Date(msg.createdAt).toLocaleDateString(undefined, {
      day: 'numeric', month: 'long', year: 'numeric',
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
      <div className="flex-1 flex justify-center items-center bg-[#f5f6fa]">
        <Loader2 className="w-8 h-8 animate-spin text-[#605DFF]" />
      </div>
    );
  }

  const items = groupByDate(messages);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-6 py-4 bg-[#f5f6fa] flex flex-col gap-0.5"
      style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #e8eaf0 1px, transparent 0)', backgroundSize: '24px 24px' }}
    >
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="bg-white px-5 py-2.5 rounded-full text-sm text-gray-500 shadow-sm border border-gray-200">
            No messages yet. Say hello! 👋
          </p>
        </div>
      ) : (
        items.map((item, idx) => {
          if (item.type === 'date') {
            return (
              <div key={`date-${idx}`} className="flex items-center justify-center my-4">
                <span className="bg-white/80 backdrop-blur-sm text-[11px] text-gray-400 font-medium px-4 py-1 rounded-full shadow-sm border border-gray-200">
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
              className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'} ${isFirstInGroup ? 'mt-3' : 'mt-0.5'}`}
            >
              {/* Other user avatar */}
              {!isMine && isFirstInGroup && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-sm mb-1"
                  style={{ background: avatarColor(senderName || '') }}
                >
                  {(senderName || 'U').slice(0, 2).toUpperCase()}
                </div>
              )}
              {!isMine && !isFirstInGroup && <div className="w-8 shrink-0" />}

              <div className={`flex flex-col max-w-[65%] ${isMine ? 'items-end' : 'items-start'}`}>
                {/* Sender name for others */}
                {!isMine && isFirstInGroup && (
                  <span className="text-[11px] text-gray-400 font-semibold ml-1 mb-1">
                    {senderName || 'User'}
                  </span>
                )}

                {/* Bubble */}
                <div
                  className={`relative px-4 py-2.5 text-[14px] leading-relaxed shadow-sm ${isMine
                      ? 'bg-[#605DFF] text-white rounded-2xl rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-sm'
                    }`}
                >
                  <span className="whitespace-pre-wrap break-words">{msg.text}</span>
                  {/* Inline timestamp + tick */}
                  <span className={`flex items-center gap-0.5 mt-1 ${isMine ? 'justify-end' : 'justify-end'}`}>
                    <span className={`text-[10px] ${isMine ? 'text-white/60' : 'text-gray-400'}`}>{timeStr}</span>
                    {isMine && <CheckCheck className="w-3 h-3 text-white/60" />}
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
