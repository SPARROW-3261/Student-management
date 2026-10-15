import React, { useState } from 'react';
import {
  UserCheck,
  Shield,
  Key,
  Bell,
  Clock,
  Calendar,
  Database,
  Save,
  CheckCircle2,
  Lock,
  Mail,
  Building,
  UserPlus,
  MessageSquare,
  Smartphone,
  Send,
  Sliders,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Check,
  X,
  AlertTriangle,
  Info,
  ExternalLink,
  FileText,
  RefreshCw,
  Sparkles,
  Radio,
  Share2,
  GraduationCap,
  Users,
  Copy,
  EyeOff,
} from 'lucide-react';
import { ADMIN_USER, INITIAL_ALERT_TRIGGERS } from '../../data/mockData';
import { AttendanceAlertTrigger, AuthUser, Student, Teacher } from '../../types/attendance';

interface UserManagementPageProps {
  onLogout: () => void;
  initialTab?: 'accounts' | 'alerts' | 'profile' | 'rbac' | 'rules' | 'all';
  registeredUsers?: AuthUser[];
  onAddUserCredential?: (user: AuthUser, studentRecord?: Student, teacherRecord?: Teacher) => void;
  students?: Student[];
  teachers?: Teacher[];
}

export const UserManagementPage: React.FC<UserManagementPageProps> = ({
  onLogout,
  initialTab = 'accounts',
  registeredUsers = [],
  onAddUserCredential,
  students = [],
  teachers = [],
}) => {
  const [activeTab, setActiveTab] = useState<'accounts' | 'alerts' | 'profile' | 'rbac' | 'rules' | 'all'>(
    initialTab
  );

  // User Password Provisioning State
  const [provRole, setProvRole] = useState<'student' | 'teacher'>('student');
  const [provName, setProvName] = useState('');
  const [provEmail, setProvEmail] = useState('');
  const [provPassword, setProvPassword] = useState('Student@2024');
  const [showProvPassword, setShowProvPassword] = useState(false);
  const [provCourse, setProvCourse] = useState('MCA');
  const [provSection, setProvSection] = useState('MCA-II A');
  const [provRollNo, setProvRollNo] = useState('');
  const [provDept, setProvDept] = useState('Computer Applications');
  const [provDesignation, setProvDesignation] = useState('Assistant Professor');
  const [provCabin, setProvCabin] = useState('Cabin 304');
  const [provFaceRegistered, setProvFaceRegistered] = useState(true);
  const [provSuccessReceipt, setProvSuccessReceipt] = useState<{
    name: string;
    email: string;
    password: string;
    role: string;
    id: string;
  } | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [accountSearch, setAccountSearch] = useState('');
  const [accountFilterRole, setAccountFilterRole] = useState<'all' | 'student' | 'teacher' | 'admin'>('all');

  const generateRandomPassword = () => {
    const prefixes = ['SmartPass', 'Vision', 'EduKey', 'Campus', 'Alpha'];
    const years = ['2026', '2025', '2024'];
    const symbols = ['!', '@', '#', '$'];
    const randPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randYear = years[Math.floor(Math.random() * years.length)];
    const randSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    const num = Math.floor(10 + Math.random() * 90);
    setProvPassword(`${randPrefix}${randYear}${randSymbol}${num}`);
  };

  const handleNameChange = (name: string) => {
    setProvName(name);
    if (!provEmail || provEmail.includes('@student.edu') || provEmail.includes('@college.edu')) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.').replace(/^\.|\.$/g, '');
      if (slug) {
        setProvEmail(provRole === 'student' ? `${slug}@student.edu` : `${slug}@college.edu`);
      }
    }
  };

  const handleCreateAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provName.trim() || !provEmail.trim() || !provPassword.trim()) return;

    const id =
      provRole === 'student'
        ? `STU-2024-${Math.floor(100 + Math.random() * 900)}`
        : `TCH-${Math.floor(100 + Math.random() * 900)}`;

    const newAuthUser: AuthUser = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: provName.trim(),
      email: provEmail.trim().toLowerCase(),
      password: provPassword.trim(),
      role: provRole,
      canMakeChanges: provRole === 'teacher',
      avatarUrl:
        provRole === 'student'
          ? '/src/assets/images/avatar_student_rahul_1791905718978.jpg'
          : '/src/assets/images/avatar_teacher_amit_1791905720315.jpg',
      course: provRole === 'student' ? provCourse : undefined,
      section: provRole === 'student' ? provSection : undefined,
      rollNo: provRole === 'student' ? provRollNo || `24MCA${Math.floor(100 + Math.random() * 900)}` : undefined,
      department: provRole === 'teacher' ? provDept : undefined,
      designation: provRole === 'teacher' ? provDesignation : undefined,
      cabinNo: provRole === 'teacher' ? provCabin : undefined,
      studentId: provRole === 'student' ? id : undefined,
      teacherId: provRole === 'teacher' ? id : undefined,
      lastLogin: 'Never (New Account)',
    };

    let studentRec: Student | undefined;
    let teacherRec: Teacher | undefined;

    if (provRole === 'student') {
      studentRec = {
        id,
        name: provName.trim(),
        email: provEmail.trim().toLowerCase(),
        phone: '+91 98000 12345',
        course: provCourse,
        section: provSection,
        rollNo: newAuthUser.rollNo || '24MCA100',
        attendancePercentage: 100,
        faceRegistered: provFaceRegistered,
        avatarUrl: newAuthUser.avatarUrl,
        totalClasses: 1,
        attendedClasses: 1,
        statusToday: 'present',
        lastSeen: 'Registered Today',
      };
    } else {
      teacherRec = {
        id,
        name: provName.trim(),
        email: provEmail.trim().toLowerCase(),
        phone: '+91 98111 22334',
        department: provDept,
        designation: provDesignation,
        attendanceStatus: 'present',
        faceRegistered: provFaceRegistered,
        avatarUrl: newAuthUser.avatarUrl,
        cabinNo: provCabin,
        assignedClassrooms: ['MCA Advanced Lab 301'],
        lastSeen: 'Registered Today',
      };
    }

    if (onAddUserCredential) {
      onAddUserCredential(newAuthUser, studentRec, teacherRec);
    }

    setProvSuccessReceipt({
      name: provName.trim(),
      email: provEmail.trim().toLowerCase(),
      password: provPassword.trim(),
      role: provRole,
      id,
    });

    setProvName('');
    setProvEmail('');
    generateRandomPassword();
    setProvRollNo('');
  };

  const handleCopyCredentials = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Admin Profile State
  const [profile, setProfile] = useState({
    name: ADMIN_USER.name,
    email: ADMIN_USER.email,
    department: ADMIN_USER.department,
    role: 'Super Administrator & HOD',
    phone: '+91 98450 99882',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [attendanceRules, setAttendanceRules] = useState({
    lateThresholdMinutes: 15,
    minDurationMinutes: 60,
    autoMarkAbsentHours: 17,
  });

  // Attendance Alert Triggers State
  const [alertTriggers, setAlertTriggers] = useState<AttendanceAlertTrigger[]>(
    INITIAL_ALERT_TRIGGERS
  );

  // Gateway Configurations
  const [gatewayConfig, setGatewayConfig] = useState({
    emailEnabled: true,
    emailProvider: 'SendGrid SMTP Relay',
    emailHost: 'smtp.college.edu:587',
    senderEmail: 'attendance-alerts@college.edu',
    smsEnabled: true,
    smsProvider: 'Twilio Cloud SMS Gateway',
    smsSenderId: 'UNIVATTND',
    dailyBatchTime: '17:30',
    notifyParentsBySms: true,
  });

  // UI Modals & Feedback
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [editingTrigger, setEditingTrigger] = useState<AttendanceAlertTrigger | null>(null);
  const [testingTrigger, setTestingTrigger] = useState<AttendanceAlertTrigger | null>(null);
  const [testRecipientType, setTestRecipientType] = useState<'parent' | 'student' | 'mentor'>('parent');
  const [testChannel, setTestChannel] = useState<'email' | 'sms'>('sms');
  const [testDispatchSuccess, setTestDispatchSuccess] = useState<string | null>(null);
  const [newTriggerModalOpen, setNewTriggerModalOpen] = useState(false);

  // New Trigger Form
  const [newTriggerForm, setNewTriggerForm] = useState({
    name: '',
    category: 'low_attendance' as const,
    description: '',
    thresholdValue: 75,
    unit: '%',
    frequency: 'daily' as const,
    email: true,
    sms: true,
    student: true,
    parent: true,
    mentor: true,
    hod: false,
    emailSubject: '[Notice] Attendance Alert Notification',
    smsTemplate: 'ALERT: Attendance update for {student_name}: {attendance_percentage}%.',
  });

  const roles = [
    {
      role: 'Super Administrator',
      users: 'Dr. Sunita Rao (HOD)',
      permissions: 'Full access to camera streams, biometric registration, user roles, system rules',
    },
    {
      role: 'Faculty / Course Incharge',
      users: 'Prof. Amit Verma, Dr. Meenakshi Iyer',
      permissions: 'View live attendance, review course rosters, download CSV/PDF reports',
    },
    {
      role: 'Lab Technician / Camera Assistant',
      users: 'Mr. Santosh Patil',
      permissions: 'Monitor camera health, test streams, configure RTSP connections',
    },
    {
      role: 'Attendance Officer',
      users: 'Academic Office Staff',
      permissions: 'Export official attendance registers, issue low-attendance notices',
    },
  ];

  const handleSaveAll = () => {
    setSaveToast('Attendance alert triggers, communication gateways, and system rules saved successfully.');
    setTimeout(() => setSaveToast(null), 4000);
  };

  const handleToggleTrigger = (id: string) => {
    setAlertTriggers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    );
  };

  const handleUpdateTriggerField = (id: string, field: string, value: any) => {
    setAlertTriggers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (field.startsWith('channels.')) {
          const ch = field.split('.')[1];
          return { ...t, channels: { ...t.channels, [ch]: value } };
        }
        if (field.startsWith('recipients.')) {
          const rc = field.split('.')[1];
          return { ...t, recipients: { ...t.recipients, [rc]: value } };
        }
        return { ...t, [field]: value };
      })
    );
  };

  const handleSendTestNotification = (trigger: AttendanceAlertTrigger) => {
    const studentName = 'Rahul Kumar';
    const rollNo = '24MCA042';
    const percent = trigger.category === 'low_attendance' ? '68.5' : '82.0';
    const days = '3';
    const mentorName = 'Prof. Amit Verma';

    let destination = '';
    let previewContent = '';

    if (testChannel === 'sms') {
      destination =
        testRecipientType === 'parent'
          ? '+91 98450 91823 (Parent Phone)'
          : testRecipientType === 'student'
          ? '+91 98000 12345 (Rahul Kumar)'
          : '+91 98450 12345 (Prof. Amit Verma)';

      previewContent = trigger.smsTemplate
        .replace('{student_name}', studentName)
        .replace('{roll_no}', rollNo)
        .replace('{attendance_percentage}', percent)
        .replace('{consecutive_days}', days)
        .replace('{course_name}', 'MCA')
        .replace('{classroom_name}', 'MCA Lab 301')
        .replace('{mentor_name}', mentorName);
    } else {
      destination =
        testRecipientType === 'parent'
          ? 'parent.kumar@gmail.com'
          : testRecipientType === 'student'
          ? 'rahul.kumar@student.edu'
          : 'amit.verma@engineering.edu';

      previewContent = `Subject: ${trigger.emailSubjectTemplate
        .replace('{student_name}', studentName)
        .replace('{roll_no}', rollNo)}\n\n${trigger.emailBodyTemplate
        .replace('{student_name}', studentName)
        .replace('{roll_no}', rollNo)
        .replace('{attendance_percentage}', percent)
        .replace('{consecutive_days}', days)
        .replace('{course_name}', 'MCA')
        .replace('{classroom_name}', 'MCA Lab 301')
        .replace('{mentor_name}', mentorName)}`;
    }

    setTestDispatchSuccess(
      `Dispatched test ${testChannel.toUpperCase()} trigger [${trigger.name}] to ${destination} via Gateway ${
        testChannel === 'sms' ? gatewayConfig.smsProvider : gatewayConfig.emailProvider
      }. Delivery receipt confirmed.`
    );

    setTimeout(() => setTestDispatchSuccess(null), 5000);
    setTestingTrigger(null);
  };

  const handleCreateNewTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTriggerForm.name) return;

    const newTrg: AttendanceAlertTrigger = {
      id: `ALT-TRG-${Date.now().toString().slice(-4)}`,
      name: newTriggerForm.name,
      category: newTriggerForm.category,
      description: newTriggerForm.description || 'Custom administrator attendance trigger rule.',
      enabled: true,
      channels: {
        email: newTriggerForm.email,
        sms: newTriggerForm.sms,
        inApp: true,
      },
      recipients: {
        student: newTriggerForm.student,
        parent: newTriggerForm.parent,
        mentor: newTriggerForm.mentor,
        hod: newTriggerForm.hod,
      },
      thresholdValue: Number(newTriggerForm.thresholdValue),
      unit: newTriggerForm.unit,
      frequency: newTriggerForm.frequency,
      emailSubjectTemplate: newTriggerForm.emailSubject,
      emailBodyTemplate: `Dear Parent and Student,\n\nAttendance alert notification for {student_name}.\nCurrent rate: {attendance_percentage}% in {course_name}.\n\nAcademic Office`,
      smsTemplate: newTriggerForm.smsTemplate,
      lastTriggered: 'Configured Today',
      triggersCount: 0,
    };

    setAlertTriggers((prev) => [newTrg, ...prev]);
    setNewTriggerModalOpen(false);
    setSaveToast(`Created new alert trigger: "${newTrg.name}".`);
    setTimeout(() => setSaveToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Save Button */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              INSTITUTIONAL SETTINGS
            </span>
            <span className="text-xs text-slate-400">· Academic Year 2026-2027</span>
          </div>
          <h2 className="text-lg lg:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <span>Attendance Alert Configuration &amp; Administration</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure automated email and SMS notification triggers for low attendance, prolonged absence, and RBAC security
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setNewTriggerModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Add Custom Trigger</span>
          </button>

          <button
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save System Settings</span>
          </button>
        </div>
      </div>

      {/* Save Success Banner */}
      {saveToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveToast}</span>
          </div>
          <button onClick={() => setSaveToast(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Test Dispatch Feedback */}
      {testDispatchSuccess && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-900 flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{testDispatchSuccess}</span>
          </div>
          <button onClick={() => setTestDispatchSuccess(null)} className="text-blue-700 hover:text-blue-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'accounts'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Create User Passwords (Students &amp; Teachers)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-white font-mono font-bold">
            PROVISION
          </span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'alerts'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Attendance Alert Configuration</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'alerts' ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800'}`}>
            {alertTriggers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'profile'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Admin Profile &amp; Security</span>
        </button>

        <button
          onClick={() => setActiveTab('rbac')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'rbac'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Role-Based Access (RBAC)</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'rules'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Calculation Rules &amp; Storage</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          View All Settings
        </button>
      </div>

      {/* =========================================================================
          SECTION: STUDENT & TEACHER USER PASSWORD PROVISIONING & REGISTRATION
          ========================================================================= */}
      {(activeTab === 'accounts' || activeTab === 'all') && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-blue-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-400/40">
                  ADMINISTRATIVE CREDENTIAL CONSOLE
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  URL: /admin
                </span>
              </div>
              <h2 className="text-xl font-extrabold tracking-tight">
                Create User Passwords &amp; Register on Website
              </h2>
              <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
                As the administrator, create and manage login passwords for both Students and Teachers.
                Registered users will immediately be able to log in to the portal with their new credentials.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 font-mono text-blue-100 font-bold">
                {registeredUsers.length} Active Accounts
              </span>
            </div>
          </div>

          {/* Success Receipt Modal/Card */}
          {provSuccessReceipt && (
            <div className="p-5 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-xs text-slate-800 space-y-3 shadow-md animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      User Account Successfully Created &amp; Enrolled!
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      This user has been registered in the system directory and can now log in at the portal.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setProvSuccessReceipt(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-emerald-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-emerald-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Full Name</span>
                  <div className="font-bold text-slate-900">{provSuccessReceipt.name}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Role</span>
                  <div className="font-bold text-blue-700 capitalize">{provSuccessReceipt.role}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Login Email</span>
                  <div className="font-mono font-semibold text-slate-800 truncate">{provSuccessReceipt.email}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Login Password</span>
                  <div className="font-mono font-bold text-emerald-700">{provSuccessReceipt.password}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500 font-medium">
                  Give these credentials to the user to sign in at the Student &amp; Teacher portal.
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyCredentials(
                      `SmartClass Attendance Portal\nEmail: ${provSuccessReceipt.email}\nPassword: ${provSuccessReceipt.password}\nRole: ${provSuccessReceipt.role}`,
                      'receipt'
                    )
                  }
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  {copiedId === 'receipt' ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Credentials</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Account Creation Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Provision User Account &amp; Password</h3>
                  <p className="text-[11px] text-slate-500">
                    Register a new student or faculty member and configure their login credentials
                  </p>
                </div>
              </div>

              {/* Role Toggle */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setProvRole('student');
                    if (provName) handleNameChange(provName);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    provRole === 'student' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProvRole('teacher');
                    if (provName) handleNameChange(provName);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    provRole === 'teacher' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Teacher / Faculty</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateAccountSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={provName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder={provRole === 'student' ? 'e.g. Tanvi Joshi' : 'e.g. Dr. Ramesh Gupta'}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Portal Login Email (Username) *
                  </label>
                  <input
                    type="email"
                    required
                    value={provEmail}
                    onChange={(e) => setProvEmail(e.target.value)}
                    placeholder={provRole === 'student' ? 'tanvi.joshi@student.edu' : 'ramesh.gupta@college.edu'}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Password configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-blue-600" />
                      <span>Set User Login Password *</span>
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Generate Password</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showProvPassword ? 'text' : 'password'}
                      required
                      value={provPassword}
                      onChange={(e) => setProvPassword(e.target.value)}
                      placeholder="Enter initial password"
                      className="w-full pl-3 pr-9 py-2 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowProvPassword(!showProvPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showProvPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    User will log in using this password on the Student &amp; Teacher login page.
                  </p>
                </div>

                {/* Role Specific Details */}
                {provRole === 'student' ? (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Course</label>
                      <select
                        value={provCourse}
                        onChange={(e) => setProvCourse(e.target.value)}
                        className="w-full px-2 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                      >
                        <option value="MCA">MCA</option>
                        <option value="B.Tech CSE">B.Tech CSE</option>
                        <option value="BCA">BCA</option>
                        <option value="M.Tech">M.Tech AI</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Section</label>
                      <input
                        type="text"
                        value={provSection}
                        onChange={(e) => setProvSection(e.target.value)}
                        className="w-full px-2 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Roll No</label>
                      <input
                        type="text"
                        value={provRollNo}
                        onChange={(e) => setProvRollNo(e.target.value)}
                        placeholder="24MCA105"
                        className="w-full px-2 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Department</label>
                      <select
                        value={provDept}
                        onChange={(e) => setProvDept(e.target.value)}
                        className="w-full px-2 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                      >
                        <option value="Computer Applications">MCA</option>
                        <option value="Computer Science">B.Tech CSE</option>
                        <option value="Information Tech">IT</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Designation</label>
                      <input
                        type="text"
                        value={provDesignation}
                        onChange={(e) => setProvDesignation(e.target.value)}
                        className="w-full px-2 py-2 bg-white rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Cabin</label>
                      <input
                        type="text"
                        value={provCabin}
                        onChange={(e) => setProvCabin(e.target.value)}
                        className="w-full px-2 py-2 bg-white rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Biometric Enrollment Option */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">
                    Facial Biometric Enrollment for Entrance Camera
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Generate initial 512-dimensional face recognition vector for automated gate attendance
                  </div>
                </div>
                <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={provFaceRegistered}
                    onChange={(e) => setProvFaceRegistered(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Active Enrollment (512-D)</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create User Credentials &amp; Register on Website</span>
                </button>
              </div>
            </form>
          </div>

          {/* Registered Portal Users Directory Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-600" />
                  <span>Registered Portal Users &amp; Credentials</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  All student, faculty, and administrator login accounts provisioned on this website
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Search */}
                <input
                  type="text"
                  placeholder="Filter by name or email..."
                  value={accountSearch}
                  onChange={(e) => setAccountSearch(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500 w-full sm:w-48"
                />

                {/* Filter */}
                <select
                  value={accountFilterRole}
                  onChange={(e) => setAccountFilterRole(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Students</option>
                  <option value="teacher">Teachers</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">User Profile</th>
                    <th className="py-2.5 px-4">System Role</th>
                    <th className="py-2.5 px-4">Login Email (Username)</th>
                    <th className="py-2.5 px-4">Current Password</th>
                    <th className="py-2.5 px-4">Permissions</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registeredUsers
                    .filter((u) => {
                      const matchesRole = accountFilterRole === 'all' || u.role === accountFilterRole;
                      const matchesSearch =
                        u.name.toLowerCase().includes(accountSearch.toLowerCase()) ||
                        u.email.toLowerCase().includes(accountSearch.toLowerCase());
                      return matchesRole && matchesSearch;
                    })
                    .map((user) => {
                      const isRevealed = revealedPasswords[user.id];
                      return (
                        <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={user.avatarUrl}
                                alt={user.name}
                                className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                                }}
                              />
                              <div>
                                <div className="font-bold text-slate-900">{user.name}</div>
                                <div className="text-[11px] text-slate-400 font-mono">
                                  {user.rollNo || user.teacherId || user.id}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            {user.role === 'admin' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                <Shield className="w-3 h-3" />
                                <span>Administrator</span>
                              </span>
                            ) : user.role === 'teacher' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                <Users className="w-3 h-3" />
                                <span>Teacher (Edit &amp; Export)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                <GraduationCap className="w-3 h-3" />
                                <span>Student (View &amp; Export)</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 font-mono font-medium text-slate-800">
                            {user.email}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded border border-slate-200 text-slate-700">
                                {isRevealed ? user.password || '••••••••' : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setRevealedPasswords((prev) => ({
                                    ...prev,
                                    [user.id]: !prev[user.id],
                                  }))
                                }
                                className="text-slate-400 hover:text-slate-600 p-0.5"
                                title={isRevealed ? 'Hide Password' : 'Show Password'}
                              >
                                {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            {user.role === 'admin' ? (
                              <span className="text-purple-700 font-semibold text-[11px]">Master Surveillance</span>
                            ) : user.role === 'teacher' ? (
                              <span className="text-indigo-700 font-semibold text-[11px]">Edit Attendance &amp; Export</span>
                            ) : (
                              <span className="text-emerald-700 font-semibold text-[11px]">View &amp; Export Only</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyCredentials(
                                  `Email: ${user.email}\nPassword: ${user.password || 'admin123'}\nRole: ${user.role}`,
                                  user.id
                                )
                              }
                              className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              {copiedId === user.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                                  <span className="text-emerald-600">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION: ATTENDANCE ALERT CONFIGURATION (EMAIL & SMS NOTIFICATIONS)
          ========================================================================= */}
      {(activeTab === 'alerts' || activeTab === 'all') && (
        <div className="space-y-6">
          {/* Notification Gateway Infrastructure Status */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span>Communication Gateway &amp; Delivery Infrastructure</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure real-time outgoing Email (SMTP) and SMS (Twilio/National Gateway) pipelines
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-300">
                  ● GATEWAYS OPERATIONAL (99.8%)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Email Gateway Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span>Email Relay Gateway</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={gatewayConfig.emailEnabled}
                    onChange={(e) =>
                      setGatewayConfig({ ...gatewayConfig, emailEnabled: e.target.checked })
                    }
                    className="rounded text-blue-600 w-4 h-4"
                  />
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Provider: {gatewayConfig.emailProvider}
                </div>
                <div className="text-[11px] text-slate-600">
                  Relay Host: <strong className="font-mono text-slate-800">{gatewayConfig.emailHost}</strong>
                </div>
                <div className="text-[11px] text-slate-600">
                  From: <strong className="font-mono text-blue-700">{gatewayConfig.senderEmail}</strong>
                </div>
              </div>

              {/* SMS Gateway Card */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>SMS Alert Gateway</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={gatewayConfig.smsEnabled}
                    onChange={(e) =>
                      setGatewayConfig({ ...gatewayConfig, smsEnabled: e.target.checked })
                    }
                    className="rounded text-emerald-600 w-4 h-4"
                  />
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Provider: {gatewayConfig.smsProvider}
                </div>
                <div className="text-[11px] text-slate-600">
                  Sender Header ID: <strong className="font-mono text-slate-800">{gatewayConfig.smsSenderId}</strong>
                </div>
                <div className="text-[11px] text-slate-600">
                  Parent SMS Delivery: <span className="text-emerald-700 font-bold">Enabled (100% Opt-In)</span>
                </div>
              </div>

              {/* Scheduled Batch Dispatch Timing */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>Batch Dispatch Schedule</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 font-mono">
                    DAILY
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  Low-attendance batches are evaluated daily after lectures conclude:
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    type="time"
                    value={gatewayConfig.dailyBatchTime}
                    onChange={(e) =>
                      setGatewayConfig({ ...gatewayConfig, dailyBatchTime: e.target.value })
                    }
                    className="px-2.5 py-1 rounded border border-slate-200 font-mono text-xs font-bold text-slate-800 bg-white"
                  />
                  <span className="text-[11px] text-slate-400">IST (Post-Dismissal)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Alert Triggers List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Configured Attendance Notification Triggers</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
                    {alertTriggers.filter((t) => t.enabled).length} Active
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Set threshold cutoffs, channels (Email / SMS), target recipients, and custom message copy
                </p>
              </div>
            </div>

            {/* Triggers Cards */}
            <div className="grid grid-cols-1 gap-4">
              {alertTriggers.map((trg) => {
                const isLowAttendance = trg.category === 'low_attendance';
                const isProlongedAbsence = trg.category === 'prolonged_absence';

                return (
                  <div
                    key={trg.id}
                    className={`bg-white rounded-2xl border p-5 shadow-sm transition-all space-y-4 ${
                      trg.enabled
                        ? isLowAttendance
                          ? 'border-amber-300/80 bg-gradient-to-r from-white via-amber-50/20 to-white'
                          : isProlongedAbsence
                          ? 'border-rose-300/80 bg-gradient-to-r from-white via-rose-50/20 to-white'
                          : 'border-slate-200'
                        : 'border-slate-200 opacity-60 bg-slate-50/50'
                    }`}
                  >
                    {/* Top Row: Title, Category Badge, Master Toggle & Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-start sm:items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isLowAttendance
                              ? 'bg-amber-100 text-amber-700'
                              : isProlongedAbsence
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {isLowAttendance ? (
                            <AlertTriangle className="w-5 h-5" />
                          ) : isProlongedAbsence ? (
                            <Clock className="w-5 h-5" />
                          ) : (
                            <Bell className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{trg.name}</h4>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                                isLowAttendance
                                  ? 'bg-amber-100 text-amber-800'
                                  : isProlongedAbsence
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {trg.category.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Triggered: {trg.triggersCount} times
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{trg.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => {
                            setTestingTrigger(trg);
                            setTestChannel('sms');
                            setTestRecipientType('parent');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors"
                        >
                          <Send className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Test Trigger</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleTrigger(trg.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            trg.enabled
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                              : 'bg-slate-100 text-slate-500 border border-slate-300'
                          }`}
                        >
                          {trg.enabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>
                    </div>

                    {/* Middle Controls Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-xs items-start">
                      {/* Threshold Configuration (4 Cols) */}
                      <div className="md:col-span-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-slate-800">
                            Trigger Threshold Criteria
                          </label>
                          <span className="font-mono font-bold text-blue-700 text-sm">
                            {trg.category === 'low_attendance'
                              ? `< ${trg.thresholdValue}${trg.unit}`
                              : `≥ ${trg.thresholdValue} ${trg.unit}`}
                          </span>
                        </div>

                        {trg.category === 'low_attendance' ? (
                          <div className="space-y-1.5">
                            <input
                              type="range"
                              min="50"
                              max="85"
                              step="1"
                              value={trg.thresholdValue}
                              onChange={(e) =>
                                handleUpdateTriggerField(trg.id, 'thresholdValue', Number(e.target.value))
                              }
                              className="w-full accent-blue-600 cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                              <span>50% (Critical)</span>
                              <span>75% (Mandatory)</span>
                              <span>85% (Advisory)</span>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-600">Consecutive Days:</span>
                              <input
                                type="number"
                                min="1"
                                max="14"
                                value={trg.thresholdValue}
                                onChange={(e) =>
                                  handleUpdateTriggerField(trg.id, 'thresholdValue', Number(e.target.value))
                                }
                                className="w-16 px-2 py-1 rounded border border-slate-200 text-center font-mono font-bold bg-white text-slate-800"
                              />
                              <span className="text-slate-500 font-medium">Days Absent</span>
                            </div>
                            <p className="text-[10px] text-slate-400">
                              Evaluated across all scheduled classroom periods.
                            </p>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-200/70">
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Evaluation Frequency:
                          </label>
                          <select
                            value={trg.frequency}
                            onChange={(e) =>
                              handleUpdateTriggerField(trg.id, 'frequency', e.target.value)
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
                          >
                            <option value="daily">Daily Batch (17:30 PM)</option>
                            <option value="realtime">Real-Time (Immediately upon class conclusion)</option>
                            <option value="weekly">Weekly Audit (Every Friday)</option>
                          </select>
                        </div>
                      </div>

                      {/* Channels & Target Recipients (4 Cols) */}
                      <div className="md:col-span-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                        <div>
                          <label className="block font-bold text-slate-800 mb-2">
                            Delivery Channels
                          </label>
                          <div className="space-y-2">
                            <label className="flex items-center justify-between cursor-pointer">
                              <span className="flex items-center gap-2 text-slate-700 font-medium">
                                <Mail className="w-3.5 h-3.5 text-blue-600" />
                                <span>Email Notification</span>
                              </span>
                              <input
                                type="checkbox"
                                checked={trg.channels.email}
                                onChange={(e) =>
                                  handleUpdateTriggerField(trg.id, 'channels.email', e.target.checked)
                                }
                                className="rounded text-blue-600 w-4 h-4"
                              />
                            </label>

                            <label className="flex items-center justify-between cursor-pointer">
                              <span className="flex items-center gap-2 text-slate-700 font-medium">
                                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                                <span>SMS Text Alert</span>
                              </span>
                              <input
                                type="checkbox"
                                checked={trg.channels.sms}
                                onChange={(e) =>
                                  handleUpdateTriggerField(trg.id, 'channels.sms', e.target.checked)
                                }
                                className="rounded text-emerald-600 w-4 h-4"
                              />
                            </label>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200/70">
                          <label className="block font-bold text-slate-800 mb-2">
                            Designated Target Recipients
                          </label>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={trg.recipients.student}
                                onChange={(e) =>
                                  handleUpdateTriggerField(trg.id, 'recipients.student', e.target.checked)
                                }
                                className="rounded text-blue-600"
                              />
                              <span>Student</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={trg.recipients.parent}
                                onChange={(e) =>
                                  handleUpdateTriggerField(trg.id, 'recipients.parent', e.target.checked)
                                }
                                className="rounded text-emerald-600"
                              />
                              <span className="font-bold text-slate-900">Parent/Guardian</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={trg.recipients.mentor}
                                onChange={(e) =>
                                  handleUpdateTriggerField(trg.id, 'recipients.mentor', e.target.checked)
                                }
                                className="rounded text-indigo-600"
                              />
                              <span>Class Mentor</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={trg.recipients.hod}
                                onChange={(e) =>
                                  handleUpdateTriggerField(trg.id, 'recipients.hod', e.target.checked)
                                }
                                className="rounded text-rose-600"
                              />
                              <span>Dept Head (HOD)</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Custom Message Template Preview (4 Cols) */}
                      <div className="md:col-span-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="font-bold text-slate-800">
                            Message Copy &amp; Placeholders
                          </label>
                          <span className="text-[10px] text-slate-400 font-mono">
                            SMS (160 Chars)
                          </span>
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-500 mb-1 font-semibold">
                            SMS Text Copy:
                          </div>
                          <textarea
                            rows={3}
                            value={trg.smsTemplate}
                            onChange={(e) =>
                              handleUpdateTriggerField(trg.id, 'smsTemplate', e.target.value)
                            }
                            className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-[11px] text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
                          />
                          <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
                            <span>Chars: {trg.smsTemplate.length}/160</span>
                            <span className="text-blue-600">SMS Segments: 1</span>
                          </div>
                        </div>

                        <div className="pt-1">
                          <div className="text-[10px] text-slate-500 mb-0.5 font-semibold">
                            Email Subject Line:
                          </div>
                          <input
                            type="text"
                            value={trg.emailSubjectTemplate}
                            onChange={(e) =>
                              handleUpdateTriggerField(trg.id, 'emailSubjectTemplate', e.target.value)
                            }
                            className="w-full px-2 py-1 rounded border border-slate-200 bg-white text-[11px] text-slate-800 font-medium"
                          />
                        </div>

                        <div className="text-[10px] text-slate-400 pt-0.5">
                          Available variables: <code className="text-blue-700">{`{student_name}`}</code>,{' '}
                          <code className="text-blue-700">{`{attendance_percentage}`}</code>,{' '}
                          <code className="text-blue-700">{`{consecutive_days}`}</code>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION: ADMINISTRATOR PROFILE & CREDENTIALS
          ========================================================================= */}
      {(activeTab === 'profile' || activeTab === 'all') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Administrator Profile */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Administrator Profile</span>
              </h3>
              <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Active Session
              </span>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={ADMIN_USER.avatarUrl}
                alt={profile.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
              />
              <div>
                <h4 className="text-base font-bold text-slate-900">{profile.name}</h4>
                <div className="text-xs text-slate-500">{profile.email}</div>
                <div className="text-xs font-semibold text-blue-600 mt-0.5">{profile.role}</div>
              </div>
            </div>

            <div className="space-y-3 text-xs pt-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Mobile Phone (SMS Gateway Alerts)</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-4 h-4 text-blue-600" />
                <span>Change Security Credentials</span>
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Current Administrative Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters with numbers & symbols"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setSaveToast('Administrative password updated successfully.');
                  setTimeout(() => setSaveToast(null), 3000);
                }}
                className="mt-2 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold transition-colors"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION: ROLE-BASED ACCESS CONTROL (RBAC)
          ========================================================================= */}
      {(activeTab === 'rbac' || activeTab === 'all') && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Role-Based Access Control (RBAC)</span>
            </h3>
            <span className="text-xs text-blue-600 font-semibold cursor-pointer hover:underline">
              + Assign Role
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3">Role Name</th>
                  <th className="py-2.5 px-3">Assigned Staff</th>
                  <th className="py-2.5 px-3">Privileges &amp; Permissions</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roles.map((r) => (
                  <tr key={r.role} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-bold text-slate-900">{r.role}</td>
                    <td className="py-3 px-3 text-slate-700">{r.users}</td>
                    <td className="py-3 px-3 text-slate-500 text-[11px] leading-relaxed">
                      {r.permissions}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION: CALCULATION RULES & DATA RETENTION
          ========================================================================= */}
      {(activeTab === 'rules' || activeTab === 'all') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Calculation Rules */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Attendance Calculation Rules</span>
              </h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <div>
                  <div className="font-bold text-slate-900">Late Mark Tolerance</div>
                  <div className="text-[11px] text-slate-500">
                    Entry after class scheduled start time
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={attendanceRules.lateThresholdMinutes}
                    onChange={(e) =>
                      setAttendanceRules({
                        ...attendanceRules,
                        lateThresholdMinutes: Number(e.target.value),
                      })
                    }
                    className="w-16 px-2 py-1 rounded border border-slate-200 font-mono text-center"
                  />
                  <span className="text-slate-500">mins</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <div>
                  <div className="font-bold text-slate-900">Minimum Class Dwell Duration</div>
                  <div className="text-[11px] text-slate-500">
                    Minimum duration needed for full attendance credit
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={attendanceRules.minDurationMinutes}
                    onChange={(e) =>
                      setAttendanceRules({
                        ...attendanceRules,
                        minDurationMinutes: Number(e.target.value),
                      })
                    }
                    className="w-16 px-2 py-1 rounded border border-slate-200 font-mono text-center"
                  />
                  <span className="text-slate-500">mins</span>
                </div>
              </div>
            </div>
          </div>

          {/* Data Retention & Privacy Settings */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Database className="w-4 h-4 text-blue-600" />
                <span>Data Retention &amp; Storage Archival</span>
              </h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Biometric Logs Retention</div>
                  <div className="text-[11px] text-slate-500">
                    Purge raw camera snapshot crops after semester conclusion
                  </div>
                </div>
                <span className="font-mono font-bold text-blue-700">1 Academic Year</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Database Mirroring</div>
                  <div className="text-[11px] text-slate-500">
                    PostgreSQL / Supabase nightly snapshot backup
                  </div>
                </div>
                <span className="font-mono text-emerald-700 font-bold">Enabled (02:00 AM)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          INTERACTIVE MODAL: TEST NOTIFICATION DISPATCHER
          ========================================================================= */}
      {testingTrigger && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Dispatch Real-Time Test Trigger
                  </h3>
                  <p className="text-xs text-slate-500">{testingTrigger.name}</p>
                </div>
              </div>
              <button
                onClick={() => setTestingTrigger(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 text-xs overflow-y-auto">
              <div className="space-y-2">
                <label className="font-bold text-slate-800 block">Select Delivery Channel:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTestChannel('sms')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      testChannel === 'sms'
                        ? 'border-emerald-500 bg-emerald-50/60 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="font-bold text-slate-900">SMS Gateway</div>
                      <div className="text-[10px] text-slate-500">{gatewayConfig.smsSenderId}</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTestChannel('email')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      testChannel === 'email'
                        ? 'border-blue-500 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Mail className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-bold text-slate-900">Email Relay</div>
                      <div className="text-[10px] text-slate-500">{gatewayConfig.senderEmail}</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-800 block">Target Test Recipient:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'parent', label: 'Parent / Guardian', info: '+91 98450 91823' },
                    { id: 'student', label: 'Student (Rahul)', info: 'rahul.k@student.edu' },
                    { id: 'mentor', label: 'Class Mentor', info: 'Prof. Amit Verma' },
                  ].map((rec) => (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={() => setTestRecipientType(rec.id as any)}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        testRecipientType === rec.id
                          ? 'border-blue-500 bg-blue-50/70 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-slate-900 text-[11px]">{rec.label}</div>
                      <div className="text-[10px] text-slate-400 truncate">{rec.info}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rendered Text Preview */}
              <div className="p-3 rounded-xl bg-slate-900 text-slate-200 space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span>LIVE FORMATTED PAYLOAD PREVIEW</span>
                  <span>{testChannel.toUpperCase()}</span>
                </div>
                {testChannel === 'sms' ? (
                  <p className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                    {testingTrigger.smsTemplate
                      .replace('{student_name}', 'Rahul Kumar')
                      .replace('{roll_no}', '24MCA042')
                      .replace('{attendance_percentage}', '68.5')
                      .replace('{consecutive_days}', '3')
                      .replace('{classroom_name}', 'MCA Lab 301')
                      .replace('{course_name}', 'MCA')
                      .replace('{mentor_name}', 'Prof. Amit Verma')}
                  </p>
                ) : (
                  <div className="space-y-1 text-slate-300">
                    <div className="text-blue-300 font-bold">
                      Subject:{' '}
                      {testingTrigger.emailSubjectTemplate
                        .replace('{student_name}', 'Rahul Kumar')
                        .replace('{roll_no}', '24MCA042')}
                    </div>
                    <p className="text-slate-400 text-[10px] whitespace-pre-wrap">
                      {testingTrigger.emailBodyTemplate
                        .replace('{student_name}', 'Rahul Kumar')
                        .replace('{roll_no}', '24MCA042')
                        .replace('{attendance_percentage}', '68.5')
                        .replace('{consecutive_days}', '3')
                        .replace('{mentor_name}', 'Prof. Amit Verma')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setTestingTrigger(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleSendTestNotification(testingTrigger)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Test {testChannel.toUpperCase()} Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATE NEW CUSTOM ATTENDANCE ALERT TRIGGER
          ========================================================================= */}
      {newTriggerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Add Custom Attendance Alert Trigger
                  </h3>
                  <p className="text-xs text-slate-500">
                    Define custom event thresholds, recipient lists, and message templates
                  </p>
                </div>
              </div>
              <button
                onClick={() => setNewTriggerModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTrigger} className="p-5 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Trigger Name / Rule Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lab Session Shortage Alert (< 80%)"
                  value={newTriggerForm.name}
                  onChange={(e) => setNewTriggerForm({ ...newTriggerForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Event Category</label>
                  <select
                    value={newTriggerForm.category}
                    onChange={(e) =>
                      setNewTriggerForm({ ...newTriggerForm, category: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="low_attendance">Low Attendance (&lt; %)</option>
                    <option value="prolonged_absence">Prolonged Absence (Days)</option>
                    <option value="consecutive_late">Consecutive Late Entries</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Threshold Cutoff</label>
                  <input
                    type="number"
                    value={newTriggerForm.thresholdValue}
                    onChange={(e) =>
                      setNewTriggerForm({
                        ...newTriggerForm,
                        thresholdValue: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rule Description &amp; Purpose
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain under what criteria this alert triggers..."
                  value={newTriggerForm.description}
                  onChange={(e) =>
                    setNewTriggerForm({ ...newTriggerForm, description: e.target.value })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Notification Channels:
                </label>
                <div className="flex items-center gap-5">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newTriggerForm.email}
                      onChange={(e) =>
                        setNewTriggerForm({ ...newTriggerForm, email: e.target.checked })
                      }
                      className="rounded text-blue-600"
                    />
                    <span>Email Notification</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newTriggerForm.sms}
                      onChange={(e) =>
                        setNewTriggerForm({ ...newTriggerForm, sms: e.target.checked })
                      }
                      className="rounded text-emerald-600"
                    />
                    <span>SMS Alert</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">SMS Template Copy</label>
                <textarea
                  rows={2}
                  value={newTriggerForm.smsTemplate}
                  onChange={(e) =>
                    setNewTriggerForm({ ...newTriggerForm, smsTemplate: e.target.value })
                  }
                  className="w-full p-2 rounded-lg border border-slate-200 font-mono text-[11px] resize-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setNewTriggerModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-sm"
                >
                  Save Trigger Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
