const DEFAULT_API_BASE_URL = 'http://localhost:4000/api';
const DEFAULT_STUN_URLS = [
  'stun:stun.l.google.com:19302',
  'stun:stun1.l.google.com:19302',
];

const splitList = (value = '') => {
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseBoolean = (value = '') => {
  return ['1', 'true', 'yes', 'on'].includes(
    String(value).trim().toLowerCase()
  );
};

const normalizeUrl = (url = '') => {
  return String(url).trim().replace(/\/+$/, '');
};

const getTurnServer = () => {
  const turnUrls = splitList(
    import.meta.env.VITE_TURN_URLS || import.meta.env.VITE_TURN_URL
  );
  const username = String(import.meta.env.VITE_TURN_USERNAME || '').trim();
  const credential = String(
    import.meta.env.VITE_TURN_CREDENTIAL || import.meta.env.VITE_TURN_PASSWORD || ''
  ).trim();

  if (turnUrls.length === 0 || !username || !credential) {
    return null;
  }

  return {
    urls: turnUrls.length === 1 ? turnUrls[0] : turnUrls,
    username,
    credential,
  };
};

export const getApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL;
  return normalizeUrl(configuredUrl);
};

export const getSocketServerUrl = () => {
  return getApiBaseUrl().replace(/\/api$/, '');
};

export const getRtcConfig = () => {
  const extraStunUrls = splitList(import.meta.env.VITE_STUN_URLS || '');
  const stunUrls = Array.from(new Set([...DEFAULT_STUN_URLS, ...extraStunUrls]));

  const iceServers = stunUrls.map((url) => ({ urls: url }));
  const turnServer = getTurnServer();

  if (turnServer) {
    iceServers.push(turnServer);
  }

  return {
    iceServers,
    iceCandidatePoolSize: 10,
  };
};

export const isRealtimeDebugEnabled = () => {
  return parseBoolean(import.meta.env.VITE_ENABLE_WEBRTC_DEBUG || '');
};

export const realtimeDebugLog = (...args) => {
  if (isRealtimeDebugEnabled()) {
    console.info('[realtime]', ...args);
  }
};
