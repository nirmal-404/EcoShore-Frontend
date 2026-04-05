import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import MeetingForm from '@/components/MeetingForm';
import MeetingList from '@/components/MeetingList';
import VideoRoom from '@/components/VideoRoom';
import {
  createMeeting,
  endMeeting,
  getMeetingUsers,
  getMyMeetings,
  startMeeting,
} from '@/api/meetingsApi';
import { Button } from '@/components/ui/button';

const initialMeetingState = {
  currentMeeting: null,
  participants: [],
  localStream: null,
  peerConnections: {},
};

export default function MeetingsPage() {
  const { user, token } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();

  const [meetingState, setMeetingState] = useState(initialMeetingState);
  const [actionLoading, setActionLoading] = useState('');

  const currentUserId = String(user?.id || user?._id || '');

  const usersQuery = useQuery({
    queryKey: ['meeting-users'],
    queryFn: getMeetingUsers,
    enabled: Boolean(token),
  });

  const meetingsQuery = useQuery({
    queryKey: ['my-meetings'],
    queryFn: getMyMeetings,
    enabled: Boolean(token),
  });

  const createMeetingMutation = useMutation({
    mutationFn: createMeeting,
    onSuccess: () => {
      toast.success('Meeting created successfully.');
      queryClient.invalidateQueries({ queryKey: ['my-meetings'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create meeting.');
    },
  });

  const startMeetingMutation = useMutation({
    mutationFn: startMeeting,
    onSuccess: () => {
      toast.success('Meeting started.');
      queryClient.invalidateQueries({ queryKey: ['my-meetings'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to start meeting.');
    },
  });

  const endMeetingMutation = useMutation({
    mutationFn: endMeeting,
    onSuccess: () => {
      toast.success('Meeting ended.');
      queryClient.invalidateQueries({ queryKey: ['my-meetings'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to end meeting.');
    },
  });

  const availableUsers = useMemo(() => {
    const users = usersQuery.data || [];
    return users.filter((listedUser) => String(listedUser._id) !== currentUserId);
  }, [usersQuery.data, currentUserId]);

  const myMeetings = meetingsQuery.data || [];

  const handleCreateMeeting = async (payload) => {
    await createMeetingMutation.mutateAsync(payload);
  };

  const handleStartMeeting = async (meeting) => {
    setActionLoading(`start-${meeting._id}`);

    try {
      await startMeetingMutation.mutateAsync(meeting._id);
    } finally {
      setActionLoading('');
    }
  };

  const handleJoinMeeting = (meeting) => {
    const scheduledAtMs = meeting.scheduledAt
      ? new Date(meeting.scheduledAt).getTime()
      : null;

    if (
      meeting.status === 'scheduled' &&
      scheduledAtMs !== null &&
      scheduledAtMs > Date.now()
    ) {
      toast.error('This meeting is scheduled for a later time.');
      return;
    }

    setActionLoading(`join-${meeting._id}`);
    setMeetingState((previousState) => ({
      ...previousState,
      currentMeeting: meeting,
      participants: meeting.participants || [],
    }));

    setTimeout(() => setActionLoading(''), 100);
  };

  const handleEndMeeting = async (meeting) => {
    setActionLoading(`end-${meeting._id}`);

    try {
      await endMeetingMutation.mutateAsync(meeting._id);
    } finally {
      setActionLoading('');
    }
  };

  const handleLeaveMeetingRoom = useCallback(() => {
    setMeetingState(initialMeetingState);
    queryClient.invalidateQueries({ queryKey: ['my-meetings'] });
  }, [queryClient]);

  const handleMeetingStateChange = useCallback((nextState) => {
    setMeetingState((previousState) => ({
      ...previousState,
      ...nextState,
    }));
  }, []);

  if (!token) {
    return (
      <div className="container mx-auto px-6 py-12">
        <p className="text-muted-foreground">Please sign in to use meetings.</p>
      </div>
    );
  }

  if (meetingState.currentMeeting) {
    return (
      <div className="container mx-auto px-6 py-8 space-y-4">
        <Button variant="outline" onClick={handleLeaveMeetingRoom}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Meetings
        </Button>

        <VideoRoom
          meeting={meetingState.currentMeeting}
          currentUser={user}
          onLeave={handleLeaveMeetingRoom}
          onMeetingStateChange={handleMeetingStateChange}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meetings</h1>
          <p className="text-muted-foreground">
            Create and join video meetings with up to 5 participants.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => queryClient.invalidateQueries({ queryKey: ['my-meetings'] })}
          disabled={meetingsQuery.isFetching}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MeetingForm
          users={availableUsers}
          onSubmit={handleCreateMeeting}
          isSubmitting={createMeetingMutation.isPending}
        />

        <MeetingList
          meetings={myMeetings}
          currentUserId={currentUserId}
          onStart={handleStartMeeting}
          onJoin={handleJoinMeeting}
          onEnd={handleEndMeeting}
          actionLoading={actionLoading}
        />
      </div>

      {(usersQuery.isLoading || meetingsQuery.isLoading) && (
        <p className="text-sm text-muted-foreground">Loading meeting data...</p>
      )}
    </div>
  );
}
