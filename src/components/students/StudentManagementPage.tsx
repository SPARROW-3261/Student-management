import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  ScanFace,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  Camera,
  Download,
  AlertTriangle,
  FileSpreadsheet,
  Check,
  FileUp,
} from 'lucide-react';
import { Student } from '../../types/attendance';

interface StudentManagementPageProps {
  students: Student[];
  onAddStudent: (newStudent: Student) => void;
  onUpdateStudent: (updatedStudent: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onBulkImportStudents?: (imported: Student[]) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export const StudentManagementPage: React.FC<StudentManagementPageProps> = ({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onBulkImportStudents,
  isAddModalOpen,
  setIsAddModalOpen,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [faceFilter, setFaceFilter] = useState('all');

  // Modal states
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  // Bulk CSV Import states
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkInputMethod, setBulkInputMethod] = useState<'upload' | 'paste'>('upload');
  const [bulkFaceRegisteredDefault, setBulkFaceRegisteredDefault] = useState(true);
  const [parsedStudents, setParsedStudents] = useState<Student[]>([]);
  const [bulkParseError, setBulkParseError] = useState<string | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  // Add form fields
  const [formData, setFormData] = useState({
    name: '',
    id: `STU-2024-${Math.floor(100 + Math.random() * 900)}`,
    email: '',
    phone: '',
    course: 'MCA',
    section: 'MCA-II A',
    rollNo: '24MCA',
    faceRegistered: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      id: `STU-2024-${Math.floor(100 + Math.random() * 900)}`,
      email: '',
      phone: '',
      course: 'MCA',
      section: 'MCA-II A',
      rollNo: '24MCA',
      faceRegistered: true,
    });
  };

  const handleSaveNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newStudent: Student = {
      id: formData.id,
      name: formData.name,
      email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@student.edu`,
      phone: formData.phone || '+91 98000 12345',
      course: formData.course,
      section: formData.section,
      rollNo: formData.rollNo || '24MCA099',
      attendancePercentage: 100,
      faceRegistered: formData.faceRegistered,
      avatarUrl: '/src/assets/images/avatar_student_rahul_1791905718978.jpg',
      totalClasses: 1,
      attendedClasses: 1,
      lastSeen: 'Registered Today',
      statusToday: 'present',
    };

    onAddStudent(newStudent);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleSaveEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    onUpdateStudent(editingStudent);
    setEditingStudent(null);
  };

  // Helper: Download Sample Student CSV Template
  const downloadStudentTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Student ID,Full Name,Roll No,Course,Section,Email,Phone,Attendance Percentage\n' +
      'STU-2024-101,Kunal Deshmukh,24MCA101,MCA,MCA-II A,kunal.d@student.edu,+91 98111 22334,88.5\n' +
      'STU-2024-102,Tanvi Joshi,24MCA102,MCA,MCA-II B,tanvi.j@student.edu,+91 98222 33445,92.0\n' +
      'STU-2024-103,Manish Chawla,24CSE103,B.Tech CSE,CSE-VI A,manish.c@student.edu,+91 98333 44556,84.0\n' +
      'STU-2024-104,Divya Menon,24BCA104,BCA,BCA-IV A,divya.m@student.edu,+91 98444 55667,78.5\n' +
      'STU-2024-105,Aditya Saxena,24MTECH105,M.Tech,MTech-AI I,aditya.s@student.edu,+91 98555 66778,95.0\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'students_migration_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper: Parse CSV text into Student array
  const parseStudentCsvText = (text: string) => {
    setBulkParseError(null);
    if (!text.trim()) {
      setParsedStudents([]);
      return;
    }

    try {
      const lines = text.trim().split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (lines.length < 2) {
        setBulkParseError('CSV must include at least 1 header row and 1 data row.');
        setParsedStudents([]);
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/["']/g, ''));
      
      const idIdx = headers.findIndex((h) => h.includes('id'));
      const nameIdx = headers.findIndex((h) => h.includes('name'));
      const rollIdx = headers.findIndex((h) => h.includes('roll'));
      const courseIdx = headers.findIndex((h) => h.includes('course'));
      const secIdx = headers.findIndex((h) => h.includes('sec') || h.includes('class'));
      const emailIdx = headers.findIndex((h) => h.includes('email') || h.includes('mail'));
      const phoneIdx = headers.findIndex((h) => h.includes('phone') || h.includes('mobile'));
      const attIdx = headers.findIndex((h) => h.includes('attend') || h.includes('percent') || h.includes('rate'));

      const newParsed: Student[] = [];

      for (let i = 1; i < lines.length; i++) {
        // Handle basic comma separation (respecting simple quotes)
        const row = lines[i].split(',').map((cell) => cell.trim().replace(/^["']|["']$/g, ''));
        if (row.length === 0 || !row.some((cell) => cell.length > 0)) continue;

        const rawName = nameIdx !== -1 && row[nameIdx] ? row[nameIdx] : `Student ${i}`;
        const rawId = idIdx !== -1 && row[idIdx] ? row[idIdx] : `STU-2024-${100 + i}`;
        const rawRoll = rollIdx !== -1 && row[rollIdx] ? row[rollIdx] : `24MCA${100 + i}`;
        const rawCourse = courseIdx !== -1 && row[courseIdx] ? row[courseIdx] : 'MCA';
        const rawSec = secIdx !== -1 && row[secIdx] ? row[secIdx] : 'MCA-II A';
        const rawEmail = emailIdx !== -1 && row[emailIdx] ? row[emailIdx] : `${rawName.toLowerCase().replace(/\s+/g, '.')}@student.edu`;
        const rawPhone = phoneIdx !== -1 && row[phoneIdx] ? row[phoneIdx] : '+91 98000 12345';
        const rawAtt = attIdx !== -1 && !isNaN(Number(row[attIdx])) ? Number(row[attIdx]) : 85.0;

        newParsed.push({
          id: rawId,
          name: rawName,
          rollNo: rawRoll,
          course: rawCourse,
          section: rawSec,
          email: rawEmail,
          phone: rawPhone,
          attendancePercentage: Math.min(100, Math.max(0, rawAtt)),
          faceRegistered: bulkFaceRegisteredDefault,
          avatarUrl: '/src/assets/images/avatar_student_rahul_1791905718978.jpg',
          totalClasses: 48,
          attendedClasses: Math.round((rawAtt / 100) * 48),
          lastSeen: 'Imported via CSV',
          statusToday: 'present',
        });
      }

      if (newParsed.length === 0) {
        setBulkParseError('No valid student records could be parsed. Check column formats.');
      } else {
        setParsedStudents(newParsed);
      }
    } catch (err: any) {
      setBulkParseError(`Failed to parse CSV file: ${err.message || 'Malformed CSV format'}`);
      setParsedStudents([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setBulkCsvText(content);
      parseStudentCsvText(content);
    };
    reader.readAsText(file);
  };

  const handleConfirmBulkImport = () => {
    if (parsedStudents.length === 0) return;

    if (onBulkImportStudents) {
      onBulkImportStudents(parsedStudents);
    } else {
      parsedStudents.forEach((s) => onAddStudent(s));
    }

    setImportSuccessMessage(
      `Successfully imported ${parsedStudents.length} student records from CSV migration file.`
    );
    setTimeout(() => setImportSuccessMessage(null), 4000);

    setIsBulkModalOpen(false);
    setParsedStudents([]);
    setBulkCsvText('');
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCourse = courseFilter === 'all' || s.course === courseFilter;

    const matchesFace =
      faceFilter === 'all' ||
      (faceFilter === 'registered' && s.faceRegistered) ||
      (faceFilter === 'pending' && !s.faceRegistered);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'low' && s.attendancePercentage < 75) ||
      (statusFilter === 'good' && s.attendancePercentage >= 75);

    return matchesSearch && matchesCourse && matchesFace && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Action Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <span>Student Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered students database with facial recognition biometric encodings
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Bulk CSV Import Button */}
          <button
            onClick={() => {
              setBulkParseError(null);
              setParsedStudents([]);
              setBulkCsvText('');
              setIsBulkModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Bulk Import CSV</span>
          </button>

          <button
            onClick={() => {
              resetForm();
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Import Success Banner */}
      {importSuccessMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{importSuccessMessage}</span>
          </div>
          <button onClick={() => setImportSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            &times;
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, Roll No, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Course Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium whitespace-nowrap">Course:</span>
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Courses</option>
            <option value="MCA">MCA</option>
            <option value="B.Tech CSE">B.Tech CSE</option>
            <option value="BCA">BCA</option>
            <option value="M.Tech">M.Tech</option>
          </select>
        </div>

        {/* Face Status Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium whitespace-nowrap">Face Reg:</span>
          <select
            value={faceFilter}
            onChange={(e) => setFaceFilter(e.target.value)}
            className="px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="registered">Registered</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Attendance Status Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium whitespace-nowrap">Attendance:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Turnout</option>
            <option value="good">&ge; 75% Standard</option>
            <option value="low">&lt; 75% At-Risk</option>
          </select>
        </div>
      </div>

      {/* Student Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Profile Photo</th>
                <th className="py-3 px-4">Student ID / Roll</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Course</th>
                <th className="py-3 px-4">Class / Section</th>
                <th className="py-3 px-4">Attendance Rate</th>
                <th className="py-3 px-4">Face Registration</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const isLowAttendance = student.attendancePercentage < 75;
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* Profile Photo */}
                      <td className="py-3 px-4">
                        <img
                          src={student.avatarUrl}
                          alt={student.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </td>

                      {/* Student ID */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">
                          {student.id}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          Roll: {student.rollNo}
                        </div>
                      </td>

                      {/* Full Name & Email */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{student.name}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                          {student.email}
                        </div>
                      </td>

                      {/* Course */}
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {student.course}
                      </td>

                      {/* Class/Section */}
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {student.section}
                      </td>

                      {/* Attendance % */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold tabular-nums text-xs ${
                              isLowAttendance ? 'text-rose-600' : 'text-emerald-700'
                            }`}
                          >
                            {student.attendancePercentage}%
                          </span>
                          {isLowAttendance && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 border border-rose-200">
                              Low
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {student.attendedClasses}/{student.totalClasses} classes
                        </div>
                      </td>

                      {/* Face Registration Status */}
                      <td className="py-3 px-4">
                        {student.faceRegistered ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Registered</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingStudent(student)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingStudent(student)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Student"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingStudentId(student.id)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No students match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            Showing <strong className="text-slate-800">{filteredStudents.length}</strong> of{' '}
            <strong className="text-slate-800">{students.length}</strong> registered students
          </div>
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span>Registry Database: Sync Active (MySQL/Supabase)</span>
          </div>
        </div>
      </div>

      {/* Bulk CSV Import Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col p-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Bulk Import Students from CSV
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Migrate student batches directly from Excel, MySQL, or university ERP rosters
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              {/* Template Download Banner */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Need the standard CSV structure?</div>
                  <div className="text-[11px] text-slate-500">
                    Includes headers: Student ID, Full Name, Roll No, Course, Section, Email, Phone
                  </div>
                </div>
                <button
                  type="button"
                  onClick={downloadStudentTemplate}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-xs transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Download Sample Template</span>
                </button>
              </div>

              {/* Input Method Toggle */}
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <button
                  type="button"
                  onClick={() => setBulkInputMethod('upload')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                    bulkInputMethod === 'upload'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileUp className="w-3.5 h-3.5" />
                  <span>Upload .CSV File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBulkInputMethod('paste')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                    bulkInputMethod === 'paste'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Paste CSV Text</span>
                </button>
              </div>

              {/* Upload Input Area */}
              {bulkInputMethod === 'upload' ? (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors bg-slate-50/50">
                  <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <div className="font-bold text-slate-800 mb-0.5">
                    Click to browse or drop your CSV file here
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Supports comma-delimited (.csv) files exported from Excel or SQL
                  </p>
                  <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose CSV File</span>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Paste Raw CSV Data (Header row + Comma separated records)
                  </label>
                  <textarea
                    rows={6}
                    value={bulkCsvText}
                    onChange={(e) => {
                      setBulkCsvText(e.target.value);
                      parseStudentCsvText(e.target.value);
                    }}
                    placeholder={`Student ID,Full Name,Roll No,Course,Section,Email,Phone,Attendance Percentage\nSTU-2024-101,Kunal Deshmukh,24MCA101,MCA,MCA-II A,kunal.d@student.edu,+91 98111 22334,88.5`}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-blue-500 bg-slate-50"
                  />
                </div>
              )}

              {/* Face Biometric Status Option */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">
                    Default Facial Biometric Registration Status
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Auto-mark imported students as verified or flag for biometric capture
                  </div>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkFaceRegisteredDefault}
                    onChange={(e) => {
                      setBulkFaceRegisteredDefault(e.target.checked);
                      if (parsedStudents.length > 0) {
                        setParsedStudents((prev) =>
                          prev.map((s) => ({ ...s, faceRegistered: e.target.checked }))
                        );
                      }
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Mark Face Enrolled</span>
                </label>
              </div>

              {/* Parse Error Alert */}
              {bulkParseError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{bulkParseError}</span>
                </div>
              )}

              {/* Parsed Preview Table */}
              {parsedStudents.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Ready to Migrate ({parsedStudents.length} Students Detected)</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Validation Passed
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[9px] sticky top-0">
                        <tr>
                          <th className="p-2">ID</th>
                          <th className="p-2">Name</th>
                          <th className="p-2">Roll No</th>
                          <th className="p-2">Course &amp; Sec</th>
                          <th className="p-2">Email</th>
                          <th className="p-2">Turnout %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {parsedStudents.map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-mono font-bold text-blue-700">{s.id}</td>
                            <td className="p-2 font-semibold text-slate-900">{s.name}</td>
                            <td className="p-2 font-mono text-slate-600">{s.rollNo}</td>
                            <td className="p-2">{s.course} · {s.section}</td>
                            <td className="p-2 font-mono text-slate-500 truncate max-w-[140px]">{s.email}</td>
                            <td className="p-2 font-mono font-bold text-emerald-700">{s.attendancePercentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] font-mono text-slate-500">
                {parsedStudents.length > 0
                  ? `${parsedStudents.length} records will be added to student directory`
                  : 'Select or paste a CSV file to preview'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={parsedStudents.length === 0}
                  onClick={handleConfirmBulkImport}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Import {parsedStudents.length > 0 ? `${parsedStudents.length} Students` : 'Records'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add New Student</h3>
                  <p className="text-[11px] text-slate-500">
                    Register student details and face recognition biometric profile
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Kumar"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="student@institution.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Course
                  </label>
                  <select
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="MCA">MCA (Master of Computer App.)</option>
                    <option value="B.Tech CSE">B.Tech CSE</option>
                    <option value="BCA">BCA</option>
                    <option value="M.Tech">M.Tech AI & Data Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Class / Section
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MCA-II A"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Face Registration Box */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ScanFace className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Face Biometric Registration
                    </span>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.faceRegistered}
                      onChange={(e) =>
                        setFormData({ ...formData, faceRegistered: e.target.checked })
                      }
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Capture Face Vector</span>
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">
                  Enrolls 512-dimensional facial embedding vector for entrance camera recognition.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-700"
                  >
                    <Camera className="w-3.5 h-3.5 text-slate-500" />
                    <span>Take WebCam Snapshot</span>
                  </button>
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-700"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Upload Image File</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Student Profile Details</h3>
              <button
                onClick={() => setViewingStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <img
                src={viewingStudent.avatarUrl}
                alt={viewingStudent.name}
                className="w-16 h-16 rounded-xl object-cover border-2 border-slate-200 shadow-sm"
              />
              <div>
                <h4 className="text-base font-bold text-slate-900">{viewingStudent.name}</h4>
                <div className="text-xs font-mono text-slate-500">{viewingStudent.id}</div>
                <div className="text-xs text-blue-600 font-semibold mt-0.5">
                  {viewingStudent.course} · {viewingStudent.section}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="text-slate-500">Roll Number:</span>
                <span className="font-mono font-semibold text-slate-800">{viewingStudent.rollNo}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="text-slate-500">Attendance Rate:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {viewingStudent.attendancePercentage}% ({viewingStudent.attendedClasses}/{viewingStudent.totalClasses} classes)
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="text-slate-800">{viewingStudent.email}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-mono text-slate-800">{viewingStudent.phone}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="text-slate-500">Face Recognition Status:</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled (512-D vector active)
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="text-slate-500">Last Seen:</span>
                <span className="text-slate-800 font-medium">{viewingStudent.lastSeen || 'Today'}</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setViewingStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Edit Student Record</h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStudent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course</label>
                <input
                  type="text"
                  value={editingStudent.course}
                  onChange={(e) => setEditingStudent({ ...editingStudent, course: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Class / Section</label>
                <input
                  type="text"
                  value={editingStudent.section}
                  onChange={(e) => setEditingStudent({ ...editingStudent, section: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingStudent.email}
                  onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingStudentId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Confirm Student Deletion</h3>
            <p className="text-xs text-slate-500 mb-4">
              Are you sure you want to remove student{' '}
              <strong className="text-slate-800">{deletingStudentId}</strong>? This will remove their facial embeddings and attendance records.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setDeletingStudentId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteStudent(deletingStudentId);
                  setDeletingStudentId(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm"
              >
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
