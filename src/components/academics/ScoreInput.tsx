import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Save, BookOpen, Layers, CheckCircle2, RefreshCw } from 'lucide-react';

export const ScoreInput: React.FC = () => {
  const {
    students,
    subjects,
    scores,
    selectedClass,
    classConfig,
    batchUpdateScores,
    calculateStudentSubjectAverage,
    showToast,
  } = useApp();

  const [selectedSubject, setSelectedSubject] = useState<string>('toan');
  const [selectedScoreType, setSelectedScoreType] = useState<'tx1' | 'tx2' | 'gk' | 'ck'>('tx1');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Tháng 9');

  // Local draft inputs before saving
  const [draftScores, setDraftScores] = useState<Record<string, string>>({});

  // Populate local drafts from context scores
  useEffect(() => {
    const drafts: Record<string, string> = {};
    students.forEach((s) => {
      const val = scores[s.id]?.[selectedSubject]?.[selectedScoreType];
      drafts[s.id] = val !== undefined && val !== null ? val.toString() : '';
    });
    setDraftScores(drafts);
  }, [students, scores, selectedSubject, selectedScoreType]);

  const handleScoreChange = (studentId: string, val: string) => {
    // Validate number between 0 and 10 or empty
    if (val === '' || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 10)) {
      setDraftScores((prev) => ({ ...prev, [studentId]: val }));
    }
  };

  const handleSaveAll = () => {
    const updates = students.map((s) => {
      const raw = draftScores[s.id];
      const parsed = raw !== undefined && raw !== '' ? Number(raw) : null;
      return {
        studentId: s.id,
        type: selectedScoreType,
        score: parsed,
      };
    });

    batchUpdateScores(selectedSubject, updates);
  };

  const currentSubjectObj = subjects.find((s) => s.id === selectedSubject) || subjects[0];

  const scoreTypeLabels: Record<'tx1' | 'tx2' | 'gk' | 'ck', string> = {
    tx1: 'Đánh giá thường xuyên 1 (TX1 - Hệ số 1)',
    tx2: 'Đánh giá thường xuyên 2 (TX2 - Hệ số 1)',
    gk: 'Đánh giá giữa kỳ (GK - Hệ số 2)',
    ck: 'Đánh giá cuối kỳ (CK - Hệ số 3)',
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Title & Filter Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">NHẬP ĐIỂM HỌC TẬP</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Áp dụng thang điểm 10 theo Thông tư 22/2021/TT-BGDĐT. Điểm trung bình môn sẽ tự động tính ngay sau khi lưu.
            </p>
          </div>

          <button
            onClick={handleSaveAll}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
          >
            <Save className="w-4 h-4" />
            <span>Lưu bảng điểm</span>
          </button>
        </div>

        {/* Selection Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="block font-bold text-slate-600 mb-1">Lớp chủ nhiệm</label>
            <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-bold">
              {selectedClass}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">Chọn môn học</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  Môn {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">Loại điểm</label>
            <select
              value={selectedScoreType}
              onChange={(e) => setSelectedScoreType(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="tx1">Thường xuyên 1 (TX1)</option>
              <option value="tx2">Thường xuyên 2 (TX2)</option>
              <option value="gk">Giữa kỳ (GK - Hệ số 2)</option>
              <option value="ck">Cuối kỳ (CK - Hệ số 3)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">Thời gian / Đợt</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Tháng 9">Tháng 9 (Đợt 1)</option>
              <option value="Tháng 10">Tháng 10 (Đợt 2)</option>
              <option value="Giữa kỳ I">Giữa kỳ I</option>
              <option value="Cuối kỳ I">Cuối kỳ I</option>
            </select>
          </div>
        </div>
      </div>

      {/* Score Grid Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 text-xs">
              Môn {currentSubjectObj.name} • {scoreTypeLabels[selectedScoreType]}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Tổng cộng: {students.length} học sinh
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] bg-white">
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4 w-28">Mã HS</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4 w-20 text-center">Tổ</th>
                <th className="py-3 px-4 w-28 text-center text-slate-400">TX1</th>
                <th className="py-3 px-4 w-28 text-center text-slate-400">TX2</th>
                <th className="py-3 px-4 w-28 text-center text-slate-400">GK</th>
                <th className="py-3 px-4 w-28 text-center text-slate-400">CK</th>
                <th className="py-3 px-4 w-36 text-center bg-blue-50/50 text-blue-900 font-extrabold">
                  Điểm đang nhập
                </th>
                <th className="py-3 px-4 w-28 text-center font-extrabold text-blue-700">ĐTB Môn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((student, idx) => {
                const subScores = scores[student.id]?.[selectedSubject] || {};
                const currentSubjectAvg = calculateStudentSubjectAverage(student.id, selectedSubject);

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-blue-700">{student.code}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{student.name}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                        Tổ {student.team}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center text-slate-500 font-medium">
                      {subScores.tx1 ?? '-'}
                    </td>
                    <td className="py-2.5 px-4 text-center text-slate-500 font-medium">
                      {subScores.tx2 ?? '-'}
                    </td>
                    <td className="py-2.5 px-4 text-center text-slate-500 font-medium">
                      {subScores.gk ?? '-'}
                    </td>
                    <td className="py-2.5 px-4 text-center text-slate-500 font-medium">
                      {subScores.ck ?? '-'}
                    </td>

                    {/* Active Input Cell */}
                    <td className="py-2 px-4 text-center bg-blue-50/30">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={draftScores[student.id] ?? ''}
                        onChange={(e) => handleScoreChange(student.id, e.target.value)}
                        placeholder="0.0"
                        className="w-20 text-center py-1.5 px-2 bg-white border border-blue-300 rounded font-bold text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
                      />
                    </td>

                    {/* Auto Computed Average */}
                    <td className="py-2.5 px-4 text-center">
                      <span className="font-extrabold text-blue-700 text-sm">
                        {currentSubjectAvg !== null ? currentSubjectAvg : '-'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info & button */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 italic">
            * Công thức Thông tư 22: ĐTB = (Tổng ĐĐGtx + 2*ĐĐGgk + 3*ĐĐGck) / (Số ĐĐGtx + 2 + 3)
          </span>

          <button
            onClick={handleSaveAll}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Lưu bảng điểm môn {currentSubjectObj.name}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
