import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TrendingUp, ArrowUp, ArrowDown, Minus, Eye, Sparkles, Filter } from 'lucide-react';

export const StudentProgress: React.FC = () => {
  const {
    students,
    openStudentProfile,
    getStudentProgressStatus,
    calculateStudentOverallAverage,
    setActivePath,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'Tăng' | 'Ổn định' | 'Giảm'>('all');

  const studentProgressList = useMemo(() => {
    return students
      .map((s) => {
        const progress = getStudentProgressStatus(s.id);
        const overall = calculateStudentOverallAverage(s.id) || 7.5;
        return {
          student: s,
          status: progress.status,
          delta: progress.delta,
          overall,
        };
      })
      .filter((item) => activeFilter === 'all' || item.status === activeFilter)
      .sort((a, b) => b.delta - a.delta);
  }, [students, getStudentProgressStatus, calculateStudentOverallAverage, activeFilter]);

  const countIncreasing = students.filter((s) => getStudentProgressStatus(s.id).status === 'Tăng').length;
  const countStable = students.filter((s) => getStudentProgressStatus(s.id).status === 'Ổn định').length;
  const countDecreasing = students.filter((s) => getStudentProgressStatus(s.id).status === 'Giảm').length;

  return (
    <div className="space-y-5 pb-12">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">THEO DÕI HỌC SINH TIẾN BỘ</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hệ thống tự động phân tích độ biến thiên điểm số qua các kỳ kiểm tra để nhận diện học sinh tiến bộ và học sinh cần kèm cặp
            </p>
          </div>

          <button
            onClick={() => setActivePath('ai-phan-tich')}
            className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Đề xuất biện pháp hỗ trợ</span>
          </button>
        </div>

        {/* 3 Metric Summary Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={() => setActiveFilter(activeFilter === 'Tăng' ? 'all' : 'Tăng')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activeFilter === 'Tăng'
                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1">
                <ArrowUp className="w-4 h-4 text-emerald-600" /> Học sinh tăng điểm
              </span>
              <span className="text-xl font-black text-emerald-700">{countIncreasing}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Có sự bứt phá tích cực so với đầu kỳ</p>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'Ổn định' ? 'all' : 'Ổn định')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activeFilter === 'Ổn định'
                ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1">
                <Minus className="w-4 h-4 text-blue-600" /> Học sinh ổn định
              </span>
              <span className="text-xl font-black text-blue-700">{countStable}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Duy trì thành tích đều đặn</p>
          </button>

          <button
            onClick={() => setActiveFilter(activeFilter === 'Giảm' ? 'all' : 'Giảm')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activeFilter === 'Giảm'
                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800 uppercase flex items-center gap-1">
                <ArrowDown className="w-4 h-4 text-rose-600" /> Học sinh giảm điểm
              </span>
              <span className="text-xl font-black text-rose-700">{countDecreasing}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Cần giáo viên chủ nhiệm can thiệp kịp thời</p>
          </button>
        </div>
      </div>

      {/* Progress Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase">
            DANH SÁCH CHI TIẾT ({studentProgressList.length} HỌC SINH)
          </span>
          {activeFilter !== 'all' && (
            <button
              onClick={() => setActiveFilter('all')}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Hiển thị tất cả
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4 w-28">Mã HS</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4 w-20 text-center">Tổ</th>
                <th className="py-3 px-4 w-28 text-center font-bold text-slate-700">ĐTB Hiện tại</th>
                <th className="py-3 px-4 w-36 text-center font-extrabold">Mức độ thay đổi</th>
                <th className="py-3 px-4">Ghi chú & Định hướng của GVCN</th>
                <th className="py-3 px-4 w-24 text-center">Hồ sơ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentProgressList.map((item, idx) => {
                const isIncreasing = item.status === 'Tăng';
                const isDecreasing = item.status === 'Giảm';

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
                    <td className="py-3 px-4 text-center font-extrabold text-blue-700 text-sm">
                      {item.overall}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold text-xs ${
                          isIncreasing
                            ? 'bg-emerald-100 text-emerald-800'
                            : isDecreasing
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isIncreasing ? '↑ Tăng' : isDecreasing ? '↓ Giảm' : '→ Ổn định'}
                        <span className="text-[11px] opacity-80">
                          ({item.delta > 0 ? `+${item.delta}` : item.delta})
                        </span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {isIncreasing && (
                        <span className="text-emerald-700 font-medium">
                          ⭐ Biểu dương trước lớp, duy trì mô hình đôi bạn cùng tiến.
                        </span>
                      )}
                      {isDecreasing && (
                        <span className="text-rose-700 font-medium">
                          ⚠️ Cần trao đổi với phụ huynh và bố trí cán sự kèm thêm bài tập.
                        </span>
                      )}
                      {!isIncreasing && !isDecreasing && (
                        <span className="text-slate-500">Tiếp tục động viên phát huy năng lực các môn thế mạnh.</span>
                      )}
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
