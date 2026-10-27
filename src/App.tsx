import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, Users, BarChart3, Bot, PhoneCall, ShieldAlert, 
  MapPin, CheckCircle2, ChevronRight, HelpCircle, AlertCircle, ArrowLeft, ArrowRight, Home, Baby, Sparkles
} from "lucide-react";
import TBAPortal from "./components/TBAPortal";
import HospitalDashboard from "./components/HospitalDashboard";
import AnalyticsView from "./components/AnalyticsView";
import MaternalAssistant from "./components/MaternalAssistant";
import MotherPortal from "./components/MotherPortal";
import { Case } from "./types";
import MOMSAFELogo from "./components/MOMSAFELogo";
import AuthOnboarding from "./components/AuthOnboarding";
import { User as UserIcon } from "lucide-react";
import { getLocalStoredCases, fetchAllCases, saveLocalStoredCases } from "./data/caseService";

export default function App() {
  const [activePersona, setActivePersona] = useState<"auth" | "landing" | "mother" | "tba" | "gmc" | "analytics" | "assistant">("auth");
  const [previousPersona, setPreviousPersona] = useState<"auth" | "landing" | "mother" | "tba" | "gmc" | "analytics">("landing");
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; community?: string } | null>(null);
  const [cases, setCases] = useState<Case[]>(getLocalStoredCases);
  const [loading, setLoading] = useState(false);
  
  // Active context case for the AI Assistant Chat
  const [assistantContextCase, setAssistantContextCase] = useState<Case | null>(null);
  
  // Fetch Cases from local express backend API with seamless offline fallback
  const fetchCases = async () => {
    try {
      const data = await fetchAllCases();
      if (data && data.length > 0) {
        setCases(data);
      }
    } catch (err) {
      // Fallback is handled inside fetchAllCases
    }
  };

  useEffect(() => {
    fetchCases();
    // Poll cases every 5 seconds to simulate synced arrivals across portals
    const timer = setInterval(fetchCases, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleCaseSubmitted = (newCase: Case) => {
    // Optimistic state update
    setCases((prev) => {
      const next = [newCase, ...prev.filter(c => c.id !== newCase.id)];
      saveLocalStoredCases(next);
      return next;
    });
    // Set as active AI context case
    setAssistantContextCase(newCase);
  };

  const handleCaseUpdated = (updatedCase: Case) => {
    setCases((prev) => {
      const next = prev.map((c) => (c.id === updatedCase.id ? updatedCase : c));
      saveLocalStoredCases(next);
      return next;
    });
    if (assistantContextCase && assistantContextCase.id === updatedCase.id) {
      setAssistantContextCase(updatedCase);
    }
  };

  const handleOpenAssistant = (activeCase: Case | null) => {
    setAssistantContextCase(activeCase);
    if (activePersona !== "assistant") {
      setPreviousPersona(activePersona as any);
    }
    setActivePersona("assistant");
  };

  const handleToggleAssistant = () => {
    if (activePersona === "assistant") {
      setActivePersona(previousPersona);
    } else {
      setPreviousPersona(activePersona as any);
      setActivePersona("assistant");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Professional Brand Header Bar */}
      <header className="bg-[#32134F] text-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-purple-950/40 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <MOMSAFELogo size={40} withBackground={true} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-wide">MOMSAFE CONNECT</h1>
              <span className="bg-teal-600 text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                GMC Enugu
              </span>
            </div>
            <p className="text-[10px] text-purple-200">AI-Powered Maternal Early-Warning & Referral Platform</p>
          </div>
        </div>

        {/* Persona Portal Switcher & Control (Simple, highly navigable UI) */}
        {activePersona !== "auth" && (
          <div className="flex flex-wrap items-center gap-4">
            <nav className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-semibold gap-1">
              <button
                onClick={() => setActivePersona("landing")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activePersona === "landing" 
                    ? "bg-white text-[#32134F] shadow-sm" 
                    : "text-purple-100 hover:text-white hover:bg-white/5"
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Portal Selection</span>
                <span className="inline sm:hidden">Home</span>
              </button>

              <button
                onClick={() => setActivePersona("mother")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activePersona === "mother" 
                    ? "bg-white text-[#32134F] shadow-sm" 
                    : "text-purple-100 hover:text-white hover:bg-white/5"
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
                <span>Mother's Portal (MamaAlert)</span>
              </button>

              <button
                onClick={() => setActivePersona("tba")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activePersona === "tba" 
                    ? "bg-white text-[#32134F] shadow-sm" 
                    : "text-purple-100 hover:text-white hover:bg-white/5"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>TBA Mobile App</span>
              </button>

              <button
                onClick={() => setActivePersona("gmc")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activePersona === "gmc" 
                    ? "bg-white text-[#32134F] shadow-sm" 
                    : "text-purple-100 hover:text-white hover:bg-white/5"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>GMC Hospital Board</span>
              </button>

              <button
                onClick={() => setActivePersona("analytics")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activePersona === "analytics" 
                    ? "bg-white text-[#32134F] shadow-sm" 
                    : "text-purple-100 hover:text-white hover:bg-white/5"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>System Reports</span>
              </button>
            </nav>

            {/* Active User Banner with Sign Out */}
            {currentUser && (
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                <UserIcon className="w-3.5 h-3.5 text-purple-200" />
                <span className="text-[11px] font-semibold text-purple-100">
                  {currentUser.name} ({currentUser.role === "admin" ? "GMC Admin" : currentUser.role === "patient" ? "Mother" : "TBA"})
                </span>
                <button
                  onClick={() => {
                    setCurrentUser(null);
                    setActivePersona("auth");
                  }}
                  className="text-[10px] font-bold text-pink-300 hover:text-white hover:underline ml-1.5 transition-all cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            )}

            {/* AI Assistant Quick Toggle */}
            <button
              onClick={handleToggleAssistant}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                activePersona === "assistant" 
                  ? "bg-teal-500 text-white" 
                  : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Ask MOMSAFE Guide</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Core Layout Grid */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Selected Portal Interface */}
        <div className="flex-1 overflow-y-auto p-6 max-w-full transition-all duration-300">
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-3">
                <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-500 font-medium">Synchronizing clinical registry board...</p>
              </div>
            ) : activePersona === "auth" ? (
              <motion.div
                key="auth"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full flex justify-center py-4"
              >
                <AuthOnboarding 
                  onAuthSuccess={(user) => {
                    setCurrentUser(user);
                    if (user.role === "admin") {
                      setActivePersona("gmc");
                    } else if (user.role === "patient") {
                      setActivePersona("mother");
                    } else {
                      setActivePersona("tba");
                    }
                  }}
                  onSkip={() => {
                    setCurrentUser({ name: "Demo Guest", role: "tba" });
                    setActivePersona("landing");
                  }}
                />
              </motion.div>
            ) : activePersona === "landing" ? (
              <motion.div
                key="landing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-5xl mx-auto space-y-8 py-4"
              >
                {/* Back to Sign In / Logout Button */}
                <div className="flex justify-start">
                  <button
                    onClick={() => {
                      setCurrentUser(null);
                      setActivePersona("auth");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-[#32134F] px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In / Register</span>
                  </button>
                </div>

                {/* Hero Greeting Section */}
                <div className="text-center max-w-2xl mx-auto space-y-3.5">
                  <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 text-[#32134F] text-xs font-bold px-3 py-1.5 rounded-full">
                    <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                    <span>MOMSAFE CONNECT • ENUGU STATE REGISTRY</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">
                    Maternal Early-Warning, Care & Referral Portal
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Bridging expectant mothers, traditional birth attendants (TBAs), and Googwill Medical Centre Enugu East to eliminate preventable obstetric complications through AI-grounded referrals and direct clinical lifelines.
                  </p>
                </div>

                {/* Portal Cards Selection Grid (4 Cards: Mother Portal, TBA App, GMC Board, Reports) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Card 1: Mother's Portal (MamaAlert App) */}
                  <div className="bg-gradient-to-b from-white to-pink-50/30 border border-pink-200/80 rounded-3xl p-5 shadow-xs hover:shadow-md hover:border-pink-400 transition-all flex flex-col justify-between group relative overflow-hidden">
                    <div className="absolute top-2 right-2 bg-pink-100 text-pink-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                      MamaAlert
                    </div>
                    <div className="space-y-3 pt-1">
                      <div className="w-11 h-11 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-all">
                        <Heart className="w-5 h-5 fill-current" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-800 group-hover:text-pink-600 transition-colors">Mother's Portal</h3>
                        <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                          Menstrual, Pregnancy & Postpartum modes, 1-tap SOS, kick counter, contraction timer, multilingual voice advice & Mama circles.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActivePersona("mother")}
                      className="mt-5 w-full py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <span>Open MamaAlert</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card 2: TBA Portal */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between group">
                    <div className="space-y-3 pt-1">
                      <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-brand-purple group-hover:bg-brand-purple group-hover:text-white transition-all">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-800 group-hover:text-brand-purple transition-colors">TBA Mobile App</h3>
                        <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                          Enter physical vitals, check warning signs, generate automated safety scorings, and submit synced obstetric referrals instantly.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActivePersona("tba")}
                      className="mt-5 w-full py-2 bg-brand-purple hover:bg-dark-purple text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <span>Enter TBA App</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card 3: Hospital Command Board */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between group">
                    <div className="space-y-3 pt-1">
                      <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-brand-purple group-hover:bg-brand-purple group-hover:text-white transition-all">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-800 group-hover:text-brand-purple transition-colors">GMC Hospital Board</h3>
                        <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                          Live referral queue with triage risk-level scoring (MEOWS-based), clinician check-offs, overrides, and readiness times.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActivePersona("gmc")}
                      className="mt-5 w-full py-2 bg-brand-purple hover:bg-dark-purple text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <span>Command Board</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card 4: Performance Analytics */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between group">
                    <div className="space-y-3 pt-1">
                      <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-brand-purple group-hover:bg-brand-purple group-hover:text-white transition-all">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-800 group-hover:text-brand-purple transition-colors">System Reports</h3>
                        <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                          Audit TBA activities, track community risk scores, monitor hospital response times, and analyze clinical outcome analytics.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActivePersona("analytics")}
                      className="mt-5 w-full py-2 bg-brand-purple hover:bg-dark-purple text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <span>View Reports</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Info Disclaimer Strip */}
                <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-normal">
                    <strong>Administrative Notice:</strong> This unified board acts as a coordination system between traditional care providers and Googwill Medical Centre clinicians in Umuchigbo, Enugu. Always prioritize active voice-contact and physical ambulance dispatches in cases marked with immediate <strong className="text-red-700 font-bold">RED RISK</strong> warnings.
                  </p>
                </div>
              </motion.div>
            ) : activePersona === "mother" ? (
              <motion.div
                key="mother"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-800">Mother's Portal • MamaAlert Companion</h2>
                      <span className="bg-pink-100 text-pink-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">MamaAlert Edition</span>
                    </div>
                    <p className="text-xs text-slate-500">Maternal health tracking, 1-tap emergency SOS, contraction timers, kick counts & clinical lifelines.</p>
                  </div>
                  <button
                    onClick={() => setActivePersona("landing")}
                    className="self-start sm:self-center flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Home</span>
                  </button>
                </div>
                <MotherPortal 
                  onCaseSubmitted={handleCaseSubmitted} 
                  onOpenAssistant={handleOpenAssistant} 
                  currentUser={currentUser}
                />
              </motion.div>
            ) : activePersona === "tba" ? (
              <motion.div
                key="tba"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl mx-auto"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">TBA Portal</h2>
                    <p className="text-xs text-slate-500">Record pregnant mother's vitals, check emergency danger signs, and obtain clinical safety scoring.</p>
                  </div>
                  <button
                    onClick={() => setActivePersona("landing")}
                    className="self-start sm:self-center flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Home</span>
                  </button>
                </div>
                <TBAPortal 
                  onCaseSubmitted={handleCaseSubmitted} 
                  onOpenAssistant={handleOpenAssistant} 
                  currentUser={currentUser}
                />
              </motion.div>
            ) : activePersona === "gmc" ? (
              <motion.div
                key="gmc"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="h-full"
              >
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Hospital Command Board</h2>
                    <p className="text-xs text-slate-500">Monitor community referrals in real time, check clinical overrides, and track readiness timelines.</p>
                  </div>
                  <button
                    onClick={() => setActivePersona("landing")}
                    className="self-start sm:self-center flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-colors shadow-xs cursor-pointer font-sans"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Home</span>
                  </button>
                </div>
                <HospitalDashboard 
                  cases={cases} 
                  onCaseUpdated={handleCaseUpdated} 
                  onOpenAssistant={handleOpenAssistant} 
                />
              </motion.div>
            ) : activePersona === "analytics" ? (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Platform Performance Reports</h2>
                    <p className="text-xs text-slate-500">Clinical safety, TBA activity audits, and community settlement coverage metrics.</p>
                  </div>
                  <button
                    onClick={() => setActivePersona("landing")}
                    className="self-start sm:self-center flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Home</span>
                  </button>
                </div>
                <AnalyticsView cases={cases} />
              </motion.div>
            ) : (
              /* Dedicated full-page Bounded Clinical Assistant Window (MOMSAFE Guide) */
              <motion.div
                key="assistant"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-brand-purple shadow-xs">
                      <Bot className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-800">Ask MOMSAFE Guide</h2>
                      <p className="text-xs text-slate-500 font-medium">WHO-grounded Bounded Maternal Clinical AI Advisor & Local Care Coordinator.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActivePersona(previousPersona)}
                    className="self-start sm:self-center flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Previous Page</span>
                  </button>
                </div>

                {/* Bounded AI Chat Component - Dedicated Window */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <MaternalAssistant activeCase={assistantContextCase} />
                </div>

                {/* Enugu direct contact card bottom */}
                <div className="bg-[#32134F] text-white p-5 rounded-3xl space-y-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-pink-400" />
                      <span className="text-xs font-bold uppercase tracking-wider">Googwill Maternal Emergency Support</span>
                    </div>
                    <p className="text-[11px] text-purple-200 leading-normal max-w-xl">
                      Call Googwill Medical Centre (GMC) directly on Enugu State's maternal support toll-free coordinates if you require direct clinician consultations or voice coordination.
                    </p>
                  </div>
                  <a 
                    href="tel:08000057777"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Simulating emergency clinician call... Call connected successfully!");
                    }}
                    className="shrink-0 text-center px-6 py-2.5 bg-teal-accent hover:bg-teal-800 transition-colors text-white font-bold rounded-xl text-xs shadow-sm"
                  >
                    Call: 08000057777
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      {/* Global emergency floating alert coordinates footer */}
      <footer className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-medium shrink-0">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>Prepared for: <strong>Googwill Medical Centre, Umuchigbo, Enugu East LGA, Enugu State, Nigeria</strong></span>
        </div>
        
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <span>Toll-free emergency maternal referral coordinates: <strong className="text-[#5B2C83]">08000057777</strong></span>
          <span className="opacity-40">|</span>
          <span>Version 1.0 (GMC-CLIN)</span>
        </div>
      </footer>

    </div>
  );
}
