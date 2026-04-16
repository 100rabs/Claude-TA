/**
 * Content Script — Entry Point
 * Runs on linkedin.com/in/* pages.
 * Orchestrates: wait → scroll to load lazy sections → parse → score → render.
 */
(async function main() {
  if (window.__lcsInitialized) return;
  window.__lcsInitialized = true;

  let currentUrl = OverlayController.getProfileUrl();

  async function runScoring() {
    const profileUrl = OverlayController.getProfileUrl();
    console.log('[LCS] Starting scoring for:', profileUrl);

    // Show loading state
    OverlayController.showLoading();

    // Wait for initial profile load (name in title)
    const loaded = await ProfileParser.waitForProfile(8000);
    console.log('[LCS] Initial load:', loaded);

    // Get role profile
    const roleProfile = await CandidateStorage.getRoleProfile();
    if (!roleProfile.targetTitle && (roleProfile.keywords || []).length === 0) {
      OverlayController.showNoConfig();
      return;
    }

    // CRITICAL: Scroll the page to force LinkedIn to lazy-load
    // Experience, Education, Skills, and other sections
    await ProfileParser.scrollToLoadAllSections();

    // Now parse the profile (all sections should be in DOM)
    const profileData = ProfileParser.parseFullProfile();

    // Score
    const scoreResult = ScoringEngine.scoreCandidate(profileData, roleProfile);
    console.log('[LCS] Final score:', scoreResult.overallScore,
      '| Name:', scoreResult.candidateName);

    // Save
    await CandidateStorage.saveCandidateData(profileUrl, {
      profileData, scoreResult, url: profileUrl
    });

    // Render
    await OverlayController.showScorePanel(scoreResult, profileData);
  }

  window.runScoring = runScoring;

  // Listen for messages from popup/background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'RESCORE' || message.type === 'SETTINGS_UPDATED') {
      runScoring();
      sendResponse({ ok: true });
    }
  });

  // SPA navigation detection
  let navDebounce = null;
  const observer = new MutationObserver(() => {
    const newUrl = OverlayController.getProfileUrl();
    if (newUrl !== currentUrl && newUrl.includes('/in/')) {
      currentUrl = newUrl;
      clearTimeout(navDebounce);
      navDebounce = setTimeout(() => {
        console.log('[LCS] SPA navigation detected:', newUrl);
        runScoring();
      }, 2000);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('popstate', () => {
    const newUrl = OverlayController.getProfileUrl();
    if (newUrl !== currentUrl && newUrl.includes('/in/')) {
      currentUrl = newUrl;
      setTimeout(runScoring, 2000);
    }
  });

  // Initial run
  const settings = await CandidateStorage.getSettings();
  if (settings.autoScore !== false) {
    runScoring();
  }
})();
