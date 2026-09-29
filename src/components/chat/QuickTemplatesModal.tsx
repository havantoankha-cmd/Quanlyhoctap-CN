import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { quickReplyTemplates } from '../../data/initialChatData';
import { X, Send, BookOpen, AlertTriangle, Award, Users, Calendar, Check, Copy } from 'lucide-react';

interface QuickTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (text: string) => void;
  targetStudentId?: string;
}

export const QuickTemplatesModal: React.FC<QuickTemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  targetStudentId,
}) => {
  const { students, showToast } = useApp();

  // If a student is passed in, use that student; otherwise select the first student or let user pick
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    targetStudentId || (students[0]?.id ?? '')
  );

  const [activeCategory, setActiveCategory] = useState<string>('Tất cả');

  if (!isOpen) return null;

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const studentName = currentStudent?.name || 'Học sinh';
  const parentName = currentStudent?.parentName || 'Phụ huynh';

  const categories = ['Tất cả', 'Chuyên cần', 'Học tập', 'Khen thưởng', 'Gặp mặt', 'Thông báo'];

  const filteredTemplates = activeCategory === 'Tất cả'
    ? quickReplyTemplates
    : quickReplyTemplates.filter((t) => t.category === activeCategory);

  const handleApply = (tpl: typeof quickReplyTemplates[0]) => {
    const text = tpl.content(studentName, parentName);
    onSelectTemplate(text);
    showToast(`Đã áp dụng mẫu "${tpl.title}"`);
    onClose();
  };

  const handleCopy = (tpl: typeof quickReplyTemplates[0], e: React.MouseEvent) => {
    e.stopPropagation();
    const text = tpl.content(studentName, parentName);
    navigator.clipboard.writeText(text);
    showToast('Đã sao chép nội dung mẫu tin nhắn');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Mẫu tin nhắn phụ huynh chuẩn mực</h3>
              <p className="text-xs text-blue-100">Chọn mẫu soạn sẵn chuẩn sư phạm và điền thông tin tự động</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Student Selector */}
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Áp dụng cho học sinh:</span>
          </span>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-800 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name} (PH: {s.parentName} - {s.parentPhone})
              </option>
            ))}
          </select>
        </div>

        {/* Category Pills */}
        <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Template List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filteredTemplates.map((tpl) => {
            const previewText = tpl.content(studentName, parentName);
            return (
              <div
                key={tpl.id}
                onClick={() => handleApply(tpl)}
                className="group p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/40 transition-all cursor-pointer shadow-xs hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                      {tpl.title}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {tpl.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleCopy(tpl, e)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                      title="Sao chép vào clipboard"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      className="px-2.5 py-1 bg-blue-600 group-hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                    >
                      <Send className="w-3 h-3" />
                      <span>Áp dụng</span>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {previewText}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
