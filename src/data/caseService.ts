import { Case } from "../types";
import { INITIAL_SEED_CASES } from "./seedCases";

const STORAGE_KEY = "momsafe_cases_v1";

export function getLocalStoredCases(): Case[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore localStorage parse errors
  }
  return INITIAL_SEED_CASES;
}

export function saveLocalStoredCases(cases: Case[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  } catch (e) {
    // Ignore storage quota errors
  }
}

export async function fetchAllCases(): Promise<Case[]> {
  try {
    const res = await fetch("/api/cases", {
      headers: { "Accept": "application/json" }
    });
    if (res.ok) {
      const serverCases: Case[] = await res.json();
      if (Array.isArray(serverCases) && serverCases.length > 0) {
        saveLocalStoredCases(serverCases);
        return serverCases;
      }
    }
  } catch (err) {
    // Graceful offline fallback: log info without throwing unhandled rejection
    console.info("Using local cached maternal registry data (offline/fallback mode).");
  }

  // Fallback to local storage or initial seeds
  return getLocalStoredCases();
}

export async function submitCase(newCase: Partial<Case>): Promise<Case> {
  const currentCases = getLocalStoredCases();
  const nextId = newCase.id || `ASM-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  
  const formattedCase: Case = {
    id: nextId,
    name: newCase.name || "Unknown Patient",
    age: Number(newCase.age) || 25,
    community: newCase.community || "Umuchigbo",
    gestationalAge: newCase.gestationalAge || "36 weeks",
    parity: Number(newCase.parity) || 0,
    nextOfKin: newCase.nextOfKin || "",
    nextOfKinPhone: newCase.nextOfKinPhone || "",
    phone: newCase.phone || "",
    consent: newCase.consent !== undefined ? newCase.consent : true,
    bleeding: newCase.bleeding || "none",
    severePain: !!newCase.severePain,
    severeHeadache: !!newCase.severeHeadache,
    visualDisturbance: !!newCase.visualDisturbance,
    swellingFeet: !!newCase.swellingFeet,
    highFever: !!newCase.highFever,
    convulsions: !!newCase.convulsions,
    breathingDifficulty: !!newCase.breathingDifficulty,
    lossOfConsciousness: !!newCase.lossOfConsciousness,
    reducedFetalMovement: !!newCase.reducedFetalMovement,
    laborProgressConcerns: !!newCase.laborProgressConcerns,
    customNote: newCase.customNote || "",
    systolicBP: Number(newCase.systolicBP) || 120,
    diastolicBP: Number(newCase.diastolicBP) || 80,
    pulse: Number(newCase.pulse) || 75,
    temperature: Number(newCase.temperature) || 36.6,
    respRate: Number(newCase.respRate) || 18,
    riskCategory: newCase.riskCategory || "GREEN",
    riskScore: newCase.riskScore || 10,
    reasonCodes: newCase.reasonCodes || ["NORMAL_VITALS"],
    reasonText: newCase.reasonText || "No immediate danger sign detected.",
    requiredAction: newCase.requiredAction || "CONTINUE_MONITORING_ANC",
    dataQuality: newCase.dataQuality || "COMPLETE",
    rulesVersion: "GMC-CLIN-1.0",
    status: newCase.status || "New",
    triageCategory: newCase.triageCategory || "",
    overrideReason: newCase.overrideReason || "",
    overrideClinician: newCase.overrideClinician || "",
    createdAt: newCase.createdAt || new Date().toISOString(),
    updatedAt: newCase.updatedAt || new Date().toISOString(),
    tbaName: newCase.tbaName || "Community Caregiver",
    tbaPhone: newCase.tbaPhone || "08000000000",
    checklist: newCase.checklist || [
      { id: "chk-1", label: "Alert accepted by triage team", checked: false },
      { id: "chk-2", label: "TBA contacted and transport confirmed", checked: false },
      { id: "chk-3", label: "Clinician assigned", checked: false },
      { id: "chk-4", label: "Resuscitation bay prepared", checked: false },
      { id: "chk-5", label: "Emergency medications checked", checked: false },
      { id: "chk-6", label: "Blood supply match standby", checked: false },
    ],
    notes: newCase.notes || [
      { author: "System", text: "Case submitted from community.", timestamp: new Date().toISOString() }
    ],
    visitHistory: newCase.visitHistory || []
  };

  // 1. Optimistically store in localStorage
  const updatedCases = [formattedCase, ...currentCases.filter(c => c.id !== formattedCase.id)];
  saveLocalStoredCases(updatedCases);

  // 2. Transmit to server
  try {
    const res = await fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formattedCase)
    });
    if (res.ok) {
      const serverSaved = await res.json();
      return serverSaved;
    }
  } catch (e) {
    console.info("Case stored in local offline registry.");
  }

  return formattedCase;
}

export async function updateCase(caseId: string, updates: Partial<Case>): Promise<Case | null> {
  const currentCases = getLocalStoredCases();
  const index = currentCases.findIndex(c => c.id === caseId);
  if (index === -1) return null;

  const existing = currentCases[index];
  const updated: Case = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  currentCases[index] = updated;
  saveLocalStoredCases(currentCases);

  // Transmit to server
  try {
    const res = await fetch(`/api/cases/${caseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates)
    });
    if (res.ok) {
      const serverUpdated = await res.json();
      return serverUpdated;
    }
  } catch (e) {
    console.info("Update saved to local offline registry.");
  }

  return updated;
}
