import { Link } from "react-router-dom";
import { getEnrichedSwe, getEnrichedMusic } from "../utils/mockData";
import { getContentsLoadError } from "../config/findProp";

function friendlyFetchError(msg) {
    if (!msg) return "Content data failed to load.";
    const m = msg.toLowerCase();
    if (m.includes("cors"))
        return "The site is not allowed to fetch content.";
    if (m.includes("failed to fetch") || m.includes("networkerror"))
        return "Content blocked by browser.";
    if (m.includes("http 404") || m.includes("not found"))
        return "Content not found (404).";
    if (m.includes("http 403") || m.includes("forbidden"))
        return "Access forbidden (403).";
    if (m.includes("http 500") || m.includes("internal server"))
        return "Server error (500).";
    return `Content data failed to load: ${msg}`;
}

function getDateVal(c) {
  return c.sortBy
    ? new Date(c.sortBy).getTime()
    : c.publishDate
    ? new Date(c.publishDate).getTime()
    : 0;
}

const partLinkStyle = {
  display: "block",
  color: "#8892b0",
  textDecoration: "none",
  padding: "5px 8px 5px 24px",
  fontSize: "14px",
  lineHeight: 1.5,
  borderRadius: "4px",
  transition: "background 0.15s",
};

export default function SeriesList({ type, filter, showDate, limit, truncateAt, flat }) {
  const allItems = type === "contents.swe" ? getEnrichedSwe() : getEnrichedMusic();

  const filtered = filter
    ? allItems.filter((c) => (c.title || "").toLowerCase().includes(filter.toLowerCase()))
    : allItems;

  const seriesMap = {};
  const standalone = [];

  for (const c of filtered) {
    if (c.series) {
      if (!seriesMap[c.series]) seriesMap[c.series] = [];
      seriesMap[c.series].push(c);
    } else {
      standalone.push(c);
    }
  }

  const sortedSeries = Object.entries(seriesMap)
    .map(([name, articles]) => ({
      name,
      count: articles.length,
      articles: articles.sort((a, b) => a.seriesOrder - b.seriesOrder),
      latestDate: Math.max(...articles.map(getDateVal)),
    }))
    .sort((a, b) => b.latestDate - a.latestDate);

  const sortedStandalone = standalone
    .filter((c) => getDateVal(c) > 0)
    .sort((a, b) => getDateVal(b) - getDateVal(a));

  let seriesShown = 0;
  let standaloneShown = 0;

  const rows = [];
  if (flat) {
    for (const s of sortedSeries) {
      if (limit && seriesShown + standaloneShown >= limit) break;
      seriesShown++;
      rows.push({ kind: "series-link", data: s });
    }
    for (const a of sortedStandalone) {
      if (limit && seriesShown + standaloneShown >= limit) break;
      standaloneShown++;
      rows.push({ kind: "article", data: a });
    }
  } else {
    for (const s of sortedSeries) {
      if (limit && seriesShown + standaloneShown >= limit) break;
      seriesShown++;
      rows.push({ kind: "series", data: s });
      for (const a of s.articles) {
        rows.push({ kind: "part", data: a, series: s.name });
      }
    }
    for (const a of sortedStandalone) {
      if (limit && seriesShown + standaloneShown >= limit) break;
      standaloneShown++;
      rows.push({ kind: "article", data: a });
    }
  }

  if (rows.length === 0) {
    const loadErr = getContentsLoadError();
    const msg = allItems.length === 0 && loadErr
      ? friendlyFetchError(loadErr)
      : "No content found.";
    return <p className="text-secondary small">{msg}</p>;
  }

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {rows.map((item, idx) => {
        if (item.kind === "series-link") {
          const s = item.data;
          return (
            <li
              key={s.name}
              style={{
                padding: "10px 8px",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <Link
                to={`/content/${s.articles[0].id}`}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div style={{ color: "#38bdf8", fontWeight: 700, fontSize: "14px" }}>
                  {s.name}
                </div>
                <div style={{ color: "#6c757d", fontSize: "11px", marginTop: "2px" }}>
                  {s.count} {s.count === 1 ? "part" : "parts"}
                </div>
              </Link>
            </li>
          );
        }

        if (item.kind === "series") {
          const s = item.data;
          return (
            <li
              key={`series-${s.name}`}
              style={{
                padding: "10px 8px 4px 8px",
                marginTop: idx > 0 ? "12px" : 0,
              }}
            >
              <div
                style={{
                  color: "#38bdf8",
                  fontWeight: 700,
                  fontSize: "15px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {s.name}
              </div>
              <div style={{ color: "#6c757d", fontSize: "11px", marginBottom: "4px" }}>
                {s.count} {s.count === 1 ? "part" : "parts"}
              </div>
            </li>
          );
        }

        if (item.kind === "part") {
          const a = item.data;
          const title = truncateAt && a.title.length > truncateAt
            ? a.title.slice(0, a.title.lastIndexOf(" ", truncateAt)) + "…"
            : a.title;
          return (
            <li key={a.id} style={{ listStyle: "none" }}>
              <Link
                to={`/content/${a.id}`}
                style={partLinkStyle}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ color: "#6c757d", marginRight: "6px", fontSize: "13px" }}>#{a.seriesOrder}</span>
                {title}
              </Link>
            </li>
          );
        }

        const a = item.data;
        const title = truncateAt && a.title.length > truncateAt
          ? a.title.slice(0, a.title.lastIndexOf(" ", truncateAt)) + "…"
          : a.title;
        return (
          <li
            key={a.id}
            style={{
              listStyle: "none",
              padding: "8px 8px",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            {showDate && a.publishDate ? (
              <span style={{ color: "#6c757d", fontSize: "12px", marginRight: "8px" }}>
                {a.publishDate}
              </span>
            ) : null}
            <Link
              to={`/content/${a.id}`}
              style={{ color: "#e2e8f0", textDecoration: "none", fontSize: "14px" }}
            >
              {title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
