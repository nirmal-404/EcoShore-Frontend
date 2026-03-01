import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getComments, createComment, deleteContent } from '@/api/communityApi';
import { useSelector } from 'react-redux';
import { MessageCircle, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CommentSection({ postId }) {
    const [content, setContent] = useState('');
    const { user } = useSelector((state) => state.auth);
    const queryClient = useQueryClient();

    const { data: commentsResponse, isLoading } = useQuery({
        queryKey: ['community-comments', postId],
        queryFn: () => getComments(postId),
    });

    const comments = commentsResponse?.data?.comments || [];

    const addCommentMutation = useMutation({
        mutationFn: (newComment) => createComment(postId, newComment),
        onSuccess: () => {
            queryClient.invalidateQueries(['community-comments', postId]);
            queryClient.invalidateQueries(['community-posts']); // Update comment count on post
            setContent('');
        },
    });

    const deleteCommentMutation = useMutation({
        mutationFn: (commentId) => deleteContent(commentId),
        onSuccess: () => {
            queryClient.invalidateQueries(['community-comments', postId]);
            queryClient.invalidateQueries(['community-posts']);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (content.trim()) {
            addCommentMutation.mutate({ text: content });
        }
    };

    if (isLoading) {
        return (
            <div className="pt-4 border-t border-border mt-4 text-center text-sm text-muted-foreground">
                Loading comments...
            </div>
        );
    }

    return (
        <div className="mt-4 pt-4 border-t border-border">
            {user ? (
                <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 bg-secondary/30 rounded-xl px-4 py-2 text-sm border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        disabled={addCommentMutation.isLoading}
                    />
                    <Button
                        type="submit"
                        size="sm"
                        disabled={!content.trim() || addCommentMutation.isLoading}
                        className="rounded-xl px-4"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            ) : (
                <div className="text-sm text-muted-foreground mb-6 text-center italic bg-secondary/20 py-2 rounded-lg">
                    Log in to leave a comment.
                </div>
            )}

            <div className="space-y-4">
                {comments.map((comment) => (
                    <div key={comment._id} className="flex gap-3 group">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {comment.authorId?.name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 bg-secondary/20 rounded-2xl rounded-tl-none p-3 relative hover:bg-secondary/30 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-sm mr-2">{comment.authorId?.name}</span>
                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{comment.text}</p>

                            {user && (user.id === comment.authorId?._id || user.role === 'admin') && (
                                <button
                                    onClick={() => deleteCommentMutation.mutate(comment._id)}
                                    className="absolute -right-2 -top-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:scale-110"
                                    title="Delete comment"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {comments.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-2 flex flex-col items-center gap-2">
                        <MessageCircle className="w-8 h-8 text-muted-foreground/30" />
                        <p>No comments yet. Be the first to share your thoughts!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
