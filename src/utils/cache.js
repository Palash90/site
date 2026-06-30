const CACHE_PREFIX = 'content_';
const DEFAULT_TTL = 24 * 60 * 60 * 1000;

export function getCached(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { data, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function setCached(key, data, ttl = DEFAULT_TTL) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, expiry: Date.now() + ttl }));
  } catch {}
}

export function githubPagesToRaw(url) {
  const m = url.match(/^https:\/\/([^.]+)\.github\.io\/([^/]+)\/(.+)$/);
  if (!m) return null;
  return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/main/${m[3]}`;
}

export async function fetchWithCache(url, ttl = DEFAULT_TTL) {
  const cached = getCached(url);
  if (cached !== null) return cached;

  const fallbackUrl = githubPagesToRaw(url);

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url} (${res.status} ${res.statusText})`);
    const text = await res.text();
    setCached(url, text, ttl);
    return text;
  } catch (err) {
    if (fallbackUrl) {
      try {
        const res2 = await fetch(fallbackUrl);
        if (!res2.ok) throw new Error(`Failed to fetch ${fallbackUrl} (${res2.status} ${res2.statusText})`);
        const text = await res2.text();
        setCached(url, text, ttl);
        return text;
      } catch (fbErr) {
        throw new Error(`Primary: ${err.message} | Fallback: ${fbErr.message}`);
      }
    }
    throw err;
  }
}
