/**
 * Scoring Engine Module
 * Scores candidates on a 0-100 scale across 10 weighted dimensions.
 * Each dimension score is transparent — every signal that contributes is recorded.
 */
const ScoringEngine = (() => {

  const SENIORITY_LEVELS = {
    'IC': ['engineer', 'developer', 'analyst', 'designer', 'specialist', 'associate', 'consultant', 'coordinator', 'representative'],
    'Lead': ['lead', 'senior', 'staff', 'principal', 'sr.', 'sr '],
    'Manager': ['manager', 'management'],
    'Director': ['director', 'head of'],
    'VP': ['vp', 'vice president', 'svp', 'evp', 'c-suite', 'chief', 'ceo', 'cto', 'cfo', 'coo', 'cmo', 'partner']
  };

  const SENIORITY_ORDER = ['IC', 'Lead', 'Manager', 'Director', 'VP'];

  function detectSeniority(title) {
    if (!title) return 'IC';
    const lower = title.toLowerCase();
    // Check from highest to lowest
    for (let i = SENIORITY_ORDER.length - 1; i >= 0; i--) {
      const level = SENIORITY_ORDER[i];
      if (SENIORITY_LEVELS[level].some(k => lower.includes(k))) return level;
    }
    return 'IC';
  }

  function seniorityIndex(level) {
    return SENIORITY_ORDER.indexOf(level);
  }

  /**
   * Compute a fuzzy match score between two strings (0 to 1).
   * Uses token overlap for simplicity and performance.
   */
  function fuzzyMatch(a, b) {
    if (!a || !b) return 0;
    const tokensA = a.toLowerCase().split(/[\s,./\-–]+/).filter(t => t.length > 2);
    const tokensB = b.toLowerCase().split(/[\s,./\-–]+/).filter(t => t.length > 2);
    if (tokensA.length === 0 || tokensB.length === 0) return 0;

    let matches = 0;
    for (const t of tokensA) {
      if (tokensB.some(tb => tb.includes(t) || t.includes(tb))) matches++;
    }
    return matches / Math.max(tokensA.length, tokensB.length);
  }

  function skillMatch(candidateSkill, targetSkill) {
    const a = candidateSkill.toLowerCase().trim();
    const b = targetSkill.toLowerCase().trim();
    if (a === b) return 1;
    if (a.includes(b) || b.includes(a)) return 0.9;
    return fuzzyMatch(a, b) > 0.5 ? 0.6 : 0;
  }

  // ─── Individual Scoring Functions ───

  function scoreRoleRelevance(profile, roleProfile) {
    const signals = [];
    let score = 0;

    const targetTitle = roleProfile.targetTitle.toLowerCase();
    const targetSeniority = roleProfile.seniorityLevel;

    if (!targetTitle) return { score: 50, signals: [{ text: 'No target title configured', impact: 0 }], confidence: 0.3 };

    // Check current and past titles
    const experiences = profile.experience || [];
    let bestTitleMatch = 0;
    let bestMatchExp = null;

    for (const exp of experiences) {
      const match = fuzzyMatch(exp.title, targetTitle);
      if (match > bestTitleMatch) {
        bestTitleMatch = match;
        bestMatchExp = exp;
      }
    }

    if (bestTitleMatch > 0.7) {
      score += 40;
      signals.push({ text: `Strong title match: "${bestMatchExp.title}"`, impact: 40, positive: true });
    } else if (bestTitleMatch > 0.4) {
      score += 25;
      signals.push({ text: `Partial title match: "${bestMatchExp?.title}"`, impact: 25, positive: true });
    } else if (bestTitleMatch > 0.2) {
      score += 10;
      signals.push({ text: `Weak title match: "${bestMatchExp?.title}"`, impact: 10, positive: false });
    } else {
      signals.push({ text: 'No matching job titles found', impact: 0, positive: false });
    }

    // Current role match
    const currentExp = experiences.find(e => e.isCurrent);
    if (currentExp) {
      const currentMatch = fuzzyMatch(currentExp.title, targetTitle);
      if (currentMatch > 0.5) {
        score += 20;
        signals.push({ text: `Currently in a matching role at ${currentExp.company}`, impact: 20, positive: true });
      }
    }

    // Seniority match
    if (currentExp) {
      const currentSeniority = detectSeniority(currentExp.title);
      const targetIdx = seniorityIndex(targetSeniority);
      const currentIdx = seniorityIndex(currentSeniority);
      const diff = currentIdx - targetIdx;

      if (diff === 0) {
        score += 20;
        signals.push({ text: `Seniority level matches: ${currentSeniority}`, impact: 20, positive: true });
      } else if (Math.abs(diff) === 1) {
        score += 12;
        signals.push({ text: `Seniority close: ${currentSeniority} (target: ${targetSeniority})`, impact: 12, positive: true });
      } else {
        score += 5;
        signals.push({ text: `Seniority gap: ${currentSeniority} vs target ${targetSeniority}`, impact: 5, positive: false });
      }
    }

    // Headline match
    const headlineMatch = fuzzyMatch(profile.basicInfo.headline || '', targetTitle);
    if (headlineMatch > 0.4) {
      score += 10;
      signals.push({ text: 'Headline aligns with target role', impact: 10, positive: true });
    }

    // Description keyword match
    const allDescriptions = experiences.map(e => e.description).join(' ');
    const descMatch = fuzzyMatch(allDescriptions, targetTitle + ' ' + (roleProfile.keywords || []).join(' '));
    if (descMatch > 0.3) {
      score += 10;
      signals.push({ text: 'Experience descriptions mention relevant keywords', impact: 10, positive: true });
    }

    return { score: Math.min(100, score), signals, confidence: experiences.length > 0 ? 1 : 0.3 };
  }

  function scoreExperienceDepth(profile, roleProfile) {
    const signals = [];
    let score = 0;

    const totalYears = profile.metrics.totalExperienceYears;
    const minRequired = roleProfile.minYearsExperience || 0;

    if (totalYears >= minRequired) {
      const excess = totalYears - minRequired;
      score += Math.min(40, 25 + excess * 3);
      signals.push({ text: `${totalYears} years total experience (${minRequired}+ required)`, impact: score, positive: true });
    } else if (totalYears >= minRequired * 0.7) {
      score += 15;
      signals.push({ text: `${totalYears} years — slightly under ${minRequired} year requirement`, impact: 15, positive: false });
    } else {
      score += 5;
      signals.push({ text: `Only ${totalYears} years experience (${minRequired} required)`, impact: 5, positive: false });
    }

    // Seniority progression
    const experiences = profile.experience || [];
    if (experiences.length >= 2) {
      const firstSeniority = seniorityIndex(detectSeniority(experiences[experiences.length - 1].title));
      const lastSeniority = seniorityIndex(detectSeniority(experiences[0].title));
      const progression = lastSeniority - firstSeniority;

      if (progression >= 2) {
        score += 30;
        signals.push({ text: 'Strong career progression — moved up 2+ levels', impact: 30, positive: true });
      } else if (progression === 1) {
        score += 20;
        signals.push({ text: 'Career progression — promoted one level', impact: 20, positive: true });
      } else if (progression === 0) {
        score += 10;
        signals.push({ text: 'Lateral career moves — stable seniority', impact: 10, positive: false });
      }
    }

    // Number of distinct roles
    if (experiences.length >= 4) {
      score += 15;
      signals.push({ text: `${experiences.length} roles — broad experience`, impact: 15, positive: true });
    } else if (experiences.length >= 2) {
      score += 10;
      signals.push({ text: `${experiences.length} roles`, impact: 10, positive: true });
    }

    // Current employment
    if (experiences.some(e => e.isCurrent)) {
      score += 5;
      signals.push({ text: 'Currently employed', impact: 5, positive: true });
    }

    return { score: Math.min(100, score), signals, confidence: experiences.length > 0 ? 1 : 0.2 };
  }

  function scoreCompanyCaliber(profile, roleProfile) {
    const signals = [];
    let score = 0;

    const m = profile.metrics;

    if (m.hasFAANG) {
      score += 35;
      const faangCompanies = profile.experience.filter(e => e.companyClassification?.tier === 'FAANG').map(e => e.company);
      signals.push({ text: `FAANG experience: ${[...new Set(faangCompanies)].join(', ')}`, impact: 35, positive: true });
    }

    if (m.hasBigTech) {
      score += 25;
      const techCompanies = profile.experience.filter(e => e.companyClassification?.tier === 'BIG_TECH').map(e => e.company);
      signals.push({ text: `Big Tech experience: ${[...new Set(techCompanies)].join(', ')}`, impact: 25, positive: true });
    }

    if (m.hasFortune500) {
      score += 20;
      signals.push({ text: 'Fortune 500 experience', impact: 20, positive: true });
    }

    if (m.hasConsultancy) {
      score += 15;
      signals.push({ text: 'Top consultancy experience', impact: 15, positive: true });
    }

    // Preferred company types
    const prefTypes = roleProfile.preferredCompanyTypes || [];
    if (prefTypes.length > 0) {
      const matchedTypes = prefTypes.filter(t => m.companyTypes.includes(t));
      if (matchedTypes.length > 0) {
        score += 15;
        signals.push({ text: `Matches preferred company types: ${matchedTypes.join(', ')}`, impact: 15, positive: true });
      }
    }

    // Diversity of company types
    const uniqueTypes = [...new Set(m.companyTypes.filter(t => t !== 'other'))];
    if (uniqueTypes.length >= 3) {
      score += 10;
      signals.push({ text: 'Diverse company background', impact: 10, positive: true });
    }

    if (score === 0) {
      score = 30; // Baseline — don't penalize unknowns too harshly
      signals.push({ text: 'Companies not in recognized tier lists — no penalty applied', impact: 30, positive: false });
    }

    return { score: Math.min(100, score), signals, confidence: profile.experience.length > 0 ? 0.8 : 0.2 };
  }

  function scoreTenureStability(profile, roleProfile) {
    const signals = [];
    let score = 0;

    const avgMonths = profile.metrics.avgTenureMonths;
    const maxMonths = profile.metrics.maxTenureMonths;
    const jobHopping = profile.metrics.jobHopping;
    const experiences = profile.experience || [];

    if (experiences.length === 0) {
      return { score: 50, signals: [{ text: 'No experience data to assess tenure', impact: 0 }], confidence: 0.2 };
    }

    // Average tenure scoring
    if (avgMonths >= 36) {
      score += 40;
      signals.push({ text: `Strong average tenure: ${Math.round(avgMonths / 12 * 10) / 10} years`, impact: 40, positive: true });
    } else if (avgMonths >= 24) {
      score += 30;
      signals.push({ text: `Good average tenure: ${Math.round(avgMonths / 12 * 10) / 10} years`, impact: 30, positive: true });
    } else if (avgMonths >= 18) {
      score += 20;
      signals.push({ text: `Moderate average tenure: ${Math.round(avgMonths / 12 * 10) / 10} years`, impact: 20, positive: false });
    } else {
      score += 10;
      signals.push({ text: `Short average tenure: ${Math.round(avgMonths / 12 * 10) / 10} years`, impact: 10, positive: false });
    }

    // Job hopping flag
    if (jobHopping) {
      score -= 10;
      signals.push({ text: 'Job-hopping pattern detected (< 1.5 year average)', impact: -10, positive: false });
    }

    // Longest stint
    if (maxMonths >= 48) {
      score += 30;
      signals.push({ text: `Longest stint: ${Math.round(maxMonths / 12 * 10) / 10} years — shows commitment`, impact: 30, positive: true });
    } else if (maxMonths >= 24) {
      score += 20;
      signals.push({ text: `Longest stint: ${Math.round(maxMonths / 12 * 10) / 10} years`, impact: 20, positive: true });
    }

    // Current role tenure
    const currentExp = experiences.find(e => e.isCurrent);
    if (currentExp && currentExp.duration.months >= 12) {
      score += 15;
      signals.push({ text: `${Math.round(currentExp.duration.months / 12 * 10) / 10} years in current role`, impact: 15, positive: true });
    }

    // Short tenure count
    if (profile.metrics.shortTenureCount > 2) {
      score -= 5;
      signals.push({ text: `${profile.metrics.shortTenureCount} roles under 1 year`, impact: -5, positive: false });
    }

    return { score: Math.max(0, Math.min(100, score)), signals, confidence: 1 };
  }

  /**
   * Keyword Match — searches the ENTIRE profile text (headline, about,
   * experience titles/descriptions, education, certs, projects, etc.)
   * instead of only the LinkedIn Skills section.
   *
   * This catches candidates who are relevant but never filled in their
   * Skills section or job descriptions.
   */
  function scoreKeywordMatch(profile, roleProfile) {
    const signals = [];
    let score = 0;

    const keywords = roleProfile.keywords || [];
    const bonusKeywords = roleProfile.bonusKeywords || [];

    if (keywords.length === 0 && bonusKeywords.length === 0) {
      return { score: 50, signals: [{ text: 'No keywords configured — score neutral', impact: 0 }], confidence: 0.3 };
    }

    // Build full-text search blob from entire profile
    const fullText = ProfileParser.getFullProfileText(profile).toLowerCase();

    // --- Must-have keywords ---
    let keywordsMatched = 0;
    const keywordsMissing = [];

    for (const kw of keywords) {
      const kwLower = kw.toLowerCase().trim();
      const tokens = kwLower.split(/[\s/\-]+/).filter(t => t.length > 1);

      // Try exact phrase first, then token overlap
      let found = false;
      if (fullText.includes(kwLower)) {
        found = true;
      } else if (tokens.length > 1) {
        // Multi-word keyword: check if most tokens appear
        const tokenHits = tokens.filter(t => fullText.includes(t)).length;
        if (tokenHits >= Math.ceil(tokens.length * 0.7)) found = true;
      } else {
        // Single-word: also try common variations (e.g., "react" matches "reactjs", "react.js")
        const variations = [kwLower, kwLower.replace(/[.\s]/g, ''), kwLower + 's', kwLower + 'js', kwLower + '.js'];
        found = variations.some(v => fullText.includes(v));
      }

      if (found) {
        keywordsMatched++;
        // Determine WHERE it was found for transparency
        const location = detectKeywordLocation(kw, profile);
        signals.push({ text: `Keyword "${kw}" found${location ? ' in ' + location : ''}`, impact: 0, positive: true });
      } else {
        keywordsMissing.push(kw);
      }
    }

    if (keywords.length > 0) {
      const keywordScore = (keywordsMatched / keywords.length) * 60;
      score += keywordScore;

      if (keywordsMissing.length > 0) {
        signals.push({ text: `Missing keywords: ${keywordsMissing.join(', ')}`, impact: -(keywordsMissing.length * 8), positive: false });
      }
    }

    // --- Bonus keywords ---
    let bonusMatched = 0;
    for (const bkw of bonusKeywords) {
      const bkwLower = bkw.toLowerCase().trim();
      const tokens = bkwLower.split(/[\s/\-]+/).filter(t => t.length > 1);

      let found = false;
      if (fullText.includes(bkwLower)) {
        found = true;
      } else if (tokens.length > 1) {
        const tokenHits = tokens.filter(t => fullText.includes(t)).length;
        if (tokenHits >= Math.ceil(tokens.length * 0.7)) found = true;
      } else {
        const variations = [bkwLower, bkwLower.replace(/[.\s]/g, ''), bkwLower + 's'];
        found = variations.some(v => fullText.includes(v));
      }

      if (found) {
        bonusMatched++;
      }
    }

    if (bonusKeywords.length > 0) {
      const bonusScore = (bonusMatched / bonusKeywords.length) * 25;
      score += bonusScore;
      signals.push({ text: `${bonusMatched}/${bonusKeywords.length} bonus keywords matched`, impact: bonusScore, positive: bonusMatched > 0 });
    }

    // Profile richness bonus — reward candidates who have detailed profiles
    const textLength = fullText.length;
    if (textLength > 3000) {
      score += 10;
      signals.push({ text: 'Detailed profile — rich text to match against', impact: 10, positive: true });
    } else if (textLength < 500) {
      score += 5;
      signals.push({ text: 'Sparse profile text — keyword matching may be incomplete', impact: 5, positive: false });
    }

    const confidence = textLength > 500 ? 1 : (textLength > 200 ? 0.7 : 0.4);
    return { score: Math.min(100, score), signals, confidence };
  }

  /**
   * Helper: figure out where a keyword was found for signal transparency.
   */
  function detectKeywordLocation(keyword, profile) {
    const kw = keyword.toLowerCase();
    const locations = [];

    if ((profile.basicInfo?.headline || '').toLowerCase().includes(kw)) locations.push('headline');
    if ((profile.basicInfo?.about || '').toLowerCase().includes(kw)) locations.push('about');

    for (const exp of (profile.experience || [])) {
      if ((exp.title || '').toLowerCase().includes(kw)) { locations.push('job title'); break; }
      if ((exp.description || '').toLowerCase().includes(kw)) { locations.push('experience description'); break; }
      if ((exp.company || '').toLowerCase().includes(kw)) { locations.push('company name'); break; }
    }

    for (const skill of (profile.skills || [])) {
      if ((skill.name || '').toLowerCase().includes(kw)) { locations.push('skills'); break; }
    }

    for (const cert of (profile.certifications || [])) {
      if ((cert.name || '').toLowerCase().includes(kw)) { locations.push('certifications'); break; }
    }

    for (const edu of (profile.education || [])) {
      if (((edu.degree || '') + ' ' + (edu.field || '')).toLowerCase().includes(kw)) { locations.push('education'); break; }
    }

    return locations.length > 0 ? locations.join(', ') : '';
  }

  function scoreEducationFit(profile, roleProfile) {
    const signals = [];
    let score = 0;

    const education = profile.education || [];
    if (education.length === 0) {
      return { score: 40, signals: [{ text: 'No education listed — not penalized heavily', impact: 0 }], confidence: 0.4 };
    }

    const highestDegree = profile.metrics.highestDegree;
    const requiredLevel = roleProfile.requiredEducationLevel || 'none';

    const degreeOrder = { none: 0, associates: 1, bachelors: 2, masters: 3, phd: 4, unknown: 1 };
    const candidateLevel = degreeOrder[highestDegree] || 0;
    const requiredLevelNum = degreeOrder[requiredLevel] || 0;

    if (candidateLevel >= requiredLevelNum) {
      const bonus = (candidateLevel - requiredLevelNum) * 8;
      score += 35 + Math.min(bonus, 20);
      signals.push({ text: `Meets education requirement: ${highestDegree}`, impact: 35, positive: true });
    } else {
      score += 15;
      signals.push({ text: `Below required education: has ${highestDegree}, needs ${requiredLevel}`, impact: 15, positive: false });
    }

    // Top university bonus
    if (profile.metrics.hasTopUniversity) {
      score += 20;
      const topSchool = education.find(e => e.isTopUniversity);
      signals.push({ text: `Top-tier institution: ${topSchool?.school}`, impact: 20, positive: true });
    }

    // Honors
    const withHonors = education.filter(e => e.honors);
    if (withHonors.length > 0) {
      score += 15;
      signals.push({ text: 'Academic honors/distinctions', impact: 15, positive: true });
    }

    // Field relevance (if we had target field info we'd check — for now, just check it exists)
    const withField = education.filter(e => e.field);
    if (withField.length > 0) {
      score += 10;
      signals.push({ text: `Field of study: ${withField[0].field}`, impact: 10, positive: true });
    }

    return { score: Math.min(100, score), signals, confidence: 0.9 };
  }

  function scoreCertifications(profile, roleProfile) {
    const signals = [];
    let score = 0;

    const certs = profile.certifications || [];
    const requiredCerts = roleProfile.requiredCertifications || [];

    if (certs.length === 0 && requiredCerts.length === 0) {
      return { score: 50, signals: [{ text: 'No certifications listed or required', impact: 0 }], confidence: 0.5 };
    }

    // Required certifications
    let requiredMatched = 0;
    for (const rc of requiredCerts) {
      const match = certs.some(c =>
        c.name.toLowerCase().includes(rc.toLowerCase()) ||
        rc.toLowerCase().includes(c.name.toLowerCase())
      );
      if (match) {
        requiredMatched++;
        signals.push({ text: `Has required certification: ${rc}`, impact: 0, positive: true });
      } else {
        signals.push({ text: `Missing required certification: ${rc}`, impact: -10, positive: false });
      }
    }

    if (requiredCerts.length > 0) {
      score += (requiredMatched / requiredCerts.length) * 50;
    }

    // Total certifications
    if (certs.length >= 5) {
      score += 30;
      signals.push({ text: `${certs.length} certifications — highly credentialed`, impact: 30, positive: true });
    } else if (certs.length >= 3) {
      score += 20;
      signals.push({ text: `${certs.length} certifications`, impact: 20, positive: true });
    } else if (certs.length >= 1) {
      score += 15;
      signals.push({ text: `${certs.length} certification(s)`, impact: 15, positive: true });
    }

    // Well-known certifications
    const wellKnown = ['aws', 'pmp', 'cfa', 'cissp', 'google', 'azure', 'scrum', 'agile', 'six sigma', 'itil', 'comptia'];
    const knownCerts = certs.filter(c => wellKnown.some(k => c.name.toLowerCase().includes(k)));
    if (knownCerts.length > 0) {
      score += 15;
      signals.push({ text: `Industry-recognized certifications: ${knownCerts.map(c => c.name).join(', ')}`, impact: 15, positive: true });
    }

    if (certs.length === 0 && requiredCerts.length > 0) {
      score = 10;
    }

    return { score: Math.min(100, Math.max(0, score)), signals, confidence: 0.8 };
  }

  function scoreRecommendations(profile, roleProfile) {
    const signals = [];
    let score = 0;

    const recs = profile.recommendations?.received || [];

    if (recs.length === 0) {
      return { score: 30, signals: [{ text: 'No recommendations — not heavily penalized', impact: 0 }], confidence: 0.4 };
    }

    // Count
    if (recs.length >= 5) {
      score += 35;
      signals.push({ text: `${recs.length} recommendations`, impact: 35, positive: true });
    } else if (recs.length >= 3) {
      score += 25;
      signals.push({ text: `${recs.length} recommendations`, impact: 25, positive: true });
    } else {
      score += 15;
      signals.push({ text: `${recs.length} recommendation(s)`, impact: 15, positive: true });
    }

    // Seniority of recommenders
    const executiveRecs = recs.filter(r => r.seniority === 'executive');
    const directorRecs = recs.filter(r => r.seniority === 'director');
    const managerRecs = recs.filter(r => r.seniority === 'manager');

    if (executiveRecs.length > 0) {
      score += 25;
      signals.push({ text: `${executiveRecs.length} executive-level recommendation(s)`, impact: 25, positive: true });
    }
    if (directorRecs.length > 0) {
      score += 15;
      signals.push({ text: `${directorRecs.length} director-level recommendation(s)`, impact: 15, positive: true });
    }
    if (managerRecs.length > 0) {
      score += 10;
      signals.push({ text: `${managerRecs.length} manager-level recommendation(s)`, impact: 10, positive: true });
    }

    // Diversity of recommenders
    const uniqueSeniorities = new Set(recs.map(r => r.seniority));
    if (uniqueSeniorities.size >= 3) {
      score += 15;
      signals.push({ text: 'Recommendations from multiple seniority levels', impact: 15, positive: true });
    }

    return { score: Math.min(100, score), signals, confidence: 0.8 };
  }

  function scoreProjectsImpact(profile, roleProfile) {
    const signals = [];
    let score = 0;

    const projects = profile.projects || [];
    const publications = profile.publications || [];
    const patents = profile.patents || [];
    const volunteer = profile.volunteer || [];

    const totalOutput = projects.length + publications.length + patents.length;

    if (totalOutput === 0) {
      return { score: 30, signals: [{ text: 'No projects, publications, or patents listed', impact: 0 }], confidence: 0.4 };
    }

    if (patents.length > 0) {
      score += 30;
      signals.push({ text: `${patents.length} patent(s) — strong innovation signal`, impact: 30, positive: true });
    }

    if (publications.length > 0) {
      score += 25;
      signals.push({ text: `${publications.length} publication(s)`, impact: 25, positive: true });
    }

    if (projects.length > 0) {
      score += Math.min(25, projects.length * 8);
      signals.push({ text: `${projects.length} project(s)/featured items`, impact: Math.min(25, projects.length * 8), positive: true });
    }

    // Volunteer leadership
    const leaderVolunteer = volunteer.filter(v => v.isLeadership);
    if (leaderVolunteer.length > 0) {
      score += 15;
      signals.push({ text: `${leaderVolunteer.length} volunteer leadership role(s)`, impact: 15, positive: true });
    } else if (volunteer.length > 0) {
      score += 8;
      signals.push({ text: `${volunteer.length} volunteer experience(s)`, impact: 8, positive: true });
    }

    return { score: Math.min(100, score), signals, confidence: 0.7 };
  }

  function scoreGrowthTrajectory(profile, roleProfile) {
    const signals = [];
    let score = 0;

    const experiences = profile.experience || [];

    if (experiences.length < 2) {
      return { score: 40, signals: [{ text: 'Limited career history for trajectory analysis', impact: 0 }], confidence: 0.3 };
    }

    // Title progression
    const seniorities = experiences.map(e => ({
      title: e.title,
      level: detectSeniority(e.title),
      index: seniorityIndex(detectSeniority(e.title))
    })).reverse(); // Oldest first

    let promotions = 0;
    let laterals = 0;
    for (let i = 1; i < seniorities.length; i++) {
      if (seniorities[i].index > seniorities[i - 1].index) promotions++;
      else if (seniorities[i].index === seniorities[i - 1].index) laterals++;
    }

    if (promotions >= 3) {
      score += 40;
      signals.push({ text: `${promotions} career promotions — exceptional growth`, impact: 40, positive: true });
    } else if (promotions >= 2) {
      score += 30;
      signals.push({ text: `${promotions} career promotions — strong growth`, impact: 30, positive: true });
    } else if (promotions >= 1) {
      score += 20;
      signals.push({ text: `${promotions} promotion`, impact: 20, positive: true });
    } else {
      score += 10;
      signals.push({ text: 'No clear promotions detected', impact: 10, positive: false });
    }

    // Scope increase (company size/tier)
    const companyTiers = experiences.map(e => e.companyClassification?.tier).reverse();
    const tierOrder = { other: 0, CONSULTANCY: 1, FORTUNE500: 2, BIG_TECH: 3, FAANG: 4 };
    let tierGrowth = false;
    for (let i = 1; i < companyTiers.length; i++) {
      if ((tierOrder[companyTiers[i]] || 0) > (tierOrder[companyTiers[i - 1]] || 0)) {
        tierGrowth = true;
        break;
      }
    }

    if (tierGrowth) {
      score += 20;
      signals.push({ text: 'Moved to higher-caliber companies over time', impact: 20, positive: true });
    }

    // Activity signals
    if (profile.activity.articleCount > 0) {
      score += 15;
      signals.push({ text: 'Publishes articles — thought leadership', impact: 15, positive: true });
    }
    if (profile.activity.followerCount > 1000) {
      score += 10;
      signals.push({ text: `${profile.activity.followerCount.toLocaleString()} followers — industry influence`, impact: 10, positive: true });
    }

    // Certifications as growth signal
    if (profile.certifications.length > 0) {
      score += 10;
      signals.push({ text: 'Continued learning via certifications', impact: 10, positive: true });
    }

    return { score: Math.min(100, score), signals, confidence: 0.8 };
  }

  // ─── Main Scoring Function ───
  function scoreCandidate(profileData, roleProfile) {
    const weights = roleProfile.weights || CandidateStorage.DEFAULT_WEIGHTS;

    const categories = {
      roleRelevance: scoreRoleRelevance(profileData, roleProfile),
      experienceDepth: scoreExperienceDepth(profileData, roleProfile),
      companyCaliber: scoreCompanyCaliber(profileData, roleProfile),
      tenureStability: scoreTenureStability(profileData, roleProfile),
      keywordMatch: scoreKeywordMatch(profileData, roleProfile),
      educationFit: scoreEducationFit(profileData, roleProfile),
      certifications: scoreCertifications(profileData, roleProfile),
      recommendations: scoreRecommendations(profileData, roleProfile),
      projectsImpact: scoreProjectsImpact(profileData, roleProfile),
      growthTrajectory: scoreGrowthTrajectory(profileData, roleProfile)
    };

    // Compute weighted overall score
    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    let weightedSum = 0;
    let confidenceSum = 0;

    for (const [key, result] of Object.entries(categories)) {
      const weight = weights[key] || 0;
      weightedSum += result.score * (weight / totalWeight);
      confidenceSum += result.confidence * (weight / totalWeight);
    }

    const overallScore = Math.round(weightedSum);
    const overallConfidence = Math.round(confidenceSum * 100) / 100;

    // Generate top strengths and flags
    const strengths = [];
    const flags = [];

    for (const [key, result] of Object.entries(categories)) {
      for (const signal of result.signals) {
        if (signal.positive && signal.impact >= 20) {
          strengths.push({ category: key, ...signal });
        }
        if (!signal.positive && signal.impact <= -5) {
          flags.push({ category: key, ...signal });
        }
      }
    }

    // Sort by impact
    strengths.sort((a, b) => b.impact - a.impact);
    flags.sort((a, b) => a.impact - b.impact);

    // Add general flags
    if (profileData.metrics.completeness < 0.5) {
      flags.push({ category: 'general', text: 'Incomplete profile — low confidence in scoring', impact: 0, positive: false });
    }
    if (profileData.metrics.jobHopping) {
      flags.push({ category: 'tenure', text: 'Job-hopping pattern detected', impact: -10, positive: false });
    }

    return {
      overallScore,
      overallConfidence,
      categories,
      strengths: strengths.slice(0, 5),
      flags: flags.slice(0, 5),
      profileCompleteness: profileData.metrics.completeness,
      candidateName: profileData.basicInfo.name,
      candidateHeadline: profileData.basicInfo.headline,
      scoredAt: new Date().toISOString()
    };
  }

  // Category display names
  const CATEGORY_LABELS = {
    roleRelevance: 'Role Relevance',
    experienceDepth: 'Experience Depth',
    companyCaliber: 'Company Caliber',
    tenureStability: 'Tenure & Stability',
    keywordMatch: 'Keyword Match',
    educationFit: 'Education Fit',
    certifications: 'Certifications',
    recommendations: 'Recommendations',
    projectsImpact: 'Projects & Impact',
    growthTrajectory: 'Growth Trajectory'
  };

  return {
    scoreCandidate,
    CATEGORY_LABELS,
    detectSeniority,
    fuzzyMatch,
    skillMatch
  };
})();
