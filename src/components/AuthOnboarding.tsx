import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  UserCheck, Shield, Lock, Phone, User, LogIn, Sparkles, AlertCircle, 
  MapPin, Check, PlusCircle, ArrowRight, Heart, Landmark, Calendar, Baby 
} from "lucide-react";
import MOMSAFELogo from "./MOMSAFELogo";

interface AuthOnboardingProps {
  onAuthSuccess: (user: { name: string; role: string; community?: string }) => void;
  onSkip: () => void;
}

export default function AuthOnboarding({ onAuthSuccess, onSkip }: AuthOnboardingProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<"tba" | "patient" | "admin">("tba");

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [community, setCommunity] = useState("Umuchigbo");
  const [age, setAge] = useState("");
  const [gestationalAge, setGestationalAge] = useState("36 weeks");
  const [parity, setParity] = useState("1");
  const [department, setDepartment] = useState("Obstetric Emergency");
  const [adminId, setAdminId] = useState("");

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRoleChange = (selectedRole: "tba" | "patient" | "admin") => {
    setRole(selectedRole);
    setError("");
    setSuccessMsg("");
  };

  const handleModeChange = (selectedMode: "login" | "register") => {
    setMode(selectedMode);
    setError("");
    setSuccessMsg("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    // Validate inputs depending on mode & role
    if (mode === "login") {
      if (!fullName) {
        setError("Please enter your full name.");
        return;
      }
      if (role === "tba" || role === "admin") {
        if (!pin || pin.length < 4) {
          setError("Please enter your 4-digit PIN / Password.");
          return;
        }
      }

      // Successful simulated login
      setSuccessMsg(`Welcome back, ${fullName}! Logging you in...`);
      setTimeout(() => {
        onAuthSuccess({
          name: fullName,
          role,
          community: role === "tba" ? community : undefined,
        });
      }, 1200);

    } else {
      // Register Mode
      if (!fullName) {
        setError("Please enter your full name.");
        return;
      }
      if (!phone) {
        setError("Please enter your mobile phone number.");
        return;
      }

      if (role === "tba") {
        if (!pin || pin.length < 4) {
          setError("Please set a secure 4-digit security PIN.");
          return;
        }
        setSuccessMsg(`Registration Successful! TBA Nurse ${fullName} has been registered in ${community} Area.`);
      } else if (role === "patient") {
        if (!age) {
          setError("Please enter patient's current age.");
          return;
        }
        setSuccessMsg(`Onboarding Successful! Mother ${fullName} registered under antenatal supervision.`);
      } else if (role === "admin") {
        if (!pin || pin.length < 4) {
          setError("Please set a secure 4-digit Admin PIN.");
          return;
        }
        if (!adminId) {
          setError("Please enter your Hospital Admin ID.");
          return;
        }
        setSuccessMsg(`Onboarding Successful! GMC Clinician Admin ${fullName} authenticated for ${department}.`);
      }

      setTimeout(() => {
        onAuthSuccess({
          name: fullName,
          role,
          community: role === "tba" || role === "patient" ? community : undefined,
        });
      }, 1500);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-xl my-6 flex flex-col">
      {/* Brand Header */}
      <div className="bg-[#32134F] text-white p-6 text-center space-y-3.5 border-b border-purple-950/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-purple-800/20 to-transparent pointer-events-none" />
        
        <div className="flex justify-center">
          <MOMSAFELogo size={44} withBackground={true} />
        </div>
        
        <div>
          <h2 className="text-lg font-bold tracking-wide uppercase">MOMSAFE CONNECT</h2>
          <p className="text-[11px] text-purple-200 font-medium">Enugu State Maternal Early-Warning & Coordination System</p>
        </div>

        {/* Auth / Register Tab Switcher */}
        <div className="flex bg-black/20 p-1 rounded-xl max-w-xs mx-auto border border-white/5 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => handleModeChange("login")}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === "login" 
                ? "bg-white text-[#32134F] shadow-xs" 
                : "text-purple-200 hover:text-white"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("register")}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === "register" 
                ? "bg-white text-[#32134F] shadow-xs" 
                : "text-purple-200 hover:text-white"
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Onboard / Register</span>
          </button>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Role Picker Description */}
        <div className="space-y-2 text-center">
          <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">
            {mode === "login" ? "Select Your Portal Access Profile" : "Choose Onboarding Account Type"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your selected role determines which specialized portal tools, clinical assistants, or queue boards you access.
          </p>
        </div>

        {/* Role Button Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* TBA Role Button */}
          <button
            type="button"
            onClick={() => handleRoleChange("tba")}
            className={`p-3 border rounded-2xl flex flex-col items-center text-center transition-all ${
              role === "tba"
                ? "bg-purple-50 text-brand-purple border-brand-purple ring-1 ring-brand-purple"
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <UserCheck className="w-5 h-5 mb-1.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Local TBA</span>
          </button>

          {/* Patient Role Button */}
          <button
            type="button"
            onClick={() => handleRoleChange("patient")}
            className={`p-3 border rounded-2xl flex flex-col items-center text-center transition-all ${
              role === "patient"
                ? "bg-purple-50 text-brand-purple border-brand-purple ring-1 ring-brand-purple"
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Heart className="w-5 h-5 mb-1.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Mother</span>
          </button>

          {/* Admin / Hospital Role Button */}
          <button
            type="button"
            onClick={() => handleRoleChange("admin")}
            className={`p-3 border rounded-2xl flex flex-col items-center text-center transition-all ${
              role === "admin"
                ? "bg-purple-50 text-brand-purple border-brand-purple ring-1 ring-brand-purple"
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Landmark className="w-5 h-5 mb-1.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">GMC Admin</span>
          </button>
        </div>

        {/* Input Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3.5">
            {/* Full Name - Vertical block */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {role === "tba" ? "Traditional Birth Attendant Name" : role === "patient" ? "Mother's Full Name" : "Clinician / Administrator Name"}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={
                    role === "tba" ? "e.g. Nurse Eunice Nnaji" : role === "patient" ? "e.g. Chioma Obi" : "e.g. Dr. Arthur Chinedu"
                  }
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple text-slate-800 font-medium"
                />
              </div>
            </div>

            {/* Phone Input - ONLY for Register or Patient Login */}
            {(mode === "register" || role === "patient") && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Mobile Phone Number (Enugu Network)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 08030012233"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple text-slate-800 font-medium font-mono"
                  />
                </div>
              </div>
            )}

            {/* Additional Patient Fields */}
            {mode === "register" && role === "patient" && (
              <div className="space-y-3.5 pt-1.5 border-t border-slate-100">
                {/* Age */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Mother's Age (Years)</label>
                  <input
                    type="number"
                    required
                    min={12}
                    max={55}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 24"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple text-slate-800 font-medium"
                  />
                </div>

                {/* Community Select */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Home Address</label>
                  <select
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none text-slate-700 font-medium focus:border-brand-purple"
                  >
                    <option value="Umuchigbo">Umuchigbo</option>
                    <option value="Iji Nike">Iji Nike</option>
                    <option value="Emene">Emene</option>
                    <option value="Abakpa">Abakpa</option>
                    <option value="Obinagu">Obinagu</option>
                  </select>
                </div>

                {/* Gestational Age */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Gestational Age</label>
                  <select
                    value={gestationalAge}
                    onChange={(e) => setGestationalAge(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none text-slate-700 font-medium focus:border-brand-purple"
                  >
                    <option value="20-28 weeks">20-28 weeks (Second Trimester)</option>
                    <option value="29-32 weeks">29-32 weeks (Early Third Trimester)</option>
                    <option value="33-35 weeks">33-35 weeks (Moderate Preterm)</option>
                    <option value="36 weeks">36 weeks (Late Preterm)</option>
                    <option value="37-38 weeks">37-38 weeks (Early Term)</option>
                    <option value="39-40 weeks">39-40 weeks (Full Term)</option>
                    <option value="41+ weeks">41+ weeks (Late / Post Term)</option>
                  </select>
                </div>

                {/* Parity */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Parity (Number of Prior Births)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={parity}
                    onChange={(e) => setParity(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple text-slate-800 font-medium"
                  />
                </div>
              </div>
            )}

            {/* Additional TBA Fields */}
            {mode === "register" && role === "tba" && (
              <div className="space-y-3.5 pt-1.5 border-t border-slate-100">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Operating Community</label>
                  <select
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none text-slate-700 font-medium focus:border-brand-purple"
                  >
                    <option value="Umuchigbo">Umuchigbo</option>
                    <option value="Iji Nike">Iji Nike</option>
                    <option value="Emene">Emene</option>
                    <option value="Abakpa">Abakpa</option>
                    <option value="Obinagu">Obinagu</option>
                  </select>
                </div>
              </div>
            )}

            {/* Additional Hospital Admin Fields */}
            {role === "admin" && (
              <div className="space-y-3.5 pt-1.5 border-t border-slate-100">
                {mode === "register" && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Clinician Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none text-slate-700 font-medium focus:border-brand-purple"
                    >
                      <option value="Obstetric Emergency">Obstetric Emergency</option>
                      <option value="Maternal & Child Health">Maternal & Child Health</option>
                      <option value="Antenatal Ward Coordinator">Antenatal Ward Coordinator</option>
                      <option value="Triage Command">Triage Command</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">GMC Hospital Admin ID</label>
                  <input
                    type="text"
                    required
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    placeholder="e.g. GMC-OB-392"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple text-slate-800 font-medium"
                  />
                </div>
              </div>
            )}

            {/* Pin Code / Password - ONLY for TBA or Admin roles */}
            {(role === "tba" || role === "admin") && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {mode === "login" ? "4-Digit Access PIN Code" : "Create 4-Digit Security PIN Code"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple text-slate-800 font-bold font-mono tracking-[0.4em]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Feedback Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-red-700 font-semibold">{error}</p>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-start gap-2.5 animate-pulse"
              >
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-800 font-bold">{successMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Action Button */}
          <button
            type="submit"
            className="w-full py-3 bg-[#32134F] hover:bg-[#200b34] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm mt-6 cursor-pointer"
          >
            <span>{mode === "login" ? "Verify & Sign In" : "Complete Registration & Onboard"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Access Link */}
        <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-3">
          <p className="text-[11px] text-slate-400 font-medium">Or skip to evaluate the dashboard instantly</p>
          <button
            type="button"
            onClick={onSkip}
            className="text-[11px] font-bold text-slate-600 hover:text-[#32134F] flex items-center gap-1 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl border border-slate-150 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Skip to Unified Demo Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
