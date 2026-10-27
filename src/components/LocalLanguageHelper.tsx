import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, Volume2, VolumeX, Play, Pause, X, Search, Info,
  Sparkles, Check, ChevronRight, Languages, AlertCircle
} from "lucide-react";

export interface GlossaryTerm {
  id: string;
  englishTerm: string;
  igboTerm: string;
  igboPronunciation: string;
  definitionEnglish: string;
  definitionIgbo: string;
  healthAdviceIgbo: string;
  audioDuration: string; // duration in seconds
  audioDialogue: string; // text transcript of the Igbo clinical advice
}

export const IGBO_GLOSSARY: GlossaryTerm[] = [
  {
    id: "parity",
    englishTerm: "Parity (Prior Births)",
    igboTerm: "Ọnụ Ọgụ Ọmụmụ Nwa",
    igboPronunciation: "Oh-noo Oh-goo Oh-moo-moo N-wah",
    definitionEnglish: "The number of previous pregnancies that reached viable gestational age (whether born alive or stillborn). It does NOT count the number of babies (e.g. twins count as parity 1).",
    definitionIgbo: "Nke a pụtara ugboro ole nne mụrụ nwa nke ruru ogo izu iri abụọ na anọ nke ime ma ọ bụ karịa, ma nwa ahụ mụrụ ndụ ma ọ bụ nwụrụ anwụ.",
    healthAdviceIgbo: "Dọkịta chọrọ ịma ma nne a amụgoro nwa tupu oge a. Nne na-amụ nwa mbụ (Parity 0) ma ọ bụ nne mụgoro nwa ugboro ise ma ọ bụ karịa (Grand Multipara, Parity 5+) nwere nnukwu ohere inwe nsogbu mberede dị ka ọbara ọgbụgba ma ọ bụ ọrụ ike na-esiri ike. Anyị ga-eji nlezianya na-enyocha nne ndị a mgbe niile.",
    audioDuration: "0:45",
    audioDialogue: "Ndeewo nne, a bụ m onye nkwado ahụ ike gị. 'Parity' pụtara ugboro ole ị mụgoro nwa ruru izu iri abụọ na anọ ma ọ bụ karịa. Ọ bụghị ọgụ ụmụ ị nwere ugbu a, kama ọ bụ ugboro ole ị mụrụ nwa. Nke a dị mkpa n'ihi na nne na-amụ nwa mbụ ma ọ bụ nne mụrụ nwa karịrị ugboro ise chọrọ nchebe pụrụ iche na nkwado dọkịta iji hụ na ọmụmụ nwa gị gaziiri nke ọma n'enweghị ọbara ọgbụgba ma ọ bụ ihe mgbu ruru ala."
  },
  {
    id: "bp",
    englishTerm: "Blood Pressure (BP)",
    igboTerm: "Mgbali Ọbara / Ntinye Ọbara",
    igboPronunciation: "M-gbah-lee Oh-bah-rah",
    definitionEnglish: "The force of blood circulating against the walls of blood vessels. Systolic (upper number) over Diastolic (lower number). BP >= 140/90 mmHg is high and highly dangerous.",
    definitionIgbo: "Ike ọbara na-eji agba n'ahụ nne. Ọ bụ elu (Systolic) na ala (Diastolic). Ọ bụrụ na ọ gbagoo 140/90 ma ọ bụ karịa, ọ dị ezigbo egwu n'oge ime.",
    healthAdviceIgbo: "Ọbara mgbali elu bụ otu n'ime isi ihe na-akpata ọnwụ nne dị ime na Nigeria (Pre-eclampsia). Ọ bụrụ na elu agbago 140 ma ọ bụ ala agbago 90, ọ nwere ike ibute eclampsia (nkwụ ahụ). Kwadebe ma kpọga nne ahụ na GMC ngwa ngwa n'enweghị igbu oge.",
    audioDuration: "1:02",
    audioDialogue: "Nnọọ nne m, gee ntị nke ọma. Mgbali ọbara bụ ihe anyị na-atụ n'aka iji mara ka ọbara gị si agba n'ahụ gị. Mgbe ị dị ime, ọbara mgbali elu na-ebutere anyị nnukwu ihe ize ndụ akpọrọ Pre-eclampsia. Ọ bụrụ na elu ahụ ruru otu narị na iri anọ, ma ọ bụ ala eruo iri itoolu, biko gbaara ọsọ ga GMC ụlọ ọgwụ! Ọbara mgbali elu nwere ike imetụta nwa gị na ahụ gị, na-akpata ihe nkwụ, ya mere nyocha BP gị mgbe niile bụ ọgwụ ndụ."
  },
  {
    id: "gestational_age",
    englishTerm: "Gestational Age (Pregnancy Duration)",
    igboTerm: "Ogologo Oge Ime / Izụ Ime",
    igboPronunciation: "Oh-goh-goh Oh-geh Ih-meh",
    definitionEnglish: "How far along the pregnancy is, measured in weeks from the first day of the mother's Last Menstrual Period (LMP). Normal term is 37-42 weeks.",
    definitionIgbo: "Ogologo oge ime ahụ dị n'afọ nne, nke a na-agụ site n'izu izu site n'ụbọchị ikpeazụ ọ hụrụ nsọ ya.",
    healthAdviceIgbo: "Ịmara izu ole ime dị na-enyere anyị aka ịhazi mgbe nwa ga-apụta ma mara ma ọ bụrụ na nwa ahụ na-eto nke ọma. Ime gbara izu iri atọ na asaa (37 weeks) agbaala ogo ọmụmụ. Ime ọ bụla mụrụ tupu izu 37 bụ preterm (nwa amụghị agụ), ime ruru izu 42 gachara na-achọ enyemaka mberede dọkịta.",
    audioDuration: "0:50",
    audioDialogue: "Kedu nne? Izụ ime gị bụ gị ịmata izu ole nwa gị dị n'afọ. Anyị na-amalite ịgụ ya n'ụbọchị mbụ nsọ gị ikpeazụ malitere. Ịmara izu ole nwa gị dị na-enye anyị ohere ịma oge mgbapụta ya na ka ọ si eto. Ọ bụrụ na ime gị eruo izu iri atọ na asaa, ọ ruru ogo ọmụmụ. Ọ bụrụ na ọ gafee izu iri anọ na abụọ ma nwa apụtaghị, ọ bụ ihe dị mkpa ka anyị chọpụta dọkịta GMC ka emeghị ka nne na nwa nweta nsogbu n'afọ."
  },
  {
    id: "convulsions",
    englishTerm: "Convulsions & Fits",
    igboTerm: "Ihe Nkwụ ma ọ bụ Atatata n'Ime",
    igboPronunciation: "Ih-heh N-kwoo / Ah-tah-tah-tah",
    definitionEnglish: "Uncontrolled shaking, muscle stiffening, or seizures combined with loss of consciousness. This is a critical obstetric emergency (Eclampsia) requiring immediate magnesium sulfate.",
    definitionIgbo: "Ihe mberede ebe ahụ nne dị ime na-akpọ rịgịrịgị, anya ya atụgharịa, ọ maghịzị onwe ya n'oge ime ma ọ bụ n'oge ọmụmụ.",
    healthAdviceIgbo: "Nke a bụ otu n'ime nnukwu ihe mberede kacha dị ize ndụ! Ọ na-egbu nne na nwa n'ime obere oge ma ọ bụrụ na enyeghị ọgwụ pụrụ iche nke bụ Magnesium Sulfate ozugbo. Biko kpọga nne ahụ na GMC ozugbo na keke ma ọ bụ ụgbọ ala, ma nọgide na-eme ka ọ tọgbọrọ n'akụkụ ya ka ọ ghara ikuru asọ mmiri ọgbụgba ya."
    ,
    audioDuration: "1:15",
    audioDialogue: "Ndị mụrụ nwa, gee ntị nke ọma, ihe nkwụ ma ọ bụ atatata bụ nnukwu ihe mberede kacha njọ! Ọ bụrụ na ahụ nne dị ime amali rịgịrịgị, anya ya atụgharịa ma ọ maghị onwe ya, nke a bụ ọkụ ọgbụgba ndụ! Unu egbughị oge ọ bụla na-ekpe ekpere n'ụlọ, biko kporo ya ga GMC ozugbo. Dọkịta ga-enye ya ọgwụ Magnesium Sulfate na oxygen iji gbanyụọ nkwụ ahụ ma zọpụta ndụ ya na nwa ya n'ime obere sekọnd ole na ole."
  },
  {
    id: "bleeding",
    englishTerm: "Vaginal Bleeding",
    igboTerm: "Ọbara Ọgbụgba n'Ebe Ọmụmụ",
    igboPronunciation: "Oh-bah-rah Oh-gboo-gbah",
    definitionEnglish: "Any blood flow from the vagina during pregnancy. Always abnormal and considered a critical threat to maternal and fetal life.",
    definitionIgbo: "Ọbara ọ bụla na-agbapụta n'ebe omụmụ nne n'oge ọ dị ime, ma ọ bụ nke dị nwayọ ma ọ bụ nke buru ibu.",
    healthAdviceIgbo: "Ọbara ọgbụgba n'oge ime bụ nnukwu ihe mberede. Ọ nwere ike ịpụta na nwa na-achọ ịwụpu, ma ọ bụ na nwa mịrị emiri n'ebe na-adịghị mma n'akpa nwa (Abruptio Placentae / Placenta Previa). Nne ahụ ga-edina ala n'ụgbọ njem ma gaa GMC ozugbo maka ọrụ ịwa ahụ mberede iji zọpụta ha abụọ.",
    audioDuration: "0:58",
    audioDialogue: "Ezigbo nne, ọ bụrụ na ị hụ ọbara ọ bụla n'ebe omụmụ gị mgbe ị dị ime, ma ọ bụ obere ọbara ma ọ bụ ọbara buru ibu, ọ bụghị ihe egwuregwu! Ọ bụ ọkụ mberede! Nke a nwere ike ịpụta na akpa nwa gị nwere nsogbu ma ọ bụ na nwa ahụ na-atụ anya ịbịa tupu oge eruo. Biko edinala n'ụlọ na-eche, gbaa ọsọ gaa GMC. Debe ahụ gị ala ka nne ghara ịda mbà n'ike ọbara mgbe a na-aga ụlọ ọgwụ."
  }
];

interface IgboGlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTermId?: string | null;
}

export function IgboGlossaryModal({ isOpen, onClose, defaultTermId }: IgboGlossaryModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm>(IGBO_GLOSSARY[0]);
  
  // Audio Player State Simulation
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [simulatedTime, setSimulatedTime] = useState("0:00");
  
  const timerRef = useRef<any>(null);

  // Sync default term id when opened
  useEffect(() => {
    if (defaultTermId) {
      const match = IGBO_GLOSSARY.find(t => t.id === defaultTermId);
      if (match) {
        setSelectedTerm(match);
      }
    }
  }, [defaultTermId, isOpen]);

  // Reset audio when selected term changes
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    setSimulatedTime("0:00");
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [selectedTerm]);

  // Handle audio simulation progress
  useEffect(() => {
    if (isPlaying) {
      const durationSeconds = parseInt(selectedTerm.audioDuration.split(":")[1]) + parseInt(selectedTerm.audioDuration.split(":")[0]) * 60;
      let currentSeconds = Math.floor((progress / 100) * durationSeconds);
      
      timerRef.current = setInterval(() => {
        currentSeconds += 1;
        if (currentSeconds >= durationSeconds) {
          setIsPlaying(false);
          setProgress(0);
          setSimulatedTime("0:00");
          clearInterval(timerRef.current);
        } else {
          const calculatedProgress = (currentSeconds / durationSeconds) * 100;
          setProgress(calculatedProgress);
          
          const mins = Math.floor(currentSeconds / 60);
          const secs = currentSeconds % 60;
          setSimulatedTime(`${mins}:${secs < 10 ? "0" : ""}${secs}`);
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, selectedTerm, progress]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const filteredTerms = IGBO_GLOSSARY.filter(t => 
    t.englishTerm.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.igboTerm.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto" id="igbo-glossary-overlay">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl max-w-4xl w-full border border-slate-100 shadow-2xl flex flex-col md:flex-row overflow-hidden h-[90vh] max-h-[640px]"
          id="igbo-glossary-modal"
        >
          {/* LEFT PANEL: SEARCH & TERM LIST */}
          <div className="w-full md:w-2/5 border-r border-slate-100 bg-slate-50 flex flex-col h-1/2 md:h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-2 text-brand-purple">
                <Languages className="w-5 h-5 text-brand-purple" />
                <h3 className="font-bold text-sm uppercase tracking-wide">Onye Nsụgharị Igbo</h3>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Local Maternal Medical Glossary & Advice</p>
              
              {/* Search bar */}
              <div className="relative mt-3">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search term / Chọọ okwu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs outline-none focus:bg-white focus:border-brand-purple transition-all text-slate-800"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredTerms.map((term) => {
                const isSelected = term.id === selectedTerm.id;
                return (
                  <button
                    key={term.id}
                    onClick={() => setSelectedTerm(term)}
                    className={`w-full text-left p-3 rounded-2xl transition-all flex items-center justify-between ${
                      isSelected 
                        ? "bg-purple-100/60 text-[#32134F] border border-purple-200/50" 
                        : "hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <div>
                      <span className="block font-bold text-xs">{term.englishTerm}</span>
                      <span className="block text-[10px] text-slate-500 italic mt-0.5 font-medium">{term.igboTerm}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isSelected ? "translate-x-0.5 text-brand-purple" : ""}`} />
                  </button>
                );
              })}
              {filteredTerms.length === 0 && (
                <p className="text-center py-8 text-xs text-slate-400">Chọpụtaghị okwu ọ bụla.</p>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: DETAIL, TRANSLATION & SIMULATED PLAYBACK */}
          <div className="w-full md:w-3/5 flex flex-col h-1/2 md:h-full bg-white overflow-y-auto">
            {/* Header block */}
            <div className="p-5 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[9px] font-bold text-brand-purple uppercase bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-full">
                  Maternal Clinical Glossary
                </span>
                <h4 className="font-extrabold text-base text-slate-800 mt-2 flex items-center gap-2">
                  <span>{selectedTerm.englishTerm}</span>
                </h4>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                id="close-glossary-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content body */}
            <div className="p-5 space-y-5 flex-1">
              
              {/* English & Igbo Translations side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                  <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">Clinical Definition</span>
                  <p className="text-xs text-slate-700 leading-normal font-medium">{selectedTerm.definitionEnglish}</p>
                </div>

                <div className="p-3.5 bg-purple-50/40 border border-purple-100/60 rounded-2xl">
                  <span className="block text-[9px] text-purple-500 font-bold uppercase tracking-wider mb-1">Nsụgharị Igbo (Igbo Meaning)</span>
                  <p className="text-xs text-[#32134F] font-bold leading-normal">{selectedTerm.igboTerm}</p>
                  <span className="block text-[10px] text-purple-600 italic font-medium mt-1">Pronounced: "{selectedTerm.igboPronunciation}"</span>
                  <p className="text-[11px] text-slate-600 leading-normal mt-1.5 font-medium">{selectedTerm.definitionIgbo}</p>
                </div>
              </div>

              {/* Friendly Local Igbo Advice Box */}
              <div className="p-4 bg-teal-50 border border-teal-100 text-teal-900 rounded-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-teal-500/5 rounded-full blur-xl -mr-6 -mt-6" />
                <h5 className="text-[10px] text-teal-800 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>Ndụmọdụ Ahụ Ike n'Igbo (Igbo Clinical Counseling Guidance)</span>
                </h5>
                <p className="text-xs font-semibold leading-relaxed text-slate-700">
                  {selectedTerm.healthAdviceIgbo}
                </p>
              </div>

              {/* HIGH-FIDELITY SIMULATED AUDIO CLINICAL COUNSELING PLAYER */}
              <div className="bg-[#32134F] text-white p-4.5 rounded-2xl shadow-md border border-purple-950/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-pink-400 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200">
                      Simulated Igbo Health Audio Counseling Guide
                    </span>
                  </div>
                  <span className="text-[10px] text-purple-300 font-semibold uppercase bg-white/5 px-2 py-0.5 rounded-md">
                    Enugu Dialect
                  </span>
                </div>

                {/* Patient Dialogue Transcript view */}
                <div className="bg-black/20 p-3 rounded-xl border border-white/5 text-[11px] text-purple-100 italic leading-relaxed mb-4 max-h-20 overflow-y-auto">
                  "{selectedTerm.audioDialogue}"
                </div>

                {/* Player Controls layout */}
                <div className="flex items-center gap-4">
                  {/* Play Button */}
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 bg-white hover:bg-pink-50 text-[#32134F] rounded-full flex items-center justify-center font-bold shadow-md transition-all shrink-0 hover:scale-105 active:scale-95"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 text-[#32134F] fill-current" /> : <Play className="w-4 h-4 text-[#32134F] fill-current translate-x-0.5" />}
                  </button>

                  <div className="flex-1 space-y-1">
                    {/* Equalizer Waveform simulation when playing */}
                    <div className="h-4 flex items-end gap-1 overflow-hidden opacity-95">
                      {[...Array(24)].map((_, i) => {
                        // Create a rhythmic wave pattern that moves if playing
                        const randomHeight = isPlaying ? Math.floor(Math.random() * 12) + 2 : 2;
                        return (
                          <span
                            key={i}
                            className="w-1 bg-pink-400 rounded-t-full transition-all duration-150"
                            style={{ height: `${randomHeight}px` }}
                          />
                        );
                      })}
                    </div>

                    {/* Timeline Slider Progress Bar */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-purple-200">{simulatedTime}</span>
                      
                      <div className="flex-1 bg-white/10 h-1.5 rounded-full overflow-hidden relative cursor-pointer"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const clickX = e.clientX - rect.left;
                          const percentage = (clickX / rect.width) * 100;
                          setProgress(percentage);
                        }}
                      >
                        <div 
                          className="bg-pink-400 h-full rounded-full transition-all" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <span className="text-[10px] font-mono text-purple-200">{selectedTerm.audioDuration}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-slate-400" />
              <span>Developed in partnership with GMC Community Maternity Educators, Enugu State, Nigeria.</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

interface IgboInfoButtonProps {
  termId: string;
  className?: string;
}

export function IgboInfoButton({ termId, className = "" }: IgboInfoButtonProps) {
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsGlossaryOpen(true);
        }}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 bg-purple-50 text-[#32134F] hover:bg-purple-100 border border-purple-100 rounded-md text-[10px] font-bold transition-all ${className}`}
        title="Igbo clinical guide & explanation"
      >
        <Languages className="w-3 h-3 text-[#32134F]" />
        <span>Igbo Translator</span>
      </button>

      <IgboGlossaryModal 
        isOpen={isGlossaryOpen} 
        onClose={() => setIsGlossaryOpen(false)} 
        defaultTermId={termId}
      />
    </>
  );
}
