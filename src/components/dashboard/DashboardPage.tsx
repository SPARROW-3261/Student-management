import React, { useState } from 'react';
import {
  GraduationCap,
  Users,
  UserCheck,
  CheckCircle,
  DoorOpen,
  Percent,
  Camera,
  Cpu,
  ArrowUpRight,
  Plus,
  FileSpreadsheet,
  Video,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  HOURLY_ATTENDANCE_TREND,
  WEEKLY_ATTENDANCE_TREND,
  CLASSROOMS,
} from '../../data/mockData';
import { AttendanceRecord, Student, Teacher, AuthUser } from '../../types/attendance';
import { NavItem } from '../layout/Sidebar';

interface DashboardPageProps {
  onNavigate: (page: NavItem) => void;
  onOpenAddStudent: () => void;
  onOpenAddTeacher: () => void;
  attendanceRecords: AttendanceRecord[];
  students: Student[];
  teachers: Teacher[];
  currentUser?: AuthUser | null;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenAddStudent,
  onOpenAddTeacher,
  attendanceRecords,
  currentUser = null,
}) => {
  const isStudent = currentUser?.role === 'student';
  const [activeHourlyTooltip, setActiveHourlyTooltip] = useState<number | null>(null);

  // SVG Chart Dimensions
  const chartWidth = 600;
  const chartHeight = 180;
  const maxHourlyCount = 200;

  // Calculate points for the hourly SVG line chart
  const points = HOURLY_ATTENDANCE_TREND.map((item, idx) => {
    const x = (idx / (HOURLY_ATTENDANCE_TREND.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - (item.count / maxHourlyCount) * (chartHeight - 40) - 20;
    return { x, y, ...item };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - 10} L ${points[0].x} ${chartHeight - 10} Z`;

  return (
    <div className="space-y-6">
      {/* Top Banner / Quick Action Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white rounded-2xl p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              CLASSROOM ENTRANCE SURVEILLANCE
            </span>
            <span className="text-xs text-slate-400">· Computer Applications Block</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Smart Classroom Entrance Live Status
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Automated facial detection and verification actively logging entry/exit timestamps for MCA Lab 301.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('live')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-colors"
          >
            <Video className="w-4 h-4" />
            <span>Open Live Camera Feed</span>
          </button>
          {!isStudent ? (
            <>
              <button
                onClick={onOpenAddStudent}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-blue-400" />
                <span>Add Student</span>
              </button>
              <button
                onClick={onOpenAddTeacher}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Add Teacher</span>
              </button>
            </>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-blue-950/80 border border-blue-800/60 text-[11px] font-semibold text-blue-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Student View &amp; Export Access</span>
            </div>
          )}
          <button
            onClick={() => onNavigate('records')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span>Attendance Log &amp; Export</span>
          </button>
        </div>
      </div>

      {/* 6 Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Students */}
        <div
          onClick={() => onNavigate('students')}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Students</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            250
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold font-mono">100%</span>
            <span>registered in registry</span>
          </div>
        </div>

        {/* Total Teachers */}
        <div
          onClick={() => onNavigate('teachers')}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Teachers</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            18
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>4 engineering depts</span>
          </div>
        </div>

        {/* Students Present Today */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Students Present</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
            187
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold font-mono">74.8%</span>
            <span>overall turnout</span>
          </div>
        </div>

        {/* Teachers Present Today */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm hover:border-teal-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Teachers Present</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-teal-700">
            12
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-teal-600 font-semibold font-mono">66.7%</span>
            <span>on campus today</span>
          </div>
        </div>

        {/* Currently Inside Classroom */}
        <div
          onClick={() => onNavigate('classrooms')}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Inside Room 301</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <DoorOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-600">
            34
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="font-semibold text-slate-700">85%</span>
            <span>of 40 capacity</span>
          </div>
        </div>

        {/* Attendance Percentage */}
        <div
          onClick={() => onNavigate('reports')}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Attendance Rate</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-700">
            82%
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <span>+3.2% vs last week</span>
          </div>
        </div>
      </div>

      {/* Hardware & AI Pipeline Status Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Camera Connection Status */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Entrance Camera</div>
              <div className="text-sm font-bold text-slate-900">Cam 01 (Classroom 301)</div>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Online (1080p @ 30fps)
            </span>
            <div className="text-[10px] font-mono text-slate-400 mt-1">RTSP Stream Stable</div>
          </div>
        </div>

        {/* Face Recognition Model Status */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Recognition Model</div>
              <div className="text-sm font-bold text-slate-900">FaceNet-512 + YOLOv8</div>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Inference Active
            </span>
            <div className="text-[10px] font-mono text-slate-400 mt-1">Latency: 38ms · Thresh: 85%</div>
          </div>
        </div>

        {/* Biometric Anti-Spoofing & Duplicate Debounce */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Duplicate Filter</div>
              <div className="text-sm font-bold text-slate-900">15-Min Buffer Safeguard</div>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Active Protection
            </span>
            <div className="text-[10px] font-mono text-slate-400 mt-1">0 Duplicate Logs</div>
          </div>
        </div>
      </div>

      {/* Charts Section: Line Chart + Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Attendance Line Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Daily Attendance Timeline</span>
                <span className="text-xs font-normal text-slate-500">· Today (Hourly Check-ins)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Surveillance camera entry frequency throughout the day
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block"></span>
                <span>Students</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-sm bg-indigo-400 inline-block"></span>
                <span>Teachers</span>
              </div>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="relative w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-48 select-none"
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="20" y1="30" x2={chartWidth - 20} y2="30" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="20" y1="70" x2={chartWidth - 20} y2="70" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="20" y1="110" x2={chartWidth - 20} y2="110" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="20" y1="150" x2={chartWidth - 20} y2="150" stroke="#e2e8f0" />

              {/* Area fill */}
              <path d={areaD} fill="url(#areaGradient)" />

              {/* Main Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points */}
              {points.map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={activeHourlyTooltip === idx ? 5 : 3.5}
                    className="cursor-pointer transition-all fill-white stroke-blue-600 stroke-2 hover:r-6"
                    onMouseEnter={() => setActiveHourlyTooltip(idx)}
                    onMouseLeave={() => setActiveHourlyTooltip(null)}
                  />
                  {/* Hour labels */}
                  <text
                    x={pt.x}
                    y={chartHeight - 4}
                    fontSize="10"
                    textAnchor="middle"
                    className="fill-slate-400 font-mono"
                  >
                    {pt.hour}
                  </text>
                </g>
              ))}
            </svg>

            {/* Hover Tooltip */}
            {activeHourlyTooltip !== null && (
              <div
                className="absolute z-10 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
                style={{
                  left: `${(points[activeHourlyTooltip].x / chartWidth) * 100}%`,
                  top: `${(points[activeHourlyTooltip].y / chartHeight) * 100}%`,
                }}
              >
                <div className="font-bold text-blue-300">
                  {points[activeHourlyTooltip].hour}
                </div>
                <div>Students: {points[activeHourlyTooltip].count}</div>
                <div>Teachers: {points[activeHourlyTooltip].teachers}</div>
              </div>
            )}
          </div>
          <div className="mt-2 text-center text-[11px] text-slate-400">
            Peak classroom arrival recorded between <span className="font-semibold text-slate-700">09:00 AM - 09:30 AM</span> (187 detections)
          </div>
        </div>

        {/* Student vs Teacher Attendance Comparison Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">
                Weekly Student vs Teacher
              </h3>
              <span className="text-[11px] text-blue-600 font-medium">This Week</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Daily comparative presence rate
            </p>

            <div className="space-y-3">
              {WEEKLY_ATTENDANCE_TREND.map((day) => (
                <div key={day.day} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{day.day}</span>
                    <span className="font-mono text-slate-500 tabular-nums text-[11px]">
                      {day.rate}% rate ({day.students}S · {day.teachers}T)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-blue-600 rounded-l-full"
                      style={{ width: `${(day.students / 250) * 85}%` }}
                      title={`Students: ${day.students}`}
                    />
                    <div
                      className="h-full bg-indigo-400"
                      style={{ width: `${(day.teachers / 18) * 15}%` }}
                      title={`Teachers: ${day.teachers}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Weekly Avg: <strong className="text-slate-800">83.5%</strong></span>
            <button
              onClick={() => onNavigate('reports')}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <span>View Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Classroom Occupancy Cards & Recent Attendance Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classroom Occupancy Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-blue-600" />
              <span>Classroom Occupancy</span>
            </h3>
            <button
              onClick={() => onNavigate('classrooms')}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Manage Rooms
            </button>
          </div>

          <div className="space-y-3.5">
            {CLASSROOMS.map((cr) => {
              const occupancyPct = Math.round((cr.currentOccupancy / cr.maxCapacity) * 100);
              const isFull = occupancyPct >= 90;
              return (
                <div key={cr.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {cr.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isFull
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {occupancyPct}%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mb-2 truncate">
                    {cr.currentSubject} ({cr.currentFaculty})
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isFull ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>{cr.currentOccupancy} inside now</span>
                    <span>Max {cr.maxCapacity}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Attendance Activity Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Recent Attendance Activity</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time face recognition events from entrance cameras
                </p>
              </div>
              <button
                onClick={() => onNavigate('records')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Full Log</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="pb-2.5">Person</th>
                    <th className="pb-2.5">Type</th>
                    <th className="pb-2.5">Classroom</th>
                    <th className="pb-2.5">Entry / Exit</th>
                    <th className="pb-2.5">Duration</th>
                    <th className="pb-2.5 text-right">Recognition Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceRecords.slice(0, 5).map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 font-medium text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={record.snapshotUrl}
                            alt={record.personName}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200"
                            onError={(e) => {
                              // Fallback container
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div>
                            <div className="font-semibold text-slate-900 leading-tight">
                              {record.personName}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              {record.personId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            record.personType === 'student'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {record.personType}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-600 truncate max-w-[140px]">
                        {record.classroom}
                      </td>
                      <td className="py-2.5 font-mono text-slate-700 tabular-nums">
                        <div>In: {record.entryTime}</div>
                        {record.exitTime && (
                          <div className="text-[11px] text-slate-400">Out: {record.exitTime}</div>
                        )}
                      </td>
                      <td className="py-2.5 font-mono text-slate-600">
                        {record.duration}
                      </td>
                      <td className="py-2.5 text-right">
                        {record.status === 'present' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Verified ({record.confidenceScore}%)
                          </span>
                        ) : record.status === 'late' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Late Entry ({record.confidenceScore}%)
                          </span>
                        ) : record.status === 'inside' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                            Inside ({record.confidenceScore}%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Warning
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Camera logs synced with PostgreSQL / Supabase storage</span>
            <button
              onClick={() => onNavigate('records')}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Export CSV / PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
