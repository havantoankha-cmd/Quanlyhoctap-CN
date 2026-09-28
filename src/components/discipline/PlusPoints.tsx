import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Award, Plus, Trash2, CheckCircle2, Sparkles, Filter } from 'lucide-react';

export const PlusPoints: React.FC = () => {
  const {
    students,
    disciplineRules,
    disciplineEntries,
    addDisciplineEntry,
    deleteDisciplineEntry,
    addDisciplineRule,
    showToast,
  } = useApp();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedRuleId, setSelectedRuleId] = useState<string>('');
  const [customTitle, setCustomTitle] = useState('');
  const [customPoints, setCustomPoints] = useState<number>(3);
  const [customCategory, setCustomCategory] = useState('Học tập');
  const [notes, setNotes] = useState('');
  const [weekNumber, setWeekNumber] = useState<number>(4);

  // Filter plus rules and entries
  const plusRules = disciplineRules.filter((r) => r.type === 'plus');
  const plusEntries = disciplineEntries
    .filter((e) => e.type === 'plus')
    .map((e) => ({
      ...e,
      student: students.find((s) => s.id === e.studentId),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  // Handle Log Plus Points
  const handleLogPlus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    let titleToLog = customTitle;
    let pointsToLog = customPoints;

    if (selectedRuleId) {
      const rule = plusRules.find((r) => r.id === selectedRuleId);
      if (rule) {
        titleToLog = rule.title;
        pointsToLog = rule.points;
      }
    }

    if (!titleToLog.trim()) {
      showToast('Vui lòng chọn hoặc nhập nội dung khen thưởng.', 'error');
      return;
    }

    addDisciplineEntry({
      studentId: selectedStudentId,
      type: 'plus',
      points: pointsToLog,
      title: titleToLog,
      date: new Date().toISOString().slice(0, 10),
      week: weekNumber,
      notes: notes.trim() || undefined,
    });

    setNotes('');
  };

  // Handle Add New Rule
  const [isAddingNewRule, setIsAddingNewRule] = useState(false);
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRulePoints, setNewRulePoints] = useState(5);
  const [newRuleCategory, setNewRuleCategory] = useState('Trách nhiệm');

  const handleAddNewRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleTitle.trim()) return;

    addDisciplineRule({
      title: newRuleTitle.trim(),
      points: newRulePoints,
      type: 'plus',
      category: newRuleCategory,
    });

    setNewRuleTitle('');
    setIsAddingNewRule(false);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">ĐIỂM CỘNG THI ĐUA & KHEN THƯỞNG</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ghi nhận việc tốt, nỗ lực học tập, xây dựng bài và tham gia phong trào tập thể của học sinh
            </p>
          </div>

          <button
            onClick={() => setIsAddingNewRule((prev) => !prev)}
            className="px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingNewRule ? 'Đóng form' : '+ Thêm tiêu chí mới'}</span>
          </button>
        </div>

        {/* Add New Rule Form */}
        {isAddingNewRule && (
          <form onSubmit={handleAddNewRule} className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl mb-4 text-xs space-y-3">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Thêm tiêu chí cộng điểm vào danh mục chung của lớp</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Nội dung tiêu chí cộng điểm</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đạt giải nhất thi đua cờ vua cấp trường..."
                  value={newRuleTitle}
                  onChange={(e) => setNewRuleTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số điểm cộng (+)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newRulePoints}
                  onChange={(e) => setNewRulePoints(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold"
                />
              </div>
            </div>
            <div className="text-right">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
              >
                Lưu tiêu chí mới
              </button>
            </div>
          </form>
        )}

        {/* Log Plus Points Form */}
        <form onSubmit={handleLogPlus} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-3">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Thực hiện cộng điểm thi đua cho học sinh</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Học sinh được cộng</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Tổ {s.team})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chọn từ tiêu chí có sẵn</label>
              <select
                value={selectedRuleId}
                onChange={(e) => {
                  setSelectedRuleId(e.target.value);
                  if (e.target.value) {
                    const r = plusRules.find((item) => item.id === e.target.value);
                    if (r) {
                      setCustomTitle(r.title);
                      setCustomPoints(r.points);
                    }
                  }
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="">-- Tùy chỉnh nội dung khác --</option>
                {plusRules.map((r) => (
                  <option key={r.id} value={r.id}>
                    +{r.points} đ: {r.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nội dung khen thưởng</label>
              <input
                type="text"
                placeholder="Nhập lý do cộng điểm..."
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Điểm cộng (+)</label>
              <input
                type="number"
                min="1"
                max="20"
                value={customPoints}
                onChange={(e) => setCustomPoints(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ghi chú cụ thể (nếu có)</label>
              <input
                type="text"
                placeholder="Ví dụ: Giúp bạn An môn Toán trong giờ tự học..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div className="flex items-end justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ Xác nhận cộng điểm</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Preset Rules Cards */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
          TIÊU CHÍ CỘNG ĐIỂM TIÊU BIỂU CỦA LỚP
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {plusRules.map((rule) => (
            <div
              key={rule.id}
              onClick={() => {
                setSelectedRuleId(rule.id);
                setCustomTitle(rule.title);
                setCustomPoints(rule.points);
                showToast(`Đã chọn tiêu chí: +${rule.points} đ - ${rule.title}`);
              }}
              className="p-3 bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 rounded-xl transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">{rule.category}</span>
                <span className="text-xs font-bold text-slate-800 line-clamp-1">{rule.title}</span>
              </div>
              <span className="text-sm font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-lg flex-shrink-0 ml-2">
                +{rule.points}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* History of Plus Entries */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            NHẬT KÝ CỘNG ĐIỂM THI ĐUA GẦN ĐÂY ({plusEntries.length} LƯỢT)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4 w-28">Ngày</th>
                <th className="py-3 px-4">Học sinh</th>
                <th className="py-3 px-4 w-20 text-center">Tổ</th>
                <th className="py-3 px-4">Nội dung khen thưởng</th>
                <th className="py-3 px-4 w-24 text-center text-emerald-700 font-black">Điểm cộng</th>
                <th className="py-3 px-4 w-20 text-center">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plusEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Chưa có lượt cộng điểm nào trong tuần này.
                  </td>
                </tr>
              ) : (
                plusEntries.map((e, idx) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-center text-slate-400 font-semibold">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{e.date}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{e.student?.name || 'Học sinh'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        Tổ {e.student?.team || 1}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{e.title}</span>
                      {e.notes && <span className="text-slate-500 text-[11px] block">{e.notes}</span>}
                    </td>
                    <td className="py-3 px-4 text-center font-black text-emerald-700 text-sm">
                      +{e.points}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => deleteDisciplineEntry(e.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Xóa bản ghi"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
