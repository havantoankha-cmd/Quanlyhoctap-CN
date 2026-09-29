import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ConversationList } from './ConversationList';
import { MessageArea } from './MessageArea';
import { StudentQuickInfoSidebar } from './StudentQuickInfoSidebar';
import { NewChatModal } from './NewChatModal';

export const ChatHub: React.FC = () => {
  const {
    activePath,
    setActivePath,
    chatConversations,
    activeConversationId,
    setActiveConversationId,
    setSelectedChatCategory,
    markConversationAsRead,
  } = useApp();

  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  // Synchronize active path with selected conversation & category
  useEffect(() => {
    if (activePath === 'chat/toan-lop') {
      setSelectedChatCategory('class');
      const classConv = chatConversations.find((c) => c.category === 'class');
      if (classConv) {
        setActiveConversationId(classConv.id);
        markConversationAsRead(classConv.id);
      }
      setMobileShowChat(true);
    } else if (activePath === 'chat/giao-vien') {
      setSelectedChatCategory('teachers');
      const teacherConv = chatConversations.find((c) => c.category === 'teachers');
      if (teacherConv) {
        setActiveConversationId(teacherConv.id);
        markConversationAsRead(teacherConv.id);
      }
      setMobileShowChat(true);
    } else if (activePath === 'chat/phu-huynh') {
      setSelectedChatCategory('parents');
      const parentConv = chatConversations.find((c) => c.category === 'parents');
      if (parentConv) {
        setActiveConversationId(parentConv.id);
        markConversationAsRead(parentConv.id);
      }
      setMobileShowChat(true);
    } else if (activePath === 'chat/ban-can-su') {
      setSelectedChatCategory('cadres');
      const cadreConv = chatConversations.find((c) => c.category === 'cadres');
      if (cadreConv) {
        setActiveConversationId(cadreConv.id);
        markConversationAsRead(cadreConv.id);
      }
      setMobileShowChat(true);
    } else if (activePath === 'chat/tro-ly-ai') {
      setSelectedChatCategory('ai');
      const aiConv = chatConversations.find((c) => c.category === 'ai');
      if (aiConv) {
        setActiveConversationId(aiConv.id);
        markConversationAsRead(aiConv.id);
      }
      setMobileShowChat(true);
    }
  }, [activePath]);

  const activeConversation =
    chatConversations.find((c) => c.id === activeConversationId) ||
    chatConversations[0];

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    markConversationAsRead(id);
    setMobileShowChat(true);
  };

  return (
    <div className="h-[calc(100vh-6.5rem)] min-h-[550px] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Column: Conversation List */}
        <div
          className={`${
            mobileShowChat ? 'hidden md:flex' : 'flex'
          } w-full md:w-auto h-full flex-col`}
        >
          <ConversationList
            onSelectConversation={handleSelectConversation}
            onOpenNewChat={() => setIsNewChatModalOpen(true)}
          />
        </div>

        {/* Center Column: Message Area */}
        {activeConversation ? (
          <div
            className={`${
              !mobileShowChat ? 'hidden md:flex' : 'flex'
            } flex-1 h-full min-w-0 flex-col`}
          >
            <MessageArea
              conversation={activeConversation}
              onBackToList={() => setMobileShowChat(false)}
              isRightSidebarOpen={isRightSidebarOpen}
              onToggleRightSidebar={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            />
          </div>
        ) : (
          <div className="flex-1 hidden md:flex items-center justify-center p-8 text-slate-400 text-sm">
            Chọn một cuộc hội thoại để bắt đầu trao đổi
          </div>
        )}

        {/* Right Column: Student / Group Details Sidebar */}
        {isRightSidebarOpen && activeConversation && (
          <div className="hidden lg:flex h-full flex-shrink-0">
            <StudentQuickInfoSidebar
              conversation={activeConversation}
              onClose={() => setIsRightSidebarOpen(false)}
            />
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
      />
    </div>
  );
};
