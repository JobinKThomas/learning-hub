/**
 * Defensive Normalization Utilities for Learning Hub
 * 
 * Prevents JavaScript runtime exceptions such as:
 *   "TypeError: modules.map is not a function"
 *   "TypeError: Cannot read properties of undefined (reading 'filter')"
 * 
 * Guarantees that components always receive valid arrays and objects regardless
 * of backend error payloads, partial network responses, or empty results.
 */

/**
 * Normalizes an API response into a guaranteed JavaScript Array.
 * 
 * @param {*} data - Raw response, payload, or property
 * @param {...string} preferredKeys - Optional specific object keys to inspect (e.g. 'modules', 'paths')
 * @returns {Array} Always returns a valid Array (never null or undefined)
 */
export function normalizeList(data, ...preferredKeys) {
  if (!data) return [];
  if (Array.isArray(data)) return data;

  if (typeof data === 'object') {
    // 1. Check explicitly requested keys first
    for (const key of preferredKeys) {
      if (Array.isArray(data[key])) {
        return data[key];
      }
    }

    // 2. Check common API envelope keys
    const commonKeys = [
      'data',
      'items',
      'paths',
      'modules',
      'sections',
      'topics',
      'notes',
      'resources',
      'playgrounds',
      'quizzes',
      'questions',
      'attempts',
      'results',
      'learningPaths',
      'rows',
      'list',
    ];

    for (const key of commonKeys) {
      if (Array.isArray(data[key])) {
        return data[key];
      }
    }

    // 3. If data has a nested data property that might contain arrays
    if (data.data && typeof data.data === 'object') {
      if (Array.isArray(data.data)) return data.data;
      for (const key of preferredKeys.concat(commonKeys)) {
        if (Array.isArray(data.data[key])) {
          return data.data[key];
        }
      }
    }
  }

  // Fallback safe default
  return [];
}

/**
 * Normalizes an API response into a guaranteed Object or null.
 * 
 * @param {*} data - Raw response or item
 * @param {...string} preferredKeys - Optional specific keys to inspect
 * @returns {Object|null}
 */
export function normalizeItem(data, ...preferredKeys) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return null;
  }

  // Check preferred keys if wrapped
  for (const key of preferredKeys) {
    if (data[key] && typeof data[key] === 'object' && !Array.isArray(data[key])) {
      return data[key];
    }
  }

  // Check if data is wrapped in data envelope
  if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
    return data.data;
  }

  return data;
}

/**
 * Normalizes any error object, string, or network failure into a consistent shape.
 * 
 * @param {*} error - Caught error, Axios error, Redux reject string, or Error instance
 * @returns {{
 *   status: number,
 *   title: string,
 *   message: string,
 *   errors: Array<string>,
 *   isNetworkError: boolean,
 *   isNotFound: boolean,
 *   isForbidden: boolean,
 *   isUnauthorized: boolean,
 *   isValidationError: boolean,
 *   isServerError: boolean
 * }}
 */
export function normalizeError(error) {
  if (!error) {
    return {
      status: 0,
      title: 'Unknown Error',
      message: 'An unexpected issue occurred. Please try again.',
      errors: [],
      isNetworkError: false,
      isNotFound: false,
      isForbidden: false,
      isUnauthorized: false,
      isValidationError: false,
      isServerError: false,
    };
  }

  // If already normalized
  if (typeof error === 'object' && error._isNormalized) {
    return error;
  }

  let status = error.status || error.response?.status || 0;
  let message = '';
  let errors = [];
  let isNetworkError = Boolean(
    error.isNetworkError ||
    error.code === 'ERR_NETWORK' ||
    error.code === 'ECONNABORTED' ||
    (error.message && error.message.toLowerCase().includes('network error')) ||
    (!error.response && error.request)
  );

  if (typeof error === 'string') {
    message = error;
  } else if (error.response?.data) {
    const d = error.response.data;
    message = d.message || d.error || error.message || 'An error occurred';
    if (Array.isArray(d.errors)) {
      errors = d.errors.map((e) => (typeof e === 'object' ? e.msg || e.message || JSON.stringify(e) : String(e)));
    } else if (typeof d.errors === 'string') {
      errors = [d.errors];
    }
  } else if (error.message) {
    message = error.message;
    if (Array.isArray(error.errors)) {
      errors = error.errors;
    }
  } else {
    message = 'An unexpected error occurred. Please try again.';
  }

  // Set friendly network error message if detected
  if (isNetworkError) {
    status = 0;
    if (!message || message === 'Network Error' || message === 'ERR_NETWORK') {
      message = 'Unable to connect to the server. Please check your internet connection or try again later.';
    }
  }

  const isNotFound = status === 404;
  const isForbidden = status === 403;
  const isUnauthorized = status === 401;
  const isValidationError = status === 400;
  const isServerError = status >= 500;

  let title = 'Error';
  if (isNetworkError) {
    title = 'Connection Problem';
  } else if (isNotFound) {
    title = 'Resource Not Found (404)';
  } else if (isForbidden) {
    title = 'Access Denied (403)';
  } else if (isUnauthorized) {
    title = 'Authentication Required (401)';
  } else if (isValidationError) {
    title = 'Validation Failed (400)';
  } else if (isServerError) {
    title = 'Server Error (500)';
  }

  return {
    _isNormalized: true,
    status,
    title,
    message,
    errors,
    isNetworkError,
    isNotFound,
    isForbidden,
    isUnauthorized,
    isValidationError,
    isServerError,
  };
}
