import React, { useState } from "react";
import { Volume2, VolumeX, Play, Pause, Languages, Sparkles, Globe } from "lucide-react";
import { AppLanguage, UI_TRANSLATIONS } from "../data/translations";
import { playSpokenVoice, stopSpokenVoice } from "../utils/speech";

interface LanguageSpeechHeaderProps {
  currentLanguage: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  screenContext?: "mother" | "tba" | "landing" | "gmc";
}

export default function LanguageSpeechHeader({
  currentLanguage,
  onLanguageChange,
  screenContext = "mother"
}: LanguageSpeechHeaderProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const t = UI_TRANSLATIONS[currentLanguage];

  const getAudioIntroText = () => {
    if (screenContext === "mother") {
      if (currentLanguage === "igbo") {
        return "Ndeewo nne anyị! A bụ m onye nkwado ahụ ike gị na MOMSAFE MamaAlert. Ọ bụrụ na ahụ adịghị gị mma, ma ọ bụ ọbara na-agba gị, ma ọ bụ isi na-awa gị ọkụ ọkụ, kpatụ bọtịnụ na-acha uhie uhie nke bụ SOS ka GMC zitere gị enyemaka mberede ozugbo! Nọgide na-aṅụ ọgwụ nri gị kwa ụbọchị.";
      } else if (currentLanguage === "pidgin") {
        return "Welcome mama! This na MOMSAFE MamaAlert to help you and your pikin stay safe. If body dey pain you, or blood dey comot, or your head dey bang hot hot, press the big red SOS button make GMC hospital send Keke or ambulance come carry you now now!";
      } else {
        return "Welcome mother! This is MOMSAFE MamaAlert. If you experience bleeding, severe headache, or reduced baby movement, tap the big red Emergency SOS button to dispatch immediate ambulance assistance from Googwill Medical Centre.";
      }
    } else if (screenContext === "tba") {
      if (currentLanguage === "igbo") {
        return "Ndeewo onye nlekọta ahụ ike TBA! Na portal a, ị nwere ike idebanye aha nne dị ime, nyochaa mgbali ọbara, na ịmata ihe ize ndụ. Ọ bụrụ na ọnọdụ nne dị njọ, zipụ nne ahụ na GMC ozugbo.";
      } else if (currentLanguage === "pidgin") {
        return "Welcome our community TBA caregiver! For here, you fit register pregnant mothers, check their blood pressure, and spot any danger sign quick. If risk dey red, transfer patient to GMC hospital sharp sharp.";
      } else {
        return "Welcome TBA caregiver! Register pregnant mothers, evaluate vital signs and risk status, and transmit emergency referrals directly to Googwill Medical Centre.";
      }
    } else {
      if (currentLanguage === "igbo") {
        return "Nnọọ na MOMSAFE CONNECT! Họrọ portal nne, ma ọ bụ nke ndị TBA, ma ọ bụ GMC ụlọ ọgwụ iji malite.";
      } else if (currentLanguage === "pidgin") {
        return "Welcome to MOMSAFE CONNECT! Select Mother Portal, TBA Portal, or Hospital Dashboard to begin.";
      } else {
        return "Welcome to MOMSAFE CONNECT. Choose Mother Portal, TBA Portal, or Hospital Dashboard.";
      }
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopSpokenVoice();
      setIsPlaying(false);
    } else {
      const textToSpeak = getAudioIntroText();
      playSpokenVoice(textToSpeak, currentLanguage);
      setIsPlaying(true);

      // Auto reset playing indicator after speech ends roughly
      const estimatedMs = Math.max(4000, textToSpeak.split(" ").length * 350);
      setTimeout(() => {
        setIsPlaying(false);
      }, estimatedMs);
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-pink-600 text-white px-4 py-2.5 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3 border border-amber-400/40">
      {/* Left: Language Selection Buttons */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 text-amber-100 hidden sm:inline-flex">
          <Globe className="w-3.5 h-3.5" />
          <span>{t.languageSelect}</span>
        </span>
        <div className="flex items-center bg-black/20 p-1 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => {
              onLanguageChange("igbo");
              if (isPlaying) {
                stopSpokenVoice();
                setIsPlaying(false);
              }
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              currentLanguage === "igbo"
                ? "bg-white text-orange-950 shadow-sm scale-102"
                : "text-amber-100 hover:bg-white/10"
            }`}
          >
            <span>Asụsụ Igbo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onLanguageChange("pidgin");
              if (isPlaying) {
                stopSpokenVoice();
                setIsPlaying(false);
              }
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              currentLanguage === "pidgin"
                ? "bg-white text-orange-950 shadow-sm scale-102"
                : "text-amber-100 hover:bg-white/10"
            }`}
          >
            <span>Naija Pidgin</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onLanguageChange("english");
              if (isPlaying) {
                stopSpokenVoice();
                setIsPlaying(false);
              }
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              currentLanguage === "english"
                ? "bg-white text-orange-950 shadow-sm scale-102"
                : "text-amber-100 hover:bg-white/10"
            }`}
          >
            <span>English</span>
          </button>
        </div>
      </div>

      {/* Right: Big One-Tap Voice Assistant Audio Button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleTogglePlay}
          className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-sm transition-all transform active:scale-95 cursor-pointer ${
            isPlaying
              ? "bg-white text-red-600 animate-pulse"
              : "bg-white text-[#32134F] hover:bg-amber-50"
          }`}
          title="Press to hear spoken audio explanation"
        >
          {isPlaying ? (
            <>
              <VolumeX className="w-4 h-4 text-red-600" />
              <span>{t.stopBtn}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-pink-600 animate-bounce" />
              <span>{t.listenBtn}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
