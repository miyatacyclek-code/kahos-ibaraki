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

// Recipes (the Recipes tab inside Blog in the app)
const rs = src.indexOf("const RECIPES=[");
if (rs < 0) throw new Error("RECIPES not found in index.html");
const re_ = src.indexOf("\n];", rs);
const RECIPES = vm.runInNewContext(src.slice(rs + "const RECIPES=".length, re_ + 3).replace(/;\s*$/, ""));
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
article ul,article ol{padding-left:22px;margin:0 0 14px}article li{margin-bottom:6px}
.pull{font-family:"Caveat",cursive;font-weight:700;font-size:27px;line-height:1.2;color:var(--red);border-left:4px solid var(--red);padding:2px 0 2px 12px;margin:18px 0}
.btns{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}
.btn{flex:1;min-width:150px;text-align:center;text-decoration:none;font-weight:700;padding:12px 14px;border:2px solid var(--ink);border-radius:14px;background:#e3a531;color:var(--ink);box-shadow:3px 3px 0 var(--ink)}
.btn.dark{background:var(--ink);color:#fff}
.more{margin-top:26px}.more h2{font-size:20px;margin:0 0 10px}
.list{display:grid;gap:12px;padding:0;margin:0;list-style:none}
.list a{display:flex;gap:12px;align-items:center;text-decoration:none;color:var(--ink);background:var(--card);border:2px solid var(--ink);border-radius:14px;padding:10px 12px;box-shadow:3px 3px 0 var(--ink)}
.list .em{flex:none;width:48px;height:48px;border-radius:10px;border:2px solid var(--ink);display:grid;place-items:center;font-size:26px}
img.em{object-fit:cover;width:48px;height:48px}
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
<meta name="author" content="Kaho">
<meta name="theme-color" content="#1f3b35">
<link rel="icon" href="../icon-192.png">
<link rel="alternate" type="application/rss+xml" title="Kaho's Ibaraki Blog" href="${SITE}blog/feed.xml">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,800&family=DM+Sans:wght@400;500;700&family=Caveat:wght@700&display=swap" rel="stylesheet">
<style>${CSS}</style>
${extra}</head>`;

const topbar = `<div class="top"><a class="brand" href="../">Kaho's Ibaraki Guide</a><a href="./">All blog posts</a></div>`;
const footer = `<footer>Written by Kaho · Ibaraki, Japan · <a href="${YT}" rel="noopener">YouTube</a></footer>`;
const thumb = p => p.photo ? `<img class="em" src="../${p.photo}" alt="${esc(p.alt || plain(p.title))}" width="48" height="48" loading="lazy">` : `<span class="em" style="background:${p.bg}">${p.emoji}</span>`;
const item = p => `<li><a href="${p.id}.html">${thumb(p)}<span><b>${esc(plain(p.title))}</b><span>${esc(p.cat)} · ${esc(p.date)} · ${esc(plain(p.sum))}</span></span></a></li>`;

const bodyHtml = body => body.map(([t, v]) =>
  t === "p" ? `<p>${v}</p>` :
  t === "h" ? `<h2>${v}</h2>` :
  t === "pull" ? `<p class="pull">${v}</p>` :
  t === "ul" ? `<ul>${v.map(x => `<li>${x}</li>`).join("")}</ul>` : "").join("\n");

const outDir = path.join(root, "blog");
fs.mkdirSync(outDir, { recursive: true });
const ids = new Set();
for (const f of fs.readdirSync(outDir)) if (f.endsWith(".html")) fs.unlinkSync(path.join(outDir, f));
const rUrl = r => `${r.id}-recipe.html`;

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
  const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Kaho's Ibaraki Guide", item: SITE },
    { "@type": "ListItem", position: 2, name: "Blog", item: SITE + "blog/" },
    { "@type": "ListItem", position: 3, name: title, item: url }] };
  const related = [...POSTS.filter(x => x.id !== p.id && x.cat === p.cat), ...POSTS.filter(x => x.id !== p.id && x.cat !== p.cat)].slice(0, 3);
  const html = head({
    title: p.seo || `${title} | Kaho's Ibaraki Guide`, desc: plain(p.desc || p.sum), url, image, type: "article",
    extra: `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>
<script type="application/ld+json">${JSON.stringify(crumbs).replace(/</g, "\\u003c")}</script>
${pubDate(p) && pubDate(p).length === 10 ? `<meta property="article:published_time" content="${pubDate(p)}">\n` : ""}`
  }) + `
<body><div class="wrap">
${topbar}
<div class="cardx">
${p.photo ? `<img class="hero" src="../${p.photo}" alt="${esc(p.alt || title)}" width="680" height="260" fetchpriority="high">` : `<div class="hero" style="background:${p.bg}">${p.emoji}</div>`}
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

// ---- Recipe pages ----
const fmtAmt = n => { const f = { 0.25: "¼", 0.5: "½", 0.75: "¾" }; const w = Math.floor(n), r = Math.round((n - w) * 100) / 100; const fr = f[r] || (r ? String(r).slice(1) : ""); return (w || !fr ? String(w) : "") + fr; };
const ingText = g => `${g[1] ? fmtAmt(g[1]) + (g[2] ? " " + g[2] : "") + " " : ""}${g[0]}`.trim();
const rTime = r => typeof r.time === "number" ? `${r.time} min` : r.time;
const isoDur = r => typeof r.time === "number" ? `PT${r.time}M` : null;
const rItem = r => `<li><a href="${rUrl(r)}">${r.photo ? `<img class="em" src="../${r.photo}" alt="${esc(r.name)}" width="48" height="48" loading="lazy">` : `<span class="em" style="background:${r.bg}">${r.emoji}</span>`}<span><b>${esc(r.name)} Recipe</b><span>${esc(r.jp)} · ⏱ ${esc(rTime(r))} · ${esc(r.level)}</span></span></a></li>`;
for (const r of RECIPES) {
  if (!/^[a-z0-9-]+$/.test(r.id)) throw new Error("Bad recipe id: " + r.id);
  const url = `${SITE}blog/${rUrl(r)}`;
  const desc = `How to make ${r.name} (${r.jp}) at home: easy Japanese home cooking from Kaho in Ibaraki. ${rTime(r)}, ${r.base} serving${r.base > 1 ? "s" : ""}, with tips for cooking outside Japan.`;
  const ld = { "@context": "https://schema.org", "@type": "Recipe", name: r.name, alternateName: r.jp, description: plain(r.kaho), author: { "@type": "Person", name: "Kaho", url: SITE },
    recipeCuisine: "Japanese", recipeCategory: "Japanese home cooking", recipeYield: `${r.base} serving${r.base > 1 ? "s" : ""}`, ...(isoDur(r) ? { totalTime: isoDur(r) } : {}),
    recipeIngredient: r.ing.map(ingText), recipeInstructions: r.steps.map(t => ({ "@type": "HowToStep", text: plain(t) })), ...(r.photo ? { image: SITE + r.photo } : {}), inLanguage: "en", mainEntityOfPage: url };
  const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Kaho's Ibaraki Guide", item: SITE },
    { "@type": "ListItem", position: 2, name: "Recipes", item: SITE + "blog/recipes.html" },
    { "@type": "ListItem", position: 3, name: r.name, item: url }] };
  const others = RECIPES.filter(x => x.id !== r.id).slice(0, 3);
  fs.writeFileSync(path.join(outDir, rUrl(r)), head({ title: `${r.name} Recipe (${r.jp}): Easy Japanese Home Cooking`, desc, url, image: r.photo ? SITE + r.photo : null, type: "article",
    extra: `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>\n<script type="application/ld+json">${JSON.stringify(crumbs).replace(/</g, "\\u003c")}</script>\n` }) + `
<body><div class="wrap">
<div class="top"><a class="brand" href="../">Kaho's Ibaraki Guide</a><a href="recipes.html">All recipes</a></div>
<div class="cardx">
${r.photo ? `<img class="hero" src="../${r.photo}" alt="Homemade ${esc(r.name)}" width="680" height="260" fetchpriority="high">` : `<div class="hero" style="background:${r.bg}">${r.emoji}</div>`}
<div class="inner">
<div class="meta">Recipe · ⏱ ${esc(rTime(r))} · ${esc(r.level)}${r.ib ? " · Ibaraki special" : ""}</div>
<h1>${esc(r.name)} <span style="font-size:20px;color:var(--muted)">${esc(r.jp)}</span></h1>
<div class="by">by <b>Kaho</b> · Ibaraki, Japan</div>
<article>
<p class="pull">${r.kaho}</p>
<h2>Ingredients (${r.base} serving${r.base > 1 ? "s" : ""})</h2>
<ul>${r.ing.map(g => `<li>${esc(ingText(g))}</li>`).join("")}</ul>
<h2>How to make it</h2>
<ol>${r.steps.map(t => `<li>${t}</li>`).join("")}</ol>
<h2>Living outside Japan?</h2>
<p>${r.swap}</p>
</article>
<div class="btns"><a class="btn" href="../#cook">Open in Kaho's app (change servings)</a><a class="btn dark" href="${YT}" rel="noopener">▶ Watch on YouTube</a></div>
</div></div>
<section class="more"><h2>More recipes</h2><ul class="list">${others.map(rItem).join("")}</ul></section>
${footer}
</div></body>
</html>
`);
}
const recDesc = "Easy Japanese home cooking recipes from Kaho in Ibaraki: natto rice, onigiri, miso soup, oyakodon, tamagoyaki and more, with tips for cooking outside Japan.";
fs.writeFileSync(path.join(outDir, "recipes.html"), head({ title: "Easy Japanese Home Cooking Recipes | Kaho's Ibaraki Kitchen", desc: recDesc, url: SITE + "blog/recipes.html", image: null, type: "website",
  extra: `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "ItemList", name: "Kaho's Japanese home cooking recipes", itemListElement: RECIPES.map((r, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE}blog/${rUrl(r)}`, name: r.name })) }).replace(/</g, "\\u003c")}</script>\n` }) + `
<body><div class="wrap">
${topbar}
<h1>Kaho's kitchen: easy Japanese recipes</h1>
<p class="by">${recDesc}</p>
<ul class="list">${RECIPES.map(rItem).join("")}</ul>
<div class="btns"><a class="btn" href="../#cook">Open Kaho's Ibaraki app</a><a class="btn dark" href="${YT}" rel="noopener">▶ Watch on YouTube</a></div>
${footer}
</div></body>
</html>
`);

const indexDesc = "Stories about Ibaraki, Japan by Kaho, a local: places, food, travel tips and real life in rural Japan.";
fs.writeFileSync(path.join(outDir, "index.html"), head({ title: "Kaho's Ibaraki Blog | Food, travel and life in Ibaraki, Japan", desc: indexDesc, url: SITE + "blog/", image: SITE + "photos/seaside-nemophila.jpg", type: "website",
  extra: `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "Blog", name: "Kaho's Ibaraki Blog", url: SITE + "blog/", description: indexDesc, inLanguage: "en",
    author: { "@type": "Person", name: "Kaho", url: SITE, sameAs: [YT] },
    blogPost: POSTS.map(p => ({ "@type": "BlogPosting", headline: plain(p.title), url: `${SITE}blog/${p.id}.html`, ...(pubDate(p) ? { datePublished: pubDate(p) } : {}), ...(p.photo ? { image: SITE + p.photo } : {}) })) }).replace(/</g, "\\u003c")}</script>\n` }) + `
<body><div class="wrap">
${topbar}
<h1>Kaho's Ibaraki Blog</h1>
<p class="by">${indexDesc}</p>
<ul class="list">${POSTS.map(item).join("")}</ul>
<section class="more"><h2>Recipes from Kaho's kitchen</h2><ul class="list">${RECIPES.map(rItem).join("")}</ul></section>
<div class="btns"><a class="btn" href="../">Open Kaho's Ibaraki app</a><a class="btn dark" href="${YT}" rel="noopener">▶ Watch on YouTube</a></div>
${footer}
</div></body>
</html>
`);


// ---- Guide request page (root: guide-request.html) ----
// Requests are sent by email (mailto). The address is put together in JS so it is not plain text in the HTML.
const GR_URL = SITE + "guide-request.html";
const grDesc = "Planning a trip to Ibaraki, Japan, or curious about rural life? Request a video call with Kaho, a local: trip ideas for Hitachi Seaside Park, Fukuroda Falls, food and real life in the Japanese countryside.";
const grCSS = `
form{display:grid;gap:14px;margin-top:6px}
label{font-weight:700;font-size:14px;display:grid;gap:6px}
label small{font-weight:400;color:var(--muted)}
input,select,textarea{font:inherit;font-size:16px;padding:11px 12px;border:2px solid var(--ink);border-radius:12px;background:#fff;color:var(--ink);width:100%}
textarea{min-height:110px;resize:vertical}
.row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:480px){.row{grid-template-columns:1fr}}
fieldset{border:2px solid var(--ink);border-radius:12px;padding:10px 12px;margin:0}
legend{font-weight:700;font-size:14px;padding:0 6px}
.checks{display:flex;flex-wrap:wrap;gap:8px}
.checks label{display:flex;align-items:center;gap:6px;font-weight:500;background:var(--bg);border:1.5px solid var(--line);border-radius:999px;padding:6px 12px;cursor:pointer}
.checks input{width:auto;margin:0}
button.btn{cursor:pointer;font:inherit;font-weight:700;font-size:16px}
.ok{display:none;background:#dcefe3;border:2px solid var(--ink);border-radius:14px;padding:14px;font-size:15px;line-height:1.6}
.ok.on{display:block}
.ok code{background:#fff;border-radius:6px;padding:2px 6px;font-size:14px}
.ideas{display:grid;gap:10px;margin:10px 0 4px;padding:0;list-style:none}
.ideas li{background:var(--bg);border:1.5px solid var(--line);border-radius:12px;padding:10px 12px;font-size:15px;line-height:1.5}
.ideas b{font-family:"Fraunces",Georgia,serif}
table.price{width:100%;border-collapse:separate;border-spacing:0;border:2px solid var(--ink);border-radius:14px;overflow:hidden;margin:6px 0 8px;background:#fff}
table.price th,table.price td{padding:12px 14px;font-size:17px;border-bottom:1.5px solid var(--line)}
table.price tr:last-child th,table.price tr:last-child td{border-bottom:0}
table.price th{text-align:left;font-weight:500}
table.price td{text-align:right;font-family:"Fraunces",Georgia,serif;font-weight:800;font-size:20px}`;
const grLd = { "@context": "https://schema.org", "@type": "WebPage", name: "Video call with a local in Ibaraki", url: GR_URL, description: grDesc, inLanguage: "en",
  about: { "@type": "Place", name: "Ibaraki Prefecture, Japan" }, author: { "@type": "Person", name: "Kaho", url: SITE } };
const interests = ["Trip planning", "Flowers & nature", "Local food", "Shrines & temples", "Real rural life", "Working in Japan", "Festivals & events", "Japanese culture"];
fs.writeFileSync(path.join(root, "guide-request.html"), head({ title: "Video Call with a Local in Ibaraki, Japan | Kaho's Ibaraki Guide", desc: grDesc, url: GR_URL, image: SITE + "photos/seaside-nemophila.jpg", type: "website",
  extra: `<style>${grCSS}</style>\n<script type="application/ld+json">${JSON.stringify(grLd).replace(/</g, "\\u003c")}</script>\n` })
  .replace('href="../icon-192.png"', 'href="icon-192.png"') + `
<body><div class="wrap">
<div class="top"><a class="brand" href="./">Kaho's Ibaraki Guide</a><a href="blog/">Blog</a></div>
<div class="cardx">
<img class="hero" src="photos/seaside-nemophila.jpg" alt="Blue nemophila flowers at Hitachi Seaside Park, Ibaraki" width="680" height="260" fetchpriority="high">
<div class="inner">
<div class="meta">Video call · Ibaraki, Japan</div>
<h1>Video call with a local in Ibaraki</h1>
<div class="by">by <b>Kaho</b> · I live in Ibaraki, 1 hour from Tokyo</div>
<article>
<p>Hi! I'm Kaho. I share real life in rural Japan on YouTube and TikTok. Many of you ask me questions about Ibaraki and life in Japan. So now you can talk with me on a video call!</p>
<p>Tell me what you want to talk about. I'll read every request and reply by email. Sending a request is free and is not a booking yet.</p>
<h2>What we can talk about</h2>
<ul class="ideas">
<li><b>Plan your Ibaraki trip</b><br>Best season, how to get there from Tokyo, where to eat. Hitachi Seaside Park, Fukuroda Falls, Oarai and more.</li>
<li><b>Real life in rural Japan</b><br>Work, food, houses, unwritten rules. Things you saw in my videos.</li>
<li><b>Japanese culture Q&amp;A</b><br>Anything you're curious about, from omiyage to onsen manners.</li>
</ul>
<h2>Prices</h2>
<table class="price"><tr><th>30 minutes</th><td>$35</td></tr><tr><th>60 minutes</th><td>$60</td></tr></table>
<p style="font-size:14px;color:var(--muted)">Price per call (USD).</p>
<h2>How it works</h2>
<ol>
<li><b>Send a request</b> with this form. I'll reply by email with some times that work for me.</li>
<li><b>Pay in advance</b> to confirm. You can choose how to pay:<ul><li><b>PayPal</b>: pay with your PayPal account or a credit/debit card</li><li><b>Wise</b>: bank transfer in USD, EUR or GBP</li></ul></li>
<li><b>We talk on Google Meet.</b> I'll send you the Meet link before the day. You can join from your phone or computer.</li>
</ol>
<h2>Cancellation</h2>
<table class="price"><tr><th>Before you pay</th><td>Free</td></tr><tr><th>After paying, up to 3 days before</th><td>15%</td></tr><tr><th>2 days before</th><td>30%</td></tr><tr><th>1 day before</th><td>50%</td></tr><tr><th>On the day / no-show</th><td>100%</td></tr></table>
<p style="font-size:14px;color:var(--muted)">Cancellation fee as a percentage of the call price.</p>
<h2>Good to know</h2>
<ul>
<li>Video calls only for now. I don't meet in person.</li>
<li><b>This is not a date.</b> Please keep it friendly and respectful.</li>
<li><b>Please don't ask about my private life</b> (where I live, my relationships, my personal contacts or social accounts). Questions about Ibaraki and life in rural Japan are very welcome!</li>
<li>I may say no to a request, or end the call early, if these rules are not kept.</li>
</ul>
</article>
<form id="gr" novalidate>
<div class="row">
<label>Your name<input name="name" autocomplete="name" required></label>
<label>Your email<input name="email" type="email" autocomplete="email" required></label>
</div>
<div class="row">
<label>Preferred days &amp; times<small>Please include your time zone</small><input name="date" placeholder="e.g. weekends, 8–10pm New York time"></label>
<label>Your country<input name="country" autocomplete="country-name"></label>
</div>
<div class="row">
<label>Length<select name="length"><option>30 minutes ($35)</option><option selected>60 minutes ($60)</option></select></label>
<label>Visiting Ibaraki?<select name="from"><option selected>Yes, planning a trip</option><option>Maybe someday</option><option>No, just curious</option></select></label>
</div>
<fieldset><legend>What do you want to talk about?</legend><div class="checks">
${interests.map(x => `<label><input type="checkbox" name="like" value="${esc(x)}">${esc(x)}</label>`).join("\n")}
</div></fieldset>
<label>Your questions<textarea name="msg" placeholder="Anything about Ibaraki or life in Japan! Your travel dates, places you saw in my videos, food you want to try…"></textarea></label>
<button class="btn" type="submit">✉️ Send my request</button>
<p style="font-size:13px;color:var(--muted);margin:0">Your email app will open with your request. Just press send there.</p>
</form>
<div class="ok" id="ok">
<b>Almost done! 🎉</b><br>Your email app should be open now. Please press <b>send</b> there.<br>
If nothing opened, email me at <code id="addr"></code> <button type="button" class="btn" id="copy" style="display:inline-block;width:auto;padding:4px 10px;margin:4px 0 0;font-size:13px">Copy my request</button>
</div>
</div></div>
<div class="btns"><a class="btn" href="./">Open Kaho's Ibaraki app</a><a class="btn dark" href="${YT}" rel="noopener">▶ Watch on YouTube</a></div>
${footer}
</div>
<script>
(function(){
  var a=["miyatacyclek","gmail.com"].join("@");
  document.getElementById("addr").textContent=a;
  var f=document.getElementById("gr"),last="";
  f.addEventListener("submit",function(e){
    e.preventDefault();
    var d=new FormData(f),name=(d.get("name")||"").trim(),mail=(d.get("email")||"").trim();
    if(!name||!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(mail)){alert("Please write your name and email.");return}
    var likes=d.getAll("like").join(", ")||"-";
    last="Hi Kaho!\\n\\nName: "+name+"\\nEmail: "+mail+"\\nCountry: "+(d.get("country")||"-")+"\\nDays & times: "+(d.get("date")||"-")+"\\nLength: "+d.get("length")+"\\nVisiting Ibaraki: "+d.get("from")+"\\nTopics: "+likes+"\\n\\n"+(d.get("msg")||"");
    location.href="mailto:"+a+"?subject="+encodeURIComponent("Video call request from "+name)+"&body="+encodeURIComponent(last);
    document.getElementById("ok").classList.add("on");
  });
  document.getElementById("copy").addEventListener("click",function(){
    if(navigator.clipboard)navigator.clipboard.writeText(last).then(function(){alert("Copied! Paste it into an email to "+a)});
  });
})();
</script>
</body>
</html>
`);

const today = new Date().toISOString().slice(0, 10);
const urls = [[SITE, today], [SITE + "guide-request.html", null], [SITE + "blog/", today], ...POSTS.map(p => [`${SITE}blog/${p.id}.html`, p.updated || pubDate(p)]), [SITE + "blog/recipes.html", today], ...RECIPES.map(r => [`${SITE}blog/${rUrl(r)}`, null])];
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
console.log(`Built ${RECIPES.length} recipes, ${POSTS.length} posts -> blog/, sitemap.xml, blog/feed.xml`);
