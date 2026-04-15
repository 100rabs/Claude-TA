/**
 * RecruiterKeys — Personalization Engine
 * Handles tag replacement, candidate context detection, and tone adaptation.
 */
const RKPersonalization = (() => {

  // All supported tags with their source mappings
  const TAGS = {
    '{candidate_name}':     (c) => c.name || '',
    '{candidate_company}':  (c) => c.company || '',
    '{candidate_title}':    (c) => c.title || '',
    '{role_title}':         (_, r) => r.title || '',
    '{company_name}':       (_, r) => r.companyName || '',
    '{hiring_manager}':     (_, r) => r.hiringManager || '',
    '{interview_date}':     (_, r) => r.interviewDate || '[DATE]',
    '{interview_time}':     (_, r) => r.interviewTime || '[TIME]',
    '{interviewer_name}':   (_, r) => r.interviewerName || '[INTERVIEWER]',
    '{office_address}':     (_, r) => r.officeAddress || '[ADDRESS]',
    '{scheduling_link}':    (_, r) => r.schedulingLink || '[SCHEDULING LINK]',
    '{offer_deadline}':     (_, r) => r.offerDeadline || '[DEADLINE]',
    '{start_date}':         (_, r) => r.startDate || '[START DATE]',
    '{signature}':          (_, r, s) => s || '',
    '{mutual_connection}':  (c) => c.mutualConnection || '[MUTUAL CONNECTION]',
    '{time_slot_1}':        () => '[TIME OPTION 1]',
    '{time_slot_2}':        () => '[TIME OPTION 2]',
    '{time_slot_3}':        () => '[TIME OPTION 3]',
  };

  /**
   * Replace all {tags} in a message with actual values.
   */
  function applyTags(message, candidate = {}, role = {}, signature = '') {
    let result = message;
    for (const [tag, resolver] of Object.entries(TAGS)) {
      const value = resolver(candidate, role, signature);
      result = result.split(tag).join(value || tag);
    }
    // Also handle any remaining {placeholder} tags - highlight them
    result = result.replace(/\{([^}]+)\}/g, (match, key) => {
      // Keep unresolved tags visible for manual editing
      return match;
    });
    return result;
  }

  /**
   * Extract editable fields (unresolved tags) from a message.
   */
  function getEditableFields(message) {
    const fields = [];
    const regex = /\{([^}]+)\}/g;
    let match;
    while ((match = regex.exec(message)) !== null) {
      if (!fields.includes(match[1])) {
        fields.push(match[1]);
      }
    }
    return fields;
  }

  /**
   * Try to detect candidate info from the current page (LinkedIn, etc).
   */
  function detectCandidateFromPage() {
    const candidate = {};
    const url = window.location.href;

    // LinkedIn profile detection
    if (url.includes('linkedin.com/in/')) {
      try {
        // Name from title
        const title = document.title;
        if (title && title.includes(' | LinkedIn')) {
          const parts = title.replace(' | LinkedIn', '').split(' - ');
          candidate.name = parts[0]?.trim();
          if (parts[1]) candidate.title = parts[1]?.trim();
        }

        // Try to get from visible elements
        const h1 = document.querySelector('h1');
        if (h1) candidate.name = h1.textContent.trim();

        // Current position
        const headline = document.querySelector('.text-body-medium');
        if (headline) candidate.title = headline.textContent.trim();

        // Location
        const location = document.querySelector('.text-body-small.inline');
        if (location) candidate.location = location.textContent.trim();

        // Current company from experience section
        const expSection = document.querySelector('#experience');
        if (expSection) {
          const firstRole = expSection.closest('section')?.querySelector('.display-flex.align-items-center');
          if (firstRole) {
            const companyEl = firstRole.querySelector('.t-normal');
            if (companyEl) candidate.company = companyEl.textContent.trim();
          }
        }
      } catch (e) {
        console.log('RecruiterKeys: LinkedIn detection partial', e);
      }
    }

    return candidate;
  }

  /**
   * Build full candidate context by merging detected + stored + manual data.
   */
  async function buildCandidateContext(manualOverrides = {}) {
    const detected = detectCandidateFromPage();
    const candidateKey = detected.name || manualOverrides.name || 'unknown';

    let stored = {};
    try {
      stored = await RKStorage.getCandidateNote(candidateKey) || {};
    } catch (e) { /* ignore if storage not available */ }

    return {
      ...detected,
      ...stored,
      ...manualOverrides,
    };
  }

  /**
   * Build role context from active role profile + overrides.
   */
  async function buildRoleContext(overrides = {}) {
    let activeRole = {};
    try {
      activeRole = await RKStorage.getActiveRole() || {};
    } catch (e) { /* ignore */ }

    const settings = await RKStorage.get(['companyName', 'companyDescription', 'companyEVP', 'signature']);

    return {
      companyName: settings.companyName,
      companyDescription: settings.companyDescription,
      evp: settings.companyEVP,
      ...activeRole,
      ...overrides,
    };
  }

  /**
   * Get signature block.
   */
  async function getSignature() {
    return await RKStorage.get('signature') || '';
  }

  return {
    TAGS,
    applyTags,
    getEditableFields,
    detectCandidateFromPage,
    buildCandidateContext,
    buildRoleContext,
    getSignature,
  };
})();

if (typeof window !== 'undefined') {
  window.RKPersonalization = RKPersonalization;
}
