import React from 'react';
import { Loader2, Mic, MicOff, Phone, PhoneOff } from 'lucide-react';

function formatDuration(totalSeconds = 0) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');

  return `${minutes}:${seconds}`;
}

export function CallScreen({
  phase = 'idle',
  peerName = 'User',
  isMuted = false,
  durationSeconds = 0,
  onAccept,
  onDecline,
  onEnd,
  onToggleMute,
}) {
  const title = peerName || 'User';
  const statusText =
    phase === 'incoming'
      ? 'Incoming call...'
      : phase === 'outgoing'
        ? 'Calling...'
        : phase === 'active'
          ? `In call · ${formatDuration(durationSeconds)}`
          : phase === 'connecting'
            ? 'Connecting...'
            : 'Call ended';

  return (
    <div className="h-full w-full bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 text-white flex flex-col items-center justify-center px-6">
      <div className="w-24 h-24 rounded-full bg-blue-500/90 flex items-center justify-center text-4xl font-bold shadow-xl border border-blue-300/20">
        {title.charAt(0).toUpperCase()}
      </div>

      <h2 className="mt-6 text-2xl font-bold text-center">{title}</h2>
      <p className="mt-2 text-sm text-blue-100/80 text-center">{statusText}</p>

      {(phase === 'outgoing' || phase === 'connecting') && (
        <Loader2 className="mt-6 w-6 h-6 animate-spin text-blue-200" />
      )}

      <div className="mt-10 flex items-center gap-4">
        {phase === 'incoming' && (
          <>
            <button
              type="button"
              onClick={onDecline}
              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"
              title="Decline"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={onAccept}
              className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center transition-colors"
              title="Accept"
            >
              <Phone className="w-6 h-6" />
            </button>
          </>
        )}

        {(phase === 'active' ||
          phase === 'connecting' ||
          phase === 'outgoing') && (
          <>
            {phase === 'active' && (
              <button
                type="button"
                onClick={onToggleMute}
                className="w-14 h-14 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <MicOff className="w-6 h-6" />
                ) : (
                  <Mic className="w-6 h-6" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onEnd}
              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors"
              title="End call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
