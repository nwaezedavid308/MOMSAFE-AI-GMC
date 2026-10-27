import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily/safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI assistant will run in fallback mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "dummy_key",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// In-Memory Database for Case Sharing
interface CaseChecklist {
  id: string;
  label: string;
  checked: boolean;
}

interface Case {
  id: string; // ASM-YYYY-XXXXXX
  name: string;
  age: number;
  community: string;
  gestationalAge: string; // e.g. "36 weeks"
  parity: number;
  nextOfKin: string;
  nextOfKinPhone?: string;
  phone: string;
  consent: boolean;
  visitHistory?: Array<{
    id: string;
    visitDate: string;
    symptomSummary: string;
    customNote: string;
    systolicBP?: number;
    diastolicBP?: number;
    pulse?: number;
    temperature?: number;
    respRate?: number;
    riskCategory: "GREEN" | "AMBER" | "RED" | "GREY";
    reasonText?: string;
    recordedBy?: string;
  }>;
  
  // Symptoms & Signs
  bleeding: "none" | "mild" | "severe";
  severePain: boolean;
  severeHeadache: boolean;
  visualDisturbance: boolean;
  swellingFeet: boolean;
  highFever: boolean;
  convulsions: boolean;
  breathingDifficulty: boolean;
  lossOfConsciousness: boolean;
  reducedFetalMovement: boolean;
  laborProgressConcerns: boolean;
  customNote: string;

  // Vitals
  systolicBP: number;
  diastolicBP: number;
  pulse: number;
  temperature: number;
  respRate: number;

  // AI Evaluation Result
  riskCategory: "GREEN" | "AMBER" | "RED" | "GREY";
  riskScore: number;
  reasonCodes: string[];
  reasonText: string;
  requiredAction: string;
  dataQuality: "COMPLETE" | "INCOMPLETE_DATA" | "RECHECK_REQUIRED";
  rulesVersion: string;

  // Hospital Status
  status: "New" | "Acknowledged" | "Contacted" | "Preparing" | "In transit" | "Arrived" | "Closed";
  triageCategory: "GREEN" | "AMBER" | "RED" | ""; // Doctor override
  overrideReason: string;
  overrideClinician: string;
  createdAt: string;
  updatedAt: string;
  tbaName: string;
  tbaPhone: string;
  
  // Hospital Preparation checklist
  checklist: CaseChecklist[];
  notes: Array<{ author: string; text: string; timestamp: string }>;
  arrivalOutcome?: {
    arrivalTime: string;
    treatmentDisposition: string;
    maternalOutcome: string;
    newbornOutcome: string;
  };
}

// Initial seed cases so the dashboard is populated with high quality data
let cases: Case[] = [
  {
    id: "ASM-2026-000101",
    name: "Chioma Obi",
    age: 24,
    community: "Umuchigbo",
    gestationalAge: "38 weeks",
    parity: 2,
    nextOfKin: "Emeka Obi (Husband, 08034567812)",
    phone: "08051234567",
    consent: true,
    bleeding: "severe",
    severePain: true,
    severeHeadache: false,
    visualDisturbance: false,
    swellingFeet: true,
    highFever: false,
    convulsions: false,
    breathingDifficulty: false,
    lossOfConsciousness: false,
    reducedFetalMovement: true,
    laborProgressConcerns: false,
    customNote: "Patient arrived at TBA post onset of heavy bleeding. Expressing acute abdominal pains.",
    systolicBP: 95,
    diastolicBP: 58,
    pulse: 112,
    temperature: 36.8,
    respRate: 22,
    riskCategory: "RED",
    riskScore: 88,
    reasonCodes: ["SEVERE_BLEEDING", "BP_LOW", "PULSE_HIGH", "REDUCED_FETAL_MOVEMENT"],
    reasonText: "Critical: Severe vaginal bleeding, low blood pressure indicating shock, high heart rate, and reduced fetal movement were detected.",
    requiredAction: "REFER_NOW_CALL_HOSPITAL",
    dataQuality: "COMPLETE",
    rulesVersion: "GMC-CLIN-1.0",
    status: "New",
    triageCategory: "",
    overrideReason: "",
    overrideClinician: "",
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8 mins ago
    updatedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    tbaName: "Nurse Eunice Nnaji",
    tbaPhone: "08030012233",
    checklist: [
      { id: "chk-1", label: "Alert accepted by triage team", checked: false },
      { id: "chk-2", label: "TBA contacted and transport confirmed", checked: false },
      { id: "chk-3", label: "Clinician assigned", checked: false },
      { id: "chk-4", label: "Resuscitation bay prepared", checked: false },
      { id: "chk-5", label: "Emergency medications checked", checked: false },
      { id: "chk-6", label: "Blood supply match standby", checked: false },
    ],
    notes: [
      { author: "System", text: "Case submitted from community with RED risk evaluation.", timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString() }
    ],
  },
  {
    id: "ASM-2026-000102",
    name: "Amara Okafor",
    age: 28,
    community: "Enugu East LGA",
    gestationalAge: "32 weeks",
    parity: 1,
    nextOfKin: "Joseph Okafor (Husband, 08061234567)",
    phone: "08059876543",
    consent: true,
    bleeding: "none",
    severePain: false,
    severeHeadache: true,
    visualDisturbance: true,
    swellingFeet: true,
    highFever: false,
    convulsions: false,
    breathingDifficulty: false,
    lossOfConsciousness: false,
    reducedFetalMovement: false,
    laborProgressConcerns: false,
    customNote: "Severe headache that refuses to go away. Blur vision and heavy swelling of feet for 3 days.",
    systolicBP: 165,
    diastolicBP: 105,
    pulse: 88,
    temperature: 37.1,
    respRate: 18,
    riskCategory: "RED",
    riskScore: 92,
    reasonCodes: ["CRITICAL_HIGH_BP", "SEVERE_HEADACHE", "VISUAL_DISTURBANCE"],
    reasonText: "Critical: Dangerously high blood pressure (165/105 mmHg), paired with severe headaches and visual disturbances. Highly indicative of severe pre-eclampsia.",
    requiredAction: "REFER_NOW_CALL_HOSPITAL",
    dataQuality: "COMPLETE",
    rulesVersion: "GMC-CLIN-1.0",
    status: "Preparing",
    triageCategory: "",
    overrideReason: "",
    overrideClinician: "",
    createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(), // 42 mins ago
    updatedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    tbaName: "Mrs. Ngozi Edeh",
    tbaPhone: "08041122334",
    checklist: [
      { id: "chk-1", label: "Alert accepted by triage team", checked: true },
      { id: "chk-2", label: "TBA contacted and transport confirmed", checked: true },
      { id: "chk-3", label: "Clinician assigned", checked: true },
      { id: "chk-4", label: "Resuscitation bay prepared", checked: false },
      { id: "chk-5", label: "Emergency medications checked (Magnesium Sulfate standby)", checked: true },
      { id: "chk-6", label: "Blood supply match standby", checked: false },
    ],
    notes: [
      { author: "Nurse Agnes", text: "Contacted Mrs. Ngozi Edeh (TBA). Patient is currently boarding a local tricycle (Keke) to Googwill Medical Centre. Expected arrival time: 15 mins.", timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString() }
    ],
  },
  {
    id: "ASM-2026-000103",
    name: "Blessing Egwu",
    age: 19,
    community: "Iji Nike",
    gestationalAge: "24 weeks",
    parity: 0,
    nextOfKin: "Theresa Egwu (Mother, 08077654321)",
    phone: "08139988776",
    consent: true,
    bleeding: "none",
    severePain: false,
    severeHeadache: false,
    visualDisturbance: false,
    swellingFeet: false,
    highFever: false,
    convulsions: false,
    breathingDifficulty: false,
    lossOfConsciousness: false,
    reducedFetalMovement: false,
    laborProgressConcerns: false,
    customNote: "Routine consultation. No physical complains. Slightly tired.",
    systolicBP: 112,
    diastolicBP: 74,
    pulse: 78,
    temperature: 36.6,
    respRate: 16,
    riskCategory: "GREEN",
    riskScore: 10,
    reasonCodes: ["NORMAL_VITALS"],
    reasonText: "No immediate danger sign detected. All vital signs are within acceptable normal physiological parameters.",
    requiredAction: "CONTINUE_MONITORING_ANC",
    dataQuality: "COMPLETE",
    rulesVersion: "GMC-CLIN-1.0",
    status: "Closed",
    triageCategory: "GREEN",
    overrideReason: "Confirming normal assessment",
    overrideClinician: "Dr. Chinedu Okafor",
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    tbaName: "Mrs. Agnes Nze",
    tbaPhone: "08055554433",
    checklist: [
      { id: "chk-1", label: "Alert accepted by triage team", checked: true },
      { id: "chk-2", label: "TBA contacted and transport confirmed", checked: true },
      { id: "chk-3", label: "Clinician assigned", checked: true },
    ],
    notes: [
      { author: "Dr. Okafor", text: "Confirmed normal vital stats. Patient was given standard antenatal counsel and discharged safely with appointment card.", timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString() }
    ],
    arrivalOutcome: {
      arrivalTime: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
      treatmentDisposition: "Discharged Home with Scheduled ANC Appointment",
      maternalOutcome: "Healthy / Stable",
      newbornOutcome: "N/A - Ongoing Pregnancy",
    }
  }
];

// Helper to determine risk logically on the server as safety floor
function evaluateMaternalRisk(data: Partial<Case>): {
  riskCategory: "GREEN" | "AMBER" | "RED" | "GREY";
  riskScore: number;
  reasonCodes: string[];
  reasonText: string;
  requiredAction: string;
  dataQuality: "COMPLETE" | "INCOMPLETE_DATA" | "RECHECK_REQUIRED";
} {
  const reasonCodes: string[] = [];
  let score = 0;
  
  // 1. Missing / incomplete critical parameters check
  const hasBP = data.systolicBP && data.diastolicBP;
  const hasPulse = data.pulse;
  const hasTemp = data.temperature;
  const hasResp = data.respRate;
  
  if (!hasBP || !hasPulse || !hasTemp || !hasResp) {
    return {
      riskCategory: "GREY",
      riskScore: 0,
      reasonCodes: ["MISSING_CRITICAL_VITALS"],
      reasonText: "Assessment incomplete. Please take and enter all vital signs to complete the safety review.",
      requiredAction: "COMPLETE_MISSING_DATA",
      dataQuality: "INCOMPLETE_DATA",
    };
  }

  // Plausible validation check
  const sys = data.systolicBP!;
  const dia = data.diastolicBP!;
  const pulse = data.pulse!;
  const temp = data.temperature!;
  const rr = data.respRate!;

  if (sys < 40 || sys > 260 || dia < 30 || dia > 160 || pulse < 30 || pulse > 200 || temp < 32 || temp > 43 || rr < 6 || rr > 60) {
    return {
      riskCategory: "GREY",
      riskScore: 0,
      reasonCodes: ["IMPLAUSIBLE_VITAL_SIGNS"],
      reasonText: "Critical vital values appear physiologically implausible. Please double check and remeasure.",
      requiredAction: "RECHECK_REQUIRED",
      dataQuality: "RECHECK_REQUIRED",
    };
  }

  // 2. Hard Red Flags (clinician-approved overrides score)
  let isRed = false;
  
  if (data.bleeding === "severe") {
    reasonCodes.push("SEVERE_BLEEDING");
    isRed = true;
    score += 50;
  }
  if (data.convulsions) {
    reasonCodes.push("CONVULSIONS_FITS");
    isRed = true;
    score += 50;
  }
  if (data.severePain) {
    reasonCodes.push("SEVERE_PAIN");
    isRed = true;
    score += 25;
  }
  if (data.severeHeadache && data.visualDisturbance) {
    reasonCodes.push("PRE_ECLAMPSIA_SIGNS");
    isRed = true;
    score += 30;
  } else if (data.severeHeadache) {
    reasonCodes.push("SEVERE_HEADACHE");
    score += 15;
  }
  if (data.lossOfConsciousness) {
    reasonCodes.push("LOSS_OF_CONSCIOUSNESS");
    isRed = true;
    score += 50;
  }
  if (data.breathingDifficulty) {
    reasonCodes.push("BREATHING_DIFFICULTY");
    isRed = true;
    score += 40;
  }
  if (data.reducedFetalMovement) {
    reasonCodes.push("REDUCED_FETAL_MOVEMENT");
    score += 20;
    // Late trimester reduced movement can be red flag
    if (data.gestationalAge && parseInt(data.gestationalAge) >= 28) {
      isRed = true;
    }
  }

  // Vital Red Flags
  if (sys >= 160 || dia >= 110) {
    reasonCodes.push("CRITICAL_HIGH_BP");
    isRed = true;
    score += 40;
  }
  if (sys < 90 || dia < 50) {
    reasonCodes.push("CRITICAL_LOW_BP");
    isRed = true;
    score += 35;
  }
  if (pulse >= 120 || pulse <= 50) {
    reasonCodes.push("CRITICAL_PULSE");
    isRed = true;
    score += 20;
  }
  if (temp >= 38.5) {
    reasonCodes.push("CRITICAL_HIGH_TEMP");
    isRed = true;
    score += 20;
  } else if (temp <= 35.0) {
    reasonCodes.push("CRITICAL_LOW_TEMP");
    isRed = true;
    score += 20;
  }
  if (rr >= 30 || rr <= 10) {
    reasonCodes.push("CRITICAL_RESP_RATE");
    isRed = true;
    score += 20;
  }

  // Evaluate final categories
  if (isRed) {
    const reasonsStr = reasonCodes.map(c => c.replace(/_/g, " ").toLowerCase()).join(", ");
    return {
      riskCategory: "RED",
      riskScore: Math.min(100, Math.max(75, score)),
      reasonCodes,
      reasonText: `Emergency referral required. Danger signs detected: ${reasonsStr}.`,
      requiredAction: "REFER_NOW_CALL_HOSPITAL",
      dataQuality: "COMPLETE",
    };
  }

  // 3. Amber Flags
  let isAmber = false;
  if (data.bleeding === "mild") {
    reasonCodes.push("MILD_BLEEDING");
    isAmber = true;
    score += 25;
  }
  if (data.swellingFeet) {
    reasonCodes.push("FEET_SWELLING");
    score += 10;
    isAmber = true;
  }
  if (data.laborProgressConcerns) {
    reasonCodes.push("LABOR_PROGRESS_CONCERNS");
    score += 15;
    isAmber = true;
  }
  if ((sys >= 140 && sys <= 159) || (dia >= 90 && dia <= 109)) {
    reasonCodes.push("HIGH_BP");
    score += 20;
    isAmber = true;
  }
  if (pulse >= 100 && pulse <= 119) {
    reasonCodes.push("ELEVATED_PULSE");
    score += 15;
    isAmber = true;
  }
  if (temp >= 37.5 && temp < 38.5) {
    reasonCodes.push("MODERATE_FEVER");
    score += 15;
    isAmber = true;
  }

  if (isAmber) {
    const reasonsStr = reasonCodes.map(c => c.replace(/_/g, " ").toLowerCase()).join(", ");
    return {
      riskCategory: "AMBER",
      riskScore: Math.min(74, Math.max(30, score)),
      reasonCodes,
      reasonText: `Potential risk or uncertain information. Signs noticed: ${reasonsStr}. Please monitor and prepare.`,
      requiredAction: "CONTACT_HOSPITAL_FOR_REVIEW",
      dataQuality: "COMPLETE",
    };
  }

  // 4. Green (Standard wording mandated: "No immediate danger sign detected")
  return {
    riskCategory: "GREEN",
    riskScore: Math.max(5, score),
    reasonCodes: ["NORMAL_VITALS"],
    reasonText: "No immediate danger sign detected. Continue standard antenatal care and routine monitoring.",
    requiredAction: "CONTINUE_MONITORING_ANC",
    dataQuality: "COMPLETE",
  };
}

// -------------------------------------------------------------
// API ENDPOINTS
// -------------------------------------------------------------

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Cases List
app.get("/api/cases", (req, res) => {
  res.json(cases);
});

// Submit New Case
app.post("/api/cases", (req, res) => {
  const body = req.body;
  
  // Calculate risk using safety-floor rules engine
  const evalResult = evaluateMaternalRisk(body);
  
  const nextNumber = cases.length + 101;
  const newCase: Case = {
    id: body.id || `ASM-2026-000${nextNumber}`,
    name: body.name || "Unknown Patient",
    age: Number(body.age) || 25,
    community: body.community || "Unknown Community",
    gestationalAge: body.gestationalAge || "Gestational age unknown",
    parity: Number(body.parity) || 0,
    nextOfKin: body.nextOfKin || "Unknown",
    nextOfKinPhone: body.nextOfKinPhone || "",
    phone: body.phone || "",
    consent: !!body.consent,
    
    // Symptoms
    bleeding: body.bleeding || "none",
    severePain: !!body.severePain,
    severeHeadache: !!body.severeHeadache,
    visualDisturbance: !!body.visualDisturbance,
    swellingFeet: !!body.swellingFeet,
    highFever: !!body.highFever,
    convulsions: !!body.convulsions,
    breathingDifficulty: !!body.breathingDifficulty,
    lossOfConsciousness: !!body.lossOfConsciousness,
    reducedFetalMovement: !!body.reducedFetalMovement,
    laborProgressConcerns: !!body.laborProgressConcerns,
    customNote: body.customNote || "",

    // Vitals
    systolicBP: Number(body.systolicBP) || 0,
    diastolicBP: Number(body.diastolicBP) || 0,
    pulse: Number(body.pulse) || 0,
    temperature: Number(body.temperature) || 0.0,
    respRate: Number(body.respRate) || 0,

    // Calculated risk
    riskCategory: body.riskCategory || evalResult.riskCategory,
    riskScore: body.riskScore || evalResult.riskScore,
    reasonCodes: body.reasonCodes || evalResult.reasonCodes,
    reasonText: body.reasonText || evalResult.reasonText,
    requiredAction: body.requiredAction || evalResult.requiredAction,
    dataQuality: body.dataQuality || evalResult.dataQuality,
    rulesVersion: "GMC-CLIN-1.0",

    // Default status & fields
    status: body.status || (evalResult.riskCategory === "RED" ? "New" : "New"),
    triageCategory: body.triageCategory || "",
    overrideReason: body.overrideReason || "",
    overrideClinician: body.overrideClinician || "",
    createdAt: body.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tbaName: body.tbaName || "Community Caregiver",
    tbaPhone: body.tbaPhone || "08000000000",
    
    checklist: body.checklist || [
      { id: "chk-1", label: "Alert accepted by triage team", checked: false },
      { id: "chk-2", label: "TBA contacted and transport confirmed", checked: false },
      { id: "chk-3", label: "Clinician assigned", checked: false },
      { id: "chk-4", label: "Resuscitation bay prepared", checked: false },
      { id: "chk-5", label: "Emergency medications checked", checked: false },
      { id: "chk-6", label: "Blood supply match standby", checked: false },
    ],
    notes: body.notes || [
      { author: "System", text: `Case generated with initial risk result: ${evalResult.riskCategory}`, timestamp: new Date().toISOString() }
    ],
    visitHistory: body.visitHistory || []
  };

  cases.unshift(newCase);
  res.status(201).json(newCase);
});

// Update Case Status & Override & Full Patient Details
app.put("/api/cases/:id", (req, res) => {
  const caseId = req.params.id;
  const idx = cases.findIndex(c => c.id === caseId);
  if (idx === -1) {
    return res.status(404).json({ error: "Case not found" });
  }

  const existing = cases[idx];
  const { 
    status, 
    triageCategory, 
    overrideReason, 
    overrideClinician, 
    arrivalOutcome,
    name,
    age,
    community,
    gestationalAge,
    parity,
    nextOfKin,
    nextOfKinPhone,
    phone,
    visitHistory,
    systolicBP,
    diastolicBP,
    pulse,
    temperature,
    respRate,
    bleeding,
    severePain,
    severeHeadache,
    visualDisturbance,
    swellingFeet,
    highFever,
    convulsions,
    breathingDifficulty,
    lossOfConsciousness,
    reducedFetalMovement,
    laborProgressConcerns,
    customNote,
    riskCategory,
    riskScore,
    reasonCodes,
    reasonText,
    requiredAction
  } = req.body;

  if (name !== undefined) existing.name = name;
  if (age !== undefined) existing.age = Number(age);
  if (community !== undefined) existing.community = community;
  if (gestationalAge !== undefined) existing.gestationalAge = gestationalAge;
  if (parity !== undefined) existing.parity = Number(parity);
  if (nextOfKin !== undefined) existing.nextOfKin = nextOfKin;
  if (nextOfKinPhone !== undefined) existing.nextOfKinPhone = nextOfKinPhone;
  if (phone !== undefined) existing.phone = phone;
  if (visitHistory !== undefined) existing.visitHistory = visitHistory;
  if (systolicBP !== undefined) existing.systolicBP = Number(systolicBP);
  if (diastolicBP !== undefined) existing.diastolicBP = Number(diastolicBP);
  if (pulse !== undefined) existing.pulse = Number(pulse);
  if (temperature !== undefined) existing.temperature = Number(temperature);
  if (respRate !== undefined) existing.respRate = Number(respRate);
  if (bleeding !== undefined) existing.bleeding = bleeding;
  if (severePain !== undefined) existing.severePain = severePain;
  if (severeHeadache !== undefined) existing.severeHeadache = severeHeadache;
  if (visualDisturbance !== undefined) existing.visualDisturbance = visualDisturbance;
  if (swellingFeet !== undefined) existing.swellingFeet = swellingFeet;
  if (highFever !== undefined) existing.highFever = highFever;
  if (convulsions !== undefined) existing.convulsions = convulsions;
  if (breathingDifficulty !== undefined) existing.breathingDifficulty = breathingDifficulty;
  if (lossOfConsciousness !== undefined) existing.lossOfConsciousness = lossOfConsciousness;
  if (reducedFetalMovement !== undefined) existing.reducedFetalMovement = reducedFetalMovement;
  if (laborProgressConcerns !== undefined) existing.laborProgressConcerns = laborProgressConcerns;
  if (customNote !== undefined) existing.customNote = customNote;
  if (riskCategory !== undefined) existing.riskCategory = riskCategory;
  if (riskScore !== undefined) existing.riskScore = Number(riskScore);
  if (reasonCodes !== undefined) existing.reasonCodes = reasonCodes;
  if (reasonText !== undefined) existing.reasonText = reasonText;
  if (requiredAction !== undefined) existing.requiredAction = requiredAction;

  if (status) {
    existing.status = status;
    existing.notes.push({
      author: overrideClinician || "Triage Team",
      text: `Status transitioned to: ${status}`,
      timestamp: new Date().toISOString()
    });
  }

  if (triageCategory !== undefined) {
    existing.triageCategory = triageCategory;
    existing.overrideReason = overrideReason || "";
    existing.overrideClinician = overrideClinician || "";
    existing.notes.push({
      author: overrideClinician || "Clinician",
      text: `Clinician clinical review completed. Assigned clinical tier: ${triageCategory || "None Override"}. Reason: ${overrideReason || "N/A"}`,
      timestamp: new Date().toISOString()
    });
  }

  if (arrivalOutcome) {
    existing.arrivalOutcome = arrivalOutcome;
    existing.notes.push({
      author: overrideClinician || "Triage Team",
      text: "Recorded patient arrival outcome.",
      timestamp: new Date().toISOString()
    });
  }

  existing.updatedAt = new Date().toISOString();
  cases[idx] = existing;
  res.json(existing);
});

// Update Case Checklist
app.post("/api/cases/:id/checklist", (req, res) => {
  const caseId = req.params.id;
  const idx = cases.findIndex(c => c.id === caseId);
  if (idx === -1) {
    return res.status(404).json({ error: "Case not found" });
  }

  const { checklistId, checked, clinician } = req.body;
  const existingCase = cases[idx];
  const item = existingCase.checklist.find(i => i.id === checklistId);
  if (item) {
    item.checked = checked;
    existingCase.notes.push({
      author: clinician || "Staff",
      text: `${checked ? "Completed" : "Cleared"} prep checklist item: "${item.label}"`,
      timestamp: new Date().toISOString()
    });
    existingCase.updatedAt = new Date().toISOString();
  }

  res.json(existingCase);
});

// Add Case Notes
app.post("/api/cases/:id/notes", (req, res) => {
  const caseId = req.params.id;
  const idx = cases.findIndex(c => c.id === caseId);
  if (idx === -1) {
    return res.status(404).json({ error: "Case not found" });
  }

  const { text, author } = req.body;
  const existingCase = cases[idx];
  existingCase.notes.push({
    author: author || "Staff",
    text: text,
    timestamp: new Date().toISOString()
  });
  existingCase.updatedAt = new Date().toISOString();

  res.json(existingCase);
});

// AI Maternal Health Assistant Endpoint (Server-Side proxy)
app.post("/api/gemini/assistant", async (req, res) => {
  const { messages, userQuery, contextData } = req.body;

  try {
    const ai = getGeminiClient();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return structured fallback response for clinical testing if key is not active yet
      return res.json({
        text: `[FALLBACK MODE - API KEY NOT SET]
I am the MOMSAFE clinical assistant. It looks like the GEMINI_API_KEY is not configured yet, so I am running in safe offline fallback mode.

Regarding your request: 
Mothers who have severe signs (heavy bleeding, convulsions, chest or severe pain) must be referred immediately to Googwill Medical Centre. You can use our emergency direct line at 08000057777 to alert the triage team.

How to proceed:
1. Ensure the patient is sitting down comfortably.
2. Measure and double-check vital signs (especially blood pressure).
3. Tap "Begin Referral" to transmit details directly to the triage board.`,
      });
    }

    const systemInstruction = `You are MOMSAFE Connect, a bounded clinical decision-support maternal health assistant built for Traditional Birth Attendants (TBAs) in Enugu State, Nigeria, in partnership with Googwill Medical Centre (GMC).

CRITICAL DIRECTIVES:
1. Never provide a final medical diagnosis, never calculate drug dosages, never prescribe medicines, and never direct invasive procedures.
2. If the user mentions any emergency or critical warning signs (e.g., severe bleeding, fits or convulsions, severe headache with blurred vision, loss of consciousness, severe abdominal pain, high fever), you MUST immediately direct them to call Googwill Medical Centre at 08000057777 and initiate immediate emergency referral.
3. Be supportive, concise, and communicate in very clear, direct, simple English that local community birth attendants can easily understand. Avoid complicated medical jargon unless you explain it simply.
4. STRICT RULES ON EMOJIS: Do NOT use any emojis or animated icons in your text responses.
5. Base your answers on validated World Health Organization (WHO) and Nigerian clinical protocols for maternal care. Do not give any speculative advice.`;

    const contents: any[] = [];
    
    // Format previous messages for standard generative format
    if (messages && messages.length > 0) {
      messages.forEach((msg: any) => {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      });
    }

    // Add current context
    let promptText = userQuery;
    if (contextData) {
      promptText = `Context about the active maternal assessment:
- Patient Name: ${contextData.name || "N/A"}
- Gestational Stage: ${contextData.gestationalAge || "N/A"}
- Blood Pressure: ${contextData.systolicBP || "N/A"}/${contextData.diastolicBP || "N/A"} mmHg
- Pulse Rate: ${contextData.pulse || "N/A"} bpm
- Symptoms Checked: Bleeding status: ${contextData.bleeding || "none"}. Other symptoms: ${contextData.symptomsJoined || "None"}.

User Query: ${userQuery}`;
    }

    contents.push({
      role: "user",
      parts: [{ text: promptText }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2, // low temp for clinical safety/consistency
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Assistant Error:", error);
    res.status(500).json({ error: "Sorry, I had trouble processing that request. Please call 08000057777 if this is an emergency." });
  }
});

// -------------------------------------------------------------
// VITE OR STATIC SERVING MIDDLEWARE
// -------------------------------------------------------------
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite server in Development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production static assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";
  app.listen(PORT, host, () => {
    console.log(`MOMSAFE Connect server running at http://${host}:${PORT}`);
  });
}

bootstrap();
