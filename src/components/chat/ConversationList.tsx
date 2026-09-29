import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChatCategory, ChatConversation } from '../../types';
import {
  Search,
  Plus,
  CheckCheck,
  Pin,
  Bot,
  Users,
  School,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface ConversationListProps {
  onSelectConversation: (id: string) => void;
  onOpenNewChat: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  onOpenNewChat,
}) => {
  const {
    chatConversations,
    activeConversationId,
    selectedChatCategory,
    setSelectedChatCategory,
    chatSearchQuery,
    setChatSearchQuery,
    markAllConversationsAsRead,
    totalUnreadChatCount,
  } = useApp();

  const categories: { id: ChatCategory | 'all'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Tất cả', icon: null },
    { id: 'class', label: 'Toàn lớp', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'teachers', label: 'GV Bộ môn', icon: <School className="w-3.5 h-3.5" /> },
    { id: 'parents', label: 'Phụ huynh', icon: <HeartHandshake className="w-3.5 h-3.5" /> },
    { id: 'cadres', label: 'Ban cán sự & Tổ', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'ai', label: 'Trợ lý AI', icon: <Sparkles className="w-3.5 h-3.5 text-cyan-500" /> },
  ];

  const filteredConversations = chatConversations.filter((c) => {
    // Category match
    if (selectedChatCategory !== 'all' && c.category !== selectedChatCategory) {
      return false;
    }
    // Search match
    if (chatSearchQuery.trim()) {
      const q = chatSearchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchSubtitle = c.subtitle?.toLowerCase().includes(q);
      const matchLastMsg = c.lastMessage?.toLowerCase().includes(q);
      const matchMsgContent = c.messages.some((m) => m.content.toLowerCase().includes(q));
      return matchTitle || matchSubtitle || matchLastMsg || matchMsgContent;
    }
    return true;
  });

  // Sort pinned first, then by last message time
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  return (
    <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 bg-white flex flex-col h-full select-none flex-shrink-0">
      {/* Top Header & New Chat button */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-slate-900 text-lg leading-tight">
              Mục Chát
            </h2>
            {totalUnreadChatCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[11px] font-black animate-pulse shadow-xs">
                {totalUnreadChatCount} tin mới
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {totalUnreadChatCount > 0 && (
              <button
                type="button"
                onClick={markAllConversationsAsRead}
                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Đánh dấu đã đọc tất cả"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onOpenNewChat}
              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-transform active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nhắn mới</span>
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm kiếm kênh, giáo viên, phụ huynh..."
            value={chatSearchQuery}
            onChange={(e) => setChatSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 border border-transparent rounded-xl focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-500 text-slate-800 transition-all focus:outline-hidden"
          />
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-1 overflow-x-auto no-scrollbar bg-slate-50/50">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedChatCategory(cat.id)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
              selectedChatCategory === cat.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            {cat.icon}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Conversation Cards List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {sortedConversations.map((conv) => {
          const isActive = conv.id === activeConversationId;
          const isAI = conv.category === 'ai';

          return (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`p-3.5 flex items-start gap-3 transition-all cursor-pointer relative ${
                isActive
                  ? 'bg-blue-50/80 border-l-4 border-blue-600'
                  : 'hover:bg-slate-50 border-l-4 border-transparent'
              }`}
            >
              {/* Avatar with Status */}
              <div className="relative flex-shrink-0 mt-0.5">
                {conv.avatarUrl ? (
                  <img
                    src={conv.avatarUrl}
                    alt={conv.title}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div
                    className={`w-11 h-11 rounded-full ${
                      conv.avatarBg || 'bg-blue-600'
                    } text-white flex items-center justify-center font-bold text-sm shadow-xs`}
                  >
                    {isAI ? (
                      <Sparkles className="w-5 h-5 text-amber-300" />
                    ) : (
                      conv.title.slice(0, 2).toUpperCase()
                    )}
                  </div>
                )}
                {conv.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                )}
              </div>

              {/* Info Column */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5 overflow-hidden pr-1">
                    <span
                      className={`text-xs font-bold truncate ${
                        isActive ? 'text-blue-900' : 'text-slate-900'
                      }`}
                    >
                      {conv.title}
                    </span>
                    {conv.isPinned && (
                      <Pin className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 flex-shrink-0">
                    {conv.lastMessageTime || ''}
                  </span>
                </div>

                {conv.subtitle && (
                  <p className="text-[11px] text-slate-500 truncate mb-1">
                    {conv.subtitle}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <p
                    className={`text-xs truncate pr-2 ${
                      conv.unreadCount > 0
                        ? 'font-bold text-slate-800'
                        : 'text-slate-500'
                    }`}
                  >
                    {conv.lastMessage || 'Chưa có tin nhắn'}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0 shadow-xs">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {sortedConversations.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            Không tìm thấy cuộc trò chuyện nào
          </div>
        )}
      </div>
    </div>
  );
};
