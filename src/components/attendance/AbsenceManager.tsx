import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus } from '../../types';
import { Calendar, Save, CheckCircle2, AlertCircle, XCircle, Clock, Check } from 'lucide-react';

export const AbsenceManager: React.FC = () => {
  const { students, attendance, batchSaveAttendance, showToast } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  // Draft attendance state for this date
  const [dailyStatus, setDailyStatus] = useState<Record<string, AttendanceStatus>>({});
  const [dailyReasons, setDailyReasons] = useState<Record<string, string>>({});

  useEffect(() => {
    const statusMap: Record<string, AttendanceStatus> = {};
    const reasonMap: Record<string, string> = {};

    students.forEach((s) => {
      const record = attendance.find((a) => a.studentId === s.id && a.date === selectedDate);
      if (record) {
        statusMap[s.id] = record.status;
        reasonMap[s.id] = record.reason || '';
      } else {
        // Default to present
        statusMap[s.id] = 'present';
        reasonMap[s.id] = '';
      }
    });

    setDailyStatus(statusMap);
    setDailyReasons(reasonMap);
  }, [students, attendance, selectedDate]);

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setDailyStatus((prev) => ({ ...prev, [studentId]: status }));
  };

  const setReason = (studentId: string, reason: string) => {
    setDailyReasons((prev) => ({ ...prev, [studentId]: reason }));
  };

  const setAllPresent = () => {
    const statusMap: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      statusMap[s.id] = 'present';
    });
    setDailyStatus(statusMap);
    showToast('Đã đánh dấu tất cả học sinh có mặt.');
  };

  const handleSave = () => {
    const records = students.map((s) => ({
      studentId: s.id,
      status: dailyStatus[s.id] || 'present',
      reason: dailyReasons[s.id] || '',
    }));
    batchSaveAttendance(selectedDate, records);
  };

  // Count summaries for today
  const counts = {
    present: Object.values(dailyStatus).filter((s) => s === 'present').length,
    excused: Object.values(dailyStatus).filter((s) => s === 'excused').length,
    unexcused: Object.values(dailyStatus).filter((s) => s === 'unexcused').length,
    late: Object.values(dailyStatus).filter((s) => s === 'late').length,
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Title & Action Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">ĐIỂM DANH & QUẢN LÝ NGHỈ HỌC</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ghi nhận tình trạng chuyên cần hàng ngày của học sinh (Có mặt, Nghỉ có phép, Nghỉ không phép)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={setAllPresent}
              className="px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg text-xs transition-colors"
            >
              ✓ Tất cả có mặt
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Lưu điểm danh</span>
            </button>
          </div>
        </div>

        {/* Date Selector & Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t border-slate-100 items-center">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Chọn ngày điểm danh</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
            />
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
            <span className="text-[11px] font-bold text-emerald-800 block">Có mặt</span>
            <span className="text-base font-black text-emerald-700">{counts.present} HS</span>
          </div>

          <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-center">
            <span className="text-[11px] font-bold text-blue-800 block">Nghỉ có phép</span>
            <span className="text-base font-black text-blue-700">{counts.excused} HS</span>
          </div>

          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-center">
            <span className="text-[11px] font-bold text-rose-800 block">Nghỉ không phép</span>
            <span className="text-base font-black text-rose-700">{counts.unexcused} HS</span>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-center">
            <span className="text-[11px] font-bold text-amber-800 block">Đi học muộn</span>
            <span className="text-base font-black text-amber-700">{counts.late} HS</span>
          </div>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4 w-28">Mã HS</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4 w-20 text-center">Tổ</th>
                <th className="py-3 px-4 text-center">Trạng thái chuyên cần ngày {selectedDate}</th>
                <th className="py-3 px-4">Lý do nghỉ / Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student, idx) => {
                const currentStatus = dailyStatus[student.id] || 'present';
                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-400 font-semibold">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{student.code}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{student.name}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                        Tổ {student.team}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50 gap-1">
                        <button
                          type="button"
                          onClick={() => setStatus(student.id, 'present')}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                            currentStatus === 'present'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-emerald-700'
                          }`}
                        >
                          Có mặt
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus(student.id, 'excused')}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                            currentStatus === 'excused'
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-blue-700'
                          }`}
                        >
                          Nghỉ có phép
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus(student.id, 'unexcused')}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                            currentStatus === 'unexcused'
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-rose-700'
                          }`}
                        >
                          Nghỉ không phép
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus(student.id, 'late')}
                          className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                            currentStatus === 'late'
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-amber-700'
                          }`}
                        >
                          Đi trễ
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      {currentStatus !== 'present' && (
                        <input
                          type="text"
                          placeholder="Nhập lý do nghỉ (Ốm, gia đình có việc, không phép...)"
                          value={dailyReasons[student.id] || ''}
                          onChange={(e) => setReason(student.id, e.target.value)}
                          className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Lưu điểm danh ngày {selectedDate}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
