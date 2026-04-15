/**
 * RecruiterKeys — Background Service Worker
 * Handles commands, context menus, and cross-tab communication.
 */

// Handle keyboard command
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-palette') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'open-palette' });
      }
    });
  }
});

// Context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'rk-open-palette',
    title: 'RecruiterKeys — Open Command Palette',
    contexts: ['editable']
  });

  chrome.contextMenus.create({
    id: 'rk-quick-outreach',
    title: 'RecruiterKeys — Quick Outreach',
    contexts: ['editable']
  });

  // Initialize default settings
  chrome.storage.local.get(null, (result) => {
    if (!result.roleProfiles) {
      chrome.storage.local.set({
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
      });
    }
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'rk-open-palette') {
    chrome.tabs.sendMessage(tab.id, { action: 'open-palette' });
  }
  if (info.menuItemId === 'rk-quick-outreach') {
    chrome.tabs.sendMessage(tab.id, { action: 'open-palette', command: '/outreach' });
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'get-candidate-context') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'get-page-context' }, (response) => {
          sendResponse(response || {});
        });
      } else {
        sendResponse({});
      }
    });
    return true; // async
  }

  if (message.action === 'reload-extension') {
    chrome.runtime.reload();
    return;
  }

  if (message.action === 'open-palette-from-popup') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'open-palette' });
        sendResponse({ success: true });
      }
    });
    return true;
  }
});
