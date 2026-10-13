import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  AlertTriangle,
  GraduationCap,
  Users,
  Clock,
  DoorOpen,
  ArrowUpRight,
  Send,
  CheckCircle2,
  Percent,
} from 'lucide-react';
import {
  WEEKLY_ATTENDANCE_TREND,
  COURSE_DISTRIBUTION,
  INITIAL_STUDENTS,
} from '../../data/mockData';
import { Student } from '../../types/attendance';

interface ReportsAnalyticsPageProps {
  students: Student[];
}

export const ReportsAnalyticsPage: React.FC<ReportsAnalyticsPageProps> = ({ students }) => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [notifiedStudents, setNotifiedStudents] = useState<string[]>([]);

  // Students with low attendance (< 75%)
  const lowAttendanceStudents = students.filter((s) => s.attendancePercentage < 75);

  const handleNotifyStudent = (id: string, name: string) => {
    setNotifiedStudents((prev) => [...prev, id]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Attendance Reports & Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical breakdown of classroom attendance patterns, faculty engagement, and risk alerts
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe switch */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setTimeframe('daily')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                timeframe === 'daily'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                timeframe === 'weekly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                timeframe === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Analytics</span>
          </button>
        </div>
      </div>

      {/* 4 Primary KPI metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Student Attendance % */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Student Turnout</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            82.4%
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+2.8% above semester average</span>
          </div>
        </div>

        {/* Teacher Attendance % */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Faculty Turnout</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            88.9%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            16 / 18 active faculty logged
          </div>
        </div>

        {/* Average Classroom Occupancy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Avg Room Occupancy</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DoorOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
            74.2%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Peak load at MCA Lab 301 (85%)
          </div>
        </div>

        {/* Average Time Spent in Classroom */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Avg Lecture Duration</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            1h 35m
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            5.2h daily classroom dwell time
          </div>
        </div>
      </div>

      {/* Comparison Grid: Course Attendance + Weekly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course/Department Attendance Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Attendance by Degree & Department
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Current month average presence rates
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-blue-600">October 2026</span>
          </div>

          <div className="space-y-4">
            {COURSE_DISTRIBUTION.map((c) => (
              <div key={c.course} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{c.course}</span>
                  <span className="font-mono tabular-nums font-bold text-slate-900">
                    {c.rate}% ({c.present}/{c.studentsCount} Students)
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      c.rate >= 85
                        ? 'bg-blue-600'
                        : c.rate >= 75
                        ? 'bg-indigo-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${c.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Minimum University Eligibility Threshold: <strong>75.0%</strong></span>
            <span className="text-rose-600 font-semibold">BCA Class flagged at 71.1%</span>
          </div>
        </div>

        {/* Weekly Attendance Comparison Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Weekly Attendance Velocity
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comparison across Monday through Saturday
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-slate-600">
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-sm"></span> Students
                </span>
                <span className="flex items-center gap-1 text-slate-600">
                  <span className="w-2.5 h-2.5 bg-indigo-400 rounded-sm"></span> Teachers
                </span>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-3 items-end h-44 pt-6 pb-2 border-b border-slate-200">
              {WEEKLY_ATTENDANCE_TREND.map((item) => (
                <div key={item.day} className="flex flex-col items-center gap-2 h-full justify-end">
                  <div className="text-[10px] font-mono text-slate-500">{item.rate}%</div>
                  <div className="w-full max-w-[28px] bg-slate-100 rounded-t-lg flex flex-col justify-end h-full overflow-hidden">
                    <div
                      className="w-full bg-blue-600 transition-all duration-500 rounded-t-sm"
                      style={{ height: `${(item.students / 250) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs font-bold text-slate-700">{item.day}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
            <span>Highest Attendance Day: <strong className="text-slate-800">Wednesday (89%)</strong></span>
            <span>Lowest Day: <strong className="text-slate-800">Saturday (61%)</strong></span>
          </div>
        </div>
      </div>

      {/* Low Attendance At-Risk Students Alert Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Students with Low Attendance (&lt; 75% Threshold Alert)
              </h3>
              <p className="text-xs text-slate-500">
                Action required: Send automated SMS/Email notification or schedule academic counseling
              </p>
            </div>
          </div>

          <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            {lowAttendanceStudents.length} Students At Risk
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">ID / Roll</th>
                <th className="py-2.5 px-3">Course & Section</th>
                <th className="py-2.5 px-3">Current Attendance</th>
                <th className="py-2.5 px-3">Classes Missed</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lowAttendanceStudents.map((st) => {
                const isNotified = notifiedStudents.includes(st.id);
                return (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <img
                          src={st.avatarUrl}
                          alt={st.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <span>{st.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {st.id} ({st.rollNo})
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">
                      {st.course} · {st.section}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-rose-600 tabular-nums">
                      {st.attendancePercentage}%
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {st.totalClasses - st.attendedClasses} of {st.totalClasses} classes
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                      {st.phone}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {isNotified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Warning Sent</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleNotifyStudent(st.id, st.name)}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1 ml-auto transition-colors"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send Warning</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
