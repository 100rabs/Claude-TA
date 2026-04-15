/**
 * Storage Module
 * Handles chrome.storage.local for role profiles (multiple saved),
 * candidate scores, notes, pinned candidates, and settings.
 */
const CandidateStorage = (() => {
  const KEYS = {
    ROLE_PROFILES: 'roleProfiles',      // Array of saved profiles
    ACTIVE_PROFILE_ID: 'activeProfileId', // ID of currently active profile
    CANDIDATES: 'candidates',
    PINNED: 'pinnedCandidates',
    SETTINGS: 'extensionSettings'
  };

  // Legacy key for migration
  const LEGACY_ROLE_KEY = 'roleProfile';

  const DEFAULT_WEIGHTS = {
    roleRelevance: 20, experienceDepth: 15, companyCaliber: 10,
    tenureStability: 10, keywordMatch: 15, educationFit: 8,
    certifications: 7, recommendations: 5, projectsImpact: 5, growthTrajectory: 5
  };

  const DEFAULT_SETTINGS = {
    darkTheme: false, autoScore: true, overlayPosition: 'right', collapsed: false
  };

  function generateId() {
    return 'rp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  }

  function createBlankProfile(name) {
    return {
      id: generateId(),
      name: name || 'New Role Profile',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      targetTitle: '',
      seniorityLevel: 'IC',
      keywords: [],
      bonusKeywords: [],
      minYearsExperience: 0,
      preferredIndustries: [],
      preferredCompanyTypes: [],
      requiredCertifications: [],
      requiredEducationLevel: 'none',
      weights: { ...DEFAULT_WEIGHTS }
    };
  }

  function get(key) {
    return new Promise(resolve => {
      chrome.storage.local.get(key, result => resolve(result[key]));
    });
  }

  function set(key, value) {
    return new Promise(resolve => {
      chrome.storage.local.set({ [key]: value }, resolve);
    });
  }

  // ─── Multi-Profile Management ───

  /** Migrate legacy single profile to new multi-profile format */
  async function migrateIfNeeded() {
    const profiles = await get(KEYS.ROLE_PROFILES);
    if (profiles && profiles.length > 0) return; // Already migrated

    const legacy = await get(LEGACY_ROLE_KEY);
    if (legacy) {
      const migrated = {
        ...createBlankProfile(legacy.targetTitle || 'Migrated Profile'),
        ...legacy,
        id: generateId()
      };
      await set(KEYS.ROLE_PROFILES, [migrated]);
      await set(KEYS.ACTIVE_PROFILE_ID, migrated.id);
      console.log('[LCS] Migrated legacy role profile:', migrated.name);
    }
  }

  async function getAllRoleProfiles() {
    await migrateIfNeeded();
    return (await get(KEYS.ROLE_PROFILES)) || [];
  }

  async function getActiveProfileId() {
    return (await get(KEYS.ACTIVE_PROFILE_ID)) || null;
  }

  async function getRoleProfile() {
    const profiles = await getAllRoleProfiles();
    const activeId = await getActiveProfileId();

    if (activeId) {
      const active = profiles.find(p => p.id === activeId);
      if (active) return active;
    }
    // Return first profile or a blank default
    if (profiles.length > 0) return profiles[0];
    return createBlankProfile('Default');
  }

  async function saveRoleProfile(profile) {
    const profiles = await getAllRoleProfiles();
    profile.updatedAt = new Date().toISOString();

    const idx = profiles.findIndex(p => p.id === profile.id);
    if (idx >= 0) {
      profiles[idx] = profile;
    } else {
      if (!profile.id) profile.id = generateId();
      profiles.push(profile);
    }

    await set(KEYS.ROLE_PROFILES, profiles);
    await set(KEYS.ACTIVE_PROFILE_ID, profile.id);
    return profile;
  }

  async function deleteRoleProfile(profileId) {
    let profiles = await getAllRoleProfiles();
    profiles = profiles.filter(p => p.id !== profileId);
    await set(KEYS.ROLE_PROFILES, profiles);

    const activeId = await getActiveProfileId();
    if (activeId === profileId) {
      await set(KEYS.ACTIVE_PROFILE_ID, profiles.length > 0 ? profiles[0].id : null);
    }
  }

  async function setActiveProfile(profileId) {
    await set(KEYS.ACTIVE_PROFILE_ID, profileId);
  }

  async function createNewProfile(name) {
    const profile = createBlankProfile(name || 'New Role Profile');
    const profiles = await getAllRoleProfiles();
    profiles.push(profile);
    await set(KEYS.ROLE_PROFILES, profiles);
    await set(KEYS.ACTIVE_PROFILE_ID, profile.id);
    return profile;
  }

  // ─── Candidate Data ───

  async function getCandidateData(profileUrl) {
    const candidates = (await get(KEYS.CANDIDATES)) || {};
    return candidates[profileUrl] || null;
  }

  async function saveCandidateData(profileUrl, data) {
    const candidates = (await get(KEYS.CANDIDATES)) || {};
    candidates[profileUrl] = { ...data, url: profileUrl, lastScored: new Date().toISOString() };
    await set(KEYS.CANDIDATES, candidates);
  }

  async function getAllCandidates() {
    return (await get(KEYS.CANDIDATES)) || {};
  }

  async function saveNote(profileUrl, note) {
    const candidates = (await get(KEYS.CANDIDATES)) || {};
    if (candidates[profileUrl]) {
      candidates[profileUrl].notes = note;
      await set(KEYS.CANDIDATES, candidates);
    }
  }

  // ─── Pinned Candidates ───

  async function getPinnedCandidates() {
    return (await get(KEYS.PINNED)) || [];
  }

  async function pinCandidate(profileUrl) {
    const pinned = await getPinnedCandidates();
    if (!pinned.includes(profileUrl)) { pinned.push(profileUrl); await set(KEYS.PINNED, pinned); }
  }

  async function unpinCandidate(profileUrl) {
    let pinned = await getPinnedCandidates();
    pinned = pinned.filter(url => url !== profileUrl);
    await set(KEYS.PINNED, pinned);
  }

  async function isPinned(profileUrl) {
    const pinned = await getPinnedCandidates();
    return pinned.includes(profileUrl);
  }

  // ─── Settings ───

  async function getSettings() {
    return (await get(KEYS.SETTINGS)) || { ...DEFAULT_SETTINGS };
  }

  async function saveSettings(settings) {
    await set(KEYS.SETTINGS, settings);
  }

  async function clearAllData() {
    return new Promise(resolve => chrome.storage.local.clear(resolve));
  }

  return {
    // Multi-profile
    getAllRoleProfiles, getRoleProfile, saveRoleProfile,
    deleteRoleProfile, setActiveProfile, createNewProfile,
    getActiveProfileId, createBlankProfile,
    // Candidates
    getCandidateData, saveCandidateData, getAllCandidates, saveNote,
    // Pinned
    getPinnedCandidates, pinCandidate, unpinCandidate, isPinned,
    // Settings
    getSettings, saveSettings, clearAllData,
    // Constants
    DEFAULT_WEIGHTS, DEFAULT_SETTINGS
  };
})();
