import { Link } from "react-router-dom";
import { slugify } from "../utils/mockData";

const sidebarStyle = {
  position: "sticky",
  top: "60px",
  maxHeight: "calc(100vh - 80px)",
  overflowY: "auto",
  padding: "1rem 0.5rem",
  fontSize: "14px",
  borderRight: "1px solid rgba(255,255,255,0.06)",
};

const linkStyle = {
  color: "#c3cde4",
  textDecoration: "none",
  display: "block",
  padding: "3px 8px",
  borderRadius: "4px",
  transition: "all 0.15s",
};

export default function LeftSidebar({ content, seriesArticles, headings, error }) {
  if (error) return null;

  if (content?.series) {
    const ordered = [...seriesArticles].sort((a, b) => a.seriesOrder - b.seriesOrder);
    return (
      <div style={sidebarStyle}>
        <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#94a3b8", marginBottom: "12px" }}>
          Series: {content.series}
        </div>
        <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "8px" }}>
          {ordered.length} parts
        </div>
        {ordered.map((a) => {
          const isActive = a.id === content.id;
          return (
            <Link
              key={a.id}
              to={`/content/${a.id}`}
              style={{
                ...linkStyle,
                background: isActive ? "rgba(34,211,238,0.1)" : "transparent",
                color: isActive ? "#22d3ee" : "#c3cde4",
                fontWeight: isActive ? 600 : 400,
                borderLeft: isActive ? "2px solid #22d3ee" : "2px solid transparent",
                marginBottom: "2px",
              }}
            >
              <span style={{ color: "#6c757d", marginRight: "6px" }}>#{a.seriesOrder}</span>
              {a.title.length > 45 ? a.title.slice(0, 45) + "…" : a.title}
            </Link>
          );
        })}
      </div>
    );
  }

  if (headings && headings.length > 0) {
    return (
      <div style={sidebarStyle}>
        <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#94a3b8", marginBottom: "12px" }}>
          On This Page
        </div>
        {headings.map((h, i) => (
          <a
            key={i}
            href={`#${slugify(h.text)}`}
            style={{
              ...linkStyle,
              paddingLeft: `${8 + (h.level - 1) * 16}px`,
              fontSize: h.level === 1 ? "14px" : h.level === 2 ? "13px" : "12px",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#22d3ee"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#c3cde4"; }}
          >
            {h.text}
          </a>
        ))}
      </div>
    );
  }

  if (content?.title) {
    return (
      <div style={sidebarStyle}>
        <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", color: "#94a3b8", marginBottom: "12px" }}>
          Article
        </div>
        <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: "14px", lineHeight: 1.4 }}>
          {content.title}
        </div>
        {content.publishDate && (
          <div style={{ color: "#6c757d", fontSize: "11px", marginTop: "8px" }}>
            {content.publishDate}
          </div>
        )}
      </div>
    );
  }

  return null;
}
