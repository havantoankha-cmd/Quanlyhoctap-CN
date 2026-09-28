import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Teacher, TeacherCollabNote, NavigationPath } from '../../types';
import {
  Users,
  Search,
  Plus,
  Filter,
  Phone,
  Mail,
  MessageCircle,
  Building,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Award,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Download,
  Printer,
  X,
  MessageSquare,
  Sparkles,
  School,
  FileSpreadsheet,
  Check,
  Upload,
  FileUp,
  FileText,
  Info,
} from 'lucide-react';

export const TeacherManagement: React.FC = () => {
  const {
    teachers,
    subjects,
    students,
    scores,
    activePath,
    setActivePath,
    teacherNotes,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    importTeachers,
    addTeacherCollabNote,
    updateTeacherCollabNote,
    deleteTeacherCollabNote,
    classConfig,
    openStudentProfile,
    showToast,
  } = useApp();

  // Active sub-tab based on route or internal state
  const currentTab = useMemo(() => {
    if (activePath === 'giao-vien/phan-cong') return 'phan-cong';
    if (activePath === 'giao-vien/trao-doi') return 'trao-doi';
    return 'danh-sach';
  }, [activePath]);

  const setTab = (tab: 'danh-sach' | 'phan-cong' | 'trao-doi') => {
    if (tab === 'phan-cong') setActivePath('giao-vien/phan-cong');
    else if (tab === 'trao-doi') setActivePath('giao-vien/trao-doi');
    else setActivePath('giao-vien/danh-sach');
  };

  // Filters for teachers list
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [selectedTeacherForView, setSelectedTeacherForView] = useState<Teacher | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  // Batch delete teachers state
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);

  // Collab note modal
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [noteTeacherId, setNoteTeacherId] = useState<string>('');
  const [noteStudentId, setNoteStudentId] = useState<string>('');
  const [noteTopic, setNoteTopic] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [notePriority, setNotePriority] = useState<'Bình thường' | 'Quan trọng' | 'Khẩn'>('Bình thường');

  // Collab filter
  const [collabStatusFilter, setCollabStatusFilter] = useState('ALL');
  const [collabPriorityFilter, setCollabPriorityFilter] = useState('ALL');

  // Import modal states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importMethod, setImportMethod] = useState<'file' | 'paste'>('file');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [pasteData, setPasteData] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [parsedTeachers, setParsedTeachers] = useState<Teacher[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Highlighted teacher in timetable
  const [timetableHighlightTeacher, setTimetableHighlightTeacher] = useState<string>('ALL');

  // List of unique departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach((t) => set.add(t.department));
    return Array.from(set);
  }, [teachers]);

  // Filtered teachers
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.phone.includes(searchQuery) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subjectNames.some((sn) => sn.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchSubject =
        selectedSubjectFilter === 'ALL' ||
        t.subjectIds.includes(selectedSubjectFilter) ||
        t.subjectNames.some((sn) => sn.toLowerCase().includes(selectedSubjectFilter.toLowerCase()));

      const matchDept = selectedDeptFilter === 'ALL' || t.department === selectedDeptFilter;

      return matchSearch && matchSubject && matchDept;
    });
  }, [teachers, searchQuery, selectedSubjectFilter, selectedDeptFilter]);

  // Statistics
  const totalTeachers = teachers.length;
  const homeroomTeacher = teachers.find((t) => t.isHomeroom);
  const totalWeeklyPeriods = teachers.reduce((acc, t) => acc + (t.periodsPerWeek || 0), 0);
  const openCollabCount = teacherNotes.filter((n) => n.status !== 'Đã giải quyết').length;

  // Timetable definition for Class 7A
  const weeklyTimetable = [
    {
      period: 1,
      time: '07:15 - 08:00',
      days: {
        'Thứ 2': { subject: 'Chào cờ', teacherName: 'Toàn trường', room: 'Sân trường', color: 'bg-rose-50 text-rose-700 border-rose-200' },
        'Thứ 3': { subject: 'Tiếng Anh', teacherName: 'Thầy Trần Minh Hoàng', room: 'P.204', color: 'bg-sky-50 text-sky-700 border-sky-200', teacherId: 'gv-03' },
        'Thứ 4': { subject: 'Toán', teacherName: 'Thầy Hà Văn Toàn', room: 'P.204', color: 'bg-blue-50 text-blue-700 border-blue-200', teacherId: 'gv-01' },
        'Thứ 5': { subject: 'GDCD', teacherName: 'Cô Hoàng Thị Bích Ngọc', room: 'P.204', color: 'bg-amber-50 text-amber-700 border-amber-200', teacherId: 'gv-08' },
        'Thứ 6': { subject: 'Tiếng Anh', teacherName: 'Thầy Trần Minh Hoàng', room: 'P.204', color: 'bg-sky-50 text-sky-700 border-sky-200', teacherId: 'gv-03' },
        'Thứ 7': { subject: 'Lịch sử & ĐL', teacherName: 'Cô Phạm Hồng Nhung', room: 'P.204', color: 'bg-teal-50 text-teal-700 border-teal-200', teacherId: 'gv-06' },
      },
    },
    {
      period: 2,
      time: '08:05 - 08:50',
      days: {
        'Thứ 2': { subject: 'Toán', teacherName: 'Thầy Hà Văn Toàn', room: 'P.204', color: 'bg-blue-50 text-blue-700 border-blue-200', teacherId: 'gv-01' },
        'Thứ 3': { subject: 'Tiếng Anh', teacherName: 'Thầy Trần Minh Hoàng', room: 'P.204', color: 'bg-sky-50 text-sky-700 border-sky-200', teacherId: 'gv-03' },
        'Thứ 4': { subject: 'Toán', teacherName: 'Thầy Hà Văn Toàn', room: 'P.204', color: 'bg-blue-50 text-blue-700 border-blue-200', teacherId: 'gv-01' },
        'Thứ 5': { subject: 'Ngữ văn', teacherName: 'Cô Nguyễn Thị Mai Lan', room: 'P.204', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', teacherId: 'gv-02' },
        'Thứ 6': { subject: 'KHTN (Lí)', teacherName: 'Thầy Đặng Quốc Bảo', room: 'P.204', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', teacherId: 'gv-05' },
        'Thứ 7': { subject: 'Tin học', teacherName: 'Thầy Vũ Đình Khang', room: 'Phòng Máy 2', color: 'bg-cyan-50 text-cyan-700 border-cyan-200', teacherId: 'gv-07' },
      },
    },
    {
      period: 3,
      time: '09:05 - 09:50',
      days: {
        'Thứ 2': { subject: 'Toán', teacherName: 'Thầy Hà Văn Toàn', room: 'P.204', color: 'bg-blue-50 text-blue-700 border-blue-200', teacherId: 'gv-01' },
        'Thứ 3': { subject: 'KHTN', teacherName: 'Cô Lê Thị Thu Trang', room: 'Phòng TH 1', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', teacherId: 'gv-04' },
        'Thứ 4': { subject: 'Lịch sử & ĐL', teacherName: 'Cô Phạm Hồng Nhung', room: 'P.204', color: 'bg-teal-50 text-teal-700 border-teal-200', teacherId: 'gv-06' },
        'Thứ 5': { subject: 'Ngữ văn', teacherName: 'Cô Nguyễn Thị Mai Lan', room: 'P.204', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', teacherId: 'gv-02' },
        'Thứ 6': { subject: 'Toán', teacherName: 'Thầy Hà Văn Toàn', room: 'P.204', color: 'bg-blue-50 text-blue-700 border-blue-200', teacherId: 'gv-01' },
        'Thứ 7': { subject: 'GDTC', teacherName: 'Cô Bùi Thị Thu Hà', room: 'Sân thể thao', color: 'bg-orange-50 text-orange-700 border-orange-200', teacherId: 'gv-10' },
      },
    },
    {
      period: 4,
      time: '09:55 - 10:40',
      days: {
        'Thứ 2': { subject: 'Ngữ văn', teacherName: 'Cô Nguyễn Thị Mai Lan', room: 'P.204', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', teacherId: 'gv-02' },
        'Thứ 3': { subject: 'KHTN', teacherName: 'Cô Lê Thị Thu Trang', room: 'Phòng TH 1', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', teacherId: 'gv-04' },
        'Thứ 4': { subject: 'Lịch sử & ĐL', teacherName: 'Cô Phạm Hồng Nhung', room: 'P.204', color: 'bg-teal-50 text-teal-700 border-teal-200', teacherId: 'gv-06' },
        'Thứ 5': { subject: 'KHTN', teacherName: 'Cô Lê Thị Thu Trang', room: 'P.204', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', teacherId: 'gv-04' },
        'Thứ 6': { subject: 'Công nghệ', teacherName: 'Thầy Ngô Tuấn Anh', room: 'P.204', color: 'bg-lime-50 text-lime-700 border-lime-200', teacherId: 'gv-09' },
        'Thứ 7': { subject: 'Mĩ thuật', teacherName: 'Thầy Lương Gia Khiêm', room: 'Phòng Mĩ thuật', color: 'bg-pink-50 text-pink-700 border-pink-200', teacherId: 'gv-12' },
      },
    },
    {
      period: 5,
      time: '10:45 - 11:30',
      days: {
        'Thứ 2': { subject: 'Ngữ văn', teacherName: 'Cô Nguyễn Thị Mai Lan', room: 'P.204', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', teacherId: 'gv-02' },
        'Thứ 3': { subject: 'Tin học', teacherName: 'Thầy Vũ Đình Khang', room: 'Phòng Máy 2', color: 'bg-cyan-50 text-cyan-700 border-cyan-200', teacherId: 'gv-07' },
        'Thứ 4': { subject: 'GDTC', teacherName: 'Cô Bùi Thị Thu Hà', room: 'Sân thể thao', color: 'bg-orange-50 text-orange-700 border-orange-200', teacherId: 'gv-10' },
        'Thứ 5': { subject: 'Âm nhạc', teacherName: 'Cô Đỗ Mỹ Linh', room: 'Phòng Âm nhạc', color: 'bg-purple-50 text-purple-700 border-purple-200', teacherId: 'gv-11' },
        'Thứ 6': { subject: 'HĐTN - HN', teacherName: 'Thầy Hà Văn Toàn', room: 'P.204', color: 'bg-blue-50 text-blue-700 border-blue-200', teacherId: 'gv-01' },
        'Thứ 7': { subject: 'Sinh hoạt lớp', teacherName: 'Thầy Hà Văn Toàn (GVCN)', room: 'P.204', color: 'bg-blue-600 text-white font-bold', teacherId: 'gv-01' },
      },
    },
  ];

  // Open Edit Modal for existing or new
  const handleOpenEdit = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher({ ...teacher });
    } else {
      setEditingTeacher({
        id: '',
        code: `GV${String(teachers.length + 1).padStart(2, '0')}`,
        name: '',
        gender: 'Nữ',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
        subjectIds: ['toan'],
        subjectNames: ['Toán'],
        role: 'Giáo viên bộ môn',
        department: 'Tổ Toán - Tin',
        phone: '09',
        email: '',
        zalo: '',
        isHomeroom: false,
        teachingClasses: ['7A'],
        periodsPerWeek: 3,
        qualification: 'Cử nhân Sư phạm',
        officeRoom: 'Phòng Hội đồng',
        status: 'Đang giảng dạy',
        notes: '',
        schedule: [],
      });
    }
    setIsEditModalOpen(true);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    if (!editingTeacher.name.trim()) {
      showToast('Vui lòng nhập họ và tên giáo viên', 'warning');
      return;
    }

    if (editingTeacher.id) {
      updateTeacher(editingTeacher.id, editingTeacher);
    } else {
      const { id, ...data } = editingTeacher;
      addTeacher(data);
    }
    setIsEditModalOpen(false);
    setEditingTeacher(null);
  };

  const handleDeleteConfirm = () => {
    if (teacherToDelete) {
      deleteTeacher(teacherToDelete.id);
      setSelectedTeacherIds((prev) => prev.filter((id) => id !== teacherToDelete.id));
      setIsDeleteModalOpen(false);
      setTeacherToDelete(null);
    }
  };

  const toggleSelectTeacher = (id: string) => {
    setSelectedTeacherIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllTeachers = () => {
    const currentIds = filteredTeachers.map((t) => t.id);
    const allSelected = currentIds.length > 0 && currentIds.every((id) => selectedTeacherIds.includes(id));
    if (allSelected) {
      setSelectedTeacherIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedTeacherIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  const handleBatchDeleteConfirm = () => {
    selectedTeacherIds.forEach((id) => deleteTeacher(id));
    showToast(`Đã xóa thành công ${selectedTeacherIds.length} giáo viên khỏi danh sách.`);
    setSelectedTeacherIds([]);
    setIsBatchDeleteModalOpen(false);
  };

  // Save new Collab Note
  const handleSaveCollabNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTeacherId) {
      showToast('Vui lòng chọn giáo viên bộ môn', 'warning');
      return;
    }
    if (!noteTopic.trim() || !noteContent.trim()) {
      showToast('Vui lòng nhập tiêu đề và nội dung trao đổi', 'warning');
      return;
    }

    const t = teachers.find((item) => item.id === noteTeacherId);
    addTeacherCollabNote({
      teacherId: noteTeacherId,
      subjectId: t?.subjectIds[0],
      studentId: noteStudentId || undefined,
      date: new Date().toISOString().split('T')[0],
      topic: noteTopic,
      content: noteContent,
      priority: notePriority,
      status: 'Chờ phản hồi',
      creatorName: `Thầy ${classConfig.teacherName} (GVCN)`,
    });

    setIsAddNoteModalOpen(false);
    setNoteTopic('');
    setNoteContent('');
    setNoteStudentId('');
    showToast('Đã lưu nội dung trao đổi chuyên môn!');
  };

  // Helper to calculate subject statistics for class 7A
  const getTeacherSubjectStats = (subjectId?: string) => {
    if (!subjectId) return { avg: null, count: 0, lowCount: 0, highCount: 0 };
    let sum = 0;
    let count = 0;
    let lowCount = 0;
    let highCount = 0;

    students.forEach((s) => {
      const sc = scores[s.id]?.[subjectId];
      if (sc) {
        let scSum = 0;
        let scW = 0;
        if (typeof sc.tx1 === 'number') { scSum += sc.tx1; scW += 1; }
        if (typeof sc.tx2 === 'number') { scSum += sc.tx2; scW += 1; }
        if (typeof sc.gk === 'number') { scSum += sc.gk * 2; scW += 2; }
        if (typeof sc.ck === 'number') { scSum += sc.ck * 3; scW += 3; }
        if (scW > 0) {
          const avg = scSum / scW;
          sum += avg;
          count += 1;
          if (avg < 6.5) lowCount += 1;
          if (avg >= 8.5) highCount += 1;
        }
      }
    });

    const avg = count > 0 ? Math.round((sum / count) * 10) / 10 : 7.6;
    return { avg, count, lowCount, highCount };
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'STT',
      'Mã GV',
      'Họ và tên',
      'Giới tính',
      'Môn giảng dạy',
      'Tổ chuyên môn',
      'Chức vụ',
      'Số điện thoại',
      'Email',
      'Số tiết/tuần (7A)',
      'Phòng làm việc',
      'Trình độ chuyên môn',
      'Trạng thái',
      'Ghi chú',
    ];

    const rows = filteredTeachers.map((t, idx) => [
      idx + 1,
      t.code,
      `"${t.name}"`,
      t.gender,
      `"${t.subjectNames.join(', ')}"`,
      `"${t.department}"`,
      `"${t.role}"`,
      `"${t.phone}"`,
      `"${t.email}"`,
      t.periodsPerWeek,
      `"${t.officeRoom || ''}"`,
      `"${t.qualification || ''}"`,
      `"${t.status}"`,
      `"${t.notes || ''}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Danh_sach_giao_vien_bo_mon_Lop_7A_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã xuất danh sách giáo viên ra file Excel/CSV thành công.');
  };

  // Download Sample Template for Import
  const downloadTemplate = (format: 'csv' | 'json') => {
    if (format === 'csv') {
      const headers = [
        'Mã GV',
        'Họ và tên',
        'Giới tính',
        'Môn học',
        'Tổ chuyên môn',
        'Chức vụ',
        'Số điện thoại',
        'Email',
        'Số tiết lớp 7A',
        'Phòng làm việc',
        'Trình độ',
        'Ghi chú',
      ];
      const samples = [
        ['GV13', 'Nguyễn Thị Hồng Hạnh', 'Nữ', 'Toán', 'Tổ Toán - Tin', 'Giáo viên bộ môn', '0912 345 999', 'honghanh.nguyen@thcstangbatho.edu.vn', '4', 'P.202 - Dãy B', 'Thạc sĩ Toán', 'Dạy bồi dưỡng HSG'],
        ['GV14', 'Vũ Quang Dũng', 'Nam', 'Ngữ văn', 'Tổ Ngữ văn - KHXH', 'Giáo viên bộ môn', '0983 456 888', 'quangdung.vu@thcstangbatho.edu.vn', '4', 'P.201 - Dãy B', 'Cử nhân Sư phạm Ngữ văn', 'Phụ trách chuyên đề Văn học'],
        ['GV15', 'Lê Quỳnh Nga', 'Nữ', 'Tiếng Anh', 'Tổ Ngoại ngữ', 'Giáo viên bộ môn', '0904 567 777', 'quynhnga.le@thcstangbatho.edu.vn', '3', 'Phòng Lab Ngoại ngữ', 'IELTS 8.0', 'Phụ trách CLB Tiếng Anh'],
      ];
      const csvContent = '\uFEFF' + [headers.join(','), ...samples.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Mau_Nhap_Giao_Vien_ClassCare.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Đã tải file mẫu Excel (.csv) thành công!');
    } else {
      const sampleJSON = [
        {
          code: 'GV13',
          name: 'Nguyễn Thị Hồng Hạnh',
          gender: 'Nữ',
          subjectNames: ['Toán'],
          department: 'Tổ Toán - Tin',
          role: 'Giáo viên bộ môn Toán',
          phone: '0912 345 999',
          email: 'honghanh.nguyen@thcstangbatho.edu.vn',
          periodsPerWeek: 4,
          officeRoom: 'P.202 - Dãy B',
          qualification: 'Thạc sĩ Toán',
          notes: 'Dạy bồi dưỡng HSG',
        },
        {
          code: 'GV14',
          name: 'Vũ Quang Dũng',
          gender: 'Nam',
          subjectNames: ['Ngữ văn'],
          department: 'Tổ Ngữ văn - KHXH',
          role: 'Giáo viên bộ môn Ngữ văn',
          phone: '0983 456 888',
          email: 'quangdung.vu@thcstangbatho.edu.vn',
          periodsPerWeek: 4,
          officeRoom: 'P.201 - Dãy B',
          qualification: 'Cử nhân Sư phạm Ngữ văn',
          notes: 'Phụ trách chuyên đề Văn học',
        },
      ];
      const blob = new Blob([JSON.stringify(sampleJSON, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Mau_Nhap_Giao_Vien_ClassCare.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Đã tải file mẫu JSON thành công!');
    }
  };

  // Parse CSV or TSV text
  const parseCSVOrTSV = (text: string): Teacher[] => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length === 0) return [];

    const firstLine = lines[0];
    let delimiter = ',';
    if (firstLine.includes('\t')) delimiter = '\t';
    else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          result.push(cur.trim().replace(/^"|"$/g, ''));
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.trim().replace(/^"|"$/g, ''));
      return result;
    };

    const rows = lines.map(parseLine);
    if (rows.length === 0) return [];

    const h0 = rows[0].map((h) => h.toLowerCase());
    const isHeader =
      h0.some((h) => h.includes('mã') || h.includes('tên') || h.includes('họ') || h.includes('môn') || h.includes('name'));

    let startIndex = 0;
    const colIndex = {
      code: -1,
      name: -1,
      gender: -1,
      subject: -1,
      department: -1,
      role: -1,
      phone: -1,
      email: -1,
      periods: -1,
      room: -1,
      qualification: -1,
      notes: -1,
    };

    if (isHeader) {
      startIndex = 1;
      h0.forEach((h, idx) => {
        if (h.includes('mã') || h === 'code') colIndex.code = idx;
        else if (h.includes('tên') || h.includes('họ') || h === 'name') colIndex.name = idx;
        else if (h.includes('giới') || h === 'gender') colIndex.gender = idx;
        else if (h.includes('môn') || h === 'subject') colIndex.subject = idx;
        else if (h.includes('tổ') || h.includes('khoa') || h === 'department') colIndex.department = idx;
        else if (h.includes('chức') || h.includes('nhiệm vụ') || h === 'role') colIndex.role = idx;
        else if (h.includes('thoại') || h.includes('sđt') || h.includes('phone')) colIndex.phone = idx;
        else if (h.includes('email') || h.includes('thư')) colIndex.email = idx;
        else if (h.includes('tiết') || h.includes('periods')) colIndex.periods = idx;
        else if (h.includes('phòng') || h.includes('văn phòng') || h === 'room') colIndex.room = idx;
        else if (h.includes('trình độ') || h.includes('học vị') || h === 'qualification') colIndex.qualification = idx;
        else if (h.includes('ghi chú') || h.includes('notes')) colIndex.notes = idx;
      });
    }

    if (colIndex.name === -1) colIndex.name = 1;
    if (colIndex.code === -1) colIndex.code = 0;
    if (colIndex.gender === -1) colIndex.gender = 2;
    if (colIndex.subject === -1) colIndex.subject = 3;
    if (colIndex.department === -1) colIndex.department = 4;
    if (colIndex.role === -1) colIndex.role = 5;
    if (colIndex.phone === -1) colIndex.phone = 6;
    if (colIndex.email === -1) colIndex.email = 7;
    if (colIndex.periods === -1) colIndex.periods = 8;

    const parsed: Teacher[] = [];
    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i];
      if (row.length === 0 || !row.some((cell) => cell.trim().length > 0)) continue;

      const name = (colIndex.name >= 0 ? row[colIndex.name] : '') || row[1] || row[0] || '';
      if (!name.trim()) continue;

      const code =
        (colIndex.code >= 0 && row[colIndex.code] ? row[colIndex.code].trim() : '') ||
        `GV${String(teachers.length + parsed.length + 1).padStart(2, '0')}`;

      const genderRaw = colIndex.gender >= 0 && row[colIndex.gender] ? row[colIndex.gender] : '';
      const gender = genderRaw.toLowerCase().includes('nữ') ? 'Nữ' : 'Nam';

      const subjectRaw = (colIndex.subject >= 0 && row[colIndex.subject] ? row[colIndex.subject] : '') || 'Toán';
      const subjectNames = subjectRaw.split(/[,;&+/]/).map((s) => s.trim()).filter(Boolean);
      if (subjectNames.length === 0) subjectNames.push('Toán');

      const subjectIds = subjectNames.map((sn) => {
        const found = subjects.find(
          (s) => s.name.toLowerCase() === sn.toLowerCase() || s.code.toLowerCase() === sn.toLowerCase()
        );
        return found ? found.id : sn.toLowerCase().replace(/\s+/g, '');
      });

      const department =
        (colIndex.department >= 0 && row[colIndex.department] ? row[colIndex.department].trim() : '') ||
        (subjectRaw.includes('Toán') || subjectRaw.includes('Tin') ? 'Tổ Toán - Tin' :
         subjectRaw.includes('Văn') || subjectRaw.includes('Sử') || subjectRaw.includes('Địa') ? 'Tổ Ngữ văn - KHXH' :
         subjectRaw.includes('Anh') ? 'Tổ Ngoại ngữ' : 'Tổ Khoa học Tự nhiên');

      const role =
        (colIndex.role >= 0 && row[colIndex.role] ? row[colIndex.role].trim() : '') ||
        `Giáo viên bộ môn ${subjectNames[0]}`;

      const phone =
        (colIndex.phone >= 0 && row[colIndex.phone] ? row[colIndex.phone].trim() : '') ||
        `09${Math.floor(10000000 + Math.random() * 90000000)}`;

      const email =
        (colIndex.email >= 0 && row[colIndex.email] ? row[colIndex.email].trim() : '') ||
        `${code.toLowerCase()}@thcstangbatho.edu.vn`;

      const periodsPerWeek =
        (colIndex.periods >= 0 && parseInt(row[colIndex.periods], 10)) ? parseInt(row[colIndex.periods], 10) : 3;

      const officeRoom =
        (colIndex.room >= 0 && row[colIndex.room] ? row[colIndex.room].trim() : '') || 'Phòng Hội đồng';

      const qualification =
        (colIndex.qualification >= 0 && row[colIndex.qualification] ? row[colIndex.qualification].trim() : '') ||
        'Cử nhân Sư phạm';

      const notes =
        (colIndex.notes >= 0 && row[colIndex.notes] ? row[colIndex.notes].trim() : '') ||
        'Nhập từ file danh sách giáo viên';

      const avatarUrl =
        gender === 'Nữ'
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80';

      parsed.push({
        id: `gv-imp-${Date.now().toString(36)}-${i}`,
        code,
        name,
        gender,
        avatarUrl,
        subjectIds,
        subjectNames,
        role,
        department,
        phone,
        email,
        zalo: phone.replace(/\D/g, ''),
        isHomeroom: false,
        teachingClasses: ['7A'],
        periodsPerWeek,
        schedule: [],
        officeRoom,
        status: 'Đang giảng dạy',
        qualification,
        notes,
      });
    }

    return parsed;
  };

  // Parse JSON text
  const parseJSON = (text: string): Teacher[] => {
    const raw = JSON.parse(text);
    if (!Array.isArray(raw)) throw new Error('Dữ liệu JSON phải là một danh sách (mảng) các giáo viên.');

    return raw.map((item: any, idx: number) => {
      const code = item.code || item.maGV || `GV${String(teachers.length + idx + 1).padStart(2, '0')}`;
      const name = item.name || item.hoTen || item.fullName || `Giáo viên ${idx + 1}`;
      const gender = (item.gender || item.gioiTinh || 'Nam').toLowerCase().includes('nữ') ? 'Nữ' : 'Nam';
      const subjectNames = Array.isArray(item.subjectNames)
        ? item.subjectNames
        : Array.isArray(item.subjects)
        ? item.subjects
        : typeof item.subject === 'string'
        ? [item.subject]
        : ['Toán'];
      const subjectIds = Array.isArray(item.subjectIds)
        ? item.subjectIds
        : subjectNames.map((sn: string) => sn.toLowerCase().replace(/\s+/g, ''));

      return {
        id: item.id || `gv-imp-${Date.now().toString(36)}-${idx}`,
        code,
        name,
        gender,
        avatarUrl:
          item.avatarUrl ||
          (gender === 'Nữ'
            ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'),
        subjectIds,
        subjectNames,
        role: item.role || item.chucVu || `Giáo viên bộ môn ${subjectNames[0]}`,
        department: item.department || item.toChuyenMon || 'Tổ Bộ môn',
        phone: item.phone || item.sdt || '0912 000 111',
        email: item.email || `${code.toLowerCase()}@thcstangbatho.edu.vn`,
        zalo: item.zalo || item.phone || '',
        isHomeroom: Boolean(item.isHomeroom),
        teachingClasses: Array.isArray(item.teachingClasses) ? item.teachingClasses : ['7A'],
        periodsPerWeek: Number(item.periodsPerWeek) || 3,
        schedule: Array.isArray(item.schedule) ? item.schedule : [],
        officeRoom: item.officeRoom || item.phongLamViec || 'Phòng Hội đồng',
        status: item.status || 'Đang giảng dạy',
        qualification: item.qualification || item.trinhDo || 'Cử nhân Sư phạm',
        notes: item.notes || item.ghiChu || 'Nhập từ file',
      };
    });
  };

  // Process text or file content
  const handleProcessImportText = (text: string) => {
    setParseErrors([]);
    try {
      const trimmed = text.trim();
      let results: Teacher[] = [];
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        results = parseJSON(trimmed);
      } else {
        results = parseCSVOrTSV(trimmed);
      }

      if (results.length === 0) {
        setParseErrors(['Không tìm thấy dữ liệu giáo viên hợp lệ. Vui lòng kiểm tra lại cấu trúc file hoặc tải file mẫu.']);
        setParsedTeachers([]);
      } else {
        setParsedTeachers(results);
        showToast(`Đã nhận diện thành công ${results.length} giáo viên từ file!`);
      }
    } catch (err: any) {
      setParseErrors([err?.message || 'Lỗi khi đọc file. Vui lòng kiểm tra lại định dạng file.']);
      setParsedTeachers([]);
    }
  };

  // Handle file selected from input
  const handleFileSelected = (file: File) => {
    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setPasteData(content);
        handleProcessImportText(content);
      }
    };
    reader.onerror = () => {
      setParseErrors(['Không thể đọc file đã chọn.']);
    };
    reader.readAsText(file, 'utf-8');
  };

  // Handle drop file
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelected(file);
    }
  };

  // Confirm import teachers to AppContext
  const handleConfirmImport = () => {
    if (parsedTeachers.length === 0) {
      showToast('Chưa có giáo viên nào để nhập.', 'warning');
      return;
    }

    importTeachers(parsedTeachers, importMode);
    setIsImportModalOpen(false);
    setParsedTeachers([]);
    setPasteData('');
    setSelectedFileName('');
    setParseErrors([]);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                  DANH SÁCH GIÁO VIÊN BỘ MÔN
                </h1>
                <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                  {classConfig.className}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý đội ngũ giáo viên giảng dạy các bộ môn, phân công chuyên môn, thời khóa biểu và sổ trao đổi sư phạm
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {selectedTeacherIds.length > 0 && (
            <button
              onClick={() => setIsBatchDeleteModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-rose-500/20 transition-all animate-fadeIn"
              title="Xóa các giáo viên đã chọn"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa ({selectedTeacherIds.length}) giáo viên</span>
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
            title="Xuất file danh bạ Excel/CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel/CSV</span>
          </button>
          <button
            onClick={() => {
              setParsedTeachers([]);
              setPasteData('');
              setSelectedFileName('');
              setParseErrors([]);
              setIsImportModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition-all border border-emerald-200 shadow-2xs hover:scale-[1.01]"
            title="Thêm giáo viên bằng file Excel, CSV hoặc JSON"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Thêm bằng file</span>
          </button>
          <button
            onClick={() => handleOpenEdit()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-blue-500/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm giáo viên</span>
          </button>
        </div>
      </div>

      {/* 4 Statistics Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng giáo viên</span>
            <div className="text-2xl font-extrabold text-slate-800 mt-1">{totalTeachers}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Đủ các phân môn THCS</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">GV Chủ nhiệm</span>
            <div className="text-base font-bold text-blue-700 mt-1 truncate max-w-[160px]">
              {homeroomTeacher?.name || classConfig.teacherName}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Phụ trách lớp {classConfig.className}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <School className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng số tiết/tuần</span>
            <div className="text-2xl font-extrabold text-slate-800 mt-1">{totalWeeklyPeriods} tiết</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Thời lượng học chuẩn THCS</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trao đổi bộ môn</span>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{openCollabCount} việc</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Phối hợp quản lý học sinh</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-2">
        <button
          onClick={() => setTab('danh-sach')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
            currentTab === 'danh-sach'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Danh sách giáo viên bộ môn ({teachers.length})</span>
        </button>

        <button
          onClick={() => setTab('phan-cong')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
            currentTab === 'phan-cong'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Phân công & Thời khóa biểu</span>
        </button>

        <button
          onClick={() => setTab('trao-doi')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all relative ${
            currentTab === 'trao-doi'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Sổ trao đổi chuyên môn</span>
          {openCollabCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
              {openCollabCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Danh sách giáo viên */}
      {currentTab === 'danh-sach' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-3 flex-wrap">
              {/* Search input */}
              <div className="relative min-w-[240px] flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm giáo viên theo tên, môn, SĐT..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Subject Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedSubjectFilter}
                  onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 py-1.5 px-2.5 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Tất cả môn học</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      Môn {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 py-1.5 px-2.5 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Tất cả tổ chuyên môn</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Batch Select and View Mode Toggle */}
            <div className="flex items-center gap-3 self-end md:self-auto">
              <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer font-medium hover:text-slate-900 select-none bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
                <input
                  type="checkbox"
                  checked={
                    filteredTeachers.length > 0 &&
                    filteredTeachers.every((t) => selectedTeacherIds.includes(t.id))
                  }
                  onChange={toggleSelectAllTeachers}
                  className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer w-3.5 h-3.5"
                />
                <span>Chọn tất cả ({filteredTeachers.length})</span>
              </label>

              <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-slate-50">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 text-xs font-semibold rounded ${
                    viewMode === 'grid' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dạng thẻ
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 text-xs font-semibold rounded ${
                    viewMode === 'table' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dạng bảng
                </button>
              </div>
            </div>
          </div>

          {/* Teacher Cards Grid */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTeachers.map((teacher) => {
                const subStats = getTeacherSubjectStats(teacher.subjectIds[0]);

                return (
                  <div
                    key={teacher.id}
                    className={`bg-white rounded-xl border shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group ${
                      selectedTeacherIds.includes(teacher.id) ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200/90'
                    }`}
                  >
                    {/* Card Header & Avatar */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedTeacherIds.includes(teacher.id)}
                            onChange={() => toggleSelectTeacher(teacher.id)}
                            className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4 flex-shrink-0"
                            title="Chọn giáo viên"
                          />
                          <div className="relative">
                            <img
                              src={
                                teacher.avatarUrl ||
                                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
                              }
                              alt={teacher.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-slate-200"
                            />
                            <span
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                teacher.status === 'Đang giảng dạy'
                                  ? 'bg-emerald-500'
                                  : 'bg-amber-500'
                              }`}
                              title={teacher.status}
                            />
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                                {teacher.name}
                              </h3>
                              <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded">
                                {teacher.code}
                              </span>
                            </div>
                            <p className="text-xs text-blue-600 font-semibold mt-0.5">{teacher.role}</p>
                            <p className="text-[11px] text-slate-500">{teacher.department}</p>
                          </div>
                        </div>

                        {teacher.isHomeroom && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 rounded-full flex-shrink-0">
                            GVCN 7A
                          </span>
                        )}
                      </div>

                      {/* Subjects Taught Badges */}
                      <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                        {teacher.subjectNames.map((sn, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-50 text-blue-700 font-bold text-[11px] px-2.5 py-0.5 rounded-md border border-blue-200/60"
                          >
                            Môn {sn}
                          </span>
                        ))}
                        <span className="text-[11px] text-slate-500 font-medium ml-1">
                          • {teacher.periodsPerWeek} tiết/tuần (7A)
                        </span>
                      </div>

                      {/* Contact Info */}
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>Điện thoại:</span>
                          </span>
                          <a
                            href={`tel:${teacher.phone}`}
                            className="font-semibold text-slate-800 hover:text-blue-600"
                          >
                            {teacher.phone}
                          </a>
                        </div>

                        <div className="flex items-center justify-between text-slate-600">
                          <span className="flex items-center gap-1.5 text-slate-500 truncate mr-2">
                            <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>Email:</span>
                          </span>
                          <a
                            href={`mailto:${teacher.email}`}
                            className="font-medium text-slate-700 hover:text-blue-600 truncate max-w-[170px]"
                            title={teacher.email}
                          >
                            {teacher.email}
                          </a>
                        </div>

                        <div className="flex items-center justify-between text-slate-600">
                          <span className="flex items-center gap-1.5 text-slate-500">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            <span>Văn phòng:</span>
                          </span>
                          <span className="text-slate-700 font-medium truncate max-w-[170px]">
                            {teacher.officeRoom || 'Phòng Hội đồng'}
                          </span>
                        </div>
                      </div>

                      {/* Subject Performance mini stats */}
                      {subStats.avg !== null && (
                        <div className="mt-3.5 p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[11px] text-slate-500 block">ĐTB môn lớp 7A</span>
                            <span className="font-extrabold text-blue-700 text-sm">{subStats.avg} điểm</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] text-slate-500 block">Học sinh giỏi / Yếu</span>
                            <span className="text-[11px] font-semibold text-slate-700">
                              <span className="text-emerald-600 font-bold">{subStats.highCount} giỏi</span> •{' '}
                              <span className="text-amber-600 font-bold">{subStats.lowCount} cần hỗ trợ</span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${teacher.phone}`}
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Gọi điện"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        {teacher.zalo && (
                          <a
                            href={`https://zalo.me/${teacher.zalo.replace(/\s+/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Nhắn Zalo"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <a
                          href={`mailto:${teacher.email}`}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Gửi Email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setNoteTeacherId(teacher.id);
                            setIsAddNoteModalOpen(true);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700 font-semibold px-2 py-1 hover:bg-blue-50 rounded transition-colors"
                          title="Ghi chú trao đổi"
                        >
                          Trao đổi
                        </button>
                        <button
                          onClick={() => handleOpenEdit(teacher)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Sửa thông tin giáo viên"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setTeacherToDelete(teacher);
                            setIsDeleteModalOpen(true);
                          }}
                          className="px-2 py-1 text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 border border-rose-200 rounded-lg transition-all flex items-center gap-1 font-bold text-[11px]"
                          title="Xóa giáo viên"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>
                        <button
                          onClick={() => setSelectedTeacherForView(teacher)}
                          className="text-xs bg-white text-slate-700 font-bold border border-slate-200 px-2 py-1 rounded hover:bg-slate-100 transition-colors flex items-center gap-0.5"
                        >
                          Hồ sơ <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                    <tr>
                      <th className="py-3 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={
                            filteredTeachers.length > 0 &&
                            filteredTeachers.every((t) => selectedTeacherIds.includes(t.id))
                          }
                          onChange={toggleSelectAllTeachers}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                          title="Chọn tất cả giáo viên"
                        />
                      </th>
                      <th className="py-3 px-4">Mã GV</th>
                      <th className="py-3 px-4">Họ và tên</th>
                      <th className="py-3 px-4">Môn giảng dạy</th>
                      <th className="py-3 px-4">Tổ chuyên môn</th>
                      <th className="py-3 px-4">Chức vụ</th>
                      <th className="py-3 px-4">Số tiết (7A)</th>
                      <th className="py-3 px-4">Số điện thoại</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTeachers.map((teacher) => (
                      <tr
                        key={teacher.id}
                        className={`hover:bg-blue-50/40 transition-colors ${
                          selectedTeacherIds.includes(teacher.id) ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedTeacherIds.includes(teacher.id)}
                            onChange={() => toggleSelectTeacher(teacher.id)}
                            className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-600">{teacher.code}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={teacher.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'}
                              alt={teacher.name}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block">{teacher.name}</span>
                              {teacher.isHomeroom && (
                                <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded">
                                  GVCN 7A
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {teacher.subjectNames.map((sn, idx) => (
                              <span
                                key={idx}
                                className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded text-[11px]"
                              >
                                {sn}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-600">{teacher.department}</td>
                        <td className="py-3 px-4 text-slate-700 font-semibold">{teacher.role}</td>
                        <td className="py-3 px-4 font-bold text-center text-blue-700">
                          {teacher.periodsPerWeek} tiết
                        </td>
                        <td className="py-3 px-4">
                          <a href={`tel:${teacher.phone}`} className="font-mono text-blue-600 hover:underline">
                            {teacher.phone}
                          </a>
                        </td>
                        <td className="py-3 px-4 truncate max-w-[180px] text-slate-600">
                          {teacher.email}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedTeacherForView(teacher)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                              title="Xem chi tiết"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(teacher)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setTeacherToDelete(teacher);
                                setIsDeleteModalOpen(true);
                              }}
                              className="px-2 py-1 text-rose-600 hover:text-white hover:bg-rose-600 bg-rose-50 border border-rose-200 rounded-lg transition-all flex items-center gap-1 font-bold text-[11px]"
                              title="Xóa giáo viên"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Xóa</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Phân công giảng dạy & Thời khóa biểu */}
      {currentTab === 'phan-cong' && (
        <div className="space-y-6">
          {/* Section 1: Weekly Timetable Grid */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>THỜI KHÓA BIỂU LỚP {classConfig.className} (ÁP DỤNG HỌC KỲ I)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lịch giảng dạy chi tiết các buổi sáng từ Thứ Hai đến Thứ Bảy kèm giáo viên bộ môn phụ trách
                </p>
              </div>

              {/* Filter highlight teacher */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Lọc theo giáo viên:</span>
                <select
                  value={timetableHighlightTeacher}
                  onChange={(e) => setTimetableHighlightTeacher(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 py-1.5 px-3 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Tất cả giáo viên</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subjectNames.join(', ')})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Timetable Matrix */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-3 w-16 border-r border-slate-200">Tiết</th>
                    <th className="py-3 px-3 w-28 border-r border-slate-200">Thời gian</th>
                    <th className="py-3 px-3 border-r border-slate-200">Thứ Hai</th>
                    <th className="py-3 px-3 border-r border-slate-200">Thứ Ba</th>
                    <th className="py-3 px-3 border-r border-slate-200">Thứ Tư</th>
                    <th className="py-3 px-3 border-r border-slate-200">Thứ Năm</th>
                    <th className="py-3 px-3 border-r border-slate-200">Thứ Sáu</th>
                    <th className="py-3 px-3">Thứ Bảy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {weeklyTimetable.map((slot) => (
                    <tr key={slot.period} className="hover:bg-slate-50/50">
                      <td className="py-3 px-2 font-bold text-slate-800 bg-slate-50 border-r border-slate-200">
                        Tiết {slot.period}
                      </td>
                      <td className="py-3 px-2 text-[11px] text-slate-500 bg-slate-50 border-r border-slate-200 font-mono">
                        {slot.time}
                      </td>
                      {(['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'] as const).map((day) => {
                        const cell = slot.days[day];
                        const isHighlighted =
                          timetableHighlightTeacher === 'ALL' || cell.teacherId === timetableHighlightTeacher;
                        const isDimmed = timetableHighlightTeacher !== 'ALL' && cell.teacherId !== timetableHighlightTeacher;

                        return (
                          <td
                            key={day}
                            className={`p-2 border-r last:border-r-0 border-slate-200 align-top transition-opacity ${
                              isDimmed ? 'opacity-35' : 'opacity-100'
                            }`}
                          >
                            <div
                              className={`p-2.5 rounded-lg border text-left shadow-2xs transition-all ${
                                cell.color
                              } ${isHighlighted && timetableHighlightTeacher !== 'ALL' ? 'ring-2 ring-blue-600 scale-[1.02]' : ''}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs">{cell.subject}</span>
                                <span className="text-[10px] font-mono opacity-80">{cell.room}</span>
                              </div>
                              <p className="text-[11px] mt-1 font-medium truncate">{cell.teacherName}</p>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Teaching Assignment Summary Table */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>BẢNG TỔNG HỢP PHÂN CÔNG GIẢNG DẠY LỚP {classConfig.className}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quyết định phân công chuyên môn năm học {classConfig.schoolYear} - Hiệu trưởng phê duyệt
                </p>
              </div>

              <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                Tổng 30 tiết / tuần
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">STT</th>
                    <th className="py-3 px-4">Môn học</th>
                    <th className="py-3 px-4">Giáo viên phụ trách</th>
                    <th className="py-3 px-4">Tổ chuyên môn</th>
                    <th className="py-3 px-4">Trình độ đào tạo</th>
                    <th className="py-3 px-4 text-center">Số tiết/tuần</th>
                    <th className="py-3 px-4">Phòng học bộ môn</th>
                    <th className="py-3 px-4">Lịch dạy trong tuần</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teachers.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-blue-700">{t.subjectNames.join(', ')}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={t.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'}
                            alt={t.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="font-bold text-slate-900">{t.name}</span>
                          {t.isHomeroom && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded">
                              GVCN
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{t.department}</td>
                      <td className="py-3 px-4 text-slate-600">{t.qualification || 'Cử nhân Sư phạm'}</td>
                      <td className="py-3 px-4 font-bold text-center text-blue-700 bg-blue-50/30">
                        {t.periodsPerWeek} tiết
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">{t.officeRoom || 'P.204'}</td>
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {t.schedule && t.schedule.length > 0
                          ? t.schedule.map((s) => `${s.dayOfWeek} (T${s.period})`).join(', ')
                          : 'Theo TKB'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Sổ trao đổi chuyên môn */}
      {currentTab === 'trao-doi' && (
        <div className="space-y-4">
          {/* Header & New Note Button */}
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>SỔ TRAO ĐỔI & PHỐI HỢP GIỮA GVCN VÀ GIÁO VIÊN BỘ MÔN</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ghi nhận tình hình học sinh, bài tập về nhà, đề xuất bồi dưỡng hoặc hỗ trợ học sinh có hoàn cảnh đặc biệt
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setNoteTeacherId(teachers[0]?.id || '');
                  setIsAddNoteModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo trao đổi mới</span>
              </button>
            </div>
          </div>

          {/* Notes List */}
          <div className="space-y-3">
            {teacherNotes.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-slate-200 text-slate-500 text-xs">
                Chưa có trao đổi nào được ghi lại. Bấm nút "Tạo trao đổi mới" để bắt đầu phối hợp với giáo viên bộ môn.
              </div>
            ) : (
              teacherNotes.map((note) => {
                const teacher = teachers.find((t) => t.id === note.teacherId);
                const student = students.find((s) => s.id === note.studentId);

                const priorityStyles = {
                  'Bình thường': 'bg-slate-100 text-slate-700 border-slate-200',
                  'Quan trọng': 'bg-amber-100 text-amber-800 border-amber-200',
                  'Khẩn': 'bg-rose-100 text-rose-800 border-rose-200',
                };

                const statusStyles = {
                  'Chờ phản hồi': 'bg-amber-50 text-amber-700 border-amber-200',
                  'Đã trao đổi': 'bg-blue-50 text-blue-700 border-blue-200',
                  'Đã giải quyết': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                };

                return (
                  <div
                    key={note.id}
                    className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:border-blue-200 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={teacher?.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'}
                          alt={teacher?.name || 'GV'}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900">{note.topic}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityStyles[note.priority]}`}>
                              {note.priority}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Giáo viên: <strong className="text-slate-700">{teacher?.name || 'Giáo viên bộ môn'}</strong> ({teacher?.subjectNames.join(', ')}) • Ngày {note.date}
                          </p>
                        </div>
                      </div>

                      {/* Status badge & Dropdown */}
                      <div className="flex items-center gap-2">
                        <select
                          value={note.status}
                          onChange={(e) =>
                            updateTeacherCollabNote(note.id, {
                              status: e.target.value as TeacherCollabNote['status'],
                            })
                          }
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border focus:outline-none ${statusStyles[note.status]}`}
                        >
                          <option value="Chờ phản hồi">Chờ phản hồi</option>
                          <option value="Đã trao đổi">Đã trao đổi</option>
                          <option value="Đã giải quyết">Đã giải quyết</option>
                        </select>

                        <button
                          onClick={() => deleteTeacherCollabNote(note.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Xóa trao đổi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {note.content}
                    </p>

                    {/* Response/Result if any */}
                    {note.response && (
                      <div className="text-xs bg-blue-50/70 p-3 rounded-lg border border-blue-100 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-blue-900 block text-[11px]">Hồi âm / Kết quả xử lý:</span>
                          <p className="text-blue-800 text-xs mt-0.5">{note.response}</p>
                        </div>
                      </div>
                    )}

                    {/* Linked Student Badge */}
                    {student && (
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-semibold uppercase">Học sinh liên quan:</span>
                          <button
                            onClick={() => openStudentProfile(student.id)}
                            className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <span>{student.name} ({student.code} - Tổ {student.team})</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modal 1: Teacher Detail Profile Modal */}
      {selectedTeacherForView && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            {/* Modal Header Banner */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white relative">
              <button
                onClick={() => setSelectedTeacherForView(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <img
                  src={
                    selectedTeacherForView.avatarUrl ||
                    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
                  }
                  alt={selectedTeacherForView.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-white/30"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{selectedTeacherForView.name}</h2>
                    <span className="text-xs bg-white/20 font-bold px-2 py-0.5 rounded">
                      {selectedTeacherForView.code}
                    </span>
                  </div>
                  <p className="text-blue-100 text-xs mt-0.5 font-medium">{selectedTeacherForView.role}</p>
                  <p className="text-blue-200 text-[11px]">{selectedTeacherForView.department}</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs text-slate-700">
              {/* Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Môn giảng dạy:</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {selectedTeacherForView.subjectNames.join(', ')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Trình độ chuyên môn:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedTeacherForView.qualification || 'Cử nhân Sư phạm'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Số điện thoại liên lạc:</span>
                  <a
                    href={`tel:${selectedTeacherForView.phone}`}
                    className="font-bold text-blue-600 hover:underline"
                  >
                    {selectedTeacherForView.phone}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Hộp thư điện tử:</span>
                  <a
                    href={`mailto:${selectedTeacherForView.email}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {selectedTeacherForView.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Văn phòng tổ bộ môn:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedTeacherForView.officeRoom || 'Phòng Hội đồng'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Số tiết dạy tại lớp 7A:</span>
                  <span className="font-extrabold text-blue-700 text-sm">
                    {selectedTeacherForView.periodsPerWeek} tiết / tuần
                  </span>
                </div>
              </div>

              {/* Subject Academic Performance in Class 7A */}
              {selectedTeacherForView.subjectIds[0] && (
                <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-blue-600" />
                      <span>Thống kê kết quả môn {selectedTeacherForView.subjectNames[0]} tại lớp 7A</span>
                    </h4>
                    <span className="text-blue-700 font-extrabold text-sm">
                      ĐTB: {getTeacherSubjectStats(selectedTeacherForView.subjectIds[0]).avg} đ
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                      <span className="text-[11px] text-emerald-800 font-bold block">Học sinh giỏi (≥ 8.5)</span>
                      <span className="text-xl font-extrabold text-emerald-700">
                        {getTeacherSubjectStats(selectedTeacherForView.subjectIds[0]).highCount} em
                      </span>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <span className="text-[11px] text-amber-800 font-bold block">Cần bổ trợ (&lt; 6.5)</span>
                      <span className="text-xl font-extrabold text-amber-700">
                        {getTeacherSubjectStats(selectedTeacherForView.subjectIds[0]).lowCount} em
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Class 7A Schedule for this Teacher */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Lịch dạy cụ thể tại lớp 7A</span>
                </h4>
                {selectedTeacherForView.schedule && selectedTeacherForView.schedule.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {selectedTeacherForView.schedule.map((slot, i) => (
                      <div
                        key={i}
                        className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg text-xs"
                      >
                        <span className="font-bold text-blue-900 block">{slot.dayOfWeek}</span>
                        <span className="text-slate-600 text-[11px]">
                          Tiết {slot.period} ({slot.room || 'P.204'})
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs italic">Theo lịch phân công chuẩn của nhà trường.</p>
                )}
              </div>

              {/* Notes */}
              {selectedTeacherForView.notes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-700 block mb-1 text-xs">Ghi chú chuyên môn:</span>
                  <p className="text-slate-600 text-xs leading-relaxed">{selectedTeacherForView.notes}</p>
                </div>
              )}

              {/* Modal Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedTeacherForView.phone}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Gọi điện</span>
                  </a>
                  {selectedTeacherForView.zalo && (
                    <a
                      href={`https://zalo.me/${selectedTeacherForView.zalo.replace(/\s+/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Zalo</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const t = selectedTeacherForView;
                      setSelectedTeacherForView(null);
                      setTeacherToDelete(t);
                      setIsDeleteModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 rounded-lg font-bold text-xs border border-rose-200 flex items-center gap-1.5 transition-all shadow-xs"
                    title="Xóa giáo viên này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa giáo viên</span>
                  </button>
                  <button
                    onClick={() => {
                      const t = selectedTeacherForView;
                      setSelectedTeacherForView(null);
                      handleOpenEdit(t);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs border border-slate-200 flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Chỉnh sửa</span>
                  </button>
                  <button
                    onClick={() => setSelectedTeacherForView(null)}
                    className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Add / Edit Teacher Modal */}
      {isEditModalOpen && editingTeacher && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingTeacher.id ? 'Chỉnh sửa thông tin giáo viên' : 'Thêm giáo viên bộ môn mới'}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã giáo viên *</label>
                  <input
                    type="text"
                    required
                    value={editingTeacher.code}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Thị Mai Lan"
                    value={editingTeacher.name}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Môn học giảng dạy</label>
                  <select
                    value={editingTeacher.subjectIds[0] || 'toan'}
                    onChange={(e) => {
                      const sub = subjects.find((s) => s.id === e.target.value);
                      setEditingTeacher({
                        ...editingTeacher,
                        subjectIds: [e.target.value],
                        subjectNames: sub ? [sub.name] : ['Toán'],
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        Môn {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tổ chuyên môn</label>
                  <input
                    type="text"
                    value={editingTeacher.department}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, department: e.target.value })}
                    placeholder="Ví dụ: Tổ Toán - Tin"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chức vụ / Nhiệm vụ</label>
                  <input
                    type="text"
                    value={editingTeacher.role}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, role: e.target.value })}
                    placeholder="Ví dụ: Giáo viên bộ môn Ngữ văn"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số tiết dạy lớp 7A (tiết/tuần)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editingTeacher.periodsPerWeek}
                    onChange={(e) =>
                      setEditingTeacher({ ...editingTeacher, periodsPerWeek: Number(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    value={editingTeacher.phone}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingTeacher.email}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phòng làm việc / Văn phòng tổ</label>
                  <input
                    type="text"
                    value={editingTeacher.officeRoom || ''}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, officeRoom: e.target.value })}
                    placeholder="Ví dụ: P.201 - Dãy B"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trạng thái giảng dạy</label>
                  <select
                    value={editingTeacher.status}
                    onChange={(e) =>
                      setEditingTeacher({
                        ...editingTeacher,
                        status: e.target.value as Teacher['status'],
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Đang giảng dạy">Đang giảng dạy</option>
                    <option value="Nghỉ phép">Nghỉ phép</option>
                    <option value="Công tác">Công tác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú chuyên môn</label>
                <textarea
                  rows={2}
                  value={editingTeacher.notes || ''}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, notes: e.target.value })}
                  placeholder="Ghi chú về phân công, bồi dưỡng học sinh giỏi..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-200">
                {editingTeacher.id ? (
                  <button
                    type="button"
                    onClick={() => {
                      const t = { ...editingTeacher } as Teacher;
                      setIsEditModalOpen(false);
                      setTeacherToDelete(t);
                      setIsDeleteModalOpen(true);
                    }}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                    title="Xóa giáo viên này"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa giáo viên này</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm"
                  >
                    Lưu thông tin
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Add Collab Note Modal */}
      {isAddNoteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 relative">
            <button
              onClick={() => setIsAddNoteModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Ghi chú trao đổi với giáo viên bộ môn</h3>
                <p className="text-xs text-slate-500">Phối hợp giữa GVCN và GV bộ môn lớp 7A</p>
              </div>
            </div>

            <form onSubmit={handleSaveCollabNote} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chọn giáo viên bộ môn *</label>
                <select
                  value={noteTeacherId}
                  onChange={(e) => setNoteTeacherId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} - Môn {t.subjectNames.join(', ')} ({t.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Học sinh liên quan (nếu có)</label>
                <select
                  value={noteStudentId}
                  onChange={(e) => setNoteStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Không chọn học sinh cụ thể --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code} - Tổ {s.team})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mức độ ưu tiên</label>
                  <select
                    value={notePriority}
                    onChange={(e) => setNotePriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Bình thường">Bình thường</option>
                    <option value="Quan trọng">Quan trọng</option>
                    <option value="Khẩn">Khẩn</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tiêu đề trao đổi *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Em An tiến bộ môn Văn..."
                    value={noteTopic}
                    onChange={(e) => setNoteTopic(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung trao đổi / Phản ánh *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ghi lại chi tiết nội dung cần GV bộ môn lưu ý hoặc trao đổi phản hồi..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddNoteModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm"
                >
                  Lưu trao đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Delete Confirmation Modal */}
      {isDeleteModalOpen && teacherToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-bold text-sm text-slate-900">Xác nhận xóa giáo viên</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa giáo viên <strong className="text-slate-900">{teacherToDelete.name}</strong> ({teacherToDelete.code}) khỏi danh sách bộ môn không?
            </p>
            {teacherToDelete.isHomeroom && (
              <div className="mt-2.5 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] font-medium flex items-start gap-1.5">
                <span className="text-base leading-none">⚠️</span>
                <span>Lưu ý: Giáo viên này hiện được ghi nhận là GVCN lớp 7A. Bạn có thể phân công lại sau khi xóa.</span>
              </div>
            )}
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
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

      {/* Modal 4.5: Batch Delete Confirmation Modal */}
      {isBatchDeleteModalOpen && selectedTeacherIds.length > 0 && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-bold text-sm text-slate-900">Xác nhận xóa hàng loạt</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa <strong className="text-slate-900">{selectedTeacherIds.length} giáo viên</strong> đã chọn khỏi danh sách bộ môn không? Hành động này sẽ cập nhật lại danh sách giáo viên của lớp.
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                type="button"
                onClick={() => setIsBatchDeleteModalOpen(false)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleBatchDeleteConfirm}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm"
              >
                Xác nhận xóa ({selectedTeacherIds.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Import Teachers from File Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">THÊM GIÁO VIÊN BẰNG FILE</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hỗ trợ file Excel (.csv, .xlsx), file bảng tính hoặc dữ liệu JSON
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
              {/* Template Download Banner */}
              <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-blue-900 block text-xs">Mẫu định dạng chuẩn:</span>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Tải mẫu file Excel hoặc JSON để điền thông tin giáo viên và phân công nhanh chóng.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => downloadTemplate('csv')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-700 hover:bg-blue-100/80 font-bold text-xs rounded-lg border border-blue-200 shadow-2xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Mẫu Excel (.csv)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadTemplate('json')}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white text-slate-700 hover:bg-slate-100 font-medium text-xs rounded-lg border border-slate-200 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Mẫu JSON</span>
                  </button>
                </div>
              </div>

              {/* Source Mode Tabs */}
              <div className="flex items-center border-b border-slate-200 gap-4">
                <button
                  type="button"
                  onClick={() => setImportMethod('file')}
                  className={`flex items-center gap-2 pb-2.5 font-bold text-xs border-b-2 transition-all ${
                    importMethod === 'file'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tải file từ máy tính</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImportMethod('paste')}
                  className={`flex items-center gap-2 pb-2.5 font-bold text-xs border-b-2 transition-all ${
                    importMethod === 'paste'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Dán dữ liệu trực tiếp (Copy từ Excel)</span>
                </button>
              </div>

              {/* Tab 1: Upload File Area */}
              {importMethod === 'file' && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`p-6 border-2 border-dashed rounded-xl text-center transition-all ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50/70'
                      : 'border-slate-300 hover:border-blue-400 bg-slate-50/60'
                  }`}
                >
                  <input
                    type="file"
                    id="teacher-file-input"
                    accept=".csv, .xlsx, .xls, .json, .txt"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelected(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                      <FileUp className="w-6 h-6" />
                    </div>

                    <div>
                      <label
                        htmlFor="teacher-file-input"
                        className="font-bold text-xs text-blue-600 hover:text-blue-700 cursor-pointer hover:underline"
                      >
                        Bấm vào đây để chọn file
                      </label>
                      <span className="text-slate-600 text-xs"> hoặc kéo thả file vào khung này</span>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Hỗ trợ file định dạng: .CSV, .XLSX (văn bản), .JSON, .TXT
                    </p>

                    {selectedFileName && (
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Đã tải file: {selectedFileName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Paste Raw Data */}
              {importMethod === 'paste' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-700">Dán dữ liệu từ bảng tính Excel hoặc JSON:</label>
                    <button
                      type="button"
                      onClick={() => {
                        const sample = `Mã GV\tHọ và tên\tGiới tính\tMôn học\tTổ chuyên môn\tChức vụ\tSố điện thoại\tEmail\tSố tiết lớp 7A\tPhòng làm việc\tTrình độ\tGhi chú
GV13\tNguyễn Thị Hồng Hạnh\tNữ\tToán\tTổ Toán - Tin\tGiáo viên bộ môn\t0912 345 999\thonghanh.nguyen@thcstangbatho.edu.vn\t4\tP.202 - Dãy B\tThạc sĩ Toán\tDạy bồi dưỡng HSG
GV14\tVũ Quang Dũng\tNam\tNgữ văn\tTổ Ngữ văn - KHXH\tGiáo viên bộ môn\t0983 456 888\tquangdung.vu@thcstangbatho.edu.vn\t4\tP.201 - Dãy B\tCử nhân Sư phạm Ngữ văn\tPhụ trách chuyên đề Văn học
GV15\tLê Quỳnh Nga\tNữ\tTiếng Anh\tTổ Ngoại ngữ\tGiáo viên bộ môn\t0904 567 777\tquynhnga.le@thcstangbatho.edu.vn\t3\tPhòng Lab Ngoại ngữ\tIELTS 8.0\tPhụ trách CLB Tiếng Anh`;
                        setPasteData(sample);
                        handleProcessImportText(sample);
                      }}
                      className="text-blue-600 font-semibold hover:underline text-[11px]"
                    >
                      Dán dữ liệu mẫu
                    </button>
                  </div>

                  <textarea
                    rows={6}
                    value={pasteData}
                    onChange={(e) => {
                      setPasteData(e.target.value);
                      if (e.target.value.trim()) {
                        handleProcessImportText(e.target.value);
                      } else {
                        setParsedTeachers([]);
                      }
                    }}
                    placeholder="Mở bảng tính Excel, sao chép (Ctrl+C) các dòng giáo viên và dán (Ctrl+V) vào đây..."
                    className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                  />
                </div>
              )}

              {/* Errors Display */}
              {parseErrors.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                  <div>
                    <span className="font-bold block">Thông báo lỗi xử lý file:</span>
                    <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-[11px]">
                      {parseErrors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Preview Table of Parsed Teachers */}
              {parsedTeachers.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Đã nhận diện: {parsedTeachers.length} giáo viên hợp lệ
                      </span>
                    </div>

                    {/* Import Mode Options */}
                    <div className="flex items-center gap-3 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                        <input
                          type="radio"
                          name="import-mode"
                          value="append"
                          checked={importMode === 'append'}
                          onChange={() => setImportMode('append')}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span>Thêm vào danh sách (giữ GV cũ)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                        <input
                          type="radio"
                          name="import-mode"
                          value="replace"
                          checked={importMode === 'replace'}
                          onChange={() => setImportMode('replace')}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span>Thay thế toàn bộ</span>
                      </label>
                    </div>
                  </div>

                  {/* Preview table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100/90 text-slate-600 font-bold sticky top-0 text-[11px]">
                        <tr>
                          <th className="py-2 px-3 text-center w-10">STT</th>
                          <th className="py-2 px-3 w-20">Mã GV</th>
                          <th className="py-2 px-3">Họ và tên</th>
                          <th className="py-2 px-3 w-16">Giới tính</th>
                          <th className="py-2 px-3">Môn học</th>
                          <th className="py-2 px-3">Tổ chuyên môn</th>
                          <th className="py-2 px-3">Số điện thoại</th>
                          <th className="py-2 px-3 text-center w-20">Số tiết 7A</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {parsedTeachers.map((t, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/40">
                            <td className="py-2 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                            <td className="py-2 px-3 font-mono font-bold text-blue-700">{t.code}</td>
                            <td className="py-2 px-3 font-bold text-slate-800">{t.name}</td>
                            <td className="py-2 px-3 text-slate-600">{t.gender}</td>
                            <td className="py-2 px-3">
                              <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold text-[11px]">
                                {t.subjectNames.join(', ')}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-600">{t.department}</td>
                            <td className="py-2 px-3 font-mono text-slate-600">{t.phone}</td>
                            <td className="py-2 px-3 font-bold text-center text-blue-700">
                              {t.periodsPerWeek} tiết
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setParsedTeachers([]);
                  setPasteData('');
                  setSelectedFileName('');
                  setParseErrors([]);
                  setIsImportModalOpen(false);
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={parsedTeachers.length === 0}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold shadow-sm transition-all"
              >
                <Check className="w-4 h-4" />
                <span>
                  {parsedTeachers.length > 0
                    ? `Xác nhận nhập ${parsedTeachers.length} giáo viên`
                    : 'Chưa có dữ liệu để nhập'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
