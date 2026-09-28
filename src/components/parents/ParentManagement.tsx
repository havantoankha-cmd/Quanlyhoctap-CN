import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ParentContact } from '../../types';
import {
  HeartHandshake,
  Phone,
  MessageCircle,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Calendar,
  X,
  User,
} from 'lucide-react';

export const ParentManagement: React.FC = () => {
  const { students, parentContacts, addParentContact, openStudentProfile, showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Form state for logging a new interaction
  const [contactDate, setContactDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [contactChannel, setContactChannel] = useState<'Điện thoại' | 'Gặp trực tiếp' | 'Tin nhắn Zalo' | 'Họp phụ huynh'>('Điện thoại');
  const [contactContent, setContactContent] = useState('');
  const [contactResult, setContactResult] = useState('');
  const [contactNotes, setContactNotes] = useState('');

  // Selected student for quick modal log
  const activeStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  const handleOpenLogModal = (studentId: string) => {
    setSelectedStudentId(studentId);
    setContactContent('');
    setContactResult('');
    setContactNotes('');
    setIsLogModalOpen(true);
  };

  const handleSaveContactLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent || !contactContent.trim()) {
      showToast('Vui lòng nhập nội dung trao đổi.', 'error');
      return;
    }

    addParentContact({
      studentId: activeStudent.id,
      parentName: activeStudent.parentName,
      phone: activeStudent.parentPhone,
      date: contactDate,
      channel: contactChannel,
      content: contactContent.trim(),
      result: contactResult.trim() || 'Phụ huynh đã tiếp nhận thông tin.',
      notes: contactNotes.trim() || undefined,
    });

    setIsLogModalOpen(false);
  };

  // Filtered student list with their parent contacts
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parentPhone.includes(searchTerm)
  );

  return (
    <div className="space-y-5 pb-12">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">SỔ LIÊN LẠC & QUẢN LÝ PHỤ HUYNH</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi danh bạ phụ huynh, lịch sử các cuộc gọi, tin nhắn Zalo và các buổi làm việc trực tiếp
            </p>
          </div>

          <button
            onClick={() => handleOpenLogModal(students[0]?.id || '')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Ghi chú trao đổi mới</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative pt-3 border-t border-slate-100">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-5" />
          <input
            type="text"
            placeholder="Tìm theo tên học sinh, họ tên phụ huynh hoặc số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Parent Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            DANH BẠ PHỤ HUYNH LỚP ({filteredStudents.length} HỌC SINH)
          </h3>
          <span className="text-xs text-slate-500 font-medium">Đã kết nối 100% qua Zalo/SĐT</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4">Học sinh</th>
                <th className="py-3 px-4">Họ tên phụ huynh</th>
                <th className="py-3 px-4 w-28">Quan hệ</th>
                <th className="py-3 px-4 w-36 font-semibold">Số điện thoại</th>
                <th className="py-3 px-4 w-36 text-center">Trạng thái liên hệ</th>
                <th className="py-3 px-4 w-36 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s, idx) => {
                const logs = parentContacts.filter((c) => c.studentId === s.id);
                const hasLogs = logs.length > 0;
                const lastLog = hasLogs ? logs[0] : null;

                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-400 font-semibold">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{s.name}</span>
                        <span className="font-mono text-blue-700 text-[11px]">({s.code})</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{s.parentName}</td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold text-[11px]">
                        {s.parentRelationship}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                      <span>{s.parentPhone}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          hasLogs
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {hasLogs ? `Đã trao đổi (${logs.length} lần)` : 'Đã kết nối'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenLogModal(s.id)}
                        className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-bold text-[11px] transition-colors"
                      >
                        + Ghi trao đổi
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact History Section */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            LỊCH SỬ TRAO ĐỔI VỚI PHỤ HUYNH ({parentContacts.length} LƯỢT)
          </h3>
          <span className="text-xs text-slate-500 font-medium">Gần nhất xếp trước</span>
        </div>

        <div className="divide-y divide-slate-100">
          {parentContacts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Chưa có bản ghi trao đổi nào. Bấm nút "+ Ghi chú trao đổi mới" phía trên để lưu nhật ký.
            </div>
          ) : (
            parentContacts.map((item) => {
              const st = students.find((s) => s.id === item.studentId);
              return (
                <div key={item.id} className="p-4 hover:bg-slate-50 text-xs space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{st?.name}</span>
                      <span className="text-slate-500 font-medium">
                        • Phụ huynh: <strong>{item.parentName}</strong> ({item.phone})
                      </span>
                      <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        {item.channel}
                      </span>
                    </div>
                    <span className="font-mono text-slate-400 text-[11px]">{item.date}</span>
                  </div>

                  <p className="text-slate-700">
                    <strong>Nội dung trao đổi:</strong> {item.content}
                  </p>

                  <p className="text-emerald-800">
                    <strong>Kết quả:</strong> {item.result}
                  </p>

                  {item.notes && (
                    <p className="text-slate-500 italic">
                      <strong>Ghi chú thêm:</strong> {item.notes}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal: Ghi chú trao đổi mới */}
      {isLogModalOpen && activeStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">GHI NHẬT KÝ TRAO ĐỔI PHỤ HUYNH</h3>
              <button onClick={() => setIsLogModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContactLog} className="space-y-4 text-xs">
              <div className="p-3 bg-blue-50 rounded-lg text-slate-800 border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="font-bold">{activeStudent.name}</span>
                  <span className="text-slate-500 ml-1">({activeStudent.code})</span>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Phụ huynh: {activeStudent.parentName} ({activeStudent.parentRelationship})
                  </p>
                </div>
                <span className="font-mono font-bold text-blue-700">{activeStudent.parentPhone}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày trao đổi</label>
                  <input
                    type="date"
                    value={contactDate}
                    onChange={(e) => setContactDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hình thức liên lạc</label>
                  <select
                    value={contactChannel}
                    onChange={(e) => setContactChannel(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
                  >
                    <option value="Điện thoại">Cuộc gọi điện thoại</option>
                    <option value="Tin nhắn Zalo">Tin nhắn Zalo</option>
                    <option value="Gặp trực tiếp">Gặp trực tiếp tại trường</option>
                    <option value="Họp phụ huynh">Trong buổi họp phụ huynh</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nội dung trao đổi <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ví dụ: Trao đổi tình hình học sinh vắng học, kết quả kiểm tra giữa kỳ, nề nếp..."
                  value={contactContent}
                  onChange={(e) => setContactContent(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kết quả cuộc trao đổi</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Phụ huynh đồng ý đôn đốc con ở nhà, cam kết nhắc nhở..."
                  value={contactResult}
                  onChange={(e) => setContactResult(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú tiếp theo</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Theo dõi tiếp trong 1 tuần tới..."
                  value={contactNotes}
                  onChange={(e) => setContactNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm"
                >
                  Lưu nhật ký
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
