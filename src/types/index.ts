export type Gender = 'Nam' | 'Nữ';

export type StudentStatus = 'Bình thường' | 'Cần quan tâm' | 'Tiến bộ' | 'Khẩn cấp';

export interface Student {
  id: string;
  code: string; // e.g. HS0701
  name: string;
  birthDate: string; // YYYY-MM-DD
  gender: Gender;
  team: 1 | 2 | 3 | 4; // Tổ 1, 2, 3, 4
  seat: string; // e.g. "Bàn 1 - Dãy 1"
  avatarUrl?: string;
  status: StudentStatus;
  statusNote?: string;
  parentName: string;
  parentPhone: string;
  parentRelationship: string; // Bố, Mẹ, Người giám hộ
  address: string;
  notes?: string;
}

export type ScoreType = 'TX1' | 'TX2' | 'GK' | 'CK';

export interface Subject {
  id: string;
  name: string;
  code: string;
  weight: number; // Hệ số
}

export interface SubjectScore {
  tx1?: number | null;
  tx2?: number | null;
  gk?: number | null;
  ck?: number | null;
}

export interface StudentScores {
  [subjectId: string]: SubjectScore;
}

export type AttendanceStatus = 'present' | 'excused' | 'unexcused' | 'late';

export interface AttendanceEntry {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  lateMinutes?: number;
  reason?: string;
}

export type DisciplineType = 'plus' | 'minus';

export interface DisciplineRule {
  id: string;
  title: string;
  points: number;
  type: DisciplineType;
  category: string;
}

export interface DisciplineEntry {
  id: string;
  studentId: string;
  type: DisciplineType;
  points: number;
  title: string;
  date: string; // YYYY-MM-DD
  week: number;
  notes?: string;
}

export interface TeacherComment {
  id: string;
  studentId: string;
  period: 'week' | 'month' | 'semester';
  periodValue: string; // e.g. "Tuần 4", "Tháng 10", "Học kỳ I"
  academicComment: string;
  conductComment: string;
  progressNote?: string;
  date: string;
}

export interface ParentContact {
  id: string;
  studentId: string;
  parentName: string;
  phone: string;
  date: string;
  channel: 'Điện thoại' | 'Gặp trực tiếp' | 'Tin nhắn Zalo' | 'Họp phụ huynh';
  content: string;
  result: string;
  notes?: string;
}

export interface TeacherScheduleSlot {
  dayOfWeek: 'Thứ 2' | 'Thứ 3' | 'Thứ 4' | 'Thứ 5' | 'Thứ 6' | 'Thứ 7';
  period: number; // 1, 2, 3, 4, 5
  subjectName: string;
  room?: string;
}

export interface Teacher {
  id: string;
  code: string; // e.g. GV01
  name: string;
  gender: Gender;
  avatarUrl?: string;
  subjectIds: string[]; // ['toan'], ['van'], etc.
  subjectNames: string[]; // ['Toán'], ['Ngữ văn'], etc.
  role: string; // e.g. "GVCN Lớp 7A & Dạy Toán", "GV Bộ môn Ngữ văn", "Tổ trưởng Tổ Ngoại ngữ"
  department: string; // e.g. "Tổ Toán - Tin", "Tổ Ngữ văn - KHXH", "Tổ KHTN", "Tổ Ngoại ngữ", "Tổ Thể chất - Nghệ thuật"
  phone: string;
  email: string;
  zalo?: string;
  isHomeroom?: boolean;
  teachingClasses: string[]; // e.g. ['7A', '7B', '8A']
  periodsPerWeek: number; // Số tiết dạy tại lớp 7A
  schedule: TeacherScheduleSlot[];
  officeRoom?: string; // e.g. 'Phòng Hội đồng', 'Văn phòng tổ Toán'
  status: 'Đang giảng dạy' | 'Nghỉ phép' | 'Công tác';
  qualification?: string; // 'Cử nhân Sư phạm', 'Thạc sĩ Toán học'
  notes?: string;
}

export interface TeacherCollabNote {
  id: string;
  teacherId: string;
  subjectId?: string;
  studentId?: string; // optionally linked to a specific student
  date: string;
  topic: string;
  content: string;
  priority: 'Bình thường' | 'Quan trọng' | 'Khẩn';
  status: 'Chờ phản hồi' | 'Đã trao đổi' | 'Đã giải quyết';
  creatorName?: string;
  response?: string;
}

export interface ClassConfig {
  className: string;
  grade: string;
  schoolName: string;
  schoolYear: string;
  currentTerm: 'Học kỳ I' | 'Học kỳ II';
  room: string;
  teacherName: string;
  teacherRole: string;
  teacherPhone: string;
  teacherEmail: string;
}

export type ChatCategory = 'class' | 'teachers' | 'parents' | 'cadres' | 'ai';

export interface ChatAttachment {
  id: string;
  name: string;
  type: 'image' | 'file';
  url: string;
  size?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  senderAvatar?: string;
  content: string;
  timestamp: string; // e.g. "08:15"
  date: string; // YYYY-MM-DD
  isPinned?: boolean;
  isImportant?: boolean;
  attachments?: ChatAttachment[];
  reactions?: Record<string, number>;
  userReaction?: string;
  replyToId?: string;
  replyToSnippet?: string;
}

export interface ChatConversation {
  id: string;
  category: ChatCategory;
  title: string;
  subtitle?: string;
  avatarUrl?: string;
  avatarBg?: string;
  isGroup: boolean;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
  isPinned?: boolean;
  isOnline?: boolean;
  studentId?: string;
  teacherId?: string;
  teamNumber?: number;
  membersCount?: number;
  description?: string;
  messages: ChatMessage[];
}

export type NavigationPath =
  | 'trang-chu'
  | 'hoc-sinh/danh-sach'
  | 'hoc-sinh/ho-so'
  | 'hoc-sinh/tim-kiem'
  | 'giao-vien/danh-sach'
  | 'giao-vien/phan-cong'
  | 'giao-vien/trao-doi'
  | 'hoc-tap/nhap-diem'
  | 'hoc-tap/theo-doi'
  | 'hoc-tap/so-sanh'
  | 'hoc-tap/tien-bo'
  | 'chuyen-can/nghi-hoc'
  | 'chuyen-can/di-tre'
  | 'chuyen-can/thong-ke'
  | 'thi-dua/diem-cong'
  | 'thi-dua/diem-tru'
  | 'thi-dua/xep-loai'
  | 'nhan-xet/tuan'
  | 'nhan-xet/thang'
  | 'nhan-xet/cuoi-ky'
  | 'phu-huynh'
  | 'chat'
  | 'chat/toan-lop'
  | 'chat/giao-vien'
  | 'chat/phu-huynh'
  | 'chat/ban-can-su'
  | 'chat/tro-ly-ai'
  | 'ai-phan-tich'
  | 'bao-cao'
  | 'cai-dat';
