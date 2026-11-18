// Renders README.md from the generated dataset (data/meta.json + data/stats.json),
// so the headline counts and endpoint tables never drift from the data.

// Short display path for an endpoint URL (CDN or raw GitHub).
function shortPath(url) {
  return String(url).replace(/^.*?\/data\//, '');
}

function row(name, count, url) {
  return `| ${name} | ${count} | [\`${shortPath(url)}\`](${url}) |`;
}

function collectionTable(meta, coll, label, { sortFn } = {}) {
  let items = meta.collections[coll] || [];
  if (sortFn) items = [...items].sort(sortFn);
  const head = `| ${label} | Companies | API |\n|---|---|---|\n`;
  return head + items.map((i) => row(i.name, i.count, i.api)).join('\n');
}

function renderReadme(meta, stats) {
  const B = meta.cdn;
  const date = (stats.generatedAt || meta.generatedAt || '').slice(0, 10);
  const n = (x) => Number(x || 0).toLocaleString();

  const tSource = collectionTable(meta, 'by-source', 'Source');
  const tYear = collectionTable(meta, 'by-year', 'Year', {
    sortFn: (a, b) => Number(b.name) - Number(a.name),
  });
  const tIndustry = collectionTable(meta, 'by-industry', 'Industry');
  const tRegion = collectionTable(meta, 'by-region', 'Region');
  const tCountry = collectionTable(meta, 'by-country', 'Country');
  const tProgram = collectionTable(meta, 'by-program', 'Program');

  const sources = meta.sources || [];
  const sourceLine = sources.length
    ? sources
        .slice()
        .sort((a, b) => b.count - a.count)
        .map((s) => `[${s.label || s.name}](${s.site}) (${n(s.count)})`)
        .join(' · ')
    : '';
  const cYear = (meta.collections['by-year'] || []).length;
  const cIndustry = (meta.collections['by-industry'] || []).length;
  const cRegion = (meta.collections['by-region'] || []).length;
  const cCountry = (meta.collections['by-country'] || []).length;
  const freshness = sources.length
    ? '| Source | Companies | Status | Last live fetch |\n|---|---|---|---|\n' +
      sources
        .slice()
        .sort((a, b) => b.count - a.count)
        .map((s) => {
          const label = s.status === 'live' ? '✅ live' : s.status === 'failed' ? '❌ failed' : '⚠️ cached';
          const when = s.lastLiveFetch ? s.lastLiveFetch.slice(0, 10) : 'unknown';
          return `| [${s.label || s.name}](${s.site}) | ${n(s.count)} | ${label} | ${when} |`;
        })
        .join('\n')
    : '';
  const cProgram = (meta.collections['by-program'] || []).length;

  const GH = 'https://github.com/yigitmeteozcan/startups';
  const E = meta.endpoints || {};
  const ALL = (E.all && E.all.api) || `${B}/all.json`;
  const ALL_CSV = (E.all && E.all.csv) || `${B}/all.csv`;
  const ALL_XLSX = (E.all && E.all.xlsx) || `${B}/all.xlsx`;
  const allViaRaw = !ALL.startsWith(B);
  const SITE = 'https://yigitmeteozcan.github.io/startups/';
  const badge = (label, query, color) =>
    `<img alt="${label}" src="https://img.shields.io/badge/dynamic/json?url=${encodeURIComponent(`${B}/stats.json`)}&query=${encodeURIComponent(query)}&label=${encodeURIComponent(label)}&color=${color}">`;

  return `<h1 align="center">Startup Portfolios API</h1>

<p align="center">
  <b>The free, open API for ${n(stats.total)} startups funded by the world's top accelerators.</b><br>
  Y Combinator · Techstars · 500 Global · Antler · Plug and Play · Entrepreneur First · Alchemist<br>
  JSON, CSV and Excel — with founder profiles (LinkedIn, X, GitHub), industries, countries, coordinates and exits. Refreshed daily. No key, no rate limits.
</p>

<p align="center">
  <a href="${ALL}">${badge('companies', '$.total', 'blue')}</a>
  <a href="${ALL}">${badge('founders', '$.founders', 'blueviolet')}</a>
  <a href="STATS.md">${badge('updated', '$.generatedAt', 'informational')}</a>
  <a href="${GH}/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/yigitmeteozcan/startups?style=flat&color=yellow"></a>
  <a href="${GH}/actions/workflows/test.yml"><img alt="Tests" src="${GH}/actions/workflows/test.yml/badge.svg"></a>
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/badge/license-MIT-green"></a>
</p>

<p align="center">
  <a href="${SITE}"><b>🔎 Open the live explorer</b></a> ·
  <a href="#-quick-start">Quick start</a> ·
  <a href="#-apis">All endpoints</a> ·
  <a href="#-schema">Schema</a> ·
  <a href="#rest-api-server">REST server</a>
</p>

<p align="center">
  <a href="${SITE}"><img src="docs/screenshot.png" alt="Startup Portfolios Explorer — search, filter and export every accelerator-backed startup" width="860"></a>
</p>

> ⭐ **Find this useful? [Star the repo](${GH})** — it's how other founders, investors and researchers discover it.

## ✨ Why this exists

Accelerator portfolios are scattered across seven different websites, each with its own format, filters and gaps. This project pulls them all into **one clean, consistent dataset** every day and serves it as static files on a CDN, so you can:

- **Build lead lists** — every YC, Techstars or Antler company in a country or industry, with founder names and LinkedIn profiles.
- **Research markets and investors** — which accelerators back which sectors, how cohorts have shifted year by year, who exited.
- **Ship apps and dashboards** — a free, stable JSON API with no key, no rate limits and no scraping on your side.
- **Train and evaluate models** — a labelled dataset of real companies with descriptions, industries and outcomes (companies in several portfolios are linked via \`alsoIn\`).

**Sources:** ${sourceLine || 'Techstars · Y Combinator · Antler'}

### 🌍 See where they are

Switch the [explorer](${SITE}?view=globe) to **Globe** and spin the planet: every startup is placed at its city (or its country when the city is unknown), filters apply live, and clicking a point lists the companies there. The same data is available as [\`geo.json\`](${(E.geo && E.geo.api) || `${B}/geo.json`}) for your own maps.

<p align="center">
  <a href="${SITE}?view=globe"><img src="docs/screenshot-globe.png" alt="Globe view of the explorer: startups placed by city around the world" width="760"></a>
</p>

## ℹ️ Metadata

> Last updated: **${date}**

- **${n(stats.total)}** companies across **${sources.length}** portfolio sources
- **${cProgram}** accelerator programs / cohorts
- **${cIndustry}** industry verticals
- **${cCountry}** countries · **${cRegion}** world regions, across **${cYear}** cohort years
- 🦄 **${stats.unicorns}** unicorns · 💰 **${n(stats.exits)}** exits · 🌱 **${stats.bCorps}** B Corps · 👤 **${n(stats.founders)}** founder profiles${stats.delisted ? `\n- 📦 **${n(stats.delisted)}** companies no longer listed by their source are kept (\`listed: false\`) — nothing is ever deleted` : ''}

${freshness ? `### Source freshness\n\n${freshness}\n\n_"cached" means the last live fetch failed or looked broken, so the previously committed records were kept rather than dropped._` : ''}

## 🚀 Quick start

Every endpoint is a plain HTTPS GET that returns JSON — no key, no sign-up, CORS enabled, so it works from a backend, a script, a notebook or straight from a web page.

\`\`\`bash
# just Y Combinator
curl ${B}/by-source/yc.json

# just the unicorns
curl ${B}/unicorns.json

# everything (${n(stats.total)} companies)
curl ${ALL}
\`\`\`

\`\`\`python
import requests
yc = requests.get("${B}/by-source/yc.json").json()
print(len(yc), "YC companies")
\`\`\`

\`\`\`javascript
// works in the browser too (CORS)
const yc = await fetch("${B}/by-source/yc.json").then((r) => r.json());
\`\`\`

${allViaRaw ? `> \`all.json\` is larger than jsDelivr's 20 MB per-file limit, so it is served from raw GitHub (no limit, also CORS-enabled). Every other file — including each source and each slice — is on the jsDelivr CDN. For production apps, prefer the per-source or per-slice files and cache them; the data changes once a day.\n` : '> The data changes once a day — cache it in your app rather than fetching on every request.\n'}

### Recipes

\`\`\`python
import requests

base = "${B}"

# Fintech unicorns
unicorns = requests.get(f"{base}/unicorns.json").json()
fintech = [c for c in unicorns if "Fintech" in c["tags"]]

# Every company from a single program
boulder = requests.get(f"{base}/by-program/techstars-boulder-accelerator.json").json()

# Founders with LinkedIn profiles, e.g. for outreach
companies = requests.get("${ALL}").json()
founders = [(c["name"], f["name"], f["linkedin"]) for c in companies for f in c["founders"] if f["linkedin"]]

# Every startup in one country
germany = requests.get(f"{base}/by-country/germany.json").json()

# Discover every endpoint and its count
meta = requests.get(f"{base}/meta.json").json()
print(meta["collections"]["by-industry"][:3])
\`\`\`

## 💻 APIs

The base URL for every endpoint is:

\`\`\`
${B}/
\`\`\`

### 🏢 Companies

| Description | API |
|---|---|
| All companies | [\`all.json\`](${ALL}) |
| All companies (CSV) | [\`all.csv\`](${ALL_CSV}) |
| All companies (Excel, refreshed weekly) | [\`all.xlsx\`](${ALL_XLSX}) |
| Unicorns (valued $1B+) | [\`unicorns.json\`](${B}/unicorns.json) |
| Exited companies | [\`exits.json\`](${B}/exits.json) |
| Certified B Corps | [\`b-corps.json\`](${B}/b-corps.json) |
| Current accelerator session | [\`current.json\`](${B}/current.json) |
| Aggregate stats | [\`stats.json\`](${B}/stats.json) |
| Map points — companies grouped by city / country with coordinates | [\`geo.json\`](${B}/geo.json) |
| **Catalog of every endpoint** | [\`meta.json\`](${B}/meta.json) |

### 🏛️ By source

<details open>
<summary>${sources.length} portfolio sources — <a href="${B}/by-source/index.json">index.json</a></summary>

${tSource}

</details>

### 🎓 By year

<details>
<summary>${cYear} cohort years — <a href="${B}/by-year/index.json">index.json</a></summary>

${tYear}

</details>

### 🏭 By industry

<details>
<summary>${cIndustry} industry verticals — <a href="${B}/by-industry/index.json">index.json</a></summary>

${tIndustry}

</details>

### 🌍 By region

<details>
<summary>${cRegion} world regions — <a href="${B}/by-region/index.json">index.json</a></summary>

${tRegion}

</details>

### 🗺️ By country

<details>
<summary>${cCountry} countries — <a href="${B}/by-country/index.json">index.json</a></summary>

${tCountry}

</details>

### 🏷️ By program

<details>
<summary>${cProgram} accelerator programs — <a href="${B}/by-program/index.json">index.json</a></summary>

${tProgram}

</details>

> Tip: pull [\`meta.json\`](${B}/meta.json) once to discover every available URL and count programmatically.

## 📀 Schema

Each company is an object with the following fields:

| Field | Type | Description |
|---|---|---|
| \`id\` | string | Stable unique id, e.g. \`yc-airbnb\` |
| \`source\` | string | Portfolio source (\`techstars\`, \`yc\`, \`antler\`, \`500\`, \`ef\`, \`alchemist\`, \`plugandplay\`) |
| \`name\` | string | Company name |
| \`description\` | string | Short description |
| \`website\` | string | Company website URL |
| \`logo\` | string | Logo image URL |
| \`location\` | string | \`City, State, Country\` |
| \`country\` | string | Normalized country name (e.g. \`USA\` → \`United States\`) |
| \`region\` | string | World region (e.g. Americas) |
| \`subregion\` | string | World subregion (e.g. North America) |
| \`tags\` | string[] | Industry verticals / tags |
| \`year\` | number | First session (cohort) year |
| \`program\` | string | Accelerator program name |
| \`programSlugs\` | string[] | Program slug(s) |
| \`founders\` | object[] | Founders: \`name\`, \`role\`, \`linkedin\`, and where available \`twitter\`, \`github\`, \`website\`, \`bio\`, \`avatar\` (YC profiles are filled in from ycombinator.com; EF, 500 and Alchemist from their portfolios) |
| \`sourceUrl\` | string | The company's page on its source portfolio (YC) |
| \`isExit\` | boolean | Has exited |
| \`isUnicorn\` | boolean | Valued $1B+ |
| \`isBCorp\` | boolean | Certified B Corp |
| \`isCurrentSession\` | boolean | In the current session |
| \`social\` | object | \`linkedin\`, \`twitter\`, \`facebook\`, \`crunchbase\` URLs |
| \`alsoIn\` | string[] | Other portfolios the same company (same website) is in |
| \`listed\` | boolean | Only present (as \`false\`) when the company no longer appears in its source portfolio — it is kept, never deleted |
| \`formerNames\` | string[] | Previous names, when a company was renamed in its source portfolio (only present if renamed) |
| \`delistedAt\` | string | Date the company was first missing from its source portfolio (with \`listed: false\`) |
| \`extra\` | object | Selected raw source fields (\`city\`, \`state_province\`, \`country\`, \`investor\`) |

> **CSV note:** \`all.csv\` keeps its original 22 columns in the same order and appends \`id\`, \`location\`, \`founder_roles\`, \`founder_linkedins\`, \`investor\`, \`also_in\`, \`listed\`, \`delisted_at\`, \`former_names\`, \`founder_twitters\`, \`founder_githubs\`, \`founder_websites\` and \`source_url\`. Cells that would start with \`=\`, \`+\`, \`-\` or \`@\` are prefixed with \`'\` so spreadsheet apps don't run them as formulas; the JSON is never altered.

### Example

\`\`\`json
{
  "name": "DigitalOcean",
  "description": "Simple, scalable cloud computing solutions built for startups and small-to-midsize businesses.",
  "website": "https://digitalocean.com",
  "location": "New York City, New York, United States",
  "region": "Americas",
  "subregion": "North America",
  "tags": ["Cloudtech and DevOps"],
  "year": 2012,
  "program": "Techstars Boulder Accelerator",
  "isExit": true,
  "isUnicorn": true,
  "isBCorp": false,
  "isCurrentSession": false,
  "social": {
    "linkedin": "https://linkedin.com/company/digitalocean",
    "twitter": "https://twitter.com/digitalocean",
    "facebook": "https://facebook.com/DigitalOceanCloudHosting",
    "crunchbase": "https://crunchbase.com/organization/digitalocean"
  }
}
\`\`\`

## 📊 Stats

See **[STATS.md](STATS.md)** for charts — companies per year, top countries and cities, top programs, leading industries, and more. You can also [browse the raw files](data/) directly in the repo.

## 🔄 How it stays fresh

A scheduled job pulls each source — Techstars from its public search index, Y Combinator from its public company directory, 500 Global, Entrepreneur First, Alchemist, and Plug and Play from their public JSON endpoints, and Antler via a headless browser — merges them into one dataset, rebuilds every JSON/CSV/XLSX file, regenerates the stats and this README, and commits the result.

Guard rails keep a bad scrape from damaging the data:

- **Junk filter** — records without a name plus at least one real attribute are rejected.
- **Shrink guard** — if a source suddenly returns far fewer companies than are already committed (below 80%), the live result is treated as broken and the committed records are kept.
- **Fallback** — any source that fails keeps its previously committed records, and the table above shows it as "cached".
- **Nothing is deleted** — a company that disappears from its source portfolio stays in the dataset, flagged \`listed: false\` with the date it was first missed.
- **Alerting** — the job fails (and GitHub emails the owner) on the day a source goes 3+ days without a live fetch, then weekly while it stays that way.

## 🛠️ Run it yourself

\`\`\`bash
npm ci
npm run install:browsers  # Chromium, for the browser-based sources
npm run fetch:data        # fetch every source live and rebuild data/ + README
npm run rebuild           # re-render data/ from the committed all.json (no network)
npm test                  # run the test suite
\`\`\`

\`npm run build:data\` is an alias of \`fetch:data\`. Set \`TYPESENSE_API_KEY\` for the fast Techstars path; without it Techstars is scraped in a headless browser (which captures the public search key itself).

If a source is ever wiped by a bad upstream change, restore it from any earlier commit:

\`\`\`bash
npm run restore -- plugandplay <commit-sha>
\`\`\`

### REST API server

\`\`\`bash
npm start                 # http://localhost:3000
\`\`\`

Serves the full multi-source dataset from \`data/all.json\` (or from \`DATA_URL\`, e.g. the CDN, if set):

| Endpoint | Description |
|---|---|
| \`GET /portfolio\` | Companies, paginated (\`page\`, \`limit\` ≤ 500) and filterable: \`search\`, \`source\`, \`industry\`, \`tag\`, \`country\`, \`region\`, \`location\`, \`program\`, \`year\`, \`yearFrom\`, \`yearTo\`, \`unicorn\`, \`exit\`, \`bcorp\`, \`current\`, \`hasFounders\`, \`sort\` (\`name-asc\`, \`name-desc\`, \`year-asc\`, \`year-desc\`) |
| \`GET /portfolio.csv\` / \`GET /portfolio.xlsx\` | Same filters, as a download |
| \`GET /portfolio/:idOrName\` | One company by id (\`yc-airbnb\`) or name |
| \`GET /facets\` | Every filter value with counts |
| \`GET /stats\`, \`GET /meta\`, \`GET /sources\`, \`GET /health\` | Stats, endpoint catalog, source freshness, health |
| \`DELETE /cache\`, \`POST /admin/rebuild\` | Admin only: \`Authorization: Bearer $ADMIN_TOKEN\` (or localhost when no token is set) |

\`npm run export -- [file.xlsx] [--source=yc] [--live]\` writes an Excel file of the dataset (\`--live\` re-scrapes Techstars first).

## 🤝 Contributing

Spotted a wrong or missing company? [Open a data issue](${GH}/issues/new?template=data-issue.md). Want another accelerator added? [Request it](${GH}/issues/new?template=feature-request.md). Code contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). If you use the data in research, GitHub's **"Cite this repository"** button gives you a ready-made citation.

## ⭐ Star history

<a href="https://star-history.com/#yigitmeteozcan/startups&Date"><img src="https://api.star-history.com/svg?repos=yigitmeteozcan/startups&type=Date" alt="Star history chart" width="600"></a>

## 📄 License

The code is [MIT](LICENSE)-licensed. The data is sourced from the public Techstars, Y Combinator, Antler, 500 Global, Entrepreneur First, Alchemist, and Plug and Play portfolios and remains subject to each provider's terms — the MIT license covers the code, not their data. This project is not affiliated with or endorsed by any of them. City coordinates in \`geo.json\` come from [GeoNames](https://www.geonames.org/) (CC BY 4.0); the globe uses [globe.gl](https://github.com/vasturiano/globe.gl) (MIT) and a NASA Earth texture (public domain). To request a correction to a company or founder record, [open an issue](https://github.com/yigitmeteozcan/startups/issues/new?template=data-issue.md).
`;
}

module.exports = { renderReadme };
