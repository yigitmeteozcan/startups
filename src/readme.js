// Renders README.md from the generated dataset (data/meta.json + data/stats.json),
// so the headline counts and endpoint tables never drift from the data.

function row(name, count, url, base) {
  return `| ${name} | ${count} | [\`${url.replace(base + '/', '')}\`](${url}) |`;
}

function collectionTable(meta, coll, label, { sortFn } = {}) {
  let items = meta.collections[coll] || [];
  if (sortFn) items = [...items].sort(sortFn);
  const head = `| ${label} | Companies | API |\n|---|---|---|\n`;
  return head + items.map((i) => row(i.name, i.count, i.api, meta.cdn)).join('\n');
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
        .map((s) => `[${s.name}](${s.site}) (${n(s.count)})`)
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

  return `# Startup Portfolios API

The open API for every company across multiple startup portfolios — [Techstars](https://www.techstars.com/portfolio), [Y Combinator](https://www.ycombinator.com/companies), [Antler](https://www.antler.co/portfolio), [500 Global](https://500.co/portfolio), [Entrepreneur First](https://www.joinef.com/portfolio/), [Alchemist](https://www.alchemistaccelerator.com/portfolio), and [Plug and Play](https://www.plugandplaytechcenter.com/innovation-services/startups/our-startups). Every record carries a \`source\` field, so you can query one combined dataset or filter to a single program. The data is refreshed automatically every day and served as static JSON, CSV, and XLSX over the jsDelivr CDN — no key, no rate limits, no setup.

**Sources:** ${sourceLine || 'Techstars · Y Combinator · Antler'}

[![companies](https://img.shields.io/badge/dynamic/json?url=${B}/stats.json&query=$.total&label=companies&color=blue)](${B}/all.json)
[![updated](https://img.shields.io/badge/dynamic/json?url=${B}/stats.json&query=$.generatedAt&label=updated)](STATS.md)
[![license](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**[🔎 Live explorer →](https://yigitmeteozcan.github.io/startups/)** · search (names, descriptions, founders, industries), filter (by source, country, region, industry, year range), sort, share a filtered view by link, and export all ${n(stats.total)} companies in your browser.

## ℹ️ Metadata

> Last updated: **${date}**

- **${n(stats.total)}** companies across **${sources.length}** portfolio sources
- **${cProgram}** accelerator programs / cohorts
- **${cIndustry}** industry verticals
- **${cCountry}** countries · **${cRegion}** world regions, across **${cYear}** cohort years
- 🦄 **${stats.unicorns}** unicorns · 💰 **${stats.exits}** exits · 🌱 **${stats.bCorps}** B Corps · 👤 **${n(stats.founders)}** founder profiles

${freshness ? `### Source freshness\n\n${freshness}\n\n_"cached" means the last live fetch failed or looked broken, so the previously committed records were kept rather than dropped._` : ''}

## 🚀 Quick start

\`\`\`bash
# everything
curl ${B}/all.json

# just the unicorns
curl ${B}/unicorns.json
\`\`\`

\`\`\`python
import requests
companies = requests.get("${B}/all.json").json()
print(len(companies), "companies")
\`\`\`

\`\`\`javascript
const companies = await fetch("${B}/all.json").then((r) => r.json());
\`\`\`

### Recipes

\`\`\`python
import requests

base = "${B}"

# Fintech unicorns
unicorns = requests.get(f"{base}/unicorns.json").json()
fintech = [c for c in unicorns if "Fintech" in c["tags"]]

# Every company from a single program
boulder = requests.get(f"{base}/by-program/techstars-boulder-accelerator.json").json()

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
| All companies | [\`all.json\`](${B}/all.json) |
| All companies (CSV) | [\`all.csv\`](${B}/all.csv) |
| All companies (Excel) | [\`all.xlsx\`](${B}/all.xlsx) |
| Unicorns (valued $1B+) | [\`unicorns.json\`](${B}/unicorns.json) |
| Exited companies | [\`exits.json\`](${B}/exits.json) |
| Certified B Corps | [\`b-corps.json\`](${B}/b-corps.json) |
| Current accelerator session | [\`current.json\`](${B}/current.json) |
| Aggregate stats | [\`stats.json\`](${B}/stats.json) |
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
| \`founders\` | object[] | Founders: \`name\`, \`role\`, \`linkedin\` (where available, e.g. EF / 500) |
| \`isExit\` | boolean | Has exited |
| \`isUnicorn\` | boolean | Valued $1B+ |
| \`isBCorp\` | boolean | Certified B Corp |
| \`isCurrentSession\` | boolean | In the current session |
| \`social\` | object | \`linkedin\`, \`twitter\`, \`facebook\`, \`crunchbase\` URLs |
| \`alsoIn\` | string[] | Other portfolios the same company (same website) is in |
| \`extra\` | object | Selected raw source fields (\`city\`, \`state_province\`, \`country\`, \`investor\`) |

> **CSV note:** \`all.csv\` keeps its original 22 columns in the same order and appends \`id\`, \`location\`, \`founder_roles\`, \`founder_linkedins\`, \`investor\` and \`also_in\`. Cells that would start with \`=\`, \`+\`, \`-\` or \`@\` are prefixed with \`'\` so spreadsheet apps don't run them as formulas; the JSON is never altered.

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
- **Alerting** — the job fails (and GitHub emails the owner) when a source has not been fetched live for 3+ days.

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

## 📄 License

The code is [MIT](LICENSE)-licensed. The data is sourced from the public Techstars, Y Combinator, Antler, 500 Global, Entrepreneur First, Alchemist, and Plug and Play portfolios and remains subject to each provider's terms — the MIT license covers the code, not their data. This project is not affiliated with or endorsed by any of them. To request a correction to a company or founder record, [open an issue](https://github.com/yigitmeteozcan/startups/issues/new?template=data-issue.md).
`;
}

module.exports = { renderReadme };
