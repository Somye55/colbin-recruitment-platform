/**
 * Validates if a string is a valid URL
 * @param url - The URL string to validate
 * @returns true if valid URL, false otherwise
 */
export const isValidUrl = (url: string): boolean => {
  if (!url || url.trim() === '') {
    return true; // Empty URLs are considered valid (optional field)
  }

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Validates if a string is a valid URL and returns appropriate error message
 * @param url - The URL string to validate
 * @returns error message if invalid, empty string if valid
 */
export const validateUrl = (url: string): string => {
  if (!url || url.trim() === '') {
    return ''; // Empty URLs are considered valid (optional field)
  }

  if (!isValidUrl(url)) {
    return 'Please enter a valid URL (must start with http:// or https://)';
  }

  return '';
};