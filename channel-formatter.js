/**
 * RecruiterKeys — Channel Auto-Formatter
 * Restructures messages for different communication channels.
 */
const RKChannelFormatter = (() => {

  const CHANNELS = [
    { id: 'email',     label: 'Email',              icon: '✉️',  description: 'Subject line + structured body + sign-off' },
    { id: 'inmail',    label: 'LinkedIn InMail',     icon: '💼',  description: 'Shorter, conversational, no subject' },
    { id: 'linkedin',  label: 'LinkedIn Message',    icon: '💬',  description: 'Very concise, chat-style' },
    { id: 'whatsapp',  label: 'WhatsApp / SMS',      icon: '📱',  description: '2–3 sentences max, casual' },
    { id: 'ats',       label: 'ATS Notes',           icon: '📝',  description: 'Internal-facing summary, no pleasantries' },
  ];

  /**
   * Detect the current channel based on the active page.
   */
  function detectChannel() {
    const url = window.location.href;
    const host = window.location.hostname;

    if (host.includes('linkedin.com')) {
      // Check if in InMail compose vs regular messaging
      if (url.includes('/messaging/') || document.querySelector('.msg-form__contenteditable')) {
        return 'linkedin';
      }
      if (document.querySelector('[data-control-name="message"]') || url.includes('inmail')) {
        return 'inmail';
      }
      return 'inmail';
    }
    if (host.includes('mail.google.com') || host.includes('outlook.live.com') || host.includes('outlook.office.com') || host.includes('outlook.office365.com')) {
      return 'email';
    }
    if (host.includes('web.whatsapp.com') || host.includes('wa.me')) {
      return 'whatsapp';
    }
    if (host.includes('slack.com') || host.includes('chat.google.com') || host.includes('teams.microsoft.com')) {
      return 'linkedin'; // Chat-style for messaging apps
    }
    // Default
    return 'email';
  }

  /**
   * Extract a subject line from a full message body.
   */
  function extractSubject(message, shortcutLabel) {
    // Try to create a natural subject from the first meaningful line
    const lines = message.split('\n').filter(l => l.trim());
    const firstLine = lines[0] || '';

    const subjectMap = {
      'Cold Outreach': 'Opportunity that aligns with your background',
      'Warm Outreach': 'Introduction via {mutual_connection}',
      'Passive Candidate': 'Quick thought — no pressure',
      'Reactivating': 'Reconnecting — exciting update',
      'Executive': 'Leadership opportunity worth exploring',
      'First Follow-Up': 'Following up — additional context',
      'Second Follow-Up': 'Quick check-in — {role_title} role',
      'Final Follow-Up': 'Closing the loop — {role_title}',
      'Screen Call': 'Let\'s connect — {role_title} at {company_name}',
      'Shortlisted': 'Great news — next steps for {role_title}',
      'Interview Prep': 'Your upcoming interview — everything you need',
      'Interview Confirmation': 'Confirmed: Interview on {interview_date}',
      'Verbal Offer': 'Exciting news — let\'s connect',
      'Written Offer': 'Your offer from {company_name}',
      'Welcome': 'Welcome to the team!',
    };

    for (const [key, subject] of Object.entries(subjectMap)) {
      if (shortcutLabel.includes(key)) return subject;
    }

    return `Re: ${shortcutLabel}`;
  }

  /**
   * Format a message for a specific channel.
   */
  function formatForChannel(message, channel, options = {}) {
    switch (channel) {
      case 'email':
        return formatEmail(message, options);
      case 'inmail':
        return formatInMail(message);
      case 'linkedin':
        return formatLinkedInChat(message);
      case 'whatsapp':
        return formatWhatsApp(message);
      case 'ats':
        return formatATS(message, options);
      default:
        return message;
    }
  }

  function formatEmail(message, options = {}) {
    // Email keeps the full structure — just ensure proper formatting
    const lines = message.split('\n');
    let formatted = message;

    // Ensure there's a proper greeting
    if (!lines[0].match(/^(Hi|Hey|Hello|Dear|Good)/i)) {
      formatted = `Hi ${options.candidateName || 'there'},\n\n${formatted}`;
    }

    return formatted;
  }

  function formatInMail(message) {
    // InMail: Shorter, remove subject line references, more conversational
    let formatted = message;

    // Remove formal sign-offs, replace with shorter ones
    formatted = formatted.replace(/\n\nWarm regards,\n.+$/s, '\n\nBest,');
    formatted = formatted.replace(/\n\nWith sincere respect,\n.+$/s, '\n\nBest,');

    // Condense bullet lists to inline
    formatted = formatted.replace(/\n•\s*/g, '\n· ');

    // Shorten if over 300 words
    const words = formatted.split(/\s+/);
    if (words.length > 250) {
      // Keep first paragraph, a condensed middle, and close
      const paragraphs = formatted.split('\n\n');
      if (paragraphs.length > 3) {
        formatted = [paragraphs[0], paragraphs[1], paragraphs[paragraphs.length - 1]].join('\n\n');
      }
    }

    return formatted;
  }

  function formatLinkedInChat(message) {
    // LinkedIn DM: Very concise, chat-style
    const paragraphs = message.split('\n\n').filter(p => p.trim());

    // Take the opener and the core ask, skip the middle
    let formatted = '';
    if (paragraphs.length >= 2) {
      formatted = paragraphs[0] + '\n\n';
      // Find the paragraph with the ask/CTA
      const askParagraph = paragraphs.find(p =>
        p.match(/(would you|any chance|interested|open to|let me know|happy to)/i)
      );
      if (askParagraph && askParagraph !== paragraphs[0]) {
        formatted += askParagraph;
      } else {
        formatted += paragraphs[paragraphs.length - 1];
      }
    } else {
      formatted = paragraphs[0] || message;
    }

    // Remove formal signatures
    formatted = formatted.replace(/\n\n(Best|Regards|Warm regards|Warmly|Cheers),?\n.*$/s, '');

    return formatted;
  }

  function formatWhatsApp(message) {
    // WhatsApp/SMS: 2–3 sentences max
    const sentences = message
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .split(/(?<=[.!?])\s+/)
      .filter(s => s.trim());

    // Pick the greeting + most important sentences
    let result = '';
    if (sentences.length > 0) {
      result = sentences[0]; // Greeting
      // Find the key sentence with the ask
      const askSentence = sentences.find(s =>
        s.match(/(would you|any chance|interested|open to|let me know|quick chat|call)/i)
      );
      if (askSentence && askSentence !== sentences[0]) {
        result += ' ' + askSentence;
      } else if (sentences.length > 1) {
        result += ' ' + sentences[1];
      }
    }

    // Cap at 160 chars for SMS-friendly
    if (result.length > 300) {
      result = result.substring(0, 297) + '...';
    }

    return result;
  }

  function formatATS(message, options = {}) {
    // ATS Notes: Internal-facing, no pleasantries
    let formatted = message;

    // Remove greetings
    formatted = formatted.replace(/^(Hi|Hey|Hello|Dear|Good\s+\w+)[^,]*,?\s*/i, '');

    // Remove sign-offs
    formatted = formatted.replace(/\n\n(Best|Regards|Warm|Warmly|Cheers|Sincerely|With|Wishing)[^]*$/i, '');

    // Prefix with metadata
    const meta = [
      options.shortcutUsed ? `Type: ${options.shortcutUsed}` : '',
      options.candidateName ? `Candidate: ${options.candidateName}` : '',
      `Date: ${new Date().toLocaleDateString()}`,
    ].filter(Boolean).join(' | ');

    return `[${meta}]\n${formatted.trim()}`;
  }

  return {
    CHANNELS,
    detectChannel,
    extractSubject,
    formatForChannel,
  };
})();

if (typeof window !== 'undefined') {
  window.RKChannelFormatter = RKChannelFormatter;
}
