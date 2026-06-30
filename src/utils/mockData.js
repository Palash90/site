export function getEnrichedSwe() {
  return (window.findProp("contents.swe") || []).map(c => ({
    ...c,
    contentType: "swe",
  }));
}

export function getEnrichedMusic() {
  return (window.findProp("contents.music") || []).map(c => ({
    ...c,
    contentType: "music",
  }));
}

export function getEnrichedDrafts() {
  return (window.findProp("contents.drafts") || []).map(c => ({
    ...c,
    contentType: c.contentType || "swe",
  }));
}

export function getAllEnriched() {
  return [...getEnrichedSwe(), ...getEnrichedMusic(), ...getEnrichedDrafts()];
}

export function extractHeadings(mdText) {
  if (!mdText) return [];
  const lines = mdText.split("\n");
  const headings = [];
  for (const line of lines) {
    const m = line.match(/^(#{1,6})\s+(.+)$/);
    if (m) {
      const raw = m[2].trim();
      const clean = raw
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        .replace(/__([^_]+)__/g, "$1")
        .replace(/_([^_]+)_/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
      headings.push({ level: m[1].length, text: clean });
    }
  }
  return headings;
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
