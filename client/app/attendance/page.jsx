'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTodayAttendance,
  punchInAction,
  punchOutAction,
  fetchAttendanceHistory,
  clearAttendanceMessage,
  submitRegularization,
} from '../../store/slices/attendanceSlice';
import { fetchOfficeSettings } from '../../store/slices/officeSlice';
import {
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  RefreshCw,
  Navigation,
  Filter,
  ShieldAlert,
  CalendarDays,
  Check,
  Edit3,
  Send,
  X,
  FileText,
} from 'lucide-react';

const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371e3;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

export default function AttendancePage() {
  const dispatch = useDispatch();
  const { today, history, loading, punching, submittingReq, message, error } = useSelector((state) => state.attendance);
  const { settings: office } = useSelector((state) => state.office);
  const { user } = useSelector((state) => state.auth);

  const [coords, setCoords] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [time, setTime] = useState('');

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [punchInTime, setPunchInTime] = useState('09:30');
  const [punchOutTime, setPunchOutTime] = useState('18:30');
  const [reason, setReason] = useState('');
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    dispatch(fetchTodayAttendance());
    dispatch(fetchOfficeSettings());
    dispatch(fetchAttendanceHistory({ month: selectedMonth, year: selectedYear }));

    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, [dispatch, selectedMonth, selectedYear]);

  const getCoordinates = () => {
    setGeoLoading(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError('HTML5 Geolocation is not supported by your browser.');
      setGeoLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setGeoLoading(false);
      },
      (err) => {
        setGeoError(`Location Error: ${err.message}. Please allow location permissions in your browser.`);
        setCoords(null);
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    getCoordinates();
  }, [office]);

  const currentDistance =
    coords && office?.latitude && office?.longitude
      ? calculateDistanceMeters(coords.latitude, coords.longitude, office.latitude, office.longitude)
      : null;

  const allowedRadius = office?.allowedRadiusMeters || 500;
  const isInsideOffice = currentDistance !== null && currentDistance <= allowedRadius;

  const handlePunchIn = () => {
    if (!coords) return;
    dispatch(clearAttendanceMessage());
    dispatch(punchInAction(coords));
  };

  const handlePunchOut = () => {
    if (!coords) return;
    dispatch(clearAttendanceMessage());
    dispatch(punchOutAction(coords));
  };

  const handleOpenEditModal = (item) => {
    setSelectedRecord(item);
    setModalError('');
    setReason('');

    // Pre-fill time if exists
    if (item.punchIn?.timestamp) {
      const d = new Date(item.punchIn.timestamp);
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      setPunchInTime(`${hh}:${mm}`);
    } else {
      setPunchInTime('09:30');
    }

    if (item.punchOut?.timestamp) {
      const d = new Date(item.punchOut.timestamp);
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      setPunchOutTime(`${hh}:${mm}`);
    } else {
      setPunchOutTime('18:30');
    }

    setIsModalOpen(true);
  };

  const handleSubmitRegularization = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!punchInTime || !punchOutTime || !reason.trim()) {
      setModalError('Please enter Punch In Time, Punch Out Time, and Reason.');
      return;
    }

    const requestedPunchIn = `${selectedRecord.date}T${punchInTime}:00`;
    const requestedPunchOut = `${selectedRecord.date}T${punchOutTime}:00`;

    if (new Date(requestedPunchOut) <= new Date(requestedPunchIn)) {
      setModalError('Punch Out time must be after Punch In time.');
      return;
    }

    dispatch(clearAttendanceMessage());
    const res = await dispatch(
      submitRegularization({
        date: selectedRecord.date,
        requestedPunchIn,
        requestedPunchOut,
        reason: reason.trim(),
      })
    );

    if (submitRegularization.fulfilled.match(res)) {
      setIsModalOpen(false);
      dispatch(fetchAttendanceHistory({ month: selectedMonth, year: selectedYear }));
    } else {
      setModalError(res.payload || 'Failed to submit request.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Dynamic 9-Hour Shift Attendance</h1>
          <p className="text-slate-500 text-xs mt-1">
            Flexible 9-hour shift duration, minute-based overtime & shortfall tracking (Inside Office Boundary Only)
          </p>
        </div>
        <button
          onClick={getCoordinates}
          disabled={geoLoading}
          className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 transition shadow-xs w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${geoLoading ? 'animate-spin' : ''}`} />
          <span>Acquire GPS Location</span>
        </button>
      </div>

      {/* Alerts */}
      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Location Restriction Banner */}
      {currentDistance !== null && !isInsideOffice && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3 shadow-xs">
          <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
          <div>
            <p className="font-bold text-rose-900">Outside Office Boundary ({currentDistance} meters away)</p>
            <p className="text-[11px] text-rose-700 mt-0.5">
              Punch In and Punch Out are strictly prohibited. You must be physically inside the {allowedRadius} meters office boundary.
            </p>
          </div>
        </div>
      )}

      {/* Main Punch Clock Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Clock & Punch Controls */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${isInsideOffice ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                {isInsideOffice ? 'Inside Office Geofence' : 'Location Restricted'}
              </span>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-mono font-semibold">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>

          {/* Time & Shift End Target */}
          <div className="text-center py-2">
            <div className="text-5xl sm:text-6xl font-black text-slate-900 font-mono tracking-tight">
              {time || '09:00:00 AM'}
            </div>
            {today?.punchIn?.timestamp ? (
              <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-2xl inline-block text-xs font-medium text-indigo-900">
                <span>Punched In at {new Date(today.punchIn.timestamp).toLocaleTimeString()}</span> &rarr;{' '}
                <span className="font-bold text-indigo-700">
                  Required 9-Hour Shift End: {new Date(today.expectedPunchOutTime || new Date(today.punchIn.timestamp).getTime() + 9*3600000).toLocaleTimeString()}
                </span>
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-2">Standard Shift Duration: 9 Hours from Punch In time</p>
            )}
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handlePunchIn}
              disabled={punching || (today && today.punchIn?.timestamp) || !isInsideOffice}
              className={`p-5 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-3 shadow-md ${
                !isInsideOffice || (today && today.punchIn?.timestamp)
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <div className="text-left">
                <div className="text-base leading-none">PUNCH IN</div>
                <div className="text-[10px] font-normal opacity-90 mt-1">
                  {today?.punchIn?.timestamp
                    ? `Punched at ${new Date(today.punchIn.timestamp).toLocaleTimeString()}`
                    : !isInsideOffice
                    ? 'Requires Office Location'
                    : 'Start 9-Hour Shift'}
                </div>
              </div>
            </button>

            <button
              onClick={handlePunchOut}
              disabled={punching || !today?.punchIn?.timestamp || today?.punchOut?.timestamp || !isInsideOffice}
              className={`p-5 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-3 shadow-md ${
                !isInsideOffice || !today?.punchIn?.timestamp || today?.punchOut?.timestamp
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
              }`}
            >
              <XCircle className="w-5 h-5" />
              <div className="text-left">
                <div className="text-base leading-none">PUNCH OUT</div>
                <div className="text-[10px] font-normal opacity-90 mt-1">
                  {today?.punchOut?.timestamp
                    ? `Punched out at ${new Date(today.punchOut.timestamp).toLocaleTimeString()}`
                    : !isInsideOffice
                    ? 'Requires Office Location'
                    : 'End 9-Hour Shift'}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* GPS Location Status */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl flex flex-col justify-between space-y-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <Navigation className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">GPS Location Metrics</h3>
            </div>

            {geoError && (
              <div className="p-3 mb-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                {geoError}
              </div>
            )}

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Target Office:</span>
                  <span className="font-semibold text-slate-900">{office?.officeName || 'HQ'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Target Coords:</span>
                  <span className="font-mono text-slate-700">{office?.latitude}, {office?.longitude}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Max Allowed Boundary:</span>
                  <span className="font-semibold text-indigo-600">{allowedRadius} meters</span>
                </div>
              </div>

              <div className={`p-4 rounded-2xl text-xs space-y-2 border ${
                isInsideOffice
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div className="flex justify-between font-semibold">
                  <span>Your Current Distance:</span>
                  <span className={`font-black font-mono ${isInsideOffice ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {currentDistance !== null ? `${currentDistance} meters` : 'Acquiring GPS...'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Geofence Status:</span>
                  <span className={`font-bold ${isInsideOffice ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {isInsideOffice ? 'Inside Office' : 'Outside Office'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-slate-500 text-xs">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Strict location verification enforced.</span>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Daily Monthly Attendance & Regularization</h2>
            <p className="text-xs text-slate-500">All calendar dates with status (Present, Absent, Sunday) and punch edit request option</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700">
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-transparent text-slate-900 focus:outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1} className="bg-white text-slate-900">
                    {new Date(0, i).toLocaleString('en', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent text-slate-900 focus:outline-none"
              >
                <option value={2026} className="bg-white text-slate-900">2026</option>
                <option value={2025} className="bg-white text-slate-900">2025</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 uppercase tracking-wider text-[10px]">
              <tr>
                {user?.role === 'Admin' && <th className="p-3.5 rounded-l-xl">Employee</th>}
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Punch In</th>
                <th className="p-3.5">Punch Out</th>
                <th className="p-3.5">Worked Duration</th>
                <th className="p-3.5">OT / Shortfall</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 rounded-r-xl text-center">Action / Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={user?.role === 'Admin' ? 8 : 7} className="text-center py-8 text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading attendance history...</span>
                    </div>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'Admin' ? 8 : 7} className="text-center py-8 text-slate-400">
                    No attendance logs found for this period.
                  </td>
                </tr>
              ) : (
                history.map((item) => {
                  const req = item.regularizationRequest;
                  return (
                    <tr key={item._id} className="hover:bg-slate-50 transition">
                      {user?.role === 'Admin' && (
                        <td className="p-3.5 font-semibold text-slate-900">
                          {item.employee?.name} <span className="text-slate-400 text-[10px]">({item.employee?.employeeId})</span>
                        </td>
                      )}
                      <td className="p-3.5 text-slate-700 font-mono">
                        {item.date} {item.isSunday && <span className="text-amber-600 font-bold text-[10px]">(SUN)</span>}
                      </td>
                      <td className="p-3.5 text-slate-800 font-medium">
                        {item.punchIn?.timestamp
                          ? new Date(item.punchIn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '-'}
                      </td>
                      <td className="p-3.5 text-slate-800 font-medium">
                        {item.punchOut?.timestamp
                          ? new Date(item.punchOut.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '-'}
                      </td>
                      <td className="p-3.5 font-bold text-indigo-700">
                        {Math.floor((item.totalWorkingMinutes || 0) / 60)}h {(item.totalWorkingMinutes || 0) % 60}m
                      </td>
                      <td className="p-3.5">
                        {item.isSunday ? (
                          <span className="text-amber-700 font-bold text-[11px]">Sunday Pay: +{item.totalWorkingMinutes || 0}m</span>
                        ) : (
                          <span className="text-[11px]">
                            <span className="text-emerald-600 font-semibold">OT: +{item.overtimeMinutes || 0}m</span> |{' '}
                            <span className="text-rose-600 font-semibold">Shortfall: -{item.shortfallMinutes || 0}m</span>
                          </span>
                        )}
                      </td>

                      {/* Status Column */}
                      <td className="p-3.5">
                        {req && req.status === 'Pending' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" /> Pending Approval
                          </span>
                        ) : req && req.status === 'Approved' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> Regularized
                          </span>
                        ) : item.status === 'Present' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3" /> Present
                          </span>
                        ) : item.status === 'Absent' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3 h-3" /> Absent
                          </span>
                        ) : item.status === 'Sunday' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Weekend / Sunday
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">{item.status || '-'}</span>
                        )}
                      </td>

                      {/* Edit Button Action Column */}
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          disabled={req?.status === 'Pending' || item.status === '-'}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-[11px] border transition shadow-xs ${
                            req?.status === 'Pending' || item.status === '-'
                              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                          }`}
                          title={req?.status === 'Pending' ? 'Regularization pending approval' : 'Edit / Request Correction'}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{req?.status === 'Pending' ? 'Pending' : 'Edit'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance Regularization Modal */}
      {isModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 font-bold shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Attendance Regularization</h3>
                  <p className="text-xs text-slate-500 font-mono">Date: {selectedRecord.date}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error banner inside modal */}
            {modalError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Regularization Form */}
            <form onSubmit={handleSubmitRegularization} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Punch In Time
                  </label>
                  <input
                    type="time"
                    value={punchInTime}
                    onChange={(e) => setPunchInTime(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-xs rounded-xl px-3 py-2.5 outline-none focus:border-indigo-600 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Punch Out Time
                  </label>
                  <input
                    type="time"
                    value={punchOutTime}
                    onChange={(e) => setPunchOutTime(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-mono font-bold text-xs rounded-xl px-3 py-2.5 outline-none focus:border-indigo-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Reason for Correction / Regularization
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Forgot to punch in due to early field work, machine error, etc."
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-3 outline-none focus:border-indigo-600 focus:bg-white transition"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReq}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingReq ? 'Submitting...' : 'Submit Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

