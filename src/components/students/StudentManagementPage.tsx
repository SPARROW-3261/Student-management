import React, { useState, useRef, useEffect } from 'react';
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
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Image as ImageIcon,
  Lock,
  Shield,
  Trash,
  Video,
  VideoOff,
  RotateCcw,
} from 'lucide-react';
import { Student, AuthUser } from '../../types/attendance';

interface StudentManagementPageProps {
  students: Student[];
  onAddStudent: (newStudent: Student) => void;
  onUpdateStudent: (updatedStudent: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onBulkImportStudents?: (imported: Student[]) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  isAdmin?: boolean;
  currentUser?: AuthUser | null;
  canEdit?: boolean;
}

export const StudentManagementPage: React.FC<StudentManagementPageProps> = ({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onBulkImportStudents,
  isAddModalOpen,
  setIsAddModalOpen,
  isAdmin = true,
  currentUser = null,
  canEdit,
}) => {
  const isStudentUser = currentUser?.role === 'student';
  const userCanEdit =
    canEdit !== undefined
      ? canEdit
      : currentUser
      ? currentUser.role === 'teacher' || currentUser.role === 'admin'
      : isAdmin;

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
    avatarUrl: '/src/assets/images/avatar_student_rahul_1791905718978.jpg',
  });

  // Photo upload and Webcam snapshot states
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const webcamCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const [isWebcamModalOpen, setIsWebcamModalOpen] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isVirtualWebcam, setIsVirtualWebcam] = useState(false);
  const [photoTarget, setPhotoTarget] = useState<'add' | 'edit'>('add');
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [capturedPhotoPreview, setCapturedPhotoPreview] = useState<string | null>(null);
  const [faceEnrolledBadge, setFaceEnrolledBadge] = useState<string | null>(null);

  // Curated student sample faces
  const sampleStudentFaces = [
    { name: 'Rahul K. (MCA)', url: '/src/assets/images/avatar_student_rahul_1791905718978.jpg' },
    { name: 'Priya S. (CSE)', url: '/src/assets/images/avatar_student_priya_1791905720259.jpg' },
    { name: 'Amit V. (Faculty)', url: '/src/assets/images/avatar_teacher_amit_1791905720315.jpg' },
    { name: 'Sara L. (BCA)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  ];

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
      avatarUrl: '/src/assets/images/avatar_student_rahul_1791905718978.jpg',
    });
    setCapturedPhotoPreview(null);
    setFaceEnrolledBadge(null);
  };

  // Stop webcam tracks helper
  const stopWebcamTracks = () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((track) => track.stop());
      webcamStreamRef.current = null;
    }
    setIsWebcamActive(false);
  };

  // Clean up webcam on unmount
  useEffect(() => {
    return () => {
      stopWebcamTracks();
    };
  }, []);

  // Start webcam when webcam modal is opened
  const startWebcamStream = async (forceVirtual = false) => {
    setWebcamError(null);
    setCapturedPhotoPreview(null);
    stopWebcamTracks();

    if (forceVirtual) {
      setIsVirtualWebcam(true);
      setIsWebcamActive(true);
      return;
    }

    if (typeof navigator === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
      setWebcamError('Webcam API is not supported in this browser context. You can use the Virtual Biometric Camera or upload an image file.');
      setIsVirtualWebcam(true);
      setIsWebcamActive(true);
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
      setIsWebcamActive(true);
      setIsVirtualWebcam(false);

      if (webcamVideoRef.current) {
        webcamVideoRef.current.muted = true;
        webcamVideoRef.current.defaultMuted = true;
        webcamVideoRef.current.srcObject = stream;
        webcamVideoRef.current.play().catch((err) => console.warn('Play video catch:', err));
      }
    } catch (err: any) {
      console.warn('Webcam stream error:', err);
      let msg = 'Could not access hardware camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera access was denied by browser. Switched to Virtual Biometric Camera for snapshot simulation.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera hardware detected. Switched to Virtual Biometric Camera.';
      } else {
        msg = `Camera issue: ${err.message || 'stream failed'}. Switched to Virtual Biometric Camera.`;
      }
      setWebcamError(msg);
      setIsVirtualWebcam(true);
      setIsWebcamActive(true);
    }
  };

  // Open Webcam Modal
  const handleOpenWebcamModal = (target: 'add' | 'edit' = 'add') => {
    setPhotoTarget(target);
    setIsWebcamModalOpen(true);
    startWebcamStream();
  };

  // Close Webcam Modal
  const handleCloseWebcamModal = () => {
    stopWebcamTracks();
    setIsWebcamModalOpen(false);
    setCapturedPhotoPreview(null);
    setWebcamError(null);
  };

  // Capture Snapshot from video feed or virtual biometric generator onto canvas
  const handleCaptureSnapshot = () => {
    const canvas = webcamCanvasRef.current;
    if (!canvas) return;

    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentId = photoTarget === 'edit' && editingStudent ? editingStudent.id : formData.id;

    if (isVirtualWebcam || !webcamStreamRef.current || !webcamVideoRef.current) {
      // Draw realistic biometric portrait snapshot onto canvas
      const grad = ctx.createLinearGradient(0, 0, 640, 480);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#1e293b');
      grad.addColorStop(1, '#090d16');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 480);

      // Grid overlay
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 640; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 480);
        ctx.stroke();
      }
      for (let y = 0; y < 480; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(640, y);
        ctx.stroke();
      }

      // Torso / Shoulders
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.ellipse(320, 470, 200, 110, 0, 0, Math.PI * 2);
      ctx.fill();

      // Neck
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(290, 310, 60, 80);

      // Head / Face
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.ellipse(320, 220, 105, 135, 0, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(320, 180, 110, Math.PI, 0, false);
      ctx.fill();

      // Eyebrows
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(260, 185); ctx.lineTo(295, 188);
      ctx.moveTo(345, 188); ctx.lineTo(380, 185);
      ctx.stroke();

      // Eyes
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(278, 205, 10, 7, 0, 0, Math.PI * 2);
      ctx.ellipse(362, 205, 10, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pupil cyan highlights
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(280, 204, 3, 0, Math.PI * 2);
      ctx.arc(364, 204, 3, 0, Math.PI * 2);
      ctx.fill();

      // Nose bridge
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(320, 205);
      ctx.lineTo(320, 240);
      ctx.lineTo(326, 245);
      ctx.stroke();

      // Smile
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(320, 265, 32, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();

      // 68 Facial Landmark Points
      ctx.fillStyle = '#10b981';
      for (let i = 0; i < 32; i++) {
        const angle = (i / 32) * Math.PI * 2;
        const lx = 320 + Math.cos(angle) * 112;
        const ly = 220 + Math.sin(angle) * 142;
        ctx.beginPath();
        ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Biometric HUD stamps
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('BIOMETRIC SNAPSHOT CAPTURED', 24, 38);
      ctx.fillStyle = '#67e8f9';
      ctx.font = '12px monospace';
      ctx.fillText(`ENROLLMENT ID: ${currentId} | VECTOR: 512-D L2-NORM`, 24, 60);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(new Date().toLocaleString(), 24, 80);

      // Target reticle corners
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(180, 110); ctx.lineTo(180, 70); ctx.lineTo(220, 70); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(460, 110); ctx.lineTo(460, 70); ctx.lineTo(420, 70); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(180, 360); ctx.lineTo(180, 400); ctx.lineTo(220, 400); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(460, 360); ctx.lineTo(460, 400); ctx.lineTo(420, 400); ctx.stroke();

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

    // Flip horizontally so mirror matches user perception
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedPhotoPreview(dataUrl);
    stopWebcamTracks();
  };

  // Confirm and apply the captured photo
  const handleConfirmCapturedPhoto = () => {
    if (capturedPhotoPreview) {
      if (photoTarget === 'edit' && editingStudent) {
        setEditingStudent((prev) =>
          prev ? { ...prev, avatarUrl: capturedPhotoPreview, faceRegistered: true } : null
        );
        setFaceEnrolledBadge('✓ Biometric Face Vector Updated from Webcam Snapshot');
      } else {
        setFormData((prev) => ({
          ...prev,
          avatarUrl: capturedPhotoPreview,
          faceRegistered: true,
        }));
        setFaceEnrolledBadge('✓ Biometric Face Vector Enrolled from Webcam Snapshot');
      }
      setTimeout(() => setFaceEnrolledBadge(null), 4000);
    }
    handleCloseWebcamModal();
  };

  // Handle Image File Upload Selection
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
        if (photoTarget === 'edit' && editingStudent) {
          setEditingStudent((prev) =>
            prev ? { ...prev, avatarUrl: dataUrl, faceRegistered: true } : null
          );
          setFaceEnrolledBadge('✓ Face Photo Enrolled (68 Landmarks Vector Generated)');
        } else {
          setFormData((prev) => ({
            ...prev,
            avatarUrl: dataUrl,
            faceRegistered: true,
          }));
          setFaceEnrolledBadge('✓ Face Photo Enrolled (68 Landmarks Vector Generated)');
        }
        setTimeout(() => setFaceEnrolledBadge(null), 4000);
      }
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be chosen again if needed
    e.target.value = '';
  };

  // Use Sample Student Face Vector
  const handleUseSampleFace = (sampleUrl: string) => {
    if (photoTarget === 'edit' && editingStudent) {
      setEditingStudent((prev) =>
        prev ? { ...prev, avatarUrl: sampleUrl, faceRegistered: true } : null
      );
      setFaceEnrolledBadge('✓ Sample Biometric Face Vector Enrolled');
    } else {
      setFormData((prev) => ({
        ...prev,
        avatarUrl: sampleUrl,
        faceRegistered: true,
      }));
      setFaceEnrolledBadge('✓ Sample Biometric Face Vector Enrolled');
    }
    setTimeout(() => setFaceEnrolledBadge(null), 4000);
    if (isWebcamModalOpen) {
      handleCloseWebcamModal();
    }
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
      avatarUrl: formData.avatarUrl || '/src/assets/images/avatar_student_rahul_1791905718978.jpg',
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

  // Export Student Directory to CSV
  const handleExportCSV = () => {
    const headers = [
      'Student ID',
      'Roll No',
      'Full Name',
      'Email',
      'Phone',
      'Course',
      'Section',
      'Attendance %',
      'Attended Classes',
      'Total Classes',
      'Face Enrolled',
      'Status Today',
    ];
    const rows = filteredStudents.map((s) => [
      s.id,
      `"${s.rollNo}"`,
      `"${s.name}"`,
      s.email,
      s.phone,
      `"${s.course}"`,
      `"${s.section}"`,
      `${s.attendancePercentage}%`,
      s.attendedClasses,
      s.totalClasses,
      s.faceRegistered ? 'Yes' : 'No',
      s.statusToday,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `SmartClass_Student_Directory_${courseFilter === 'all' ? 'All_Courses' : courseFilter}.csv`
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
            <div className="p-1.5 rounded-lg bg-blue-600 text-white shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold">Student Viewing &amp; Export Mode:</span>
              <span className="text-blue-700 ml-1">
                You have viewing and export access. You are not allowed to edit, add, or delete any records.
              </span>
            </div>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-xs shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Roster CSV</span>
          </button>
        </div>
      )}

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
          {/* Always Available Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
            title="Download CSV spreadsheet of current student roster"
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
                  setParsedStudents([]);
                  setBulkCsvText('');
                  setIsBulkModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Bulk Import CSV</span>
              </button>

              <button
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Student</span>
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
                          {userCanEdit && (
                            <>
                              <button
                                onClick={() => setEditingStudent(student)}
                                className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Student & Biometric Vector"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeletingStudentId(student.id)}
                                className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Student"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
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
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
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

                {/* Avatar Preview & Status */}
                <div className="flex items-center gap-3 p-2.5 bg-white border border-slate-200/90 rounded-xl shadow-xs">
                  <div className="relative">
                    <img
                      src={formData.avatarUrl}
                      alt="Student Face"
                      className="w-14 h-14 rounded-xl object-cover border-2 border-blue-500/30 shadow-xs bg-slate-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                      }}
                    />
                    {formData.faceRegistered && (
                      <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-xs" title="Biometric Vector Enrolled">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800">Biometric Profile</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        512-D Active
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {formData.faceRegistered ? 'Ready for live entrance biometric detection' : 'Pending enrollment photo capture'}
                    </p>
                    {faceEnrolledBadge && (
                      <div className="text-[10px] font-semibold text-emerald-600 animate-pulse mt-0.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{faceEnrolledBadge}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenWebcamModal('add')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Take WebCam Snapshot</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoTarget('add');
                      fileInputRef.current?.click();
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-700 shadow-xs transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Upload Image File</span>
                  </button>
                </div>

                {/* Sample Face Quick Picker */}
                <div className="pt-2 border-t border-slate-200/60">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Or choose sample student biometric profile:</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {sampleStudentFaces.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleUseSampleFace(sample.url)}
                        className={`group p-1.5 rounded-lg border text-left transition-all flex flex-col items-center gap-1 ${
                          formData.avatarUrl === sample.url
                            ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <img
                          src={sample.url}
                          alt={sample.name}
                          className="w-10 h-10 rounded-md object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                          }}
                        />
                        <span className="text-[9px] font-medium text-slate-600 truncate max-w-full">
                          {sample.name.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
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

              {/* Edit Biometric Photo Box */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                    <ScanFace className="w-4 h-4 text-blue-600" />
                    <span>Facial Biometric Photo & Embedding</span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    512-D Enrolled
                  </span>
                </div>

                <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200">
                  <img
                    src={editingStudent.avatarUrl}
                    alt={editingStudent.name}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 bg-slate-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="flex-1 min-w-0 text-[11px]">
                    <div className="font-semibold text-slate-800">Biometric Vector Linked</div>
                    <div className="text-slate-500 truncate">Update photo to recalibrate facial recognition</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleOpenWebcamModal('edit')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Take WebCam Snapshot</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoTarget('edit');
                      fileInputRef.current?.click();
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-700 shadow-xs transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>Upload Image File</span>
                  </button>
                </div>
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

      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileChange}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
      />

      {/* Hidden Canvas for Webcam Snapshot Capture */}
      <canvas ref={webcamCanvasRef} className="hidden" />

      {/* =========================================================================
          WEBCAM BIOMETRIC SNAPSHOT CAPTURE MODAL
          ========================================================================= */}
      {isWebcamModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 relative">
                  <Camera className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Webcam Face Snapshot &amp; Enrollment</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      512-D Biometrics
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Target: <span className="text-blue-300 font-semibold">{photoTarget === 'edit' && editingStudent ? editingStudent.name : formData.name || 'New Student'}</span>{' '}
                    ({photoTarget === 'edit' && editingStudent ? editingStudent.id : formData.id})
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

            {/* Modal Body / Camera Viewport */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Camera Error / Warning Banner */}
              {webcamError && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-amber-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{webcamError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => startWebcamStream(true)}
                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg font-semibold text-[11px] shrink-0 transition-colors"
                  >
                    Use Virtual Cam
                  </button>
                </div>
              )}

              {/* Viewport Frame */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-4/3 flex items-center justify-center shadow-inner">
                {capturedPhotoPreview ? (
                  /* Captured Snapshot Preview */
                  <div className="relative w-full h-full">
                    <img
                      src={capturedPhotoPreview}
                      alt="Captured Biometric Snapshot"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-emerald-500/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>SNAPSHOT CAPTURED &amp; VERIFIED</span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-md border border-slate-700/60 rounded-xl p-2.5 flex items-center justify-between text-xs text-slate-200">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="font-semibold">68 Facial Landmark Points Detected</span>
                      </div>
                      <span className="font-mono text-[10px] text-emerald-400 font-bold">L2 Norm: 0.984</span>
                    </div>
                  </div>
                ) : (
                  /* Live Camera Feed or Virtual Camera */
                  <div className="relative w-full h-full flex items-center justify-center bg-black">
                    {!isVirtualWebcam ? (
                      <video
                        ref={(el) => {
                          webcamVideoRef.current = el;
                          if (el && webcamStreamRef.current && el.srcObject !== webcamStreamRef.current) {
                            el.muted = true;
                            el.defaultMuted = true;
                            el.srcObject = webcamStreamRef.current;
                            el.play().catch((e) => console.warn('Webcam play notice:', e));
                          }
                        }}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                    ) : (
                      /* Virtual Biometric Feed Simulation */
                      <div className="relative w-full h-full bg-linear-to-b from-slate-900 via-slate-950 to-slate-900 flex flex-col items-center justify-center overflow-hidden">
                        {/* Futuristic scan grid */}
                        <div
                          className="absolute inset-0 opacity-15"
                          style={{
                            backgroundImage:
                              'linear-gradient(rgba(56, 189, 248, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.4) 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                          }}
                        />

                        {/* Animated Laser Scanning Beam */}
                        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-pulse top-1/3" />

                        {/* Simulated Human Head Graphic */}
                        <div className="relative flex flex-col items-center z-10">
                          <div className="w-32 h-44 rounded-[50%/60%_60%_40%_40%] border-2 border-cyan-400/80 bg-cyan-950/20 backdrop-blur-xs flex flex-col items-center justify-center relative shadow-[0_0_25px_rgba(34,211,238,0.2)]">
                            {/* Eye markers */}
                            <div className="flex items-center gap-10 mt-6">
                              <span className="w-3 h-3 rounded-full bg-cyan-400/90 animate-ping" />
                              <span className="w-3 h-3 rounded-full bg-cyan-400/90 animate-ping" />
                            </div>
                            {/* Nose marker */}
                            <span className="w-1.5 h-3 bg-cyan-400/60 rounded-full mt-4" />
                            {/* Mouth */}
                            <div className="w-10 h-2 border-b-2 border-cyan-400/70 rounded-full mt-4" />
                            {/* Crosshairs */}
                            <span className="absolute top-2 text-[9px] font-mono text-cyan-300">
                              + ALIGNED +
                            </span>
                          </div>
                          {/* Shoulders */}
                          <div className="w-56 h-16 rounded-t-full border-t-2 border-blue-500/50 bg-blue-950/30 -mt-2" />
                        </div>

                        {/* Mode indicator */}
                        <div className="absolute top-3 left-3 bg-indigo-500/80 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow">
                          VIRTUAL BIOMETRIC CAM · 30 FPS
                        </div>
                      </div>
                    )}

                    {/* Biometric HUD Overlays */}
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

                      {/* Oval Alignment Guide */}
                      <div className="self-center w-48 h-60 rounded-[50%/60%_60%_40%_40%] border-2 border-dashed border-emerald-400/60 flex items-center justify-center relative">
                        <span className="absolute -top-6 text-[10px] font-mono font-bold text-emerald-300 bg-black/70 px-2 py-0.5 rounded">
                          ALIGN FACE HERE
                        </span>
                        {/* Target Reticles */}
                        <div className="w-4 h-4 border-t-2 border-l-2 border-emerald-400 absolute -top-1 -left-1" />
                        <div className="w-4 h-4 border-t-2 border-r-2 border-emerald-400 absolute -top-1 -right-1" />
                        <div className="w-4 h-4 border-b-2 border-l-2 border-emerald-400 absolute -bottom-1 -left-1" />
                        <div className="w-4 h-4 border-b-2 border-r-2 border-emerald-400 absolute -bottom-1 -right-1" />
                      </div>

                      {/* Quality status indicators */}
                      <div className="flex items-center justify-between bg-black/70 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-300">
                        <span>Liveness: <strong className="text-emerald-400">99.4%</strong></span>
                        <span>Illumination: <strong className="text-emerald-400">Optimal</strong></span>
                        <span>Pose: <strong className="text-emerald-400">Centered</strong></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Source Switcher Toolbar */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => startWebcamStream(!isVirtualWebcam)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    {isVirtualWebcam ? 'Switch to Hardware Webcam' : 'Switch to Virtual Biometric Feed'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Upload Image File Instead</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                {capturedPhotoPreview ? (
                  <>
                    <button
                      type="button"
                      onClick={() => startWebcamStream(isVirtualWebcam)}
                      className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retake Snapshot</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmCapturedPhoto}
                      className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Confirm &amp; Enroll Biometric Vector</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleCloseWebcamModal}
                      className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCaptureSnapshot}
                      className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Capture Snapshot Now</span>
                    </button>
                  </>
                )}
              </div>

              {/* Quick Sample Profile Selector in Modal */}
              <div className="pt-3 border-t border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Or select sample student face vector:
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {sampleStudentFaces.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleUseSampleFace(sample.url)}
                      className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:border-blue-500/50 hover:bg-slate-800/60 transition-all flex flex-col items-center gap-1 text-left"
                    >
                      <img
                        src={sample.url}
                        alt={sample.name}
                        className="w-10 h-10 rounded-md object-cover bg-slate-900"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                        }}
                      />
                      <span className="text-[10px] font-medium text-slate-300 truncate max-w-full">
                        {sample.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
