import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likePost, unlikePost, sharePost, deleteContent } from '@/api/communityApi';
import { useSelector } from 'react-redux';
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, Trash2, Globe } from 'lucide-react';
import { CommentSection } from './CommentSection';

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
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function PostCard({ post }) {
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { user } = useSelector((s) => s.auth);
  const queryClient = useQueryClient();

  const isLiked = post.likes?.includes(user?.id);
  const likeCount = post.likes?.length || 0;
  const commentCount = post.comments?.length || post.commentCount || 0;
  const shareCount = post.shares || 0;
  const authorName = post.authorId?.name || 'EcoShore User';
  const authorRole = post.authorId?.role;

  const likeMutation = useMutation({
    mutationFn: () => (isLiked ? unlikePost(post._id) : likePost(post._id)),
    onSuccess: () => queryClient.invalidateQueries(['community-posts']),
  });

  const shareMutation = useMutation({
    mutationFn: () => sharePost(post._id),
    onSuccess: () => queryClient.invalidateQueries(['community-posts']),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteContent(post._id),
    onSuccess: () => queryClient.invalidateQueries(['community-posts']),
  });

  const isOwner = user && (user.id === post.authorId?._id || user.role === 'admin');

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3">
        <div className="flex gap-3 items-start flex-1">
          {/* Avatar */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${avatarColor(authorName)}`}
          >
            {authorName.slice(0, 2).toUpperCase()}
          </div>
          {/* Name + meta */}
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-gray-900">{authorName}</span>
              {authorRole && (
                <span className="text-xs font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                  {authorRole}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <span>{timeAgo(post.createdAt)}</span>
              <span>·</span>
              <Globe className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Options menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition p-1"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 bg-white shadow-lg rounded-lg z-20 py-1 w-44 border border-gray-100">
              {isOwner && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    if (window.confirm('Delete this post?')) deleteMutation.mutate();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <Trash2 className="w-4 h-4" /> Delete post
                </button>
              )}
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                Copy link
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Post text ── */}
      {post.text && (
        <p className="px-4 pb-3 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
          {post.text}
        </p>
      )}

      {/* ── Images ── */}
      {post.mediaUrls?.length > 0 && (
        <div
          className={`grid gap-0.5 mb-3 ${post.mediaUrls.length === 1 ? 'grid-cols-1' :
              post.mediaUrls.length === 2 ? 'grid-cols-2' :
                post.mediaUrls.length >= 3 ? 'grid-cols-3' : ''
            }`}
        >
          {post.mediaUrls.map((img, i) => (
            <div
              key={i}
              className={`bg-gray-100 overflow-hidden ${post.mediaUrls.length === 1 ? 'aspect-video' : 'aspect-square'}`}
            >
              <img src={img} alt="Post media" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
          ))}
        </div>
      )}

      {/* ── Reaction counts row ── */}
      {(likeCount > 0 || commentCount > 0 || shareCount > 0) && (
        <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500 border-t border-gray-200">
          <div className="flex items-center gap-1">
            {likeCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="inline-flex items-center justify-center">
                  <span className="text-blue-600">👍</span>
                </span>
                <span className="text-gray-600 text-xs">{likeCount}</span>
              </span>
            )}
          </div>
          <div className="flex gap-4 text-xs text-gray-500">
            {commentCount > 0 && (
              <button
                onClick={() => setShowComments((v) => !v)}
                className="hover:text-blue-600 transition"
              >
                {commentCount} comment{commentCount !== 1 ? 's' : ''}
              </button>
            )}
            {shareCount > 0 && <span>{shareCount} share{shareCount !== 1 ? 's' : ''}</span>}
          </div>
        </div>
      )}

      {/* ── Divider ── */}
      <div className="border-t border-gray-200" />

      {/* ── Action buttons row ── */}
      <div className="flex px-2 py-1">
        <button
          onClick={() => user && likeMutation.mutate()}
          disabled={!user}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-xs transition hover:bg-gray-100 disabled:cursor-default ${isLiked ? 'text-blue-600' : 'text-gray-500'
            }`}
        >
          <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-blue-600 text-blue-600' : ''}`} />
          Like
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-xs transition hover:bg-gray-100 ${showComments ? 'text-blue-600' : 'text-gray-500'
            }`}
        >
          <MessageCircle className="w-4 h-4" />
          Comment
        </button>

        <button
          onClick={() => user && shareMutation.mutate()}
          disabled={!user}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-xs text-gray-500 hover:bg-gray-100 transition disabled:cursor-default"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>

        <button
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-xs text-gray-500 hover:bg-gray-100 transition"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 21H5V5h14m0-2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
          </svg>
        </button>
      </div>

      {/* ── Comments ── */}
      {showComments && (
        <>
          <div className="border-t border-gray-200 mt-2 pt-2" />
          <CommentSection postId={post._id} />
        </>
      )}
    </div>
  );
}
