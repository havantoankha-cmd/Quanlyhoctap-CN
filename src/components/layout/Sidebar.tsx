import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationPath } from '../../types';
import {
  Home,
  Users,
  GraduationCap,
  CalendarCheck,
  Award,
  MessageSquare,
  HeartHandshake,
  Bot,
  FileBarChart2,
  Settings,
  ChevronDown,
  ChevronRight,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  UserCheck,
  School,
} from 'lucide-react';

interface SubMenuItem {
  label: string;
  path: NavigationPath;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: NavigationPath;
  subItems?: SubMenuItem[];
}

export const Sidebar: React.FC = () => {
  const {
    activePath,
    setActivePath,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    classConfig,
  } = useApp();

  // Accordion state: keep track of which menus are expanded
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    'hoc-sinh': true,
    'giao-vien': true,
    'hoc-tap': true,
    'chuyen-can': true,
    'thi-dua': false,
    'nhan-xet': false,
  });

  const toggleSubMenu = (menuId: string) => {
    setExpandedMenus((prev) => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  const menuStructure: MenuItem[] = [
    {
      id: 'trang-chu',
      label: 'TRANG CHỦ',
      icon: <Home className="w-4 h-4 flex-shrink-0" />,
      path: 'trang-chu',
    },
    {
      id: 'hoc-sinh',
      label: 'HỌC SINH',
      icon: <Users className="w-4 h-4 flex-shrink-0" />,
      subItems: [
        { label: 'Danh sách lớp', path: 'hoc-sinh/danh-sach' },
        { label: 'Hồ sơ học sinh', path: 'hoc-sinh/ho-so' },
        { label: 'Tìm kiếm học sinh', path: 'hoc-sinh/tim-kiem' },
      ],
    },
    {
      id: 'giao-vien',
      label: 'GIÁO VIÊN',
      icon: <School className="w-4 h-4 flex-shrink-0" />,
      subItems: [
        { label: 'Danh sách giáo viên', path: 'giao-vien/danh-sach' },
        { label: 'Phân công & TKB', path: 'giao-vien/phan-cong' },
        { label: 'Trao đổi bộ môn', path: 'giao-vien/trao-doi' },
      ],
    },
    {
      id: 'hoc-tap',
      label: 'HỌC TẬP',
      icon: <GraduationCap className="w-4 h-4 flex-shrink-0" />,
      subItems: [
        { label: 'Nhập điểm', path: 'hoc-tap/nhap-diem' },
        { label: 'Theo dõi điểm', path: 'hoc-tap/theo-doi' },
        { label: 'So sánh theo môn', path: 'hoc-tap/so-sanh' },
        { label: 'Học sinh tiến bộ', path: 'hoc-tap/tien-bo' },
      ],
    },
    {
      id: 'chuyen-can',
      label: 'CHUYÊN CẦN',
      icon: <CalendarCheck className="w-4 h-4 flex-shrink-0" />,
      subItems: [
        { label: 'Nghỉ học', path: 'chuyen-can/nghi-hoc' },
        { label: 'Đi trễ', path: 'chuyen-can/di-tre' },
        { label: 'Thống kê', path: 'chuyen-can/thong-ke' },
      ],
    },
    {
      id: 'thi-dua',
      label: 'THI ĐUA',
      icon: <Award className="w-4 h-4 flex-shrink-0" />,
      subItems: [
        { label: 'Điểm cộng', path: 'thi-dua/diem-cong' },
        { label: 'Điểm trừ', path: 'thi-dua/diem-tru' },
        { label: 'Xếp loại tuần', path: 'thi-dua/xep-loai' },
      ],
    },
    {
      id: 'nhan-xet',
      label: 'NHẬN XÉT',
      icon: <MessageSquare className="w-4 h-4 flex-shrink-0" />,
      subItems: [
        { label: 'Theo tuần', path: 'nhan-xet/tuan' },
        { label: 'Theo tháng', path: 'nhan-xet/thang' },
        { label: 'Cuối học kỳ', path: 'nhan-xet/cuoi-ky' },
      ],
    },
    {
      id: 'phu-huynh',
      label: 'PHỤ HUYNH',
      icon: <HeartHandshake className="w-4 h-4 flex-shrink-0" />,
      path: 'phu-huynh',
    },
    {
      id: 'ai-phan-tich',
      label: 'AI PHÂN TÍCH',
      icon: <Bot className="w-4 h-4 flex-shrink-0 text-cyan-400" />,
      path: 'ai-phan-tich',
    },
    {
      id: 'bao-cao',
      label: 'BÁO CÁO',
      icon: <FileBarChart2 className="w-4 h-4 flex-shrink-0" />,
      path: 'bao-cao',
    },
    {
      id: 'cai-dat',
      label: 'CÀI ĐẶT',
      icon: <Settings className="w-4 h-4 flex-shrink-0" />,
      path: 'cai-dat',
    },
  ];

  return (
    <aside
      className={`bg-[#0a192f] text-slate-200 h-screen sticky top-0 flex flex-col transition-all duration-300 z-30 select-none shadow-xl border-r border-slate-800 ${
        isSidebarCollapsed ? 'w-20' : 'w-[260px]'
      }`}
    >
      {/* Top Branding Section */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
        {!isSidebarCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-wide text-white">ClassCare</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-semibold px-1.5 py-0.5 rounded border border-blue-400/20">THCS</span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal truncate max-w-[150px]">
                Trợ lý quản lý lớp chủ nhiệm
              </p>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 mx-auto rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
        )}

        <button
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
          title={isSidebarCollapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
        >
          {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {menuStructure.map((menu) => {
          const hasChildren = !!menu.subItems && menu.subItems.length > 0;
          const isParentActive =
            menu.path === activePath ||
            (menu.subItems && menu.subItems.some((sub) => sub.path === activePath));
          const isExpanded = expandedMenus[menu.id] ?? false;

          if (!hasChildren) {
            const isActive = activePath === menu.path;
            return (
              <button
                key={menu.id}
                onClick={() => {
                  if (menu.path) setActivePath(menu.path);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
                title={menu.label}
              >
                {menu.icon}
                {!isSidebarCollapsed && <span>{menu.label}</span>}
              </button>
            );
          }

          // Accordion parent menu
          return (
            <div key={menu.id} className="space-y-1">
              <button
                onClick={() => {
                  if (isSidebarCollapsed) {
                    setIsSidebarCollapsed(false);
                    setExpandedMenus((prev) => ({ ...prev, [menu.id]: true }));
                  } else {
                    toggleSubMenu(menu.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isParentActive && !isExpanded
                    ? 'bg-blue-900/40 text-blue-300 border border-blue-700/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
                title={menu.label}
              >
                <div className="flex items-center gap-3">
                  {menu.icon}
                  {!isSidebarCollapsed && <span>{menu.label}</span>}
                </div>
                {!isSidebarCollapsed && (
                  <span className="text-slate-400">
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 transition-transform" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 transition-transform" />
                    )}
                  </span>
                )}
              </button>

              {/* Submenu items */}
              {!isSidebarCollapsed && isExpanded && menu.subItems && (
                <div className="pl-7 pr-1 space-y-1 py-0.5 border-l border-slate-800 ml-5">
                  {menu.subItems.map((sub) => {
                    const isSubActive = activePath === sub.path;
                    return (
                      <button
                        key={sub.path}
                        onClick={() => setActivePath(sub.path)}
                        className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-md text-[13px] font-medium transition-all ${
                          isSubActive
                            ? 'bg-blue-600 text-white font-semibold shadow-sm'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSubActive ? 'bg-white' : 'bg-slate-500'
                          }`}
                        />
                        <span className="truncate">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Teacher Profile */}
      <div className="p-3 border-t border-slate-800/80 bg-[#071324]/70">
        {!isSidebarCollapsed ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Avatar"
                  className="w-9 h-9 rounded-full object-cover border border-blue-400/40"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0a192f]" />
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{classConfig.teacherName}</p>
                <p className="text-[11px] text-slate-400 truncate">{classConfig.teacherRole}</p>
              </div>
            </div>
            <button
              onClick={() => setActivePath('cai-dat')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              title="Thông tin tài khoản"
            >
              <UserCheck className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => setActivePath('cai-dat')}
              className="relative"
              title={`${classConfig.teacherName} - ${classConfig.teacherRole}`}
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover border border-blue-400/40"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0a192f]" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
