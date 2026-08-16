'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  Clock,
  Wallet,
  CalendarDays,
  Building2,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Settings,
  HelpCircle,
  Search,
  ExternalLink,
  Smartphone,
  Navigation,
  DollarSign,
  AlertTriangle,
  Play,
  RotateCcw
} from 'lucide-react';

export default function HowItWorksModal({ isOpen, onClose, initialStep = 0 }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [searchQuery, setSearchQuery] = useState('');
  const [demoPunchState, setDemoPunchState] = useState('idle'); // 'idle' | 'punched_in'
  const [demoDistance, setDemoDistance] = useState(42); // meters

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(initialStep);
      // Disable background scrolling when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialStep]);

  // Keyboard navigation (ESC to close, Arrow keys to navigate)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const slides = [
    {
      id: 'overview',
      category: 'Overview',
      title: 'AttendancePro System Overview',
      subtitle: 'Complete Cloud-based Location HRMS & Automated Payroll Engine',
      hindiDesc: 'Yeh complete software location-based attendance tracking, automated salary calculation aur leave management ke liye banaya gaya hai. Shift timing 10:00 AM se 07:00 PM (19:00) tak hoti hai.',
      icon: Sparkles,
      color: 'from-indigo-600 to-violet-600',
      badge: 'Start Here',
      linkText: 'Go to Dashboard',
      linkUrl: '/dashboard',
      steps: [
        {
          heading: '1. Role-Based Dual Architecture',
          desc: 'Employees punch attendance, view salary slips & apply leaves. Admins configure office GPS boundaries, approve requests & run automated monthly payroll.'
        },
        {
          heading: '2. High-Accuracy Location Security',
          desc: 'Attendance is strictly locked to official office GPS coordinates. Anti-spoofing and radius checks prevent proxy attendance.'
        },
        {
          heading: '3. Automated Real-Time Payroll',
          desc: 'Instant minute-rate salary calculation with overtime bonuses (1.5x), Sunday working credits, advance deductions and direct PDF download.'
        }
      ],
      interactiveType: 'overview_flow'
    },
    {
      id: 'geofence',
      category: 'Office Boundary',
      title: 'GPS Office Geofence & Boundary Setup',
      subtitle: 'Virtual boundary around your office with customizable radius',
      hindiDesc: 'Office ki exact Latitude, Longitude aur Allowed Radius (Meters) set ki jaati hai. Sirf boundary ke andar se hi Punch In ho sakta hai.',
      icon: MapPin,
      color: 'from-blue-600 to-cyan-600',
      badge: 'GPS Geofencing',
      linkText: 'Configure Office Settings',
      linkUrl: '/admin/settings',
      steps: [
        {
          heading: 'Admin Sets Office Coordinates',
          desc: 'Admin goes to "Office GPS Settings" and clicks "Capture Current Location" or inputs Latitude (e.g. 28.6139) and Longitude (e.g. 77.2090).'
        },
        {
          heading: 'Allowed Radius (e.g. 200m - 500m)',
          desc: 'Define the maximum perimeter in meters within which employee punch requests are accepted as valid office presence.'
        },
        {
          heading: 'Haversine Real-Time Distance Check',
          desc: 'When an employee presses Punch In, the browser fetches live GPS coordinates and mathematically computes the exact distance from office center.'
        }
      ],
      interactiveType: 'boundary_demo'
    },
    {
      id: 'punch',
      category: 'Punch In & Out',
      title: 'GPS Punch In & Punch Out Workflow',
      subtitle: 'Standard 10:00 AM – 07:00 PM shift with single-click attendance marking',
      hindiDesc: 'Office timing subah 10:00 se shaam 19:00 (7:00 PM) tak hai. Employee boundary ke andar aakar direct Punch In / Out kar sakte hain bina kisi complex late penalty ke.',
      icon: Clock,
      color: 'from-emerald-600 to-teal-600',
      badge: 'Attendance Clock',
      linkText: 'Open Attendance Clock',
      linkUrl: '/attendance',
      steps: [
        {
          heading: '1. GPS Location Verification',
          desc: 'The system reads device GPS. If inside the office boundary (within allowed meters), the Punch In button turns green & activates.'
        },
        {
          heading: '2. Standard Shift Timings (10:00 - 19:00)',
          desc: 'Standard working schedule is 10:00 AM to 07:00 PM (9 hours shift). All worked hours are recorded accurately.'
        },
        {
          heading: '3. Punch Out & Total Working Hours',
          desc: 'At end of shift, clicking Punch Out records total active working time and tracks extra overtime hours.'
        },
        {
          heading: '4. Attendance Regularization',
          desc: 'Forgot to punch? Employees can submit a regularization request with reason for Admin review & instant approval.'
        }
      ],
      interactiveType: 'punch_demo'
    },
    {
      id: 'leave',
      category: 'Leaves & Holidays',
      title: 'Leave Requests & Holiday Policies',
      subtitle: 'Apply for leaves, track approvals, and view Sunday holiday rules',
      hindiDesc: 'Casual, Medical ya Unpaid leave ke liye application submit karein. Sundays aur National Holidays official holidays hain, aur Sunday ko kaam karne par Overtime Bonus milta hai.',
      icon: CalendarDays,
      color: 'from-amber-600 to-orange-600',
      badge: 'Leave Management',
      linkText: 'Apply For Leave',
      linkUrl: '/leave',
      steps: [
        {
          heading: '1. Apply for Leave Application',
          desc: 'Employees select Leave Type (Casual / Medical Leave or Unpaid Leave) with Start and End dates plus reason.'
        },
        {
          heading: '2. Official Holidays (Sundays & Festivals)',
          desc: 'Sundays and National Holidays are official days off. No complex paid leave balance deductions needed.'
        },
        {
          heading: '3. Admin Instant Review',
          desc: 'Admin views all pending requests in "Leave Approvals" and can Approve or Reject with feedback.'
        }
      ],
      interactiveType: 'leave_demo'
    },
    {
      id: 'salary',
      category: 'Salary & Payslips',
      title: 'Automated Salary Engine & PDF Payslips',
      subtitle: 'Accurate minute-rate payroll, bonuses, deductions & instant PDF downloads',
      hindiDesc: 'Base salary ko standard 30 days & 270 hours ke hisaab se calculate kiya jata hai. Overtime 1.5x bonus aur Sunday working pay automatically add hokar downloadable PDF Payslip banti hai.',
      icon: Wallet,
      color: 'from-purple-600 to-indigo-600',
      badge: 'Payroll Engine',
      linkText: 'View Salary Payslips',
      linkUrl: '/salary',
      steps: [
        {
          heading: '1. Standard Minute-Rate Formula',
          desc: 'Daily Rate = Base Salary / 30. Minute Rate = Base Salary / 270 hours / 60 mins. Every worked minute is precisely calculated.'
        },
        {
          heading: '2. Overtime & Sunday Working Bonus',
          desc: 'Overtime beyond scheduled hours is credited at 1.5x the standard minute rate. Sunday work is fully credited as special overtime pay.'
        },
        {
          heading: '3. Advance Loan Deductions',
          desc: 'Approved salary advances are automatically subtracted from gross salary during monthly payroll generation.'
        },
        {
          heading: '4. Downloadable PDF Salary Slips',
          desc: 'Click "View PDF" to open or download a professionally formatted salary slip with company branding, breakdowns & net pay.'
        }
      ],
      interactiveType: 'salary_demo'
    },
    {
      id: 'finance',
      category: 'Advances & Finance',
      title: 'Salary Advances & Expense Claims',
      subtitle: 'Request emergency loans or travel/food reimbursements seamlessly',
      hindiDesc: 'Employee salary advance ya business expense claim submit kar sakte hain. Admin approve karte hi amount payroll me integrate ho jati hai.',
      icon: Building2,
      color: 'from-rose-600 to-pink-600',
      badge: 'Finance & Advances',
      linkText: 'Open Advances & Finance',
      linkUrl: '/finance',
      steps: [
        {
          heading: '1. Salary Advance Request',
          desc: 'Employees in need of emergency funds can request a salary advance with reason and preferred monthly repayment deduction.'
        },
        {
          heading: '2. Admin Review & Disbursement',
          desc: 'Admin checks employee profile, past attendance records and approves or rejects the advance.'
        },
        {
          heading: '3. Automated Payroll Deduction',
          desc: 'Approved advances are automatically accounted for during monthly salary batch generation.'
        }
      ],
      interactiveType: 'finance_demo'
    },
    {
      id: 'admin',
      category: 'Admin Control',
      title: 'Admin Center & Security Controls',
      subtitle: 'User account approvals, employee management, and security audit logs',
      hindiDesc: 'Admin new staff ko approve kar sakte hain, salary update kar sakte hain, aur security audit logs monitor kar sakte hain.',
      icon: ShieldCheck,
      color: 'from-slate-700 to-slate-900',
      badge: 'Admin Center',
      linkText: 'Admin Dashboard',
      linkUrl: '/admin/dashboard',
      steps: [
        {
          heading: '1. New Registration Approval Queue',
          desc: 'When a new employee signs up, their account remains in "Pending Approval" until an Admin reviews and approves access.'
        },
        {
          heading: '2. Staff Directory & Salary Setup',
          desc: 'Manage departments, designations, phone numbers, and individual base salaries in the Employee Directory.'
        },
        {
          heading: '3. System Audit & Security Logs',
          desc: 'Every sensitive operation (settings changes, manual punch overrides, payroll calculations) is permanently logged in the Audit Trail.'
        }
      ],
      interactiveType: 'admin_demo'
    }
  ];

  // Search filter
  const filteredSlides = searchQuery.trim()
    ? slides.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.hindiDesc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : slides;

  const currentSlide = filteredSlides[currentStep] || slides[0];

  const handleNext = () => {
    if (currentStep < filteredSlides.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const navigateToPage = (url) => {
    onClose();
    router.push(url);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6">
      {/* Dark backdrop with blur */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Main Modal Container */}
      <div className="relative w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] z-10 animate-in zoom-in-95 duration-200">
        {/* Top Header Bar */}
        <div className="px-5 py-4 sm:px-8 sm:py-5 border-b border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  How AttendancePro Works
                </h3>
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                  Interactive Guide
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">
                Full software walkthrough: GPS Punch In/Out, Office Boundary, Leaves & Automated Salary
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Box */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search guide (GPS, Salary...)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentStep(0);
                }}
                className="w-full bg-white pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ×
                </button>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
              aria-label="Close guide modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Category Tab Bar */}
        <div className="flex items-center gap-1.5 px-4 sm:px-8 py-2.5 border-b border-slate-100 bg-white overflow-x-auto no-scrollbar shrink-0">
          {filteredSlides.map((slide, idx) => {
            const Icon = slide.icon;
            const isSelected = idx === currentStep;
            return (
              <button
                key={slide.id}
                onClick={() => setCurrentStep(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                <span>{slide.category}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body - Slide Content & Interactive Mockup */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Explanations & Steps (7 Cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Title & Badge */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-[11px] px-2.5 py-0.5 rounded-lg">
                    {currentSlide.badge}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Module {currentStep + 1} of {filteredSlides.length}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {currentSlide.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                  {currentSlide.subtitle}
                </p>
              </div>

              {/* Hinglish Explanation Box */}
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5">
                <span className="text-base shrink-0">💡</span>
                <div>
                  <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">Aasan Bhasha Me:</p>
                  <p className="text-xs text-amber-900/90 leading-relaxed font-medium mt-0.5">
                    {currentSlide.hindiDesc}
                  </p>
                </div>
              </div>

              {/* Step by Step Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  How It Works Step-by-Step:
                </h4>
                <div className="space-y-2.5">
                  {currentSlide.steps.map((st, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-indigo-200 transition"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <h5 className="text-xs sm:text-sm font-bold text-slate-900">{st.heading}</h5>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 pl-6 leading-relaxed">
                        {st.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Jump Action Button */}
              {currentSlide.linkUrl && (
                <div className="pt-2">
                  <button
                    onClick={() => navigateToPage(currentSlide.linkUrl)}
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition"
                  >
                    <span>{currentSlide.linkText}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Interactive Live Demonstration Simulation Card (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Interactive Live Simulation
                  </span>
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-mono">
                  Module #{currentStep + 1}
                </span>
              </div>

              {/* RENDER DYNAMIC INTERACTIVE PREVIEWS BASED ON SLIDE TYPE */}
              {currentSlide.interactiveType === 'overview_flow' && (
                <div className="space-y-3 py-2">
                  <p className="text-xs text-slate-400">Complete Enterprise Attendance Cycle:</p>
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">1. GPS Location Check</p>
                        <p className="text-[10px] text-slate-400">Validates if user is within office radius</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">2. Punch In / Out Timestamp</p>
                        <p className="text-[10px] text-slate-400">Computes exact shift hours & overtime</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">3. Minute-Rate Salary Engine</p>
                        <p className="text-[10px] text-slate-400">Auto-deducts late minutes & adds bonuses</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-200">4. Monthly Payslip PDF</p>
                        <p className="text-[10px] text-slate-400">Generates downloadable formal salary slip</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentSlide.interactiveType === 'boundary_demo' && (
                <div className="space-y-4 py-2">
                  <div className="relative h-44 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden">
                    {/* Simulated Radar Circles */}
                    <div className="absolute w-36 h-36 rounded-full border border-indigo-500/20 animate-ping" />
                    <div className="absolute w-28 h-28 rounded-full border-2 border-dashed border-indigo-500/40 bg-indigo-500/10 flex items-center justify-center">
                      <span className="text-[9px] text-indigo-400 font-bold bg-slate-900/90 px-1.5 py-0.5 rounded border border-indigo-500/30">
                        Allowed Radius: 500m
                      </span>
                    </div>

                    {/* Office Center Marker */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="p-2 bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/50">
                        <Building2 className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-200 mt-1">Office HQ</span>
                    </div>

                    {/* User Position Marker */}
                    <div
                      className={`absolute z-10 flex items-center gap-1 bg-slate-900/90 px-2 py-1 rounded-lg border text-[10px] font-bold transition-all duration-300 ${
                        demoDistance <= 500
                          ? 'right-6 bottom-6 border-emerald-500 text-emerald-400'
                          : 'right-2 top-2 border-rose-500 text-rose-400'
                      }`}
                    >
                      <Navigation className="w-3 h-3 animate-pulse" />
                      <span>{demoDistance}m Away</span>
                    </div>
                  </div>

                  {/* Interactive Distance Toggle */}
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-medium">Test Distance from Office:</span>
                      <span className="font-bold text-indigo-400">{demoDistance} meters</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setDemoDistance(45)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                          demoDistance === 45
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'bg-slate-700/60 border-slate-600 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        Inside (45m) ✅
                      </button>
                      <button
                        onClick={() => setDemoDistance(720)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                          demoDistance === 720
                            ? 'bg-rose-600 border-rose-500 text-white'
                            : 'bg-slate-700/60 border-slate-600 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        Outside (720m) ❌
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 text-center">
                      {demoDistance <= 500
                        ? '🟢 User is inside boundary. Punch In is ALLOWED.'
                        : '🔴 User is outside 500m perimeter. Punch In is BLOCKED.'}
                    </p>
                  </div>
                </div>
              )}

              {currentSlide.interactiveType === 'punch_demo' && (
                <div className="space-y-4 py-2">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Live Status:</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          demoPunchState === 'punched_in'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {demoPunchState === 'punched_in' ? '🟢 CLOCKED IN' : '⚪ CLOCKED OUT'}
                      </span>
                    </div>

                    {/* Interactive Punch Button */}
                    <button
                      onClick={() =>
                        setDemoPunchState(demoPunchState === 'idle' ? 'punched_in' : 'idle')
                      }
                      className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-95 ${
                        demoPunchState === 'idle'
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                          : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>{demoPunchState === 'idle' ? 'Punch In Now' : 'Punch Out Now'}</span>
                    </button>

                    <p className="text-[10px] text-slate-400 text-center">
                      (Click the button above to simulate interactive punch action)
                    </p>
                  </div>

                  {demoPunchState === 'punched_in' && (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs space-y-1 animate-in fade-in">
                      <div className="flex justify-between font-bold text-emerald-300">
                        <span>Punch In Time:</span>
                        <span>10:00 AM (Target: 19:00 - 9 Hrs)</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-emerald-400/80">
                        <span>GPS Coordinates:</span>
                        <span>28.6139° N, 77.2090° E</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-emerald-400/80">
                        <span>Distance From Office:</span>
                        <span>38 meters (Inside Boundary ✅)</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentSlide.interactiveType === 'leave_demo' && (
                <div className="space-y-3 py-2">
                  <p className="text-xs text-slate-400">Official Holidays & Leave Types:</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-center">
                      <p className="text-[10px] text-indigo-400 font-bold uppercase">Sundays</p>
                      <p className="text-sm font-black text-white">Official Off</p>
                      <p className="text-[9px] text-emerald-400 font-medium">Work = Bonus</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-center">
                      <p className="text-[10px] text-amber-400 font-bold uppercase">Casual/Medical</p>
                      <p className="text-sm font-black text-white">On Request</p>
                      <p className="text-[9px] text-slate-400">Admin Approved</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-center">
                      <p className="text-[10px] text-emerald-400 font-bold uppercase">National</p>
                      <p className="text-sm font-black text-white">Paid Holiday</p>
                      <p className="text-[9px] text-slate-400">Gazetted Days</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-200">Recent Request:</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                        APPROVED ✅
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Date: 18 Aug - 20 Aug (Casual Leave)</p>
                    <p className="text-[10px] text-slate-400 italic">"Attending family medical appointment"</p>
                  </div>
                </div>
              )}

              {currentSlide.interactiveType === 'salary_demo' && (
                <div className="space-y-3 py-2">
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <div>
                        <p className="text-xs font-bold text-slate-200">Rahul Sharma</p>
                        <p className="text-[10px] text-slate-500">Software Engineer</p>
                      </div>
                      <span className="text-xs font-black text-indigo-400">₹65,000 / mo</span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Base Rate (30 Days):</span>
                        <span className="font-mono">₹2,166.67 / day</span>
                      </div>
                      <div className="flex justify-between text-emerald-400">
                        <span>Overtime Bonus (1.5x):</span>
                        <span className="font-mono font-bold">+₹1,450.00</span>
                      </div>
                      <div className="flex justify-between text-emerald-400">
                        <span>Sunday Work Bonus:</span>
                        <span className="font-mono font-bold">+₹2,200.00</span>
                      </div>
                      <div className="flex justify-between text-amber-400">
                        <span>Advance Loan Deduction:</span>
                        <span className="font-mono font-bold">-₹5,000.00</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400">Net Payable:</span>
                      <span className="text-sm font-black text-emerald-400">₹63,650.00</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-xs text-indigo-300">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="font-semibold">Formal Salary Slip PDF</span>
                    </div>
                    <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded font-bold">Ready</span>
                  </div>
                </div>
              )}

              {currentSlide.interactiveType === 'finance_demo' && (
                <div className="space-y-3 py-2">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <p className="text-xs font-bold text-slate-200">Sample Advance Claim:</p>
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Requested Amount:</span>
                      <span className="font-bold text-indigo-400">₹15,000</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Repayment Period:</span>
                      <span className="font-bold text-slate-400">3 Months (₹5k/mo)</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Approval Status:</span>
                      <span className="text-emerald-400 font-bold">Approved & Disbursed</span>
                    </div>
                  </div>
                </div>
              )}

              {currentSlide.interactiveType === 'admin_demo' && (
                <div className="space-y-3 py-2">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <p className="font-bold text-slate-200">Admin Control Summary:</p>
                    <div className="space-y-1.5 text-slate-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Instant Registration Approval</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Interactive GPS Coordinates Setter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>One-Click Payroll Batch Generation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Security & Tamper Audit Log</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Footer Navigation Bar */}
        <div className="px-5 py-4 sm:px-8 sm:py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                currentStep === 0
                  ? 'bg-slate-200/50 text-slate-400 cursor-not-allowed'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
              Slide {currentStep + 1} of {filteredSlides.length}
            </span>
          </div>

          {/* Stepper Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {filteredSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? 'w-6 bg-indigo-600'
                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <div>
            {currentStep < filteredSlides.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition"
              >
                <span>Next Module</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Got It, Let&apos;s Start!</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
