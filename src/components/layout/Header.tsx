import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  HelpCircle,
  Settings,
  Search,
  School,
  Calendar,
  Layers,
  ChevronDown,
  X,
  ExternalLink,
  BookOpen,
  MessageSquare,
  Check,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    classConfig,
    updateClassConfig,
    selectedClass,
    setSelectedClass,
    setActivePath,
    globalSearchQuery,
    setGlobalSearchQuery,
    students,
    teachers,
    openStudentProfile,
    totalUnreadChatCount,
    showToast,
  } = useApp();

  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const classDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  const availableClasses = ['Lớp 6A', 'Lớp 6B', 'Lớp 7A', 'Lớp 7B', 'Lớp 8A', 'Lớp 9A'];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchActive(false);
      }
      if (classDropdownRef.current && !classDropdownRef.current.contains(e.target as Node)) {
        setIsClassDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter students based on global search
  const searchResults = globalSearchQuery.trim()
    ? students.filter(
        (s) =>
          s.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
          s.code.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
          s.parentPhone.includes(globalSearchQuery)
      )
    : [];

  // Filter teachers based on global search
  const teacherResults = globalSearchQuery.trim()
    ? (teachers || []).filter(
        (t) =>
          t.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
          t.code.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
          t.subjectNames.some((sn) => sn.toLowerCase().includes(globalSearchQuery.toLowerCase())) ||
          t.phone.includes(globalSearchQuery)
      )
    : [];

  const notifications = [
    {
      id: 1,
      title: 'Học sinh vắng nhiều',
      desc: 'Trần Thị Bích vắng 4 buổi không phép trong tháng.',
      time: '15 phút trước',
      urgent: true,
      path: 'chuyen-can/nghi-hoc' as const,
    },
    {
      id: 2,
      title: 'Cần cập nhật điểm GK',
      desc: 'Hạn nhập điểm giữa kỳ môn KHTN và Ngữ văn là 30/09.',
      time: '2 giờ trước',
      urgent: false,
      path: 'hoc-tap/nhap-diem' as const,
    },
    {
      id: 3,
      title: 'Học sinh tiến bộ nổi bật',
      desc: 'Phạm Thị Hồng đạt điểm 9.0 bài kiểm tra KHTN.',
      time: 'Hôm nay',
      urgent: false,
      path: 'hoc-tap/tien-bo' as const,
    },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-20 px-4 md:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Class Information & Selector */}
      <div className="flex items-center gap-3 md:gap-5">
        <div className="relative" ref={classDropdownRef}>
          <button
            onClick={() => setIsClassDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100/80 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200/80 font-bold text-sm transition-colors"
          >
            <Layers className="w-4 h-4 text-blue-600" />
            <span>{selectedClass}</span>
            <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
          </button>

          {isClassDropdownOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-40 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-40">
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Chọn lớp chủ nhiệm
              </div>
              {availableClasses.map((cls) => (
                <button
                  key={cls}
                  onClick={() => {
                    setSelectedClass(cls);
                    setIsClassDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-semibold flex items-center justify-between hover:bg-blue-50 hover:text-blue-700 ${
                    selectedClass === cls ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
                  }`}
                >
                  <span>{cls}</span>
                  {selectedClass === cls && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* School & Year Badge */}
        <div className="hidden lg:flex items-center gap-3 text-xs text-slate-600 border-l border-slate-200 pl-4">
          <div className="flex items-center gap-1.5">
            <School className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-semibold text-slate-700">{classConfig.schoolName}</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Năm học {classConfig.schoolYear}</span>
            <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-md border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  if (classConfig.currentTerm !== 'Học kỳ I') {
                    updateClassConfig({ currentTerm: 'Học kỳ I' });
                    showToast('Đã chuyển sang Học kỳ I');
                  }
                }}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  classConfig.currentTerm === 'Học kỳ I'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Chọn Học kỳ I"
              >
                HK I
              </button>
              <button
                type="button"
                onClick={() => {
                  if (classConfig.currentTerm !== 'Học kỳ II') {
                    updateClassConfig({ currentTerm: 'Học kỳ II' });
                    showToast('Đã chuyển sang Học kỳ II');
                  }
                }}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  classConfig.currentTerm === 'Học kỳ II'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Chọn Học kỳ II"
              >
                HK II
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Center / Search bar */}
      <div className="flex-1 max-w-md mx-4 relative" ref={searchContainerRef}>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm kiếm học sinh theo tên, mã HS, SĐT phụ huynh..."
            value={globalSearchQuery}
            onChange={(e) => {
              setGlobalSearchQuery(e.target.value);
              setIsSearchActive(true);
            }}
            onFocus={() => setIsSearchActive(true)}
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-100/90 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400 text-slate-700"
          />
          {globalSearchQuery && (
            <button
              onClick={() => setGlobalSearchQuery('')}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isSearchActive && globalSearchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-40 max-h-80 overflow-y-auto">
            <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
              <span>Kết quả ({searchResults.length + teacherResults.length})</span>
              <button
                onClick={() => {
                  setActivePath('hoc-sinh/tim-kiem');
                  setIsSearchActive(false);
                }}
                className="text-blue-600 hover:underline text-[11px]"
              >
                Tra cứu chi tiết
              </button>
            </div>

            {/* Teachers matching */}
            {teacherResults.length > 0 && (
              <div>
                <div className="px-3 py-1 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Giáo viên bộ môn ({teacherResults.length})
                </div>
                {teacherResults.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActivePath('giao-vien/danh-sach');
                      setIsSearchActive(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-blue-50/80 flex items-center justify-between border-b border-slate-50 last:border-0 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={t.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'}
                        alt={t.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{t.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {t.code} • Môn {t.subjectNames.join(', ')} • {t.department}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                      Xem danh bạ <ExternalLink className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Students matching */}
            {searchResults.length > 0 && (
              <div>
                {teacherResults.length > 0 && (
                  <div className="px-3 py-1 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Học sinh ({searchResults.length})
                  </div>
                )}
                {searchResults.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => {
                      openStudentProfile(student.id);
                      setIsSearchActive(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-blue-50/80 flex items-center justify-between border-b border-slate-50 last:border-0 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={student.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{student.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {student.code} • Tổ {student.team} • {student.seat}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                      Xem hồ sơ <ExternalLink className="w-3 h-3" />
                    </span>
                  </button>
                ))}
              </div>
            )}

            {searchResults.length === 0 && teacherResults.length === 0 && (
              <div className="px-4 py-3 text-xs text-slate-500 text-center">
                Không tìm thấy học sinh hoặc giáo viên phù hợp với "{globalSearchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Navigation & Tools */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Notifications */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            onClick={() => setIsNotifDropdownOpen((prev) => !prev)}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg relative transition-colors"
            title="Thông báo lớp học"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          </button>

          {isNotifDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-80 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-40 animate-fadeIn">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Thông báo chủ nhiệm</span>
                <span className="text-[11px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">
                  3 mới
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setActivePath(n.path);
                      setIsNotifDropdownOpen(false);
                    }}
                    className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${n.urgent ? 'text-rose-600' : 'text-slate-800'}`}>
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chat / Messages Button */}
        <button
          onClick={() => setActivePath('chat/toan-lop')}
          className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Mục chát & Trao đổi lớp học"
        >
          <MessageSquare className="w-4 h-4" />
          {totalUnreadChatCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
              {totalUnreadChatCount}
            </span>
          )}
        </button>

        {/* Help / Guide */}
        <button
          onClick={() => setIsHelpModalOpen(true)}
          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Trợ giúp & Hướng dẫn sử dụng"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Settings Shortcut */}
        <button
          onClick={() => setActivePath('cai-dat')}
          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Cài đặt hệ thống"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Teacher Avatar & Quick Nav */}
        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />
        <button
          onClick={() => setActivePath('cai-dat')}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Thầy Toàn"
            className="w-8 h-8 rounded-full object-cover border border-blue-200"
          />
          <div className="text-left hidden md:block">
            <p className="text-xs font-bold text-slate-800 leading-tight">{classConfig.teacherName}</p>
            <p className="text-[10px] text-slate-500">GVCN {selectedClass}</p>
          </div>
        </button>
      </div>

      {/* Help Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 relative">
            <button
              onClick={() => setIsHelpModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Hướng dẫn sử dụng ClassCare</h3>
                <p className="text-xs text-slate-500">Sổ tay trợ lý quản lý lớp chủ nhiệm THCS</p>
              </div>
            </div>
            <div className="space-y-3 text-xs text-slate-600 max-h-96 overflow-y-auto pr-1">
              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100">
                <strong className="text-blue-900 block mb-1">1. Quản lý học sinh & Hồ sơ:</strong>
                Theo dõi lý lịch, thông tin phụ huynh, chỗ ngồi và tình trạng học sinh. Bấm vào bất kỳ học sinh nào để mở hồ sơ cá nhân với biểu đồ tiến độ.
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <strong className="text-slate-800 block mb-1">2. Học tập & Nhập điểm:</strong>
                Tính điểm trung bình tự động theo Thông tư 22/2021/TT-BGDĐT. Hỗ trợ so sánh cột điểm các môn và tự động lọc danh sách tiến bộ.
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <strong className="text-slate-800 block mb-1">3. Chuyên cần & Thi đua:</strong>
                Điểm danh hàng ngày nhanh gọn, ghi nhận nghỉ phép/không phép, đi trễ. Tích điểm cộng/trừ và tự động xếp loại nề nếp tuần.
              </div>
              <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100">
                <strong className="text-indigo-900 block mb-1">4. AI Cố vấn Sư phạm:</strong>
                Trợ lý AI phân tích dữ liệu thực tế của lớp, phát hiện học sinh cần quan tâm và gợi ý câu nhận xét, giải pháp sư phạm chuẩn mực.
              </div>
            </div>
            <div className="mt-5 text-right">
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
