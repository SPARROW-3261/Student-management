import React from 'react';
import {
  X,
  ShieldCheck,
  Cpu,
  Camera,
  Database,
  ArrowRight,
  Layers,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Code2,
} from 'lucide-react';

interface PresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PresentationModal: React.FC<PresentationModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Project Presentation & Viva Overview
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                  MCA Capstone
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Smart Classroom Attendance Management System Using Face Recognition
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-600">
          {/* Executive Summary */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Project Abstract</span>
            </h4>
            <p className="leading-relaxed">
              Traditional manual roll call and RFID cards are prone to proxy attendance, buddy punching, and class time wastage. This automated system installs an entrance camera that continuously scans individuals entering and leaving the classroom, extracts 512-dimensional biometric embeddings, verifies identities in under 50ms, calculates entry/exit durations, and maintains automated institutional records.
            </p>
          </div>

          {/* End-to-End System Pipeline */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>AI Vision & Recognition Pipeline</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80">
                <Camera className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
                <div className="font-bold text-slate-900 text-xs">1. RTSP Stream</div>
                <div className="text-[10px] text-slate-500 mt-1">1080p @ 30 FPS Entrance Camera</div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200/80">
                <Cpu className="w-5 h-5 text-indigo-600 mx-auto mb-1.5" />
                <div className="font-bold text-slate-900 text-xs">2. Face Detection</div>
                <div className="text-[10px] text-slate-500 mt-1">MTCNN / YOLOv8-Face Localization</div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-50/70 border border-cyan-200/80">
                <ShieldCheck className="w-5 h-5 text-cyan-600 mx-auto mb-1.5" />
                <div className="font-bold text-slate-900 text-xs">3. Feature Vector</div>
                <div className="text-[10px] text-slate-500 mt-1">FaceNet 512-D L2 Embedding</div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                <Database className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
                <div className="font-bold text-slate-900 text-xs">4. Match & Log</div>
                <div className="text-[10px] text-slate-500 mt-1">Cosine Distance &ge; 85% Threshold</div>
              </div>
            </div>
          </div>

          {/* Viva Questions Cheat Sheet */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs mb-3 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Key Defense / Viva Questions</span>
            </h4>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="font-bold text-slate-900 mb-1">
                  Q1: How does the system prevent duplicate attendance for repeated camera passes?
                </div>
                <div className="text-slate-600 leading-relaxed text-[11px]">
                  <strong>Answer:</strong> An in-memory 15-minute debounce window is maintained. If a student is identified at 09:00 AM, any subsequent detections within the next 15 minutes are discarded as duplicate pings, preventing spam records while still allowing exit logging when they leave after the class ends.
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="font-bold text-slate-900 mb-1">
                  Q2: How does the camera differentiate between Entry and Exit events?
                </div>
                <div className="text-slate-600 leading-relaxed text-[11px]">
                  <strong>Answer:</strong> Two modes are supported: (1) Dual camera setup where Camera 01 is mounted facing outwards (Entrance) and Camera 02 is mounted facing inwards (Exit); or (2) Optical flow tracking that monitors the directional bounding box trajectory vector across the door boundary.
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="font-bold text-slate-900 mb-1">
                  Q3: How are student and teacher attendances segregated?
                </div>
                <div className="text-slate-600 leading-relaxed text-[11px]">
                  <strong>Answer:</strong> Students and Teachers possess independent schema models in the database with separate ID spaces (<code className="font-mono text-blue-700">STU-*</code> vs <code className="font-mono text-indigo-700">TCH-*</code>). Department-level reporting and payroll calculations are cleanly isolated from student class percentages.
                </div>
              </div>
            </div>
          </div>

          {/* Backend Stack Ready */}
          <div className="p-3 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <Code2 className="w-4 h-4 text-blue-400" />
              <span>Python Backend Connection Architecture</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              This React dashboard UI is structured to connect seamlessly to a Python Flask/FastAPI REST backend running OpenCV and FaceNet. REST endpoints <code className="text-blue-300">/api/attendance/live-stream</code>, <code className="text-blue-300">/api/students/enroll</code>, and <code className="text-blue-300">/api/records/export</code> map 1:1 with the state interfaces in this app.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">
            Smart Classroom Face Recognition Attendance System v2.4
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
          >
            Close Viva Guide
          </button>
        </div>
      </div>
    </div>
  );
};
