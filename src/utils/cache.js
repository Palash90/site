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

export function sweepExpired() {
  try {
    const now = Date.now();
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        try {
          const { expiry } = JSON.parse(localStorage.getItem(key));
          if (now > expiry) localStorage.removeItem(key);
        } catch {}
      }
    }
  } catch {}
}

sweepExpired();

export async function fetchWithCache(url, ttl = DEFAULT_TTL) {
  const cached = getCached(url);
  if (cached !== null) return cached;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  const text = await res.text();
  setCached(url, text, ttl);
  return text;
}
