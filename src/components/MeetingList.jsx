import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const statusVariantMap = {
  scheduled: 'secondary',
  ongoing: 'default',
  ended: 'outline',
};

const formatDateTime = (value) => {
  if (!value) {
    return 'Instant meeting';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Invalid date';
  }

  return parsedDate.toLocaleString();
};

export default function MeetingList({
  meetings = [],
  currentUserId,
  onStart,
  onJoin,
  onEnd,
  actionLoading,
  allowManageActions = true,
  compact = false,
}) {
  const sortedMeetings = [...meetings].sort((firstMeeting, secondMeeting) => {
    const firstIsOngoing = firstMeeting.status === 'ongoing';
    const secondIsOngoing = secondMeeting.status === 'ongoing';

    if (firstIsOngoing === secondIsOngoing) {
      return 0;
    }

    return firstIsOngoing ? -1 : 1;
  });

  return (
    <Card
      className={compact ? 'flex flex-col' : 'h-full min-h-0 flex flex-col'}
    >
      <CardHeader className="shrink-0">
        <CardTitle>Meetings</CardTitle>
      </CardHeader>
      <CardContent
        className={
          compact ? 'space-y-3' : 'space-y-3 flex-1 min-h-0 overflow-y-auto'
        }
      >
        {meetings.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            You do not have any meetings yet.
          </p>
        ) : (
          sortedMeetings.map((meeting) => {
            const creatorId =
              typeof meeting.createdBy === 'object'
                ? meeting.createdBy?._id
                : meeting.createdBy;

            const isCreator = String(creatorId) === String(currentUserId);
            const scheduledAtMs = meeting.scheduledAt
              ? new Date(meeting.scheduledAt).getTime()
              : null;
            const hasReachedSchedule =
              scheduledAtMs === null || scheduledAtMs <= Date.now();

            const canStart =
              allowManageActions && isCreator && meeting.status === 'scheduled';
            const canJoin =
              meeting.status === 'ongoing' ||
              (meeting.status === 'scheduled' && hasReachedSchedule);
            const canEnd =
              allowManageActions &&
              typeof onEnd === 'function' &&
              isCreator &&
              meeting.status === 'ongoing';

            return (
              <div
                key={meeting._id}
                className="rounded-lg border border-border/70 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{meeting.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(meeting.scheduledAt)}
                    </p>
                  </div>
                  <Badge
                    variant={statusVariantMap[meeting.status] || 'outline'}
                    className="capitalize"
                  >
                    {meeting.status}
                  </Badge>
                </div>

                <p className="mt-3 text-sm text-muted-foreground">
                  Participants:{' '}
                  {(meeting.participants || [])
                    .map((participant) => participant.name || participant.email)
                    .filter(Boolean)
                    .join(', ') || 'None'}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {canStart && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actionLoading === `start-${meeting._id}`}
                      onClick={() => onStart(meeting)}
                    >
                      {actionLoading === `start-${meeting._id}`
                        ? 'Starting...'
                        : 'Start'}
                    </Button>
                  )}

                  {canJoin && (
                    <Button
                      size="sm"
                      disabled={actionLoading === `join-${meeting._id}`}
                      onClick={() => onJoin(meeting)}
                    >
                      {actionLoading === `join-${meeting._id}`
                        ? 'Joining...'
                        : 'Join'}
                    </Button>
                  )}

                  {canEnd && (
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={actionLoading === `end-${meeting._id}`}
                      onClick={() => onEnd(meeting)}
                    >
                      {actionLoading === `end-${meeting._id}`
                        ? 'Ending...'
                        : 'End'}
                    </Button>
                  )}

                  {!canJoin && meeting.status === 'scheduled' && (
                    <p className="text-xs text-muted-foreground self-center">
                      Join will be enabled at scheduled time.
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
