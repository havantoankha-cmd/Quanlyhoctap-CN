import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart } from '../common/Charts';
import { BarChart3, TrendingUp, Award, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const SubjectComparison: React.FC = () => {
  const { students, subjects, calculateStudentSubjectAverage, selectedClass } = useApp();

  // Compute average score for each subject across the entire class
  const subjectStats = useMemo(() => {
    return subjects.map((sub) => {
      let sum = 0;
      let count = 0;
      let above8 = 0;
      let below5 = 0;

      students.forEach((s) => {
        const avg = calculateStudentSubjectAverage(s.id, sub.id);
        if (avg !== null) {
          sum += avg;
          count += 1;
          if (avg >= 8.0) above8 += 1;
          if (avg < 5.0) below5 += 1;
        }
      });

      const avgScore = count > 0 ? Math.round((sum / count) * 10) / 10 : 7.0;
      return {
        id: sub.id,
        name: sub.name,
        code: sub.code,
        avgScore,
        above8,
        below5,
        totalTested: count,
      };
    }).sort((a, b) => b.avgScore - a.avgScore);
  }, [students, subjects, calculateStudentSubjectAverage]);

  // Chart data
  const chartData = subjectStats.map((s) => ({
    label: s.name,
    value: s.avgScore,
    color: s.avgScore >= 8.0 ? '#10b981' : s.avgScore >= 7.0 ? '#2563eb' : s.avgScore >= 6.0 ? '#f59e0b' : '#ef4444',
  }));

  const highestSubject = subjectStats[0];
  const lowestSubject = subjectStats[subjectStats.length - 1];

  return (
    <div className="space-y-5 pb-12">
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">SO SÁNH ĐIỂM THEO MÔN HỌC</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Đối chiếu mặt bằng điểm trung bình giữa các môn học thuộc chương trình GDPT 2018 tại {selectedClass}
        </p>

        {/* Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase">Môn có ĐTB cao nhất</span>
              <h3 className="text-base font-extrabold text-emerald-950 mt-0.5">{highestSubject?.name}</h3>
              <p className="text-xs text-emerald-700 font-semibold">{highestSubject?.avgScore} điểm trung bình</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-200/60 flex items-center justify-center text-emerald-800 font-bold">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-amber-800 uppercase">Môn cần chú ý bổ trợ</span>
              <h3 className="text-base font-extrabold text-amber-950 mt-0.5">{lowestSubject?.name}</h3>
              <p className="text-xs text-amber-700 font-semibold">{lowestSubject?.avgScore} điểm trung bình</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-200/60 flex items-center justify-center text-amber-800 font-bold">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-blue-800 uppercase">Chênh lệch phổ điểm</span>
              <h3 className="text-base font-extrabold text-blue-950 mt-0.5">
                {highestSubject && lowestSubject ? (Math.round((highestSubject.avgScore - lowestSubject.avgScore) * 10) / 10) : 0} điểm
              </h3>
              <p className="text-xs text-blue-700">Độ đồng đều giữa các môn</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-200/60 flex items-center justify-center text-blue-800 font-bold">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Bar Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-6">
          BIỂU ĐỒ CỘT SO SÁNH ĐIỂM TRUNG BÌNH CÁC MÔN CỦA LỚP
        </h3>
        <BarChart data={chartData} height={260} maxValue={10} unit="điểm" />
      </div>

      {/* Detail Subject Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            BẢNG THỐNG KÊ CHI TIẾT TỪNG MÔN
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4">Tên môn học</th>
                <th className="py-3 px-4 w-28 text-center font-extrabold text-blue-700">Điểm TB Lớp</th>
                <th className="py-3 px-4 w-32 text-center text-emerald-700">Đạt điểm Giỏi (≥ 8.0)</th>
                <th className="py-3 px-4 w-32 text-center text-rose-700">Cần cố gắng (&lt; 5.0)</th>
                <th className="py-3 px-4 text-center">Đánh giá chung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjectStats.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 text-center text-slate-400 font-semibold">{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                  <td className="py-3 px-4 text-center font-black text-blue-700 text-sm">{item.avgScore}</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-700">
                    {item.above8} HS ({Math.round((item.above8 / Math.max(1, students.length)) * 100)}%)
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-rose-700">
                    {item.below5} HS ({Math.round((item.below5 / Math.max(1, students.length)) * 100)}%)
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        item.avgScore >= 8.0
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.avgScore >= 7.0
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.avgScore >= 8.0 ? 'Nổi bật' : item.avgScore >= 7.0 ? 'Khá đồng đều' : 'Cần đẩy mạnh'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
