/**
 * LinkedIn Profile Parser Module — v3
 *
 * Key findings from live DOM inspection (2025-2026 LinkedIn):
 *   - No <h1> on profile pages; name is in an <h2>
 *   - "0 notifications" is always the FIRST h2 — must skip it
 *   - Sections (Experience, Education, Skills) are LAZY-LOADED and
 *     only appear in the DOM after the user scrolls far down the page
 *   - Sections have NO <ul>/<li>; entries are flat <div> blocks with
 *     an <img> (company/school logo) marking each entry boundary
 *   - CSS classes are obfuscated hashes — cannot be relied upon
 *   - section.innerText gives clean newline-separated text per entry
 *   - Document title format: "Name | LinkedIn"
 */
const ProfileParser = (() => {

  // ─── Company & University Classifications ───
  const COMPANY_TIERS = {
    FAANG: [
      'google', 'alphabet', 'meta', 'facebook', 'amazon', 'apple', 'netflix',
      'microsoft', 'nvidia', 'tesla', 'openai', 'anthropic', 'deepmind'
    ],
    BIG_TECH: [
      'salesforce', 'oracle', 'ibm', 'intel', 'adobe', 'uber', 'airbnb',
      'stripe', 'palantir', 'snowflake', 'databricks', 'coinbase',
      'spotify', 'twitter', 'x corp', 'linkedin', 'bytedance', 'tiktok',
      'snap', 'pinterest', 'dropbox', 'zoom', 'slack', 'shopify',
      'square', 'block', 'robinhood', 'doordash', 'instacart',
      'samsung', 'sony', 'qualcomm', 'amd', 'broadcom', 'cisco',
      'vmware', 'servicenow', 'workday', 'splunk', 'crowdstrike',
      'palo alto networks', 'fortinet', 'twilio', 'atlassian',
      'hashicorp', 'elastic', 'confluent', 'datadog', 'cloudflare',
      'okta', 'mongodb', 'sumo logic'
    ],
    CONSULTANCY: [
      'mckinsey', 'bain', 'boston consulting', 'bcg', 'deloitte',
      'pwc', 'pricewaterhousecoopers', 'ey', 'ernst & young', 'kpmg',
      'accenture', 'capgemini', 'cognizant', 'infosys', 'tcs',
      'wipro', 'hcl', 'booz allen', 'oliver wyman', 'roland berger',
      'a.t. kearney', 'kearney', 'strategy&', 'lef', 'thoughtworks'
    ],
    FORTUNE500: [
      'jpmorgan', 'jp morgan', 'goldman sachs', 'morgan stanley',
      'bank of america', 'citigroup', 'wells fargo', 'johnson & johnson',
      'procter & gamble', 'p&g', 'unilever', 'coca-cola', 'pepsi',
      'walmart', 'target', 'costco', 'home depot', 'boeing',
      'lockheed martin', 'raytheon', 'northrop grumman', 'general electric',
      'ge', '3m', 'honeywell', 'caterpillar', 'john deere', 'disney',
      'comcast', 'at&t', 'verizon', 't-mobile', 'exxonmobil', 'chevron',
      'pfizer', 'merck', 'abbvie', 'eli lilly', 'bristol-myers',
      'unitedhealth', 'anthem', 'cigna', 'humana', 'visa', 'mastercard',
      'american express', 'paypal', 'charles schwab', 'blackrock',
      'fidelity', 'general motors', 'ford', 'toyota', 'nike', 'adidas'
    ]
  };

  const TOP_UNIVERSITIES = [
    'mit', 'massachusetts institute of technology', 'stanford',
    'harvard', 'caltech', 'california institute of technology',
    'princeton', 'yale', 'columbia', 'university of chicago',
    'duke', 'upenn', 'university of pennsylvania', 'wharton',
    'northwestern', 'cornell', 'brown', 'dartmouth', 'rice',
    'vanderbilt', 'carnegie mellon', 'cmu', 'georgia tech',
    'uc berkeley', 'berkeley', 'ucla', 'umich', 'university of michigan',
    'uiuc', 'university of illinois', 'uw', 'university of washington',
    'oxford', 'cambridge', 'imperial college', 'eth zurich',
    'national university of singapore', 'nus', 'tsinghua', 'peking',
    'iit', 'indian institute of technology', 'insead', 'london business school',
    'booth school', 'manipal'
  ];

  function classifyCompany(companyName) {
    if (!companyName) return { tier: 'unknown', type: 'unknown' };
    const lower = companyName.toLowerCase().trim();
    for (const [tier, companies] of Object.entries(COMPANY_TIERS)) {
      for (const c of companies) {
        if (lower.includes(c) || c.includes(lower)) return { tier, type: tier };
      }
    }
    return { tier: 'other', type: 'other' };
  }

  function isTopUniversity(name) {
    if (!name) return false;
    const lower = name.toLowerCase();
    return TOP_UNIVERSITIES.some(u => lower.includes(u));
  }

  function parseDuration(text) {
    if (!text) return { months: 0, text: '' };
    let totalMonths = 0;
    const yearMatch = text.match(/(\d+)\s*yr/i);
    const monthMatch = text.match(/(\d+)\s*mo/i);
    if (yearMatch) totalMonths += parseInt(yearMatch[1]) * 12;
    if (monthMatch) totalMonths += parseInt(monthMatch[1]);
    return { months: totalMonths, text: text.trim() };
  }

  function parseDateRange(text) {
    if (!text) return { start: null, end: null, isCurrent: false };
    const isCurrent = /present/i.test(text);
    const parts = text.split(/\s*[-–]\s*/);
    return {
      start: parts[0] || null,
      end: isCurrent ? 'Present' : (parts[1]?.split('·')[0]?.trim() || null),
      isCurrent
    };
  }

  // ─── Core DOM Helpers ───

  /** Find a <section> by its <h2> heading text */
  function findSection(headingText) {
    const lower = headingText.toLowerCase();
    for (const h2 of document.querySelectorAll('section h2')) {
      if (h2.textContent.trim().toLowerCase() === lower) {
        return h2.closest('section');
      }
    }
    for (const h2 of document.querySelectorAll('section h2')) {
      if (h2.textContent.trim().toLowerCase().includes(lower)) {
        return h2.closest('section');
      }
    }
    const idMap = {
      'experience': 'experience', 'education': 'education',
      'skills': 'skills', 'licenses & certifications': 'licenses_and_certifications',
      'recommendations': 'recommendations', 'projects': 'projects',
      'volunteer': 'volunteering_experience'
    };
    const el = document.getElementById(idMap[lower] || lower);
    return el ? (el.closest('section') || el) : null;
  }

  /**
   * Extract entries from a section using <img> elements as entry boundaries.
   * Each company/school logo <img> marks the start of a new entry.
   */
  function extractEntriesByImage(section) {
    if (!section) return [];
    const imgs = section.querySelectorAll('img');
    if (imgs.length === 0) return [];

    const entries = [];

    for (const img of imgs) {
      const alt = (img.alt || '').trim();
      if (img.width < 20 && img.height < 20) continue;

      let container = img.parentElement;
      for (let i = 0; i < 6 && container && container !== section; i++) {
        const text = container.innerText || '';
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 1);
        if (lines.length >= 2) break;
        container = container.parentElement;
      }

      if (container && container !== section) {
        const text = (container.innerText || '').trim();
        const lines = text.split('\n')
          .map(l => l.trim())
          .filter(l => l.length > 1 && !/^(Show|See|Add|Edit|Save|Cancel)(\s|$)/i.test(l));

        if (lines.length >= 1) {
          entries.push({ imgAlt: alt, textLines: lines, element: container });
        }
      }
    }

    const unique = [];
    const seen = new Set();
    for (const e of entries) {
      if (!seen.has(e.element)) {
        seen.add(e.element);
        unique.push(e);
      }
    }
    return unique;
  }

  /**
   * Fallback: parse section.innerText by grouping lines between date patterns.
   */
  function extractEntriesByText(section) {
    if (!section) return [];
    const text = (section.innerText || '').trim();
    const allLines = text.split('\n').map(l => l.trim()).filter(l => l.length > 1);
    if (allLines.length > 0) allLines.shift(); // remove heading

    const lines = allLines.filter(l =>
      !/^(Show|See|Add|Edit|Save|Cancel|arrow|icon)/i.test(l) &&
      !/^Show all/.test(l) && !/^Show \d+ more/.test(l)
    );

    const entries = [];
    let current = [];

    for (const line of lines) {
      const isDateLine = /\b\d{4}\b/.test(line) && /[-–]/.test(line);
      const isDurationOnly = /^\d+\s*(yr|mo)/i.test(line);

      current.push(line);

      if ((isDateLine || isDurationOnly) && current.length >= 2) {
        // Date line usually marks the end of an entry's metadata
        // Peek ahead: next line might be location, then new entry
        continue;
      }

      // If current has a date and next looks like a new title, split
      if (current.length >= 3 && current.some(c => /\d{4}/.test(c) || /yr|mo/i.test(c))) {
        // Check if this line looks like a location (last metadata line)
        if (/,/.test(line) && line.length < 50 && !/\d{4}/.test(line)) {
          entries.push({ imgAlt: '', textLines: [...current] });
          current = [];
        }
      }
    }
    if (current.length >= 2) entries.push({ imgAlt: '', textLines: current });

    return entries;
  }

  /** Classify text lines into structured fields */
  function classifyLines(lines) {
    const result = {
      title: '', company: '', dateRange: '', duration: '',
      location: '', description: '', allLines: lines
    };
    if (lines.length === 0) return result;
    result.title = lines[0];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];

      if (/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})\b/i.test(line) && /[-–]/.test(line)) {
        const parts = line.split('·').map(p => p.trim());
        result.dateRange = parts[0];
        if (parts[1] && /yr|mo/i.test(parts[1])) result.duration = parts[1];
        continue;
      }
      if (/^\d+\s*(yr|mo)/i.test(line) && line.length < 30) { result.duration = line; continue; }
      if (/^\d{4}\s*[-–]\s*\d{4}$/.test(line)) { result.dateRange = line; continue; }
      if (/^(full.?time|part.?time|contract|freelance|internship|self.?employed)/i.test(line)) continue;

      if (!result.location && line.length < 60 &&
          (/,/.test(line) || /\b(remote|hybrid|on.?site|area)\b/i.test(line)) &&
          !/\d{4}/.test(line) && !/yr|mo/i.test(line)) {
        result.location = line; continue;
      }

      if (!result.company && i <= 2) { result.company = line; continue; }
      if (line.length > 15) result.description += (result.description ? ' ' : '') + line;
    }
    return result;
  }

  // ─── Scroll to Force Lazy Loading ───
  async function scrollToLoadAllSections() {
    console.log('[LCS] Scrolling to load lazy sections...');
    const step = 400;
    let maxH = document.documentElement.scrollHeight;
    for (let y = 0; y <= maxH + 1000; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 250));
      const newH = document.documentElement.scrollHeight;
      if (newH > maxH) maxH = newH;
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise(r => setTimeout(r, 800));
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 300));
    console.log('[LCS] Scroll complete.');
  }

  // ─── Section Parsers ───

  function parseBasicInfo() {
    let name = '';
    let headline = '';
    let location = '';
    let about = '';
    let connections = 0;

    // NAME — Primary: document title "Name | LinkedIn"
    const docTitle = document.title || '';
    const titleMatch = docTitle.replace(/^\(\d+\)\s*/, '').split(/\s*[|]\s*/);
    if (titleMatch[0] && titleMatch[0].length > 1 && titleMatch[0].length < 60) {
      name = titleMatch[0].trim();
    }

    // NAME — Fallback: h2 excluding known non-name headings
    if (!name) {
      for (const h2 of document.querySelectorAll('h2')) {
        const text = h2.textContent.trim();
        if (text.length >= 2 && text.length < 60 &&
            !/notification|suggested|analytics|about|activity|experience|education|skills|highlights|featured|recommendation|interest|language|people|you might|explore|more profile|who your|ad option|don.?t want/i.test(text)) {
          name = text;
          break;
        }
      }
    }

    // HEADLINE & LOCATION — from the name section
    const nameSection = findNameSection(name);
    if (nameSection) {
      const lines = (nameSection.innerText || '').split('\n').map(l => l.trim()).filter(l => l.length > 1);

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(name) || name.includes(lines[i])) {
          for (let j = i + 1; j < lines.length && j < i + 6; j++) {
            const line = lines[j];
            if (/^[·•]/.test(line) || /^\d+(st|nd|rd|th)$/i.test(line)) continue;
            if (/^(he|she|they|ze)\/(him|her|them)/i.test(line)) continue;
            if (/^(message|follow|connect|more$|open to|contact|pending)/i.test(line)) break;
            if (line.length < 4) continue;

            if (!headline) { headline = line; }
            else if (!location && line.length < 60 && !line.includes('follower') && !line.includes('connection')) {
              location = line; break;
            }
          }
          break;
        }
      }
    }

    // ABOUT
    const aboutSection = findSection('About');
    if (aboutSection) {
      const lines = (aboutSection.innerText || '').split('\n')
        .map(l => l.trim()).filter(l => l.length > 5 && l.toLowerCase() !== 'about');
      about = lines.join(' ').substring(0, 2000);
    }

    // CONNECTIONS / FOLLOWERS
    const bodyText = document.body.innerText || '';
    const connMatch = bodyText.match(/([\d,]+)\+?\s*connections/i);
    if (connMatch) connections = parseInt(connMatch[1].replace(/,/g, ''));
    const follMatch = bodyText.match(/([\d,]+)\s*followers/i);
    if (follMatch && !connections) connections = parseInt(follMatch[1].replace(/,/g, ''));

    console.log('[LCS] Name:', name, '| Headline:', headline?.substring(0, 50));
    return { name, headline, location, about, connections };
  }

  function findNameSection(name) {
    if (!name) return null;
    for (const h2 of document.querySelectorAll('section h2')) {
      const t = h2.textContent.trim();
      if (t.includes(name) || name.includes(t)) return h2.closest('section');
    }
    return null;
  }

  function parseExperience() {
    const experiences = [];
    const section = findSection('Experience');
    if (!section) { console.log('[LCS] Experience section NOT in DOM'); return experiences; }

    let entries = extractEntriesByImage(section);
    if (entries.length === 0) entries = extractEntriesByText(section);
    console.log('[LCS] Experience entries:', entries.length);

    for (const entry of entries) {
      const c = classifyLines(entry.textLines);
      let title = c.title;
      let company = c.company;

      if (!company && entry.imgAlt) company = entry.imgAlt.replace(/\s*logo\s*$/i, '').trim();
      if (company) company = company.split('·')[0].trim();

      const dateInfo = parseDateRange(c.dateRange);
      const durationInfo = parseDuration(c.duration || c.dateRange);

      if (title && title.toLowerCase() !== 'experience' && title.length > 2) {
        experiences.push({
          title, company: company || '',
          companyClassification: classifyCompany(company),
          dateRange: dateInfo, duration: durationInfo,
          location: c.location, description: c.description,
          isCurrent: dateInfo.isCurrent
        });
      }
    }
    return experiences;
  }

  function parseEducation() {
    const education = [];
    const section = findSection('Education');
    if (!section) { console.log('[LCS] Education section NOT in DOM'); return education; }

    let entries = extractEntriesByImage(section);
    if (entries.length === 0) entries = extractEntriesByText(section);
    console.log('[LCS] Education entries:', entries.length);

    for (const entry of entries) {
      const lines = entry.textLines;
      let school = lines[0] || '';
      let degree = '', field = '', dates = '', honors = '';

      if (entry.imgAlt && !school) school = entry.imgAlt.replace(/\s*logo\s*$/i, '').trim();

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (/\d{4}\s*[-–]\s*(\d{4}|present)/i.test(line)) { dates = line; }
        else if (/honor|cum laude|magna|summa|distinction|dean/i.test(line)) { honors = line; }
        else if (/bachelor|master|m\.?b\.?a|ph\.?d|doctor|associate|degree|b\.?s|b\.?a|m\.?s/i.test(line)) {
          if (line.includes(',')) { const p = line.split(','); degree = p[0].trim(); field = p.slice(1).join(',').trim(); }
          else degree = line;
        } else if (!degree && i <= 2 && line.length < 80) { degree = line; }
      }

      let degreeLevel = 'unknown';
      const dl = (degree + ' ' + field).toLowerCase();
      if (/ph\.?d|doctor|doctorate/i.test(dl)) degreeLevel = 'phd';
      else if (/m\.?b\.?a|master|m\.?s\.?|m\.?a\.?|m\.?eng/i.test(dl)) degreeLevel = 'masters';
      else if (/b\.?s\.?|b\.?a\.?|b\.?eng|bachelor|undergraduate/i.test(dl)) degreeLevel = 'bachelors';
      else if (/associate/i.test(dl)) degreeLevel = 'associates';

      if (school && school.toLowerCase() !== 'education' && school.length > 2) {
        education.push({ school, degree, field, degreeLevel, dates, activities: '', honors, isTopUniversity: isTopUniversity(school) });
      }
    }
    return education;
  }

  function parseSkills() {
    const skills = [];
    const section = findSection('Skills');
    if (!section) return skills;
    const seen = new Set();
    const entries = extractEntriesByImage(section);
    for (const entry of entries) {
      const name = entry.textLines[0] || '';
      if (name.toLowerCase() === 'skills' || name.length < 2) continue;
      let endorsements = 0;
      for (const line of entry.textLines) { const m = line.match(/(\d+)\s*endorsement/i); if (m) endorsements = parseInt(m[1]); }
      if (!seen.has(name.toLowerCase())) { seen.add(name.toLowerCase()); skills.push({ name, endorsements }); }
    }
    if (skills.length === 0) {
      const lines = (section.innerText || '').split('\n').map(l => l.trim())
        .filter(l => l.length >= 2 && l.length < 60 && l.toLowerCase() !== 'skills' && !/^(show|see|add|edit)/i.test(l));
      for (const line of lines) { if (!seen.has(line.toLowerCase())) { seen.add(line.toLowerCase()); skills.push({ name: line, endorsements: 0 }); } }
    }
    return skills;
  }

  function parseCertifications() {
    const certs = [];
    const section = findSection('Licenses & certifications') || findSection('Certifications') || findSection('Licenses');
    if (!section) return certs;
    let entries = extractEntriesByImage(section);
    if (entries.length === 0) entries = extractEntriesByText(section);
    for (const entry of entries) {
      const c = classifyLines(entry.textLines);
      if (c.title && !/^(licenses|certifications)/i.test(c.title)) certs.push({ name: c.title, issuer: c.company || '', date: c.dateRange || '' });
    }
    return certs;
  }

  function parseRecommendations() {
    const recs = { received: [], given: [] };
    const section = findSection('Recommendations');
    if (!section) return recs;
    const entries = extractEntriesByImage(section);
    for (const entry of entries) {
      const lines = entry.textLines;
      let rName = lines[0] || '', title = lines.length > 1 ? lines[1] : '';
      let text = lines.slice(2).join(' ').substring(0, 300);
      if (/^(recommendations|received|given|nothing to see)/i.test(rName)) continue;
      let seniority = 'peer';
      const tl = title.toLowerCase();
      if (/vp|vice president|ceo|cto|cfo|coo|cmo|chief|president|partner|managing director/i.test(tl)) seniority = 'executive';
      else if (/director|head of/i.test(tl)) seniority = 'director';
      else if (/manager|lead|supervisor/i.test(tl)) seniority = 'manager';
      if (rName.length > 2) recs.received.push({ name: rName, title, relationship: '', seniority, textSnippet: text });
    }
    return recs;
  }

  function parseProjectsAndPublications() {
    const results = { projects: [], publications: [], patents: [] };
    for (const [heading, arr] of [['Projects', results.projects], ['Publications', results.publications], ['Patents', results.patents]]) {
      const section = findSection(heading);
      if (!section) continue;
      let entries = extractEntriesByImage(section);
      if (entries.length === 0) entries = extractEntriesByText(section);
      for (const entry of entries) {
        const title = entry.textLines[0] || '';
        if (title && !title.toLowerCase().includes(heading.toLowerCase())) arr.push({ title, description: entry.textLines.slice(1).join(' ') });
      }
    }
    const featured = findSection('Featured');
    if (featured) {
      const links = featured.querySelectorAll('a[href]');
      const seen = new Set();
      links.forEach(link => {
        const href = link.href;
        if (href && !seen.has(href) && !href.includes('linkedin.com/in/')) {
          seen.add(href);
          const t = link.textContent.trim().substring(0, 100);
          if (t && t.length > 2) results.projects.push({ title: 'Featured: ' + t, description: '', url: href });
        }
      });
    }
    return results;
  }

  function parseVolunteer() {
    const volunteer = [];
    const section = findSection('Volunteer') || findSection('Volunteering');
    if (!section) return volunteer;
    let entries = extractEntriesByImage(section);
    if (entries.length === 0) entries = extractEntriesByText(section);
    for (const entry of entries) {
      const c = classifyLines(entry.textLines);
      if (c.title && !/^volunteer/i.test(c.title)) {
        volunteer.push({ role: c.title, organization: c.company || '', isLeadership: /board|chair|president|director|founder|lead|head/i.test(c.title) });
      }
    }
    return volunteer;
  }

  function parseActivity() {
    let postCount = 0, articleCount = 0, followerCount = 0;
    const section = findSection('Activity');
    if (section) {
      const text = section.innerText || '';
      const fm = text.match(/([\d,]+)\s*follower/i);
      if (fm) followerCount = parseInt(fm[1].replace(/,/g, ''));
      if (/articles/i.test(text)) articleCount = 1;
      const postEls = section.querySelectorAll('a[href*="/posts/"], a[href*="/pulse/"]');
      postCount = postEls.length || Math.max(0, section.querySelectorAll('img').length - 1);
    }
    return { postCount, articleCount, followerCount };
  }

  // ─── Main Parse ───
  function parseFullProfile() {
    const basicInfo = parseBasicInfo();
    const experience = parseExperience();
    const education = parseEducation();
    const skills = parseSkills();
    const certifications = parseCertifications();
    const recommendations = parseRecommendations();
    const pp = parseProjectsAndPublications();
    const volunteer = parseVolunteer();
    const activity = parseActivity();

    const totalMonths = experience.reduce((s, e) => s + (e.duration?.months || 0), 0);
    const tenures = experience.filter(e => e.duration?.months > 0).map(e => e.duration.months);
    const avgTenure = tenures.length > 0 ? tenures.reduce((a, b) => a + b, 0) / tenures.length : 0;
    const maxTenure = tenures.length > 0 ? Math.max(...tenures) : 0;
    const shortTenures = tenures.filter(t => t < 12).length;
    const jobHopping = tenures.length >= 3 && avgTenure < 18;
    const companyTypes = experience.map(e => e.companyClassification?.tier).filter(t => t && t !== 'unknown');

    const highestDegree = education.reduce((best, e) => {
      const order = { phd: 4, masters: 3, bachelors: 2, associates: 1, unknown: 0 };
      return (order[e.degreeLevel] || 0) > (order[best] || 0) ? e.degreeLevel : best;
    }, 'unknown');

    const sections = {
      basicInfo: !!basicInfo.name, experience: experience.length > 0,
      education: education.length > 0, skills: skills.length > 0,
      certifications: certifications.length > 0,
      recommendations: recommendations.received.length > 0,
      projects: pp.projects.length > 0 || pp.publications.length > 0,
      volunteer: volunteer.length > 0,
      activity: activity.postCount > 0 || activity.articleCount > 0,
      about: !!basicInfo.about
    };
    const completeness = Object.values(sections).filter(Boolean).length / Object.keys(sections).length;

    console.log('[LCS] Parse done — Name:', basicInfo.name,
      '| Exp:', experience.length, '| Edu:', education.length,
      '| Skills:', skills.length, '| Complete:', Math.round(completeness * 100) + '%');

    return {
      basicInfo, experience, education, skills, certifications, recommendations,
      projects: pp.projects, publications: pp.publications, patents: pp.patents,
      volunteer, activity,
      metrics: {
        totalExperienceMonths: totalMonths,
        totalExperienceYears: Math.round(totalMonths / 12 * 10) / 10,
        avgTenureMonths: Math.round(avgTenure), maxTenureMonths: maxTenure,
        shortTenureCount: shortTenures, jobHopping, companyTypes,
        hasFAANG: companyTypes.includes('FAANG'), hasBigTech: companyTypes.includes('BIG_TECH'),
        hasConsultancy: companyTypes.includes('CONSULTANCY'), hasFortune500: companyTypes.includes('FORTUNE500'),
        highestDegree, hasTopUniversity: education.some(e => e.isTopUniversity),
        skillCount: skills.length, certCount: certifications.length,
        recCount: recommendations.received.length, completeness
      },
      sections, parsedAt: new Date().toISOString()
    };
  }

  function waitForProfile(timeout = 8000) {
    return new Promise(resolve => {
      function check() {
        const title = document.title || '';
        return title.includes('| LinkedIn') && !title.includes('Sign') && !title.includes('Log');
      }
      if (check()) return setTimeout(() => resolve(true), 1500);
      const obs = new MutationObserver((_, o) => {
        if (check()) { o.disconnect(); setTimeout(() => resolve(true), 1500); }
      });
      obs.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => { obs.disconnect(); resolve(false); }, timeout);
    });
  }

  /**
   * Build a single searchable text blob from all profile sections.
   * Used for keyword matching — searches everywhere, not just the Skills section.
   * Includes: name, headline, about, experience titles/companies/descriptions,
   * education schools/degrees/fields, certifications, recommendations text,
   * projects, volunteer roles, and the Skills section text.
   */
  function getFullProfileText(profileData) {
    const parts = [];

    // Basic info
    const b = profileData.basicInfo || {};
    if (b.name) parts.push(b.name);
    if (b.headline) parts.push(b.headline);
    if (b.about) parts.push(b.about);

    // Experience — titles, companies, descriptions, locations
    for (const exp of (profileData.experience || [])) {
      if (exp.title) parts.push(exp.title);
      if (exp.company) parts.push(exp.company);
      if (exp.description) parts.push(exp.description);
      if (exp.location) parts.push(exp.location);
    }

    // Education — schools, degrees, fields
    for (const edu of (profileData.education || [])) {
      if (edu.school) parts.push(edu.school);
      if (edu.degree) parts.push(edu.degree);
      if (edu.field) parts.push(edu.field);
    }

    // Skills section (still include it — just not the only source)
    for (const skill of (profileData.skills || [])) {
      if (skill.name) parts.push(skill.name);
    }

    // Certifications
    for (const cert of (profileData.certifications || [])) {
      if (cert.name) parts.push(cert.name);
      if (cert.issuer) parts.push(cert.issuer);
    }

    // Recommendations text
    for (const rec of (profileData.recommendations?.received || [])) {
      if (rec.textSnippet) parts.push(rec.textSnippet);
      if (rec.title) parts.push(rec.title);
    }

    // Projects, publications, patents
    for (const proj of (profileData.projects || [])) {
      if (proj.title) parts.push(proj.title);
      if (proj.description) parts.push(proj.description);
    }
    for (const pub of (profileData.publications || [])) {
      if (pub.title) parts.push(pub.title);
    }

    // Volunteer
    for (const vol of (profileData.volunteer || [])) {
      if (vol.role) parts.push(vol.role);
      if (vol.organization) parts.push(vol.organization);
    }

    return parts.join(' \n ');
  }

  return {
    parseFullProfile, waitForProfile, scrollToLoadAllSections,
    classifyCompany, isTopUniversity, parseDuration, getFullProfileText
  };
})();
