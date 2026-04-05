import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const MAX_TOTAL_PARTICIPANTS = 5;
const MAX_OTHER_PARTICIPANTS = MAX_TOTAL_PARTICIPANTS - 1;

export default function MeetingForm({ users = [], onSubmit, isSubmitting }) {
  const [title, setTitle] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [isInstant, setIsInstant] = useState(true);
  const [scheduledAt, setScheduledAt] = useState('');

  const sortedUsers = useMemo(() => {
    return [...users].sort((firstUser, secondUser) => {
      return (firstUser.name || '').localeCompare(secondUser.name || '');
    });
  }, [users]);

  const handleToggleParticipant = (userId) => {
    setSelectedParticipants((previousParticipants) => {
      if (previousParticipants.includes(userId)) {
        return previousParticipants.filter((id) => id !== userId);
      }

      if (previousParticipants.length >= MAX_OTHER_PARTICIPANTS) {
        toast.error('You can select up to 4 other participants (5 including you).');
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
    <Card>
      <CardHeader>
        <CardTitle>Create Meeting</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="max-h-52 overflow-y-auto rounded-lg border border-border divide-y">
              {sortedUsers.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground">
                  No users available to invite.
                </p>
              ) : (
                sortedUsers.map((user) => {
                  const isSelected = selectedParticipants.includes(user._id);

                  return (
                    <label
                      key={user._id}
                      className="flex cursor-pointer items-center justify-between gap-3 p-3 hover:bg-secondary/20"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {user.name || user.email}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {user.role || 'user'}
                        </Badge>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleParticipant(user._id)}
                          disabled={
                            isSubmitting ||
                            (!isSelected &&
                              selectedParticipants.length >=
                                MAX_OTHER_PARTICIPANTS)
                          }
                          className="h-4 w-4"
                        />
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Meeting Type</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={isInstant ? 'default' : 'outline'}
                onClick={() => setIsInstant(true)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Start Now
              </Button>
              <Button
                type="button"
                variant={!isInstant ? 'default' : 'outline'}
                onClick={() => setIsInstant(false)}
                disabled={isSubmitting}
                className="flex-1"
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Meeting'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
