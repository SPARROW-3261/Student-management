/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
import { PresentationModal } from './components/common/PresentationModal';
import {
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  CLASSROOMS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_LIVE_EVENTS,
  INITIAL_CONFIG,
  INITIAL_SECURITY_INCIDENTS,
} from './data/mockData';
import {
  Student,
  Teacher,
  Classroom,
  AttendanceRecord,
  LiveFaceEvent,
  FaceRecognitionConfig,
  SecurityIncident,
} from './types/attendance';
import { LogOut, AlertTriangle } from 'lucide-react';

export default function App() {
  const [currentNav, setCurrentNav] = useState<NavItem>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedClassroomId, setSelectedClassroomId] = useState('CR-301');

  // Application Data States
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
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

  // Handlers for Students
  const handleAddStudent = (newStudent: Student) => {
    setStudents((prev) => [newStudent, ...prev]);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
  };

  const handleDeleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  // Handlers for Teachers
  const handleAddTeacher = (newTeacher: Teacher) => {
    setTeachers((prev) => [newTeacher, ...prev]);
  };

  const handleUpdateTeacher = (updatedTeacher: Teacher) => {
    setTeachers((prev) =>
      prev.map((t) => (t.id === updatedTeacher.id ? updatedTeacher : t))
    );
  };

  const handleDeleteTeacher = (id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        currentNav={currentNav}
        onSelectNav={handleNavSelect}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenPresentationModal={() => setIsPresentationModalOpen(true)}
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
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {currentNav === 'dashboard' && (
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
            />
          )}

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

          {currentNav === 'students' && (
            <StudentManagementPage
              students={students}
              onAddStudent={handleAddStudent}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onBulkImportStudents={(imported) => {
                setStudents((prev) => [...imported, ...prev]);
              }}
              isAddModalOpen={isAddStudentModalOpen}
              setIsAddModalOpen={setIsAddStudentModalOpen}
            />
          )}

          {currentNav === 'teachers' && (
            <TeacherManagementPage
              teachers={teachers}
              onAddTeacher={handleAddTeacher}
              onUpdateTeacher={handleUpdateTeacher}
              onDeleteTeacher={handleDeleteTeacher}
              onBulkImportTeachers={(imported) => {
                setTeachers((prev) => [...imported, ...prev]);
              }}
              isAddModalOpen={isAddTeacherModalOpen}
              setIsAddModalOpen={setIsAddTeacherModalOpen}
            />
          )}

          {currentNav === 'classrooms' && (
            <ClassroomManagementPage
              classrooms={classrooms}
              onAddClassroom={handleAddClassroom}
              onUpdateClassroom={handleUpdateClassroom}
              onDeleteClassroom={handleDeleteClassroom}
              attendanceRecords={attendanceRecords}
              students={students}
            />
          )}

          {currentNav === 'records' && (
            <AttendanceRecordsPage records={attendanceRecords} />
          )}

          {currentNav === 'reports' && (
            <ReportsAnalyticsPage students={students} />
          )}

          {currentNav === 'face_settings' && (
            <FaceRecognitionSettingsPage
              config={faceConfig}
              onSaveConfig={setFaceConfig}
            />
          )}

          {currentNav === 'users' && (
            <UserManagementPage
              onLogout={() => setIsLogoutModalOpen(true)}
              initialTab="profile"
            />
          )}

          {currentNav === 'settings' && (
            <UserManagementPage
              onLogout={() => setIsLogoutModalOpen(true)}
              initialTab="alerts"
            />
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
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Sign Out of SmartClass
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Are you sure you want to end this administrative surveillance session?
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  setCurrentNav('dashboard');
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm"
              >
                Confirm Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
