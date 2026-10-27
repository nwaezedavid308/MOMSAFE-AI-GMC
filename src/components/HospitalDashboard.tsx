import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  AlertTriangle, CheckCircle2, ShieldAlert, Clock, Phone, User, MapPin, 
  CheckSquare, Activity, ClipboardList, Send, Edit, ShieldCheck, Heart,
  Baby, Check, ChevronDown, Filter, Info, Bell, MessageSquare, AlertCircle, Bot,
  ArrowLeft
} from "lucide-react";
import { Case, CaseChecklist, CaseNote } from "../types";
import { IgboInfoButton } from "./LocalLanguageHelper";

interface HospitalDashboardProps {
  cases: Case[];
  onCaseUpdated: (updatedCase: Case) => void;
  onOpenAssistant: (activeCase: Case | null) => void;
}

export default function HospitalDashboard({ cases, onCaseUpdated, onOpenAssistant }: HospitalDashboardProps) {
  // Active selected case
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  
  useEffect(() => {
    setShowOverrideForm(false);
    setShowOutcomeForm(false);
    setNoteText("");
    if (selectedCaseId) document.getElementById("hospital-case-detail")?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [selectedCaseId]);

  // Filters State
  const [queueView, setQueueView] = useState<"active" | "completed">("active");
  const [filterRisk, setFilterRisk] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterCommunity, setFilterCommunity] = useState<string>("ALL");

  // Local interaction states (override & outcomes)
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [overrideForm, setOverrideForm] = useState({
    tier: "" as "GREEN" | "AMBER" | "RED" | "",
    reason: "",
    clinician: "Dr. Chinedu Okafor",
  });

  const [showOutcomeForm, setShowOutcomeForm] = useState(false);
  const [outcomeForm, setOutcomeForm] = useState({
    arrivalTime: new Date().toISOString().substring(0, 16),
    treatmentDisposition: "Admitted to Ward",
    maternalOutcome: "Healthy / Stable",
    newbornOutcome: "Healthy Birth",
  });

  const [noteText, setNoteText] = useState("");
  const [noteAuthor, setNoteAuthor] = useState("Nurse Agnes");

  // Audio Alert Simulation toggle
  const [playAlert, setPlayAlert] = useState(false);

  // Auto detect new incoming RED cases to trigger clinical alerts (FR-DASH-002)
  useEffect(() => {
    const hasUnacknowledgedRed = cases.some(
      c => c.riskCategory === "RED" && c.status === "New"
    );
    if (hasUnacknowledgedRed) {
      setPlayAlert(true);
    } else {
      setPlayAlert(false);
    }
  }, [cases]);

  // Handle case selection
  const selectedCase = cases.find(c => c.id === selectedCaseId) || null;

  const symptomFindings = selectedCase ? [
                    { flag: selectedCase.severePain, label: "Severe Pain" },
                    { flag: selectedCase.severeHeadache, label: "Severe Headache" },
                    { flag: selectedCase.visualDisturbance, label: "Vision Disturbances" },
                    { flag: selectedCase.swellingFeet, label: "Facial/Feet Swelling" },
                    { flag: selectedCase.highFever, label: "High Fever" },
                    { flag: selectedCase.convulsions, label: "Convulsions / Fits" },
                    { flag: selectedCase.breathingDifficulty, label: "Breathing Difficulty" },
                    { flag: selectedCase.lossOfConsciousness, label: "Loss of Consciousness" },
                    { flag: selectedCase.reducedFetalMovement, label: "Reduced Fetal Movement" },
                    { flag: selectedCase.laborProgressConcerns, label: "Labor Progress Concerns" },
                  ] : [];

  // Sync checklist changes with the server (FR-DASH-006)
  const handleToggleChecklist = async (caseId: string, checklistId: string, checked: boolean) => {
    try {
      const res = await fetch(`/api/cases/${caseId}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checklistId,
          checked,
          clinician: "Triage Team"
        })
      });
      if (res.ok) {
        const updated = await res.json();
        onCaseUpdated(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit triage note (FR-DASH-005)
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !selectedCaseId) return;

    try {
      const res = await fetch(`/api/cases/${selectedCaseId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: noteText,
          author: noteAuthor,
        })
      });
      if (res.ok) {
        const updated = await res.json();
        onCaseUpdated(updated);
        setNoteText("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Case Status (10.3)
  const handleStatusChange = async (newStatus: any) => {
    if (!selectedCaseId) return;
    try {
      const res = await fetch(`/api/cases/${selectedCaseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          overrideClinician: noteAuthor
        })
      });
      if (res.ok) {
        const updated = await res.json();
        onCaseUpdated(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Override Form (FR-DASH-007)
  const handleSaveOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId || !overrideForm.tier || !overrideForm.reason) {
      alert("Please fill in both clinical override tier and reason.");
      return;
    }

    try {
      const res = await fetch(`/api/cases/${selectedCaseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          triageCategory: overrideForm.tier,
          overrideReason: overrideForm.reason,
          overrideClinician: overrideForm.clinician,
        })
      });
      if (res.ok) {
        const updated = await res.json();
        onCaseUpdated(updated);
        setShowOverrideForm(false);
        setOverrideForm({ tier: "", reason: "", clinician: "Dr. Chinedu Okafor" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Close outcome parameters (10.3)
  const handleSaveOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId) return;

    try {
      const res = await fetch(`/api/cases/${selectedCaseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Closed",
          arrivalOutcome: outcomeForm,
          overrideClinician: noteAuthor
        })
      });
      if (res.ok) {
        const updated = await res.json();
        onCaseUpdated(updated);
        setShowOutcomeForm(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate elapsed time from creation for red alerts
  const getElapsedTime = (isoString: string) => {
    const start = new Date(isoString).getTime();
    const diffMs = Date.now() - start;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const hrs = Math.floor(diffMins / 60);
    return `${hrs}h ago`;
  };

  // Filter computation
  const filteredCases = cases.filter(c => {
    if (queueView === "active" ? c.status === "Closed" : c.status !== "Closed") return false;
    if (filterRisk !== "ALL" && c.riskCategory !== filterRisk) return false;
    if (filterStatus !== "ALL" && c.status !== filterStatus) return false;
    if (filterCommunity !== "ALL" && c.community !== filterCommunity) return false;
    return true;
  });

  // Extract communities for drop-down filter
  const communities = Array.from(new Set(cases.map(c => c.community)));

  return (
    <div className="hospital-workspace">
      
      {/* Alert Sirens banner for unacknowledged RED cases */}
      {playAlert && (
        <div className="hospital-urgent-alert" role="alert">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-white shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider">Urgent referral needs review</p>
              <p className="text-[11px] opacity-90 font-medium">Open the referral and prepare care.</p>
            </div>
          </div>
          <button
            onClick={() => {
              // Acknowledge the newest New-RED case (simulated)
              const firstNewRed = cases.find(c => c.riskCategory === "RED" && c.status === "New");
              if (firstNewRed) {
                setSelectedCaseId(firstNewRed.id);
                // Simple acknowledgement call
                fetch(`/api/cases/${firstNewRed.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: "Acknowledged", overrideClinician: "Triage Desk" })
                })
                  .then(res => res.json())
                  .then(updated => onCaseUpdated(updated));
              } else {
                setPlayAlert(false);
              }
            }}
            className="px-4 py-1.5 bg-white text-red-700 hover:bg-red-50 rounded-lg text-xs font-bold transition-all shrink-0 shadow-sm"
          >
            Review urgent referral
          </button>
        </div>
      )}

      {/* Grid view containing Queue and Detail inspect panels */}
      <div className="hospital-layout">
        
        {/* LEFT COLUMN: LIVE REFERRAL QUEUE */}
        <div className={`hospital-queue ${selectedCaseId ? "hidden" : ""}`}>
          
          <div className="patient-tabs hospital-tabs" aria-label="Referral lists">
            <button type="button" aria-pressed={queueView === "active"} className={queueView === "active" ? "selected" : ""} onClick={() => { setQueueView("active"); setFilterStatus("ALL"); }}><ClipboardList size={19}/>Active referrals <span>{cases.filter(c => c.status !== "Closed").length}</span></button>
            <button type="button" aria-pressed={queueView === "completed"} className={queueView === "completed" ? "selected" : ""} onClick={() => { setQueueView("completed"); setFilterStatus("ALL"); }}><CheckCircle2 size={19}/>Completed <span>{cases.filter(c => c.status === "Closed").length}</span></button>
          </div>
          {/* Header & Filter Controls */}
          <div className="hospital-queue-heading">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wide">{queueView === "active" ? "Mothers needing care" : "Completed referrals"}</h3>
                <p className="text-[11px] text-slate-500">Select a mother to review her referral.</p>
              </div>
              <span className="text-[11px] font-semibold bg-brand-purple/10 text-brand-purple px-2.5 py-1 rounded-full">
                {filteredCases.length} referrals
              </span>
            </div>

            {/* Filter controls row */}
            <details className="mvp-disclosure filter-menu"><summary><span><Filter size={17}/>Filter referrals{(filterRisk !== "ALL" || filterStatus !== "ALL" || filterCommunity !== "ALL") && <span className="filter-active">Active</span>}</span><ChevronDown size={17}/></summary><div className="mvp-filter-fields">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Risk Tier</label>
                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg py-1 px-1.5 text-[10px] outline-none text-slate-700"
                >
                  <option value="ALL">All Risk</option>
                  <option value="RED">RED Alerts</option>
                  <option value="AMBER">AMBER Risks</option>
                  <option value="GREEN">GREEN Normals</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg py-1 px-1.5 text-[10px] outline-none text-slate-700"
                >
                  <option value="ALL">All Status</option>
                  <option value="New">New</option>
                  <option value="Acknowledged">Acknowledged</option>
                  <option value="Preparing">Preparing</option>
                  <option value="In transit">In Transit</option>
                  <option value="Arrived">Arrived</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Settlement</label>
                <select
                  value={filterCommunity}
                  onChange={(e) => setFilterCommunity(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg py-1 px-1.5 text-[10px] outline-none text-slate-700"
                >
                  <option value="ALL">All Settlements</option>
                  {communities.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div></details>
          </div>

          {/* Scrolling queue list (RED always sorting above Amber, then Green) */}
          <div className="hospital-referral-list">
            {filteredCases
              .sort((a, b) => {
                // RED first, then AMBER, then others
                const rank = { RED: 3, AMBER: 2, GREEN: 1, GREY: 0 };
                const rankA = rank[a.riskCategory] || 0;
                const rankB = rank[b.riskCategory] || 0;
                if (rankA !== rankB) return rankB - rankA;
                // Otherwise newest first
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              })
              .map((c) => {
                const isSelected = c.id === selectedCaseId;
                const isRedNew = c.riskCategory === "RED" && c.status === "New";
                
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCaseId(c.id);
                      // Auto acknowledge if it is a new red alert (FR-DASH-002)
                      if (c.status === "New") {
                        fetch(`/api/cases/${c.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: "Acknowledged", overrideClinician: "Triage Desk" })
                        })
                          .then(res => res.json())
                          .then(updated => onCaseUpdated(updated));
                      }
                    }}
                    className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex flex-col gap-2 relative ${
                      isSelected ? "bg-purple-50/40 border-l-4 border-brand-purple" : ""
                    } ${isRedNew ? "bg-red-50/20 animate-flash-red" : ""}`}
                  >
                    <div className="referral-card-heading">
                      <h4>{c.name}</h4>
                      <span className={"referral-risk risk-" + c.riskCategory.toLowerCase()}>{c.riskCategory} risk</span>
                    </div>
                    <p className="referral-card-description">{c.gestationalAge} · {c.community}</p>
                    {c.triageCategory && <p className="referral-reviewed"><ShieldCheck size={15}/>Clinician review: {c.triageCategory}</p>}
                    <div className="referral-card-bottom"><span>{c.status}</span><span><Clock size={14}/>{getElapsedTime(c.createdAt)}<span className="referral-open">View referral <ChevronDown size={16}/></span></span></div>
                  </button>
                );
              })}
            {filteredCases.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-xs">
                No referrals in this view. Try changing the filters.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: DETAIL CASE INSPECTION */}
        <div className={`hospital-case ${selectedCaseId ? "" : "hidden"}`}>
          {selectedCase ? (
            <div className="hospital-case-sections" id="hospital-case-detail" key={selectedCase.id}>
              {/* Close Detail / Back to referrals Button */}
              <div className="flex">
                <button
                  onClick={() => setSelectedCaseId(null)}
                  className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-slate-200 text-brand-purple hover:bg-slate-50 text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-brand-purple" />
                  <span>Back to referrals</span>
                </button>
              </div>
              {/* Header block */}
              <div className="hospital-case-summary">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono font-bold">
                      {selectedCase.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedCase.riskCategory === "RED"
                        ? "bg-red-100 text-red-800"
                        : selectedCase.riskCategory === "AMBER"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {selectedCase.riskCategory} Risk
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 mt-1.5">{selectedCase.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Age {selectedCase.age} • Parity {selectedCase.parity} • {selectedCase.gestationalAge}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Referral Status</span>
                  <select
                    aria-label="Referral status"
                    value={selectedCase.status}
                    onChange={(e) => {
                      if (e.target.value === "Closed") {
                        setShowOutcomeForm(true);
                      } else {
                        handleStatusChange(e.target.value);
                      }
                    }}
                    className="bg-brand-purple text-white px-2.5 py-1 text-xs font-semibold rounded-lg outline-none cursor-pointer hover:bg-dark-purple transition-all"
                  >
                    <option value="New">New</option>
                    <option value="Acknowledged">Acknowledged</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Preparing">Preparing</option>
                    <option value="In transit">In Transit</option>
                    <option value="Arrived">Arrived</option>
                    <option value="Closed">Closed / Archive</option>
                  </select>
                </div>
              </div>

<details className="mvp-disclosure"><summary>Mother & contact details<ChevronDown size={18}/></summary><div className="mvp-disclosure-body">              {/* Patient Basic Info Card */}
              <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-sm space-y-2">
                <h4 className="font-semibold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-brand-purple" />
                  <span>Demographic Profile</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">TBA Reporter</span>
                    <span className="font-medium text-slate-800">{selectedCase.tbaName}</span>
                    <a href={`tel:${selectedCase.tbaPhone}`} className="block text-brand-purple font-medium text-[10px] mt-0.5 hover:underline">
                      {selectedCase.tbaPhone}
                    </a>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Next of Kin</span>
                    <span className="font-medium text-slate-800">{selectedCase.nextOfKin}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Parity / Prior Births</span>
                      <IgboInfoButton termId="parity" className="py-0 px-1 border-0 bg-transparent text-[#32134F] hover:bg-purple-100 scale-75 origin-left" />
                    </div>
                    <span className="font-semibold text-slate-800 bg-purple-50 px-2 py-0.5 rounded text-[11px] border border-purple-100">
                      Parity {selectedCase.parity} • {selectedCase.gestationalAge}
                    </span>
                  </div>
                </div>
              </div>

</div></details>
              <h2 className="hospital-section-title">Health information</h2>
              {/* Vitals Signs inspect grid */}
              <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-sm">
                <h4 className="font-semibold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3.5 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-brand-purple" />
                  <span>Recorded vital signs</span>
                </h4>
                <div className="hospital-vitals-grid">
                  <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl flex flex-col justify-between h-full min-h-[70px]">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Blood pressure</span>
                      <IgboInfoButton termId="bp" className="px-1 py-0 border-0 bg-transparent text-[#32134F] hover:bg-purple-100/50 scale-75 origin-right" />
                    </div>
                    <span className="block font-mono font-bold text-xs text-slate-800">
                      {selectedCase.systolicBP}/{selectedCase.diastolicBP}
                    </span>
                    <span className="text-[8px] text-slate-400">mmHg</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl">
                    <span className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Pulse Rate</span>
                    <span className="block font-mono font-bold text-xs text-slate-800 mt-1">
                      {selectedCase.pulse}
                    </span>
                    <span className="text-[9px] text-slate-400">bpm</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl">
                    <span className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Body Temp</span>
                    <span className="block font-mono font-bold text-xs text-slate-800 mt-1">
                      {selectedCase.temperature}°C
                    </span>
                    <span className="text-[9px] text-slate-400">Celsius</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl">
                    <span className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Resp Rate</span>
                    <span className="block font-mono font-bold text-xs text-slate-800 mt-1">
                      {selectedCase.respRate}
                    </span>
                    <span className="text-[9px] text-slate-400">breaths/m</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-2 rounded-xl">
                    <span className="block text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Data quality</span>
                    <span className="block font-mono font-bold text-[9px] text-emerald-700 uppercase tracking-wide mt-1.5">
                      {selectedCase.dataQuality}
                    </span>
                  </div>
                </div>
              </div>

              {/* Symptoms checked list */}
              <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-sm">
                <h4 className="font-semibold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-brand-purple" />
                  <span>Reported warning signs</span>
                </h4>
                
                <div className="flex flex-wrap gap-1.5">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                    selectedCase.bleeding === "severe"
                      ? "bg-red-50 text-red-800 border-red-200"
                      : selectedCase.bleeding === "mild"
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-slate-50 text-slate-500 border-slate-100"
                  }`}>
                    Vaginal Bleeding: {selectedCase.bleeding.toUpperCase()}
                  </span>

                  {symptomFindings.filter(item => item.flag).map((item, i) => (
                    <span
                      key={i}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                        item.flag
                          ? "bg-red-50 text-red-800 border-red-200"
                          : "bg-slate-50 text-slate-400 border-slate-100 line-through"
                      }`}
                    >
                      {item.label}
                    </span>
                  ))}
                </div>

                {symptomFindings.some(item => !item.flag) && <details className="mvp-inline-details"><summary>Other symptoms checked</summary><ul className="hospital-negative-symptoms">{symptomFindings.filter(item => !item.flag).map(item => <li key={item.label}>{item.label}: not reported</li>)}</ul></details>}

                {selectedCase.customNote && (
                  <div className="mt-3.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">TBA Notes</span>
                    <p className="text-xs text-slate-700 italic leading-normal">"{selectedCase.customNote}"</p>
                  </div>
                )}
              </div>

<details className="mvp-disclosure"><summary>How the risk was calculated<ChevronDown size={18}/></summary><div className="mvp-disclosure-body">              {/* AI scoring explanation logic */}
              <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-2xl">
                <h4 className="font-semibold text-xs text-brand-purple uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Bot className="w-4 h-4" />
                  <span>Clinical AI Decision Explanation</span>
                </h4>
                <p className="text-xs text-slate-700 leading-normal mb-2">
                  <strong>Risk Score:</strong> {selectedCase.riskScore}/100 • <strong>Rules Engine:</strong> {selectedCase.rulesVersion}
                </p>
                <div className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-purple-100 leading-relaxed font-medium">
                  {selectedCase.reasonText}
                </div>
              </div>

</div></details>
<details className="mvp-disclosure"><summary>Clinician risk review<ChevronDown size={18}/></summary><div className="mvp-disclosure-body">              {/* Clinical Override Panel (FR-DASH-007) */}
              <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <h4 className="font-semibold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-brand-purple" />
                    <span>Maternal Clinical Override Review</span>
                  </h4>
                  {!showOverrideForm && (
                    <button
                      onClick={() => setShowOverrideForm(true)}
                      className="text-[10px] text-brand-purple hover:underline font-bold flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Perform Clinical Override</span>
                    </button>
                  )}
                </div>

                {/* Overriden Display audit trail */}
                {selectedCase.triageCategory ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-900 rounded-xl space-y-1.5 mb-3">
                    <p className="text-xs font-semibold">
                      Clinical Tier Override active: <strong>{selectedCase.triageCategory}</strong>
                    </p>
                    <p className="text-[10px] leading-normal opacity-90">
                      <strong>Reason:</strong> "{selectedCase.overrideReason}"
                    </p>
                    <p className="text-[9px] opacity-75">
                      Reviewed by: {selectedCase.overrideClinician} on {new Date(selectedCase.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">No clinician override active. Case complies with automated clinical safety rules.</p>
                )}

                {showOverrideForm && (
                  <form onSubmit={handleSaveOverride} className="bg-slate-50 p-3.5 border border-slate-100 rounded-xl space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Override Urgency Tier</label>
                      <div className="grid grid-cols-3 gap-2">
                        {["GREEN", "AMBER", "RED"].map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setOverrideForm({ ...overrideForm, tier: t as any })}
                            className={`py-1.5 text-xs font-bold rounded-lg border text-center transition-all ${
                              overrideForm.tier === t
                                ? "bg-brand-purple text-white border-brand-purple"
                                : "bg-white text-slate-600 border-slate-200"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Clinical Override Justification</label>
                      <textarea
                        required
                        placeholder="Enter precise clinical reason for overriding the AI classification (e.g., patient displays signs of high-risk labor despite stable vitals)."
                        value={overrideForm.reason}
                        onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                        rows={2}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple text-slate-800"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Reviewing Clinician Name</label>
                        <input
                          type="text"
                          required
                          value={overrideForm.clinician}
                          onChange={(e) => setOverrideForm({ ...overrideForm, clinician: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none"
                        />
                      </div>
                      
                      <div className="flex items-end gap-1.5">
                        <button
                          type="submit"
                          className="flex-1 py-1.5 bg-brand-purple hover:bg-dark-purple text-white text-xs font-bold rounded-lg"
                        >
                          Save Override
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowOverrideForm(false)}
                          className="py-1.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>

</div></details>
              <h2 className="hospital-section-title">Prepare care</h2>
              {/* GMC Preparation Checklist Action panel (FR-DASH-006) */}
              <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-sm space-y-3">
                <h4 className="font-semibold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-brand-purple" />
                  <span>Care preparation checklist</span>
                </h4>
                
                <div className="space-y-2">
                  {selectedCase.checklist.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-2.5 p-2 hover:bg-slate-50/50 rounded-lg cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={(e) => handleToggleChecklist(selectedCase.id, item.id, e.target.checked)}
                        className="rounded text-brand-purple focus:ring-brand-purple border-slate-300 w-4 h-4"
                      />
                      <span className={`text-xs ${item.checked ? "text-slate-400 line-through font-normal" : "text-slate-700 font-medium"}`}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

{selectedCase.arrivalOutcome && <details className="mvp-disclosure"><summary>Arrival & outcomes<ChevronDown size={18}/></summary><div className="mvp-disclosure-body">              {/* Closed arrival outcomes details */}
              {selectedCase.arrivalOutcome && (
                <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-sm space-y-2">
                  <h4 className="font-semibold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-brand-purple" />
                    <span>Arrival & Maternal-Newborn Outcomes</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Arrival Timestamp</span>
                      <span className="font-semibold text-slate-800">
                        {new Date(selectedCase.arrivalOutcome.arrivalTime).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Treatment Disposition</span>
                      <span className="font-semibold text-slate-800">
                        {selectedCase.arrivalOutcome.treatmentDisposition}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Maternal Outcome</span>
                      <span className="font-semibold text-emerald-800 flex items-center gap-0.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{selectedCase.arrivalOutcome.maternalOutcome}</span>
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Newborn Outcome</span>
                      <span className="font-semibold text-emerald-800 flex items-center gap-0.5">
                        <Baby className="w-3.5 h-3.5" />
                        <span>{selectedCase.arrivalOutcome.newbornOutcome}</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

</div></details>}
<details className="mvp-disclosure"><summary>Care notes & activity<ChevronDown size={18}/></summary><div className="mvp-disclosure-body">              {/* Notes & Logs panel */}
              <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-sm space-y-4">
                <h4 className="font-semibold text-xs text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-brand-purple" />
                  <span>Care notes</span>
                </h4>

                <div className="space-y-2 divide-y divide-slate-100">
                  {selectedCase.notes.map((note, i) => (
                    <div key={i} className="py-2.5 first:pt-0 last:pb-0 text-xs">
                      <div className="flex items-center justify-between font-semibold text-[10px] text-slate-400">
                        <span>{note.author}</span>
                        <span>{new Date(note.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="text-slate-700 mt-1 font-medium">{note.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddNote} className="space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add clinical update note..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple text-slate-800"
                    />
                    <button
                      type="submit"
                      disabled={!noteText.trim()}
                      className="px-3 bg-brand-purple hover:bg-dark-purple text-white disabled:bg-slate-200 disabled:text-slate-400 text-xs font-semibold rounded-lg shrink-0"
                    >
                      Add Note
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-400">Author signature:</span>
                    <select
                      value={noteAuthor}
                      onChange={(e) => setNoteAuthor(e.target.value)}
                      className="text-[10px] text-brand-purple font-semibold bg-transparent outline-none cursor-pointer"
                    >
                      <option value="Nurse Agnes">Nurse Agnes (Triage)</option>
                      <option value="Sister Ngozi">Sister Ngozi (Midwife)</option>
                      <option value="Dr. Chinedu Okafor">Dr. Chinedu Okafor (Obstetrician)</option>
                    </select>
                  </div>
                </form>
              </div>

</div></details>
              {/* Chat Helper bridge trigger */}
              <button
                onClick={() => onOpenAssistant(selectedCase)}
                className="w-full py-2.5 bg-purple-50 text-brand-purple border border-purple-100 hover:bg-brand-purple hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Bot className="w-4 h-4" />
                <span>Ask about this referral</span>
              </button>
            </div>
          ) : (
            <div className="m-auto text-center p-6 space-y-2 max-w-sm">
              <ClipboardList className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-semibold text-slate-700 text-sm">Select a Maternal Referral Case</h4>
              <p className="text-xs text-slate-500 leading-normal">
                Click on any case card in the queue to inspect critical vitals, clinical flags, checklist preparations, and audit trails.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Outcome details configuration popup */}
      <AnimatePresence>
        {showOutcomeForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-100 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wide">Record Patient Outcome</h4>
                <button
                  type="button"
                  onClick={() => setShowOutcomeForm(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSaveOutcome} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Arrival Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={outcomeForm.arrivalTime}
                    onChange={(e) => setOutcomeForm({ ...outcomeForm, arrivalTime: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Treatment Disposition</label>
                  <select
                    value={outcomeForm.treatmentDisposition}
                    onChange={(e) => setOutcomeForm({ ...outcomeForm, treatmentDisposition: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                  >
                    <option value="Admitted to Antenatal Ward">Admitted to Antenatal Ward</option>
                    <option value="Immediate Caesarean Section Completed">Immediate Caesarean Section Completed</option>
                    <option value="Discharged Home with ANC Guidelines">Discharged Home with ANC Guidelines</option>
                    <option value="Referred to National Tertiary Centre">Referred to National Tertiary Centre</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Maternal Outcome</label>
                    <input
                      type="text"
                      required
                      value={outcomeForm.maternalOutcome}
                      onChange={(e) => setOutcomeForm({ ...outcomeForm, maternalOutcome: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Newborn Outcome</label>
                    <input
                      type="text"
                      required
                      value={outcomeForm.newbornOutcome}
                      onChange={(e) => setOutcomeForm({ ...outcomeForm, newbornOutcome: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand-purple hover:bg-dark-purple text-white font-semibold text-xs rounded-xl shadow-sm transition-colors"
                >
                  Confirm and Close Case File
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
