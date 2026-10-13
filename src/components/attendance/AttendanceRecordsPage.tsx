import React, { useState } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  Download,
  FileText,
  Eye,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRightCircle,
  ArrowLeftCircle,
  X,
  Printer,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { AttendanceRecord } from '../../types/attendance';
import { CLASSROOMS } from '../../data/mockData';

interface AttendanceRecordsPageProps {
  records: AttendanceRecord[];
}

export const AttendanceRecordsPage: React.FC<AttendanceRecordsPageProps> = ({ records }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'student' | 'teacher'>('all');
  const [classroomFilter, setClassroomFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('2026-10-13');

  // Modal for details & printable preview
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.personId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || r.personType === typeFilter;
    const matchesClassroom =
      classroomFilter === 'all' || r.classroomId === classroomFilter || r.classroom === classroomFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesDate = !dateFilter || r.date === dateFilter;

    return matchesSearch && matchesType && matchesClassroom && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Real CSV Export functionality
  const handleExportCSV = () => {
    const headers = [
      'Record ID',
      'Person Name',
      'Person ID',
      'Person Type',
      'Classroom',
      'Date',
      'Entry Time',
      'Exit Time',
      'Duration',
      'Status',
      'Confidence %',
      'Camera Source',
    ];

    const rows = filteredRecords.map((r) => [
      r.id,
      `"${r.personName}"`,
      r.personId,
      r.personType,
      `"${r.classroom}"`,
      r.date,
      r.entryTime,
      r.exitTime || 'Inside',
      r.duration,
      r.status,
      `${r.confidenceScore}%`,
      `"${r.cameraSource}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `SmartClass_Attendance_Report_${dateFilter || 'Export'}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Export Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            <span>Attendance Records & Camera Logs</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified biometric entry and exit logs with exact duration tracking
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export to CSV</span>
          </button>
          <button
            onClick={() => setPdfModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Generate PDF Report</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student or teacher name, or ID (e.g. Rahul, TCH-108)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 text-xs">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Person Type Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All (Students & Teachers)</option>
            <option value="student">Students Only</option>
            <option value="teacher">Teachers Only</option>
          </select>
        </div>

        {/* Classroom Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Classroom:</span>
          <select
            value={classroomFilter}
            onChange={(e) => setClassroomFilter(e.target.value)}
            className="px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Classrooms</option>
            {CLASSROOMS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="present">Present (Completed)</option>
            <option value="inside">Inside Classroom</option>
            <option value="late">Late Entry</option>
          </select>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Person Name</th>
                <th className="py-3 px-4">Person ID</th>
                <th className="py-3 px-4">Person Type</th>
                <th className="py-3 px-4">Classroom</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Entry Time</th>
                <th className="py-3 px-4">Exit Time</th>
                <th className="py-3 px-4">Total Duration</th>
                <th className="py-3 px-4">Attendance Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Person Name & Snapshot */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={record.snapshotUrl}
                          alt={record.personName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="font-bold text-slate-900">{record.personName}</div>
                      </div>
                    </td>

                    {/* Person ID */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {record.personId}
                    </td>

                    {/* Person Type */}
                    <td className="py-3 px-4">
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

                    {/* Classroom */}
                    <td className="py-3 px-4 text-slate-700 font-medium truncate max-w-[150px]">
                      {record.classroom}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 font-mono text-slate-600 tabular-nums">
                      {record.date}
                    </td>

                    {/* Entry Time */}
                    <td className="py-3 px-4 font-mono text-emerald-700 font-bold tabular-nums">
                      {record.entryTime}
                    </td>

                    {/* Exit Time */}
                    <td className="py-3 px-4 font-mono text-slate-600 tabular-nums">
                      {record.exitTime || (
                        <span className="text-blue-600 font-semibold">Still Inside</span>
                      )}
                    </td>

                    {/* Total Duration */}
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {record.duration}
                    </td>

                    {/* Attendance Status */}
                    <td className="py-3 px-4">
                      {record.status === 'present' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Present ({record.confidenceScore}%)</span>
                        </span>
                      ) : record.status === 'late' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Late Entry</span>
                        </span>
                      ) : record.status === 'inside' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                          <span>In Classroom</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <span>Absent</span>
                        </span>
                      )}
                    </td>

                    {/* View Details */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedRecord(record)}
                        className="px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No attendance records match the selected date or search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            Showing <strong className="text-slate-800">{paginatedRecords.length}</strong> of{' '}
            <strong className="text-slate-800">{filteredRecords.length}</strong> attendance records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-[11px] text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                  {selectedRecord.id}
                </span>
                <h3 className="text-sm font-bold text-slate-900">Attendance Verification Log</h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <img
                src={selectedRecord.snapshotUrl}
                alt={selectedRecord.personName}
                className="w-16 h-16 rounded-xl object-cover border-2 border-slate-200 shadow-sm"
              />
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {selectedRecord.personName}
                </h4>
                <div className="text-xs font-mono text-slate-500">
                  ID: {selectedRecord.personId} ({selectedRecord.personType.toUpperCase()})
                </div>
                <div className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified with {selectedRecord.confidenceScore}% Facial Similarity</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="text-slate-500">Classroom:</span>
                <span className="font-semibold text-slate-800">{selectedRecord.classroom}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="text-slate-500">Session Date:</span>
                <span className="font-mono font-medium text-slate-800">{selectedRecord.date}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="text-slate-500">Entrance Timestamp:</span>
                <span className="font-mono font-bold text-emerald-700">{selectedRecord.entryTime}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="text-slate-500">Exit Timestamp:</span>
                <span className="font-mono font-bold text-blue-700">
                  {selectedRecord.exitTime || 'Currently Inside Classroom'}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="text-slate-500">Total Duration Logged:</span>
                <span className="font-mono font-bold text-slate-900">{selectedRecord.duration}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="text-slate-500">Camera Source:</span>
                <span className="font-mono text-slate-700">{selectedRecord.cameraSource}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="text-slate-500">Validation Mode:</span>
                <span className="font-mono text-slate-700 capitalize">
                  {selectedRecord.verifiedBy.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Report Preview Modal */}
      {pdfModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl p-6 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Classroom Attendance Report (Official Printable Document)
                </h3>
              </div>
              <button
                onClick={() => setPdfModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Sheet */}
            <div className="flex-1 overflow-y-auto my-4 p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4 text-xs font-sans">
              <div className="text-center pb-3 border-b border-slate-200">
                <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                  Smart Classroom Attendance Management System
                </h2>
                <div className="text-slate-600 text-xs mt-0.5">
                  Automated Face Recognition Entrance Log & Analytics Report
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  Generated On: {new Date().toLocaleString()} · Date: {dateFilter || 'All Dates'}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-[11px]">
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-slate-400">Total Records:</span>{' '}
                  <strong className="text-slate-800">{filteredRecords.length}</strong>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-slate-400">Classroom:</span>{' '}
                  <strong className="text-slate-800">
                    {classroomFilter === 'all' ? 'All Rooms' : classroomFilter}
                  </strong>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <span className="text-slate-400">Verification:</span>{' '}
                  <strong className="text-emerald-700">FaceNet-512 Biometrics</strong>
                </div>
              </div>

              <table className="w-full text-left text-[11px] border border-slate-200 bg-white">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[9px]">
                  <tr>
                    <th className="p-2">Name</th>
                    <th className="p-2">ID</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">In Time</th>
                    <th className="p-2">Out Time</th>
                    <th className="p-2">Duration</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.slice(0, 10).map((r) => (
                    <tr key={r.id}>
                      <td className="p-2 font-medium text-slate-900">{r.personName}</td>
                      <td className="p-2 font-mono text-slate-600">{r.personId}</td>
                      <td className="p-2 uppercase text-[10px]">{r.personType}</td>
                      <td className="p-2 font-mono text-emerald-700">{r.entryTime}</td>
                      <td className="p-2 font-mono text-slate-600">{r.exitTime || 'Inside'}</td>
                      <td className="p-2 font-mono">{r.duration}</td>
                      <td className="p-2 font-semibold text-slate-800">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 flex justify-between font-mono">
                <span>System: FacePresence AI v2.4</span>
                <span>Signature: Department Administrator / Head of Department</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Ready for print or submission in project presentation
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPdfModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
