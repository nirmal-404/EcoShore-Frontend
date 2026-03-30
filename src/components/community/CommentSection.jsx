import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getComments, createComment, deleteContent } from '@/api/communityApi';
import { useSelector } from 'react-redux';
import { Send, Trash2, MessageCircle } from 'lucide-react';

// Generate a deterministic avatar color from name
function avatarColor(name = '') {
  const colors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-violet-500',
    'bg-rose-500', 'bg-amber-500', 'bg-cyan-500', 'bg-pink-500',
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % colors.length;
  return colors[h];
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function CommentSection({ postId }) {
  const [content, setContent] = useState('');
  const { user } = useSelector((s) => s.auth);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['community-comments', postId],
    queryFn: () => getComments(postId),
  });
  const comments = data?.data?.comments || [];

  const addMutation = useMutation({
    mutationFn: (c) => createComment(postId, c),
    onSuccess: () => {
      queryClient.invalidateQueries(['community-comments', postId]);
      queryClient.invalidateQueries(['community-posts']);
      setContent('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['community-comments', postId]);
      queryClient.invalidateQueries(['community-posts']);
    },
  });

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && content.trim()) {
      e.preventDefault();
      addMutation.mutate({ text: content });
    }
  };

  return (
    <div className="px-4 pb-3">
      {/* Comment list */}
      {isLoading ? (
        <p className="text-xs text-gray-400 py-2 text-center">Loading comments…</p>
      ) : (
        <div className="space-y-2 mb-3">
          {comments.length === 0 && (
            <div className="flex flex-col items-center py-4 gap-1 text-gray-400">
              <MessageCircle className="w-7 h-7 opacity-30" />
              <p className="text-xs">No comments yet — be first!</p>
            </div>
          )}
          {comments.map((c) => {
            const initials = c.authorId?.name?.slice(0, 2).toUpperCase() || '??';
            const isOwner = user && (user.id === c.authorId?._id || user.role === 'admin');
            return (
              <div key={c._id} className="flex gap-2 group">
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 ${avatarColor(c.authorId?.name)}`}
                >
                  {initials}
                </div>
                {/* Bubble */}
                <div className="relative flex-1">
                  <div className="bg-[#f0f2f5] rounded-2xl rounded-tl-sm px-3 py-2 inline-block max-w-full">
                    <p className="text-[13px] font-semibold text-gray-900 leading-none mb-0.5">
                      {c.authorId?.name}
                    </p>
                    <p className="text-[13px] text-gray-800 whitespace-pre-wrap break-words">{c.text}</p>
                  </div>
                  <p className="text-[11px] text-gray-400 ml-3 mt-0.5">{timeAgo(c.createdAt)}</p>
                  {isOwner && (
                    <button
                      onClick={() => deleteMutation.mutate(c._id)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                      title="Delete"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comment input */}
      {user ? (
        <div className="flex gap-2 items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 ${avatarColor(user.name)}`}
          >
            {user.name?.slice(0, 2).toUpperCase() || '??'}
          </div>
          <div className="flex-1 relative">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a comment…"
              disabled={addMutation.isPending}
              className="w-full bg-[#f0f2f5] rounded-full pl-4 pr-10 py-2 text-[13px] text-gray-800 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-blue-200 transition"
            />
            <button
              onClick={() => content.trim() && addMutation.mutate({ text: content })}
              disabled={!content.trim() || addMutation.isPending}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 disabled:text-gray-300 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-center text-gray-400 py-2">
          <a href="/login" className="text-blue-500 hover:underline">Log in</a> to comment.
        </p>
      )}
    </div>
  );
}
