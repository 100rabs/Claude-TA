/**
 * UI Components Module
 * Builds DOM elements for the scoring overlay panel.
 */
const UIComponents = (() => {

  function getScoreColor(score) {
    if (score >= 75) return 'green';
    if (score >= 50) return 'yellow';
    return 'red';
  }

  function createGaugeSVG(score) {
    const color = getScoreColor(score);
    const colorMap = { green: '#057642', yellow: '#b47a04', red: '#cc1016' };
    const circumference = 2 * Math.PI * 48;
    const offset = circumference - (score / 100) * circumference;

    return `
      <svg class="lcs-gauge-svg" viewBox="0 0 120 120">
        <circle class="lcs-gauge-bg" cx="60" cy="60" r="48" />
        <circle class="lcs-gauge-fill" cx="60" cy="60" r="48"
          stroke="${colorMap[color]}"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${offset}" />
      </svg>
      <div class="lcs-gauge-score lcs-score-${color}">${score}</div>
    `;
  }

  function createCategoryBar(key, label, result, weight) {
    const score = result.score;
    const color = getScoreColor(score);

    const div = document.createElement('div');
    div.className = 'lcs-category-item';
    div.dataset.category = key;
    div.innerHTML = `
      <div class="lcs-category-row">
        <span class="lcs-category-name">${label} <span style="opacity:0.5;font-size:10px">(${weight}%)</span></span>
        <span class="lcs-category-score lcs-score-${color}">${score}</span>
      </div>
      <div class="lcs-category-bar">
        <div class="lcs-category-bar-fill lcs-bar-${color}" style="width: 0%"></div>
      </div>
      <div class="lcs-signals-popup" id="lcs-signals-${key}">
        ${result.signals.map(s => `
          <div class="lcs-signal-item">
            <span class="lcs-signal-icon ${s.positive ? 'lcs-signal-positive' : 'lcs-signal-negative'}">
              ${s.positive ? '+' : '-'}
            </span>
            <span>${escapeHtml(s.text)}</span>
          </div>
        `).join('')}
      </div>
    `;

    // Animate bar after render
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        div.querySelector('.lcs-category-bar-fill').style.width = `${score}%`;
      });
    });

    // Toggle signals on click
    div.addEventListener('click', (e) => {
      e.stopPropagation();
      const popup = div.querySelector('.lcs-signals-popup');
      const isVisible = popup.classList.contains('lcs-visible');

      // Close all other popups
      document.querySelectorAll('.lcs-signals-popup.lcs-visible').forEach(p => p.classList.remove('lcs-visible'));

      if (!isVisible) popup.classList.add('lcs-visible');
    });

    return div;
  }

  function createHighlightItem(item, type) {
    const div = document.createElement('div');
    div.className = 'lcs-highlight-item';
    const icon = type === 'strength' ? '+' : '!';
    const textClass = type === 'strength' ? 'lcs-strength-text' : 'lcs-flag-text';

    div.innerHTML = `
      <span class="lcs-highlight-icon ${textClass}">${icon}</span>
      <span class="${textClass}">${escapeHtml(item.text)}</span>
    `;
    return div;
  }

  function buildPanel(scoreResult, profileData, isPinned, settings) {
    const isDark = settings?.darkTheme;

    const panel = document.createElement('div');
    panel.id = 'lcs-panel';
    if (isDark) panel.classList.add('lcs-dark');
    if (settings?.collapsed) panel.classList.add('lcs-collapsed');

    const color = getScoreColor(scoreResult.overallScore);

    panel.innerHTML = `
      <div class="lcs-panel-header">
        <span class="lcs-panel-header-title">Candidate Scorer</span>
        <div class="lcs-panel-header-content">
          <div class="lcs-panel-header-actions">
            <button class="lcs-header-btn lcs-theme-btn" id="lcs-theme-toggle" title="Toggle theme">
              ${isDark ? 'L' : 'D'}
            </button>
            <button class="lcs-header-btn" id="lcs-collapse-toggle" title="Collapse">_</button>
          </div>
        </div>
      </div>

      <div class="lcs-panel-body">
        <!-- Score Gauge -->
        <div class="lcs-gauge-section">
          <div class="lcs-gauge-container">
            ${createGaugeSVG(scoreResult.overallScore)}
          </div>
          <div class="lcs-gauge-label">Overall Score</div>
          <div class="lcs-candidate-name">${escapeHtml(scoreResult.candidateName || 'Unknown')}</div>
          <div class="lcs-candidate-headline">${escapeHtml(scoreResult.candidateHeadline || '')}</div>
          <div class="lcs-confidence">Confidence: ${Math.round(scoreResult.overallConfidence * 100)}% · Profile completeness: ${Math.round(scoreResult.profileCompleteness * 100)}%</div>
          <button class="lcs-pin-btn ${isPinned ? 'lcs-pinned' : ''}" id="lcs-pin-btn">
            ${isPinned ? 'Pinned' : 'Pin for Compare'}
          </button>
          <br>
          <button class="lcs-rescore-btn" id="lcs-rescore-btn">Re-score</button>
        </div>

        <!-- Category Breakdown -->
        <div class="lcs-categories-section">
          <div class="lcs-section-title">Score Breakdown</div>
          <div id="lcs-categories-list"></div>
        </div>

        <!-- Strengths -->
        ${scoreResult.strengths.length > 0 ? `
        <div class="lcs-highlights-section">
          <div class="lcs-section-title">Key Strengths</div>
          <div id="lcs-strengths-list"></div>
        </div>` : ''}

        <!-- Flags -->
        ${scoreResult.flags.length > 0 ? `
        <div class="lcs-highlights-section">
          <div class="lcs-section-title">Flags & Risks</div>
          <div id="lcs-flags-list"></div>
        </div>` : ''}

        <!-- Notes -->
        <div class="lcs-notes-section">
          <div class="lcs-section-title">Quick Notes</div>
          <textarea class="lcs-notes-textarea" id="lcs-notes" placeholder="Add notes about this candidate..."></textarea>
          <div class="lcs-notes-saved" id="lcs-notes-saved">Saved</div>
        </div>

        <!-- Compare -->
        <div class="lcs-compare-section">
          <button class="lcs-compare-btn" id="lcs-compare-btn">
            Compare Pinned Candidates
            <span class="lcs-compare-count" id="lcs-compare-count" style="display:none">0</span>
          </button>
        </div>
      </div>
    `;

    return panel;
  }

  function buildLoadingPanel() {
    const panel = document.createElement('div');
    panel.id = 'lcs-panel';
    panel.innerHTML = `
      <div class="lcs-panel-header">
        <span class="lcs-panel-header-title">Candidate Scorer</span>
        <div class="lcs-panel-header-content">
          <div class="lcs-panel-header-actions">
            <button class="lcs-header-btn" id="lcs-collapse-toggle" title="Collapse">_</button>
          </div>
        </div>
      </div>
      <div class="lcs-panel-body">
        <div class="lcs-loading">
          <div class="lcs-spinner"></div>
          <div class="lcs-loading-text">Analyzing profile...</div>
        </div>
      </div>
    `;
    return panel;
  }

  function buildNoConfigPanel() {
    const panel = document.createElement('div');
    panel.id = 'lcs-panel';
    panel.innerHTML = `
      <div class="lcs-panel-header">
        <span class="lcs-panel-header-title">Candidate Scorer</span>
        <div class="lcs-panel-header-content">
          <div class="lcs-panel-header-actions">
            <button class="lcs-header-btn" id="lcs-collapse-toggle" title="Collapse">_</button>
          </div>
        </div>
      </div>
      <div class="lcs-panel-body">
        <div class="lcs-no-config">
          <p>Configure a target role to start scoring candidates.</p>
          <p>Click the extension icon in your toolbar to set up your role profile, required skills, and scoring weights.</p>
          <button class="lcs-config-btn" id="lcs-open-settings">Open Settings</button>
        </div>
      </div>
    `;
    return panel;
  }

  function buildComparisonModal(candidatesData, roleProfile) {
    const modal = document.createElement('div');
    modal.id = 'lcs-comparison-modal';
    modal.className = 'lcs-visible';

    const categories = Object.keys(ScoringEngine.CATEGORY_LABELS);
    const candidates = Object.values(candidatesData);

    modal.innerHTML = `
      <div class="lcs-comparison-container">
        <div class="lcs-comparison-header">
          <span class="lcs-comparison-title">Candidate Comparison (${candidates.length})</span>
          <button class="lcs-comparison-close" id="lcs-comparison-close">&times;</button>
        </div>
        <table class="lcs-comparison-table">
          <thead>
            <tr>
              <th>Criteria</th>
              ${candidates.map(c => `
                <th>
                  ${escapeHtml(c.scoreResult?.candidateName || 'Unknown')}
                  <br><button class="lcs-comparison-unpin" data-url="${escapeHtml(c.url)}">Unpin</button>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            <tr class="lcs-comparison-overall">
              <td>Overall Score</td>
              ${candidates.map(c => {
                const s = c.scoreResult?.overallScore || 0;
                return `<td class="lcs-score-${getScoreColor(s)}">${s}</td>`;
              }).join('')}
            </tr>
            ${categories.map(cat => `
              <tr>
                <td>${ScoringEngine.CATEGORY_LABELS[cat]}</td>
                ${candidates.map(c => {
                  const s = c.scoreResult?.categories?.[cat]?.score || 0;
                  return `<td class="lcs-score-${getScoreColor(s)}">${s}</td>`;
                }).join('')}
              </tr>
            `).join('')}
            <tr>
              <td>Confidence</td>
              ${candidates.map(c => `<td>${Math.round((c.scoreResult?.overallConfidence || 0) * 100)}%</td>`).join('')}
            </tr>
          </tbody>
        </table>
      </div>
    `;

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    return modal;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  return {
    buildPanel,
    buildLoadingPanel,
    buildNoConfigPanel,
    buildComparisonModal,
    createCategoryBar,
    createHighlightItem,
    getScoreColor,
    escapeHtml
  };
})();
