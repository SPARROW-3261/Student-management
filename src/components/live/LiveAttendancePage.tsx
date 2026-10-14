import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Video,
  VideoOff,
  UserCheck,
  UserX,
  Scan,
  ShieldCheck,
  ArrowRightCircle,
  ArrowLeftCircle,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Info,
  Maximize2,
  Sliders,
  Play,
  Pause,
  ShieldAlert,
  AlertOctagon,
  Volume2,
  VolumeX,
  FileText,
  CheckCircle2,
  X,
  Clock,
  ArrowRight,
  ExternalLink,
  Shield,
  Radio,
  Send,
  Lock,
  Eye,
  Check,
  HelpCircle,
  Cpu,
  Monitor,
} from 'lucide-react';
import { LiveFaceEvent, SecurityIncident } from '../../types/attendance';
import { INITIAL_SECURITY_INCIDENTS } from '../../data/mockData';

export interface UnauthorizedAlert {
  id: string;
  incidentId: string;
  repeatCount: number;
  timestamp: string;
  location: string;
  confidence: number;
  severity: 'critical' | 'high';
  message: string;
}

interface LiveAttendancePageProps {
  events: LiveFaceEvent[];
  onAddEvent: (event: LiveFaceEvent) => void;
  classroomOccupancy: number;
  onUpdateOccupancy: (delta: number) => void;
  showBoundingBoxes?: boolean;
  securityIncidents?: SecurityIncident[];
  onAddSecurityIncident?: (incident: SecurityIncident) => void;
}

export const LiveAttendancePage: React.FC<LiveAttendancePageProps> = ({
  events,
  onAddEvent,
  classroomOccupancy,
  onUpdateOccupancy,
  showBoundingBoxes = true,
  securityIncidents,
  onAddSecurityIncident,
}) => {
  const [cameraOnline, setCameraOnline] = useState<boolean>(true);
  const [useRealWebcam, setUseRealWebcam] = useState<boolean>(false);
  const [isVirtualWebcam, setIsVirtualWebcam] = useState<boolean>(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [selectedPerson, setSelectedPerson] = useState<LiveFaceEvent | null>(events[0] || null);
  const [peopleInFrame, setPeopleInFrame] = useState<number>(2);
  const [localShowBoundingBoxes, setLocalShowBoundingBoxes] = useState<boolean>(showBoundingBoxes);

  // Pre-Check Modal & Hardware Camera States
  const [isPreCheckModalOpen, setIsPreCheckModalOpen] = useState<boolean>(false);
  const [preCheckStep, setPreCheckStep] = useState<'info' | 'troubleshoot'>('info');
  const [isRequestingCamera, setIsRequestingCamera] = useState<boolean>(false);
  const [cameraPermissionState, setCameraPermissionState] = useState<'checking' | 'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [selectedResolution, setSelectedResolution] = useState<'720p' | '1080p' | '480p'>('720p');

  // Security Incident & Visual Notification States
  const [localIncidents, setLocalIncidents] = useState<SecurityIncident[]>(
    securityIncidents || INITIAL_SECURITY_INCIDENTS
  );
  const [activeStreamTab, setActiveStreamTab] = useState<'events' | 'security'>('events');
  const [unauthorizedAlert, setUnauthorizedAlert] = useState<UnauthorizedAlert | null>(null);
  const [toastCountdown, setToastCountdown] = useState<number>(8);
  const [isToastPaused, setIsToastPaused] = useState<boolean>(false);
  const [soundAlertEnabled, setSoundAlertEnabled] = useState<boolean>(true);
  const [dispatchedFeedback, setDispatchedFeedback] = useState<string | null>(null);
  const [inspectingIncident, setInspectingIncident] = useState<SecurityIncident | null>(null);

  // Sliding window tracker for unknown face detections (25s window)
  const unknownHistoryRef = useRef<number[]>([]);
  const REPEAT_WINDOW_MS = 25000;

  // Sync with prop if it changes
  useEffect(() => {
    setLocalShowBoundingBoxes(showBoundingBoxes);
  }, [showBoundingBoxes]);

  useEffect(() => {
    if (securityIncidents) {
      setLocalIncidents(securityIncidents);
    }
  }, [securityIncidents]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop webcam stream when unmounting or switching back
  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  // Toast Auto-Dismiss countdown timer (with pause on hover)
  useEffect(() => {
    if (!unauthorizedAlert) return;
    if (isToastPaused) return;

    const timer = setInterval(() => {
      setToastCountdown((prev) => {
        if (prev <= 1) {
          setUnauthorizedAlert(null);
          return 8;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [unauthorizedAlert, isToastPaused]);

  // Audio warning chime using Web Audio API
  const playWarningChime = () => {
    if (!soundAlertEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      osc.frequency.setValueAtTime(650, ctx.currentTime + 0.2);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Audio autoplay policy catch
    }
  };

  // Ensure video element receives stream as soon as useRealWebcam is enabled
  useEffect(() => {
    if (useRealWebcam && !isVirtualWebcam && videoRef.current && streamRef.current) {
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch((err) => console.warn('Webcam video play error:', err));
      }
    }
  }, [useRealWebcam, isVirtualWebcam]);

  // Camera permission pre-check scanner
  const checkCameraPermissions = async () => {
    if (!navigator?.mediaDevices) {
      setCameraPermissionState('unsupported');
      return;
    }

    try {
      if (navigator.permissions && (navigator.permissions as any).query) {
        try {
          const res = await (navigator.permissions as any).query({ name: 'camera' });
          setCameraPermissionState(res.state);
          res.onchange = () => {
            setCameraPermissionState(res.state);
          };
        } catch {
          setCameraPermissionState('prompt');
        }
      } else {
        setCameraPermissionState('prompt');
      }
    } catch {
      setCameraPermissionState('prompt');
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');
      setAvailableCameras(videoDevices);
      if (videoDevices.length > 0 && !selectedCameraId) {
        setSelectedCameraId(videoDevices[0].deviceId);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isPreCheckModalOpen) {
      checkCameraPermissions();
    }
  }, [isPreCheckModalOpen]);

  // Start real physical webcam with fallback constraints and error diagnosis
  const startRealWebcam = async (resolution = selectedResolution, deviceId = selectedCameraId) => {
    setIsRequestingCamera(true);
    setWebcamError(null);
    stopWebcam();

    if (!navigator?.mediaDevices?.getUserMedia) {
      setIsRequestingCamera(false);
      setCameraPermissionState('unsupported');
      setWebcamError(
        'Webcam access (navigator.mediaDevices.getUserMedia) is not supported in this browser or iframe context. You can use the Interactive Virtual Camera feed instead.'
      );
      setPreCheckStep('troubleshoot');
      return false;
    }

    const resConfig = {
      '1080p': { width: { ideal: 1920, min: 640 }, height: { ideal: 1080, min: 480 } },
      '720p': { width: { ideal: 1280, min: 320 }, height: { ideal: 720, min: 240 } },
      '480p': { width: { ideal: 640, min: 320 }, height: { ideal: 480, min: 240 } },
    }[resolution];

    const attempts: MediaStreamConstraints[] = [
      // 1. With deviceId & ideal resolution
      {
        video: {
          ...(deviceId ? { deviceId: { exact: deviceId } } : { facingMode: 'user' }),
          ...resConfig,
        },
        audio: false,
      },
      // 2. Without deviceId, facingMode user
      {
        video: {
          facingMode: 'user',
        },
        audio: false,
      },
      // 3. Fallback: simple video boolean
      {
        video: true,
        audio: false,
      },
    ];

    let stream: MediaStream | null = null;
    let caughtErr: any = null;

    for (const constraint of attempts) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraint);
        if (stream) break;
      } catch (err: any) {
        caughtErr = err;
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          // Explicitly denied - do not hammer user
          break;
        }
      }
    }

    setIsRequestingCamera(false);

    if (stream) {
      streamRef.current = stream;
      setUseRealWebcam(true);
      setIsVirtualWebcam(false);
      setCameraOnline(true);
      setCameraPermissionState('granted');
      setWebcamError(null);
      setIsPreCheckModalOpen(false);

      // Re-enumerate to get device labels now that permission is active
      try {
        const devs = await navigator.mediaDevices.enumerateDevices();
        const vDevs = devs.filter((d) => d.kind === 'videoinput');
        setAvailableCameras(vDevs);
      } catch {}

      if (videoRef.current) {
        videoRef.current.muted = true;
        videoRef.current.defaultMuted = true;
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch((err) => console.warn('Video play catch:', err));
      }
      return true;
    } else {
      let errorMsg = 'Unable to access local camera stream.';
      if (caughtErr?.name === 'NotAllowedError' || caughtErr?.name === 'PermissionDeniedError') {
        setCameraPermissionState('denied');
        errorMsg =
          'Camera permission was denied by browser or iframe policy. Please allow camera permissions in your browser address bar or use the Virtual Camera Feed.';
      } else if (caughtErr?.name === 'NotFoundError' || caughtErr?.name === 'DevicesNotFoundError') {
        errorMsg = 'No camera hardware detected on this device. You can test using the Virtual Camera feed instead.';
      } else if (caughtErr?.name === 'NotReadableError' || caughtErr?.name === 'TrackStartError') {
        errorMsg =
          'Camera is currently in use by another application or browser tab. Please close other camera tabs and try again.';
      } else {
        errorMsg = `Camera error: ${caughtErr?.message || caughtErr?.name || 'Unknown error'}. You can test using the Virtual Camera feed instead.`;
      }
      setWebcamError(errorMsg);
      setPreCheckStep('troubleshoot');
      return false;
    }
  };

  const handleStartVirtualCamera = () => {
    stopWebcam();
    setUseRealWebcam(true);
    setIsVirtualWebcam(true);
    setCameraOnline(true);
    setWebcamError(null);
    setIsPreCheckModalOpen(false);
  };

  const handleToggleWebcam = () => {
    if (useRealWebcam) {
      stopWebcam();
      setUseRealWebcam(false);
      setIsVirtualWebcam(false);
      setWebcamError(null);
    } else {
      // Launch Pre-Check Modal before attempting to load the feed!
      setPreCheckStep('info');
      setWebcamError(null);
      setIsPreCheckModalOpen(true);
    }
  };

  // Trigger Unauthorized Alert Toast and Log Security Incident
  const triggerUnauthorizedNotification = (count: number, faceEvent: LiveFaceEvent) => {
    const incId = `SEC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const newAlert: UnauthorizedAlert = {
      id: `ALERT-${Date.now()}`,
      incidentId: incId,
      repeatCount: count,
      timestamp: timeStr,
      location: faceEvent.classroomName || 'MCA Advanced Lab 301',
      confidence: faceEvent.confidence || 41.2,
      severity: count >= 3 ? 'critical' : 'high',
      message: `Repeated unknown face detected (${count} times in 25s window). No matching biometric profile in university database.`,
    };

    setUnauthorizedAlert(newAlert);
    setToastCountdown(8);
    playWarningChime();

    // Log the security incident
    const newIncident: SecurityIncident = {
      id: incId,
      timestamp: timeStr,
      date: now.toISOString().split('T')[0],
      cameraChannel: 'Entrance Cam 01',
      classroomName: faceEvent.classroomName || 'MCA Advanced Lab 301',
      classroomId: faceEvent.classroomId || 'CR-301',
      severity: count >= 3 ? 'critical' : 'high',
      type: 'repeated_unknown_face',
      repeatCount: count,
      confidenceScore: faceEvent.confidence || 41.2,
      status: 'unresolved',
      notes: `Unregistered face detected ${count} times within 25-second window at classroom entrance doorway. Automated anti-intrusion trigger activated.`,
    };

    if (onAddSecurityIncident) {
      onAddSecurityIncident(newIncident);
    }
    setLocalIncidents((prev) => [newIncident, ...prev]);
  };

  // Preset event triggers for project demo
  const triggerSimulatedEvent = (
    type: 'entry_rahul' | 'exit_priya' | 'entry_amit' | 'unknown' | 'repeat_unknown'
  ) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    let newEvent: LiveFaceEvent;

    if (type === 'entry_rahul') {
      newEvent = {
        id: `EVT-${Date.now()}`,
        timestamp: timeStr,
        personName: 'Rahul Kumar',
        personId: 'STU-2024-042',
        personType: 'student',
        eventType: 'entry',
        classroomId: 'CR-301',
        classroomName: 'MCA Advanced Lab 301',
        confidence: 98.8,
        avatarUrl: '/src/assets/images/avatar_student_rahul_1791905718978.jpg',
        status: 'verified',
        rawBoundingBox: { x: 38, y: 22, width: 24, height: 32 },
      };
      onUpdateOccupancy(1);
    } else if (type === 'exit_priya') {
      newEvent = {
        id: `EVT-${Date.now()}`,
        timestamp: timeStr,
        personName: 'Priya Sharma',
        personId: 'STU-2024-018',
        personType: 'student',
        eventType: 'exit',
        classroomId: 'CR-301',
        classroomName: 'MCA Advanced Lab 301',
        confidence: 99.1,
        avatarUrl: '/src/assets/images/avatar_student_priya_1791905720259.jpg',
        status: 'verified',
        rawBoundingBox: { x: 50, y: 24, width: 24, height: 30 },
      };
      onUpdateOccupancy(-1);
    } else if (type === 'entry_amit') {
      newEvent = {
        id: `EVT-${Date.now()}`,
        timestamp: timeStr,
        personName: 'Prof. Amit Verma',
        personId: 'TCH-108',
        personType: 'teacher',
        eventType: 'entry',
        classroomId: 'CR-301',
        classroomName: 'MCA Advanced Lab 301',
        confidence: 99.4,
        avatarUrl: '/src/assets/images/avatar_teacher_amit_1791905720315.jpg',
        status: 'verified',
        rawBoundingBox: { x: 32, y: 20, width: 26, height: 34 },
      };
      onUpdateOccupancy(1);
    } else {
      // Unknown person detection
      newEvent = {
        id: `EVT-${Date.now()}`,
        timestamp: timeStr,
        personName: 'Unknown Person',
        personId: 'UNREGISTERED',
        personType: 'student',
        eventType: 'entry',
        classroomId: 'CR-301',
        classroomName: 'MCA Advanced Lab 301',
        confidence: 42.1,
        avatarUrl: '',
        status: 'unknown',
        rawBoundingBox: { x: 60, y: 28, width: 22, height: 26 },
      };

      // Process repeat unknown sliding window check
      const nowMs = Date.now();
      const recent = unknownHistoryRef.current.filter((t) => nowMs - t < REPEAT_WINDOW_MS);
      const updatedHistory = [...recent, nowMs];

      if (type === 'repeat_unknown') {
        // Guarantee at least 2 in the window for fast demo testing
        if (updatedHistory.length < 2) {
          updatedHistory.unshift(nowMs - 6000);
        }
      }

      unknownHistoryRef.current = updatedHistory;
      const count = updatedHistory.length;

      // If detected repeatedly (2 or more times within 25 seconds), trigger warning & log incident!
      if (count >= 2) {
        triggerUnauthorizedNotification(count, newEvent);
      }
    }

    onAddEvent(newEvent);
    setSelectedPerson(newEvent);
    setPeopleInFrame(newEvent.status === 'unknown' ? 3 : 2);
  };

  const handleDispatchSecurity = (incidentId: string) => {
    setDispatchedFeedback(
      `Campus Security Console notified for Incident #${incidentId}. Entrance kiosk chime activated.`
    );
    setTimeout(() => setDispatchedFeedback(null), 4000);
  };

  const handleResolveIncident = (id: string) => {
    setLocalIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: 'resolved' } : inc))
    );
    if (inspectingIncident && inspectingIncident.id === id) {
      setInspectingIncident((prev) => (prev ? { ...prev, status: 'resolved' } : null));
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* =========================================================================
          HIGH-VISIBILITY 'UNAUTHORIZED' WARNING TOAST (Visual Notification System)
          ========================================================================= */}
      {unauthorizedAlert && (
        <div
          onMouseEnter={() => setIsToastPaused(true)}
          onMouseLeave={() => setIsToastPaused(false)}
          className="fixed top-20 right-4 sm:right-8 z-50 max-w-lg w-full bg-slate-950/95 text-white rounded-2xl border-2 border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.4)] p-4 sm:p-5 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-200"
        >
          {/* Top warning line & header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/50 text-rose-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-rose-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-rose-400 font-mono">
                    SECURITY WARNING
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-900/90 text-rose-200 border border-rose-600 uppercase">
                    UNAUTHORIZED PERSON
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/60 text-slate-300">
                    {unauthorizedAlert.severity.toUpperCase()}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  Repeated Unknown Face Detected
                </h4>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>Incident ID: {unauthorizedAlert.incidentId}</span>
                  <span>·</span>
                  <span>{unauthorizedAlert.location}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setUnauthorizedAlert(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              title="Dismiss warning"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Alert Body */}
          <div className="mt-3 text-xs text-slate-300 leading-relaxed bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/30">
            <p>
              An unregistered face was detected{' '}
              <strong className="text-rose-300 font-semibold">
                {unauthorizedAlert.repeatCount} times within 25 seconds
              </strong>{' '}
              at the entrance doorway. No matching biometric profile found in student or faculty rosters.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-300">
              <span className="text-rose-300">Confidence: {unauthorizedAlert.confidence}%</span>
              <span>·</span>
              <span>Channel: Entrance Cam 01</span>
              <span>·</span>
              <span className="text-emerald-400">Audit Log: Recorded</span>
            </div>
          </div>

          {/* Interactive Action Controls */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveStreamTab('security');
                  setUnauthorizedAlert(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Security Log</span>
              </button>

              <button
                onClick={() => handleDispatchSecurity(unauthorizedAlert.incidentId)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3 h-3 text-rose-400" />
                <span>Dispatch Guard Alert</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              {isToastPaused ? 'Auto-dismiss paused' : `Auto-dismiss in ${toastCountdown}s`}
            </div>
          </div>

          {/* Progress bar countdown */}
          <div className="h-1 bg-slate-800/80 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-rose-500 transition-all duration-1000 ease-linear"
              style={{ width: `${(toastCountdown / 8) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Dispatched Notification Feedback */}
      {dispatchedFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{dispatchedFeedback}</span>
          </div>
          <button
            onClick={() => setDispatchedFeedback(null)}
            className="text-emerald-600 hover:text-emerald-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Notice / Status bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-3 h-3 rounded-full ${
              cameraOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>Channel: Entrance Cam 01 (RTSP Stream)</span>
              <span className="text-[11px] font-mono text-slate-500">· 192.168.1.104:554</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Assigned Zone: <strong>MCA Advanced Lab 301 (3rd Floor)</strong>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Audio Chime Mute/Unmute */}
          <button
            onClick={() => setSoundAlertEnabled(!soundAlertEnabled)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              soundAlertEnabled
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
            }`}
            title="Toggle audio alarm chime"
          >
            {soundAlertEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundAlertEnabled ? 'Alarm Sound: ON' : 'Alarm Sound: MUTED'}</span>
          </button>

          {/* Toggle Online/Offline */}
          <button
            onClick={() => setCameraOnline(!cameraOnline)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
              cameraOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
          >
            {cameraOnline ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
            <span>{cameraOnline ? 'Camera Online' : 'Camera Disconnected'}</span>
          </button>

          {/* Toggle Real Webcam */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleWebcam}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                useRealWebcam
                  ? isVirtualWebcam
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>
                {useRealWebcam
                  ? isVirtualWebcam
                    ? 'Virtual Webcam Active'
                    : 'Local Webcam Active'
                  : 'Test Real Webcam'}
              </span>
            </button>

            {useRealWebcam && (
              <button
                type="button"
                onClick={() => {
                  setPreCheckStep('info');
                  setIsPreCheckModalOpen(true);
                }}
                className="px-2 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors"
                title="Camera Permissions & Device Settings"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Toggle Bounding Box Visualization */}
          <button
            onClick={() => setLocalShowBoundingBoxes(!localShowBoundingBoxes)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              localShowBoundingBoxes
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
            }`}
            title="Toggle Bounding Box Visualization & Identity Labels"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>{localShowBoundingBoxes ? 'Bounding Boxes: ON' : 'Bounding Boxes: OFF'}</span>
          </button>

          {/* Toggle Scanline */}
          <button
            onClick={() => setIsScanning(!isScanning)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 flex items-center gap-1.5"
          >
            {isScanning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isScanning ? 'Inference Running' : 'Inference Paused'}</span>
          </button>
        </div>
      </div>

      {webcamError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{webcamError}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleStartVirtualCamera}
              className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg font-bold text-[11px] transition-colors"
            >
              Use Virtual Camera
            </button>
            <button
              type="button"
              onClick={() => {
                setPreCheckStep('troubleshoot');
                setIsPreCheckModalOpen(true);
              }}
              className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg font-semibold text-[11px] transition-colors"
            >
              Permissions Guide
            </button>
            <button
              type="button"
              onClick={() => setWebcamError(null)}
              className="text-amber-600 hover:text-amber-800 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Video Viewport (2 Cols) + Active Profile & Analytics (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Viewport (Left / Top 2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex items-center justify-center">
            {cameraOnline ? (
              <>
                {/* Real Webcam video feed OR Virtual Camera feed OR Simulated entrance feed */}
                {useRealWebcam ? (
                  !isVirtualWebcam ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
                      <video
                        ref={(el) => {
                          videoRef.current = el;
                          if (el) {
                            el.muted = true;
                            el.defaultMuted = true;
                            if (streamRef.current && el.srcObject !== streamRef.current) {
                              el.srcObject = streamRef.current;
                              el.play().catch((err) => console.warn('Webcam play error:', err));
                            }
                          }
                        }}
                        onLoadedMetadata={(e) => {
                          const v = e.currentTarget;
                          v.muted = true;
                          v.play().catch(() => {});
                        }}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform -scale-x-100"
                      />

                      {/* Live Facial Detection Overlay on Real Webcam */}
                      {localShowBoundingBoxes && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="relative w-44 h-52 sm:w-56 sm:h-64 rounded-2xl border-2 border-emerald-400 bg-emerald-500/10 shadow-[0_0_25px_rgba(52,211,153,0.35)] flex flex-col items-center justify-between p-2.5 animate-in fade-in duration-150">
                            {/* Corner Markers */}
                            <span className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-300"></span>
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-300"></span>
                            <span className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-300"></span>
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-300"></span>

                            <div className="w-full flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 uppercase">
                                LIVE WEBCAM INFERENCE
                              </span>
                              <span className="text-[9px] font-mono text-emerald-400 bg-black/70 px-1.5 py-0.5 rounded border border-white/10">
                                98.8% MATCH
                              </span>
                            </div>

                            <div className="px-3 py-1 bg-black/85 backdrop-blur-md rounded-lg border border-emerald-500/40 text-center shadow-lg">
                              <div className="text-xs font-bold text-white flex items-center gap-1 justify-center">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span>Rahul Kumar (STU-042)</span>
                              </div>
                              <div className="text-[10px] font-mono text-emerald-300">
                                Verified Identity · Entry Recorded
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden">
                      {/* Interactive Virtual Camera Feed Canvas */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-indigo-950/40 to-slate-900 pointer-events-none" />

                      {/* Animated subject representation with active landmarks */}
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.35)]">
                          <img
                            src={selectedPerson?.avatarUrl || '/src/assets/images/avatar_student_rahul_1791905718978.jpg'}
                            alt={selectedPerson?.personName || 'Student'}
                            className="w-full h-full object-cover"
                          />
                          {localShowBoundingBoxes && (
                            <div className="absolute inset-0 pointer-events-none">
                              <span className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-400"></span>
                              <span className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-400"></span>
                              <span className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-400"></span>
                              <span className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-400"></span>
                              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-400/40 animate-pulse"></div>
                            </div>
                          )}
                        </div>

                        {/* Floating Identity & Inference HUD */}
                        {localShowBoundingBoxes && (
                          <div className="mt-2.5 px-3 py-1 bg-black/85 backdrop-blur-md rounded-xl border border-emerald-500/40 text-center shadow-xl">
                            <div className="text-xs font-bold text-white flex items-center gap-1.5 justify-center">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span>{selectedPerson?.personName || 'Rahul Kumar (STU-042)'}</span>
                            </div>
                            <div className="text-[10px] font-mono text-emerald-300 mt-0.5">
                              Virtual Camera · 99.2% Facial Landmark Match
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Virtual Camera HUD Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-2 z-20 pointer-events-none">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-900/90 text-indigo-200 border border-indigo-500/60 uppercase">
                          VIRTUAL WEBCAM · 1080P 30FPS
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/70 text-slate-300 border border-white/10">
                          FPS: 29.8 · LATENCY: 14ms
                        </span>
                      </div>

                      {/* Switch to real camera trigger button inside HUD */}
                      <button
                        type="button"
                        onClick={() => {
                          setPreCheckStep('info');
                          setIsPreCheckModalOpen(true);
                        }}
                        className="absolute bottom-3 right-3 z-20 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold border border-slate-700 shadow-md flex items-center gap-1.5 transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5 text-blue-400" />
                        <span>Switch to Hardware Camera</span>
                      </button>
                    </div>
                  )
                ) : (
                  <div className="relative w-full h-full bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center overflow-hidden">
                    {/* Simulated Background classroom door entrance environment */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                      <div className="absolute inset-y-0 left-1/4 w-0.5 bg-slate-700"></div>
                      <div className="absolute inset-y-0 right-1/4 w-0.5 bg-slate-700"></div>
                      <div className="absolute top-1/3 inset-x-0 h-0.5 bg-slate-700"></div>
                      <div className="absolute top-8 left-1/2 -translate-x-1/2 px-4 py-1 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono text-[10px]">
                        CLASSROOM 301 · ENTRANCE THRESHOLD
                      </div>
                    </div>

                    {/* Person currently being recognized in the feed */}
                    {selectedPerson && selectedPerson.status === 'verified' && (
                      <div className="relative z-10 flex flex-col items-center">
                        <div
                          className={`relative w-44 h-44 rounded-2xl overflow-hidden transition-all ${
                            localShowBoundingBoxes
                              ? 'border-2 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]'
                              : 'border border-slate-700/80 shadow-md'
                          }`}
                        >
                          <img
                            src={selectedPerson.avatarUrl}
                            alt={selectedPerson.personName}
                            className="w-full h-full object-cover"
                          />
                          {/* Face Landmark Bounding Box Overlay (when enabled) */}
                          {localShowBoundingBoxes && (
                            <div className="absolute inset-0 border border-emerald-400/80 pointer-events-none">
                              <span className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-300"></span>
                              <span className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-300"></span>
                              <span className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-300"></span>
                              <span className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-300"></span>
                            </div>
                          )}
                        </div>

                        {/* Floating recognition banner (when enabled) */}
                        {localShowBoundingBoxes && (
                          <div className="mt-2.5 px-3 py-1 bg-emerald-950/90 border border-emerald-500/80 rounded-lg text-center backdrop-blur-sm shadow-md animate-in fade-in duration-150">
                            <div className="text-xs font-bold text-emerald-200">
                              {selectedPerson.personName} ({selectedPerson.personId})
                            </div>
                            <div className="text-[10px] font-mono text-emerald-400">
                              Match: {selectedPerson.confidence}% · {selectedPerson.eventType.toUpperCase()}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedPerson && selectedPerson.status === 'unknown' && (
                      <div className="relative z-10 flex flex-col items-center">
                        <div
                          className={`relative w-44 h-44 rounded-xl flex items-center justify-center transition-all ${
                            localShowBoundingBoxes
                              ? 'bg-rose-950/60 border-2 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.4)]'
                              : 'bg-slate-900 border border-slate-700 shadow-md'
                          }`}
                        >
                          <UserX
                            className={`w-16 h-16 ${
                              localShowBoundingBoxes ? 'text-rose-400 animate-pulse' : 'text-slate-500'
                            }`}
                          />
                          {localShowBoundingBoxes && (
                            <div className="absolute inset-0 border border-rose-500/80 pointer-events-none">
                              <span className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-rose-400"></span>
                              <span className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-rose-400"></span>
                              <span className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-rose-400"></span>
                              <span className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-rose-400"></span>
                            </div>
                          )}
                        </div>

                        {localShowBoundingBoxes && (
                          <div className="mt-2.5 px-3 py-1 bg-rose-950/90 border border-rose-500 rounded-lg text-center backdrop-blur-sm shadow-md animate-in fade-in duration-150">
                            <div className="text-xs font-bold text-rose-200 flex items-center gap-1.5 justify-center">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                              <span>UNKNOWN FACE DETECTED</span>
                            </div>
                            <div className="text-[10px] font-mono text-rose-300">
                              Confidence &lt; 50% · Unregistered Visitor
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Animated Scanner Laser Overlay */}
                {isScanning && (
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-[bounce_3s_infinite] pointer-events-none opacity-80" />
                )}

                {/* HUD Top Bar */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between text-xs text-white/90 pointer-events-none">
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 font-mono text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    <span className="text-red-400 font-bold">REC</span>
                    <span>1080p @ 30.0 FPS</span>
                  </div>

                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 font-mono text-[11px]">
                    <Scan className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Faces in View: <strong className="text-cyan-300">{peopleInFrame}</strong></span>
                  </div>
                </div>

                {/* HUD Bottom Bar */}
                <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-[11px] font-mono text-white/80 pointer-events-none">
                  <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                    Model: YOLOv8-Face + FaceNet-512 · Latency: 34ms
                  </div>
                  <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-emerald-400">
                    Dual Gate Inward Tracking
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center p-8 space-y-3">
                <VideoOff className="w-16 h-16 text-rose-500 mx-auto" />
                <div className="text-base font-bold text-white">Camera Disconnected</div>
                <p className="text-xs text-slate-400 max-w-sm">
                  Failed to establish RTSP socket connection to Entrance Cam 01 (192.168.1.104). Check PoE network switch or camera power supply.
                </p>
                <button
                  onClick={() => setCameraOnline(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
                >
                  Reconnect Camera Stream
                </button>
              </div>
            )}
          </div>

          {/* Quick Simulation Demonstration Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm space-y-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Presentation Demonstration Controls</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Simulate Entrance &amp; Security Intrusion Scenarios
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              <button
                onClick={() => triggerSimulatedEvent('entry_rahul')}
                className="p-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left transition-colors"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800">
                  <ArrowRightCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Rahul (Entry)</span>
                </div>
                <div className="text-[10px] text-emerald-600 font-mono mt-0.5">
                  98.8% · Student
                </div>
              </button>

              <button
                onClick={() => triggerSimulatedEvent('exit_priya')}
                className="p-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-left transition-colors"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-blue-800">
                  <ArrowLeftCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span>Priya (Exit)</span>
                </div>
                <div className="text-[10px] text-blue-600 font-mono mt-0.5">
                  99.1% · Student
                </div>
              </button>

              <button
                onClick={() => triggerSimulatedEvent('entry_amit')}
                className="p-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-left transition-colors"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-800">
                  <ArrowRightCircle className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Prof. Amit (Entry)</span>
                </div>
                <div className="text-[10px] text-indigo-600 font-mono mt-0.5">
                  99.4% · Teacher
                </div>
              </button>

              {/* Single unknown face trigger */}
              <button
                onClick={() => triggerSimulatedEvent('unknown')}
                className="p-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition-colors"
                title="Detect unknown face once (Click 2x within 25s to trigger Unauthorized warning)"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-900">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Unknown Face (1x)</span>
                </div>
                <div className="text-[10px] text-amber-700 font-mono mt-0.5">
                  Detect Attempt 1
                </div>
              </button>

              {/* Repeat Unknown Intruder Alarm Trigger */}
              <button
                onClick={() => triggerSimulatedEvent('repeat_unknown')}
                className="p-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-300 text-left transition-colors shadow-xs"
                title="Simulate repeated unknown face detections in 25s window to trigger Unauthorized Warning & Security Event"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-rose-800">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                  <span>Repeat Intruder (2x)</span>
                </div>
                <div className="text-[10px] text-rose-600 font-mono mt-0.5">
                  Trigger Alarm &amp; Log
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Currently Recognized Profile Card + Recent Timeline / Security Log */}
        <div className="space-y-4">
          {/* Recognized Profile Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Recognized Person Information
              </h3>
              {selectedPerson && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    selectedPerson.status === 'unknown'
                      ? 'bg-rose-100 text-rose-800'
                      : selectedPerson.eventType === 'entry'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {selectedPerson.status === 'unknown' ? 'Alert: Unknown' : `${selectedPerson.eventType} Event`}
                </span>
              )}
            </div>

            {selectedPerson ? (
              <div className="space-y-3.5">
                <div className="flex items-center gap-3">
                  {selectedPerson.avatarUrl ? (
                    <img
                      src={selectedPerson.avatarUrl}
                      alt={selectedPerson.personName}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-slate-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xl border-2 border-rose-200">
                      ?
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="text-base font-bold text-slate-900 leading-tight">
                      {selectedPerson.personName}
                    </div>
                    <div className="text-xs font-mono text-slate-500 mt-0.5">
                      ID: {selectedPerson.personId}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize">
                        {selectedPerson.personType}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[11px] text-slate-600 font-medium truncate">
                        {selectedPerson.classroomName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Event Time
                    </div>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">
                      {selectedPerson.timestamp}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Confidence Score
                    </div>
                    <div
                      className={`font-mono font-bold mt-0.5 ${
                        selectedPerson.status === 'unknown' ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      {selectedPerson.confidence}% Match
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/60 flex items-center justify-between text-xs">
                  <span className="text-blue-900 font-medium">Classroom Occupancy:</span>
                  <span className="font-mono font-bold text-blue-700">
                    {classroomOccupancy} / 40 seats
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                No recent face detection event selected.
              </div>
            )}
          </div>

          {/* STREAM TABS: Real-Time Event Stream vs Security Incident Log */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
            {/* Tab switch header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveStreamTab('events')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    activeStreamTab === 'events'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Event Stream ({events.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStreamTab('security')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    activeStreamTab === 'security'
                      ? 'bg-rose-600 text-white'
                      : 'text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Security Log ({localIncidents.length})</span>
                </button>
              </div>

              <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {activeStreamTab === 'events' ? 'LIVE' : 'AUDIT'}
              </span>
            </div>

            {/* TAB 1: Attendance Events Stream */}
            {activeStreamTab === 'events' && (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {events.map((evt) => {
                  const isSelected = selectedPerson?.id === evt.id;
                  const isUnknown = evt.status === 'unknown';
                  return (
                    <div
                      key={evt.id}
                      onClick={() => setSelectedPerson(evt)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? isUnknown
                            ? 'border-rose-400 bg-rose-50/70 shadow-sm'
                            : 'border-blue-400 bg-blue-50/60 shadow-sm'
                          : isUnknown
                          ? 'border-rose-200/80 bg-rose-50/30 hover:bg-rose-50/60'
                          : 'border-slate-200/70 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {evt.avatarUrl ? (
                          <img
                            src={evt.avatarUrl}
                            alt={evt.personName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                            !
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">
                            {evt.personName}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                            <span>{evt.personId}</span>
                            <span>·</span>
                            <span>{evt.timestamp}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {isUnknown ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                            <AlertTriangle className="w-3 h-3" />
                            <span>ALERT</span>
                          </span>
                        ) : evt.eventType === 'entry' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <ArrowRightCircle className="w-3 h-3" />
                            <span>ENTRY</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                            <ArrowLeftCircle className="w-3 h-3" />
                            <span>EXIT</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 2: Logged Security Events (Intrusion / Repeat Unknown Face) */}
            {activeStreamTab === 'security' && (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {localIncidents.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No security incidents logged.
                  </div>
                ) : (
                  localIncidents.map((inc) => (
                    <div
                      key={inc.id}
                      onClick={() => setInspectingIncident(inc)}
                      className="p-3 rounded-xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50 text-xs transition-colors space-y-1.5 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                          <span className="font-bold text-slate-900 font-mono text-[11px]">
                            {inc.id}
                          </span>
                        </div>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                            inc.severity === 'critical'
                              ? 'bg-rose-600 text-white'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {inc.severity}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-700 leading-snug">
                        {inc.notes}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-mono border-t border-rose-200/60">
                        <span>
                          {inc.timestamp} · {inc.classroomName.split(' ')[0]}
                        </span>
                        <span className="text-rose-700 font-semibold underline">
                          Inspect Forensics →
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECURITY INCIDENT FORENSIC INSPECTION MODAL
          ========================================================================= */}
      {inspectingIncident && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-rose-50/50 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      Security Incident Forensic Record
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-300 font-mono">
                      {inspectingIncident.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Logged security anomaly event captured by automated entrance surveillance
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingIncident(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Incident Type</div>
                  <div className="font-bold text-slate-900 mt-0.5 capitalize">
                    {inspectingIncident.type.replace(/_/g, ' ')}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Repeat Frequency</div>
                  <div className="font-bold text-rose-700 mt-0.5">
                    {inspectingIncident.repeatCount} Detections in 25s Window
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Camera Node</div>
                  <div className="font-bold text-slate-900 mt-0.5">{inspectingIncident.cameraChannel}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Location Zone</div>
                  <div className="font-bold text-slate-900 mt-0.5">{inspectingIncident.classroomName}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                <div className="font-bold text-rose-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Forensic Audit Log Notes</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{inspectingIncident.notes}</p>
              </div>

              <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-1.5 font-mono text-[11px]">
                <div className="text-slate-400 font-bold uppercase text-[10px]">Surveillance Metadata</div>
                <div className="flex justify-between text-slate-300">
                  <span>Match Confidence Score:</span>
                  <span className="text-rose-400">{inspectingIncident.confidenceScore}% (Threshold: 85%)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Encrypted Biometric Hash:</span>
                  <span className="text-slate-400">e82a9...3f01c9</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Incident Status:</span>
                  <span className="text-emerald-400 uppercase font-bold">{inspectingIncident.status}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => handleDispatchSecurity(inspectingIncident.id)}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Notify Campus Security</span>
              </button>

              <div className="flex items-center gap-2">
                {inspectingIncident.status !== 'resolved' ? (
                  <button
                    type="button"
                    onClick={() => handleResolveIncident(inspectingIncident.id)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Incident Resolved</span>
                  </button>
                ) : (
                  <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold font-mono">
                    ✓ Resolved
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setInspectingIncident(null)}
                  className="px-3.5 py-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CAMERA ACCESS PRE-CHECK & PERMISSION REQUEST MODAL
          ========================================================================= */}
      {isPreCheckModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Modal Header Banner */}
            <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-44 h-44 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center shadow-inner">
                    <Camera className="w-6 h-6 text-blue-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wide bg-blue-500/30 text-blue-200 border border-blue-400/30 uppercase">
                        SURVEILLANCE & AI INFERENCE
                      </span>
                      <span className="text-xs text-slate-400">· Edge Node 301</span>
                    </div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>Camera Access Pre-Check & Authorization</span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Grant hardware access to activate real-time facial recognition and automated attendance
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsPreCheckModalOpen(false);
                    setPreCheckStep('info');
                  }}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Section: Why Camera Access is Required */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span>Why Camera Access is Required</span>
                  </h4>
                  <span className="text-[11px] font-medium text-slate-400">
                    4 Core Biometric Modules
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Scan className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Live Biometric Face Verification</div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        Captures live video frames to extract 68-point facial landmarks and match students against university records.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Contactless Automated Attendance</div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        Eliminates manual roll calls and paper registers by clocking entry timestamps directly into database records.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Intrusion & Unknown Face Alerts</div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        Detects unregistered visitors and triggers visual security warnings when an unknown face is repeatedly observed.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Bounding Box & Identity HUD</div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                        Draws real-time bounding boxes around detected individuals, displaying names, roll numbers, and confidence ratings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Privacy & Security Commitment */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Lock className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span>Institutional Privacy & Edge Security Guarantees</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                        FERPA COMPLIANT
                      </span>
                    </div>
                    <ul className="text-[11px] text-slate-600 mt-1.5 space-y-1 list-disc list-inside">
                      <li><strong>Local Client Processing:</strong> Facial embeddings are extracted in real-time in your browser sandbox.</li>
                      <li><strong>No Raw Footage Uploads:</strong> Video frames are never stored or transmitted to external third-party servers.</li>
                      <li><strong>Instant One-Click Disconnect:</strong> You can terminate hardware camera streaming at any time from the status bar.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Hardware & Diagnostics Pre-Check Bar */}
              <div className="p-4 bg-slate-900 rounded-2xl text-white space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Cpu className="w-4 h-4 text-blue-400" />
                    <span>Hardware Readiness & Permissions Status</span>
                  </div>
                  <button
                    type="button"
                    onClick={checkCameraPermissions}
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Re-check Devices</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase font-medium">Browser API</div>
                    <div className="font-bold text-slate-200 mt-0.5 flex items-center gap-1.5">
                      {typeof navigator !== 'undefined' && !!navigator?.mediaDevices?.getUserMedia ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>MediaDevices Ready</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Not Supported</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase font-medium">Permission Status</div>
                    <div className="font-bold text-slate-200 mt-0.5 flex items-center gap-1.5">
                      {cameraPermissionState === 'granted' && (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Granted</span>
                        </>
                      )}
                      {cameraPermissionState === 'prompt' && (
                        <>
                          <Info className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-blue-400">Prompt on Click</span>
                        </>
                      )}
                      {cameraPermissionState === 'denied' && (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          <span className="text-rose-400">Blocked in Browser</span>
                        </>
                      )}
                      {cameraPermissionState === 'unsupported' && (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-amber-400">Restricted</span>
                        </>
                      )}
                      {cameraPermissionState === 'checking' && (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                          <span>Checking...</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase font-medium">Stream Target</div>
                    <div className="font-bold text-slate-200 mt-0.5">
                      {selectedResolution.toUpperCase()} HD · 30 FPS
                    </div>
                  </div>
                </div>

                {/* Camera device and resolution selector */}
                <div className="pt-1 flex flex-wrap items-center justify-between gap-3 text-xs">
                  {availableCameras.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">Detected Camera:</span>
                      <select
                        value={selectedCameraId}
                        onChange={(e) => setSelectedCameraId(e.target.value)}
                        className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-xs outline-none focus:border-blue-500"
                      >
                        {availableCameras.map((cam, idx) => (
                          <option key={cam.deviceId || idx} value={cam.deviceId}>
                            {cam.label || `Camera Channel ${idx + 1}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[11px]">Resolution:</span>
                    {(['720p', '1080p', '480p'] as const).map((res) => (
                      <button
                        key={res}
                        type="button"
                        onClick={() => setSelectedResolution(res)}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                          selectedResolution === res
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Troubleshooting / Blocked Guide (if permission failed or denied) */}
              {(webcamError || preCheckStep === 'troubleshoot' || cameraPermissionState === 'denied') && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Camera Permission or Device Assistance</span>
                  </div>
                  {webcamError && <p className="text-amber-800 font-medium">{webcamError}</p>}
                  <div className="text-[11px] text-amber-700 space-y-1 bg-white/70 p-3 rounded-xl border border-amber-200/80">
                    <div className="font-semibold text-slate-800">Quick Fix Options:</div>
                    <div>1. <strong>Browser Permission:</strong> Click the camera or lock icon in your browser's address bar and set Camera to <strong>Allow</strong>, then retry.</div>
                    <div>2. <strong>App Conflict:</strong> Ensure Zoom, Teams, or another browser tab is not locking your camera.</div>
                    <div>3. <strong>Instant Alternative:</strong> Click <strong>&quot;Use Interactive Virtual Camera&quot;</strong> below to test live face recognition, bounding boxes, and attendance logging immediately without physical camera hardware!</div>
                  </div>
                </div>
              )}

              {/* What to expect prompt visual banner */}
              <div className="flex items-center gap-3 p-3 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-900">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <span className="font-bold">Browser Action Required:</span> When you click &quot;Grant Permission &amp; Launch Webcam&quot;, look for your browser&apos;s permission prompt (usually at the top left of the address bar) and select <strong>&quot;Allow&quot;</strong>.
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleStartVirtualCamera}
                  className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Test facial recognition immediately without physical camera permissions"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Use Interactive Virtual Camera</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPreCheckModalOpen(false);
                    setPreCheckStep('info');
                  }}
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isRequestingCamera}
                  onClick={() => startRealWebcam()}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all"
                >
                  {isRequestingCamera ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Requesting Camera...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      <span>Grant Permission &amp; Launch Webcam</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
