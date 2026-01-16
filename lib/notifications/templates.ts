/**
 * Notification Templates
 *
 * Centralized templates for push notification messages
 */

export interface NotificationTemplate {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: Record<string, unknown>;
}

/**
 * Template for learner sentence submission notification (sent to admins)
 */
export function learnerSubmissionNotification(
  learnerEmail: string,
  sentence: string,
  conversationId: string
): NotificationTemplate {
  const sentencePreview = sentence.length > 50 ? `${sentence.slice(0, 50)}...` : sentence;

  return {
    title: 'New Sentence Submission',
    body: `${learnerEmail}: ${sentencePreview}`,
    tag: `submission-${conversationId}`,
    requireInteraction: false,
    data: {
      type: 'learner_submission',
      conversationId,
      url: `/conversations/${conversationId}`,
    },
  };
}

/**
 * Template for admin reply notification (sent to learners)
 */
export function adminReplyNotification(
  reply: string,
  conversationId: string
): NotificationTemplate {
  const replyPreview = reply.length > 100 ? `${reply.slice(0, 100)}...` : reply;

  return {
    title: 'Admin Reply',
    body: replyPreview,
    tag: `reply-${conversationId}`,
    requireInteraction: false,
    data: {
      type: 'admin_reply',
      conversationId,
      url: `/conversations/${conversationId}`,
    },
  };
}

/**
 * Template for daily reminder notification (sent to learners)
 */
export function dailyReminderNotification(): NotificationTemplate {
  const messages = [
    'Good morning! Time to learn Tamil.',
    'Ready to practice Tamil today?',
    'Your daily Tamil lesson awaits!',
    "Let's continue your Tamil journey!",
    'Time for your Tamil practice session!',
  ];

  // Pick a random message
  const body = messages[Math.floor(Math.random() * messages.length)];

  return {
    title: 'Daily Tamil Reminder',
    body: `${body} Complete your words for today! 📚`,
    tag: 'daily-reminder',
    requireInteraction: false,
    data: {
      type: 'scheduled',
      url: '/words',
    },
  };
}

/**
 * Template for evaluation completed notification (sent to learners)
 */
export function evaluationCompletedNotification(
  conversationId: string,
  grade?: string
): NotificationTemplate {
  const body = grade
    ? `Your sentence has been evaluated. Grade: ${grade}`
    : 'Your sentence has been evaluated';

  return {
    title: 'Evaluation Complete',
    body,
    tag: `evaluation-${conversationId}`,
    requireInteraction: false,
    data: {
      type: 'evaluation_completed',
      conversationId,
      url: `/conversations/${conversationId}`,
    },
  };
}

/**
 * Template for weekly progress notification (optional future feature)
 */
export function weeklyProgressNotification(
  wordsLearned: number,
  sentencesSubmitted: number
): NotificationTemplate {
  return {
    title: 'Weekly Progress Report',
    body: `Great week! You learned ${wordsLearned} words and submitted ${sentencesSubmitted} sentences. Keep it up! 🎉`,
    tag: 'weekly-progress',
    requireInteraction: false,
    data: {
      type: 'weekly_progress',
      url: '/profile',
    },
  };
}

/**
 * Template for milestone achievement notification (optional future feature)
 */
export function milestoneNotification(
  milestone: string,
  description: string
): NotificationTemplate {
  return {
    title: `Milestone Achieved: ${milestone}`,
    body: description,
    tag: `milestone-${milestone}`,
    requireInteraction: true,
    data: {
      type: 'milestone',
      milestone,
      url: '/profile',
    },
  };
}

/**
 * Generic notification template builder
 */
export function createNotification(
  title: string,
  body: string,
  options?: Partial<NotificationTemplate>
): NotificationTemplate {
  return {
    title,
    body,
    tag: options?.tag || 'general',
    requireInteraction: options?.requireInteraction || false,
    icon: options?.icon,
    badge: options?.badge,
    data: options?.data || { type: 'general' },
  };
}
