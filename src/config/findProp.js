// findProp: local function that queries site data.
// Common config is bundled locally (baseConfig.js) so the page renders correctly.
// Only blog/article contents (swe, music, drafts) are fetched from GitHub Pages at runtime.

import baseConfig from './baseConfig';

let mergedData = { ...baseConfig };
let contentsPromise = null;

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
    try {
      const url = 'https://palash90.github.io/site-assets/data.json';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const remote = await res.json();
      if (remote.contents) {
        mergedData = { ...baseConfig, contents: remote.contents };
      }
      return mergedData.contents;
    } catch (err) {
      console.warn('Failed to load contents from GitHub Pages:', err.message);
      return null;
    }
  })();
  return contentsPromise;
}

export default findProp;
