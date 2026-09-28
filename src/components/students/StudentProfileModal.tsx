import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LineChart, BarChart } from '../common/Charts';
import {
  X,
  Phone,
  MapPin,
  Calendar,
  User,
  GraduationCap,
  CalendarCheck,
  Award,
  MessageSquare,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  PlusCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Trash2,
  Edit2,
  AlertCircle,
} from 'lucide-react';

export const StudentProfileModal: React.FC = () => {
  const {
    students,
    selectedStudentId,
    setSelectedStudentId,
    setActivePath,
    subjects,
    scores,
    attendance,
    disciplineEntries,
    comments,
    parentContacts,
    calculateStudentSubjectAverage,
    calculateStudentOverallAverage,
    getStudentDisciplineStats,
    getStudentProgressStatus,
    deleteStudent,
    updateStudent,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'hoc-tap' | 'chuyen-can' | 'ren-luyen' | 'thi-dua' | 'nhan-xet' | 'tien-bo'>('hoc-tap');
  const [selectedSubjectTrend, setSelectedSubjectTrend] = useState<string>('toan');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Find target student
  const student = students.find((s) => s.id === selectedStudentId) || students[0];

  const [editFormData, setEditFormData] = useState({
    name: student?.name || '',
    code: student?.code || '',
    birthDate: student?.birthDate || '2014-01-01',
    gender: student?.gender || 'Nam',
    team: student?.team || 1,
    seat: student?.seat || 'Bàn 1 - Dãy 1',
    status: student?.status || 'Bình thường',
    parentName: student?.parentName || '',
    parentPhone: student?.parentPhone || '',
    parentRelationship: student?.parentRelationship || 'Bố',
    address: student?.address || '',
    notes: student?.notes || '',
  });

  const handleOpenEdit = () => {
    if (!student) return;
    setEditFormData({
      name: student.name,
      code: student.code,
      birthDate: student.birthDate,
      gender: student.gender,
      team: student.team,
      seat: student.seat,
      status: student.status,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentRelationship: student.parentRelationship,
      address: student.address,
      notes: student.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    updateStudent(student.id, editFormData);
    setIsEditModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!student) return;
    deleteStudent(student.id);
    setIsDeleteModalOpen(false);
    showToast(`Đã xóa học sinh ${student.name} khỏi danh sách lớp.`);
    setActivePath('hoc-sinh/danh-sach');
  };
  if (!student) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
        <p className="text-slate-500 mb-4">Chưa chọn học sinh nào để xem hồ sơ.</p>
        <button
          onClick={() => setActivePath('hoc-sinh/danh-sach')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
        >
          Quay lại danh sách lớp
        </button>
      </div>
    );
  }

  const overallAvg = calculateStudentOverallAverage(student.id) || 7.5;
  const disciplineStats = getStudentDisciplineStats(student.id);
  const progressStats = getStudentProgressStatus(student.id);

  // Subject table data
  const subjectBreakdown = subjects.map((sub) => {
    const avg = calculateStudentSubjectAverage(student.id, sub.id) || 7.0;
    const subScores = scores[student.id]?.[sub.id] || {};
    let level = 'Khá';
    if (avg >= 8.5) level = 'Mạnh';
    else if (avg >= 7.0) level = 'Khá';
    else if (avg >= 5.0) level = 'Đạt';
    else level = 'Cần cải thiện';

    return {
      sub,
      tx1: subScores.tx1,
      tx2: subScores.tx2,
      gk: subScores.gk,
      ck: subScores.ck,
      avg,
      level,
    };
  });

  // Trend data for selected subject (Đầu kỳ -> Giữa kỳ -> Cuối kỳ)
  const currentSubScore = scores[student.id]?.[selectedSubjectTrend] || {};
  const trendLineData = [
    { label: 'Đầu kỳ (TX1)', value: currentSubScore.tx1 ?? 7.0 },
    { label: 'Kiểm tra (TX2)', value: currentSubScore.tx2 ?? 7.5 },
    { label: 'Giữa kỳ (GK)', value: currentSubScore.gk ?? 7.5 },
    { label: 'Cuối kỳ (CK)', value: currentSubScore.ck ?? 8.0 },
  ];

  // Attendance records for this student
  const studentAttendance = attendance.filter((a) => a.studentId === student.id);
  const studentDiscipline = disciplineEntries.filter((e) => e.studentId === student.id);
  const studentComments = comments.filter((c) => c.studentId === student.id);
  const studentParentContacts = parentContacts.filter((c) => c.studentId === student.id);

  return (
    <div className="space-y-5 pb-12 animate-fadeIn">
      {/* Back button and profile action bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActivePath('hoc-sinh/danh-sach')}
          className="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span>Quay lại danh sách lớp</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenEdit}
            className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Chỉnh sửa thông tin học sinh"
          >
            <Edit2 className="w-3.5 h-3.5 text-slate-600" />
            <span>Sửa thông tin</span>
          </button>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Xóa học sinh khỏi danh sách lớp"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Xóa học sinh</span>
          </button>

          <button
            onClick={() => setActivePath('ai-phan-tich')}
            className="px-3 py-1.5 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
            <span>AI Nhận xét</span>
          </button>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Avatar & Basic Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                alt={student.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white shadow-xs">
                Tổ {student.team}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-extrabold text-slate-900">{student.name}</h1>
                <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                  {student.code}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    student.status === 'Khẩn cấp'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : student.status === 'Cần quan tâm'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : student.status === 'Tiến bộ'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {student.status}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ngày sinh: {student.birthDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Giới tính: {student.gender}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Chỗ ngồi: {student.seat}</span>
                </div>
              </div>

              {student.statusNote && (
                <p className="mt-2 text-xs text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-md inline-block">
                  ⚠️ <strong>Lưu ý:</strong> {student.statusNote}
                </p>
              )}
            </div>
          </div>

          {/* Quick Metrics of the student */}
          <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
            <div className="text-center px-3">
              <span className="text-[11px] text-slate-400 font-bold uppercase block">ĐTB chung</span>
              <span className="text-2xl font-black text-blue-600">{overallAvg}</span>
              <span className="text-[10px] text-slate-500 block">
                {overallAvg >= 8.0 ? 'Học lực Giỏi' : overallAvg >= 6.5 ? 'Học lực Khá' : 'Học lực Đạt'}
              </span>
            </div>

            <div className="h-10 w-px bg-slate-200" />

            <div className="text-center px-3">
              <span className="text-[11px] text-slate-400 font-bold uppercase block">Điểm thi đua</span>
              <span className="text-2xl font-black text-slate-800">{disciplineStats.total}</span>
              <span className="text-[10px] text-slate-500 block">Hạng {disciplineStats.rank} / lớp</span>
            </div>

            <div className="h-10 w-px bg-slate-200" />

            <div className="text-center px-3">
              <span className="text-[11px] text-slate-400 font-bold uppercase block">Xu hướng</span>
              <span
                className={`text-sm font-extrabold flex items-center justify-center gap-0.5 mt-1 ${
                  progressStats.status === 'Tăng'
                    ? 'text-emerald-600'
                    : progressStats.status === 'Giảm'
                    ? 'text-rose-600'
                    : 'text-slate-600'
                }`}
              >
                {progressStats.status === 'Tăng' ? '↑' : progressStats.status === 'Giảm' ? '↓' : '→'} {progressStats.status}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {progressStats.delta > 0 ? `+${progressStats.delta}` : progressStats.delta} điểm
              </span>
            </div>
          </div>
        </div>

        {/* Parent Contact bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2 bg-slate-50/70 -mx-6 -mb-6 px-6 py-2.5">
          <div className="flex items-center gap-4 flex-wrap">
            <span>
              <strong>Phụ huynh:</strong> {student.parentName} ({student.parentRelationship})
            </span>
            <span className="flex items-center gap-1 text-blue-700 font-semibold">
              <Phone className="w-3.5 h-3.5" /> {student.parentPhone}
            </span>
            <span className="hidden sm:inline text-slate-500">
              <strong>Địa chỉ:</strong> {student.address}
            </span>
          </div>
          <button
            onClick={() => setActivePath('phu-huynh')}
            className="text-xs text-blue-600 font-bold hover:underline"
          >
            Nhật ký trao đổi phụ huynh →
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl shadow-xs overflow-x-auto gap-1">
        {[
          { key: 'hoc-tap', label: 'Học tập', icon: <GraduationCap className="w-4 h-4" /> },
          { key: 'chuyen-can', label: 'Chuyên cần', icon: <CalendarCheck className="w-4 h-4" /> },
          { key: 'ren-luyen', label: 'Rèn luyện', icon: <ShieldCheck className="w-4 h-4" /> },
          { key: 'thi-dua', label: 'Thi đua', icon: <Award className="w-4 h-4" /> },
          { key: 'nhan-xet', label: 'Nhận xét', icon: <MessageSquare className="w-4 h-4" /> },
          { key: 'tien-bo', label: 'Tiến bộ', icon: <TrendingUp className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`py-3.5 px-4 font-bold text-xs flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: HỌC TẬP */}
      {activeTab === 'hoc-tap' && (
        <div className="space-y-6">
          {/* Progress Chart over time */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  BIỂU ĐỒ ĐIỂM THEO THỜI GIAN: ĐẦU KỲ → GIỮA KỲ → CUỐI KỲ
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Theo dõi sự biến thiên điểm số của học sinh qua các giai đoạn đánh giá định kỳ
                </p>
              </div>

              {/* Subject selector for the line chart */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Chọn môn:</span>
                <select
                  value={selectedSubjectTrend}
                  onChange={(e) => setSelectedSubjectTrend(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-blue-700"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      Môn {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <LineChart data={trendLineData} height={200} min={4} max={10} lineColor="#2563eb" />
          </div>

          {/* Subject score breakdown table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                BẢNG TỔNG HỢP ĐIỂM CHI TIẾT CÁC MÔN
              </h3>
              <span className="text-xs text-slate-500 font-medium">Theo Thông tư 22/2021/TT-BGDĐT</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                    <th className="py-3 px-4">Môn học</th>
                    <th className="py-3 px-3 text-center">TX 1</th>
                    <th className="py-3 px-3 text-center">TX 2</th>
                    <th className="py-3 px-3 text-center">Giữa kỳ (GK)</th>
                    <th className="py-3 px-3 text-center">Cuối kỳ (CK)</th>
                    <th className="py-3 px-4 text-center">Điểm TB</th>
                    <th className="py-3 px-4 text-center">Mức độ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjectBreakdown.map((row) => {
                    const levelColors: Record<string, string> = {
                      Mạnh: 'bg-emerald-100 text-emerald-800',
                      Khá: 'bg-blue-100 text-blue-800',
                      Đạt: 'bg-slate-100 text-slate-700',
                      'Cần cải thiện': 'bg-amber-100 text-amber-800',
                    };

                    return (
                      <tr key={row.sub.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{row.sub.name}</td>
                        <td className="py-3 px-3 text-center font-medium text-slate-600">{row.tx1 ?? '-'}</td>
                        <td className="py-3 px-3 text-center font-medium text-slate-600">{row.tx2 ?? '-'}</td>
                        <td className="py-3 px-3 text-center font-bold text-slate-800">{row.gk ?? '-'}</td>
                        <td className="py-3 px-3 text-center font-bold text-slate-800">{row.ck ?? '-'}</td>
                        <td className="py-3 px-4 text-center font-black text-blue-700 text-sm">{row.avg}</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              levelColors[row.level] || 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {row.level}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: CHUYÊN CẦN */}
      {activeTab === 'chuyen-can' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              LỊCH SỬ CHUYÊN CẦN & ĐI TRỄ
            </h3>
            <span className="text-xs text-slate-500">
              Tổng số bản ghi chuyên cần: {studentAttendance.length}
            </span>
          </div>

          {studentAttendance.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Học sinh đi học đầy đủ và đúng giờ, chưa ghi nhận trường hợp vắng hoặc muộn.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {studentAttendance.map((att) => (
                <div key={att.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-500 font-semibold">{att.date}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold ${
                        att.status === 'present'
                          ? 'bg-emerald-50 text-emerald-700'
                          : att.status === 'late'
                          ? 'bg-amber-50 text-amber-700'
                          : att.status === 'excused'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {att.status === 'present'
                        ? 'Có mặt'
                        : att.status === 'late'
                        ? `Đi muộn ${att.lateMinutes || 10} phút`
                        : att.status === 'excused'
                        ? 'Nghỉ có phép'
                        : 'Nghỉ không phép'}
                    </span>
                    {att.reason && <span className="text-slate-600 italic">Lý do: {att.reason}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: RÈN LUYỆN & KỶ LUẬT */}
      {activeTab === 'ren-luyen' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            ĐÁNH GIÁ RÈN LUYỆN THEO THÁNG & NỀ NẾP
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold block">Chấp hành nội quy trường</span>
              <span className="text-lg font-bold text-emerald-700 mt-1 block">Tốt</span>
              <p className="text-[11px] text-slate-500 mt-1">Đồng phục, khăn quàng đỏ đầy đủ</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold block">Thái độ học tập trên lớp</span>
              <span className="text-lg font-bold text-blue-700 mt-1 block">Tích cực</span>
              <p className="text-[11px] text-slate-500 mt-1">Chú ý lắng nghe thầy cô giảng bài</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold block">Mối quan hệ bạn bè</span>
              <span className="text-lg font-bold text-slate-800 mt-1 block">Hòa đồng</span>
              <p className="text-[11px] text-slate-500 mt-1">Thân thiện, tích cực giúp đỡ bạn</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: THI ĐUA */}
      {activeTab === 'thi-dua' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              NHẬT KÝ ĐIỂM CỘNG & ĐIỂM TRỪ THI ĐUA
            </h3>
            <span className="text-xs font-bold text-blue-700">
              Tổng điểm hiện tại: {disciplineStats.total} điểm
            </span>
          </div>

          {studentDiscipline.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Chưa có ghi nhận điểm cộng/trừ trong tuần này.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {studentDiscipline.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-400 text-[11px]">{item.date}</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        item.type === 'plus' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {item.type === 'plus' ? `+${item.points}` : `-${item.points}`}
                    </span>
                    <span className="font-medium text-slate-800">{item.title}</span>
                    {item.notes && <span className="text-slate-500 italic">({item.notes})</span>}
                  </div>
                  <span className="text-[11px] text-slate-400">Tuần {item.week}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: NHẬN XÉT */}
      {activeTab === 'nhan-xet' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              NHẬN XÉT CỦA GIÁO VIÊN CHỦ NHIỆM
            </h3>
            <button
              onClick={() => setActivePath('nhan-xet/tuan')}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              + Viết nhận xét mới
            </button>
          </div>

          {studentComments.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Chưa có nhận xét nào được lưu cho học sinh này.
            </div>
          ) : (
            <div className="space-y-3">
              {studentComments.map((com) => (
                <div key={com.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-[11px]">
                      {com.periodValue} ({com.period === 'week' ? 'Tuần' : com.period === 'month' ? 'Tháng' : 'Học kỳ'})
                    </span>
                    <span className="text-[11px] text-slate-400">{com.date}</span>
                  </div>
                  <p className="text-slate-700">
                    <strong>Học tập:</strong> {com.academicComment}
                  </p>
                  <p className="text-slate-700">
                    <strong>Nề nếp:</strong> {com.conductComment}
                  </p>
                  {com.progressNote && (
                    <p className="text-emerald-700 italic">
                      <strong>Tiến bộ:</strong> {com.progressNote}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: TIẾN BỘ */}
      {activeTab === 'tien-bo' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            ĐÁNH GIÁ SỰ TIẾN BỘ & PHÁT TRIỂN NĂNG LỰC
          </h3>
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>Đánh giá quỹ đạo tiến bộ cá nhân</span>
            </div>
            <p className="text-emerald-900 leading-relaxed">
              Học sinh <strong>{student.name}</strong> hiện đang thể hiện phong độ <strong>{student.status}</strong>.
              {student.status === 'Tiến bộ' && ' Có nỗ lực vượt bậc trong việc tự học và tích cực trao đổi bài với các bạn trong tổ.'}
              {student.status === 'Cần quan tâm' && ' Cần có sự theo dõi sát sao hơn ở môn Toán và nề nếp chuẩn bị bài ở nhà.'}
              {student.status === 'Khẩn cấp' && ' Cần sự can thiệp và phối hợp trực tiếp giữa gia đình và ban giám hiệu nhà trường.'}
              {student.status === 'Bình thường' && ' Duy trì nhịp độ học tập ổn định, hoàn thành tốt các chỉ tiêu học tập đề ra.'}
            </p>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-base text-slate-900 text-center mb-1">
              Xác nhận xóa học sinh
            </h3>
            <p className="text-xs text-slate-500 text-center mb-4">
              Hành động này sẽ xóa toàn bộ hồ sơ của học sinh khỏi danh sách lớp.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-5 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Mã học sinh:</span>
                <span className="font-mono font-bold text-slate-800">{student.code}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Họ và tên:</span>
                <span className="font-bold text-slate-900">{student.name}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Tổ học tập:</span>
                <span className="font-bold text-slate-800">Tổ {student.team}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <h3 className="font-bold text-slate-800 text-sm">Chỉnh sửa hồ sơ học sinh: {student.name}</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã học sinh *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.code}
                    onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    value={editFormData.birthDate}
                    onChange={(e) => setEditFormData({ ...editFormData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giới tính</label>
                  <select
                    value={editFormData.gender}
                    onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tổ học tập</label>
                  <select
                    value={editFormData.team}
                    onChange={(e) => setEditFormData({ ...editFormData, team: Number(e.target.value) as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value={1}>Tổ 1</option>
                    <option value={2}>Tổ 2</option>
                    <option value={3}>Tổ 3</option>
                    <option value={4}>Tổ 4</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vị trí chỗ ngồi</label>
                  <input
                    type="text"
                    value={editFormData.seat}
                    onChange={(e) => setEditFormData({ ...editFormData, seat: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tình trạng học sinh</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="Bình thường">Bình thường</option>
                    <option value="Cần quan tâm">Cần quan tâm</option>
                    <option value="Khẩn cấp">Khẩn cấp</option>
                    <option value="Tiến bộ">Tiến bộ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ tên phụ huynh</label>
                  <input
                    type="text"
                    value={editFormData.parentName}
                    onChange={(e) => setEditFormData({ ...editFormData, parentName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại phụ huynh</label>
                  <input
                    type="tel"
                    value={editFormData.parentPhone}
                    onChange={(e) => setEditFormData({ ...editFormData, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Địa chỉ thường trú</label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú đặc điểm học sinh</label>
                <textarea
                  rows={2}
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
