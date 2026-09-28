import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, Plus, AlertTriangle, Eye, Calendar, User } from 'lucide-react';

export const LateManager: React.FC = () => {
  const { students, attendance, setAttendanceStatus, openStudentProfile, showToast } = useApp();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [lateDate, setLateDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [lateMinutes, setLateMinutes] = useState<number>(10);
  const [lateReason, setLateReason] = useState<string>('Tắc đường / Hỏng xe');

  // Filter all late records
  const lateRecords = attendance
    .filter((a) => a.status === 'late')
    .map((record) => {
      const student = students.find((s) => s.id === record.studentId);
      return {
        ...record,
        student,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  // Count late occurrences per student
  const lateCountMap: Record<string, number> = {};
  attendance
    .filter((a) => a.status === 'late')
    .forEach((a) => {
      lateCountMap[a.studentId] = (lateCountMap[a.studentId] || 0) + 1;
    });

  const handleAddLate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    setAttendanceStatus(selectedStudentId, lateDate, 'late', lateReason, lateMinutes);
    showToast('Đã ghi nhận học sinh đi trễ.');
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">THEO DÕI HỌC SINH ĐI TRỄ</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Ghi nhận các trường hợp đi muộn giờ truy bài đầu giờ để trừ điểm thi đua và đôn đốc phụ huynh
        </p>

        {/* Quick Add Late Record Form */}
        <form onSubmit={handleAddLate} className="mt-4 p-4 bg-amber-50/60 border border-amber-200 rounded-xl text-xs space-y-3">
          <div className="font-bold text-amber-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Ghi nhận đi trễ mới</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chọn học sinh</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code} - Tổ {s.team})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ngày đi trễ</label>
              <input
                type="date"
                value={lateDate}
                onChange={(e) => setLateDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Thời gian muộn (phút)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={lateMinutes}
                onChange={(e) => setLateMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lý do đi muộn</label>
              <input
                type="text"
                placeholder="Ví dụ: Hỏng xe, ngủ quên..."
                value={lateReason}
                onChange={(e) => setLateReason(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
          </div>

          <div className="text-right">
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm"
            >
              + Lưu trường hợp đi trễ
            </button>
          </div>
        </form>
      </div>

      {/* Late Students Summary Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            DANH SÁCH CÁC TRƯỜNG HỢP ĐI TRỄ ({lateRecords.length} LƯỢT)
          </h3>
          <span className="text-xs text-slate-500">Tháng 9 & 10</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4 w-28">Mã HS</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4 w-28">Ngày</th>
                <th className="py-3 px-4 w-28 text-center text-amber-700">Thời gian muộn</th>
                <th className="py-3 px-4 w-28 text-center font-bold text-rose-700">Tổng số lần</th>
                <th className="py-3 px-4">Lý do</th>
                <th className="py-3 px-4 w-24 text-center">Hồ sơ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lateRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Chưa có ghi nhận trường hợp đi muộn nào.
                  </td>
                </tr>
              ) : (
                lateRecords.map((item, idx) => {
                  const studentTotalLates = item.student ? lateCountMap[item.student.id] || 1 : 1;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">
                        {item.student?.code || '-'}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {item.student?.name || 'Học sinh'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{item.date}</td>
                      <td className="py-3 px-4 text-center font-bold text-amber-700">
                        {item.lateMinutes || 10} phút
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            studentTotalLates >= 3
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {studentTotalLates} lần
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 italic">
                        {item.reason || 'Đi học muộn giờ truy bài'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.student && (
                          <button
                            onClick={() => openStudentProfile(item.student!.id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="Xem hồ sơ chi tiết"
                          >
                            <Eye className="w-4 h-4 mx-auto" />
                          </button>
                        )}
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
