/**
 * Centralized mock operational data source for Manufy Frontline Mode.
 *
 * This is the single factual source of truth representing the shop-floor
 * demonstration state across shifts, equipment, inventory, and training.
 */

export type TicketStatus = "HIGH" | "IN PROGRESS" | "WAITING PARTS" | "OPEN";

export interface Ticket {
  code: string;
  title: string;
  status: TicketStatus;
  meta: string;
  icon: "wrench" | "thermometer" | "droplet" | "flask" | "gear" | "ruler" | "bolt" | "oil-drop" | "battery" | "clipboard";
}

export interface Persona {
  id: string;
  firstName: string;
  name: string;
  initials: string;
  avatarColor: string;
  avatarTextColor?: string;
  role: string;
  shift: string;
  station?: string;
  subline: string;
  greeting: string;
  assigneeName: string;
  tickets: Ticket[];
}

export interface ToolCribItem {
  id: string;
  item: string;
  supplier: string;
  location: string;
  reorderPoint: number;
  onHand: number;
  unit: string;
  status: "BELOW_REORDER" | "ADEQUATE" | "CRITICAL";
  pendingPo?: {
    poNumber: string;
    quantity: number;
    supplier: string;
    terms: string;
    status: "DRAFT" | "SUBMITTED";
  };
}

export interface MaintenanceLogEntry {
  id: string;
  title: string;
  sub: string;
  date: string;
  equipment: string;
  resolvedBy?: string;
  sopCitation?: string;
  highlight?: boolean;
}

export interface OperatorCertification {
  name: string;
  certified: boolean;
  notes?: string;
}

export interface OperatorTrainingRecord {
  employeeId: string;
  name: string;
  role: string;
  station: string;
  shift: string;
  certifications: OperatorCertification[];
  pendingModules: string[];
}

export interface EquipmentStatusSummary {
  id: string;
  name: string;
  line: string;
  status: "NORMAL" | "DRIFTING" | "MAINTENANCE_DUE" | "DOWN";
  activeTicket?: string;
  metricIssue?: string;
  sopReference?: string;
}

// ---------------------------------------------------------------------------
// 1. PERSONAS & SHIFT ASSIGNMENTS
// ---------------------------------------------------------------------------
export const PERSONAS: Persona[] = [
  {
    id: "marcus",
    firstName: "Marcus",
    name: "Marcus T.",
    initials: "MT",
    avatarColor: "#1E43D8",
    avatarTextColor: "#FFFFFF",
    role: "Maintenance",
    shift: "Shift 2",
    subline: "3 active tickets · Press 3 is still drifting · Tool Crib B is low on inserts",
    greeting: "Morning. I'm watching Press 3, the CNC bay and Tool Crib B. Ask me anything the floor has ever fixed — or I'll flag what drifts.",
    assigneeName: "Devin",
    tickets: [
      {
        code: "W-3321",
        title: "Fix the steel bracket loosening — Engine Line 2",
        status: "HIGH",
        meta: "DUE TODAY 14:00",
        icon: "wrench",
      },
      {
        code: "W-3318",
        title: "Hydraulic temp 13° over spec — Press 3 · Line 2",
        status: "IN PROGRESS",
        meta: "STARTED 09:12",
        icon: "thermometer",
      },
      {
        code: "W-3307",
        title: "CNC-3 coolant PSI drop — check pump seal",
        status: "WAITING PARTS",
        meta: "SEAL KIT ETA THU",
        icon: "droplet",
      },
    ],
  },
  {
    id: "priya",
    firstName: "Priya",
    name: "Priya S.",
    initials: "PS",
    avatarColor: "#FFC53D",
    avatarTextColor: "#101418",
    role: "CNC Operator",
    shift: "Shift 2",
    station: "Station 4",
    subline: "1 cert pending · Station 4 is running Job 2214",
    greeting: "Hi Priya. Station 4 is on Job 2214, and the chemical handling cert is the only thing between you and solo changeovers. Ask me anything.",
    assigneeName: "Marcus",
    tickets: [
      {
        code: "T-118",
        title: "Finish chemical handling cert — 6 steps",
        status: "IN PROGRESS",
        meta: "MODULE 4 OF 6 · DUE THIS SHIFT",
        icon: "flask",
      },
      {
        code: "W-3319",
        title: "Station 4 changeover check — Job 2214",
        status: "OPEN",
        meta: "STARTS 13:00",
        icon: "gear",
      },
      {
        code: "W-3320",
        title: "Log insert wear for Tool Crib B",
        status: "OPEN",
        meta: "CNMG 432 · MIC IN CRIB B",
        icon: "ruler",
      },
    ],
  },
  {
    id: "devin",
    firstName: "Devin",
    name: "Devin R.",
    initials: "DR",
    avatarColor: "#3E6BE0",
    avatarTextColor: "#FFFFFF",
    role: "Senior Maintenance",
    shift: "Shift 1",
    subline: "2 follow-ups from Shift 1 · Press oil service coming due",
    greeting: "Morning Devin. Shift 1 left you two follow-ups and a press service coming due. Ask me anything.",
    assigneeName: "Marcus",
    tickets: [
      {
        code: "W-3304",
        title: "Allen-Bradley fault E-04 — verify reset",
        status: "IN PROGRESS",
        meta: "RESET LOGGED APR 06",
        icon: "bolt",
      },
      {
        code: "W-3315",
        title: "Press oil service at 1,500 hrs — prep parts",
        status: "OPEN",
        meta: "ISO 46 · CAGE D HAS 2",
        icon: "oil-drop",
      },
      {
        code: "W-3311",
        title: "Forklift battery rotation audit",
        status: "OPEN",
        meta: "BANK A → C · EVERY TUES",
        icon: "battery",
      },
    ],
  },
  {
    id: "dana",
    firstName: "Dana",
    name: "Dana K.",
    initials: "DK",
    avatarColor: "#FF6B2C",
    avatarTextColor: "#FFFFFF",
    role: "Stores & Purchasing",
    shift: "Tool Crib B",
    station: "Tool Crib B",
    subline: "1 PO waiting on you · 2 items under reorder point",
    greeting: "Hi Dana. One PO is waiting on your approval and two items are under reorder point. Ask me anything.",
    assigneeName: "Marcus",
    tickets: [
      {
        code: "P-1042",
        title: "Approve PO-1042 — CNMG inserts ×50",
        status: "HIGH",
        meta: "MSC INDUSTRIAL · NET-30",
        icon: "clipboard",
      },
      {
        code: "W-3322",
        title: "Reorder 6205-2RS bearings — 2 left",
        status: "OPEN",
        meta: "LAST USED APR 02",
        icon: "gear",
      },
      {
        code: "W-3323",
        title: "Cage D ISO 46 stocktake",
        status: "OPEN",
        meta: "SHOWS 2 · VERIFY FLOOR",
        icon: "droplet",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 2. MOCK INVENTORY (TOOL CRIB B & CAGE D)
// ---------------------------------------------------------------------------
export const MOCK_INVENTORY: ToolCribItem[] = [
  {
    id: "item-cnmg-432",
    item: "CNMG 432 inserts",
    supplier: "MSC Industrial · net-30",
    location: "TOOL CRIB B",
    reorderPoint: 12,
    onHand: 3,
    unit: "inserts",
    status: "BELOW_REORDER",
    pendingPo: {
      poNumber: "PO-1042",
      quantity: 50,
      supplier: "MSC Industrial",
      terms: "net-30",
      status: "DRAFT",
    },
  },
  {
    id: "item-6205-bearing",
    item: "6205-2RS deep groove ball bearings",
    supplier: "Applied Industrial",
    location: "TOOL CRIB B / CAGE D",
    reorderPoint: 5,
    onHand: 2,
    unit: "bearings",
    status: "BELOW_REORDER",
  },
  {
    id: "item-iso-46-oil",
    item: "ISO 46 hydraulic oil",
    supplier: "Mobil / Grainger",
    location: "CAGE D",
    reorderPoint: 4,
    onHand: 2,
    unit: "pails (5-gal)",
    status: "BELOW_REORDER",
  },
];

// ---------------------------------------------------------------------------
// 3. MOCK MAINTENANCE & FLOOR LOG HISTORY
// ---------------------------------------------------------------------------
export const MOCK_MAINTENANCE_HISTORY: MaintenanceLogEntry[] = [
  {
    id: "log-1",
    title: "Conveyor 3 bearing failure",
    sub: "Replace 6205-2RS · resolved by Mike T.",
    date: "Today",
    equipment: "Conveyor 3",
    resolvedBy: "Mike T.",
    highlight: false,
  },
  {
    id: "log-2",
    title: "CNC-3 coolant PSI drop",
    sub: "Check pump seal · cited SOP-CNC-07 p3",
    date: "Apr 14",
    equipment: "CNC-3",
    sopCitation: "SOP-CNC-07 p3",
    highlight: false,
  },
  {
    id: "log-3",
    title: "Forklift battery rotation",
    sub: "Bank A → C every Tues · per Mike",
    date: "Apr 11",
    equipment: "Forklift Fleet (Bank A → C)",
    resolvedBy: "Mike T.",
    highlight: false,
  },
  {
    id: "log-4",
    title: "Allen-Bradley fault E-04",
    sub: "Reset sequence + photo · per Devin",
    date: "Apr 06",
    equipment: "PLC Line Controller (Allen-Bradley)",
    resolvedBy: "Devin R.",
    highlight: false,
  },
  {
    id: "log-5",
    title: "Hydraulic press oil change",
    sub: "ISO 46 · every 500 hrs · Cage D",
    date: "Apr 02",
    equipment: "Press 3 · Line 2",
    resolvedBy: "Devin R.",
    sopCitation: "SOP-HYD-11",
    highlight: true,
  },
];

export const MOCK_VERIFIED_OIL_SERVICE = {
  summary: "ISO 46 change on Apr 02 by Devin. Next due at 1,500 hrs. Cage D has 2 in stock.",
  sopCitation: "SOP-HYD-11",
  verifiedDate: "Apr 02",
};

// ---------------------------------------------------------------------------
// 4. MOCK OPERATOR TRAINING RECORDS
// ---------------------------------------------------------------------------
export const MOCK_TRAINING_RECORDS: OperatorTrainingRecord[] = [
  {
    employeeId: "emp-priya-s",
    name: "Priya S.",
    role: "CNC operator · station 4",
    station: "Station 4",
    shift: "Monday · second shift",
    certifications: [
      { name: "Forklift basics", certified: true, notes: "Certified" },
      { name: "Lockout/tagout", certified: true, notes: "Certified" },
      { name: "Chemical handling", certified: false, notes: "Missing certification" },
    ],
    pendingModules: ["Chemical handling (Module 4 of 6, due this shift for solo changeovers)"],
  },
];

// ---------------------------------------------------------------------------
// 5. MOCK EQUIPMENT STATUS & DRIFT ANOMALIES
// ---------------------------------------------------------------------------
export const MOCK_EQUIPMENT_STATUS: EquipmentStatusSummary[] = [
  {
    id: "eq-press-03",
    name: "Press 3",
    line: "Line 2",
    status: "DRIFTING",
    activeTicket: "W-3318",
    metricIssue: "Hydraulic temp 13° over spec (+13° thermal drift, started 09:12)",
    sopReference: "SOP-HYD-11",
  },
  {
    id: "eq-engine-line-2",
    name: "Engine Line 2",
    line: "Engine Line 2",
    status: "MAINTENANCE_DUE",
    activeTicket: "W-3321",
    metricIssue: "Steel bracket loosening (Torque all 6 bracket bolts to 45 Nm, check fretting)",
  },
  {
    id: "eq-cnc-03",
    name: "CNC-3",
    line: "CNC Bay",
    status: "MAINTENANCE_DUE",
    activeTicket: "W-3307",
    metricIssue: "Coolant PSI drop (Waiting parts: pump seal kit ETA Thursday)",
    sopReference: "SOP-CNC-07 p3",
  },
  {
    id: "eq-station-04",
    name: "Station 4",
    line: "Machining Bay",
    status: "NORMAL",
    activeTicket: "W-3319",
    metricIssue: "Changeover check for Job 2214 starts at 13:00",
  },
  {
    id: "eq-conv-03",
    name: "Conveyor 3",
    line: "Assembly Feed",
    status: "NORMAL",
    metricIssue: "Bearing failure resolved today by Mike T. (6205-2RS replaced)",
  },
];

// ---------------------------------------------------------------------------
// 6. EXACT APPLICATION GUARDRAIL MESSAGE
// ---------------------------------------------------------------------------
/**
 * Exact guardrail message from the existing Frontline response handler
 * (app/frontline/page.tsx L855). Returned for out-of-scope, unsupported,
 * or nonsensical inquiries.
 */
export const FRONTLINE_GUARDRAIL_MESSAGE =
  'I can pull the floor\'s history ("when was the press oil last changed?"), flag drifting equipment, check training certs, or watch stock levels. Try one of the suggestions below.';

// ---------------------------------------------------------------------------
// 7. MACHINE PARTS KNOWLEDGE BASE & DIAGNOSTICS (IMAGE INSPECTION)
// ---------------------------------------------------------------------------

export interface MachinePartDiagnostic {
  id: string;
  partName: string;
  aliases: string[];
  equipmentId: string;
  equipmentName: string;
  isSafe: boolean;
  diagnosisText: string;
  infoText?: string;
  safeInspectionText?: string;
  sopReference?: string;
  checklist?: string[];
  suggestedTicket?: {
    code: string;
    title: string;
    status: TicketStatus;
    meta: string;
    icon: Ticket["icon"];
    assignedToPersonaId: string;
  };
}

export const MACHINE_PARTS_DIAGNOSTICS: MachinePartDiagnostic[] = [
  {
    id: "diag-bracket-line2",
    partName: "Steel Mounting Bracket (Engine Line 2)",
    aliases: [
      "bracket",
      "steel bracket",
      "mounting bracket",
      "line 2 bracket",
      "engine line 2",
      "loose bracket",
      "is this bracket is loose",
      "bracket loose",
      "bracket safe",
    ],
    equipmentId: "eq-engine-line-2",
    equipmentName: "Engine Line 2",
    isSafe: false,
    diagnosisText:
      "No, it is not safe. Pause the work immediately. The steel bracket shows mechanical loosening and fastener displacement off datum. Operating under this condition risks severe misalignment on Engine Line 2. I have logged work order W-3324 and assigned it to Marcus T. in the Maintenance team as HIGH priority.",
    infoText:
      "This is the steel mounting bracket for Engine Line 2 (Part #BRK-ENG-02). Standard installation requires 6 M8 grade 8.8 bolts torqued to 45 Nm per SOP-ENG-14.",
    safeInspectionText:
      "The mounting bracket is seated against datum with all fasteners secured to 45 Nm per SOP-ENG-14.",
    sopReference: "SOP-ENG-14 p2",
    checklist: [
      "Stop Engine Line 2 conveyor immediately",
      "Tag out station feeder switch",
      "Marcus T. (Maintenance) dispatched with calibrated torque wrench",
      "Torque all 6 bracket bolts to 45 Nm per SOP-ENG-14",
    ],
    suggestedTicket: {
      code: "W-3324",
      title: "Fix loose steel bracket — Engine Line 2",
      status: "HIGH",
      meta: "ASSIGNED TO MARCUS T. · SAFETY STOP",
      icon: "wrench",
      assignedToPersonaId: "marcus",
    },
  },
  {
    id: "diag-hydraulic-valve-press3",
    partName: "Hydraulic Relief Valve (Press 3)",
    aliases: ["valve", "relief valve", "hydraulic", "hydraulic line", "manifold", "press 3"],
    equipmentId: "eq-press-03",
    equipmentName: "Press 3",
    isSafe: false,
    diagnosisText:
      "No, it is not safe. Pause the work immediately. The hydraulic valve shows fluid seepage and the manifold temperature is drifting 13° over spec. Continuing cycle risks pressure blow-out. I have logged emergency work order W-3325 and assigned it to Marcus T. in Maintenance.",
    sopReference: "SOP-PRS-03",
    checklist: [
      "Depressurize Press 3 hydraulic accumulator",
      "Lock out primary hydraulic power pack",
      "Marcus T. (Maintenance) replacing Viton O-ring seal",
      "Verify pressure stability at 210 bar before restarting",
    ],
    suggestedTicket: {
      code: "W-3325",
      title: "Hydraulic relief valve leakage & temp drift — Press 3",
      status: "HIGH",
      meta: "ASSIGNED TO MARCUS T. · EMERGENCY",
      icon: "thermometer",
      assignedToPersonaId: "marcus",
    },
  },
  {
    id: "diag-coolant-pump-cnc3",
    partName: "Coolant Pump Mechanical Seal (CNC-3)",
    aliases: ["pump", "coolant pump", "pump seal", "seal", "impeller", "cnc-3", "cnc"],
    equipmentId: "eq-cnc-03",
    equipmentName: "CNC-3",
    isSafe: false,
    diagnosisText:
      "No, this pump seal is degraded and coolant pressure is dropping below 15 PSI. High-speed spindle cutting must be halted to prevent carbide thermal fracture. Work order W-3326 is logged for Marcus T. awaiting the replacement seal kit arriving Thursday.",
    sopReference: "SOP-CNC-07 p3",
    checklist: [
      "Halt automated cycling on CNC-3",
      "Switch machine to standby mode",
      "Seal kit arriving Thursday (Cage D / PO-1039)",
      "Marcus T. scheduled for changeover",
    ],
    suggestedTicket: {
      code: "W-3326",
      title: "Coolant pump mechanical seal degradation — CNC-3",
      status: "WAITING PARTS",
      meta: "ASSIGNED TO MARCUS T. · SEAL ETA THU",
      icon: "droplet",
      assignedToPersonaId: "marcus",
    },
  },
  {
    id: "diag-cnmg-insert",
    partName: "CNMG 432 Carbide Turning Insert",
    aliases: ["insert", "cnmg", "carbide", "cutting tool", "turning insert", "station 4"],
    equipmentId: "eq-station-04",
    equipmentName: "Station 4",
    isSafe: false,
    diagnosisText:
      "No, this insert is not safe for production cutting. Flank wear exceeds 0.35 mm and micro-fractures are visible along the cutting tip. Continuing will result in surface roughness failure on Job 2214. I have assigned a tool change ticket to Marcus T. in Maintenance.",
    checklist: [
      "Index or replace CNMG 432 insert at Station 4",
      "Inspect toolholder pocket for metal swarf",
      "Check Tool Crib B stock (shows 3 remaining)",
      "Log wear measurement in tool calibration sheet",
    ],
    suggestedTicket: {
      code: "W-3327",
      title: "Chipped CNMG 432 insert replacement — Station 4",
      status: "OPEN",
      meta: "ASSIGNED TO MARCUS T. · FROM CRIB B",
      icon: "ruler",
      assignedToPersonaId: "marcus",
    },
  },
  {
    id: "diag-bearing-conveyor",
    partName: "6205-2RS Deep Groove Ball Bearing",
    aliases: ["bearing", "ball bearing", "roller", "conveyor", "conveyor 3"],
    equipmentId: "eq-conv-03",
    equipmentName: "Conveyor 3",
    isSafe: false,
    diagnosisText:
      "No, this bearing has severe raceway wear and grease seal breach. Running under load risks seizure and drive belt snapping on Conveyor 3. I have assigned an urgent maintenance ticket to Marcus T.",
    checklist: [
      "Lock out Conveyor 3 drive motor",
      "Pull worn 6205-2RS bearing using puller",
      "Fit fresh 6205-2RS bearing from Tool Crib B (2 in stock)",
      "Verify free manual rotation before clearing lockout",
    ],
    suggestedTicket: {
      code: "W-3328",
      title: "Worn 6205-2RS bearing replacement — Conveyor 3",
      status: "OPEN",
      meta: "ASSIGNED TO MARCUS T. · CRIB B HAS 2",
      icon: "gear",
      assignedToPersonaId: "marcus",
    },
  },
  {
    id: "diag-spindle-chuck-lathe1",
    partName: "Spindle Collet Chuck (CNC Lathe 1)",
    aliases: ["chuck", "collet", "spindle", "lathe", "clamping", "lathe 1"],
    equipmentId: "eq-cnc-lathe-01",
    equipmentName: "CNC Lathe 1",
    isSafe: false,
    diagnosisText:
      "No, this collet chuck has excessive radial runout (>0.08 mm) and hydraulic drawbar pressure instability. Running high-RPM operations will throw the workpiece. I have halted the station and logged emergency work order W-3329 for Marcus T. in Maintenance.",
    sopReference: "SOP-CNC-12",
    checklist: [
      "Lock out CNC Lathe 1 spindle motor",
      "Inspect collet taper for galling and metal chips",
      "Replace master collet pads from Tool Crib B",
      "Measure dial-indicator runout (<0.01 mm required)",
    ],
    suggestedTicket: {
      code: "W-3329",
      title: "Spindle collet chuck runout & clamp failure — CNC Lathe 1",
      status: "HIGH",
      meta: "ASSIGNED TO MARCUS T. · SPINDLE SAFETY",
      icon: "gear",
      assignedToPersonaId: "marcus",
    },
  },
  {
    id: "diag-pneumatic-gripper-line1",
    partName: "Pneumatic Gripper Jaws (Engine Line 1)",
    aliases: ["gripper", "jaw", "pneumatic", "robot gripper", "end effector", "engine line 1"],
    equipmentId: "eq-engine-line-1",
    equipmentName: "Engine Line 1",
    isSafe: false,
    diagnosisText:
      "No, the pneumatic gripper seal is leaking air and finger alignment has drifted by 2.4 mm. Parts risk slipping mid-transfer across Engine Line 1. I have logged work order W-3330 for Marcus T. in Maintenance.",
    sopReference: "SOP-ENG-08",
    checklist: [
      "Isolate 6-bar pneumatic air supply",
      "Replace polyurethane gripper pads",
      "Marcus T. recalibrating zero-datum sensor",
      "Dry-cycle 5 parts before releasing safety gate",
    ],
    suggestedTicket: {
      code: "W-3330",
      title: "Pneumatic gripper misalignment & seal leak — Engine Line 1",
      status: "OPEN",
      meta: "ASSIGNED TO MARCUS T. · SPARES IN CRIB B",
      icon: "wrench",
      assignedToPersonaId: "marcus",
    },
  },
  {
    id: "diag-fastener-screw",
    partName: "M4 Torx Pan-Head Machine Screw (Grade 8.8)",
    aliases: [
      "screw",
      "screws",
      "torx",
      "fastener",
      "fasteners",
      "machine screw",
      "bolt",
      "bolts",
      "hardware",
      "pan head",
      "pan-head",
      "threaded fastener",
      "m4",
      "t20",
    ],
    equipmentId: "eq-station-04",
    equipmentName: "Tool Crib B / Station 4 Assembly",
    isSafe: true,
    infoText:
      "This is an M4 Torx pan-head machine screw (Grade 8.8 zinc-plated). Drive recess and metric thread pitch are clean and intact. Stocked in Tool Crib B (Bin C-12, 140 on hand). Standard tightening torque is 3.5 Nm per SOP-ASM-02.",
    safeInspectionText:
      "Yes, this M4 Torx pan-head machine screw is clean, thread pitch is intact with no stripping or shear damage, and it is safe to use. Standard assembly torque is 3.5 Nm per SOP-ASM-02.",
    diagnosisText:
      "Yes, this M4 Torx pan-head machine screw is clean, thread pitch is intact with no stripping or shear damage, and it is safe to use. Standard assembly torque is 3.5 Nm per SOP-ASM-02.",
    sopReference: "SOP-ASM-02",
    checklist: [
      "Inspect M4 thread pitch for burrs or stripping",
      "Verify Torx T20 drive bit fit",
      "Standard torque 3.5 Nm per SOP-ASM-02",
    ],
  },
];

export const NON_MACHINE_KEYWORDS = [
  "cat",
  "dog",
  "doggy",
  "puppy",
  "kitten",
  "pet",
  "selfie",
  "person",
  "human",
  "face",
  "people",
  "portrait",
  "food",
  "pizza",
  "burger",
  "sandwich",
  "lunch",
  "dinner",
  "breakfast",
  "meal",
  "salad",
  "coffee",
  "tea",
  "snack",
  "fruit",
  "flower",
  "tree",
  "plant",
  "nature",
  "landscape",
  "sky",
  "sunset",
  "car",
  "shoe",
  "shoes",
  "shirt",
  "dress",
  "clothes",
  "furniture",
  "chair",
  "table",
  "bed",
  "sofa",
  "couch",
  "house",
  "building",
  "room",
  "phone",
  "smartphone",
  "laptop",
  "computer",
  "animal",
  "baby",
  "sunglasses",
  "bottle",
  "cup",
];

export const FRONTLINE_PHOTO_REJECTION_MESSAGE =
  "I can only assist with factory machinery, industrial equipment, and tooling parts. Please provide an image of a shop-floor machine or mechanical component.";

/**
 * Detects whether the operator's message explicitly inquires about safety,
 * looseness, operational risk, or work stoppage.
 */
export function isExplicitSafetyOrLoosenessQuestion(query: string): boolean {
  const q = (query || "").toLowerCase();
  const normalized = q.replace(/[^a-z0-9]+/g, " ").trim();

  if (!normalized) return false;

  const explicitPhrases = [
    "safe to use",
    "safe to work",
    "safe to operate",
    "safe to run",
    "is it safe",
    "is this safe",
    "are these safe",
    "should i stop",
    "should i pause",
    "pause the work",
    "stop work",
    "stop the work",
    "is it loose",
    "is this loose",
    "loose or not",
    "loose or safe",
    "safe or not",
    "is this part loose",
    "this part is loose or not",
    "this part is loose",
    "is this bracket is loose",
    "is this broken",
    "safety check",
  ];

  if (explicitPhrases.some((phrase) => normalized.includes(phrase))) {
    return true;
  }

  // Combined checks
  if (normalized.includes("loose") && normalized.includes("safe")) {
    return true;
  }

  if (
    normalized.includes("safe") &&
    (normalized.includes("work") ||
      normalized.includes("operate") ||
      normalized.includes("use") ||
      normalized.includes("line") ||
      normalized.includes("run") ||
      normalized.includes("part"))
  ) {
    return true;
  }

  if (
    normalized.includes("loose") &&
    (normalized.includes("bracket") ||
      normalized.includes("work") ||
      normalized.includes("run") ||
      normalized.includes("line") ||
      normalized.includes("part"))
  ) {
    return true;
  }

  return false;
}

/**
 * Validates whether an uploaded image depicts an industrial machine part / tool,
 * and extracts diagnosis + ticket recommendations based on shop-floor mock records.
 *
 * ONLY flags a safety stop (isSafetyStop: true) when the user explicitly asks
 * a safety or looseness question AND the part is in an unsafe/loose condition.
 */
export function diagnoseMachinePart(params: {
  query: string;
  imageName?: string;
  ocrText?: string;
}): {
  isMachinePart: boolean;
  isSafetyStop: boolean;
  diagnostic?: MachinePartDiagnostic;
  message: string;
  ticket?: MachinePartDiagnostic["suggestedTicket"];
  checklist?: string[];
} {
  const q = (params.query || "").toLowerCase();
  const imgName = (params.imageName || "").toLowerCase();
  const ocr = (params.ocrText || "").toLowerCase();

  // Normalize delimiters (replace underscores, hyphens, slashes, periods with spaces)
  const normImg = imgName.replace(/[^a-z0-9]+/g, " ");
  const normOcr = ocr.replace(/[^a-z0-9]+/g, " ");
  const normQ = q.replace(/[^a-z0-9]+/g, " ");
  const combined = `${normQ} ${normImg} ${normOcr}`.trim();

  // Check if image filename, OCR text, or query clearly represents a non-machine item
  const isNonMachine = NON_MACHINE_KEYWORDS.some((kw) => {
    const regex = new RegExp(`\\b${kw}\\b`, "i");
    return (
      regex.test(normImg) ||
      regex.test(normOcr) ||
      (regex.test(normQ) &&
        !normQ.includes("bracket") &&
        !normQ.includes("machine") &&
        !normQ.includes("tool") &&
        !normQ.includes("screw") &&
        !normQ.includes("bolt") &&
        !normQ.includes("fastener"))
    );
  });

  const hasShopFloorKeyword =
    combined.includes("bracket") ||
    combined.includes("machine") ||
    combined.includes("tool") ||
    combined.includes("valve") ||
    combined.includes("pump") ||
    combined.includes("insert") ||
    combined.includes("bearing") ||
    combined.includes("spindle") ||
    combined.includes("gripper") ||
    combined.includes("press") ||
    combined.includes("lathe") ||
    combined.includes("cnc") ||
    combined.includes("screw") ||
    combined.includes("bolt") ||
    combined.includes("fastener") ||
    combined.includes("torx") ||
    combined.includes("hardware") ||
    combined.includes("nut") ||
    combined.includes("washer") ||
    combined.includes("thread") ||
    combined.includes("flange") ||
    combined.includes("motor") ||
    combined.includes("gear") ||
    combined.includes("coupling");

  if (isNonMachine && !hasShopFloorKeyword) {
    return {
      isMachinePart: false,
      isSafetyStop: false,
      message: FRONTLINE_PHOTO_REJECTION_MESSAGE,
    };
  }

  const isSafetyQuestion = isExplicitSafetyOrLoosenessQuestion(params.query);

  // 1. Find matching diagnostic by aliases
  for (const diag of MACHINE_PARTS_DIAGNOSTICS) {
    if (diag.aliases.some((alias) => combined.includes(alias))) {
      // If user did NOT explicitly ask if it is safe or loose, do NOT stop work!
      if (!isSafetyQuestion) {
        return {
          isMachinePart: true,
          isSafetyStop: false,
          diagnostic: diag,
          message:
            diag.infoText ||
            `This is a recognized shop-floor component: ${diag.partName} (${diag.equipmentName}).`,
        };
      }

      // User explicitly asked a safety or looseness question:
      if (diag.isSafe) {
        return {
          isMachinePart: true,
          isSafetyStop: false,
          diagnostic: diag,
          message: diag.safeInspectionText || diag.diagnosisText,
          checklist: diag.checklist,
        };
      }

      // Unsafe component under safety question: issue safety stop + maintenance ticket
      return {
        isMachinePart: true,
        isSafetyStop: true,
        diagnostic: diag,
        message: diag.diagnosisText,
        ticket: diag.suggestedTicket,
        checklist: diag.checklist,
      };
    }
  }

  // 2. If shop-floor keyword or query matched but no specific diagnostic matched:
  if (hasShopFloorKeyword) {
    if (
      combined.includes("screw") ||
      combined.includes("bolt") ||
      combined.includes("fastener") ||
      combined.includes("torx") ||
      combined.includes("nut") ||
      combined.includes("washer")
    ) {
      const screwDiag = MACHINE_PARTS_DIAGNOSTICS.find((d) => d.id === "diag-fastener-screw");
      if (screwDiag) {
        if (!isSafetyQuestion) {
          return {
            isMachinePart: true,
            isSafetyStop: false,
            diagnostic: screwDiag,
            message:
              screwDiag.infoText ||
              "This is an M4 Torx pan-head machine screw (Grade 8.8 zinc-plated). Clean drive recess and metric thread pitch. Stocked in Tool Crib B (Bin C-12). Standard torque is 3.5 Nm per SOP-ASM-02.",
          };
        }
        return {
          isMachinePart: true,
          isSafetyStop: false,
          diagnostic: screwDiag,
          message: screwDiag.safeInspectionText || screwDiag.diagnosisText,
          checklist: screwDiag.checklist,
        };
      }
    }

    const defaultDiag = MACHINE_PARTS_DIAGNOSTICS[0];
    if (isSafetyQuestion) {
      return {
        isMachinePart: true,
        isSafetyStop: true,
        diagnostic: defaultDiag,
        message: defaultDiag.diagnosisText,
        ticket: defaultDiag.suggestedTicket,
        checklist: defaultDiag.checklist,
      };
    }

    return {
      isMachinePart: true,
      isSafetyStop: false,
      diagnostic: defaultDiag,
      message:
        defaultDiag.infoText ||
        "This is a recognized manufacturing component on Engine Line 2.",
    };
  }

  // 3. Rejection
  return {
    isMachinePart: false,
    isSafetyStop: false,
    message: FRONTLINE_PHOTO_REJECTION_MESSAGE,
  };
}

