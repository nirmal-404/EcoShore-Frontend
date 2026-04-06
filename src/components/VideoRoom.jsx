import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { Loader2, Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const rtcConfig = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

const getSocketServerUrl = () => {
  const apiBaseUrl =
    import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  return apiBaseUrl.replace(/\/api\/?$/, '');
};

const shouldInitiateOffer = (localUserId, remoteUserId) => {
  return String(localUserId) > String(remoteUserId);
};

function StreamTile({ label, stream, muted = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  return (
    <div className="relative overflow-hidden rounded-xl border bg-black/95">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="h-52 w-full object-cover sm:h-64"
      />
      <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
        {label}
      </div>
    </div>
  );
}

export default function VideoRoom({
  meeting,
  currentUser,
  onLeave,
  onMeetingStateChange,
}) {
  const currentUserId = String(currentUser?.id || currentUser?._id || '');

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isJoining, setIsJoining] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [participants, setParticipants] = useState([]);

  const localStreamRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const participantsRef = useRef([]);
  const onLeaveRef = useRef(onLeave);
  const onMeetingStateChangeRef = useRef(onMeetingStateChange);

  const meetingId = meeting?._id;

  useEffect(() => {
    onLeaveRef.current = onLeave;
  }, [onLeave]);

  useEffect(() => {
    onMeetingStateChangeRef.current = onMeetingStateChange;
  }, [onMeetingStateChange]);

  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  const remoteEntries = useMemo(() => {
    return Object.entries(remoteStreams);
  }, [remoteStreams]);

  const syncMeetingState = useCallback(
    (nextParticipants = participantsRef.current) => {
      if (!onMeetingStateChangeRef.current) {
        return;
      }

      onMeetingStateChangeRef.current({
        currentMeeting: meeting,
        participants: nextParticipants,
        localStream: localStreamRef.current,
        peerConnections: peerConnectionsRef.current,
      });
    },
    [meeting]
  );

  const removePeerConnection = useCallback(
    (remoteUserId) => {
      const peerConnection = peerConnectionsRef.current[remoteUserId];

      if (peerConnection) {
        peerConnection.ontrack = null;
        peerConnection.onicecandidate = null;
        peerConnection.onconnectionstatechange = null;
        peerConnection.close();
        delete peerConnectionsRef.current[remoteUserId];
      }

      setRemoteStreams((previousStreams) => {
        if (!previousStreams[remoteUserId]) {
          return previousStreams;
        }

        const nextStreams = { ...previousStreams };
        delete nextStreams[remoteUserId];
        return nextStreams;
      });

      syncMeetingState(participantsRef.current);
    },
    [syncMeetingState]
  );

  const createPeerConnection = useCallback(
    (remoteUserId) => {
      if (!remoteUserId || String(remoteUserId) === currentUserId) {
        return null;
      }

      if (peerConnectionsRef.current[remoteUserId]) {
        return peerConnectionsRef.current[remoteUserId];
      }

      const peerConnection = new RTCPeerConnection(rtcConfig);

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          peerConnection.addTrack(track, localStreamRef.current);
        });
      }

      peerConnection.onicecandidate = (event) => {
        if (!event.candidate || !socketRef.current) {
          return;
        }

        socketRef.current.emit('ice-candidate', {
          meetingId,
          toUserId: remoteUserId,
          candidate: event.candidate,
        });
      };

      peerConnection.ontrack = (event) => {
        const [stream] = event.streams;

        if (!stream) {
          return;
        }

        setRemoteStreams((previousStreams) => ({
          ...previousStreams,
          [remoteUserId]: stream,
        }));
      };

      peerConnection.onconnectionstatechange = () => {
        if (
          peerConnection.connectionState === 'failed' ||
          peerConnection.connectionState === 'closed'
        ) {
          removePeerConnection(remoteUserId);
        }
      };

      peerConnectionsRef.current[remoteUserId] = peerConnection;
      syncMeetingState(participantsRef.current);

      return peerConnection;
    },
    [currentUserId, meetingId, removePeerConnection, syncMeetingState]
  );

  const createAndSendOffer = useCallback(
    async (remoteUserId) => {
      if (!shouldInitiateOffer(currentUserId, remoteUserId)) {
        return;
      }

      const peerConnection = createPeerConnection(remoteUserId);

      if (!peerConnection || peerConnection.signalingState !== 'stable') {
        return;
      }

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socketRef.current?.emit('offer', {
        meetingId,
        toUserId: remoteUserId,
        sdp: offer,
      });
    },
    [createPeerConnection, currentUserId, meetingId]
  );

  const disconnectAndCleanup = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    Object.values(peerConnectionsRef.current).forEach((peerConnection) => {
      peerConnection.close();
    });
    peerConnectionsRef.current = {};

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    setLocalStream(null);
    setRemoteStreams({});
    setParticipants([]);
    participantsRef.current = [];
    setIsMuted(false);
    setIsCameraOff(false);
    setIsJoining(false);
  }, []);

  useEffect(() => {
    if (!meetingId || !currentUserId) {
      return undefined;
    }

    let isMounted = true;

    const initializeMeetingRoom = async () => {
      try {
        setIsJoining(true);

        const localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!isMounted) {
          localStream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStreamRef.current = localStream;
        setLocalStream(localStream);

        syncMeetingState(participantsRef.current);

        const token = Cookies.get('token') || localStorage.getItem('token');

        if (!token) {
          throw new Error(
            'Authentication token missing. Please sign in again.'
          );
        }

        const socket = io(getSocketServerUrl(), {
          auth: { token },
          transports: ['websocket'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          socket.emit('join-meeting', {
            meetingId,
            userId: currentUserId,
          });
        });

        socket.on('existing-participants', async ({ participants = [] }) => {
          const uniqueParticipants = [
            ...new Set(participants.map(String)),
          ].filter((participantId) => participantId !== currentUserId);

          participantsRef.current = uniqueParticipants;
          setParticipants(uniqueParticipants);
          syncMeetingState(uniqueParticipants);

          for (const participantId of uniqueParticipants) {
            try {
              await createAndSendOffer(participantId);
            } catch (error) {
              toast.error('Failed to establish one of the peer connections.');
            }
          }

          setIsJoining(false);
        });

        socket.on('participant-joined', ({ userId }) => {
          const joinedUserId = String(userId || '');

          if (!joinedUserId || joinedUserId === currentUserId) {
            return;
          }

          setParticipants((previousParticipants) => {
            if (previousParticipants.includes(joinedUserId)) {
              return previousParticipants;
            }

            const nextParticipants = [...previousParticipants, joinedUserId];
            participantsRef.current = nextParticipants;
            syncMeetingState(nextParticipants);
            return nextParticipants;
          });

          createAndSendOffer(joinedUserId).catch(() => {
            toast.error('Failed to connect to a newly joined participant.');
          });
        });

        socket.on('participant-left', ({ userId }) => {
          const leftUserId = String(userId || '');

          if (!leftUserId) {
            return;
          }

          setParticipants((previousParticipants) => {
            const nextParticipants = previousParticipants.filter(
              (participantId) => participantId !== leftUserId
            );
            participantsRef.current = nextParticipants;
            syncMeetingState(nextParticipants);
            return nextParticipants;
          });

          removePeerConnection(leftUserId);
        });

        socket.on('offer', async ({ fromUserId, toUserId, sdp }) => {
          if (String(toUserId) !== currentUserId || !fromUserId || !sdp) {
            return;
          }

          const remoteUserId = String(fromUserId);
          const peerConnection = createPeerConnection(remoteUserId);

          if (!peerConnection) {
            return;
          }

          try {
            if (peerConnection.signalingState === 'have-local-offer') {
              await peerConnection.setLocalDescription({ type: 'rollback' });
            }

            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(sdp)
            );

            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            socket.emit('answer', {
              meetingId,
              toUserId: remoteUserId,
              sdp: answer,
            });
          } catch (error) {
            toast.error('Failed to handle incoming meeting offer.');
          }
        });

        socket.on('answer', async ({ fromUserId, toUserId, sdp }) => {
          if (String(toUserId) !== currentUserId || !fromUserId || !sdp) {
            return;
          }

          const remoteUserId = String(fromUserId);
          const peerConnection = createPeerConnection(remoteUserId);

          if (!peerConnection) {
            return;
          }

          try {
            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(sdp)
            );
          } catch (error) {
            toast.error('Failed to finalize peer connection answer.');
          }
        });

        socket.on(
          'ice-candidate',
          async ({ fromUserId, toUserId, candidate }) => {
            if (
              String(toUserId) !== currentUserId ||
              !fromUserId ||
              !candidate
            ) {
              return;
            }

            const remoteUserId = String(fromUserId);
            const peerConnection = createPeerConnection(remoteUserId);

            if (!peerConnection) {
              return;
            }

            try {
              await peerConnection.addIceCandidate(
                new RTCIceCandidate(candidate)
              );
            } catch (error) {
              // Ignore transient ICE add failures during rapid disconnect/reconnect.
            }
          }
        );

        socket.on('join-error', ({ message }) => {
          toast.error(message || 'Failed to join meeting.');
          disconnectAndCleanup();
          if (onLeaveRef.current) {
            onLeaveRef.current();
          }
        });

        socket.on('connect_error', (error) => {
          toast.error(error.message || 'Socket connection failed.');
          setIsJoining(false);
        });
      } catch (error) {
        if (error.name === 'NotAllowedError') {
          toast.error('Camera or microphone permission was denied.');
        } else if (error.name === 'NotFoundError') {
          toast.error('No camera or microphone was found on this device.');
        } else {
          toast.error(error.message || 'Failed to initialize video room.');
        }

        disconnectAndCleanup();
        if (onLeaveRef.current) {
          onLeaveRef.current();
        }
      }
    };

    initializeMeetingRoom();

    return () => {
      isMounted = false;
      disconnectAndCleanup();
    };
  }, [
    createAndSendOffer,
    createPeerConnection,
    currentUserId,
    disconnectAndCleanup,
    meetingId,
    onLeave,
    removePeerConnection,
    syncMeetingState,
  ]);

  const handleToggleMute = () => {
    if (!localStreamRef.current) {
      return;
    }

    const nextMuted = !isMuted;
    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setIsMuted(nextMuted);
  };

  const handleToggleCamera = () => {
    if (!localStreamRef.current) {
      return;
    }

    const nextCameraOff = !isCameraOff;
    localStreamRef.current.getVideoTracks().forEach((track) => {
      track.enabled = !nextCameraOff;
    });
    setIsCameraOff(nextCameraOff);
  };

  const handleLeaveMeeting = () => {
    disconnectAndCleanup();
    if (onLeaveRef.current) {
      onLeaveRef.current();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>{meeting.title}</CardTitle>
          <p className="text-xs text-muted-foreground">
            Mesh room, max 5 participants
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={handleToggleMute}>
            {isMuted ? <MicOff /> : <Mic />}
            {isMuted ? 'Unmute' : 'Mute'}
          </Button>
          <Button type="button" variant="outline" onClick={handleToggleCamera}>
            {isCameraOff ? <VideoOff /> : <Video />}
            {isCameraOff ? 'Camera On' : 'Camera Off'}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleLeaveMeeting}
          >
            <PhoneOff />
            Leave
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isJoining && (
          <div className="flex items-center gap-2 rounded-lg border border-border/60 p-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Joining meeting room...
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StreamTile label="You" stream={localStream} muted />

          {remoteEntries.map(([remoteUserId, stream]) => (
            <StreamTile
              key={remoteUserId}
              label={`User ${remoteUserId.slice(-4)}`}
              stream={stream}
            />
          ))}
        </div>

        {remoteEntries.length === 0 && !isJoining && (
          <p className="text-sm text-muted-foreground">
            No remote participants connected yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
