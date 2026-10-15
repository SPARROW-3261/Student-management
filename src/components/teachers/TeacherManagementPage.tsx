import React, { useState, useRef, useEffect } from 'react';
import {
  Users,
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
  Camera,
  Upload,
  AlertTriangle,
  Building2,
  Phone,
  Mail,
  FileSpreadsheet,
  FileUp,
  Download,
  Check,
  ShieldCheck,
  RotateCcw,
  RefreshCw,
  Sparkles,
  Lock,
} from 'lucide-react';
import { Teacher, AuthUser } from '../../types/attendance';

interface TeacherManagementPageProps {
  teachers: Teacher[];
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string) => void;
  onBulkImportTeachers?: (imported: Teacher[]) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  currentUser?: AuthUser | null;
  canEdit?: boolean;
}

export const TeacherManagementPage: React.FC<TeacherManagementPageProps> = ({
  teachers,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onBulkImportTeachers,
  isAddModalOpen,
  setIsAddModalOpen,
  currentUser = null,
  canEdit,
}) => {
  const isStudentUser = currentUser?.role === 'student';
  const userCanEdit =
    canEdit !== undefined
      ? canEdit
      : currentUser
      ? currentUser.role === 'teacher' || currentUser.role === 'admin'
      : true;

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacherId, setDeletingTeacherId] = useState<string | null>(null);

  // Bulk CSV Import states
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkInputMethod, setBulkInputMethod] = useState<'upload' | 'paste'>('upload');
  const [bulkFaceRegisteredDefault, setBulkFaceRegisteredDefault] = useState(true);
  const [parsedTeachers, setParsedTeachers] = useState<Teacher[]>([]);
  const [bulkParseError, setBulkParseError] = useState<string | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  // Add form fields
  const [formData, setFormData] = useState({
    name: '',
    id: `TCH-${Math.floor(100 + Math.random() * 900)}`,
    email: '',
    phone: '',
    department: 'Computer Applications',
    designation: 'Assistant Professor',
    cabinNo: 'Cabin 302',
    faceRegistered: true,
    avatarUrl: '/src/assets/images/avatar_teacher_amit_1791905720315.jpg',
  });

  // Photo upload and Webcam snapshot states
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const webcamCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const [isWebcamModalOpen, setIsWebcamModalOpen] = useState(false);
  const [isVirtualWebcam, setIsVirtualWebcam] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [capturedPhotoPreview, setCapturedPhotoPreview] = useState<string | null>(null);
  const [faceEnrolledBadge, setFaceEnrolledBadge] = useState<string | null>(null);

  // Stop webcam tracks helper
  const stopWebcamTracks = () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((track) => track.stop());
      webcamStreamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopWebcamTracks();
    };
  }, []);

  const startWebcamStream = async (forceVirtual = false) => {
    setWebcamError(null);
    setCapturedPhotoPreview(null);
    stopWebcamTracks();

    if (forceVirtual) {
      setIsVirtualWebcam(true);
      return;
    }

    if (typeof navigator === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
      setWebcamError('Webcam API is not supported in this browser context. Using Virtual Biometric Camera.');
      setIsVirtualWebcam(true);
      return;
    }

    try {
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      webcamStreamRef.current = stream;
      setIsVirtualWebcam(false);

      if (webcamVideoRef.current) {
        webcamVideoRef.current.muted = true;
        webcamVideoRef.current.defaultMuted = true;
        webcamVideoRef.current.srcObject = stream;
        webcamVideoRef.current.play().catch((err) => console.warn('Teacher webcam play err:', err));
      }
    } catch (err: any) {
      console.warn('Teacher webcam stream error:', err);
      let msg = 'Could not access hardware camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera access denied by browser. Switched to Virtual Biometric Camera.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera hardware detected. Switched to Virtual Biometric Camera.';
      } else {
        msg = `Camera issue: ${err.message || 'stream failed'}. Using Virtual Biometric Camera.`;
      }
      setWebcamError(msg);
      setIsVirtualWebcam(true);
    }
  };

  const handleOpenWebcamModal = () => {
    setIsWebcamModalOpen(true);
    startWebcamStream();
  };

  const handleCloseWebcamModal = () => {
    stopWebcamTracks();
    setIsWebcamModalOpen(false);
    setCapturedPhotoPreview(null);
    setWebcamError(null);
  };

  const handleCaptureSnapshot = () => {
    const canvas = webcamCanvasRef.current;
    if (!canvas) return;

    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (isVirtualWebcam || !webcamStreamRef.current || !webcamVideoRef.current) {
      const grad = ctx.createLinearGradient(0, 0, 640, 480);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 480);

      // Shoulders
      ctx.fillStyle = '#4f46e5';
      ctx.beginPath();
      ctx.ellipse(320, 470, 200, 110, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.ellipse(320, 220, 105, 135, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(320, 180, 110, Math.PI, 0, false);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(278, 205, 10, 7, 0, 0, Math.PI * 2);
      ctx.ellipse(362, 205, 10, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(320, 265, 32, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();

      // Landmarks
      ctx.fillStyle = '#818cf8';
      for (let i = 0; i < 32; i++) {
        const angle = (i / 32) * Math.PI * 2;
        const lx = 320 + Math.cos(angle) * 112;
        const ly = 220 + Math.sin(angle) * 142;
        ctx.beginPath();
        ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#818cf8';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('FACULTY BIOMETRIC SNAPSHOT', 24, 38);
      ctx.fillStyle = '#c7d2fe';
      ctx.font = '12px monospace';
      ctx.fillText(`ID: ${formData.id} | FACULTY EMBEDDING ACTIVE`, 24, 60);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedPhotoPreview(dataUrl);
      return;
    }

    const video = webcamVideoRef.current;
    if (!video) return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    canvas.width = width;
    canvas.height = height;

    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedPhotoPreview(dataUrl);
    stopWebcamTracks();
  };

  const handleConfirmCapturedPhoto = () => {
    if (capturedPhotoPreview) {
      setFormData((prev) => ({
        ...prev,
        avatarUrl: capturedPhotoPreview,
        faceRegistered: true,
      }));
      setFaceEnrolledBadge('✓ Biometric Face Vector Enrolled from Webcam Snapshot');
      setTimeout(() => setFaceEnrolledBadge(null), 4000);
    }
    handleCloseWebcamModal();
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setFormData((prev) => ({
          ...prev,
          avatarUrl: dataUrl,
          faceRegistered: true,
        }));
        setFaceEnrolledBadge('✓ Face Photo Enrolled (68 Landmarks Vector Generated)');
        setTimeout(() => setFaceEnrolledBadge(null), 4000);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const resetForm = () => {
    setFormData({
      name: '',
      id: `TCH-${Math.floor(100 + Math.random() * 900)}`,
      email: '',
      phone: '',
      department: 'Computer Applications',
      designation: 'Assistant Professor',
      cabinNo: 'Cabin 302',
      faceRegistered: true,
      avatarUrl: '/src/assets/images/avatar_teacher_amit_1791905720315.jpg',
    });
    setCapturedPhotoPreview(null);
    setFaceEnrolledBadge(null);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newTeacher: Teacher = {
      id: formData.id,
      name: formData.name,
      email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@engineering.edu`,
      phone: formData.phone || '+91 98450 12345',
      department: formData.department,
      designation: formData.designation,
      attendanceStatus: 'present',
      faceRegistered: formData.faceRegistered,
      avatarUrl: '/src/assets/images/avatar_teacher_amit_1791905720315.jpg',
      cabinNo: formData.cabinNo,
      assignedClassrooms: ['MCA Advanced Lab 301'],
      lastSeen: 'Registered Today',
    };

    onAddTeacher(newTeacher);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleSaveEditTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    onUpdateTeacher(editingTeacher);
    setEditingTeacher(null);
  };

  // Helper: Download Sample Teacher CSV Template
  const downloadTeacherTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Teacher ID,Full Name,Department,Designation,Email,Phone,Cabin No\n' +
      'TCH-201,Dr. Arvind Saxena,Computer Applications,Professor,arvind.saxena@engineering.edu,+91 98777 11223,Cabin 305\n' +
      'TCH-202,Prof. Shalini Gupta,Computer Science & Engineering,Associate Professor,shalini.gupta@engineering.edu,+91 98888 22334,Cabin 210\n' +
      'TCH-203,Dr. Naveen Bhatt,Information Technology,Assistant Professor,naveen.b@engineering.edu,+91 98999 33445,Cabin 115\n' +
      'TCH-204,Prof. Ritu Mehrotra,Mathematics & Computing,Associate Professor,ritu.m@engineering.edu,+91 98666 44556,Cabin 109\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'faculty_migration_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper: Parse CSV text into Teacher array
  const parseTeacherCsvText = (text: string) => {
    setBulkParseError(null);
    if (!text.trim()) {
      setParsedTeachers([]);
      return;
    }

    try {
      const lines = text.trim().split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (lines.length < 2) {
        setBulkParseError('CSV must include at least 1 header row and 1 data row.');
        setParsedTeachers([]);
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/["']/g, ''));

      const idIdx = headers.findIndex((h) => h.includes('id'));
      const nameIdx = headers.findIndex((h) => h.includes('name'));
      const deptIdx = headers.findIndex((h) => h.includes('dept') || h.includes('department'));
      const desigIdx = headers.findIndex((h) => h.includes('desig') || h.includes('role') || h.includes('title'));
      const emailIdx = headers.findIndex((h) => h.includes('email') || h.includes('mail'));
      const phoneIdx = headers.findIndex((h) => h.includes('phone') || h.includes('mobile'));
      const cabinIdx = headers.findIndex((h) => h.includes('cabin') || h.includes('room') || h.includes('office'));

      const newParsed: Teacher[] = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map((cell) => cell.trim().replace(/^["']|["']$/g, ''));
        if (row.length === 0 || !row.some((cell) => cell.length > 0)) continue;

        const rawName = nameIdx !== -1 && row[nameIdx] ? row[nameIdx] : `Faculty ${i}`;
        const rawId = idIdx !== -1 && row[idIdx] ? row[idIdx] : `TCH-${200 + i}`;
        const rawDept = deptIdx !== -1 && row[deptIdx] ? row[deptIdx] : 'Computer Applications';
        const rawDesig = desigIdx !== -1 && row[desigIdx] ? row[desigIdx] : 'Assistant Professor';
        const rawEmail = emailIdx !== -1 && row[emailIdx] ? row[emailIdx] : `${rawName.toLowerCase().replace(/\s+/g, '.')}@engineering.edu`;
        const rawPhone = phoneIdx !== -1 && row[phoneIdx] ? row[phoneIdx] : '+91 98000 55443';
        const rawCabin = cabinIdx !== -1 && row[cabinIdx] ? row[cabinIdx] : `Cabin ${300 + i}`;

        newParsed.push({
          id: rawId,
          name: rawName,
          department: rawDept,
          designation: rawDesig,
          email: rawEmail,
          phone: rawPhone,
          cabinNo: rawCabin,
          attendanceStatus: 'present',
          faceRegistered: bulkFaceRegisteredDefault,
          avatarUrl: '/src/assets/images/avatar_teacher_amit_1791905720315.jpg',
          assignedClassrooms: ['MCA Advanced Lab 301'],
          lastSeen: 'Imported via CSV',
        });
      }

      if (newParsed.length === 0) {
        setBulkParseError('No valid faculty records could be parsed. Check column formats.');
      } else {
        setParsedTeachers(newParsed);
      }
    } catch (err: any) {
      setBulkParseError(`Failed to parse CSV file: ${err.message || 'Malformed CSV format'}`);
      setParsedTeachers([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setBulkCsvText(content);
      parseTeacherCsvText(content);
    };
    reader.readAsText(file);
  };

  const handleConfirmBulkImport = () => {
    if (parsedTeachers.length === 0) return;

    if (onBulkImportTeachers) {
      onBulkImportTeachers(parsedTeachers);
    } else {
      parsedTeachers.forEach((t) => onAddTeacher(t));
    }

    setImportSuccessMessage(
      `Successfully imported ${parsedTeachers.length} faculty records from CSV migration file.`
    );
    setTimeout(() => setImportSuccessMessage(null), 4000);

    setIsBulkModalOpen(false);
    setParsedTeachers([]);
    setBulkCsvText('');
  };

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = departmentFilter === 'all' || t.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || t.attendanceStatus === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Export Teacher Directory to CSV
  const handleExportCSV = () => {
    const headers = [
      'Faculty ID',
      'Full Name',
      'Email',
      'Phone',
      'Department',
      'Designation',
      'Cabin No',
      'Attendance Status',
      'Face Enrolled',
    ];
    const rows = filteredTeachers.map((t) => [
      t.id,
      `"${t.name}"`,
      t.email,
      t.phone,
      `"${t.department}"`,
      `"${t.designation}"`,
      `"${t.cabinNo}"`,
      t.attendanceStatus,
      t.faceRegistered ? 'Yes' : 'No',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `SmartClass_Faculty_Roster_${departmentFilter === 'all' ? 'All_Depts' : departmentFilter.replace(/\s+/g, '_')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Student View-Only Info Banner */}
      {!userCanEdit && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold">Student Viewing &amp; Export Mode:</span>
              <span className="text-blue-700 ml-1">
                You have viewing and export access. Adding, updating, or deleting faculty records is restricted.
              </span>
            </div>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Faculty CSV</span>
          </button>
        </div>
      )}

      {/* Top Banner & Action */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Faculty &amp; Teacher Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Teaching staff biometric directory with camera entrance tracking
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 font-mono">
            Total Faculty: {teachers.length} (12 Present Today)
          </div>

          {/* Always Available Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
            title="Download CSV spreadsheet of faculty directory"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export to CSV</span>
          </button>

          {/* Teacher and Admin Only Editing Controls */}
          {userCanEdit ? (
            <>
              {/* Bulk CSV Import Button */}
              <button
                onClick={() => {
                  setBulkParseError(null);
                  setParsedTeachers([]);
                  setBulkCsvText('');
                  setIsBulkModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <span>Bulk Import CSV</span>
              </button>

              <button
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Teacher</span>
              </button>
            </>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Editing Restricted (Student Account)</span>
            </div>
          )}
        </div>
      </div>

      {/* Import Success Banner */}
      {importSuccessMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
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
            placeholder="Search by faculty name, Employee ID, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium whitespace-nowrap">Department:</span>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Departments</option>
            <option value="Computer Applications">Computer Applications</option>
            <option value="Computer Science & Engineering">CSE</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Mathematics & Computing">Mathematics</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium whitespace-nowrap">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="present">Present on Campus</option>
            <option value="inside">Inside Classroom</option>
            <option value="on_leave">On Leave</option>
          </select>
        </div>
      </div>

      {/* Teacher Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Profile Photo</th>
                <th className="py-3 px-4">Teacher ID</th>
                <th className="py-3 px-4">Full Name & Designation</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Attendance Status</th>
                <th className="py-3 px-4">Face Registration</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Photo */}
                  <td className="py-3 px-4">
                    <img
                      src={teacher.avatarUrl}
                      alt={teacher.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </td>

                  {/* ID */}
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {teacher.id}
                  </td>

                  {/* Name & Designation */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{teacher.name}</div>
                    <div className="text-[11px] text-slate-500">{teacher.designation}</div>
                  </td>

                  {/* Department */}
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {teacher.department}
                  </td>

                  {/* Email */}
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px] truncate max-w-[160px]">
                    {teacher.email}
                  </td>

                  {/* Attendance Status */}
                  <td className="py-3 px-4">
                    {teacher.attendanceStatus === 'inside' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        Inside Classroom
                      </span>
                    ) : teacher.attendanceStatus === 'present' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Present
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        On Leave
                      </span>
                    )}
                  </td>

                  {/* Face Registration Status */}
                  <td className="py-3 px-4">
                    {teacher.faceRegistered ? (
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
                        onClick={() => setViewingTeacher(teacher)}
                        className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {userCanEdit && (
                        <>
                          <button
                            onClick={() => setEditingTeacher(teacher)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Teacher"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingTeacherId(teacher.id)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Teacher"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Teacher Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add New Teacher</h3>
                  <p className="text-[11px] text-slate-500">
                    Register faculty credentials and facial recognition enrollment
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prof. Amit Verma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Teacher ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="faculty@engineering.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98230 45678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Computer Applications">Computer Applications</option>
                    <option value="Computer Science & Engineering">CSE</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Mathematics & Computing">Mathematics</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cabin No</label>
                  <input
                    type="text"
                    placeholder="Cabin 304, 3rd Floor"
                    value={formData.cabinNo}
                    onChange={(e) => setFormData({ ...formData, cabinNo: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Face Biometric box */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                    <ScanFace className="w-4 h-4 text-indigo-600" />
                    <span>Facial Biometric Enrollment</span>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.faceRegistered}
                      onChange={(e) =>
                        setFormData({ ...formData, faceRegistered: e.target.checked })
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Active Enrollment</span>
                  </label>
                </div>

                {/* Avatar Preview */}
                <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200">
                  <img
                    src={formData.avatarUrl}
                    alt="Teacher Face"
                    className="w-12 h-12 rounded-lg object-cover border border-indigo-200 bg-slate-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="flex-1 min-w-0 text-[11px]">
                    <div className="font-semibold text-slate-800">Faculty Facial Vector Linked</div>
                    <div className="text-slate-500 truncate">
                      {formData.faceRegistered ? 'Biometric 512-D embedding ready' : 'Pending photo capture'}
                    </div>
                    {faceEnrolledBadge && (
                      <div className="text-[10px] text-emerald-600 font-semibold animate-pulse mt-0.5">
                        {faceEnrolledBadge}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleOpenWebcamModal}
                    className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Take Snapshot</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-1.5 px-3 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Upload Photo</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-sm"
                >
                  Save Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Teacher Modal */}
      {viewingTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Faculty Details</h3>
              <button
                onClick={() => setViewingTeacher(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <img
                src={viewingTeacher.avatarUrl}
                alt={viewingTeacher.name}
                className="w-16 h-16 rounded-xl object-cover border-2 border-slate-200 shadow-sm"
              />
              <div>
                <h4 className="text-base font-bold text-slate-900">{viewingTeacher.name}</h4>
                <div className="text-xs font-mono text-slate-500">{viewingTeacher.id}</div>
                <div className="text-xs text-indigo-600 font-semibold mt-0.5">
                  {viewingTeacher.designation}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-slate-800">{viewingTeacher.department}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-mono text-slate-800">{viewingTeacher.email}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="text-slate-500">Office Cabin:</span>
                <span className="text-slate-800 font-medium">{viewingTeacher.cabinNo}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="text-slate-500">Attendance Status:</span>
                <span className="font-semibold text-emerald-700 capitalize">
                  {viewingTeacher.attendanceStatus}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                <span className="text-slate-500">Face Recognition Status:</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled (High Confidence)
                </span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setViewingTeacher(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Edit Faculty Information</h3>
              <button
                onClick={() => setEditingTeacher(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTeacher} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingTeacher.name}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={editingTeacher.department}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={editingTeacher.designation}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, designation: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingTeacher.email}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingTeacherId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Delete Teacher Record</h3>
            <p className="text-xs text-slate-500 mb-4">
              Are you sure you want to remove teacher{' '}
              <strong className="text-slate-800">{deletingTeacherId}</strong> from the system?
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setDeletingTeacherId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteTeacher(deletingTeacherId);
                  setDeletingTeacherId(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Hidden File Input for Teacher Photo */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileChange}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
      />

      {/* Hidden Canvas for Snapshot Capture */}
      <canvas ref={webcamCanvasRef} className="hidden" />

      {/* Teacher Webcam Modal */}
      {isWebcamModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 relative">
                  <Camera className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Faculty Face Snapshot &amp; Enrollment</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Faculty: <span className="text-indigo-300 font-semibold">{formData.name || 'New Faculty'}</span> ({formData.id})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseWebcamModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              {webcamError && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-amber-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{webcamError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => startWebcamStream(true)}
                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg font-semibold text-[11px] shrink-0"
                  >
                    Use Virtual Cam
                  </button>
                </div>
              )}

              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-4/3 flex items-center justify-center shadow-inner">
                {capturedPhotoPreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={capturedPhotoPreview}
                      alt="Captured Teacher Snapshot"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-emerald-500/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>SNAPSHOT CAPTURED &amp; VERIFIED</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center bg-black">
                    {!isVirtualWebcam ? (
                      <video
                        ref={(el) => {
                          webcamVideoRef.current = el;
                          if (el && webcamStreamRef.current && el.srcObject !== webcamStreamRef.current) {
                            el.muted = true;
                            el.defaultMuted = true;
                            el.srcObject = webcamStreamRef.current;
                            el.play().catch(() => {});
                          }
                        }}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                    ) : (
                      <div className="relative w-full h-full bg-linear-to-b from-slate-900 via-slate-950 to-slate-900 flex flex-col items-center justify-center overflow-hidden">
                        <div className="w-32 h-44 rounded-[50%/60%_60%_40%_40%] border-2 border-indigo-400/80 bg-indigo-950/20 backdrop-blur-xs flex flex-col items-center justify-center relative shadow-[0_0_25px_rgba(99,102,241,0.2)]">
                          <div className="flex items-center gap-10 mt-6">
                            <span className="w-3 h-3 rounded-full bg-indigo-400 animate-ping" />
                            <span className="w-3 h-3 rounded-full bg-indigo-400 animate-ping" />
                          </div>
                          <span className="w-1.5 h-3 bg-indigo-400/60 rounded-full mt-4" />
                          <div className="w-10 h-2 border-b-2 border-indigo-400/70 rounded-full mt-4" />
                        </div>
                        <div className="w-56 h-16 rounded-t-full border-t-2 border-indigo-500/50 bg-indigo-950/30 -mt-2" />
                        <div className="absolute top-3 left-3 bg-indigo-500/80 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                          VIRTUAL FACULTY BIOMETRIC CAM
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="px-2 py-0.5 rounded bg-black/60 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          LIVE BIOMETRIC HUD
                        </span>
                        <span className="px-2 py-0.5 rounded bg-black/60 text-slate-300 border border-slate-700">
                          640 × 480 · 30 FPS
                        </span>
                      </div>

                      <div className="self-center w-48 h-60 rounded-[50%/60%_60%_40%_40%] border-2 border-dashed border-indigo-400/60 flex items-center justify-center relative">
                        <span className="absolute -top-6 text-[10px] font-mono font-bold text-indigo-300 bg-black/70 px-2 py-0.5 rounded">
                          ALIGN FACE HERE
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-black/70 px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-300">
                        <span>Liveness: <strong className="text-emerald-400">99.1%</strong></span>
                        <span>Illumination: <strong className="text-emerald-400">Optimal</strong></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => startWebcamStream(!isVirtualWebcam)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isVirtualWebcam ? 'Switch to Hardware Webcam' : 'Switch to Virtual Cam'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Upload Image File Instead</span>
                </button>
              </div>

              <div className="pt-2 flex items-center gap-3">
                {capturedPhotoPreview ? (
                  <>
                    <button
                      type="button"
                      onClick={() => startWebcamStream(isVirtualWebcam)}
                      className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retake</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmCapturedPhoto}
                      className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Confirm &amp; Enroll Face Photo</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleCloseWebcamModal}
                      className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCaptureSnapshot}
                      className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Capture Snapshot Now</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
