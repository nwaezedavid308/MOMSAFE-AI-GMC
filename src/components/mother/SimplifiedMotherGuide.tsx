import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, Volume2, VolumeX, Phone, AlertTriangle, ShieldAlert, 
  CheckCircle2, Sparkles, HelpCircle, ArrowRight, Baby, Stethoscope,
  Activity, Check, X, Smile, Meh, Frown, Droplets, Brain, Zap, Waves,
  Footprints, Thermometer
} from "lucide-react";
import { AppLanguage, DANGER_SIGNS_DATA, DangerSignInfo, UI_TRANSLATIONS } from "../../data/translations";
import { playSpokenVoice, stopSpokenVoice } from "../../utils/speech";

interface SimplifiedMotherGuideProps {
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  onTriggerSos: () => void;
  onSelectDangerSign?: (signId: string, value: boolean) => void;
}

export default function SimplifiedMotherGuide({
  language,
  onLanguageChange,
  onTriggerSos,
  onSelectDangerSign
}: SimplifiedMotherGuideProps) {
  const [selectedFeeling, setSelectedFeeling] = useState<"fine" | "tired" | "sick" | null>(null);
  const [activeDangerSigns, setActiveDangerSigns] = useState<Record<string, boolean>>({});
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const t = UI_TRANSLATIONS[language];

  const handleToggleDanger = (signId: string) => {
    const nextVal = !activeDangerSigns[signId];
    setActiveDangerSigns((prev) => ({ ...prev, [signId]: nextVal }));
    if (onSelectDangerSign) {
      onSelectDangerSign(signId, nextVal);
    }
  };

  const renderSignIcon = (iconName: DangerSignInfo["iconName"]) => {
    switch (iconName) {
      case "droplets":
        return <Droplets className="w-7 h-7 text-red-600" />;
      case "brain":
        return <Brain className="w-7 h-7 text-purple-600" />;
      case "zap":
        return <Zap className="w-7 h-7 text-amber-600" />;
      case "waves":
        return <Waves className="w-7 h-7 text-blue-600" />;
      case "baby":
        return <Baby className="w-7 h-7 text-pink-600" />;
      case "footprints":
        return <Footprints className="w-7 h-7 text-indigo-600" />;
      case "thermometer":
        return <Thermometer className="w-7 h-7 text-red-500" />;
      case "alert":
      default:
        return <AlertTriangle className="w-7 h-7 text-orange-600" />;
    }
  };

  const handlePlayVoiceForSign = (sign: DangerSignInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingAudioId === sign.id) {
      stopSpokenVoice();
      setPlayingAudioId(null);
      return;
    }

    const textToSpeak = 
      language === "igbo" 
        ? `${sign.titleIgbo}. ${sign.spokenAudioIgbo}`
        : language === "pidgin"
        ? `${sign.titlePidgin}. ${sign.spokenAudioPidgin}`
        : `${sign.titleEnglish}. ${sign.spokenAudioEnglish}`;

    playSpokenVoice(textToSpeak, language);
    setPlayingAudioId(sign.id);

    const estimatedMs = Math.max(3000, textToSpeak.split(" ").length * 350);
    setTimeout(() => {
      setPlayingAudioId(null);
    }, estimatedMs);
  };

  const hasRedDanger = DANGER_SIGNS_DATA.some(
    (s) => s.severity === "RED" && activeDangerSigns[s.id]
  );
  const dangerCount = Object.values(activeDangerSigns).filter(Boolean).length;

  return (
    <div className="space-y-6" id="simplified-mother-guide">
      
      {/* 1. VISUAL STEP 1: HOW ARE YOU FEELING TODAY? */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-purple-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-purple-100 text-[#32134F] font-black text-sm flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-slate-800">
                {language === "igbo" ? "Kedu ka ahụ dị gị taa, Nne m?" : language === "pidgin" ? "How your body dey do you today, Mama?" : "How are you feeling today, Mother?"}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {language === "igbo" ? "Kpatụ otu n'ime ihe ndị a ka anyị mara ka ị mere" : language === "pidgin" ? "Touch the picture wey show how you dey feel" : "Select the card that best matches how you feel today"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const text = language === "igbo" 
                ? "Kedu ka ahụ dị gị taa? Ọ bụrụ na ahụ dị gị mma, họrọ akara ahụ dị mma. Ọ bụrụ na ahụ na-afụ gị ụfụ ma ọ bụ na-ekpo ọkụ, gwa anyị ozugbo."
                : language === "pidgin"
                ? "How your body dey do you today mama? If you dey fine, touch the healthy card. If body dey pain you, touch the sick card."
                : "How are you feeling today? Tap the green healthy card if you feel great, or the red card if you have pain or fever.";
              playSpokenVoice(text, language);
            }}
            className="self-start sm:self-center px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-orange-950 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-amber-200 cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-pink-600" />
            <span>{language === "igbo" ? "Gee Ntị (Hear Question)" : language === "pidgin" ? "Hear Question" : "Listen Audio"}</span>
          </button>
        </div>

        {/* 3 Giant Feeling Cards with Icons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* 1. FEELING GOOD */}
          <button
            type="button"
            onClick={() => {
              setSelectedFeeling("fine");
              const text = language === "igbo" ? "Ọ dị mma! Ahụ dị gị mma taa. Nọgide na-aṅụ ọgwụ nri nwa gị!" : "Good! You dey fine today. Make you continue to drink your prenatal vitamins!";
              playSpokenVoice(text, language);
            }}
            className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center text-center space-y-2 cursor-pointer ${
              selectedFeeling === "fine"
                ? "bg-emerald-50 border-emerald-500 shadow-md ring-4 ring-emerald-500/20 scale-102"
                : "bg-slate-50 hover:bg-emerald-50/40 border-slate-200 text-slate-700"
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <Smile className="w-9 h-9 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-emerald-950">
                {language === "igbo" ? "Ahụ Dị M Mma" : language === "pidgin" ? "I Dey Very Fine" : "I Feel Healthy & Fine"}
              </h3>
              <p className="text-[11px] text-emerald-800/80 font-medium mt-0.5">
                {language === "igbo" ? "Enweghị m ahụ ọkụ ma ọ bụ mgbu" : language === "pidgin" ? "No pain, no fever today" : "No fever, no pain, baby kicking"}
              </p>
            </div>
            {selectedFeeling === "fine" && (
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 mt-1">
                <Check className="w-3 h-3" /> Selected
              </span>
            )}
          </button>

          {/* 2. FEELING TIRED */}
          <button
            type="button"
            onClick={() => {
              setSelectedFeeling("tired");
              const text = language === "igbo" ? "Ike na-agwụ gị. Biko zuru ike n'akụkụ aka ekpe gị ma ṅụọ mmiri zuru oke." : "You dey tired. Please lie down for your left side and drink plenty clean water.";
              playSpokenVoice(text, language);
            }}
            className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center text-center space-y-2 cursor-pointer ${
              selectedFeeling === "tired"
                ? "bg-amber-50 border-amber-500 shadow-md ring-4 ring-amber-500/20 scale-102"
                : "bg-slate-50 hover:bg-amber-50/40 border-slate-200 text-slate-700"
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
              <Meh className="w-9 h-9 text-amber-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-amber-950">
                {language === "igbo" ? "Ike Ụwa Na-Agwụ M" : language === "pidgin" ? "Body Dey Weak Me" : "I Feel Tired / Weak"}
              </h3>
              <p className="text-[11px] text-amber-800/80 font-medium mt-0.5">
                {language === "igbo" ? "Achọrọ m izu ike na mmiri" : language === "pidgin" ? "Need rest and good food" : "Mild fatigue, needing rest"}
              </p>
            </div>
            {selectedFeeling === "tired" && (
              <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 mt-1">
                <Check className="w-3 h-3" /> Selected
              </span>
            )}
          </button>

          {/* 3. FEELING SICK / PAIN */}
          <button
            type="button"
            onClick={() => {
              setSelectedFeeling("sick");
              const text = language === "igbo" ? "Ahụ na-afụ gị ụfụ ma ọ bụ na-ekpo ọkụ. Biko nyochaa ihe ize ndụ ndị dị n'okpuru ma ọ bụ kpọọ GMC ozugbo!" : "Body dey pain you. Please check the danger signs below or call GMC hospital now now!";
              playSpokenVoice(text, language);
            }}
            className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center text-center space-y-2 cursor-pointer ${
              selectedFeeling === "sick"
                ? "bg-rose-50 border-rose-500 shadow-md ring-4 ring-rose-500/20 scale-102"
                : "bg-slate-50 hover:bg-rose-50/40 border-slate-200 text-slate-700"
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-xs">
              <Frown className="w-9 h-9 text-rose-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-rose-950">
                {language === "igbo" ? "Ahụ Ọkụ ma ọ bụ Mgbu Dị M" : language === "pidgin" ? "Body Dey Pain / Hot Me" : "I Have Pain or Fever"}
              </h3>
              <p className="text-[11px] text-rose-800/80 font-medium mt-0.5">
                {language === "igbo" ? "Chọrọ enyemaka nlekọta" : language === "pidgin" ? "Need hospital help sharp sharp" : "Needs clinical review or help"}
              </p>
            </div>
            {selectedFeeling === "sick" && (
              <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3 h-3" /> Needs Attention
              </span>
            )}
          </button>

        </div>
      </div>

      {/* 2. VISUAL STEP 2: DANGER SIGNS CHECKLIST WITH 1-TAP VOICE PLAY */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-black text-sm flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-slate-800 flex items-center gap-2">
                <span>{t.dangerSignsTitle}</span>
                {dangerCount > 0 && (
                  <span className="bg-rose-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                    {dangerCount} Selected
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {language === "igbo"
                  ? "Kpatụ kaadị ọ bụla ị na-enwe n'ahụ gị. Kpatụ akara igwe okwu ka ị nụ nkọwa ya n'olu Igbo."
                  : language === "pidgin"
                  ? "Touch any sign wey dey do your body. Touch the speaker make e read am for you."
                  : "Tap any symptoms you are experiencing. Tap the speaker to hear spoken audio explanation."}
              </p>
            </div>
          </div>

          <span className="text-[11px] font-bold text-slate-400 self-start sm:self-center">
            {language === "igbo" ? "Ihe Ize Ndụ 8 dị Mkpa" : language === "pidgin" ? "8 Critical Signs" : "8 Cardinal Danger Signs"}
          </span>
        </div>

        {/* Big Interactive Danger Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DANGER_SIGNS_DATA.map((sign) => {
            const isChecked = !!activeDangerSigns[sign.id];
            const isVoicePlaying = playingAudioId === sign.id;

            return (
              <div
                key={sign.id}
                onClick={() => handleToggleDanger(sign.id)}
                className={`p-4.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden ${
                  isChecked
                    ? sign.severity === "RED"
                      ? "bg-red-50/90 border-red-500 shadow-md ring-2 ring-red-400/30"
                      : "bg-amber-50/90 border-amber-500 shadow-md ring-2 ring-amber-400/30"
                    : "bg-slate-50 hover:bg-slate-100/80 border-slate-200/90"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-white rounded-2xl shadow-xs shrink-0 border border-slate-100 flex items-center justify-center">
                      {renderSignIcon(sign.iconName)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                        {language === "igbo" ? sign.titleIgbo : language === "pidgin" ? sign.titlePidgin : sign.titleEnglish}
                      </h4>
                      <details className="mvp-sign-description" onClick={e => e.stopPropagation()}><summary>{language === "igbo" ? "Nkọwa" : language === "pidgin" ? "Wetin this mean?" : "What does this mean?"}</summary><p className="text-xs text-slate-600 mt-1 leading-snug font-medium">{language === "igbo" ? sign.descIgbo : language === "pidgin" ? sign.descPidgin : sign.descEnglish}</p></details>
                      <div className="mt-2 text-[11px] font-bold flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-md ${
                          sign.severity === "RED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
                        }`}>
                          {language === "igbo" ? sign.actionIgbo : language === "pidgin" ? sign.actionPidgin : sign.actionEnglish}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Checkbox Circle */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isChecked
                      ? sign.severity === "RED"
                        ? "bg-red-600 text-white shadow-sm"
                        : "bg-amber-500 text-white shadow-sm"
                      : "border-2 border-slate-300 bg-white"
                  }`}>
                    {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </div>

                {/* Bottom Row: Spoken Audio Button & Action State */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 mt-1">
                  <button
                    type="button"
                    onClick={(e) => handlePlayVoiceForSign(sign, e)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      isVoicePlaying
                        ? "bg-red-600 text-white animate-pulse"
                        : "bg-white hover:bg-pink-50 text-slate-700 border border-slate-200 shadow-xs"
                    }`}
                  >
                    {isVoicePlaying ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>{t.stopBtn}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-pink-600" />
                        <span>{language === "igbo" ? "Gee Ntị (Listen)" : language === "pidgin" ? "Hear am" : "Listen"}</span>
                      </>
                    )}
                  </button>

                  <span className={`text-[11px] font-bold ${
                    isChecked ? (sign.severity === "RED" ? "text-red-700" : "text-amber-800") : "text-slate-400"
                  }`}>
                    {isChecked ? (language === "igbo" ? "Selected" : language === "pidgin" ? "Selected" : "Selected") : (language === "igbo" ? "Kpatụ ma ọ bụrụ na o mere" : language === "pidgin" ? "Touch if e dey do you" : "Tap to select")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* DANGER SUMMARY ALERT BANNER */}
        {hasRedDanger ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 border border-red-400/40"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-7 h-7 text-white animate-bounce" />
              </div>
              <div>
                <h4 className="font-black text-sm sm:text-base tracking-wide">
                  {language === "igbo" ? "ỌKỤ MBEREDE DỊ! GA-A GMC ỤLỌ ỌGWỤ OZỤGBO!" : language === "pidgin" ? "DANGER ALERT! GO GMC HOSPITAL NOW NOW!" : "CRITICAL DANGER DETECTED! SEEK HOSPITAL CARE IMMEDIATELY!"}
                </h4>
                <p className="text-xs text-red-100 mt-0.5">
                  {language === "igbo" ? "Ihe ndị a ị họrọ pụtara na ndụ gị na nke nwa chọrọ nlekọta dọkịta mberede." : language === "pidgin" ? "The danger signs you choose mean say you must reach GMC hospital quick quick." : "Your reported danger signs require immediate clinical assessment at Googwill Medical Centre."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onTriggerSos}
              className="px-5 py-3 bg-white text-red-700 hover:bg-red-50 font-black text-xs sm:text-sm rounded-xl shadow-md transition-transform active:scale-95 shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>{language === "igbo" ? "KỌPỌỌ AMBULANCE OZỤGBO" : language === "pidgin" ? "CALL AMBULANCE NOW" : "DISPATCH AMBULANCE SOS"}</span>
            </button>
          </motion.div>
        ) : (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-2xl flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-emerald-900 block">{t.allSafe}</span>
              <span className="text-emerald-700">{language === "igbo" ? "Ọ bụrụ na ị chọrọ enyemaka ọ bụla, kpọtụrụ TBA gị ma ọ bụ dọkịta." : language === "pidgin" ? "If anything change, touch the danger sign or press SOS." : "If symptoms develop later, revisit this checklist or trigger the SOS beacon."}</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. VISUAL STEP 3: DIRECT EMERGENCY HOTLINE BUTTONS (GIANT TOUCH TARGETS) */}
      <div className="bg-gradient-to-br from-[#32134F] to-[#1F0833] text-white rounded-3xl p-6 sm:p-7 shadow-lg space-y-4 border border-purple-950/40">
        <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
          <span className="w-8 h-8 rounded-full bg-pink-500 text-white font-black text-sm flex items-center justify-center shrink-0">
            3
          </span>
          <div>
            <h2 className="font-extrabold text-base sm:text-lg text-white">
              {language === "igbo" ? "Enyemaka Mberede na Nkwado (Emergency Help)" : language === "pidgin" ? "Emergency Help & Phone Numbers" : "Emergency Help & Quick Contacts"}
            </h2>
            <p className="text-xs text-purple-200 font-medium">
              {language === "igbo" ? "Kpatụ bọtịnụ ndị a ka ị kpọọ ndị na-enyere nne aka ozugbo n'enweghị igbu oge" : language === "pidgin" ? "Touch any of these big buttons to call for help sharp sharp" : "Direct one-touch phone access to caregivers, ambulance dispatch, and hospital"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Action 1: 1-Tap Red SOS */}
          <button
            type="button"
            onClick={onTriggerSos}
            className="p-5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-2xl font-black text-xs sm:text-sm shadow-xl flex flex-col items-center justify-center text-center space-y-2 border border-red-400/40 cursor-pointer active:scale-95 animate-pulse"
          >
            <ShieldAlert className="w-8 h-8 text-white" />
            <span>1-TAP EMERGENCY SOS</span>
            <span className="text-[10px] font-semibold text-red-100">
              {language === "igbo" ? "Zite Keke / Ambulance GMC" : language === "pidgin" ? "Send Ambulance to my location" : "Broadcast live GPS to GMC"}
            </span>
          </button>

          {/* Action 2: Call Community TBA */}
          <a
            href="tel:08034567812"
            className="p-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs sm:text-sm shadow-lg flex flex-col items-center justify-center text-center space-y-2 border border-emerald-400/30 transition-transform active:scale-95"
          >
            <Phone className="w-8 h-8 text-white" />
            <span>{language === "igbo" ? "KPỌỌ TBA OGBE GỊ" : language === "pidgin" ? "CALL YOUR TBA" : "CALL COMMUNITY TBA"}</span>
            <span className="text-[10px] font-semibold text-emerald-100 font-mono">
              0803-456-7812 (Nurse Eunice)
            </span>
          </a>

          {/* Action 3: Call GMC Hospital Board */}
          <a
            href="tel:08034567890"
            className="p-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs sm:text-sm shadow-lg flex flex-col items-center justify-center text-center space-y-2 border border-blue-400/30 transition-transform active:scale-95"
          >
            <Stethoscope className="w-8 h-8 text-white" />
            <span>{language === "igbo" ? "KPỌỌ DỌKỊTA GMC" : language === "pidgin" ? "CALL GMC DOCTOR" : "CALL GMC HOSPITAL"}</span>
            <span className="text-[10px] font-semibold text-blue-100 font-mono">
              0803-456-7890 (Dr. Okafor)
            </span>
          </a>

        </div>
      </div>

    </div>
  );
}
