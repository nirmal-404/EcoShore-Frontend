import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { Loader2, Plus, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { createPost } from '@/services/api';

const MAX_FILES = 5;
const ACCEPTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'video/mp4',
]);

const getPreviewType = (file) => {
  if (file.type.startsWith('video/')) {
    return 'video';
  }

  if (file.type.toLowerCase().includes('gif')) {
    return 'gif';
  }

  return 'image';
};

function PreviewCard({ item, onRemove }) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-white hover:bg-black"
        aria-label="Remove selected media"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="aspect-video w-full overflow-hidden">
        {item.type === 'image' ? (
          <img
            src={item.previewUrl}
            alt={item.file.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <video
            src={item.previewUrl}
            className="h-full w-full object-cover"
            muted
            autoPlay
            loop
            playsInline
            preload="metadata"
          />
        )}
      </div>

      <div className="px-2 py-1.5 text-xs text-gray-600 dark:text-gray-300 truncate">
        {item.file.name}
      </div>
    </div>
  );
}

export default function PostCreate({ onCreated }) {
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.auth);

  const [text, setText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [visibility, setVisibility] = useState('public');

  const previewItems = useMemo(() => {
    return selectedFiles.map((file) => ({
      file,
      type: getPreviewType(file),
      previewUrl: URL.createObjectURL(file),
    }));
  }, [selectedFiles]);

  useEffect(() => {
    return () => {
      previewItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [previewItems]);

  const createPostMutation = useMutation({
    mutationFn: () =>
      createPost({
        text: text.trim(),
        files: selectedFiles,
        visibility,
      }),
    onSuccess: () => {
      setText('');
      setSelectedFiles([]);
      setVisibility('public');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post shared successfully.');
      if (typeof onCreated === 'function') {
        onCreated();
      }
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to create post. Please try again.'
      );
    },
  });

  const handleFileSelection = (event) => {
    const incomingFiles = Array.from(event.target.files || []);
    event.target.value = '';

    if (!incomingFiles.length) {
      return;
    }

    const validFiles = incomingFiles.filter((file) =>
      ACCEPTED_MIME_TYPES.has(file.type)
    );

    if (validFiles.length !== incomingFiles.length) {
      toast.error('Only JPG, PNG, GIF, and MP4 files are supported.');
    }

    const remainingSlots = MAX_FILES - selectedFiles.length;
    if (remainingSlots <= 0) {
      toast.error('You can upload up to 5 files per post.');
      return;
    }

    if (validFiles.length > remainingSlots) {
      toast.error('Only the first 5 files were kept.');
    }

    setSelectedFiles((prev) => [
      ...prev,
      ...validFiles.slice(0, remainingSlots),
    ]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!user) {
      toast.error('Please sign in to create a post.');
      return;
    }

    if (!text.trim() && selectedFiles.length === 0) {
      toast.error('Add text or at least one media file.');
      return;
    }

    createPostMutation.mutate();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 space-y-3"
    >
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={4}
        placeholder="Share cleanup progress, updates, or ideas with the community..."
        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Visibility
        </span>
        <button
          type="button"
          onClick={() => setVisibility('public')}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            visibility === 'public'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          Public
        </button>
        <button
          type="button"
          onClick={() => setVisibility('community')}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            visibility === 'community'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          Community
        </button>
      </div>

      {previewItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {previewItems.map((item, index) => (
            <PreviewCard
              key={`${item.file.name}-${index}`}
              item={item}
              onRemove={() => {
                setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
              }}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
          <Plus className="h-4 w-4" />
          Add Media ({selectedFiles.length}/{MAX_FILES})
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,video/mp4"
            multiple
            className="hidden"
            onChange={handleFileSelection}
          />
        </label>

        <button
          type="submit"
          disabled={createPostMutation.isPending}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {createPostMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Post
            </>
          )}
        </button>
      </div>
    </form>
  );
}
