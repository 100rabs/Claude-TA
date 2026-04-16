/**
 * Service Worker (Background Script)
 * Handles message routing for multi-profile storage and tab coordination.
 */

function generateId() {
  return 'rp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

function getDefaultWeights() {
  return {
    roleRelevance: 20, experienceDepth: 15, companyCaliber: 10,
    tenureStability: 10, keywordMatch: 15, educationFit: 8,
    certifications: 7, recommendations: 5, projectsImpact: 5, growthTrajectory: 5
  };
}

function notifyLinkedInTabs() {
  chrome.tabs.query({ url: 'https://www.linkedin.com/in/*' }, tabs => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, { type: 'SETTINGS_UPDATED' }).catch(() => {});
    });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {

    case 'GET_ALL_ROLE_PROFILES': {
      chrome.storage.local.get(['roleProfiles', 'activeProfileId', 'roleProfile'], result => {
        let profiles = result.roleProfiles || [];
        let activeId = result.activeProfileId || null;

        // Migrate legacy single profile
        if (profiles.length === 0 && result.roleProfile) {
          const legacy = result.roleProfile;
          const migrated = {
            id: generateId(),
            name: legacy.targetTitle || 'Migrated Profile',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...legacy,
            weights: legacy.weights || getDefaultWeights()
          };
          profiles = [migrated];
          activeId = migrated.id;
          chrome.storage.local.set({ roleProfiles: profiles, activeProfileId: activeId });
        }

        sendResponse({ profiles, activeId });
      });
      return true;
    }

    case 'GET_ROLE_PROFILE': {
      chrome.storage.local.get(['roleProfiles', 'activeProfileId', 'roleProfile'], result => {
        let profiles = result.roleProfiles || [];
        let activeId = result.activeProfileId;

        // Migration
        if (profiles.length === 0 && result.roleProfile) {
          const legacy = result.roleProfile;
          const migrated = {
            id: generateId(), name: legacy.targetTitle || 'Default',
            ...legacy, weights: legacy.weights || getDefaultWeights()
          };
          profiles = [migrated];
          activeId = migrated.id;
          chrome.storage.local.set({ roleProfiles: profiles, activeProfileId: activeId });
        }

        const active = profiles.find(p => p.id === activeId) || profiles[0] || {
          id: '', name: '', targetTitle: '', seniorityLevel: 'IC',
          keywords: [], bonusKeywords: [], minYearsExperience: 0,
          preferredCompanyTypes: [], requiredCertifications: [],
          requiredEducationLevel: 'none', weights: getDefaultWeights()
        };
        sendResponse(active);
      });
      return true;
    }

    case 'SAVE_ROLE_PROFILE': {
      const profile = message.profile;
      chrome.storage.local.get('roleProfiles', result => {
        let profiles = result.roleProfiles || [];
        profile.updatedAt = new Date().toISOString();

        if (!profile.id) profile.id = generateId();
        if (!profile.createdAt) profile.createdAt = new Date().toISOString();

        const idx = profiles.findIndex(p => p.id === profile.id);
        if (idx >= 0) profiles[idx] = profile;
        else profiles.push(profile);

        chrome.storage.local.set({
          roleProfiles: profiles,
          activeProfileId: profile.id
        }, () => {
          notifyLinkedInTabs();
          sendResponse({ ok: true, profile });
        });
      });
      return true;
    }

    case 'SET_ACTIVE_PROFILE': {
      chrome.storage.local.set({ activeProfileId: message.profileId }, () => {
        notifyLinkedInTabs();
        sendResponse({ ok: true });
      });
      return true;
    }

    case 'CREATE_NEW_PROFILE': {
      const profile = {
        id: generateId(),
        name: message.name || 'New Role Profile',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        targetTitle: '', seniorityLevel: 'IC',
        keywords: [], bonusKeywords: [],
        minYearsExperience: 0, preferredCompanyTypes: [],
        requiredCertifications: [], requiredEducationLevel: 'none',
        weights: getDefaultWeights()
      };
      chrome.storage.local.get('roleProfiles', result => {
        const profiles = result.roleProfiles || [];
        profiles.push(profile);
        chrome.storage.local.set({
          roleProfiles: profiles,
          activeProfileId: profile.id
        }, () => sendResponse({ ok: true, profile }));
      });
      return true;
    }

    case 'DELETE_PROFILE': {
      chrome.storage.local.get(['roleProfiles', 'activeProfileId'], result => {
        let profiles = (result.roleProfiles || []).filter(p => p.id !== message.profileId);
        const updates = { roleProfiles: profiles };
        if (result.activeProfileId === message.profileId) {
          updates.activeProfileId = profiles.length > 0 ? profiles[0].id : null;
        }
        chrome.storage.local.set(updates, () => {
          notifyLinkedInTabs();
          sendResponse({ ok: true });
        });
      });
      return true;
    }

    case 'GET_PINNED_COUNT': {
      chrome.storage.local.get('pinnedCandidates', result => {
        sendResponse({ count: (result.pinnedCandidates || []).length });
      });
      return true;
    }

    case 'GET_ALL_CANDIDATES': {
      chrome.storage.local.get('candidates', result => {
        sendResponse(result.candidates || {});
      });
      return true;
    }

    case 'RESCORE_ACTIVE': {
      chrome.tabs.query({ active: true, currentWindow: true, url: 'https://www.linkedin.com/in/*' }, tabs => {
        if (tabs.length > 0) chrome.tabs.sendMessage(tabs[0].id, { type: 'RESCORE' }).catch(() => {});
        sendResponse({ ok: true });
      });
      return true;
    }

    case 'CLEAR_ALL_DATA': {
      chrome.storage.local.clear(() => sendResponse({ ok: true }));
      return true;
    }
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeBackgroundColor({ color: '#0a66c2' });
});

chrome.storage.onChanged.addListener(changes => {
  if (changes.roleProfiles) {
    const profiles = changes.roleProfiles.newValue || [];
    const hasConfig = profiles.some(p => p.targetTitle);
    chrome.action.setBadgeText({ text: hasConfig ? '' : '!' });
  }
});
