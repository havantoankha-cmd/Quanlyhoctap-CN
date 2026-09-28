import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, Plus, Trash2, ShieldAlert } from 'lucide-react';

export const MinusPoints: React.FC = () => {
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
  const [customPoints, setCustomPoints] = useState<number>(2);
  const [notes, setNotes] = useState('');
  const [weekNumber, setWeekNumber] = useState<number>(4);

  // Minus rules & entries
  const minusRules = disciplineRules.filter((r) => r.type === 'minus');
  const minusEntries = disciplineEntries
    .filter((e) => e.type === 'minus')
    .map((e) => ({
      ...e,
      student: students.find((s) => s.id === e.studentId),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  // Handle Add New Minus Rule
  const [isAddingNewRule, setIsAddingNewRule] = useState(false);
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRulePoints, setNewRulePoints] = useState(2);
  const [newRuleCategory, setNewRuleCategory] = useState('Nề nếp');

  const handleAddNewRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleTitle.trim()) return;

    addDisciplineRule({
      title: newRuleTitle.trim(),
      points: newRulePoints,
      type: 'minus',
      category: newRuleCategory,
    });

    setNewRuleTitle('');
    setIsAddingNewRule(false);
  };

  const handleLogMinus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    let titleToLog = customTitle;
    let pointsToLog = customPoints;

    if (selectedRuleId) {
      const rule = minusRules.find((r) => r.id === selectedRuleId);
      if (rule) {
        titleToLog = rule.title;
        pointsToLog = rule.points;
      }
    }

    if (!titleToLog.trim()) {
      showToast('Vui lòng chọn hoặc nhập lỗi vi phạm.', 'error');
      return;
    }

    addDisciplineEntry({
      studentId: selectedStudentId,
      type: 'minus',
      points: pointsToLog,
      title: titleToLog,
      date: new Date().toISOString().slice(0, 10),
      week: weekNumber,
      notes: notes.trim() || undefined,
    });

    setNotes('');
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">ĐIỂM TRỪ THI ĐUA & VI PHẠM NỀ NẾP</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ghi nhận các vi phạm nội quy, quên bài tập, mất trật tự để nhắc nhở và đánh giá nề nếp hàng tuần
            </p>
          </div>

          <button
            onClick={() => setIsAddingNewRule((prev) => !prev)}
            className="px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingNewRule ? 'Đóng form' : '+ Thêm tiêu chí vi phạm'}</span>
          </button>
        </div>

        {/* Add New Rule Form */}
        {isAddingNewRule && (
          <form onSubmit={handleAddNewRule} className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl mb-4 text-xs space-y-3">
            <div className="font-bold text-rose-900 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Thêm tiêu chí trừ điểm mới vào hệ thống</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Tên vi phạm</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Ăn quà vặt trong lớp học..."
                  value={newRuleTitle}
                  onChange={(e) => setNewRuleTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Số điểm trừ (-)</label>
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
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs"
              >
                Lưu tiêu chí trừ điểm
              </button>
            </div>
          </form>
        )}

        {/* Log Minus Form */}
        <form onSubmit={handleLogMinus} className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-3">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Ghi nhận vi phạm & trừ điểm học sinh</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Học sinh vi phạm</label>
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
                    const r = minusRules.find((item) => item.id === e.target.value);
                    if (r) {
                      setCustomTitle(r.title);
                      setCustomPoints(r.points);
                    }
                  }
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="">-- Tùy chỉnh lỗi vi phạm khác --</option>
                {minusRules.map((r) => (
                  <option key={r.id} value={r.id}>
                    -{r.points} đ: {r.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nội dung vi phạm</label>
              <input
                type="text"
                placeholder="Ví dụ: Quên mang vở bài tập..."
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Số điểm trừ (-)</label>
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
              <label className="block font-semibold text-slate-700 mb-1">Chi tiết lỗi (nếu có)</label>
              <input
                type="text"
                placeholder="Ví dụ: Giờ Ngữ văn của cô Mai..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div className="flex items-end justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-sm flex items-center gap-1.5"
              >
                <span>- Xác nhận trừ điểm</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Preset Rules */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
          CÁC TIÊU CHÍ TRỪ ĐIỂM QUY ĐỊNH
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {minusRules.map((rule) => (
            <div
              key={rule.id}
              onClick={() => {
                setSelectedRuleId(rule.id);
                setCustomTitle(rule.title);
                setCustomPoints(rule.points);
                showToast(`Đã chọn lỗi vi phạm: -${rule.points} đ - ${rule.title}`);
              }}
              className="p-3 bg-slate-50 border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 rounded-xl transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">{rule.category}</span>
                <span className="text-xs font-bold text-slate-800 line-clamp-1">{rule.title}</span>
              </div>
              <span className="text-sm font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded-lg flex-shrink-0 ml-2">
                -{rule.points}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* History of Minus Entries */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            DANH SÁCH CÁC TRƯỜNG HỢP VI PHẠM GẦN ĐÂY ({minusEntries.length} LƯỢT)
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
                <th className="py-3 px-4">Nội dung vi phạm</th>
                <th className="py-3 px-4 w-24 text-center text-rose-700 font-black">Điểm trừ</th>
                <th className="py-3 px-4 w-20 text-center">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {minusEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Lớp chấp hành nội quy rất tốt, chưa có ghi nhận trừ điểm nào.
                  </td>
                </tr>
              ) : (
                minusEntries.map((e, idx) => (
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
                    <td className="py-3 px-4 text-center font-black text-rose-700 text-sm">
                      -{e.points}
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
