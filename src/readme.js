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
  const cProgram = (meta.collections['by-program'] || []).length;

  return `# Startup Portfolios API

The open API for every company across multiple startup portfolios — [Techstars](https://www.techstars.com/portfolio), [Y Combinator](https://www.ycombinator.com/companies), and [Antler](https://www.antler.co/portfolio). Every record carries a \`source\` field, so you can query one combined dataset or filter to a single program. The data is refreshed automatically every day and served as static JSON, CSV, and XLSX over the jsDelivr CDN — no key, no rate limits, no setup.

**Sources:** ${sourceLine || 'Techstars · Y Combinator · Antler'}

[![companies](https://img.shields.io/badge/dynamic/json?url=${B}/stats.json&query=$.total&label=companies&color=blue)](${B}/all.json)
[![updated](https://img.shields.io/badge/dynamic/json?url=${B}/stats.json&query=$.generatedAt&label=updated)](STATS.md)
[![license](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**[🔎 Live explorer →](https://yigitmeteozcan.github.io/startups/)** · search and filter all ${n(stats.total)} companies in your browser.

## ℹ️ Metadata

> Last updated: **${date}**

- **${n(stats.total)}** companies across **${sources.length}** portfolio sources
- **${cProgram}** accelerator programs / cohorts
- **${cIndustry}** industry verticals
- **${cRegion}** world regions, across **${cYear}** cohort years
- 🦄 **${stats.unicorns}** unicorns · 💰 **${stats.exits}** exits · 🌱 **${stats.bCorps}** B Corps

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
| \`source\` | string | Portfolio source (\`techstars\`, \`yc\`, or \`antler\`) |
| \`name\` | string | Company name |
| \`description\` | string | Short description |
| \`website\` | string | Company website URL |
| \`logo\` | string | Logo image URL |
| \`location\` | string | \`City, State, Country\` |
| \`region\` | string | World region (e.g. Americas) |
| \`subregion\` | string | World subregion (e.g. North America) |
| \`tags\` | string[] | Industry verticals / tags |
| \`year\` | number | First session (cohort) year |
| \`program\` | string | Accelerator program name |
| \`programSlugs\` | string[] | Program slug(s) |
| \`isExit\` | boolean | Has exited |
| \`isUnicorn\` | boolean | Valued $1B+ |
| \`isBCorp\` | boolean | Certified B Corp |
| \`isCurrentSession\` | boolean | In the current session |
| \`social\` | object | \`linkedin\`, \`twitter\`, \`facebook\`, \`crunchbase\` URLs |
| \`extra\` | object | Selected raw source fields (\`city\`, \`state_province\`, \`country\`) |

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

A scheduled job pulls each source — Techstars from its public search index, Y Combinator from its public company directory, and Antler via a headless browser — merges them into one dataset, rebuilds every JSON/CSV/XLSX file, regenerates the stats and this README, and commits the result. So the data here tracks the live portfolios without any manual work.

## 🛠️ Run it yourself

\`\`\`bash
npm install
npm run install:browsers
npm run build:data        # rebuild data/ + README locally

npm start                 # REST API
#   GET /portfolio          all companies (paginated, filterable)
#   GET /portfolio.xlsx     download as Excel
#   GET /portfolio/:name    lookup by name

npm run export            # one-off Excel export
\`\`\`

## 📄 License

[MIT](LICENSE). Data is sourced from the public Techstars, Y Combinator, and Antler portfolios; please respect each provider's terms when using it. This project is not affiliated with or endorsed by Techstars, Y Combinator, or Antler.
`;
}

module.exports = { renderReadme };
