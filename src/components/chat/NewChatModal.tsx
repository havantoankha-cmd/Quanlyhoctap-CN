import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChatCategory } from '../../types';
import { X, Search, School, Users, Plus, MessageSquare, Check, Sparkles } from 'lucide-react';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose }) => {
  const {
    students,
    teachers,
    openChatWithParent,
    openChatWithTeacher,
    createNewConversation,
    setActiveConversationId,
    setActivePath,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'parents' | 'teachers' | 'custom'>('parents');
  const [search, setSearch] = useState('');

  // Form for custom group
  const [groupTitle, setGroupTitle] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupCategory, setGroupCategory] = useState<ChatCategory>('class');

  if (!isOpen) return null;

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.parentName.toLowerCase().includes(search.toLowerCase()) ||
      s.parentPhone.includes(search)
  );

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subjectNames.some((sn) => sn.toLowerCase().includes(search.toLowerCase())) ||
      t.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectParent = (studentId: string) => {
    openChatWithParent(studentId);
    onClose();
  };

  const handleSelectTeacher = (teacherId: string) => {
    openChatWithTeacher(teacherId);
    onClose();
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupTitle.trim()) return;

    const newId = createNewConversation({
      category: groupCategory,
      title: groupTitle.trim(),
      subtitle: groupDesc.trim() || 'Nhóm trao đổi thảo luận',
      isGroup: true,
      description: groupDesc.trim(),
      avatarBg: groupCategory === 'cadres' ? 'bg-purple-600' : 'bg-blue-600',
    });

    setActiveConversationId(newId);
    setActivePath('chat/toan-lop');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Soạn cuộc trò chuyện mới</h3>
              <p className="text-xs text-slate-400">Chọn phụ huynh, giáo viên bộ môn hoặc tạo nhóm mới</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('parents')}
            className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'parents'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Phụ huynh ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('teachers')}
            className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'teachers'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Giáo viên bộ môn ({teachers.length})
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-3 text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'custom'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Tạo nhóm trao đổi
          </button>
        </div>

        {/* Search for parents & teachers */}
        {activeTab !== 'custom' && (
          <div className="p-3 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={
                  activeTab === 'parents'
                    ? 'Tìm học sinh hoặc tên/SĐT phụ huynh...'
                    : 'Tìm giáo viên hoặc môn giảng dạy...'
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeTab === 'parents' && (
            <>
              {filteredStudents.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleSelectParent(s.id)}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={s.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={s.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600">
                          {s.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 font-semibold text-slate-600">
                          {s.code} • Tổ {s.team}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {s.parentRelationship}: <strong className="text-slate-700">{s.parentName}</strong> • SĐT: {s.parentPhone}
                      </p>
                    </div>
                  </div>
                  <button className="px-2.5 py-1 bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors">
                    <MessageSquare className="w-3 h-3" />
                    <span>Nhắn tin</span>
                  </button>
                </div>
              ))}
              {filteredStudents.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Không tìm thấy phụ huynh phù hợp
                </div>
              )}
            </>
          )}

          {activeTab === 'teachers' && (
            <>
              {filteredTeachers.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleSelectTeacher(t.id)}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={t.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={t.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600">
                          {t.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold">
                          {t.subjectNames.join(', ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {t.role} • SĐT: {t.phone}
                      </p>
                    </div>
                  </div>
                  <button className="px-2.5 py-1 bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors">
                    <MessageSquare className="w-3 h-3" />
                    <span>Nhắn tin</span>
                  </button>
                </div>
              ))}
              {filteredTeachers.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Không tìm thấy giáo viên phù hợp
                </div>
              )}
            </>
          )}

          {activeTab === 'custom' && (
            <form onSubmit={handleCreateGroup} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên nhóm trò chuyện <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đội tuyển Học sinh Giỏi Toán, Nhóm Văn Nghệ 20/11..."
                  value={groupTitle}
                  onChange={(e) => setGroupTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phân loại nhóm
                </label>
                <select
                  value={groupCategory}
                  onChange={(e) => setGroupCategory(e.target.value as ChatCategory)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="class">Kênh chung Lớp học</option>
                  <option value="cadres">Ban Cán Sự & Nhóm Tổ</option>
                  <option value="teachers">Giáo Viên Bộ Môn</option>
                  <option value="parents">Nhóm Phụ Huynh</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mô tả / Mục đích nhóm
                </label>
                <textarea
                  rows={2}
                  placeholder="Mô tả mục tiêu hoạt động hoặc dặn dò cho thành viên..."
                  value={groupDesc}
                  onChange={(e) => setGroupDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Khởi tạo nhóm trò chuyện</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
