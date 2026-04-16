/**
 * RecruiterKeys — Command Palette (Raycast-style)
 * Floating, keyboard-navigable palette that appears on shortcut trigger.
 */
const RKPalette = (() => {

  let overlayEl = null;
  let paletteEl = null;
  let previewEl = null;
  let searchInput = null;
  let resultsContainer = null;
  let selectedIndex = 0;
  let filteredItems = [];
  let isOpen = false;
  let isPreviewOpen = false;
  let activeTextField = null;
  let currentTone = 'professional';
  let currentChannel = 'email';
  let candidateContext = {};
  let roleContext = {};
  let signature = '';
  let allRoleProfiles = [];
  let activeRoleId = null;
  let roleDropdownEl = null;
  let roleFormEl = null;
  let isRoleDropdownOpen = false;
  let isRoleFormOpen = false;

  const TONES = [
    { id: 'professional',  label: 'Professional' },
    { id: 'conversational', label: 'Conversational' },
    { id: 'bold',           label: 'Bold' },
    { id: 'executive',      label: 'Executive' },
    { id: 'empathetic',     label: 'Empathetic' },
  ];

  // ─── Build the palette DOM ─────────────────────────────────────────
  function build() {
    // Determine which document to attach to.
    // If we're inside an iframe, try to use the top-level document for the overlay.
    // If cross-origin blocks access, fall back to the current iframe's document.
    let targetDoc = document;
    try {
      if (window !== window.top && window.top.document) {
        targetDoc = window.top.document;
      }
    } catch (e) {
      // Cross-origin iframe — use local document
      targetDoc = document;
    }

    // Remove any existing palette first (check both documents)
    [document, targetDoc].forEach(doc => {
      try {
        const existing = doc.getElementById('rk-palette-overlay');
        if (existing) existing.remove();
        const existingPalette = doc.getElementById('rk-palette');
        if (existingPalette) existingPalette.remove();
        const existingPreview = doc.getElementById('rk-preview');
        if (existingPreview) existingPreview.remove();
      } catch (e) {}
    });

    // Get channel list safely
    let channelButtons = '';
    try {
      channelButtons = RKChannelFormatter.CHANNELS.map(ch =>
        `<button class="rk-option-btn rk-channel-opt rk-channel-btn" data-channel="${ch.id}">${ch.icon} ${ch.label}</button>`
      ).join('');
    } catch (e) {
      channelButtons = `
        <button class="rk-option-btn rk-channel-opt rk-channel-btn" data-channel="email">✉️ Email</button>
        <button class="rk-option-btn rk-channel-opt rk-channel-btn" data-channel="inmail">💼 InMail</button>
        <button class="rk-option-btn rk-channel-opt rk-channel-btn" data-channel="linkedin">💬 LinkedIn</button>
        <button class="rk-option-btn rk-channel-opt rk-channel-btn" data-channel="whatsapp">📱 WhatsApp</button>
        <button class="rk-option-btn rk-channel-opt rk-channel-btn" data-channel="ats">📝 ATS</button>
      `;
    }

    // Overlay
    overlayEl = document.createElement('div');
    overlayEl.id = 'rk-palette-overlay';
    overlayEl.addEventListener('click', (e) => {
      e.stopPropagation();
      close();
    });

    // Palette
    paletteEl = document.createElement('div');
    paletteEl.id = 'rk-palette';
    paletteEl.innerHTML = `
      <div class="rk-search-bar">
        <span class="rk-search-icon">⌘</span>
        <input class="rk-search-input" type="text" placeholder="Type a command or search messages..." autocomplete="off" spellcheck="false" />
        <div class="rk-search-meta">
          <span class="rk-meta-badge rk-role-badge" title="Click to select role">📋 No Role</span>
          <span class="rk-meta-badge rk-tone-badge" title="Click to change tone">Professional</span>
          <span class="rk-meta-badge rk-channel rk-channel-badge" title="Click to change channel">✉️ Email</span>
        </div>
      </div>
      <div class="rk-suggestions-bar" style="display: none;"></div>
      <div class="rk-results"></div>
      <div class="rk-footer">
        <div class="rk-footer-keys">
          <span class="rk-key"><kbd>↑↓</kbd> navigate</span>
          <span class="rk-key"><kbd>↵</kbd> select</span>
          <span class="rk-key"><kbd>Tab</kbd> tone</span>
          <span class="rk-key"><kbd>Esc</kbd> close</span>
        </div>
        <span>RecruiterKeys</span>
      </div>
    `;

    // Preview panel
    previewEl = document.createElement('div');
    previewEl.id = 'rk-preview';
    previewEl.innerHTML = `
      <div class="rk-preview-header">
        <span class="rk-preview-title"></span>
        <div class="rk-preview-controls">
          <button class="rk-preview-btn rk-btn-save rk-btn-save-snippet">Save as Snippet</button>
          <button class="rk-preview-btn rk-btn-secondary rk-btn-back">← Back</button>
          <button class="rk-preview-btn rk-btn-primary rk-btn-insert">Insert ↵</button>
        </div>
      </div>
      <div class="rk-preview-options">
        <div class="rk-option-group">
          <span class="rk-option-label">Tone</span>
          ${TONES.map(t => `<button class="rk-option-btn rk-tone-opt" data-tone="${t.id}">${t.label}</button>`).join('')}
        </div>
        <div class="rk-option-group" style="margin-left: auto;">
          <span class="rk-option-label">Channel</span>
          ${channelButtons}
        </div>
      </div>
      <div class="rk-subject-row">
        <span class="rk-subject-label">Subject:</span>
        <input class="rk-subject-input" type="text" placeholder="Email subject line..." />
      </div>
      <div class="rk-context-bar">
        <span class="rk-context-label">Candidate:</span>
      </div>
      <div class="rk-preview-editor">
        <textarea class="rk-editor-textarea" placeholder="Your message will appear here..."></textarea>
      </div>
      <div class="rk-field-pills"></div>
      <div class="rk-preview-footer">
        <span class="rk-char-count"></span>
        <div class="rk-preview-controls">
          <button class="rk-preview-btn rk-btn-secondary rk-btn-copy">Copy to Clipboard</button>
          <button class="rk-preview-btn rk-btn-primary rk-btn-insert2">Insert into Field</button>
        </div>
      </div>
    `;

    // Inject the palette CSS into the target document if it's different from ours
    if (targetDoc !== document) {
      try {
        if (!targetDoc.getElementById('rk-palette-styles')) {
          const link = targetDoc.createElement('link');
          link.id = 'rk-palette-styles';
          link.rel = 'stylesheet';
          link.href = chrome.runtime.getURL('src/content/palette.css');
          targetDoc.head.appendChild(link);
        }
      } catch (e) {
        console.log('RK: Could not inject CSS into top frame', e);
      }
    }

    (targetDoc.body || document.body).appendChild(overlayEl);
    (targetDoc.body || document.body).appendChild(paletteEl);
    (targetDoc.body || document.body).appendChild(previewEl);

    // References
    searchInput = paletteEl.querySelector('.rk-search-input');
    resultsContainer = paletteEl.querySelector('.rk-results');

    // ─── Event Listeners ─────────────────────────────────────────────

    // Search input
    searchInput.addEventListener('input', onSearchInput);
    searchInput.addEventListener('keydown', onKeyDown);

    // Stop propagation on palette clicks
    paletteEl.addEventListener('click', e => e.stopPropagation());
    previewEl.addEventListener('click', e => e.stopPropagation());

    // Stop the palette's own keystrokes from reaching the page
    paletteEl.addEventListener('keydown', e => e.stopPropagation());
    previewEl.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closePreview();
      }
      e.stopPropagation();
    });

    // Role badge click — opens role dropdown
    paletteEl.querySelector('.rk-role-badge').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleRoleDropdown();
    });

    // Tone badge cycling
    paletteEl.querySelector('.rk-tone-badge').addEventListener('click', cycleTone);
    paletteEl.querySelector('.rk-channel-badge').addEventListener('click', cycleChannel);

    // Preview controls
    previewEl.querySelector('.rk-btn-back').addEventListener('click', closePreview);
    previewEl.querySelector('.rk-btn-insert').addEventListener('click', insertMessage);
    previewEl.querySelector('.rk-btn-insert2').addEventListener('click', insertMessage);
    previewEl.querySelector('.rk-btn-copy').addEventListener('click', copyMessage);
    previewEl.querySelector('.rk-btn-save-snippet').addEventListener('click', saveAsSnippet);

    // Tone options in preview
    previewEl.querySelectorAll('.rk-tone-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        currentTone = btn.dataset.tone;
        updateToneUI();
        regeneratePreview();
      });
    });

    // Channel options in preview
    previewEl.querySelectorAll('.rk-channel-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        currentChannel = btn.dataset.channel;
        updateChannelUI();
        regeneratePreview();
      });
    });

    // Textarea char count
    const textarea = previewEl.querySelector('.rk-editor-textarea');
    textarea.addEventListener('input', () => {
      updateCharCount(textarea.value);
    });

    console.log('RK: Palette DOM built');
  }

  function updateCharCount(text) {
    const el = previewEl.querySelector('.rk-char-count');
    if (el) {
      el.textContent = `${text.length} chars · ${text.split(/\s+/).filter(Boolean).length} words`;
    }
  }

  // ─── Open / Close ──────────────────────────────────────────────────
  async function open(textField = null) {
    // Set isOpen IMMEDIATELY to prevent race conditions with MutationObserver
    // and input fallback listener double-firing during async context loading
    if (isOpen) return; // Already open — prevent double-open race
    isOpen = true;
    console.log('RK: Opening palette...');
    build();
    activeTextField = textField;

    // Load context — wrapped in try/catch so palette ALWAYS opens
    try {
      const tone = await RKStorage.get('globalTone');
      if (tone) currentTone = tone;
    } catch (e) {
      console.log('RK: Could not load tone setting', e);
    }

    try {
      currentChannel = RKChannelFormatter.detectChannel();
    } catch (e) {
      currentChannel = 'email';
    }

    try {
      candidateContext = await RKPersonalization.buildCandidateContext();
    } catch (e) {
      candidateContext = {};
    }

    // Load role profiles and active role
    try {
      allRoleProfiles = await RKStorage.getRoleProfiles();
      activeRoleId = (await RKStorage.get('activeRoleId')) || null;
      if (activeRoleId) {
        const activeRole = allRoleProfiles.find(r => r.id === activeRoleId);
        if (activeRole) {
          roleContext = { ...activeRole };
        } else {
          // Active role was deleted — fall back
          roleContext = await RKPersonalization.buildRoleContext();
        }
      } else {
        roleContext = await RKPersonalization.buildRoleContext();
      }
    } catch (e) {
      roleContext = {};
    }

    try {
      signature = await RKPersonalization.getSignature();
    } catch (e) {
      signature = '';
    }

    updateToneUI();
    updateChannelUI();
    updateRoleUI();
    loadSuggestions();

    // Render all message shortcuts
    searchInput.value = '';
    renderResults('');
    selectedIndex = 0;
    updateSelection();

    // Show the palette
    overlayEl.classList.add('rk-visible');
    paletteEl.classList.add('rk-visible');
    isPreviewOpen = false;

    // Focus search input after CSS transition
    setTimeout(() => {
      if (searchInput) searchInput.focus();
      console.log('RK: Palette opened, search focused');
    }, 50);
  }

  function close() {
    if (!isOpen) return;
    console.log('RK: Closing palette');
    closeRoleDropdown();
    closeRoleForm();
    overlayEl.classList.remove('rk-visible');
    paletteEl.classList.remove('rk-visible');
    previewEl.classList.remove('rk-visible');
    isOpen = false;
    isPreviewOpen = false;

    // Return focus to text field
    if (activeTextField) {
      try { activeTextField.focus(); } catch (e) {}
    }
  }

  function isVisible() {
    return isOpen;
  }

  // ─── Smart Suggestions ─────────────────────────────────────────────
  async function loadSuggestions() {
    const bar = paletteEl.querySelector('.rk-suggestions-bar');
    // Default suggestions (always show these)
    let suggestions = ['/outreach', '/screen-invite', '/int-schedule', '/offer-formal', '/welcome-email'];

    try {
      const candidateKey = candidateContext.name || null;
      if (candidateKey) {
        const pipeline = await RKStorage.getPipelineEntry(candidateKey);
        if (pipeline) {
          const timeSince = Date.now() - (pipeline.lastMessageAt || 0);
          const smart = RKTemplates.suggestNext(pipeline, timeSince);
          if (smart.length) suggestions = smart;
        }
      }
    } catch (e) {
      // Use defaults
    }

    bar.style.display = 'flex';
    bar.innerHTML = `<span style="font-size:10px;color:rgba(255,255,255,0.3);align-self:center;margin-right:4px;">Suggested:</span>` +
      suggestions.map(cmd => {
        const s = RKTemplates.findShortcut(cmd);
        return s ? `<span class="rk-suggestion-chip" data-command="${cmd}">${s.label}</span>` : '';
      }).filter(Boolean).join('');

    bar.querySelectorAll('.rk-suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        selectCommand(chip.dataset.command);
      });
    });
  }

  // ─── Search & Render ───────────────────────────────────────────────
  function onSearchInput() {
    const query = searchInput.value.trim();
    renderResults(query);
    selectedIndex = 0;
    updateSelection();
  }

  function renderResults(query) {
    filteredItems = [];

    if (query) {
      // Search mode — filter shortcuts matching query
      const cleanQuery = query.replace(/^\//, '');
      const shortcuts = RKTemplates.searchShortcuts(cleanQuery);
      filteredItems = shortcuts;

      if (!shortcuts.length) {
        resultsContainer.innerHTML = `
          <div class="rk-empty-state">
            <div class="rk-empty-icon">🔍</div>
            <div class="rk-empty-text">No commands found for "${cleanQuery}"</div>
            <div class="rk-empty-hint">Try a different search term</div>
          </div>`;
        return;
      }

      resultsContainer.innerHTML = shortcuts.map((s, i) => renderItem(s, i)).join('');
    } else {
      // Browse mode — show ALL shortcuts grouped by stage
      const stages = RKTemplates.getStages();
      let html = '';
      let idx = 0;

      for (const stage of stages) {
        const items = RKTemplates.getShortcutsByStage(stage.id);
        if (!items.length) continue;

        html += `<div class="rk-stage-group">
          <div class="rk-stage-header">${stage.icon} ${stage.label}</div>`;

        for (const item of items) {
          filteredItems.push(item);
          html += renderItem(item, idx);
          idx++;
        }

        html += `</div>`;
      }

      if (!html) {
        html = `<div class="rk-empty-state">
          <div class="rk-empty-icon">📭</div>
          <div class="rk-empty-text">No message templates loaded</div>
        </div>`;
      }

      resultsContainer.innerHTML = html;
    }

    // Bind click and hover handlers to all result items
    resultsContainer.querySelectorAll('.rk-result-item').forEach((el) => {
      const idx = parseInt(el.dataset.index, 10);
      el.addEventListener('click', () => {
        selectedIndex = idx;
        selectCurrent();
      });
      el.addEventListener('mouseenter', () => {
        selectedIndex = idx;
        updateSelection();
      });
    });

    console.log(`RK: Rendered ${filteredItems.length} results`);
  }

  function renderItem(shortcut, index) {
    const stages = RKTemplates.getStages();
    const stage = stages.find(s => s.id === shortcut.stage);
    return `<div class="rk-result-item" data-index="${index}" data-command="${shortcut.command}">
      <span class="rk-result-icon">${stage?.icon || '📄'}</span>
      <div class="rk-result-content">
        <div class="rk-result-label">${shortcut.label}</div>
        <div class="rk-result-desc">${shortcut.description}</div>
      </div>
      <span class="rk-result-shortcut">${shortcut.command}</span>
    </div>`;
  }

  // ─── Keyboard Navigation ───────────────────────────────────────────
  function onKeyDown(e) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (filteredItems.length > 0) {
          selectedIndex = Math.min(selectedIndex + 1, filteredItems.length - 1);
          updateSelection();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        updateSelection();
        break;
      case 'Enter':
        e.preventDefault();
        selectCurrent();
        break;
      case 'Escape':
        e.preventDefault();
        if (isPreviewOpen) {
          closePreview();
        } else {
          close();
        }
        break;
      case 'Tab':
        e.preventDefault();
        cycleTone();
        break;
    }
  }

  function updateSelection() {
    resultsContainer.querySelectorAll('.rk-result-item').forEach((el) => {
      const idx = parseInt(el.dataset.index, 10);
      el.classList.toggle('rk-selected', idx === selectedIndex);
    });
    // Scroll selected into view
    const selected = resultsContainer.querySelector('.rk-selected');
    if (selected) {
      selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  // ─── Select & Preview ──────────────────────────────────────────────
  let currentCommand = null;

  function selectCurrent() {
    if (!filteredItems[selectedIndex]) return;
    selectCommand(filteredItems[selectedIndex].command);
  }

  function selectCommand(command) {
    currentCommand = command;
    const shortcut = RKTemplates.findShortcut(command);
    if (!shortcut) {
      console.log('RK: Shortcut not found:', command);
      return;
    }

    // Generate message
    let message = '';
    try {
      message = RKTemplates.generateMessage(command, candidateContext, roleContext, currentTone);
    } catch (e) {
      console.log('RK: Message generation error', e);
      message = `[Error generating message for ${command}]`;
    }

    if (!message) {
      console.log('RK: Empty message for', command);
      return;
    }

    // Apply tone transformation (post-processes for tones that templates don't natively handle)
    try {
      message = RKTemplates.transformTone(message, currentTone);
    } catch (e) {
      // Use untransformed message
    }

    // Apply personalization tags
    try {
      message = RKPersonalization.applyTags(message, candidateContext, roleContext, signature);
    } catch (e) {
      // Use raw message if personalization fails
    }

    // Format for channel
    try {
      message = RKChannelFormatter.formatForChannel(message, currentChannel, {
        candidateName: candidateContext.name || '',
        shortcutUsed: shortcut.label,
      });
    } catch (e) {
      // Use unformatted message
    }

    showPreview(shortcut, message);
  }

  function showPreview(shortcut, message) {
    // Show preview first, then hide palette after current event finishes.
    // IMPORTANT: We defer palette hiding because removing rk-visible sets
    // pointer-events: none on the palette. If done synchronously during a
    // click event, the click "falls through" the now-transparent palette
    // to the overlay behind it, which calls close() and kills everything.
    previewEl.classList.add('rk-visible');
    isPreviewOpen = true;
    setTimeout(() => {
      paletteEl.classList.remove('rk-visible');
    }, 0);

    // Title
    previewEl.querySelector('.rk-preview-title').textContent = shortcut.label;

    // Subject line (email only)
    const subjectRow = previewEl.querySelector('.rk-subject-row');
    if (currentChannel === 'email') {
      subjectRow.classList.add('rk-visible');
      try {
        let subject = RKChannelFormatter.extractSubject(message, shortcut.label);
        subject = RKPersonalization.applyTags(subject, candidateContext, roleContext, signature);
        previewEl.querySelector('.rk-subject-input').value = subject;
      } catch (e) {
        previewEl.querySelector('.rk-subject-input').value = shortcut.label;
      }
    } else {
      subjectRow.classList.remove('rk-visible');
    }

    // Candidate context chips
    const contextBar = previewEl.querySelector('.rk-context-bar');
    const contextFields = ['name', 'company', 'title', 'location'];
    contextBar.innerHTML = `<span class="rk-context-label">Candidate:</span>` +
      contextFields.map(f => {
        const val = candidateContext[f];
        return `<span class="rk-context-chip ${val ? 'rk-has-value' : ''}" data-field="${f}">${val || f}</span>`;
      }).join('');

    // Message editor
    const textarea = previewEl.querySelector('.rk-editor-textarea');
    textarea.value = message;
    updateCharCount(message);

    // Editable fields (unresolved tags)
    try {
      const fields = RKPersonalization.getEditableFields(message);
      const pillsContainer = previewEl.querySelector('.rk-field-pills');
      if (fields.length) {
        pillsContainer.innerHTML = `<span style="font-size:10px;color:rgba(255,255,255,0.3);align-self:center;margin-right:4px;">Fill in:</span>` +
          fields.map(f => `<span class="rk-field-pill" data-field="${f}">{${f}}</span>`).join('');
        pillsContainer.querySelectorAll('.rk-field-pill').forEach(pill => {
          pill.addEventListener('click', () => {
            const tag = `{${pill.dataset.field}}`;
            const idx = textarea.value.indexOf(tag);
            if (idx >= 0) {
              textarea.focus();
              textarea.setSelectionRange(idx, idx + tag.length);
            }
          });
        });
      } else {
        pillsContainer.innerHTML = '';
      }
    } catch (e) {}

    // Update tone/channel buttons
    updateToneUI();
    updateChannelUI();

    // Focus textarea
    setTimeout(() => textarea.focus(), 50);
  }

  function closePreview() {
    previewEl.classList.remove('rk-visible');
    paletteEl.classList.add('rk-visible');
    isPreviewOpen = false;
    setTimeout(() => searchInput.focus(), 50);
  }

  function regeneratePreview() {
    if (!currentCommand) return;
    const shortcut = RKTemplates.findShortcut(currentCommand);
    if (!shortcut) return;

    let message = '';
    try {
      message = RKTemplates.generateMessage(currentCommand, candidateContext, roleContext, currentTone);
      message = RKTemplates.transformTone(message, currentTone);
      message = RKPersonalization.applyTags(message, candidateContext, roleContext, signature);
      message = RKChannelFormatter.formatForChannel(message, currentChannel, {
        candidateName: candidateContext.name || '',
        shortcutUsed: shortcut.label,
      });
    } catch (e) {
      return; // Keep current message if regeneration fails
    }

    const textarea = previewEl.querySelector('.rk-editor-textarea');
    textarea.value = message;

    // Update subject
    if (currentChannel === 'email') {
      previewEl.querySelector('.rk-subject-row').classList.add('rk-visible');
      try {
        let subject = RKChannelFormatter.extractSubject(message, shortcut.label);
        previewEl.querySelector('.rk-subject-input').value = RKPersonalization.applyTags(subject, candidateContext, roleContext, signature);
      } catch (e) {}
    } else {
      previewEl.querySelector('.rk-subject-row').classList.remove('rk-visible');
    }

    // Update fields & count
    try {
      const fields = RKPersonalization.getEditableFields(message);
      const pillsContainer = previewEl.querySelector('.rk-field-pills');
      if (fields.length) {
        pillsContainer.innerHTML = `<span style="font-size:10px;color:rgba(255,255,255,0.3);align-self:center;margin-right:4px;">Fill in:</span>` +
          fields.map(f => `<span class="rk-field-pill" data-field="${f}">{${f}}</span>`).join('');
      } else {
        pillsContainer.innerHTML = '';
      }
    } catch (e) {}
    updateCharCount(message);
  }

  // ─── Actions ───────────────────────────────────────────────────────
  function insertMessage() {
    const message = previewEl.querySelector('.rk-editor-textarea').value;
    if (!message) return;

    // Always re-find the field on sites that aggressively re-render DOM
    // (LinkedIn, WhatsApp frameworks replace DOM nodes while palette is open)
    let targetField = activeTextField;
    const host = window.location.hostname;
    const needsRefresh = host.includes('linkedin.com') || host.includes('web.whatsapp.com');

    if (!targetField || !document.contains(targetField) || needsRefresh) {
      console.log('RK: Re-finding target field...');
      let freshField = null;
      if (host.includes('linkedin.com')) {
        freshField = document.querySelector('.msg-form__contenteditable[contenteditable="true"]');
      } else if (host.includes('web.whatsapp.com')) {
        freshField = document.querySelector('[role="textbox"][contenteditable="true"][data-tab="10"]');
      }
      // Generic fallback
      if (!freshField) {
        freshField = document.querySelector('[role="textbox"][contenteditable="true"]')
                  || document.querySelector('textarea:focus')
                  || document.querySelector('[contenteditable="true"]:not([class*="rk-"])');
      }
      if (freshField) {
        targetField = freshField;
        console.log('RK: Found fresh field:', targetField.tagName, targetField.className?.toString().substring(0, 40));
      }
    }

    if (targetField) {
      insertIntoField(targetField, message);
    } else {
      console.log('RK: No target field found, copying to clipboard');
      copyToClipboard(message);
    }

    trackMessage(message);
    close();
  }

  function insertIntoField(field, text) {
    try {
      if (field.tagName === 'TEXTAREA' || (field.tagName === 'INPUT' && field.type === 'text')) {
        field.focus();
        field.value = '';
        const execWorked = document.execCommand('insertText', false, text);
        if (!execWorked || !field.value) {
          field.value = text;
          // Only manually dispatch if we had to set .value directly
          // (execCommand already fires native events when it works)
          field.dispatchEvent(new Event('input', { bubbles: true }));
          field.dispatchEvent(new Event('change', { bubbles: true }));
        }
      } else if (field.isContentEditable) {
        field.focus();

        // Detect if this is a Lexical/React-based editor (WhatsApp, etc.)
        // These frameworks manage their own state and need special handling
        const isLexical = !!(field.closest && field.closest('.lexical-rich-text-input'));
        const isWhatsApp = window.location.hostname.includes('web.whatsapp.com');

        if (isLexical || isWhatsApp) {
          // Lexical editors: use clipboard paste approach for reliable insertion
          // 1. Select all existing content
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(field);
          selection.removeAllRanges();
          selection.addRange(range);

          // 2. Delete any existing content
          document.execCommand('delete', false, null);

          // 3. Insert text line-by-line to properly handle newlines
          // Lexical handles 'insertText' via execCommand
          const lines = text.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (i > 0) {
              // Insert line break via Enter key simulation for Lexical
              document.execCommand('insertParagraph', false, null);
            }
            if (lines[i]) {
              document.execCommand('insertText', false, lines[i]);
            }
          }

          // NOTE: Do NOT manually dispatch InputEvent here.
          // execCommand('insertText') already fires native input events.
          // Dispatching a second one causes frameworks (Ember, Lexical) to
          // process the text twice, resulting in double-typed messages.

          console.log('RK: Inserted via Lexical-compatible method');
        } else {
          // Standard contentEditable (LinkedIn, Gmail, etc.)
          // First clear existing content, then insert fresh
          const selection = window.getSelection();
          const range = document.createRange();

          // Clear the field
          range.selectNodeContents(field);
          selection.removeAllRanges();
          selection.addRange(range);
          document.execCommand('delete', false, null);

          // Try insertText first (works better with React/Ember frameworks)
          const lines = text.split('\n');
          let inserted = false;
          try {
            for (let i = 0; i < lines.length; i++) {
              if (i > 0) {
                document.execCommand('insertParagraph', false, null);
              }
              if (lines[i]) {
                document.execCommand('insertText', false, lines[i]);
              }
            }
            inserted = field.textContent.trim().length > 0;
          } catch (e) {}

          // Fallback to insertHTML if insertText didn't work
          if (!inserted) {
            const html = text.replace(/\n/g, '<br>');
            document.execCommand('insertHTML', false, html);
          }

          // NOTE: Do NOT manually dispatch InputEvent here.
          // execCommand already fires native input events.
          // A second dispatch causes double-typing on LinkedIn/Gmail.
          console.log('RK: Inserted into contentEditable field');
        }
      } else {
        copyToClipboard(text);
        return;
      }
      showToast('Message inserted!', 'success');
    } catch (e) {
      console.log('RK: Insert error, copying instead', e);
      copyToClipboard(text);
    }
  }

  function copyMessage() {
    const message = previewEl.querySelector('.rk-editor-textarea').value;
    copyToClipboard(message);
    trackMessage(message);
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard!', 'success');
    }).catch(() => {
      // Fallback for contexts where clipboard API isn't available
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      showToast('Copied to clipboard!', 'success');
    });
  }

  async function saveAsSnippet() {
    const message = previewEl.querySelector('.rk-editor-textarea').value;
    const shortcut = RKTemplates.findShortcut(currentCommand);
    try {
      await RKStorage.saveSnippet({
        command: currentCommand,
        label: shortcut?.label || 'Custom Message',
        content: message,
        tone: currentTone,
        channel: currentChannel,
      });
      showToast('Saved as snippet!', 'success');
    } catch (e) {
      showToast('Could not save snippet', 'info');
    }
  }

  async function trackMessage(message) {
    const candidateKey = candidateContext.name;
    if (!candidateKey) return;
    try {
      await RKStorage.updatePipeline(candidateKey, (currentCommand || '').replace('/', '') || 'unknown', {
        lastMessageType: currentCommand,
      });
      await RKStorage.addRecentMessage({
        command: currentCommand,
        candidate: candidateKey,
        channel: currentChannel,
        tone: currentTone,
        preview: message.substring(0, 100),
      });
    } catch (e) {}
  }

  // ─── Tone & Channel Cycling ────────────────────────────────────────
  function cycleTone() {
    const toneIds = TONES.map(t => t.id);
    const idx = toneIds.indexOf(currentTone);
    currentTone = toneIds[(idx + 1) % toneIds.length];
    updateToneUI();
    if (isPreviewOpen) regeneratePreview();
  }

  function cycleChannel() {
    const channelIds = ['email', 'inmail', 'linkedin', 'whatsapp', 'ats'];
    const idx = channelIds.indexOf(currentChannel);
    currentChannel = channelIds[(idx + 1) % channelIds.length];
    updateChannelUI();
    if (isPreviewOpen) regeneratePreview();
  }

  function updateToneUI() {
    // Palette badge
    const badge = paletteEl?.querySelector('.rk-tone-badge');
    if (badge) {
      const t = TONES.find(t => t.id === currentTone);
      badge.textContent = t?.label || 'Professional';
    }
    // Preview buttons
    previewEl?.querySelectorAll('.rk-tone-opt').forEach(btn => {
      btn.classList.toggle('rk-active', btn.dataset.tone === currentTone);
    });
  }

  function updateChannelUI() {
    const channelMap = {
      email: '✉️ Email',
      inmail: '💼 InMail',
      linkedin: '💬 LinkedIn',
      whatsapp: '📱 WhatsApp',
      ats: '📝 ATS',
    };
    const badge = paletteEl?.querySelector('.rk-channel-badge');
    if (badge) {
      badge.textContent = channelMap[currentChannel] || '✉️ Email';
    }
    previewEl?.querySelectorAll('.rk-channel-opt').forEach(btn => {
      btn.classList.toggle('rk-active', btn.dataset.channel === currentChannel);
    });
  }

  // ─── Role Profile Management ────────────────────────────────────

  function toggleRoleDropdown() {
    if (isRoleFormOpen) { closeRoleForm(); return; }
    if (isRoleDropdownOpen) { closeRoleDropdown(); return; }
    openRoleDropdown();
  }

  async function openRoleDropdown() {
    closeRoleDropdown();
    isRoleDropdownOpen = true;

    // Reload profiles from storage
    try {
      allRoleProfiles = await RKStorage.getRoleProfiles();
      activeRoleId = (await RKStorage.get('activeRoleId')) || null;
    } catch (e) { allRoleProfiles = []; }

    // Hide results & suggestions to make room for the dropdown
    if (resultsContainer) resultsContainer.style.display = 'none';
    const sugBar = paletteEl.querySelector('.rk-suggestions-bar');
    if (sugBar) sugBar.style.display = 'none';

    roleDropdownEl = document.createElement('div');
    roleDropdownEl.className = 'rk-role-dropdown';
    roleDropdownEl.addEventListener('click', e => e.stopPropagation());
    roleDropdownEl.addEventListener('keydown', e => e.stopPropagation());

    let itemsHtml = '';
    if (allRoleProfiles.length === 0) {
      itemsHtml = `<div class="rk-role-empty">No roles yet. Create one below.</div>`;
    } else {
      itemsHtml = allRoleProfiles.map(rp => `
        <div class="rk-role-item ${rp.id === activeRoleId ? 'rk-role-active' : ''}" data-role-id="${rp.id}">
          <div class="rk-role-item-info">
            <span class="rk-role-item-title">${rp.title || 'Untitled Role'}</span>
            <span class="rk-role-item-meta">${rp.companyName || ''}${rp.location ? ' · ' + rp.location : ''}</span>
          </div>
          <div class="rk-role-item-actions">
            ${rp.id === activeRoleId ? '<span class="rk-role-check">✓</span>' : ''}
            <button class="rk-role-edit-btn" data-role-id="${rp.id}" title="Edit">✏️</button>
            <button class="rk-role-delete-btn" data-role-id="${rp.id}" title="Delete">🗑️</button>
          </div>
        </div>
      `).join('');
    }

    roleDropdownEl.innerHTML = `
      <div class="rk-role-dropdown-header">Role Profiles</div>
      <div class="rk-role-list">${itemsHtml}</div>
      <div class="rk-role-dropdown-footer">
        <button class="rk-role-create-btn">+ Create New Role</button>
        ${activeRoleId ? '<button class="rk-role-clear-btn">Clear Selection</button>' : ''}
      </div>
    `;

    // Insert dropdown right below the search bar
    const searchBar = paletteEl.querySelector('.rk-search-bar');
    searchBar.insertAdjacentElement('afterend', roleDropdownEl);

    // Bind click handlers
    roleDropdownEl.querySelectorAll('.rk-role-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.rk-role-edit-btn') || e.target.closest('.rk-role-delete-btn')) return;
        selectRole(el.dataset.roleId);
      });
    });

    roleDropdownEl.querySelectorAll('.rk-role-edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rp = allRoleProfiles.find(r => r.id === btn.dataset.roleId);
        if (rp) openRoleForm(rp);
      });
    });

    roleDropdownEl.querySelectorAll('.rk-role-delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await RKStorage.deleteRoleProfile(btn.dataset.roleId);
        if (activeRoleId === btn.dataset.roleId) {
          activeRoleId = null;
          await RKStorage.setActiveRole(null);
          roleContext = {};
          updateRoleUI();
        }
        showToast('Role deleted', 'info');
        openRoleDropdown(); // Refresh
      });
    });

    const createBtn = roleDropdownEl.querySelector('.rk-role-create-btn');
    if (createBtn) createBtn.addEventListener('click', () => openRoleForm(null));

    const clearBtn = roleDropdownEl.querySelector('.rk-role-clear-btn');
    if (clearBtn) clearBtn.addEventListener('click', async () => {
      activeRoleId = null;
      await RKStorage.setActiveRole(null);
      roleContext = {};
      updateRoleUI();
      closeRoleDropdown();
      if (isPreviewOpen) regeneratePreview();
      showToast('Role cleared', 'info');
    });
  }

  function closeRoleDropdown() {
    if (roleDropdownEl) { roleDropdownEl.remove(); roleDropdownEl = null; }
    isRoleDropdownOpen = false;
    // Restore results & suggestions
    if (resultsContainer) resultsContainer.style.display = '';
    const sugBar = paletteEl?.querySelector('.rk-suggestions-bar');
    if (sugBar) sugBar.style.display = 'flex';
  }

  async function selectRole(roleId) {
    activeRoleId = roleId;
    await RKStorage.setActiveRole(roleId);
    const rp = allRoleProfiles.find(r => r.id === roleId);
    if (rp) {
      roleContext = {
        title: rp.title || '',
        companyName: rp.companyName || '',
        companyDescription: rp.companyDescription || '',
        evp: rp.evp || '',
        sellingPoints: rp.sellingPoints || '',
        location: rp.location || '',
        team: rp.team || '',
        hiringManager: rp.hiringManager || '',
        ...rp,
      };
    }
    updateRoleUI();
    closeRoleDropdown();
    if (isPreviewOpen) regeneratePreview();
    showToast(`Role: ${rp?.title || 'Selected'}`, 'success');
  }

  function openRoleForm(existingRole) {
    closeRoleDropdown();
    closeRoleForm();
    isRoleFormOpen = true;

    const rp = existingRole || {};
    const isEditing = !!rp.id;

    roleFormEl = document.createElement('div');
    roleFormEl.className = 'rk-role-form-panel';
    roleFormEl.addEventListener('click', e => e.stopPropagation());
    roleFormEl.addEventListener('keydown', e => e.stopPropagation());

    roleFormEl.innerHTML = `
      <div class="rk-role-form-header">
        <span>${isEditing ? 'Edit Role' : 'New Role'}</span>
        <button class="rk-role-form-close">✕</button>
      </div>
      <div class="rk-role-form-body rk-role-form-compact">
        <div class="rk-role-form-inline">
          <input class="rk-role-form-input" data-field="companyName" placeholder="Company Name *" value="${rp.companyName || ''}" />
          <input class="rk-role-form-input" data-field="title" placeholder="Role Title *" value="${rp.title || ''}" />
          <input class="rk-role-form-input" data-field="location" placeholder="Location (optional)" value="${rp.location || ''}" />
        </div>
      </div>
      <div class="rk-role-form-footer">
        <button class="rk-preview-btn rk-btn-secondary rk-role-form-cancel">Cancel</button>
        <button class="rk-preview-btn rk-btn-primary rk-role-form-save">${isEditing ? 'Save' : 'Create & Select'}</button>
      </div>
    `;

    // Insert into palette container
    const searchBar = paletteEl.querySelector('.rk-search-bar');
    searchBar.insertAdjacentElement('afterend', roleFormEl);

    // Hide results while form is open
    resultsContainer.style.display = 'none';
    const sugBar = paletteEl.querySelector('.rk-suggestions-bar');
    if (sugBar) sugBar.style.display = 'none';

    // Bind events
    roleFormEl.querySelector('.rk-role-form-close').addEventListener('click', closeRoleForm);
    roleFormEl.querySelector('.rk-role-form-cancel').addEventListener('click', closeRoleForm);
    roleFormEl.querySelector('.rk-role-form-save').addEventListener('click', async () => {
      await saveRoleFromForm(rp.id || null);
    });

    // Enter key saves the form (quick creation)
    roleFormEl.querySelectorAll('.rk-role-form-input').forEach(inp => {
      inp.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          await saveRoleFromForm(rp.id || null);
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          closeRoleForm();
        }
      });
    });

    // Focus first field
    setTimeout(() => {
      const first = roleFormEl.querySelector('.rk-role-form-input');
      if (first) first.focus();
    }, 50);
  }

  function closeRoleForm() {
    if (roleFormEl) { roleFormEl.remove(); roleFormEl = null; }
    isRoleFormOpen = false;
    // Restore results
    if (resultsContainer) resultsContainer.style.display = '';
    const sugBar = paletteEl?.querySelector('.rk-suggestions-bar');
    if (sugBar) sugBar.style.display = 'flex';
  }

  async function saveRoleFromForm(existingId) {
    const inputs = roleFormEl.querySelectorAll('.rk-role-form-input, .rk-role-form-textarea');
    const data = {};
    inputs.forEach(inp => {
      data[inp.dataset.field] = inp.value.trim();
    });

    // Validate required fields
    if (!data.companyName) {
      showToast('Company Name is required', 'info');
      roleFormEl.querySelector('[data-field="companyName"]').focus();
      return;
    }
    if (!data.title) {
      showToast('Role / Job Title is required', 'info');
      roleFormEl.querySelector('[data-field="title"]').focus();
      return;
    }

    // Build profile object
    const profile = {
      ...data,
      id: existingId || `role_${Date.now()}`,
    };

    try {
      await RKStorage.saveRoleProfile(profile);
      // Auto-select the newly created/edited role
      activeRoleId = profile.id;
      await RKStorage.setActiveRole(profile.id);
      // Reload profiles
      allRoleProfiles = await RKStorage.getRoleProfiles();
      // Set roleContext
      roleContext = { ...profile };
      updateRoleUI();
      closeRoleForm();
      if (isPreviewOpen) regeneratePreview();
      showToast(existingId ? 'Role updated!' : 'Role created & selected!', 'success');
    } catch (e) {
      console.log('RK: Error saving role', e);
      showToast('Error saving role', 'info');
    }
  }

  function updateRoleUI() {
    const badge = paletteEl?.querySelector('.rk-role-badge');
    if (!badge) return;
    if (activeRoleId && roleContext.title) {
      const label = roleContext.title.length > 20
        ? roleContext.title.substring(0, 18) + '…'
        : roleContext.title;
      badge.textContent = `📋 ${label}`;
      badge.classList.add('rk-role-selected');
    } else {
      badge.textContent = '📋 No Role';
      badge.classList.remove('rk-role-selected');
    }
  }

  // ─── Toast Notification ────────────────────────────────────────────
  function showToast(message, type = 'success') {
    const existing = document.querySelector('.rk-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `rk-toast rk-toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.classList.add('rk-toast-visible');
      });
    });
    setTimeout(() => {
      toast.classList.remove('rk-toast-visible');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  return {
    build,
    open,
    close,
    isVisible,
    showToast,
  };
})();

if (typeof window !== 'undefined') {
  window.RKPalette = RKPalette;
}
