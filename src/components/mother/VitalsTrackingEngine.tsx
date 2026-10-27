import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, Heart, Baby, Droplets, Moon, Sun, Plus, 
  Trash2, AlertTriangle, CheckCircle2, ShieldAlert, 
  Clock, Flame, Sparkles, TrendingUp, RefreshCw, Calendar,
  Footprints, Timer, Utensils, Smile, Meh, Frown, AlertCircle, Check
} from "lucide-react";

interface BloodPressureLog {
  id: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  timestamp: string;
  category: "Normal" | "Elevated" | "Pre-eclampsia Alert" | "Severe Crisis";
  notes?: string;
}

interface VitalsTrackingEngineProps {
  selectedWeek: number;
  onSelectWeek: (week: number) => void;
  onEmergencyAlert?: () => void;
}

export default function VitalsTrackingEngine({
  selectedWeek,
  onSelectWeek,
  onEmergencyAlert
}: VitalsTrackingEngineProps) {
  // Blood Pressure & Pulse State
  const [bpLogs, setBpLogs] = useState<BloodPressureLog[]>([
    {
      id: "bp-1",
      systolic: 118,
      diastolic: 76,
      pulse: 78,
      timestamp: "Today, 08:30 AM",
      category: "Normal",
      notes: "Morning resting check"
    },
    {
      id: "bp-2",
      systolic: 124,
      diastolic: 82,
      pulse: 84,
      timestamp: "Yesterday, 07:15 PM",
      category: "Elevated",
      notes: "After cooking dinner"
    }
  ]);

  const [inputSystolic, setInputSystolic] = useState<number>(118);
  const [inputDiastolic, setInputDiastolic] = useState<number>(76);
  const [inputPulse, setInputPulse] = useState<number>(80);
  const [bpNote, setBpNote] = useState<string>("");

  // Fetal Kick Counter State
  const [kicks, setKicks] = useState<number>(0);
  const [kickTimerSeconds, setKickTimerSeconds] = useState<number>(7200); // 2 hours
  const [kickTimerRunning, setKickTimerRunning] = useState<boolean>(false);
  const [kickHistory, setKickHistory] = useState<Array<{ time: string; count: number }>>([
    { time: "Yesterday, 04:00 PM", count: 12 },
    { time: "2 days ago, 09:30 AM", count: 10 }
  ]);

  // Contraction Timer State
  const [contractionRunning, setContractionRunning] = useState<boolean>(false);
  const [contractionSeconds, setContractionSeconds] = useState<number>(0);
  const [contractionLogs, setContractionLogs] = useState<Array<{ id: string; duration: number; interval: string; timestamp: string }>>([
    { id: "1", duration: 48, interval: "5.5 mins", timestamp: "08:15 AM" },
    { id: "2", duration: 52, interval: "5.0 mins", timestamp: "08:21 AM" }
  ]);

  // Maternal Wellness State (Hydration, Sleep, Mood, Nutrition)
  const [waterGlasses, setWaterGlasses] = useState<number>(6); // 8 glasses goal
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [sleptOnLeft, setSleptOnLeft] = useState<boolean>(true);
  const [currentMood, setCurrentMood] = useState<"Great" | "Peaceful" | "Tired" | "Anxious" | "Low">("Peaceful");
  const [nutritionChecks, setNutritionChecks] = useState({
    ironVeggies: true, // Ugu, Utazi
    protein: true,     // Fish, Eggs, Beans
    folicSupplements: true,
    hydrateCleanWater: true,
    fruits: false
  });

  // Timer Effects
  useEffect(() => {
    let interval: any = null;
    if (kickTimerRunning && kickTimerSeconds > 0) {
      interval = setInterval(() => {
        setKickTimerSeconds((p) => p - 1);
      }, 1000);
    } else if (kickTimerSeconds === 0) {
      setKickTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [kickTimerRunning, kickTimerSeconds]);

  useEffect(() => {
    let interval: any = null;
    if (contractionRunning) {
      interval = setInterval(() => {
        setContractionSeconds((p) => p + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [contractionRunning]);

  // Calculate BP Category
  const getBpCategory = (sys: number, dia: number): "Normal" | "Elevated" | "Pre-eclampsia Alert" | "Severe Crisis" => {
    if (sys >= 160 || dia >= 110) return "Severe Crisis";
    if (sys >= 140 || dia >= 90) return "Pre-eclampsia Alert";
    if (sys >= 120 || dia >= 80) return "Elevated";
    return "Normal";
  };

  const handleSaveBp = (e: React.FormEvent) => {
    e.preventDefault();
    const category = getBpCategory(inputSystolic, inputDiastolic);
    const newLog: BloodPressureLog = {
      id: Math.random().toString(),
      systolic: Number(inputSystolic),
      diastolic: Number(inputDiastolic),
      pulse: Number(inputPulse),
      timestamp: `Today, ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      category,
      notes: bpNote || undefined
    };

    setBpLogs((prev) => [newLog, ...prev]);
    setBpNote("");

    // If pre-eclampsia or crisis, suggest emergency alert
    if ((category === "Pre-eclampsia Alert" || category === "Severe Crisis") && onEmergencyAlert) {
      // Alert user
    }
  };

  // Kick Counter Actions
  const handleAddKick = () => {
    if (!kickTimerRunning) setKickTimerRunning(true);
    setKicks((p) => p + 1);
  };

  const handleResetKicks = () => {
    if (kicks > 0) {
      setKickHistory((p) => [
        { time: `Today, ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`, count: kicks },
        ...p
      ]);
    }
    setKicks(0);
    setKickTimerSeconds(7200);
    setKickTimerRunning(false);
  };

  const handleToggleContraction = () => {
    if (contractionRunning) {
      setContractionRunning(false);
      const newLog = {
        id: Math.random().toString(),
        duration: contractionSeconds,
        interval: contractionLogs.length > 0 ? "5.0 mins" : "Initial",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setContractionLogs((p) => [newLog, ...p]);
      setContractionSeconds(0);
    } else {
      setContractionRunning(true);
      setContractionSeconds(0);
    }
  };

  const latestBp = bpLogs[0];
  const isBpWarning = latestBp?.category === "Pre-eclampsia Alert" || latestBp?.category === "Severe Crisis";

  return (
    <div className="space-y-6">
      
      {/* 1. TOP VITALS SUMMARY STATS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Blood Pressure Card */}
        <div className={`p-4 rounded-3xl border transition-all ${
          isBpWarning 
            ? "bg-red-50 border-red-200 text-red-950" 
            : "bg-white border-slate-200 text-slate-800"
        } shadow-xs space-y-1`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Blood Pressure</span>
            <Activity className={`w-4 h-4 ${isBpWarning ? "text-red-500" : "text-brand-purple"}`} />
          </div>
          <div className="text-xl font-black">{latestBp ? `${latestBp.systolic}/${latestBp.diastolic}` : "118/76"} <span className="text-xs font-normal text-slate-400">mmHg</span></div>
          <div className="text-[11px] font-semibold text-brand-purple">
            {latestBp ? latestBp.category : "Optimal Range"}
          </div>
        </div>

        {/* Heart Rate / Pulse */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 text-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Maternal Pulse</span>
            <Heart className="w-4 h-4 text-pink-500 fill-pink-400" />
          </div>
          <div className="text-xl font-black">{latestBp ? latestBp.pulse : 80} <span className="text-xs font-normal text-slate-400">BPM</span></div>
          <div className="text-[11px] font-semibold text-emerald-600">60-100 BPM Normal</div>
        </div>

        {/* Baby Gestational Age */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 text-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Gestational Age</span>
            <Baby className="w-4 h-4 text-brand-purple" />
          </div>
          <div className="text-xl font-black">{selectedWeek} <span className="text-xs font-normal text-slate-400">Weeks</span></div>
          <div className="text-[11px] font-semibold text-purple-600">{40 - selectedWeek} Wks to Full Term</div>
        </div>

        {/* Daily Hydration */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200 text-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Daily Hydration</span>
            <Droplets className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-xl font-black">{waterGlasses} / 8 <span className="text-xs font-normal text-slate-400">Glasses</span></div>
          <div className="text-[11px] font-semibold text-teal-600">{(waterGlasses * 0.3).toFixed(1)}L / 2.4L Goal</div>
        </div>

      </div>

      {/* 2. BLOOD PRESSURE & PULSE TRACKER ENGINE */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-brand-purple flex items-center justify-center font-bold">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">
                Blood Pressure & Heart Rate Log (MEOWS Calibrated)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Track cardiovascular numbers to prevent pre-eclampsia and gestational hypertension.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Normal Range:</span>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              90/60 – 120/80 mmHg
            </span>
          </div>
        </div>

        {/* BP Input Form Grid */}
        <form onSubmit={handleSaveBp} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Systolic (Upper #)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={70}
                  max={240}
                  value={inputSystolic}
                  onChange={(e) => setInputSystolic(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 text-sm font-bold px-3 py-2 rounded-xl outline-none focus:border-brand-purple text-slate-800"
                  required
                />
                <span className="text-[10px] text-slate-400 absolute right-2.5 top-2.5 font-medium">mmHg</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Diastolic (Lower #)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={40}
                  max={150}
                  value={inputDiastolic}
                  onChange={(e) => setInputDiastolic(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 text-sm font-bold px-3 py-2 rounded-xl outline-none focus:border-brand-purple text-slate-800"
                  required
                />
                <span className="text-[10px] text-slate-400 absolute right-2.5 top-2.5 font-medium">mmHg</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Pulse (Heart Rate)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={40}
                  max={200}
                  value={inputPulse}
                  onChange={(e) => setInputPulse(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 text-sm font-bold px-3 py-2 rounded-xl outline-none focus:border-brand-purple text-slate-800"
                  required
                />
                <span className="text-[10px] text-slate-400 absolute right-2.5 top-2.5 font-medium">BPM</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Optional Note / Activity
              </label>
              <input
                type="text"
                placeholder="e.g. Resting after walk"
                value={bpNote}
                onChange={(e) => setBpNote(e.target.value)}
                className="w-full bg-white border border-slate-200 text-xs px-3 py-2 rounded-xl outline-none focus:border-brand-purple text-slate-800"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            {/* Real-time Category Indicator */}
            <div className="text-xs">
              <span className="text-slate-500 font-medium">Status for {inputSystolic}/{inputDiastolic}: </span>
              <span className={`font-bold px-2 py-0.5 rounded-md ${
                getBpCategory(inputSystolic, inputDiastolic) === "Severe Crisis"
                  ? "bg-red-600 text-white animate-pulse"
                  : getBpCategory(inputSystolic, inputDiastolic) === "Pre-eclampsia Alert"
                  ? "bg-red-100 text-red-800"
                  : getBpCategory(inputSystolic, inputDiastolic) === "Elevated"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}>
                {getBpCategory(inputSystolic, inputDiastolic)}
              </span>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2 bg-brand-purple hover:bg-dark-purple text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              + Save Blood Pressure Reading
            </button>
          </div>
        </form>

        {/* Historical BP Table */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-700">Recent Blood Pressure Logs:</div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {bpLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-800">{log.systolic}/{log.diastolic} mmHg</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-slate-600">{log.pulse} BPM</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      log.category === "Normal"
                        ? "bg-emerald-100 text-emerald-800"
                        : log.category === "Elevated"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {log.category}
                    </span>
                  </div>
                  {log.notes && <p className="text-[11px] text-slate-500">{log.notes}</p>}
                </div>
                <span className="text-[11px] text-slate-400">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. BABY GROWTH & MOVEMENT ENGINE (KICK COUNTER & CONTRACTION TIMER) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Fetal Kick Counter */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-brand-purple flex items-center justify-center font-bold">
                  <Footprints className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Fetal Kick Counter</h3>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                kicks >= 10 ? "bg-emerald-100 text-emerald-700" : "bg-purple-100 text-brand-purple"
              }`}>
                {kicks >= 10 ? "Goal Met (10+ Kicks)" : "Target: 10 in 2h"}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Tap each time baby kicks or rolls. Active movement confirms healthy placental oxygenation.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-3 space-y-2">
            <button
              onClick={handleAddKick}
              className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-black text-3xl shadow-lg active:scale-95 transition-all flex flex-col items-center justify-center border-4 border-white cursor-pointer"
            >
              <span>{kicks}</span>
              <span className="text-[9px] uppercase font-bold tracking-wider opacity-90">TAP KICK</span>
            </button>
            <div className="text-[11px] text-slate-500">
              {kickTimerRunning
                ? `Session: ${Math.floor(kickTimerSeconds / 60)} mins remaining`
                : "Tap button to begin 2h session"}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <button
              onClick={handleResetKicks}
              className="text-slate-500 hover:text-brand-purple font-semibold cursor-pointer"
            >
              Save & Reset
            </button>
            <span className="text-[10px] text-slate-400">Previous: {kickHistory[0]?.count || 0} kicks ({kickHistory[0]?.time || 'None'})</span>
          </div>
        </div>

        {/* Contraction Stopwatch */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
                  <Timer className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">Contraction Stopwatch (5-1-1 Rule)</h3>
              </div>
              <span className="text-[10px] font-bold bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                Labor Tracker
              </span>
            </div>
            <p className="text-xs text-slate-500">
              When contractions occur every 5 mins, lasting 60s for 1 hour, travel to Googwill Medical Centre (GMC).
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-3 space-y-2">
            <div className="text-3xl font-mono font-black text-slate-800">
              00:{contractionSeconds < 10 ? `0${contractionSeconds}` : contractionSeconds}
            </div>
            <button
              onClick={handleToggleContraction}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer ${
                contractionRunning
                  ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                  : "bg-brand-purple hover:bg-dark-purple text-white"
              }`}
            >
              {contractionRunning ? "STOP CONTRACTION" : "START CONTRACTION"}
            </button>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100 text-xs">
            <span className="font-bold text-slate-600 text-[11px]">Recent Intervals:</span>
            <div className="flex items-center justify-between text-[11px] bg-slate-50 p-1.5 rounded-lg text-slate-700">
              <span>{contractionLogs[0]?.timestamp || "No logs yet"}</span>
              <span className="font-bold text-brand-purple">{contractionLogs[0]?.duration ? `${contractionLogs[0]?.duration}s` : ""}</span>
              <span className="text-slate-500">{contractionLogs[0]?.interval || ""}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. MATERNAL WELLNESS & DAILY HABITS (HYDRATION, SLEEP, MOOD, NUTRITION) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Sun className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">
              Daily Maternal Wellness & Holistic Habits
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Holistic tracking for maternal hydration, left-side sleep alignment, mental mood, and Nigerian nutrition plate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Hydration Tracker */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-teal-500" />
                <span>Water Hydration (8 Glasses)</span>
              </span>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
                {Math.round((waterGlasses / 8) * 100)}% Goal
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((cup) => (
                <button
                  key={cup}
                  onClick={() => setWaterGlasses(cup)}
                  className={`py-2 rounded-xl text-center font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    waterGlasses >= cup
                      ? "bg-teal-500 text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-400 hover:bg-teal-50"
                  }`}
                >
                  <Droplets className="w-3 h-3" />
                  <span>{cup}</span>
                </button>
              ))}
            </div>

            <p className="text-[10px] text-slate-500 italic">
              Drinking 2.4L daily supports healthy amniotic fluid and reduces UTIs and swelling.
            </p>
          </div>

          {/* Sleep & Position Tracker */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-purple-500" />
                <span>Sleep & Left-Side Position</span>
              </span>
              <span className="text-[10px] font-bold text-brand-purple bg-purple-100 px-2 py-0.5 rounded-full">
                {sleepHours} Hours
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="range"
                min="4"
                max="12"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full accent-brand-purple cursor-pointer"
              />
            </div>

            <button
              onClick={() => setSleptOnLeft(!sleptOnLeft)}
              className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                sleptOnLeft
                  ? "bg-brand-purple text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600"
              }`}
            >
              <span>{sleptOnLeft ? "✓ Slept on Left Side (Optimal Flow)" : "Tap if Slept on Left Side"}</span>
            </button>
          </div>

          {/* Mood & Stress Tracker */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-pink-500" />
                <span>Maternal Mood Today</span>
              </span>
              <span className="text-[10px] font-bold text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full">
                {currentMood}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1 pt-1">
              {[
                { label: "Great", icon: Smile },
                { label: "Peaceful", icon: Sparkles },
                { label: "Tired", icon: Moon },
                { label: "Anxious", icon: AlertCircle },
                { label: "Low", icon: Frown }
              ].map((m) => {
                const IconComponent = m.icon;
                return (
                  <button
                    key={m.label}
                    onClick={() => setCurrentMood(m.label as any)}
                    className={`py-2 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                      currentMood === m.label
                        ? "bg-pink-500 text-white shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-pink-50"
                    }`}
                    title={m.label}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-[9px] font-medium leading-none">{m.label}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] text-slate-500 italic">
              Remember Mama: Your mental calmness directly soothes your baby's heartbeat.
            </p>
          </div>

        </div>

        {/* Nigerian Prenatal Nutrition Checklist */}
        <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-purple flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-brand-purple" />
              <span>Nigerian Prenatal Nutrition Plate (Daily Essentials)</span>
            </span>
            <span className="text-[10px] text-brand-purple font-semibold">Verified by GMC Nutritionist</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { key: "ironVeggies", label: "Ugu & Utazi Greens" },
              { key: "protein", label: "Fish / Eggs / Beans" },
              { key: "folicSupplements", label: "Folic Acid & Iron Pill" },
              { key: "hydrateCleanWater", label: "Clean Boiled / Sachet Water" },
            ].map((item) => {
              const checked = nutritionChecks[item.key as keyof typeof nutritionChecks];
              return (
                <button
                  key={item.key}
                  onClick={() =>
                    setNutritionChecks((p) => ({ ...p, [item.key]: !p[item.key as keyof typeof nutritionChecks] }))
                  }
                  className={`p-2 rounded-xl text-left border flex items-center justify-between transition-all cursor-pointer ${
                    checked
                      ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                      : "bg-white border-slate-200 text-slate-600 font-medium"
                  }`}
                >
                  <span>{item.label}</span>
                  {checked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
