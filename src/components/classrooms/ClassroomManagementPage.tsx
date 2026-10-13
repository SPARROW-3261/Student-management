import React, { useState } from 'react';
import {
  DoorOpen,
  Camera,
  Users,
  Plus,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  Video,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Classroom, AttendanceRecord, Student } from '../../types/attendance';

interface ClassroomManagementPageProps {
  classrooms: Classroom[];
  onAddClassroom: (classroom: Classroom) => void;
  onUpdateClassroom: (classroom: Classroom) => void;
  onDeleteClassroom: (id: string) => void;
  attendanceRecords: AttendanceRecord[];
  students: Student[];
}

export const ClassroomManagementPage: React.FC<ClassroomManagementPageProps> = ({
  classrooms,
  onAddClassroom,
  onUpdateClassroom,
  onDeleteClassroom,
  attendanceRecords,
  students,
}) => {
  const [selectedClassroomForDetails, setSelectedClassroomForDetails] = useState<Classroom | null>(
    null
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);

  const [formData, setFormData] = useState({
    id: `CR-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    building: 'Aryabhata Computing Block',
    floor: '2nd Floor',
    assignedCamera: 'Entrance Cam 04',
    maxCapacity: 45,
    registeredStudentsCount: 60,
    currentSubject: 'Advanced Algorithms',
    currentFaculty: 'Prof. Amit Verma',
  });

  const handleSaveClassroom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newClassroom: Classroom = {
      id: formData.id,
      name: formData.name,
      building: formData.building,
      floor: formData.floor,
      assignedCamera: formData.assignedCamera,
      cameraStatus: 'online',
      currentOccupancy: 0,
      maxCapacity: Number(formData.maxCapacity) || 40,
      registeredStudentsCount: Number(formData.registeredStudentsCount) || 50,
      currentSubject: formData.currentSubject,
      currentFaculty: formData.currentFaculty,
    };

    onAddClassroom(newClassroom);
    setIsAddModalOpen(false);
  };

  // Find people currently inside the selected classroom
  const peopleInside = selectedClassroomForDetails
    ? attendanceRecords.filter(
        (r) =>
          (r.classroomId === selectedClassroomForDetails.id ||
            r.classroom.includes(selectedClassroomForDetails.id)) &&
          (!r.exitTime || r.status === 'inside')
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-blue-600" />
            <span>Classroom & Laboratory Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor room capacities, assigned edge cameras, and real-time headcounts
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Classroom</span>
        </button>
      </div>

      {/* Classroom Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {classrooms.map((cr) => {
          const occupancyPct = Math.round((cr.currentOccupancy / cr.maxCapacity) * 100);
          const isHighOccupancy = occupancyPct >= 85;

          return (
            <div
              key={cr.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {cr.id}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1.5">
                      {cr.name}
                    </h3>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      cr.cameraStatus === 'online'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        cr.cameraStatus === 'online' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    {cr.cameraStatus === 'online' ? 'Online' : 'Warning'}
                  </span>
                </div>

                {/* Building / Location */}
                <div className="text-xs text-slate-500 mb-3">
                  <div>{cr.building}</div>
                  <div className="text-[11px] text-slate-400">{cr.floor}</div>
                </div>

                {/* Camera Assigned */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2 text-xs mb-3">
                  <Camera className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-slate-600 font-medium truncate">
                    {cr.assignedCamera}
                  </span>
                </div>

                {/* Occupancy Bar */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Occupancy:</span>
                    <span className="font-mono font-bold tabular-nums text-slate-800">
                      {cr.currentOccupancy} / {cr.maxCapacity} ({occupancyPct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHighOccupancy ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                </div>

                {/* Subject / Faculty info */}
                {cr.currentSubject && (
                  <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="font-semibold text-slate-800 truncate">
                      {cr.currentSubject}
                    </div>
                    <div className="text-slate-400 truncate">By {cr.currentFaculty}</div>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  {cr.registeredStudentsCount} Enrolled
                </span>
                <button
                  onClick={() => setSelectedClassroomForDetails(cr)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Occupants</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Classroom Details & Live Occupants Modal */}
      {selectedClassroomForDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl p-6 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {selectedClassroomForDetails.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedClassroomForDetails.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live occupancy roster recorded via camera entrance logging
                </p>
              </div>
              <button
                onClick={() => setSelectedClassroomForDetails(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Room stats banner */}
            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                <div className="text-slate-400 font-semibold text-[10px] uppercase">
                  Current Inside
                </div>
                <div className="text-lg font-bold font-mono text-blue-700 mt-0.5">
                  {selectedClassroomForDetails.currentOccupancy} People
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                <div className="text-slate-400 font-semibold text-[10px] uppercase">
                  Room Capacity
                </div>
                <div className="text-lg font-bold font-mono text-slate-800 mt-0.5">
                  {selectedClassroomForDetails.maxCapacity} Seats
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                <div className="text-slate-400 font-semibold text-[10px] uppercase">
                  Camera Status
                </div>
                <div className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>30 FPS RTSP Live</span>
                </div>
              </div>
            </div>

            {/* List of People currently inside */}
            <div className="flex-1 overflow-y-auto">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Individuals Currently Inside Classroom ({peopleInside.length || selectedClassroomForDetails.currentOccupancy})
              </h4>

              <div className="space-y-2">
                {peopleInside.length > 0 ? (
                  peopleInside.map((person) => (
                    <div
                      key={person.id}
                      className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={person.snapshotUrl}
                          alt={person.personName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div>
                          <div className="font-bold text-slate-900">
                            {person.personName}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {person.personId} · {person.personType.toUpperCase()}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-emerald-700 font-semibold">
                          Entry: {person.entryTime}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Duration: {person.duration}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No active occupancy events logged for this classroom currently.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedClassroomForDetails(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Classroom Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add New Classroom / Lab</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClassroom} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Classroom Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI & Robotics Lab 402"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Building</label>
                <input
                  type="text"
                  value={formData.building}
                  onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Capacity</label>
                  <input
                    type="number"
                    value={formData.maxCapacity}
                    onChange={(e) =>
                      setFormData({ ...formData, maxCapacity: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Assigned Camera
                  </label>
                  <input
                    type="text"
                    value={formData.assignedCamera}
                    onChange={(e) =>
                      setFormData({ ...formData, assignedCamera: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Save Classroom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
