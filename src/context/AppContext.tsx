import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Student,
  Subject,
  ClassConfig,
  DisciplineRule,
  DisciplineEntry,
  AttendanceEntry,
  TeacherComment,
  ParentContact,
  StudentScores,
  NavigationPath,
  Teacher,
  TeacherCollabNote,
  ChatConversation,
  ChatMessage,
  ChatCategory,
  ChatAttachment,
} from '../types';
import {
  initialStudents,
  defaultSubjects,
  initialScores,
  initialAttendance,
  defaultDisciplineRules,
  initialDisciplineEntries,
  initialComments,
  initialParentContacts,
  initialClassConfig,
  initialTeachers,
  initialTeacherCollabNotes,
} from '../data/initialData';
import { initialChatConversations } from '../data/initialChatData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface AppContextType {
  // Navigation
  activePath: NavigationPath;
  setActivePath: (path: NavigationPath) => void;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  openStudentProfile: (studentId: string) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  selectedClass: string;
  setSelectedClass: (cls: string) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;

  // Chat States & Actions
  chatConversations: ChatConversation[];
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  selectedChatCategory: ChatCategory | 'all';
  setSelectedChatCategory: (category: ChatCategory | 'all') => void;
  chatSearchQuery: string;
  setChatSearchQuery: (query: string) => void;
  totalUnreadChatCount: number;
  sendChatMessage: (conversationId: string, content: string, attachments?: ChatAttachment[], replyToMessage?: ChatMessage) => Promise<void>;
  deleteChatMessage: (conversationId: string, messageId: string) => void;
  togglePinChatMessage: (conversationId: string, messageId: string) => void;
  addReactionToMessage: (conversationId: string, messageId: string, emoji: string) => void;
  markConversationAsRead: (conversationId: string) => void;
  markAllConversationsAsRead: () => void;
  openChatWithParent: (studentId: string) => void;
  openChatWithTeacher: (teacherId: string) => void;
  createNewConversation: (newConv: Omit<ChatConversation, 'id' | 'messages' | 'unreadCount'>) => string;

  // Data states
  students: Student[];
  subjects: Subject[];
  scores: Record<string, StudentScores>;
  attendance: AttendanceEntry[];
  disciplineRules: DisciplineRule[];
  disciplineEntries: DisciplineEntry[];
  comments: TeacherComment[];
  parentContacts: ParentContact[];
  classConfig: ClassConfig;
  teachers: Teacher[];
  teacherNotes: TeacherCollabNote[];
  selectedTeacherId: string | null;
  setSelectedTeacherId: (id: string | null) => void;

  // Actions
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, updated: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  importStudents: (newStudents: Student[]) => void;
  resetAllData: () => void;

  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, updated: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
  importTeachers: (newTeachers: Teacher[], mode?: 'append' | 'replace') => void;
  addTeacherCollabNote: (note: Omit<TeacherCollabNote, 'id'>) => void;
  updateTeacherCollabNote: (id: string, updated: Partial<TeacherCollabNote>) => void;
  deleteTeacherCollabNote: (id: string) => void;

  updateScore: (studentId: string, subjectId: string, field: 'tx1' | 'tx2' | 'gk' | 'ck', value: number | null) => void;
  batchUpdateScores: (subjectId: string, updates: { studentId: string; type: 'tx1' | 'tx2' | 'gk' | 'ck'; score: number | null }[]) => void;

  setAttendanceStatus: (studentId: string, date: string, status: AttendanceEntry['status'], reason?: string, lateMinutes?: number) => void;
  batchSaveAttendance: (date: string, records: { studentId: string; status: AttendanceEntry['status']; reason?: string; lateMinutes?: number }[]) => void;

  addDisciplineEntry: (entry: Omit<DisciplineEntry, 'id'>) => void;
  deleteDisciplineEntry: (id: string) => void;
  addDisciplineRule: (rule: Omit<DisciplineRule, 'id'>) => void;

  saveComment: (comment: Omit<TeacherComment, 'id'>) => void;
  deleteComment: (id: string) => void;

  addParentContact: (contact: Omit<ParentContact, 'id'>) => void;
  updateClassConfig: (config: Partial<ClassConfig>) => void;

  // Calculation helpers
  calculateStudentSubjectAverage: (studentId: string, subjectId: string) => number | null;
  calculateStudentOverallAverage: (studentId: string) => number | null;
  classMetrics: {
    totalStudents: number;
    classAverage: number;
    attendanceRate: number;
    goodStudentRate: number;
  };
  getStudentDisciplineStats: (studentId: string) => { plus: number; minus: number; total: number; rank: number };
  getStudentProgressStatus: (studentId: string) => { status: 'Tăng' | 'Ổn định' | 'Giảm'; delta: number };

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'classcare_v1_';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation State
  const [activePath, setActivePath] = useState<NavigationPath>('trang-chu');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [selectedClass, setSelectedClass] = useState<string>('Lớp 7A');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastMessage['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const openStudentProfile = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActivePath('hoc-sinh/ho-so');
  };

  // Helper to load from localStorage or fallback
  const loadStored = <T,>(key: string, fallback: T): T => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.error(`Error loading ${key} from storage:`, e);
      return fallback;
    }
  };

  // State with LocalStorage sync
  const [students, setStudents] = useState<Student[]>(() => loadStored('students', initialStudents));
  const [subjects, setSubjects] = useState<Subject[]>(() => loadStored('subjects', defaultSubjects));
  const [scores, setScores] = useState<Record<string, StudentScores>>(() => loadStored('scores', initialScores));
  const [attendance, setAttendance] = useState<AttendanceEntry[]>(() => loadStored('attendance', initialAttendance));
  const [disciplineRules, setDisciplineRules] = useState<DisciplineRule[]>(() => loadStored('disciplineRules', defaultDisciplineRules));
  const [disciplineEntries, setDisciplineEntries] = useState<DisciplineEntry[]>(() => loadStored('disciplineEntries', initialDisciplineEntries));
  const [comments, setComments] = useState<TeacherComment[]>(() => loadStored('comments', initialComments));
  const [parentContacts, setParentContacts] = useState<ParentContact[]>(() => loadStored('parentContacts', initialParentContacts));
  const [classConfig, setClassConfig] = useState<ClassConfig>(() => loadStored('classConfig', initialClassConfig));
  const [teachers, setTeachers] = useState<Teacher[]>(() => loadStored('teachers', initialTeachers));
  const [teacherNotes, setTeacherNotes] = useState<TeacherCollabNote[]>(() => loadStored('teacherNotes', initialTeacherCollabNotes));
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

  // Chat States
  const [chatConversations, setChatConversations] = useState<ChatConversation[]>(() =>
    loadStored('chatConversations', initialChatConversations)
  );
  const [activeConversationId, setActiveConversationId] = useState<string>('channel-class');
  const [selectedChatCategory, setSelectedChatCategory] = useState<ChatCategory | 'all'>('all');
  const [chatSearchQuery, setChatSearchQuery] = useState<string>('');

  // Sync to local storage
  useEffect(() => { localStorage.setItem(STORAGE_KEY_PREFIX + 'students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_PREFIX + 'subjects', JSON.stringify(subjects)); }, [subjects]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_PREFIX + 'scores', JSON.stringify(scores)); }, [scores]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_PREFIX + 'attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_PREFIX + 'disciplineRules', JSON.stringify(disciplineRules)); }, [disciplineRules]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_PREFIX + 'disciplineEntries', JSON.stringify(disciplineEntries)); }, [disciplineEntries]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_PREFIX + 'comments', JSON.stringify(comments)); }, [comments]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_PREFIX + 'parentContacts', JSON.stringify(parentContacts)); }, [parentContacts]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_PREFIX + 'classConfig', JSON.stringify(classConfig)); }, [classConfig]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_PREFIX + 'teachers', JSON.stringify(teachers)); }, [teachers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_PREFIX + 'teacherNotes', JSON.stringify(teacherNotes)); }, [teacherNotes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_PREFIX + 'chatConversations', JSON.stringify(chatConversations)); }, [chatConversations]);

  // Audio chime
  const playSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.22);
    } catch {
      // Audio autoplay may be disabled
    }
  };

  // Total unread chat messages
  const totalUnreadChatCount = useMemo(() => {
    return chatConversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
  }, [chatConversations]);

  // Mark conversation as read
  const markConversationAsRead = (convId: string) => {
    setChatConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
    );
  };

  // Mark all as read
  const markAllConversationsAsRead = () => {
    setChatConversations((prev) => prev.map((c) => ({ ...c, unreadCount: 0 })));
    showToast('Đã đánh dấu đã đọc tất cả tin nhắn.');
  };

  // Send message
  const sendChatMessage = async (
    convId: string,
    content: string,
    attachments?: ChatAttachment[],
    replyToMessage?: ChatMessage
  ) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateStr = now.toISOString().split('T')[0];
    const newMsgId = 'msg-' + Date.now().toString(36);

    const newMsg: ChatMessage = {
      id: newMsgId,
      senderId: 'gvcn',
      senderName: `Thầy ${classConfig.teacherName}`,
      senderRole: 'GVCN Lớp 7A',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      content: content.trim(),
      timestamp: timeStr,
      date: dateStr,
      attachments: attachments && attachments.length > 0 ? attachments : undefined,
      replyToId: replyToMessage?.id,
      replyToSnippet: replyToMessage
        ? `${replyToMessage.senderName}: ${replyToMessage.content.slice(0, 60)}...`
        : undefined,
    };

    setChatConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            lastMessage: `Bạn: ${content.trim() || '[Đã gửi đính kèm]'}`,
            lastMessageTime: timeStr,
            unreadCount: 0,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    playSound();

    // AI channel smart reply handling
    if (convId === 'channel-ai') {
      setTimeout(async () => {
        let aiReplyText = '';
        const userPrompt = content.trim();

        try {
          // Prepare context about Class 7A
          const classContext = {
            className: classConfig.className,
            school: classConfig.schoolName,
            term: classConfig.currentTerm,
            teacher: classConfig.teacherName,
            totalStudents: students.length,
            attentionStudents: students
              .filter((s) => s.status === 'Cần quan tâm' || s.status === 'Khẩn cấp')
              .map((s) => ({ name: s.name, status: s.status, note: s.statusNote })),
          };

          const res = await fetch('/api/gemini/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: `Là Trợ lý AI Sư phạm của lớp 7A (GVCN: Thầy ${classConfig.teacherName}), hãy trả lời câu hỏi/yêu cầu sau của giáo viên một cách chuyên nghiệp, sư phạm, thiết thực và ân cần:\n${userPrompt}`,
              context: classContext,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.text) {
              aiReplyText = data.text;
            }
          }
        } catch {
          // Fallback handled below
        }

        if (!aiReplyText) {
          // Pedagogical local rule-based intelligence
          const lower = userPrompt.toLowerCase();
          if (lower.includes('phụ huynh') || lower.includes('tin nhắn') || lower.includes('soạn')) {
            aiReplyText = `Kính gửi thầy Toàn! Dưới đây là mẫu tin nhắn sư phạm chuẩn mực gửi phụ huynh được tối ưu cho tình huống này:

---
"Kính gửi Quý phụ huynh! 
Tôi là thầy Hà Văn Toàn, Giáo viên Chủ nhiệm lớp 7A Trường THCS Tăng Bạt Hổ. 
Tôi xin phép gửi lời chào và trao đổi nhanh về tình hình học tập và rèn luyện của cháu trong tuần vừa qua. Nhìn chung, cháu rất lễ phép và có nhiều cố gắng, tuy nhiên để đạt kết quả tốt nhất trong kỳ thi giữa kỳ sắp tới, thầy rất mong gia đình cùng đồng hành, nhắc nhở cháu ôn bài kỹ vào buổi tối và chuẩn bị đầy đủ dụng cụ học tập trước khi đến lớp. 
Mọi trao đổi thêm, phụ huynh có thể liên hệ trực tiếp với tôi qua số điện thoại 0912 345 678. 
Trân trọng cảm ơn sự phối hợp quý báu của gia đình!"
---

💡 **Gợi ý sư phạm:** Thầy có thể điều chỉnh tên học sinh hoặc chi tiết môn học cụ thể trước khi gửi để tăng tính gần gũi và hiệu quả!`;
          } else if (lower.includes('nghỉ học') || lower.includes('vắng') || lower.includes('chuyên cần')) {
            aiReplyText = `Thưa thầy Toàn! Về vấn đề chuyên cần của học sinh (đặc biệt các em có số buổi vắng tăng như em Bích):
1. **Liên hệ ngay với phụ huynh**: Gọi điện trực tiếp hoặc gửi tin nhắn nhắc nhở để xác minh lý do vắng (sức khỏe, việc gia đình).
2. **Kế hoạch hỗ trợ kiến thức**: Phân công bạn học cùng bàn hoặc cán sự bộ môn cho mượn vở ghi chép, hướng dẫn các bài tập trọng tâm.
3. **Động viên tâm lý**: Khi học sinh quay lại lớp, thầy nên gặp riêng 3-5 phút đầu giờ để thăm hỏi nhẹ nhàng, tránh tạo áp lực tâm lý cho học sinh trước tập thể.`;
          } else if (lower.includes('khen') || lower.includes('tiến bộ') || lower.includes('thưởng')) {
            aiReplyText = `Thưa thầy Toàn! Việc biểu dương học sinh kịp thời mang lại động lực học tập rất lớn:
🌟 **Gợi ý khen ngợi:**
- Tuyên dương trước lớp trong giờ sinh hoạt 15 phút đầu giờ hoặc tiết sinh hoạt cuối tuần.
- Cộng từ 3-5 điểm thi đua cá nhân và ghi nhận vào sổ theo dõi nề nếp.
- Gửi tin nhắn ngắn khen ngợi tới phụ huynh: phụ huynh sẽ rất tự hào và tiếp tục đồng hành tích cực cùng nhà trường!`;
          } else {
            aiReplyText = `Thầy Toàn thân mến! Tôi đã ghi nhận yêu cầu của thầy. 
Đối với tập thể Lớp 7A trong giai đoạn ${classConfig.currentTerm}, tôi khuyến nghị thầy:
- Tiếp tục duy trì việc theo dõi sát sao sổ đầu bài và bảng chấm thi đua giữa 4 tổ.
- Chuẩn bị tốt tâm lý cho học sinh trước các đợt kiểm tra đánh giá định kỳ.
- Tận dụng các kênh trao đổi với giáo viên bộ môn Toán, Văn, Anh, KHTN để nắm bắt học sinh cần phụ đạo sớm.

Thầy có cần tôi soạn thảo thông báo cụ thể nào gửi lên Kênh Toàn Lớp hoặc gửi riêng cho Ban Đại diện Phụ huynh không ạ?`;
          }
        }

        const aiMsg: ChatMessage = {
          id: 'msg-ai-' + Date.now().toString(36),
          senderId: 'ai',
          senderName: 'Trợ Lý AI Sư Phạm',
          senderRole: 'AI Assistant',
          content: aiReplyText,
          timestamp: `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`,
          date: new Date().toISOString().split('T')[0],
        };

        setChatConversations((prev) =>
          prev.map((c) => {
            if (c.id === 'channel-ai') {
              return {
                ...c,
                lastMessage: `Trợ lý AI: ${aiReplyText.slice(0, 50)}...`,
                lastMessageTime: aiMsg.timestamp,
                messages: [...c.messages, aiMsg],
              };
            }
            return c;
          })
        );
        playSound();
      }, 700);
    }
  };

  // Delete message
  const deleteChatMessage = (convId: string, messageId: string) => {
    setChatConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          const updatedMessages = c.messages.filter((m) => m.id !== messageId);
          const lastMsg = updatedMessages[updatedMessages.length - 1];
          return {
            ...c,
            messages: updatedMessages,
            lastMessage: lastMsg ? `${lastMsg.senderName}: ${lastMsg.content.slice(0, 40)}` : '',
            lastMessageTime: lastMsg ? lastMsg.timestamp : '',
          };
        }
        return c;
      })
    );
    showToast('Đã xóa tin nhắn.');
  };

  // Toggle pin message
  const togglePinChatMessage = (convId: string, messageId: string) => {
    setChatConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === messageId ? { ...m, isPinned: !m.isPinned } : m
            ),
          };
        }
        return c;
      })
    );
    showToast('Đã cập nhật trạng thái ghim tin nhắn.');
  };

  // Add reaction
  const addReactionToMessage = (convId: string, messageId: string, emoji: string) => {
    setChatConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            messages: c.messages.map((m) => {
              if (m.id === messageId) {
                const reactions = { ...(m.reactions || {}) };
                if (m.userReaction === emoji) {
                  // toggle off
                  reactions[emoji] = Math.max(0, (reactions[emoji] || 1) - 1);
                  if (reactions[emoji] === 0) delete reactions[emoji];
                  return { ...m, reactions, userReaction: undefined };
                } else {
                  // remove old reaction if existed
                  if (m.userReaction && reactions[m.userReaction]) {
                    reactions[m.userReaction] = Math.max(0, reactions[m.userReaction] - 1);
                    if (reactions[m.userReaction] === 0) delete reactions[m.userReaction];
                  }
                  reactions[emoji] = (reactions[emoji] || 0) + 1;
                  return { ...m, reactions, userReaction: emoji };
                }
              }
              return m;
            }),
          };
        }
        return c;
      })
    );
  };

  // Open chat with parent of student
  const openChatWithParent = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    let conv = chatConversations.find((c) => c.studentId === studentId);

    if (!conv && student) {
      const newConvId = `parent-${student.id}`;
      const newConv: ChatConversation = {
        id: newConvId,
        category: 'parents',
        title: `Phụ huynh em ${student.name}`,
        subtitle: `${student.parentRelationship} ${student.parentName} • SĐT: ${student.parentPhone}`,
        avatarUrl: student.avatarUrl,
        avatarBg: 'bg-emerald-600',
        isGroup: false,
        unreadCount: 0,
        studentId: student.id,
        messages: [
          {
            id: 'msg-p-init-' + Date.now().toString(36),
            senderId: 'gvcn',
            senderName: `Thầy ${classConfig.teacherName}`,
            senderRole: 'GVCN Lớp 7A',
            content: `Chào ${student.parentRelationship.toLowerCase()} em ${student.name}! Tôi là thầy Toàn, GVCN lớp 7A. Thầy mở kênh liên lạc riêng để tiện trao đổi tình hình học tập và rèn luyện của cháu.`,
            timestamp: `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`,
            date: new Date().toISOString().split('T')[0],
          },
        ],
      };
      setChatConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConvId);
    } else if (conv) {
      setActiveConversationId(conv.id);
    }

    setSelectedChatCategory('parents');
    setActivePath('chat/phu-huynh');
  };

  // Open chat with teacher
  const openChatWithTeacher = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    let conv = chatConversations.find((c) => c.teacherId === teacherId);

    if (!conv && teacher) {
      const newConvId = `teacher-${teacher.id}`;
      const newConv: ChatConversation = {
        id: newConvId,
        category: 'teachers',
        title: `${teacher.name} (${teacher.subjectNames.join(', ')})`,
        subtitle: `${teacher.role} • SĐT: ${teacher.phone}`,
        avatarUrl: teacher.avatarUrl,
        avatarBg: 'bg-blue-600',
        isGroup: false,
        unreadCount: 0,
        teacherId: teacher.id,
        messages: [
          {
            id: 'msg-t-init-' + Date.now().toString(36),
            senderId: 'gvcn',
            senderName: `Thầy ${classConfig.teacherName}`,
            senderRole: 'GVCN Lớp 7A',
            content: `Chào đồng chí ${teacher.name}! Tôi là Toàn GVCN 7A, rất mong nhận được sự phối hợp chặt chẽ của đồng chí trong bộ môn ${teacher.subjectNames.join(', ')}.`,
            timestamp: `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`,
            date: new Date().toISOString().split('T')[0],
          },
        ],
      };
      setChatConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConvId);
    } else if (conv) {
      setActiveConversationId(conv.id);
    }

    setSelectedChatCategory('teachers');
    setActivePath('chat/giao-vien');
  };

  // Create new conversation
  const createNewConversation = (newConvData: Omit<ChatConversation, 'id' | 'messages' | 'unreadCount'>) => {
    const id = 'conv-' + Date.now().toString(36);
    const newConv: ChatConversation = {
      ...newConvData,
      id,
      unreadCount: 0,
      messages: [],
    };
    setChatConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(id);
    showToast(`Đã tạo cuộc trò chuyện "${newConvData.title}" thành công.`);
    return id;
  };

  // Teacher CRUD
  const addTeacher = (teacherData: Omit<Teacher, 'id'>) => {
    const newId = 'gv-' + Date.now().toString(36);
    const newTeacher: Teacher = { ...teacherData, id: newId };
    setTeachers((prev) => [...prev, newTeacher]);
    showToast(`Đã thêm giáo viên ${teacherData.name} vào danh sách bộ môn.`);
  };

  const updateTeacher = (id: string, updated: Partial<Teacher>) => {
    setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    showToast('Cập nhật thông tin giáo viên thành công.');
  };

  const deleteTeacher = (id: string) => {
    const t = teachers.find((item) => item.id === id);
    setTeachers((prev) => prev.filter((item) => item.id !== id));
    if (selectedTeacherId === id) setSelectedTeacherId(null);
    showToast(`Đã xóa giáo viên ${t?.name || ''} khỏi danh sách.`);
  };

  const importTeachers = (newTeachers: Teacher[], mode: 'append' | 'replace' = 'append') => {
    if (mode === 'replace') {
      setTeachers(newTeachers);
      showToast(`Đã thay thế và nhập mới ${newTeachers.length} giáo viên.`);
    } else {
      setTeachers((prev) => {
        const existingCodes = new Set(prev.map((t) => t.code.trim().toUpperCase()));
        const toAdd: Teacher[] = [];
        const next = prev.map((t) => {
          const match = newTeachers.find((nt) => nt.code.trim().toUpperCase() === t.code.trim().toUpperCase());
          return match ? { ...t, ...match } : t;
        });
        newTeachers.forEach((nt) => {
          if (!existingCodes.has(nt.code.trim().toUpperCase())) {
            toAdd.push(nt);
          }
        });
        return [...next, ...toAdd];
      });
      showToast(`Đã nhập thành công ${newTeachers.length} giáo viên vào danh sách.`);
    }
  };

  const addTeacherCollabNote = (noteData: Omit<TeacherCollabNote, 'id'>) => {
    const newId = 'collab-' + Date.now().toString(36);
    setTeacherNotes((prev) => [{ ...noteData, id: newId }, ...prev]);
    showToast('Đã lưu nội dung trao đổi bộ môn.');
  };

  const updateTeacherCollabNote = (id: string, updated: Partial<TeacherCollabNote>) => {
    setTeacherNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updated } : n)));
    showToast('Cập nhật trạng thái trao đổi thành công.');
  };

  const deleteTeacherCollabNote = (id: string) => {
    setTeacherNotes((prev) => prev.filter((n) => n.id !== id));
    showToast('Đã xóa ghi chú trao đổi.');
  };

  // Student CRUD
  const addStudent = (studentData: Omit<Student, 'id'>) => {
    const newId = 'hs-' + Date.now().toString(36);
    const newStudent: Student = { ...studentData, id: newId };
    setStudents((prev) => [...prev, newStudent]);
    // Initialize default scores
    setScores((prev) => ({
      ...prev,
      [newId]: defaultSubjects.reduce((acc, sub) => {
        acc[sub.id] = { tx1: 7.0, tx2: 7.5, gk: 7.5, ck: 7.5 };
        return acc;
      }, {} as StudentScores),
    }));
    showToast(`Đã thêm học sinh ${studentData.name} vào danh sách lớp thành công.`);
  };

  const updateStudent = (id: string, updated: Partial<Student>) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
    showToast('Cập nhật thông tin học sinh thành công.');
  };

  const deleteStudent = (id: string) => {
    const student = students.find((s) => s.id === id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
    if (selectedStudentId === id) setSelectedStudentId(null);
    showToast(`Đã xóa học sinh ${student?.name || ''} khỏi danh sách.`);
  };

  const importStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
    showToast(`Đã nhập danh sách ${newStudents.length} học sinh thành công.`);
  };

  const resetAllData = () => {
    setStudents(initialStudents);
    setSubjects(defaultSubjects);
    setScores(initialScores);
    setAttendance(initialAttendance);
    setDisciplineRules(defaultDisciplineRules);
    setDisciplineEntries(initialDisciplineEntries);
    setComments(initialComments);
    setParentContacts(initialParentContacts);
    setClassConfig(initialClassConfig);
    setTeachers(initialTeachers);
    setTeacherNotes(initialTeacherCollabNotes);
    setSelectedTeacherId(null);
    showToast('Đã khôi phục dữ liệu mẫu chuẩn thành công.', 'info');
  };

  // Score calculations (Thông tư 22/2021/TT-BGDĐT)
  const calculateStudentSubjectAverage = (studentId: string, subjectId: string): number | null => {
    const s = scores[studentId]?.[subjectId];
    if (!s) return null;
    let sum = 0;
    let weight = 0;

    if (typeof s.tx1 === 'number') { sum += s.tx1 * 1; weight += 1; }
    if (typeof s.tx2 === 'number') { sum += s.tx2 * 1; weight += 1; }
    if (typeof s.gk === 'number') { sum += s.gk * 2; weight += 2; }
    if (typeof s.ck === 'number') { sum += s.ck * 3; weight += 3; }

    if (weight === 0) return null;
    return Math.round((sum / weight) * 10) / 10;
  };

  const calculateStudentOverallAverage = (studentId: string): number | null => {
    let sum = 0;
    let count = 0;
    subjects.forEach((sub) => {
      const avg = calculateStudentSubjectAverage(studentId, sub.id);
      if (avg !== null) {
        sum += avg;
        count += 1;
      }
    });
    if (count === 0) return null;
    return Math.round((sum / count) * 10) / 10;
  };

  // Score updates
  const updateScore = (studentId: string, subjectId: string, field: 'tx1' | 'tx2' | 'gk' | 'ck', value: number | null) => {
    setScores((prev) => {
      const studentSubScores = prev[studentId] || {};
      const currentSub = studentSubScores[subjectId] || {};
      return {
        ...prev,
        [studentId]: {
          ...studentSubScores,
          [subjectId]: {
            ...currentSub,
            [field]: value,
          },
        },
      };
    });
  };

  const batchUpdateScores = (subjectId: string, updates: { studentId: string; type: 'tx1' | 'tx2' | 'gk' | 'ck'; score: number | null }[]) => {
    setScores((prev) => {
      const next = { ...prev };
      updates.forEach((u) => {
        if (!next[u.studentId]) next[u.studentId] = {};
        if (!next[u.studentId][subjectId]) next[u.studentId][subjectId] = {};
        next[u.studentId][subjectId][u.type] = u.score;
      });
      return next;
    });
    showToast(`Đã lưu điểm môn học cho ${updates.length} học sinh.`);
  };

  // Attendance Actions
  const setAttendanceStatus = (studentId: string, date: string, status: AttendanceEntry['status'], reason?: string, lateMinutes?: number) => {
    setAttendance((prev) => {
      const existingIdx = prev.findIndex((a) => a.studentId === studentId && a.date === date);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = { ...next[existingIdx], status, reason, lateMinutes };
        return next;
      } else {
        return [...prev, { id: 'att-' + Date.now().toString(36), studentId, date, status, reason, lateMinutes }];
      }
    });
    showToast('Đã cập nhật trạng thái chuyên cần.');
  };

  const batchSaveAttendance = (date: string, records: { studentId: string; status: AttendanceEntry['status']; reason?: string; lateMinutes?: number }[]) => {
    setAttendance((prev) => {
      const filtered = prev.filter((a) => a.date !== date);
      const newItems: AttendanceEntry[] = records.map((r, i) => ({
        id: `att-${date}-${r.studentId}-${i}`,
        studentId: r.studentId,
        date,
        status: r.status,
        reason: r.reason,
        lateMinutes: r.lateMinutes,
      }));
      return [...filtered, ...newItems];
    });
    showToast(`Đã lưu điểm danh ngày ${date} thành công.`);
  };

  // Discipline Actions
  const addDisciplineEntry = (entry: Omit<DisciplineEntry, 'id'>) => {
    const id = 'dis-' + Date.now().toString(36);
    setDisciplineEntries((prev) => [ { ...entry, id }, ...prev ]);
    showToast(entry.type === 'plus' ? `Đã cộng ${entry.points} điểm thi đua.` : `Đã trừ ${entry.points} điểm thi đua.`, entry.type === 'plus' ? 'success' : 'warning');
  };

  const deleteDisciplineEntry = (id: string) => {
    setDisciplineEntries((prev) => prev.filter((e) => e.id !== id));
    showToast('Đã xóa bản ghi thi đua.');
  };

  const addDisciplineRule = (rule: Omit<DisciplineRule, 'id'>) => {
    const id = 'rule-' + Date.now().toString(36);
    setDisciplineRules((prev) => [...prev, { ...rule, id }]);
    showToast(`Đã thêm tiêu chí "${rule.title}" vào danh mục.`);
  };

  // Comments
  const saveComment = (comment: Omit<TeacherComment, 'id'>) => {
    const id = 'com-' + Date.now().toString(36);
    setComments((prev) => {
      const filtered = prev.filter((c) => !(c.studentId === comment.studentId && c.period === comment.period && c.periodValue === comment.periodValue));
      return [{ ...comment, id }, ...filtered];
    });
    showToast('Đã lưu nhận xét học sinh thành công.');
  };

  const deleteComment = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    showToast('Đã xóa nhận xét.');
  };

  // Parent Contacts
  const addParentContact = (contact: Omit<ParentContact, 'id'>) => {
    const id = 'pc-' + Date.now().toString(36);
    setParentContacts((prev) => [{ ...contact, id }, ...prev]);
    showToast('Đã lưu lịch sử liên lạc phụ huynh.');
  };

  // Class config
  const updateClassConfig = (updated: Partial<ClassConfig>) => {
    setClassConfig((prev) => ({ ...prev, ...updated }));
    showToast('Đã lưu cài đặt thông tin lớp.');
  };

  // Computed Class Metrics
  const classMetrics = useMemo(() => {
    const totalStudents = students.length;
    if (totalStudents === 0) {
      return { totalStudents: 0, classAverage: 0, attendanceRate: 100, goodStudentRate: 0 };
    }

    // Class average
    let sumScore = 0;
    let countScore = 0;
    let goodCount = 0;

    students.forEach((s) => {
      const avg = calculateStudentOverallAverage(s.id);
      if (avg !== null) {
        sumScore += avg;
        countScore += 1;
        if (avg >= 6.5) goodCount += 1;
      }
    });

    const classAverage = countScore > 0 ? Math.round((sumScore / countScore) * 10) / 10 : 7.6;
    const goodStudentRate = countScore > 0 ? Math.round((goodCount / countScore) * 100) : 76;

    // Attendance rate
    const totalAtt = attendance.length;
    const presentOrLate = attendance.filter((a) => a.status === 'present' || a.status === 'late').length;
    const attendanceRate = totalAtt > 0 ? Math.round((presentOrLate / totalAtt) * 100) : 96;

    return {
      totalStudents,
      classAverage,
      attendanceRate,
      goodStudentRate,
    };
  }, [students, scores, attendance, subjects]);

  // Discipline stats per student
  const getStudentDisciplineStats = (studentId: string) => {
    let plus = 0;
    let minus = 0;
    disciplineEntries
      .filter((e) => e.studentId === studentId)
      .forEach((e) => {
        if (e.type === 'plus') plus += e.points;
        else minus += e.points;
      });
    const total = 100 + plus - minus;

    // Determine rank in class
    const allTotals = students.map((s) => {
      let p = 0;
      let m = 0;
      disciplineEntries
        .filter((e) => e.studentId === s.id)
        .forEach((e) => {
          if (e.type === 'plus') p += e.points;
          else m += e.points;
        });
      return { id: s.id, total: 100 + p - m };
    }).sort((a, b) => b.total - a.total);

    const rankIdx = allTotals.findIndex((item) => item.id === studentId);
    return { plus, minus, total, rank: rankIdx >= 0 ? rankIdx + 1 : 1 };
  };

  // Student progress status (GK vs TX or trend)
  const getStudentProgressStatus = (studentId: string): { status: 'Tăng' | 'Ổn định' | 'Giảm'; delta: number } => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return { status: 'Ổn định', delta: 0 };
    if (student.status === 'Tiến bộ') return { status: 'Tăng', delta: +0.8 };
    if (student.status === 'Cần quan tâm' || student.status === 'Khẩn cấp') return { status: 'Giảm', delta: -0.6 };

    // Or calculate from GK vs TX1
    let sumTX = 0;
    let sumGK = 0;
    let cnt = 0;
    subjects.forEach((sub) => {
      const s = scores[studentId]?.[sub.id];
      if (s && typeof s.tx1 === 'number' && typeof s.gk === 'number') {
        sumTX += s.tx1;
        sumGK += s.gk;
        cnt += 1;
      }
    });

    if (cnt === 0) return { status: 'Ổn định', delta: 0 };
    const diff = Math.round(((sumGK / cnt) - (sumTX / cnt)) * 10) / 10;
    if (diff >= 0.3) return { status: 'Tăng', delta: diff };
    if (diff <= -0.3) return { status: 'Giảm', delta: diff };
    return { status: 'Ổn định', delta: diff };
  };

  return (
    <AppContext.Provider
      value={{
        activePath,
        setActivePath,
        selectedStudentId,
        setSelectedStudentId,
        openStudentProfile,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        selectedClass,
        setSelectedClass,
        globalSearchQuery,
        setGlobalSearchQuery,
        chatConversations,
        activeConversationId,
        setActiveConversationId,
        selectedChatCategory,
        setSelectedChatCategory,
        chatSearchQuery,
        setChatSearchQuery,
        totalUnreadChatCount,
        sendChatMessage,
        deleteChatMessage,
        togglePinChatMessage,
        addReactionToMessage,
        markConversationAsRead,
        markAllConversationsAsRead,
        openChatWithParent,
        openChatWithTeacher,
        createNewConversation,
        students,
        subjects,
        scores,
        attendance,
        disciplineRules,
        disciplineEntries,
        comments,
        parentContacts,
        classConfig,
        teachers,
        teacherNotes,
        selectedTeacherId,
        setSelectedTeacherId,
        addStudent,
        updateStudent,
        deleteStudent,
        importStudents,
        resetAllData,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        importTeachers,
        addTeacherCollabNote,
        updateTeacherCollabNote,
        deleteTeacherCollabNote,
        updateScore,
        batchUpdateScores,
        setAttendanceStatus,
        batchSaveAttendance,
        addDisciplineEntry,
        deleteDisciplineEntry,
        addDisciplineRule,
        saveComment,
        deleteComment,
        addParentContact,
        updateClassConfig,
        calculateStudentSubjectAverage,
        calculateStudentOverallAverage,
        classMetrics,
        getStudentDisciplineStats,
        getStudentProgressStatus,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
