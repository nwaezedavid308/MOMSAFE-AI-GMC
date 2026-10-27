import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  UserPlus, Search, ClipboardList, Activity, PhoneCall, AlertTriangle, CheckCircle2, 
  HelpCircle, Wifi, WifiOff, RefreshCw, Send, ChevronRight, ChevronLeft, ArrowRight, ArrowLeft,
  UserCheck, Shield, Lock, Phone, User, LogOut, Check, Info, Bot, Mic,
  Edit3, Calendar, History, Plus, X, Clock
} from "lucide-react";
import { Case, TBAConfig, PatientVisitRecord } from "../types";
import { IgboInfoButton } from "./LocalLanguageHelper";

// Reusable Voice Speech-to-Text Button Component
export function VoiceMicButton({
  onTranscript,
  className = "",
  label = "Record Voice",
  showText = false,
  isNumeric = false,
}: {
  onTranscript: (transcript: string) => void;
  className?: string;
  label?: string;
  showText?: boolean;
  isNumeric?: boolean;
}) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = React.useRef<any>(null);

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice speech recognition is not supported in this browser version. Please type into the box or try Chrome / Edge / Android browser.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-NG"; // Supports Nigerian English speech dictation well!

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = event.results?.[0]?.[0]?.transcript || "";
        if (transcript) {
          if (isNumeric) {
            // Extract digits or numbers if numeric field
            const digits = transcript.replace(/[^0-9.]/g, "");
            if (digits) transcript = digits;
          }
          onTranscript(transcript.trim());
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event?.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      setIsListening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      title={isListening ? "Listening... Speak now into microphone" : label}
      className={`p-1.5 rounded-lg transition-all flex items-center justify-center shrink-0 ${
        isListening
          ? "bg-red-500 text-white animate-pulse shadow-sm"
          : "bg-purple-100 hover:bg-purple-200 text-brand-purple border border-purple-200"
      } ${className}`}
    >
      <Mic className={`w-3.5 h-3.5 ${isListening ? "animate-bounce text-white" : "text-brand-purple"}`} />
      {showText && <span className="ml-1 text-[10px] font-semibold">{isListening ? "Listening..." : label}</span>}
    </button>
  );
}

// Local Storage Keys
const STORAGE_PENDING_CASES = "momsafe_pending_cases";

interface TBAPortalProps {
  onCaseSubmitted: (newCase: Case) => void;
  onOpenAssistant: (activeCase: Case | null) => void;
  currentUser?: { name: string; role: string; community?: string } | null;
}

export default function TBAPortal({ onCaseSubmitted, onOpenAssistant, currentUser }: TBAPortalProps) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  // Connection State
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  // TBA Profile dynamically computed from logged-in user
  const tba: TBAConfig = {
    id: "TBA-001",
    name: currentUser?.name || "Nurse Eunice Nnaji",
    phone: "08030012233",
    pin: "1234",
    community: currentUser?.community || "Umuchigbo"
  };

  // Flow State
  const [activeTab, setActiveTab] = useState<"search" | "register" | "assess" | "result">("search");
  
  // Registration Form State
  const [patientForm, setPatientForm] = useState({
    name: "",
    age: "",
    presentingSymptom: "Normal / Routine checkup (Mother feels fine)",
    symptomDescription: "",
    homeAddress: "Umuchigbo",
    gestationalAge: "36 weeks pregnant (9th month)",
    parity: "1",
    nextOfKinName: "",
    nextOfKinPhone: "",
    phone: "",
    consent: true,
  });

  // Selected patient (for assessment)
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  // Assessment Dropdown & Visit Date State
  const [selectedPresentingSymptom, setSelectedPresentingSymptom] = useState<string>("Normal / Routine checkup (Mother feels fine)");
  const [visitDate, setVisitDate] = useState<string>(() => new Date().toISOString().split("T")[0]);

  // Assessment Form State (1: Physical Assessment, 2: Vitals & Measurements)
  const [assessStep, setAssessStep] = useState<1 | 2>(1);
  const [vitals, setVitals] = useState({
    systolicBP: "",
    diastolicBP: "",
    pulse: "",
    temperature: "",
    respRate: "",
  });

  const [symptoms, setSymptoms] = useState({
    bleeding: "none" as "none" | "mild" | "severe",
    severePain: false,
    severeHeadache: false,
    visualDisturbance: false,
    swellingFeet: false,
    highFever: false,
    convulsions: false,
    breathingDifficulty: false,
    lossOfConsciousness: false,
    reducedFetalMovement: false,
    laborProgressConcerns: false,
    customNote: "",
  });

  // Input Warnings (Implausible checks)
  const [vitalWarnings, setVitalWarnings] = useState<Record<string, string>>({});

  // Active Submitted Case Result
  const [submittedResult, setSubmittedResult] = useState<Case | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Registered Patients State with localStorage Persistence
  const [registeredPatients, setRegisteredPatients] = useState<any[]>(() => {
    const stored = localStorage.getItem("momsafe_registered_patients");
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return [
      {
        id: "PAT-001",
        name: "Chioma Obi",
        age: 24,
        community: "Umuchigbo",
        homeAddress: "Umuchigbo",
        parity: 2,
        gestationalAge: "38 weeks pregnant (9th month)",
        phone: "08051234567",
        nextOfKinName: "Emeka Obi",
        nextOfKinPhone: "08034567812",
        nextOfKin: "Emeka Obi (08034567812)",
        visitHistory: [
          {
            id: "VISIT-001",
            visitDate: "2026-07-15",
            symptomSummary: "Normal / Routine checkup (Mother feels fine)",
            customNote: "Mother feeling good, routine check.",
            systolicBP: 118,
            diastolicBP: 76,
            pulse: 72,
            temperature: 36.6,
            respRate: 16,
            riskCategory: "GREEN",
            reasonText: "Routine antenatal check - Vitals normal.",
            recordedBy: "Nurse Eunice Nnaji"
          }
        ]
      },
      {
        id: "PAT-002",
        name: "Blessing Egwu",
        age: 19,
        community: "Iji Nike",
        homeAddress: "Iji Nike",
        parity: 0,
        gestationalAge: "24 weeks pregnant (6th month)",
        phone: "08139988776",
        nextOfKinName: "Theresa Egwu",
        nextOfKinPhone: "08077654321",
        nextOfKin: "Theresa Egwu (08077654321)",
        visitHistory: []
      },
      {
        id: "PAT-003",
        name: "Ngozi Chukwu",
        age: 31,
        community: "Umuchigbo",
        homeAddress: "Umuchigbo",
        parity: 4,
        gestationalAge: "40 weeks pregnant (9th month)",
        phone: "08035552211",
        nextOfKinName: "Albert Chukwu",
        nextOfKinPhone: "08031112233",
        nextOfKin: "Albert Chukwu (08031112233)",
        visitHistory: []
      },
    ];
  });

  // Edit Patient Modal State
  const [editingPatient, setEditingPatient] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    age: "",
    phone: "",
    nextOfKinName: "",
    nextOfKinPhone: "",
    homeAddress: "",
    gestationalAge: "",
    parity: "",
  });

  // Active History View Modal State
  const [activeHistoryPatient, setActiveHistoryPatient] = useState<any | null>(null);

  // Load offline queue
  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_PENDING_CASES);
    if (cached) {
      setOfflineQueue(JSON.parse(cached));
    }
  }, []);

  // Save offline queue
  const saveOfflineQueue = (queue: any[]) => {
    setOfflineQueue(queue);
    localStorage.setItem(STORAGE_PENDING_CASES, JSON.stringify(queue));
  };

  // Sync offline queue
  const handleSyncOffline = async () => {
    if (!isOnline || offlineQueue.length === 0) return;
    
    let successCount = 0;
    const remaining = [...offlineQueue];

    for (let i = 0; i < offlineQueue.length; i++) {
      const pendingCase = offlineQueue[i];
      try {
        const response = await fetch("/api/cases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingCase),
        });

        if (response.ok) {
          const submitted = await response.json();
          onCaseSubmitted(submitted);
          successCount++;
          remaining.shift(); // remove processed from queue
        }
      } catch (err) {
        console.error("Failed to sync case offline:", err);
        break; // stop if network fails again
      }
    }

    saveOfflineQueue(remaining);
  };

  // Check vitals plausibility on blur
  const validateVital = (name: string, value: string) => {
    const num = parseFloat(value);
    if (!value) return;

    let warning = "";
    if (name === "systolicBP") {
      if (num < 70 || num > 220) warning = "Systolic BP usually ranges between 70 and 220 mmHg. Please re-verify.";
    } else if (name === "diastolicBP") {
      if (num < 40 || num > 140) warning = "Diastolic BP usually ranges between 40 and 140 mmHg. Please re-verify.";
    } else if (name === "pulse") {
      if (num < 40 || num > 160) warning = "Heart pulse rate usually ranges between 40 and 160 bpm. Please re-verify.";
    } else if (name === "temperature") {
      if (num < 34 || num > 42) warning = "Temperature should be between 34°C and 42°C. Please re-verify.";
    } else if (name === "respRate") {
      if (num < 8 || num > 40) warning = "Breathing rate usually ranges between 8 and 40 breaths/min. Please re-verify.";
    }

    setVitalWarnings(prev => {
      if (warning) return { ...prev, [name]: warning };
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  // Edit Patient Handlers
  const openEditModal = (p: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPatient(p);
    setEditForm({
      name: p.name || "",
      age: p.age ? String(p.age) : "",
      phone: p.phone || "",
      nextOfKinName: p.nextOfKinName || (p.nextOfKin?.split("(")[0]?.trim() || ""),
      nextOfKinPhone: p.nextOfKinPhone || (p.nextOfKin?.match(/\((.*?)\)/)?.[1] || ""),
      homeAddress: p.homeAddress || p.community || "Umuchigbo",
      gestationalAge: p.gestationalAge || "36 weeks pregnant (9th month)",
      parity: p.parity ? String(p.parity) : "1",
    });
  };

  const handleSavePatientEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;

    const combinedNextOfKin = editForm.nextOfKinName
      ? `${editForm.nextOfKinName}${editForm.nextOfKinPhone ? ` (${editForm.nextOfKinPhone})` : ""}`
      : "Not recorded";

    const updatedPatient = {
      ...editingPatient,
      name: editForm.name.trim() || editingPatient.name,
      age: editForm.age ? Number(editForm.age) : editingPatient.age,
      phone: editForm.phone || editingPatient.phone,
      nextOfKinName: editForm.nextOfKinName,
      nextOfKinPhone: editForm.nextOfKinPhone,
      nextOfKin: combinedNextOfKin,
      homeAddress: editForm.homeAddress || editingPatient.homeAddress,
      community: editForm.homeAddress || editingPatient.community,
      gestationalAge: editForm.gestationalAge || editingPatient.gestationalAge,
      parity: editForm.parity ? Number(editForm.parity) : editingPatient.parity,
    };

    const updatedList = registeredPatients.map((p) =>
      (p.id && p.id === editingPatient.id) || p.name === editingPatient.name ? updatedPatient : p
    );

    setRegisteredPatients(updatedList);
    try {
      localStorage.setItem("momsafe_registered_patients", JSON.stringify(updatedList));
    } catch (err) {}

    if (selectedPatient && ((selectedPatient.id && selectedPatient.id === editingPatient.id) || selectedPatient.name === editingPatient.name)) {
      setSelectedPatient(updatedPatient);
    }

    setEditingPatient(null);
  };

  // Submit Assessment Form
  const handleAssessSubmit = async () => {
    // Non-compulsory: Use safe standard values if vitals are not provided
    const sysBP = Number(vitals.systolicBP) || 120;
    const diaBP = Number(vitals.diastolicBP) || 80;
    const pulseVal = Number(vitals.pulse) || 75;
    const tempVal = Number(vitals.temperature) || 36.8;
    const respVal = Number(vitals.respRate) || 16;

    const payload = {
      name: selectedPatient?.name || "Mother",
      age: selectedPatient?.age || 25,
      community: selectedPatient?.homeAddress || selectedPatient?.community || "Home Address",
      gestationalAge: selectedPatient?.gestationalAge || "36 weeks pregnant (9th month)",
      parity: selectedPatient?.parity || 1,
      nextOfKin: selectedPatient?.nextOfKin || "Not recorded",
      nextOfKinPhone: selectedPatient?.nextOfKinPhone || "",
      phone: selectedPatient?.phone || "No phone provided",
      consent: selectedPatient?.consent ?? true,
      
      // Symptoms
      bleeding: symptoms.bleeding,
      severePain: symptoms.severePain,
      severeHeadache: symptoms.severeHeadache,
      visualDisturbance: symptoms.visualDisturbance,
      swellingFeet: symptoms.swellingFeet,
      highFever: symptoms.highFever,
      convulsions: symptoms.convulsions,
      breathingDifficulty: symptoms.breathingDifficulty,
      lossOfConsciousness: symptoms.lossOfConsciousness,
      reducedFetalMovement: symptoms.reducedFetalMovement,
      laborProgressConcerns: symptoms.laborProgressConcerns,
      customNote: symptoms.customNote || selectedPatient?.symptomDescription || "",

      // Vitals
      systolicBP: sysBP,
      diastolicBP: diaBP,
      pulse: pulseVal,
      temperature: tempVal,
      respRate: respVal,
      
      tbaName: tba.name,
      tbaPhone: tba.phone,
    };

    // Evaluate local risk for dated visit history recording
    const localEval = evaluateLocalMaternalRisk(payload);
    const newVisitRecord: PatientVisitRecord = {
      id: `VISIT-${Date.now()}`,
      visitDate: visitDate || new Date().toISOString().split("T")[0],
      symptomSummary: selectedPresentingSymptom || "Normal / Routine checkup",
      customNote: symptoms.customNote,
      systolicBP: vitals.systolicBP ? Number(vitals.systolicBP) : undefined,
      diastolicBP: vitals.diastolicBP ? Number(vitals.diastolicBP) : undefined,
      pulse: vitals.pulse ? Number(vitals.pulse) : undefined,
      temperature: vitals.temperature ? Number(vitals.temperature) : undefined,
      respRate: vitals.respRate ? Number(vitals.respRate) : undefined,
      riskCategory: localEval.riskCategory,
      reasonText: localEval.reasonText,
      recordedBy: tba.name,
    };

    // Save visit record to patient history
    if (selectedPatient) {
      const existingHistory = selectedPatient.visitHistory || [];
      const updatedHistory = [newVisitRecord, ...existingHistory];
      const updatedPatient = { ...selectedPatient, visitHistory: updatedHistory };
      setSelectedPatient(updatedPatient);

      const updatedPatients = registeredPatients.map((p) =>
        (p.id && p.id === selectedPatient.id) || p.name === selectedPatient.name
          ? updatedPatient
          : p
      );
      setRegisteredPatients(updatedPatients);
      try {
        localStorage.setItem("momsafe_registered_patients", JSON.stringify(updatedPatients));
      } catch (e) {}
    }

    if (isOnline) {
      try {
        const res = await fetch("/api/cases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const submitted = await res.json();
          setSubmittedResult(submitted);
          onCaseSubmitted(submitted);
          setActiveTab("result");
          resetAssessment();
        } else {
          throw new Error("Failed to submit case to GMC");
        }
      } catch (err) {
        // Fallback to offline if submission fails
        handleOfflineFallBack(payload);
      }
    } else {
      handleOfflineFallBack(payload);
    }
  };

  const handleOfflineFallBack = (payload: any) => {
    // Perform deterministic clinical evaluation locally for offline safety (NFR-OFF-001)
    const localEval = evaluateLocalMaternalRisk(payload);
    const mockCaseId = `ASM-2026-PEND-${Math.floor(Math.random() * 900000 + 100000)}`;
    
    const offlineCase: Case = {
      ...payload,
      id: mockCaseId,
      riskCategory: localEval.riskCategory,
      riskScore: localEval.riskScore,
      reasonCodes: localEval.reasonCodes,
      reasonText: localEval.reasonText,
      requiredAction: localEval.requiredAction,
      dataQuality: "COMPLETE",
      rulesVersion: "GMC-LOCAL-CLIN-1.0",
      status: "New",
      triageCategory: "",
      overrideReason: "",
      overrideClinician: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      checklist: [],
      notes: [{ author: "System (Offline)", text: "Assessment saved offline due to local network state.", timestamp: new Date().toISOString() }],
    };

    saveOfflineQueue([...offlineQueue, payload]);
    setSubmittedResult(offlineCase);
    setActiveTab("result");
    resetAssessment();
  };

  // Helper local risk calculator for offline compliance
  const evaluateLocalMaternalRisk = (data: any) => {
    let isRed = false;
    let isAmber = false;
    const codes: string[] = [];
    
    if (data.bleeding === "severe" || data.convulsions || data.lossOfConsciousness || data.breathingDifficulty) {
      isRed = true;
      codes.push("HARD_DANGER_SIGN");
    }
    if (data.systolicBP >= 160 || data.diastolicBP >= 110 || data.systolicBP < 90) {
      isRed = true;
      codes.push("CRITICAL_BP");
    }
    if (data.temperature >= 38.5) {
      isRed = true;
      codes.push("CRITICAL_TEMP");
    }

    if (isRed) {
      return {
        riskCategory: "RED" as const,
        riskScore: 90,
        reasonCodes: codes,
        reasonText: "Danger signs detected. Emergency care is needed immediately.",
        requiredAction: "REFER_NOW_CALL_HOSPITAL"
      };
    }

    if (data.bleeding === "mild" || data.swellingFeet || data.laborProgressConcerns || data.systolicBP >= 140 || data.diastolicBP >= 90) {
      isAmber = true;
    }

    if (isAmber) {
      return {
        riskCategory: "AMBER" as const,
        riskScore: 50,
        reasonCodes: ["AMBER_ALERT"],
        reasonText: "Potential risk signs. Monitor closely and arrange clinical review.",
        requiredAction: "CONTACT_HOSPITAL_FOR_REVIEW"
      };
    }

    return {
      riskCategory: "GREEN" as const,
      riskScore: 10,
      reasonCodes: ["NORMAL"],
      reasonText: "No immediate danger sign detected. Continue standard antenatal care.",
      requiredAction: "CONTINUE_MONITORING_ANC"
    };
  };

  const resetAssessment = () => {
    setAssessStep(1);
    setVitals({ systolicBP: "", diastolicBP: "", pulse: "", temperature: "", respRate: "" });
    setSymptoms({
      bleeding: "none",
      severePain: false,
      severeHeadache: false,
      visualDisturbance: false,
      swellingFeet: false,
      highFever: false,
      convulsions: false,
      breathingDifficulty: false,
      lossOfConsciousness: false,
      reducedFetalMovement: false,
      laborProgressConcerns: false,
      customNote: "",
    });
    setVitalWarnings({});
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === tba.pin) {
      setIsAuthenticated(true);
      setPinError("");
    } else {
      setPinError("Incorrect security PIN code. Please check.");
    }
  };

  const handleSelectPatient = (p: any) => {
    setSelectedPatient(p);
    const initialSymptom = p.presentingSymptom || "Normal / Routine checkup (Mother feels fine)";
    setSelectedPresentingSymptom(initialSymptom);
    setActiveTab("assess");
    resetAssessment();
    if (p.presentingSymptom || p.symptomDescription) {
      updateSymptomsFromPresentation(initialSymptom, p.symptomDescription || "");
    }
  };

  const updateSymptomsFromPresentation = (presentation: string, details?: string) => {
    setSymptoms(prev => {
      const next = { ...prev };
      // Reset auto-derived flags so switching from one assessment to another immediately reflects the active choice
      next.bleeding = "none";
      next.severeHeadache = false;
      next.highFever = false;
      next.laborProgressConcerns = false;
      next.severePain = false;
      next.swellingFeet = false;
      next.reducedFetalMovement = false;
      next.lossOfConsciousness = false;
      next.convulsions = false;
      next.breathingDifficulty = false;

      if (presentation.includes("Heavy vaginal bleeding")) next.bleeding = "severe";
      else if (presentation.includes("Mild spotting")) next.bleeding = "mild";
      
      if (presentation.includes("Severe headache")) next.severeHeadache = true;
      if (presentation.includes("High fever")) next.highFever = true;
      if (presentation.includes("Water break") || presentation.includes("Fluid leaking")) next.laborProgressConcerns = true;
      if (presentation.includes("Severe belly") || presentation.includes("stomach pain")) next.severePain = true;
      if (presentation.includes("Swollen feet") || presentation.includes("legs, or face")) next.swellingFeet = true;
      if (presentation.includes("Baby not moving") || presentation.includes("kicking well")) next.reducedFetalMovement = true;
      if (presentation.includes("dizzy") || presentation.includes("fainting")) next.lossOfConsciousness = true;
      if (presentation.includes("Fits") || presentation.includes("shaking")) next.convulsions = true;
      if (presentation.includes("Hard to breathe") || presentation.includes("Shortness of breath")) next.breathingDifficulty = true;

      if (details !== undefined && details.trim()) {
        next.customNote = details.trim();
      }
      return next;
    });
  };

  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();

    const nextOfKinCombined = patientForm.nextOfKinName
      ? `${patientForm.nextOfKinName}${patientForm.nextOfKinPhone ? ` (${patientForm.nextOfKinPhone})` : ""}`
      : "Not recorded";

    const newPat = {
      id: `PAT-${Date.now()}`,
      name: patientForm.name.trim() || "Mother",
      age: patientForm.age ? Number(patientForm.age) : 25,
      community: patientForm.homeAddress.trim() || "Umuchigbo",
      homeAddress: patientForm.homeAddress.trim() || "Umuchigbo",
      parity: patientForm.parity ? Number(patientForm.parity) : 1,
      gestationalAge: patientForm.gestationalAge || "36 weeks pregnant (9th month)",
      phone: patientForm.phone || "No phone provided",
      nextOfKinName: patientForm.nextOfKinName || "",
      nextOfKinPhone: patientForm.nextOfKinPhone || "",
      nextOfKin: nextOfKinCombined,
      presentingSymptom: patientForm.presentingSymptom,
      symptomDescription: patientForm.symptomDescription,
      consent: patientForm.consent,
      visitHistory: []
    };

    const updatedList = [newPat, ...registeredPatients];
    setRegisteredPatients(updatedList);
    try {
      localStorage.setItem("momsafe_registered_patients", JSON.stringify(updatedList));
    } catch(err) {}

    resetAssessment();
    setSelectedPresentingSymptom(patientForm.presentingSymptom || "Normal / Routine checkup (Mother feels fine)");
    if (patientForm.presentingSymptom || patientForm.symptomDescription) {
      updateSymptomsFromPresentation(patientForm.presentingSymptom, patientForm.symptomDescription);
    }

    setSelectedPatient(newPat);
    setActiveTab("assess");
    setAssessStep(1); // 1: Physical Assessment
    setPatientForm({
      name: "",
      age: "",
      presentingSymptom: "Normal / Routine checkup (Mother feels fine)",
      symptomDescription: "",
      homeAddress: "Umuchigbo",
      gestationalAge: "36 weeks pregnant (9th month)",
      parity: "1",
      nextOfKinName: "",
      nextOfKinPhone: "",
      phone: "",
      consent: true,
    });
  };

  // Filter patients
  const filteredPatients = registeredPatients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.community && p.community.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden shadow-md flex flex-col min-h-[680px]">
      {/* Top Banner - System & Sync bar */}
      <div className="bg-dark-purple text-white px-5 py-3.5 flex items-center justify-between border-b border-purple-950/20">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></div>
          <span className="text-xs font-semibold tracking-wide uppercase">TBA Community Portal</span>
        </div>
        
        {/* Connection simulator / Sync control */}
        <div className="flex items-center gap-3">
          {offlineQueue.length > 0 && (
            <button
              onClick={handleSyncOffline}
              disabled={!isOnline}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg ${
                isOnline 
                  ? "bg-amber-500 text-slate-900 hover:bg-amber-400" 
                  : "bg-slate-700 text-slate-400 cursor-not-allowed"
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${isOnline ? "animate-spin" : ""}`} />
              <span>{offlineQueue.length} Pending Sync</span>
            </button>
          )}

          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
              isOnline 
                ? "bg-teal-900/40 text-teal-300 border border-teal-500/30" 
                : "bg-red-950/40 text-red-300 border border-red-500/30"
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span>Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span>Working Offline</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Authenticated TBA Info Card */}
      {isAuthenticated && (
        <div className="bg-[#32134F] text-white/95 px-5 py-3 flex flex-wrap items-center justify-between gap-2 text-xs border-b border-purple-950/40">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-purple-200" />
            <span>Active: <strong>{tba.name}</strong> ({tba.community} Area)</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Full Igbo Dictionary link */}
            <IgboInfoButton termId="parity" className="py-0.5 px-2 bg-purple-900/40 text-purple-200 hover:bg-purple-900 border border-purple-800" />
            <button
              onClick={() => setIsAuthenticated(false)}
              className="text-[10px] text-purple-200 hover:text-white flex items-center gap-1 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span>Lock App</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        {!isAuthenticated ? (
          /* Secure PIN Screen */
          <div className="my-auto max-w-sm mx-auto w-full bg-white border border-slate-100 rounded-2xl p-6 shadow-sm text-center">
            <div className="w-12 h-12 bg-purple-50 text-brand-purple rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-slate-800">Secure Pin Security</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Please enter your 4-digit TBA PIN to start assessment.
            </p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="w-32 text-center text-xl tracking-[0.4em] py-2 border border-slate-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none rounded-xl bg-slate-50 font-bold"
              />
              
              {pinError && (
                <p className="text-xs text-red-600 font-medium">{pinError}</p>
              )}

              <button
                type="submit"
                disabled={pin.length < 4}
                className="w-full py-2.5 bg-brand-purple text-white rounded-xl text-xs font-semibold hover:bg-dark-purple disabled:bg-slate-100 disabled:text-slate-400 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Unlock Device Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        ) : (
          /* Active App Portal Screens */
          <div className="flex-1 flex flex-col">
            {/* Nav Tabs Bar */}
            <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-200/60 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("search")}
                className={`py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "search" || activeTab === "assess"
                    ? "bg-white text-brand-purple shadow-sm font-semibold"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Search / New Case</span>
              </button>
              
              <button
                onClick={() => {
                  if (submittedResult) setActiveTab("result");
                  else alert("Complete and submit an assessment to see results.");
                }}
                className={`py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "result"
                    ? "bg-white text-brand-purple shadow-sm font-semibold"
                    : "text-slate-600 hover:text-slate-800"
                }`}
                disabled={!submittedResult}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Current Result</span>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "search" && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Search block */}
                    <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-sm">
                      <div className="flex items-center justify-between mb-2.5">
                        <h4 className="font-semibold text-xs text-slate-800 uppercase tracking-wider">Find Registered Patient</h4>
                        <VoiceMicButton
                          label="Voice Search"
                          onTranscript={(text) => setSearchQuery(text)}
                        />
                      </div>
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search pregnant mother's name or speak..."
                          className="w-full bg-slate-50 pl-9 pr-4 py-2.5 border border-slate-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple rounded-xl text-xs outline-none transition-all text-slate-800"
                        />
                      </div>

                      {/* Results list */}
                      <div className="mt-3 space-y-2.5 max-h-60 overflow-y-auto pr-1">
                        {filteredPatients.length > 0 ? (
                          filteredPatients.map((p, idx) => (
                            <div
                              key={p.id || idx}
                              className="w-full text-left p-3 bg-slate-50 border border-slate-200/80 hover:border-purple-200 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <h5 className="font-bold text-xs text-slate-800">{p.name}</h5>
                                  <span className="text-[9px] bg-purple-100 text-brand-purple font-semibold px-1.5 py-0.5 rounded">
                                    {p.id || `PAT-0${idx + 1}`}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-600 font-medium">
                                  Age {p.age} • Parity {p.parity} • {p.gestationalAge} ({p.homeAddress || p.community})
                                </p>
                                <div className="text-[10px] text-slate-500 flex flex-wrap items-center gap-2 pt-0.5">
                                  <span>Phone: <strong className="text-slate-700">{p.phone || "None"}</strong></span>
                                  <span>•</span>
                                  <span>Kin Name: <strong className="text-slate-700">{p.nextOfKinName || p.nextOfKin?.split("(")[0]?.trim() || "Unrecorded"}</strong></span>
                                  <span>•</span>
                                  <span>Kin Phone: <strong className="text-slate-700">{p.nextOfKinPhone || p.nextOfKin?.match(/\((.*?)\)/)?.[1] || "Unrecorded"}</strong></span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                {/* Edit Button */}
                                <button
                                  type="button"
                                  onClick={(e) => openEditModal(p, e)}
                                  className="px-2 py-1 bg-white border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-brand-purple rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors"
                                  title="Edit Patient Information"
                                >
                                  <Edit3 className="w-3 h-3 text-brand-purple" />
                                  <span>Edit</span>
                                </button>

                                {/* Visit History Button */}
                                <button
                                  type="button"
                                  onClick={() => setActiveHistoryPatient(p)}
                                  className="px-2 py-1 bg-white border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-brand-purple rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors"
                                  title="View Dated Visit History"
                                >
                                  <History className="w-3 h-3 text-brand-purple" />
                                  <span>History ({p.visitHistory?.length || 0})</span>
                                </button>

                                {/* Assess Button */}
                                <button
                                  type="button"
                                  onClick={() => handleSelectPatient(p)}
                                  className="px-2.5 py-1 bg-brand-purple hover:bg-dark-purple text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors shadow-sm"
                                >
                                  <span>Assess</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center py-4 text-xs text-slate-400">No registered patient matches search.</p>
                        )}
                      </div>
                    </div>

                    {/* Quick Register Patient Trigger Card */}
                    <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl border border-purple-100 text-brand-purple">
                          <UserPlus className="w-5 h-5" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-xs text-slate-800">New Mother Registration</h5>
                          <p className="text-[10px] text-slate-500 mt-0.5">Mother not listed? Create a card instantly.</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab("register")}
                        className="px-3.5 py-1.5 bg-brand-purple hover:bg-dark-purple text-white text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span>Register</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Helper Guidelines footer */}
                  <div className="p-3 bg-slate-100 rounded-xl flex items-start gap-2.5 mt-4">
                    <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-600 leading-normal">
                      <strong>TBA Guideline:</strong> Ensure you seek explicit maternal consent before performing any digital registry or vitals recording. Read out the standard consent clauses.
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === "register" && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-white border border-slate-150 p-5 rounded-2xl shadow-sm flex-1"
                >
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                    <h4 className="font-semibold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-brand-purple" />
                      <span>Register Pregnant Mother</span>
                    </h4>
                    <button
                      onClick={() => setActiveTab("search")}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-800 transition-colors py-1 px-2.5 rounded-lg border border-slate-100 hover:bg-slate-50"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                  </div>

                  <form onSubmit={handleRegisterPatient} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Mother's Full Name
                          </label>
                          <VoiceMicButton
                            label="Record Name"
                            onTranscript={(text) => setPatientForm((prev) => ({
                              ...prev,
                              name: prev.name ? `${prev.name} ${text}` : text
                            }))}
                          />
                        </div>
                        <div className="relative">
                          <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            placeholder="e.g. Joy Okafor"
                            value={patientForm.name}
                            onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Age in Years
                          </label>
                          <VoiceMicButton
                            label="Record Age"
                            isNumeric={true}
                            onTranscript={(text) => setPatientForm((prev) => ({ ...prev, age: text }))}
                          />
                        </div>
                        <input
                          type="number"
                          min={12}
                          max={60}
                          placeholder="e.g. 26"
                          value={patientForm.age}
                          onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none rounded-lg px-3 py-1.5 text-xs text-slate-800"
                        />
                      </div>
                    </div>

                    {/* How Mother is Feeling - Presenting Complaints */}
                    <div className="bg-purple-50/40 p-3 rounded-xl border border-purple-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-purple">
                          Mother's Main Complaint
                        </label>
                        <IgboInfoButton termId="presenting_complaint" className="scale-75 origin-right" />
                      </div>

                      <div>
                        <select
                          id="patient-register-presenting-symptom"
                          value={patientForm.presentingSymptom}
                          onChange={(e) => setPatientForm({ ...patientForm, presentingSymptom: e.target.value })}
                          className="w-full bg-white border border-slate-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none rounded-lg px-2.5 py-2 text-xs text-slate-800 font-medium"
                        >
                          <option value="Normal / Routine checkup (Mother feels fine)">Normal / Feeling fine (Routine checkup)</option>
                          <option value="Severe headache (Persistent head pain)">Severe headache (Persistent head pain)</option>
                          <option value="Heavy vaginal bleeding (Heavy blood flow)">Heavy vaginal bleeding (Heavy blood flow)</option>
                          <option value="Mild spotting or bleeding">Mild spotting or bleeding</option>
                          <option value="High fever (Very hot body / Chills)">High fever (Very hot body / Chills)</option>
                          <option value="Water broke early / Fluid leaking from bottom">Water broke early / Fluid leaking from bottom</option>
                          <option value="Severe belly or stomach pain">Severe belly or stomach pain</option>
                          <option value="Swollen feet, legs, or face">Swollen feet, legs, or face</option>
                          <option value="Baby not moving or kicking well in belly">Baby not moving or kicking well in belly</option>
                          <option value="Feeling dizzy, weak, or fainting">Feeling dizzy, weak, or fainting</option>
                          <option value="Fits / Body shaking uncontrollably">Fits / Body shaking uncontrollably</option>
                          <option value="Hard to breathe / Shortness of breath">Hard to breathe / Shortness of breath</option>
                          <option value="Other symptom or complaint">Other symptom or complaint</option>
                        </select>
                        <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-brand-purple bg-purple-100/60 px-2 py-1 rounded-md font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-brand-purple shrink-0" />
                          <span>Active: {patientForm.presentingSymptom}</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-semibold text-slate-600">Complaint Notes & Clinical Observations</label>
                          <VoiceMicButton
                            label="Dictate Complaint"
                            onTranscript={(text) => setPatientForm((prev) => ({
                              ...prev,
                              symptomDescription: prev.symptomDescription ? `${prev.symptomDescription} ${text}` : text
                            }))}
                          />
                        </div>
                        <textarea
                          id="patient-register-symptom-description"
                          rows={6}
                          placeholder="e.g. She says her body is very hot, headache started yesterday, and her belly hurts when she walks. Family reports she has not eaten today..."
                          value={patientForm.symptomDescription}
                          onChange={(e) => setPatientForm({ ...patientForm, symptomDescription: e.target.value })}
                          className="w-full min-h-[130px] bg-white border border-slate-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none rounded-xl px-3.5 py-3 text-xs text-slate-800 leading-relaxed resize-y shadow-inner"
                        />
                      </div>
                    </div>

                    {/* Home Address & Pregnancy Stage */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                          Home Address
                        </label>
                        <select
                          value={patientForm.homeAddress}
                          onChange={(e) => setPatientForm({ ...patientForm, homeAddress: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none rounded-lg px-2 py-1.5 text-xs text-slate-800"
                        >
                          <option value="Umuchigbo">Umuchigbo</option>
                          <option value="Iji Nike">Iji Nike</option>
                          <option value="Enugu East LGA">Enugu East LGA</option>
                          <option value="Emene">Emene</option>
                          <option value="Abakpa">Abakpa</option>
                          <option value="Obinagu">Obinagu</option>
                          <option value="Other Home Location">Other Home Location</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Pregnancy Stage
                          </label>
                          <IgboInfoButton termId="gestational_age" className="scale-75 origin-right" />
                        </div>
                        <select
                          value={patientForm.gestationalAge}
                          onChange={(e) => setPatientForm({ ...patientForm, gestationalAge: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none rounded-lg px-2 py-1.5 text-xs text-slate-800"
                        >
                          <option value="First 3 Months (1-12 wks)">First 3 Months (1-12 wks)</option>
                          <option value="4 to 6 Months (13-27 wks)">4 to 6 Months (13-27 wks)</option>
                          <option value="7th Month (28 weeks)">7th Month (28 weeks)</option>
                          <option value="8th Month (32 weeks)">8th Month (32 weeks)</option>
                          <option value="36 weeks pregnant (9th month)">36 weeks pregnant (9th month)</option>
                          <option value="38 weeks pregnant">38 weeks pregnant</option>
                          <option value="40 weeks (Full term)">40 weeks (Full term)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1">
                            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                              Past Births
                            </label>
                            <IgboInfoButton termId="parity" className="scale-75 origin-right" />
                          </div>
                          <VoiceMicButton
                            label="Record"
                            isNumeric={true}
                            onTranscript={(text) => setPatientForm((prev) => ({ ...prev, parity: text }))}
                          />
                        </div>
                        <input
                          type="number"
                          min={0}
                          max={15}
                          value={patientForm.parity}
                          onChange={(e) => setPatientForm({ ...patientForm, parity: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none rounded-lg px-3 py-1.5 text-xs text-slate-800"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Phone Number
                          </label>
                          <VoiceMicButton
                            label="Record Phone"
                            isNumeric={true}
                            onTranscript={(text) => setPatientForm((prev) => ({ ...prev, phone: text }))}
                          />
                        </div>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="tel"
                            placeholder="e.g. 08051234567"
                            value={patientForm.phone}
                            onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Next of Kin Name & Phone Number (Separated Fields) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Next of Kin Full Name
                          </label>
                          <VoiceMicButton
                            label="Record Name"
                            onTranscript={(text) => setPatientForm((prev) => ({
                              ...prev,
                              nextOfKinName: prev.nextOfKinName ? `${prev.nextOfKinName} ${text}` : text
                            }))}
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. Emeka Obi (Husband)"
                          value={patientForm.nextOfKinName}
                          onChange={(e) => setPatientForm({ ...patientForm, nextOfKinName: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none rounded-lg px-3 py-1.5 text-xs text-slate-800"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Next of Kin Phone Number
                          </label>
                          <VoiceMicButton
                            label="Record Phone"
                            isNumeric={true}
                            onTranscript={(text) => setPatientForm((prev) => ({ ...prev, nextOfKinPhone: text }))}
                          />
                        </div>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="tel"
                            placeholder="e.g. 08031234567"
                            value={patientForm.nextOfKinPhone}
                            onChange={(e) => setPatientForm({ ...patientForm, nextOfKinPhone: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Consent checkbox */}
                    <div className="bg-purple-50/50 border border-purple-100 p-3 rounded-xl">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={patientForm.consent}
                          onChange={(e) => setPatientForm({ ...patientForm, consent: e.target.checked })}
                          className="mt-0.5 rounded text-brand-purple focus:ring-brand-purple border-slate-300 shrink-0"
                        />
                        <div className="text-[10px] text-slate-600 leading-normal">
                          <strong>Maternal Consent Clause:</strong> Mother consents to share her name, contact, age, and clinical assessment data with Googwill Medical Centre triage staff for medical readiness and emergency coordination.
                        </div>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-brand-purple text-white hover:bg-dark-purple text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 mt-2 shadow-sm"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Confirm & Begin Assessment</span>
                    </button>
                  </form>
                </motion.div>
              )}

              {activeTab === "assess" && selectedPatient && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-white border border-slate-150 p-5 rounded-2xl shadow-sm flex-1 flex flex-col justify-between"
                >
                  <div>
                    {/* Header showing active patient */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <div>
                        <span className="text-[9px] font-bold text-brand-purple uppercase tracking-wider">Active Assessment</span>
                        <h4 className="font-semibold text-sm text-slate-800">{selectedPatient.name}</h4>
                        <p className="text-[10px] text-slate-500">
                          Age {selectedPatient.age} • Births {selectedPatient.parity} • {selectedPatient.gestationalAge}
                        </p>
                        {selectedPatient.nextOfKin && (
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Kin: {selectedPatient.nextOfKinName ? `${selectedPatient.nextOfKinName} (${selectedPatient.nextOfKinPhone || 'No phone'})` : selectedPatient.nextOfKin}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => openEditModal(selectedPatient, e)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-brand-purple bg-purple-50 hover:bg-purple-100 transition-colors py-1.5 px-2.5 rounded-lg border border-purple-200"
                          title="Edit Patient Information"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Info</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Are you sure you want to exit? Assessment history will be reset.")) {
                              setActiveTab("search");
                            }
                          }}
                          className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors py-1.5 px-3 rounded-lg border border-red-100"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>

                    {/* Step Tabs indicator - PHYSICAL ASSESSMENT FIRST, THEN VITALS */}
                    <div className="flex items-center gap-2 mb-4">
                      <button
                        onClick={() => setAssessStep(1)}
                        className={`flex-1 py-2 rounded-lg text-[11px] font-semibold text-center border transition-all ${
                          assessStep === 1
                            ? "bg-purple-50 text-brand-purple border-purple-200 shadow-sm"
                            : "bg-slate-50 text-slate-500 border-slate-100"
                        }`}
                      >
                        1. Physical Assessment
                      </button>
                      <button
                        onClick={() => setAssessStep(2)}
                        className={`flex-1 py-2 rounded-lg text-[11px] font-semibold text-center border transition-all ${
                          assessStep === 2
                            ? "bg-purple-50 text-brand-purple border-purple-200 shadow-sm"
                            : "bg-slate-50 text-slate-500 border-slate-100"
                        }`}
                      >
                        2. Body Vitals
                      </button>
                    </div>

                    {assessStep === 1 ? (
                      /* Step 1: PHYSICAL ASSESSMENT FIRST */
                      <div className="space-y-3.5">
                        {/* Visit / Assessment Date Picker */}
                        <div className="flex items-center justify-between bg-purple-50/60 border border-purple-150 px-3 py-2 rounded-xl">
                          <label className="text-[10px] font-bold text-brand-purple flex items-center gap-1.5 uppercase tracking-wider">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Visit / Assessment Date</span>
                          </label>
                          <input
                            type="date"
                            value={visitDate}
                            onChange={(e) => setVisitDate(e.target.value)}
                            className="bg-white border border-purple-200 text-xs font-semibold px-2.5 py-1 rounded-lg text-slate-800 outline-none focus:border-brand-purple"
                          />
                        </div>

                        {/* Dropdown Menu & Box to Type What Is Wrong */}
                        <div className="bg-purple-50/40 p-3 border border-purple-100 rounded-xl space-y-2.5">
                          <h5 className="font-bold text-[10px] text-brand-purple uppercase tracking-wider">How is the mother feeling right now?</h5>
                          
                          <div>
                            <select
                              id="tba-assessment-presenting-symptom"
                              value={selectedPresentingSymptom}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSelectedPresentingSymptom(val);
                                updateSymptomsFromPresentation(val, symptoms.customNote);
                              }}
                              className="w-full bg-white border border-slate-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none rounded-lg px-2.5 py-2 text-xs text-slate-800 font-medium"
                            >
                              <option value="Normal / Routine checkup (Mother feels fine)">Normal / Feeling fine (Routine checkup)</option>
                              <option value="Severe headache (Persistent head pain)">Severe headache (Persistent head pain)</option>
                              <option value="Heavy vaginal bleeding (Heavy blood flow)">Heavy vaginal bleeding (Heavy blood flow)</option>
                              <option value="Mild spotting or bleeding">Mild spotting or bleeding</option>
                              <option value="High fever (Very hot body / Chills)">High fever (Very hot body / Chills)</option>
                              <option value="Water broke early / Fluid leaking from bottom">Water broke early / Fluid leaking from bottom</option>
                              <option value="Severe belly or stomach pain">Severe belly or stomach pain</option>
                              <option value="Swollen feet, legs, or face">Swollen feet, legs, or face</option>
                              <option value="Baby not moving or kicking well in belly">Baby not moving or kicking well in belly</option>
                              <option value="Feeling dizzy, weak, or fainting">Feeling dizzy, weak, or fainting</option>
                              <option value="Fits / Body shaking uncontrollably">Fits / Body shaking uncontrollably</option>
                              <option value="Hard to breathe / Shortness of breath">Hard to breathe / Shortness of breath</option>
                              <option value="Other symptom or complaint">Other symptom or complaint</option>
                            </select>
                            <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-brand-purple bg-purple-100/60 px-2 py-1 rounded-md font-semibold">
                              <CheckCircle2 className="w-3 h-3 text-brand-purple shrink-0" />
                              <span>Active Assessment: {selectedPresentingSymptom}</span>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-[10px] font-semibold text-slate-600">Complaint Notes & Clinical Observations</label>
                              <VoiceMicButton
                                label="Dictate Note"
                                onTranscript={(text) => setSymptoms((prev) => ({
                                  ...prev,
                                  customNote: prev.customNote ? `${prev.customNote} ${text}` : text
                                }))}
                              />
                            </div>
                            <textarea
                              id="tba-assessment-custom-note"
                              rows={6}
                              value={symptoms.customNote}
                              onChange={(e) => setSymptoms({ ...symptoms, customNote: e.target.value })}
                              placeholder="Type or dictate what mother or family says, onset time, triggers, or specific observation details..."
                              className="w-full min-h-[130px] bg-white border border-slate-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none rounded-xl px-3.5 py-3 text-xs text-slate-800 leading-relaxed resize-y shadow-inner"
                            />
                          </div>
                        </div>

                        {/* Vaginal Bleeding Status */}
                        <div className="bg-slate-50/50 p-3 border border-slate-100 rounded-xl">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Vaginal Bleeding Status from Bottom</label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => setSymptoms({ ...symptoms, bleeding: "none" })}
                              className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                                symptoms.bleeding === "none"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                  : "bg-white text-slate-600 border-slate-100 hover:bg-slate-50"
                              }`}
                            >
                              No Bleeding
                            </button>
                            <button
                              type="button"
                              onClick={() => setSymptoms({ ...symptoms, bleeding: "mild" })}
                              className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                                symptoms.bleeding === "mild"
                                  ? "bg-amber-50 text-amber-800 border-amber-300 animate-pulse"
                                  : "bg-white text-slate-600 border-slate-100 hover:bg-slate-50"
                              }`}
                            >
                              Mild Spotting
                            </button>
                            <button
                              type="button"
                              onClick={() => setSymptoms({ ...symptoms, bleeding: "severe" })}
                              className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                                symptoms.bleeding === "severe"
                                  ? "bg-red-50 text-red-800 border-red-300 animate-pulse"
                                  : "bg-white text-slate-600 border-slate-100 hover:bg-slate-50"
                              }`}
                            >
                              Heavy Bleeding
                            </button>
                          </div>
                        </div>

                        {/* Checklist of other danger signs (Plain English for easy understanding) */}
                        <div className="bg-slate-50/50 p-3.5 border border-slate-100 rounded-xl max-h-52 overflow-y-auto space-y-2">
                          <h5 className="font-semibold text-[10px] text-slate-500 uppercase tracking-wider mb-2">Check Other Physical Danger Signs</h5>
                          
                          <div className="grid grid-cols-1 gap-2">
                            <label className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100 hover:bg-purple-50/10 cursor-pointer">
                              <span className="text-xs text-slate-700 font-medium">Severe belly or stomach pain</span>
                              <input
                                type="checkbox"
                                checked={symptoms.severePain}
                                onChange={(e) => setSymptoms({ ...symptoms, severePain: e.target.checked })}
                                className="rounded text-brand-purple focus:ring-brand-purple border-slate-300"
                              />
                            </label>

                            <label className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100 hover:bg-purple-50/10 cursor-pointer">
                              <span className="text-xs text-slate-700 font-medium">Persistent severe head pain</span>
                              <input
                                type="checkbox"
                                checked={symptoms.severeHeadache}
                                onChange={(e) => setSymptoms({ ...symptoms, severeHeadache: e.target.checked })}
                                className="rounded text-brand-purple focus:ring-brand-purple border-slate-300"
                              />
                            </label>

                            <label className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100 hover:bg-purple-50/10 cursor-pointer">
                              <span className="text-xs text-slate-700 font-medium">Blurry eyes or seeing dark spots</span>
                              <input
                                type="checkbox"
                                checked={symptoms.visualDisturbance}
                                onChange={(e) => setSymptoms({ ...symptoms, visualDisturbance: e.target.checked })}
                                className="rounded text-brand-purple focus:ring-brand-purple border-slate-300"
                              />
                            </label>

                            <label className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100 hover:bg-purple-50/10 cursor-pointer">
                              <span className="text-xs text-slate-700 font-medium">Body shaking, fits or convulsions</span>
                              <input
                                type="checkbox"
                                checked={symptoms.convulsions}
                                onChange={(e) => setSymptoms({ ...symptoms, convulsions: e.target.checked })}
                                className="rounded text-brand-purple focus:ring-brand-purple border-slate-300"
                              />
                            </label>

                            <label className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100 hover:bg-purple-50/10 cursor-pointer">
                              <span className="text-xs text-slate-700 font-medium">Hard to breathe / Short of breath</span>
                              <input
                                type="checkbox"
                                checked={symptoms.breathingDifficulty}
                                onChange={(e) => setSymptoms({ ...symptoms, breathingDifficulty: e.target.checked })}
                                className="rounded text-brand-purple focus:ring-brand-purple border-slate-300"
                              />
                            </label>

                            <label className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100 hover:bg-purple-50/10 cursor-pointer">
                              <span className="text-xs text-slate-700 font-medium">Passed out or feeling like fainting</span>
                              <input
                                type="checkbox"
                                checked={symptoms.lossOfConsciousness}
                                onChange={(e) => setSymptoms({ ...symptoms, lossOfConsciousness: e.target.checked })}
                                className="rounded text-brand-purple focus:ring-brand-purple border-slate-300"
                              />
                            </label>

                            <label className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100 hover:bg-purple-50/10 cursor-pointer">
                              <span className="text-xs text-slate-700 font-medium">Baby stopped kicking or moving in belly</span>
                              <input
                                type="checkbox"
                                checked={symptoms.reducedFetalMovement}
                                onChange={(e) => setSymptoms({ ...symptoms, reducedFetalMovement: e.target.checked })}
                                className="rounded text-brand-purple focus:ring-brand-purple border-slate-300"
                              />
                            </label>

                            <label className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100 hover:bg-purple-50/10 cursor-pointer">
                              <span className="text-xs text-slate-700 font-medium">Swollen face, hands or feet</span>
                              <input
                                type="checkbox"
                                checked={symptoms.swellingFeet}
                                onChange={(e) => setSymptoms({ ...symptoms, swellingFeet: e.target.checked })}
                                className="rounded text-brand-purple focus:ring-brand-purple border-slate-300"
                              />
                            </label>
                            
                            <label className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100 hover:bg-purple-50/10 cursor-pointer">
                              <span className="text-xs text-slate-700 font-medium">Water leaking from bottom / Early labor</span>
                              <input
                                type="checkbox"
                                checked={symptoms.laborProgressConcerns}
                                onChange={(e) => setSymptoms({ ...symptoms, laborProgressConcerns: e.target.checked })}
                                className="rounded text-brand-purple focus:ring-brand-purple border-slate-300"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Step 2: BODY VITALS */
                      <div className="space-y-4">
                        <div className="bg-slate-50/50 p-3 border border-slate-100 rounded-xl space-y-2">
                          <div>
                            <h5 className="font-bold text-[10px] text-slate-800 uppercase tracking-wider">2. Body Vitals</h5>
                            <p className="text-[10px] text-slate-500">Record body vitals below or skip if instruments are unavailable.</p>
                          </div>

                          <div className="space-y-3">
                            {/* Blood Pressure Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-[10px] text-slate-600 font-semibold">Systolic BP (Top Number)</label>
                                  <VoiceMicButton
                                    label="Record"
                                    isNumeric={true}
                                    onTranscript={(text) => setVitals((prev) => ({ ...prev, systolicBP: text }))}
                                  />
                                </div>
                                <input
                                  type="number"
                                  placeholder="e.g. 120"
                                  value={vitals.systolicBP}
                                  onChange={(e) => setVitals({ ...vitals, systolicBP: e.target.value })}
                                  onBlur={(e) => validateVital("systolicBP", e.target.value)}
                                  className="w-full bg-white border border-slate-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium"
                                />
                                {vitalWarnings.systolicBP && (
                                  <p className="text-[9px] text-amber-700 mt-1 font-medium leading-normal">{vitalWarnings.systolicBP}</p>
                                )}
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-[10px] text-slate-600 font-semibold">Diastolic BP (Bottom Number)</label>
                                  <VoiceMicButton
                                    label="Record"
                                    isNumeric={true}
                                    onTranscript={(text) => setVitals((prev) => ({ ...prev, diastolicBP: text }))}
                                  />
                                </div>
                                <input
                                  type="number"
                                  placeholder="e.g. 80"
                                  value={vitals.diastolicBP}
                                  onChange={(e) => setVitals({ ...vitals, diastolicBP: e.target.value })}
                                  onBlur={(e) => validateVital("diastolicBP", e.target.value)}
                                  className="w-full bg-white border border-slate-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium"
                                />
                                {vitalWarnings.diastolicBP && (
                                  <p className="text-[9px] text-amber-700 mt-1 font-medium leading-normal">{vitalWarnings.diastolicBP}</p>
                                )}
                              </div>
                            </div>

                            {/* Pulse & Temp */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-[10px] text-slate-600 font-semibold">Pulse / Heart Rate (bpm)</label>
                                  <VoiceMicButton
                                    label="Record"
                                    isNumeric={true}
                                    onTranscript={(text) => setVitals((prev) => ({ ...prev, pulse: text }))}
                                  />
                                </div>
                                <input
                                  type="number"
                                  placeholder="e.g. 78"
                                  value={vitals.pulse}
                                  onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                                  onBlur={(e) => validateVital("pulse", e.target.value)}
                                  className="w-full bg-white border border-slate-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium"
                                />
                                {vitalWarnings.pulse && (
                                  <p className="text-[9px] text-amber-700 mt-1 font-medium leading-normal">{vitalWarnings.pulse}</p>
                                )}
                              </div>

                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-[10px] text-slate-600 font-semibold">Body Heat / Temp (°C)</label>
                                  <VoiceMicButton
                                    label="Record"
                                    isNumeric={true}
                                    onTranscript={(text) => setVitals((prev) => ({ ...prev, temperature: text }))}
                                  />
                                </div>
                                <input
                                  type="number"
                                  step="0.1"
                                  placeholder="e.g. 36.8"
                                  value={vitals.temperature}
                                  onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                                  onBlur={(e) => validateVital("temperature", e.target.value)}
                                  className="w-full bg-white border border-slate-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium"
                                />
                                {vitalWarnings.temperature && (
                                  <p className="text-[9px] text-amber-700 mt-1 font-medium leading-normal">{vitalWarnings.temperature}</p>
                                )}
                              </div>
                            </div>

                            {/* Resp rate */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-[10px] text-slate-600 font-semibold">Breathing Speed (Breaths/min)</label>
                                <VoiceMicButton
                                  label="Record"
                                  isNumeric={true}
                                  onTranscript={(text) => setVitals((prev) => ({ ...prev, respRate: text }))}
                                />
                              </div>
                              <input
                                type="number"
                                placeholder="e.g. 16"
                                value={vitals.respRate}
                                onChange={(e) => setVitals({ ...vitals, respRate: e.target.value })}
                                onBlur={(e) => validateVital("respRate", e.target.value)}
                                className="w-full bg-white border border-slate-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium"
                              />
                              {vitalWarnings.respRate && (
                                <p className="text-[9px] text-amber-700 mt-1 font-medium leading-normal">{vitalWarnings.respRate}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-5">
                    {assessStep === 1 ? (
                      <>
                        <button
                          type="button"
                          onClick={handleAssessSubmit}
                          className="sm:w-auto py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all order-2 sm:order-1"
                        >
                          <Send className="w-3.5 h-3.5 text-slate-500" />
                          <span>Skip Vitals & Run Assessment</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAssessStep(2)}
                          className="flex-1 py-2.5 px-4 bg-brand-purple hover:bg-dark-purple text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm order-1 sm:order-2"
                        >
                          <span>Next: Body Vitals</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setAssessStep(1)}
                          className="sm:w-auto py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Physical Assessment</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleAssessSubmit}
                          className="flex-1 py-2.5 px-4 bg-brand-purple hover:bg-dark-purple text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                        >
                          <Send className="w-4 h-4" />
                          <span>Run Safe AI Assessment</span>
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "result" && submittedResult && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-4 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Big Color Banner based on risk result */}
                    <div className={`rounded-2xl border p-5 ${
                      submittedResult.riskCategory === "RED" 
                        ? "bg-red-50 border-red-200 text-red-900 animate-ring-pulse"
                        : submittedResult.riskCategory === "AMBER"
                        ? "bg-amber-50 border-amber-200 text-amber-900"
                        : "bg-emerald-50 border-emerald-200 text-emerald-900"
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {submittedResult.riskCategory === "RED" ? (
                          <AlertTriangle className="w-5 h-5 text-red-600 animate-bounce" />
                        ) : submittedResult.riskCategory === "AMBER" ? (
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        )}
                        <h4 className="font-bold text-sm tracking-wide uppercase">
                          Assessment Category: {submittedResult.riskCategory}
                        </h4>
                      </div>

                      {/* Display Patient Identifier info */}
                      <p className="text-xs mb-3 font-semibold">
                        Patient: {submittedResult.name} ({submittedResult.id})
                      </p>

                      <div className="text-xs leading-relaxed font-medium">
                        {submittedResult.reasonText}
                      </div>

                      {/* Core Safety Warnings Mandated */}
                      <div className="border-t border-current/20 mt-4 pt-3 text-[10px] opacity-90 leading-normal">
                        <strong>Clinical Warning:</strong> This applet provides administrative decision-support only. It does not replace professional clinical assessment or expert diagnosis. Never delay emergency procedures.
                      </div>
                    </div>

                    {/* Immediate Required Action box */}
                    <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-sm space-y-3">
                      <h5 className="font-semibold text-xs text-slate-800 uppercase tracking-wider">Required Safety Instructions</h5>
                      
                      {submittedResult.riskCategory === "RED" ? (
                        <div className="space-y-2.5">
                          <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5">
                            <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                            <p className="text-xs text-red-800 leading-normal">
                              <strong>Begin Emergency Transport:</strong> Arrange immediate travel (Keke, ambulance, or car) to Googwill Medical Centre.
                            </p>
                          </div>
                          
                          <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5">
                            <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                            <p className="text-xs text-red-800 leading-normal">
                              <strong>Alert the Hospital:</strong> Tap the button below to call <strong>08000057777</strong> now. Advise the triage nurse that a <strong>RED alert</strong> was transmitted.
                            </p>
                          </div>
                        </div>
                      ) : submittedResult.riskCategory === "AMBER" ? (
                        <div className="space-y-2.5">
                          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2.5">
                            <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                            <p className="text-xs text-amber-800 leading-normal">
                              <strong>Consult GMC:</strong> Contact the hospital line to review vitals and schedule a check.
                            </p>
                          </div>
                          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2.5">
                            <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                            <p className="text-xs text-amber-800 leading-normal">
                              <strong>Remeasure:</strong> Repeat checks in 2-4 hours if patient continues to feel unwell.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2.5">
                            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                            <p className="text-xs text-emerald-800 leading-normal">
                              <strong>Continue Care:</strong> Advise standard nutrition and keep regular antenatal visits at Googwill Medical Centre.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Immediate Action Buttons */}
                  <div className="space-y-2 mt-4">
                    <a
                      href="tel:08000057777"
                      onClick={(e) => {
                        e.preventDefault();
                        alert("Simulating call to Googwill Maternal Referral line (08000057777)... Call successful! Hospital notified of " + submittedResult.id);
                      }}
                      className="w-full py-3.5 bg-teal-accent text-white rounded-xl text-xs font-bold hover:bg-teal-800 transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <PhoneCall className="w-4 h-4 animate-bounce" />
                      <span>One-Tap Call GMC: 08000057777</span>
                    </a>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onOpenAssistant(submittedResult)}
                        className="py-2.5 bg-purple-50 text-brand-purple hover:bg-brand-purple hover:text-white rounded-xl text-xs font-semibold border border-purple-100 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Bot className="w-4 h-4" />
                        <span>Ask AI Assistant</span>
                      </button>

                      <button
                        onClick={() => setActiveTab("search")}
                        className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
                      >
                        Start New Patient
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 1. EDIT PATIENT INFORMATION MODAL */}
      <AnimatePresence>
        {editingPatient && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-brand-purple font-bold text-sm">
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Patient Information</span>
                </div>
                <button
                  onClick={() => setEditingPatient(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSavePatientEdit} className="space-y-3">
                {/* Name */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Mother's Name
                    </label>
                    <VoiceMicButton
                      label="Record Name"
                      onTranscript={(text) => setEditForm((prev) => ({ ...prev, name: text }))}
                    />
                  </div>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none rounded-lg px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>

                {/* Age & Parity */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Age (Years)
                      </label>
                      <VoiceMicButton
                        label="Record Age"
                        isNumeric={true}
                        onTranscript={(text) => setEditForm((prev) => ({ ...prev, age: text }))}
                      />
                    </div>
                    <input
                      type="number"
                      required
                      value={editForm.age}
                      onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none rounded-lg px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Births (Parity)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editForm.parity}
                      onChange={(e) => setEditForm({ ...editForm, parity: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none rounded-lg px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>

                {/* Mother Phone */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Mother's Phone Number
                    </label>
                    <VoiceMicButton
                      label="Record Phone"
                      isNumeric={true}
                      onTranscript={(text) => setEditForm((prev) => ({ ...prev, phone: text }))}
                    />
                  </div>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none rounded-lg px-3 py-1.5 text-xs text-slate-800"
                  />
                </div>

                {/* Next of Kin Name & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Next of Kin Name
                      </label>
                      <VoiceMicButton
                        label="Record Kin"
                        onTranscript={(text) => setEditForm((prev) => ({ ...prev, nextOfKinName: text }))}
                      />
                    </div>
                    <input
                      type="text"
                      value={editForm.nextOfKinName}
                      onChange={(e) => setEditForm({ ...editForm, nextOfKinName: e.target.value })}
                      placeholder="e.g. Emeka Obi"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none rounded-lg px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Next of Kin Phone
                      </label>
                      <VoiceMicButton
                        label="Record Kin Phone"
                        isNumeric={true}
                        onTranscript={(text) => setEditForm((prev) => ({ ...prev, nextOfKinPhone: text }))}
                      />
                    </div>
                    <input
                      type="tel"
                      value={editForm.nextOfKinPhone}
                      onChange={(e) => setEditForm({ ...editForm, nextOfKinPhone: e.target.value })}
                      placeholder="e.g. 08031234567"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none rounded-lg px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>

                {/* Address & Gestational Age */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Home Location
                    </label>
                    <input
                      type="text"
                      value={editForm.homeAddress}
                      onChange={(e) => setEditForm({ ...editForm, homeAddress: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none rounded-lg px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                      Pregnancy Stage
                    </label>
                    <input
                      type="text"
                      value={editForm.gestationalAge}
                      onChange={(e) => setEditForm({ ...editForm, gestationalAge: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple outline-none rounded-lg px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingPatient(null)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-brand-purple hover:bg-dark-purple text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. DATED VISIT HISTORY MODAL */}
      <AnimatePresence>
        {activeHistoryPatient && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-5 space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2 text-brand-purple font-bold text-sm">
                    <History className="w-4 h-4" />
                    <span>Dated Visit & Assessment History</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">
                    {activeHistoryPatient.name} • {activeHistoryPatient.homeAddress || activeHistoryPatient.community}
                  </p>
                </div>
                <button
                  onClick={() => setActiveHistoryPatient(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* History Timeline List */}
              <div className="space-y-3">
                {activeHistoryPatient.visitHistory && activeHistoryPatient.visitHistory.length > 0 ? (
                  activeHistoryPatient.visitHistory.map((visit: PatientVisitRecord, vIdx: number) => (
                    <div
                      key={visit.id || vIdx}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold bg-purple-100 text-brand-purple px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{visit.visitDate}</span>
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          visit.riskCategory === "RED"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : visit.riskCategory === "AMBER"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}>
                          Risk Level: {visit.riskCategory}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-slate-800">
                        {visit.symptomSummary}
                      </div>

                      {visit.customNote && (
                        <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-lg border border-slate-100">
                          "{visit.customNote}"
                        </p>
                      )}

                      {/* Vitals Summary Pills */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {visit.systolicBP && visit.diastolicBP ? (
                          <span className="text-[10px] bg-white border border-slate-200 font-medium text-slate-700 px-2 py-0.5 rounded">
                            BP: <strong>{visit.systolicBP}/{visit.diastolicBP} mmHg</strong>
                          </span>
                        ) : null}
                        {visit.pulse ? (
                          <span className="text-[10px] bg-white border border-slate-200 font-medium text-slate-700 px-2 py-0.5 rounded">
                            Pulse: <strong>{visit.pulse} bpm</strong>
                          </span>
                        ) : null}
                        {visit.temperature ? (
                          <span className="text-[10px] bg-white border border-slate-200 font-medium text-slate-700 px-2 py-0.5 rounded">
                            Temp: <strong>{visit.temperature}°C</strong>
                          </span>
                        ) : null}
                        {visit.respRate ? (
                          <span className="text-[10px] bg-white border border-slate-200 font-medium text-slate-700 px-2 py-0.5 rounded">
                            Resp: <strong>{visit.respRate}/min</strong>
                          </span>
                        ) : null}
                      </div>

                      <div className="text-[9px] text-slate-400 text-right pt-1 border-t border-slate-150">
                        Recorded by: {visit.recordedBy || "Local TBA"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-400 space-y-2">
                    <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs">No prior dated visits recorded for this mother yet.</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setActiveHistoryPatient(null)}
                  className="w-1/3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const pat = activeHistoryPatient;
                    setActiveHistoryPatient(null);
                    handleSelectPatient(pat);
                  }}
                  className="w-2/3 py-2 bg-brand-purple hover:bg-dark-purple text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Record New Visit for {activeHistoryPatient.name.split(" ")[0]}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
