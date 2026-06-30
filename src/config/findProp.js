// findProp: local function that queries site data.
// Common config is bundled locally (baseConfig.js) so the page renders correctly.
// Only blog/article contents (swe, music, drafts) are fetched from GitHub Pages at runtime.

import baseConfig from './baseConfig';

let mergedData = { ...baseConfig };
let contentsPromise = null;
let contentsLoadError = null;

export function findProp(path) {
  if (!mergedData) return undefined;
  const parts = path.split('.');
  let obj = mergedData;
  for (const part of parts) {
    if (obj == null || typeof obj !== 'object') return undefined;
    obj = obj[part];
  }
  return obj !== undefined ? obj : undefined;
}

export async function loadContents() {
  if (contentsPromise) return contentsPromise;
  contentsPromise = (async () => {
    const url = 'https://palash90.github.io/site-assets/data.json';
    const fallbackUrl = 'https://raw.githubusercontent.com/palash90/site-assets/main/data.json';

    async function tryFetch(fetchUrl) {
      const res = await fetch(fetchUrl);
      if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
          await res.clone().text();
        } catch (_) {
          detail = `CORS blocked (${res.status})`;
        }
        throw new Error(detail);
      }
      return res.json();
    }

    try {
      let remote;
      try {
        remote = await tryFetch(url);
      } catch (primaryErr) {
        console.warn('Primary content URL failed, trying fallback:', primaryErr.message);
        try {
          remote = await tryFetch(fallbackUrl);
        } catch (fbErr) {
          throw new Error(`Primary: ${primaryErr.message} | Fallback: ${fbErr.message}`);
        }
      }
      if (remote.contents) {
        mergedData = { ...baseConfig, contents: remote.contents };
      }
      return mergedData.contents;
    } catch (err) {
      contentsLoadError = err.message;
      console.warn('Failed to load contents from GitHub Pages:', err.message);
      return null;
    }
  })();
  return contentsPromise;
}

export function getContentsLoadError() {
  return contentsLoadError;
}

export default findProp;
