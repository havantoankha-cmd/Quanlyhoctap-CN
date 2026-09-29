import React, { useState, useRef, useEffect } from 'react';
import { ChatAttachment, ChatMessage } from '../../types';
import {
  Send,
  Paperclip,
  Smile,
  X,
  FileText,
  Image as ImageIcon,
  Sparkles,
  BookOpen,
  Reply,
} from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string, attachments?: ChatAttachment[]) => void;
  onOpenTemplates: () => void;
  replyToMessage?: ChatMessage | null;
  onCancelReply?: () => void;
  isAIChannel?: boolean;
}

const COMMON_EMOJIS = [
  '👍', '❤️', '👏', '📚', '⭐', '🎯', '💡', '🔔', '💯', '😊',
  '🙏', '⚠️', '📌', '✍️', '💪', '🌸', '🎉', '🏆', '✨', '📝',
];

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onOpenTemplates,
  replyToMessage,
  onCancelReply,
  isAIChannel,
}) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [content]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!content.trim() && attachments.length === 0) return;
    onSendMessage(content, attachments);
    setContent('');
    setAttachments([]);
    setIsEmojiPickerOpen(false);
    if (onCancelReply) onCancelReply();
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleAddEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const isImg = file.type.startsWith('image/');
    const newAtt: ChatAttachment = {
      id: 'att-' + Date.now().toString(36),
      name: file.name,
      type: isImg ? 'image' : 'file',
      url: URL.createObjectURL(file),
      size: `${(file.size / 1024).toFixed(0)} KB`,
    };

    setAttachments((prev) => [...prev, newAtt]);
    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="border-t border-slate-200 bg-white p-3 md:p-4 relative">
      {/* Reply Snippet Banner */}
      {replyToMessage && (
        <div className="mb-2 p-2 bg-blue-50/80 rounded-xl border border-blue-200 flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center gap-2 overflow-hidden pr-2">
            <Reply className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span className="font-bold text-blue-900 flex-shrink-0">
              Trả lời {replyToMessage.senderName}:
            </span>
            <span className="truncate text-slate-600 italic">
              "{replyToMessage.content}"
            </span>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-blue-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-1.5 p-1.5 pr-2 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-700"
            >
              {att.type === 'image' ? (
                <ImageIcon className="w-4 h-4 text-emerald-600" />
              ) : (
                <FileText className="w-4 h-4 text-blue-600" />
              )}
              <span className="max-w-[150px] truncate font-medium">{att.name}</span>
              <span className="text-[10px] text-slate-400">({att.size})</span>
              <button
                type="button"
                onClick={() => removeAttachment(att.id)}
                className="text-slate-400 hover:text-rose-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Emoji Picker Popover */}
      {isEmojiPickerOpen && (
        <div className="absolute bottom-20 left-4 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-40 w-72 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs font-bold text-slate-700">
            <span>Biểu tượng cảm xúc & sư phạm</span>
            <button
              onClick={() => setIsEmojiPickerOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-5 gap-1.5 text-xl">
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleAddEmoji(emoji)}
                className="p-1.5 rounded-lg hover:bg-blue-50 hover:scale-120 transition-all flex items-center justify-center cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Controls */}
      <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
        {/* Attachment button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          title="Đính kèm tài liệu hoặc hình ảnh"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Emoji Button */}
        <button
          type="button"
          onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          title="Chọn biểu tượng cảm xúc"
        >
          <Smile className="w-4 h-4" />
        </button>

        {/* Quick Templates Button */}
        {!isAIChannel && (
          <button
            type="button"
            onClick={onOpenTemplates}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-200/60 rounded-xl transition-colors hidden sm:flex items-center gap-1 cursor-pointer"
            title="Mẫu tin nhắn nhanh chuẩn sư phạm"
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-[11px] font-bold text-slate-600">Mẫu nhanh</span>
          </button>
        )}

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isAIChannel
              ? 'Hỏi Trợ lý AI (Ví dụ: Soạn tin nhắn nhắc nhở phụ huynh học sinh nghỉ học, dặn dò cuối tuần...)'
              : 'Nhập tin nhắn trao đổi... (Nhấn Shift + Enter để xuống dòng)'
          }
          className="flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden resize-none py-2 px-1 max-h-32"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!content.trim() && attachments.length === 0}
          className={`p-2.5 rounded-xl font-bold transition-all flex items-center justify-center cursor-pointer ${
            content.trim() || attachments.length > 0
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:scale-105 active:scale-95'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
          title="Gửi tin nhắn (Enter)"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between mt-1.5 px-2 text-[10px] text-slate-400">
        <span>Gõ <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-200">Enter</kbd> để gửi, <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-200">Shift + Enter</kbd> để xuống dòng</span>
        {!isAIChannel && (
          <button
            type="button"
            onClick={onOpenTemplates}
            className="sm:hidden text-blue-600 font-bold hover:underline"
          >
            Mẫu tin nhắn nhanh
          </button>
        )}
      </div>
    </div>
  );
};
