/**
 * Utility to store and retrieve Ethereal email preview URLs by recipient email
 */

interface EmailPreview {
  to: string;
  subject: string;
  previewUrl: string;
  messageId: string;
  timestamp: number;
}

// In-memory store for preview URLs (will be cleared on server restart)
const emailPreviews: Record<string, EmailPreview[]> = {};

// Maximum number of previews to store per email address
const MAX_PREVIEWS_PER_EMAIL = 5;

/**
 * Store an email preview URL
 */
export const storeEmailPreview = (to: string, subject: string, previewUrl: string, messageId: string): void => {
  // Initialize array if it doesn't exist
  if (!emailPreviews[to]) {
    emailPreviews[to] = [];
  }

  // Add new preview
  emailPreviews[to].unshift({
    to,
    subject,
    previewUrl,
    messageId,
    timestamp: Date.now(),
  });

  // Trim to maximum size
  if (emailPreviews[to].length > MAX_PREVIEWS_PER_EMAIL) {
    emailPreviews[to] = emailPreviews[to].slice(0, MAX_PREVIEWS_PER_EMAIL);
  }
};

/**
 * Get all preview URLs for a specific email address
 */
export const getEmailPreviews = (to: string): EmailPreview[] => {
  return emailPreviews[to] || [];
};

/**
 * Get the most recent preview URL for a specific email address
 */
export const getLatestEmailPreview = (to: string): EmailPreview | null => {
  return emailPreviews[to]?.[0] || null;
};

/**
 * Get all stored preview URLs (for admin purposes)
 */
export const getAllEmailPreviews = (): Record<string, EmailPreview[]> => {
  return emailPreviews;
};

/**
 * Clear old previews (older than 1 hour)
 */
export const clearOldPreviews = (): void => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;

  Object.keys(emailPreviews).forEach((email) => {
    emailPreviews[email] = emailPreviews[email].filter((preview) => preview.timestamp > oneHourAgo);

    // Remove empty arrays
    if (emailPreviews[email].length === 0) {
      delete emailPreviews[email];
    }
  });
};

// Set up automatic cleanup every hour
setInterval(clearOldPreviews, 60 * 60 * 1000);
