import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessage } from '@/api/chatApi';
import { Send, Plus } from 'lucide-react';

export function MessageInput({ groupId }) {
  const [text, setText] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (msg) => sendMessage(groupId, msg),
    onSuccess: () => {
      queryClient.invalidateQueries(['chat-messages', groupId]);
      queryClient.invalidateQueries(['chat-groups']);
      setText('');
    },
  });

  const isPending = mutation.isPending || mutation.isLoading;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (text.trim() && !isPending) mutation.mutate(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!groupId) return null;

  return (
    <div className="shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3 p-4">
        {/* Attachment button */}
        <button
          type="button"
          className="p-2 text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition flex-shrink-0"
          title="Attach file"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Message input */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Aa"
          disabled={isPending}
          rows="1"
          className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-600 rounded-2xl px-4 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
          style={{ maxHeight: '100px' }}
        />

        {/* Send button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!text.trim() || isPending}
          className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-300 text-white rounded-full transition flex-shrink-0 flex items-center justify-center"
          title="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
