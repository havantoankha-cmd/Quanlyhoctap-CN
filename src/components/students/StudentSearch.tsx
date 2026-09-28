import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  User,
  Phone,
  MapPin,
  Eye,
  GraduationCap,
  ChevronRight,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Student } from '../../types';

export const StudentSearch: React.FC = () => {
  const {
    students,
    openStudentProfile,
    calculateStudentOverallAverage,
    deleteStudent,
    showToast,
  } = useApp();
  const [keyword, setKeyword] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchKeyword =
        !keyword.trim() ||
        s.name.toLowerCase().includes(keyword.toLowerCase()) ||
        s.code.toLowerCase().includes(keyword.toLowerCase()) ||
        s.parentPhone.includes(keyword) ||
        s.address.toLowerCase().includes(keyword.toLowerCase());

      const matchTeam = selectedTeam === 'all' || s.team.toString() === selectedTeam;
      const matchStatus = selectedStatus === 'all' || s.status === selectedStatus;

      return matchKeyword && matchTeam && matchStatus;
    });
  }, [students, keyword, selectedTeam, selectedStatus]);

  const handleDeleteConfirm = () => {
    if (studentToDelete) {
      deleteStudent(studentToDelete.id);
      showToast(`Đã xóa học sinh ${studentToDelete.name} khỏi hệ thống.`);
      setStudentToDelete(null);
    }
  };

  return (
    <div className="space-y-5 pb-12">
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">TÌM KIẾM HỌC SINH TOÀN DIỆN</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Tra cứu nhanh hồ sơ, điểm số, chuyên cần, địa chỉ và thông tin phụ huynh học sinh
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Nhập tên học sinh, mã số, SĐT phụ huynh, địa chỉ..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <div>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả các tổ</option>
              <option value="1">Tổ 1</option>
              <option value="2">Tổ 2</option>
              <option value="3">Tổ 3</option>
              <option value="4">Tổ 4</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả tình trạng</option>
              <option value="Bình thường">Bình thường</option>
              <option value="Cần quan tâm">Cần quan tâm</option>
              <option value="Khẩn cấp">Khẩn cấp</option>
              <option value="Tiến bộ">Tiến bộ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Tìm thấy <strong>{filtered.length}</strong> học sinh phù hợp</span>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => {
          const avg = calculateStudentOverallAverage(s.id) || 7.5;
          return (
            <div
              key={s.id}
              onClick={() => openStudentProfile(s.id)}
              className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={s.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={s.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">
                        {s.name}
                      </h4>
                      <p className="text-xs font-mono font-bold text-blue-700">{s.code}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    Tổ {s.team}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Chỗ ngồi:</span>
                    <span className="font-medium text-slate-700">{s.seat}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Điểm TB:</span>
                    <span className="font-bold text-blue-600">{avg}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Phụ huynh:</span>
                    <span className="font-medium text-slate-700">{s.parentName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Số điện thoại:</span>
                    <span className="font-semibold text-slate-800">{s.parentPhone}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  s.status === 'Khẩn cấp' ? 'bg-rose-100 text-rose-800' :
                  s.status === 'Cần quan tâm' ? 'bg-amber-100 text-amber-800' :
                  s.status === 'Tiến bộ' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                }`}>
                  {s.status}
                </span>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => openStudentProfile(s.id)}
                    className="px-2.5 py-1 text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg font-bold flex items-center gap-1 text-[11px] transition-colors"
                    title="Xem hồ sơ chi tiết"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Hồ sơ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudentToDelete(s)}
                    className="px-2.5 py-1 text-rose-600 hover:bg-rose-600 hover:text-white bg-rose-50 border border-rose-200 rounded-lg font-bold flex items-center gap-1 text-[11px] transition-all"
                    title="Xóa học sinh này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-bold text-sm text-slate-900">Xác nhận xóa học sinh</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa học sinh <strong className="text-slate-900">{studentToDelete.name}</strong> ({studentToDelete.code}) khỏi danh sách lớp không? Mọi thông tin điểm số và rèn luyện liên quan cũng sẽ bị xóa.
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
