import React, { useState, useEffect } from 'react';
import { AuthUser, Student, Teacher } from '../../types/attendance';
import { AdminLoginPage } from './AdminLoginPage';
import { StudentTeacherLoginPage } from './StudentTeacherLoginPage';
import { Lock, GraduationCap } from 'lucide-react';

interface AuthPageProps {
  onLogin: (user: AuthUser) => void;
  onRegisterStudent?: (student: Student) => void;
  onRegisterTeacher?: (teacher: Teacher) => void;
  registeredUsers?: AuthUser[];
  currentRoute?: string;
  onNavigateRoute?: (route: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onLogin,
  onRegisterStudent,
  onRegisterTeacher,
  registeredUsers = [],
  currentRoute = '/',
  onNavigateRoute,
}) => {
  // Determine if showing admin login or student/teacher login based on current route
  const isInitialAdmin =
    currentRoute === '/admin' ||
    (typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/admin') || window.location.hash.startsWith('#admin')));

  const [isAdminPage, setIsAdminPage] = useState<boolean>(isInitialAdmin);

  useEffect(() => {
    const handleUrlCheck = () => {
      const isPathAdmin =
        window.location.pathname.startsWith('/admin') ||
        window.location.hash.startsWith('#admin') ||
        currentRoute === '/admin';
      setIsAdminPage(isPathAdmin);
    };

    handleUrlCheck();
    window.addEventListener('popstate', handleUrlCheck);
    window.addEventListener('hashchange', handleUrlCheck);
    return () => {
      window.removeEventListener('popstate', handleUrlCheck);
      window.removeEventListener('hashchange', handleUrlCheck);
    };
  }, [currentRoute]);

  const handleSwitchToAdmin = () => {
    setIsAdminPage(true);
    if (onNavigateRoute) {
      onNavigateRoute('/admin');
    } else if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/admin');
    }
  };

  const handleSwitchToStudentTeacher = () => {
    setIsAdminPage(false);
    if (onNavigateRoute) {
      onNavigateRoute('/');
    } else if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Top persistent route switcher bar for convenience */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-full p-1 flex items-center shadow-2xl text-xs font-semibold">
        <button
          type="button"
          onClick={handleSwitchToStudentTeacher}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
            !isAdminPage
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Student &amp; Teacher Login</span>
        </button>

        <button
          type="button"
          onClick={handleSwitchToAdmin}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
            isAdminPage
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Admin Login (/admin)</span>
        </button>
      </div>

      {/* Render the selected dedicated portal */}
      {isAdminPage ? (
        <AdminLoginPage
          onLogin={onLogin}
          onGoToStudentTeacherPortal={handleSwitchToStudentTeacher}
          registeredUsers={registeredUsers}
        />
      ) : (
        <StudentTeacherLoginPage
          onLogin={onLogin}
          onGoToAdminLogin={handleSwitchToAdmin}
          registeredUsers={registeredUsers}
        />
      )}
    </div>
  );
};
