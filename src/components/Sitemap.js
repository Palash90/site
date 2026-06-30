import { useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { col } from "../utils/firestorePath";

const SITE_URL = "https://palashkantikundu.in";
const DATA_URL = "https://palash90.github.io/site-assets/data.json";

const STATIC_LINKS = [
  "https://palashkantikundu.in/",
  "https://www.palashkantikundu.in/",
  "https://music.palashkantikundu.in/",
  "https://guitalele-tutorials.palashkantikundu.in/",
  "https://vi-essentials.palashkantikundu.in/",
  "https://ai.palashkantikundu.in",
  "https://ai.palashkantikundu.in/visualizers/linear-regression.html",
  "https://ai.palashkantikundu.in/visualizers/neural-network.html",
];

const NAV_LINKS = ["/", "/contents/tech", "/contents/music", "/projects", "/about"];

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildSitemap(urls) {
  const unique = [...new Set(urls)];
  let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const url of unique) {
    xml += "\t<url>\n\t\t<loc>" + escapeXml(url) + "</loc>\n\t</url>\n";
  }
  xml += "</urlset>";
  return xml;
}

export default function Sitemap() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const navUrls = NAV_LINKS.map(p => SITE_URL + p);
      let blogUrls = [];

      try {
        const res = await fetch(DATA_URL);
        if (res.ok) {
          const data = await res.json();
          const blogs = [...(data.contents?.swe || []), ...(data.contents?.music || [])];
          blogUrls = blogs.map(b => SITE_URL + "/content/" + b.id);
        }
      } catch {}

      let scoreUrls = [];
      try {
        const snap = await getDocs(query(collection(db, col("scores")), where("published", "==", true)));
        snap.forEach(doc => {
          const d = doc.data();
          const uname = d.username || d.userId;
          if (d.slug && d.instrument && uname) {
            scoreUrls.push(SITE_URL + "/content/" + uname + "/" + d.instrument + "/" + d.slug);
          } else {
            scoreUrls.push(SITE_URL + "/content/u-" + doc.id);
          }
        });
      } catch {}

      if (!cancelled) {
        const xml = buildSitemap([...STATIC_LINKS, ...navUrls, ...blogUrls, ...scoreUrls]);
        document.open();
        document.write(xml);
        document.close();
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return null;
}
