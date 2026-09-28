import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart, DonutChart } from '../common/Charts';
import { Filter, TrendingUp, Award, Layers, Search, Eye } from 'lucide-react';

export const ScoreTracking: React.FC = () => {
  const {
    students,
    subjects,
    selectedClass,
    calculateStudentSubjectAverage,
    calculateStudentOverallAverage,
    openStudentProfile,
  } = useApp();

  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Học kỳ I');
  const [searchName, setSearchName] = useState<string>('');

  // Calculate scores per student
  const studentRows = useMemo(() => {
    return students
      .map((s) => {
        const overall = calculateStudentOverallAverage(s.id) || 7.5;
        const subjectScore =
          selectedSubject !== 'all' ? calculateStudentSubjectAverage(s.id, selectedSubject) : overall;

        let rank = 'Khá';
        if (subjectScore !== null && subjectScore >= 8.0) rank = 'Giỏi';
        else if (subjectScore !== null && subjectScore >= 6.5) rank = 'Khá';
        else if (subjectScore !== null && subjectScore >= 5.0) rank = 'Đạt';
        else rank = 'Chưa đạt';

        return {
          student: s,
          score: subjectScore !== null ? subjectScore : 0,
          overall,
          rank,
        };
      })
      .filter((r) => r.student.name.toLowerCase().includes(searchName.toLowerCase()))
      .sort((a, b) => b.score - a.score);
  }, [students, selectedSubject, calculateStudentSubjectAverage, calculateStudentOverallAverage, searchName]);

  // Grade classification distribution
  const gradeDistribution = useMemo(() => {
    let gioi = 0;
    let kha = 0;
    let dat = 0;
    let chuaDat = 0;

    studentRows.forEach((r) => {
      if (r.score >= 8.0) gioi += 1;
      else if (r.score >= 6.5) kha += 1;
      else if (r.score >= 5.0) dat += 1;
      else chuaDat += 1;
    });

    return [
      { label: 'Giỏi (≥ 8.0)', value: gioi, color: '#10b981' },
      { label: 'Khá (6.5 - 7.9)', value: kha, color: '#2563eb' },
      { label: 'Đạt (5.0 - 6.4)', value: dat, color: '#f59e0b' },
      { label: 'Chưa đạt (< 5.0)', value: chuaDat, color: '#ef4444' },
    ];
  }, [studentRows]);

  const classAvgScore =
    studentRows.length > 0
      ? Math.round((studentRows.reduce((acc, r) => acc + r.score, 0) / studentRows.length) * 10) / 10
      : 7.6;

  return (
    <div className="space-y-5 pb-12">
      {/* Title & Filter */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">THEO DÕI ĐIỂM SỐ LỚP</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân tích phổ điểm, xếp loại học lực và xu hướng thành tích của học sinh
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">ĐTB Toàn lớp:</span>
            <span className="text-lg font-black text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg">
              {classAvgScore}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="block font-bold text-slate-600 mb-1">Lớp</label>
            <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-bold">
              {selectedClass}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">Môn học</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả các môn (Điểm TB chung)</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  Môn {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">Thời gian</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Học kỳ I">Học kỳ I</option>
              <option value="Giữa kỳ I">Giữa kỳ I</option>
              <option value="Cuối kỳ I">Cuối kỳ I</option>
            </select>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Distribution Donut Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
            PHÂN BỐ XẾP LOẠI HỌC LỰC
          </h3>
          <DonutChart
            data={gradeDistribution}
            size={160}
            centerText={`${Math.round(((gradeDistribution[0].value + gradeDistribution[1].value) / Math.max(1, studentRows.length)) * 100)}%`}
            centerSubtext="Khá & Giỏi"
          />
        </div>

        {/* Right 2 cols: Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
            PHỔ ĐIỂM SỐ LƯỢNG THEO MỨC XẾP LOẠI
          </h3>
          <BarChart
            data={gradeDistribution.map((g) => ({
              label: g.label.split(' ')[0],
              value: g.value,
              color: g.color,
            }))}
            height={200}
            maxValue={Math.max(...gradeDistribution.map((g) => g.value), 10)}
            unit="học sinh"
          />
        </div>
      </div>

      {/* Student Ranking Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            BẢNG XẾP HẠNG ĐIỂM SỐ LỚP ({studentRows.length} HỌC SINH)
          </h3>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Lọc theo tên học sinh..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <th className="py-3 px-4 w-14 text-center">Hạng</th>
                <th className="py-3 px-4 w-28">Mã HS</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4 w-20 text-center">Tổ</th>
                <th className="py-3 px-4 w-32 text-center font-extrabold text-blue-700">
                  {selectedSubject === 'all' ? 'Điểm TB chung' : 'Điểm môn đã chọn'}
                </th>
                <th className="py-3 px-4 w-32 text-center">Xếp loại</th>
                <th className="py-3 px-4 w-24 text-center">Hồ sơ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentRows.map((r, idx) => {
                const rankColor =
                  r.rank === 'Giỏi'
                    ? 'bg-emerald-100 text-emerald-800'
                    : r.rank === 'Khá'
                    ? 'bg-blue-100 text-blue-800'
                    : r.rank === 'Đạt'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800';

                return (
                  <tr key={r.student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                          idx === 0
                            ? 'bg-amber-400 text-white shadow-xs'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-800'
                            : idx === 2
                            ? 'bg-amber-600 text-white'
                            : 'text-slate-500'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{r.student.code}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{r.student.name}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-600">
                        Tổ {r.student.team}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-black text-blue-700 text-sm">{r.score}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${rankColor}`}>
                        {r.rank}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => openStudentProfile(r.student.id)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        title="Xem chi tiết hồ sơ"
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
