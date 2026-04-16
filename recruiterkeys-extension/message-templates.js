/**
 * RecruiterKeys — Message Templates Engine
 * 65+ message generators organized by 16 recruitment stages.
 * Each generator returns a message string personalized with candidate + role context.
 */
const RKTemplates = (() => {

  // ─── Utility helpers ───────────────────────────────────────────────
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function cap(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  }

  function firstName(name) {
    return (name || '').split(' ')[0];
  }

  // ─── Stage definitions (16 stages) ─────────────────────────────────
  const STAGES = [
    { id: 'sourcing',        label: 'Sourcing & Initial Outreach',     icon: '🔍' },
    { id: 'application',     label: 'Application Stage',               icon: '📥' },
    { id: 'cvscreen',        label: 'CV/Resume Screening Outcome',     icon: '📄' },
    { id: 'screening',       label: 'Screening Call Scheduling',       icon: '📞' },
    { id: 'postscreen',      label: 'Post-Screening Outcome',          icon: '📋' },
    { id: 'assessment',      label: 'Assessment / Test Stage',         icon: '🧪' },
    { id: 'interview',       label: 'Interview Rounds',                icon: '🎤' },
    { id: 'postinterview',   label: 'Post-Interview Outcome',          icon: '💬' },
    { id: 'reference',       label: 'Reference & Background Check',    icon: '🔎' },
    { id: 'documentation',   label: 'Documentation',                   icon: '📂' },
    { id: 'offer',           label: 'Offer Stage',                     icon: '🎉' },
    { id: 'visa',            label: 'Visa & Relocation',               icon: '✈️' },
    { id: 'keepwarm',        label: 'Engagement / Keep Warm',          icon: '🤝' },
    { id: 'preboarding',     label: 'Pre-Boarding',                    icon: '🚀' },
    { id: 'onboarding',      label: 'Onboarding',                      icon: '🏢' },
    { id: 'experience',      label: 'Candidate Experience & Misc',     icon: '⭐' },
  ];

  // ─── All shortcut definitions ──────────────────────────────────────
  const SHORTCUTS = [

    // ═══════════════════════════════════════════════════════════════════
    // STAGE 1 — Sourcing & Initial Outreach
    // ═══════════════════════════════════════════════════════════════════
    {
      command: '/outreach',
      label: 'Cold Outreach (LinkedIn/Email)',
      stage: 'sourcing',
      description: 'First-touch message to a passive candidate.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        const company = r.companyName || '{company_name}';
        return `Hi ${name},\n\nI came across your profile and was impressed by your background${c.company ? ' at ' + c.company : ''}. I'm currently hiring for a ${role} position at ${company}, and I think your experience could be a great fit.\n\n${r.evp || 'This is an exciting opportunity to make a real impact with a growing team.'}\n\nWould you be open to a brief conversation to learn more? Happy to work around your schedule.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/nurture',
      label: 'Pipeline Nurture (Not Ready Now)',
      stage: 'sourcing',
      description: 'Keep a candidate warm who isn\'t ready to move yet.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        return `Hi ${name},\n\nI completely understand that the timing isn't right for a move. I wanted to stay connected because I genuinely believe your background is impressive, and I'd love to keep you in mind for future opportunities that align with your goals.\n\nNo pressure at all — if anything changes on your end or you'd like to explore options down the line, I'm always happy to chat.\n\nWishing you all the best in the meantime.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/jobalert',
      label: 'Job Alert / New Opening',
      stage: 'sourcing',
      description: 'Notify past applicants or subscribers about a new role.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        const company = r.companyName || '{company_name}';
        return `Hi ${name},\n\nI hope you've been well since we last connected. I'm reaching out because we've just opened a new ${role} position at ${company} that I think could be a fantastic fit for your skills and experience.\n\nHere are a few highlights:\n${r.sellingPoints || '• Competitive compensation and benefits\n• Collaborative team environment\n• Opportunity for growth and impact'}\n\nWould you be interested in learning more? I'd love to reconnect and share the details.\n\nBest regards,\n{signature}`;
      }
    },

    // ═══════════════════════════════════════════════════════════════════
    // STAGE 2 — Application Stage
    // ═══════════════════════════════════════════════════════════════════
    {
      command: '/app-received',
      label: 'Application Received',
      stage: 'application',
      description: 'Acknowledge receipt of a candidate\'s application.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        const company = r.companyName || '{company_name}';
        return `Hi ${name},\n\nThank you for applying for the ${role} position at ${company}. We've received your application and appreciate the time you took to submit it.\n\nOur team is currently reviewing all applications, and we'll be in touch within the next {timeline} with an update on next steps.\n\nIn the meantime, feel free to reach out if you have any questions.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/app-review',
      label: 'Application Under Review',
      stage: 'application',
      description: 'Let candidate know their application is being reviewed.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        return `Hi ${name},\n\nI wanted to give you a quick update — your application for the ${role} position is currently under review by our hiring team. We're carefully evaluating all candidates and appreciate your patience.\n\nWe expect to have an update for you by {timeline}. Thank you for your continued interest.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/app-info',
      label: 'Request Additional Information',
      stage: 'application',
      description: 'Ask candidate for portfolio, certifications, or other docs.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        return `Hi ${name},\n\nThank you for your application for the ${role} role. As we review your profile, we'd like to request some additional information to help us better evaluate your candidacy:\n\n• {requested_documents}\n\nCould you please share these at your earliest convenience? You can reply directly to this email or upload them through {upload_link}.\n\nPlease don't hesitate to reach out if you have any questions.\n\nBest regards,\n{signature}`;
      }
    },

    // ═══════════════════════════════════════════════════════════════════
    // STAGE 3 — CV/Resume Screening Outcome
    // ═══════════════════════════════════════════════════════════════════
    {
      command: '/cv-shortlisted',
      label: 'CV Shortlisted — Moving Forward',
      stage: 'cvscreen',
      description: 'Inform candidate their CV has been shortlisted.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        return `Hi ${name},\n\nGreat news — after reviewing your application for the ${role} position, we're impressed with your background and would like to move you forward in our process.\n\nThe next step is a screening call where we can learn more about your experience and share details about the role. I'll be reaching out shortly to schedule a time that works for you.\n\nLooking forward to connecting.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/cv-rejected',
      label: 'CV Not a Fit',
      stage: 'cvscreen',
      description: 'Respectfully decline after CV screening.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        const company = r.companyName || '{company_name}';
        return `Hi ${name},\n\nThank you for your interest in the ${role} position at ${company} and for the time you invested in your application.\n\nAfter careful review, we've decided to move forward with candidates whose experience more closely aligns with the current requirements for this role. This was not an easy decision, as we received many strong applications.\n\nWe'd love to keep your details on file for future opportunities that may be a better match. We encourage you to check our careers page for new openings.\n\nWishing you all the best in your search.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/cv-hold',
      label: 'CV On Hold / Talent Pool',
      stage: 'cvscreen',
      description: 'Keep candidate in talent pool for future roles.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        return `Hi ${name},\n\nThank you for applying for the ${role} position. While we're not able to move forward with your application for this particular role at this time, we were impressed by your profile.\n\nWe'd like to keep your details in our talent pool for future opportunities that may be a strong match. If a relevant role opens up, we'll be sure to reach out.\n\nThank you for your interest, and please don't hesitate to apply for other positions that catch your eye.\n\nBest regards,\n{signature}`;
      }
    },

    // ═══════════════════════════════════════════════════════════════════
    // STAGE 4 — Screening Call Scheduling
    // ═══════════════════════════════════════════════════════════════════
    {
      command: '/screen-invite',
      label: 'Screening Call Invite',
      stage: 'screening',
      description: 'Invite candidate to a screening call.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        return `Hi ${name},\n\nThank you for your interest in the ${role} position. We'd love to schedule a screening call to learn more about your experience and share details about the role and team.\n\nThe call will take approximately 20-30 minutes. Please select a time that works for you using this link: {scheduling_link}\n\nAlternatively, here are a few slots that work on my end:\n• {time_slot_1}\n• {time_slot_2}\n• {time_slot_3}\n\nLooking forward to speaking with you.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/screen-reschedule',
      label: 'Screening Call Reschedule',
      stage: 'screening',
      description: 'Reschedule a screening call.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        return `Hi ${name},\n\nI understand that schedules can change. No problem at all — let's find a new time for our screening call.\n\nPlease choose a time that works better for you: {scheduling_link}\n\nOr let me know your availability and I'll do my best to accommodate.\n\nLooking forward to connecting.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/screen-reminder',
      label: 'Screening Call Reminder',
      stage: 'screening',
      description: 'Remind candidate about upcoming screening call.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        return `Hi ${name},\n\nJust a friendly reminder that we have our screening call scheduled for {interview_date} at {interview_time}.\n\nHere are the details:\n• Call link: {meeting_link}\n• Duration: ~20-30 minutes\n• Role: ${role}\n\nPlease let me know if you need to reschedule. Otherwise, looking forward to speaking with you!\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/screen-noshow',
      label: 'Screening No-Show Follow-Up',
      stage: 'screening',
      description: 'Follow up after a missed screening call.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        return `Hi ${name},\n\nI had our screening call on the calendar for {interview_date} at {interview_time}, but it looks like we weren't able to connect. I hope everything is okay.\n\nI'd still love to speak with you about this opportunity. Would you like to reschedule? Here are a few alternate times:\n• {time_slot_1}\n• {time_slot_2}\n\nPlease let me know if you're still interested, and we'll get something on the calendar.\n\nBest regards,\n{signature}`;
      }
    },

    // ═══════════════════════════════════════════════════════════════════
    // STAGE 5 — Post-Screening Outcome
    // ═══════════════════════════════════════════════════════════════════
    {
      command: '/screen-pass',
      label: 'Moving Forward After Screening',
      stage: 'postscreen',
      description: 'Advance candidate after successful screening.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        return `Hi ${name},\n\nThank you for taking the time to speak with me about the ${role} role. I really enjoyed our conversation and learning more about your background.\n\nI'm pleased to let you know that we'd like to move you forward to the next stage of our process. The next step will be {next_step}. I'll follow up shortly with scheduling details.\n\nIn the meantime, please let me know if you have any questions.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/screen-reject',
      label: 'Rejected After Screening',
      stage: 'postscreen',
      description: 'Decline candidate after screening call.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        const company = r.companyName || '{company_name}';
        return `Hi ${name},\n\nThank you for taking the time to speak with me about the ${role} position at ${company}. I genuinely enjoyed our conversation and learning about your experience.\n\nAfter careful consideration, we've decided to move forward with other candidates whose profiles more closely match the specific requirements for this role. This is no reflection on your talent — the decision was a tough one.\n\nI'd love to keep in touch for future opportunities. Wishing you all the best in your search.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/screen-waitlist',
      label: 'Waitlisted After Screening',
      stage: 'postscreen',
      description: 'Put candidate on hold after screening.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        return `Hi ${name},\n\nThank you for the great conversation about the ${role} role. I appreciate the time you shared with me.\n\nAt this point, we're continuing to evaluate a number of candidates and haven't made a final decision yet. Your profile is still under active consideration, and I'll be in touch as soon as we have an update.\n\nI appreciate your patience, and please don't hesitate to reach out with any questions.\n\nBest regards,\n{signature}`;
      }
    },

    // ═══════════════════════════════════════════════════════════════════
    // STAGE 6 — Assessment / Test Stage
    // ═══════════════════════════════════════════════════════════════════
    {
      command: '/assess-invite',
      label: 'Assessment / Test Invitation',
      stage: 'assessment',
      description: 'Send technical test or assignment to candidate.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        return `Hi ${name},\n\nAs the next step in the ${role} hiring process, we'd like to invite you to complete a {assessment_type}. This will help us better understand your skills and approach.\n\nHere are the details:\n• Assessment: {assessment_name}\n• Link: {assessment_link}\n• Deadline: {assessment_deadline}\n• Estimated time: {assessment_duration}\n\nPlease take your time and do your best — there are no trick questions. If you have any questions or need accommodations, don't hesitate to reach out.\n\nGood luck!\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/assess-reminder',
      label: 'Assessment Deadline Reminder',
      stage: 'assessment',
      description: 'Remind candidate about upcoming assessment deadline.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        return `Hi ${name},\n\nJust a friendly reminder that the deadline for your assessment is coming up on {assessment_deadline}.\n\nIf you've already submitted, please disregard this message. If you need more time or have any questions, please let me know — we're happy to accommodate.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/assess-received',
      label: 'Assessment Submission Confirmation',
      stage: 'assessment',
      description: 'Confirm receipt of completed assessment.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        return `Hi ${name},\n\nThank you for completing the assessment. We've received your submission and our team will be reviewing it shortly.\n\nWe aim to have feedback within {timeline}. I'll be in touch as soon as we have an update on next steps.\n\nAppreciate your effort and time.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/assess-result',
      label: 'Assessment Results / Outcome',
      stage: 'assessment',
      description: 'Share assessment results with candidate.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        return `Hi ${name},\n\nThank you for completing the assessment for the ${role} role. Our team has finished reviewing your submission.\n\n{assessment_feedback}\n\nBased on the results, we'd like to {next_action}. I'll be in touch with details shortly.\n\nBest regards,\n{signature}`;
      }
    },

    // ═══════════════════════════════════════════════════════════════════
    // STAGE 7 — Interview Rounds
    // ═══════════════════════════════════════════════════════════════════
    {
      command: '/int-schedule',
      label: 'Interview Scheduling',
      stage: 'interview',
      description: 'Schedule an interview round.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        return `Hi ${name},\n\nWe're excited to invite you to the next stage of the interview process for the ${role} role.\n\nPlease select a time that works for you: {scheduling_link}\n\nAlternatively, here are some available slots:\n• {time_slot_1}\n• {time_slot_2}\n• {time_slot_3}\n\nThe interview will last approximately {interview_duration} and will be conducted by {interviewer_name}.\n\nLooking forward to it!\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/int-confirm',
      label: 'Interview Confirmation with Details',
      stage: 'interview',
      description: 'Confirm interview with panel names, location/link, agenda.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        return `Hi ${name},\n\nYour interview for the ${role} position is confirmed. Here are the details:\n\n• Date: {interview_date}\n• Time: {interview_time}\n• Format: {interview_format}\n• Location/Link: {meeting_link}\n• Duration: {interview_duration}\n• Interviewer(s): {interviewer_name}\n\nAgenda:\n{interview_agenda}\n\nPlease let me know if you have any questions or need to make changes. Wishing you the best of luck!\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/int-reschedule',
      label: 'Interview Rescheduling',
      stage: 'interview',
      description: 'Reschedule an interview.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        return `Hi ${name},\n\nI'm writing to let you know that we need to reschedule your upcoming interview originally set for {interview_date}. I apologize for any inconvenience.\n\nHere are some alternative times:\n• {time_slot_1}\n• {time_slot_2}\n• {time_slot_3}\n\nOr feel free to select a time here: {scheduling_link}\n\nThank you for your understanding, and sorry again for the change.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/int-reminder',
      label: 'Interview Reminder',
      stage: 'interview',
      description: 'Day-before or morning-of interview reminder.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        return `Hi ${name},\n\nJust a friendly reminder about your interview tomorrow for the ${role} role.\n\n• Date: {interview_date}\n• Time: {interview_time}\n• Link/Location: {meeting_link}\n• Interviewer(s): {interviewer_name}\n\nIf you have any last-minute questions, feel free to reach out. Best of luck — we're looking forward to meeting with you!\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/int-noshow',
      label: 'Interview No-Show Follow-Up',
      stage: 'interview',
      description: 'Follow up after a missed interview.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        return `Hi ${name},\n\nWe had an interview scheduled for {interview_date} at {interview_time}, but unfortunately we weren't able to connect. I hope everything is alright on your end.\n\nIf you're still interested in the opportunity, I'd be happy to reschedule. Please let me know your availability and we'll find a time that works.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/int-thankyou',
      label: 'Post-Interview Thank You',
      stage: 'interview',
      description: 'Thank candidate after an interview round.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        return `Hi ${name},\n\nThank you for taking the time to interview for the ${role} position. It was great meeting you, and we appreciated hearing about your experience and perspective.\n\nOur team is currently deliberating and we expect to have feedback for you by {timeline}. I'll be in touch as soon as we have an update.\n\nThanks again for your time and interest.\n\nBest regards,\n{signature}`;
      }
    },

    // ═══════════════════════════════════════════════════════════════════
    // STAGE 8 — Post-Interview Outcome
    // ═══════════════════════════════════════════════════════════════════
    {
      command: '/int-reject',
      label: 'Rejected After Interview',
      stage: 'postinterview',
      description: 'Decline candidate after an interview round.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        const company = r.companyName || '{company_name}';
        return `Hi ${name},\n\nThank you so much for taking the time to interview for the ${role} position at ${company}. We truly enjoyed getting to know you and learning about your experience.\n\nAfter thorough deliberation, we've decided to move forward with another candidate for this particular role. This was a very competitive process and this decision was not easy.\n\nYour skills are impressive and I'd love to keep you in mind for future opportunities. I wish you the very best in your career.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/int-nextround',
      label: 'Moved to Next Round',
      stage: 'postinterview',
      description: 'Advance candidate to the next interview round.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        return `Hi ${name},\n\nI have great news — the team was very impressed with your interview for the ${role} role, and we'd like to invite you to the next round.\n\nThe next stage will involve {next_step}. I'll be reaching out shortly with scheduling details.\n\nCongratulations on making it this far, and please let me know if you have any questions.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/int-pending',
      label: 'Final Round — Decision Pending',
      stage: 'postinterview',
      description: 'Update candidate that final decision is in progress.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        return `Hi ${name},\n\nThank you for completing all interview rounds for the ${role} position. You've made a strong impression on the team.\n\nWe're currently in our final deliberation phase and expect to have a decision by {timeline}. I know the waiting can be tough, and I appreciate your patience.\n\nI'll be in touch as soon as we have news.\n\nBest regards,\n{signature}`;
      }
    },

    // ═══════════════════════════════════════════════════════════════════
    // STAGE 9 — Reference & Background Check
    // ═══════════════════════════════════════════════════════════════════
    {
      command: '/ref-request',
      label: 'Reference Check Request',
      stage: 'reference',
      description: 'Ask candidate for referee details.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        return `Hi ${name},\n\nAs part of our process for the ${role} role, we'd like to conduct reference checks. Could you please provide the contact details of 2-3 professional references? Ideally, these would include:\n\n• A direct manager from a recent role\n• A colleague or cross-functional partner\n• Any additional reference you feel would speak to your strengths\n\nFor each, we'll need their name, title, company, email, and phone number.\n\nPlease let me know if you have any questions or concerns.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/ref-outreach',
      label: 'Reference Outreach to Referee',
      stage: 'reference',
      description: 'Contact a referee for a reference check.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        const company = r.companyName || '{company_name}';
        return `Hi {referee_name},\n\n${c.name || '{candidate_name}'} has listed you as a professional reference as part of their application for the ${role} position at ${company}.\n\nWould you be available for a brief 10-15 minute call to share your experience working with ${name}? Alternatively, I can send you a short reference form if that's more convenient.\n\nPlease let me know what works best for you. I appreciate your time.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/bg-initiate',
      label: 'Background Check Initiation',
      stage: 'reference',
      description: 'Request candidate consent for background verification.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const company = r.companyName || '{company_name}';
        return `Hi ${name},\n\nAs part of our pre-employment process at ${company}, we conduct a standard background verification. This includes verification of employment history, education, and a criminal background check.\n\nPlease review and complete the consent form here: {bg_check_link}\n\nAll information is kept strictly confidential and handled in accordance with applicable laws and our privacy policy.\n\nPlease let me know if you have any questions.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/bg-update',
      label: 'Background Check Status Update',
      stage: 'reference',
      description: 'Update candidate on background check progress.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        return `Hi ${name},\n\nI wanted to give you a quick update on your background verification. {bg_status}\n\nWe expect the process to be completed by {timeline}. I'll keep you posted on progress, and please don't hesitate to reach out if you have any questions.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/bg-complete',
      label: 'Background Check Complete',
      stage: 'reference',
      description: 'Confirm background check is complete.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        return `Hi ${name},\n\nI'm pleased to confirm that your background verification has been completed successfully. Everything has cleared, and we're ready to proceed with the next steps.\n\nI'll be in touch shortly with further details.\n\nBest regards,\n{signature}`;
      }
    },

    // ═══════════════════════════════════════════════════════════════════
    // STAGE 10 — Documentation
    // ═══════════════════════════════════════════════════════════════════
    {
      command: '/doc-request',
      label: 'Document Collection Request',
      stage: 'documentation',
      description: 'Request ID, education certs, bank details, emergency contact.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const company = r.companyName || '{company_name}';
        return `Hi ${name},\n\nCongratulations on joining ${company}! To complete your onboarding paperwork, we'll need the following documents:\n\n• Government-issued photo ID (passport or national ID)\n• Proof of address (utility bill or bank statement, dated within 3 months)\n• Educational certificates / transcripts\n• Bank account details for payroll setup\n• Emergency contact information\n• {additional_documents}\n\nPlease submit these via {upload_link} by {deadline}. All documents are stored securely and handled in strict confidence.\n\nLet me know if you have any questions.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/doc-received',
      label: 'Document Receipt Confirmation',
      stage: 'documentation',
      description: 'Confirm you\'ve received candidate\'s documents.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        return `Hi ${name},\n\nThank you for submitting your documents. I can confirm we've received everything on our end.\n\nOur team will review them and follow up if anything additional is needed. Otherwise, you're all set on the documentation front.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/doc-missing',
      label: 'Missing Document Follow-Up',
      stage: 'documentation',
      description: 'Remind candidate about missing documents.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        return `Hi ${name},\n\nJust a quick follow-up — we're still missing a few items from your documentation submission:\n\n• {missing_documents}\n\nCould you please share these by {deadline}? This will help us keep your onboarding on track.\n\nIf you're having trouble with any of the items, let me know and I'll do my best to help.\n\nBest regards,\n{signature}`;
      }
    },

    // ═══════════════════════════════════════════════════════════════════
    // STAGE 11 — Offer Stage
    // ═══════════════════════════════════════════════════════════════════
    {
      command: '/offer-formal',
      label: 'Formal Offer Letter',
      stage: 'offer',
      description: 'Send formal offer letter to candidate.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        const company = r.companyName || '{company_name}';
        return `Hi ${name},\n\nOn behalf of ${company}, I'm delighted to extend a formal offer for the position of ${role}.\n\nPlease find your offer letter attached. Here's a summary of the key terms:\n\n• Position: ${role}\n• Start Date: {start_date}\n• Compensation: {compensation}\n• Benefits: {benefits_summary}\n\nPlease review the offer carefully. If you have any questions or would like to discuss any of the terms, I'm here to help.\n\nWe'd appreciate your response by {offer_deadline}.\n\nWe're really excited about the possibility of you joining the team!\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/offer-clarify',
      label: 'Offer Clarification / Q&A',
      stage: 'offer',
      description: 'Address candidate questions about the offer.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        return `Hi ${name},\n\nThank you for your questions about the offer. I'm happy to clarify:\n\n{offer_clarifications}\n\nPlease don't hesitate to ask if there's anything else you'd like to discuss. We want to make sure you have all the information you need to make your decision.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/offer-negotiate',
      label: 'Offer Negotiation',
      stage: 'offer',
      description: 'Respond to candidate\'s negotiation or counter-offer.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        return `Hi ${name},\n\nThank you for sharing your thoughts on the offer. We value transparency and appreciate you being open about your expectations.\n\nI've discussed your feedback with the team, and here's what we can offer:\n\n{negotiation_response}\n\nWe believe this reflects both your value and our commitment to fairness. I'd love to discuss this further if you'd like to talk it through.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/offer-revised',
      label: 'Revised Offer Letter',
      stage: 'offer',
      description: 'Send updated offer after negotiation.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        return `Hi ${name},\n\nFollowing our conversation, I'm pleased to share a revised offer for the ${role} position. The updated terms are:\n\n{revised_terms}\n\nPlease find the revised offer letter attached. We'd appreciate your response by {offer_deadline}.\n\nI hope these changes reflect our mutual understanding. Please reach out if you'd like to discuss anything further.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/offer-accepted',
      label: 'Offer Acceptance Confirmation',
      stage: 'offer',
      description: 'Confirm candidate has accepted the offer.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const company = r.companyName || '{company_name}';
        return `Hi ${name},\n\nThis is wonderful news — we're thrilled to confirm your acceptance of the offer! Welcome to ${company}!\n\nHere are the next steps:\n• Start date: {start_date}\n• You'll receive onboarding documentation from our team shortly\n• Your point of contact during the transition is {onboarding_contact}\n\nWe're so excited to have you join us. If you have any questions between now and your start date, don't hesitate to reach out.\n\nWelcome aboard!\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/offer-declined',
      label: 'Offer Declined — Feedback Request',
      stage: 'offer',
      description: 'Respond when candidate declines and ask for feedback.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        return `Hi ${name},\n\nThank you for letting us know about your decision regarding the ${role} position. While we're disappointed, we completely respect your choice.\n\nIf you're open to it, I'd love to hear any feedback about the process or what influenced your decision. This helps us improve and ensure a great experience for all candidates.\n\nI'd also love to stay connected — if circumstances change in the future, we'd welcome the chance to work together.\n\nWishing you all the best.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/offer-withdraw',
      label: 'Offer Withdrawal (by Company)',
      stage: 'offer',
      description: 'Withdraw an offer the company previously made.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        const company = r.companyName || '{company_name}';
        return `Hi ${name},\n\nI'm writing to share some unfortunate news. After further review, we've had to make the difficult decision to withdraw our offer for the ${role} position at ${company}.\n\n{withdrawal_reason}\n\nI understand this is disappointing, and I sincerely apologize for any inconvenience this may cause. Your talent and professionalism throughout this process have been truly impressive.\n\nI would love to stay connected and will reach out should future opportunities arise that align with your profile.\n\nWith sincere apologies,\n{signature}`;
      }
    },

    // ═══════════════════════════════════════════════════════════════════
    // STAGE 12 — Visa & Relocation
    // ═══════════════════════════════════════════════════════════════════
    {
      command: '/visa-docs',
      label: 'Visa Document Requirements',
      stage: 'visa',
      description: 'Inform candidate about visa documentation needed.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        return `Hi ${name},\n\nTo initiate the visa sponsorship process, we'll need the following documents:\n\n• Valid passport (with at least 12 months validity)\n• Current visa/immigration status documentation\n• Educational degree certificates and transcripts\n• Employment verification letters from previous employers\n• {additional_visa_docs}\n\nPlease submit these via {upload_link} at your earliest convenience so we can begin the process promptly.\n\nLet me know if you have any questions.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/visa-confirm',
      label: 'Visa Sponsorship Confirmation',
      stage: 'visa',
      description: 'Confirm company will sponsor visa.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const company = r.companyName || '{company_name}';
        return `Hi ${name},\n\nI'm pleased to confirm that ${company} will be sponsoring your visa for the {visa_type}. Our immigration partner, {immigration_firm}, will be handling the process.\n\nYou can expect to hear from them within {timeline} regarding next steps and any additional documentation required.\n\nWe're committed to making this process as smooth as possible. Please don't hesitate to reach out with any questions.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/visa-status',
      label: 'Visa Application Status Update',
      stage: 'visa',
      description: 'Update candidate on visa application progress.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        return `Hi ${name},\n\nI wanted to give you an update on your visa application:\n\n{visa_status_update}\n\nWe're monitoring the progress closely and will keep you informed of any developments. If you need anything from our end, please let me know.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/relo-policy',
      label: 'Relocation Support / Policy',
      stage: 'visa',
      description: 'Share relocation support details and policy.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const company = r.companyName || '{company_name}';
        return `Hi ${name},\n\nI'm excited to share the details of our relocation support package at ${company}:\n\n{relocation_package}\n\nWe want to make your transition as smooth as possible. Our relocation coordinator, {relo_contact}, will be reaching out to help with logistics.\n\nPlease let me know if you have any questions or special requirements.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/relo-logistics',
      label: 'Relocation Logistics Coordination',
      stage: 'visa',
      description: 'Coordinate specific relocation logistics.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        return `Hi ${name},\n\nI wanted to check in on your relocation plans. Here are a few things to coordinate:\n\n• Moving date: {moving_date}\n• Temporary accommodation: {temp_housing}\n• Shipping arrangements: {shipping_details}\n• Local orientation: {orientation_details}\n\nPlease let me know if there's anything else we can assist with. We want to make sure everything is in order before your start date.\n\nBest regards,\n{signature}`;
      }
    },

    // ═══════════════════════════════════════════════════════════════════
    // STAGE 13 — Engagement / Keep Warm
    // ═══════════════════════════════════════════════════════════════════
    {
      command: '/keepwarm',
      label: 'Keep-Warm Check-In',
      stage: 'keepwarm',
      description: 'Touch base with a candidate between stages.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const company = r.companyName || '{company_name}';
        return `Hi ${name},\n\nI just wanted to check in and see how you're doing. I know there's been a bit of time since we last spoke, and I want you to know we haven't forgotten about you.\n\n${company} is still very interested in your profile, and we're working on finalizing next steps. I expect to have an update for you by {timeline}.\n\nIn the meantime, please feel free to reach out with any questions.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/reengage',
      label: 'Re-Engagement Message',
      stage: 'keepwarm',
      description: 'Re-engage a candidate who went quiet.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        return `Hi ${name},\n\nIt's been a while since we last connected regarding the ${role} opportunity, and I wanted to reach out to see where things stand on your end.\n\nAre you still open to exploring this role? If your situation has changed, I completely understand — no pressure at all. But if there's still interest, I'd love to pick up where we left off.\n\nLooking forward to hearing from you.\n\nBest regards,\n{signature}`;
      }
    },

    // ═══════════════════════════════════════════════════════════════════
    // STAGE 14 — Pre-Boarding
    // ═══════════════════════════════════════════════════════════════════
    {
      command: '/welcome-email',
      label: 'Welcome Email',
      stage: 'preboarding',
      description: 'Send welcome message after offer acceptance.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const company = r.companyName || '{company_name}';
        return `Hi ${name},\n\nWelcome to ${company}! We're absolutely thrilled to have you joining the team.\n\nBetween now and your first day, our team will be in touch with everything you need to know. In the meantime, here's a quick overview of what to expect:\n\n• You'll receive documentation and onboarding paperwork\n• IT will coordinate your equipment and system access\n• Your manager and team will prepare for your arrival\n\nIf you have any questions before your start date, I'm always here to help.\n\nWelcome aboard!\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/start-confirm',
      label: 'Start Date Confirmation',
      stage: 'preboarding',
      description: 'Confirm the agreed start date.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        return `Hi ${name},\n\nI'm writing to confirm your start date: {start_date}.\n\nPlease plan to arrive at {office_address} by {arrival_time}. I'll meet you at reception and walk you through the Day 1 schedule.\n\nIf anything changes or you have questions, please let me know.\n\nLooking forward to seeing you!\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/it-setup',
      label: 'IT Equipment / Laptop Coordination',
      stage: 'preboarding',
      description: 'Coordinate laptop and IT equipment.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        return `Hi ${name},\n\nOur IT team is preparing your equipment for Day 1. To help them set things up, could you please confirm:\n\n• Preferred laptop type (if applicable): {laptop_options}\n• Any specific software or tools you'll need\n• Your preferred keyboard layout\n• Delivery address (if working remotely initially)\n\nPlease respond by {deadline} so everything is ready for your first day.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/access-setup',
      label: 'System Access & Account Setup',
      stage: 'preboarding',
      description: 'Send instructions for system access and account setup.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        return `Hi ${name},\n\nTo get you set up ahead of your start date, here are your system access details:\n\n• Email: {work_email}\n• Temporary password: {temp_password} (you'll be prompted to change this on first login)\n• VPN setup instructions: {vpn_link}\n• Key systems to access: {systems_list}\n\nPlease complete the setup by {deadline}. If you run into any issues, our IT helpdesk is available at {it_helpdesk}.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/pre-checklist',
      label: 'Pre-Joining Checklist',
      stage: 'preboarding',
      description: 'What to bring, dress code, parking info.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        return `Hi ${name},\n\nYour first day is coming up and we want to make sure you're fully prepared! Here's your pre-joining checklist:\n\n• What to bring: Government-issued ID, bank details for payroll, any signed documents\n• Dress code: {dress_code}\n• Parking: {parking_info}\n• Building access: {building_access}\n• First day timing: Arrive by {arrival_time} at {office_address}\n\nIf you have any questions, don't hesitate to ask. We can't wait to have you on board!\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/buddy-intro',
      label: 'Team Intro / Buddy Assignment',
      stage: 'preboarding',
      description: 'Introduce the buddy or team before Day 1.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        return `Hi ${name},\n\nI'm excited to introduce you to your onboarding buddy: {buddy_name}, {buddy_title}. They'll be your go-to person during your first few weeks for any questions — from navigating the office to understanding team dynamics.\n\nI've CC'd {buddy_name} on this email so you can connect ahead of your start date.\n\nYou'll also be joining the {team_name} team. Here's a quick overview of the team:\n{team_overview}\n\nLooking forward to your first day!\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/week1-schedule',
      label: 'First Week Schedule / Agenda',
      stage: 'preboarding',
      description: 'Share the schedule for the first week.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        return `Hi ${name},\n\nHere's your schedule for the first week:\n\n{first_week_schedule}\n\nThe first few days are focused on orientation, meeting the team, and getting familiar with our tools and processes. There's no pressure to dive into project work right away.\n\nIf you have any questions or dietary requirements for team lunches, let me know!\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/join-reminder',
      label: 'Joining Reminder',
      stage: 'preboarding',
      description: 'Reminder a week before or day before start date.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const company = r.companyName || '{company_name}';
        return `Hi ${name},\n\nJust a quick reminder — your first day at ${company} is {start_date}! We're really looking forward to welcoming you.\n\nQuick recap:\n• Time: {arrival_time}\n• Location: {office_address}\n• Contact on arrival: {day1_contact}\n\nIf you have any last-minute questions, feel free to reach out. See you soon!\n\nBest regards,\n{signature}`;
      }
    },

    // ═══════════════════════════════════════════════════════════════════
    // STAGE 15 — Onboarding
    // ═══════════════════════════════════════════════════════════════════
    {
      command: '/day1-welcome',
      label: 'Day 1 Welcome & Logistics',
      stage: 'onboarding',
      description: 'Welcome message with Day 1 logistics.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const company = r.companyName || '{company_name}';
        return `Hi ${name},\n\nWelcome to your first day at ${company}! We're so excited to have you here.\n\nHere's what's on the agenda for today:\n{day1_agenda}\n\nYour workspace is set up and ready. If you need anything at all — from a coffee run to IT help — just ask me or your buddy, {buddy_name}.\n\nHere's to a great start!\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/onboard-schedule',
      label: 'Onboarding Schedule & Training Plan',
      stage: 'onboarding',
      description: 'Share the full onboarding and training plan.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        return `Hi ${name},\n\nNow that you're settling in, here's an overview of your onboarding and training plan for the coming weeks:\n\n{onboarding_plan}\n\nThe goal is to get you ramped up at a comfortable pace. There's no expectation to master everything on day one — take the time you need.\n\nYour key contacts during onboarding:\n• Manager: {hiring_manager}\n• Buddy: {buddy_name}\n• HR: {hr_contact}\n\nDon't hesitate to reach out with questions at any point.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/hr-orientation',
      label: 'HR Orientation Details',
      stage: 'onboarding',
      description: 'HR orientation logistics and requirements.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        return `Hi ${name},\n\nYour HR orientation is scheduled for {orientation_date} at {orientation_time}. Here's what we'll cover:\n\n• Company policies and handbook review\n• Benefits enrollment and options\n• Payroll setup and tax forms\n• Health and safety overview\n• Q&A session\n\nPlease bring any outstanding documents and your government-issued ID.\n\nLocation: {orientation_location}\nDuration: Approximately {orientation_duration}\n\nSee you there!\n\nBest regards,\n{signature}`;
      }
    },

    // ═══════════════════════════════════════════════════════════════════
    // STAGE 16 — Candidate Experience & Misc
    // ═══════════════════════════════════════════════════════════════════
    {
      command: '/survey',
      label: 'Candidate Experience Survey',
      stage: 'experience',
      description: 'Request feedback on the hiring experience.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const company = r.companyName || '{company_name}';
        return `Hi ${name},\n\nThank you for being part of our hiring process at ${company}. Regardless of the outcome, your experience matters to us, and we'd love your honest feedback.\n\nCould you take 2-3 minutes to complete this short survey? {survey_link}\n\nYour responses are anonymous and will directly help us improve our process for future candidates.\n\nThank you for your time.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/withdrawal-ack',
      label: 'Withdrawal Acknowledgment',
      stage: 'experience',
      description: 'Acknowledge when a candidate drops out.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        return `Hi ${name},\n\nThank you for letting us know about your decision to withdraw from the ${role} process. We completely understand, and I appreciate your transparency.\n\nIf you're comfortable sharing, I'd welcome any feedback about the process or your decision — it helps us improve.\n\nI'd love to stay connected. If your situation changes or another opportunity catches your eye, please don't hesitate to reach out.\n\nWishing you all the best.\n\nBest regards,\n{signature}`;
      }
    },
    {
      command: '/reconnect',
      label: 'Re-Engagement / Reconnect',
      stage: 'experience',
      description: 'Reconnect with a past candidate for a new opportunity.',
      generate: (c, r, tone) => {
        const name = firstName(c.name);
        const role = r.title || '{role_title}';
        const company = r.companyName || '{company_name}';
        return `Hi ${name},\n\nI hope you've been doing well since we last connected. I'm reaching out because a new ${role} opportunity has opened at ${company} that immediately made me think of you.\n\nI know the timing might not have been right before, but I wanted to make sure this was on your radar in case things have changed.\n\nWould you be open to a quick chat to hear more? No pressure at all.\n\nBest regards,\n{signature}`;
      }
    },
  ];

  // ─── Public Methods ───────────────────────────────────────────────
  function getStages() { return STAGES; }
  function getAllShortcuts() { return SHORTCUTS; }

  function getShortcutsByStage(stageId) {
    return SHORTCUTS.filter(s => s.stage === stageId);
  }

  function findShortcut(command) {
    const clean = command.startsWith('/') ? command : '/' + command;
    return SHORTCUTS.find(s => s.command === clean);
  }

  function searchShortcuts(query) {
    if (!query) return SHORTCUTS;
    const q = query.toLowerCase();
    return SHORTCUTS.filter(s =>
      s.command.toLowerCase().includes(q) ||
      s.label.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.stage.toLowerCase().includes(q)
    );
  }

  function generateMessage(command, candidateCtx = {}, roleCtx = {}, tone = 'professional') {
    const shortcut = findShortcut(command);
    if (!shortcut) return '';
    return shortcut.generate(candidateCtx, roleCtx, tone);
  }

  // ─── Smart Suggestions ────────────────────────────────────────────
  function suggestNext(pipeline, timeSinceMs) {
    const suggestions = [];
    const stage = (pipeline.stage || '').toLowerCase();
    const daysSince = timeSinceMs / (1000 * 60 * 60 * 24);

    if (!stage || stage === 'outreach') {
      if (daysSince > 3) suggestions.push('/nurture');
      suggestions.push('/screen-invite');
    } else if (stage === 'screening' || stage === 'screen-invite') {
      suggestions.push('/screen-pass', '/screen-reject');
    } else if (stage === 'screen-pass' || stage === 'assessment') {
      suggestions.push('/assess-invite', '/int-schedule');
    } else if (stage === 'interview' || stage === 'int-schedule') {
      suggestions.push('/int-thankyou', '/int-nextround', '/int-reject');
    } else if (stage === 'int-nextround') {
      suggestions.push('/int-schedule', '/ref-request');
    } else if (stage === 'reference' || stage === 'ref-request') {
      suggestions.push('/bg-initiate', '/bg-complete');
    } else if (stage === 'offer' || stage === 'offer-formal') {
      suggestions.push('/offer-accepted', '/offer-negotiate', '/offer-declined');
    } else if (stage === 'offer-accepted') {
      suggestions.push('/welcome-email', '/doc-request', '/start-confirm');
    } else if (stage === 'preboarding') {
      suggestions.push('/pre-checklist', '/buddy-intro', '/join-reminder');
    } else if (stage === 'onboarding') {
      suggestions.push('/day1-welcome', '/onboard-schedule');
    }

    // Re-engagement for stale candidates
    if (daysSince > 14 && !['offer-accepted', 'onboarding'].includes(stage)) {
      suggestions.push('/reengage');
    }

    return suggestions.length ? suggestions : ['/outreach'];
  }

  // ─── Tone Transformation Layer ─────────────────────────────────────
  // Post-processes any generated message to match the selected tone.
  // This ensures tone switching ALWAYS produces visibly different output.
  function transformTone(message, tone) {
    if (!message || tone === 'professional') return message;

    // Split message into greeting line, body, and sign-off block
    const lines = message.split('\n');
    let greetingLine = '';
    let greetingIdx = -1;
    let signoffIdx = -1;

    // Find greeting (first non-empty line)
    for (let i = 0; i < lines.length; i++) {
      const t = lines[i].trim();
      if (t) {
        greetingLine = t;
        greetingIdx = i;
        break;
      }
    }

    // Find sign-off (last block starting with typical sign-off words)
    for (let i = lines.length - 1; i >= 0; i--) {
      const t = lines[i].trim();
      if (/^(Best|Regards|Warm|Cheers|Thanks|Thank you|Sincerely|Kind|Looking forward|Wishing|Welcome|With|Take care|Talk soon)/i.test(t) || t === '{signature}') {
        signoffIdx = i;
      } else if (t && signoffIdx >= 0) {
        break;
      }
    }

    // Extract parts
    let greeting = greetingIdx >= 0 ? lines[greetingIdx] : '';
    let signoff = signoffIdx >= 0 ? lines.slice(signoffIdx).join('\n') : '';
    let bodyStart = greetingIdx >= 0 ? greetingIdx + 1 : 0;
    let bodyEnd = signoffIdx >= 0 ? signoffIdx : lines.length;
    let body = lines.slice(bodyStart, bodyEnd).join('\n').trim();

    switch (tone) {
      case 'conversational': {
        // Casual, friendly greeting
        greeting = greeting
          .replace(/^Hi\b/i, 'Hey')
          .replace(/^Dear\b/i, 'Hey')
          .replace(/^Hello\b/i, 'Hey');
        if (greeting.includes(',') && !greeting.includes('!')) {
          greeting = greeting.replace(',', '!');
        }

        // Make body casual
        body = body
          .replace(/I would like to/gi, "I'd love to")
          .replace(/Would you be open to/gi, "How about")
          .replace(/I'd like to/gi, "I'd love to")
          .replace(/Please do not hesitate/gi, "Feel free")
          .replace(/Please don't hesitate/gi, "Feel free")
          .replace(/At your earliest convenience/gi, "whenever works for you")
          .replace(/I wanted to reach out/gi, "Thought I'd reach out")
          .replace(/I'm writing to/gi, "Just wanted to")
          .replace(/I am pleased to/gi, "I'm happy to")
          .replace(/I'm pleased to/gi, "I'm happy to")
          .replace(/I'm delighted to/gi, "I'm really excited to")
          .replace(/We're delighted/gi, "We're excited")
          .replace(/We would like to/gi, "We'd love to")
          .replace(/a brief conversation/gi, "a quick chat")
          .replace(/15–20 minutes/gi, "a quick call")
          .replace(/at your convenience/gi, "whenever works")
          .replace(/I was impressed by/gi, "I was really impressed by")
          .replace(/After careful consideration/gi, "After thinking it over")
          .replace(/After thorough deliberation/gi, "After talking it over")
          .replace(/We appreciate your patience/gi, "Thanks for hanging in there")
          .replace(/Thank you for your interest/gi, "Thanks for your interest")
          .replace(/Thank you for taking the time/gi, "Thanks so much for taking the time")
          .replace(/Thank you for letting us know/gi, "Thanks for the heads up")
          .replace(/Looking forward to connecting/gi, "Can't wait to chat")
          .replace(/Looking forward to speaking/gi, "Can't wait to chat")
          .replace(/We're really excited about/gi, "We're super excited about")
          .replace(/We're absolutely thrilled/gi, "We're so thrilled")
          .replace(/Congratulations on/gi, "Congrats on");

        // Casual sign-off
        signoff = signoff
          .replace(/Best regards,/gi, 'Cheers,')
          .replace(/Warm regards,/gi, 'Cheers,')
          .replace(/Kind regards,/gi, 'Talk soon,')
          .replace(/With sincere apologies,/gi, 'Really sorry about this,')
          .replace(/Wishing you all the best\./gi, 'All the best!')
          .replace(/Wishing you all the best in your search\./gi, 'Best of luck out there!')
          .replace(/Wishing you the very best/gi, 'Best of luck')
          .replace(/Welcome aboard!/gi, 'Welcome to the team! 🎉');
        break;
      }

      case 'bold': {
        // Direct, no-fluff greeting
        greeting = greeting
          .replace(/^Hi\s+/i, '')
          .replace(/^Hey\s+/i, '')
          .replace(/^Hello\s+/i, '')
          .replace(/^Dear\s+/i, '');
        // If just a name remaining, add dash
        const nameOnly = greeting.replace(/[,!]?\s*$/, '').trim();
        if (nameOnly && !/[.—\-]/.test(nameOnly)) {
          greeting = nameOnly + ' —';
        }

        // Punchy, direct body
        body = body
          .replace(/I came across your profile and was impressed by your background[^.]*\./gi, "Your background stood out.")
          .replace(/I wanted to reach out because/gi, "Here's why I'm reaching out:")
          .replace(/I'm writing to let you know/gi, "Quick update:")
          .replace(/I'm writing to share/gi, "Straight to it:")
          .replace(/I just wanted to check in/gi, "Checking in.")
          .replace(/Just a friendly reminder/gi, "Reminder:")
          .replace(/Just a quick follow-up/gi, "Following up.")
          .replace(/I hope everything is okay/gi, "Hope you're well")
          .replace(/I hope you've been well since/gi, "It's been a while since")
          .replace(/I hope you're doing well\.\s*/gi, '')
          .replace(/I hope this message finds you well\.\s*/gi, '')
          .replace(/We genuinely enjoyed/gi, "We enjoyed")
          .replace(/I genuinely enjoyed/gi, "I enjoyed")
          .replace(/I really enjoyed/gi, "I enjoyed")
          .replace(/I truly enjoyed/gi, "I enjoyed")
          .replace(/We truly enjoyed/gi, "We enjoyed")
          .replace(/I sincerely apologize/gi, "Apologies")
          .replace(/We sincerely appreciate/gi, "We appreciate")
          .replace(/After careful consideration/gi, "After review")
          .replace(/After careful review/gi, "After review")
          .replace(/After thorough deliberation/gi, "After review")
          .replace(/This was not an easy decision/gi, "Tough call")
          .replace(/This was a very competitive process and this decision was not easy\./gi, "Highly competitive field.")
          .replace(/Would you be open to a brief conversation to learn more\?/gi, "Worth a 15-min call?")
          .replace(/Would you be interested in learning more\?/gi, "Interested?")
          .replace(/Please let me know if you have any questions or concerns\./gi, "Questions? Hit reply.")
          .replace(/Please let me know if you have any questions\./gi, "Questions? Let me know.")
          .replace(/Please don't hesitate to reach out/gi, "Reach out anytime")
          .replace(/If you have any questions/gi, "Any questions")
          .replace(/Happy to work around your schedule\./gi, "Name a time.")
          .replace(/I'd love to reconnect and share the details\./gi, "Let's talk.")
          .replace(/No pressure at all/gi, "No pressure")
          .replace(/absolutely no pressure/gi, "no pressure")
          .replace(/We're committed to making this process as smooth as possible\./gi, "We'll handle it.")
          .replace(/We want to make sure you have all the information you need to make your decision\./gi, "All info on the table.");

        // Bold sign-off
        signoff = signoff
          .replace(/Best regards,/gi, '—')
          .replace(/Warm regards,/gi, '—')
          .replace(/Kind regards,/gi, '—')
          .replace(/Wishing you all the best\./gi, '')
          .replace(/Wishing you all the best in your search\./gi, '')
          .replace(/Wishing you the very best in your career\./gi, '')
          .replace(/With sincere apologies,/gi, '—')
          .replace(/Welcome aboard!/gi, "Let's go.");
        break;
      }

      case 'executive': {
        // Minimal greeting
        greeting = greeting
          .replace(/^Hi\s+/i, '')
          .replace(/^Hey\s+/i, '')
          .replace(/^Hello\s+/i, '')
          .replace(/^Dear\s+/i, '');
        const execName = greeting.replace(/[,!]?\s*$/, '').trim();
        if (execName) {
          greeting = execName + ',';
        }

        // Strip filler, keep it tight
        body = body
          .replace(/I hope you've been well since we last connected\.\s*/gi, '')
          .replace(/I hope everything is okay\.\s*/gi, '')
          .replace(/I hope everything is alright on your end\.\s*/gi, '')
          .replace(/I hope you're doing well\.\s*/gi, '')
          .replace(/I completely understand that schedules can change\. No problem at all — /gi, '')
          .replace(/I genuinely enjoyed our conversation and learning about your experience\.\s*/gi, '')
          .replace(/I really enjoyed our conversation and learning more about your background\.\s*/gi, '')
          .replace(/We truly enjoyed getting to know you and learning about your experience\.\s*/gi, '')
          .replace(/Your skills are impressive and I'd love to keep you in mind for future opportunities\.\s*/gi, '')
          .replace(/Your talent and professionalism throughout this process have been truly impressive\.\s*/gi, '')
          .replace(/I understand this is disappointing, and I sincerely apologize for any inconvenience this may cause\.\s*/gi, 'Apologies for any inconvenience. ')
          .replace(/Thank you for taking the time to interview for/gi, "Re:")
          .replace(/Thank you for taking the time to speak with me about/gi, "Re:")
          .replace(/Thank you for your interest in the/gi, "Re:")
          .replace(/Thank you for being part of our hiring process/gi, "Thank you for interviewing")
          .replace(/We're so excited to have you join us\.\s*/gi, '')
          .replace(/We're absolutely thrilled to have you joining the team\.\s*/gi, '')
          .replace(/We're really excited about the possibility of you joining the team!\s*/gi, '')
          .replace(/If you have any questions or need to make changes\.\s*/gi, '')
          .replace(/Wishing you the best of luck!\s*/gi, '')
          .replace(/Best of luck — we're looking forward to meeting with you!\s*/gi, '');

        // Limit to 4 paragraphs max
        const paras = body.split('\n\n').filter(p => p.trim());
        if (paras.length > 4) {
          body = paras.slice(0, 4).join('\n\n');
        }

        // Executive sign-off
        signoff = signoff
          .replace(/Best regards,/gi, 'Regards,')
          .replace(/Warm regards,/gi, 'Regards,')
          .replace(/Kind regards,/gi, 'Regards,')
          .replace(/Wishing you all the best\./gi, '')
          .replace(/Wishing you all the best in your search\./gi, '')
          .replace(/With sincere apologies,/gi, 'Regards,')
          .replace(/Welcome aboard!/gi, 'Welcome.');
        break;
      }

      case 'empathetic': {
        // Warm greeting
        greeting = greeting
          .replace(/^Hey\b/i, 'Hi')
          .replace(/^Dear\b/i, 'Hi');

        // Add warmth to opening if not already warm
        if (!/hope|well|trust|doing/i.test(body.substring(0, 120))) {
          body = 'I hope you\'re doing well and that this message finds you at a good time.\n\n' + body;
        }

        // Empathetic body replacements
        body = body
          .replace(/Would you be open to/gi, "If you feel comfortable, I'd love to have")
          .replace(/Would you be interested in/gi, "If the timing feels right, I'd love to share")
          .replace(/We've decided to move forward with/gi, "We've made the really difficult decision to move forward with")
          .replace(/we've decided to move forward with other candidates/gi, "we've had to make the tough decision to move forward with other candidates")
          .replace(/This was not an easy decision/gi, "I want you to know this was one of the hardest decisions")
          .replace(/This is no reflection on your talent/gi, "This is absolutely no reflection on your talent or the value you bring")
          .replace(/the decision was a tough one/gi, "it was truly one of the hardest decisions we've had to make")
          .replace(/After careful consideration/gi, "After giving this a great deal of thought")
          .replace(/After careful review/gi, "After thoughtful consideration")
          .replace(/I know the waiting can be tough/gi, "I completely understand how nerve-wracking the waiting can be")
          .replace(/No pressure at all/gi, "There is absolutely no pressure")
          .replace(/no pressure at all/gi, "absolutely no pressure at all")
          .replace(/I was impressed by/gi, "I was truly inspired by")
          .replace(/I was impressed with/gi, "I was truly inspired by")
          .replace(/I was really impressed by/gi, "I was deeply impressed by")
          .replace(/If you're comfortable sharing/gi, "Only if you feel comfortable — and absolutely no obligation —")
          .replace(/We want to make sure/gi, "It's really important to us that")
          .replace(/We completely understand/gi, "We absolutely understand")
          .replace(/we completely respect your choice/gi, "we deeply respect your decision")
          .replace(/We're committed to/gi, "We genuinely care about")
          .replace(/Wishing you all the best in your search\./gi, "I truly wish you all the best in your career journey, and please know my door is always open.");

        // Warm sign-off
        signoff = signoff
          .replace(/Best regards,/gi, 'Warm regards,')
          .replace(/Kind regards,/gi, 'With warmth,')
          .replace(/Cheers,/gi, 'Take care,')
          .replace(/With sincere apologies,/gi, 'With heartfelt apologies,')
          .replace(/Welcome aboard!/gi, 'We are so grateful to have you. Welcome!')
          .replace(/Wishing you all the best\./gi, 'Wishing you every success and happiness.');
        break;
      }
    }

    // Rebuild
    const result = [];
    if (greeting) result.push(greeting);
    if (body) result.push(body);
    if (signoff.trim()) result.push(signoff.trim());
    return result.join('\n\n');
  }

  return {
    getStages,
    getAllShortcuts,
    getShortcutsByStage,
    findShortcut,
    searchShortcuts,
    generateMessage,
    transformTone,
    suggestNext,
    STAGES,
    SHORTCUTS
  };
})();

if (typeof window !== 'undefined') {
  window.RKTemplates = RKTemplates;
}
