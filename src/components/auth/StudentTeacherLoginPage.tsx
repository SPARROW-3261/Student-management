import React, { useState } from 'react';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  Lock,
  Mail,
  Key,
  Eye,
  EyeOff,
  ArrowRight,
  Download,
  Edit2,
  AlertTriangle,
  Sparkles,
  Info,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { AuthUser, UserRole } from '../../types/attendance';
import { DEMO_STUDENT_USER, DEMO_TEACHER_USER } from '../../data/mockData';

interface StudentTeacherLoginPageProps {
  onLogin: (user: AuthUser) => void;
  onGoToAdminLogin: () => void;
  registeredUsers: AuthUser[];
}

export const StudentTeacherLoginPage: React.FC<StudentTeacherLoginPageProps> = ({
  onLogin,
  onGoToAdminLogin,
  registeredUsers = [],
}) => {
  const [activeRole, setActiveRole] = useState<'student' | 'teacher'>('student');
  const [email, setEmail] = useState('rahul.kumar@student.edu');
  const [password, setPassword] = useState('student123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleTabChange = (role: 'student' | 'teacher') => {
    setActiveRole(role);
    setError(null);
    if (role === 'student') {
      setEmail('rahul.kumar@student.edu');
      setPassword('student123');
    } else {
      setEmail('amit.verma@college.edu');
      setPassword('teacher123');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const cleanEmail = email.trim().toLowerCase();

      // Check among registered users or defaults for the selected role
      const pool = [
        ...(activeRole === 'student' ? [DEMO_STUDENT_USER] : [DEMO_TEACHER_USER]),
        ...registeredUsers.filter((u) => u.role === activeRole),
      ];

      const match = pool.find(
        (u) =>
          u.email.toLowerCase() === cleanEmail &&
          u.role === activeRole &&
          (!u.password || u.password === password)
      );

      if (match) {
        onLogin(match);
      } else {
        // Check if email exists with wrong password or wrong role
        const emailExists = pool.some((u) => u.email.toLowerCase() === cleanEmail);
        if (emailExists) {
          setError(
            `Invalid password for ${cleanEmail}. Please use the password provisioned by your administrator.`
          );
        } else {
          // Check if admin is trying to login here
          if (cleanEmail === 'admin@college.edu' || cleanEmail.includes('admin')) {
            setError(
              'Administrator account detected. Please access the dedicated Admin Login page at /admin.'
            );
          } else {
            setError(
              `No ${activeRole} account found for ${cleanEmail}. Please check spelling or contact the administrator to create your account password.`
            );
          }
        }
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top Banner Navigation */}
      <div className="relative z-10 w-full max-w-lg mb-4 flex items-center justify-between px-2">
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 shadow-sm text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <span className="font-semibold">Student &amp; Faculty Attendance Portal</span>
        </div>

        <button
          type="button"
          onClick={onGoToAdminLogin}
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5 text-blue-400" />
          <span>Admin Login (/admin) &rarr;</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-lg bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
        {/* Portal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 mb-3 border border-white/20">
            {activeRole === 'student' ? (
              <GraduationCap className="w-8 h-8" />
            ) : (
              <Users className="w-8 h-8" />
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            SmartClass <span className="text-blue-400">Vision</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Biometric Face Recognition Attendance Portal for Students &amp; Academic Faculty
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-5 gap-1.5">
          <button
            type="button"
            onClick={() => handleRoleTabChange('student')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeRole === 'student'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Portal</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleTabChange('teacher')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeRole === 'teacher'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Teacher / Faculty</span>
          </button>
        </div>

        {/* Role Permissions Callout */}
        {activeRole === 'student' ? (
          <div className="mb-5 p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3 text-xs text-blue-200">
            <Download className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Student Permissions:</span> You have{' '}
              <strong className="text-blue-300">viewing &amp; export access</strong>. You can view
              your attendance history, courses, and export attendance records (CSV/PDF). Editing or
              modifying records is not permitted.
            </div>
          </div>
        ) : (
          <div className="mb-5 p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-start gap-3 text-xs text-indigo-200">
            <Edit2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Teacher Permissions:</span> You have full{' '}
              <strong className="text-indigo-300">editing &amp; export privileges</strong>. You can
              edit class attendance, manage student records, override attendance status, and export reports.
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-5 p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              {activeRole === 'student' ? 'Student Institutional Email' : 'Faculty Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  activeRole === 'student' ? 'rahul.kumar@student.edu' : 'amit.verma@college.edu'
                }
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-semibold">Password</label>
              <span className="text-[11px] text-slate-400 font-mono">
                {activeRole === 'student' ? 'Demo: student123' : 'Demo: teacher123'}
              </span>
            </div>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all text-xs cursor-pointer mt-2 ${
              activeRole === 'student'
                ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
            }`}
          >
            {isLoading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In as {activeRole === 'student' ? 'Student' : 'Faculty'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Login Tile */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>Sample {activeRole === 'student' ? 'Student' : 'Teacher'} Profile:</span>
            <span className="text-emerald-400">Verified</span>
          </div>

          {activeRole === 'student' ? (
            <button
              type="button"
              onClick={() => onLogin(DEMO_STUDENT_USER)}
              className="w-full p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/40 text-left transition-all flex items-center justify-between text-xs cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src={DEMO_STUDENT_USER.avatarUrl}
                  alt="Student"
                  className="w-8 h-8 rounded-lg object-cover border border-blue-500/30"
                />
                <div>
                  <div className="font-bold text-white group-hover:text-blue-300">
                    {DEMO_STUDENT_USER.name} ({DEMO_STUDENT_USER.rollNo})
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    rahul.kumar@student.edu · MCA-II A (View &amp; Export)
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-blue-400 bg-blue-950/80 px-2 py-1 rounded border border-blue-800/60">
                1-Click Demo
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onLogin(DEMO_TEACHER_USER)}
              className="w-full p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 text-left transition-all flex items-center justify-between text-xs cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <img
                  src={DEMO_TEACHER_USER.avatarUrl}
                  alt="Teacher"
                  className="w-8 h-8 rounded-lg object-cover border border-indigo-500/30"
                />
                <div>
                  <div className="font-bold text-white group-hover:text-indigo-300">
                    {DEMO_TEACHER_USER.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    amit.verma@college.edu · Associate Professor (Edit &amp; Export)
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-950/80 px-2 py-1 rounded border border-indigo-800/60">
                1-Click Demo
              </span>
            </button>
          )}
        </div>

        {/* Footer info & Admin link */}
        <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800/60 pt-4 space-y-2">
          <p className="text-[11px] text-slate-400">
            Need an account or password reset? Contact your system administrator.
          </p>
          <div className="pt-1">
            <span className="text-slate-400">College Administrator? </span>
            <button
              type="button"
              onClick={onGoToAdminLogin}
              className="text-blue-400 hover:text-blue-300 font-bold underline underline-offset-2 ml-1 cursor-pointer"
            >
              Access Admin Panel (/admin) &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
