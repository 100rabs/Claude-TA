/**
 * Overlay Controller
 * Manages the lifecycle of the scoring panel on LinkedIn profile pages.
 */
const OverlayController = (() => {
  let currentPanel = null;
  let currentModal = null;
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };

  function removeExisting() {
    const existing = document.getElementById('lcs-panel');
    if (existing) existing.remove();
    currentPanel = null;
  }

  function removeModal() {
    const existing = document.getElementById('lcs-comparison-modal');
    if (existing) existing.remove();
    currentModal = null;
  }

  function showLoading() {
    removeExisting();
    const panel = UIComponents.buildLoadingPanel();
    document.body.appendChild(panel);
    currentPanel = panel;
    setupCollapse(panel);
    setupDrag(panel);
  }

  function showNoConfig() {
    removeExisting();
    const panel = UIComponents.buildNoConfigPanel();
    document.body.appendChild(panel);
    currentPanel = panel;
    setupCollapse(panel);
    setupDrag(panel);

    const openBtn = panel.querySelector('#lcs-open-settings');
    if (openBtn) {
      openBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
      });
    }
  }

  async function showScorePanel(scoreResult, profileData) {
    removeExisting();

    const profileUrl = getProfileUrl();
    const isPinned = await CandidateStorage.isPinned(profileUrl);
    const settings = await CandidateStorage.getSettings();

    const panel = UIComponents.buildPanel(scoreResult, profileData, isPinned, settings);
    document.body.appendChild(panel);
    currentPanel = panel;

    // Populate categories
    const categoriesList = panel.querySelector('#lcs-categories-list');
    if (categoriesList) {
      const roleProfile = await CandidateStorage.getRoleProfile();
      const weights = roleProfile.weights || CandidateStorage.DEFAULT_WEIGHTS;

      for (const [key, label] of Object.entries(ScoringEngine.CATEGORY_LABELS)) {
        const result = scoreResult.categories[key];
        if (result) {
          const bar = UIComponents.createCategoryBar(key, label, result, weights[key]);
          categoriesList.appendChild(bar);
        }
      }
    }

    // Populate strengths
    const strengthsList = panel.querySelector('#lcs-strengths-list');
    if (strengthsList) {
      scoreResult.strengths.forEach(s => {
        strengthsList.appendChild(UIComponents.createHighlightItem(s, 'strength'));
      });
    }

    // Populate flags
    const flagsList = panel.querySelector('#lcs-flags-list');
    if (flagsList) {
      scoreResult.flags.forEach(f => {
        flagsList.appendChild(UIComponents.createHighlightItem(f, 'flag'));
      });
    }

    // Load saved notes
    const notesEl = panel.querySelector('#lcs-notes');
    const savedIndicator = panel.querySelector('#lcs-notes-saved');
    const candidateData = await CandidateStorage.getCandidateData(profileUrl);
    if (candidateData?.notes && notesEl) {
      notesEl.value = candidateData.notes;
    }

    // Notes auto-save
    let noteTimer = null;
    if (notesEl) {
      notesEl.addEventListener('input', () => {
        clearTimeout(noteTimer);
        noteTimer = setTimeout(async () => {
          await CandidateStorage.saveNote(profileUrl, notesEl.value);
          if (savedIndicator) {
            savedIndicator.classList.add('lcs-visible');
            setTimeout(() => savedIndicator.classList.remove('lcs-visible'), 1500);
          }
        }, 800);
      });
    }

    // Pin button
    const pinBtn = panel.querySelector('#lcs-pin-btn');
    if (pinBtn) {
      pinBtn.addEventListener('click', async () => {
        const pinned = await CandidateStorage.isPinned(profileUrl);
        if (pinned) {
          await CandidateStorage.unpinCandidate(profileUrl);
          pinBtn.classList.remove('lcs-pinned');
          pinBtn.textContent = 'Pin for Compare';
        } else {
          await CandidateStorage.pinCandidate(profileUrl);
          pinBtn.classList.add('lcs-pinned');
          pinBtn.textContent = 'Pinned';
        }
        updateCompareCount();
      });
    }

    // Re-score button
    const rescoreBtn = panel.querySelector('#lcs-rescore-btn');
    if (rescoreBtn) {
      rescoreBtn.addEventListener('click', () => {
        if (typeof window.runScoring === 'function') {
          window.runScoring();
        }
      });
    }

    // Compare button
    const compareBtn = panel.querySelector('#lcs-compare-btn');
    if (compareBtn) {
      compareBtn.addEventListener('click', showComparison);
    }

    // Theme toggle
    const themeBtn = panel.querySelector('#lcs-theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', async () => {
        const s = await CandidateStorage.getSettings();
        s.darkTheme = !s.darkTheme;
        await CandidateStorage.saveSettings(s);
        panel.classList.toggle('lcs-dark');
        themeBtn.textContent = s.darkTheme ? 'L' : 'D';
      });
    }

    setupCollapse(panel);
    setupDrag(panel);
    updateCompareCount();

    // Close signal popups on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.lcs-category-item')) {
        document.querySelectorAll('.lcs-signals-popup.lcs-visible').forEach(p => p.classList.remove('lcs-visible'));
      }
    });
  }

  async function showComparison() {
    removeModal();

    const pinnedUrls = await CandidateStorage.getPinnedCandidates();
    if (pinnedUrls.length === 0) {
      alert('No candidates pinned yet. Pin candidates to compare them.');
      return;
    }

    const candidatesData = {};
    for (const url of pinnedUrls) {
      const data = await CandidateStorage.getCandidateData(url);
      if (data) candidatesData[url] = data;
    }

    if (Object.keys(candidatesData).length === 0) {
      alert('No scored data found for pinned candidates. Visit their profiles first.');
      return;
    }

    const roleProfile = await CandidateStorage.getRoleProfile();
    const modal = UIComponents.buildComparisonModal(candidatesData, roleProfile);
    document.body.appendChild(modal);
    currentModal = modal;

    // Close button
    const closeBtn = modal.querySelector('#lcs-comparison-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => modal.remove());
    }

    // Unpin buttons
    modal.querySelectorAll('.lcs-comparison-unpin').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const url = e.target.dataset.url;
        await CandidateStorage.unpinCandidate(url);
        showComparison(); // Rebuild
        updateCompareCount();
      });
    });
  }

  async function updateCompareCount() {
    const pinned = await CandidateStorage.getPinnedCandidates();
    const countEl = document.querySelector('#lcs-compare-count');
    if (countEl) {
      countEl.textContent = pinned.length;
      countEl.style.display = pinned.length > 0 ? 'inline-flex' : 'none';
    }
  }

  function setupCollapse(panel) {
    const collapseBtn = panel.querySelector('#lcs-collapse-toggle');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const isCollapsed = panel.classList.toggle('lcs-collapsed');
        const settings = await CandidateStorage.getSettings();
        settings.collapsed = isCollapsed;
        await CandidateStorage.saveSettings(settings);
      });
    }

    // Click collapsed panel to expand
    panel.addEventListener('click', async (e) => {
      if (panel.classList.contains('lcs-collapsed') && !e.target.closest('.lcs-header-btn')) {
        panel.classList.remove('lcs-collapsed');
        const settings = await CandidateStorage.getSettings();
        settings.collapsed = false;
        await CandidateStorage.saveSettings(settings);
      }
    });
  }

  function setupDrag(panel) {
    const header = panel.querySelector('.lcs-panel-header');
    if (!header) return;

    header.addEventListener('mousedown', (e) => {
      if (e.target.closest('.lcs-header-btn')) return;
      isDragging = true;
      const rect = panel.getBoundingClientRect();
      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const x = e.clientX - dragOffset.x;
      const y = e.clientY - dragOffset.y;
      panel.style.left = `${x}px`;
      panel.style.top = `${y}px`;
      panel.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      document.body.style.userSelect = '';
    });
  }

  function getProfileUrl() {
    return window.location.href.split('?')[0].replace(/\/$/, '');
  }

  return {
    showLoading,
    showNoConfig,
    showScorePanel,
    showComparison,
    removeExisting,
    getProfileUrl
  };
})();
