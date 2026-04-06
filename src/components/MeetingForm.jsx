import { useMemo, useState } from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const MAX_TOTAL_PARTICIPANTS = 5;
const MAX_OTHER_PARTICIPANTS = MAX_TOTAL_PARTICIPANTS - 1;

export default function MeetingForm({ users = [], onSubmit, isSubmitting }) {
  const [title, setTitle] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [isInstant, setIsInstant] = useState(true);
  const [scheduledAt, setScheduledAt] = useState('');
  const [isParticipantPickerOpen, setIsParticipantPickerOpen] = useState(false);
  const [participantSearch, setParticipantSearch] = useState('');

  const sortedUsers = useMemo(() => {
    return [...users].sort((firstUser, secondUser) => {
      return (firstUser.name || '').localeCompare(secondUser.name || '');
    });
  }, [users]);

  const participantMap = useMemo(() => {
    const map = new Map();
    sortedUsers.forEach((user) => {
      map.set(String(user._id), user);
    });
    return map;
  }, [sortedUsers]);

  const selectedParticipantRecords = useMemo(() => {
    return selectedParticipants
      .map((id) => participantMap.get(String(id)))
      .filter(Boolean);
  }, [selectedParticipants, participantMap]);

  const filteredUsers = useMemo(() => {
    const query = participantSearch.trim().toLowerCase();

    if (!query) {
      return sortedUsers;
    }

    return sortedUsers.filter((user) => {
      const name = String(user.name || '').toLowerCase();
      const email = String(user.email || '').toLowerCase();
      const role = String(user.role || '').toLowerCase();
      return (
        name.includes(query) || email.includes(query) || role.includes(query)
      );
    });
  }, [sortedUsers, participantSearch]);

  const handleToggleParticipant = (userId) => {
    setSelectedParticipants((previousParticipants) => {
      if (previousParticipants.includes(userId)) {
        return previousParticipants.filter((id) => id !== userId);
      }

      if (previousParticipants.length >= MAX_OTHER_PARTICIPANTS) {
        toast.error(
          'You can select up to 4 other participants (5 including you).'
        );
        return previousParticipants;
      }

      return [...previousParticipants, userId];
    });
  };

  const resetForm = () => {
    setTitle('');
    setSelectedParticipants([]);
    setIsInstant(true);
    setScheduledAt('');
    setParticipantSearch('');
    setIsParticipantPickerOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error('Meeting title is required.');
      return;
    }

    if (!isInstant && !scheduledAt) {
      toast.error('Please choose a scheduled date and time.');
      return;
    }

    const scheduledDate = !isInstant ? new Date(scheduledAt) : null;

    if (!isInstant && Number.isNaN(scheduledDate.getTime())) {
      toast.error('Scheduled date is invalid.');
      return;
    }

    if (!isInstant && scheduledDate.getTime() <= Date.now()) {
      toast.error('Scheduled time must be in the future.');
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        participants: selectedParticipants,
        isInstant,
        scheduledAt: isInstant ? null : scheduledDate.toISOString(),
      });

      resetForm();
    } catch (error) {
      // Error toast is handled by the parent mutation callback.
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Create Meeting</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="meeting-title">
              Title
            </label>
            <Input
              id="meeting-title"
              placeholder="Weekly cleanup sync"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={200}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium">Participants</label>
              <Badge variant="secondary">
                {selectedParticipants.length}/{MAX_OTHER_PARTICIPANTS} selected
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Select up to 4 users. You are auto-added as participant 5.
            </p>
            <div className="rounded-lg border border-border bg-background p-2.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  {selectedParticipants.length > 0
                    ? `${selectedParticipants.length} participant(s) selected`
                    : 'No participants selected yet'}
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setIsParticipantPickerOpen(true)}
                  disabled={isSubmitting || sortedUsers.length === 0}
                >
                  <UserPlus className="h-4 w-4" />
                  Select
                </Button>
              </div>

              {selectedParticipantRecords.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {selectedParticipantRecords.map((participant) => (
                    <Badge
                      key={participant._id}
                      variant="secondary"
                      className="inline-flex items-center gap-1"
                    >
                      <span className="max-w-[140px] truncate">
                        {participant.name || participant.email}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleParticipant(participant._id)}
                        className="rounded-full hover:bg-black/10"
                        disabled={isSubmitting}
                        aria-label={`Remove ${participant.name || participant.email}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Meeting Type</label>
            <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-background p-1">
              <Button
                type="button"
                size="sm"
                variant={isInstant ? 'default' : 'ghost'}
                onClick={() => setIsInstant(true)}
                disabled={isSubmitting}
                className="px-3"
              >
                Start Now
              </Button>
              <Button
                type="button"
                size="sm"
                variant={!isInstant ? 'default' : 'ghost'}
                onClick={() => setIsInstant(false)}
                disabled={isSubmitting}
                className="px-3"
              >
                Schedule
              </Button>
            </div>
          </div>

          {!isInstant && (
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="scheduled-at">
                Scheduled At
              </label>
              <Input
                id="scheduled-at"
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className="flex justify-start pt-1">
            <Button type="submit" className="min-w-36" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Meeting'}
            </Button>
          </div>
        </form>

        <Sheet
          open={isParticipantPickerOpen}
          onOpenChange={setIsParticipantPickerOpen}
        >
          <SheetContent side="right" className="w-full sm:max-w-md p-0">
            <SheetHeader className="px-5 pt-5 pb-4 border-b">
              <SheetTitle>Select Participants</SheetTitle>
              <SheetDescription>
                Search users and pick up to 4 participants.
              </SheetDescription>
            </SheetHeader>

            <div className="p-4 h-full flex flex-col gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or role"
                  value={participantSearch}
                  onChange={(event) => setParticipantSearch(event.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="rounded-lg border border-border divide-y overflow-y-auto min-h-[260px] max-h-[52vh]">
                {filteredUsers.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">
                    No matching users found.
                  </p>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelected = selectedParticipants.includes(user._id);
                    const hasReachedLimit =
                      !isSelected &&
                      selectedParticipants.length >= MAX_OTHER_PARTICIPANTS;

                    return (
                      <div
                        key={user._id}
                        className="flex items-center justify-between gap-3 p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {user.name || user.email}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="capitalize">
                            {user.role || 'user'}
                          </Badge>
                          <Button
                            type="button"
                            size="sm"
                            variant={isSelected ? 'secondary' : 'outline'}
                            onClick={() => handleToggleParticipant(user._id)}
                            disabled={isSubmitting || hasReachedLimit}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <p className="text-xs text-muted-foreground">
                  {selectedParticipants.length}/{MAX_OTHER_PARTICIPANTS}{' '}
                  selected
                </p>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsParticipantPickerOpen(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  );
}
