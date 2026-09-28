import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Award, Trophy, Medal, Eye, ChevronRight, Download, Filter } from 'lucide-react';

export const WeeklyRanking: React.FC = () => {
  const { students, disciplineEntries, openStudentProfile, selectedClass, showToast } = useApp();
  const [selectedWeek, setSelectedWeek] = useState<number>(4);
  const [filterTeam, setFilterTeam] = useState<string>('all');

  // Compute points per student for the selected week
  const rankingList = useMemo(() => {
    return students
      .map((student) => {
        let plus = 0;
        let minus = 0;

        disciplineEntries
          .filter((e) => e.studentId === student.id && (selectedWeek === 0 || e.week === selectedWeek))
          .forEach((e) => {
            if (e.type === 'plus') plus += e.points;
            else minus += e.points;
          });

        const total = 100 + plus - minus;

        let conductRating = 'Tốt';
        if (total >= 100) conductRating = 'Tốt';
        else if (total >= 90) conductRating = 'Khá';
        else if (total >= 80) conductRating = 'Đạt';
        else conductRating = 'Cần cố gắng';

        return {
          student,
          plus,
          minus,
          total,
          conductRating,
        };
      })
      .filter((r) => filterTeam === 'all' || r.student.team.toString() === filterTeam)
      .sort((a, b) => b.total - a.total);
  }, [students, disciplineEntries, selectedWeek, filterTeam]);

  // Team averages for competition
  const teamStandings = useMemo(() => {
    return [1, 2, 3, 4].map((teamNumber) => {
      const teamStudents = students.filter((s) => s.team === teamNumber);
      let totalPts = 0;

      teamStudents.forEach((st) => {
        let p = 0;
        let m = 0;
        disciplineEntries
          .filter((e) => e.studentId === st.id && (selectedWeek === 0 || e.week === selectedWeek))
          .forEach((e) => {
            if (e.type === 'plus') p += e.points;
            else m += e.points;
          });
        totalPts += 100 + p - m;
      });

      const avgPts = teamStudents.length > 0 ? Math.round((totalPts / teamStudents.length) * 10) / 10 : 100;
      return {
        team: teamNumber,
        avgPts,
        studentCount: teamStudents.length,
      };
    }).sort((a, b) => b.avgPts - a.avgPts);
  }, [students, disciplineEntries, selectedWeek]);

  // Export ranking
  const handleExportRanking = () => {
    const headers = ['Hạng', 'Mã HS', 'Họ và tên', 'Tổ', 'Điểm cộng (+)', 'Điểm trừ (-)', 'Tổng điểm nề nếp', 'Xếp loại'];
    const rows = rankingList.map((r, idx) => [
      idx + 1,
      r.student.code,
      `"${r.student.name}"`,
      `Tổ ${r.student.team}`,
      r.plus,
      r.minus,
      r.total,
      `"${r.conductRating}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Xep_loai_thi_dua_Tuan_${selectedWeek}_${selectedClass}.csv`;
    link.click();
    showToast('Đã xuất bảng xếp loại thi đua ra file Excel.');
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">XẾP LOẠI THI ĐUA TUẦN</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tổng hợp điểm cộng, điểm trừ nề nếp từ điểm chuẩn 100 theo thang đánh giá rèn luyện học sinh THCS
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportRanking}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>Xuất Excel</span>
            </button>
          </div>
        </div>

        {/* Filter Week and Team */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="block font-bold text-slate-600 mb-1">Chọn tuần đánh giá</label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>Tuần 1 (Tháng 9)</option>
              <option value={2}>Tuần 2 (Tháng 9)</option>
              <option value={3}>Tuần 3 (Tháng 9)</option>
              <option value={4}>Tuần 4 (Hiện tại)</option>
              <option value={0}>Tổng hợp toàn bộ học kỳ</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">Lọc theo tổ</label>
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả các tổ (Cả lớp)</option>
              <option value="1">Tổ 1</option>
              <option value="2">Tổ 2</option>
              <option value="3">Tổ 3</option>
              <option value="4">Tổ 4</option>
            </select>
          </div>
        </div>
      </div>

      {/* Team Leaderboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {teamStandings.map((tm, idx) => (
          <div
            key={tm.team}
            className={`p-4 rounded-xl border transition-all ${
              idx === 0
                ? 'bg-gradient-to-br from-amber-50 to-amber-100/60 border-amber-300 ring-2 ring-amber-400/20 shadow-xs'
                : 'bg-white border-slate-200 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">TỔ {tm.team}</span>
              <span
                className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                  idx === 0
                    ? 'bg-amber-400 text-amber-950 font-black'
                    : idx === 1
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                Hạng {idx + 1}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">{tm.avgPts}</span>
              <span className="text-xs text-slate-500">điểm TB</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Sĩ số: {tm.studentCount} thành viên</p>
          </div>
        ))}
      </div>

      {/* Ranking Leaderboard Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            BẢNG TỔNG HỢP XẾP HẠNG THI ĐUA ({rankingList.length} HỌC SINH)
          </h3>
          <span className="text-xs text-slate-500 font-medium">Điểm chuẩn ban đầu: 100 điểm</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <th className="py-3 px-4 w-14 text-center">Hạng</th>
                <th className="py-3 px-4 w-28">Mã HS</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4 w-20 text-center">Tổ</th>
                <th className="py-3 px-4 w-28 text-center text-emerald-700 font-bold">Điểm cộng (+)</th>
                <th className="py-3 px-4 w-28 text-center text-rose-700 font-bold">Điểm trừ (-)</th>
                <th className="py-3 px-4 w-28 text-center font-extrabold text-blue-700 text-sm">Tổng điểm</th>
                <th className="py-3 px-4 w-32 text-center">Xếp loại</th>
                <th className="py-3 px-4 w-24 text-center">Hồ sơ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rankingList.map((row, idx) => {
                const ratingBadge = {
                  Tốt: 'bg-emerald-100 text-emerald-800',
                  Khá: 'bg-blue-100 text-blue-800',
                  Đạt: 'bg-amber-100 text-amber-800',
                  'Cần cố gắng': 'bg-rose-100 text-rose-800',
                };

                return (
                  <tr key={row.student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-center font-bold">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                          idx === 0
                            ? 'bg-amber-400 text-white'
                            : idx === 1
                            ? 'bg-slate-300 text-slate-800'
                            : idx === 2
                            ? 'bg-amber-700 text-white'
                            : 'text-slate-500 font-semibold'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{row.student.code}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{row.student.name}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-600">
                        Tổ {row.student.team}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-700">
                      {row.plus > 0 ? `+${row.plus}` : '0'}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-rose-700">
                      {row.minus > 0 ? `-${row.minus}` : '0'}
                    </td>
                    <td className="py-3 px-4 text-center font-black text-blue-700 text-sm">{row.total}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          ratingBadge[row.conductRating as keyof typeof ratingBadge] || 'bg-slate-100'
                        }`}
                      >
                        {row.conductRating}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => openStudentProfile(row.student.id)}
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
