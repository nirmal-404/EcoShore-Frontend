import React, { useState } from 'react';
import { MessageCircle, X, Search, Plus, Loader2, Phone, Info } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { GroupList } from '@/components/chat/GroupList';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { UserPickerModal } from '@/components/chat/UserPickerModal';
import { createChatGroup, getChatGroupById } from '@/api/chatApi';

export default function ChatApp({ isOpen: externalIsOpen, onClose: externalOnClose, showFloatingButton = true }) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [chatFilter, setChatFilter] = useState('all');
  const [userPickerOpen, setUserPickerOpen] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const { user } = useSelector((s) => s.auth);
  const queryClient = useQueryClient();

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnClose ? (val) => {
    if (!val) externalOnClose();
  } : setInternalIsOpen;

  const createDirectChatMutation = useMutation({
    mutationFn: async (selectedUser) => {
      return createChatGroup({
        name: selectedUser.name,
        description: `Direct chat with ${selectedUser.name}`,
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
      alert(`Failed to create chat: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    },
  });

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

  const handleUserSelected = (selectedUser) => {
    setCreatingChat(true);
    createDirectChatMutation.mutate(selectedUser);
  };

  // Fetch current group details
  const { data: currentGroup } = useQuery({
    queryKey: ['chat-group', selectedGroupId],
    queryFn: () => getChatGroupById(selectedGroupId),
    enabled: !!selectedGroupId,
  });

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
            <div className="w-full sm:w-96 bg-gray-800 dark:bg-gray-800 flex flex-col border-r border-gray-700 dark:border-gray-700 min-h-0">
              {/* Header */}
              <div className="p-4 border-b border-gray-700 dark:border-gray-700 flex items-center justify-between bg-gray-800 dark:bg-gray-800">
                <h2 className="text-xl font-bold text-white dark:text-white">Chats</h2>
                <button
                  onClick={() => setUserPickerOpen(true)}
                  className="p-1.5 rounded-full hover:bg-gray-700 dark:hover:bg-gray-700 transition-colors text-blue-400 dark:text-blue-400"
                  title="Start new chat"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* Search Bar */}
              <div className="px-4 py-3 border-b border-gray-700 dark:border-gray-700 bg-gray-800 dark:bg-gray-800">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-700 dark:border-gray-700 bg-gray-700 dark:bg-gray-700 text-gray-100 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="px-2 py-3 border-b border-gray-700 dark:border-gray-700 flex gap-1 bg-gray-800 dark:bg-gray-800">
                <button
                  onClick={() => setChatFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-2 ${
                    chatFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 dark:bg-gray-700 text-gray-300 dark:text-gray-300 hover:bg-gray-600 dark:hover:bg-gray-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setChatFilter('unread')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-2 ${
                    chatFilter === 'unread'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 dark:bg-gray-700 text-gray-300 dark:text-gray-300 hover:bg-gray-600 dark:hover:bg-gray-600'
                  }`}
                >
                  Unread
                </button>
                <button
                  onClick={() => setChatFilter('favorites')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-2 ${
                    chatFilter === 'favorites'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 dark:bg-gray-700 text-gray-300 dark:text-gray-300 hover:bg-gray-600 dark:hover:bg-gray-600'
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
            <div className="flex-1 min-h-0 bg-gray-900 dark:bg-gray-900 flex flex-col">
              {selectedGroupId ? (
                <>
                  {/* Chat Header */}
                  <div className="px-6 py-4 bg-gray-800 dark:bg-gray-800 border-b border-gray-700 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-bold">
                        {currentGroup?.data?.name?.charAt(0)?.toUpperCase() || 'C'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white dark:text-white truncate">
                          {currentGroup?.data?.name || 'Chat'}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-700 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <Phone size={20} className="text-gray-400 dark:text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-700 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <Info size={20} className="text-gray-400 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Messages Container */}
                  <div className="flex-1 min-h-0 overflow-hidden bg-white dark:bg-gray-900">
                    <MessageList groupId={selectedGroupId} />
                  </div>

                  {/* Message Input */}
                  <div className="bg-gray-900 dark:bg-gray-900 border-t border-gray-800 dark:border-gray-800 shadow-sm">
                    <MessageInput groupId={selectedGroupId} />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-900 dark:to-gray-800">
                  <div className="p-4 rounded-full bg-blue-900/30 dark:bg-blue-900/30 mb-4">
                    <MessageCircle className="text-blue-400 dark:text-blue-400" size={40} />
                  </div>
                  <h3 className="text-lg font-semibold text-white dark:text-white mb-2">
                    Select a chat to start
                  </h3>
                  <p className="text-sm text-gray-400 dark:text-gray-400 max-w-sm">
                    Choose a conversation from the list or start a new direct message by clicking the + button.
                  </p>
                </div>
              )}
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
    </>
  );
}
