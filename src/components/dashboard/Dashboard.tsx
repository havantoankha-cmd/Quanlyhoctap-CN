import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Award,
  CalendarCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  BookOpen,
  Clock,
  HeartHandshake,
  Bot,
  ChevronRight,
  Check,
  MessageSquare,
} from 'lucide-react';
import { BarChart, DonutChart } from '../common/Charts';

export const Dashboard: React.FC = () => {
  const {
    students,
    subjects,
    classConfig,
    updateClassConfig,
    classMetrics,
    openStudentProfile,
    setActivePath,
    calculateStudentSubjectAverage,
    teachers,
    showToast,
    totalUnreadChatCount,
  } = useApp();

  const handleTermChange = (newTerm: 'Học kỳ I' | 'Học kỳ II') => {
    if (classConfig.currentTerm === newTerm) return;
    updateClassConfig({ currentTerm: newTerm });
    showToast(`Đã chuyển sang ${newTerm} năm học ${classConfig.schoolYear}`);
  };

  // Highlighted students needing attention or showing great progress
  const priorityStudents = students.filter(
    (s) => s.status === 'Cần quan tâm' || s.status === 'Khẩn cấp' || s.status === 'Tiến bộ'
  ).slice(0, 5);

  // Subject average scores for the class bar chart
  const subjectAverages = subjects.map((sub) => {
    let sum = 0;
    let count = 0;
    students.forEach((s) => {
      const avg = calculateStudentSubjectAverage(s.id, sub.id);
      if (avg !== null) {
        sum += avg;
        count += 1;
      }
    });
    const avgScore = count > 0 ? Math.round((sum / count) * 10) / 10 : 7.5;
    return {
      label: sub.name,
      value: avgScore,
      color: avgScore >= 8.0 ? '#10b981' : avgScore >= 7.0 ? '#2563eb' : avgScore >= 6.0 ? '#f59e0b' : '#ef4444',
    };
  });

  // Attendance breakdown for donut
  const attendanceDonutData = [
    { label: 'Đi học đúng giờ', value: 20, color: '#10b981' },
    { label: 'Nghỉ có phép', value: 2, color: '#3b82f6' },
    { label: 'Đi học muộn', value: 1, color: '#f59e0b' },
    { label: 'Nghỉ không phép', value: 1, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl md:text-2xl font-bold tracking-tight">
              Xin chào thầy {classConfig.teacherName.split(' ').pop()}!
            </span>
            <span className="text-xl">👋</span>
          </div>
          <p className="text-blue-100 text-sm font-medium">
            Chúc thầy một ngày làm việc hiệu quả và nhiều niềm vui cùng tập thể {classConfig.className}!
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-blue-100/90">
            <span className="bg-white/15 px-2.5 py-1 rounded-md backdrop-blur-xs font-semibold">
              {classConfig.schoolName}
            </span>
            <span className="bg-white/15 px-2.5 py-1 rounded-md backdrop-blur-xs">
              Năm học {classConfig.schoolYear}
            </span>

            {/* Interactive Term Selector: Học kỳ I & Học kỳ II */}
            <div className="inline-flex items-center p-0.5 bg-black/25 backdrop-blur-md rounded-lg border border-white/20 shadow-xs">
              <button
                type="button"
                onClick={() => handleTermChange('Học kỳ I')}
                className={`px-3 py-1 rounded-md font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  classConfig.currentTerm === 'Học kỳ I'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
                title="Bấm để chọn Học kỳ I"
              >
                {classConfig.currentTerm === 'Học kỳ I' && <Check className="w-3.5 h-3.5" />}
                <span>Học kỳ I</span>
              </button>
              <button
                type="button"
                onClick={() => handleTermChange('Học kỳ II')}
                className={`px-3 py-1 rounded-md font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  classConfig.currentTerm === 'Học kỳ II'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
                title="Bấm để chọn Học kỳ II"
              >
                {classConfig.currentTerm === 'Học kỳ II' && <Check className="w-3.5 h-3.5" />}
                <span>Học kỳ II</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActivePath('chat/toan-lop')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs rounded-xl backdrop-blur-xs transition-all border border-white/20 hover:scale-[1.02]"
          >
            <MessageSquare className="w-4 h-4 text-cyan-300" />
            <span>Mục Chát & Trao đổi</span>
            {totalUnreadChatCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                {totalUnreadChatCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActivePath('ai-phan-tich')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI Cố vấn phân tích lớp</span>
          </button>
        </div>
      </div>

      {/* 4 Large Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Sĩ số */}
        <div
          onClick={() => setActivePath('hoc-sinh/danh-sach')}
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sĩ số lớp</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800">{classMetrics.totalStudents}</span>
            <span className="text-xs text-slate-500 font-medium">học sinh</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>4 Tổ học tập</span>
            <span className="text-blue-600 font-semibold group-hover:underline flex items-center gap-0.5">
              Xem danh sách <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 2: Điểm trung bình */}
        <div
          onClick={() => setActivePath('hoc-tap/theo-doi')}
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Điểm trung bình</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800">{classMetrics.classAverage}</span>
            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
              Xếp loại Khá
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Thông tư 22/2021</span>
            <span className="text-emerald-600 font-semibold group-hover:underline flex items-center gap-0.5">
              Chi tiết bảng điểm <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 3: Chuyên cần */}
        <div
          onClick={() => setActivePath('chuyen-can/thong-ke')}
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chuyên cần</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800">{classMetrics.attendanceRate}%</span>
            <span className="text-xs text-slate-500 font-medium">tỉ lệ có mặt</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Tuần 4 học kỳ I</span>
            <span className="text-indigo-600 font-semibold group-hover:underline flex items-center gap-0.5">
              Sổ điểm danh <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Card 4: Học lực khá giỏi */}
        <div
          onClick={() => setActivePath('hoc-tap/tien-bo')}
          className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Học lực khá giỏi</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-800">{classMetrics.goodStudentRate}%</span>
            <span className="text-xs text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
              Mục tiêu 80%
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            <span>Theo dõi chỉ tiêu</span>
            <span className="text-amber-600 font-semibold group-hover:underline flex items-center gap-0.5">
              Học sinh tiến bộ <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Class Situation Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Học tập */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tình hình</span>
              <h4 className="text-sm font-bold text-slate-800">HỌC TẬP</h4>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Tốt
          </span>
        </div>

        {/* Chuyên cần */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tình hình</span>
              <h4 className="text-sm font-bold text-slate-800">CHUYÊN CẦN</h4>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            Tốt
          </span>
        </div>

        {/* Rèn luyện */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tình hình</span>
              <h4 className="text-sm font-bold text-slate-800">RÈN LUYỆN</h4>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Khá
          </span>
        </div>
      </div>

      {/* Main Grid: Priority Students & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Học sinh cần quan tâm */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                HỌC SINH CẦN QUAN TÂM
              </h3>
            </div>
            <button
              onClick={() => setActivePath('hoc-sinh/danh-sach')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Xem tất cả học sinh <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {priorityStudents.map((student) => {
              const statusBadges = {
                'Khẩn cấp': 'bg-rose-100 text-rose-800 border-rose-200',
                'Cần quan tâm': 'bg-amber-100 text-amber-800 border-amber-200',
                'Tiến bộ': 'bg-emerald-100 text-emerald-800 border-emerald-200',
                'Bình thường': 'bg-slate-100 text-slate-700 border-slate-200',
              };

              return (
                <div
                  key={student.id}
                  onClick={() => openStudentProfile(student.id)}
                  className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-blue-50/60 hover:border-blue-200 transition-all cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={student.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
                    />
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{student.name}</span>
                        <span className="text-[11px] text-slate-500 font-medium">({student.code})</span>
                        <span className="text-[11px] bg-slate-200/70 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                          Tổ {student.team}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                        {student.statusNote || student.notes || 'Học sinh đang trong diện theo dõi định kỳ'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                        statusBadges[student.status]
                      }`}
                    >
                      {student.status}
                    </span>
                    <button className="text-slate-400 hover:text-blue-600">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick homeroom tasks */}
          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => setActivePath('chuyen-can/nghi-hoc')}
              className="p-2.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Điểm danh ngay</span>
            </button>
            <button
              onClick={() => setActivePath('hoc-tap/nhap-diem')}
              className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Nhập bảng điểm</span>
            </button>
            <button
              onClick={() => setActivePath('thi-dua/xep-loai')}
              className="p-2.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Award className="w-4 h-4" />
              <span>Cộng/Trừ thi đua</span>
            </button>
            <button
              onClick={() => setActivePath('phu-huynh')}
              className="p-2.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Liên lạc phụ huynh</span>
            </button>
          </div>
        </div>

        {/* Right 1 Col: Attendance & Class Distribution */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                CHUYÊN CẦN HÔM NAY
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Hôm nay</span>
            </div>

            <DonutChart
              data={attendanceDonutData}
              size={150}
              centerText="96%"
              centerSubtext="Có mặt"
            />
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Phòng học:</span>
              <span className="font-bold text-slate-800">{classConfig.room}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Giáo viên chủ nhiệm:</span>
              <span className="font-bold text-blue-700">{classConfig.teacherName}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Giáo viên bộ môn:</span>
              <button
                onClick={() => setActivePath('giao-vien/danh-sach')}
                className="font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5"
              >
                {teachers.length} giáo viên <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Giờ sinh hoạt lớp:</span>
              <span className="font-bold text-slate-800">Thứ Bảy (Tiết 4-5)</span>
            </div>
            <button
              onClick={() => setActivePath('bao-cao')}
              className="w-full mt-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors text-center"
            >
              Xem báo cáo tuần toàn diện
            </button>
          </div>
        </div>
      </div>

      {/* Class Subject Scores Comparison Bar Chart */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              MẶT BẰNG ĐIỂM TRUNG BÌNH THEO MÔN HỌC ({classConfig.className})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              So sánh điểm trung bình các môn học trong học kỳ hiện tại theo thang điểm 10
            </p>
          </div>
          <button
            onClick={() => setActivePath('hoc-tap/so-sanh')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto"
          >
            So sánh chi tiết <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <BarChart data={subjectAverages} height={220} maxValue={10} unit="điểm" />
      </div>
    </div>
  );
};
