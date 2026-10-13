import React, { useState, useEffect } from 'react';
import {
  Menu,
  Bell,
  Calendar,
  Clock,
  Camera,
  ChevronDown,
  User,
  Shield,
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { ADMIN_USER, CLASSROOMS } from '../../data/mockData';
import { NavItem } from './Sidebar';

interface HeaderProps {
  currentNav: NavItem;
  onOpenMobileMenu: () => void;
  selectedClassroomId: string;
  onSelectClassroom: (id: string) => void;
  onSelectNav: (item: NavItem) => void;
  onOpenPresentationModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentNav,
  onOpenMobileMenu,
  selectedClassroomId,
  onSelectClassroom,
  onSelectNav,
  onOpenPresentationModal,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pageTitles: Record<NavItem, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Executive Attendance Dashboard',
      subtitle: 'Overview of automated face recognition classroom monitoring',
    },
    live: {
      title: 'Live Entrance Surveillance Feed',
      subtitle: 'Real-time face detection, recognition & entry/exit logging',
    },
    students: {
      title: 'Student Directory & Biometric Profiles',
      subtitle: 'Manage registered students, facial features & attendance history',
    },
    teachers: {
      title: 'Faculty & Teacher Management',
      subtitle: 'Manage academic staff attendance and facial recognition records',
    },
    classrooms: {
      title: 'Classroom & Laboratory Management',
      subtitle: 'Classroom capacities, assigned entrance cameras & live occupancy',
    },
    records: {
      title: 'Attendance Records & Logs',
      subtitle: 'Detailed entry and exit verification logs with duration tracking',
    },
    reports: {
      title: 'Reports & Attendance Analytics',
      subtitle: 'Daily statistics, trend comparisons & low attendance warnings',
    },
    face_settings: {
      title: 'Face Recognition Module Settings',
      subtitle: 'Configure camera sensitivity, thresholds & anti-duplicate rules',
    },
    users: {
      title: 'System Users & Role Management',
      subtitle: 'Admin profiles, role-based access control & security policies',
    },
    settings: {
      title: 'System Configuration',
      subtitle: 'Class schedules, biometric privacy & database sync options',
    },
    logout: {
      title: 'Session Sign Out',
      subtitle: 'Confirm ending administrative session',
    },
  };

  const currentTitle = pageTitles[currentNav] || pageTitles.dashboard;

  const notifications = [
    {
      id: 1,
      type: 'warning',
      title: 'Unknown Face Detected',
      desc: 'Unregistered visitor at MCA Lab 301 Entrance at 09:24 AM',
      time: '10 min ago',
      icon: AlertTriangle,
      color: 'text-amber-500 bg-amber-50',
    },
    {
      id: 2,
      type: 'success',
      title: 'Rahul Kumar (STU-042) Verified',
      desc: 'Entry recorded at MCA Lab 301 (98.6% match confidence)',
      time: '34 min ago',
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-50',
    },
    {
      id: 3,
      type: 'info',
      title: 'Camera 01 Sync Verified',
      desc: '1080p RTSP stream stable at 30.2 FPS with 42ms model inference',
      time: '1 hour ago',
      icon: Info,
      color: 'text-blue-500 bg-blue-50',
    },
  ];

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedClock = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between px-4 lg:px-8 py-3.5 gap-4">
        {/* Left: Mobile Trigger & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 lg:hidden"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg lg:text-xl font-bold tracking-tight text-slate-900">
                {currentTitle.title}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                AI Vision
              </span>
            </div>
            <p className="hidden md:block text-xs text-slate-500">
              {currentTitle.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Controls, Classroom Switcher, Live Clock & Admin Menu */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Active Classroom Selector */}
          <div className="hidden xl:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <Camera className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-400 font-medium">Zone:</span>
            <select
              value={selectedClassroomId}
              onChange={(e) => onSelectClassroom(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              {CLASSROOMS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Current Date & Real-time Clock */}
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedDate}</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5 font-mono tabular-nums text-slate-800 font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{formattedClock}</span>
            </div>
          </div>

          {/* Presentation Viva Architecture Button */}
          <button
            onClick={onOpenPresentationModal}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
            title="View MCA Project System Architecture"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span>Project Viva</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileOpen(false);
              }}
              className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 focus:outline-none"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Recent Security & Attendance Alerts
                  </span>
                  <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">
                    Mark all read
                  </span>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {notifications.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-3 border border-transparent hover:border-slate-100"
                      >
                        <div className={`p-2 rounded-lg ${item.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-800">
                            {item.title}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            {item.desc}
                          </p>
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">
                            {item.time}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Admin Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2 p-1 pl-2 sm:pr-3 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200/60"
            >
              <img
                src={ADMIN_USER.avatarUrl}
                alt={ADMIN_USER.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-300"
              />
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {ADMIN_USER.name}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  Administrator (HOD)
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <div className="text-xs font-bold text-slate-900">
                    {ADMIN_USER.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {ADMIN_USER.email}
                  </div>
                  <div className="text-[10px] text-blue-600 font-medium mt-0.5">
                    {ADMIN_USER.department}
                  </div>
                </div>
                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      onSelectNav('users');
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Admin Profile & Roles</span>
                  </button>
                  <button
                    onClick={() => {
                      onSelectNav('settings');
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    <Shield className="w-4 h-4 text-slate-400" />
                    <span>System Policies</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenPresentationModal();
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                    <span>Architecture & Viva Prep</span>
                  </button>
                  <div className="my-1 border-t border-slate-100"></div>
                  <button
                    onClick={() => {
                      onSelectNav('logout');
                      setProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-medium"
                  >
                    <ExternalLink className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
