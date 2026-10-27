import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, Baby, Calendar, AlertTriangle, Phone, ShieldAlert, 
  MapPin, Clock, Sparkles, Activity, CheckCircle2, MessageSquare, 
  Volume2, VolumeX, Mic, MicOff, Search, Compass, Users, 
  ChevronRight, ArrowRight, ArrowLeft, RefreshCw, Send, Plus, 
  Check, X, Pill, Stethoscope, Droplets, Sun, Moon, Info, 
  Share2, Radio, Bell, HelpCircle, Flame, Battery, Shield
} from "lucide-react";
import { Case } from "../types";
import { VoiceMicButton } from "./TBAPortal";
import EmergencyRescueMap from "./mother/EmergencyRescueMap";
import AICompanionGuidance from "./mother/AICompanionGuidance";
import VitalsTrackingEngine from "./mother/VitalsTrackingEngine";
import NigerianMothersCommunity from "./mother/NigerianMothersCommunity";
import LanguageSpeechHeader from "./LanguageSpeechHeader";
import SimplifiedMotherGuide from "./mother/SimplifiedMotherGuide";
import { AppLanguage, UI_TRANSLATIONS } from "../data/translations";

interface MotherPortalProps {
  currentUser?: { name: string; role: string; community?: string } | null;
  onCaseSubmitted?: (newCase: Case) => void;
  onEmergencyAlert?: (newCase: Partial<Case>) => void;
  onOpenAssistant?: (activeCase: Case | null) => void;
}

// Pregnancy Week Data (Weeks 4 to 40)
interface WeekInfo {
  week: number;
  sizeName: string;
  weightGrams: string;
  lengthCm: string;
  fetalDev: string;
  motherChanges: string;
  igboTip: string;
  keyCheck: string;
}

const PREGNANCY_WEEKS: WeekInfo[] = [
  {
    week: 8,
    sizeName: "Raspberry",
    weightGrams: "1g",
    lengthCm: "1.6 cm",
    fetalDev: "Baby's tiny facial features, fingers, and toes are forming. Heart beats around 150 bpm.",
    motherChanges: "Morning sickness, heightened sense of smell, fatigue.",
    igboTip: "Na-aṅụ mmiri mgbe niile ma rie nri dị mfe dịka ji ma ọ bụ osikapa ma ọ bụrụ na agbọ na-eche gị.",
    keyCheck: "Begin early booking at GMC or your local TBA for first antenatal scan."
  },
  {
    week: 12,
    sizeName: "Lime / Udara",
    weightGrams: "14g",
    lengthCm: "5.4 cm",
    fetalDev: "All essential organs and limbs are formed. Baby starts swallowing amniotic fluid.",
    motherChanges: "Nausea may begin to subside; uterus rises out of the pelvis.",
    igboTip: "Malite ịṅụ ọgwụ Folic Acid na Iron (ọgwụ ọbara) kwa ụbọchị iji mee ka nwa gị sie ike.",
    keyCheck: "First trimester ultrasound & routine screening for blood type, PCV & hepatitis."
  },
  {
    week: 16,
    sizeName: "Avocado / Ube Oyibo",
    weightGrams: "100g",
    lengthCm: "11.6 cm",
    fetalDev: "Baby can make sucking motions and may start rolling inside the womb.",
    motherChanges: "Pregnancy glow, increased appetite, and subtle baby flutter sensations (quickening).",
    igboTip: "Rie akwụkwọ nri (Ugu, Utazi) na azụ iji nwekwuo ọbara na nri zuru oke.",
    keyCheck: "Check blood pressure and urine at your monthly ANC visit."
  },
  {
    week: 20,
    sizeName: "Banana / Ogede",
    weightGrams: "300g",
    lengthCm: "25.6 cm",
    fetalDev: "Halfway milestone! Baby has developed vernix caseosa protective coating and hears sounds.",
    motherChanges: "Belly bump is prominent. Sleeping on your left side is recommended for optimal blood flow.",
    igboTip: "Nọdụ n'akụkụ aka ekpe mgbe ị na-ehi ụra ka ọbara wee na-erute nwa gị nke ọma.",
    keyCheck: "Mid-pregnancy anomaly ultrasound scan & second tetanus toxoid vaccination."
  },
  {
    week: 24,
    sizeName: "Corn / Ọka",
    weightGrams: "600g",
    lengthCm: "30.0 cm",
    fetalDev: "Baby's taste buds and inner ear balance are working. Lungs begin producing surfactant.",
    motherChanges: "Mild lower back ache and occasional Braxton Hicks mock contractions.",
    igboTip: "Gbaara mbọ na-eyi akpụkpọ ụkwụ dị larịị ma zere ibu ibu dị arọ.",
    keyCheck: "Screening for gestational diabetes and checking for swelling in legs/feet."
  },
  {
    week: 28,
    sizeName: "Eggplant / Anara",
    weightGrams: "1,000g",
    lengthCm: "37.6 cm",
    fetalDev: "Baby's eyes can open and close. Rapid brain and muscle development.",
    motherChanges: "Third trimester begins! Shortness of breath when climbing stairs.",
    igboTip: "Malite ịgụ ọgụ ka nwa gị si agba n'afọ (Kick Counting) kwa ụbọchị.",
    keyCheck: "Receive Malaria prevention tablets (IPTp with Fansidar) if eligible."
  },
  {
    week: 32,
    sizeName: "Coconut / Aki Oyibo",
    weightGrams: "1,700g",
    lengthCm: "42.4 cm",
    fetalDev: "Baby practices breathing movements and stores vital minerals like calcium and iron.",
    motherChanges: "Frequent urination as the baby presses gently against the bladder.",
    igboTip: "Kwadebe akpa ọmụmụ gị (delivery bag) nwere akwa ọcha, disinfectant na uwe nwa.",
    keyCheck: "Bi-weekly antenatal checkups. Monitor fetal heart rate and presentation."
  },
  {
    week: 36,
    sizeName: "Papaya / Pawpaw",
    weightGrams: "2,600g",
    lengthCm: "47.4 cm",
    fetalDev: "Baby is turning head-down into the pelvis (cephalic presentation) ready for birth.",
    motherChanges: "Pelvic pressure, lightening sensation (easier breathing as baby drops).",
    igboTip: "Kpọtụrụ dọkịta GMC ma ọ bụ TBA gị ozugbo ma ọ bụrụ na ọbara ma ọ bụ mmiri apụta.",
    keyCheck: "Weekly clinic visits. Confirm emergency transport arrangement and hospital contacts."
  },
  {
    week: 40,
    sizeName: "Watermelon / Pumpkin",
    weightGrams: "3,400g",
    lengthCm: "51.2 cm",
    fetalDev: "Full term champion! Baby's organs and reflex systems are fully matured.",
    motherChanges: "True labor contractions (rhythmic, tightening every 5 minutes, lasting 60 seconds).",
    igboTip: "Nọrọ nso n'ụlọ ọgwụ GMC. Ejila obi abụọ mgbe ọrụ ime malitere.",
    keyCheck: "Active labor admission and safe midwife-supervised clinical birth."
  }
];

export default function MotherPortal({ 
  currentUser, 
  onCaseSubmitted, 
  onEmergencyAlert, 
  onOpenAssistant 
}: MotherPortalProps) {
  // Global Language Selection (Igbo by default for local mothers, with Pidgin and English options)
  const [language, setLanguage] = useState<AppLanguage>("igbo");

  // Top-Level Active Navigation Tab - Defaulting to Simplified Visual & Voice Guide
  const [activeTab, setActiveTab] = useState<"guide" | "journey" | "rescue" | "ai" | "tracking" | "community">("guide");

  // 3 Primary Life Stage Modes (MamaAlert Signature Tri-Mode)
  const [activeStage, setActiveStage] = useState<"pregnancy" | "menstrual" | "postpartum">("pregnancy");

  // Pregnancy Stage Details
  const [selectedWeek, setSelectedWeek] = useState<number>(36);
  const currentWeekData = PREGNANCY_WEEKS.find((w) => w.week === selectedWeek) || PREGNANCY_WEEKS[7];

  // Emergency SOS & USSD State
  const [sosActive, setSosActive] = useState(false);
  const [sosCountdown, setSosCountdown] = useState<number | null>(null);
  const [sosDispatched, setSosDispatched] = useState(false);
  const [showUssdModal, setShowUssdModal] = useState(false);
  const [ussdStep, setUssdStep] = useState<number>(1);
  const [ussdInput, setUssdInput] = useState("");
  const [ussdLogs, setUssdLogs] = useState<string[]>([]);

  // Daily Danger Signs Self-Check
  const [dangerChecks, setDangerChecks] = useState({
    bleeding: false,
    severeHeadache: false,
    blurredVision: false,
    waterBroke: false,
    severeStomachPain: false,
    swollenFaceHands: false,
    babyNotMoving: false,
    highFever: false
  });

  // Menstrual & Fertility Mode State
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [flowIntensity, setFlowIntensity] = useState<"Light" | "Medium" | "Heavy" | "Spotting">("Medium");
  const [pmsSymptoms, setPmsSymptoms] = useState<string[]>(["Mild Cramps", "Tender Breasts"]);

  // Postpartum & Mental Health (EPDS Screener & Baby Tracker)
  const [epdsScore, setEpdsScore] = useState<number | null>(null);
  const [epdsAnswers, setEpdsAnswers] = useState<number[]>([0, 0, 0, 0, 0]);
  const [showEpdsModal, setShowEpdsModal] = useState(false);
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breathCountdown, setBreathCountdown] = useState(4);

  // Baby Feeding & Diaper Logs
  const [feedingLogs, setFeedingLogs] = useState([
    { type: "Breastfeeding (Right)", duration: "18 mins", time: "06:30 AM" },
    { type: "Breastfeeding (Left)", duration: "20 mins", time: "09:15 AM" }
  ]);
  const [diaperCount, setDiaperCount] = useState({ wet: 4, soiled: 2 });
  const [babyAgeWeeks, setBabyAgeWeeks] = useState(6);

  // Medication & Clinic Reminders
  const [medications, setMedications] = useState([
    { id: "m1", name: "Folic Acid (5mg)", time: "08:00 AM", taken: true, purpose: "Spinal cord development" },
    { id: "m2", name: "Ferrous Sulfate (Iron)", time: "01:00 PM", taken: false, purpose: "Prevents maternal anemia" },
    { id: "m3", name: "Calcium Supplement", time: "08:00 PM", taken: false, purpose: "Bone strength" }
  ]);

  // Breathing Guide Loop
  useEffect(() => {
    let timer: any = null;
    if (breathingActive) {
      timer = setInterval(() => {
        setBreathCountdown((prev) => {
          if (prev <= 1) {
            setBreathPhase((current) => {
              if (current === "Inhale") return "Hold";
              if (current === "Hold") return "Exhale";
              return "Inhale";
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [breathingActive]);

  // Emergency SOS Trigger
  const handleTriggerSos = () => {
    setSosActive(true);
    setSosCountdown(3);
  };

  useEffect(() => {
    let countdownInterval: any = null;
    if (sosCountdown !== null && sosCountdown > 0) {
      countdownInterval = setInterval(() => {
        setSosCountdown((prev) => (prev !== null && prev > 1 ? prev - 1 : 0));
      }, 1000);
    } else if (sosCountdown === 0) {
      // Dispatch SOS to backend & GMC Hospital Board
      setSosCountdown(null);
      setSosDispatched(true);

      const emergencyCase: Partial<Case> = {
        id: `ASM-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        name: currentUser?.name || "Mother (Emergency SOS)",
        age: 26,
        community: "Umuchigbo (GPS: 6.4524° N, 7.5105° E)",
        gestationalAge: `${selectedWeek} weeks pregnant`,
        parity: 1,
        phone: "08051234567",
        nextOfKin: "Emeka Obi (Husband, 08034567812)",
        nextOfKinPhone: "08034567812",
        bleeding: dangerChecks.bleeding ? "severe" : "none",
        severePain: dangerChecks.severeStomachPain,
        severeHeadache: dangerChecks.severeHeadache,
        visualDisturbance: dangerChecks.blurredVision,
        swellingFeet: dangerChecks.swollenFaceHands,
        highFever: dangerChecks.highFever,
        convulsions: false,
        breathingDifficulty: false,
        lossOfConsciousness: false,
        reducedFetalMovement: dangerChecks.babyNotMoving,
        laborProgressConcerns: dangerChecks.waterBroke,
        customNote: "MAMAALERT CRITICAL 1-TAP EMERGENCY SOS TRIGGERED BY MOTHER. Immediate dispatch needed to Umuchigbo.",
        systolicBP: 145,
        diastolicBP: 95,
        pulse: 105,
        temperature: 37.8,
        respRate: 22,
        riskCategory: "RED",
        riskScore: 9,
        reasonCodes: ["MAMAALERT_SOS_DISPATCH", "CRITICAL_OBSTETRIC_ALERT"],
        reasonText: "Critical MamaAlert Emergency SOS Beacon triggered. High risk of obstetric emergency.",
        requiredAction: "IMMEDIATE AMBULANCE DISPATCH & EMERGENCY OBSTETRIC TRIAGE PREPARATION AT GMC.",
        dataQuality: "COMPLETE",
        rulesVersion: "2026.3-MAMAALERT",
        status: "New",
        triageCategory: "RED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tbaName: "MamaAlert Direct Beacon",
        tbaPhone: "0800-MAMAALERT",
        checklist: [
          { id: "1", label: "Prepare GMC Emergency Resuscitation Bay", checked: true },
          { id: "2", label: "Dispatch Umuchigbo Emergency Transport Keke/Ambulance", checked: true },
          { id: "3", label: "Notify On-Call Obstetric Specialist & Blood Bank", checked: true }
        ],
        notes: [
          {
            author: "MamaAlert Automated Dispatcher",
            text: "Emergency SOS beacon triggered. Live GPS coordinates broadcast to GMC Command Board.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]
      };

      if (onEmergencyAlert) {
        onEmergencyAlert(emergencyCase);
      }
      if (onCaseSubmitted) {
        onCaseSubmitted(emergencyCase as Case);
      }

      // Also POST to backend API
      fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emergencyCase)
      }).catch((e) => console.log("API SOS broadcast:", e));
    }

    return () => clearInterval(countdownInterval);
  }, [sosCountdown]);

  const handleCancelSos = () => {
    setSosActive(false);
    setSosCountdown(null);
  };

  // USSD Simulator Logic
  const handleUssdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = ussdInput.trim();
    if (!val) return;

    setUssdLogs((prev) => [...prev, `> User entered: ${val}`]);
    setUssdInput("");

    if (val === "*384*99#" || val === "*554#") {
      setUssdStep(2);
      setUssdLogs((prev) => [
        ...prev,
        "--- MAMAALERT OFFLINE GSM SERVICE ---",
        "1. Emergency Ambulance Dispatch (GMC)",
        "2. Check Danger Warning Signs",
        "3. Book TBA Home Visit",
        "4. Blood Pressure Help & Tips",
        "Reply with 1, 2, 3, or 4:"
      ]);
    } else if (ussdStep === 2 && val === "1") {
      setUssdStep(3);
      setUssdLogs((prev) => [
        ...prev,
        "[EMERGENCY SOS CONFIRMED]",
        "Location: Umuchigbo Village Area",
        "GMC Ambulance Alert has been dispatched via GSM SMS!",
        "Emergency Hotline calling you back in 60 seconds: 08034567890",
        "Press 0 to exit."
      ]);
      handleTriggerSos();
    } else if (ussdStep === 2 && val === "2") {
      setUssdStep(3);
      setUssdLogs((prev) => [
        ...prev,
        "[MATERNAL DANGER SIGNS]:",
        "- Vaginal Bleeding",
        "- Severe Headache / Vision Blur",
        "- Convulsions / Fits",
        "- High Fever",
        "If you have any of these, GO TO GMC HOSPITAL NOW!",
        "Press 0 to exit."
      ]);
    } else {
      setUssdStep(1);
      setUssdLogs((prev) => [...prev, "Session ended. Thank you for using MamaAlert USSD."]);
    }
  };

  const activeDangerCount = Object.values(dangerChecks).filter(Boolean).length;

  return (
    <div className="space-y-6 pb-12">
      
      {/* GLOBAL LOCAL LANGUAGE & SPOKEN VOICE AUDIO BAR */}
      <LanguageSpeechHeader
        currentLanguage={language}
        onLanguageChange={setLanguage}
        screenContext="mother"
      />

      {/* 1. MAMAALERT BRAND HERO BANNER */}
      <div className="bg-gradient-to-br from-[#32134F] via-[#4A1D6D] to-[#1F0833] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-pink-300" />
              <span>MamaAlert Powered • Googwill Medical Centre Lifeline</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <span>{language === "igbo" ? `Nnọọ, ${currentUser?.name || "Nne Anyị"}` : language === "pidgin" ? `Welcome, ${currentUser?.name || "Mama"}` : `Welcome, ${currentUser?.name || "Mother"}`}</span>
              <Heart className="w-6 h-6 text-pink-400 fill-pink-400 inline" />
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 max-w-xl leading-relaxed">
              {language === "igbo" 
                ? "Nlekọta ahụ ike dị mfe n'asụsụ Igbo, enyemaka mberede ngwa ngwa, na mkparịta ụka dọkịta GMC maka nne na nwa."
                : language === "pidgin"
                ? "Easy maternal health guidance for Pidgin, 1-tap emergency rescue, and direct GMC hospital care for every mother."
                : "AI health guidance, 1-tap emergency rescue, maternal vitals tracking, and a Nigerian sisterhood community that truly understands."}
            </p>
          </div>

          {/* Persistent Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-center">
            {/* Big 1-Tap SOS Button */}
            <button
              onClick={handleTriggerSos}
              className="px-5 py-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl hover:shadow-red-500/30 flex items-center justify-center gap-2 border border-red-400/40 transition-all cursor-pointer active:scale-95 animate-pulse"
            >
              <ShieldAlert className="w-5 h-5 text-white" />
              <span>1-TAP EMERGENCY SOS</span>
            </button>

            {/* Offline USSD Dialer */}
            <button
              onClick={() => {
                setShowUssdModal(true);
                setUssdLogs(["Dialing *384*99# on GSM SIM network..."]);
                setUssdStep(1);
              }}
              className="px-3.5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl border border-white/15 backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer"
              title="Works without internet via standard mobile USSD code"
            >
              <Radio className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Offline USSD (*384*99#)</span>
              <span className="sm:hidden">USSD</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. TOP-LEVEL PILLAR NAVIGATION BAR */}
      <div className="bg-white rounded-3xl border border-slate-200 p-2 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          
          {/* PRIMARY EASY VOICE & VISUAL GUIDE TAB */}
          <button
            onClick={() => setActiveTab("guide")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "guide"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md scale-102"
                : "text-orange-950 bg-amber-50 hover:bg-amber-100 border border-amber-200/60"
            }`}
          >
            <Sparkles className={`w-4 h-4 ${activeTab === "guide" ? "text-white" : "text-amber-600 animate-spin"}`} />
            <span>{language === "igbo" ? "Ntuziaka dị Mfe (Easy Voice Guide)" : language === "pidgin" ? "Easy Voice Guide (Hear am)" : "Easy Voice & Visual Guide"}</span>
          </button>

          <button
            onClick={() => setActiveTab("journey")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "journey"
                ? "bg-brand-purple text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Heart className={`w-4 h-4 ${activeTab === "journey" ? "fill-pink-400 text-pink-300" : "text-pink-500"}`} />
            <span>{language === "igbo" ? "Ogo Ime & Nwa (Journey)" : language === "pidgin" ? "Pregnancy Journey" : "My Journey & Stages"}</span>
          </button>

          <button
            onClick={() => setActiveTab("rescue")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "rescue"
                ? "bg-red-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ShieldAlert className={`w-4 h-4 ${activeTab === "rescue" ? "text-white" : "text-red-600"}`} />
            <span>{language === "igbo" ? "Enyemaka Mberede (Emergency)" : language === "pidgin" ? "Emergency Map" : "Emergency Rescue & Map"}</span>
          </button>

          <button
            onClick={() => setActiveTab("ai")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "ai"
                ? "bg-purple-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Sparkles className={`w-4 h-4 ${activeTab === "ai" ? "text-pink-300" : "text-brand-purple"}`} />
            <span>{language === "igbo" ? "Ajụjụ Dọkịta AI" : language === "pidgin" ? "AI Doctor Guide" : "AI Guide & Symptom Check"}</span>
          </button>

          <button
            onClick={() => setActiveTab("tracking")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "tracking"
                ? "bg-teal-700 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Activity className={`w-4 h-4 ${activeTab === "tracking" ? "text-white" : "text-teal-600"}`} />
            <span>{language === "igbo" ? "Mgbali Ọbara & Vitals" : language === "pidgin" ? "Vitals & BP" : "Vitals & Tracking"}</span>
          </button>

          <button
            onClick={() => setActiveTab("community")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "community"
                ? "bg-pink-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Users className={`w-4 h-4 ${activeTab === "community" ? "text-white" : "text-pink-600"}`} />
            <span>{language === "igbo" ? "Ogbe Nne na Nwa" : language === "pidgin" ? "Mothers Community" : "Nigerian Mothers Community"}</span>
          </button>

        </div>
      </div>

      {/* 3. SOS ACTIVE COUNTDOWN / DISPATCH MODAL */}
      <AnimatePresence>
        {sosActive && (
          <div className="fixed inset-0 z-50 bg-red-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-6 shadow-2xl border-4 border-red-500"
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600 animate-bounce">
                <ShieldAlert className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-red-600">
                  {sosCountdown !== null && sosCountdown > 0
                    ? `DISPATCHING IN ${sosCountdown}...`
                    : "EMERGENCY SOS BROADCASTED!"}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {sosCountdown !== null && sosCountdown > 0
                    ? "Tap cancel if pressed accidentally. Alerting Googwill Medical Centre Triage and Ambulance Team in Umuchigbo."
                    : "Emergency coordinates transmitted to GMC Command Board. An ambulance and on-call midwife are being dispatched to your location!"}
                </p>
              </div>

              {sosDispatched && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-left space-y-2 text-xs">
                  <div className="flex items-center justify-between text-red-800 font-bold">
                    <span>GPS Coordinates:</span>
                    <span>6.4524° N, 7.5105° E</span>
                  </div>
                  <div className="flex items-center justify-between text-red-800 font-bold">
                    <span>Hospital Hotline:</span>
                    <span>08034567890</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-800 font-bold">
                    <span>Status:</span>
                    <span className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" /> GMC Triage Alerted
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                {sosCountdown !== null && sosCountdown > 0 ? (
                  <button
                    onClick={handleCancelSos}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel Alert (Accidental Tap)
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setSosActive(false)}
                      className="w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Close Window
                    </button>
                    <a
                      href="tel:08034567890"
                      className="w-1/2 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-md"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call GMC Directly</span>
                    </a>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. OFFLINE USSD MODAL */}
      <AnimatePresence>
        {showUssdModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 text-emerald-400 font-mono rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-emerald-500/30"
            >
              <div className="flex items-center justify-between border-b border-emerald-900/60 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span>MamaAlert GSM USSD Service (*384*99#)</span>
                </div>
                <button
                  onClick={() => setShowUssdModal(false)}
                  className="text-slate-400 hover:text-white text-xs p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* USSD Console Screen */}
              <div className="bg-black/60 border border-emerald-950 p-4 rounded-xl min-h-[160px] text-xs space-y-1.5 max-h-56 overflow-y-auto">
                {ussdLogs.map((log, i) => (
                  <p key={i} className="leading-relaxed">{log}</p>
                ))}
              </div>

              <form onSubmit={handleUssdSubmit} className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Enter 1, 2, 3 or *384*99#"
                  value={ussdInput}
                  onChange={(e) => setUssdInput(e.target.value)}
                  className="flex-1 bg-black/80 border border-emerald-700 text-emerald-300 font-mono text-xs px-3 py-2 rounded-xl outline-none focus:ring-1 focus:ring-emerald-400"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Send
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. TAB 0: EASY VOICE & VISUAL GUIDE (PRIMARY SCREEN FOR UNLEARNED/LOCAL MOTHERS) */}
      {activeTab === "guide" && (
        <SimplifiedMotherGuide
          language={language}
          onLanguageChange={setLanguage}
          onTriggerSos={handleTriggerSos}
          onSelectDangerSign={(signId, val) => {
            setDangerChecks((prev: any) => ({ ...prev, [signId]: val }));
          }}
        />
      )}

      {/* 5. TAB 1: MY MATERNAL JOURNEY (TRI-MODE OVERVIEW) */}
      {activeTab === "journey" && (
        <div className="space-y-6">
          
          {/* Tri-Mode Stage Switcher */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Select Your Current Maternal Stage
              </h3>
              <p className="text-xs text-slate-500">
                Personalizes your symptom tracking, milestone calculator, and medical reminders.
              </p>
            </div>

            <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 shrink-0">
              <button
                onClick={() => setActiveStage("menstrual")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeStage === "menstrual"
                    ? "bg-pink-500 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>Menstrual / Ovulation</span>
              </button>

              <button
                onClick={() => setActiveStage("pregnancy")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeStage === "pregnancy"
                    ? "bg-brand-purple text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
                <span>Pregnancy Tracker</span>
              </button>

              <button
                onClick={() => setActiveStage("postpartum")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeStage === "postpartum"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Baby className="w-3.5 h-3.5" />
                <span>Postpartum & Baby</span>
              </button>
            </div>
          </div>

          {/* PREGNANCY STAGE CONTENT */}
          {activeStage === "pregnancy" && (
            <div className="space-y-6">
              
              {/* Week By Week Fetal Milestone Visualizer */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-brand-purple bg-purple-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Week-By-Week Maternal Journey
                    </span>
                    <h2 className="text-xl font-bold text-slate-800 mt-1">
                      Week {selectedWeek}: Your Baby is the Size of a {currentWeekData.sizeName}
                    </h2>
                  </div>

                  {/* Week Selector Dropdown / Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                    {PREGNANCY_WEEKS.map((w) => (
                      <button
                        key={w.week}
                        onClick={() => setSelectedWeek(w.week)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                          selectedWeek === w.week
                            ? "bg-brand-purple text-white shadow-sm"
                            : "bg-slate-100 hover:bg-purple-50 text-slate-600"
                        }`}
                      >
                        Wk {w.week}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fetal Card Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-b from-purple-50 to-pink-50/50 rounded-2xl p-6 border border-purple-100 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-18 h-18 rounded-3xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
                      <Baby className="w-10 h-10 text-brand-purple" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-base">{currentWeekData.sizeName}</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Approx: {currentWeekData.lengthCm} • {currentWeekData.weightGrams}
                      </p>
                    </div>
                    <div className="bg-white/80 px-3 py-1.5 rounded-xl border border-purple-100 text-[11px] font-semibold text-brand-purple">
                      {40 - selectedWeek > 0 ? `${40 - selectedWeek} weeks to estimated due date` : "Full Term! Ready for Delivery"}
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-brand-purple">
                        <Baby className="w-4 h-4" />
                        <span>Baby's Development This Week</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{currentWeekData.fetalDev}</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-pink-600">
                        <Heart className="w-4 h-4" />
                        <span>Changes in Your Body (Mother's Symptoms)</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{currentWeekData.motherChanges}</p>
                    </div>

                    <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200/60 flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-brand-purple uppercase tracking-wider">Igbo Maternal Wisdom & Tip</span>
                        <p className="text-xs text-slate-800 font-medium italic">"{currentWeekData.igboTip}"</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medication & Antenatal Reminders */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Prenatal Medication & Vitamins</h3>
                      <p className="text-[10px] text-slate-500">Daily routine recommended by GMC clinical team</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                    Daily Checklist
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {medications.map((med) => (
                    <div
                      key={med.id}
                      onClick={() => {
                        setMedications((prev) =>
                          prev.map((m) => (m.id === med.id ? { ...m, taken: !m.taken } : m))
                        );
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        med.taken
                          ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                          : "bg-slate-50 hover:bg-purple-50/50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${med.taken ? "line-through text-slate-400" : "text-slate-800"}`}>
                            {med.name}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">{med.purpose}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        med.taken ? "bg-emerald-600 text-white" : "border border-slate-300"
                      }`}>
                        {med.taken && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* MENSTRUAL STAGE CONTENT */}
          {activeStage === "menstrual" && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Menstrual & Ovulation Tracker
                  </span>
                  <h2 className="text-xl font-bold text-slate-800 mt-1 flex items-center gap-2">
                    <span>Cycle Day 14: Estimated Fertile Window Active</span>
                    <Sparkles className="w-5 h-5 text-pink-500 inline" />
                  </h2>
                  <p className="text-xs text-slate-500">
                    Track your monthly cycle, predict ovulation, log flow intensity, and receive fertility tips.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-pink-50 px-3 py-2 rounded-2xl border border-pink-100 text-center">
                    <div className="text-base font-bold text-pink-600">{cycleLength} Days</div>
                    <div className="text-[10px] text-slate-500">Avg Cycle</div>
                  </div>
                  <div className="bg-purple-50 px-3 py-2 rounded-2xl border border-purple-100 text-center">
                    <div className="text-base font-bold text-brand-purple">{periodLength} Days</div>
                    <div className="text-[10px] text-slate-500">Period Length</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="bg-gradient-to-br from-pink-50 via-rose-50/50 to-white rounded-2xl p-6 border border-pink-100 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-24 h-24 rounded-full border-4 border-pink-400 border-t-pink-200 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-pink-600">Day 14</span>
                    <span className="text-[9px] font-semibold text-slate-500 uppercase">Ovulation</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">Peak Fertility Window</h4>
                    <p className="text-[11px] text-slate-500">Next expected period: Sept 15, 2026</p>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">Today's Flow Intensity</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(["Spotting", "Light", "Medium", "Heavy"] as const).map((flow) => (
                        <button
                          key={flow}
                          onClick={() => setFlowIntensity(flow)}
                          className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            flowIntensity === flow
                              ? "bg-pink-500 text-white shadow-sm"
                              : "bg-white border border-slate-200 text-slate-700 hover:bg-pink-50"
                          }`}
                        >
                          {flow}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                    <label className="text-xs font-bold text-slate-800 block">Symptoms & Mood Today</label>
                    <div className="flex flex-wrap gap-2">
                      {["Mild Cramps", "Headache", "Tender Breasts", "High Energy", "Fatigue", "Acne", "Backache", "Bloating"].map((sym) => {
                        const hasSym = pmsSymptoms.includes(sym);
                        return (
                          <button
                            key={sym}
                            onClick={() => {
                              setPmsSymptoms((prev) =>
                                hasSym ? prev.filter((s) => s !== sym) : [...prev, sym]
                              );
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                              hasSym
                                ? "bg-brand-purple text-white shadow-xs"
                                : "bg-white border border-slate-200 text-slate-700 hover:bg-purple-50"
                            }`}
                          >
                            {sym}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* POSTPARTUM STAGE CONTENT */}
          {activeStage === "postpartum" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Postpartum & Newborn Recovery (0-12 Months)
                    </span>
                    <h2 className="text-xl font-bold text-slate-800 mt-1">
                      Baby is {babyAgeWeeks} Weeks Old • 4th Trimester Care
                    </h2>
                    <p className="text-xs text-slate-500">
                      Track physical healing, infant feeding, diaper output, maternal mental health, and immunizations.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowEpdsModal(true)}
                    className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                  >
                    <Heart className="w-4 h-4 text-pink-200" />
                    <span>Maternal Mental Health Check</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Feeding Tracker */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                        <Baby className="w-4 h-4 text-teal-600" />
                        <span>Feeding Tracker</span>
                      </h4>
                      <span className="text-[10px] text-teal-700 font-bold bg-teal-100 px-2 py-0.5 rounded-full">
                        Exclusive Breastfeeding
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      {feedingLogs.map((log, idx) => (
                        <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                          <span className="font-medium text-slate-700">{log.type}</span>
                          <span className="text-[11px] text-slate-500">{log.time} ({log.duration})</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        const newFeed = {
                          type: "Breastfeeding (Both sides)",
                          duration: "15 mins",
                          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        };
                        setFeedingLogs((prev) => [newFeed, ...prev]);
                      }}
                      className="w-full py-2 bg-white hover:bg-slate-100 text-brand-purple font-semibold text-xs rounded-xl border border-purple-200 transition-colors cursor-pointer"
                    >
                      + Log New Feed
                    </button>
                  </div>

                  {/* Diaper Tracker */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-slate-700" />
                        <span>Diaper Output Today</span>
                      </h4>
                      <span className="text-[10px] text-slate-500">Target: 6+ wet</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-xl border border-slate-100 text-center space-y-1">
                        <div className="text-xl font-black text-teal-600">{diaperCount.wet}</div>
                        <div className="text-[10px] font-semibold text-slate-500 uppercase">Wet Diapers</div>
                        <button
                          onClick={() => setDiaperCount((p) => ({ ...p, wet: p.wet + 1 }))}
                          className="text-[10px] bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded cursor-pointer"
                        >
                          + Add Wet
                        </button>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100 text-center space-y-1">
                        <div className="text-xl font-black text-amber-600">{diaperCount.soiled}</div>
                        <div className="text-[10px] font-semibold text-slate-500 uppercase">Soiled Diapers</div>
                        <button
                          onClick={() => setDiaperCount((p) => ({ ...p, soiled: p.soiled + 1 }))}
                          className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded cursor-pointer"
                        >
                          + Add Soiled
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Immunization Calendar */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                        <Stethoscope className="w-4 h-4 text-emerald-600" />
                        <span>Baby Vaccines (6 Weeks)</span>
                      </h4>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                        GMC Clinic
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="bg-white p-2 rounded-xl border border-slate-100 flex items-center justify-between">
                        <span className="text-slate-700">BCG & OPV-0 (Birth)</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Completed</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-100 flex items-center justify-between">
                        <span className="text-slate-700">Penta-1, OPV-1, Rota-1</span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">Due this week</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guided 4-4-4 Breathing Exercise */}
              <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 max-w-lg">
                  <span className="text-[10px] font-bold bg-teal-400/20 text-teal-300 px-3 py-1 rounded-full uppercase tracking-wider">
                    Mama Calm & Mind Support
                  </span>
                  <h3 className="text-xl font-bold">Guided 4-4-4 Diaphragmatic Breath</h3>
                  <p className="text-xs text-teal-100/80 leading-relaxed">
                    Postpartum recovery can be overwhelming. Take 60 seconds with our rhythmic breathing circle to lower maternal cortisol and steady your heartbeat.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center space-y-3 shrink-0">
                  <div className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-700 ${
                    breathingActive
                      ? breathPhase === "Inhale"
                        ? "border-teal-400 scale-110 bg-teal-500/20"
                        : breathPhase === "Hold"
                        ? "border-amber-400 scale-105 bg-amber-500/20"
                        : "border-emerald-400 scale-95 bg-emerald-500/20"
                      : "border-teal-500/40 bg-teal-500/10"
                  }`}>
                    <span className="text-xs font-bold tracking-wider uppercase">{breathingActive ? breathPhase : "REST"}</span>
                    <span className="text-2xl font-black">{breathingActive ? breathCountdown : "4-4-4"}</span>
                  </div>
                  <button
                    onClick={() => setBreathingActive(!breathingActive)}
                    className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    {breathingActive ? "Stop Breathing Loop" : "Start Guided Breath"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 6. TAB 2: EMERGENCY RESCUE & MAP */}
      {activeTab === "rescue" && (
        <EmergencyRescueMap
          currentUser={currentUser}
          onTriggerSos={handleTriggerSos}
          selectedWeek={selectedWeek}
        />
      )}

      {/* 7. TAB 3: AI COMPANION & SYMPTOM GUIDANCE */}
      {activeTab === "ai" && (
        <AICompanionGuidance
          currentUser={currentUser}
          selectedWeek={selectedWeek}
          activeStage={activeStage}
          onEmergencyAlert={handleTriggerSos}
        />
      )}

      {/* 8. TAB 4: VITALS & TRACKING ENGINE */}
      {activeTab === "tracking" && (
        <VitalsTrackingEngine
          selectedWeek={selectedWeek}
          onSelectWeek={setSelectedWeek}
          onEmergencyAlert={handleTriggerSos}
        />
      )}

      {/* 9. TAB 5: NIGERIAN MOTHERS COMMUNITY */}
      {activeTab === "community" && (
        <NigerianMothersCommunity
          currentUser={currentUser}
        />
      )}

      {/* EPDS Screener Modal */}
      <AnimatePresence>
        {showEpdsModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-teal-700 font-bold text-base">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <span>Edinburgh Postnatal Depression Check (EPDS)</span>
                </div>
                <button onClick={() => setShowEpdsModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Motherhood is beautiful, but hormonal and sleep changes can bring postpartum depression or anxiety. Answer how you have felt in the past 7 days:
              </p>

              <div className="space-y-4">
                {[
                  "I have been able to laugh and see the funny side of things.",
                  "I have blamed myself unnecessarily when things went wrong.",
                  "I have felt scared or panicky for no very good reason.",
                  "I have been so unhappy that I have had difficulty sleeping.",
                  "Things have been getting on top of me (overwhelmed)."
                ].map((q, qIdx) => (
                  <div key={qIdx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                    <p className="text-xs font-semibold text-slate-800">{qIdx + 1}. {q}</p>
                    <div className="grid grid-cols-4 gap-1.5 text-[10px] font-bold">
                      {["Never (0)", "Hardly (1)", "Sometimes (2)", "Most times (3)"].map((opt, score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => {
                            const newAnswers = [...epdsAnswers];
                            newAnswers[qIdx] = score;
                            setEpdsAnswers(newAnswers);
                          }}
                          className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer ${
                            epdsAnswers[qIdx] === score
                              ? "bg-teal-600 text-white shadow-xs"
                              : "bg-white border border-slate-200 text-slate-700 hover:bg-teal-50"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs font-bold text-slate-700">
                  Total Score: <span className="text-teal-700 text-base">{epdsAnswers.reduce((a, b) => a + b, 0)} / 15</span>
                </div>
                <button
                  onClick={() => {
                    const total = epdsAnswers.reduce((a, b) => a + b, 0);
                    setEpdsScore(total);
                    setShowEpdsModal(false);
                  }}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                >
                  Save & Complete Check
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
