import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Bot, ShieldAlert, Sparkles, BookOpen, AlertCircle } from "lucide-react";
import { Case } from "../types";
import { VoiceMicButton } from "./TBAPortal";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface MaternalAssistantProps {
  activeCase?: Case | null;
}

const PRESET_QUESTIONS = [
  "What are standard checks for mild headaches?",
  "How can I measure blood pressure accurately?",
  "What should I do if a pregnant woman has a high fever?",
  "What is the standard procedure for a suspected red flag?"
];

export default function MaternalAssistant({ activeCase }: MaternalAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Welcome to MOMSAFE Assistant. I can help answer questions from our approved maternal health knowledge base. (Remember, I am an assistant and do not replace a real doctor's clinical judgment).",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = {
      id: Math.random().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          userQuery: text,
          contextData: activeCase ? {
            name: activeCase.name,
            gestationalAge: activeCase.gestationalAge,
            systolicBP: activeCase.systolicBP,
            diastolicBP: activeCase.diastolicBP,
            pulse: activeCase.pulse,
            bleeding: activeCase.bleeding,
            symptomsJoined: [
              activeCase.severePain ? "severe pain" : "",
              activeCase.severeHeadache ? "severe headache" : "",
              activeCase.visualDisturbance ? "vision disturbance" : "",
              activeCase.swellingFeet ? "swelling of feet" : "",
              activeCase.highFever ? "high fever" : "",
              activeCase.convulsions ? "convulsions or fits" : "",
              activeCase.breathingDifficulty ? "breathing difficulty" : "",
              activeCase.lossOfConsciousness ? "loss of consciousness" : "",
              activeCase.reducedFetalMovement ? "reduced fetal movement" : "",
              activeCase.laborProgressConcerns ? "labor concerns" : "",
            ].filter(Boolean).join(", ")
          } : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: Math.random().toString(),
        role: "assistant",
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "assistant",
          content: "Sorry, I had trouble connecting. If you have an urgent question or a patient is in danger, please call Googwill Medical Centre immediately on 08000057777.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-150 shadow-sm flex flex-col h-[520px] overflow-hidden">
      {/* Header */}
      <div className="bg-brand-purple text-white px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-white/10 rounded-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm tracking-wide">MOMSAFE Guide</h3>
            <p className="text-xs text-purple-200">GMC clinical decision support</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/10 rounded-full text-[10px] font-medium tracking-wider uppercase text-purple-100">
          <Sparkles className="w-3 h-3 text-purple-200" />
          <span>Layer 3 AI</span>
        </div>
      </div>

      {/* Safety Floor Warning Banner */}
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-2.5 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-normal">
          <strong>Safe-use Notice:</strong> This assistant handles general questions only. It does not diagnose medical conditions. For any red flag, call <strong>08000057777</strong> immediately.
        </p>
      </div>

      {/* Active Case Context Banner (if available) */}
      {activeCase && (
        <div className="bg-purple-50 border-b border-purple-100 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-brand-purple">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Active context: <strong>{activeCase.name}</strong> ({activeCase.gestationalAge})</span>
          </div>
          <span className="text-[10px] bg-purple-100 px-2 py-0.5 rounded-full font-semibold text-brand-purple">
            {activeCase.riskCategory} Risk
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-purple-100 text-brand-purple flex items-center justify-center shrink-0 mt-0.5 border border-purple-200">
                <Bot className="w-4 h-4" />
              </div>
            )}
            
            <div className="flex flex-col max-w-[80%]">
              <div
                className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-brand-purple text-white rounded-tr-none"
                    : "bg-white text-slate-800 border border-slate-100 rounded-tl-none shadow-sm"
                }`}
              >
                {/* Formatting helper to put newlines nicely */}
                {msg.content.split("\n").map((line, i) => (
                  <p key={i} className={line.trim() ? "mb-1.5 last:mb-0" : "h-2"}>
                    {line}
                  </p>
                ))}
              </div>
              <span
                className={`text-[9px] text-slate-400 mt-1 ${
                  msg.role === "user" ? "text-right" : "text-left"
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-purple-100 text-brand-purple flex items-center justify-center shrink-0 mt-0.5 border border-purple-200">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm max-w-[80%]">
              <div className="flex gap-1.5 items-center justify-center py-1">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips (Preset questions) */}
      <div className="p-2 border-t border-slate-100 bg-white overflow-x-auto whitespace-nowrap flex gap-1.5 items-center">
        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mr-1 px-1.5">
          Ask:
        </span>
        {PRESET_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={loading}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-[10px] text-brand-purple hover:bg-brand-purple hover:text-white rounded-full border border-purple-100/50 font-medium transition-colors"
          >
            <BookOpen className="w-2.5 h-2.5 shrink-0" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="p-3 border-t border-slate-100 bg-white flex items-center gap-2"
      >
        <VoiceMicButton
          label="Voice"
          showText={false}
          onTranscript={(text) => setInput((prev) => (prev ? `${prev} ${text}` : text))}
        />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask or speak a maternal care question..."
          className="flex-1 bg-slate-50 border border-slate-200 focus:border-brand-purple focus:ring-1 focus:ring-brand-purple rounded-xl px-3 py-2 text-xs text-slate-800 outline-none transition-all"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 bg-brand-purple text-white disabled:bg-slate-200 disabled:text-slate-400 rounded-xl hover:bg-dark-purple transition-all shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
