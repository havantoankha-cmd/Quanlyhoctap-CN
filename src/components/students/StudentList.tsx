import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, Gender, StudentStatus } from '../../types';
import {
  Search,
  Filter,
  UserPlus,
  FileSpreadsheet,
  Download,
  Eye,
  Edit2,
  Trash2,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Upload,
} from 'lucide-react';

export const StudentList: React.FC = () => {
  const {
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    openStudentProfile,
    importStudents,
    showToast,
  } = useApp();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeam, setFilterTeam] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Selected students for batch deletion
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

  // Form State
  const initialFormState: Omit<Student, 'id'> = {
    name: '',
    code: '',
    birthDate: '2014-01-01',
    gender: 'Nam',
    team: 1,
    seat: 'Bàn 1 - Dãy 1',
    status: 'Bình thường',
    parentName: '',
    parentPhone: '',
    parentRelationship: 'Bố',
    address: '',
    notes: '',
  };

  const [formData, setFormData] = useState<Omit<Student, 'id'>>(initialFormState);
  const [importText, setImportText] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.parentPhone.includes(searchTerm);

      const matchTeam = filterTeam === 'all' || s.team.toString() === filterTeam;
      const matchGender = filterGender === 'all' || s.gender === filterGender;
      const matchStatus = filterStatus === 'all' || s.status === filterStatus;

      return matchSearch && matchTeam && matchGender && matchStatus;
    });
  }, [students, searchTerm, filterTeam, filterGender, filterStatus]);

  // Paginated list
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // Open Edit
  const handleOpenEdit = (student: Student) => {
    setCurrentStudent(student);
    setFormData({
      name: student.name,
      code: student.code,
      birthDate: student.birthDate,
      gender: student.gender,
      team: student.team,
      seat: student.seat,
      status: student.status,
      statusNote: student.statusNote,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      parentRelationship: student.parentRelationship,
      address: student.address,
      notes: student.notes,
      avatarUrl: student.avatarUrl,
    });
    setIsEditModalOpen(true);
  };

  // Open Delete
  const handleOpenDelete = (student: Student) => {
    setCurrentStudent(student);
    setIsDeleteModalOpen(true);
  };

  // Handle Save
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      showToast('Vui lòng nhập họ tên và mã học sinh.', 'error');
      return;
    }
    addStudent(formData);
    setIsAddModalOpen(false);
    setFormData(initialFormState);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;
    updateStudent(currentStudent.id, formData);
    setIsEditModalOpen(false);
    setCurrentStudent(null);
  };

  const handleDeleteConfirm = () => {
    if (!currentStudent) return;
    deleteStudent(currentStudent.id);
    setIsDeleteModalOpen(false);
    setCurrentStudent(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllOnPage = () => {
    const pageIds = paginatedStudents.map((s) => s.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleBatchDeleteConfirm = () => {
    selectedIds.forEach((id) => deleteStudent(id));
    showToast(`Đã xóa thành công ${selectedIds.length} học sinh khỏi danh sách lớp.`);
    setSelectedIds([]);
    setIsBatchDeleteModalOpen(false);
  };

  // Export Excel / CSV
  const handleExportCSV = () => {
    const headers = [
      'STT',
      'Mã học sinh',
      'Họ và tên',
      'Ngày sinh',
      'Giới tính',
      'Tổ',
      'Chỗ ngồi',
      'Tình trạng',
      'Họ tên phụ huynh',
      'SĐT phụ huynh',
      'Địa chỉ',
      'Ghi chú',
    ];

    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      s.code,
      `"${s.name}"`,
      s.birthDate,
      s.gender,
      `Tổ ${s.team}`,
      `"${s.seat}"`,
      `"${s.status}"`,
      `"${s.parentName}"`,
      `"${s.parentPhone}"`,
      `"${s.address}"`,
      `"${s.notes || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Danh_sach_hoc_sinh_Lop_7A_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã xuất danh sách lớp ra file Excel/CSV thành công.');
  };

  // Quick import sample
  const handleQuickImport = () => {
    try {
      const parsed = JSON.parse(importText);
      if (Array.isArray(parsed) && parsed.length > 0) {
        importStudents(parsed);
        setIsImportModalOpen(false);
        setImportText('');
      } else {
        showToast('Dữ liệu không đúng định dạng mảng học sinh.', 'error');
      }
    } catch {
      showToast('Định dạng JSON không hợp lệ.', 'error');
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Page Title & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">DANH SÁCH LỚP CHỦ NHIỆM</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng số: <strong className="text-blue-600 font-bold">{students.length} học sinh</strong> • Phân chia 4 tổ học tập
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={() => setIsBatchDeleteModalOpen(true)}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all animate-pulse"
              title="Xóa các học sinh đã được đánh dấu chọn"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa ({selectedIds.length}) học sinh</span>
            </button>
          )}

          <button
            onClick={() => {
              setFormData(initialFormState);
              setIsAddModalOpen(true);
            }}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Thêm học sinh</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Nhập từ Excel</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, mã học sinh, số điện thoại phụ huynh..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Tổ */}
          <select
            value={filterTeam}
            onChange={(e) => {
              setFilterTeam(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả các tổ</option>
            <option value="1">Tổ 1</option>
            <option value="2">Tổ 2</option>
            <option value="3">Tổ 3</option>
            <option value="4">Tổ 4</option>
          </select>

          {/* Giới tính */}
          <select
            value={filterGender}
            onChange={(e) => {
              setFilterGender(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>

          {/* Tình trạng */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả tình trạng</option>
            <option value="Bình thường">Bình thường</option>
            <option value="Cần quan tâm">Cần quan tâm</option>
            <option value="Khẩn cấp">Khẩn cấp</option>
            <option value="Tiến bộ">Tiến bộ</option>
          </select>
        </div>
      </div>

      {/* Main Student Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={
                      paginatedStudents.length > 0 &&
                      paginatedStudents.every((s) => selectedIds.includes(s.id))
                    }
                    onChange={toggleSelectAllOnPage}
                    className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    title="Chọn tất cả trang này"
                  />
                </th>
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4 w-28">Mã học sinh</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4 w-28">Ngày sinh</th>
                <th className="py-3 px-4 w-24">Giới tính</th>
                <th className="py-3 px-4 w-20 text-center">Tổ</th>
                <th className="py-3 px-4">Chỗ ngồi</th>
                <th className="py-3 px-4">Tình trạng</th>
                <th className="py-3 px-4 w-36 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Không tìm thấy học sinh nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student, idx) => {
                  const statusColors: Record<StudentStatus, string> = {
                    'Khẩn cấp': 'bg-rose-50 text-rose-700 border-rose-200',
                    'Cần quan tâm': 'bg-amber-50 text-amber-700 border-amber-200',
                    'Tiến bộ': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    'Bình thường': 'bg-slate-50 text-slate-600 border-slate-200',
                  };

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-blue-50/40 transition-colors cursor-pointer group ${
                        selectedIds.includes(student.id) ? 'bg-blue-50/30' : ''
                      }`}
                      onClick={() => openStudentProfile(student.id)}
                    >
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(student.id)}
                          onChange={() => toggleSelect(student.id)}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-500">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">{student.code}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={student.name}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {student.name}
                            </span>
                            <span className="block text-[11px] text-slate-400">
                              {student.parentName} ({student.parentPhone})
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{student.birthDate}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            student.gender === 'Nam' ? 'bg-sky-50 text-sky-700' : 'bg-pink-50 text-pink-700'
                          }`}
                        >
                          {student.gender}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold text-[11px]">
                          Tổ {student.team}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{student.seat}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${
                            statusColors[student.status]
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td
                        className="py-3 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openStudentProfile(student.id)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Xem hồ sơ chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                            title="Sửa thông tin"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(student)}
                            className="px-2 py-1 text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 border border-rose-200 rounded-lg transition-all flex items-center gap-1 font-bold text-[11px]"
                            title="Xóa học sinh này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Hiển thị {paginatedStudents.length} trên tổng số {filteredStudents.length} học sinh
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-semibold text-slate-700">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Thêm học sinh */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">+ THÊM HỌC SINH MỚI</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn An"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mã học sinh <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: HS0725"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 font-medium font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giới tính</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tổ học tập</label>
                  <select
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: Number(e.target.value) as 1 | 2 | 3 | 4 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  >
                    <option value={1}>Tổ 1</option>
                    <option value={2}>Tổ 2</option>
                    <option value={3}>Tổ 3</option>
                    <option value={4}>Tổ 4</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chỗ ngồi</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Bàn 2 - Dãy 1"
                    value={formData.seat}
                    onChange={(e) => setFormData({ ...formData, seat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ tên phụ huynh</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Nguyễn Văn Hùng"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại phụ huynh</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 0912 345 678"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Địa chỉ thường trú</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Số 12 Tăng Bạt Hổ, Hà Nội"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú của giáo viên chủ nhiệm</label>
                <textarea
                  rows={2}
                  placeholder="Đặc điểm tính cách, lưu ý sức khỏe hoặc sở trường..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm"
                >
                  Lưu học sinh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Sửa học sinh */}
      {isEditModalOpen && currentStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">CHỈNH SỬA THÔNG TIN HỌC SINH</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã học sinh</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tình trạng theo dõi</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as StudentStatus })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-bold"
                  >
                    <option value="Bình thường">Bình thường</option>
                    <option value="Cần quan tâm">Cần quan tâm</option>
                    <option value="Khẩn cấp">Khẩn cấp</option>
                    <option value="Tiến bộ">Tiến bộ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tổ học tập</label>
                  <select
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: Number(e.target.value) as 1 | 2 | 3 | 4 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value={1}>Tổ 1</option>
                    <option value={2}>Tổ 2</option>
                    <option value={3}>Tổ 3</option>
                    <option value={4}>Tổ 4</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chỗ ngồi</label>
                  <input
                    type="text"
                    value={formData.seat}
                    onChange={(e) => setFormData({ ...formData, seat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ tên phụ huynh</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">SĐT phụ huynh</label>
                  <input
                    type="text"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú tình trạng</label>
                <input
                  type="text"
                  placeholder="Lý do cần quan tâm hoặc điểm mạnh cần phát huy..."
                  value={formData.statusNote || ''}
                  onChange={(e) => setFormData({ ...formData, statusNote: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Địa chỉ</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    if (currentStudent) handleOpenDelete(currentStudent);
                  }}
                  className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 rounded-lg font-bold flex items-center gap-1.5 transition-colors"
                  title="Xóa học sinh này"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa học sinh này</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm"
                  >
                    Cập nhật
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Xác nhận xóa */}
      {isDeleteModalOpen && currentStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Xác nhận xóa học sinh</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa học sinh <strong>{currentStudent.name}</strong> ({currentStudent.code}) khỏi danh sách lớp không? Dữ liệu điểm và chuyên cần liên quan cũng sẽ được lưu trữ dự phòng.
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nhập từ Excel / JSON */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-base font-bold text-slate-900">NHẬP DANH SÁCH TỪ EXCEL / DỮ LIỆU</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Dán cấu trúc JSON hoặc danh sách học sinh theo mẫu. Hệ thống sẽ thay thế hoặc cập nhật danh sách lớp hiện tại.
            </p>
            <textarea
              rows={8}
              placeholder="Dán JSON danh sách học sinh vào đây..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => {
                  setImportText(JSON.stringify(students.slice(0, 3), null, 2));
                  showToast('Đã tải mẫu JSON xem thử.');
                }}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Xem mẫu định dạng
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleQuickImport}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  Áp dụng danh sách
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
