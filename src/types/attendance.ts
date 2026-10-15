/**
 * Data types for Smart Classroom Attendance Management System Using Face Recognition
 */

export type PersonType = 'student' | 'teacher';

export type AttendanceStatus = 'present' | 'late' | 'early_exit' | 'inside' | 'absent';

export type EventType = 'entry' | 'exit';

export type FaceRegistrationStatus = 'registered' | 'pending' | 'failed';

export interface Student {
  id: string; // e.g. "STU-2024-042"
  name: string;
  email: string;
  phone: string;
  course: string; // e.g. "MCA", "B.Tech CSE", "BCA", "M.Tech"
  section: string; // e.g. "MCA-II A", "CSE-IV B"
  attendancePercentage: number;
  faceRegistered: boolean;
  avatarUrl: string;
  rollNo: string;
  totalClasses: number;
  attendedClasses: number;
  lastSeen?: string;
  statusToday: AttendanceStatus;
}

export interface Teacher {
  id: string; // e.g. "TCH-108"
  name: string;
  email: string;
  phone: string;
  department: string; // e.g. "Computer Science & Engineering", "Information Technology", "Mathematics"
  designation: string; // e.g. "Associate Professor", "Assistant Professor", "Head of Department"
  attendanceStatus: 'present' | 'on_leave' | 'absent' | 'inside';
  faceRegistered: boolean;
  avatarUrl: string;
  cabinNo: string;
  assignedClassrooms: string[];
  lastSeen?: string;
}

export interface AttendanceRecord {
  id: string;
  personName: string;
  personId: string;
  personType: PersonType;
  classroom: string;
  classroomId: string;
  date: string; // YYYY-MM-DD
  entryTime: string; // e.g. "09:00 AM"
  exitTime?: string; // e.g. "10:30 AM" or "-"
  duration: string; // e.g. "1h 30m"
  status: AttendanceStatus;
  confidenceScore: number; // e.g. 98.4%
  cameraSource: string; // e.g. "Entrance Cam 01"
  snapshotUrl?: string;
  verifiedBy: 'face_recognition_ai' | 'manual_override';
}

export interface LiveFaceEvent {
  id: string;
  timestamp: string; // HH:MM:SS AM/PM
  personName: string;
  personId: string;
  personType: PersonType;
  eventType: EventType;
  classroomId: string;
  classroomName: string;
  confidence: number;
  avatarUrl: string;
  status: 'verified' | 'unknown' | 'duplicate_ignored' | 'error';
  rawBoundingBox?: { x: number; y: number; width: number; height: number };
}

export interface Classroom {
  id: string;
  name: string;
  building: string;
  floor: string;
  assignedCamera: string;
  cameraStatus: 'online' | 'offline' | 'warning';
  currentOccupancy: number;
  maxCapacity: number;
  registeredStudentsCount: number;
  currentSubject?: string;
  currentFaculty?: string;
}

export interface DetectionZone {
  id: string;
  name: string;
  type: 'entrance' | 'exit' | 'exclusion';
  color: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  width: number; // percentage
  height: number; // percentage
  enabled: boolean;
}

export interface FaceRecognitionConfig {
  activeCameraId: string;
  // Detection Sensitivity Options
  detectionModel: 'yolov8_face' | 'mtcnn' | 'retinaface';
  detectionSensitivity: 'low' | 'medium' | 'high';
  sensitivityScore: number; // 0.1 to 0.9 confidence threshold for face detection candidate proposal
  minFaceSizePx: number; // e.g. 48px to 160px
  nmsThreshold: number; // Non-Maximum Suppression IoU threshold (0.3 - 0.7)
  multiScalePyramid: boolean;

  // Recognition Confidence Thresholds
  confidenceThreshold: number; // e.g. 85 (85%)
  strictSecurityMode: boolean;
  distanceMetric: 'cosine' | 'euclidean' | 'arcface';
  consecutiveFramesRequired: number; // 1 to 5 frames
  livenessDetection: boolean;
  livenessThreshold: number; // e.g. 80%

  // Duplicate Prevention & Timing
  duplicateWindowMinutes: number; // e.g. 15 minutes buffer
  trackingMode: 'dual_camera' | 'directional_motion' | 'manual_prompt';

  // Unknown Face Behavior
  unknownFaceAction: 'log_alert' | 'sound_alarm' | 'visitor_kiosk' | 'ignore';
  unknownSnapshotRetentionDays: number; // 7, 14, 30, 90
  unknownDebounceSeconds: number; // 10 to 120s buffer
  autoEnrollUnknownQueue: boolean;

  // Detection Zones (ROIs)
  detectionZonePreset: 'doorway_split' | 'full_frame' | 'hallway_exclusion' | 'custom';
  zones: DetectionZone[];
  directionalVector: 'inward' | 'outward' | 'bidirectional';

  // Display & Visualization Overlays
  showBoundingBoxes: boolean; // visually highlight detected faces and their associated identity label on live feed

  // Biometrics & Storage
  saveSnapshots: boolean;
  biometricConsentAcknowledged: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'dept_head' | 'lab_incharge' | 'attendance_officer';
  department: string;
  avatarUrl: string;
  lastLogin: string;
}

export interface SecurityIncident {
  id: string;
  timestamp: string;
  date: string;
  cameraChannel: string;
  classroomName: string;
  classroomId: string;
  severity: 'critical' | 'high' | 'medium';
  type: 'repeated_unknown_face' | 'unauthorized_access' | 'liveness_failed';
  repeatCount: number;
  confidenceScore: number;
  snapshotUrl?: string;
  status: 'unresolved' | 'investigating' | 'resolved';
  notes: string;
}

export interface AttendanceAlertTrigger {
  id: string;
  name: string;
  category: 'low_attendance' | 'prolonged_absence' | 'consecutive_late' | 'faculty_absence';
  description: string;
  enabled: boolean;
  channels: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  recipients: {
    student: boolean;
    parent: boolean;
    mentor: boolean;
    hod: boolean;
  };
  thresholdValue: number;
  unit: string;
  frequency: 'realtime' | 'daily' | 'weekly';
  emailSubjectTemplate: string;
  emailBodyTemplate: string;
  smsTemplate: string;
  lastTriggered?: string;
  triggersCount: number;
}

export type UserRole = 'admin' | 'teacher' | 'student';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  canMakeChanges: boolean; // admin has master permission to make changes, teacher has course editing
  password?: string;
  department?: string;
  course?: string;
  section?: string;
  rollNo?: string;
  designation?: string;
  cabinNo?: string;
  phone?: string;
  lastLogin?: string;
  studentId?: string;
  teacherId?: string;
}
