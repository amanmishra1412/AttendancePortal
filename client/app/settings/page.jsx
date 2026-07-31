'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOfficeSettings, updateOfficeSettingsAction } from '../../store/slices/officeSlice';
import { MapPin, Clock, Save, CheckCircle, XCircle, Crosshair } from 'lucide-react';

export default function SettingsPage() {
  const dispatch = useDispatch();
  const { settings, loading, message, error } = useSelector((state) => state.office);

  const [formData, setFormData] = useState({
    officeName: 'Headquarters',
    latitude: 28.6139,
    longitude: 77.209,
    allowedRadiusMeters: 500,
    workStartTime: '09:00',
    workEndTime: '18:00',
    graceTimeMinutes: 15,
    overtimeRateMultiplier: 1.5,
    lateDeductionPerMinute: 5,
    earlyExitDeductionPerMinute: 5,
  });

  useEffect(() => {
    dispatch(fetchOfficeSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setFormData({
        officeName: settings.officeName || 'Headquarters',
        latitude: settings.latitude || 28.6139,
        longitude: settings.longitude || 77.209,
        allowedRadiusMeters: settings.allowedRadiusMeters || 500,
        workStartTime: settings.workStartTime || '09:00',
        workEndTime: settings.workEndTime || '18:00',
        graceTimeMinutes: settings.graceTimeMinutes || 15,
        overtimeRateMultiplier: settings.overtimeRateMultiplier || 1.5,
        lateDeductionPerMinute: settings.lateDeductionPerMinute || 5,
        earlyExitDeductionPerMinute: settings.earlyExitDeductionPerMinute || 5,
      });
    }
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateOfficeSettingsAction(formData));
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        }));
      });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Office Location & Policy Settings</h1>
        <p className="text-slate-500 text-xs mt-1">Configure GPS geofencing radius, shift times, grace periods & overtime rates</p>
      </div>

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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* GPS Geofence */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-slate-900 text-base">Office Geofence Coordinates</h2>
            </div>
            <button
              type="button"
              onClick={useCurrentLocation}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition flex items-center gap-1.5 border border-indigo-200"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Capture Current Location</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Office Name</label>
              <input
                type="text"
                value={formData.officeName}
                onChange={(e) => setFormData({ ...formData, officeName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-mono rounded-xl p-3 outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-mono rounded-xl p-3 outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1 text-xs">Allowed GPS Punch Radius (Meters)</label>
            <input
              type="number"
              value={formData.allowedRadiusMeters}
              onChange={(e) => setFormData({ ...formData, allowedRadiusMeters: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 outline-none focus:border-indigo-600 text-xs"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Employees punching in beyond {formData.allowedRadiusMeters} meters will be strictly blocked from punching.
            </p>
          </div>
        </div>

        {/* Shift Timings */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-slate-900 text-base">Office Shifts & Deduction Rules</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Standard Shift Start Time</label>
              <input
                type="text"
                value={formData.workStartTime}
                onChange={(e) => setFormData({ ...formData, workStartTime: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Standard Shift End Time</label>
              <input
                type="text"
                value={formData.workEndTime}
                onChange={(e) => setFormData({ ...formData, workEndTime: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Grace Period (Minutes)</label>
              <input
                type="number"
                value={formData.graceTimeMinutes}
                onChange={(e) => setFormData({ ...formData, graceTimeMinutes: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 outline-none focus:border-indigo-600"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 text-xs transition"
        >
          <Save className="w-4 h-4" />
          <span>Save Office Configuration</span>
        </button>
      </form>
    </div>
  );
}
