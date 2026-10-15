/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar, NavItem } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { LiveAttendancePage } from './components/live/LiveAttendancePage';
import { StudentManagementPage } from './components/students/StudentManagementPage';
import { TeacherManagementPage } from './components/teachers/TeacherManagementPage';
import { ClassroomManagementPage } from './components/classrooms/ClassroomManagementPage';
import { AttendanceRecordsPage } from './components/attendance/AttendanceRecordsPage';
import { ReportsAnalyticsPage } from './components/reports/ReportsAnalyticsPage';
import { FaceRecognitionSettingsPage } from './components/settings/FaceRecognitionSettingsPage';
import { UserManagementPage } from './components/settings/UserManagementPage';
import { StudentPortalPage } from './components/student/StudentPortalPage';
import { AuthPage } from './components/auth/AuthPage';
import { PresentationModal } from './components/common/PresentationModal';
import {
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  CLASSROOMS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_LIVE_EVENTS,
  INITIAL_CONFIG,
  INITIAL_SECURITY_INCIDENTS,
  INITIAL_AUTH_USERS,
  DEMO_ADMIN_USER,
} from './data/mockData';
import {
  Student,
  Teacher,
  Classroom,
  AttendanceRecord,
  LiveFaceEvent,
  FaceRecognitionConfig,
  SecurityIncident,
  AuthUser,
} from './types/attendance';
import { LogOut, AlertTriangle, ShieldAlert, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = sessionStorage.getItem('smartclass_current_user');
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch (e) {
          // Ignore invalid session
        }
      }
    }
    return null;
  });

  // URL Routing State (/admin vs /)
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      if (
        window.location.pathname.startsWith('/admin') ||
        window.location.hash.startsWith('#admin')
      ) {
        return '/admin';
      }
    }
    return '/';
  });

  // Registered Users (Persisted to localStorage for admin creation & student/teacher login)
  const [registeredUsers, setRegisteredUsers] = useState<AuthUser[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smartclass_registered_users');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // Fallback to defaults
        }
      }
    }
    return INITIAL_AUTH_USERS;
  });

  const [currentNav, setCurrentNav] = useState<NavItem>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedClassroomId, setSelectedClassroomId] = useState('CR-301');

  // Application Data States
  const [students, setStudents] = useState<Student[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smartclass_students_list');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return INITIAL_STUDENTS;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smartclass_teachers_list');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return INITIAL_TEACHERS;
  });

  const [classrooms, setClassrooms] = useState<Classroom[]>(CLASSROOMS);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(
    INITIAL_ATTENDANCE_RECORDS
  );
  const [liveEvents, setLiveEvents] = useState<LiveFaceEvent[]>(INITIAL_LIVE_EVENTS);
  const [faceConfig, setFaceConfig] = useState<FaceRecognitionConfig>(INITIAL_CONFIG);
  const [classroomOccupancy, setClassroomOccupancy] = useState<number>(34);
  const [securityIncidents, setSecurityIncidents] = useState<SecurityIncident[]>(
    INITIAL_SECURITY_INCIDENTS
  );

  // Modals
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isAddTeacherModalOpen, setIsAddTeacherModalOpen] = useState(false);
  const [isPresentationModalOpen, setIsPresentationModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [adminRestrictedModalOpen, setAdminRestrictedModalOpen] = useState(false);
  const [actionNoticeToast, setActionNoticeToast] = useState<string | null>(null);

  // Sync route with browser URL history
  useEffect(() => {
    const handlePopState = () => {
      const isPathAdmin =
        window.location.pathname.startsWith('/admin') ||
        window.location.hash.startsWith('#admin');
      const targetRoute = isPathAdmin ? '/admin' : '/';
      setCurrentRoute(targetRoute);

      // Check if student/teacher tries to access /admin
      if (currentUser && currentUser.role !== 'admin' && targetRoute === '/admin') {
        setAdminRestrictedModalOpen(true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, [currentUser]);

  // Navigate helper
  const handleNavigateRoute = (route: string) => {
    setCurrentRoute(route);
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState(null, '', route);
      } catch (e) {
        // Fallback for sandboxed iframe environments
        window.location.hash = route === '/admin' ? 'admin' : '';
      }
    }

    if (currentUser && currentUser.role !== 'admin' && route === '/admin') {
      setAdminRestrictedModalOpen(true);
    }
  };

  // User Login Handler
  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('smartclass_current_user', JSON.stringify(user));
    }

    if (user.role === 'admin') {
      handleNavigateRoute('/admin');
    } else {
      handleNavigateRoute('/');
    }

    setCurrentNav('dashboard');
    setActionNoticeToast(
      `Welcome ${user.name}! Signed in with ${
        user.role === 'admin'
          ? 'Administrator privileges (/admin)'
          : user.role === 'teacher'
          ? 'Faculty (Full Edit & Export)'
          : 'Student (Viewing & Export Access Only)'
      }.`
    );
    setTimeout(() => setActionNoticeToast(null), 4000);
  };

  // User Logout Handler
  const handleLogout = () => {
    const wasAdmin = currentUser?.role === 'admin';
    setCurrentUser(null);
    setIsLogoutModalOpen(false);

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('smartclass_current_user');
    }

    if (wasAdmin) {
      handleNavigateRoute('/admin');
    } else {
      handleNavigateRoute('/');
    }
  };

  // Admin user creation handler (Creates username & password for student/teacher and registers on website)
  const handleAddUserCredential = (
    newUser: AuthUser,
    studentRecord?: Student,
    teacherRecord?: Teacher
  ) => {
    const updatedUsers = [
      newUser,
      ...registeredUsers.filter((u) => u.email.toLowerCase() !== newUser.email.toLowerCase()),
    ];
    setRegisteredUsers(updatedUsers);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartclass_registered_users', JSON.stringify(updatedUsers));
    }

    if (studentRecord) {
      setStudents((prev) => {
        const next = [studentRecord, ...prev.filter((s) => s.id !== studentRecord.id)];
        if (typeof window !== 'undefined') {
          localStorage.setItem('smartclass_students_list', JSON.stringify(next));
        }
        return next;
      });
    }

    if (teacherRecord) {
      setTeachers((prev) => {
        const next = [teacherRecord, ...prev.filter((t) => t.id !== teacherRecord.id)];
        if (typeof window !== 'undefined') {
          localStorage.setItem('smartclass_teachers_list', JSON.stringify(next));
        }
        return next;
      });
    }

    setActionNoticeToast(
      `✓ Registered new ${newUser.role.toUpperCase()} account for ${newUser.name} (${newUser.email}). Ready for website sign in!`
    );
    setTimeout(() => setActionNoticeToast(null), 5000);
  };

  // Handlers for Students
  const handleAddStudent = (newStudent: Student) => {
    setStudents((prev) => {
      const next = [newStudent, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('smartclass_students_list', JSON.stringify(next));
      }
      return next;
    });
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents((prev) => {
      const next = prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
      if (typeof window !== 'undefined') {
        localStorage.setItem('smartclass_students_list', JSON.stringify(next));
      }
      return next;
    });
  };

  const handleDeleteStudent = (id: string) => {
    setStudents((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('smartclass_students_list', JSON.stringify(next));
      }
      return next;
    });
  };

  // Handlers for Teachers
  const handleAddTeacher = (newTeacher: Teacher) => {
    setTeachers((prev) => {
      const next = [newTeacher, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('smartclass_teachers_list', JSON.stringify(next));
      }
      return next;
    });
  };

  const handleUpdateTeacher = (updatedTeacher: Teacher) => {
    setTeachers((prev) => {
      const next = prev.map((t) => (t.id === updatedTeacher.id ? updatedTeacher : t));
      if (typeof window !== 'undefined') {
        localStorage.setItem('smartclass_teachers_list', JSON.stringify(next));
      }
      return next;
    });
  };

  const handleDeleteTeacher = (id: string) => {
    setTeachers((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('smartclass_teachers_list', JSON.stringify(next));
      }
      return next;
    });
  };

  // Handlers for Classrooms
  const handleAddClassroom = (newClassroom: Classroom) => {
    setClassrooms((prev) => [...prev, newClassroom]);
  };

  const handleUpdateClassroom = (updatedClassroom: Classroom) => {
    setClassrooms((prev) =>
      prev.map((c) => (c.id === updatedClassroom.id ? updatedClassroom : c))
    );
  };

  const handleDeleteClassroom = (id: string) => {
    setClassrooms((prev) => prev.filter((c) => c.id !== id));
  };

  // Handlers for Live Events
  const handleAddLiveEvent = (event: LiveFaceEvent) => {
    setLiveEvents((prev) => [event, ...prev]);

    // Also append to attendance records
    if (event.status === 'verified') {
      const newRec: AttendanceRecord = {
        id: `REC-${Date.now().toString().slice(-5)}`,
        personName: event.personName,
        personId: event.personId,
        personType: event.personType,
        classroom: event.classroomName,
        classroomId: event.classroomId,
        date: new Date().toISOString().split('T')[0],
        entryTime: event.eventType === 'entry' ? event.timestamp : '09:00 AM',
        exitTime: event.eventType === 'exit' ? event.timestamp : undefined,
        duration: event.eventType === 'exit' ? '1h 30m' : 'Inside (Just entered)',
        status: event.eventType === 'entry' ? 'inside' : 'present',
        confidenceScore: event.confidence,
        cameraSource: 'Entrance Cam 01',
        snapshotUrl: event.avatarUrl,
        verifiedBy: 'face_recognition_ai',
      };
      setAttendanceRecords((prev) => [newRec, ...prev]);
    }
  };

  const handleUpdateOccupancy = (delta: number) => {
    setClassroomOccupancy((prev) => Math.max(0, Math.min(40, prev + delta)));
  };

  const handleNavSelect = (nav: NavItem) => {
    if (nav === 'logout') {
      setIsLogoutModalOpen(true);
    } else {
      setCurrentNav(nav);
    }
  };

  // -------------------------------------------------------------
  // 1. UNINITIALIZED SESSION: RENDER 2 DIFFERENT LOGIN PAGES
  // -------------------------------------------------------------
  // Page 1: Admin Login Only (at /admin)
  // Page 2: Student and Teacher Login (at /)
  if (!currentUser) {
    return (
      <AuthPage
        onLogin={handleLogin}
        registeredUsers={registeredUsers}
        currentRoute={currentRoute}
        onNavigateRoute={handleNavigateRoute}
      />
    );
  }

  // Determine user permission levels
  const isStudent = currentUser.role === 'student';
  const isTeacher = currentUser.role === 'teacher';
  const isAdmin = currentUser.role === 'admin';
  const canEdit = isTeacher || isAdmin; // Student can only view and export

  const currentStudentData = isStudent
    ? students.find(
        (s) =>
          s.id === currentUser.studentId ||
          s.email.toLowerCase() === currentUser.email.toLowerCase()
      )
    : undefined;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Toast Notification */}
      {actionNoticeToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionNoticeToast}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentNav={currentNav}
        onSelectNav={handleNavSelect}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenPresentationModal={() => setIsPresentationModalOpen(true)}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0">
        {/* Top Header Bar */}
        <Header
          currentNav={currentNav}
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          selectedClassroomId={selectedClassroomId}
          onSelectClassroom={setSelectedClassroomId}
          onSelectNav={handleNavSelect}
          onOpenPresentationModal={() => setIsPresentationModalOpen(true)}
          currentUser={currentUser}
          onLogout={() => setIsLogoutModalOpen(true)}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Dashboard View */}
          {currentNav === 'dashboard' && (
            <>
              {isStudent ? (
                <StudentPortalPage
                  currentUser={currentUser}
                  studentData={currentStudentData}
                  attendanceRecords={attendanceRecords}
                  onNavigateToLiveFeed={() => setCurrentNav('live')}
                />
              ) : (
                <DashboardPage
                  onNavigate={setCurrentNav}
                  onOpenAddStudent={() => {
                    setCurrentNav('students');
                    setIsAddStudentModalOpen(true);
                  }}
                  onOpenAddTeacher={() => {
                    setCurrentNav('teachers');
                    setIsAddTeacherModalOpen(true);
                  }}
                  attendanceRecords={attendanceRecords}
                  students={students}
                  teachers={teachers}
                  currentUser={currentUser}
                />
              )}
            </>
          )}

          {/* Live Surveillance View */}
          {currentNav === 'live' && (
            <LiveAttendancePage
              events={liveEvents}
              onAddEvent={handleAddLiveEvent}
              classroomOccupancy={classroomOccupancy}
              onUpdateOccupancy={handleUpdateOccupancy}
              showBoundingBoxes={faceConfig.showBoundingBoxes}
              securityIncidents={securityIncidents}
              onAddSecurityIncident={(incident) =>
                setSecurityIncidents((prev) => [incident, ...prev])
              }
            />
          )}

          {/* Student Management View */}
          {currentNav === 'students' && (
            <StudentManagementPage
              students={students}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onBulkImportStudents={(imported) => {
                setStudents((prev) => {
                  const next = [...imported, ...prev];
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('smartclass_students_list', JSON.stringify(next));
                  }
                  return next;
                });
              }}
              isAddModalOpen={isAddStudentModalOpen}
              setIsAddModalOpen={setIsAddStudentModalOpen}
              currentUser={currentUser}
              canEdit={canEdit}
            />
          )}

          {/* Teacher Management View */}
          {currentNav === 'teachers' && (
            <TeacherManagementPage
              teachers={teachers}
              onAddTeacher={handleAddTeacher}
              onUpdateTeacher={handleUpdateTeacher}
              onDeleteTeacher={handleDeleteTeacher}
              onBulkImportTeachers={(imported) => {
                setTeachers((prev) => {
                  const next = [...imported, ...prev];
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('smartclass_teachers_list', JSON.stringify(next));
                  }
                  return next;
                });
              }}
              isAddModalOpen={isAddTeacherModalOpen}
              setIsAddModalOpen={setIsAddTeacherModalOpen}
              currentUser={currentUser}
              canEdit={canEdit}
            />
          )}

          {/* Classroom Management View */}
          {currentNav === 'classrooms' && (
            <ClassroomManagementPage
              classrooms={classrooms}
              onAddClassroom={handleAddClassroom}
              onUpdateClassroom={handleUpdateClassroom}
              onDeleteClassroom={handleDeleteClassroom}
              attendanceRecords={attendanceRecords}
              students={students}
              currentUser={currentUser}
              canEdit={canEdit}
            />
          )}

          {/* Attendance Records (View & Export available to Students and Teachers) */}
          {currentNav === 'records' && (
            <AttendanceRecordsPage records={attendanceRecords} />
          )}

          {/* Reports & Analytics (View & Export available to Students and Teachers) */}
          {currentNav === 'reports' && (
            <ReportsAnalyticsPage students={students} />
          )}

          {/* Face Recognition Settings (Admin Only) */}
          {currentNav === 'face_settings' && (
            <>
              {isAdmin ? (
                <FaceRecognitionSettingsPage
                  config={faceConfig}
                  onSaveConfig={setFaceConfig}
                />
              ) : (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto my-12">
                  <Lock className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    Administrator Clearance Required
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Biometric face recognition model parameters and camera thresholds are strictly managed by system administrators.
                  </p>
                  <button
                    onClick={() => setCurrentNav('dashboard')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
                  >
                    Return to Dashboard
                  </button>
                </div>
              )}
            </>
          )}

          {/* User Management & Password Provisioning (Admin Only) */}
          {currentNav === 'users' && (
            <>
              {isAdmin ? (
                <UserManagementPage
                  onLogout={() => setIsLogoutModalOpen(true)}
                  initialTab="accounts"
                  registeredUsers={registeredUsers}
                  onAddUserCredential={handleAddUserCredential}
                  students={students}
                  teachers={teachers}
                />
              ) : (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto my-12">
                  <Lock className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    Admin Clearance Required
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Only system administrators can create user passwords and provision institutional accounts.
                  </p>
                  <button
                    onClick={() => setCurrentNav('dashboard')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
                  >
                    Return to Dashboard
                  </button>
                </div>
              )}
            </>
          )}

          {/* System Settings (Admin Only) */}
          {currentNav === 'settings' && (
            <>
              {isAdmin ? (
                <UserManagementPage
                  onLogout={() => setIsLogoutModalOpen(true)}
                  initialTab="alerts"
                  registeredUsers={registeredUsers}
                  onAddUserCredential={handleAddUserCredential}
                  students={students}
                  teachers={teachers}
                />
              ) : (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-lg mx-auto my-12">
                  <Lock className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    Admin Clearance Required
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Alert dispatch gateways and scheduled jobs are restricted to administrators.
                  </p>
                  <button
                    onClick={() => setCurrentNav('dashboard')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
                  >
                    Return to Dashboard
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Presentation / Viva Guide Modal */}
      <PresentationModal
        isOpen={isPresentationModalOpen}
        onClose={() => setIsPresentationModalOpen(false)}
      />

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Sign Out of SmartClass
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Are you sure you want to end your {currentUser.role} session ({currentUser.name})?
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm cursor-pointer"
              >
                Confirm Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Route Access Restricted Modal (When student/teacher tries to access /admin) */}
      {adminRestrictedModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-200">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-50 text-amber-800 border border-amber-200 mb-2">
              <Lock className="w-3 h-3 text-amber-600" />
              <span>ROUTE: /admin RESTRICTED</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Administrator Clearance Required
            </h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              The <strong className="text-slate-900">/admin</strong> console is strictly reserved for College Administrators to manage surveillance, camera thresholds, and create user accounts with passwords. You are currently signed in as a <span className="font-semibold text-blue-600 capitalize">{currentUser.role}</span> ({currentUser.name}).
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                onClick={() => {
                  setAdminRestrictedModalOpen(false);
                  handleNavigateRoute('/');
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Stay in {currentUser.role === 'student' ? 'Student' : 'Faculty'} Portal
              </button>
              <button
                onClick={() => {
                  setAdminRestrictedModalOpen(false);
                  handleLogout();
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Sign Out &amp; Go to /admin</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
