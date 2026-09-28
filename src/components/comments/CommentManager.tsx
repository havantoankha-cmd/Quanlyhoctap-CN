import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { commentTemplates } from '../../data/initialData';
import { TeacherComment } from '../../types';
import { MessageSquare, Save, Copy, Check, Sparkles, Trash2, Edit2, User } from 'lucide-react';

interface CommentManagerProps {
  periodType: 'week' | 'month' | 'semester';
}

export const CommentManager: React.FC<CommentManagerProps> = ({ periodType }) => {
  const { students, comments, saveComment, deleteComment, showToast } = useApp();

  const periodTitle =
    periodType === 'week' ? 'NHẬN XÉT THEO TUẦN' : periodType === 'month' ? 'NHẬN XÉT THEO THÁNG' : 'NHẬN XÉT CUỐI HỌC KỲ';

  const defaultPeriodValues =
    periodType === 'week'
      ? ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4', 'Tuần 5']
      : periodType === 'month'
      ? ['Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12', 'Tháng 1']
      : ['Học kỳ I', 'Học kỳ II', 'Cả năm'];

  const [selectedPeriodValue, setSelectedPeriodValue] = useState<string>(defaultPeriodValues[3] || defaultPeriodValues[0]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [academicText, setAcademicText] = useState('');
  const [conductText, setConductText] = useState('');
  const [progressText, setProgressText] = useState('');

  // Find existing comment for selected student & period
  const existingComment = comments.find(
    (c) => c.studentId === selectedStudentId && c.period === periodType && c.periodValue === selectedPeriodValue
  );

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    const found = comments.find(
      (c) => c.studentId === id && c.period === periodType && c.periodValue === selectedPeriodValue
    );
    if (found) {
      setAcademicText(found.academicComment);
      setConductText(found.conductComment);
      setProgressText(found.progressNote || '');
    } else {
      setAcademicText('');
      setConductText('');
      setProgressText('');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    saveComment({
      studentId: selectedStudentId,
      period: periodType,
      periodValue: selectedPeriodValue,
      academicComment: academicText.trim() || 'Học tập đạt yêu cầu của khối lớp.',
      conductComment: conductText.trim() || 'Chấp hành nghiêm túc nội quy trường lớp.',
      progressNote: progressText.trim() || undefined,
      date: new Date().toISOString().slice(0, 10),
    });
  };

  const handleCopyClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Đã sao chép nhận xét vào bộ nhớ tạm.');
  };

  const currentStudent = students.find((s) => s.id === selectedStudentId);

  // Filter all comments of this period
  const periodComments = comments.filter(
    (c) => c.period === periodType && c.periodValue === selectedPeriodValue
  );

  return (
    <div className="space-y-5 pb-12">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">{periodTitle}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Soạn thảo, lưu trữ và sao chép nhận xét đánh giá học sinh về học tập, rèn luyện và tiến bộ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Đợt đánh giá:</span>
            <select
              value={selectedPeriodValue}
              onChange={(e) => {
                setSelectedPeriodValue(e.target.value);
                const found = comments.find(
                  (c) => c.studentId === selectedStudentId && c.period === periodType && c.periodValue === e.target.value
                );
                if (found) {
                  setAcademicText(found.academicComment);
                  setConductText(found.conductComment);
                  setProgressText(found.progressNote || '');
                } else {
                  setAcademicText('');
                  setConductText('');
                  setProgressText('');
                }
              }}
              className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-700"
            >
              {defaultPeriodValues.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Form Write Comment */}
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-3 border-t border-slate-100">
          {/* Left: Student Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">Chọn học sinh cần nhận xét</label>
            <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
              {students.map((s) => {
                const hasComment = comments.some(
                  (c) => c.studentId === s.id && c.period === periodType && c.periodValue === selectedPeriodValue
                );
                const isSelected = s.id === selectedStudentId;

                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectStudent(s.id)}
                    className={`w-full p-2.5 text-left text-xs flex items-center justify-between transition-colors ${
                      isSelected ? 'bg-blue-600 text-white font-bold' : 'hover:bg-blue-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={`w-1.5 h-1.5 rounded-full ${hasComment ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                      <span className="truncate">{s.name}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {s.code}
                    </span>
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-slate-400 block italic">
              * Chấm xanh biểu thị học sinh đã có nhận xét đợt này.
            </span>
          </div>

          {/* Center & Right: Editor and Preset Templates */}
          <div className="lg:col-span-2 space-y-4">
            {/* Header info */}
            {currentStudent && (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-blue-900">{currentStudent.name}</span>
                  <span className="text-blue-700 ml-2">({currentStudent.code} • Tổ {currentStudent.team})</span>
                </div>
                <span className="font-semibold text-blue-800">
                  {selectedPeriodValue} ({periodType === 'week' ? 'Tuần' : periodType === 'month' ? 'Tháng' : 'Học kỳ'})
                </span>
              </div>
            )}

            {/* Academic Comment */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">1. Nhận xét về Học tập</label>
                <button
                  type="button"
                  onClick={() => setAcademicText(commentTemplates.academic[0])}
                  className="text-[11px] text-blue-600 font-semibold hover:underline"
                >
                  Dùng mẫu tiêu biểu
                </button>
              </div>
              <textarea
                rows={2}
                required
                value={academicText}
                onChange={(e) => setAcademicText(e.target.value)}
                placeholder="Nhận xét về năng lực tiếp thu, hoàn thành bài tập, điểm số..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Conduct Comment */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">2. Nhận xét về Nề nếp & Kỷ luật</label>
                <button
                  type="button"
                  onClick={() => setConductText(commentTemplates.conduct[0])}
                  className="text-[11px] text-blue-600 font-semibold hover:underline"
                >
                  Dùng mẫu tiêu biểu
                </button>
              </div>
              <textarea
                rows={2}
                required
                value={conductText}
                onChange={(e) => setConductText(e.target.value)}
                placeholder="Nhận xét về chuyên cần, lễ phép, đồng phục, thái độ với bạn bè..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Progress Note */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">3. Đánh giá sự Tiến bộ & Lời khuyên</label>
                <button
                  type="button"
                  onClick={() => setProgressText(commentTemplates.progress[0])}
                  className="text-[11px] text-blue-600 font-semibold hover:underline"
                >
                  Dùng mẫu tiêu biểu
                </button>
              </div>
              <input
                type="text"
                value={progressText}
                onChange={(e) => setProgressText(e.target.value)}
                placeholder="Điểm sáng tiến bộ hoặc phương hướng rèn luyện thêm..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  const fullText = `[${currentStudent?.name || ''} - ${selectedPeriodValue}]\n- Học tập: ${academicText}\n- Nề nếp: ${conductText}\n- Tiến bộ: ${progressText}`;
                  handleCopyClipboard(fullText);
                }}
                className="px-3.5 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép toàn bộ nhận xét</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Lưu nhận xét học sinh</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Preset Library Quick Picks */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">
          KHO CÂU NHẬN XÉT MẪU SƯ PHẠM THCS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Học tập */}
          <div className="space-y-2">
            <span className="font-bold text-blue-700 block uppercase text-[11px]">Về học tập:</span>
            {commentTemplates.academic.map((tmpl, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setAcademicText(tmpl);
                  showToast('Đã áp dụng mẫu nhận xét học tập.');
                }}
                className="p-2.5 bg-slate-50 hover:bg-blue-50/70 border border-slate-200 rounded-lg cursor-pointer text-slate-700 transition-colors"
              >
                {tmpl}
              </div>
            ))}
          </div>

          {/* Rèn luyện */}
          <div className="space-y-2">
            <span className="font-bold text-emerald-700 block uppercase text-[11px]">Về nề nếp rèn luyện:</span>
            {commentTemplates.conduct.map((tmpl, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setConductText(tmpl);
                  showToast('Đã áp dụng mẫu nhận xét nề nếp.');
                }}
                className="p-2.5 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 rounded-lg cursor-pointer text-slate-700 transition-colors"
              >
                {tmpl}
              </div>
            ))}
          </div>

          {/* Tiến bộ */}
          <div className="space-y-2">
            <span className="font-bold text-amber-700 block uppercase text-[11px]">Về sự tiến bộ:</span>
            {commentTemplates.progress.map((tmpl, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setProgressText(tmpl);
                  showToast('Đã áp dụng mẫu nhận xét tiến bộ.');
                }}
                className="p-2.5 bg-slate-50 hover:bg-amber-50/70 border border-slate-200 rounded-lg cursor-pointer text-slate-700 transition-colors"
              >
                {tmpl}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Saved Comments of Current Period */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            DANH SÁCH NHẬN XÉT ĐÃ LƯU TRONG {selectedPeriodValue} ({periodComments.length} HỌC SINH)
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {periodComments.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Chưa có nhận xét nào được lưu cho đợt {selectedPeriodValue}. Vui lòng chọn học sinh phía trên để soạn nhận xét.
            </div>
          ) : (
            periodComments.map((com) => {
              const st = students.find((s) => s.id === com.studentId);
              return (
                <div key={com.id} className="p-4 hover:bg-slate-50 flex items-start justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{st?.name || 'Học sinh'}</span>
                      <span className="text-[11px] font-mono text-blue-700 font-bold">({st?.code})</span>
                      <span className="text-[11px] text-slate-400">• Ngày lưu: {com.date}</span>
                    </div>
                    <p className="text-slate-700">
                      <strong>Học tập:</strong> {com.academicComment}
                    </p>
                    <p className="text-slate-700">
                      <strong>Nề nếp:</strong> {com.conductComment}
                    </p>
                    {com.progressNote && (
                      <p className="text-emerald-700 italic">
                        <strong>Tiến bộ:</strong> {com.progressNote}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleSelectStudent(com.studentId)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                      title="Sửa nhận xét"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteComment(com.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded"
                      title="Xóa nhận xét"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
