/**
 * RecruiterKeys — Settings Page Script
 */
document.addEventListener('DOMContentLoaded', async () => {

  // ─── Tab Navigation ────────────────────────────────────────────────
  document.querySelectorAll('.settings-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.querySelector(`[data-panel="${tab.dataset.tab}"]`).classList.add('active');
    });
  });

  // ─── Toggle Switches ──────────────────────────────────────────────
  document.querySelectorAll('.toggle-switch').forEach(toggle => {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
    });
  });

  // ─── Load Existing Data ────────────────────────────────────────────
  const data = await chrome.storage.local.get(null);

  // Company
  document.getElementById('companyName').value = data.companyName || '';
  document.getElementById('companyDescription').value = data.companyDescription || '';
  document.getElementById('companyEVP').value = data.companyEVP || '';
  document.getElementById('signature').value = data.signature || '';

  // Preferences
  document.getElementById('globalTone').value = data.globalTone || 'professional';
  document.getElementById('defaultChannel').value = data.settings?.defaultChannel || 'email';
  document.getElementById('triggerKey').value = data.triggerKey || '/';

  if (data.settings?.showSuggestions !== false) {
    document.getElementById('toggleSuggestions').classList.add('active');
  } else {
    document.getElementById('toggleSuggestions').classList.remove('active');
  }
  if (data.settings?.includeSignature !== false) {
    document.getElementById('toggleSignature').classList.add('active');
  } else {
    document.getElementById('toggleSignature').classList.remove('active');
  }
  if (data.settings?.feedbackInRejections) {
    document.getElementById('toggleFeedback').classList.add('active');
  }

  // ─── Company Settings ──────────────────────────────────────────────
  document.getElementById('saveCompany').addEventListener('click', async () => {
    await chrome.storage.local.set({
      companyName: document.getElementById('companyName').value.trim(),
      companyDescription: document.getElementById('companyDescription').value.trim(),
      companyEVP: document.getElementById('companyEVP').value.trim(),
      signature: document.getElementById('signature').value.trim(),
    });
    showStatus('companyStatus', 'Company settings saved!', 'success');
  });

  // ─── Role Profiles ────────────────────────────────────────────────
  let editingRoleId = null;

  async function renderRoles() {
    const { roleProfiles, activeRoleId } = await chrome.storage.local.get(['roleProfiles', 'activeRoleId']);
    const list = document.getElementById('roleList');

    if (!roleProfiles?.length) {
      list.innerHTML = '<div style="color: rgba(255,255,255,0.3); font-size: 13px; padding: 12px 0;">No role profiles yet. Add one to get started.</div>';
      return;
    }

    list.innerHTML = roleProfiles.map(role => `
      <div class="role-profile-card ${role.id === activeRoleId ? 'active' : ''}" data-id="${role.id}">
        <div class="role-card-info">
          <div class="role-card-name">${role.title || 'Untitled Role'}</div>
          <div class="role-card-meta">${[role.team, role.location, role.compensation].filter(Boolean).join(' · ')}</div>
        </div>
        ${role.id === activeRoleId ? '<span class="role-active-badge">Active</span>' : ''}
        <div class="role-card-actions">
          ${role.id !== activeRoleId ? `<button class="role-card-btn" data-action="activate" data-id="${role.id}">Set Active</button>` : ''}
          <button class="role-card-btn" data-action="edit" data-id="${role.id}">Edit</button>
        </div>
      </div>
    `).join('');

    // Bind card actions
    list.querySelectorAll('[data-action="activate"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await chrome.storage.local.set({ activeRoleId: btn.dataset.id });
        renderRoles();
      });
    });

    list.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        editRole(btn.dataset.id);
      });
    });
  }

  function editRole(id) {
    const roleProfiles = JSON.parse(JSON.stringify(data.roleProfiles || []));
    const role = id ? roleProfiles.find(r => r.id === id) : {};
    editingRoleId = id || null;

    document.getElementById('roleFormTitle').textContent = id ? 'Edit Role Profile' : 'New Role Profile';
    document.getElementById('roleTitle').value = role.title || '';
    document.getElementById('roleTeam').value = role.team || '';
    document.getElementById('roleHiringManager').value = role.hiringManager || '';
    document.getElementById('roleLocation').value = role.location || '';
    document.getElementById('roleResponsibilities').value = role.responsibilities || '';
    document.getElementById('roleRequiredQuals').value = role.requiredQuals || '';
    document.getElementById('rolePreferredQuals').value = role.preferredQuals || '';
    document.getElementById('roleCompensation').value = role.compensation || '';
    document.getElementById('roleTone').value = role.defaultTone || 'professional';
    document.getElementById('roleSellingPoints').value = role.sellingPoints || '';
    document.getElementById('roleInterviewProcess').value = role.interviewProcess || '';
    document.getElementById('roleSchedulingLink').value = role.schedulingLink || '';
    document.getElementById('roleOfficeAddress').value = role.officeAddress || '';
    document.getElementById('deleteRole').style.display = id ? 'inline-flex' : 'none';
    document.getElementById('roleForm').style.display = 'block';
  }

  document.getElementById('addRole').addEventListener('click', () => editRole(null));
  document.getElementById('cancelRole').addEventListener('click', () => {
    document.getElementById('roleForm').style.display = 'none';
    editingRoleId = null;
  });

  document.getElementById('saveRole').addEventListener('click', async () => {
    const roleData = {
      id: editingRoleId || `role_${Date.now()}`,
      title: document.getElementById('roleTitle').value.trim(),
      team: document.getElementById('roleTeam').value.trim(),
      hiringManager: document.getElementById('roleHiringManager').value.trim(),
      location: document.getElementById('roleLocation').value.trim(),
      responsibilities: document.getElementById('roleResponsibilities').value.trim(),
      requiredQuals: document.getElementById('roleRequiredQuals').value.trim(),
      preferredQuals: document.getElementById('rolePreferredQuals').value.trim(),
      compensation: document.getElementById('roleCompensation').value.trim(),
      defaultTone: document.getElementById('roleTone').value,
      sellingPoints: document.getElementById('roleSellingPoints').value.trim(),
      interviewProcess: document.getElementById('roleInterviewProcess').value.trim(),
      schedulingLink: document.getElementById('roleSchedulingLink').value.trim(),
      officeAddress: document.getElementById('roleOfficeAddress').value.trim(),
      companyName: document.getElementById('companyName').value.trim() || data.companyName || '',
    };

    if (!roleData.title) {
      showStatus('roleStatus', 'Job title is required.', 'error');
      return;
    }

    let profiles = (await chrome.storage.local.get('roleProfiles')).roleProfiles || [];
    const idx = profiles.findIndex(r => r.id === roleData.id);
    if (idx >= 0) {
      profiles[idx] = { ...profiles[idx], ...roleData, updatedAt: Date.now() };
    } else {
      roleData.createdAt = Date.now();
      roleData.updatedAt = Date.now();
      profiles.push(roleData);
    }

    await chrome.storage.local.set({ roleProfiles: profiles });

    // Auto-activate if first role
    if (profiles.length === 1) {
      await chrome.storage.local.set({ activeRoleId: roleData.id });
    }

    // Update local data reference
    data.roleProfiles = profiles;

    document.getElementById('roleForm').style.display = 'none';
    editingRoleId = null;
    showStatus('roleStatus', 'Role profile saved!', 'success');
    renderRoles();
  });

  document.getElementById('deleteRole').addEventListener('click', async () => {
    if (!editingRoleId) return;
    if (!confirm('Delete this role profile?')) return;

    let profiles = (await chrome.storage.local.get('roleProfiles')).roleProfiles || [];
    profiles = profiles.filter(r => r.id !== editingRoleId);
    await chrome.storage.local.set({ roleProfiles: profiles });

    const { activeRoleId } = await chrome.storage.local.get('activeRoleId');
    if (activeRoleId === editingRoleId) {
      await chrome.storage.local.set({ activeRoleId: profiles[0]?.id || null });
    }

    data.roleProfiles = profiles;
    document.getElementById('roleForm').style.display = 'none';
    editingRoleId = null;
    renderRoles();
  });

  renderRoles();

  // ─── Preferences ───────────────────────────────────────────────────
  document.getElementById('savePreferences').addEventListener('click', async () => {
    await chrome.storage.local.set({
      globalTone: document.getElementById('globalTone').value,
      triggerKey: document.getElementById('triggerKey').value || '/',
      settings: {
        showSuggestions: document.getElementById('toggleSuggestions').classList.contains('active'),
        defaultChannel: document.getElementById('defaultChannel').value,
        includeSignature: document.getElementById('toggleSignature').classList.contains('active'),
        feedbackInRejections: document.getElementById('toggleFeedback').classList.contains('active'),
        maxRecentMessages: 50,
      }
    });
    showStatus('preferencesStatus', 'Preferences saved!', 'success');
  });

  // ─── Snippets ──────────────────────────────────────────────────────
  async function renderSnippets() {
    const { savedSnippets } = await chrome.storage.local.get('savedSnippets');
    const list = document.getElementById('snippetsList');

    if (!savedSnippets?.length) {
      list.innerHTML = '<div style="color: rgba(255,255,255,0.3); font-size: 13px;">No saved snippets yet. Save messages from the command palette to see them here.</div>';
      return;
    }

    list.innerHTML = savedSnippets.map((s, i) => `
      <div class="snippet-item">
        <div class="snippet-header">
          <span class="snippet-label">${s.label || s.command || 'Custom'}</span>
          <span class="snippet-meta">${s.tone || ''} · ${s.channel || ''} · ${new Date(s.savedAt).toLocaleDateString()}</span>
        </div>
        <div class="snippet-preview">${(s.content || '').substring(0, 200)}${s.content?.length > 200 ? '...' : ''}</div>
      </div>
    `).join('');
  }

  renderSnippets();

  // ─── Custom Shortcuts ──────────────────────────────────────────────
  async function renderCustomShortcuts() {
    const { customShortcuts } = await chrome.storage.local.get('customShortcuts');
    const list = document.getElementById('customShortcutsList');

    if (!customShortcuts?.length) {
      list.innerHTML = '<div style="color: rgba(255,255,255,0.3); font-size: 13px; margin-bottom: 16px;">No custom shortcuts yet.</div>';
      return;
    }

    list.innerHTML = customShortcuts.map(s => `
      <div class="snippet-item">
        <div class="snippet-header">
          <span class="snippet-label">${s.label} <code style="font-size:11px;color:rgba(255,255,255,0.35);margin-left:6px;">${s.command}</code></span>
          <button class="role-card-btn" data-delete-shortcut="${s.command}">Delete</button>
        </div>
        <div class="snippet-preview">${(s.template || '').substring(0, 150)}</div>
      </div>
    `).join('');

    list.querySelectorAll('[data-delete-shortcut]').forEach(btn => {
      btn.addEventListener('click', async () => {
        let shortcuts = (await chrome.storage.local.get('customShortcuts')).customShortcuts || [];
        shortcuts = shortcuts.filter(s => s.command !== btn.dataset.deleteShortcut);
        await chrome.storage.local.set({ customShortcuts: shortcuts });
        renderCustomShortcuts();
      });
    });
  }

  renderCustomShortcuts();

  document.getElementById('saveCustomShortcut').addEventListener('click', async () => {
    const command = document.getElementById('customCommand').value.trim();
    const label = document.getElementById('customLabel').value.trim();
    const template = document.getElementById('customTemplate').value.trim();

    if (!command || !label || !template) {
      showStatus('shortcutStatus', 'All fields are required.', 'error');
      return;
    }

    const normalizedCommand = command.startsWith('/') ? command : '/' + command;

    let shortcuts = (await chrome.storage.local.get('customShortcuts')).customShortcuts || [];
    const idx = shortcuts.findIndex(s => s.command === normalizedCommand);
    if (idx >= 0) {
      shortcuts[idx] = { command: normalizedCommand, label, template };
    } else {
      shortcuts.push({ command: normalizedCommand, label, template });
    }

    await chrome.storage.local.set({ customShortcuts: shortcuts });

    document.getElementById('customCommand').value = '';
    document.getElementById('customLabel').value = '';
    document.getElementById('customTemplate').value = '';

    showStatus('shortcutStatus', 'Custom shortcut saved!', 'success');
    renderCustomShortcuts();
  });

  // ─── Import / Export ───────────────────────────────────────────────
  document.getElementById('exportData').addEventListener('click', async () => {
    const allData = await chrome.storage.local.get(null);
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recruiterkeys-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('importData').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });

  document.getElementById('importFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      await chrome.storage.local.set(importData);
      showStatus('dataStatus', 'Data imported successfully! Reload the page to see changes.', 'success');
    } catch (err) {
      showStatus('dataStatus', 'Invalid JSON file.', 'error');
    }
  });

  document.getElementById('resetData').addEventListener('click', async () => {
    if (!confirm('Are you sure? This will delete ALL RecruiterKeys data and cannot be undone.')) return;
    if (!confirm('Really sure? Last chance.')) return;

    await chrome.storage.local.clear();
    showStatus('dataStatus', 'All data has been reset.', 'success');
    setTimeout(() => location.reload(), 1000);
  });

  // ─── Helpers ───────────────────────────────────────────────────────
  function showStatus(id, message, type) {
    const el = document.getElementById(id);
    el.textContent = message;
    el.className = `status-msg ${type}`;
    setTimeout(() => { el.className = 'status-msg'; }, 3000);
  }
});
