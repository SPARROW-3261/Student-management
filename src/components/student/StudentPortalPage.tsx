import React, { useState } from 'react';
import {
  GraduationCap,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ScanFace,
  ShieldCheck,
  Camera,
  DoorOpen,
  BookOpen,
  TrendingUp,
  FileText,
  UserCheck,
  Send,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { AuthUser, Student, AttendanceRecord } from '../../types/attendance';

interface StudentPortalPageProps {
  currentUser: AuthUser;
  studentData?: Student;
  attendanceRecords: AttendanceRecord[];
  onNavigateToLiveFeed: () => void;
}

export const StudentPortalPage: React.FC<StudentPortalPageProps> = ({
  currentUser,
  studentData,
  attendanceRecords,
  onNavigateToLiveFeed,
}) => {
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestSubject, setRequestSubject] = useState('Medical Leave Attendance Regularization');
  const [requestReason, setRequestReason] = useState('');
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

  // Filter records belonging to this student
  const myRecords = attendanceRecords.filter(
    (r) =>
      r.personId === (currentUser.studentId || 'STU-2024-042') ||
      r.personName.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0])
  );

  const percentage = studentData?.attendancePercentage ?? 88.5;
  const isEligible = percentage >= 75;

  const subjects = [
    { code: 'MCA-301', name: 'Computer Vision & Deep Learning', attended: 22, total: 24, rate: 91.6 },
    { code: 'MCA-302', name: 'Cloud Computing & Distributed Systems', attended: 19, total: 22, rate: 86.3 },
    { code: 'MCA-303', name: 'Advanced Database Engineering', attended: 20, total: 24, rate: 83.3 },
    { code: 'MCA-304', name: 'Artificial Intelligence Laboratory', attended: 24, total: 24, rate: 100.0 },
    { code: 'MCA-305', name: 'Software Project Management', attended: 18, total: 22, rate: 81.8 },
  ];

  const handleSendRegularization = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestSuccess('Your attendance regularization request has been submitted to Dr. Sunita Rao (HOD) for administrative review.');
    setTimeout(() => {
      setRequestModalOpen(false);
      setRequestSuccess(null);
      setRequestReason('');
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Student Welcome & Biometric Profile Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative">
              <img
                src={currentUser.avatarUrl || '/src/assets/images/avatar_student_rahul_1791905718978.jpg'}
                alt={currentUser.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-purple-400/50 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  STUDENT BIOMETRIC PORTAL
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                  FACE ENROLLED
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {currentUser.name}
              </h2>
              <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-3">
                <span>Roll No: <strong>{currentUser.rollNo || '24MCA042'}</strong></span>
                <span>·</span>
                <span>Program: <strong>{currentUser.course || 'MCA (2024-26)'}</strong></span>
                <span>·</span>
                <span>Section: <strong>{currentUser.section || 'MCA-II A'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onNavigateToLiveFeed}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>View Classroom Live Feed</span>
            </button>
            <button
              onClick={() => setRequestModalOpen(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-white/20 flex items-center gap-2 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Request Regularization</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Percentage */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Overall Attendance
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isEligible
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {isEligible ? 'EXAM ELIGIBLE' : 'DEBARRED RISK'}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{percentage}%</span>
            <span className="text-xs text-slate-400 font-medium">/ 75% Min. Req</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isEligible ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Classes Attended */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Class Attendance
            </span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">
              {studentData?.attendedClasses ?? 42}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              / {studentData?.totalClasses ?? 48} Lectures
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Missed only 6 classes this semester
          </div>
        </div>

        {/* Today's Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Today's Live Status
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div>
            <div className="text-base font-bold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Present &amp; Verified</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Entered MCA Advanced Lab 301 at <strong>09:00 AM</strong>
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-2">
            Clocked via Entrance Cam 01 (98.8% match)
          </div>
        </div>

        {/* Facial Biometric Vector */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Facial Biometric Status
            </span>
            <ScanFace className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <div className="text-base font-bold text-purple-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>FaceNet 512-D Ready</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              68 Facial landmarks enrolled and synced to Jetson Edge Node
            </div>
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-2">
            ✓ Automated Check-In Active
          </div>
        </div>
      </div>

      {/* Course-wise Breakdown & My Verification Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course-wise Attendance */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Subject-Wise Attendance Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Course performance calculated via automated facial surveillance
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">Semester III</span>
          </div>

          <div className="space-y-3.5">
            {subjects.map((sub) => (
              <div
                key={sub.code}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                      {sub.code}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">{sub.name}</h4>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-black ${
                        sub.rate >= 85
                          ? 'text-emerald-600'
                          : sub.rate >= 75
                          ? 'text-blue-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {sub.rate}%
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {sub.attended}/{sub.total} classes
                    </div>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      sub.rate >= 85
                        ? 'bg-emerald-500'
                        : sub.rate >= 75
                        ? 'bg-blue-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${sub.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Verification Log */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>My Verification Records</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Recent</span>
          </div>

          <div className="space-y-3">
            {myRecords.length > 0 ? (
              myRecords.slice(0, 5).map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{rec.classroom}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                      {rec.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{rec.date} · {rec.entryTime}</span>
                    <span className="text-emerald-600 font-bold">{rec.confidenceScore}% match</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-400">
                No recent personal logs found.
              </div>
            )}
          </div>

          <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-xs text-purple-900">
            <div className="font-bold flex items-center gap-1.5 text-purple-800 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Face Attendance Guarantee</span>
            </div>
            <p className="text-[11px] text-purple-700 leading-relaxed">
              If your face recognition is ever delayed due to lighting or low camera resolution, inform your instructor to trigger a manual override timestamp.
            </p>
          </div>
        </div>
      </div>

      {/* Regularization Request Modal */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Submit Attendance Regularization Request
                  </h3>
                  <p className="text-xs text-slate-500">
                    Forwarded directly to HOD &amp; Course Incharge
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRequestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {requestSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{requestSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleSendRegularization} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Request Category
                  </label>
                  <select
                    value={requestSubject}
                    onChange={(e) => setRequestSubject(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  >
                    <option value="Medical Leave Attendance Regularization">
                      Medical Leave Attendance Regularization
                    </option>
                    <option value="Face Camera Non-Recognition Appeal">
                      Face Recognition Camera Check-In Glitch Appeal
                    </option>
                    <option value="University Sports / Cultural Duty">
                      University Sports / Cultural Duty
                    </option>
                    <option value="Placement Interview Duty Absence">
                      Placement Interview Absence
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reason &amp; Lecture Details
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    placeholder="Provide details regarding the date, lecture missed, and reason for absence..."
                    className="w-full border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRequestModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
