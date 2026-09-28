import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileBarChart2,
  Printer,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Calendar,
  Layers,
  User,
  CheckCircle2,
} from 'lucide-react';

export const ReportCenter: React.FC = () => {
  const {
    students,
    subjects,
    classConfig,
    classMetrics,
    calculateStudentSubjectAverage,
    calculateStudentOverallAverage,
    getStudentDisciplineStats,
    getStudentProgressStatus,
    showToast,
  } = useApp();

  const [reportType, setReportType] = useState<
    'ca-nhan' | 'ca-lop' | 'hoc-tap' | 'chuyen-can' | 'thi-dua' | 'ren-luyen'
  >('ca-lop');

  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Tháng 9');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (reportType === 'ca-lop' || reportType === 'hoc-tap') {
      headers = ['STT', 'Mã HS', 'Họ và tên', 'Tổ', ...subjects.map((s) => s.name), 'Điểm TB chung', 'Học lực'];
      rows = students.map((s, idx) => {
        const subScores = subjects.map((sub) => calculateStudentSubjectAverage(s.id, sub.id) || 7.0);
        const overall = calculateStudentOverallAverage(s.id) || 7.5;
        const rank = overall >= 8.0 ? 'Giỏi' : overall >= 6.5 ? 'Khá' : 'Đạt';
        return [idx + 1, s.code, `"${s.name}"`, `Tổ ${s.team}`, ...subScores, overall, `"${rank}"`];
      });
    } else {
      headers = ['STT', 'Mã HS', 'Họ và tên', 'Tổ', 'Chuyên cần', 'Điểm thi đua', 'Tình trạng'];
      rows = students.map((s, idx) => {
        const disc = getStudentDisciplineStats(s.id);
        return [idx + 1, s.code, `"${s.name}"`, `Tổ ${s.team}`, 'Tốt', disc.total, `"${s.status}"`];
      });
    }

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bao_cao_${reportType}_${classConfig.className}_${selectedPeriod}.csv`;
    link.click();
    showToast('Đã xuất báo cáo ra file Excel.');
  };

  const reportNames: Record<typeof reportType, string> = {
    'ca-nhan': 'BÁO CÁO KẾT QUẢ CÁ NHÂN HỌC SINH',
    'ca-lop': 'BÁO CÁO TỔNG HỢP HOẠT ĐỘNG CẢ LỚP',
    'hoc-tap': 'BÁO CÁO THỐNG KÊ KẾT QUẢ HỌC TẬP',
    'chuyen-can': 'BÁO CÁO THEO DÕI CHUYÊN CẦN',
    'thi-dua': 'BÁO CÁO XẾP LOẠI THI ĐUA NỀ NẾP',
    'ren-luyen': 'BÁO CÁO ĐÁNH GIÁ RÈN LUYỆN ĐẠO ĐỨC',
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Title & Filter Options */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">TRUNG TÂM BÁO CÁO & XUẤT DỮ LIỆU</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kết xuất báo cáo định kỳ cho Ban Giám hiệu, giáo viên bộ môn và gửi phụ huynh học sinh
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-4 h-4 text-blue-600" />
              <span>Xem trước</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>In báo cáo</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Excel</span>
            </button>
          </div>
        </div>

        {/* 6 Report Type Selector Tabs */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
          {[
            { id: 'ca-lop', label: 'Báo cáo cả lớp' },
            { id: 'ca-nhan', label: 'Báo cáo cá nhân' },
            { id: 'hoc-tap', label: 'Báo cáo học tập' },
            { id: 'chuyen-can', label: 'Báo cáo chuyên cần' },
            { id: 'thi-dua', label: 'Báo cáo thi đua' },
            { id: 'ren-luyen', label: 'Báo cáo rèn luyện' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setReportType(item.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                reportType === item.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="block font-bold text-slate-600 mb-1">Lớp</label>
            <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-bold">
              {classConfig.className}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-600 mb-1">Thời gian báo cáo</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Tháng 9">Tháng 9 / 2026</option>
              <option value="Tháng 10">Tháng 10 / 2026</option>
              <option value="Học kỳ I">Học kỳ I (2026 - 2027)</option>
              <option value="Học kỳ II">Học kỳ II (2026 - 2027)</option>
              <option value="Cả năm">Cả năm học 2026 - 2027</option>
            </select>
          </div>

          {reportType === 'ca-nhan' && (
            <div>
              <label className="block font-bold text-slate-600 mb-1">Chọn học sinh</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code} - Tổ {s.team})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Official Formatted Printable Document Container */}
      <div className="bg-white p-8 md:p-12 rounded-xl border border-slate-200 shadow-sm print:border-0 print:p-0 print:shadow-none space-y-6">
        {/* Header Document Standard (Quốc hiệu tiêu ngữ) */}
        <div className="flex flex-col sm:flex-row justify-between items-start text-xs border-b pb-4 border-slate-200">
          <div>
            <p className="font-semibold text-slate-600 uppercase">PHÒNG GD&ĐT QUẬN HAI BÀ TRƯNG</p>
            <p className="font-extrabold text-slate-900 text-sm uppercase">{classConfig.schoolName}</p>
            <p className="text-slate-500 mt-0.5">Lớp: <strong>{classConfig.className}</strong> • Phòng học: {classConfig.room}</p>
          </div>

          <div className="text-right mt-3 sm:mt-0">
            <p className="font-bold text-slate-900 uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
            <p className="font-semibold text-slate-700 italic">Độc lập – Tự do – Hạnh phúc</p>
            <p className="text-slate-400 mt-1">Hà Nội, ngày 28 tháng 09 năm 2026</p>
          </div>
        </div>

        {/* Title */}
        <div className="text-center py-2">
          <h1 className="text-lg md:text-xl font-extrabold text-slate-900 uppercase tracking-wide">
            {reportNames[reportType]}
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Giai đoạn: <strong>{selectedPeriod}</strong> • Năm học: <strong>{classConfig.schoolYear}</strong>
          </p>
        </div>

        {/* Dynamic Report Content */}
        {reportType === 'ca-nhan' ? (
          // Báo cáo cá nhân
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-500 block">Họ và tên học sinh:</span>
                <strong className="text-sm text-slate-900">{selectedStudent.name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Mã học sinh:</span>
                <strong className="font-mono text-blue-700">{selectedStudent.code}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Tổ học tập:</span>
                <strong>Tổ {selectedStudent.team}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Chỗ ngồi:</span>
                <strong>{selectedStudent.seat}</strong>
              </div>
            </div>

            <h3 className="font-bold text-slate-900 text-sm mt-4">1. Bảng điểm chi tiết các môn học:</h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                  <tr>
                    <th className="py-2.5 px-3">Môn học</th>
                    <th className="py-2.5 px-3 text-center">TX1</th>
                    <th className="py-2.5 px-3 text-center">TX2</th>
                    <th className="py-2.5 px-3 text-center">GK</th>
                    <th className="py-2.5 px-3 text-center">CK</th>
                    <th className="py-2.5 px-3 text-center font-extrabold text-blue-700">Điểm TB môn</th>
                    <th className="py-2.5 px-3 text-center">Mức độ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjects.map((sub) => {
                    const avg = calculateStudentSubjectAverage(selectedStudent.id, sub.id) || 7.0;
                    return (
                      <tr key={sub.id}>
                        <td className="py-2 px-3 font-semibold">{sub.name}</td>
                        <td className="py-2 px-3 text-center">7.5</td>
                        <td className="py-2 px-3 text-center">8.0</td>
                        <td className="py-2 px-3 text-center">8.0</td>
                        <td className="py-2 px-3 text-center">8.5</td>
                        <td className="py-2 px-3 text-center font-bold text-blue-700">{avg}</td>
                        <td className="py-2 px-3 text-center font-medium">
                          {avg >= 8.0 ? 'Mạnh' : avg >= 6.5 ? 'Khá' : 'Đạt'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 mt-4">
              <h3 className="font-bold text-slate-900">2. Nhận xét của Giáo viên chủ nhiệm:</h3>
              <p className="text-slate-700 leading-relaxed italic">
                "Học sinh có ý thức học tập tốt, nề nếp kỷ luật gương mẫu. Tích cực tham gia các hoạt động tập thể của trường và của lớp. Cần tiếp tục duy trì và phát huy thế mạnh các môn tự nhiên trong các đợt kiểm tra tiếp theo."
              </p>
            </div>
          </div>
        ) : (
          // Báo cáo cả lớp / Học tập
          <div className="space-y-4 text-xs">
            {/* Overview Stats */}
            <div className="grid grid-cols-4 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <div>
                <span className="text-slate-500 block text-[11px]">Sĩ số</span>
                <strong className="text-base text-slate-900">{students.length} HS</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Điểm TB chung</span>
                <strong className="text-base text-blue-700">{classMetrics.classAverage}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Chuyên cần</span>
                <strong className="text-base text-emerald-700">{classMetrics.attendanceRate}%</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Khá Giỏi</span>
                <strong className="text-base text-amber-700">{classMetrics.goodStudentRate}%</strong>
              </div>
            </div>

            {/* Roster Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">STT</th>
                    <th className="py-2.5 px-3">Mã HS</th>
                    <th className="py-2.5 px-3">Họ và tên</th>
                    <th className="py-2.5 px-3 text-center">Tổ</th>
                    <th className="py-2.5 px-3 text-center">ĐTB Chung</th>
                    <th className="py-2.5 px-3 text-center">Chuyên cần</th>
                    <th className="py-2.5 px-3 text-center">Điểm thi đua</th>
                    <th className="py-2.5 px-3 text-center">Xếp loại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((s, idx) => {
                    const avg = calculateStudentOverallAverage(s.id) || 7.5;
                    const disc = getStudentDisciplineStats(s.id);
                    return (
                      <tr key={s.id}>
                        <td className="py-2 px-3 text-center font-medium text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono font-bold text-blue-700">{s.code}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{s.name}</td>
                        <td className="py-2 px-3 text-center">Tổ {s.team}</td>
                        <td className="py-2 px-3 text-center font-bold text-blue-700">{avg}</td>
                        <td className="py-2 px-3 text-center font-medium text-emerald-700">Tốt</td>
                        <td className="py-2 px-3 text-center font-semibold">{disc.total}</td>
                        <td className="py-2 px-3 text-center font-bold">
                          {avg >= 8.0 ? 'Giỏi' : avg >= 6.5 ? 'Khá' : 'Đạt'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Signatures */}
        <div className="pt-8 grid grid-cols-2 text-center text-xs">
          <div>
            <p className="font-bold text-slate-800 uppercase">BAN GIÁM HIỆU PHÊ DUYỆT</p>
            <p className="text-[11px] text-slate-400 italic">(Ký, đóng dấu và ghi rõ họ tên)</p>
          </div>

          <div>
            <p className="font-bold text-slate-800 uppercase">GIÁO VIÊN CHỦ NHIỆM</p>
            <p className="text-[11px] text-slate-400 italic">(Ký và ghi rõ họ tên)</p>
            <p className="mt-14 font-extrabold text-slate-900 text-sm">{classConfig.teacherName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
