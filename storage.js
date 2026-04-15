/**
 * RecruiterKeys — Storage Module
 * Wraps chrome.storage.local with typed getters/setters for all extension data.
 */
const RKStorage = (() => {

  const DEFAULTS = {
    roleProfiles: [],
    activeRoleId: null,
    globalTone: 'professional',
    triggerKey: '/',
    signature: '',
    companyName: '',
    companyDescription: '',
    companyEVP: '',
    customShortcuts: [],
    savedSnippets: [],
    candidateNotes: {},
    pipelineData: {},
    recentMessages: [],
    settings: {
      showSuggestions: true,
      defaultChannel: 'email',
      includeSignature: true,
      feedbackInRejections: false,
      maxRecentMessages: 50
    }
  };

  async function get(key) {
    return new Promise(resolve => {
      chrome.storage.local.get(key, result => {
        if (typeof key === 'string') {
          resolve(result[key] !== undefined ? result[key] : DEFAULTS[key]);
        } else {
          const merged = {};
          for (const k of key) {
            merged[k] = result[k] !== undefined ? result[k] : DEFAULTS[k];
          }
          resolve(merged);
        }
      });
    });
  }

  async function set(data) {
    return new Promise(resolve => {
      chrome.storage.local.set(data, resolve);
    });
  }

  async function getAll() {
    return new Promise(resolve => {
      chrome.storage.local.get(null, result => {
        const merged = { ...DEFAULTS, ...result };
        resolve(merged);
      });
    });
  }

  // Role Profile CRUD
  async function getRoleProfiles() {
    return await get('roleProfiles') || [];
  }

  async function saveRoleProfile(profile) {
    const profiles = await getRoleProfiles();
    const idx = profiles.findIndex(p => p.id === profile.id);
    if (idx >= 0) {
      profiles[idx] = { ...profiles[idx], ...profile, updatedAt: Date.now() };
    } else {
      profile.id = profile.id || `role_${Date.now()}`;
      profile.createdAt = Date.now();
      profile.updatedAt = Date.now();
      profiles.push(profile);
    }
    await set({ roleProfiles: profiles });
    return profile;
  }

  async function deleteRoleProfile(id) {
    const profiles = await getRoleProfiles();
    await set({ roleProfiles: profiles.filter(p => p.id !== id) });
  }

  async function getActiveRole() {
    const { roleProfiles, activeRoleId } = await get(['roleProfiles', 'activeRoleId']);
    if (!activeRoleId || !roleProfiles) return null;
    return roleProfiles.find(p => p.id === activeRoleId) || null;
  }

  async function setActiveRole(id) {
    await set({ activeRoleId: id });
  }

  // Candidate Notes
  async function getCandidateNote(candidateKey) {
    const notes = await get('candidateNotes') || {};
    return notes[candidateKey] || null;
  }

  async function saveCandidateNote(candidateKey, note) {
    const notes = await get('candidateNotes') || {};
    notes[candidateKey] = { ...note, updatedAt: Date.now() };
    await set({ candidateNotes: notes });
  }

  // Pipeline Tracking
  async function getPipelineEntry(candidateKey) {
    const pipeline = await get('pipelineData') || {};
    return pipeline[candidateKey] || null;
  }

  async function updatePipeline(candidateKey, stage, metadata = {}) {
    const pipeline = await get('pipelineData') || {};
    pipeline[candidateKey] = {
      stage,
      ...metadata,
      lastMessageType: metadata.lastMessageType || null,
      lastMessageAt: Date.now(),
      history: [...(pipeline[candidateKey]?.history || []), { stage, at: Date.now() }]
    };
    await set({ pipelineData: pipeline });
  }

  // Recent Messages
  async function addRecentMessage(message) {
    const settings = await get('settings');
    let recent = await get('recentMessages') || [];
    recent.unshift({ ...message, createdAt: Date.now() });
    recent = recent.slice(0, settings.maxRecentMessages || 50);
    await set({ recentMessages: recent });
  }

  // Custom Shortcuts
  async function getCustomShortcuts() {
    return await get('customShortcuts') || [];
  }

  async function saveCustomShortcut(shortcut) {
    const shortcuts = await getCustomShortcuts();
    const idx = shortcuts.findIndex(s => s.command === shortcut.command);
    if (idx >= 0) {
      shortcuts[idx] = shortcut;
    } else {
      shortcuts.push(shortcut);
    }
    await set({ customShortcuts: shortcuts });
  }

  // Saved Snippets
  async function getSavedSnippets() {
    return await get('savedSnippets') || [];
  }

  async function saveSnippet(snippet) {
    const snippets = await getSavedSnippets();
    snippet.id = snippet.id || `snip_${Date.now()}`;
    snippet.savedAt = Date.now();
    snippets.push(snippet);
    await set({ savedSnippets: snippets });
  }

  // Export / Import
  async function exportAll() {
    return await getAll();
  }

  async function importAll(data) {
    await set(data);
  }

  return {
    get, set, getAll,
    getRoleProfiles, saveRoleProfile, deleteRoleProfile,
    getActiveRole, setActiveRole,
    getCandidateNote, saveCandidateNote,
    getPipelineEntry, updatePipeline,
    addRecentMessage,
    getCustomShortcuts, saveCustomShortcut,
    getSavedSnippets, saveSnippet,
    exportAll, importAll,
    DEFAULTS
  };
})();

// Make available globally for content scripts
if (typeof window !== 'undefined') {
  window.RKStorage = RKStorage;
}
