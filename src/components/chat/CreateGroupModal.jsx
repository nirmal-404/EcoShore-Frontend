import React, { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createChatGroup, getUsersByRole } from '@/api/chatApi';
import {
  Plus,
  X,
  Loader2,
  ChevronDown,
  Search,
  CheckSquare,
  Square,
  Users,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TYPE_OPTIONS = [
  {
    value: 'GLOBAL_VOLUNTEER',
    label: 'Global Volunteer',
    description: 'Open to all volunteers',
  },
  {
    value: 'ORGANIZER_PRIVATE',
    label: 'Organizer Private',
    description: 'Organizers only',
  },
  {
    value: 'EVENT_GROUP',
    label: 'Event Group',
    description: 'Linked to a specific event',
  },
];

// ── Member Picker ─────────────────────────────────────────────────────────────

function MemberPicker({ selected, onChange }) {
  const [tab, setTab] = useState('volunteers'); // 'volunteers' | 'organizers'
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['users-by-role'],
    queryFn: getUsersByRole,
    staleTime: 60_000,
  });

  const volunteers = data?.volunteers || [];
  const organizers = data?.organizers || [];

  const activeList = tab === 'volunteers' ? volunteers : organizers;

  const filtered = useMemo(() => {
    if (!search.trim()) return activeList;
    const q = search.toLowerCase();
    return activeList.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  }, [activeList, search]);

  const isSelected = (id) => selected.includes(id);

  const toggle = (id) => {
    onChange(
      isSelected(id) ? selected.filter((s) => s !== id) : [...selected, id]
    );
  };

  const activeIds = activeList.map((u) => u._id);
  const allActive =
    activeIds.length > 0 && activeIds.every((id) => selected.includes(id));

  const toggleAll = () => {
    if (allActive) {
      // Deselect all from this list only
      onChange(selected.filter((id) => !activeIds.includes(id)));
    } else {
      // Select all from this list
      const merged = [...new Set([...selected, ...activeIds])];
      onChange(merged);
    }
  };

  const TABS = [
    {
      id: 'volunteers',
      label: 'Volunteers',
      icon: Users,
      count: volunteers.length,
    },
    {
      id: 'organizers',
      label: 'Organizers',
      icon: UserCheck,
      count: organizers.length,
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
        <span>Members</span>
        {selected.length > 0 && (
          <span className="normal-case font-medium text-primary">
            {selected.length} selected
          </span>
        )}
      </label>

      {/* Role tabs */}
      <div className="flex gap-1 p-1 bg-secondary/20 rounded-xl border border-border/30">
        {TABS.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all duration-150',
              tab === id
                ? 'bg-background text-foreground shadow-sm border border-border/40'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                tab === id
                  ? 'bg-primary/10 text-primary'
                  : 'bg-secondary/50 text-muted-foreground'
              )}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full bg-background border border-border/60 rounded-xl pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
        />
      </div>

      {/* Select All */}
      {!isLoading && activeList.length > 0 && (
        <button
          type="button"
          onClick={toggleAll}
          className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-1"
        >
          {allActive ? (
            <CheckSquare className="w-4 h-4 text-primary" />
          ) : (
            <Square className="w-4 h-4" />
          )}
          Select all {tab} ({activeList.length})
        </button>
      )}

      {/* User list */}
      <div className="max-h-48 overflow-y-auto rounded-xl border border-border/40 bg-background divide-y divide-border/20">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-xs text-muted-foreground text-center py-4 italic">
            Could not load users (no global group exists yet).
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-4 italic">
            {search ? 'No matches found.' : `No ${tab} found.`}
          </div>
        ) : (
          filtered.map((user) => {
            const checked = isSelected(user._id);
            return (
              <button
                key={user._id}
                type="button"
                onClick={() => toggle(user._id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
                  checked
                    ? 'bg-primary/8 hover:bg-primary/12'
                    : 'hover:bg-secondary/20'
                )}
              >
                {/* Checkbox */}
                <div
                  className={cn(
                    'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all',
                    checked ? 'bg-primary border-primary' : 'border-border/60'
                  )}
                >
                  {checked && (
                    <svg
                      className="w-2.5 h-2.5 text-primary-foreground"
                      fill="none"
                      viewBox="0 0 12 12"
                    >
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>

                {/* Avatar */}
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0',
                    checked
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-primary/10 text-primary'
                  )}
                >
                  {user.name?.charAt(0)?.toUpperCase() || '?'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate leading-tight">
                    {user.name || 'Unknown'}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────

export function CreateGroupModal({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('GLOBAL_VOLUNTEER');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () =>
      createChatGroup({
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        members: selectedMembers,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['chat-groups']);
      setName('');
      setDescription('');
      setType('GLOBAL_VOLUNTEER');
      setSelectedMembers([]);
      onClose();
    },
  });

  if (!isOpen) return null;

  const isPending = createMutation.isPending || createMutation.isLoading;

  return (
    <div className="border-b border-border/50 bg-secondary/5 animate-in slide-in-from-top-2 duration-200 overflow-y-auto max-h-[calc(100vh-200px)]">
      <div className="p-4 space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            New Chat Group
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Group Name */}
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
            Group Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Beach Cleanup Crew"
            maxLength={60}
            disabled={isPending}
            className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all disabled:opacity-50"
          />
        </div>

        {/* Type */}
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
            Type
          </label>
          <div className="relative">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={isPending}
              className="w-full appearance-none bg-background border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all disabled:opacity-50 pr-8"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {TYPE_OPTIONS.find((o) => o.value === type)?.description}
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">
            Description{' '}
            <span className="normal-case font-normal">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this group about?"
            rows={2}
            maxLength={200}
            disabled={isPending}
            className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all resize-none disabled:opacity-50"
          />
        </div>

        {/* Member Picker */}
        <MemberPicker
          selected={selectedMembers}
          onChange={setSelectedMembers}
        />

        {/* Error */}
        {createMutation.isError && (
          <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
            {createMutation.error?.response?.data?.message ||
              'Failed to create group. Try again.'}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1 sticky bottom-0 bg-secondary/5 pb-1">
          <Button
            onClick={() => createMutation.mutate()}
            disabled={!name.trim() || isPending}
            size="sm"
            className="flex-1 rounded-xl font-semibold"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Creating…
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1.5" />
                Create
                {selectedMembers.length > 0
                  ? ` (+${selectedMembers.length})`
                  : ''}
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl px-4"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
