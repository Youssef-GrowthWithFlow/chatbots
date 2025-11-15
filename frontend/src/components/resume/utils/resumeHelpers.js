/**
 * Resume Helper Functions
 * Utility functions for resume data processing and PDF generation
 */

/**
 * Limit achievements to a maximum number
 * @param {string[]} achievements - Array of achievement strings
 * @param {number} max - Maximum number to return (default: 4)
 * @returns {string[]}
 */
export const limitAchievements = (achievements, max = 4) => {
  if (!Array.isArray(achievements)) return [];
  return achievements.slice(0, max);
};

/**
 * Format duration for display
 * @param {string} duration - Duration string (e.g., "2020 - Présent")
 * @returns {string}
 */
export const formatDuration = (duration) => {
  if (!duration) return '';
  return duration.replace(' - ', ' · ');
};

/**
 * Generate PDF filename from name and job title
 * @param {string} name - Person's name
 * @param {string} jobTitle - Job title
 * @returns {string}
 */
export const generatePDFFilename = (name, jobTitle) => {
  const cleanName = name.replace(/\s+/g, '_');
  const cleanTitle = jobTitle.replace(/\s+/g, '_').replace(/\//g, '_');
  return `CV_${cleanName}_${cleanTitle}.pdf`;
};

/**
 * Get PDF generation configuration for html2pdf
 * @param {string} filename - PDF filename
 * @returns {object}
 */
export const getPDFConfig = (filename) => ({
  margin: [10, 10, 10, 10],
  filename,
  image: { type: 'jpeg', quality: 0.98 },
  html2canvas: {
    scale: 3,              // High resolution
    useCORS: true,
    letterRendering: true, // Better font rendering
    dpi: 300,              // Print quality
    backgroundColor: '#ffffff'
  },
  jsPDF: {
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait',
    compress: true
  },
  pagebreak: {
    mode: ['avoid-all', 'css'],
    avoid: '.experience-item, .project-item, .education-item'
  }
});

/**
 * Validate resume data structure
 * @param {object} resumeData - Resume data object
 * @returns {boolean}
 */
export const validateResumeData = (resumeData) => {
  if (!resumeData) return false;
  if (!resumeData.contact_info) return false;
  if (!resumeData.contact_info.name) return false;
  return true;
};

/**
 * Safe array access - returns empty array if undefined
 * @param {any} value - Value to check
 * @returns {array}
 */
export const safeArray = (value) => {
  return Array.isArray(value) ? value : [];
};

/**
 * Safe object access - returns empty object if undefined
 * @param {any} value - Value to check
 * @returns {object}
 */
export const safeObject = (value) => {
  return value && typeof value === 'object' ? value : {};
};
