import { useState, useCallback, useMemo } from "react";

const INITIAL_ROLES = [
  {
    id: "mgr-technical-insurance-marine-shory",
    title: "Manager Technical Insurance - Marine",
    company: "Shory",
    location: "Abu Dhabi, UAE",
    dateSearched: "2026-04-13",
    status: "In Review",
    candidatesCount: 19,
    topScore: 65,
    scheduledRefresh: "Weekly",
    lastRefresh: "2026-04-13",
    jdSummary: {
      experience: "8+ years",
      mustHaveSkills: ["Marine insurance", "Marine underwriting", "Insurance broking", "Negotiation", "Stakeholder management", "Portfolio management", "Regulatory compliance", "Client relationship management"],
      niceToHave: ["Leadership", "Strategic thinking", "Cargo/Hull/P&I", "Reinsurance", "Sales targets"],
      qualifications: "Bachelor's in Insurance/Finance. Professional certification preferred."
    },
    searchStrings: [
      { label: "Narrow - Exact Role + Location", type: "narrow", query: 'site:linkedin.com/in/ "marine insurance" "manager" ("Abu Dhabi" OR "UAE")' },
      { label: "Medium - Marine Insurance + Gulf", type: "medium", query: 'site:linkedin.com/in/ "marine insurance" ("manager" OR "head" OR "director") ("Abu Dhabi" OR "Dubai" OR "UAE" OR "GCC")' },
      { label: "Broad - Underwriting/Broking Titles", type: "broad", query: 'site:linkedin.com/in/ ("marine underwriter" OR "marine insurance manager" OR "marine broker") ("UAE" OR "Abu Dhabi" OR "Dubai" OR "Middle East")' },
      { label: "Adjacent - Cargo/Hull/P&I", type: "adjacent", query: 'site:linkedin.com/in/ ("cargo insurance" OR "hull insurance" OR "P&I") ("manager" OR "senior") ("UAE" OR "Dubai")' },
      { label: "Wide Net - Global Marine Technical", type: "broad", query: 'site:linkedin.com/in/ "marine insurance" ("technical manager" OR "technical underwriter" OR "portfolio manager")' }
    ],
    candidates: [
      { name: "Meenakshi Srinath", url: "https://ae.linkedin.com/in/meenakshi-srinath-01ab534", title: "Head of Marine, Middle East", company: "Berkshire Hathaway Specialty Insurance", location: "UAE", score: 65, skills: 46, experience: 83, role: 98, rationale: "Strong title match: Head of Marine, Middle East; Senior title implies 8+ years; Strong company: Berkshire Hathaway Specialty Insurance; UAE based" },
      { name: "Vyankatesh Murlidhar Tak", url: "https://ae.linkedin.com/in/vyankatesh-murlidhar-tak-3500321a", title: "Senior Underwriter - Head of Marine MENA", company: "Markel International", location: "Dubai, UAE", score: 64, skills: 44, experience: 83, role: 98, rationale: "Strong title match; Head of Marine MENA at Markel International; Strong company; UAE based" },
      { name: "Rishi Raj", url: "https://ae.linkedin.com/in/rishi-raj-marine", title: "Marine Underwriter", company: "Abu Dhabi National Takaful P.S.C.", location: "Dubai, UAE", score: 63, skills: 51, experience: 98, role: 73, rationale: "18+ years marine insurance expertise; Abu Dhabi National Takaful; UAE based" },
      { name: "Amanda El Shakankiri", url: "https://ae.linkedin.com/in/amandashaks", title: "FAC Underwriting Manager - Marine", company: "Saudi Re", location: "UAE / Saudi Arabia", score: 62, skills: 47, experience: 83, role: 78, rationale: "FAC Underwriting Manager Marine at Saudi Re; Previously Senior UW at AIG Dubai; Strong company" },
      { name: "Sajad Salim", url: "https://ae.linkedin.com/in/sajad-salim-94002980", title: "General Manager (Non-Motor & Marine)", company: "Omega Insurance Brokers LLC", location: "Dubai, UAE", score: 61, skills: 39, experience: 83, role: 88, rationale: "Strong title: General Manager; Marine insurance at Omega Insurance Brokers; UAE based" },
      { name: "Sonia Khiara", url: "https://ae.linkedin.com/in/sonia-khiara", title: "Marine Underwriter", company: "Earnest Insurance Brokers LLC", location: "Dubai, UAE", score: 60, skills: 42, experience: 88, role: 73, rationale: "13+ years marine insurance experience; Marine Underwriter at Earnest Insurance Brokers; UAE based" },
      { name: "Afzal Rahman", url: "https://ae.linkedin.com/in/afzal-rahman-58104432", title: "Sr Manager - Marine", company: "Marine Insurance Professional", location: "UAE", score: 60, skills: 51, experience: 98, role: 83, rationale: "Strong title: Sr Manager Marine; 16+ years UAE marine hull and liabilities experience" },
      { name: "Bobyson Varghese", url: "https://ae.linkedin.com/in/bobyson-varghese-1a2163111", title: "Marine Underwriting Manager", company: "Al-Ittihad Al-Watani Insurance", location: "UAE", score: 58, skills: 39, experience: 73, role: 93, rationale: "Strong title match: Marine Underwriting Manager; Al-Ittihad Al-Watani Insurance; UAE based" },
      { name: "Abad Ali (Dip-CII)", url: "https://ae.linkedin.com/in/abad-ali-dip-cii-59b45a284", title: "Asst Manager - UW (Marine)", company: "Abu Dhabi National Insurance PJSC", location: "Dubai, UAE", score: 57, skills: 55, experience: 53, role: 58, rationale: "Dip-CII certified; ADNIC Abu Dhabi; Results-driven Marine Insurance professional" },
      { name: "Sayyid Mohammed Favas", url: "https://ae.linkedin.com/in/sayyid-mohammed-favas-aiii-371520210", title: "Sr Relationship Exec - Marine", company: "Nasco Insurance Brokers", location: "Dubai, UAE", score: 56, skills: 55, experience: 53, role: 53, rationale: "AIII & MBA Insurance certified; Hull, P&I, Cargo specialist; Previously Marine UW at Al Sagr" },
      { name: "Dilna Dilip Kumar", url: "https://ae.linkedin.com/in/dilna-dilip-kumar-654a30120", title: "Marine Underwriter", company: "RSA", location: "Dubai, UAE", score: 53, skills: 30, experience: 53, role: 73, rationale: "Marine Underwriter at RSA; Manipal Academy MAHE Dubai; UAE based" },
      { name: "Jamsheer Panolath", url: "https://in.linkedin.com/in/jamsheer-jp", title: "Marine Insurance Specialist", company: "Gargash Insurance Services LLC", location: "Dubai, UAE", score: 53, skills: 42, experience: 53, role: 68, rationale: "Insurance Specialist and Marine Underwriter; Gargash Insurance Services; Dubai" },
      { name: "Anjali Chaturvedi", url: "https://ae.linkedin.com/in/anjali-chaturvedi-marine", title: "Marine Claims Manager", company: "City Insurance Brokers LLC", location: "UAE", score: 52, skills: 30, experience: 53, role: 63, rationale: "Marine Claims Manager; Decisive leader; City Insurance Brokers UAE" },
      { name: "Marwa Shaker", url: "https://ae.linkedin.com/in/marwa-shaker-marine", title: "Marine Insurance Brokers", company: "Marine Insurance Brokers", location: "UAE", score: 51, skills: 30, experience: 85, role: 53, rationale: "12+ years operations experience; Marine Insurance Brokers; UAE" },
      { name: "Vishal Arora", url: "https://ae.linkedin.com/in/vishal-arora-marine", title: "Asst Manager - Marine", company: "Nasco Insurance Brokers", location: "Dubai, UAE", score: 50, skills: 30, experience: 53, role: 58, rationale: "Marine Insurance Expert; Nasco M.E. Insurance Brokers; Dubai" },
      { name: "Kavitha Shyam", url: "https://ae.linkedin.com/in/kavitha-shyam-43145646", title: "Marine Manager", company: "City Marine Insurance Brokers", location: "UAE", score: 50, skills: 30, experience: 73, role: 93, rationale: "Marine Manager; City Marine Insurance Brokers; UAE based" },
      { name: "Shalin Dhanushka", url: "https://lk.linkedin.com/in/shalin-dhanushka-7b11a491", title: "Marine Underwriter", company: "GR Risk Partners Limited", location: "Dubai, UAE", score: 49, skills: 21, experience: 53, role: 73, rationale: "Marine Underwriter; CIMA qualified; GR Risk Partners; Dubai" },
      { name: "Charles Aoun", url: "https://ae.linkedin.com/in/charles-aoun-marine", title: "Marine Underwriter", company: "AIG", location: "Dubai, UAE", score: 49, skills: 21, experience: 53, role: 73, rationale: "Marine Underwriter at AIG Dubai; Strong company; UAE based" },
      { name: "Sanjana Samuel", url: "https://ae.linkedin.com/in/sanjana-samuel-684063196", title: "Marine Underwriter", company: "", location: "UAE", score: 46, skills: 30, experience: 53, role: 73, rationale: "Marine Underwriter; Liaising with Underwriters in US & UAE" }
    ]
  }
];

const STATUS_COLORS = {
  "New": { bg: "#EBF5FF", text: "#1D4ED8", border: "#93C5FD" },
  "In Review": { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" },
  "Closed": { bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB" }
};

const SEARCH_TYPE_COLORS = { narrow: "#EF4444", medium: "#F59E0B", broad: "#10B981", adjacent: "#3B82F6" };

function ScoreBar({ score, label, small }) {
  const color = score >= 75 ? "#10B981" : score >= 55 ? "#F59E0B" : "#EF4444";
  return (
    <div className={`flex items-center gap-2 ${small ? "mb-1" : "mb-2"}`}>
      {label && <span className="text-xs text-gray-500 w-20 shrink-0">{label}</span>}
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className={`font-semibold ${small ? "text-xs w-7" : "text-sm w-8"}`} style={{ color }}>{score}</span>
    </div>
  );
}

function ScoreBadge({ score }) {
  const color = score >= 75 ? "#059669" : score >= 55 ? "#D97706" : "#DC2626";
  const bg = score >= 75 ? "#D1FAE5" : score >= 55 ? "#FEF3C7" : "#FEE2E2";
  return (
    <div className="flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg" style={{ backgroundColor: bg, color }}>{score}</div>
  );
}

function CandidateRow({ c, expanded, onToggle }) {
  return (
    <div className="border border-gray-200 rounded-lg mb-2 overflow-hidden hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3 p-3 cursor-pointer" onClick={onToggle}>
        <ScoreBadge score={c.score} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 truncate">{c.name}</span>
            <a href={c.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-blue-500 hover:text-blue-700 text-xs shrink-0">LinkedIn ↗</a>
          </div>
          <div className="text-sm text-gray-600 truncate">{c.title} {c.company && `· ${c.company}`}</div>
          <div className="text-xs text-gray-400">{c.location}</div>
        </div>
        <svg className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 bg-gray-50">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-3">
            <ScoreBar score={c.skills} label="Skills" small />
            <ScoreBar score={c.experience} label="Experience" small />
            <ScoreBar score={c.role} label="Role Fit" small />
          </div>
          <p className="text-xs text-gray-600 italic leading-relaxed">{c.rationale}</p>
        </div>
      )}
    </div>
  );
}

function RoleCard({ role, isSelected, onClick }) {
  const s = STATUS_COLORS[role.status] || STATUS_COLORS["New"];
  return (
    <div onClick={onClick} className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${isSelected ? "border-blue-500 bg-blue-50 shadow-md" : "border-gray-200 bg-white"}`}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-gray-900 text-sm leading-tight pr-2">{role.title}</h3>
        <span className="px-2 py-0.5 rounded-full text-xs font-medium shrink-0" style={{ backgroundColor: s.bg, color: s.text, border: `1px solid ${s.border}` }}>{role.status}</span>
      </div>
      <div className="text-xs text-gray-500 mb-3">{role.company} · {role.location}</div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-lg font-bold text-gray-900">{role.candidatesCount}</div>
          <div className="text-xs text-gray-500">Candidates</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-lg font-bold" style={{ color: role.topScore >= 75 ? "#059669" : role.topScore >= 55 ? "#D97706" : "#DC2626" }}>{role.topScore}</div>
          <div className="text-xs text-gray-500">Top Score</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-lg font-bold text-blue-600">{role.searchStrings?.length || 0}</div>
          <div className="text-xs text-gray-500">Searches</div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        <span>Searched {role.dateSearched}</span>
        {role.scheduledRefresh && (
          <>
            <span>·</span>
            <span className="text-blue-500 font-medium">{role.scheduledRefresh} refresh</span>
          </>
        )}
      </div>
    </div>
  );
}

function SearchStringCard({ s }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(s.query).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <div className="border border-gray-200 rounded-lg p-3 mb-2 bg-white">
      <div className="flex items-center gap-2 mb-2">
        <span className="px-2 py-0.5 rounded text-xs font-bold text-white" style={{ backgroundColor: SEARCH_TYPE_COLORS[s.type] || "#6B7280" }}>{s.type.toUpperCase()}</span>
        <span className="font-medium text-sm text-gray-700">{s.label}</span>
      </div>
      <div className="flex items-start gap-2">
        <code className="flex-1 text-xs bg-gray-50 p-2 rounded border border-gray-200 text-gray-600 break-all leading-relaxed">{s.query}</code>
        <button onClick={copy} className="shrink-0 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium text-gray-600 transition-colors">
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

function AddRoleModal({ onClose, onAdd }) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Role</h2>
        <p className="text-sm text-gray-500 mb-4">Paste or upload a JD to trigger the full sourcing pipeline.</p>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Senior Software Engineer" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g., Shory" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., Abu Dhabi, UAE" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
            <textarea rows={4} placeholder="Paste the full JD here..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={() => { if (title) { onAdd({ id: Date.now().toString(), title, company, location, dateSearched: new Date().toISOString().split("T")[0], status: "New", candidatesCount: 0, topScore: 0, scheduledRefresh: null, lastRefresh: null, searchStrings: [], candidates: [], jdSummary: {} }); onClose(); } }} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white transition-colors">
            Add & Run Pipeline
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RecruiterDashboard() {
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [selectedRoleId, setSelectedRoleId] = useState(INITIAL_ROLES[0]?.id);
  const [expandedCandidate, setExpandedCandidate] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState("candidates");
  const [sortBy, setSortBy] = useState("score");
  const [filterMinScore, setFilterMinScore] = useState(0);

  const selectedRole = useMemo(() => roles.find(r => r.id === selectedRoleId), [roles, selectedRoleId]);

  const sortedCandidates = useMemo(() => {
    if (!selectedRole) return [];
    let list = [...selectedRole.candidates].filter(c => c.score >= filterMinScore);
    if (sortBy === "score") list.sort((a, b) => b.score - a.score);
    else if (sortBy === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "skills") list.sort((a, b) => b.skills - a.skills);
    else if (sortBy === "experience") list.sort((a, b) => b.experience - a.experience);
    return list;
  }, [selectedRole, sortBy, filterMinScore]);

  const stats = useMemo(() => {
    if (!selectedRole) return {};
    const c = selectedRole.candidates;
    const avg = c.length ? Math.round(c.reduce((s, x) => s + x.score, 0) / c.length) : 0;
    const high = c.filter(x => x.score >= 60).length;
    return { total: c.length, avg, high, top: selectedRole.topScore };
  }, [selectedRole]);

  const handleAddRole = useCallback((role) => {
    setRoles(prev => [...prev, role]);
    setSelectedRoleId(role.id);
  }, []);

  const updateStatus = useCallback((status) => {
    setRoles(prev => prev.map(r => r.id === selectedRoleId ? { ...r, status } : r));
  }, [selectedRoleId]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recruiter Sourcing Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">LinkedIn X-Ray Search · Candidate Scoring · Pipeline Tracking</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-xs text-gray-400">
              <div>{roles.length} active role{roles.length !== 1 ? "s" : ""}</div>
              <div>{roles.reduce((s, r) => s + r.candidatesCount, 0)} total candidates</div>
            </div>
            <button onClick={() => setShowAddModal(true)} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add Role
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Left: Role List */}
          <div className="w-80 shrink-0 space-y-3">
            <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-2">Open Roles</h2>
            {roles.map(role => (
              <RoleCard key={role.id} role={role} isSelected={role.id === selectedRoleId} onClick={() => { setSelectedRoleId(role.id); setExpandedCandidate(null); }} />
            ))}

            {/* Scheduled Searches */}
            <div className="mt-6">
              <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-2">Scheduled Searches</h2>
              {roles.filter(r => r.scheduledRefresh).map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg mb-2">
                  <div>
                    <div className="text-sm font-medium text-gray-800 truncate" style={{maxWidth: 160}}>{r.title}</div>
                    <div className="text-xs text-gray-400">Last: {r.lastRefresh}</div>
                  </div>
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-semibold">{r.scheduledRefresh}</span>
                </div>
              ))}
              {roles.filter(r => r.scheduledRefresh).length === 0 && (
                <p className="text-sm text-gray-400 italic">No scheduled searches yet</p>
              )}
            </div>
          </div>

          {/* Right: Detail Panel */}
          <div className="flex-1 min-w-0">
            {selectedRole ? (
              <>
                {/* Role Header */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedRole.title}</h2>
                      <div className="text-sm text-gray-500">{selectedRole.company} · {selectedRole.location}</div>
                    </div>
                    <select value={selectedRole.status} onChange={e => updateStatus(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none">
                      <option>New</option>
                      <option>In Review</option>
                      <option>Closed</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
                      <div className="text-xs text-blue-500">Total Candidates</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">{stats.top}</div>
                      <div className="text-xs text-green-500">Top Score</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-700">{stats.avg}</div>
                      <div className="text-xs text-yellow-500">Avg Score</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-700">{stats.high}</div>
                      <div className="text-xs text-purple-500">Score 60+</div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
                  {[
                    { key: "candidates", label: `Candidates (${sortedCandidates.length})` },
                    { key: "searches", label: "X-Ray Searches" },
                    { key: "jd", label: "JD Summary" }
                  ].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === "candidates" && (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="score">Sort by Overall Score</option>
                        <option value="skills">Sort by Skills Match</option>
                        <option value="experience">Sort by Experience</option>
                        <option value="name">Sort by Name</option>
                      </select>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Min score:</span>
                        <input type="range" min={0} max={80} step={5} value={filterMinScore} onChange={e => setFilterMinScore(+e.target.value)} className="w-24" />
                        <span className="font-semibold text-gray-700 w-6">{filterMinScore}</span>
                      </div>
                    </div>
                    <div className="max-h-[600px] overflow-y-auto pr-1">
                      {sortedCandidates.map(c => (
                        <CandidateRow key={c.name} c={c} expanded={expandedCandidate === c.name} onToggle={() => setExpandedCandidate(expandedCandidate === c.name ? null : c.name)} />
                      ))}
                      {sortedCandidates.length === 0 && <p className="text-center text-gray-400 py-10">No candidates match the current filter</p>}
                    </div>
                  </div>
                )}

                {activeTab === "searches" && (
                  <div>
                    <p className="text-sm text-gray-500 mb-3">Copy any search string and paste into Google to run the X-Ray search.</p>
                    {selectedRole.searchStrings.map((s, i) => <SearchStringCard key={i} s={s} />)}
                  </div>
                )}

                {activeTab === "jd" && selectedRole.jdSummary && (
                  <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                    {selectedRole.jdSummary.experience && (
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm mb-1">Experience Required</h3>
                        <p className="text-sm text-gray-600">{selectedRole.jdSummary.experience}</p>
                      </div>
                    )}
                    {selectedRole.jdSummary.qualifications && (
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm mb-1">Qualifications</h3>
                        <p className="text-sm text-gray-600">{selectedRole.jdSummary.qualifications}</p>
                      </div>
                    )}
                    {selectedRole.jdSummary.mustHaveSkills?.length > 0 && (
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm mb-2">Must-Have Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedRole.jdSummary.mustHaveSkills.map((s, i) => (
                            <span key={i} className="px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedRole.jdSummary.niceToHave?.length > 0 && (
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm mb-2">Nice-to-Have Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedRole.jdSummary.niceToHave.map((s, i) => (
                            <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-400">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <p className="text-lg font-medium">Select a role to view candidates</p>
                  <p className="text-sm mt-1">Or add a new role to start the sourcing pipeline</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && <AddRoleModal onClose={() => setShowAddModal(false)} onAdd={handleAddRole} />}
    </div>
  );
}
