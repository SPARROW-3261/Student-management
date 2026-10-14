import React, { useState } from 'react';
import {
  ScanFace,
  ShieldCheck,
  GraduationCap,
  Users,
  Lock,
  Mail,
  User,
  Phone,
  Building,
  Key,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  BookOpen,
  Camera,
  Info,
  Check,
} from 'lucide-react';
import { AuthUser, UserRole, Student, Teacher } from '../../types/attendance';
import {
  DEMO_ADMIN_USER,
  DEMO_TEACHER_USER,
  DEMO_STUDENT_USER,
} from '../../data/mockData';

interface AuthPageProps {
  onLogin: (user: AuthUser) => void;
  onRegisterStudent?: (student: Student) => void;
  onRegisterTeacher?: (teacher: Teacher) => void;
  registeredUsers?: AuthUser[];
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onLogin,
  onRegisterStudent,
  onRegisterTeacher,
  registeredUsers = [],
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('admin@college.edu');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('+91 ');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  // Student specific
  const [regCourse, setRegCourse] = useState('MCA');
  const [regSection, setRegSection] = useState('MCA-II A');
  const [regRollNo, setRegRollNo] = useState('');
  // Teacher/Admin specific
  const [regDepartment, setRegDepartment] = useState('Computer Applications');
  const [regDesignation, setRegDesignation] = useState('Associate Professor');
  const [regCabinNo, setRegCabinNo] = useState('Cabin 305, 3rd Floor');
  const [regSimulateFace, setRegSimulateFace] = useState(true);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // When switching role in login mode, prefill demo credentials for smooth convenience
  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRole(role);
    setLoginError(null);
    if (role === 'admin') {
      setLoginEmail('admin@college.edu');
      setLoginPassword('admin123');
    } else if (role === 'teacher') {
      setLoginEmail('amit.verma@college.edu');
      setLoginPassword('teacher123');
    } else {
      setLoginEmail('rahul.kumar@student.edu');
      setLoginPassword('student123');
    }
  };

  // One-click demo login
  const handleQuickDemoLogin = (role: UserRole) => {
    if (role === 'admin') {
      onLogin(DEMO_ADMIN_USER);
    } else if (role === 'teacher') {
      onLogin(DEMO_TEACHER_USER);
    } else {
      onLogin(DEMO_STUDENT_USER);
    }
  };

  // Submit Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const emailLower = loginEmail.trim().toLowerCase();

      // Check among registered or demo users
      const pool = [DEMO_ADMIN_USER, DEMO_TEACHER_USER, DEMO_STUDENT_USER, ...registeredUsers];
      const found = pool.find(
        (u) => u.email.toLowerCase() === emailLower && u.role === selectedRole
      );

      if (found) {
        onLogin(found);
      } else {
        // Fallback: construct matching user for any valid format login for easy review
        if (emailLower.includes('@')) {
          const generatedUser: AuthUser = {
            id: `USR-${Date.now().toString().slice(-4)}`,
            name:
              selectedRole === 'admin'
                ? 'College Administrator'
                : selectedRole === 'teacher'
                ? 'Faculty Member'
                : 'Enrolled Student',
            email: emailLower,
            role: selectedRole,
            canMakeChanges: selectedRole === 'admin',
            avatarUrl:
              selectedRole === 'admin'
                ? DEMO_ADMIN_USER.avatarUrl
                : selectedRole === 'teacher'
                ? DEMO_TEACHER_USER.avatarUrl
                : DEMO_STUDENT_USER.avatarUrl,
            department: regDepartment,
            course: selectedRole === 'student' ? 'MCA' : undefined,
            rollNo: selectedRole === 'student' ? '24MCA999' : undefined,
            designation: selectedRole === 'teacher' ? 'Faculty Instructor' : undefined,
            lastLogin: 'Just now',
          };
          onLogin(generatedUser);
        } else {
          setLoginError('Please enter a valid institutional email address.');
        }
      }
    }, 400);
  };

  // Submit Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim()) {
      setRegError('Please provide your full legal name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('Please provide a valid institutional email address.');
      return;
    }
    if (regPassword.length < 4) {
      setRegError('Password must contain at least 4 characters.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const userId = `USR-${Date.now().toString().slice(-4)}`;

      const newAuthUser: AuthUser = {
        id: userId,
        name: regName.trim(),
        email: regEmail.trim(),
        role: selectedRole,
        canMakeChanges: selectedRole === 'admin', // ONLY admin can make changes
        phone: regPhone,
        department: regDepartment,
        avatarUrl:
          selectedRole === 'admin'
            ? '/src/assets/images/avatar_admin_sunita_1791905720378.jpg'
            : selectedRole === 'teacher'
            ? '/src/assets/images/avatar_teacher_amit_1791905720315.jpg'
            : '/src/assets/images/avatar_student_rahul_1791905718978.jpg',
        lastLogin: 'Just now',
      };

      if (selectedRole === 'student') {
        const studentId = `STU-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
        newAuthUser.studentId = studentId;
        newAuthUser.course = regCourse;
        newAuthUser.section = regSection;
        newAuthUser.rollNo = regRollNo || `24${regCourse}${Math.floor(10 + Math.random() * 90)}`;

        const newStudentRecord: Student = {
          id: studentId,
          name: regName.trim(),
          email: regEmail.trim(),
          phone: regPhone,
          course: regCourse,
          section: regSection,
          rollNo: newAuthUser.rollNo,
          attendancePercentage: 100,
          faceRegistered: regSimulateFace,
          avatarUrl: newAuthUser.avatarUrl,
          totalClasses: 1,
          attendedClasses: 1,
          statusToday: 'present',
          lastSeen: 'Registered Today',
        };

        if (onRegisterStudent) {
          onRegisterStudent(newStudentRecord);
        }
      } else if (selectedRole === 'teacher') {
        const teacherId = `TCH-${Math.floor(100 + Math.random() * 900)}`;
        newAuthUser.teacherId = teacherId;
        newAuthUser.designation = regDesignation;
        newAuthUser.cabinNo = regCabinNo;

        const newTeacherRecord: Teacher = {
          id: teacherId,
          name: regName.trim(),
          email: regEmail.trim(),
          phone: regPhone,
          department: regDepartment,
          designation: regDesignation,
          attendanceStatus: 'present',
          faceRegistered: regSimulateFace,
          avatarUrl: newAuthUser.avatarUrl,
          cabinNo: regCabinNo,
          assignedClassrooms: ['MCA Advanced Lab 301', 'Computer Vision Lab 204'],
          lastSeen: 'Registered Today',
        };

        if (onRegisterTeacher) {
          onRegisterTeacher(newTeacherRecord);
        }
      }

      setRegSuccess(`Account successfully created for ${newAuthUser.name}! Logging you in...`);
      setTimeout(() => {
        onLogin(newAuthUser);
      }, 700);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background visual elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        {/* Brand Banner */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-xl shadow-blue-500/25 mb-3.5 border border-white/20">
            <ScanFace className="w-8 h-8" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-blue-900/60 text-blue-300 border border-blue-500/40">
              FACIAL BIOMETRICS · RBAC ACCESS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            SmartClass <span className="text-blue-400">Vision</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Automated Face Recognition Attendance &amp; Classroom Surveillance System
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8">
          {/* Auth Mode Toggle: Sign In vs Register */}
          <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setLoginError(null);
                setRegError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                authMode === 'login'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In to Account
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setLoginError(null);
                setRegError(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                authMode === 'register'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Register New Account
            </button>
          </div>

          {/* Role Selection Tabs */}
          <div className="mb-5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Your Role:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleTabChange('admin')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  selectedRole === 'admin'
                    ? 'bg-emerald-950/60 border-emerald-500/70 text-emerald-300 shadow-md shadow-emerald-900/20'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    selectedRole === 'admin'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold">Admin</div>
                <div className="text-[10px] opacity-80 font-mono">Full Access</div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange('teacher')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  selectedRole === 'teacher'
                    ? 'bg-blue-950/60 border-blue-500/70 text-blue-300 shadow-md shadow-blue-900/20'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    selectedRole === 'teacher'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold">Teacher</div>
                <div className="text-[10px] opacity-80 font-mono">Faculty</div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange('student')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  selectedRole === 'student'
                    ? 'bg-purple-950/60 border-purple-500/70 text-purple-300 shadow-md shadow-purple-900/20'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    selectedRole === 'student'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold">Student</div>
                <div className="text-[10px] opacity-80 font-mono">Portal View</div>
              </button>
            </div>

            {/* Role Permission Guidance Banner */}
            <div
              className={`mt-2.5 p-2.5 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2 ${
                selectedRole === 'admin'
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                  : selectedRole === 'teacher'
                  ? 'bg-blue-950/40 border-blue-500/30 text-blue-300'
                  : 'bg-purple-950/40 border-purple-500/30 text-purple-300'
              }`}
            >
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {selectedRole === 'admin' && (
                  <>
                    <strong className="font-semibold text-emerald-200">
                      Administrator Privileges:
                    </strong>{' '}
                    Has permission to make changes, add/edit/delete students &amp; teachers, configure face recognition parameters, and modify alert settings.
                  </>
                )}
                {selectedRole === 'teacher' && (
                  <>
                    <strong className="font-semibold text-blue-200">
                      Teacher / Faculty Access:
                    </strong>{' '}
                    View class rosters, monitor live camera feeds, and export attendance analytics. System configuration and deletions are locked to Admin.
                  </>
                )}
                {selectedRole === 'student' && (
                  <>
                    <strong className="font-semibold text-purple-200">
                      Student Attendance Portal:
                    </strong>{' '}
                    View your personal attendance percentage, class entry/exit records, verified face status, and today's presence.
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Quick Demo Login Bar (One-click Testing) */}
          {authMode === 'login' && (
            <div className="mb-5 p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>One-Click Demo Access</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">No typing required</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin')}
                  className="px-2.5 py-2 rounded-xl bg-emerald-900/30 hover:bg-emerald-800/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Demo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('teacher')}
                  className="px-2.5 py-2 rounded-xl bg-blue-900/30 hover:bg-blue-800/40 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Teacher Demo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('student')}
                  className="px-2.5 py-2 rounded-xl bg-purple-900/30 hover:bg-purple-800/40 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Demo</span>
                </button>
              </div>
            </div>
          )}

          {/* Feedback messages */}
          {loginError && (
            <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {regError && (
            <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{regError}</span>
            </div>
          )}

          {regSuccess && (
            <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{regSuccess}</span>
            </div>
          )}

          {/* =========================================================================
              SIGN IN FORM
              ========================================================================= */}
          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Institutional Email / University ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. user@college.edu"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <span className="text-[11px] text-blue-400 hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-white absolute right-3.5 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
                  />
                  <span>Remember this terminal</span>
                </label>
                <span className="text-[11px] text-slate-500">256-bit Biometric AES</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span>Authenticating session...</span>
                ) : (
                  <>
                    <span>Sign In as {selectedRole.toUpperCase()}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* =========================================================================
                REGISTER FORM (STUDENT / TEACHER / ADMIN)
                ========================================================================= */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Dr. Sunita / Rahul Kumar"
                      className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Institutional Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@college.edu"
                      className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Role specific inputs */}
              {selectedRole === 'student' && (
                <div className="p-3 bg-purple-950/30 rounded-xl border border-purple-500/20 space-y-3">
                  <div className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    <span>Academic Student Credentials</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Course</label>
                      <select
                        value={regCourse}
                        onChange={(e) => setRegCourse(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                      >
                        <option value="MCA">MCA</option>
                        <option value="B.Tech CSE">B.Tech CSE</option>
                        <option value="BCA">BCA</option>
                        <option value="M.Tech">M.Tech</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Section</label>
                      <input
                        type="text"
                        value={regSection}
                        onChange={(e) => setRegSection(e.target.value)}
                        placeholder="e.g. MCA-II A"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Roll Number</label>
                      <input
                        type="text"
                        value={regRollNo}
                        onChange={(e) => setRegRollNo(e.target.value)}
                        placeholder="e.g. 24MCA042"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedRole === 'teacher' && (
                <div className="p-3 bg-blue-950/30 rounded-xl border border-blue-500/20 space-y-3">
                  <div className="text-[11px] font-bold text-blue-300 flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>Faculty &amp; Department Details</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Department</label>
                      <input
                        type="text"
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Designation</label>
                      <input
                        type="text"
                        value={regDesignation}
                        onChange={(e) => setRegDesignation(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedRole === 'admin' && (
                <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-500/20 space-y-2">
                  <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Administrator Privileges Granted</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Registering as Administrator gives you full permissions to modify records, import rosters, alter camera settings, and manage alert triggers.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Create Password
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 4 chars"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Biometric Face Landmark Simulation Toggle */}
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={regSimulateFace}
                  onChange={(e) => setRegSimulateFace(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                />
                <Camera className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-slate-300">
                  Enroll Facial Biometrics for Live Recognition (68 landmarks vector)
                </span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <span>Registering Account &amp; Enrolling Vector...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Registration &amp; Sign In</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Info Footer */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-slate-400 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Jetson Orin Nano Node Online</span>
            </div>
            <div>
              SmartClass Attendance System v2.4 · Multi-Role RBAC
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
