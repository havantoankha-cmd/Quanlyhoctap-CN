import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ChatConversation, ChatMessage, ChatAttachment } from '../../types';
import { ChatInput } from './ChatInput';
import { QuickTemplatesModal } from './QuickTemplatesModal';
import {
  Search,
  Pin,
  Info,
  Phone,
  MessageCircle,
  MoreVertical,
  Reply,
  Trash2,
  Smile,
  FileText,
  Download,
  Bot,
  Sparkles,
  ArrowLeft,
  X,
  ExternalLink,
  CheckCheck,
} from 'lucide-react';

interface MessageAreaProps {
  conversation: ChatConversation;
  onBackToList?: () => void;
  isRightSidebarOpen: boolean;
  onToggleRightSidebar: () => void;
}

export const MessageArea: React.FC<MessageAreaProps> = ({
  conversation,
  onBackToList,
  isRightSidebarOpen,
  onToggleRightSidebar,
}) => {
  const {
    sendChatMessage,
    deleteChatMessage,
    togglePinChatMessage,
    addReactionToMessage,
    students,
    openStudentProfile,
  } = useApp();

  const [searchInChat, setSearchInChat] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  const handleSendMessage = (content: string, attachments?: ChatAttachment[]) => {
    sendChatMessage(conversation.id, content, attachments, replyToMessage || undefined);
    setReplyToMessage(null);
  };

  const filteredMessages = searchInChat.trim()
    ? conversation.messages.filter((m) =>
        m.content.toLowerCase().includes(searchInChat.toLowerCase()) ||
        m.senderName.toLowerCase().includes(searchInChat.toLowerCase())
      )
    : conversation.messages;

  const pinnedMessage = conversation.messages.find((m) => m.isPinned);

  // Quick suggestions for AI or Parent Chat
  const handleQuickPrompt = (prompt: string) => {
    sendChatMessage(conversation.id, prompt);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 min-w-0 overflow-hidden">
      {/* Top Conversation Header */}
      <div className="h-16 px-4 border-b border-slate-200 bg-white flex items-center justify-between z-10 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          {onBackToList && (
            <button
              onClick={onBackToList}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="relative flex-shrink-0">
            {conversation.avatarUrl ? (
              <img
                src={conversation.avatarUrl}
                alt={conversation.title}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div
                className={`w-10 h-10 rounded-full ${
                  conversation.avatarBg || 'bg-blue-600'
                } text-white flex items-center justify-center font-bold text-sm shadow-xs`}
              >
                {conversation.category === 'ai' ? (
                  <Sparkles className="w-5 h-5 text-amber-300" />
                ) : (
                  conversation.title.slice(0, 2).toUpperCase()
                )}
              </div>
            )}
            {conversation.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900 truncate leading-tight">
                {conversation.title}
              </h3>
              {conversation.isPinned && (
                <Pin className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {conversation.subtitle || (conversation.isOnline ? 'Đang hoạt động' : 'Offline')}
            </p>
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="flex items-center gap-1">
          {/* Search Toggle */}
          <button
            onClick={() => setIsSearchActive(!isSearchActive)}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isSearchActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="Tìm kiếm trong cuộc hội thoại"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Right Sidebar Info Toggle */}
          <button
            onClick={onToggleRightSidebar}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isRightSidebarOpen
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title="Xem thông tin chi tiết / hồ sơ học sinh"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* In-Chat Search Bar */}
      {isSearchActive && (
        <div className="p-2.5 bg-blue-50 border-b border-blue-200 flex items-center gap-2 animate-fadeIn">
          <Search className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <input
            type="text"
            placeholder="Tìm kiếm nội dung tin nhắn..."
            value={searchInChat}
            onChange={(e) => setSearchInChat(e.target.value)}
            className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-1 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
            autoFocus
          />
          {searchInChat && (
            <span className="text-[11px] text-blue-800 font-semibold">
              Tìm thấy {filteredMessages.length} tin
            </span>
          )}
          <button
            onClick={() => {
              setIsSearchActive(false);
              setSearchInChat('');
            }}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Pinned Message Banner */}
      {pinnedMessage && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900 animate-fadeIn">
          <div className="flex items-center gap-2 overflow-hidden pr-2">
            <Pin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 fill-amber-500" />
            <span className="font-bold flex-shrink-0">Tin nhắn đã ghim:</span>
            <span className="truncate text-slate-700">
              {pinnedMessage.senderName}: {pinnedMessage.content}
            </span>
          </div>
          <button
            onClick={() => togglePinChatMessage(conversation.id, pinnedMessage.id)}
            className="text-[11px] font-bold text-amber-700 hover:text-amber-900 hover:underline flex-shrink-0 ml-2"
          >
            Bỏ ghim
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Intro Banner for AI Assistant */}
        {conversation.category === 'ai' && conversation.messages.length === 1 && (
          <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 border border-blue-200 rounded-2xl mb-4 text-xs">
            <div className="flex items-center gap-2 mb-2 font-bold text-blue-900">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Gợi ý câu lệnh nhanh cho thầy Toàn:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleQuickPrompt(
                    'Soạn tin nhắn gửi phụ huynh em Trần Thị Bích về việc nghỉ học nhiều buổi và kế hoạch kèm cặp kiến thức.'
                  )
                }
                className="p-2.5 bg-white hover:bg-blue-100/50 rounded-xl border border-blue-200 text-left text-slate-700 font-medium transition-all shadow-2xs hover:shadow-xs"
              >
                📩 Soạn tin nhắn cho phụ huynh em Bích
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickPrompt(
                    'Soạn lời khen ngợi em Phạm Thị Hồng đạt điểm 9.0 môn KHTN gửi phụ huynh để động viên tinh thần.'
                  )
                }
                className="p-2.5 bg-white hover:bg-blue-100/50 rounded-xl border border-blue-200 text-left text-slate-700 font-medium transition-all shadow-2xs hover:shadow-xs"
              >
                🌟 Khen ngợi học sinh tiến bộ môn KHTN
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickPrompt(
                    'Soạn thông báo kế hoạch kiểm tra giữa kỳ I và phân công trực nhật gửi lên Kênh Toàn Lớp.'
                  )
                }
                className="p-2.5 bg-white hover:bg-blue-100/50 rounded-xl border border-blue-200 text-left text-slate-700 font-medium transition-all shadow-2xs hover:shadow-xs"
              >
                📢 Thông báo kiểm tra giữa kỳ 1
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickPrompt(
                    'Tư vấn cách xử lý học sinh mất trật tự, nói chuyện riêng trong giờ học bộ môn.'
                  )
                }
                className="p-2.5 bg-white hover:bg-blue-100/50 rounded-xl border border-blue-200 text-left text-slate-700 font-medium transition-all shadow-2xs hover:shadow-xs"
              >
                💡 Tư vấn xử lý học sinh nói chuyện riêng
              </button>
            </div>
          </div>
        )}

        {/* Render Messages */}
        {filteredMessages.map((msg) => {
          const isMe = msg.senderId === 'gvcn';
          const isAI = msg.senderId === 'ai';

          return (
            <div
              key={msg.id}
              onMouseEnter={() => setHoveredMessageId(msg.id)}
              onMouseLeave={() => setHoveredMessageId(null)}
              className={`flex gap-3 group relative ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {/* Other's Avatar */}
              {!isMe && (
                <div className="flex-shrink-0 mt-0.5">
                  {msg.senderAvatar ? (
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                        isAI
                          ? 'bg-gradient-to-tr from-cyan-500 to-blue-600'
                          : 'bg-emerald-600'
                      }`}
                    >
                      {isAI ? <Bot className="w-4 h-4" /> : msg.senderName.slice(0, 2)}
                    </div>
                  )}
                </div>
              )}

              {/* Message Bubble Container */}
              <div
                className={`max-w-[85%] md:max-w-[70%] flex flex-col ${
                  isMe ? 'items-end' : 'items-start'
                }`}
              >
                {/* Sender Info Line */}
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-500">
                  <span className="font-bold text-slate-800">{msg.senderName}</span>
                  {msg.senderRole && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/80 font-medium text-slate-600">
                      {msg.senderRole}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                </div>

                {/* Reply To Reference snippet */}
                {msg.replyToSnippet && (
                  <div className="mb-1 text-[11px] bg-slate-100 text-slate-600 px-3 py-1 rounded-lg border-l-2 border-blue-500 italic max-w-full truncate">
                    {msg.replyToSnippet}
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs relative ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-tr-xs'
                      : isAI
                      ? 'bg-white text-slate-800 border border-blue-200 shadow-sm rounded-tl-xs'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-tl-xs'
                  }`}
                >
                  {/* Content with linebreaks */}
                  <div className="whitespace-pre-line font-normal">{msg.content}</div>

                  {/* Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2.5 space-y-1.5 pt-2 border-t border-black/10">
                      {msg.attachments.map((att) => (
                        <div
                          key={att.id}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs ${
                            isMe
                              ? 'bg-blue-700/60 text-white border border-blue-500/50'
                              : 'bg-slate-50 text-slate-800 border border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden pr-2">
                            <FileText className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate font-semibold">{att.name}</span>
                          </div>
                          {att.size && (
                            <span className="text-[10px] opacity-80 flex-shrink-0">{att.size}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reactions Bar */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 pt-1.5 border-t border-black/5">
                      {Object.entries(msg.reactions).map(([emoji, count]) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => addReactionToMessage(conversation.id, msg.id, emoji)}
                          className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all ${
                            msg.userReaction === emoji
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : isMe
                              ? 'bg-blue-700/70 text-white hover:bg-blue-700'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <span>{emoji}</span>
                          <span>{count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Hover Action Bar */}
                {hoveredMessageId === msg.id && (
                  <div
                    className={`absolute -top-3 ${
                      isMe ? 'right-2' : 'left-10'
                    } bg-white rounded-full shadow-md border border-slate-200 px-1 py-0.5 flex items-center gap-1 z-20 animate-fadeIn`}
                  >
                    <button
                      type="button"
                      onClick={() => addReactionToMessage(conversation.id, msg.id, '👍')}
                      className="p-1 hover:bg-slate-100 rounded-full text-xs"
                      title="Thích"
                    >
                      👍
                    </button>
                    <button
                      type="button"
                      onClick={() => addReactionToMessage(conversation.id, msg.id, '❤️')}
                      className="p-1 hover:bg-slate-100 rounded-full text-xs"
                      title="Yêu thích"
                    >
                      ❤️
                    </button>
                    <button
                      type="button"
                      onClick={() => addReactionToMessage(conversation.id, msg.id, '👏')}
                      className="p-1 hover:bg-slate-100 rounded-full text-xs"
                      title="Vỗ tay"
                    >
                      👏
                    </button>
                    <div className="w-px h-3 bg-slate-200 mx-0.5" />
                    <button
                      type="button"
                      onClick={() => setReplyToMessage(msg)}
                      className="p-1 hover:bg-slate-100 rounded-full text-slate-600 hover:text-blue-600"
                      title="Trả lời tin nhắn"
                    >
                      <Reply className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePinChatMessage(conversation.id, msg.id)}
                      className={`p-1 hover:bg-slate-100 rounded-full ${
                        msg.isPinned ? 'text-amber-500' : 'text-slate-600 hover:text-amber-600'
                      }`}
                      title={msg.isPinned ? 'Bỏ ghim tin nhắn' : 'Ghim tin nhắn này'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    {isMe && (
                      <button
                        type="button"
                        onClick={() => deleteChatMessage(conversation.id, msg.id)}
                        className="p-1 hover:bg-slate-100 rounded-full text-slate-600 hover:text-rose-600"
                        title="Xóa tin nhắn của bạn"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Chat Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onOpenTemplates={() => setIsTemplatesModalOpen(true)}
        replyToMessage={replyToMessage}
        onCancelReply={() => setReplyToMessage(null)}
        isAIChannel={conversation.category === 'ai'}
      />

      {/* Quick Templates Modal */}
      <QuickTemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onSelectTemplate={(text) => handleSendMessage(text)}
        targetStudentId={conversation.studentId}
      />
    </div>
  );
};
