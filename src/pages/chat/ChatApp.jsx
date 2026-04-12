import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  MessageCircle,
  Search,
  Plus,
  Phone,
  Info,
  UserPlus,
} from 'lucide-react';
import { io } from 'socket.io-client';
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { GroupList } from '@/components/chat/GroupList';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { UserPickerModal } from '@/components/chat/UserPickerModal';
import { AddMembersModal } from '@/components/chat/AddMembersModal';
import { CallScreen } from '@/components/chat/CallScreen';
import {
  addMemberToGroup,
  createChatGroup,
  getChatGroupById,
  getUserChatGroups,
  removeMemberFromGroup,
} from '@/api/chatApi';

const rtcConfig = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

const getSocketServerUrl = () => {
  const apiBaseUrl = import.meta.env.VITE_API_URL;
  return apiBaseUrl.replace(/\/api\/?$/, '');
};

const initialCallState = {
  isVisible: false,
  phase: 'idle',
  callId: null,
  chatGroupId: null,
  peerUserId: null,
  peerName: '',
};

export default function ChatApp({
  isOpen: externalIsOpen,
  onOpen: externalOnOpen,
  onClose: externalOnClose,
  showFloatingButton = true,
  initialSelectedGroupId = null,
  hideConversationList = false,
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [chatFilter, setChatFilter] = useState('all');
  const [userPickerOpen, setUserPickerOpen] = useState(false);
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const [callState, setCallState] = useState({ ...initialCallState });
  const [isCallMuted, setIsCallMuted] = useState(false);
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);

  const callSocketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localAudioStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const disconnectedTimerRef = useRef(null);
  const pendingIceCandidatesRef = useRef([]);
  const activeCallStateRef = useRef(callState);
  const externalOnOpenRef = useRef(externalOnOpen);
  const externalOnCloseRef = useRef(externalOnClose);

  const { user, token: authToken } = useSelector((s) => s.auth);
  const queryClient = useQueryClient();

  useEffect(() => {
    activeCallStateRef.current = callState;
  }, [callState]);

  useEffect(() => {
    externalOnOpenRef.current = externalOnOpen;
    externalOnCloseRef.current = externalOnClose;
  }, [externalOnOpen, externalOnClose]);

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = useCallback((val) => {
    if (externalOnCloseRef.current) {
      if (val) {
        externalOnOpenRef.current?.();
      } else {
        externalOnCloseRef.current?.();
      }
      return;
    }

    setInternalIsOpen(val);
  }, []);

  const createDirectChatMutation = useMutation({
    mutationFn: async (selectedUser) => {
      return createChatGroup({
        name: 'Direct Message',
        description: 'Direct message conversation',
        type: 'DIRECT_MESSAGE',
        members: [selectedUser._id],
      });
    },
    onSuccess: (data) => {
      const newGroupId = data.data?._id;
      // Invalidate queries to refresh the chat list
      queryClient.invalidateQueries(['chat-groups']);
      // Set a small delay to ensure the group is fetched before selecting
      setTimeout(() => {
        setSelectedGroupId(newGroupId);
        setUserPickerOpen(false);
        setCreatingChat(false);
      }, 500);
    },
    onError: (error) => {
      console.error('Failed to create direct chat:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error message:', error.message);
      setCreatingChat(false);
      alert(
        `Failed to create chat: ${error.response?.data?.message || error.message || 'Unknown error'}`
      );
    },
  });

  const currentUserId = user?._id || user?.id;

  const deleteConversationMutation = useMutation({
    mutationFn: async ({ groupId, userId }) => {
      return removeMemberFromGroup(groupId, userId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries(['chat-groups']);

      if (selectedGroupId === variables.groupId) {
        setSelectedGroupId(null);
      }
    },
    onError: (error) => {
      alert(
        `Failed to delete conversation: ${
          error.response?.data?.message || error.message || 'Unknown error'
        }`
      );
    },
  });

  const addGroupMemberMutation = useMutation({
    mutationFn: async ({ groupId, userId }) => {
      return addMemberToGroup(groupId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['chat-groups']);
      queryClient.invalidateQueries(['chat-group', selectedGroupId]);
    },
    onError: (error) => {
      alert(
        `Failed to add member: ${
          error.response?.data?.message || error.message || 'Unknown error'
        }`
      );
    },
  });

  const cleanupCallMedia = useCallback(() => {
    if (disconnectedTimerRef.current) {
      clearTimeout(disconnectedTimerRef.current);
      disconnectedTimerRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localAudioStreamRef.current) {
      localAudioStreamRef.current.getTracks().forEach((track) => track.stop());
      localAudioStreamRef.current = null;
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    pendingIceCandidatesRef.current = [];

    setIsCallMuted(false);
  }, []);

  const closeCallScreen = useCallback(() => {
    cleanupCallMedia();
    setCallState({ ...initialCallState });
    setCallDurationSeconds(0);
  }, [cleanupCallMedia]);

  const emitCallEndAndClose = useCallback(
    (reason = 'ended') => {
      const activeCall = activeCallStateRef.current;

      if (activeCall.callId && callSocketRef.current?.connected) {
        callSocketRef.current.emit('call-end', {
          callId: activeCall.callId,
          reason,
        });
      }

      closeCallScreen();
    },
    [closeCallScreen]
  );

  const ensureLocalAudioStream = useCallback(async () => {
    if (localAudioStreamRef.current) {
      return localAudioStreamRef.current;
    }

    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    localAudioStreamRef.current = localStream;
    setIsCallMuted(false);

    return localStream;
  }, []);

  const createPeerConnection = useCallback(
    async (remoteUserId, callId) => {
      if (!remoteUserId || !callId) {
        return null;
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      const localStream = await ensureLocalAudioStream();
      const peerConnection = new RTCPeerConnection(rtcConfig);

      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      peerConnection.onicecandidate = (event) => {
        if (!event.candidate || !callSocketRef.current) {
          return;
        }

        callSocketRef.current.emit('ice-candidate', {
          callId,
          toUserId: String(remoteUserId),
          candidate: event.candidate,
        });
      };

      peerConnection.ontrack = (event) => {
        const [remoteStream] = event.streams;

        if (remoteAudioRef.current && remoteStream) {
          remoteAudioRef.current.srcObject = remoteStream;
          remoteAudioRef.current.play().catch(() => {});
        }
      };

      peerConnection.onconnectionstatechange = () => {
        const connectionState = peerConnection.connectionState;

        if (connectionState === 'connected') {
          if (disconnectedTimerRef.current) {
            clearTimeout(disconnectedTimerRef.current);
            disconnectedTimerRef.current = null;
          }

          setCallState((previous) => {
            if (previous.callId && String(previous.callId) !== String(callId)) {
              return previous;
            }

            if (previous.phase === 'active') {
              return previous;
            }

            return {
              ...previous,
              callId: previous.callId || callId,
              phase: 'active',
            };
          });

          return;
        }

        if (connectionState === 'disconnected') {
          if (disconnectedTimerRef.current) {
            clearTimeout(disconnectedTimerRef.current);
          }

          disconnectedTimerRef.current = setTimeout(() => {
            const currentPeerConnection = peerConnectionRef.current;

            if (
              currentPeerConnection &&
              currentPeerConnection.connectionState === 'disconnected'
            ) {
              closeCallScreen();
            }
          }, 8000);

          return;
        }

        if (connectionState === 'failed' || connectionState === 'closed') {
          if (disconnectedTimerRef.current) {
            clearTimeout(disconnectedTimerRef.current);
            disconnectedTimerRef.current = null;
          }

          closeCallScreen();
        }
      };

      peerConnectionRef.current = peerConnection;
      return peerConnection;
    },
    [closeCallScreen, ensureLocalAudioStream]
  );

  const flushPendingIceCandidates = useCallback(async (callId) => {
    const peerConnection = peerConnectionRef.current;

    if (!peerConnection || !peerConnection.remoteDescription || !callId) {
      return;
    }

    const targetCallId = String(callId);
    const pendingCandidates = pendingIceCandidatesRef.current.filter(
      (item) => item.callId === targetCallId
    );

    pendingIceCandidatesRef.current = pendingIceCandidatesRef.current.filter(
      (item) => item.callId !== targetCallId
    );

    for (const item of pendingCandidates) {
      try {
        await peerConnection.addIceCandidate(
          new RTCIceCandidate(item.candidate)
        );
      } catch {
        // Ignore invalid or stale candidates.
      }
    }
  }, []);

  const handleClose = () => {
    if (activeCallStateRef.current.isVisible) {
      emitCallEndAndClose('ended');
    }

    setIsOpen(false);
  };

  const handleSelectGroup = (groupId) => {
    setSelectedGroupId(groupId);
  };

  useEffect(() => {
    if (!isOpen || !initialSelectedGroupId) {
      return;
    }

    setSelectedGroupId(initialSelectedGroupId);
  }, [initialSelectedGroupId, isOpen]);

  const handleUserSelected = (selectedUser) => {
    setCreatingChat(true);
    createDirectChatMutation.mutate(selectedUser);
  };

  const handleDeleteConversation = (group) => {
    if (!currentUserId) {
      return;
    }

    const confirmed = window.confirm(
      `Delete conversation "${group.displayName || group.name || 'Chat'}" from your list?`
    );

    if (!confirmed) {
      return;
    }

    deleteConversationMutation.mutate({
      groupId: group._id,
      userId: currentUserId,
    });
  };

  const handleAddMemberToCurrentGroup = (selectedUser) => {
    if (!selectedGroupId || !selectedUser?._id) {
      return;
    }

    addGroupMemberMutation.mutate({
      groupId: selectedGroupId,
      userId: selectedUser._id,
    });
  };

  const handleToggleMute = useCallback(() => {
    setIsCallMuted((previousMuted) => {
      const nextMuted = !previousMuted;

      if (localAudioStreamRef.current) {
        localAudioStreamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = !nextMuted;
        });
      }

      return nextMuted;
    });
  }, []);

  const ensureCallSocketConnected = useCallback((timeoutMs = 5000) => {
    return new Promise((resolve) => {
      const socket = callSocketRef.current;

      if (!socket) {
        resolve(false);
        return;
      }

      if (socket.connected) {
        resolve(true);
        return;
      }

      let settled = false;

      const cleanup = () => {
        socket.off('connect', handleConnect);
        socket.off('connect_error', handleConnectError);
        clearTimeout(timeoutId);
      };

      const complete = (connected) => {
        if (settled) {
          return;
        }

        settled = true;
        cleanup();
        resolve(connected);
      };

      const handleConnect = () => complete(true);
      const handleConnectError = () => complete(Boolean(socket.connected));

      const timeoutId = setTimeout(() => {
        complete(Boolean(socket.connected));
      }, timeoutMs);

      socket.on('connect', handleConnect);
      socket.on('connect_error', handleConnectError);
      socket.connect();
    });
  }, []);

  const handleAcceptIncomingCall = useCallback(async () => {
    const activeCall = activeCallStateRef.current;

    if (!activeCall.callId || !callSocketRef.current?.connected) {
      return;
    }

    try {
      await ensureLocalAudioStream();
      setCallState((previous) => ({
        ...previous,
        phase: 'connecting',
      }));

      callSocketRef.current.emit('call-accept', {
        callId: activeCall.callId,
      });
    } catch {
      alert('Microphone permission is required to accept calls.');
      callSocketRef.current.emit('call-decline', {
        callId: activeCall.callId,
      });
      closeCallScreen();
    }
  }, [closeCallScreen, ensureLocalAudioStream]);

  const handleDeclineIncomingCall = useCallback(() => {
    const activeCall = activeCallStateRef.current;

    if (activeCall.callId && callSocketRef.current?.connected) {
      callSocketRef.current.emit('call-decline', {
        callId: activeCall.callId,
      });
    }

    closeCallScreen();
  }, [closeCallScreen]);

  const handleEndCall = useCallback(() => {
    emitCallEndAndClose('ended');
  }, [emitCallEndAndClose]);

  const { data: chatGroupsSummary } = useQuery({
    queryKey: ['chat-groups'],
    queryFn: getUserChatGroups,
    enabled: Boolean(currentUserId) && showFloatingButton,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const totalUnreadCount = (chatGroupsSummary?.data || []).reduce(
    (sum, group) => sum + Number(group?.unreadCount || 0),
    0
  );

  const unreadBadgeText =
    totalUnreadCount > 99 ? '99+' : String(totalUnreadCount);

  // Fetch current group details
  const { data: currentGroup } = useQuery({
    queryKey: ['chat-group', selectedGroupId],
    queryFn: () => getChatGroupById(selectedGroupId),
    enabled: !!selectedGroupId,
    refetchInterval: selectedGroupId ? 3000 : false,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const currentGroupName =
    currentGroup?.data?.displayName || currentGroup?.data?.name || 'Chat';
  const currentGroupType = currentGroup?.data?.type || 'DIRECT_MESSAGE';
  const currentGroupRecipientUserId = currentGroup?.data?.recipientUserId;
  const currentGroupRecipientIsOnline = Boolean(
    currentGroup?.data?.recipientIsOnline
  );
  const currentGroupRecipientLastSeen = currentGroup?.data?.recipientLastSeen;
  const canManageGroupMembers = ['admin', 'organizer'].includes(
    (user?.role || '').toLowerCase()
  );
  const currentGroupMemberIds = (currentGroup?.data?.members || [])
    .map(
      (member) =>
        (typeof member === 'object' && member?._id?.toString?.()) ||
        member?.toString?.()
    )
    .filter(Boolean);
  const currentGroupMemberNameMap = (currentGroup?.data?.members || []).reduce(
    (accumulator, member) => {
      const memberId =
        (typeof member === 'object' && member?._id?.toString?.()) ||
        member?.toString?.();

      if (!memberId) {
        return accumulator;
      }

      accumulator[memberId] =
        (typeof member === 'object' && (member?.name || member?.email)) ||
        'Member';
      return accumulator;
    },
    {}
  );

  const handleStartDirectCall = async () => {
    if (currentGroupType !== 'DIRECT_MESSAGE' || !selectedGroupId) {
      return;
    }

    if (!currentGroupRecipientUserId) {
      alert('Could not determine the recipient for this chat.');
      return;
    }

    const isConnected = await ensureCallSocketConnected();

    if (!isConnected) {
      alert('Calling service is unavailable right now. Please try again.');
      return;
    }

    try {
      await ensureLocalAudioStream();
    } catch {
      alert('Microphone permission is required to start a call.');
      return;
    }

    setCallState({
      isVisible: true,
      phase: 'outgoing',
      callId: null,
      chatGroupId: selectedGroupId,
      peerUserId: String(currentGroupRecipientUserId),
      peerName: currentGroupName,
    });
    setCallDurationSeconds(0);

    callSocketRef.current.emit('call-request', {
      toUserId: String(currentGroupRecipientUserId),
      chatGroupId: selectedGroupId,
    });
  };

  useEffect(() => {
    if (callState.phase !== 'active') {
      setCallDurationSeconds(0);
      return undefined;
    }

    const startedAt = Date.now();
    const intervalId = setInterval(() => {
      setCallDurationSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [callState.phase, callState.callId]);

  useEffect(() => {
    if (!currentUserId) {
      return undefined;
    }

    const token =
      authToken || Cookies.get('token') || localStorage.getItem('token');

    if (!token) {
      return undefined;
    }

    const socket = io(`${getSocketServerUrl()}/chat-call`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    callSocketRef.current = socket;

    socket.on('presence-updated', () => {
      queryClient.invalidateQueries(['chat-groups']);
      queryClient.invalidateQueries(['chat-group']);
    });

    socket.on('outgoing-ringing', (payload = {}) => {
      setCallState((previous) => ({
        ...previous,
        isVisible: true,
        phase: 'outgoing',
        callId: payload.callId || previous.callId,
      }));
    });

    socket.on('call-unavailable', (payload = {}) => {
      alert(payload.message || 'Recipient is currently unavailable for calls.');
      closeCallScreen();
    });

    socket.on('call-error', (payload = {}) => {
      alert(payload.message || 'Failed to start call.');
      closeCallScreen();
    });

    socket.on('incoming-call', (payload = {}) => {
      const activeCall = activeCallStateRef.current;

      if (activeCall.isVisible && activeCall.callId) {
        socket.emit('call-decline', { callId: payload.callId });
        return;
      }

      setIsOpen(true);

      if (payload.chatGroupId) {
        setSelectedGroupId(payload.chatGroupId);
      }

      setCallState({
        isVisible: true,
        phase: 'incoming',
        callId: payload.callId || null,
        chatGroupId: payload.chatGroupId || null,
        peerUserId: payload.fromUserId ? String(payload.fromUserId) : null,
        peerName: payload.fromUserName || 'User',
      });
      setCallDurationSeconds(0);
    });

    socket.on('call-accepted', async (payload = {}) => {
      const peerUserId =
        String(payload.fromUserId) === String(currentUserId)
          ? String(payload.toUserId)
          : String(payload.fromUserId);

      setCallState((previous) => ({
        ...previous,
        isVisible: true,
        phase: 'connecting',
        callId: payload.callId || previous.callId,
        chatGroupId: payload.chatGroupId || previous.chatGroupId,
        peerUserId,
      }));
      setCallDurationSeconds(0);

      try {
        const peerConnection = await createPeerConnection(
          peerUserId,
          payload.callId
        );

        if (!peerConnection) {
          return;
        }

        const shouldCreateOffer =
          String(payload.fromUserId) === String(currentUserId);

        if (shouldCreateOffer) {
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);

          socket.emit('offer', {
            callId: payload.callId,
            toUserId: peerUserId,
            sdp: offer,
          });
        }
      } catch {
        alert('Failed to establish call connection.');
        closeCallScreen();
      }
    });

    socket.on('offer', async (payload = {}) => {
      const { callId, fromUserId, sdp } = payload;
      const activeCall = activeCallStateRef.current;

      if (activeCall.callId && String(activeCall.callId) !== String(callId)) {
        return;
      }

      setCallState((previous) => ({
        ...previous,
        isVisible: true,
        phase:
          previous.phase === 'incoming' || previous.phase === 'active'
            ? 'connecting'
            : previous.phase,
        callId: previous.callId || callId,
        peerUserId: previous.peerUserId || String(fromUserId),
      }));

      try {
        const peerConnection = await createPeerConnection(fromUserId, callId);

        if (!peerConnection) {
          return;
        }

        if (peerConnection.signalingState === 'have-local-offer') {
          await peerConnection.setLocalDescription({ type: 'rollback' });
        }

        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(sdp)
        );

        await flushPendingIceCandidates(callId);

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socket.emit('answer', {
          callId,
          toUserId: fromUserId,
          sdp: answer,
        });
      } catch {
        alert('Failed to process incoming call offer.');
      }
    });

    socket.on('answer', async (payload = {}) => {
      const { callId, sdp } = payload;
      const peerConnection = peerConnectionRef.current;
      const activeCall = activeCallStateRef.current;

      if (
        !peerConnection ||
        (activeCall.callId && String(activeCall.callId) !== String(callId))
      ) {
        return;
      }

      setCallState((previous) => ({
        ...previous,
        callId: previous.callId || callId,
      }));

      try {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(sdp)
        );
        await flushPendingIceCandidates(callId);
      } catch {
        // Ignore transient answer sync failures.
      }
    });

    socket.on('ice-candidate', async (payload = {}) => {
      const { callId, candidate } = payload;
      const peerConnection = peerConnectionRef.current;
      const activeCall = activeCallStateRef.current;

      if (
        !candidate ||
        (activeCall.callId && String(activeCall.callId) !== String(callId))
      ) {
        return;
      }

      if (!peerConnection || !peerConnection.remoteDescription) {
        pendingIceCandidatesRef.current.push({
          callId: String(callId),
          candidate,
        });
        return;
      }

      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        // Ignore stale ICE candidates.
      }
    });

    socket.on('call-declined', () => {
      alert('Call was declined.');
      closeCallScreen();
    });

    socket.on('call-ended', () => {
      closeCallScreen();
    });

    socket.on('disconnect', () => {
      if (activeCallStateRef.current.isVisible) {
        closeCallScreen();
      }
    });

    socket.on('connect_error', () => {
      if (activeCallStateRef.current.isVisible) {
        alert('Calling service connection failed.');
        closeCallScreen();
      }
    });

    return () => {
      socket.disconnect();

      if (callSocketRef.current === socket) {
        callSocketRef.current = null;
      }
    };
  }, [
    authToken,
    closeCallScreen,
    createPeerConnection,
    currentUserId,
    ensureCallSocketConnected,
    flushPendingIceCandidates,
    queryClient,
    setIsOpen,
  ]);

  return (
    <>
      {/* Floating Button - only show if showFloatingButton is true */}
      {showFloatingButton && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 group"
          title="Open Messages"
        >
          <MessageCircle
            size={24}
            className="group-hover:rotate-12 transition-transform"
          />

          {totalUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-blue-700">
              {unreadBadgeText}
            </span>
          )}
        </button>
      )}

      {/* Modal Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={handleClose}
        />
      )}

      {/* Modal Window */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="w-full max-w-5xl h-[90vh] sm:h-[85vh] rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 relative">
            <div
              className={`absolute inset-0 flex flex-col sm:flex-row transition-all duration-300 ${
                callState.isVisible
                  ? 'opacity-0 pointer-events-none translate-y-3'
                  : 'opacity-100 translate-y-0'
              }`}
            >
              {!hideConversationList && (
                <div className="w-full sm:w-96 bg-white dark:bg-gray-800 flex flex-col border-r border-gray-200 dark:border-gray-700 min-h-0">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Chats
                    </h2>
                    <button
                      onClick={() => setUserPickerOpen(true)}
                      className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-blue-600 dark:text-blue-400"
                      title="Start new chat"
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="relative">
                      <Search
                        size={18}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                      />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className="px-2 py-3 border-b border-gray-200 dark:border-gray-700 flex gap-1 bg-white dark:bg-gray-800">
                    <button
                      onClick={() => setChatFilter('all')}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-2 ${
                        chatFilter === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setChatFilter('unread')}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-2 ${
                        chatFilter === 'unread'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Unread
                    </button>
                    <button
                      onClick={() => setChatFilter('favorites')}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-2 ${
                        chatFilter === 'favorites'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Favorites
                    </button>
                    <button
                      onClick={() => setChatFilter('archived')}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-2 ${
                        chatFilter === 'archived'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      Archived
                    </button>
                  </div>

                  {/* Group List */}
                  <div className="flex-1 overflow-y-auto min-h-0">
                    <GroupList
                      currentUserId={currentUserId}
                      selectedGroupId={selectedGroupId}
                      onSelectGroup={handleSelectGroup}
                      onDeleteGroup={handleDeleteConversation}
                      deletingGroupId={
                        deleteConversationMutation.isPending
                          ? deleteConversationMutation.variables?.groupId
                          : null
                      }
                      searchTerm={searchTerm}
                      chatFilter={chatFilter}
                    />
                  </div>
                </div>
              )}

              {/* Right Side - Chat Window */}
              <div className="flex-1 min-h-0 bg-gray-50 dark:bg-gray-900 flex flex-col">
                {selectedGroupId ? (
                  <>
                    {/* Chat Header */}
                    <div className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
                          {currentGroupName.charAt(0)?.toUpperCase() || 'C'}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                            {currentGroupName}
                          </h3>
                          {currentGroupType === 'DIRECT_MESSAGE' && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {currentGroupRecipientIsOnline
                                ? 'Online'
                                : currentGroupRecipientLastSeen
                                  ? `Last seen ${new Date(
                                      currentGroupRecipientLastSeen
                                    ).toLocaleString()}`
                                  : 'Offline'}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {canManageGroupMembers &&
                          currentGroupType !== 'DIRECT_MESSAGE' && (
                            <button
                              onClick={() => setAddMembersOpen(true)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                              title="Add members"
                            >
                              <UserPlus
                                size={20}
                                className="text-gray-600 dark:text-gray-400"
                              />
                            </button>
                          )}

                        {currentGroupType === 'DIRECT_MESSAGE' && (
                          <button
                            onClick={handleStartDirectCall}
                            disabled={callState.isVisible}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Start call"
                          >
                            <Phone
                              size={20}
                              className="text-gray-600 dark:text-gray-400"
                            />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 min-h-0 overflow-hidden bg-white dark:bg-gray-900">
                      <MessageList
                        groupId={selectedGroupId}
                        groupType={currentGroupType}
                        memberNameMap={currentGroupMemberNameMap}
                      />
                    </div>

                    {/* Message Input */}
                    <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-sm">
                      <MessageInput groupId={selectedGroupId} />
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-6 bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
                    <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                      <MessageCircle
                        className="text-blue-600 dark:text-blue-400"
                        size={40}
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Select a chat to start
                    </h3>
                  </div>
                )}
              </div>
            </div>

            <div
              className={`absolute inset-0 transition-all duration-300 ${
                callState.isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 pointer-events-none -translate-y-3'
              }`}
            >
              <CallScreen
                phase={callState.phase}
                peerName={callState.peerName}
                isMuted={isCallMuted}
                durationSeconds={callDurationSeconds}
                onAccept={handleAcceptIncomingCall}
                onDecline={handleDeclineIncomingCall}
                onEnd={handleEndCall}
                onToggleMute={handleToggleMute}
              />

              <audio
                ref={remoteAudioRef}
                autoPlay
                playsInline
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}

      {/* User Picker Modal */}
      <UserPickerModal
        isOpen={userPickerOpen}
        onClose={() => setUserPickerOpen(false)}
        onUserSelected={handleUserSelected}
      />

      <AddMembersModal
        isOpen={addMembersOpen}
        onClose={() => setAddMembersOpen(false)}
        onAddMember={handleAddMemberToCurrentGroup}
        currentMemberIds={currentGroupMemberIds}
        isAdding={addGroupMemberMutation.isPending}
        addingUserId={
          addGroupMemberMutation.isPending
            ? addGroupMemberMutation.variables?.userId
            : null
        }
      />
    </>
  );
}
