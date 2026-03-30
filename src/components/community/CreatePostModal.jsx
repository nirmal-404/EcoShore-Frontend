import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost } from '@/api/communityApi';
import { useSelector } from 'react-redux';
import { Image as ImageIcon, X, Smile, Video, MapPin, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

function avatarColor(name = '') {
  const colors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-violet-500',
    'bg-rose-500', 'bg-amber-500', 'bg-cyan-500', 'bg-pink-500',
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % colors.length;
  return colors[h];
}

export function CreatePostModal() {
  const [content, setContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const { user } = useSelector((s) => s.auth);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ text, files }) => createPost({ text, visibility: 'AUTHENTICATED' }, files),
    onSuccess: () => {
      queryClient.invalidateQueries(['community-posts']);
      setContent('');
      clearFiles();
      setExpanded(false);
    },
  });

  const isPending = mutation.isPending || mutation.isLoading;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const allowed = files.slice(0, 5 - selectedFiles.length);
    const previews = allowed.map((f) => URL.createObjectURL(f));
    setSelectedFiles((p) => [...p, ...allowed]);
    setPreviewUrls((p) => [...p, ...previews]);
    e.target.value = '';
  };

  const removeFile = (i) => {
    URL.revokeObjectURL(previewUrls[i]);
    setSelectedFiles((p) => p.filter((_, j) => j !== i));
    setPreviewUrls((p) => p.filter((_, j) => j !== i));
  };

  const clearFiles = () => {
    previewUrls.forEach((u) => URL.revokeObjectURL(u));
    setSelectedFiles([]);
    setPreviewUrls([]);
  };

  const handleSubmit = () => {
    if (!content.trim() && selectedFiles.length === 0) return;
    mutation.mutate({ text: content, files: selectedFiles });
  };

  /* Not logged in */
  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow px-4 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        </div>
        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full px-5 py-2.5 text-gray-500 dark:text-gray-400 text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition">
          <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Log in</Link>
          <span> or </span>
          <Link to="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">sign up</Link>
          <span> to share your thoughts…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
      {/* Top row: avatar + prompt */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${avatarColor(user.name)}`}
        >
          {user.name?.slice(0, 2).toUpperCase() || '??'}
        </div>
        <button
          className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full px-5 py-2.5 text-sm text-left hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          onClick={() => {
            setExpanded(true);
            setTimeout(() => textareaRef.current?.focus(), 50);
          }}
        >
          What&rsquo;s on your mind?
        </button>
      </div>

      {/* Expanded compose area */}
      {expanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 pt-3 pb-3">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            maxLength={1000}
            rows={3}
            className="w-full resize-none outline-none text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 mb-3 bg-white dark:bg-gray-900"
          />

          {/* Image previews */}
          {previewUrls.length > 0 && (
            <div
              className={`grid gap-1 rounded-lg overflow-hidden mb-3 ${previewUrls.length === 1 ? 'grid-cols-1' :
                  previewUrls.length === 2 ? 'grid-cols-2' :
                    previewUrls.length >= 3 ? 'grid-cols-3' : ''
                }`}
            >
              {previewUrls.map((url, i) => (
                <div key={i} className="relative aspect-square bg-gray-100 dark:bg-gray-800 group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {selectedFiles.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition rounded"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Divider */}
      {expanded && <div className="border-t border-gray-200 dark:border-gray-700" />}

      {/* Toolbar row */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex gap-2">
          {/* Photo/Video */}
          <button
            onClick={() => { setExpanded(true); fileInputRef.current?.click(); }}
            disabled={isPending || selectedFiles.length >= 5}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ImageIcon className="w-4 h-4 text-green-500" />
            Add Image
          </button>

          {/* Add Tag */}
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition font-medium text-sm"
          >
            <span className="text-lg">#</span>
            Add Tag
          </button>
        </div>

        {/* Post button */}
        {expanded && (
          <button
            onClick={handleSubmit}
            disabled={isPending || (!content.trim() && selectedFiles.length === 0)}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold px-6 py-1.5 rounded-lg text-sm transition flex items-center gap-2"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Post
          </button>
        )}
      </div>

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
    </div>
  );
}
