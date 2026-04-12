import React, { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getMessages, markMessageSeen } from '@/api/chatApi';
import { useSelector } from 'react-redux';
import { Check, CheckCheck, Loader2 } from 'lucide-react';

function avatarColor(name = '') {
  const colors = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-violet-500',
    'bg-rose-500',
    'bg-amber-500',
    'bg-cyan-500',
    'bg-pink-500',
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++)
    h = (h + name.charCodeAt(i)) % colors.length;
  return colors[h];
}

function groupByDate(messages) {
  const groups = [];
  let currentDate = null;
  messages.forEach((msg) => {
    const d = new Date(msg.createdAt).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    if (d !== currentDate) {
      currentDate = d;
      groups.push({ type: 'date', label: d });
    }
    groups.push({ type: 'message', msg });
  });
  return groups;
}

export function MessageList({
  groupId,
  groupType = 'DIRECT_MESSAGE',
  memberNameMap = {},
}) {
  const { user } = useSelector((s) => s.auth);
  const scrollRef = useRef(null);
  const pendingSeenMessageIdsRef = useRef(new Set());
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['chat-messages', groupId],
    queryFn: () => getMessages(groupId, { limit: 100 }),
    enabled: !!groupId,
    refetchInterval: 3000,
  });

  const rawData = data?.data;
  const allMessages = Array.isArray(rawData)
    ? rawData
    : rawData?.messages || [];
  const messages = allMessages.filter(
    (msg) => !msg?.isSystemMessage && msg?.senderId !== 'SYSTEM'
  );
  const myId = user?.id?.toString() || user?._id?.toString();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!groupId || !myId || messages.length === 0) {
      return;
    }

    const unseenMessageIds = messages
      .filter((msg) => {
        const senderIdStr =
          typeof msg.senderId === 'object'
            ? msg.senderId?._id?.toString()
            : msg.senderId?.toString();

        if (!senderIdStr || senderIdStr === myId) {
          return false;
        }

        const messageId = msg.id || msg._id;
        if (!messageId || pendingSeenMessageIdsRef.current.has(messageId)) {
          return false;
        }

        const seenByIds = Array.isArray(msg.seenBy)
          ? msg.seenBy.map((seenId) => seenId?.toString?.() || String(seenId))
          : [];

        return !seenByIds.includes(myId);
      })
      .map((msg) => msg.id || msg._id);

    if (unseenMessageIds.length === 0) {
      return;
    }

    unseenMessageIds.forEach((messageId) => {
      pendingSeenMessageIdsRef.current.add(messageId);
    });

    Promise.allSettled(
      unseenMessageIds.map((messageId) => markMessageSeen(groupId, messageId))
    )
      .then(() => {
        queryClient.invalidateQueries(['chat-groups']);
        queryClient.invalidateQueries(['chat-messages', groupId]);
      })
      .finally(() => {
        unseenMessageIds.forEach((messageId) => {
          pendingSeenMessageIdsRef.current.delete(messageId);
        });
      });
  }, [groupId, myId, messages, queryClient]);

  if (!groupId) return null;

  if (isLoading && messages.length === 0) {
    return (
      <div className="w-full h-full flex justify-center items-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const items = groupByDate(messages);

  return (
    <div
      ref={scrollRef}
      className="w-full h-full overflow-y-auto overflow-x-hidden px-4 md:px-6 py-4 bg-gray-50 dark:bg-gray-900 flex flex-col gap-4"
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded-full text-sm text-gray-600 dark:text-gray-400 shadow-sm border border-gray-200 dark:border-gray-700">
            No messages yet
          </div>
        </div>
      ) : (
        items.map((item, idx) => {
          if (item.type === 'date') {
            return (
              <div
                key={`date-${idx}`}
                className="flex items-center justify-center my-2"
              >
                <span className="bg-white dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 font-medium px-3 py-1 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                  {item.label}
                </span>
              </div>
            );
          }

          const msg = item.msg;
          const senderIdStr =
            typeof msg.senderId === 'object'
              ? msg.senderId?._id?.toString()
              : msg.senderId?.toString();
          const isMine = !!myId && senderIdStr === myId;
          const isGroupChat = groupType !== 'DIRECT_MESSAGE';
          const senderName = (
            (typeof msg.senderId === 'object' ? msg.senderId?.name : null) ||
            memberNameMap[senderIdStr] ||
            ''
          ).trim();
          const avatarName = senderName || 'Member';
          const showSenderMeta = !isMine && isGroupChat;
          const seenByIds = Array.isArray(msg.seenBy)
            ? msg.seenBy.map((seenId) => seenId?.toString?.() || String(seenId))
            : [];
          const isSeenByRecipient =
            isMine && seenByIds.some((seenId) => seenId && seenId !== myId);

          const prevItem = items[idx - 1];
          const prevSenderId =
            prevItem?.type === 'message'
              ? typeof prevItem.msg.senderId === 'object'
                ? prevItem.msg.senderId?._id?.toString()
                : prevItem.msg.senderId?.toString()
              : null;
          const isFirstInGroup =
            prevItem?.type !== 'message' || prevSenderId !== senderIdStr;

          const timeStr = new Date(msg.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });
          const isCallEvent = msg.messageType === 'CALL_EVENT';

          if (isCallEvent) {
            return (
              <div
                key={msg._id || msg.id || idx}
                className="flex items-center justify-center"
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-white/90 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 px-3 py-1 text-xs text-gray-700 dark:text-gray-300">
                  <span>{msg.text || 'Voice call'}</span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {timeStr}
                  </span>
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg._id || msg.id || idx}
              className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              {showSenderMeta && isFirstInGroup && (
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${avatarColor(avatarName)}`}
                >
                  {avatarName.charAt(0).toUpperCase()}
                </div>
              )}
              {showSenderMeta && !isFirstInGroup && (
                <div className="w-8 shrink-0" />
              )}

              <div
                className={`flex flex-col max-w-xs lg:max-w-md ${isMine ? 'items-end' : 'items-start'}`}
              >
                {/* Sender name for group chats only */}
                {showSenderMeta && isFirstInGroup && (
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold ml-1 mb-1">
                    {avatarName}
                  </span>
                )}

                {/* Message bubble */}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                    isMine
                      ? 'bg-blue-600 dark:bg-blue-500 text-white rounded-br-none'
                      : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-200 dark:border-gray-600'
                  } shadow-sm`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <div
                    className={`text-xs mt-1 flex items-center gap-1 ${isMine ? 'text-blue-100 dark:text-blue-200 justify-end' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    <span>{timeStr}</span>
                    {isMine &&
                      (isSeenByRecipient ? (
                        <CheckCheck
                          className="w-3.5 h-3.5 text-blue-200"
                          title="Seen"
                        />
                      ) : (
                        <Check
                          className="w-3.5 h-3.5 text-blue-100"
                          title="Received"
                        />
                      ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
