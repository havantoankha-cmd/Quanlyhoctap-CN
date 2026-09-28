import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  School,
  BookOpen,
  Award,
  MessageSquare,
  User,
  Database,
  Save,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    classConfig,
    updateClassConfig,
    subjects,
    disciplineRules,
    students,
    scores,
    attendance,
    comments,
    parentContacts,
    resetAllData,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'lop-truong' | 'mon-hoc' | 'thi-dua' | 'nhan-xet' | 'tai-khoan' | 'sao-luu'
  >('lop-truong');

  // Local form for class config
  const [formData, setFormData] = useState({
    className: classConfig.className,
    grade: classConfig.grade,
    schoolName: classConfig.schoolName,
    schoolYear: classConfig.schoolYear,
    currentTerm: classConfig.currentTerm,
    room: classConfig.room,
    teacherName: classConfig.teacherName,
    teacherRole: classConfig.teacherRole,
    teacherPhone: classConfig.teacherPhone,
    teacherEmail: classConfig.teacherEmail,
  });

  const handleSaveClassConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateClassConfig(formData);
  };

  // Export full JSON backup
  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      classConfig,
      students,
      subjects,
      scores,
      attendance,
      disciplineRules,
      comments,
      parentContacts,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ClassCare_Backup_${classConfig.className}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Đã tải xuống file sao lưu toàn bộ dữ liệu.');
  };

  // Restore JSON backup
  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.students && parsed.classConfig) {
          localStorage.setItem('classcare_v1_students', JSON.stringify(parsed.students));
          localStorage.setItem('classcare_v1_classConfig', JSON.stringify(parsed.classConfig));
          if (parsed.scores) localStorage.setItem('classcare_v1_scores', JSON.stringify(parsed.scores));
          if (parsed.attendance) localStorage.setItem('classcare_v1_attendance', JSON.stringify(parsed.attendance));
          if (parsed.disciplineRules) localStorage.setItem('classcare_v1_disciplineRules', JSON.stringify(parsed.disciplineRules));
          if (parsed.comments) localStorage.setItem('classcare_v1_comments', JSON.stringify(parsed.comments));
          if (parsed.parentContacts) localStorage.setItem('classcare_v1_parentContacts', JSON.stringify(parsed.parentContacts));

          showToast('Đã khôi phục dữ liệu sao lưu thành công. Hệ thống đang tải lại...');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          showToast('File sao lưu không hợp lệ.', 'error');
        }
      } catch {
        showToast('Lỗi đọc file JSON sao lưu.', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">CÀI ĐẶT HỆ THỐNG</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Tùy chỉnh thông tin lớp học, danh sách môn học, tiêu chí thi đua, tài khoản giáo viên và sao lưu dữ liệu
        </p>

        {/* Tab buttons */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
          {[
            { id: 'lop-truong', label: 'Thông tin lớp & Trường', icon: <School className="w-4 h-4" /> },
            { id: 'mon-hoc', label: 'Danh sách môn học', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'thi-dua', label: 'Tiêu chí thi đua', icon: <Award className="w-4 h-4" /> },
            { id: 'nhan-xet', label: 'Mẫu nhận xét', icon: <MessageSquare className="w-4 h-4" /> },
            { id: 'tai-khoan', label: 'Tài khoản giáo viên', icon: <User className="w-4 h-4" /> },
            { id: 'sao-luu', label: 'Sao lưu & Khôi phục', icon: <Database className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: THÔNG TIN LỚP & TRƯỜNG */}
      {activeTab === 'lop-truong' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
          <form onSubmit={handleSaveClassConfig} className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase">Thông tin trường & Lớp chủ nhiệm</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên lớp học</label>
                <input
                  type="text"
                  required
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Khối lớp</label>
                <input
                  type="text"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên trường học</label>
                <input
                  type="text"
                  required
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Năm học</label>
                <input
                  type="text"
                  value={formData.schoolYear}
                  onChange={(e) => setFormData({ ...formData, schoolYear: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Học kỳ hiện tại</label>
                <select
                  value={formData.currentTerm}
                  onChange={(e) => setFormData({ ...formData, currentTerm: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
                >
                  <option value="Học kỳ I">Học kỳ I</option>
                  <option value="Học kỳ II">Học kỳ II</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phòng học</label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>

            <div className="pt-3 text-right">
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm"
              >
                Lưu thay đổi thông tin lớp
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: DANH SÁCH MÔN HỌC */}
      {activeTab === 'mon-hoc' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase">
            CÁC MÔN HỌC THIẾT LẬP THEO CHƯƠNG TRÌNH GDPT 2018
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {subjects.map((sub) => (
              <div key={sub.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{sub.name}</span>
                  <span className="text-[11px] font-mono text-blue-700 font-semibold">{sub.code}</span>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">
                  Đang bật
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: TIÊU CHÍ THI ĐUA */}
      {activeTab === 'thi-dua' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase">
            DANH MỤC TIÊU CHÍ THI ĐUA CỦA LỚP ({disciplineRules.length} TIÊU CHÍ)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {disciplineRules.map((rule) => (
              <div key={rule.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold">{rule.category}</span>
                  <p className="font-bold text-slate-800">{rule.title}</p>
                </div>
                <span
                  className={`font-black text-sm px-2 py-0.5 rounded-lg ${
                    rule.type === 'plus' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {rule.type === 'plus' ? `+${rule.points}` : `-${rule.points}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: MẪU NHẬN XÉT */}
      {activeTab === 'nhan-xet' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase">KHO CÂU MẪU NHẬN XÉT SƯ PHẠM</h3>
          <p className="text-xs text-slate-500">
            Hệ thống cung cấp sẵn các câu nhận xét chuẩn mực theo từng nhóm năng lực để giáo viên dễ dàng áp dụng khi đánh giá học sinh theo tuần, tháng và học kỳ.
          </p>
        </div>
      )}

      {/* Tab 5: TÀI KHOẢN GIÁO VIÊN */}
      {activeTab === 'tai-khoan' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
          <form onSubmit={handleSaveClassConfig} className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase">Thông tin tài khoản giáo viên chủ nhiệm</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và tên giáo viên</label>
                <input
                  type="text"
                  required
                  value={formData.teacherName}
                  onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chức vụ</label>
                <input
                  type="text"
                  value={formData.teacherRole}
                  onChange={(e) => setFormData({ ...formData, teacherRole: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  value={formData.teacherPhone}
                  onChange={(e) => setFormData({ ...formData, teacherPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email sư phạm</label>
                <input
                  type="email"
                  value={formData.teacherEmail}
                  onChange={(e) => setFormData({ ...formData, teacherEmail: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                />
              </div>
            </div>

            <div className="pt-3 text-right">
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm"
              >
                Cập nhật thông tin tài khoản
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 6: SAO LƯU & KHÔI PHỤC DỮ LIỆU */}
      {activeTab === 'sao-luu' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase">SAO LƯU & KHÔI PHỤC DỮ LIỆU LỚP HỌC</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export JSON */}
            <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                <Download className="w-5 h-5 text-blue-600" />
                <span>Sao lưu toàn bộ dữ liệu (JSON)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tải về máy tính một file JSON chứa toàn bộ danh sách {students.length} học sinh, điểm số tất cả các môn, nhật ký chuyên cần, thi đua và nhận xét để lưu trữ an toàn.
              </p>
              <button
                onClick={handleExportBackup}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Tải file sao lưu (.json)</span>
              </button>
            </div>

            {/* Restore JSON */}
            <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <Upload className="w-5 h-5 text-emerald-600" />
                <span>Khôi phục từ file sao lưu</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tải lên file sao lưu JSON trước đó để khôi phục dữ liệu nguyên trạng khi chuyển sang máy tính mới hoặc đồng bộ.
              </p>
              <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-sm">
                <Upload className="w-4 h-4" />
                <span>Chọn file JSON để khôi phục</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset to standard sample data */}
          <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-amber-900 text-xs block">Khôi phục về dữ liệu mẫu chuẩn (24 học sinh)</span>
              <p className="text-xs text-slate-600 mt-0.5">
                Thiết lập lại danh sách lớp 7A đầy đủ với 24 học sinh mẫu và đầy đủ điểm số các môn.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn đặt lại toàn bộ dữ liệu về trạng thái mẫu ban đầu?')) {
                  resetAllData();
                }
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Khôi phục dữ liệu mẫu</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
