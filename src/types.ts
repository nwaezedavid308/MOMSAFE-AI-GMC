export interface CaseChecklist {
  id: string;
  label: string;
  checked: boolean;
}

export interface CaseNote {
  author: string;
  text: string;
  timestamp: string;
}

export interface PatientVisitRecord {
  id: string;
  visitDate: string; // YYYY-MM-DD
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
}

export interface Case {
  id: string; // ASM-YYYY-XXXXXX
  name: string;
  age: number;
  community: string;
  gestationalAge: string;
  parity: number;
  nextOfKin: string;
  nextOfKinPhone?: string;
  phone: string;
  consent: boolean;
  visitHistory?: PatientVisitRecord[];

  
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
  triageCategory: "GREEN" | "AMBER" | "RED" | "";
  overrideReason: string;
  overrideClinician: string;
  createdAt: string;
  updatedAt: string;
  tbaName: string;
  tbaPhone: string;
  
  // Hospital Preparation checklist
  checklist: CaseChecklist[];
  notes: CaseNote[];
  arrivalOutcome?: {
    arrivalTime: string;
    treatmentDisposition: string;
    maternalOutcome: string;
    newbornOutcome: string;
  };
}

export interface TBAConfig {
  id: string;
  name: string;
  phone: string;
  pin: string;
  community: string;
}
