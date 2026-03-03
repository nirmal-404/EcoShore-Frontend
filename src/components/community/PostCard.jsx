import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likePost, unlikePost, deleteContent } from '@/api/communityApi';
import { useSelector } from 'react-redux';
import { Heart, MessageCircle, Trash2, MoreHorizontal } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CommentSection } from './CommentSection';

export function PostCard({ post }) {
  const [showComments, setShowComments] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();

  const isLiked = post.likes?.includes(user?.id);

  const toggleLikeMutation = useMutation({
    mutationFn: () => (isLiked ? unlikePost(post._id) : likePost(post._id)),
    onSuccess: () => queryClient.invalidateQueries(['community-posts']),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteContent(post._id),
    onSuccess: () => queryClient.invalidateQueries(['community-posts']),
  });

  const handleLike = () => {
    if (user) toggleLikeMutation.mutate();
  };

  return (
    <Card className="rounded-3xl border-border/60 shadow-sm hover:shadow-md transition-shadow overflow-hidden bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3 flex flex-row items-start justify-between">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary/80 to-primary-foreground/80 flex items-center justify-center text-white font-bold text-lg shadow-inner">
            {post.authorId?.name?.charAt(0) || '?'}
          </div>
          <div>
            <h3 className="font-bold text-foreground leading-tight">
              {post.authorId?.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              {post.authorId?.role && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                  {post.authorId.role}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </div>

        {user && (user.id === post.authorId?._id || user.role === 'admin') && (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2 -mt-2 rounded-full"
            onClick={() => {
              if (
                window.confirm('Are you sure you want to delete this post?')
              ) {
                deleteMutation.mutate();
              }
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="pb-4">
        {post.text && (
          <p className="text-foreground/90 whitespace-pre-wrap mb-4 text-[15px] leading-relaxed">
            {post.text}
          </p>
        )}

        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div
            className={`grid gap-2 mb-2 ${post.mediaUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}
          >
            {post.mediaUrls.map((img, i) => (
              <div
                key={i}
                className="aspect-video bg-muted rounded-xl overflow-hidden border border-border/50"
              >
                <img
                  src={img}
                  alt="Post content"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col border-t border-border/40 pt-3 pb-3 px-6 bg-secondary/5">
        <div className="flex justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex gap-2 rounded-full px-4 transition-colors ${
              isLiked
                ? 'text-rose-500 hover:text-rose-600 hover:bg-rose-50'
                : 'text-muted-foreground hover:text-rose-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span className="font-medium">{post.likes?.length || 0}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex gap-2 rounded-full px-4 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">
              {post.comments?.length || post.commentCount || 0}
            </span>
          </Button>
        </div>

        {showComments && <CommentSection postId={post._id} />}
      </CardFooter>
    </Card>
  );
}
