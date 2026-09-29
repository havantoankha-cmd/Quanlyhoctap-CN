import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChatConversation } from '../../types';
import {
  X,
  Phone,
  MessageCircle,
  ExternalLink,
  Award,
  CalendarCheck,
  GraduationCap,
  Pin,
  FileText,
  Users,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface StudentQuickInfoSidebarProps {
  conversation: ChatConversation;
  onClose: () => void;
}

export const StudentQuickInfoSidebar: React.FC<StudentQuickInfoSidebarProps> = ({
  conversation,
  onClose,
}) => {
  const {
    students,
    openStudentProfile,
    calculateStudentOverallAverage,
    getStudentDisciplineStats,
    attendance,
    teachers,
  } = useApp();

  const student = conversation.studentId
    ? students.find((s) => s.id === conversation.studentId)
    : null;

  // If this is a student/parent conversation
  if (student) {
    const overallAvg = calculateStudentOverallAverage(student.id);
    const disciplineStats = getStudentDisciplineStats(student.id);

    // Attendance stats
    const studentAttendance = attendance.filter((a) => a.studentId === student.id);
    const unexcusedCount = studentAttendance.filter((a) => a.status === 'unexcused').length;
    const excusedCount = studentAttendance.filter((a) => a.status === 'excused').length;
    const lateCount = studentAttendance.filter((a) => a.status === 'late').length;

    return (
      <aside className="w-80 border-l border-slate-200 bg-white flex flex-col h-full overflow-y-auto animate-fadeIn select-none">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Hồ sơ học sinh liên kết</span>
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Student Profile Card */}
        <div className="p-4 border-b border-slate-100 text-center">
          <img
            src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={student.name}
            className="w-18 h-18 rounded-full object-cover mx-auto border-2 border-blue-500 shadow-sm mb-3"
          />
          <h4 className="font-bold text-slate-900 text-base leading-tight">{student.name}</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Mã: <strong className="text-slate-700">{student.code}</strong> • Tổ {student.team} • {student.seat}
          </p>

          <div className="mt-3 flex justify-center">
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                student.status === 'Khẩn cấp'
                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                  : student.status === 'Cần quan tâm'
                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                  : student.status === 'Tiến bộ'
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-100 text-blue-700 border border-blue-200'
              }`}
            >
              Tình trạng: {student.status}
            </span>
          </div>

          {student.statusNote && (
            <p className="mt-2.5 text-xs text-slate-600 bg-amber-50 p-2 rounded-lg border border-amber-200/60 text-left leading-relaxed">
              ⚠️ {student.statusNote}
            </p>
          )}
        </div>

        {/* Quick Academic & Attendance Metrics */}
        <div className="p-4 border-b border-slate-100 space-y-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Chỉ số học tập & nề nếp
          </span>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 text-center">
              <span className="text-[10px] text-blue-600 font-semibold block">ĐTB Chung</span>
              <span className="text-lg font-black text-blue-900">
                {overallAvg !== null ? overallAvg.toFixed(1) : '--'}
              </span>
            </div>

            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
              <span className="text-[10px] text-emerald-600 font-semibold block">Điểm thi đua</span>
              <span className="text-lg font-black text-emerald-900">
                {disciplineStats.total > 0 ? `+${disciplineStats.total}` : disciplineStats.total}
              </span>
            </div>
          </div>

          {/* Attendance Breakdown */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Nghỉ không phép:</span>
              <strong className={unexcusedCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                {unexcusedCount} buổi
              </strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Nghỉ có phép:</span>
              <span className="font-semibold text-slate-700">{excusedCount} buổi</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Đi học muộn:</span>
              <span className={lateCount > 0 ? 'text-amber-600 font-semibold' : 'text-slate-700'}>
                {lateCount} lần
              </span>
            </div>
          </div>
        </div>

        {/* Parent Contact Details */}
        <div className="p-4 border-b border-slate-100 space-y-2.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Thông tin liên hệ phụ huynh
          </span>
          <div className="text-xs space-y-1">
            <p className="text-slate-600">
              Đại diện: <strong className="text-slate-800">{student.parentName}</strong> ({student.parentRelationship})
            </p>
            <p className="text-slate-600">
              Số điện thoại: <strong className="text-blue-600 font-mono text-sm">{student.parentPhone}</strong>
            </p>
            <p className="text-slate-500 text-[11px] leading-tight">
              Địa chỉ: {student.address}
            </p>
          </div>

          <div className="pt-1 flex gap-2">
            <a
              href={`tel:${student.parentPhone.replace(/\s+/g, '')}`}
              className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Gọi điện</span>
            </a>
            <a
              href={`https://zalo.me/${student.parentPhone.replace(/\s+/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-1.5 px-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Nhắn Zalo</span>
            </a>
          </div>
        </div>

        {/* View Full Profile Action */}
        <div className="p-4 mt-auto">
          <button
            onClick={() => openStudentProfile(student.id)}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Mở hồ sơ chi tiết học sinh</span>
          </button>
        </div>
      </aside>
    );
  }

  // Group channel info
  const pinnedMessages = conversation.messages.filter((m) => m.isPinned);
  const attachments = conversation.messages
    .flatMap((m) => m.attachments || [])
    .slice(0, 10);

  return (
    <aside className="w-80 border-l border-slate-200 bg-white flex flex-col h-full overflow-y-auto animate-fadeIn select-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-4 h-4 text-blue-600" />
          <span>Thông tin phòng chat</span>
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 border-b border-slate-100">
        <div className={`w-14 h-14 rounded-2xl ${conversation.avatarBg || 'bg-blue-600'} text-white flex items-center justify-center mx-auto text-xl font-black shadow-md mb-3`}>
          {conversation.title.slice(0, 2).toUpperCase()}
        </div>
        <h4 className="font-bold text-slate-900 text-sm text-center leading-tight">
          {conversation.title}
        </h4>
        <p className="text-xs text-slate-500 text-center mt-1">
          {conversation.subtitle}
        </p>

        {conversation.description && (
          <p className="mt-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 leading-relaxed">
            {conversation.description}
          </p>
        )}
      </div>

      {/* Pinned Messages */}
      {pinnedMessages.length > 0 && (
        <div className="p-4 border-b border-slate-100 space-y-2">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
            <Pin className="w-3.5 h-3.5" />
            <span>Tin nhắn đã ghim ({pinnedMessages.length})</span>
          </span>
          <div className="space-y-2">
            {pinnedMessages.map((pm) => (
              <div key={pm.id} className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-slate-700">
                <div className="flex items-center justify-between font-bold text-[11px] text-amber-900 mb-1">
                  <span>{pm.senderName}</span>
                  <span className="text-[10px] text-slate-400">{pm.timestamp}</span>
                </div>
                <p className="line-clamp-3 leading-snug">{pm.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shared Files & Attachments */}
      {attachments.length > 0 && (
        <div className="p-4 border-b border-slate-100 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            <span>Tài liệu & file đính kèm ({attachments.length})</span>
          </span>
          <div className="space-y-1.5">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs hover:bg-blue-50/50 transition-colors"
              >
                <div className="flex items-center gap-2 overflow-hidden pr-2">
                  <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="truncate font-medium text-slate-800">{att.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 flex-shrink-0">{att.size}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Group Members Preview */}
      <div className="p-4 space-y-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          <span>Thành viên tiêu biểu ({conversation.membersCount || 10})</span>
        </span>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-50">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              HT
            </div>
            <div>
              <span className="font-bold text-slate-800 block">Thầy Hà Văn Toàn</span>
              <span className="text-[10px] text-blue-600 font-semibold">GVCN Lớp 7A (Trưởng nhóm)</span>
            </div>
          </div>
          {conversation.category === 'teachers' &&
            teachers.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-50">
                <img
                  src={t.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={t.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <span className="font-medium text-slate-800 block">{t.name}</span>
                  <span className="text-[10px] text-slate-500">{t.subjectNames.join(', ')}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </aside>
  );
};
