import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import {
  Globe,
  Heart,
  ImageOff,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Send,
  Trash2,
  Users,
  VideoOff,
} from 'lucide-react';
import { toast } from 'sonner';
import MediaSlider from './MediaSlider';
import {
  createComment,
  deletePost,
  likePost,
  updatePost,
  unlikePost,
} from '@/services/api';

const avatarColors = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-cyan-500',
  'bg-pink-500',
];

const optimizeCloudinaryUrl = (url = '') => {
  if (!url) {
    return '';
  }

  if (url.includes('/upload/f_auto,q_auto/')) {
    return url;
  }

  return url.replace('/upload/', '/upload/f_auto,q_auto/');
};

const getAvatarColorClass = (name = '') => {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash + name.charCodeAt(index)) % avatarColors.length;
  }
  return avatarColors[hash];
};

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const diffSeconds = (Date.now() - date.getTime()) / 1000;

  if (diffSeconds < 60) {
    return 'Just now';
  }

  if (diffSeconds < 3600) {
    return `${Math.floor(diffSeconds / 60)}m ago`;
  }

  if (diffSeconds < 86400) {
    return `${Math.floor(diffSeconds / 3600)}h ago`;
  }

  if (diffSeconds < 604800) {
    return `${Math.floor(diffSeconds / 86400)}d ago`;
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

function MediaFallback({ type }) {
  const isVideo = type === 'video' || type === 'gif';

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300">
      {isVideo ? (
        <VideoOff className="h-8 w-8" />
      ) : (
        <ImageOff className="h-8 w-8" />
      )}
      <p className="text-sm font-medium">
        {isVideo ? 'Video unavailable' : 'Image unavailable'}
      </p>
    </div>
  );
}

function SingleMedia({ item }) {
  const normalizedUrl = optimizeCloudinaryUrl(item.url);

  if (item.type === 'image') {
    return <SingleImage src={normalizedUrl} />;
  }

  return <SingleVideo src={normalizedUrl} type={item.type} />;
}

function SingleImage({ src }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <MediaFallback type="image" />;
  }

  return (
    <div className="relative h-full w-full">
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
      )}
      <img
        src={src}
        alt="Post media"
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function SingleVideo({ src, type }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const target = videoRef.current;
    if (!target) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.35 }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const target = videoRef.current;
    if (!target) {
      return;
    }

    if (isInViewport) {
      target.play().catch(() => {
        // Ignore autoplay rejections.
      });
    } else {
      target.pause();
    }
  }, [isInViewport]);

  if (hasError) {
    return <MediaFallback type={type} />;
  }

  return (
    <div className="relative h-full w-full">
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
      )}
      <video
        ref={videoRef}
        src={src}
        muted
        autoPlay
        loop
        playsInline
        preload="metadata"
        controls={false}
        onLoadedData={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function PostCardSkeleton() {
  return (
    <article className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="space-y-2">
          <div className="h-3 w-28 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-2.5 w-20 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
      <div className="mt-4 h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="mt-2 h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="mt-4 aspect-video rounded-lg bg-gray-200 dark:bg-gray-700" />
    </article>
  );
}

export default function PostCard({
  post,
  loading = false,
  showActions = true,
}) {
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.auth);
  const [showMenu, setShowMenu] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isEditingText, setIsEditingText] = useState(false);
  const [editedText, setEditedText] = useState('');

  if (loading) {
    return <PostCardSkeleton />;
  }

  const authorName = post?.userId?.name || 'EcoShore User';
  const authorRole = post?.userId?.role || null;
  const mediaItems = Array.isArray(post?.media) ? post.media : [];
  const likeCount = Number(post?.likesCount || 0);
  const commentsCount = Number(post?.commentsCount || 0);
  const recentComments = Array.isArray(post?.recentComments)
    ? post.recentComments
    : [];
  const isLiked = Boolean(post?.isLiked);
  const postVisibility =
    post?.visibility === 'community' || post?.visibility === 'private'
      ? 'community'
      : 'public';
  const VisibilityIcon = postVisibility === 'community' ? Users : Globe;
  const visibilityLabel =
    postVisibility === 'community' ? 'Community' : 'Public';
  const currentUserId = user?.id || user?._id || null;
  const postOwnerId = post?.userId?._id || post?.userId?.id || null;
  const isOwner =
    Boolean(currentUserId) && String(currentUserId) === String(postOwnerId);
  const isAdmin = String(user?.role || '').toLowerCase() === 'admin';
  const canEdit = isOwner;
  const canDelete = isOwner || isAdmin;

  useEffect(() => {
    setEditedText(post?.text || '');
    setIsEditingText(false);
  }, [post?._id, post?.text]);

  const likeMutation = useMutation({
    mutationFn: () => (isLiked ? unlikePost(post._id) : likePost(post._id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to update like status.'
      );
    },
  });

  const commentMutation = useMutation({
    mutationFn: () => createComment(post._id, { text: commentText.trim() }),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to add comment.'
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(post._id),
    onSuccess: () => {
      toast.success('Post deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to delete post.'
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => updatePost(post._id, { text: editedText.trim() }),
    onSuccess: () => {
      toast.success('Post updated successfully.');
      setIsEditingText(false);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to update post.'
      );
    },
  });

  const handleLike = () => {
    if (!user) {
      toast.error('Please sign in to like posts.');
      return;
    }

    likeMutation.mutate();
  };

  const handleCommentSubmit = (event) => {
    event.preventDefault();

    if (!user) {
      toast.error('Please sign in to comment.');
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    commentMutation.mutate();
  };

  const handleDelete = () => {
    setShowMenu(false);

    if (!window.confirm('Delete this post?')) {
      return;
    }

    deleteMutation.mutate();
  };

  const handleStartEdit = () => {
    setEditedText(post?.text || '');
    setIsEditingText(true);
    setShowMenu(false);
  };

  const handleCancelEdit = () => {
    setEditedText(post?.text || '');
    setIsEditingText(false);
  };

  const handleSaveEdit = () => {
    const nextText = editedText.trim();
    const currentText = String(post?.text || '').trim();

    if (nextText === currentText) {
      setIsEditingText(false);
      return;
    }

    if (!nextText && mediaItems.length === 0) {
      toast.error('Post must contain text or media.');
      return;
    }

    updateMutation.mutate();
  };

  return (
    <article className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-sm font-bold text-white ${getAvatarColorClass(authorName)}`}
          >
            {authorName.slice(0, 2).toUpperCase()}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                {authorName}
              </p>
              {authorRole && (
                <span className="rounded bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  {authorRole}
                </span>
              )}
            </div>

            <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <span>{formatTimeAgo(post?.createdAt)}</span>
              <span>·</span>
              <VisibilityIcon className="h-3.5 w-3.5" />
              <span>{visibilityLabel}</span>
            </div>
          </div>
        </div>

        {showActions && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu((value) => !value)}
              className="h-8 w-8 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
              aria-label="Post actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-9 z-20 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg min-w-36">
                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/community?post=${post._id}`;
                    navigator.clipboard.writeText(url);
                    setShowMenu(false);
                    toast.success('Post link copied.');
                  }}
                  className="w-full px-3 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 inline-flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Copy link
                </button>

                {canEdit && (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="w-full px-3 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 inline-flex items-center gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit post
                  </button>
                )}

                {canDelete && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="w-full px-3 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 inline-flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete post
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {isEditingText ? (
        <div className="px-4 pb-3">
          <textarea
            value={editedText}
            onChange={(event) => setEditedText(event.target.value)}
            rows={3}
            maxLength={2000}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Update your post text..."
          />
          <div className="mt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={updateMutation.isPending}
              className="rounded-md px-3 py-1.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={updateMutation.isPending}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        post?.text && (
          <p className="px-4 pb-3 text-sm leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
            {post.text}
          </p>
        )
      )}

      {mediaItems.length === 1 && (
        <div className="mb-3 px-4">
          <div className="overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 aspect-video">
            <SingleMedia item={mediaItems[0]} />
          </div>
        </div>
      )}

      {mediaItems.length > 1 && (
        <div className="mb-3 px-4">
          <MediaSlider media={mediaItems} />
        </div>
      )}

      {likeCount > 0 && (
        <div className="px-4 pb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
          {likeCount} {likeCount === 1 ? 'like' : 'likes'}
        </div>
      )}

      {showActions && (
        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <button
            type="button"
            onClick={handleLike}
            disabled={likeMutation.isPending}
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-60"
          >
            <Heart
              className={`h-4 w-4 ${
                isLiked
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-500 dark:text-gray-300'
              }`}
            />
            Like
          </button>

          <button
            type="button"
            onClick={() => setShowCommentInput((value) => !value)}
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <MessageCircle className="h-4 w-4" />
            Comment
          </button>
        </div>
      )}

      {commentsCount > 0 && (
        <div className="px-4 pb-3 text-sm">
          {commentsCount > 2 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
              View all {commentsCount} comments
            </p>
          )}

          <div className="space-y-1.5">
            {recentComments.map((comment) => (
              <p
                key={comment._id}
                className="text-gray-800 dark:text-gray-200 break-words"
              >
                <span className="font-semibold text-gray-900 dark:text-gray-100 mr-1.5">
                  {comment?.userId?.name || 'EcoShore User'}
                </span>
                {comment?.text || ''}
              </p>
            ))}
          </div>
        </div>
      )}

      {showActions && showCommentInput && (
        <form
          onSubmit={handleCommentSubmit}
          className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Add a comment..."
              disabled={commentMutation.isPending}
              className="flex-1 rounded-full border border-gray-200 dark:border-gray-700 bg-transparent px-4 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              disabled={commentMutation.isPending || !commentText.trim()}
              className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-60"
              aria-label="Send comment"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}
    </article>
  );
}
