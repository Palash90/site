// Future-dated entries stay hidden from all list views until their date arrives.
// sortBy (ISO timestamp) is the reliable field; publishDate is a display string.
function isReleased(c) {
  const t = c.sortBy
    ? new Date(c.sortBy).getTime()
    : c.publishDate
      ? new Date(c.publishDate).getTime()
      : 0;
  return !t || t <= Date.now(); // no date, or date already arrived
}

// A scheduled post: exists in data, hidden from lists until its date arrives.
export function getScheduledContent(contentId) {
  const c = [
    ...(window.findProp("contents.swe") || []),
    ...(window.findProp("contents.music") || []),
  ].find(e => e.id === contentId);
  return c && !isReleased(c) ? c : undefined;
}

export function getEnrichedSwe() {
  return (window.findProp("contents.swe") || [])
    .filter(isReleased)
    .map(c => ({
      ...c,
      contentType: "swe",
    }));
}

export function getEnrichedMusic() {
  return (window.findProp("contents.music") || [])
    .filter(isReleased)
    .map(c => ({
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
