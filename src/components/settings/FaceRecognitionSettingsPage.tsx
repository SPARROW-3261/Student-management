import React, { useState, useRef, useEffect } from 'react';
import {
  ScanFace,
  Camera,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  Save,
  CheckCircle2,
  RefreshCw,
  Video,
  Eye,
  Lock,
  Layers,
  History,
  Info,
  Maximize2,
  Zap,
  Target,
  Sparkles,
  Move,
  Settings2,
  Volume2,
  Bell,
  Clock,
  RotateCcw,
  Check,
  X,
  Play,
  Pause,
  UserX,
  FileCheck,
} from 'lucide-react';
import { FaceRecognitionConfig, DetectionZone } from '../../types/attendance';

interface FaceRecognitionSettingsProps {
  config: FaceRecognitionConfig;
  onSaveConfig: (newConfig: FaceRecognitionConfig) => void;
}

export const FaceRecognitionSettingsPage: React.FC<FaceRecognitionSettingsProps> = ({
  config,
  onSaveConfig,
}) => {
  const [formData, setFormData] = useState<FaceRecognitionConfig>({ ...config });
  const [activeTab, setActiveTab] = useState<'all' | 'sensitivity' | 'confidence' | 'zones' | 'unknown' | 'visualization'>('all');
  const [saveToast, setSaveToast] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);

  // Test Camera states inside diagnostic test modal
  const [testSource, setTestSource] = useState<'simulated' | 'webcam'>('simulated');
  const [testSubject, setTestSubject] = useState<'rahul' | 'priya' | 'amit' | 'unknown'>('rahul');
  const [testFps, setTestFps] = useState(30.2);
  const [testLatency, setTestLatency] = useState(36);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Clean up webcam stream
  const stopWebcam = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setWebcamActive(false);
  };

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  // Ensure video element receives stream as soon as webcam is active
  useEffect(() => {
    if (webcamActive && videoRef.current && mediaStreamRef.current) {
      if (videoRef.current.srcObject !== mediaStreamRef.current) {
        videoRef.current.srcObject = mediaStreamRef.current;
        videoRef.current.play().catch((err) => console.warn('Webcam video play error:', err));
      }
    }
  }, [webcamActive, testSource]);

  const handleStartWebcam = async () => {
    setWebcamError(null);
    if (!navigator?.mediaDevices?.getUserMedia) {
      setWebcamError('Webcam API is not supported in this browser or iframe context. Switched to test stream.');
      setTestSource('simulated');
      return;
    }
    try {
      let stream: MediaStream | null = null;
      const constraints: MediaStreamConstraints[] = [
        {
          video: {
            facingMode: 'user',
            width: { ideal: 1280, min: 320 },
            height: { ideal: 720, min: 240 },
          },
          audio: false,
        },
        {
          video: { facingMode: 'user' },
          audio: false,
        },
        {
          video: true,
          audio: false,
        },
      ];

      for (const c of constraints) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(c);
          if (stream) break;
        } catch (e: any) {
          if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
            break;
          }
        }
      }

      if (!stream) {
        throw new Error('Could not establish webcam stream from available video devices.');
      }

      mediaStreamRef.current = stream;
      setWebcamActive(true);
      setTestSource('webcam');

      if (videoRef.current) {
        videoRef.current.muted = true;
        videoRef.current.defaultMuted = true;
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.error('Test bench webcam error:', err);
      let errorMsg = 'Unable to access local camera stream.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg =
          'Camera permission was denied in your browser. Click the lock/camera icon in your address bar to allow camera access and retry.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'No camera hardware detected on this device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMsg = 'Camera is currently in use by another application. Please close other camera tabs and retry.';
      } else {
        errorMsg = `Camera error: ${err.message || err.name || 'Unknown error'}. Operating in simulated test stream mode.`;
      }
      setWebcamError(errorMsg);
      setTestSource('simulated');
    }
  };

  const handleSwitchTestSource = (src: 'simulated' | 'webcam') => {
    setTestSource(src);
    if (src === 'webcam') {
      handleStartWebcam();
    } else {
      stopWebcam();
    }
  };

  // Preset Configurations
  const applyPreset = (presetName: string) => {
    if (presetName === 'standard') {
      setFormData((prev) => ({
        ...prev,
        detectionSensitivity: 'high',
        sensitivityScore: 0.75,
        confidenceThreshold: 85,
        minFaceSizePx: 64,
        nmsThreshold: 0.45,
        consecutiveFramesRequired: 2,
        strictSecurityMode: false,
        livenessThreshold: 80,
        duplicateWindowMinutes: 15,
        detectionZonePreset: 'doorway_split',
      }));
    } else if (presetName === 'exam') {
      setFormData((prev) => ({
        ...prev,
        detectionSensitivity: 'high',
        sensitivityScore: 0.88,
        confidenceThreshold: 92,
        minFaceSizePx: 80,
        nmsThreshold: 0.35,
        consecutiveFramesRequired: 3,
        strictSecurityMode: true,
        livenessThreshold: 90,
        duplicateWindowMinutes: 30,
        unknownFaceAction: 'sound_alarm',
      }));
    } else if (presetName === 'hallway') {
      setFormData((prev) => ({
        ...prev,
        detectionSensitivity: 'medium',
        sensitivityScore: 0.7,
        confidenceThreshold: 82,
        minFaceSizePx: 96,
        nmsThreshold: 0.5,
        consecutiveFramesRequired: 2,
        strictSecurityMode: false,
        detectionZonePreset: 'hallway_exclusion',
      }));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  // Zone modification helpers
  const handleToggleZone = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      zones: prev.zones.map((z) => (z.id === id ? { ...z, enabled: !z.enabled } : z)),
    }));
  };

  const handleUpdateZoneProp = (id: string, prop: keyof DetectionZone, val: any) => {
    setFormData((prev) => ({
      ...prev,
      zones: prev.zones.map((z) => (z.id === id ? { ...z, [prop]: val } : z)),
    }));
  };

  // Test subject live metrics calculation
  const getSubjectMetrics = () => {
    if (testSubject === 'rahul') {
      return {
        name: 'Rahul Kumar (STU-042)',
        type: 'Student',
        score: 98.6,
        avatar: '/src/assets/images/avatar_student_rahul_1791905718978.jpg',
        liveness: 99.1,
        inZone: 'Entrance Threshold (Zone A)',
        box: { x: 26, y: 18, w: 22, h: 28 },
      };
    } else if (testSubject === 'priya') {
      return {
        name: 'Priya Sharma (STU-018)',
        type: 'Student',
        score: 99.2,
        avatar: '/src/assets/images/avatar_student_priya_1791905720259.jpg',
        liveness: 98.7,
        inZone: 'Exit Corridor (Zone B)',
        box: { x: 62, y: 22, w: 22, h: 28 },
      };
    } else if (testSubject === 'amit') {
      return {
        name: 'Prof. Amit Verma (TCH-108)',
        type: 'Teacher',
        score: 99.5,
        avatar: '/src/assets/images/avatar_teacher_amit_1791905720315.jpg',
        liveness: 99.4,
        inZone: 'Entrance Threshold (Zone A)',
        box: { x: 28, y: 16, w: 24, h: 30 },
      };
    } else {
      return {
        name: 'Unregistered Face',
        type: 'Visitor',
        score: 41.2,
        avatar: '',
        liveness: 94.0,
        inZone: 'Entrance Threshold (Zone A)',
        box: { x: 30, y: 24, w: 20, h: 26 },
      };
    }
  };

  const subjectData = getSubjectMetrics();
  const isMatchPassed = subjectData.score >= formData.confidenceThreshold;
  const isLivenessPassed = !formData.livenessDetection || subjectData.liveness >= formData.livenessThreshold;

  return (
    <div className="space-y-6">
      {/* Top Header & Presets Strip */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              AI INFERENCE ENGINE
            </span>
            <span className="text-xs text-slate-400">· Edge Node: Room 301 Jetson Orin Nano</span>
          </div>
          <h2 className="text-lg lg:text-xl font-bold text-slate-900 flex items-center gap-2">
            <ScanFace className="w-5 h-5 text-blue-600" />
            <span>Face Recognition Engine Settings</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Fine-tune detection sensitivity, confidence thresholds, unknown visitor behaviors, and active entrance zones
          </p>
        </div>

        {/* Action Controls & Presets */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
            <span className="text-[11px] text-slate-400 px-2 font-medium">Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset('standard')}
              className="px-2.5 py-1 rounded-lg bg-white text-slate-800 font-semibold shadow-xs hover:bg-slate-50"
            >
              Standard Class
            </button>
            <button
              type="button"
              onClick={() => applyPreset('exam')}
              className="px-2.5 py-1 rounded-lg text-slate-600 font-medium hover:text-slate-900"
            >
              Strict Exam (92%)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('hallway')}
              className="px-2.5 py-1 rounded-lg text-slate-600 font-medium hover:text-slate-900"
            >
              Hallway Exclusion
            </button>
          </div>

          <button
            type="button"
            onClick={() => setTestModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition-colors"
          >
            <Camera className="w-4 h-4 text-indigo-600" />
            <span>Test Camera Stream</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Save Success Toast */}
      {saveToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Face recognition model hyperparameters successfully applied and synced with camera stream pipeline!</span>
          </div>
          <button onClick={() => setSaveToast(false)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Legal & Biometric Privacy Notice Banner */}
      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-3">
        <div className="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs text-blue-900 leading-relaxed">
          <div className="font-bold text-blue-950 mb-0.5">
            Biometric Data Governance & Institutional Consent Compliance
          </div>
          <p>
            Facial recognition biometric templates are stored as encrypted 512-dimensional vector floats, not raw biometric pictures. In accordance with university privacy guidelines, live recognition operates within designated entrance doorways only. All unknown face logs are automatically purged after the configured retention period.
          </p>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Settings
        </button>
        <button
          onClick={() => setActiveTab('sensitivity')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'sensitivity'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Detection Sensitivity</span>
        </button>
        <button
          onClick={() => setActiveTab('confidence')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'confidence'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Confidence Thresholds</span>
        </button>
        <button
          onClick={() => setActiveTab('zones')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'zones'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Move className="w-3.5 h-3.5" />
          <span>Detection Zones (ROIs)</span>
        </button>
        <button
          onClick={() => setActiveTab('unknown')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'unknown'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserX className="w-3.5 h-3.5" />
          <span>Unknown Face Policy</span>
        </button>
        <button
          onClick={() => setActiveTab('visualization')}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'visualization'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ScanFace className="w-3.5 h-3.5" />
          <span>Bounding Box Overlay</span>
        </button>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 1: Detection Sensitivity */}
        {(activeTab === 'all' || activeTab === 'sensitivity') && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Face Detection Sensitivity & Localization</span>
              </h3>
              <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Active Engine
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Detection Model Architecture */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Detection Backbone Architecture
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'yolov8_face', name: 'YOLOv8-Face', speed: '32ms', desc: 'Fastest · High FPS' },
                    { id: 'mtcnn', name: 'MTCNN PyTorch', speed: '48ms', desc: 'Balanced Standard' },
                    { id: 'retinaface', name: 'RetinaFace', speed: '64ms', desc: 'Highest Precision' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          detectionModel: m.id as any,
                        })
                      }
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        formData.detectionModel === m.id
                          ? 'border-blue-500 bg-blue-50/70 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-slate-900">{m.name}</div>
                      <div className="text-[10px] font-mono text-blue-600 mt-0.5">{m.speed}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Proposal Sensitivity Score Slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Detection Candidate Sensitivity Score
                  </label>
                  <span className="font-mono font-bold text-blue-700">
                    {formData.sensitivityScore} (
                    {formData.sensitivityScore >= 0.8
                      ? 'High Precision'
                      : formData.sensitivityScore >= 0.6
                      ? 'Balanced'
                      : 'Aggressive'}
                    )
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="0.95"
                  step="0.05"
                  value={formData.sensitivityScore}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sensitivityScore: Number(e.target.value),
                    })
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                  <span>0.20 (Detect faint / angled faces)</span>
                  <span>0.95 (High confidence only)</span>
                </div>
              </div>

              {/* Minimum Face Size in Pixels */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Minimum Face Bounding Box Size
                  </label>
                  <span className="font-mono font-bold text-slate-800">
                    {formData.minFaceSizePx} &times; {formData.minFaceSizePx} px
                  </span>
                </div>
                <input
                  type="range"
                  min="32"
                  max="160"
                  step="8"
                  value={formData.minFaceSizePx}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minFaceSizePx: Number(e.target.value),
                    })
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Filters out distant people in the hallway background who are further than 4 meters from the doorway.
                </p>
              </div>

              {/* Non-Maximum Suppression (NMS) IoU Threshold */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Non-Maximum Suppression (NMS) Overlap Threshold
                  </label>
                  <span className="font-mono font-bold text-slate-800">
                    IoU: {formData.nmsThreshold}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="0.75"
                  step="0.05"
                  value={formData.nmsThreshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nmsThreshold: Number(e.target.value),
                    })
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Prevents duplicate bounding boxes when multiple students walk through the entrance together.
                </p>
              </div>

              {/* Multi-Scale Pyramid Toggle */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">Multi-Scale Image Pyramid</div>
                  <div className="text-[11px] text-slate-500">
                    Rescales entrance video frame across 3 resolutions to detect varied heights
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.multiScalePyramid}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      multiScalePyramid: e.target.checked,
                    })
                  }
                  className="rounded text-blue-600 w-4 h-4"
                />
              </div>

              {/* Bounding Box Visualization Toggle */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/90 rounded-xl flex items-center justify-between">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 mt-0.5">
                    <ScanFace className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>Bounding Box Visualization</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          formData.showBoundingBoxes
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {formData.showBoundingBoxes ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Visually highlights detected faces with bounding rectangles and displays identity labels directly on the live camera feed
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-3 shrink-0">
                  <input
                    type="checkbox"
                    checked={formData.showBoundingBoxes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        showBoundingBoxes: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: Recognition Confidence Thresholds */}
        {(activeTab === 'all' || activeTab === 'confidence') && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-blue-600" />
                <span>Recognition Confidence & Verification Rules</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                FaceNet-512 Inception
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Primary Confidence Threshold */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Primary Recognition Verification Threshold
                  </label>
                  <span className="font-mono font-bold text-blue-700 text-sm">
                    {formData.confidenceThreshold}% Match
                  </span>
                </div>
                <input
                  type="range"
                  min="55"
                  max="98"
                  step="1"
                  value={formData.confidenceThreshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confidenceThreshold: Number(e.target.value),
                    })
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                  <span>55% (Permissive)</span>
                  <span className="text-blue-600 font-bold">85% (College Standard)</span>
                  <span>98% (Ultra Strict)</span>
                </div>
              </div>

              {/* Distance Metric & Comparison Formula */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Vector Distance Metric Formula
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cosine', name: 'Cosine Similarity', desc: 'Normalized dot product (Standard)' },
                    { id: 'euclidean', name: 'Euclidean Distance', desc: 'L2 norm coordinate distance' },
                    { id: 'arcface', name: 'ArcFace Angular Margin', desc: 'Angular margin penalty metric' },
                  ].map((dm) => (
                    <button
                      key={dm.id}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          distanceMetric: dm.id as any,
                        })
                      }
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        formData.distanceMetric === dm.id
                          ? 'border-blue-500 bg-blue-50/70 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-slate-900">{dm.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{dm.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Multi-Frame Consecutive Confirmation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Consecutive Frame Match Confirmation
                  </label>
                  <span className="font-mono font-bold text-slate-800">
                    {formData.consecutiveFramesRequired} Frame(s)
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={formData.consecutiveFramesRequired}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      consecutiveFramesRequired: Number(e.target.value),
                    })
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Requires {formData.consecutiveFramesRequired} continuous video frames of positive verification before logging attendance. Eliminates glitch false-positives.
                </p>
              </div>

              {/* Liveness / Anti-Spoofing Detection */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">
                      Anti-Spoofing &amp; Liveness Detection
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Detects phone screens, printed photos, and 3D silicone mask attacks
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.livenessDetection}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        livenessDetection: e.target.checked,
                      })
                    }
                    className="rounded text-blue-600 w-4 h-4"
                  />
                </div>

                {formData.livenessDetection && (
                  <div className="pt-2 border-t border-slate-200/60">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600">Liveness Confidence Threshold:</span>
                      <span className="font-mono font-bold text-indigo-700">
                        {formData.livenessThreshold}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="95"
                      step="5"
                      value={formData.livenessThreshold}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          livenessThreshold: Number(e.target.value),
                        })
                      }
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: Detection Zones (ROIs - Regions of Interest) */}
        {(activeTab === 'all' || activeTab === 'zones') && (
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Move className="w-4 h-4 text-blue-600" />
                  <span>Interactive Entrance Detection Zones (ROIs)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Define spatial boundary boxes where face recognition triggers Entry, Exit, or Dead-Zone ignore
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Preset Layout:</span>
                <select
                  value={formData.detectionZonePreset}
                  onChange={(e) => {
                    const preset = e.target.value as any;
                    if (preset === 'doorway_split') {
                      setFormData((p) => ({
                        ...p,
                        detectionZonePreset: 'doorway_split',
                        zones: [
                          { id: 'zone-entry', name: 'Classroom Inward Threshold (Check-In)', type: 'entrance', color: '#10b981', x: 15, y: 10, width: 35, height: 80, enabled: true },
                          { id: 'zone-exit', name: 'Corridor Exit Boundary (Check-Out)', type: 'exit', color: '#3b82f6', x: 55, y: 10, width: 35, height: 80, enabled: true },
                          { id: 'zone-exclusion', name: 'Outer Hallway Dead Zone (Ignore Walkbys)', type: 'exclusion', color: '#ef4444', x: 0, y: 0, width: 12, height: 100, enabled: false },
                        ],
                      }));
                    } else if (preset === 'full_frame') {
                      setFormData((p) => ({
                        ...p,
                        detectionZonePreset: 'full_frame',
                        zones: [
                          { id: 'zone-entry', name: 'Entire Frame Entrance Zone', type: 'entrance', color: '#10b981', x: 5, y: 5, width: 90, height: 90, enabled: true },
                          { id: 'zone-exit', name: 'Exit Corridor', type: 'exit', color: '#3b82f6', x: 60, y: 10, width: 30, height: 80, enabled: false },
                          { id: 'zone-exclusion', name: 'Dead Zone', type: 'exclusion', color: '#ef4444', x: 0, y: 0, width: 10, height: 100, enabled: false },
                        ],
                      }));
                    } else if (preset === 'hallway_exclusion') {
                      setFormData((p) => ({
                        ...p,
                        detectionZonePreset: 'hallway_exclusion',
                        zones: [
                          { id: 'zone-entry', name: 'Active Doorway Center', type: 'entrance', color: '#10b981', x: 25, y: 10, width: 50, height: 80, enabled: true },
                          { id: 'zone-exit', name: 'Exit Doorway Corridor', type: 'exit', color: '#3b82f6', x: 75, y: 10, width: 20, height: 80, enabled: true },
                          { id: 'zone-exclusion', name: 'Hallway Walkby Deadzone', type: 'exclusion', color: '#ef4444', x: 0, y: 0, width: 22, height: 100, enabled: true },
                        ],
                      }));
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800"
                >
                  <option value="doorway_split">Doorway Split (Inward vs Outward 50/50)</option>
                  <option value="hallway_exclusion">Hallway Active Center (Sides Ignored)</option>
                  <option value="full_frame">Full Frame Viewport (100% Coverage)</option>
                </select>
              </div>
            </div>

            {/* Interactive Visual Map & Zone Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Visual Map Viewport (7 cols) */}
              <div className="lg:col-span-7">
                <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
                  {/* Background entrance preview */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center opacity-85">
                    <div className="absolute inset-y-0 left-1/2 w-0.5 bg-slate-800 border-l border-dashed border-slate-700"></div>
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-mono text-slate-500 uppercase px-3 py-1 rounded bg-black/60 border border-white/10">
                      RTSP Live Frame · 1920 &times; 1080 · Classroom 301 Doorway
                    </div>
                  </div>

                  {/* Render Configured Active Detection Zones */}
                  {formData.zones.map((zone) => {
                    if (!zone.enabled) return null;
                    const isEntrance = zone.type === 'entrance';
                    const isExit = zone.type === 'exit';
                    const isExclusion = zone.type === 'exclusion';

                    return (
                      <div
                        key={zone.id}
                        className={`absolute rounded-xl border-2 transition-all flex flex-col justify-between p-2 select-none ${
                          isEntrance
                            ? 'border-emerald-400 bg-emerald-500/15 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            : isExit
                            ? 'border-blue-400 bg-blue-500/15 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                            : 'border-rose-400 bg-rose-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                        }`}
                        style={{
                          left: `${zone.x}%`,
                          top: `${zone.y}%`,
                          width: `${zone.width}%`,
                          height: `${zone.height}%`,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono ${
                              isEntrance
                                ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/60'
                                : isExit
                                ? 'bg-blue-950/90 text-blue-300 border border-blue-500/60'
                                : 'bg-rose-950/90 text-rose-300 border border-rose-500/60'
                            }`}
                          >
                            {zone.name.split('(')[0]}
                          </span>
                          <span className="text-[9px] font-mono text-white/80 bg-black/60 px-1 rounded">
                            {zone.width}% &times; {zone.height}%
                          </span>
                        </div>

                        <div className="text-[10px] font-mono text-white/90 text-center font-bold bg-black/50 py-0.5 rounded">
                          {isEntrance
                            ? 'Trigger: Check-In Entry'
                            : isExit
                            ? 'Trigger: Check-Out Exit'
                            : 'Dead Zone: Ignore Motion'}
                        </div>
                      </div>
                    );
                  })}

                  {/* Corner Coordinates & Compass */}
                  <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-500">
                    Direction: Inward &larr;&rarr; Outward
                  </div>
                  <div className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-500">
                    Active Zones: {formData.zones.filter((z) => z.enabled).length} / {formData.zones.length}
                  </div>
                </div>
              </div>

              {/* Right: Zone Config Sliders (5 cols) */}
              <div className="lg:col-span-5 space-y-3">
                {formData.zones.map((zone) => (
                  <div
                    key={zone.id}
                    className={`p-3 rounded-xl border transition-all text-xs space-y-2 ${
                      zone.enabled ? 'bg-slate-50 border-slate-200' : 'bg-slate-100/60 border-slate-200/60 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: zone.color }}
                        />
                        <span className="font-bold text-slate-900">{zone.name}</span>
                      </div>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={zone.enabled}
                          onChange={() => handleToggleZone(zone.id)}
                          className="rounded text-blue-600"
                        />
                        <span className="text-[11px] font-semibold text-slate-700">
                          {zone.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </label>
                    </div>

                    {zone.enabled && (
                      <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                        <div>
                          <div className="flex justify-between text-slate-500 mb-0.5">
                            <span>Left (X):</span>
                            <span className="font-mono font-bold text-slate-700">{zone.x}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="80"
                            value={zone.x}
                            onChange={(e) => handleUpdateZoneProp(zone.id, 'x', Number(e.target.value))}
                            className="w-full accent-blue-600 cursor-pointer"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-500 mb-0.5">
                            <span>Width:</span>
                            <span className="font-mono font-bold text-slate-700">{zone.width}%</span>
                          </div>
                          <input
                            type="range"
                            min="15"
                            max="90"
                            value={zone.width}
                            onChange={(e) => handleUpdateZoneProp(zone.id, 'width', Number(e.target.value))}
                            className="w-full accent-blue-600 cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: Unknown Faces Behavior & Alerts */}
        {(activeTab === 'all' || activeTab === 'unknown') && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <UserX className="w-4 h-4 text-rose-600" />
                <span>Behavior for Unknown / Unregistered Faces</span>
              </h3>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Security Policy
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Primary Action Policy */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Event Trigger When Unknown Face is Detected
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'log_alert', label: 'Log Security Alert', desc: 'Silent log with timestamp & face snapshot' },
                    { id: 'sound_alarm', label: 'Sound Audio Alert', desc: 'Audible chime on entrance tablet display' },
                    { id: 'visitor_kiosk', label: 'Visitor Registration', desc: 'Prompt visitor to enroll on kiosk screen' },
                    { id: 'ignore', label: 'Silent Discard', desc: 'Do not log (ignore unregistered persons)' },
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          unknownFaceAction: act.id as any,
                        })
                      }
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        formData.unknownFaceAction === act.id
                          ? 'border-blue-500 bg-blue-50/70 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-slate-900">{act.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{act.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Debounce Buffer for Unknown Faces */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Unknown Face Alarm Debounce Interval
                  </label>
                  <span className="font-mono font-bold text-slate-800">
                    {formData.unknownDebounceSeconds} Seconds
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="10"
                  value={formData.unknownDebounceSeconds}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      unknownDebounceSeconds: Number(e.target.value),
                    })
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Suppresses repeated alarms if the same unregistered person stands in front of the door.
                </p>
              </div>

              {/* Snapshot Retention Policy */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Unknown Face Snapshot Storage Retention
                </label>
                <select
                  value={formData.unknownSnapshotRetentionDays}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      unknownSnapshotRetentionDays: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value={7}>Retain for 7 Days then purge</option>
                  <option value={14}>Retain for 14 Days (Standard)</option>
                  <option value={30}>Retain for 30 Days (Investigation buffer)</option>
                  <option value={90}>Retain for 90 Days (Full Semester)</option>
                </select>
              </div>

              {/* Auto-Enroll Candidate Queue Toggle */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">
                    Candidate Queue for Unenrolled Students
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Save clear facial crops into an "Enrollment Review" queue for 1-click admin registration
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.autoEnrollUnknownQueue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      autoEnrollUnknownQueue: e.target.checked,
                    })
                  }
                  className="rounded text-blue-600 w-4 h-4"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: Timing & Duplicate Prevention */}
        {(activeTab === 'all' || activeTab === 'confidence') && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Attendance Debounce &amp; Duplicate Safeguard</span>
              </h3>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                15-Min Buffer
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Duplicate Attendance Suppression Window
                  </label>
                  <span className="font-mono font-bold text-indigo-700 text-sm">
                    {formData.duplicateWindowMinutes} Minutes
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={formData.duplicateWindowMinutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duplicateWindowMinutes: Number(e.target.value),
                    })
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">
                  If a registered student or teacher steps in and out of camera view within {formData.duplicateWindowMinutes} minutes, their initial entry timestamp remains locked and no duplicate log is generated.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Physical Direction Vector Tracking Mode
                </label>
                <select
                  value={formData.trackingMode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      trackingMode: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="directional_motion">Directional Vector Motion (Doorway Optical Flow)</option>
                  <option value="dual_camera">Dual Hardware Cameras (Dedicated In / Out lenses)</option>
                  <option value="manual_prompt">Single Kiosk Terminal (User select In/Out)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800">Save Verification Snapshots</div>
                  <div className="text-[11px] text-slate-500">
                    Keep 120&times;120px cropped facial thumbnail with each verified attendance log
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.saveSnapshots}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      saveSnapshots: e.target.checked,
                    })
                  }
                  className="rounded text-blue-600 w-4 h-4"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: Bounding Box Visualization & Identity Overlay */}
        {(activeTab === 'all' || activeTab === 'visualization') && (
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ScanFace className="w-4 h-4 text-blue-600" />
                  <span>Bounding Box Visualization &amp; Live Camera Overlay</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visually highlight detected faces and their associated identity label on the live entrance camera feed
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold font-mono border ${
                    formData.showBoundingBoxes
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                >
                  {formData.showBoundingBoxes ? '● VISUALIZATION ACTIVE' : '○ OVERLAYS DISABLED'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Left: Info & Main Interactive Toggle */}
              <div className="md:col-span-7 space-y-4">
                {/* Master Switch Card */}
                <div
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      showBoundingBoxes: !prev.showBoundingBoxes,
                    }))
                  }
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-4 select-none ${
                    formData.showBoundingBoxes
                      ? 'bg-blue-50/70 border-blue-400 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        Bounding Box &amp; Identity Label Visualization
                      </span>
                      {formData.showBoundingBoxes && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white font-mono">
                          LIVE ON FEED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Draws real-time bounding boxes around detected faces with name, ID (e.g. STU-2024-042 or TCH-108), recognition match confidence percentage, and tracking status on the camera stream.
                    </p>
                    <div className="text-[11px] text-slate-500 pt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1 font-medium text-emerald-700">
                        <Check className="w-3.5 h-3.5" /> Student &amp; Teacher Names
                      </span>
                      <span className="flex items-center gap-1 font-medium text-blue-700">
                        <Check className="w-3.5 h-3.5" /> ID &amp; Designation Tags
                      </span>
                      <span className="flex items-center gap-1 font-medium text-indigo-700">
                        <Check className="w-3.5 h-3.5" /> Match Confidence %
                      </span>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <div className="pt-1">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formData.showBoundingBoxes}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        formData.showBoundingBoxes ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          formData.showBoundingBoxes ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Sub-actions & Quick Diagnostic Bench Button */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setTestModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Camera className="w-4 h-4 text-indigo-600" />
                    <span>Verify Live in Test Camera Bench</span>
                  </button>
                  <span className="text-xs text-slate-400">
                    Changes sync immediately to Live Attendance feed upon saving.
                  </span>
                </div>
              </div>

              {/* Right: Visual HUD Preview Simulation */}
              <div className="md:col-span-5">
                <div className="relative aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center p-3 shadow-inner">
                  {/* Subtle camera frame background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 opacity-90" />
                  <div className="absolute top-2 left-2 text-[9px] font-mono text-slate-400 bg-black/60 px-1.5 py-0.5 rounded border border-white/10">
                    PREVIEW · {formData.showBoundingBoxes ? 'BOUNDING BOX ON' : 'BOUNDING BOX OFF'}
                  </div>

                  {formData.showBoundingBoxes ? (
                    <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in-95 duration-150">
                      {/* Bounding box with corner brackets */}
                      <div className="relative w-24 h-24 rounded-lg border-2 border-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(52,211,153,0.3)] flex items-center justify-center">
                        <img
                          src="/src/assets/images/avatar_student_rahul_1791905718978.jpg"
                          alt="Face Preview"
                          className="w-20 h-20 rounded object-cover"
                        />
                        {/* Corner markers */}
                        <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-emerald-300"></span>
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-300"></span>
                        <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-emerald-300"></span>
                        <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-emerald-300"></span>
                      </div>

                      {/* Identity Tag Badge */}
                      <div className="mt-1.5 px-2.5 py-0.5 bg-emerald-950/90 border border-emerald-500/80 rounded-md text-center shadow-xs">
                        <div className="text-[11px] font-bold text-emerald-200">
                          Rahul Kumar (STU-042)
                        </div>
                        <div className="text-[9px] font-mono text-emerald-400">
                          Confidence: 98.8% · ENTRANCE
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative z-10 flex flex-col items-center opacity-60">
                      <div className="w-24 h-24 rounded-lg border border-slate-700 bg-slate-900 flex items-center justify-center">
                        <img
                          src="/src/assets/images/avatar_student_rahul_1791905718978.jpg"
                          alt="Raw Face"
                          className="w-20 h-20 rounded object-cover filter grayscale contrast-125"
                        />
                      </div>
                      <div className="mt-2 text-[10px] font-mono text-slate-400">
                        Raw Video Stream (No HUD Overlays)
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ADVANCED 'TEST CAMERA' REAL-TIME VERIFICATION MODAL */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      Real-Time Camera &amp; AI Setting Verification Test Bench
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      LIVE INFERENCE
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Verify face detection sensitivity, confidence match thresholds, and active ROIs in real-time
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  stopWebcam();
                  setTestModalOpen(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Stream Source & Test Subject Selector Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                {/* Source Toggle */}
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600">Video Source:</span>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleSwitchTestSource('simulated')}
                      className={`px-3 py-1 rounded font-semibold transition-colors ${
                        testSource === 'simulated'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Entrance Cam (1080p RTSP)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSwitchTestSource('webcam')}
                      className={`px-3 py-1 rounded font-semibold transition-colors ${
                        testSource === 'webcam'
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      My Local Webcam
                    </button>
                  </div>
                </div>

                {/* Test Subject Buttons (when in simulated stream) */}
                {testSource === 'simulated' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium">Test Subject:</span>
                    <button
                      type="button"
                      onClick={() => setTestSubject('rahul')}
                      className={`px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
                        testSubject === 'rahul'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Rahul (Student)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTestSubject('priya')}
                      className={`px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
                        testSubject === 'priya'
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Priya (Student)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTestSubject('amit')}
                      className={`px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
                        testSubject === 'amit'
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Prof. Amit (Teacher)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTestSubject('unknown')}
                      className={`px-2.5 py-1 rounded-lg border font-semibold transition-colors ${
                        testSubject === 'unknown'
                          ? 'bg-rose-50 text-rose-800 border-rose-300'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Unknown Face
                    </button>
                  </div>
                )}

                {/* Bounding Box Visualizer Quick Toggle in Test Bench */}
                <button
                  type="button"
                  onClick={() =>
                    setFormData((p) => ({ ...p, showBoundingBoxes: !p.showBoundingBoxes }))
                  }
                  className={`px-2.5 py-1 rounded-lg border font-semibold transition-colors flex items-center gap-1.5 ${
                    formData.showBoundingBoxes
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Toggle Bounding Box Visualization on Feed"
                >
                  <ScanFace className="w-3.5 h-3.5" />
                  <span>Bounding Boxes: {formData.showBoundingBoxes ? 'ON' : 'OFF'}</span>
                </button>
              </div>

              {webcamError && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-600" />
                  <span>{webcamError}</span>
                </div>
              )}

              {/* Main Live Diagnostic Screen (16:9) */}
              <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex items-center justify-center">
                {testSource === 'webcam' ? (
                  <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
                    <video
                      ref={(el) => {
                        videoRef.current = el;
                        if (el) {
                          el.muted = true;
                          el.defaultMuted = true;
                          if (mediaStreamRef.current && el.srcObject !== mediaStreamRef.current) {
                            el.srcObject = mediaStreamRef.current;
                            el.play().catch(() => {});
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

                    {/* Live Facial Detection Overlay on Test Bench Webcam */}
                    {formData.showBoundingBoxes && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative w-44 h-52 sm:w-56 sm:h-64 rounded-2xl border-2 border-emerald-400 bg-emerald-500/10 shadow-[0_0_25px_rgba(52,211,153,0.35)] flex flex-col items-center justify-between p-2.5 animate-in fade-in duration-150">
                          {/* Corner Markers */}
                          <span className="absolute -top-1 -left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-emerald-300"></span>
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-emerald-300"></span>
                          <span className="absolute -bottom-1 -left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-emerald-300"></span>
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-emerald-300"></span>

                          <div className="w-full flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 uppercase">
                              TEST BENCH LIVE WEBCAM
                            </span>
                            <span className="text-[9px] font-mono text-emerald-400 bg-black/70 px-1.5 py-0.5 rounded border border-white/10">
                              98.9% CONF
                            </span>
                          </div>

                          <div className="px-3 py-1 bg-black/85 backdrop-blur-md rounded-lg border border-emerald-500/40 text-center shadow-lg">
                            <div className="text-xs font-bold text-white flex items-center gap-1 justify-center">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span>Live Test Subject (Active)</span>
                            </div>
                            <div className="text-[10px] font-mono text-emerald-300">
                              Confidence ≥ {formData.confidenceThreshold}% · Model: {formData.detectionModel.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative w-full h-full bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center">
                    {/* Simulated subject in center */}
                    {subjectData.avatar ? (
                      <div className="relative flex flex-col items-center">
                        <div
                          className={`relative w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden transition-all ${
                            formData.showBoundingBoxes
                              ? isMatchPassed
                                ? 'border-2 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]'
                                : 'border-2 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                              : 'border border-slate-700/80 shadow-md'
                          }`}
                        >
                          <img
                            src={subjectData.avatar}
                            alt={subjectData.name}
                            className="w-full h-full object-cover"
                          />
                          {/* Face landmarks overlay (only when Bounding Box Visualization is enabled) */}
                          {formData.showBoundingBoxes && (
                            <div className="absolute inset-0 border border-white/40 pointer-events-none">
                              <span className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-400"></span>
                              <span className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-400"></span>
                              <span className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-400"></span>
                              <span className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-400"></span>
                            </div>
                          )}
                        </div>

                        {/* Floating Identification Tag (only when Bounding Box Visualization is enabled) */}
                        {formData.showBoundingBoxes && (
                          <div className="mt-2 px-3 py-1 bg-black/80 backdrop-blur-md rounded-lg border border-white/20 text-center text-xs animate-in fade-in duration-150">
                            <div className="font-bold text-white">{subjectData.name}</div>
                            <div
                              className={`font-mono text-[11px] font-semibold ${
                                isMatchPassed ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              Score: {subjectData.score}% · Threshold: {formData.confidenceThreshold}% (
                              {isMatchPassed ? 'VERIFIED' : 'FAILED'})
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative flex flex-col items-center">
                        <div
                          className={`relative w-40 h-40 rounded-2xl flex items-center justify-center transition-all ${
                            formData.showBoundingBoxes
                              ? 'bg-rose-950/60 border-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                              : 'bg-slate-900 border border-slate-700 shadow-md'
                          }`}
                        >
                          <UserX
                            className={`w-16 h-16 ${
                              formData.showBoundingBoxes ? 'text-rose-400 animate-pulse' : 'text-slate-500'
                            }`}
                          />
                          {formData.showBoundingBoxes && (
                            <div className="absolute inset-0 border border-rose-500/80 pointer-events-none">
                              <span className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-rose-400"></span>
                              <span className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-rose-400"></span>
                              <span className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-rose-400"></span>
                              <span className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-rose-400"></span>
                            </div>
                          )}
                        </div>
                        {formData.showBoundingBoxes && (
                          <div className="mt-2 px-3 py-1 bg-rose-950/90 border border-rose-500/80 rounded-lg text-center text-xs text-rose-200 font-bold animate-in fade-in duration-150">
                            UNKNOWN / UNREGISTERED PERSON (Score: {subjectData.score}%)
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Overlaid Active Detection Zones (Semi-transparent) */}
                {formData.zones.map((zone) => {
                  if (!zone.enabled) return null;
                  return (
                    <div
                      key={zone.id}
                      className="absolute border border-dashed pointer-events-none transition-all flex items-start p-1.5 opacity-60"
                      style={{
                        left: `${zone.x}%`,
                        top: `${zone.y}%`,
                        width: `${zone.width}%`,
                        height: `${zone.height}%`,
                        borderColor: zone.color,
                        backgroundColor: `${zone.color}15`,
                      }}
                    >
                      <span
                        className="text-[9px] font-mono font-bold px-1 py-0.5 rounded text-white"
                        style={{ backgroundColor: `${zone.color}cc` }}
                      >
                        {zone.name.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}

                {/* Live Diagnostic HUD Top Left */}
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white font-mono text-[11px] space-y-0.5 pointer-events-none">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="font-bold text-emerald-300">STREAM ACTIVE</span>
                    <span>· {testFps} FPS</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Latency: {testLatency}ms · Backbone: {formData.detectionModel.toUpperCase()}
                  </div>
                </div>

                {/* Live Diagnostic HUD Top Right: Verification Status */}
                <div className="absolute top-3 right-3 pointer-events-none">
                  <div
                    className={`px-3 py-1.5 rounded-xl border backdrop-blur-md text-xs font-bold font-mono flex items-center gap-1.5 shadow-lg ${
                      isMatchPassed && isLivenessPassed
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                        : 'bg-rose-950/80 border-rose-500 text-rose-300'
                    }`}
                  >
                    {isMatchPassed && isLivenessPassed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>ATTENDANCE RECORDED: PASS</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>VERIFICATION REJECTED: BELOW THRESHOLD</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Live HUD Bottom: Active Zone & Liveness */}
                <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-[11px] font-mono text-white/90 pointer-events-none">
                  <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                    Position: <strong className="text-cyan-300">{subjectData.inZone}</strong>
                  </div>
                  <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-emerald-300">
                    Anti-Spoof Liveness: {subjectData.liveness}% Real
                  </div>
                </div>
              </div>

              {/* Dynamic Live Tuning Sliders within Test Bench */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800">
                      Live Threshold Adjustment:
                    </span>
                    <span className="font-mono font-bold text-blue-700">
                      {formData.confidenceThreshold}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="98"
                    value={formData.confidenceThreshold}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confidenceThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Test score ({subjectData.score}%) is{' '}
                    <strong
                      className={isMatchPassed ? 'text-emerald-700' : 'text-rose-700'}
                    >
                      {isMatchPassed ? 'above threshold (PASS)' : 'below threshold (REJECT)'}
                    </strong>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-800">
                      Detection Sensitivity Proposal:
                    </span>
                    <span className="font-mono font-bold text-slate-800">
                      {formData.sensitivityScore}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="0.95"
                    step="0.05"
                    value={formData.sensitivityScore}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sensitivityScore: Number(e.target.value),
                      })
                    }
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Model: {formData.detectionModel} · NMS: {formData.nmsThreshold}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                FaceNet-512 + YOLOv8 RTSP Inference Engine
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    stopWebcam();
                    setTestModalOpen(false);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Close Test Bench
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    handleSave(e);
                    stopWebcam();
                    setTestModalOpen(false);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Save &amp; Apply Verified Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
