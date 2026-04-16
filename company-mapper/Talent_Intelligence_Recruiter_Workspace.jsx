import { useState, useCallback, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ScatterChart, Scatter, ZAxis, CartesianGrid } from "recharts";
const _RAW=[["Marsh McLennan","Insurance Broking / Risk Advisory","insurance","insurance|broking|risk|marine|energy|cargo|hull|P&I|reinsurance|claims|underwriting|compliance|CBUAE|GCC|advisory|portfolio","uae|gcc|mena|global","l","b2b","h",65,"Direct competitors"],["Aon","Insurance Broking","insurance","insurance|broking|risk|marine|energy|reinsurance|claims|underwriting|advisory|analytics|actuarial|compliance","uae|gcc|mena|global","l","b2b","h",68,"Direct competitors"],["Willis Towers Watson","Insurance Broking","insurance","insurance|broking|risk|marine|energy|reinsurance|actuarial|advisory|compliance|human capital","uae|gcc|mena|global","l","b2b","h",72,"Direct competitors"],["Lockton","Insurance Broking","insurance","insurance|broking|risk|marine|commercial|client management|entrepreneurial","uae|mena|global","m","b2b","h",74,"Direct competitors"],["Gallagher","Insurance Broking","insurance","insurance|broking|risk|marine|commercial|client|benefits","uae|mena|global","l","b2b","h",72,"Direct competitors"],["Howden Group","Insurance Broking","insurance","insurance|broking|specialty|reinsurance|marine|energy","mena|global","m","b2b","h",70,"Direct competitors"],["ADNIC","Insurance (Composite)","insurance","insurance|underwriting|marine|motor|property|health|compliance|CBUAE|UAE|Abu Dhabi|national","uae|gcc","l","b2b","h",62,"Same problem space"],["Orient Insurance","Insurance (Composite)","insurance","insurance|underwriting|marine|commercial|motor|health|UAE|Dubai|Al Futtaim","uae|gcc","l","b2b","h",68,"Same problem space"],["Oman Insurance","Insurance (Composite)","insurance","insurance|underwriting|marine|motor|health|property|GCC|Dubai","uae|gcc","l","b2b","h",70,"Same problem space"],["Al Ain Ahlia Insurance","Insurance (Composite)","insurance","insurance|underwriting|marine|commercial|UAE|compliance","uae|gcc","m","b2b","h",74,"Same problem space"],["Daman Insurance","Insurance (Health)","insurance","insurance|health|compliance|CBUAE|UAE|Abu Dhabi|stakeholder|government","uae","l","b2b","h",58,"Adjacent sectors"],["AXA Gulf / GIG","Insurance","insurance","insurance|underwriting|commercial|health|motor|M&A|regional","uae|gcc|mena","l","b2b","h",70,"Same problem space"],["Zurich Insurance ME","Insurance (Global)","insurance","insurance|underwriting|marine|specialty|global|compliance|product design","uae|gcc|mena|global","l","b2b","h",58,"Same problem space"],["Islamic P&I Club","Marine P&I","insurance","marine|P&I|insurance|claims|liability|shipping|hull|cargo|mutual","gcc|mena","s","b2b","h",68,"Direct competitors"],["Allianz","Insurance (Global)","insurance","insurance|underwriting|commercial|marine|property|casualty|global|compliance","global|mena","l","b2b","h",55,"Same problem space"],["AIG","Insurance (Global)","insurance","insurance|underwriting|commercial|marine|specialty|liability|global","global|mena","l","b2b","h",60,"Same problem space"],["Chubb","Insurance (Global)","insurance","insurance|underwriting|commercial|specialty|marine|property|high-net-worth","global","l","b2b","h",52,"Same problem space"],["Swiss Re","Reinsurance","insurance","reinsurance|insurance|risk|analytics|actuarial|marine|property|catastrophe","global","l","b2b","h",50,"Adjacent sectors"],["Munich Re","Reinsurance","insurance","reinsurance|insurance|risk|analytics|actuarial|marine|specialty","global","l","b2b","h",48,"Adjacent sectors"],["Lloyd's Syndicates","Insurance Market","insurance","insurance|underwriting|marine|specialty|hull|cargo|liability|London","uk|global","l","b2b","h",42,"Same problem space"],["Saudi Aramco (Risk)","Energy","energy","risk|insurance|marine|cargo|liability|energy|oil|gas|captive","gcc|saudi","l","b2b","h",45,"Adjacent sectors"],["ADNOC","Energy","energy","energy|oil|gas|risk|insurance|marine|Abu Dhabi|compliance","uae|gcc","l","b2b","h",48,"Adjacent sectors"],["DP World","Ports & Logistics","logistics","ports|logistics|marine|cargo|risk|shipping|supply chain|Dubai|global","uae|global","l","b2b","m",60,"Adjacent sectors"],["Emirates Shipping / ADNOC L&S","Shipping","logistics","shipping|marine|cargo|logistics|fleet|risk|insurance","uae|gcc","m","b2b","m",58,"Adjacent sectors"],["Google","Technology","tech","software|engineering|AI|machine learning|cloud|data|product|search|ads|platform|scale|SaaS","global|us","l","b2b+b2c","l",40,"Functional talent factories"],["Microsoft","Technology","tech","software|engineering|cloud|Azure|AI|enterprise|SaaS|platform|product|data","global|us","l","b2b","l",42,"Functional talent factories"],["Amazon / AWS","Technology / Cloud","tech","cloud|AWS|engineering|infrastructure|data|AI|e-commerce|logistics|platform|scale|DevOps","global|us","l","b2b+b2c","l",50,"Functional talent factories"],["Meta","Technology","tech","software|engineering|AI|machine learning|social|ads|product|data|VR|platform","global|us","l","b2c","l",55,"Functional talent factories"],["Apple","Technology","tech","hardware|software|engineering|product|design|UX|mobile|iOS|platform","global|us","l","b2c","l",35,"Functional talent factories"],["Salesforce","Enterprise SaaS","tech","SaaS|CRM|sales|enterprise|cloud|platform|customer success|B2B|partnerships","global|us","l","b2b","l",55,"Functional talent factories"],["ServiceNow","Enterprise SaaS","tech","SaaS|enterprise|ITSM|platform|workflow|automation|cloud|B2B","global|us","l","b2b","l",50,"Same problem space"],["Stripe","FinTech","fintech","payments|fintech|engineering|API|platform|developer|compliance|financial|scale","global|us","m","b2b","m",48,"Adjacent sectors"],["Palantir","Data & Analytics","tech","data|analytics|AI|government|defense|enterprise|platform|intelligence","global|us","m","b2b","m",52,"Adjacent sectors"],["SAP","Enterprise Software","tech","ERP|enterprise|software|cloud|finance|supply chain|HR|B2B|platform","global","l","b2b","l",58,"Same problem space"],["Oracle","Enterprise Software","tech","database|cloud|ERP|enterprise|software|finance|HR|B2B","global","l","b2b","l",60,"Same problem space"],["HubSpot","SaaS / MarTech","tech","SaaS|marketing|CRM|sales|SMB|inbound|content|B2B|growth","global|us","m","b2b","l",55,"Functional talent factories"],["Datadog","DevOps / Monitoring","tech","DevOps|monitoring|cloud|infrastructure|engineering|observability|SaaS","global|us","m","b2b","l",52,"Same problem space"],["Snowflake","Data / Cloud","tech","data|cloud|data warehouse|analytics|engineering|SQL|AI|enterprise","global|us","m","b2b","l",55,"Same problem space"],["JPMorgan Chase","Banking","finance","banking|finance|investment|trading|risk|compliance|wealth|corporate|global","global|us","l","b2b+b2c","h",45,"Adjacent sectors"],["Goldman Sachs","Investment Banking","finance","banking|finance|investment|trading|risk|M&A|capital markets|advisory","global|us","l","b2b","h",42,"Adjacent sectors"],["Visa","Payments","fintech","payments|fintech|transaction|network|compliance|global|B2B|platform","global","l","b2b","h",45,"Adjacent sectors"],["PayPal","Payments / FinTech","fintech","payments|fintech|digital|consumer|e-commerce|platform|mobile","global|us","l","b2b+b2c","m",58,"Adjacent sectors"],["Revolut","FinTech / Neobank","fintech","fintech|banking|payments|mobile|crypto|trading|compliance|growth","global|uk","m","b2c","h",60,"Adjacent sectors"],["McKinsey & Company","Management Consulting","consulting","consulting|strategy|management|transformation|digital|analytics|leadership","global","l","b2b","l",55,"Functional talent factories"],["BCG","Management Consulting","consulting","consulting|strategy|management|digital|transformation|analytics","global","l","b2b","l",55,"Functional talent factories"],["Deloitte","Professional Services","consulting","consulting|audit|tax|advisory|risk|compliance|digital|technology|finance","global|uae|gcc","l","b2b","m",60,"Functional talent factories"],["PwC","Professional Services","consulting","consulting|audit|tax|advisory|risk|compliance|digital|deals|finance","global|uae|gcc","l","b2b","m",60,"Functional talent factories"],["EY","Professional Services","consulting","consulting|audit|tax|advisory|risk|compliance|digital|transformation","global|uae|gcc","l","b2b","m",58,"Functional talent factories"],["KPMG","Professional Services","consulting","consulting|audit|tax|advisory|risk|compliance|finance","global|uae|gcc","l","b2b","m",58,"Functional talent factories"],["Pfizer","Pharmaceuticals","healthcare","pharma|healthcare|clinical|regulatory|FDA|R&D|drug|biotech|compliance|science","global|us","l","b2b","h",50,"Same problem space"],["Johnson & Johnson","Healthcare / Pharma","healthcare","pharma|healthcare|medical devices|consumer health|regulatory|R&D|clinical","global|us","l","b2b+b2c","h",48,"Same problem space"],["UnitedHealth Group","Health Insurance","healthcare","health insurance|healthcare|managed care|claims|analytics|compliance|payer","us","l","b2b+b2c","h",52,"Same problem space"],["Roche","Pharmaceuticals / Diagnostics","healthcare","pharma|diagnostics|healthcare|biotech|R&D|clinical|oncology|regulatory","global","l","b2b","h",45,"Same problem space"],["Medtronic","Medical Devices","healthcare","medical devices|healthcare|engineering|regulatory|FDA|R&D|clinical|surgical","global|us","l","b2b","h",50,"Adjacent sectors"],["Nike","Consumer / Sportswear","consumer","consumer|retail|brand|marketing|e-commerce|DTC|supply chain|design","global|us","l","b2c","l",48,"Functional talent factories"],["Procter & Gamble","Consumer Goods (FMCG)","consumer","FMCG|consumer|brand|marketing|supply chain|retail|CPG|innovation","global","l","b2c","l",50,"Functional talent factories"],["Unilever","Consumer Goods (FMCG)","consumer","FMCG|consumer|brand|marketing|supply chain|sustainability|CPG|retail","global","l","b2c","l",52,"Functional talent factories"],["Etisalat (e&)","Telecom","telecom","telecom|digital|network|5G|cloud|enterprise|UAE|consumer|B2B|platform","uae|gcc|mena","l","b2b+b2c","h",55,"Adjacent sectors"],["du (EITC)","Telecom","telecom","telecom|digital|network|UAE|consumer|enterprise|cloud","uae","l","b2b+b2c","h",58,"Adjacent sectors"],["STC","Telecom","telecom","telecom|digital|5G|Saudi|enterprise|cloud|platform","gcc|saudi","l","b2b+b2c","h",52,"Adjacent sectors"],["Emaar Properties","Real Estate","realestate","real estate|property|development|construction|UAE|Dubai|luxury|hospitality","uae|gcc","l","b2c","m",55,"Adjacent sectors"],["Aldar Properties","Real Estate","realestate","real estate|property|development|Abu Dhabi|UAE|investment|retail","uae","l","b2b+b2c","m",58,"Adjacent sectors"],["CrowdStrike","Cybersecurity","cyber","cybersecurity|security|endpoint|cloud|threat|detection|AI|SaaS|enterprise","global|us","m","b2b","m",52,"Same problem space"],["Palo Alto Networks","Cybersecurity","cyber","cybersecurity|security|network|firewall|cloud|SASE|enterprise|platform","global|us","l","b2b","m",50,"Same problem space"],["Fortinet","Cybersecurity","cyber","cybersecurity|security|network|firewall|SD-WAN|enterprise|OT","global","l","b2b","m",55,"Same problem space"],["OpenAI","AI","ai","AI|machine learning|LLM|NLP|deep learning|research|GPT|platform|API","us|global","m","b2b+b2c","l",40,"Direct competitors"],["Anthropic","AI Safety","ai","AI|machine learning|safety|LLM|research|alignment|Claude|platform","us|global","m","b2b","l",38,"Direct competitors"],["Databricks","Data / AI Platform","ai","data|AI|machine learning|analytics|lakehouse|Spark|platform|enterprise|engineering","global|us","m","b2b","l",48,"Same problem space"],["Maersk","Shipping & Logistics","logistics","shipping|logistics|marine|container|supply chain|freight|global|trade","global","l","b2b","m",55,"Adjacent sectors"],["DHL","Logistics","logistics","logistics|supply chain|freight|e-commerce|express|warehousing|global","global","l","b2b","l",58,"Adjacent sectors"],["Flexport","Freight / Logistics Tech","logistics","logistics|freight|supply chain|technology|trade|customs|platform","global|us","m","b2b","m",62,"Adjacent sectors"],["Mubadala","Sovereign Wealth","government","investment|sovereign wealth|Abu Dhabi|UAE|portfolio|finance|strategy|energy|technology","uae","l","b2b","m",40,"Adjacent sectors"],["ADQ","Sovereign Wealth","government","investment|sovereign wealth|Abu Dhabi|UAE|portfolio|strategy|food|energy|utilities","uae","l","b2b","m",42,"Adjacent sectors"]];
const COMPANY_DB=_RAW.map(r=>({name:r[0],industry:r[1],sector:r[2],keywords:r[3].split('|'),region:r[4].split('|'),scale:r[5]==='l'?'large':r[5]==='m'?'mid':'small',salesMotion:r[6],regulatory:r[7]==='h'?'high':r[7]==='m'?'medium':'low',basePoach:r[8],pools:[r[9]]}));
function extractKeywords(text) {
  const lower = text.toLowerCase();
  const words = lower.replace(/[^a-z0-9\s\-\/&+]/g, " ").split(/\s+/).filter(w => w.length > 2);
  return { words: [...new Set(words)], raw: lower };
}
function detectTitle(text) {
  const patterns = [/job\s*title[:\s]*([^\n|]+)/i, /position[:\s]*([^\n|]+)/i, /role[:\s]*([^\n|]+)/i];
  for (const p of patterns) { const m = text.match(p); if (m) return m[1].trim(); }
  const lines = text.split("\n").filter(l => l.trim().length > 3);
  for (const l of lines.slice(0, 10)) {
    if (/manager|director|head|lead|senior|chief|vp|analyst|engineer|architect|designer|specialist|coordinator|consultant|officer/i.test(l) && l.trim().length < 80) return l.trim();
  }
  return "Untitled Role";
}
function detectSeniority(text) {
  const l = text.toLowerCase();
  if (/\b(c-suite|ceo|cfo|cto|coo|cmo|chief)\b/.test(l)) return "Executive";
  if (/\b(vp|vice president|svp|evp)\b/.test(l)) return "VP / Executive";
  if (/\b(director|head of|general manager)\b/.test(l)) return "Director / Head";
  if (/\b(senior manager|sr\. manager)\b/.test(l)) return "Senior Manager";
  if (/\bmanager\b/.test(l)) return "Manager";
  if (/\b(senior|sr\.|lead|principal|staff)\b/.test(l)) return "Senior IC / Lead";
  if (/\b(junior|associate|entry|graduate|intern)\b/.test(l)) return "Junior / Entry";
  return "Mid-level";
}
function detectLocation(text) {
  const l = text.toLowerCase();
  const regionMap = {
    "abu dhabi":"uae",dubai:"uae",uae:"uae","united arab emirates":"uae",
    riyadh:"saudi",jeddah:"saudi","saudi arabia":"saudi",saudi:"saudi",
    qatar:"gcc",doha:"gcc",bahrain:"gcc",kuwait:"gcc",oman:"gcc",muscat:"gcc",
    london:"uk","united kingdom":"uk",
    "new york":"us","san francisco":"us","silicon valley":"us",california:"us",texas:"us",chicago:"us",
    singapore:"apac","hong kong":"apac",tokyo:"apac",sydney:"apac",india:"apac",mumbai:"apac",bangalore:"apac",
    remote:"global",global:"global",worldwide:"global",
  };
  const locations = [], detected = [];
  for (const [loc, reg] of Object.entries(regionMap)) { if (l.includes(loc)) { locations.push(loc); detected.push(reg); } }
  if (/\bgcc\b/.test(l)) detected.push("gcc");
  if (/\bmena\b/.test(l)) detected.push("mena");
  return { locations, regions: [...new Set(detected.length ? detected : ["global"])] };
}
function detectDomainTier(text) {
  const l = text.toLowerCase();
  const mandatory = ["regulatory compliance","licensed","certification required","board certified","bar admission","medical license","cpa","cfa required","marine insurance","actuarial","clinical","pharmaceutical","legal counsel","regulatory affairs","safety critical"];
  const preferred = ["industry experience preferred","domain knowledge preferred","familiarity with.*industry","experience in.*sector"];
  let mCount = 0, pCount = 0;
  mandatory.forEach(s => { if (l.includes(s)) mCount++; });
  preferred.forEach(s => { if (new RegExp(s).test(l)) pCount++; });
  if (mCount >= 2 || /\b(must have|required).*\b(certification|license|specialization|domain)\b/.test(l)) return "Domain-Mandatory";
  if (mCount >= 1 || pCount >= 2) return "Domain-Preferred";
  return "Domain-Agnostic";
}
function detectExperience(text) {
  const m = text.match(/(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/i);
  return m ? parseInt(m[1]) : null;
}
function inferSector(text) {
  const l = text.toLowerCase();
  const sectorKeywords = {
    insurance:["insurance","underwriting","broking","claims","actuarial","reinsurance","premium","policyholder","marine insurance","P&I","hull","cargo"],
    tech:["software","engineering","code","API","SaaS","cloud","platform","frontend","backend","fullstack","DevOps","microservices","kubernetes","react","python","java","typescript"],
    fintech:["payments","fintech","banking","trading","blockchain","crypto","lending","neobank","transaction"],
    finance:["investment","banking","wealth management","asset management","portfolio management","M&A","capital markets","private equity","hedge fund"],
    healthcare:["healthcare","pharma","clinical","FDA","medical","patient","hospital","biotech","drug","therapeutic","diagnosis"],
    consulting:["consulting","advisory","strategy","transformation","client engagement","practice","thought leadership"],
    energy:["energy","oil","gas","renewable","solar","wind","upstream","downstream","drilling","refinery"],
    logistics:["logistics","supply chain","freight","shipping","warehouse","distribution","fleet","transportation"],
    cyber:["cybersecurity","security","threat","vulnerability","penetration","SOC","SIEM","incident response"],
    ai:["artificial intelligence","machine learning","deep learning","NLP","LLM","neural network","computer vision"],
    consumer:["consumer","retail","e-commerce","DTC","brand","marketing","CPG","FMCG"],
    telecom:["telecom","5G","network","mobile","broadband"],
    realestate:["real estate","property","construction","development","REIT"],
  };
  const scores = {};
  for (const [sector, kws] of Object.entries(sectorKeywords)) {
    scores[sector] = 0;
    kws.forEach(kw => { const re = new RegExp("\\b" + kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "gi"); const m = l.match(re); if (m) scores[sector] += m.length; });
  }
  return Object.entries(scores).sort((a, b) => b[1] - a[1]).filter(e => e[1] > 0).map(e => ({ sector: e[0], score: e[1] }));
}
function scoreCompany(company, jdAnalysis) {
  const { kw, loc, sectors, domainTier } = jdAnalysis;
  let matchScore = 0;
  const reasons = [];
  // Keyword overlap (0-40)
  let kwHits = 0;
  company.keywords.forEach(ck => { if (kw.raw.includes(ck.toLowerCase())) kwHits++; });
  matchScore += Math.min(40, Math.round((kwHits / Math.max(company.keywords.length, 1)) * 55));
  if (kwHits > 4) reasons.push("Strong keyword alignment with JD requirements");
  // Sector match (0-25)
  const topSectors = sectors.slice(0, 3).map(s => s.sector);
  if (topSectors.includes(company.sector)) {
    const idx = topSectors.indexOf(company.sector);
    matchScore += [25, 18, 12][idx];
    reasons.push(idx === 0 ? "Direct industry match" : "Adjacent industry with transferable skills");
  } else if (domainTier === "Domain-Agnostic") matchScore += 8;
  // Region (0-15)
  const regionOverlap = company.region.some(r => loc.regions.includes(r) || r === "global");
  matchScore += regionOverlap ? 15 : 3;
  if (regionOverlap && company.region.some(r => loc.regions.includes(r) && r !== "global")) reasons.push("Same geographic market");
  if (!regionOverlap) reasons.push("Different geography \u2014 relocation required");
  // Regulatory (0-10)
  const jdReg = /\b(compliance|regulatory|regulated|license|audit|CBUAE|FDA|SEC|FCA|FINRA|HIPAA)\b/i.test(kw.raw);
  if (jdReg && company.regulatory === "high") matchScore += 10;
  else if (jdReg && company.regulatory === "medium") matchScore += 5;
  else if (!jdReg) matchScore += 5;
  // Sales motion (0-10)
  const jdB2B = /\b(b2b|enterprise|commercial|partner|client|account management)\b/i.test(kw.raw);
  const jdB2C = /\b(b2c|consumer|retail|user|subscriber)\b/i.test(kw.raw);
  if ((jdB2B && company.salesMotion.includes("b2b")) || (jdB2C && company.salesMotion.includes("b2c"))) matchScore += 10;
  else matchScore += 4;
  // Domain tier penalty
  if (domainTier === "Domain-Mandatory" && !topSectors.includes(company.sector)) {
    matchScore = Math.round(matchScore * 0.6);
    reasons.push("Domain-mandatory role \u2014 significant ramp risk from outside industry");
  } else if (domainTier === "Domain-Preferred" && !topSectors.includes(company.sector)) {
    matchScore = Math.round(matchScore * 0.8);
  }
  let poach = Math.max(25, Math.min(85, company.basePoach + (company.scale === "large" ? -3 : company.scale === "small" ? 5 : 0) + Math.floor(Math.random() * 8 - 4)));
  let confidence = "Medium";
  if (kwHits >= 5 && topSectors.includes(company.sector) && regionOverlap) confidence = "High";
  else if (kwHits < 3 && !topSectors.includes(company.sector)) confidence = "Low";
  let tag = "Conditional fit";
  if (topSectors.includes(company.sector) && kwHits >= 4) tag = "Strong fit";
  else if (kwHits >= 3 || topSectors.slice(0, 2).includes(company.sector)) tag = "Transferable fit";
  const why = (reasons.length ? reasons.slice(0, 3).join(". ") : "Potential source for transferable functional talent") + ".";
  let risk = "May require significant ramp time to understand the hiring company\u2019s specific domain and operating context.";
  if (!regionOverlap) risk = "Different geography \u2014 relocation or remote arrangement required. Cultural and regulatory adjustment needed.";
  else if (domainTier === "Domain-Mandatory" && !topSectors.includes(company.sector)) risk = "Lacks direct domain expertise required for this role. Only viable for exceptional individual talent.";
  else if (tag === "Strong fit") risk = "Strong retention factors (brand, compensation) may reduce candidate openness.";
  let poachSignals = "Standard market dynamics; competitive pitch needed.";
  if (poach >= 70) poachSignals = "Likely talent openness due to career growth limitations, compensation gaps, or organizational changes.";
  else if (poach >= 55) poachSignals = "Moderate openness; identify individuals at career inflection points.";
  else poachSignals = "Strong retention; target only pre-identified individuals with specific motivations.";
  return { company: company.name, industry: company.industry, tag, match: Math.min(97, Math.max(30, matchScore)), poach, confidence, pool: company.pools[0] || "Adjacent sectors", why, risk, poachSignals, priority: "low", sector: company.sector };
}
function analyzeJD(text) {
  const kw = extractKeywords(text);
  const title = detectTitle(text);
  const seniority = detectSeniority(text);
  const loc = detectLocation(text);
  const domainTier = detectDomainTier(text);
  const expYears = detectExperience(text);
  const sectors = inferSector(text);
  if (!sectors.length) sectors.push({ sector: "general", score: 1 });
  const jdAnalysis = { kw, loc, sectors, domainTier, expYears };
  let scored = COMPANY_DB.map(c => scoreCompany(c, jdAnalysis));
  scored.sort((a, b) => b.match - a.match);
  scored = scored.slice(0, 20).map((c, i) => ({ ...c, rank: i + 1, priority: i < 7 ? "must" : i < 14 ? "nice" : "low" }));
  const roleDims = [
    { label: "Title & Function", value: title },
    { label: "Seniority", value: seniority },
    { label: "Domain Tier", value: domainTier },
    { label: "Experience Required", value: expYears ? `${expYears}+ years` : "Not specified" },
    { label: "Location", value: loc.locations.length ? loc.locations.map(l => l.charAt(0).toUpperCase() + l.slice(1)).join(", ") : "Not specified" },
    { label: "Primary Sector", value: sectors[0]?.sector?.charAt(0).toUpperCase() + sectors[0]?.sector?.slice(1) },
    { label: "Adjacent Sectors", value: sectors.slice(1, 4).map(s => s.sector.charAt(0).toUpperCase() + s.sector.slice(1)).join(", ") || "None detected" },
  ];
  const hiringCtx = [
    { label: "Primary Industry", value: sectors[0]?.sector?.charAt(0).toUpperCase() + sectors[0]?.sector?.slice(1) },
    { label: "Geography", value: loc.regions.map(r => r.toUpperCase()).join(", ") },
    { label: "Regulatory Intensity", value: /\b(compliance|regulatory|regulated|license|audit)\b/i.test(text) ? "High" : "Standard" },
    { label: "Sales Motion", value: /\b(b2b|enterprise|commercial|partner|account)\b/i.test(text.toLowerCase()) ? "B2B / Enterprise" : /\b(b2c|consumer|retail)\b/i.test(text.toLowerCase()) ? "B2C / Consumer" : "Mixed / Unspecified" },
  ];
  return { title, seniority, domainTier, expYears, sectors, loc, roleDims, hiringCtx, companies: scored };
}
const tagColors = { "Strong fit": "#059669", "Transferable fit": "#d97706", "Conditional fit": "#dc2626" };
const confColors = { High: "#059669", Medium: "#d97706", Low: "#dc2626" };
const poolColors = { "Direct competitors": "#3b82f6", "Same problem space": "#8b5cf6", "Functional talent factories": "#ec4899", "Adjacent sectors": "#f59e0b" };
const priorityLabels = { must: "Must-Target", nice: "Nice-to-Target", low: "Low Priority" };
const priorityColors = { must: "#059669", nice: "#3b82f6", low: "#9ca3af" };
function Badge({ text, color }) {
  return <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: color + "18", color, border: `1px solid ${color}40`, whiteSpace: "nowrap" }}>{text}</span>;
}
function ScoreBar({ value, max = 100, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, height: 7, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${(value / max) * 100}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.6s ease" }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 26 }}>{value}</span>
    </div>
  );
}
function NavTabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: "flex", gap: 2, borderBottom: "2px solid #e5e7eb", marginBottom: 24, overflowX: "auto" }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{ padding: "10px 18px", fontSize: 13, fontWeight: active === t.id ? 700 : 500, color: active === t.id ? "#1e40af" : "#6b7280", background: active === t.id ? "#eff6ff" : "transparent", border: "none", borderBottom: active === t.id ? "2px solid #1e40af" : "2px solid transparent", cursor: "pointer", borderRadius: "8px 8px 0 0", transition: "all 0.2s", whiteSpace: "nowrap" }}>{t.icon} {t.label}</button>
      ))}
    </div>
  );
}
function Card({ children, style = {} }) {
  return <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24, marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", ...style }}>{children}</div>;
}
function SectionTitle({ children }) {
  return <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e3a5f", marginBottom: 14, marginTop: 0 }}>{children}</h2>;
}
function UploadScreen({ onAnalyze }) {
  const [jdText, setJdText] = useState("");
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);
  const processFile = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setJdText(e.target.result);
    reader.readAsText(file);
  }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  }, [processFile]);
  const handleSubmit = () => {
    if (!jdText.trim()) return;
    setLoading(true);
    setTimeout(() => { onAnalyze(analyzeJD(jdText), jdText); setLoading(false); }, 1200);
  };
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color: "#93c5fd", textTransform: "uppercase", marginBottom: 12 }}>Talent Intelligence Engine</div>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: "#fff", margin: "0 0 12px", lineHeight: 1.2 }}>Target Company Mapper</h1>
        <p style={{ fontSize: 16, color: "#94a3b8", maxWidth: 540, margin: "0 auto", lineHeight: 1.6 }}>Upload or paste any job description to instantly generate a recruiter-ready target company map with match scores, poachability signals, and strategic sourcing recommendations.</p>
      </div>
      <div style={{ width: "100%", maxWidth: 700 }}>
        <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop} onClick={() => fileRef.current?.click()}
          style={{ border: `2px dashed ${dragging ? "#60a5fa" : "#475569"}`, borderRadius: 16, padding: "36px 24px", textAlign: "center", cursor: "pointer", background: dragging ? "rgba(96,165,250,0.08)" : "rgba(255,255,255,0.03)", transition: "all 0.3s", marginBottom: 16 }}>
          <input ref={fileRef} type="file" accept=".txt,.csv,.md,.text" style={{ display: "none" }} onChange={e => processFile(e.target.files[0])} />
          <div style={{ fontSize: 40, marginBottom: 8 }}>📄</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>Drop a text file here or click to browse</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Supports .txt, .md, .csv — or paste below</div>
        </div>
        <textarea value={jdText} onChange={e => setJdText(e.target.value)} placeholder="Or paste the full job description text here..."
          style={{ width: "100%", minHeight: 220, padding: 20, borderRadius: 12, border: "1px solid #334155", background: "rgba(255,255,255,0.06)", color: "#e2e8f0", fontSize: 14, lineHeight: 1.7, resize: "vertical", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
        <button onClick={handleSubmit} disabled={!jdText.trim() || loading}
          style={{ width: "100%", padding: "16px 32px", marginTop: 16, borderRadius: 12, border: "none", background: jdText.trim() ? "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" : "#334155", color: "#fff", fontSize: 16, fontWeight: 700, cursor: jdText.trim() ? "pointer" : "not-allowed", transition: "all 0.3s", opacity: loading ? 0.7 : 1 }}>
          {loading ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}><span style={{ display: "inline-block", width: 18, height: 18, border: "2px solid #fff4", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />Analyzing JD & Mapping Companies...</span> : "Analyze Job Description"}
        </button>
        {jdText.trim() && <div style={{ textAlign: "center", marginTop: 12, fontSize: 13, color: "#64748b" }}>{jdText.split(/\s+/).length} words detected</div>}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
function Dashboard({ analysis, onReset }) {
  const { title, seniority, domainTier, companies, roleDims, hiringCtx, sectors } = analysis;
  const [tab, setTab] = useState("overview");
  const [sel, setSel] = useState(null);
  const [filterTag, setFilterTag] = useState("all");
  const [filterPool, setFilterPool] = useState("all");
  const [sortBy, setSortBy] = useState("rank");
  const tabList = [
    { id: "overview", label: "Overview", icon: "📋" },
    { id: "companies", label: "Target Companies", icon: "🏢" },
    { id: "analytics", label: "Analytics", icon: "📊" },
    { id: "brief", label: "Recruiter Brief", icon: "🎯" },
  ];
  const filtered = companies.filter(c => (filterTag === "all" || c.tag === filterTag) && (filterPool === "all" || c.pool === filterPool))
    .sort((a, b) => sortBy === "match" ? b.match - a.match : sortBy === "poach" ? b.poach - a.poach : a.rank - b.rank);
  const uniquePools = [...new Set(companies.map(c => c.pool))];
  const uniqueTags = [...new Set(companies.map(c => c.tag))];
  const avgMatch = Math.round(companies.reduce((s, c) => s + c.match, 0) / companies.length);
  const avgPoach = Math.round(companies.reduce((s, c) => s + c.poach, 0) / companies.length);
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)", color: "#fff", padding: "24px 40px 20px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, opacity: 0.7, marginBottom: 6 }}>Talent Intelligence Report</div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px" }}>{title}</h1>
            <div style={{ display: "flex", gap: 16, fontSize: 13, opacity: 0.85, flexWrap: "wrap" }}>
              <span>{seniority}</span><span>Domain: <strong>{domainTier}</strong></span><span>{companies.length} Target Companies</span><span>{sectors[0]?.sector?.charAt(0).toUpperCase() + sectors[0]?.sector?.slice(1)}</span>
            </div>
          </div>
          <button onClick={onReset} style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>📄 New JD</button>
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 40px 0" }}>
        <NavTabs tabs={tabList} active={tab} onChange={setTab} />
      </div>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px 40px" }}>
        {/* OVERVIEW */}
        {tab === "overview" && (<>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
            {[{ label: "Avg Match", value: avgMatch, color: "#2563eb", suffix: "/100" },{ label: "Avg Poachability", value: avgPoach, color: "#059669", suffix: "/100" },{ label: "High Confidence", value: companies.filter(c => c.confidence === "High").length, color: "#7c3aed", suffix: ` of ${companies.length}` },{ label: "Must-Target", value: companies.filter(c => c.priority === "must").length, color: "#dc2626", suffix: " companies" }].map((k, i) => (
              <Card key={i} style={{ textAlign: "center", padding: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.8 }}>{k.label}</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: k.color, margin: "2px 0" }}>{k.value}</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>{k.suffix}</div>
              </Card>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <Card>
              <SectionTitle>Role Interpretation</SectionTitle>
              {roleDims.map((d, i) => (<div key={i} style={{ marginBottom: 10 }}><div style={{ fontSize: 10, fontWeight: 700, color: "#1e40af", textTransform: "uppercase", letterSpacing: 0.5 }}>{d.label}</div><div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{d.value}</div></div>))}
            </Card>
            <Card>
              <SectionTitle>Hiring Context</SectionTitle>
              {hiringCtx.map((d, i) => (<div key={i} style={{ marginBottom: 12 }}><div style={{ fontSize: 10, fontWeight: 700, color: "#1e40af", textTransform: "uppercase", letterSpacing: 0.5 }}>{d.label}</div><div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>{d.value}</div></div>))}
              <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: domainTier === "Domain-Mandatory" ? "#fef2f2" : domainTier === "Domain-Preferred" ? "#fffbeb" : "#f0fdf4", border: `1px solid ${domainTier === "Domain-Mandatory" ? "#fecaca" : domainTier === "Domain-Preferred" ? "#fde68a" : "#bbf7d0"}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: domainTier === "Domain-Mandatory" ? "#dc2626" : domainTier === "Domain-Preferred" ? "#d97706" : "#059669", marginBottom: 4 }}>{domainTier.toUpperCase()}</div>
                <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>
                  {domainTier === "Domain-Mandatory" ? "Industry experience is a hard gate. Candidates from outside face high ramp risk." : domainTier === "Domain-Preferred" ? "Industry experience accelerates ramp but adjacent talent can succeed." : "Problem set matters more than industry. Broaden search freely."}
                </div>
              </div>
            </Card>
          </div>
          <Card>
            <SectionTitle>Top 5 Hunting Grounds</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
              {companies.slice(0, 5).map(c => (
                <div key={c.rank} style={{ padding: 14, borderRadius: 10, background: "linear-gradient(135deg, #eff6ff, #f5f3ff)", border: "1px solid #ddd6fe", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#2563eb" }}>#{c.rank}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1f2937", margin: "4px 0" }}>{c.company}</div>
                  <Badge text={c.tag} color={tagColors[c.tag]} />
                  <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>Match: {c.match} | Poach: {c.poach}</div>
                </div>
              ))}
            </div>
          </Card>
        </>)}
        {/* COMPANIES */}
        {tab === "companies" && (<>
          <Card style={{ padding: 14, marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>Filters:</span>
              <select value={filterTag} onChange={e => setFilterTag(e.target.value)} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 12 }}>
                <option value="all">All Fit Tags</option>{uniqueTags.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={filterPool} onChange={e => setFilterPool(e.target.value)} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 12 }}>
                <option value="all">All Pools</option>{uniquePools.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: "5px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 12 }}>
                <option value="rank">Sort: Rank</option><option value="match">Sort: Match</option><option value="poach">Sort: Poachability</option>
              </select>
              <span style={{ marginLeft: "auto", fontSize: 12, color: "#6b7280" }}>{filtered.length} / {companies.length}</span>
            </div>
          </Card>
          {filtered.map(c => (
            <Card key={c.rank} style={{ cursor: "pointer", border: sel === c.rank ? "2px solid #2563eb" : "1px solid #e5e7eb", padding: 18, transition: "all 0.2s" }}>
              <div onClick={() => setSel(sel === c.rank ? null : c.rank)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#2563eb" }}>#{c.rank}</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#1f2937" }}>{c.company}</span>
                      <Badge text={c.tag} color={tagColors[c.tag]} />
                      <Badge text={c.confidence} color={confColors[c.confidence]} />
                      <Badge text={c.pool} color={poolColors[c.pool] || "#6b7280"} />
                      <Badge text={priorityLabels[c.priority]} color={priorityColors[c.priority]} />
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{c.industry}</div>
                  </div>
                  <div style={{ display: "flex", gap: 16, minWidth: 240 }}>
                    <div style={{ width: 110 }}><div style={{ fontSize: 10, fontWeight: 600, color: "#6b7280", marginBottom: 3 }}>Match</div><ScoreBar value={c.match} color="#2563eb" /></div>
                    <div style={{ width: 110 }}><div style={{ fontSize: 10, fontWeight: 600, color: "#6b7280", marginBottom: 3 }}>Poachability</div><ScoreBar value={c.poach} color="#059669" /></div>
                  </div>
                </div>
              </div>
              {sel === c.rank && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #e5e7eb", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                  <div><div style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", marginBottom: 3 }}>WHY SOURCE HERE</div><div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}>{c.why}</div></div>
                  <div><div style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", marginBottom: 3 }}>KEY RISK / GAP</div><div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}>{c.risk}</div></div>
                  <div><div style={{ fontSize: 11, fontWeight: 700, color: "#059669", marginBottom: 3 }}>POACHABILITY SIGNALS</div><div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}>{c.poachSignals}</div></div>
                </div>
              )}
            </Card>
          ))}
        </>)}
        {/* ANALYTICS */}
        {tab === "analytics" && (<>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <Card>
              <SectionTitle>Match Score Distribution</SectionTitle>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={companies.map(c => ({ name: c.company.split("(")[0].split("/")[0].trim().slice(0, 16), match: c.match, tag: c.tag }))} margin={{ bottom: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis dataKey="name" angle={-45} textAnchor="end" fontSize={10} interval={0} /><YAxis domain={[0, 100]} fontSize={10} />
                  <Tooltip formatter={v => [v, "Match"]} />
                  <Bar dataKey="match" radius={[3, 3, 0, 0]}>{companies.map((c, i) => <Cell key={i} fill={tagColors[c.tag]} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <SectionTitle>Match vs. Poachability</SectionTitle>
              <ResponsiveContainer width="100%" height={320}>
                <ScatterChart margin={{ bottom: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="match" name="Match" fontSize={10} label={{ value: "Match Score", position: "bottom", fontSize: 11 }} />
                  <YAxis dataKey="poach" name="Poach" fontSize={10} label={{ value: "Poachability", angle: -90, position: "insideLeft", fontSize: 11 }} />
                  <ZAxis dataKey="z" range={[60, 250]} />
                  <Tooltip content={({ payload }) => { if (!payload?.length) return null; const d = payload[0].payload; return (<div style={{ background: "#fff", padding: 8, border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 11 }}><div style={{ fontWeight: 700 }}>{d.name}</div><div>Match: {d.match} | Poach: {d.poach}</div></div>); }} />
                  <Scatter data={companies.map(c => ({ name: c.company, match: c.match, poach: c.poach, z: c.confidence === "High" ? 300 : 180, tag: c.tag }))}>{companies.map((c, i) => <Cell key={i} fill={tagColors[c.tag]} fillOpacity={0.8} />)}</Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </Card>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Card>
              <SectionTitle>Poachability Ranking</SectionTitle>
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={[...companies].sort((a, b) => b.poach - a.poach).map(c => ({ name: c.company.split("(")[0].split("/")[0].trim().slice(0, 16), poach: c.poach, pool: c.pool }))} layout="vertical" margin={{ left: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /><XAxis type="number" domain={[0, 100]} fontSize={10} /><YAxis dataKey="name" type="category" fontSize={10} width={95} />
                  <Tooltip formatter={v => [v, "Poachability"]} />
                  <Bar dataKey="poach" radius={[0, 3, 3, 0]}>{[...companies].sort((a, b) => b.poach - a.poach).map((c, i) => <Cell key={i} fill={poolColors[c.pool] || "#6b7280"} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <SectionTitle>Breakdown</SectionTitle>
              {[{ title: "By Fit Tag", data: uniqueTags.map(t => ({ label: t, count: companies.filter(c => c.tag === t).length, color: tagColors[t] })) },
                { title: "By Pool", data: uniquePools.map(p => ({ label: p, count: companies.filter(c => c.pool === p).length, color: poolColors[p] || "#6b7280" })) },
                { title: "By Priority", data: Object.keys(priorityLabels).map(p => ({ label: priorityLabels[p], count: companies.filter(c => c.priority === p).length, color: priorityColors[p] })) }
              ].map((section, si) => (
                <div key={si} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1f2937", marginBottom: 8 }}>{section.title}</div>
                  {section.data.map((d, i) => { const pct = Math.round((d.count / companies.length) * 100); return (
                    <div key={i} style={{ marginBottom: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}><span style={{ color: d.color }}>{d.label}</span><span style={{ fontWeight: 700 }}>{d.count} ({pct}%)</span></div>
                      <div style={{ height: 5, background: "#e5e7eb", borderRadius: 3, overflow: "hidden" }}><div style={{ width: `${pct}%`, height: "100%", background: d.color, borderRadius: 3 }} /></div>
                    </div>
                  ); })}
                </div>
              ))}
            </Card>
          </div>
        </>)}
        {/* BRIEF */}
        {tab === "brief" && (<>
          <Card>
            <SectionTitle>Ideal Source Company Profile</SectionTitle>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "#374151", margin: 0 }}>
              Prioritize companies in the <strong>{sectors[0]?.sector}</strong> sector with professionals performing analogous work at similar seniority.
              {domainTier === "Domain-Mandatory" && " Given the domain-mandatory classification, focus narrowly on companies with direct industry overlap. Adjacent-sector candidates carry significant ramp risk."}
              {domainTier === "Domain-Preferred" && " Industry experience is preferred but strong functional talent from adjacent sectors can succeed with onboarding."}
              {domainTier === "Domain-Agnostic" && " The underlying problem set matters more than industry. Expand search broadly across companies with analogous scale and complexity."}
            </p>
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <Card style={{ borderLeft: "4px solid #059669" }}>
              <SectionTitle>Must-Target ({companies.filter(c => c.priority === "must").length})</SectionTitle>
              {companies.filter(c => c.priority === "must").map(c => (
                <div key={c.rank} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <span style={{ fontWeight: 800, color: "#2563eb", fontSize: 13, minWidth: 22 }}>#{c.rank}</span>
                  <span style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>{c.company}</span>
                  <Badge text={`${c.match}`} color="#2563eb" /><Badge text={c.tag} color={tagColors[c.tag]} />
                </div>
              ))}
            </Card>
            <Card style={{ borderLeft: "4px solid #3b82f6" }}>
              <SectionTitle>Nice-to-Target ({companies.filter(c => c.priority === "nice").length})</SectionTitle>
              {companies.filter(c => c.priority === "nice").map(c => (
                <div key={c.rank} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <span style={{ fontWeight: 800, color: "#6b7280", fontSize: 13, minWidth: 22 }}>#{c.rank}</span>
                  <span style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>{c.company}</span>
                  <Badge text={`${c.match}`} color="#6b7280" /><Badge text={c.tag} color={tagColors[c.tag]} />
                </div>
              ))}
            </Card>
          </div>
          {companies.filter(c => c.priority === "low").length > 0 && (
            <Card style={{ borderLeft: "4px solid #9ca3af" }}>
              <SectionTitle>Low Priority / Stretch ({companies.filter(c => c.priority === "low").length})</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {companies.filter(c => c.priority === "low").map(c => (
                  <div key={c.rank} style={{ padding: 10, background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{c.company}</div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>{c.industry}</div>
                    <div style={{ marginTop: 4 }}><Badge text={c.tag} color={tagColors[c.tag]} /></div>
                  </div>
                ))}
              </div>
            </Card>
          )}
          <Card style={{ borderLeft: "4px solid #7c3aed" }}>
            <SectionTitle>Cross-Industry View</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#059669", marginBottom: 8 }}>Sectors Represented</div>
                {[...new Set(companies.map(c => c.sector))].map(s => {
                  const cs = companies.filter(c => c.sector === s);
                  return (<div key={s} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #f3f4f6", fontSize: 13 }}><span style={{ fontWeight: 600 }}>{s.charAt(0).toUpperCase() + s.slice(1)}</span><span style={{ color: "#6b7280" }}>{cs.length} cos, avg match {Math.round(cs.reduce((a, c) => a + c.match, 0) / cs.length)}</span></div>);
                })}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626", marginBottom: 8 }}>Key Considerations</div>
                <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.7 }}>
                  {domainTier === "Domain-Mandatory" ? "Focus 80% of sourcing effort on Strong Fit companies within the core industry. Adjacent-sector candidates should only be pursued for exceptional individual talent." :
                   domainTier === "Domain-Preferred" ? "Adjacent-sector companies are viable when candidates demonstrate relevant functional experience. Domain gap can typically close within 3\u20136 months." :
                   "Cast a wide net across all represented sectors, prioritizing companies with analogous operating environments and proven talent development."}
                </div>
              </div>
            </div>
          </Card>
        </>)}
      </div>
    </div>
  );
}
export default function App() {
  const [analysis, setAnalysis] = useState(null);
  const [rawText, setRawText] = useState("");
  if (!analysis) return <UploadScreen onAnalyze={(result, text) => { setAnalysis(result); setRawText(text); }} />;
  return <Dashboard analysis={analysis} onReset={() => { setAnalysis(null); setRawText(""); }} />;
}