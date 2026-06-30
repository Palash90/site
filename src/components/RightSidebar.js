import { Link } from "react-router-dom";

const sidebarStyle = {
  position: "sticky",
  top: "60px",
  maxHeight: "calc(100vh - 80px)",
  overflowY: "auto",
  padding: "1rem 0.5rem",
  fontSize: "13px",
  borderLeft: "1px solid rgba(255,255,255,0.06)",
};

const sectionStyle = {
  marginBottom: "1.25rem",
};

const headerStyle = {
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "1px",
  color: "#6c757d",
  marginBottom: "8px",
};

const seriesCardStyle = {
  padding: "8px 10px",
  borderRadius: "6px",
  background: "rgba(255,255,255,0.03)",
  marginBottom: "6px",
  border: "1px solid rgba(255,255,255,0.06)",
  cursor: "pointer",
  transition: "background 0.15s",
  display: "block",
  textDecoration: "none",
  color: "inherit",
};

const articleLinkStyle = {
  display: "block",
  padding: "4px 8px",
  color: "#8892b0",
  textDecoration: "none",
  borderRadius: "4px",
  fontSize: "12px",
  lineHeight: 1.4,
  transition: "background 0.15s",
};

function getDateVal(c) {
  return c.sortBy ? new Date(c.sortBy).getTime() : c.publishDate ? new Date(c.publishDate).getTime() : 0;
}

export default function RightSidebar({ allContents, contentType }) {
  const seriesMap = {};
  const standalone = [];

  for (const c of allContents) {
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
      articles: articles.sort((a, b) => a.seriesOrder - b.seriesOrder),
      latestDate: Math.max(...articles.map((a) => getDateVal(a))),
      count: articles.length,
    }))
    .sort((a, b) => b.latestDate - a.latestDate);

  const sortedStandalone = standalone
    .filter((c) => getDateVal(c) > 0)
    .sort((a, b) => getDateVal(b) - getDateVal(a));

  return (
    <div style={sidebarStyle}>
      <div style={sectionStyle}>
        <div style={headerStyle}>Latest on This Space</div>

        {sortedSeries.map((s) => (
          <Link
            key={s.name}
            to={`/content/${s.articles[0].id}`}
            style={seriesCardStyle}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
          >
            <div style={{ color: "#38bdf8", fontWeight: 600, fontSize: "12px", marginBottom: "2px" }}>
              {s.name}
            </div>
            <div style={{ color: "#6c757d", fontSize: "10px" }}>
              {s.count} {s.count === 1 ? "part" : "parts"}
            </div>
          </Link>
        ))}

        {sortedStandalone.slice(0, 8).map((a) => (
          <Link
            key={a.id}
            to={`/content/${a.id}`}
            style={articleLinkStyle}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {a.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
