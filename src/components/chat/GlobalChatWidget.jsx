import React from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ChatApp from '@/pages/chat/ChatApp';

const ROUTES_WITH_EMBEDDED_CHAT = new Set(['/chat', '/community']);
const ROUTES_WITHOUT_CHAT = new Set(['/login', '/register']);

export default function GlobalChatWidget() {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const currentPath = location.pathname.replace(/\/+$/, '') || '/';
  const userId = user?._id || user?.id;

  if (!userId) {
    return null;
  }

  if (ROUTES_WITHOUT_CHAT.has(currentPath)) {
    return null;
  }

  if (ROUTES_WITH_EMBEDDED_CHAT.has(currentPath)) {
    return null;
  }

  return <ChatApp showFloatingButton />;
}
