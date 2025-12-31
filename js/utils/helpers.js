/**
 * Utility functions for the TODO app
 */

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Debounce a function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle a function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Format a date to Japanese locale
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format a date to short format (YYYY/MM/DD)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDateShort(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

/**
 * Format a relative time (e.g., "2 days ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diff = now - d;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}日前`;
  if (hours > 0) return `${hours}時間前`;
  if (minutes > 0) return `${minutes}分前`;
  return 'たった今';
}

/**
 * Get priority label in Japanese
 * @param {string} priority - Priority level
 * @returns {string} Japanese label
 */
export function getPriorityLabel(priority) {
  const labels = {
    high: '高',
    medium: '中',
    low: '低'
  };
  return labels[priority] || priority;
}

/**
 * Get priority class name
 * @param {string} priority - Priority level
 * @returns {string} CSS class name
 */
export function getPriorityClass(priority) {
  return `priority-${priority}`;
}

/**
 * Parse tags from a string (comma or space separated)
 * @param {string} tagString - String containing tags
 * @returns {Array<string>} Array of tags
 */
export function parseTags(tagString) {
  if (!tagString) return [];

  return tagString
    .split(/[,\s]+/)
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .map(tag => tag.startsWith('#') ? tag : `#${tag}`);
}

/**
 * Download data as a file
 * @param {string} data - Data to download
 * @param {string} filename - Filename
 * @param {string} type - MIME type
 */
export function downloadFile(data, filename, type = 'application/json') {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Read a file as text
 * @param {File} file - File to read
 * @returns {Promise<string>} Promise resolving to file content
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

/**
 * Show a confirmation dialog
 * @param {string} message - Message to show
 * @returns {boolean} True if confirmed
 */
export function confirm(message) {
  return window.confirm(message);
}

/**
 * Show an alert
 * @param {string} message - Message to show
 */
export function alert(message) {
  window.alert(message);
}

/**
 * Create an element with classes and attributes
 * @param {string} tag - HTML tag name
 * @param {Object} options - Options (classes, attributes, innerHTML, etc.)
 * @returns {HTMLElement} Created element
 */
export function createElement(tag, options = {}) {
  const element = document.createElement(tag);

  if (options.classes) {
    element.className = Array.isArray(options.classes)
      ? options.classes.join(' ')
      : options.classes;
  }

  if (options.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  if (options.innerHTML) {
    element.innerHTML = options.innerHTML;
  }

  if (options.textContent) {
    element.textContent = options.textContent;
  }

  return element;
}

/**
 * Check if a date is today
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if today
 */
export function isToday(date) {
  if (!date) return false;
  const d = new Date(date);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

/**
 * Check if a date is in the past
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if in the past
 */
export function isPast(date) {
  if (!date) return false;
  return new Date(date) < new Date();
}
