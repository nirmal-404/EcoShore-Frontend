import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessage } from '@/api/chatApi';
import { Send, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MessageInput({ groupId }) {
  const [text, setText] = useState('');
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: (newMsg) => sendMessage(groupId, newMsg),
    onSuccess: () => {
      queryClient.invalidateQueries(['chat-messages', groupId]);
      setText('');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      sendMessageMutation.mutate(text);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!groupId) return null;

  return (
    <div className="p-4 border-t border-border/50 bg-card">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:bg-secondary/50 rounded-xl"
        >
          <ImageIcon className="w-5 h-5" />
        </Button>
        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full bg-secondary/30 rounded-2xl py-3 pl-4 pr-12 text-[15px] border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none min-h-[48px] max-h-[120px]"
            rows={1}
            disabled={sendMessageMutation.isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!text.trim() || sendMessageMutation.isLoading}
            className="absolute right-1.5 bottom-1.5 h-9 w-9 rounded-xl shadow-sm"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
