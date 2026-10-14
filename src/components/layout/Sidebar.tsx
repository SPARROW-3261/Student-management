import React from 'react';
import {
  LayoutDashboard,
  Video,
  GraduationCap,
  Users,
  DoorOpen,
  ClipboardList,
  BarChart3,
  ScanFace,
  UserCheck,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronRight,
  X,
  Lock,
} from 'lucide-react';
import { AuthUser } from '../../types/attendance';

export type NavItem =
  | 'dashboard'
  | 'live'
  | 'students'
  | 'teachers'
  | 'classrooms'
  | 'records'
  | 'reports'
  | 'face_settings'
  | 'users'
  | 'settings'
  | 'logout';

interface SidebarProps {
  currentNav: NavItem;
  onSelectNav: (item: NavItem) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenPresentationModal: () => void;
  currentUser?: AuthUser | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentNav,
  onSelectNav,
  mobileOpen,
  onCloseMobile,
  onOpenPresentationModal,
  currentUser = null,
}) => {
  const isStudent = currentUser?.role === 'student';
  const isTeacher = currentUser?.role === 'teacher';
  const isAdmin = currentUser?.role === 'admin';

  const menuItems: {
    id: NavItem;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    adminOnly?: boolean;
  }[] = isStudent
    ? [
        { id: 'dashboard', label: 'My Attendance Portal', icon: GraduationCap },
        { id: 'live', label: 'Classroom Live Feed', icon: Video, badge: 'VIEW' },
        { id: 'records', label: 'My Attendance Logs', icon: ClipboardList },
        { id: 'reports', label: 'Course Analytics', icon: BarChart3 },
        { id: 'students', label: 'Classmates Directory', icon: Users, badge: 'Read Only' },
        { id: 'classrooms', label: 'Campus Classrooms', icon: DoorOpen },
        { id: 'face_settings', label: 'Face Engine Config', icon: ScanFace, badge: 'Admin Only', adminOnly: true },
        { id: 'settings', label: 'System Settings', icon: Settings, badge: 'Admin Only', adminOnly: true },
      ]
    : [
        { id: 'dashboard', label: isTeacher ? 'Faculty Dashboard' : 'Dashboard', icon: LayoutDashboard },
        { id: 'live', label: 'Live Attendance', icon: Video, badge: 'LIVE' },
        { id: 'students', label: 'Students', icon: GraduationCap, badge: '250' },
        { id: 'teachers', label: 'Teachers', icon: Users, badge: '18' },
        { id: 'classrooms', label: 'Classroom Management', icon: DoorOpen },
        { id: 'records', label: 'Attendance Records', icon: ClipboardList },
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
        { id: 'face_settings', label: 'Face Recognition Settings', icon: ScanFace, badge: !isAdmin ? 'Admin Only' : undefined, adminOnly: !isAdmin },
        { id: 'users', label: 'User Management', icon: UserCheck, badge: !isAdmin ? 'Admin Only' : undefined, adminOnly: !isAdmin },
        { id: 'settings', label: 'Settings', icon: Settings, badge: !isAdmin ? 'Admin Only' : undefined, adminOnly: !isAdmin },
      ];

  const handleNavClick = (id: NavItem) => {
    onSelectNav(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-0 max-lg:-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold">
              <ScanFace className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                SmartClass <span className="text-blue-400 font-semibold text-xs tracking-wide uppercase px-1.5 py-0.5 rounded bg-blue-950/80 border border-blue-800/60">Vision</span>
              </div>
              <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                Face Recognition Attendance
              </div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live System Indicator */}
        <div className="px-5 py-3 mx-4 my-3 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium">Entrance Cam 01</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
            30 FPS · ACTIVE
          </span>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-3 py-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Menu Navigation
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-blue-700 text-blue-100'
                        : item.badge === 'LIVE'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Presentation & Viva Helper */}
        <div className="px-4 py-3 mx-4 mb-3 rounded-lg bg-gradient-to-br from-indigo-950/60 to-slate-800/60 border border-indigo-800/40 text-xs">
          <div className="flex items-center gap-2 text-indigo-300 font-medium mb-1">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>MCA Project Presentation</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
            View FaceNet + YOLOv8 + Flask system architecture.
          </p>
          <button
            onClick={onOpenPresentationModal}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 rounded text-indigo-200 text-xs font-medium transition-colors"
          >
            <span>Architecture Overview</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-800/80">
          <button
            onClick={() => handleNavClick('logout')}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm font-medium text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
