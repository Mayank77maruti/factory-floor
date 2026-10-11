"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  PERSONAS,
  type Persona,
  type Ticket,
} from "@/lib/mock/frontlineData";
import {
  BarChart3,
  AlertTriangle,
  FileText,
  Users,
  MessageSquare,
  Globe,
  Clock,
  CheckCircle2,
  Trash2,
  Eye,
  X,
  ChevronDown,
  UploadCloud,
  ArrowRight,
  Building2,
  QrCode,
  Plus,
  Phone,
  FileCheck,
  Search,
  Sparkles,
  Wrench,
  Check,
} from "lucide-react";

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

type AdminTab = "analytics" | "alerts" | "documents" | "workers" | "text";

interface UploadedDoc {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  status: "Indexed" | "Processing";
  type: string;
  previewSnippet: string[];
}

interface WorkerQuestionFeedItem {
  id: string;
  workerName: string;
  workerRole: string;
  avatarColor: string;
  avatarTextColor: string;
  initials: string;
  timeAgo: string;
  question: string;
  answer: string;
  sopCitation?: string;
  verified?: boolean;
}

// ---------------------------------------------------------------------------
// DEFAULT SEED DATA
// ---------------------------------------------------------------------------

const DEFAULT_DOCUMENTS: UploadedDoc[] = [
  {
    id: "doc-1",
    name: "SOP-HYD-11-Hydraulic-Maintenance.pdf",
    size: "1.4 MB",
    uploadedAt: "Yesterday at 4:15 PM",
    status: "Indexed",
    type: "PDF",
    previewSnippet: [
      "STANDARD OPERATING PROCEDURE: SOP-HYD-11 (Rev 4.2)",
      "EQUIPMENT: Hydraulic Press 3 · 200T Manifold System · Line 2",
      "1.0 OIL SPECIFICATION: Mobil DTE 25 (ISO 46 equivalent grade).",
      "2.0 SERVICE INTERVAL: Check every 500 operating hours. Complete flush at 1,500 hours.",
      "3.0 RESERVOIR CAPACITY: 120 liters. Minimum level indicator must align with Sight Glass B.",
      "4.0 SEALS: Viton 90-durometer O-rings on manifold blocks. Torque flange bolts to 85 Nm.",
      "5.0 THERMAL LIMIT: Operating temperature range 42°C - 58°C. Thermal drift > 65°C requires immediate shutdown.",
    ],
  },
  {
    id: "doc-2",
    name: "SOP-ENG-14-Bracket-Torque-Spec.pdf",
    size: "820 KB",
    uploadedAt: "Oct 08, 2026",
    status: "Indexed",
    type: "PDF",
    previewSnippet: [
      "ENGINEERING SPECIFICATION: SOP-ENG-14 Rev C",
      "SUBJECT: Steel Mounting Bracket Installation & Fastener Torque (Engine Line 2)",
      "PART NUMBER: BRK-ENG-02 / Grade 8.8 M8 Hex Flange Fasteners",
      "1.0 TORQUE SPECIFICATION: 45 Nm (±2 Nm) calibrated clicker torque wrench.",
      "2.0 THREADLOCK: Apply Loctite 243 (Medium Strength Blue) to first 5 engaged threads.",
      "3.0 WASHERS: Nord-Lock NL8 wedge-locking washers required under heavy vibration zones.",
      "4.0 RUNOUT TOLERANCE: Planar deviation < 0.20 mm relative to conveyor datum A.",
      "5.0 SAFETY NOTE: Any mechanical loosening off datum requires immediate Line 2 safety stop.",
    ],
  },
  {
    id: "doc-3",
    name: "SOP-CNC-07-Coolant-Circuits.pdf",
    size: "2.1 MB",
    uploadedAt: "Oct 02, 2026",
    status: "Indexed",
    type: "PDF",
    previewSnippet: [
      "OPERATING PROCEDURE: SOP-CNC-07 (Coolant Circuit & Pump Maintenance)",
      "SECTION 3: PUMP PRESSURE DIAGNOSTICS & MECHANICAL SEAL INTEGRITY",
      "1.0 NORMAL PRESSURE: 22 - 28 PSI during active high-speed spindle cycling.",
      "2.0 ANOMALY THRESHOLD: Pressure below 18 PSI indicates seal seepage; halt spindle if < 15 PSI.",
      "3.0 SEAL REPLACEMENT: Kit Part #SEAL-CNC-07 (Cage D / PO-1039). Spindle isolation lockout mandatory.",
    ],
  },
];

const MOCK_TEXT_FEED: WorkerQuestionFeedItem[] = [
  {
    id: "text-1",
    workerName: "Marcus T.",
    workerRole: "Maintenance",
    avatarColor: "#1E43D8",
    avatarTextColor: "#FFFFFF",
    initials: "MT",
    timeAgo: "12m ago",
    question: "Is the bracket on Engine Line 2 loose or safe to run?",
    answer:
      "No, it is not safe. Pause the work immediately. The steel bracket shows mechanical loosening and fastener displacement off datum. Operating under this condition risks severe misalignment. I have logged work order W-3324 as HIGH priority.",
    sopCitation: "SOP-ENG-14 p2",
    verified: true,
  },
  {
    id: "text-2",
    workerName: "Priya S.",
    workerRole: "CNC Operator",
    avatarColor: "#FFC53D",
    avatarTextColor: "#101418",
    initials: "PS",
    timeAgo: "34m ago",
    question: "What's the torque spec for the M4 Torx screws on Station 4 assembly?",
    answer:
      "Standard tightening torque is 3.5 Nm per SOP-ASM-02. Use a Torx T20 drive bit. Grade 8.8 zinc-plated hardware is stocked in Tool Crib B (Bin C-12, 140 on hand).",
    sopCitation: "SOP-ASM-02",
    verified: true,
  },
  {
    id: "text-3",
    workerName: "Devin R.",
    workerRole: "Senior Maintenance",
    avatarColor: "#3E6BE0",
    avatarTextColor: "#FFFFFF",
    initials: "DR",
    timeAgo: "1h ago",
    question: "When was the press oil last changed?",
    answer:
      "ISO 46 hydraulic oil was changed on Apr 02 by Devin. Next service is due at 1,500 hrs. Cage D currently has 2 pails remaining in stock.",
    sopCitation: "SOP-HYD-11",
    verified: true,
  },
  {
    id: "text-4",
    workerName: "Dana K.",
    workerRole: "Stores & Purchasing",
    avatarColor: "#FF6B2C",
    avatarTextColor: "#FFFFFF",
    initials: "DK",
    timeAgo: "2h ago",
    question: "Are we below reorder on CNMG 432 inserts?",
    answer:
      "Yes, Tool Crib B has 3 inserts on hand (reorder threshold is 12). Draft PO-1042 to MSC Industrial for 50 units is awaiting your approval.",
    sopCitation: "PO-1042 / MSC",
    verified: true,
  },
  {
    id: "text-5",
    workerName: "Marcus T.",
    workerRole: "Maintenance",
    avatarColor: "#1E43D8",
    avatarTextColor: "#FFFFFF",
    initials: "MT",
    timeAgo: "3h ago",
    question: "What bearing does Conveyor 3 take?",
    answer:
      "6205-2RS deep groove ball bearing. Tool Crib B currently has 2 in stock (per Mike T.'s earlier replacement log).",
    sopCitation: "CITES TOOL CRIB B",
    verified: true,
  },
];

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------

export default function FrontlineAdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("analytics");
  const [company, setCompany] = useState("Pacific Coast Manufacturing");
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);

  // Alerts State
  const [openIssuesExpanded, setOpenIssuesExpanded] = useState(false);
  const [ticketSearch, setTicketSearch] = useState("");

  // Documents State
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingDocName, setUploadingDocName] = useState<string>("");
  const [viewingDoc, setViewingDoc] = useState<UploadedDoc | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Workers Invite Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [inviteRole, setInviteRole] = useState("CNC Operator");
  const [inviteShift, setInviteShift] = useState("Shift 2");
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Flatten active tickets from existing PERSONAS
  const allActiveTickets = PERSONAS.flatMap((p) =>
    p.tickets.map((t) => ({
      ...t,
      workerId: p.id,
      workerName: p.name,
      workerRole: p.role,
      workerShift: p.shift,
      workerStation: p.station || "Factory Floor",
      workerColor: p.avatarColor,
      workerTextColor: p.avatarTextColor,
      workerInitials: p.initials,
    }))
  );

  const totalOpenTicketsCount = allActiveTickets.length;

  // Filtered tickets in Alerts view
  const filteredTickets = allActiveTickets.filter(
    (t) =>
      t.title.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.code.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.workerName.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      t.status.toLowerCase().includes(ticketSearch.toLowerCase())
  );

  // Load SOP Documents from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("frontline.docs");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDocs(parsed);
          return;
        }
      }
    } catch {
      // Fallback
    }
    setDocs(DEFAULT_DOCUMENTS);
    try {
      localStorage.setItem("frontline.docs", JSON.stringify(DEFAULT_DOCUMENTS));
    } catch {
      // Ignore localStorage error
    }
  }, []);

  // Save documents helper
  const updateDocsState = (newDocs: UploadedDoc[]) => {
    setDocs(newDocs);
    try {
      localStorage.setItem("frontline.docs", JSON.stringify(newDocs));
    } catch {
      // ignore
    }
  };

  // Fake upload handler
  const handleUploadFile = (file: File) => {
    if (!file) return;

    setUploadingDocName(file.name);
    setUploadProgress(15);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return 30;
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            const formattedSize =
              file.size > 1024 * 1024
                ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                : `${Math.max(1, Math.round(file.size / 1024))} KB`;

            const newDoc: UploadedDoc = {
              id: `doc-${Date.now()}`,
              name: file.name,
              size: formattedSize || "1.8 MB",
              uploadedAt: "Just now",
              status: "Indexed",
              type: file.name.split(".").pop()?.toUpperCase() || "PDF",
              previewSnippet: [
                `DOCUMENT: ${file.name}`,
                "PARSED BY: Frontline Document Extraction Pipeline v2.4",
                "STATUS: 100% Vector Indexed · Real-time SMS Search Enabled",
                "----------------------------------------------------------------",
                "1.0 SCOPE & APPLICABILITY: Plant-wide operations at Pacific Coast Manufacturing.",
                "2.0 OPERATIONAL STANDARDS: Fasteners, torque settings, pressure thresholds, and changeovers.",
                "3.0 WORKER ASSISTANCE: Extracted SOP steps available directly in floor chat and SMS replies.",
                "4.0 REVISION LOG: Active copy loaded into local plant knowledge cluster.",
              ],
            };

            updateDocsState([newDoc, ...docs]);
            setUploadProgress(null);
            setUploadingDocName("");
          }, 350);
          return 100;
        }
        return prev + 25;
      });
    }, 180);
  };

  const handleDeleteDoc = (id: string) => {
    const next = docs.filter((d) => d.id !== id);
    updateDocsState(next);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitePhone && !inviteName) return;
    setInviteSuccess(true);
    setTimeout(() => {
      setInviteSuccess(false);
      setIsInviteModalOpen(false);
      setInviteName("");
      setInvitePhone("");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-orange-100 selection:text-orange-900">
      {/* =================================================================== */}
      {/* TOP HEADER */}
      {/* =================================================================== */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & Product Brand */}
          <div className="flex items-center gap-3">
            {/* Frontline Orange Brand Mark */}
            <div className="w-10 h-10 rounded-xl bg-[#E05326] flex items-center justify-center shadow-sm flex-shrink-0">
              <svg
                className="w-6 h-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <circle cx="9" cy="10" r="1" fill="currentColor" />
                <circle cx="15" cy="10" r="1" fill="currentColor" />
                <path d="M9.5 13.5c.8.7 2.2.7 3 0" />
              </svg>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center">
                Frontline
                <span className="text-slate-400 font-normal ml-2 text-lg">
                  Dashboard
                </span>
              </h1>

              {/* Company / Batch Pill */}
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200/70 font-mono">
                TC-218
              </span>
            </div>
          </div>

          {/* Right Header Controls: Company Selector & Invite Button */}
          <div className="flex items-center gap-3">
            {/* Company Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-sm font-medium transition-colors shadow-2xs"
              >
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>{company}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>

              {isCompanyDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40 text-sm animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Active Plant Sites
                  </div>
                  {[
                    "Pacific Coast Manufacturing",
                    "Detroit Assembly 02 · Machining Bay",
                    "Austin Plant 04 · Stamping",
                  ].map((plant) => (
                    <button
                      key={plant}
                      type="button"
                      onClick={() => {
                        setCompany(plant);
                        setIsCompanyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        company === plant
                          ? "text-[#1E43D8] font-semibold bg-blue-50/50"
                          : "text-slate-700"
                      }`}
                    >
                      <span className="truncate">{plant}</span>
                      {company === plant && (
                        <Check className="w-4 h-4 text-[#1E43D8]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Blue Invite Workers Button */}
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#1E43D8] hover:bg-[#1838b5] text-white rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Invite Workers</span>
            </button>
          </div>
        </div>

        {/* Subtitle & Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-1">
          <p className="text-sm text-slate-500 mb-3 font-normal">
            An overview of how your team is using Frontline.
          </p>

          {/* Tab Navigation */}
          <nav className="flex space-x-1 sm:space-x-4 border-b border-slate-200 -mb-px overflow-x-auto no-scrollbar">
            {[
              { id: "analytics", label: "Analytics", icon: BarChart3 },
              {
                id: "alerts",
                label: "Alerts",
                icon: AlertTriangle,
                badge: totalOpenTicketsCount,
              },
              {
                id: "documents",
                label: "Documents",
                icon: FileText,
                badge: docs.length,
              },
              { id: "workers", label: "Workers", icon: Users },
              { id: "text", label: "Text", icon: MessageSquare },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as AdminTab)}
                  className={`group inline-flex items-center gap-2 py-3 px-3 sm:px-4 border-b-2 text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "border-[#E05326] text-slate-900 font-semibold"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? "text-[#E05326]"
                        : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded-full text-xs font-mono font-semibold ${
                        isActive
                          ? "bg-orange-100 text-orange-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* =================================================================== */}
      {/* MAIN BODY CONTENT AREA */}
      {/* =================================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
        {/* ================================================================= */}
        {/* TAB 1: ANALYTICS */}
        {/* ================================================================= */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Stat Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Questions Answered */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs uppercase font-medium text-slate-500 tracking-wide">
                    Floor Activity
                  </span>
                  <MessageSquare className="w-5 h-5 text-slate-300" />
                </div>
                <div className="text-3xl font-bold tracking-tight text-slate-900">
                  847
                </div>
                <div className="text-sm text-slate-500 font-medium mt-1">
                  Questions Answered
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                  <span>↑ 18%</span>
                  <span className="text-slate-400 font-normal">
                    vs previous 7 days
                  </span>
                </div>
              </div>

              {/* Card 2: Avg Response Time */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs uppercase font-medium text-slate-500 tracking-wide">
                    Speed
                  </span>
                  <Clock className="w-5 h-5 text-slate-300" />
                </div>
                <div className="text-3xl font-bold tracking-tight text-slate-900">
                  2.1s
                </div>
                <div className="text-sm text-slate-500 font-medium mt-1">
                  Avg Response Time
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 font-normal">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Real-time shop floor SLA</span>
                </div>
              </div>

              {/* Card 3: Languages Detected */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs uppercase font-medium text-slate-500 tracking-wide">
                    Localization
                  </span>
                  <Globe className="w-5 h-5 text-slate-300" />
                </div>
                <div className="text-3xl font-bold tracking-tight text-slate-900">
                  4
                </div>
                <div className="text-sm text-slate-500 font-medium mt-1">
                  Languages Detected
                </div>
                <div className="mt-3 text-xs text-slate-500 font-normal truncate">
                  English, Spanish, Mandarin, Vietnamese
                </div>
              </div>

              {/* Card 4: Active Workers */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs uppercase font-medium text-slate-500 tracking-wide">
                    Staff
                  </span>
                  <Users className="w-5 h-5 text-slate-300" />
                </div>
                <div className="text-3xl font-bold tracking-tight text-slate-900">
                  23
                </div>
                <div className="text-sm text-slate-500 font-medium mt-1">
                  Active Workers
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                  <span>Across Shift 1 & Shift 2</span>
                </div>
              </div>
            </div>

            {/* Amber 50+ Languages Banner Card */}
            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-4 sm:p-4.5 flex items-start sm:items-center gap-3.5 shadow-xs">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-700 flex-shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div className="flex-1 text-sm text-slate-800 leading-snug">
                <span className="font-semibold text-slate-900">
                  Frontline answers in 50+ languages
                </span>{" "}
                — workers can text in Spanish, Mandarin, Tagalog, Vietnamese, and
                more, no app needed.
              </div>
            </div>

            {/* Supplementary Analytical Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Operational Topics Breakdown */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Top Operational Inquiries
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    PAST 7 DAYS
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      topic: "Hydraulic oil change intervals (ISO 46 / Press 3)",
                      count: 248,
                      pct: "88%",
                      sop: "SOP-HYD-11",
                    },
                    {
                      topic: "Engine Line 2 bracket torque & loose fastener safety",
                      count: 194,
                      pct: "72%",
                      sop: "SOP-ENG-14",
                    },
                    {
                      topic: "CNMG 432 carbide insert stock & Tool Crib B reorder",
                      count: 162,
                      pct: "61%",
                      sop: "PO-1042",
                    },
                    {
                      topic: "Chemical handling cert & Station 4 solo changeover",
                      count: 141,
                      pct: "53%",
                      sop: "MODULE 4/6",
                    },
                    {
                      topic: "Conveyor 3 bearing specifications (6205-2RS)",
                      count: 102,
                      pct: "39%",
                      sop: "CRIB B",
                    },
                  ].map((row, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-800 truncate pr-2">
                          {row.topic}
                        </span>
                        <span className="font-mono text-slate-500 flex-shrink-0">
                          {row.count} asks · {row.sop}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#1E43D8] rounded-full"
                          style={{ width: row.pct }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shift Volume & Worker Readiness */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Worker Engagement by Shift
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    LIVE SHIFT 2
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg">
                    <div className="text-xs text-slate-500 font-medium">
                      Shift 1 (Day)
                    </div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">
                      392 <span className="text-xs font-normal text-slate-500">texts</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Devin R. lead · 11 workers active
                    </div>
                  </div>
                  <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-lg">
                    <div className="text-xs text-blue-700 font-medium">
                      Shift 2 (Active Now)
                    </div>
                    <div className="text-2xl font-bold text-[#1E43D8] mt-1">
                      455 <span className="text-xs font-normal text-blue-600">texts</span>
                    </div>
                    <div className="text-xs text-blue-700 mt-1">
                      Marcus T. & Priya S. · 12 workers active
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    <span>
                      Zero missed questions. Floor knowledge retained automatically.
                    </span>
                  </div>
                  <span className="font-semibold text-emerald-600">99.8% resolution</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: ALERTS */}
        {/* ================================================================= */}
        {activeTab === "alerts" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Primary OPEN ISSUES Card (Matches Reference Snap 2) */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-md">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                OPEN ISSUES
              </div>
              <div className="text-5xl font-bold tracking-tight text-slate-900 mt-2">
                {totalOpenTicketsCount}
              </div>
              <button
                type="button"
                onClick={() => setOpenIssuesExpanded(!openIssuesExpanded)}
                className="mt-4 text-sm font-medium text-[#1E43D8] hover:text-blue-800 flex items-center gap-1.5 transition-colors cursor-pointer group"
              >
                <span>{openIssuesExpanded ? "Hide ticket list" : "View all"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Expanded Open Issues List */}
            {openIssuesExpanded && (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/60">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Active Tickets ({allActiveTickets.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Live sync with Frontline Today home and floor shift assignments
                    </p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search ticket code or title..."
                      value={ticketSearch}
                      onChange={(e) => setTicketSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E43D8]/20 focus:border-[#1E43D8]"
                    />
                  </div>
                </div>

                <div className="divide-y divide-slate-100 overflow-x-auto">
                  {filteredTickets.map((ticket, idx) => (
                    <div
                      key={idx}
                      className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-slate-900 px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                            {ticket.code}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              ticket.status === "HIGH"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : ticket.status === "IN PROGRESS"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : ticket.status === "WAITING PARTS"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {ticket.status}
                          </span>
                          <h4 className="font-semibold text-sm text-slate-900">
                            {ticket.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="font-mono text-slate-400 uppercase tracking-wider">
                            {ticket.meta}
                          </span>
                          <span>•</span>
                          <span>{ticket.workerStation}</span>
                        </div>
                      </div>

                      {/* Worker assigned badge */}
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs"
                          style={{
                            backgroundColor: ticket.workerColor,
                            color: ticket.workerTextColor,
                          }}
                        >
                          {ticket.workerInitials}
                        </div>
                        <div className="text-left text-xs">
                          <div className="font-medium text-slate-800">
                            {ticket.workerName}
                          </div>
                          <div className="text-slate-400">
                            {ticket.workerRole} · {ticket.workerShift}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredTickets.length === 0 && (
                    <div className="p-8 text-center text-sm text-slate-500">
                      No open tickets found matching "{ticketSearch}".
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: DOCUMENTS (SOP KNOWLEDGE BASE) */}
        {/* ================================================================= */}
        {activeTab === "documents" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Dropzone Card (Matches Reference Snap 3) */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleUploadFile(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center transition-all cursor-pointer relative overflow-hidden ${
                dragActive
                  ? "border-[#1E43D8] bg-blue-50/40 scale-[1.005]"
                  : "border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50/40"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadFile(file);
                  e.target.value = "";
                }}
              />

              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mb-1">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-base font-semibold text-slate-900">
                  Drop files here or click to upload
                </div>
                <div className="text-sm text-slate-500">
                  PDF, Word, Excel, or text files
                </div>

                {/* Example pill matching snapshot */}
                <div className="pt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#1E43D8] text-white shadow-xs">
                    Company SOP.pdf
                  </span>
                </div>
              </div>

              {/* Upload Progress Simulation */}
              {uploadProgress !== null && (
                <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-6 z-10 animate-in fade-in">
                  <div className="w-full max-w-md space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>Uploading & parsing {uploadingDocName}...</span>
                      <span className="font-mono">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1E43D8] rounded-full transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-400 text-center pt-1">
                      Extracting equipment parameters, torque tables, and safety rules
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Uploaded SOPs Table / List */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Uploaded SOPs & Manuals ({docs.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Persisted in Frontline local knowledge base. Used to answer floor questions.
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Indexed & Live
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 flex-shrink-0">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {doc.name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                          <span>{doc.size}</span>
                          <span>•</span>
                          <span>{doc.uploadedAt}</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-medium">
                            {doc.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* View Action Button */}
                      <button
                        type="button"
                        onClick={() => setViewingDoc(doc)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>View</span>
                      </button>

                      {/* Delete Action Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {docs.length === 0 && (
                  <div className="p-8 text-center text-sm text-slate-500">
                    No SOP documents uploaded yet. Drop a PDF above to index into Frontline.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: WORKERS */}
        {/* ================================================================= */}
        {activeTab === "workers" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header row with Invite CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Shop-Floor Team ({PERSONAS.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Workers connected to Frontline SMS messaging. Reusing verified persona records.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsInviteModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#1E43D8] hover:bg-[#1838b5] text-white rounded-lg text-sm font-medium transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Invite Workers</span>
              </button>
            </div>

            {/* Workers Rows (Marcus, Priya, Devin, Dana) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PERSONAS.map((worker) => (
                <div
                  key={worker.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base shadow-xs"
                        style={{
                          backgroundColor: worker.avatarColor,
                          color: worker.avatarTextColor,
                        }}
                      >
                        {worker.initials}
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-slate-900">
                          {worker.name}
                        </h4>
                        <div className="text-xs text-slate-500 font-medium">
                          {worker.role} · {worker.shift}
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Connected
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-medium">Active Tickets:</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {worker.tickets.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-medium">Assigned Zone:</span>
                      <span className="text-slate-800">
                        {worker.station || "Line 2 / Central Bay"}
                      </span>
                    </div>
                    <div className="text-slate-500 italic pt-1 border-t border-slate-200/60 truncate">
                      "{worker.subline}"
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>SMS Dispatch Active</span>
                    </span>
                    <span className="font-mono text-slate-400">
                      ID: {worker.id.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: TEXT (RECENT QUESTIONS & ANSWERS) */}
        {/* ================================================================= */}
        {activeTab === "text" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recent SMS Floor Conversations
              </h2>
              <p className="text-xs text-slate-500">
                Live stream of questions texted by frontline operators and verified responses.
              </p>
            </div>

            <div className="space-y-3.5">
              {MOCK_TEXT_FEED.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
                >
                  {/* Worker Header & Timestamp */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs"
                        style={{
                          backgroundColor: item.avatarColor,
                          color: item.avatarTextColor,
                        }}
                      >
                        {item.initials}
                      </div>
                      <span className="font-bold text-sm text-slate-900">
                        {item.workerName}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({item.workerRole})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <span>{item.timeAgo}</span>
                      {item.sopCitation && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] uppercase font-semibold">
                          {item.sopCitation}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Worker's Question */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-sm text-slate-800 flex items-start gap-2.5">
                    <span className="font-mono text-xs font-bold text-[#1E43D8] bg-blue-100/60 px-1.5 py-0.5 rounded mt-0.5">
                      ASK
                    </span>
                    <p className="font-medium text-slate-900">
                      "{item.question}"
                    </p>
                  </div>

                  {/* Frontline's Verified Answer */}
                  <div className="bg-[#FFFDF7] border border-[#EFE9DC] rounded-lg p-3 text-sm text-slate-800 flex items-start gap-2.5">
                    <span className="font-mono text-xs font-bold text-[#E05326] bg-orange-100 px-1.5 py-0.5 rounded mt-0.5">
                      BOT
                    </span>
                    <div className="space-y-1">
                      <p className="text-slate-800 leading-relaxed">
                        {item.answer}
                      </p>
                      {item.verified && (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 font-mono pt-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>VERIFIED BY SOP KNOWLEDGE ENGINE</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* =================================================================== */}
      {/* FAKE DOCUMENT VIEWER MODAL (SOP AS KNOWLEDGE BASE) */}
      {/* =================================================================== */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-[#E05326]" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    {viewingDoc.name}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono">
                    {viewingDoc.size} · {viewingDoc.status} · Local Knowledge Source
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Parsed Content Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 font-mono text-xs sm:text-sm bg-slate-950 text-emerald-400 leading-relaxed">
              <div className="text-slate-400 pb-2 border-b border-slate-800 flex justify-between items-center text-xs">
                <span>[FRONTLINE OCR & VECTOR PARSER - STREAM VIEW]</span>
                <span className="text-emerald-500 font-bold">READY</span>
              </div>
              <div className="space-y-2">
                {viewingDoc.previewSnippet.map((line, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-slate-600 select-none w-6 text-right">
                      {(idx + 1).toString().padStart(2, "0")}
                    </span>
                    <span className="text-slate-100">{line}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Indexed into active RAG memory. Ready for shop-floor text queries.
              </span>
              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* FAKE WORKER INVITE DIALOG MODAL */}
      {/* =================================================================== */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1E43D8] flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  Invite Worker to Frontline
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Frontline requires zero app installation. Workers receive an SMS prompt
              to text questions directly in their primary language.
            </p>

            {inviteSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2 animate-in fade-in">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="text-sm font-bold text-emerald-900">
                  Invite Sent Successfully!
                </div>
                <div className="text-xs text-emerald-700">
                  SMS dispatched to {invitePhone || "the worker"}. They can text
                  immediately.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Worker Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Carlos Mendez"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E43D8]/20 focus:border-[#1E43D8]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mobile Phone Number (for SMS)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 234-5678"
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E43D8]/20 focus:border-[#1E43D8]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Role
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E43D8]/20 focus:border-[#1E43D8]"
                    >
                      <option>CNC Operator</option>
                      <option>Maintenance Tech</option>
                      <option>Quality Inspector</option>
                      <option>Assembly Operator</option>
                      <option>Stores & Purchasing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Shift
                    </label>
                    <select
                      value={inviteShift}
                      onChange={(e) => setInviteShift(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E43D8]/20 focus:border-[#1E43D8]"
                    >
                      <option>Shift 1 (Day)</option>
                      <option>Shift 2 (Swing)</option>
                      <option>Shift 3 (Graveyard)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#1E43D8] hover:bg-[#1838b5] text-white font-semibold rounded-lg shadow-sm cursor-pointer"
                  >
                    Send SMS Invite
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

