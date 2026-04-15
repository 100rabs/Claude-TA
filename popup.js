/**
 * Popup Script — Role Profile Management
 * Supports multiple saved role profiles with dropdown selector.
 */

const WEIGHT_LABELS = {
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

const DEFAULT_WEIGHTS = {
  roleRelevance: 20, experienceDepth: 15, companyCaliber: 10,
  tenureStability: 10, keywordMatch: 15, educationFit: 8,
  certifications: 7, recommendations: 5, projectsImpact: 5, growthTrajectory: 5
};

let allProfiles = [];
let currentProfile = null;
let tagData = { keywords: [], bonusKeywords: [], requiredCerts: [] };

// ─── Init ───
document.addEventListener('DOMContentLoaded', async () => {
  await loadProfiles();
  setupTabs();
  setupTagInputs();
  setupProfileSelector();
  setupSaveHandlers();
  setupDataTab();
});

// ─── Load All Profiles ───
async function loadProfiles() {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ type: 'GET_ALL_ROLE_PROFILES' }, response => {
      allProfiles = response?.profiles || [];
      const activeId = response?.activeId;

      populateProfileDropdown(activeId);

      if (activeId) {
        currentProfile = allProfiles.find(p => p.id === activeId) || allProfiles[0] || null;
      } else {
        currentProfile = allProfiles[0] || null;
      }

      if (currentProfile) {
        populateForm(currentProfile);
      }
      resolve();
    });
  });
}

function populateProfileDropdown(activeId) {
  const select = document.getElementById('profile-select');
  select.innerHTML = '';

  if (allProfiles.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = '— No profiles saved —';
    select.appendChild(opt);
    return;
  }

  for (const p of allProfiles) {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name || p.targetTitle || 'Untitled';
    if (p.id === activeId || p.id === currentProfile?.id) opt.selected = true;
    select.appendChild(opt);
  }
}

function populateForm(profile) {
  if (!profile) return;
  currentProfile = profile;

  document.getElementById('profileName').value = profile.name || '';
  document.getElementById('targetTitle').value = profile.targetTitle || '';
  document.getElementById('seniorityLevel').value = profile.seniorityLevel || 'IC';
  document.getElementById('minYearsExperience').value = profile.minYearsExperience || 0;
  document.getElementById('requiredEducationLevel').value = profile.requiredEducationLevel || 'none';

  tagData.keywords = [...(profile.keywords || [])];
  tagData.bonusKeywords = [...(profile.bonusKeywords || [])];
  tagData.requiredCerts = [...(profile.requiredCertifications || [])];

  renderTags('keywords');
  renderTags('bonusKeywords');
  renderTags('requiredCerts');

  const types = profile.preferredCompanyTypes || [];
  document.querySelectorAll('#companyTypes input').forEach(cb => {
    cb.checked = types.includes(cb.value);
  });

  // Update weight sliders
  const weights = profile.weights || DEFAULT_WEIGHTS;
  for (const [key, val] of Object.entries(weights)) {
    const slider = document.getElementById(`weight-${key}`);
    const valSpan = document.getElementById(`weight-val-${key}`);
    if (slider) { slider.value = val; }
    if (valSpan) { valSpan.textContent = `${val}%`; }
  }
  updateTotalWeight();
}

// ─── Profile Selector ───
function setupProfileSelector() {
  const select = document.getElementById('profile-select');
  const newBtn = document.getElementById('new-profile-btn');
  const delBtn = document.getElementById('delete-profile-btn');

  select.addEventListener('change', () => {
    const id = select.value;
    const profile = allProfiles.find(p => p.id === id);
    if (profile) {
      populateForm(profile);
      chrome.runtime.sendMessage({ type: 'SET_ACTIVE_PROFILE', profileId: id });
    }
  });

  newBtn.addEventListener('click', () => {
    const name = prompt('Enter a name for the new role profile:', 'New Role Profile');
    if (!name) return;

    chrome.runtime.sendMessage({ type: 'CREATE_NEW_PROFILE', name }, response => {
      if (response?.profile) {
        allProfiles.push(response.profile);
        populateProfileDropdown(response.profile.id);
        populateForm(response.profile);
        setupWeightSliders(); // Reset sliders for new profile
        showStatus('role-status', 'success', `Created: "${name}"`);
      }
    });
  });

  delBtn.addEventListener('click', () => {
    if (!currentProfile) return;
    if (allProfiles.length <= 1) {
      showStatus('role-status', 'error', 'Cannot delete the last profile');
      return;
    }
    if (!confirm(`Delete "${currentProfile.name || 'this profile'}"?`)) return;

    chrome.runtime.sendMessage({ type: 'DELETE_PROFILE', profileId: currentProfile.id }, () => {
      allProfiles = allProfiles.filter(p => p.id !== currentProfile.id);
      currentProfile = allProfiles[0] || null;
      populateProfileDropdown(currentProfile?.id);
      if (currentProfile) populateForm(currentProfile);
      showStatus('role-status', 'success', 'Profile deleted');
    });
  });
}

// ─── Tabs ───
function setupTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`panel-${tab.dataset.tab}`).classList.add('active');

      // Initialize weight sliders when weights tab is first opened
      if (tab.dataset.tab === 'weights' && document.getElementById('weights-list').children.length === 0) {
        setupWeightSliders();
      }
    });
  });
  // Init weight sliders
  setupWeightSliders();
}

// ─── Tag Inputs ───
function setupTagInputs() {
  ['keywords', 'bonusKeywords', 'requiredCerts'].forEach(field => {
    const input = document.getElementById(`${field}-input`);
    const container = document.getElementById(`${field}-container`);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const value = input.value.trim().replace(/,$/, '');
        if (value && !tagData[field].includes(value)) {
          tagData[field].push(value);
          renderTags(field);
        }
        input.value = '';
      }
      if (e.key === 'Backspace' && input.value === '' && tagData[field].length > 0) {
        tagData[field].pop();
        renderTags(field);
      }
    });
    container.addEventListener('click', () => input.focus());
  });
}

function renderTags(field) {
  const container = document.getElementById(`${field}-container`);
  const input = document.getElementById(`${field}-input`);
  container.querySelectorAll('.tag').forEach(t => t.remove());
  tagData[field].forEach((tag, idx) => {
    const el = document.createElement('span');
    el.className = 'tag';
    el.innerHTML = `${escapeHtml(tag)} <button class="tag-remove" data-field="${field}" data-idx="${idx}">&times;</button>`;
    container.insertBefore(el, input);
  });
  container.querySelectorAll('.tag-remove').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      tagData[btn.dataset.field].splice(parseInt(btn.dataset.idx), 1);
      renderTags(btn.dataset.field);
    });
  });
}

// ─── Weight Sliders ───
function setupWeightSliders() {
  const weightsList = document.getElementById('weights-list');
  weightsList.innerHTML = '';
  const weights = currentProfile?.weights || DEFAULT_WEIGHTS;

  for (const [key, label] of Object.entries(WEIGHT_LABELS)) {
    const value = weights[key] || 0;
    const row = document.createElement('div');
    row.className = 'weight-row';
    row.innerHTML = `
      <span class="weight-label">${label}</span>
      <input type="range" class="weight-slider" id="weight-${key}" min="0" max="40" value="${value}" data-key="${key}">
      <span class="weight-value" id="weight-val-${key}">${value}%</span>
    `;
    weightsList.appendChild(row);
    row.querySelector('.weight-slider').addEventListener('input', function() {
      row.querySelector('.weight-value').textContent = `${this.value}%`;
      updateTotalWeight();
    });
  }
  updateTotalWeight();
}

function updateTotalWeight() {
  let total = 0;
  document.querySelectorAll('.weight-slider').forEach(s => total += parseInt(s.value));
  const el = document.getElementById('weight-total');
  if (el) {
    el.textContent = `Total: ${total}%`;
    el.classList.toggle('invalid', total !== 100);
  }
}

function getWeightsFromUI() {
  const weights = {};
  document.querySelectorAll('.weight-slider').forEach(s => weights[s.dataset.key] = parseInt(s.value));
  return weights;
}

// ─── Save ───
function setupSaveHandlers() {
  document.getElementById('save-role').addEventListener('click', saveRoleProfile);
  document.getElementById('save-weights').addEventListener('click', saveWeights);
  document.getElementById('rescore-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'RESCORE_ACTIVE' });
  });
}

function saveRoleProfile() {
  const profile = {
    ...(currentProfile || {}),
    name: document.getElementById('profileName').value.trim() || document.getElementById('targetTitle').value.trim() || 'Untitled',
    targetTitle: document.getElementById('targetTitle').value.trim(),
    seniorityLevel: document.getElementById('seniorityLevel').value,
    keywords: tagData.keywords,
    bonusKeywords: tagData.bonusKeywords,
    minYearsExperience: parseInt(document.getElementById('minYearsExperience').value) || 0,
    preferredCompanyTypes: Array.from(document.querySelectorAll('#companyTypes input:checked')).map(cb => cb.value),
    requiredCertifications: tagData.requiredCerts,
    requiredEducationLevel: document.getElementById('requiredEducationLevel').value,
    weights: currentProfile?.weights || DEFAULT_WEIGHTS
  };

  chrome.runtime.sendMessage({ type: 'SAVE_ROLE_PROFILE', profile }, response => {
    if (response?.profile) {
      currentProfile = response.profile;
      // Update in allProfiles
      const idx = allProfiles.findIndex(p => p.id === currentProfile.id);
      if (idx >= 0) allProfiles[idx] = currentProfile;
      else allProfiles.push(currentProfile);
      populateProfileDropdown(currentProfile.id);
    }
    showStatus('role-status', 'success', `Saved: "${profile.name}". LinkedIn profiles will be re-scored.`);
  });
}

function saveWeights() {
  const weights = getWeightsFromUI();
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  if (total !== 100) {
    showStatus('weights-status', 'error', `Weights must total 100% (currently ${total}%)`);
    return;
  }
  if (!currentProfile) return;
  const profile = { ...currentProfile, weights };
  chrome.runtime.sendMessage({ type: 'SAVE_ROLE_PROFILE', profile }, response => {
    if (response?.profile) currentProfile = response.profile;
    showStatus('weights-status', 'success', 'Weights saved!');
  });
}

// ─── Data Tab ───
function setupDataTab() {
  chrome.runtime.sendMessage({ type: 'GET_ALL_CANDIDATES' }, candidates => {
    document.getElementById('stat-scored').textContent = Object.keys(candidates || {}).length;
  });
  chrome.runtime.sendMessage({ type: 'GET_PINNED_COUNT' }, result => {
    document.getElementById('stat-pinned').textContent = result?.count || 0;
  });
  document.getElementById('stat-profiles').textContent = allProfiles.length;

  chrome.storage.local.get('extensionSettings', result => {
    const settings = result.extensionSettings || {};
    document.getElementById('autoScore').checked = settings.autoScore !== false;
    document.getElementById('darkTheme').checked = !!settings.darkTheme;
  });
  document.getElementById('autoScore').addEventListener('change', saveExtSettings);
  document.getElementById('darkTheme').addEventListener('change', saveExtSettings);

  document.getElementById('clear-data').addEventListener('click', () => {
    if (!confirm('Clear all scored candidates, notes, and pinned data? Role profiles will be preserved.')) return;
    // Preserve role profiles & settings
    chrome.storage.local.get(['roleProfiles', 'activeProfileId', 'extensionSettings'], result => {
      chrome.storage.local.clear(() => {
        chrome.storage.local.set(result, () => {
          showStatus('data-status', 'success', 'All candidate data cleared.');
          document.getElementById('stat-scored').textContent = '0';
          document.getElementById('stat-pinned').textContent = '0';
        });
      });
    });
  });
}

function saveExtSettings() {
  chrome.storage.local.set({
    extensionSettings: {
      autoScore: document.getElementById('autoScore').checked,
      darkTheme: document.getElementById('darkTheme').checked
    }
  });
}

// ─── Utilities ───
function showStatus(id, type, message) {
  const el = document.getElementById(id);
  el.className = `status ${type}`;
  el.textContent = message;
  setTimeout(() => { el.className = 'status'; }, 3000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
