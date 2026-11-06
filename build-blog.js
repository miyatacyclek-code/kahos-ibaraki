// Builds SEO pages for the blog from the POSTS array in index.html.
// Run after every change to POSTS:  node build-blog.js
// Output: blog/<id>.html (one page per post), blog/index.html, sitemap.xml
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const SITE = "https://miyatacyclek-code.github.io/kahos-ibaraki/";
const YT = "https://www.youtube.com/@kahofromjapan";
const root = __dirname;
const src = fs.readFileSync(path.join(root, "index.html"), "utf8");

const start = src.indexOf("const POSTS=[");
if (start < 0) throw new Error("POSTS not found in index.html");
const end = src.indexOf("\n];", start);
if (end < 0) throw new Error("End of POSTS not found");
const POSTS = vm.runInNewContext(src.slice(start + "const POSTS=".length, end + 3).replace(/;\s*$/, ""));

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const plain = s => String(s).replace(/<[^>]*>/g, "");
const MONTHS = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };
const isoMonth = d => { const [m, y] = String(d).split(" "); return MONTHS[m] && y ? `${y}-${MONTHS[m]}` : null; };
// Exact publish date (p.pub = "YYYY-MM-DD") if set, otherwise the month from p.date
const pubDate = p => p.pub || isoMonth(p.date);
const MNAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const showDate = p => { if (!p.pub) return esc(p.date); const [y, m, d] = p.pub.split("-"); return `<time datetime="${p.pub}">${MNAMES[+m - 1]} ${+d}, ${y}</time>`; };

const CSS = `:root{--ink:#1d2433;--muted:#5f6878;--bg:#f7f2e7;--card:#fffdf7;--red:#d4532f;--line:#e7dcc6}
*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--ink);font-family:"DM Sans",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
body{background-image:radial-gradient(#e9dfc9 1px,transparent 1px);background-size:18px 18px}
.wrap{max-width:680px;margin:0 auto;padding:16px 16px 60px}
a{color:#3b6fd4}
.top{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:16px;font-size:14px}
.top a.brand{font-family:"Fraunces",Georgia,serif;font-weight:800;color:var(--ink);text-decoration:none;font-size:18px}
.cardx{background:var(--card);border:2px solid var(--ink);border-radius:18px;box-shadow:4px 4px 0 var(--ink);overflow:hidden}
.hero{height:150px;display:grid;place-items:center;font-size:64px;border-bottom:2px solid var(--ink)}
img.hero{display:block;width:100%;height:260px;object-fit:cover;border-bottom:2px solid var(--ink)}
.inner{padding:18px 18px 22px}
.meta{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
h1,h2,h3{font-family:"Fraunces",Georgia,serif;letter-spacing:-.01em}
h1{font-size:30px;line-height:1.15;margin:8px 0 6px}
.by{font-size:13px;color:var(--muted);margin-bottom:16px}
article{font-size:17px;line-height:1.7;color:#272d3a}
article p{margin:0 0 14px}article h2{font-size:21px;margin:24px 0 6px}
article ul{padding-left:22px;margin:0 0 14px}article li{margin-bottom:6px}
.pull{font-family:"Caveat",cursive;font-weight:700;font-size:27px;line-height:1.2;color:var(--red);border-left:4px solid var(--red);padding:2px 0 2px 12px;margin:18px 0}
.btns{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}
.btn{flex:1;min-width:150px;text-align:center;text-decoration:none;font-weight:700;padding:12px 14px;border:2px solid var(--ink);border-radius:14px;background:#e3a531;color:var(--ink);box-shadow:3px 3px 0 var(--ink)}
.btn.dark{background:var(--ink);color:#fff}
.more{margin-top:26px}.more h2{font-size:20px;margin:0 0 10px}
.list{display:grid;gap:12px;padding:0;margin:0;list-style:none}
.list a{display:flex;gap:12px;align-items:center;text-decoration:none;color:var(--ink);background:var(--card);border:2px solid var(--ink);border-radius:14px;padding:10px 12px;box-shadow:3px 3px 0 var(--ink)}
.list .em{flex:none;width:48px;height:48px;border-radius:10px;border:2px solid var(--ink);display:grid;place-items:center;font-size:26px}
.list b{font-family:"Fraunces",Georgia,serif;display:block;line-height:1.2}
.list span{font-size:13px;color:var(--muted)}
footer{margin-top:30px;font-size:13px;color:var(--muted);text-align:center}`;

const head = ({ title, desc, url, image, type, extra = "" }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="Kaho's Ibaraki Guide">
${image ? `<meta property="og:image" content="${image}">\n<meta name="twitter:card" content="summary_large_image">` : `<meta name="twitter:card" content="summary">`}
<meta name="theme-color" content="#1f3b35">
<link rel="icon" href="../icon-192.png">
<link rel="alternate" type="application/rss+xml" title="Kaho's Ibaraki Blog" href="${SITE}blog/feed.xml">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,800&family=DM+Sans:wght@400;500;700&family=Caveat:wght@700&display=swap" rel="stylesheet">
<style>${CSS}</style>
${extra}</head>`;

const topbar = `<div class="top"><a class="brand" href="../">Kaho's Ibaraki Guide</a><a href="./">All blog posts</a></div>`;
const footer = `<footer>Written by Kaho · Ibaraki, Japan · <a href="${YT}" rel="noopener">YouTube</a></footer>`;
const item = p => `<li><a href="${p.id}.html"><span class="em" style="background:${p.bg}">${p.emoji}</span><span><b>${esc(plain(p.title))}</b><span>${esc(p.cat)} · ${esc(p.date)} · ${esc(plain(p.sum))}</span></span></a></li>`;

const bodyHtml = body => body.map(([t, v]) =>
  t === "p" ? `<p>${v}</p>` :
  t === "h" ? `<h2>${v}</h2>` :
  t === "pull" ? `<p class="pull">${v}</p>` :
  t === "ul" ? `<ul>${v.map(x => `<li>${x}</li>`).join("")}</ul>` : "").join("\n");

const outDir = path.join(root, "blog");
fs.mkdirSync(outDir, { recursive: true });
const ids = new Set();
for (const f of fs.readdirSync(outDir)) if (f.endsWith(".html")) fs.unlinkSync(path.join(outDir, f));

for (const p of POSTS) {
  if (!/^[a-z0-9-]+$/.test(p.id)) throw new Error("Bad post id: " + p.id);
  if (ids.has(p.id)) throw new Error("Duplicate post id: " + p.id);
  ids.add(p.id);
  const url = `${SITE}blog/${p.id}.html`;
  const title = plain(p.title);
  const image = SITE + (p.photo || "photos/seaside-nemophila.jpg");
  const ld = {
    "@context": "https://schema.org", "@type": "BlogPosting", headline: title, description: plain(p.desc || p.sum),
    author: { "@type": "Person", name: "Kaho", url: SITE }, mainEntityOfPage: url, inLanguage: "en",
    articleSection: p.cat, ...(pubDate(p) ? { datePublished: pubDate(p), dateModified: p.updated || pubDate(p) } : {}), ...(image ? { image } : {})
  };
  const related = [...POSTS.filter(x => x.id !== p.id && x.cat === p.cat), ...POSTS.filter(x => x.id !== p.id && x.cat !== p.cat)].slice(0, 3);
  const html = head({
    title: p.seo || `${title} | Kaho's Ibaraki Guide`, desc: plain(p.desc || p.sum), url, image, type: "article",
    extra: `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>\n`
  }) + `
<body><div class="wrap">
${topbar}
<div class="cardx">
${p.photo ? `<img class="hero" src="../${p.photo}" alt="${esc(p.alt || title)}" width="680" height="260">` : `<div class="hero" style="background:${p.bg}">${p.emoji}</div>`}
<div class="inner">
<div class="meta">${esc(p.cat)} · ${showDate(p)} · ${p.min} min read</div>
<h1>${p.title}</h1>
<div class="by">by <b>Kaho</b> · Ibaraki, Japan</div>
<article>
${bodyHtml(p.body)}
</article>
<div class="btns"><a class="btn" href="../#blog">Open Kaho's Ibaraki app</a><a class="btn dark" href="${YT}" rel="noopener">▶ Watch on YouTube</a></div>
</div></div>
<section class="more"><h2>More from Kaho</h2><ul class="list">${related.map(item).join("")}</ul></section>
${footer}
</div></body>
</html>
`;
  fs.writeFileSync(path.join(outDir, p.id + ".html"), html);
}

const indexDesc = "Stories about Ibaraki, Japan by Kaho, a local: places, food, travel tips and real life in rural Japan.";
fs.writeFileSync(path.join(outDir, "index.html"), head({ title: "Kaho's Ibaraki Blog | Food, travel and life in Ibaraki, Japan", desc: indexDesc, url: SITE + "blog/", image: SITE + "photos/seaside-nemophila.jpg", type: "website" }) + `
<body><div class="wrap">
${topbar}
<h1>Kaho's Ibaraki Blog</h1>
<p class="by">${indexDesc}</p>
<ul class="list">${POSTS.map(item).join("")}</ul>
<div class="btns"><a class="btn" href="../">Open Kaho's Ibaraki app</a><a class="btn dark" href="${YT}" rel="noopener">▶ Watch on YouTube</a></div>
${footer}
</div></body>
</html>
`);

const today = new Date().toISOString().slice(0, 10);
const urls = [[SITE, today], [SITE + "blog/", today], ...POSTS.map(p => [`${SITE}blog/${p.id}.html`, p.updated || pubDate(p)])];
fs.writeFileSync(path.join(root, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, d]) => `  <url><loc>${u}</loc>${d ? `<lastmod>${d}</lastmod>` : ""}</url>`).join("\n")}
</urlset>
`);
// RSS feed (helps search engines and readers find new posts quickly)
const rssDate = p => new Date(p.pub ? p.pub + "T00:00:00Z" : (isoMonth(p.date) || today.slice(0, 7)) + "-01T00:00:00Z").toUTCString();
fs.writeFileSync(path.join(outDir, "feed.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>Kaho's Ibaraki Blog</title>
<link>${SITE}blog/</link>
<atom:link href="${SITE}blog/feed.xml" rel="self" type="application/rss+xml"/>
<description>${esc(indexDesc)}</description>
<language>en</language>
${POSTS.map(p => `<item><title>${esc(plain(p.title))}</title><link>${SITE}blog/${p.id}.html</link><guid>${SITE}blog/${p.id}.html</guid><pubDate>${rssDate(p)}</pubDate><category>${esc(p.cat)}</category><description>${esc(plain(p.desc || p.sum))}</description></item>`).join("\n")}
</channel></rss>
`);
console.log(`Built ${POSTS.length} posts -> blog/, sitemap.xml, blog/feed.xml`);
