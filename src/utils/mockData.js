const sweSeriesMap = {
  "iron-learn-1": { series: "Iron Learn", seriesOrder: 1 },
  "iron-learn-2": { series: "Iron Learn", seriesOrder: 2 },
  "iron-learn-3": { series: "Iron Learn", seriesOrder: 3 },
  "iron-learn-4": { series: "Iron Learn", seriesOrder: 4 },
  "iron-learn-5": { series: "Iron Learn", seriesOrder: 5 },
  "iron-learn-6": { series: "Iron Learn", seriesOrder: 6 },
  "iron-learn-7": { series: "Iron Learn", seriesOrder: 7 },
  "iron-learn-8": { series: "Iron Learn", seriesOrder: 8 },
  "iron-learn-9": { series: "Iron Learn", seriesOrder: 9 },
  "iron-learn-10": { series: "Iron Learn", seriesOrder: 10 },
  "fearless-rust-non-blocking-1": { series: "Fearless Rust", seriesOrder: 1 },
  "fearless-rust-write-test": { series: "Fearless Rust", seriesOrder: 2 },
  "setting-up-a-site-1": { series: "Setting Up a Site", seriesOrder: 1 },
  "setting-up-a-site-2": { series: "Setting Up a Site", seriesOrder: 2 },
  "setting-up-a-site-3": { series: "Setting Up a Site", seriesOrder: 3 },
  "setting-up-a-site-4": { series: "Setting Up a Site", seriesOrder: 4 },
};

const musicSeriesMap = {
  "guitalele-tuning": { series: "Guitalele Basics", seriesOrder: 1 },
  "all-open-chords": { series: "Guitalele Basics", seriesOrder: 2 },
  "ode-to-joy": { series: "Guitalele Tabs & Melodies", seriesOrder: 1 },
  "guitalele-tab-quick-view": { series: "Guitalele Tabs & Melodies", seriesOrder: 2 },
};

export function getEnrichedSwe() {
  return (window.findProp("contents.swe") || []).map(c => ({
    ...c,
    contentType: "swe",
    ...(sweSeriesMap[c.id] || {}),
  }));
}

export function getEnrichedMusic() {
  return (window.findProp("contents.music") || []).map(c => ({
    ...c,
    contentType: "music",
    ...(musicSeriesMap[c.id] || {}),
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
