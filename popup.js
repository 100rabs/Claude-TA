/**
 * RecruiterKeys — Popup Script
 */
document.addEventListener('DOMContentLoaded', async () => {

  // Load active role
  const { roleProfiles, activeRoleId, companyName, recentMessages } = await chrome.storage.local.get([
    'roleProfiles', 'activeRoleId', 'companyName', 'recentMessages'
  ]);

  const roleTitle = document.getElementById('roleTitle');
  const roleCompany = document.getElementById('roleCompany');

  if (activeRoleId && roleProfiles?.length) {
    const activeRole = roleProfiles.find(r => r.id === activeRoleId);
    if (activeRole) {
      roleTitle.textContent = activeRole.title || 'Untitled Role';
      roleCompany.textContent = [activeRole.companyName || companyName, activeRole.team, activeRole.location].filter(Boolean).join(' · ');
    } else {
      roleTitle.textContent = 'No role selected';
      roleCompany.innerHTML = '<a href="#" id="setupLink">Set up a role →</a>';
    }
  } else {
    roleTitle.textContent = 'No role selected';
    roleCompany.innerHTML = '<a href="#" id="setupLink">Set up a role →</a>';
  }

  // Setup link
  document.addEventListener('click', (e) => {
    if (e.target.id === 'setupLink') {
      e.preventDefault();
      chrome.runtime.openOptionsPage();
    }
  });

  // Recent messages
  const recentList = document.getElementById('recentList');
  if (recentMessages?.length) {
    recentList.innerHTML = recentMessages.slice(0, 5).map(msg => {
      const timeAgo = getTimeAgo(msg.createdAt);
      return `<div class="recent-item" data-command="${msg.command}">
        <span class="recent-icon">📄</span>
        <div class="recent-content">
          <div class="recent-label">${msg.candidate || 'Unknown'} — ${msg.command}</div>
          <div class="recent-meta">${msg.preview || ''}</div>
        </div>
        <span class="recent-time">${timeAgo}</span>
      </div>`;
    }).join('');
  }

  // Open palette in active tab
  document.getElementById('openPalette').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'open-palette-from-popup' });
    window.close();
  });

  // Quick action buttons
  document.querySelectorAll('.quick-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'open-palette-from-popup' });
      window.close();
    });
  });

  // Open settings
  document.getElementById('openSettings').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  function getTimeAgo(timestamp) {
    if (!timestamp) return '';
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }
});
