import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Key,
  Eye,
  EyeOff,
  ArrowRight,
  ScanFace,
  AlertTriangle,
  Sparkles,
  Users,
  GraduationCap,
  ShieldAlert,
  Server,
  UserCheck,
} from 'lucide-react';
import { AuthUser } from '../../types/attendance';
import { DEMO_ADMIN_USER } from '../../data/mockData';

interface AdminLoginPageProps {
  onLogin: (user: AuthUser) => void;
  onGoToStudentTeacherPortal: () => void;
  registeredUsers: AuthUser[];
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLogin,
  onGoToStudentTeacherPortal,
  registeredUsers = [],
}) => {
  const [email, setEmail] = useState('admin@college.edu');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const cleanEmail = email.trim().toLowerCase();

      // Find admin among registered users or demo
      const pool = [DEMO_ADMIN_USER, ...registeredUsers.filter((u) => u.role === 'admin')];
      const match = pool.find(
        (u) =>
          u.email.toLowerCase() === cleanEmail &&
          u.role === 'admin' &&
          (!u.password || u.password === password)
      );

      if (match) {
        onLogin(match);
      } else if (cleanEmail === 'admin@college.edu' && password === 'admin123') {
        onLogin(DEMO_ADMIN_USER);
      } else {
        // If password doesn't match
        const emailExists = pool.some((u) => u.email.toLowerCase() === cleanEmail);
        if (emailExists) {
          setError('Invalid administrator password. Try "admin123" for demo account.');
        } else {
          setError(
            'Admin account not found. This page is strictly for Administrators. If you are a student or teacher, please use the Student & Teacher portal.'
          );
        }
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background glow and security radar grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(56, 189, 248, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.3) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
      </div>

      {/* Top Route Navigation Switcher */}
      <div className="relative z-10 w-full max-w-lg mb-4 flex items-center justify-between px-2">
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-mono text-[11px] text-slate-300 font-bold tracking-wider">
            CONSOLE ROUTE: <span className="text-blue-400">/admin</span>
          </span>
        </div>

        <button
          type="button"
          onClick={onGoToStudentTeacherPortal}
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
          <span>Student &amp; Teacher Portal &rarr;</span>
        </button>
      </div>

      {/* Main Admin Card */}
      <div className="relative z-10 w-full max-w-lg bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
        {/* Header Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-xl shadow-blue-500/20 mb-3 border border-white/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-blue-950 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-blue-400" />
              <span>ADMIN ACCESS ONLY · /admin</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Administrator Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Surveillance console, facial recognition settings, and user password provisioning for students &amp; faculty
          </p>
        </div>

        {/* Feature Highlight Pill */}
        <div className="mb-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3 text-xs text-blue-200">
          <Key className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white">Admin Privileges Active:</span> As administrator, you can create user credentials &amp; passwords for both students and teachers, enroll biometric profiles, and manage system surveillance.
          </div>
        </div>

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
              Admin Institutional Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@college.edu"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-slate-300 font-semibold">Admin Master Password</label>
              <span className="text-[11px] text-slate-400 font-mono">Demo: admin123</span>
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
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all text-xs cursor-pointer mt-2"
          >
            {isLoading ? (
              <span>Authenticating Administrator...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In to Admin Panel (/admin)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Access */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>Instant Demo Evaluation:</span>
            <span className="text-emerald-400">Ready</span>
          </div>
          <button
            type="button"
            onClick={() => onLogin(DEMO_ADMIN_USER)}
            className="w-full p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/40 text-left transition-all flex items-center justify-between text-xs cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <img
                src={DEMO_ADMIN_USER.avatarUrl}
                alt="Admin"
                className="w-8 h-8 rounded-lg object-cover border border-blue-500/30"
              />
              <div>
                <div className="font-bold text-white group-hover:text-blue-300">
                  {DEMO_ADMIN_USER.name}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  admin@college.edu · Super Administrator
                </div>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-blue-400 bg-blue-950/80 px-2 py-1 rounded border border-blue-800/60">
              1-Click Login
            </span>
          </button>
        </div>

        {/* Switch to Student & Teacher Portal */}
        <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-800/60 pt-4">
          <span>Are you a Student or Faculty Member? </span>
          <button
            type="button"
            onClick={onGoToStudentTeacherPortal}
            className="text-blue-400 hover:text-blue-300 font-bold underline underline-offset-2 ml-1 cursor-pointer"
          >
            Go to Student &amp; Teacher Portal &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
