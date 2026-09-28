import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DonutChart, BarChart } from '../common/Charts';
import { CalendarCheck, AlertTriangle, UserCheck, XCircle, Clock, Eye } from 'lucide-react';

export const AttendanceStats: React.FC = () => {
  const { students, attendance, openStudentProfile, classConfig } = useApp();

  // Aggregate stats
  const totalSessions = 22 * students.length; // Approximate sessions in month
  const totalLogs = attendance.length;

  const excusedCount = attendance.filter((a) => a.status === 'excused').length;
  const unexcusedCount = attendance.filter((a) => a.status === 'unexcused').length;
  const lateCount = attendance.filter((a) => a.status === 'late').length;
  const presentCount = Math.max(0, totalSessions - excusedCount - unexcusedCount);

  const presentRate = Math.round((presentCount / Math.max(1, totalSessions)) * 100);

  // Group absences by student
  const studentAbsenceMap = useMemo(() => {
    const map: Record<string, { excused: number; unexcused: number; late: number }> = {};
    students.forEach((s) => {
      map[s.id] = { excused: 0, unexcused: 0, late: 0 };
    });

    attendance.forEach((a) => {
      if (map[a.studentId]) {
        if (a.status === 'excused') map[a.studentId].excused += 1;
        if (a.status === 'unexcused') map[a.studentId].unexcused += 1;
        if (a.status === 'late') map[a.studentId].late += 1;
      }
    });

    return students
      .map((s) => ({
        student: s,
        excused: map[s.id].excused,
        unexcused: map[s.id].unexcused,
        late: map[s.id].late,
        totalAbsences: map[s.id].excused + map[s.id].unexcused,
      }))
      .sort((a, b) => b.unexcused * 2 + b.excused - (a.unexcused * 2 + a.excused));
  }, [students, attendance]);

  const highAbsenceStudents = studentAbsenceMap.filter((item) => item.totalAbsences > 0 || item.late > 0);

  const donutData = [
    { label: 'Đi học đúng giờ', value: presentCount, color: '#10b981' },
    { label: 'Nghỉ có phép', value: excusedCount, color: '#3b82f6' },
    { label: 'Nghỉ không phép', value: unexcusedCount, color: '#ef4444' },
    { label: 'Đi học muộn', value: lateCount, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">THỐNG KÊ CHUYÊN CẦN TOÀN DIỆN</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Tổng hợp tình hình sĩ số, tỷ lệ chuyên cần và danh sách các học sinh nghỉ học nhiều cần liên hệ gia đình
        </p>

        {/* 5 Metric Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 font-bold uppercase block text-[11px]">Tổng số buổi</span>
            <span className="text-xl font-black text-slate-800 mt-0.5 block">{totalSessions}</span>
            <span className="text-[10px] text-slate-400">Toàn bộ {students.length} HS</span>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-emerald-800 font-bold uppercase block text-[11px]">Có mặt</span>
            <span className="text-xl font-black text-emerald-700 mt-0.5 block">{presentCount}</span>
            <span className="text-[10px] text-emerald-600 font-bold">Tỷ lệ {presentRate}%</span>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
            <span className="text-blue-800 font-bold uppercase block text-[11px]">Nghỉ có phép</span>
            <span className="text-xl font-black text-blue-700 mt-0.5 block">{excusedCount}</span>
            <span className="text-[10px] text-blue-600">Có đơn phụ huynh</span>
          </div>

          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
            <span className="text-rose-800 font-bold uppercase block text-[11px]">Nghỉ không phép</span>
            <span className="text-xl font-black text-rose-700 mt-0.5 block">{unexcusedCount}</span>
            <span className="text-[10px] text-rose-600 font-bold">Cần xử lý</span>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-amber-800 font-bold uppercase block text-[11px]">Lượt đi trễ</span>
            <span className="text-xl font-black text-amber-700 mt-0.5 block">{lateCount}</span>
            <span className="text-[10px] text-amber-600">Muộn giờ truy bài</span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
            TỶ LỆ CHUYÊN CẦN TOÀN LỚP
          </h3>
          <DonutChart
            data={donutData}
            size={170}
            centerText={`${presentRate}%`}
            centerSubtext="Chuyên cần"
          />
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
            BIỂU ĐỒ SỐ LƯỢNG NGHỈ & ĐI MUỘN
          </h3>
          <BarChart
            data={[
              { label: 'Nghỉ có phép', value: excusedCount, color: '#3b82f6' },
              { label: 'Nghỉ không phép', value: unexcusedCount, color: '#ef4444' },
              { label: 'Đi học muộn', value: lateCount, color: '#f59e0b' },
            ]}
            height={200}
            maxValue={Math.max(excusedCount, unexcusedCount, lateCount, 6)}
            unit="lượt"
          />
        </div>
      </div>

      {/* High Absence Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            DANH SÁCH HỌC SINH CÓ PHÁT SINH NGHỈ HỌC / ĐI TRỄ
          </h3>
          <span className="text-xs text-rose-600 font-bold">
            {highAbsenceStudents.filter((s) => s.unexcused > 0).length} học sinh có nghỉ không phép
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4 w-28">Mã HS</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4 w-20 text-center">Tổ</th>
                <th className="py-3 px-4 text-center font-bold text-blue-700">Nghỉ có phép</th>
                <th className="py-3 px-4 text-center font-bold text-rose-700">Nghỉ không phép</th>
                <th className="py-3 px-4 text-center font-bold text-amber-700">Lượt đi trễ</th>
                <th className="py-3 px-4 text-center">Mức độ cảnh báo</th>
                <th className="py-3 px-4 w-24 text-center">Hồ sơ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {highAbsenceStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Chưa có học sinh nào nghỉ học hoặc đi trễ. Lớp đạt chuyên cần 100%!
                  </td>
                </tr>
              ) : (
                highAbsenceStudents.map((item, idx) => {
                  const isSevere = item.unexcused >= 3;
                  const isWarning = item.unexcused > 0 || item.late >= 3;

                  return (
                    <tr key={item.student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">{item.student.code}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{item.student.name}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-600">
                          Tổ {item.student.team}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-blue-700">{item.excused} buổi</td>
                      <td className="py-3 px-4 text-center font-bold text-rose-700">{item.unexcused} buổi</td>
                      <td className="py-3 px-4 text-center font-bold text-amber-700">{item.late} lần</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                            isSevere
                              ? 'bg-rose-100 text-rose-800'
                              : isWarning
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isSevere ? 'Khẩn cấp - Cần họp PH' : isWarning ? 'Cần nhắc nhở' : 'Bình thường'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => openStudentProfile(item.student.id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Xem hồ sơ chi tiết"
                        >
                          <Eye className="w-4 h-4 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
