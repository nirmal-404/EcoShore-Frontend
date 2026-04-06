import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, setLoading, logout } from '@/store/authSlice';
import { setAuthToken } from '@/api/authApi';
import API from '@/api/index.js';
import Cookies from 'js-cookie';

import {
  getUserChatGroups,
  createChatGroup,
  getMessages,
  sendMessage,
} from '@/api/chatApi';

import {
  getPosts,
  createPost,
  likePost,
  unlikePost,
  getComments,
  createComment,
} from '@/services/api';

// ─── Utility ─────────────────────────────────────────────────────────────────

const cls = (...args) => args.filter(Boolean).join(' ');

function Badge({ children, color = 'green' }) {
  const colors = {
    green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span
      className={cls(
        'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border',
        colors[color]
      )}
    >
      {children}
    </span>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
}

function Btn({
  children,
  onClick,
  disabled,
  variant = 'primary',
  sm,
  className = '',
}) {
  const base =
    'inline-flex items-center gap-1.5 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const size = sm ? 'px-3 py-1.5 text-xs' : 'px-5 py-2.5 text-sm';
  const variants = {
    primary:
      'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md hover:shadow-teal-500/30 hover:opacity-90',
    secondary:
      'bg-white/10 hover:bg-white/15 text-white border border-white/10',
    danger:
      'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30',
    ghost: 'bg-transparent hover:bg-white/10 text-slate-300',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cls(base, size, variants[variant], className)}
    >
      {children}
    </button>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 transition disabled:opacity-50"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 transition"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-800">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 transition resize-none"
      />
    </div>
  );
}

function Section({ title, children, action }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function ApiResponse({ data, error }) {
  if (!data && !error) return null;
  const isError = !!error;
  return (
    <div
      className={cls(
        'rounded-xl p-3 text-xs font-mono overflow-auto max-h-40',
        isError
          ? 'bg-red-950/80 border border-red-500/20 text-red-300'
          : 'bg-emerald-950/80 border border-emerald-500/20 text-emerald-300'
      )}
    >
      <div className="font-bold mb-1 opacity-70">
        {isError ? '✗ Error' : '✓ Response'}
      </div>
      <pre className="whitespace-pre-wrap break-all">
        {JSON.stringify(isError ? error : data, null, 2)}
      </pre>
    </div>
  );
}

// ─── Auth Tab ─────────────────────────────────────────────────────────────────

function AuthTab() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLocalLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    setLocalLoading(true);
    setError(null);
    try {
      const res = await API.post('/auth/login', { email, password });
      const { user: u, token: t } = res.data;
      dispatch(setUser({ user: u, token: t }));
      setAuthToken(t);
    } catch (err) {
      setError(err?.response?.data || err.message);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setAuthToken(null);
  };

  const roleColor = {
    admin: 'red',
    organizer: 'purple',
    volunteer: 'green',
    collector: 'orange',
  };

  return (
    <div className="flex flex-col gap-5">
      <Section title="Login">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="user@example.com"
            type="email"
            disabled={loading}
          />
          <Input
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            type="password"
            disabled={loading}
          />
        </div>
        <div className="flex gap-3">
          <Btn onClick={handleLogin} disabled={loading || !email || !password}>
            {loading ? <Spinner /> : '🔑'}
            {loading ? 'Logging in…' : 'Login'}
          </Btn>
          {user && (
            <Btn variant="danger" onClick={handleLogout}>
              🚪 Logout
            </Btn>
          )}
        </div>
        <ApiResponse error={error} />
      </Section>

      {user && (
        <Section title="Session Info">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user.name?.charAt(0) || '?'}
            </div>
            <div>
              <p className="font-bold text-white">{user.name || user.email}</p>
              <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge color={roleColor[user.role] || 'green'}>
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-slate-400 font-semibold uppercase">
              Bearer Token (truncated)
            </p>
            <code className="text-xs bg-black/40 rounded-lg px-3 py-2 text-teal-300 break-all font-mono">
              {token?.slice(0, 60)}…
            </code>
          </div>
        </Section>
      )}
    </div>
  );
}

// ─── Group Chat Tab ───────────────────────────────────────────────────────────

function MessageBubble({ msg, currentUserId }) {
  const isMine =
    msg.senderId?._id === currentUserId || msg.senderId === currentUserId;
  return (
    <div
      className={cls(
        'flex flex-col max-w-[75%]',
        isMine ? 'self-end items-end' : 'self-start items-start'
      )}
    >
      {!isMine && (
        <span className="text-[10px] text-slate-500 ml-2 mb-0.5 font-medium">
          {msg.senderId?.name || msg.senderId}
        </span>
      )}
      <div
        className={cls(
          'px-4 py-2 text-sm leading-relaxed rounded-2xl',
          isMine
            ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-tr-sm'
            : 'bg-white/10 text-slate-200 border border-white/10 rounded-tl-sm'
        )}
      >
        {msg.text}
      </div>
      <span className="text-[10px] text-slate-600 mt-1 px-1">
        {new Date(msg.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </span>
    </div>
  );
}

function GroupChatPanel({ group, currentUser }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loadingMsg, setLoadingMsg] = useState(true);
  const [msgError, setMsgError] = useState(null);
  const scrollRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await getMessages(group._id, { limit: 100 });
      const rawData = res?.data;
      const msgs = Array.isArray(rawData) ? rawData : rawData?.messages || [];
      setMessages(msgs);
      setMsgError(null);
    } catch (e) {
      setMsgError(e?.response?.data?.message || e.message);
    } finally {
      setLoadingMsg(false);
    }
  };

  useEffect(() => {
    setMessages([]);
    setLoadingMsg(true);
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [group._id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage(group._id, text.trim());
      setText('');
      await fetchMessages();
    } catch {
      /* ignore */
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-80 bg-black/20 rounded-xl border border-white/10 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/10 bg-white/5 flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-xs font-bold">
          {group.name?.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-none">
            {group.name}
          </p>
          <p className="text-[10px] text-slate-500">
            {group.members?.length || 0} members
          </p>
        </div>
        <div className="ml-auto">
          <Badge color="blue">{group.type}</Badge>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-3"
      >
        {loadingMsg && messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
            Loading messages…
          </div>
        )}
        {msgError && (
          <p className="text-xs text-red-400 text-center">{msgError}</p>
        )}
        {!loadingMsg && messages.length === 0 && !msgError && (
          <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
            No messages yet. Say hi! 👋
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg._id || msg.id}
            msg={msg}
            currentUserId={currentUser?.id}
          />
        ))}
      </div>
      <form
        onSubmit={handleSend}
        className="flex gap-2 p-3 border-t border-white/10 bg-white/5"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message…"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/60 transition"
          disabled={sending}
        />
        <Btn onClick={handleSend} disabled={sending || !text.trim()} sm>
          {sending ? <Spinner /> : '➤'}
        </Btn>
      </form>
    </div>
  );
}

function GroupChatTab() {
  const { user } = useSelector((state) => state.auth);
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groupError, setGroupError] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Create group form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('GLOBAL_VOLUNTEER');
  const [creating, setCreating] = useState(false);
  const [createResult, setCreateResult] = useState(null);
  const [createError, setCreateError] = useState(null);

  const fetchGroups = async () => {
    setLoadingGroups(true);
    setGroupError(null);
    try {
      const res = await getUserChatGroups();
      setGroups(res?.data || []);
    } catch (e) {
      setGroupError(e?.response?.data || e.message);
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    if (user) fetchGroups();
  }, [user]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    setCreateResult(null);
    setCreateError(null);
    try {
      const res = await createChatGroup({
        name: name.trim(),
        description: description.trim() || undefined,
        type,
      });
      setCreateResult(res);
      setName('');
      setDescription('');
      await fetchGroups();
    } catch (e) {
      setCreateError(e?.response?.data || e.message);
    } finally {
      setCreating(false);
    }
  };

  const typeOptions = [
    { value: 'GLOBAL_VOLUNTEER', label: 'Global Volunteer' },
    { value: 'ORGANIZER_PRIVATE', label: 'Organizer Private' },
    { value: 'EVENT_GROUP', label: 'Event Group' },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Create Group */}
      <Section
        title="Create Chat Group"
        action={<Badge color="purple">ORGANIZER / ADMIN only</Badge>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Group Name"
            value={name}
            onChange={setName}
            placeholder="Beach Cleanup Crew"
            disabled={creating}
          />
          <Select
            label="Type"
            value={type}
            onChange={setType}
            options={typeOptions}
          />
        </div>
        <Textarea
          label="Description (optional)"
          value={description}
          onChange={setDescription}
          placeholder="What is this group about?"
          rows={2}
        />
        <Btn
          onClick={handleCreate}
          disabled={creating || !name.trim() || !user}
        >
          {creating ? <Spinner /> : '➕'}
          {creating ? 'Creating…' : 'Create Group'}
        </Btn>
        <ApiResponse data={createResult} error={createError} />
      </Section>

      {/* Group List */}
      <Section
        title={`My Groups (${groups.length})`}
        action={
          <Btn
            variant="ghost"
            sm
            onClick={fetchGroups}
            disabled={loadingGroups}
          >
            🔄 Refresh
          </Btn>
        }
      >
        <ApiResponse error={groupError} />
        {loadingGroups && groups.length === 0 && (
          <div className="flex justify-center py-4 text-slate-500 text-sm">
            Loading groups…
          </div>
        )}
        {!loadingGroups && groups.length === 0 && !groupError && (
          <p className="text-sm text-slate-500 text-center py-4">
            You're not in any groups yet.
          </p>
        )}
        <div className="flex flex-col gap-2">
          {groups.map((g) => (
            <button
              key={g._id}
              onClick={() =>
                setSelectedGroup(selectedGroup?._id === g._id ? null : g)
              }
              className={cls(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200',
                selectedGroup?._id === g._id
                  ? 'bg-teal-500/20 border border-teal-500/40'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10'
              )}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {g.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate">
                  {g.name}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {g.description || 'No description'}
                </p>
              </div>
              <Badge color="blue">{g.type}</Badge>
            </button>
          ))}
        </div>
      </Section>

      {/* Open Message Panel */}
      {selectedGroup && (
        <Section title={`💬 Messages — ${selectedGroup.name}`}>
          <GroupChatPanel group={selectedGroup} currentUser={user} />
        </Section>
      )}
    </div>
  );
}

// ─── Community Posts Tab ──────────────────────────────────────────────────────

function PostComments({ postId }) {
  const { user } = useSelector((state) => state.auth);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await getComments(postId);
      setComments(res?.data?.comments || res?.data || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    if (!open) fetchComments();
    setOpen(!open);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      await createComment(postId, { text: text.trim() });
      setText('');
      await fetchComments();
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleOpen}
        className="text-xs text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-1"
      >
        💬 {open ? 'Hide' : 'Show'} Comments
      </button>
      {open && (
        <div className="mt-3 flex flex-col gap-3">
          {loading && <p className="text-xs text-slate-500">Loading…</p>}
          {comments.map((c) => (
            <div key={c._id} className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {c.authorId?.name?.charAt(0) || '?'}
              </div>
              <div className="bg-white/5 rounded-xl px-3 py-2 flex-1">
                <p className="text-[10px] text-slate-400 font-semibold">
                  {c.authorId?.name || 'User'}
                </p>
                <p className="text-xs text-slate-200">{c.text}</p>
              </div>
            </div>
          ))}
          {user && (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a comment…"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-teal-500/60 transition"
                disabled={submitting}
              />
              <Btn
                onClick={handleSubmit}
                disabled={submitting || !text.trim()}
                sm
              >
                ↩
              </Btn>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function PostCard({ post, onLikeToggle }) {
  const { user } = useSelector((state) => state.auth);
  const [liking, setLiking] = useState(false);
  const isLiked = Boolean(post?.isLiked || post?.likes?.includes(user?.id));

  const handleLike = async () => {
    if (!user || liking) return;
    setLiking(true);
    try {
      await onLikeToggle(post._id, isLiked);
    } catch {
      /* ignore */
    } finally {
      setLiking(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {post.authorId?.name?.charAt(0) || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm">
            {post.authorId?.name || 'Unknown'}
          </p>
          <p className="text-[10px] text-slate-500">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
        <Badge color={post.visibility === 'PUBLIC' ? 'green' : 'orange'}>
          {post.visibility}
        </Badge>
      </div>
      <p className="text-sm text-slate-200 leading-relaxed">{post.text}</p>
      {post.mediaUrls?.length > 0 && (
        <div
          className={`grid gap-2 mb-2 ${post.mediaUrls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}
        >
          {post.mediaUrls.map((url, i) => (
            <div
              key={i}
              className="aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/20"
            >
              <img
                src={url}
                alt={`image-${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 pt-1 border-t border-white/10">
        <button
          onClick={handleLike}
          disabled={liking || !user}
          className={cls(
            'flex items-center gap-1.5 text-xs font-medium transition-colors',
            isLiked ? 'text-red-400' : 'text-slate-500 hover:text-red-400'
          )}
        >
          {liking ? <Spinner /> : isLiked ? '❤️' : '🤍'}
          {post.likesCount || post.likes?.length || 0}{' '}
          {isLiked ? 'Liked' : 'Like'}
        </button>
        <div className="flex-1">
          <PostComments postId={post._id} />
        </div>
      </div>
    </div>
  );
}

function CommunityTab() {
  const { user } = useSelector((state) => state.auth);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postError, setPostError] = useState(null);

  const [text, setText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);
  const [visibility, setVisibility] = useState('AUTHENTICATED');
  const [submitting, setSubmitting] = useState(false);
  const [createResult, setCreateResult] = useState(null);
  const [createError, setCreateError] = useState(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const allowed = files.slice(0, 5 - selectedFiles.length);
    const newPreviews = allowed.map((f) => URL.createObjectURL(f));
    setSelectedFiles((prev) => [...prev, ...allowed]);
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const removeFile = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const fetchPosts = async () => {
    setLoadingPosts(true);
    setPostError(null);
    try {
      const res = await getPosts();
      setPosts(res?.data?.posts || res?.data || []);
    } catch (e) {
      setPostError(e?.response?.data || e.message);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreate = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    setCreateResult(null);
    setCreateError(null);
    try {
      const res = await createPost(
        { text: text.trim(), visibility },
        selectedFiles
      );
      setCreateResult(res);
      setText('');
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
      setSelectedFiles([]);
      setPreviewUrls([]);
      await fetchPosts();
    } catch (e) {
      setCreateError(e?.response?.data || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeToggle = async (postId, isLiked) => {
    if (isLiked) {
      await unlikePost(postId);
    } else {
      await likePost(postId);
    }
    await fetchPosts();
  };

  const visibilityOptions = [
    { value: 'AUTHENTICATED', label: 'Authenticated Users' },
    { value: 'PUBLIC', label: 'Public' },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Section title="Create Post">
        <Textarea
          label="Post Content"
          value={text}
          onChange={setText}
          placeholder="Share a beach cleanup story, tips, or anything environment-related…"
          rows={3}
        />
        {/* Image previews */}
        {previewUrls.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {previewUrls.map((url, i) => (
              <div
                key={i}
                className="relative group w-16 h-16 rounded-xl overflow-hidden border border-white/10"
              >
                <img
                  src={url}
                  alt={`img-${i}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex gap-3 flex-wrap">
          <Select
            label="Visibility"
            value={visibility}
            onChange={setVisibility}
            options={visibilityOptions}
          />
        </div>
        <div className="flex gap-2">
          <Btn
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={submitting || selectedFiles.length >= 5}
            sm
          >
            🖼{' '}
            {selectedFiles.length > 0
              ? `${selectedFiles.length}/5 photos`
              : 'Add Photos'}
          </Btn>
          <Btn
            onClick={handleCreate}
            disabled={submitting || !text.trim() || !user}
          >
            {submitting ? <Spinner /> : '📝'}
            {submitting ? 'Posting…' : 'Create Post'}
          </Btn>
        </div>
        <ApiResponse data={createResult} error={createError} />
      </Section>

      <Section
        title={`Posts (${posts.length})`}
        action={
          <Btn variant="ghost" sm onClick={fetchPosts} disabled={loadingPosts}>
            🔄 Refresh
          </Btn>
        }
      >
        <ApiResponse error={postError} />
        {loadingPosts && posts.length === 0 && (
          <div className="text-center text-slate-500 text-sm py-4">
            Loading posts…
          </div>
        )}
        {!loadingPosts && posts.length === 0 && !postError && (
          <p className="text-sm text-slate-500 text-center py-4">
            No posts yet. Be the first!
          </p>
        )}
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onLikeToggle={handleLikeToggle}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}

// ─── Main Test Panel ──────────────────────────────────────────────────────────

const TABS = [
  { id: 'auth', label: '🔒 Auth', component: AuthTab },
  { id: 'chat', label: '💬 Group Chat', component: GroupChatTab },
  { id: 'community', label: '📝 Community Posts', component: CommunityTab },
];

export default function TestPanel() {
  const [activeTab, setActiveTab] = useState('auth');
  const { user } = useSelector((state) => state.auth);
  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white">
      {/* Background grid pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-xl shadow-lg shadow-teal-500/20">
              🧪
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                EcoShore Dev Panel
              </h1>
              <p className="text-xs text-slate-500">
                Backend test interface — not for production
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slateald-400 text-slate-400">
                localhost:4000
              </span>
            </div>
          </div>
          {user && (
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <span>Logged in as</span>
              <span className="font-bold text-teal-400">
                {user.name || user.email}
              </span>
              <Badge
                color={
                  {
                    admin: 'red',
                    organizer: 'purple',
                    volunteer: 'green',
                    collector: 'orange',
                  }[user.role] || 'green'
                }
              >
                {user.role}
              </Badge>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-2xl border border-white/10 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cls(
                'flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex flex-col gap-5">
          {ActiveComponent && <ActiveComponent />}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-xs text-slate-700">
          EcoShore API Test Panel · Backend at{' '}
          <a
            href="http://localhost:4000/api-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-700 hover:text-teal-500"
          >
            localhost:4000/api-docs
          </a>
        </div>
      </div>
    </div>
  );
}
