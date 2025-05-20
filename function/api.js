/**
 * Fetches JSON from an endpoint.
 *
 * @param {string} url - The URL to fetch.
 * @param {RequestInit & { json?: Object }} [options={}] - Fetch options, including optional JSON body.
 * @returns {Promise<any>} - Parsed JSON response.
 * @throws {Error} If the response is not OK.
 */
export async function fetchJSON(url, options = {}) {
  const headers = { Accept: 'application/json', ...options.headers };

  if (options.json) {
    options.body = JSON.stringify(options.json);
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    throw new Error('SERVER ERROR', { cause: response });
  }

  return await response.json();
}

