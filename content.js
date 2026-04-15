/**
 * RecruiterKeys — Content Script Entry Point
 * Detects trigger key in text fields on ANY page, including:
 * LinkedIn (chat, InMail), Gmail compose, Outlook web, Slack, WhatsApp web,
 * and any standard textarea / contentEditable field.
 *
 * Runs in all frames (including Gmail/Outlook iframes) via manifest "all_frames": true.
 */
(() => {
  const TRIGGER_KEY = '/';
  let activeField = null;
  let paletteReady = false;

  // Debounce — avoid double-fires
  let lastTriggerTime = 0;
  const DEBOUNCE_MS = 300;

  // Grace period after opening — prevents MutationObserver from
  // immediately closing the palette during DOM setup
  let paletteOpenedAt = 0;
  const OPEN_GRACE_MS = 500;

  // ─── Text Field Detection (broad — catches LinkedIn, Gmail, Outlook, etc.) ──
  function isTextField(el) {
    if (!el || el.nodeType !== 1) return false;

    const tag = (el.tagName || '').toUpperCase();

    // Standard form elements
    if (tag === 'TEXTAREA') return true;
    if (tag === 'INPUT') {
      const type = (el.type || 'text').toLowerCase();
      return ['text', 'search', 'email', 'url', 'tel', 'number'].includes(type);
    }

    // ContentEditable (Gmail, LinkedIn, Outlook, Slack, etc.)
    if (el.isContentEditable) return true;
    if (el.getAttribute('contenteditable') === 'true') return true;
    if (el.getAttribute('contenteditable') === 'plaintext-only') return true;

    // ARIA roles used by various apps
    const role = (el.getAttribute('role') || '').toLowerCase();
    if (['textbox', 'combobox', 'searchbox'].includes(role)) return true;

    // LinkedIn-specific: message input has a special div
    if (el.classList && (
      el.classList.contains('msg-form__contenteditable') ||
      el.classList.contains('ql-editor') ||
      el.classList.contains('msg-form__msg-content-container--is-active')
    )) return true;

    // Gmail-specific: compose body
    if (el.getAttribute('aria-label') === 'Message Body') return true;
    if (el.getAttribute('g_editable') === 'true') return true;

    // Outlook-specific
    if (el.getAttribute('aria-label')?.includes('Message body')) return true;

    // Slack
    if (el.getAttribute('data-qa') === 'message_input') return true;

    // Check parent chain — some sites nest the editable inside wrapper divs
    // Only go 3 levels up
    let parent = el.parentElement;
    for (let i = 0; i < 3 && parent; i++) {
      if (parent.isContentEditable) return true;
      if (parent.getAttribute('contenteditable') === 'true') return true;
      parent = parent.parentElement;
    }

    return false;
  }

  /**
   * Find the actual editable element — sometimes focus is on a child node
   * inside a contentEditable container. Walk up to find the editable root.
   */
  function findEditableRoot(el) {
    if (!el) return null;

    // If it's a standard input/textarea, return as-is
    const tag = (el.tagName || '').toUpperCase();
    if (tag === 'TEXTAREA' || tag === 'INPUT') return el;

    // Walk up to find the contentEditable root
    let current = el;
    while (current && current !== document.body) {
      if (current.isContentEditable || current.getAttribute('contenteditable') === 'true') {
        // Check if parent is also editable — keep walking
        const parent = current.parentElement;
        if (parent && parent !== document.body && (parent.isContentEditable || parent.getAttribute('contenteditable') === 'true')) {
          current = parent;
          continue;
        }
        return current;
      }
      current = current.parentElement;
    }

    return el;
  }

  /**
   * Check if the cursor is at a position where "/" should trigger the palette.
   * Returns true at start of field or after whitespace/newline.
   */
  function shouldTriggerAtCursor(el) {
    const tag = (el.tagName || '').toUpperCase();

    if (tag === 'TEXTAREA' || tag === 'INPUT') {
      const pos = el.selectionStart || 0;
      const text = el.value || '';
      if (pos === 0) return true;
      const charBefore = text[pos - 1];
      return charBefore === ' ' || charBefore === '\n' || charBefore === '\r' || charBefore === '';
    }

    // ContentEditable
    try {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return true;
      const range = sel.getRangeAt(0);
      const node = range.startContainer;

      if (node.nodeType === Node.TEXT_NODE) {
        const pos = range.startOffset;
        const text = node.textContent || '';
        if (pos === 0) return true;
        if (text.trim() === '') return true;
        const charBefore = text[pos - 1];
        return charBefore === ' ' || charBefore === '\n' || charBefore === '\r';
      }

      // If we're at an element node (empty div, br, etc.) — trigger
      return true;
    } catch (e) {
      return true; // Default to allowing trigger
    }
  }

  // ─── Primary Trigger: keydown on "/" ───────────────────────────────
  // Capture phase fires before any page handler can intercept
  document.addEventListener('keydown', (e) => {

    // If palette is open, only handle Escape
    if (typeof RKPalette !== 'undefined' && RKPalette.isVisible()) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        RKPalette.close();
      }
      return;
    }

    // Detect "/" key — no modifiers
    if (e.key === '/' && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
      const rawEl = document.activeElement;

      // Walk up through shadow roots if needed
      let el = rawEl;
      if (el && el.shadowRoot) {
        const shadowActive = el.shadowRoot.activeElement;
        if (shadowActive) el = shadowActive;
      }

      // Find the actual editable root
      const editableEl = findEditableRoot(el);

      if (isTextField(el) || isTextField(editableEl)) {
        const targetField = isTextField(editableEl) ? editableEl : el;

        // Debounce
        const now = Date.now();
        if (now - lastTriggerTime < DEBOUNCE_MS) return;
        lastTriggerTime = now;

        if (shouldTriggerAtCursor(targetField)) {
          e.preventDefault();
          e.stopPropagation();
          activeField = targetField;
          paletteOpenedAt = Date.now();
          console.log('RK: Trigger detected, opening palette for', targetField.tagName, targetField.className?.toString().substring(0, 40));
          RKPalette.open(targetField);
        }
      }
    }
  }, true); // capture phase — runs first

  // ─── Fallback: also listen on "input" events for sites that swallow keydown ──
  document.addEventListener('input', (e) => {
    if (typeof RKPalette !== 'undefined' && RKPalette.isVisible()) return;

    // If keydown handler already opened the palette (within grace period), skip
    if (Date.now() - paletteOpenedAt < OPEN_GRACE_MS) return;

    const el = e.target;
    if (!el) return;

    // Only fire for insertText of "/"
    if (e.inputType !== 'insertText' || e.data !== '/') return;

    const editableEl = findEditableRoot(el);
    if (!isTextField(el) && !isTextField(editableEl)) return;

    // Debounce
    const now = Date.now();
    if (now - lastTriggerTime < DEBOUNCE_MS) return;

    const targetField = isTextField(editableEl) ? editableEl : el;

    // Since we couldn't preventDefault (input already happened), remove the "/" first
    try {
      if (targetField.tagName === 'TEXTAREA' || targetField.tagName === 'INPUT') {
        const pos = targetField.selectionStart;
        const text = targetField.value;
        if (pos > 0 && text[pos - 1] === '/') {
          targetField.value = text.substring(0, pos - 1) + text.substring(pos);
          targetField.selectionStart = targetField.selectionEnd = pos - 1;
          targetField.dispatchEvent(new Event('input', { bubbles: true }));
        }
      } else if (targetField.isContentEditable) {
        // Remove the "/" from contentEditable
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          const textNode = range.startContainer;
          if (textNode && textNode.nodeType === Node.TEXT_NODE) {
            const pos = range.startOffset;
            const text = textNode.textContent;
            if (pos > 0 && text[pos - 1] === '/') {
              textNode.textContent = text.substring(0, pos - 1) + text.substring(pos);
              try {
                const newRange = document.createRange();
                newRange.setStart(textNode, Math.max(0, pos - 1));
                newRange.setEnd(textNode, Math.max(0, pos - 1));
                sel.removeAllRanges();
                sel.addRange(newRange);
              } catch (rangeErr) {}
            }
          }
        }
      }
    } catch (cleanupErr) {
      // Non-critical — palette still opens
    }

    lastTriggerTime = Date.now();
    activeField = targetField;
    console.log('RK: Input fallback trigger for', targetField.tagName);
    RKPalette.open(targetField);
  }, true);

  // ─── MutationObserver: watch for dynamically added text fields ─────
  // LinkedIn, Gmail, Slack all dynamically create compose fields.
  // IMPORTANT: We do NOT close the palette based on field removal anymore.
  // LinkedIn/WhatsApp frameworks aggressively re-render their chat widgets,
  // which replaces DOM nodes and makes activeField stale — even while the
  // user is actively using the palette. The SPA navigation observer (below)
  // handles actual page changes. The palette manages its own close via
  // Escape, overlay click, and explicit UI actions.
  const observeNewFields = new MutationObserver((mutations) => {
    // No auto-close logic — palette lifecycle is self-managed
  });
  observeNewFields.observe(document.documentElement, { childList: true, subtree: true });

  // ─── SPA navigation watcher ────────────────────────────────────────
  let lastUrl = window.location.href;
  const navObserver = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      if (typeof RKPalette !== 'undefined' && RKPalette.isVisible()) {
        RKPalette.close();
      }
    }
  });
  navObserver.observe(document.documentElement, { childList: true, subtree: true });

  // ─── Listen for commands from background/popup ─────────────────────
  if (chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'open-palette') {
        const el = document.activeElement;
        const editableEl = findEditableRoot(el);
        const textField = (isTextField(el) || isTextField(editableEl))
          ? (isTextField(editableEl) ? editableEl : el)
          : null;
        RKPalette.open(textField);
        sendResponse({ success: true });
      }
      if (message.action === 'get-page-context') {
        try {
          const candidate = RKPersonalization.detectCandidateFromPage();
          sendResponse({ candidate, url: window.location.href });
        } catch (e) {
          sendResponse({ candidate: {}, url: window.location.href });
        }
      }
      return true;
    });
  }

  // ─── Only show "loaded" log for the top frame (not every iframe) ───
  if (window === window.top) {
    console.log('RecruiterKeys loaded ✓ — Type / in any text field to open the command palette');
  }
})();
