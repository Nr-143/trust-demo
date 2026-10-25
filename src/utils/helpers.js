/**
 * Generate a simple unique ID for demo purposes.
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/**
 * Format a date string for display.
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format currency in INR.
 */
export function formatCurrency(amount) {
  if (amount == null) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Truncate text with ellipsis.
 */
export function truncateText(text, maxLength = 120) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trimEnd() + '…';
}

/**
 * Classname merger utility (simple version).
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Safe branded fallback SVG data URI when external photos are unreachable or offline.
 */
export const FALLBACK_IMAGE_DATA_URI =
  "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22500%22%20viewBox%3D%220%200%20800%20500%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22800%22%20height%3D%22500%22%20fill%3D%22%23173B2A%22%2F%3E%3Ccircle%20cx%3D%22400%22%20cy%3D%22190%22%20r%3D%2246%22%20fill%3D%22%23176B36%22%20opacity%3D%220.9%22%2F%3E%3Cpath%20d%3D%22M400%20165%20L415%20195%20L385%20195%20Z%22%20fill%3D%22%23FF9800%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%22270%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%23FFFFFF%22%20font-family%3D%22sans-serif%22%20font-size%3D%2222%22%20font-weight%3D%22bold%22%3EMannin%20Maindhan%20Grama%20Arakkattalai%3C%2Ftext%3E%3Ctext%20x%3D%2250%25%22%20y%3D%22305%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20fill%3D%22%23FF9800%22%20font-family%3D%22sans-serif%22%20font-size%3D%2214%22%3ECommunity%20Field%20Initiative%3C%2Ftext%3E%3C%2Fsvg%3E";

/**
 * Handle image load failure by falling back to the branded placeholder.
 */
export function handleImageFallback(e, fallback = FALLBACK_IMAGE_DATA_URI) {
  if (e?.currentTarget && e.currentTarget.src !== fallback) {
    e.currentTarget.onerror = null;
    e.currentTarget.src = fallback;
  }
}
