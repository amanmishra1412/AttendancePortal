'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTodayAttendance,
  punchInAction,
  punchOutAction,
  fetchAttendanceHistory,
  clearAttendanceMessage,
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
  const { today, history, loading, punching, message, error } = useSelector((state) => state.attendance);
  const { settings: office } = useSelector((state) => state.office);
  const { user } = useSelector((state) => state.auth);

  const [coords, setCoords] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [time, setTime] = useState('');

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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
            <h2 className="text-lg font-bold text-slate-900">Attendance History & Shift Logs</h2>
            <p className="text-xs text-slate-500">Overtime minutes, shortfalls & Sunday work tracking</p>
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
                <th className="p-3.5">OT / Shortfall Math</th>
                <th className="p-3.5 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'Admin' ? 7 : 6} className="text-center py-8 text-slate-400">
                    No attendance logs found for this period.
                  </td>
                </tr>
              ) : (
                history.map((item) => (
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
                        <span className="text-amber-700 font-bold">Sunday Work Pay: +{item.totalWorkingMinutes}m</span>
                      ) : (
                        <span>
                          <span className="text-emerald-600 font-semibold">OT: +{item.overtimeMinutes || 0}m</span> |{' '}
                          <span className="text-rose-600 font-semibold">Shortfall: -{item.shortfallMinutes || 0}m</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <MapPin className="w-3 h-3" /> Verified ({item.punchIn?.distanceMeters || 0}m)
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
