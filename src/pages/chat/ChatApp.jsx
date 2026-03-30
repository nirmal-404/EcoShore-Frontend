import React, { useState } from 'react';
import { MessageCircle, X, Search, Plus } from 'lucide-react';
import { useSelector } from 'react-redux';
import { GroupList } from '@/components/chat/GroupList';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';

export default function ChatApp({ isOpen: externalIsOpen, onClose: externalOnClose, showFloatingButton = true }) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [chatFilter, setChatFilter] = useState('all');
  const { user } = useSelector((s) => s.auth);

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnClose ? (val) => {
    if (!val) externalOnClose();
  } : setInternalIsOpen;

  const currentUser = {
    _id: user?._id || 'current-user',
    name: user?.name || 'You',
    email: user?.email || 'user@company.com',
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSelectGroup = (groupId) => {
    setSelectedGroupId(groupId);
  };

  return (
    <>
      {/* Floating Button - only show if showFloatingButton is true */}
      {showFloatingButton && (
        <button
          onClick={() => setInternalIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 group"
          title="Open Messages"
        >
          <MessageCircle size={24} className="group-hover:rotate-12 transition-transform" />
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
          <div className="w-full max-w-5xl h-[90vh] sm:h-[85vh] rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-gray-900 flex flex-col sm:flex-row border border-gray-100 dark:border-gray-800">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={24} className="text-gray-600 dark:text-gray-400" />
            </button>

            {/* Left Sidebar - Conversations List */}
            <div className="w-full sm:w-96 bg-white dark:bg-gray-800 flex flex-col border-r border-gray-200 dark:border-gray-700 min-h-0">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Chats</h2>
                <button
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-blue-600 dark:text-blue-400"
                  title="Start new chat"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Search Bar */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setChatFilter('unread')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-2 ${
                    chatFilter === 'unread'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Unread
                </button>
                <button
                  onClick={() => setChatFilter('favorites')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-2 ${
                    chatFilter === 'favorites'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Favorites
                </button>
              </div>

              {/* Group List */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <GroupList
                  selectedGroupId={selectedGroupId}
                  onSelectGroup={handleSelectGroup}
                  searchTerm={searchTerm}
                  chatFilter={chatFilter}
                />
              </div>
            </div>

            {/* Right Side - Chat Window */}
            <div className="flex-1 min-h-0 bg-white dark:bg-gray-900 flex flex-col">
              {selectedGroupId ? (
                <>
                  {/* Messages Container */}
                  <div className="flex-1 min-h-0 overflow-hidden bg-white dark:bg-gray-900">
                    <MessageList groupId={selectedGroupId} />
                  </div>

                  {/* Message Input */}
                  <div className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-sm">
                    <MessageInput groupId={selectedGroupId} />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                  <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                    <MessageCircle className="text-blue-600 dark:text-blue-400" size={40} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Select a group to chat
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm">
                    Choose a group from the list to start your conversation and coordinate cleanup efforts.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
