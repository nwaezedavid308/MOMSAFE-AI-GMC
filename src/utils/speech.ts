// Speech Synthesis helper for Igbo, Nigerian Pidgin, and English voice narration

export function playSpokenVoice(text: string, lang: "igbo" | "pidgin" | "english" = "igbo") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("Speech synthesis not supported in this environment");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set voice characteristics for clarity & warmth
  utterance.rate = 0.88; // Slightly slower for clear understanding
  utterance.pitch = 1.05; // Friendly, warm pitch
  utterance.volume = 1.0;

  // Find suitable voice if available (look for en-NG, en-GB, or fallback)
  const voices = window.speechSynthesis.getVoices();
  const nigerianVoice = voices.find(v => v.lang.includes("NG") || v.name.includes("Nigeria"));
  const africanVoice = voices.find(v => v.lang.includes("ZA") || v.lang.includes("KE") || v.lang.includes("GH"));
  const britishVoice = voices.find(v => v.lang.includes("GB") || v.lang.includes("en-GB"));
  
  if (nigerianVoice) {
    utterance.voice = nigerianVoice;
  } else if (africanVoice) {
    utterance.voice = africanVoice;
  } else if (britishVoice) {
    utterance.voice = britishVoice;
  }

  // Set appropriate language code
  if (lang === "igbo" || lang === "pidgin") {
    utterance.lang = "en-NG"; // Uses West African / Nigerian phonetic synthesizer
  } else {
    utterance.lang = "en-US";
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpokenVoice() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
