import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost } from '@/api/communityApi';
import { useSelector } from 'react-redux';
import { Image as ImageIcon, X, Send, Upload, LogIn } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function CreatePostModal() {
    const [content, setContent] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);   // File objects
    const [previewUrls, setPreviewUrls] = useState([]);       // Local blob URLs for preview
    const fileInputRef = useRef(null);
    const { user } = useSelector((state) => state.auth);
    const queryClient = useQueryClient();

    const createPostMutation = useMutation({
        mutationFn: ({ text, files }) => createPost({ text, visibility: 'AUTHENTICATED' }, files),
        onSuccess: () => {
            queryClient.invalidateQueries(['community-posts']);
            setContent('');
            clearFiles();
        },
    });

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        // Max 5 images
        const allowed = files.slice(0, 5 - selectedFiles.length);
        const newPreviews = allowed.map((f) => URL.createObjectURL(f));

        setSelectedFiles((prev) => [...prev, ...allowed]);
        setPreviewUrls((prev) => [...prev, ...newPreviews]);

        // Reset file input so same file can be re-selected
        e.target.value = '';
    };

    const removeFile = (index) => {
        URL.revokeObjectURL(previewUrls[index]);
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const clearFiles = () => {
        previewUrls.forEach((url) => URL.revokeObjectURL(url));
        setSelectedFiles([]);
        setPreviewUrls([]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        createPostMutation.mutate({ text: content, files: selectedFiles });
    };

    const isPending = createPostMutation.isPending || createPostMutation.isLoading;

    if (!user) {
        return (
            <Card className="rounded-3xl border-border/60 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm mb-6 max-w-2xl mx-auto w-full">
                <CardContent className="p-6 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <LogIn className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-foreground text-[15px]">Share your thoughts</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link> or{' '}
                            <Link to="/register" className="text-primary hover:underline font-medium">sign up</Link> to post in the community.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-3xl border-border/60 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm mb-6 max-w-2xl mx-auto w-full">
            <CardContent className="p-4 sm:p-6">
                <form onSubmit={handleSubmit}>
                    <div className="flex gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary/80 to-primary-foreground/80 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg shadow-inner hidden sm:flex">
                            {user.name?.charAt(0) || '?'}
                        </div>

                        <div className="flex-1 w-full">
                            {/* Text area */}
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Share your clean-up story or environment tips..."
                                maxLength={1000}
                                className="w-full min-h-[100px] bg-secondary/20 rounded-2xl p-4 text-foreground/90 border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-base placeholder:text-muted-foreground/60"
                                disabled={isPending}
                            />
                            {content.length > 0 && (
                                <p className="text-[11px] text-muted-foreground/60 text-right mt-1">
                                    {content.length}/1000
                                </p>
                            )}

                            {/* Image previews */}
                            {previewUrls.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {previewUrls.map((url, i) => (
                                        <div key={i} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-border/50 shadow-sm">
                                            <img
                                                src={url}
                                                alt={`preview-${i}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeFile(i)}
                                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl"
                                            >
                                                <X className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    ))}
                                    {selectedFiles.length < 5 && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-20 h-20 rounded-xl border-2 border-dashed border-border/60 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                                        >
                                            <Upload className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={isPending}
                            />

                            {/* Toolbar */}
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/40">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className={`text-muted-foreground hover:text-primary rounded-xl px-3 h-9 transition-colors ${previewUrls.length > 0 ? 'bg-primary/10 text-primary' : ''}`}
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isPending || selectedFiles.length >= 5}
                                >
                                    <ImageIcon className="w-5 h-5 mr-2" />
                                    <span className="text-sm font-medium">
                                        {selectedFiles.length > 0 ? `${selectedFiles.length}/5 photo${selectedFiles.length > 1 ? 's' : ''}` : 'Add Photos'}
                                    </span>
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={!content.trim() || isPending}
                                    className="rounded-xl px-6 font-semibold shadow-sm hover:shadow-md transition-shadow"
                                >
                                    {isPending ? (
                                        <span className="animate-pulse">Posting...</span>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" /> Post
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
