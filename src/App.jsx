import React, { useEffect, useState } from 'react';
import { 
  BookOpen, Brain, CheckCircle, Clock, Hammer, Shield, 
  Menu, X, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, 
  RefreshCw, Calculator, FileText, Lightbulb, Scale, Search, List,
  TrendingUp, SlidersHorizontal
} from 'lucide-react';

import { ExamSimulator } from './components/ExamSimulator.jsx';
import { ProgressBoard } from './components/ProgressBoard.jsx';
import { StudyPlan } from './components/StudyPlan.jsx';
import { SettingsPanel } from './components/SettingsPanel.jsx';
import { EXAM_DEFAULTS } from './weights.js';

/* ---------- Styles for flip + fade ---------- */
const styles = `
  .perspective-1000 { perspective: 1000px; }
  .preserve-3d { transform-style: preserve-3d; }
  .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
  .rotate-y-180 { transform: rotateY(180deg); }
  .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px);} to { opacity: 1; transform: translateY(0);} }
`;

/* ---------- Data blocks (trimmed to essentials; you can expand anytime) ---------- */
const definitionsData = [
  { category: "Contracts & Documents (AIA)", terms: [
    { name: "Addenda", def: "Documents issued BEFORE the bid opening that modify, clarify, or interpret the bidding documents. Become part of the contract." },
    { name: "Change Order (CO)", def: "Written amendment to the contract signed by Owner, Architect, and Contractor. Changes Scope, Price, and/or Time." },
    { name: "Construction Change Directive (CCD)", def: "Written order by Owner and Architect directing a change in work BEFORE agreement on price/time. Used to prevent delays." },
    { name: "Minor Change", def: "Written order by Architect alone for changes not involving adjustment to Contract Sum or Time." },
    { name: "Substantial Completion", def: "Stage where work is sufficiently complete for Owner to occupy/use for intended purpose. Warranties typically start here." },
    { name: "Retainage", def: "Percentage of payment (usually 10%) withheld by Owner to ensure completion of work. Released at Substantial Completion." },
    { name: "Schedule of Values (SOV)", def: "Breakdown of the Contract Sum allocated to various portions of the work. Used as basis for reviewing Pay Apps." },
    { name: "Indemnification", def: "Clause where one party (Contractor) agrees to hold another (Owner/Architect) harmless from loss/damages (due to negligence)." },
    { name: "Liquidated Damages", def: "Pre-agreed amount paid by Contractor to Owner for every day the project is late. Must be a reasonable estimate of loss, not a penalty." },
    { name: "Initial Decision Maker (IDM)", def: "The person (usually Architect) identified to render initial decisions on Claims. Required before mediation." }
  ]},
  { category: "Statutes & Regulations (FL)", terms: [
    { name: "Notice to Owner (NTO)", def: "Notice sent by Subs/Suppliers not in privity with Owner to preserve lien rights. Must be received by Owner within 45 days of first furnishing." },
    { name: "Claim of Lien", def: "Legal claim against property for unpaid work. Must be recorded within 90 days of final furnishing." },
    { name: "Notice of Commencement (NOC)", def: "Recorded by Owner before project start. Invalidates liens if not filed. Valid for 1 year by default." },
    { name: "Chapter 558 (Right to Cure)", def: "Requires Owner to give Contractor notice of construction defects and an opportunity to inspect/repair before filing a lawsuit." },
    { name: "Chapter 489 (Licensing)", def: "Regulates construction contracting. Defines scopes, exemptions, and penalties for unlicensed activity." },
    { name: "Residential Recovery Fund", def: "State fund to compensate homeowners who suffer financial loss due to licensed contractor misconduct." }
  ]},
  { category: "Financial & Estimating", terms: [
    { name: "Labor Burden", def: "The total cost of an employee to the company, including taxes (FICA, FUTA), insurance (Workers Comp), and benefits. Added to base wage." },
    { name: "WIP Schedule", def: "Work In Progress. Tracks billings vs. actual work to identify Overbilling (Liability) or Underbilling (Asset)." },
    { name: "Balance Sheet", def: "Financial statement showing Assets, Liabilities, and Equity at a specific point in time (Snapshot)." },
    { name: "Income Statement", def: "Financial statement showing Revenues and Expenses over a period of time (Profit & Loss)." },
    { name: "Break-Even Point", def: "The volume of sales where Total Revenue equals Total Costs (Zero Profit)." },
    { name: "Depreciation", def: "Allocation of the cost of a tangible asset over its useful life. MACRS is an accelerated method for tax purposes." }
  ]},
  { category: "Scheduling & Safety", terms: [
    { name: "Critical Path", def: "The sequence of activities that determines the longest duration of the project. Activities have Zero Float." },
    { name: "Float (Slack)", def: "Amount of time an activity can be delayed without delaying the project end date." },
    { name: "Fast-Tracking", def: "Overlapping design and construction phases to shorten schedule. Increases risk of rework." },
    { name: "Crashing", def: "Adding resources (labor/money) to shorten schedule duration. Increases cost." },
    { name: "Competent Person", def: "OSHA term for one capable of identifying hazards AND authorized to take prompt corrective measures." }
  ]}
];

const lookupData = [
  { category: "AIA Contracts", items: [
    { trigger: "Safety / Means & Methods", source: "AIA A201", section: "Article 3.3" },
    { trigger: "Submittals (Review Process)", source: "AIA A201", section: "Article 3.12" },
    { trigger: "Claims (21 Days)", source: "AIA A201", section: "Article 15.1" },
    { trigger: "Initial Decision Maker (IDM)", source: "AIA A201", section: "Article 1.1.8 / 15.2" },
    { trigger: "Change Order (Agreed Price)", source: "AIA A201", section: "Article 7.2" },
    { trigger: "CCD (Price NOT Agreed)", source: "AIA A201", section: "Article 7.3" },
    { trigger: "Minor Change (No Cost)", source: "AIA A201", section: "Article 7.4" },
    { trigger: "Payment Applications", source: "AIA A201", section: "Article 9.3" },
    { trigger: "Substantial Completion", source: "AIA A201", section: "Article 9.8" },
    { trigger: "Correction of Work (1 Year)", source: "AIA A201", section: "Article 12.2" },
    { trigger: "Termination by Owner", source: "AIA A201", section: "Article 14" },
    { trigger: "Flow-Down Clause", source: "AIA A401", section: "Article 1.3" },
    { trigger: "Pay-When-Paid", source: "AIA A401", section: "Article 11.3" },
    { trigger: "Addenda (Before Bid)", source: "AIA A701", section: "Article 3.4" },
    { trigger: "Bid Security / Bond", source: "AIA A701", section: "Article 4" }
  ]},
  { category: "Florida Statutes & Manuals", items: [
    { trigger: "Lien Law / NTO (45 Days)", source: "FL Statutes / Contractors Manual", section: "Chapter 713" },
    { trigger: "Licensing / Exemptions", source: "FL Statutes / Contractors Manual", section: "Chapter 489" },
    { trigger: "Construction Defects (Right to Cure)", source: "FL Statutes / Contractors Manual", section: "Chapter 558" },
    { trigger: "Residential Recovery Fund", source: "FL Statutes / Contractors Manual", section: "Chapter 489 (Sec 489.140)" },
    { trigger: "Workers Comp Exemptions", source: "FL Statutes / Contractors Manual", section: "Chapter 440" },
    { trigger: "Building Code Administration", source: "FL Statutes", section: "Chapter 553" }
  ]},
  { category: "Accounting & Estimating", items: [
    { trigger: "Balance Sheet / Income Statement", source: "Builder's Guide to Accounting", section: "Financial Statements" },
    { trigger: "Over/Under Billing (WIP)", source: "Builder's Guide to Accounting", section: "Job Costing / WIP" },
    { trigger: "Depreciation (MACRS/Straight-line)", source: "Builder's Guide to Accounting", section: "Fixed Assets" },
    { trigger: "Labor Burden", source: "Builder's Guide to Accounting", section: "Payroll / Labor" },
    { trigger: "Break-Even Point", source: "Contractors Manual", section: "Financial Management" }
  ]},
  { category: "OSHA & Safety", items: [
    { trigger: "Fall Protection (6 ft)", source: "OSHA 1926", section: "Subpart M" },
    { trigger: "Scaffolds (4x Load)", source: "OSHA 1926", section: "Subpart L" },
    { trigger: "Excavation / Trenching (5 ft)", source: "OSHA 1926", section: "Subpart P" },
    { trigger: "Ladders (3 ft ext)", source: "OSHA 1926", section: "Subpart X" },
    { trigger: "Electrical (GFCI)", source: "OSHA 1926", section: "Subpart K" },
    { trigger: "Cranes & Rigging", source: "OSHA 1926", section: "Subpart CC" }
  ]}
];

const studyData = [
  { id:'aia', title:'AIA Contracts (Deep Dive)', icon:<Scale className="w-5 h-5"/>, color:'bg-blue-50 border-blue-200 text-blue-900',
    content:[
      { subtitle:'A201: The General Conditions (50% of Exam)', topics:[
        { term:'Article 3: Contractor Responsibilities', detail:'Sole control of "Means, Methods, Techniques, Sequences" (§3.3). Responsible for Safety (§10). Superintendent must be on site (§3.9). Reviews/stamps submittals BEFORE Architect (§3.12).', examTip:'Tricky Q: Who is responsible for safety? ALWAYS the Contractor.'},
        { term:'Article 4: Architect\'s Administration', detail:'Visits site at intervals (§4.2) - NOT continuous. Reviews submittals for "Design Intent Only". Certifies Pay Apps (§9.4). Acts as Initial Decision Maker (IDM) for claims (§15).', examTip:'IDM decision before mediation.'},
        { term:'Article 7: Changes in Work', detail:'Change Order (CO): All 3 sign (§7.2). CCD: Owner+Arch sign when price NOT agreed (§7.3). Minor Change: Arch only, no cost/time (§7.4).', examTip:'CCD = "Do it now, price later."'},
        { term:'Article 9: Payments & Completion', detail:'Schedule of Values used for pay apps. Retainage held until Substantial Completion (§9.8). Final Payment (§9.10) requires affidavit, surety consent, lien releases.', examTip:'Know Substantial vs Final.'}
      ]},
      { subtitle:'A401 (Subs) & A701 (Bidders)', topics:[
        { term:'A401 Flow-Down (§1.3)', detail:'Subcontractor is bound to GC by same terms GC is bound to Owner.', examTip:'Also governs "Pay-when-Paid" (§11.3).'},
        { term:'A701 Bidding', detail:'Addenda before bids (§3.4). Bid Security (§4).', examTip:'No addenda after bids open.'}
      ]}
    ]
  },
  { id:'statutes', title:'Florida Statutes (Lien/Licensing)', icon:<FileText className="w-5 h-5"/>, color:'bg-orange-50 border-orange-200 text-orange-900',
    content:[
      { subtitle:'Lien Law (Ch. 713) Timeline', topics:[
        { term:'Notice to Owner (NTO)', detail:'Deadline: 45 Days from FIRST furnishing labor/materials. Required for Subs/Suppliers not in privity with Owner.', examTip:'Hard deadline.'},
        { term:'Claim of Lien', detail:'Deadline: 90 Days from FINAL furnishing. (Warranty/Punch list work does NOT extend this).', examTip:'Recording deadline.'},
        { term:'Foreclosure Suit', detail:'Deadline: 1 Year from recording Claim of Lien.', examTip:'Lien void after 1 year if no suit.'},
        { term:'Notice of Commencement (NOC)', detail:'Must be posted/filed BEFORE first inspection. Valid for 1 year by default.', examTip:'Protects Owner from double payment issues.'}
      ]},
      { subtitle:'Critical Statutes (ECI Guide)', topics:[
        { term:'Chapter 558: Construction Defects', detail:'Statutory "Right to Cure". Owner must send Notice of Claim to Contractor before filing suit. Contractor gets opportunity to inspect/repair.', examTip:'Reduces litigation.'},
        { term:'Chapter 489: Licensing', detail:'Governs licensure. Unlicensed contracting is a crime. Defines exemptions. Residential Recovery Fund.', examTip:'Owner-occupied protections.'}
      ]}
    ]
  },
  { id:'precon', title:'Estimating, Math & ECI', icon:<Calculator className="w-5 h-5"/>, color:'bg-emerald-50 border-emerald-200 text-emerald-900',
    content:[
      { subtitle:'Estimating & Methods', topics:[
        { term:'Square Foot (Systems) Method', detail:'Preliminary/Budget estimate based on gross area. Fast but low accuracy. Used in preconstruction.', examTip:'Least accurate method.'},
        { term:'Unit Price vs. Quantity Take-off', detail:'Unit Price: Cost per item. Quantity Take-off: Detailed count of every material/labor hour (Most accurate).', examTip:'QTO takes the most time.'},
        { term:'Types of Contracts', detail:'Lump Sum (Fixed Price), Cost-Plus, GMP.', examTip:'GMP shares savings; Lump sum contractor keeps savings.'}
      ]},
      { subtitle:'Exam Math Formulas', topics:[
        { term:'Break-Even Point', detail:'Revenue = Fixed Costs / (1 - (Variable Costs / Sales)).', examTip:'Profit = 0 at BEP.'},
        { term:'Float (CPM Scheduling)', detail:'Total Float = Late Start (LS) - Early Start (ES).', examTip:'Zero Float = Critical Path.'},
        { term:'Liquidated Damages', detail:'Reimbursement for Owner\'s lost revenue (delay). NOT a penalty.', examTip:'Must be reasonable estimate.'}
      ]}
    ]
  },
  { id:'accounting_osha', title:'Accounting & OSHA Safety', icon:<Shield className="w-5 h-5"/>, color:'bg-red-50 border-red-200 text-red-900',
    content:[
      { subtitle:"Builder's Guide to Accounting", topics:[
        { term:'Financial Statements', detail:'Balance Sheet (Snapshot). Income Statement (P&L). WIP (Over/Under Billing).', examTip:'Bonding cares about WIP.'},
        { term:'Labor Burden', detail:'Total Cost of Employee = Wage + FICA + FUTA + Workers Comp + Insurance.', examTip:'Add burden to base wage.'},
        { term:'Depreciation', detail:'Straight-line vs MACRS.', examTip:'MACRS reduces tax liability faster in early years.'}
      ]},
      { subtitle:'OSHA 1926 (High Yield)', topics:[
        { term:'Height Safety', detail:'Fall Protection: 6ft. Scaffolds: 4x load. Ladders: 3ft extension, 4:1 slope.', examTip:'Memorize the numbers: 6, 4x, 3, 4:1.'},
        { term:'Excavation', detail:'Protection at 5ft. Spoil piles 2ft back. Ladder every 25ft. Competent Person daily inspection.', examTip:'Exit access + daily checks.'},
        { term:'Sustainability (ECI)', detail:'LEED basics; Waste Mgmt Plans.', examTip:'Focus: recycling vs landfill.'}
      ]}
    ]
  }
];

const flashcards = [
  { q: 'Claim of Lien Deadline', a: '90 Days' },
  { q: 'Notice to Owner (NTO) Deadline', a: '45 Days' },
  { q: 'Foreclosure Suit Deadline', a: '1 Year' },
  { q: 'A201 §3.3: Who controls Means & Methods?', a: 'Contractor' },
  { q: 'A201 §4.2: Who reviews Submittals for Design Intent?', a: 'Architect' },
  { q: 'A201 §7.3: Change without price agreement?', a: 'CCD (Construction Change Directive)' },
  { q: 'A701: Addenda must be issued when?', a: 'Before Bid Opening' },
  { q: 'Ch. 558: "Right to..."?', a: 'Right to Cure (Defects)' },
  { q: 'OSHA: Fall Protection Height', a: '6 Feet' },
  { q: 'OSHA: Trench Protection Depth', a: '5 Feet' },
  { q: 'OSHA: Ladder Extension', a: '3 Feet' },
  { q: 'Scaffold Capacity', a: '4x Intended Load' },
  { q: 'Estimating: Least accurate method?', a: 'Square Foot / Systems' },
  { q: 'Accounting: "Snapshot" statement?', a: 'Balance Sheet' },
  { q: 'Accounting: Revenue - Expenses = ?', a: 'Net Income (P&L)' },
  { q: 'CPM: Float on Critical Path?', a: 'Zero' },
  { q: 'A401: Clause binding Sub to GC?', a: 'Flow-Down Clause' },
  { q: 'Term: Reimbursement for delay (not penalty)', a: 'Liquidated Damages' },
  { q: 'Who performs Threshold Inspections?', a: 'Special Inspector' },
  { q: 'Ch. 489: Residential Recovery Fund protects whom?', a: 'Residential Homeowners' }
];

/* --- Views (Definitions, Reference, Study, Flashcards, Triggers) --- */
const Navigation = ({ activeTab, setActiveTab, isMobile, isOpen, setIsOpen }) => {
  const tabs = [
    { id: 'study', label: 'Study Guide', icon: <BookOpen size={18} /> },
    { id: 'lookup', label: 'Exam Lookup', icon: <Search size={18} /> },
    { id: 'definitions', label: 'Definitions', icon: <List size={18} /> },
    { id: 'flashcards', label: 'Flashcards', icon: <RefreshCw size={18} /> },
    { id: 'triggers', label: 'Trigger Trainer', icon: <Brain size={18} /> },
    { id: 'exam', label: 'Exam', icon: <CheckCircle size={18}/> },
    { id: 'progress', label: 'Progress', icon: <TrendingUp size={18}/> },
    { id: 'plan', label: 'Study Plan', icon: <Clock size={18}/> },
    { id: 'settings', label: 'Settings', icon: <SlidersHorizontal size={18}/> },
  ];

  return (
    <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 font-bold text-xl text-yellow-400">
            <Hammer className="w-6 h-6" />
            <span>GC Exam Master</span>
          </div>
          <div className="hidden md:flex space-x-2">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${activeTab === tab.id ? 'bg-yellow-500 text-slate-900 font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
              >{tab.icon}<span>{tab.label}</span></button>
            ))}
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white">{isOpen ? <X size={24} /> : <Menu size={24} />}</button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-slate-800 px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setIsOpen(false); }}
              className={`flex items.center space-x-3 w-full px-3 py-3 rounded-md text-base font-medium ${activeTab === tab.id ? 'bg-yellow-500 text-slate-900' : 'text-slate-300 hover:bg-slate-700'}`}
            >{tab.icon}<span>{tab.label}</span></button>
          ))}
        </div>
      )}
    </nav>
  );
};

const DefinitionsView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredData = definitionsData.map(group => ({
    ...group,
    terms: group.terms.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.def.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.terms.length > 0);

  return (
    <div className="max-w-4xl mx.auto animate-fadeIn pb-12">
      <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-indigo-500 mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Terms & Definitions Glossary</h2>
        <p className="text-slate-600 mb-4">Master the vocabulary of the exam. Use the search bar to find terms quickly.</p>
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input type="text" placeholder="Search definitions..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="grid md.grid-cols-2 gap-6">
        {filteredData.map((group, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="bg-indigo-50 px-6 py-3 border-b border-gray-100 font-bold text-indigo-900 flex items-center gap-2"><BookOpen size={16} />{group.category}</div>
            <div className="divide-y divide-gray-100">
              {group.terms.map((term, tIdx) => (
                <div key={tIdx} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="font-bold text-slate-800 mb-1">{term.name}</div>
                    <div className="text-sm text-slate-600 leading-relaxed">{term.def}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-12 text-slate-400">No definitions found.</div>
      )}
    </div>
  );
};

const ReferenceLookupView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredData = lookupData.map(group => ({
    ...group,
    items: group.items.filter(item => 
      item.trigger.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.section.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn pb-12">
      <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500 mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Exam Reference Lookup</h2>
        <p className="text-slate-600 mb-4">Open-book strategy: jump straight to the right book/section when a key phrase appears.</p>
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input type="text" placeholder="Search keywords (e.g., 'Safety', 'Lien', 'A201')..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="space-y-6">
        {filteredData.length > 0 ? filteredData.map((group, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <div className="bg-slate-50 px-6 py-3 border-b border-gray-100 font-bold text-slate-700">{group.category}</div>
            <div className="divide-y divide-gray-100">
              {group.items.map((item, i) => (
                <div key={i} className="p-4 hover.bg-blue-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="md:w-1/3">
                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">If Question Says...</span>
                    <span className="font-semibold text-slate-800 text-lg">{item.trigger}</span>
                  </div>
                  <div className="md:w-1/3">
                    <span className="text-xs font.bold text-slate-400 uppercase block mb-1">Go To Book...</span>
                    <span className="text-blue-700 font-medium bg-blue-100 px-2 py-1 rounded text-sm inline-block">{item.source}</span>
                  </div>
                  <div className="md:w-1/3">
                    <span className="text-xs font-bold text-slate-400 uppercase block mb-1">Look For...</span>
                    <span className="text-slate-600 font-mono text-sm">{item.section}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )) : (
          <div className="text-center py-12 text-slate-400">No matches found.</div>
        )}
      </div>
    </div>
  );
};

const StudyView = () => {
  const [expanded, setExpanded] = useState({});
  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">The Ultimate Study Guide</h2>
        <p className="text-slate-600">Consolidated from AIA Docs, FL Statutes (Lien/558/489), OSHA 1926, Accounting, and ECI.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {studyData.map((section, sIdx) => (
          <div key={section.id} className={`rounded-xl shadow-sm border overflow-hidden ${section.color} bg-opacity-30`}>
            <div className="p-4 flex items-center space-x-3 border-b border-gray-100 bg-white/50 backdrop-blur-sm">
              <div className="p-2 bg-white rounded-lg shadow-sm">{section.icon}</div>
              <h3 className="font-bold text-lg text-slate-800">{section.title}</h3>
            </div>
            <div className="p-4 space-y-6">
              {section.content.map((group, gIdx) => (
                <div key={gIdx}>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 ml-1">{group.subtitle}</h4>
                  <div className="space-y-3">
                    {group.topics.map((topic, tIdx) => {
                      const itemId = `${section.id}-${gIdx}-${tIdx}`;
                      const isExpanded = expanded[itemId];
                      return (
                        <div key={tIdx} className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden transition-all duration-200">
                          <button onClick={() => toggleExpand(itemId)} className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors">
                            <span className="font-semibold text-slate-800">{topic.term}</span>
                            {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                          </button>
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-0 text-sm animate-fadeIn">
                              <div className="mt-2 text-slate-600 leading-relaxed">{topic.detail}</div>
                              <div className="mt-3 bg-yellow-50 border border-yellow-100 p-3 rounded-md flex items-start gap-3">
                                <Lightbulb className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold text-yellow-700 block text-xs mb-1 uppercase">Exam Tip</span>
                                  <span className="text-yellow-800">{topic.examTip}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * UPDATED FlashcardsView with keyboard shortcuts.
 */
const FlashcardsView = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Advance to next card
  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 200);
  };

  // Go to previous card
  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 200);
  };

  // Flip front/back
  const handleFlip = () => {
    setIsFlipped((flip) => !flip);
  };

  // NEW: Add keyboard shortcuts (ArrowRight, ArrowLeft, Space)
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'ArrowRight') {
        nextCard();
      }
      if (event.key === 'ArrowLeft') {
        prevCard();
      }
      if (event.key === ' ') {
        handleFlip();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [nextCard, prevCard]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fadeIn">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800">High-Yield Numbers Drill</h2>
        <p className="text-slate-500">Tap card to flip</p>
      </div>

      <div onClick={handleFlip} className="relative w-full max-w-lg h-72 cursor-pointer perspective-1000 group select-none">
        <div className={`w-full h-full duration-500 preserve-3d absolute transition-all ease-in-out ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* Front of card */}
          <div className="absolute backface-hidden w-full h-full bg-white rounded-2xl shadow-xl border-2 border-slate-100 flex flex-col items-center justify-center p-8 text-center z-10">
            <span className="absolute top-4 right-4 text-xs font-bold text-slate-400">FRONT</span>
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-500">
              <Clock size={32} />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-800">{flashcards[currentIndex].q}</h3>
          </div>
          {/* Back of card */}
          <div className="absolute backface-hidden rotate-y-180 w-full h-full bg-slate-900 rounded-2xl shadow-xl flex flex-col items-center justify-center p-8 text-center text-white">
            <span className="absolute top-4 right-4 text-xs font-bold text-slate-500">BACK</span>
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify.center.mb-4 text-yellow-400">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-yellow-400">{flashcards[currentIndex].a}</h3>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-6 mt-8">
        <button onClick={prevCard} className="p-4 rounded-full bg-white shadow-md hover:bg-gray-50 text-slate-700 transition-colors"><ChevronLeft size={24} /></button>
        <span className="font-mono text-slate-500">{currentIndex + 1} / {flashcards.length}</span>
        <button onClick={nextCard} className="p-4 rounded-full bg-white shadow-md hover:bg-gray-50 text-slate-700 transition-colors"><ChevronRight size={24} /></button>
      </div>
    </div>
  );
};

const TriggerTrainer = () => {
  const triggers = [
    { phrase:"Weather / Acts of God", match:"Excusable Delay" },
    { phrase:"Contractor Negligence", match:"Non-Excusable Delay" },
    { phrase:"Time + Money", match:"Compensable Delay" },
    { phrase:"Owner & Contractor Delay", match:"Concurrent Delay" },
    { phrase:"Reimbursement for Delay", match:"Liquidated Damages" },
    { phrase:"Price Per Unit Known", match:"Unit Price Contract" },
    { phrase:"Fixed Price / Scope", match:"Lump Sum Contract" },
    { phrase:"Cost Unknown / Cap Set", match:"GMP Contract" },
    { phrase:"High Trust / Undefined Scope", match:"Cost-Plus Contract" },
    { phrase:"Means & Methods", match:"Contractor" },
    { phrase:"Design Intent", match:"Architect" },
    { phrase:"Furnishes Site Surveys", match:"Owner" },
    { phrase:"Pays for Permits", match:"Contractor" },
    { phrase:"Stops the Work (Safety)", match:"Contractor" },
    { phrase:"Stops the Work (Owner)", match:"Owner (A201 2.3)" },
    { phrase:"Certifies Payments", match:"Architect" },
    { phrase:"Price Agreed (All 3 Sign)", match:"Change Order" },
    { phrase:"Price NOT Agreed", match:"CCD (Const. Change Directive)" },
    { phrase:"Zero Cost / Zero Time", match:"Minor Change" },
    { phrase:"Before Bid Opening", match:"Addenda" },
    { phrase:"Preliminary Estimate", match:"Square Foot / Systems" },
    { phrase:"Most Accurate Estimate", match:"Quantity Take-off" },
    { phrase:"Civil / Road Work", match:"Unit Price" },
    { phrase:"45 Days (First Furnishing)", match:"Notice to Owner (NTO)" },
    { phrase:"90 Days (Last Furnishing)", match:"Claim of Lien" },
    { phrase:"1 Year (Recording)", match:"Foreclosure Suit" },
    { phrase:"Before First Inspection", match:"Notice of Commencement" },
    { phrase:"Right to Cure Defects", match:"Chapter 558" },
    { phrase:"Consumer Protection", match:"Residential Recovery Fund" },
    { phrase:"Zero Float", match:"Critical Path" },
    { phrase:"Snapshot of Finances", match:"Balance Sheet" },
    { phrase:"Profit & Loss", match:"Income Statement" },
    { phrase:"Over/Under Billing", match:"WIP Schedule" },
    { phrase:"Hidden Labor Cost", match:"Labor Burden" },
    { phrase:"Overlapping Phases", match:"Fast-Tracking" },
    { phrase:"Adding Resources", match:"Crashing" }
  ];

  const [items, setItems] = useState([...triggers].sort(() => Math.random() - 0.5));
  const [revealed, setRevealed] = useState({});
  const reveal = (idx) => setRevealed(prev => ({ ...prev, [idx]: true }));
  const reset = () => { setRevealed({}); setItems([...triggers].sort(() => Math.random() - 0.5)); };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Trigger Word Trainer</h2>
        <p className="text-slate-600">Tap a card to reveal the matching concept.</p>
      </div>
      <div className="grid md.grid-cols-2 gap-4">
        {items.map((item, idx) => (
          <div key={idx} onClick={() => reveal(idx)}
            className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover.shadow-lg transition-all group border-l-4 border-transparent hover:border-yellow-400">
            <div className="text-slate-500 text-xs font-bold tracking-wide uppercase mb-2">If the question says...</div>
            <div className="text-lg font-bold text-slate-800 mb-4">"{item.phrase}"</div>
            <div className={`mt-2 pt-4 border-t border-gray-100 transition-all duration-300 ${revealed[idx] ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
              <div className="text-xs text-slate-400 mb-1">The Answer Is:</div>
              <div className="text-xl font-bold text-blue-600">{item.match}</div>
            </div>
            {!revealed[idx] && (
              <div className="mt-2 text-center text-sm text-slate-400 italic group-hover:text-yellow-500">Click to reveal</div>
            )}
          </div>
        ))}
      </div>
      <div className="text-center mt-8">
        <button onClick={reset} className="inline-flex items-center space-x-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-full hover:bg-slate-300 transition-colors">
          <RefreshCw size={16} /><span>Shuffle & Reset</span>
        </button>
      </div>
    </div>
  );
};

const ReferenceLookupViewWrapper = ReferenceLookupView;

/* ------------------- Main App ------------------- */
const App = () => {
  const [activeTab, setActiveTab] = useState('study');
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [examCfg, setExamCfg] = useState({ total: EXAM_DEFAULTS.totalQuestions, minutes: EXAM_DEFAULTS.durationMinutes });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-yellow-200 selection:text-slate-900">
      <style>{styles}</style>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} isMobile={isMobile} isOpen={isOpen} setIsOpen={setIsOpen}/>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'study' && <StudyView />}
        {activeTab === 'lookup' && <ReferenceLookupViewWrapper />}
        {activeTab === 'definitions' && <DefinitionsView />}
        {activeTab === 'flashcards' && <FlashcardsView />}
        {activeTab === 'triggers' && <TriggerTrainer />}

        {activeTab === 'exam' && (
          <ExamSimulator
            flashcards={flashcards}
            lookupData={lookupData}
            studyData={studyData}
            total={examCfg.total}
            minutes={examCfg.minutes}
          />
        )}
        {activeTab === 'progress' && <ProgressBoard />}
        {activeTab === 'plan' && <StudyPlan totalMinutes={180} />}
        {activeTab === 'settings' && <SettingsPanel onApply={(cfg)=>setExamCfg(cfg)} />}
      </main>
      <footer className="bg-slate-900 text-slate-400 py-8 text-center mt-12">
        <p className="mb-2">Comprehensive Master Guide - Includes All Provided Documents.</p>
        <p className="text-sm opacity-50">&copy; {new Date().getFullYear()} GC Exam Master</p>
      </footer>
    </div>
  );
};

export default App;
