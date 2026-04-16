import { useState, useCallback, useRef } from "react";
import * as XLSX from "sheetjs";

// ─── LEVEL & COMPETENCY DATA ───
const LEVELS = [
  { id: "L3", title: "Junior Engineer", track: "IC" },
  { id: "L4", title: "Mid Engineer", track: "IC" },
  { id: "L5", title: "Senior Engineer", track: "IC" },
  { id: "L6", title: "Staff Engineer", track: "IC" },
  { id: "L7", title: "Engineering Manager", track: "Management" },
  { id: "L8", title: "Sr. Manager / Director", track: "Management" },
  { id: "L9", title: "VP / Sr. Director", track: "Management" },
];

const STAGES = [
  { key: "sourced", label: "Sourced", color: "bg-gray-200 text-gray-700" },
  { key: "screening", label: "Screening", color: "bg-blue-100 text-blue-700" },
  { key: "phone", label: "Phone Interview", color: "bg-green-100 text-green-700" },
  { key: "technical", label: "Technical Round", color: "bg-yellow-100 text-yellow-700" },
  { key: "hm", label: "HM Round", color: "bg-orange-100 text-orange-700" },
  { key: "final", label: "Final / Panel", color: "bg-purple-100 text-purple-700" },
  { key: "offer", label: "Offer", color: "bg-red-100 text-red-700" },
];

const STATUS_OPTIONS = ["Active", "On Hold", "Rejected", "Withdrawn", "Hired"];

// ─── CONTENT GENERATORS ───
function generateJD(role) {
  return {
    summary: `We're hiring a ${role.title} (${role.level}) to design, build, and scale systems within the ${role.department} department at ${role.company}. This person will own key workstreams end-to-end and operate as a force multiplier on a growing team. The right candidate is pragmatic, thinks in systems, and ships with urgency without cutting corners.`,
    responsibilities: [
      `Design, build, and maintain core systems and services that support ${role.department} objectives.`,
      "Own the full lifecycle of features — from technical design through deployment, monitoring, and iteration.",
      "Build and optimize integrations with internal and third-party systems.",
      "Improve system performance, reliability, and scalability across the platform.",
      "Collaborate cross-functionally with product, design, and engineering partners.",
      "Participate in code reviews, architecture discussions, and technical planning sessions.",
      "Mentor and support team members through pairing, reviews, and knowledge sharing.",
      "Contribute to on-call rotation and incident response for production systems.",
    ],
    mustHave: [
      `5+ years of professional experience in a relevant ${role.title.toLowerCase()} capacity.`,
      "Strong proficiency in core technologies required for the role.",
      "Deep experience designing and building production-grade systems.",
      "Solid understanding of databases, data modeling, and system architecture.",
      "Hands-on experience with cloud platforms (AWS, Azure, or GCP).",
      "Track record of owning services in production — monitoring, alerting, incident response.",
      "Clear technical communication — can write design docs and explain tradeoffs.",
    ],
    niceToHave: [
      `Experience in ${role.company}'s industry or domain.`,
      "Familiarity with event-driven architecture or distributed systems patterns.",
      "Experience with CI/CD pipelines, infrastructure-as-code, or DevOps practices.",
      "Knowledge of security best practices and compliance frameworks.",
      "Experience migrating or modernizing legacy systems.",
      "Open-source contributions or side projects demonstrating craft.",
    ],
  };
}

function generateIntakeQuestions(role) {
  return [
    `What are the top 3 must-have skills or experiences for this ${role.title} role?`,
    "Is this a backfill or a net-new headcount? If backfill, what happened?",
    "What does the current team look like — size, seniority, and skill gaps?",
    "What are the first 2-3 projects this person would own in their first 90 days?",
    "What's the biggest gap on the team that this hire needs to fill?",
    "Are there any non-negotiable technologies or frameworks for this role?",
    "Who will be on the interview panel, and what will each round assess?",
    "What's the target timeline — when do you need someone in seat?",
    "Is this role remote, hybrid, or on-site? Any flexibility?",
    `What distinguishes ${role.level} expectations from the level below — what does this level mean here specifically?`,
  ];
}

function generateInterviewMatrix(role) {
  return [
    { stage: "Screening", interviewer: "Recruiter", duration: "30 min", competencies: "Basic qualifications, communication, motivation", format: "Phone/Video — Resume walkthrough, role fit, logistics", weight: "Pass / Fail" },
    { stage: "Phone Interview", interviewer: "Senior Team Member", duration: "45 min", competencies: "Core skills, communication, problem-solving", format: "Technical screen — domain knowledge + practical exercise", weight: "1–4 Rating" },
    { stage: "Technical Round", interviewer: "2 Panel Members", duration: "60 min", competencies: "System design, deep technical skills, data proficiency", format: "Whiteboard or virtual — deep-dive + practical exercise", weight: "1–4 Rating" },
    { stage: "HM Round", interviewer: role.hiringManager, duration: "45 min", competencies: "Ownership, collaboration, team impact", format: "Behavioral + situational — leadership, conflict, judgment", weight: "1–4 Rating" },
    { stage: "Final / Panel", interviewer: "Skip-level + Cross-functional", duration: "45 min", competencies: "Culture fit, mentorship, strategic thinking", format: "Conversational — values alignment, growth mindset", weight: "1–4 Rating" },
  ];
}

function generateCompetencies(role) {
  return [
    { name: "System Design & Architecture", signal: "Can decompose a vague problem into components and data models. Articulates tradeoffs clearly. Has opinions grounded in real production experience." },
    { name: "Core Technical Skills", signal: `Demonstrates strong proficiency in technologies relevant to the ${role.title} role. Handles edge cases and error paths. Writes clean, well-tested implementations.` },
    { name: "Ownership & Reliability", signal: "Takes work from spec to production without being chased. Thinks about monitoring, failure modes, and rollback plans. Has examples of owning incidents end-to-end." },
    { name: "Communication & Collaboration", signal: "Explains concepts clearly to both technical and non-technical stakeholders. Asks good clarifying questions. Gives and receives feedback constructively." },
    { name: "Data & Domain Proficiency", signal: "Understands data modeling, query optimization, and domain-specific data patterns. Can reason about data consistency and integrity. Experience with migrations." },
    { name: "Mentorship & Team Impact", signal: "Evidence of helping others grow through reviews, pairing, documentation, or knowledge sharing. Improves team processes beyond just shipping their own work." },
  ];
}

function generatePrepGuide(role) {
  return [
    {
      stage: "Screening Call", num: "01", duration: "30 min", interviewer: "Recruiter",
      sections: [
        { label: "What to Expect", content: `A friendly 30-minute conversation to learn about your background and share details about the ${role.title} role at ${role.company}. This is not a technical test.` },
        { label: "How to Prepare", content: "Review the job description. Be ready to discuss your most relevant experience, what you're looking for, and your timeline/compensation expectations." },
        { label: "Sample Questions", content: "\"Walk me through your current role.\"\n\"What are you looking for in your next position?\"\n\"What's your timeline and compensation expectation?\"" },
        { label: "Questions to Ask", content: "\"What does the team structure look like?\"\n\"What are the biggest challenges the team faces?\"\n\"What does the full interview process look like?\"" },
      ]
    },
    {
      stage: "Phone Interview", num: "02", duration: "45 min", interviewer: "Senior Team Member",
      sections: [
        { label: "What to Expect", content: "A technical screen with a senior team member. You'll work through practical problems relevant to the role. Expect to demonstrate your core domain knowledge." },
        { label: "How to Prepare", content: "Brush up on fundamentals for this role. Be ready to work through real-world scenarios — not just theory. Think about edge cases and tradeoffs." },
        { label: "Pro Tips", content: "Talk through your approach before diving in.\nStart with a working solution, then optimize.\nAsk clarifying questions — constraints matter.\nTest your work with normal and edge cases." },
      ]
    },
    {
      stage: "Technical Deep-Dive", num: "03", duration: "60 min", interviewer: "2 Panel Members",
      sections: [
        { label: "What to Expect", content: "A deep-dive split into two parts: a design/architecture exercise (~35 min) and a discussion of a past project you've worked on (~25 min)." },
        { label: "How to Prepare", content: "Practice designing systems end-to-end. Be ready to discuss tradeoffs, draw diagrams, and incorporate real-world constraints like failure modes and scalability." },
        { label: "Framework", content: "1. Clarify requirements (functional + non-functional)\n2. Estimate scale and constraints\n3. Design high-level architecture\n4. Drill into key components\n5. Discuss tradeoffs explicitly\n6. Address failure modes and observability" },
        { label: "For the Project Discussion", content: "Pick a project you know deeply. Be ready to explain: the problem, your specific role, key decisions and tradeoffs, what you'd change, and how you measured success." },
      ]
    },
    {
      stage: "Hiring Manager Round", num: "04", duration: "45 min", interviewer: role.hiringManager,
      sections: [
        { label: "What to Expect", content: `A behavioral interview with ${role.hiringManager}. Focused on how you work — ownership style, conflict resolution, collaboration, and how you operate when things go wrong.` },
        { label: "How to Prepare", content: "Prepare 3-4 STAR stories: owning a project end-to-end, handling a crisis, navigating disagreement, mentoring someone, and making a tough call with incomplete information." },
        { label: "Sample Questions", content: "\"Tell me about a time you owned something from zero to production.\"\n\"Describe a time you disagreed with a technical decision.\"\n\"How do you handle competing priorities?\"\n\"Tell me about helping someone on your team grow.\"" },
        { label: "Questions to Ask", content: `"What does success look like in 6 months?"\n"What's the team's biggest challenge right now?"\n"How do you give feedback?"\n"What's the growth path from ${role.level}?"` },
      ]
    },
    {
      stage: "Final / Panel", num: "05", duration: "45 min", interviewer: "Skip-level + Cross-functional",
      sections: [
        { label: "What to Expect", content: `A conversational round focused on values, growth, and collaboration. Think of it as mutual evaluation — they want to know if you'd elevate the team at ${role.company}.` },
        { label: "How to Prepare", content: `Research ${role.company}'s mission and values. Be ready to discuss impact beyond your immediate team: mentoring, process improvements, cross-functional work. Think about your career goals.` },
        { label: "Sample Questions", content: `"What drew you to ${role.company}?"\n"Tell me about improving something that wasn't your job."\n"What's your mentoring philosophy?"\n"Where do you want to be in 3 years?"` },
      ]
    },
  ];
}

// ─── EXCEL EXPORT ───
function exportToExcel(role, candidates) {
  const wb = XLSX.utils.book_new();
  const jd = generateJD(role);

  // JD Sheet
  const jdData = [
    [`${role.title} – Job Specification`],
    [], ["Company", role.company], ["Department", role.department],
    ["Hiring Manager", role.hiringManager], ["Level", role.level],
    [], ["Role Summary"], [jd.summary],
    [], ["Key Responsibilities"], ...jd.responsibilities.map(r => [`• ${r}`]),
    [], ["Must-Have Qualifications"], ...jd.mustHave.map(r => [`• ${r}`]),
    [], ["Nice-to-Have"], ...jd.niceToHave.map(r => [`• ${r}`]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(jdData), "Job Specification");

  // Intake Sheet
  const intakeData = [
    [`${role.title} – Intake Meeting`], [],
    ["#", "Question", "Notes"],
    ...generateIntakeQuestions(role).map((q, i) => [i + 1, q, ""]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(intakeData), "Intake Meeting");

  // Matrix Sheet
  const matrix = generateInterviewMatrix(role);
  const matrixData = [
    [`${role.title} – Interview Matrix`], [],
    ["Stage", "Interviewer", "Duration", "Competencies", "Format", "Weight"],
    ...matrix.map(m => [m.stage, m.interviewer, m.duration, m.competencies, m.format, m.weight]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(matrixData), "Interview Matrix");

  // Scorecard Sheet
  const comps = generateCompetencies(role);
  const scoreData = [
    [`${role.title} – Interview Scorecard`], [],
    ["Candidate:", ""], ["Interviewer:", ""], ["Stage:", ""], ["Date:", ""], [],
    ["1 = Strong No", "2 = Lean No", "3 = Lean Yes", "4 = Strong Yes"], [],
    ["Competency", "Signal to Look For", "Rating (1-4)", "Notes"],
    ...comps.map(c => [c.name, c.signal, "", ""]),
    [], ["Hire Decision:", ""], ["Summary:", ""],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(scoreData), "Interview Scorecard");

  // Tracker Sheet
  const trackerHeaders = ["Name", "Email", "Source", "Stage", "Status", "Date Sourced", "Last Updated", "Notes"];
  const trackerData = [
    [`${role.title} – Candidate Tracker`], [],
    trackerHeaders,
    ...candidates.map(c => [c.name, c.email, c.source, c.stage, c.status, c.dateSourced, c.lastUpdated, c.notes]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(trackerData), "Candidate Tracker");

  XLSX.writeFile(wb, `${role.title} - Recruiter Hub.xlsx`);
}

// ─── COMPONENTS ───
const tabs = [
  { id: "dashboard", label: "Dashboard", icon: "◉" },
  { id: "intake", label: "Intake Meeting", icon: "◈" },
  { id: "jd", label: "Job Spec", icon: "◇" },
  { id: "matrix", label: "Interview Matrix", icon: "◆" },
  { id: "scorecard", label: "Scorecard", icon: "◐" },
  { id: "prep", label: "Candidate Prep", icon: "◑" },
  { id: "tracker", label: "Tracker", icon: "◒" },
];

const tabColors = {
  dashboard: "from-slate-800 to-slate-900",
  intake: "from-teal-600 to-teal-700",
  jd: "from-slate-700 to-slate-800",
  matrix: "from-purple-700 to-purple-800",
  scorecard: "from-red-600 to-red-700",
  prep: "from-emerald-600 to-emerald-700",
  tracker: "from-orange-500 to-orange-600",
};

// ─── ROLE SETUP FORM ───
function RoleSetupForm({ onSubmit }) {
  const [mode, setMode] = useState("manual");
  const [jdText, setJdText] = useState("");
  const [form, setForm] = useState({
    title: "", company: "", department: "", hiringManager: "", level: "L5", location: "",
  });
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setJdText(ev.target.result);
    reader.readAsText(file);
  };

  const parseJD = () => {
    const lines = jdText.split("\n").filter(Boolean);
    const parsed = { ...form };
    const text = jdText.toLowerCase();
    // Simple heuristic extraction
    for (const line of lines) {
      const l = line.toLowerCase();
      if ((l.includes("title") || l.includes("position")) && l.includes(":")) parsed.title = line.split(":").slice(1).join(":").trim();
      if (l.includes("company") && l.includes(":")) parsed.company = line.split(":").slice(1).join(":").trim();
      if (l.includes("department") && l.includes(":")) parsed.department = line.split(":").slice(1).join(":").trim();
      if ((l.includes("hiring manager") || l.includes("reports to")) && l.includes(":")) parsed.hiringManager = line.split(":").slice(1).join(":").trim();
      if (l.includes("location") && l.includes(":")) parsed.location = line.split(":").slice(1).join(":").trim();
    }
    if (!parsed.title && lines[0]) parsed.title = lines[0].replace(/^(job\s*title|position|role)\s*[:—-]?\s*/i, "").trim();
    setForm(parsed);
    setMode("manual");
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onSubmit({ ...form, jdRawText: jdText });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white bg-opacity-10 rounded-full px-4 py-1.5 mb-4">
            <span className="text-teal-400 text-sm font-medium">Recruiter Hub</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Recruitment Command Center</h1>
          <p className="text-slate-400 text-lg">Enter role details or paste a JD to auto-generate your full hiring toolkit.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Mode toggle */}
          <div className="flex border-b">
            <button onClick={() => setMode("manual")} className={`flex-1 py-3 text-sm font-semibold transition-colors ${mode === "manual" ? "bg-white text-slate-800 border-b-2 border-teal-500" : "bg-slate-50 text-slate-500"}`}>
              Enter Details Manually
            </button>
            <button onClick={() => setMode("jd")} className={`flex-1 py-3 text-sm font-semibold transition-colors ${mode === "jd" ? "bg-white text-slate-800 border-b-2 border-teal-500" : "bg-slate-50 text-slate-500"}`}>
              Paste / Upload JD
            </button>
          </div>

          <div className="p-6">
            {mode === "jd" ? (
              <div className="space-y-4">
                <textarea value={jdText} onChange={(e) => setJdText(e.target.value)} placeholder="Paste the full job description here..." className="w-full h-48 border rounded-xl p-4 text-sm resize-none focus:ring-2 focus:ring-teal-500 focus:outline-none" />
                <div className="flex items-center gap-3">
                  <input ref={fileRef} type="file" accept=".txt,.md,.doc,.docx" onChange={handleFile} className="hidden" />
                  <button onClick={() => fileRef.current?.click()} className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                    Upload .txt File
                  </button>
                  <button onClick={parseJD} disabled={!jdText.trim()} className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-40">
                    Parse JD & Fill Form →
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Role Title *</label>
                    <input value={form.title} onChange={(e) => setForm(f => ({...f, title: e.target.value}))} placeholder="e.g. Senior Backend Engineer" className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Company *</label>
                    <input value={form.company} onChange={(e) => setForm(f => ({...f, company: e.target.value}))} placeholder="e.g. First Tech FCU" className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Department</label>
                    <input value={form.department} onChange={(e) => setForm(f => ({...f, department: e.target.value}))} placeholder="e.g. Technology" className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Hiring Manager</label>
                    <input value={form.hiringManager} onChange={(e) => setForm(f => ({...f, hiringManager: e.target.value}))} placeholder="e.g. Devendra Tiwari" className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Level</label>
                    <select value={form.level} onChange={(e) => setForm(f => ({...f, level: e.target.value}))} className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white">
                      {LEVELS.map(l => <option key={l.id} value={l.id}>{l.id} — {l.title} ({l.track})</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Location</label>
                    <input value={form.location} onChange={(e) => setForm(f => ({...f, location: e.target.value}))} placeholder="e.g. Remote / Hybrid / On-site" className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none" />
                  </div>
                </div>
                <button onClick={handleSubmit} disabled={!form.title.trim()} className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-teal-700 hover:to-emerald-700 transition-all disabled:opacity-40 shadow-lg">
                  Generate Recruiter Hub →
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">All data stays in your browser. Nothing is sent to a server.</p>
      </div>
    </div>
  );
}

// ─── DASHBOARD TAB ───
function DashboardTab({ role, candidates }) {
  const stageCounts = STAGES.map(s => ({
    ...s,
    count: candidates.filter(c => c.stage === s.label).length,
  }));
  const active = candidates.filter(c => c.status === "Active").length;
  const hired = candidates.filter(c => c.status === "Hired").length;
  const rejected = candidates.filter(c => c.status === "Rejected").length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-2xl font-bold">{role.title}</h2>
          <span className="px-3 py-1 bg-teal-500 bg-opacity-20 text-teal-300 rounded-full text-sm font-medium">{role.level}</span>
        </div>
        <p className="text-slate-400">{role.company} · {role.department} · HM: {role.hiringManager}</p>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Pipeline Snapshot</h3>
        <div className="grid grid-cols-7 gap-2">
          {stageCounts.map(s => (
            <div key={s.key} className={`rounded-xl p-3 text-center ${s.color}`}>
              <div className="text-2xl font-bold">{s.count}</div>
              <div className="text-xs font-medium mt-1 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Pipeline", value: candidates.length, accent: "text-slate-800" },
          { label: "Active", value: active, accent: "text-teal-600" },
          { label: "Hired", value: hired, accent: "text-emerald-600" },
          { label: "Rejected", value: rejected, accent: "text-red-500" },
        ].map(m => (
          <div key={m.label} className="bg-white border rounded-xl p-4 text-center">
            <div className={`text-3xl font-bold ${m.accent}`}>{m.value}</div>
            <div className="text-xs text-slate-500 mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Quick Navigation</h3>
        <div className="grid grid-cols-2 gap-2">
          {tabs.filter(t => t.id !== "dashboard").map(t => (
            <div key={t.id} className="flex items-center gap-3 bg-white rounded-lg p-3 border hover:border-teal-300 transition-colors cursor-pointer">
              <span className="text-lg">{t.icon}</span>
              <span className="text-sm font-medium text-slate-700">{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── INTAKE MEETING TAB ───
function IntakeTab({ role }) {
  const questions = generateIntakeQuestions(role);
  const [answers, setAnswers] = useState(questions.map(() => ""));

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="bg-teal-600 text-white px-5 py-3 flex items-center justify-between">
          <h3 className="font-bold">Meeting Details</h3>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3 text-sm">
          {[["Hiring Manager", role.hiringManager], ["Department", role.department], ["Date", "—"], ["Recruiter", "—"]].map(([l, v]) => (
            <div key={l} className="flex gap-2"><span className="font-semibold text-slate-600 w-32">{l}:</span><span className="text-slate-800">{v}</span></div>
          ))}
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="bg-teal-600 text-white px-5 py-3"><h3 className="font-bold">Pre-Meeting Questions</h3></div>
        <div className="divide-y">
          {questions.map((q, i) => (
            <div key={i} className="p-4 flex gap-4">
              <span className="flex-shrink-0 w-7 h-7 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
              <div className="flex-1 space-y-2">
                <p className="text-sm text-slate-800">{q}</p>
                <textarea value={answers[i]} onChange={(e) => { const a = [...answers]; a[i] = e.target.value; setAnswers(a); }} placeholder="Notes..." rows={2} className="w-full text-sm border rounded-lg p-2 resize-none focus:ring-1 focus:ring-teal-400 focus:outline-none" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="bg-teal-600 text-white px-5 py-3"><h3 className="font-bold">Meeting Agenda (30 min)</h3></div>
        {[
          { title: "Block 1: Align on Role Priorities", time: "10 min", items: ["Walk through the job spec — does it reflect what you actually need?", "Rank the must-haves: if you could only screen for 3 things, what are they?", "Define what 'great' looks like at 6 months."] },
          { title: "Block 2: Candidate Profile & Anti-Patterns", time: "10 min", items: ["Describe the ideal candidate's background.", "What's a dealbreaker you've seen in past interviews?", "What soft skills matter most?"] },
          { title: "Block 3: Process & Timeline", time: "10 min", items: ["Confirm interview panel and stage sequence.", "Set target dates: first candidates, first interviews, offer deadline.", "Agree on communication cadence.", "Identify blockers."] },
        ].map(block => (
          <div key={block.title} className="p-4 border-b last:border-b-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs font-bold">{block.time}</span>
              <h4 className="font-semibold text-sm text-slate-800">{block.title}</h4>
            </div>
            <ul className="space-y-1 ml-4">
              {block.items.map((item, j) => <li key={j} className="text-sm text-slate-600 flex gap-2"><span className="text-teal-400">•</span>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── JD TAB ───
function JDTab({ role }) {
  const jd = generateJD(role);
  const Section = ({ title, children }) => (
    <div className="bg-white border rounded-xl overflow-hidden">
      <div className="bg-slate-800 text-white px-5 py-3"><h3 className="font-bold">{title}</h3></div>
      <div className="p-5">{children}</div>
    </div>
  );

  return (
    <div className="space-y-4">
      <Section title="Role Details">
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[["Company", role.company], ["Department", role.department], ["Hiring Manager", role.hiringManager], ["Level", role.level], ["Location", role.location || "TBD"]].map(([l, v]) => (
            <div key={l} className="flex gap-2"><span className="font-semibold text-slate-500 w-32">{l}:</span><span className="text-slate-800">{v}</span></div>
          ))}
        </div>
      </Section>
      <Section title="Role Summary"><p className="text-sm text-slate-700 leading-relaxed">{jd.summary}</p></Section>
      <Section title="Key Responsibilities">
        <ul className="space-y-2">{jd.responsibilities.map((r, i) => <li key={i} className="text-sm text-slate-700 flex gap-2"><span className="text-slate-400 mt-0.5">•</span><span>{r}</span></li>)}</ul>
      </Section>
      <Section title="Must-Have Qualifications">
        <ul className="space-y-2">{jd.mustHave.map((r, i) => <li key={i} className="text-sm text-slate-700 flex gap-2"><span className="text-emerald-500 mt-0.5">✓</span><span>{r}</span></li>)}</ul>
      </Section>
      <Section title="Nice-to-Have">
        <ul className="space-y-2">{jd.niceToHave.map((r, i) => <li key={i} className="text-sm text-slate-700 flex gap-2"><span className="text-amber-400 mt-0.5">○</span><span>{r}</span></li>)}</ul>
      </Section>
    </div>
  );
}

// ─── INTERVIEW MATRIX TAB ───
function MatrixTab({ role }) {
  const matrix = generateInterviewMatrix(role);
  const comps = generateCompetencies(role);
  const levelData = LEVELS;
  const targetIdx = levelData.findIndex(l => l.id === role.level);

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="bg-purple-700 text-white px-5 py-3"><h3 className="font-bold">Interview Panel & Stages</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>{["Stage", "Interviewer", "Duration", "Competencies", "Format", "Weight"].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600 border-b">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {matrix.map((m, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-purple-700">{m.stage}</td>
                  <td className="px-4 py-3">{m.interviewer}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded text-xs font-medium">{m.duration}</span></td>
                  <td className="px-4 py-3 text-slate-600">{m.competencies}</td>
                  <td className="px-4 py-3 text-slate-600">{m.format}</td>
                  <td className="px-4 py-3 font-medium">{m.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="bg-purple-700 text-white px-5 py-3">
          <h3 className="font-bold">Competency × Level Matrix</h3>
          <p className="text-purple-200 text-xs mt-1">IC Track: L3–L6 | Management Track: L7–L9 | Hiring at {role.level}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="px-3 py-2 bg-slate-100 text-slate-600 text-left font-semibold border-b w-32">Competency</th>
                {levelData.map((l, i) => (
                  <th key={l.id} className={`px-3 py-2 text-center font-semibold border-b ${i === targetIdx ? "bg-teal-100 text-teal-800 ring-2 ring-teal-400 ring-inset" : "bg-slate-50 text-slate-600"}`}>
                    <div>{l.id}</div>
                    <div className="font-normal text-xs opacity-70">{l.title}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {comps.map((comp, ci) => (
                <tr key={ci}>
                  <td className="px-3 py-2 font-semibold text-slate-700 bg-slate-50 align-top">{comp.name}</td>
                  {levelData.map((l, li) => (
                    <td key={l.id} className={`px-3 py-2 align-top ${li === targetIdx ? "bg-teal-50 ring-2 ring-teal-400 ring-inset" : ci % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                      <span className="text-slate-600 leading-relaxed">
                        {li <= targetIdx
                          ? li === targetIdx ? comp.signal : li === targetIdx - 1 ? "Developing toward senior-level expectations. Needs some guidance and review." : "Learning fundamentals. Requires mentorship and clear direction."
                          : li <= 5 ? "Sets standards and drives practices across the team and broader org." : "Defines strategy and vision at the organizational level."
                        }
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-teal-50 px-4 py-2 text-center text-xs text-teal-700 font-medium border-t">
          ▲ {role.level} ({levelData[targetIdx]?.title}) is the target hire level. That column defines the bar for each competency.
        </div>
      </div>
    </div>
  );
}

// ─── SCORECARD TAB ───
function ScorecardTab({ role }) {
  const comps = generateCompetencies(role);
  const [scores, setScores] = useState(comps.map(() => ({ rating: 0, notes: "" })));
  const [decision, setDecision] = useState("");
  const [summary, setSummary] = useState("");

  const avg = scores.filter(s => s.rating > 0).length > 0
    ? (scores.reduce((sum, s) => sum + s.rating, 0) / scores.filter(s => s.rating > 0).length).toFixed(1)
    : "—";
  const ratingColors = { 1: "bg-red-500", 2: "bg-amber-400", 3: "bg-teal-400", 4: "bg-emerald-500" };
  const ratingLabels = { 1: "Strong No", 2: "Lean No", 3: "Lean Yes", 4: "Strong Yes" };

  return (
    <div className="space-y-5">
      <div className="bg-white border rounded-xl p-5">
        <h3 className="font-bold text-slate-800 mb-3">Interview Details</h3>
        <div className="grid grid-cols-2 gap-3">
          {["Candidate Name", "Interviewer Name", "Interview Stage", "Date"].map(f => (
            <div key={f}>
              <label className="text-xs font-semibold text-slate-500 uppercase">{f}</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-red-400 focus:outline-none" placeholder={f} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        {[1, 2, 3, 4].map(n => (
          <div key={n} className={`flex-1 rounded-lg p-3 text-center ${n <= 2 ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"} border`}>
            <div className={`inline-flex w-8 h-8 rounded-full items-center justify-center text-white font-bold text-sm ${ratingColors[n]}`}>{n}</div>
            <div className="text-xs font-semibold mt-1 text-slate-700">{ratingLabels[n]}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {comps.map((comp, i) => (
          <div key={i} className={`bg-white border rounded-xl overflow-hidden ${scores[i].rating > 0 ? "border-slate-300" : ""}`}>
            <div className="flex items-center justify-between p-4 border-b bg-slate-50">
              <div>
                <h4 className="font-bold text-sm text-slate-800">{comp.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{comp.signal}</p>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(n => (
                  <button key={n} onClick={() => { const s = [...scores]; s[i] = { ...s[i], rating: n }; setScores(s); }}
                    className={`w-9 h-9 rounded-lg font-bold text-sm transition-all ${scores[i].rating === n ? `${ratingColors[n]} text-white shadow-md scale-110` : "bg-slate-100 text-slate-400 hover:bg-slate-200"}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <textarea value={scores[i].notes} onChange={(e) => { const s = [...scores]; s[i] = { ...s[i], notes: e.target.value }; setScores(s); }}
              placeholder="Evidence and notes..." rows={2} className="w-full px-4 py-2 text-sm resize-none focus:outline-none" />
          </div>
        ))}
      </div>

      <div className="bg-white border-2 border-slate-800 rounded-xl overflow-hidden">
        <div className="bg-slate-800 text-white px-5 py-3 flex items-center justify-between">
          <h3 className="font-bold">Overall Recommendation</h3>
          <div className="text-2xl font-bold text-teal-300">{avg}</div>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">Hire Decision</label>
            <div className="flex gap-2 mt-2">
              {Object.entries(ratingLabels).map(([k, v]) => (
                <button key={k} onClick={() => setDecision(v)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${decision === v ? `${ratingColors[k]} text-white shadow-md` : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">Summary & Key Evidence</label>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} placeholder="2-3 sentences: What stood out? What gave you pause? Would you want this person on your team?" className="w-full border rounded-lg px-3 py-2 text-sm mt-1 resize-none focus:ring-1 focus:ring-slate-400 focus:outline-none" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CANDIDATE PREP TAB ───
function PrepTab({ role }) {
  const guide = generatePrepGuide(role);
  const stageColors = ["bg-teal-600", "bg-blue-600", "bg-amber-500", "bg-purple-700", "bg-emerald-600"];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold mb-1">Welcome to the Interview Process</h2>
        <p className="text-emerald-100 text-sm">at {role.company}</p>
        <p className="text-emerald-50 text-sm mt-2 leading-relaxed">We believe great interviews are a two-way street. This guide helps you show up confident, prepared, and ready to evaluate whether we're the right fit for you.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {guide.map((s, i) => (
          <div key={i} className={`${stageColors[i]} text-white rounded-xl px-4 py-2 text-center flex-shrink-0 min-w-28`}>
            <div className="text-lg font-bold">{s.num}</div>
            <div className="text-xs font-medium">{s.stage}</div>
            <div className="text-xs opacity-75">{s.duration}</div>
          </div>
        ))}
      </div>

      {guide.map((stage, si) => (
        <div key={si} className="bg-white border rounded-xl overflow-hidden">
          <div className={`${stageColors[si]} text-white px-5 py-3`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Stage {stage.num}: {stage.stage}</h3>
              <div className="flex gap-3 text-xs">
                <span className="bg-white bg-opacity-20 rounded px-2 py-0.5">{stage.duration}</span>
                <span className="bg-white bg-opacity-20 rounded px-2 py-0.5">{stage.interviewer}</span>
              </div>
            </div>
          </div>
          <div className="divide-y">
            {stage.sections.map((sec, j) => (
              <div key={j} className="p-4 flex gap-4">
                <span className="flex-shrink-0 mt-0.5 text-teal-400 font-bold">›</span>
                <div>
                  <h4 className="font-semibold text-sm text-slate-800 mb-1">{sec.label}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{sec.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="bg-slate-800 text-white px-5 py-3"><h3 className="font-bold">General Tips</h3></div>
        <div className="divide-y">
          {[
            ["Ask questions", "Interviewers reserve time and genuinely want to answer them."],
            ["Think out loud", "We care about your reasoning, not just the answer."],
            ["It's okay to say 'I don't know'", "Show how you work through uncertainty."],
            ["Be specific", "Real examples beat hypothetical answers every time."],
            ["Take your time", "A focused 60-second answer beats a rambling 3-minute one."],
          ].map(([t, d], i) => (
            <div key={i} className="p-3 flex gap-3 items-start">
              <span className="text-emerald-500 font-bold mt-0.5">✓</span>
              <div><span className="font-semibold text-sm text-slate-800">{t}</span><span className="text-sm text-slate-500"> — {d}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TRACKER TAB ───
function TrackerTab({ role, candidates, setCandidates }) {
  const [showForm, setShowForm] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ name: "", email: "", source: "", stage: "Sourced", status: "Active", dateSourced: new Date().toISOString().slice(0, 10), lastUpdated: new Date().toISOString().slice(0, 10), notes: "" });

  const addCandidate = () => {
    if (!newCandidate.name.trim()) return;
    setCandidates([...candidates, { ...newCandidate, id: Date.now() }]);
    setNewCandidate({ name: "", email: "", source: "", stage: "Sourced", status: "Active", dateSourced: new Date().toISOString().slice(0, 10), lastUpdated: new Date().toISOString().slice(0, 10), notes: "" });
    setShowForm(false);
  };

  const updateCandidate = (id, field, value) => {
    setCandidates(candidates.map(c => c.id === id ? { ...c, [field]: value, lastUpdated: new Date().toISOString().slice(0, 10) } : c));
  };

  const stageCounts = STAGES.map(s => ({ ...s, count: candidates.filter(c => c.stage === s.label).length }));
  const statusColors = { Active: "bg-teal-100 text-teal-700", "On Hold": "bg-amber-100 text-amber-700", Rejected: "bg-red-100 text-red-700", Withdrawn: "bg-slate-100 text-slate-500", Hired: "bg-emerald-100 text-emerald-700" };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-7 gap-2">
        {stageCounts.map(s => (
          <div key={s.key} className={`rounded-xl p-2.5 text-center ${s.color}`}>
            <div className="text-xl font-bold">{s.count}</div>
            <div className="text-xs font-medium leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800">{candidates.length} Candidates</h3>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors">
          + Add Candidate
        </button>
      </div>

      {showForm && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <input value={newCandidate.name} onChange={(e) => setNewCandidate(f => ({...f, name: e.target.value}))} placeholder="Full Name *" className="border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-orange-400 focus:outline-none" />
            <input value={newCandidate.email} onChange={(e) => setNewCandidate(f => ({...f, email: e.target.value}))} placeholder="Email" className="border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-orange-400 focus:outline-none" />
            <input value={newCandidate.source} onChange={(e) => setNewCandidate(f => ({...f, source: e.target.value}))} placeholder="Source (LinkedIn, Referral...)" className="border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-orange-400 focus:outline-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={addCandidate} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600">Add</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-300">Cancel</button>
          </div>
        </div>
      )}

      {candidates.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-slate-500">No candidates yet. Add your first candidate to start tracking.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>{["Name", "Source", "Stage", "Status", "Last Updated", "Notes"].map(h => <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600 border-b text-xs uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {candidates.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{c.name}</div>
                      <div className="text-xs text-slate-400">{c.email}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.source}</td>
                    <td className="px-4 py-3">
                      <select value={c.stage} onChange={(e) => updateCandidate(c.id, "stage", e.target.value)} className="text-xs border rounded-lg px-2 py-1 bg-white focus:outline-none">
                        {STAGES.map(s => <option key={s.key} value={s.label}>{s.label}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select value={c.status} onChange={(e) => updateCandidate(c.id, "status", e.target.value)} className={`text-xs font-semibold rounded-full px-3 py-1 border-0 focus:outline-none ${statusColors[c.status] || "bg-slate-100"}`}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{c.lastUpdated}</td>
                    <td className="px-4 py-3">
                      <input value={c.notes || ""} onChange={(e) => updateCandidate(c.id, "notes", e.target.value)} placeholder="Add notes..." className="w-full text-xs border-0 border-b border-transparent focus:border-slate-300 focus:outline-none py-1" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ───
export default function App() {
  const [role, setRole] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [candidates, setCandidates] = useState([]);

  if (!role) return <RoleSetupForm onSubmit={setRole} />;

  const tabContent = {
    dashboard: <DashboardTab role={role} candidates={candidates} />,
    intake: <IntakeTab role={role} />,
    jd: <JDTab role={role} />,
    matrix: <MatrixTab role={role} />,
    scorecard: <ScorecardTab role={role} />,
    prep: <PrepTab role={role} />,
    tracker: <TrackerTab role={role} candidates={candidates} setCandidates={setCandidates} />,
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top bar */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-teal-600 font-bold text-lg">◉ Recruiter Hub</span>
            <span className="text-slate-300">|</span>
            <span className="text-sm text-slate-500">{role.title} · {role.company}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => exportToExcel(role, candidates)} className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-700 transition-colors flex items-center gap-1">
              ↓ Export Excel
            </button>
            <button onClick={() => setRole(null)} className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              New Role
            </button>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b sticky top-11 z-10">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === t.id ? "border-teal-500 text-teal-700 bg-teal-50" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>
              <span className="mr-1.5">{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className={`mb-4 rounded-xl bg-gradient-to-r ${tabColors[activeTab]} p-4`}>
          <h1 className="text-white font-bold text-lg">{tabs.find(t => t.id === activeTab)?.label}</h1>
          <p className="text-white text-opacity-70 text-sm">{role.title} — {role.company}</p>
        </div>
        {tabContent[activeTab]}
      </div>
    </div>
  );
}
