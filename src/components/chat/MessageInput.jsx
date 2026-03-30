import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessage } from '@/api/chatApi';
import { Send, Plus, Mic } from 'lucide-react';

export function MessageInput({ groupId }) {
  const [text, setText] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (msg) => sendMessage(groupId, msg),
    onSuccess: () => {
      queryClient.invalidateQueries(['chat-messages', groupId]);
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
    <div className="shrink-0 px-4 py-3 bg-white border-t border-gray-100">
      <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
        {/* Plus / attachment */}
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#605DFF] transition shrink-0"
          title="Attach"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Text input */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write your message..."
          disabled={isPending}
          className="flex-1 bg-transparent text-[14px] text-gray-800 placeholder:text-gray-400 outline-none py-1.5"
        />

        {/* Mic (cosmetic) */}
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#605DFF] transition shrink-0"
          title="Voice message"
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Send */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!text.trim() || isPending}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[#605DFF] text-white disabled:bg-gray-300 hover:bg-[#4e4bcc] transition shadow-sm shrink-0"
          title="Send"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  );
}
