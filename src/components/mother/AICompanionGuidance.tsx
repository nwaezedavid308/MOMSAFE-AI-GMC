import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bot, Sparkles, Volume2, VolumeX, Mic, Send, RefreshCw, 
  HelpCircle, AlertTriangle, CheckCircle2, ShieldAlert, 
  Search, BookOpen, Stethoscope, Heart, Baby, ChevronRight,
  Info, MessageSquare, Flame, Check, AlertCircle
} from "lucide-react";
import { VoiceMicButton } from "../TBAPortal";

interface AICompanionGuidanceProps {
  currentUser?: { name: string; role: string; community?: string } | null;
  selectedWeek: number;
  activeStage: "pregnancy" | "menstrual" | "postpartum";
  onEmergencyAlert?: () => void;
}

interface FaqItem {
  id: string;
  category: "Nutrition" | "Vitals & Medicine" | "Baby Movement" | "Labor Prep" | "Postpartum";
  question: string;
  shortAnswer: string;
  igboNote: string;
}

const FAQ_LIBRARY: FaqItem[] = [
  {
    id: "f1",
    category: "Nutrition",
    question: "Is it safe to drink Zobo (Hibiscus tea) during pregnancy?",
    shortAnswer: "No, avoid Zobo tea while pregnant. Concentrated hibiscus calyces can stimulate uterine contractions and increase bleeding risks. Stick to fresh coconut water, clean water, and pasteurized fruit juices.",
    igboNote: "Zere ịṅụ Zobo mgbe ị dị ime n'ihi na ọ nwere ike ibute ọgba aghara n'afọ gị."
  },
  {
    id: "f2",
    category: "Nutrition",
    question: "What local Nigerian foods will boost my blood (PCV/iron)?",
    shortAnswer: "Eat freshly washed Ugu (pumpkin leaves), waterleaf, spinach, liver, beans, moi-moi, eggs, and garden egg. Drink orange or citrus juice alongside to boost iron absorption from plant meals.",
    igboNote: "Rie akwụkwọ Ugu, agwa, na àkwá iji nye nwa gị na ahụ gị ọbara zuru oke."
  },
  {
    id: "f3",
    category: "Vitals & Medicine",
    question: "What is a normal blood pressure during pregnancy?",
    shortAnswer: "A normal reading is between 90/60 mmHg and 120/80 mmHg. Any reading of 140/90 mmHg or higher is an alert for Gestational Hypertension or Pre-eclampsia and requires instant GMC clinic evaluation.",
    igboNote: "Ọbara mgbali gị ekwesịghị iru 140/90. Ma ọ bụrụ otú ahụ, gaa GMC ozugbo."
  },
  {
    id: "f4",
    category: "Vitals & Medicine",
    question: "When should I take Fansidar (IPTp) for malaria prevention?",
    shortAnswer: "IPTp with Sulfadoxine-Pyrimethamine (Fansidar) is given at GMC antenatal visits starting from quickening (16-20 weeks) and repeated every 4 weeks under directly observed therapy. It protects both mother and placenta.",
    igboNote: "Ọgwụ Fansidar na-egbochi anwụnta ịta nwa gị n'ime afọ."
  },
  {
    id: "f5",
    category: "Baby Movement",
    question: "How many kicks should I feel every day?",
    shortAnswer: "Starting around 28 weeks, count baby kicks every day. You should easily feel at least 10 distinct kicks, rolls, or flutters within 2 hours after a meal or while lying comfortably on your left side.",
    igboNote: "Nwa gị kwesịrị ịgba n'afọ ma ọ dịkarịa ala ugboro 10 n'ime awa 2."
  },
  {
    id: "f6",
    category: "Labor Prep",
    question: "How do I know the difference between false labor and real labor?",
    shortAnswer: "False contractions (Braxton Hicks) are irregular, painless or mild, and stop when you rest or walk. True labor contractions come in predictable rhythms (every 5-10 mins), grow longer and stronger, and do not stop when resting.",
    igboNote: "Ezi ọrụ ime na-abịa n'usoro ma na-arị elu na mgbu na-akwụsịghị akwụsị."
  },
  {
    id: "f7",
    category: "Labor Prep",
    question: "What essential items should be in my GMC delivery bag?",
    shortAnswer: "Pack 2-3 clean wrappers, baby clothes, cap and socks, sanitary maternity pads, cord care antiseptic (Chlorhexidine gel), baby wipes, washbasin, baby blanket, and your antenatal clinic green card.",
    igboNote: "Kwadebe akpa ọmụmụ gị nwere akwa ọcha, disinfectant, pads na uwe nwa."
  },
  {
    id: "f8",
    category: "Postpartum",
    question: "How should I clean my newborn's umbilical cord stump?",
    shortAnswer: "Keep the cord clean and completely dry. Apply 7.1% Chlorhexidine gel once daily as taught at GMC. Do not put cow dung, powder, toothpaste, or methylated spirit on the cord stump.",
    igboNote: "Jiri ọgwụ Chlorhexidine hichaa eriri nwa gị. Etinyela ntụ ma ọ bụ mmanụ ọ bụla."
  }
];

export default function AICompanionGuidance({ 
  currentUser, 
  selectedWeek, 
  activeStage, 
  onEmergencyAlert 
}: AICompanionGuidanceProps) {
  // Language & Chat State
  const [selectedLanguage, setSelectedLanguage] = useState<"English" | "Igbo" | "Pidgin">("English");
  const [userQuery, setUserQuery] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; text: string; time: string }>>([
    {
      role: "assistant",
      text: "Ndeewo Mama! I am Iyabot / Nura AI, your 24/7 maternal health companion at Googwill Medical Centre. You can ask me any question in English, Igbo, or Nigerian Pidgin, or tap our symptom guidance checker below.",
      time: "Just now"
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Symptom Guidance State
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomTriageResult, setSymptomTriageResult] = useState<{
    riskLevel: "GREEN" | "AMBER" | "RED";
    summary: string;
    advice: string;
    actionRequired: string;
  } | null>(null);

  // FAQ Search State
  const [faqCategory, setFaqCategory] = useState<string>("All");
  const [faqSearch, setFaqSearch] = useState("");

  // Handler: Ask Iyabot AI
  const handleAskIyabot = async (customPrompt?: string) => {
    const queryToSend = customPrompt || userQuery;
    if (!queryToSend.trim() || isAiLoading) return;

    const newMsg = {
      role: "user" as const,
      text: queryToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setUserQuery("");
    setIsAiLoading(true);

    try {
      const prompt = `You are Iyabot / Nura AI, an empathetic, culturally respectful Nigerian maternal health companion for Googwill Medical Centre (GMC) Enugu East.
The user is speaking to you in ${selectedLanguage}.
Current pregnancy stage context: ${activeStage === "pregnancy" ? `${selectedWeek} weeks pregnant` : activeStage === "postpartum" ? "Postpartum recovering mother" : "Menstrual cycle tracker"}.
Mother's Name: ${currentUser?.name || "Mama"}.

Question/Query: "${queryToSend}"

Guidelines:
1. Speak with warmth, respect, and clinical accuracy.
2. If language is Igbo, use standard Igbo maternal phrases (e.g. Ndeewo nne, nọrọ jụụ, ahụ gị dị nma...).
3. If language is Pidgin, use natural, comforting Nigerian Pidgin.
4. Clearly explain whether what she is feeling is normal or a red-flag danger sign.
5. Provide 2 clear, practical tips (foods, body positions, clinic advice). Keep response concise (max 3-4 sentences).`;

      const res = await fetch("/api/gemini/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          userQuery: queryToSend,
          contextData: {
            name: currentUser?.name || "Mother",
            gestationalAge: `${selectedWeek} weeks`,
            stage: activeStage
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const replyText = data.reply || data.response || "Mama, your baby is doing well. Rest on your left side, drink water, and contact GMC for any sudden pain.";
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: replyText,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      } else {
        // Safe Fallback
        const fallback = selectedLanguage === "Igbo" 
          ? "Ndeewo nne, biko na-ezu ike ma na-aṅụ mmiri ọcha. Ọ bụrụ na ị hụ ọbara ma ọ bụ nwee oke isi ọwụwa, gbaa ọsọ gaa GMC ozugbo."
          : selectedLanguage === "Pidgin"
          ? "Mama, rest well and take your routine medicines. If you see bleeding, bad headache or your water break, go GMC hospital quick quick."
          : "Hello Mama, please ensure you stay hydrated, rest on your left side, and visit Googwill Medical Centre if you experience bleeding, severe headache, or decreased baby kicks.";
        
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: fallback,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      }
    } catch (e) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Mama, please take your prenatal vitamins, drink plenty of water, and reach out to your local TBA or GMC clinic if you notice any unusual discomfort.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Handler: Speech Synthesis
  const handlePlayVoice = (text: string) => {
    if (audioPlaying) {
      window.speechSynthesis?.cancel();
      setAudioPlaying(false);
      return;
    }

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      utterance.onend = () => setAudioPlaying(false);
      utterance.onerror = () => setAudioPlaying(false);
      setAudioPlaying(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Symptom Check Logic
  const handleToggleSymptom = (sym: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleEvaluateSymptoms = () => {
    const dangerFlags = [
      "Vaginal Bleeding", 
      "Severe Headache / Visual Blur", 
      "Water Breaking / Fluid Gush", 
      "Baby Not Moving (Decreased Fetal Movement)", 
      "Severe Epigastric / Stomach Pain",
      "High Fever / Rigors",
      "Convulsions / Fits"
    ];

    const amberFlags = [
      "Sudden Swollen Hands & Face", 
      "Painful Urination (Dysuria)", 
      "Persistent Vomiting (Dehydration)", 
      "Rapid Pulse / Heart Racing"
    ];

    const hasRed = selectedSymptoms.some((s) => dangerFlags.includes(s));
    const hasAmber = selectedSymptoms.some((s) => amberFlags.includes(s));

    if (hasRed) {
      setSymptomTriageResult({
        riskLevel: "RED",
        summary: "Critical Obstetric Red Flag Detected",
        advice: "The symptoms you selected indicate a potential obstetric emergency such as Pre-eclampsia, Placental Abruption, or Active Labor complications.",
        actionRequired: "Do not wait. Immediately trigger 1-Tap SOS or head to Googwill Medical Centre (GMC) Emergency Triage in Umuchigbo."
      });
    } else if (hasAmber) {
      setSymptomTriageResult({
        riskLevel: "AMBER",
        summary: "Moderate Warning Sign - Requires Midwife Review",
        advice: "These symptoms should not be ignored. They may indicate early gestational hypertension, urinary tract infection, or severe dehydration.",
        actionRequired: "Contact your assigned community TBA or schedule a checkup at GMC within 24 hours."
      });
    } else {
      setSymptomTriageResult({
        riskLevel: "GREEN",
        summary: "Common Pregnancy / Normal Physiological Changes",
        advice: "The selected symptoms are typical discomforts of pregnancy. Continue staying well hydrated, resting on your left side, and eating balanced iron-rich meals.",
        actionRequired: "Continue routine antenatal checks and keep monitoring daily baby kicks."
      });
    }
  };

  // Filtered FAQs
  const filteredFaqs = FAQ_LIBRARY.filter((f) => {
    const matchesCat = faqCategory === "All" || f.category === faqCategory;
    const matchesSearch = f.question.toLowerCase().includes(faqSearch.toLowerCase()) || 
                          f.shortAnswer.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. HERO AI BANNER */}
      <div className="bg-gradient-to-br from-brand-purple via-purple-900 to-dark-purple text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-pink-300" />
              <span>GMC AI Health Companion • Iyabot Maternal Voice</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              AI Maternal Health Guide & 24/7 Questions
            </h2>
            <p className="text-xs sm:text-sm text-purple-200 max-w-xl">
              Ask anything about your body, nutrition, fetal development, and labor symptoms in English, Igbo, or Nigerian Pidgin.
            </p>
          </div>

          {/* Language Selector Chips */}
          <div className="bg-black/30 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 flex items-center gap-1 shrink-0 self-start md:self-center">
            {(["English", "Igbo", "Pidgin"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedLanguage === lang
                    ? "bg-pink-500 text-white shadow-md"
                    : "text-purple-200 hover:text-white hover:bg-white/5"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN SECTION: LIVE CHAT + SYMPTOM GUIDANCE ENGINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: IYABOT AI CONVERSATIONAL INTERACTION (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between min-h-[480px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-brand-purple flex items-center justify-center font-bold">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">
                      Iyabot Maternal AI Assistant
                    </h3>
                    <p className="text-[10px] text-slate-500">Speaking in {selectedLanguage} • 24/7 Clinical Knowledge</p>
                  </div>
                </div>

                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Online
                </span>
              </div>

              {/* Chat Stream Messages */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[88%] p-3.5 rounded-2xl text-xs space-y-1.5 ${
                        msg.role === "user"
                          ? "bg-brand-purple text-white rounded-br-none shadow-xs"
                          : "bg-slate-50 text-slate-800 border border-slate-200/80 rounded-bl-none"
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      <div className="flex items-center justify-between pt-1 text-[10px] opacity-70">
                        <span>{msg.time}</span>
                        {msg.role === "assistant" && (
                          <button
                            onClick={() => handlePlayVoice(msg.text)}
                            className="flex items-center gap-1 font-bold text-brand-purple hover:underline cursor-pointer"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>Listen</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isAiLoading && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 p-2 bg-slate-50 rounded-xl w-fit">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-purple" />
                    <span>Iyabot is thinking in {selectedLanguage}...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Input & Voice Controls */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Ask Iyabot in ${selectedLanguage} (e.g. "Is it normal to have swollen feet?", "Gịnị ka m ga-eme ma ọ bụrụ na afọ na-egbu m mgbu?")`}
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAskIyabot()}
                  className="flex-1 bg-slate-50 border border-slate-200 text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple text-slate-800"
                />

                <VoiceMicButton
                  label="Voice"
                  onTranscript={(text) => {
                    setUserQuery(text);
                    handleAskIyabot(text);
                  }}
                />

                <button
                  onClick={() => handleAskIyabot()}
                  disabled={isAiLoading || !userQuery.trim()}
                  className="px-4 py-2.5 bg-brand-purple hover:bg-dark-purple disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>

              {/* Quick Prompt Starters */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-semibold">Suggested:</span>
                {[
                  "Safe local foods for blood PCV",
                  "Difference between true and false contractions",
                  "Why are baby kicks quiet today?"
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAskIyabot(prompt)}
                    className="text-[10px] bg-purple-50 hover:bg-purple-100 text-brand-purple font-medium px-2 py-0.5 rounded-lg border border-purple-200 transition-colors cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE SYMPTOM GUIDANCE ENGINE (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    Interactive Symptom Guidance
                  </h3>
                  <p className="text-[10px] text-slate-500">MEOWS-grounded clinical risk assessment</p>
                </div>
              </div>

              <span className="text-[10px] font-bold bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                {selectedSymptoms.length} Selected
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Select any sensations you are feeling right now to receive immediate AI clinical guidance:
            </p>

            {/* Categorized Symptom Chips */}
            <div className="space-y-3">
              
              {/* Critical Danger Signs */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>Critical Danger Signs (Emergency)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Vaginal Bleeding",
                    "Severe Headache / Visual Blur",
                    "Water Breaking / Fluid Gush",
                    "Baby Not Moving (Decreased Fetal Movement)",
                    "Severe Epigastric / Stomach Pain",
                    "High Fever / Rigors",
                    "Convulsions / Fits"
                  ].map((sym) => {
                    const isSelected = selectedSymptoms.includes(sym);
                    return (
                      <button
                        key={sym}
                        onClick={() => handleToggleSymptom(sym)}
                        className={`text-xs px-2.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1 border ${
                          isSelected
                            ? "bg-red-600 text-white border-red-700 shadow-xs"
                            : "bg-red-50/60 hover:bg-red-100 text-red-900 border-red-200"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{sym}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Moderate Signs */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Moderate Symptoms (Clinician Watch)</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Sudden Swollen Hands & Face",
                    "Painful Urination (Dysuria)",
                    "Persistent Vomiting (Dehydration)",
                    "Rapid Pulse / Heart Racing"
                  ].map((sym) => {
                    const isSelected = selectedSymptoms.includes(sym);
                    return (
                      <button
                        key={sym}
                        onClick={() => handleToggleSymptom(sym)}
                        className={`text-xs px-2.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1 border ${
                          isSelected
                            ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                            : "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{sym}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Common Pregnancy Changes */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span>Common Pregnancy Discomforts</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Mild Lower Backache",
                    "Mild Braxton Hicks (Painless tightening)",
                    "Heartburn / Acid Indigestion",
                    "Frequent Urination (Normal)",
                    "Leg Cramps at Night"
                  ].map((sym) => {
                    const isSelected = selectedSymptoms.includes(sym);
                    return (
                      <button
                        key={sym}
                        onClick={() => handleToggleSymptom(sym)}
                        className={`text-xs px-2.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1 border ${
                          isSelected
                            ? "bg-brand-purple text-white border-purple-800 shadow-xs"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{sym}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Evaluate Button */}
            <button
              onClick={handleEvaluateSymptoms}
              disabled={selectedSymptoms.length === 0}
              className="w-full py-2.5 bg-gradient-to-r from-brand-purple to-purple-800 hover:from-purple-800 hover:to-dark-purple disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Run AI Symptom Triage Assessment</span>
            </button>

            {/* Triage Output Card */}
            {symptomTriageResult && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-2xl border space-y-2 text-xs ${
                  symptomTriageResult.riskLevel === "RED"
                    ? "bg-red-50 border-red-300 text-red-950"
                    : symptomTriageResult.riskLevel === "AMBER"
                    ? "bg-amber-50 border-amber-300 text-amber-950"
                    : "bg-emerald-50 border-emerald-300 text-emerald-950"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold flex items-center gap-1">
                    {symptomTriageResult.riskLevel === "RED" ? (
                      <ShieldAlert className="w-4 h-4 text-red-600" />
                    ) : symptomTriageResult.riskLevel === "AMBER" ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                    <span>{symptomTriageResult.summary}</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-white/80 border">
                    {symptomTriageResult.riskLevel} Risk
                  </span>
                </div>

                <p className="text-[11px] leading-relaxed">{symptomTriageResult.advice}</p>

                <div className="pt-1.5 border-t border-black/10 font-semibold text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600 inline shrink-0" />
                  <span>Action: {symptomTriageResult.actionRequired}</span>
                </div>

                {symptomTriageResult.riskLevel === "RED" && onEmergencyAlert && (
                  <button
                    onClick={onEmergencyAlert}
                    className="w-full mt-2 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    Trigger Emergency SOS Dispatch
                  </button>
                )}
              </motion.div>
            )}

          </div>
        </div>

      </div>

      {/* 3. 24/7 BASIC HEALTH QUESTIONS & NIGERIAN CLINICAL FAQ LIBRARY */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-brand-purple flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">
                24/7 Maternal Health Questions Library
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant, verified answers curated by Googwill Medical Centre obstetricians and TBA trainers.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search foods, labor, symptoms..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs pl-8 pr-3 py-2 rounded-xl outline-none focus:border-brand-purple text-slate-800"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {["All", "Nutrition", "Vitals & Medicine", "Baby Movement", "Labor Prep", "Postpartum"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFaqCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                faqCategory === cat
                  ? "bg-brand-purple text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className="p-4 bg-slate-50 hover:bg-purple-50/40 border border-slate-200/80 rounded-2xl space-y-2.5 transition-all flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold bg-purple-100 text-brand-purple px-2 py-0.5 rounded">
                    {faq.category}
                  </span>
                  <button
                    onClick={() => handleAskIyabot(`Tell me more about: ${faq.question}`)}
                    className="text-[10px] text-brand-purple font-semibold hover:underline flex items-center gap-0.5"
                  >
                    <span>Ask AI</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <h4 className="font-bold text-xs text-slate-800 leading-snug">{faq.question}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{faq.shortAnswer}</p>
              </div>

              <div className="bg-white/90 p-2.5 rounded-xl border border-purple-100 text-[11px] text-brand-purple italic flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                <span>Igbo Wisdom: "{faq.igboNote}"</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
