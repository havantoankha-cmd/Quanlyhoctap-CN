import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/ToastContainer';

// View Components
import { Dashboard } from './components/dashboard/Dashboard';
import { StudentList } from './components/students/StudentList';
import { StudentProfileModal } from './components/students/StudentProfileModal';
import { StudentSearch } from './components/students/StudentSearch';
import { ScoreInput } from './components/academics/ScoreInput';
import { ScoreTracking } from './components/academics/ScoreTracking';
import { SubjectComparison } from './components/academics/SubjectComparison';
import { StudentProgress } from './components/academics/StudentProgress';
import { AbsenceManager } from './components/attendance/AbsenceManager';
import { LateManager } from './components/attendance/LateManager';
import { AttendanceStats } from './components/attendance/AttendanceStats';
import { PlusPoints } from './components/discipline/PlusPoints';
import { MinusPoints } from './components/discipline/MinusPoints';
import { WeeklyRanking } from './components/discipline/WeeklyRanking';
import { CommentManager } from './components/comments/CommentManager';
import { ParentManagement } from './components/parents/ParentManagement';
import { AIAssistant } from './components/ai/AIAssistant';
import { ReportCenter } from './components/reports/ReportCenter';
import { SettingsView } from './components/settings/SettingsView';
import { TeacherManagement } from './components/teachers/TeacherManagement';

const MainContent: React.FC = () => {
  const { activePath } = useApp();

  const renderCurrentView = () => {
    switch (activePath) {
      case 'trang-chu':
        return <Dashboard />;

      // Học sinh
      case 'hoc-sinh/danh-sach':
        return <StudentList />;
      case 'hoc-sinh/ho-so':
        return <StudentProfileModal />;
      case 'hoc-sinh/tim-kiem':
        return <StudentSearch />;

      // Giáo viên
      case 'giao-vien/danh-sach':
      case 'giao-vien/phan-cong':
      case 'giao-vien/trao-doi':
        return <TeacherManagement />;

      // Học tập
      case 'hoc-tap/nhap-diem':
        return <ScoreInput />;
      case 'hoc-tap/theo-doi':
        return <ScoreTracking />;
      case 'hoc-tap/so-sanh':
        return <SubjectComparison />;
      case 'hoc-tap/tien-bo':
        return <StudentProgress />;

      // Chuyên cần
      case 'chuyen-can/nghi-hoc':
        return <AbsenceManager />;
      case 'chuyen-can/di-tre':
        return <LateManager />;
      case 'chuyen-can/thong-ke':
        return <AttendanceStats />;

      // Thi đua
      case 'thi-dua/diem-cong':
        return <PlusPoints />;
      case 'thi-dua/diem-tru':
        return <MinusPoints />;
      case 'thi-dua/xep-loai':
        return <WeeklyRanking />;

      // Nhận xét
      case 'nhan-xet/tuan':
        return <CommentManager periodType="week" />;
      case 'nhan-xet/thang':
        return <CommentManager periodType="month" />;
      case 'nhan-xet/cuoi-ky':
        return <CommentManager periodType="semester" />;

      // Phụ huynh
      case 'phu-huynh':
        return <ParentManagement />;

      // AI Phân tích
      case 'ai-phan-tich':
        return <AIAssistant />;

      // Báo cáo
      case 'bao-cao':
        return <ReportCenter />;

      // Cài đặt
      case 'cai-dat':
        return <SettingsView />;

      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      {/* Fixed Deep Navy Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {renderCurrentView()}
        </main>
      </div>

      {/* Global Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
