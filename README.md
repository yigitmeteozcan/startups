# Techstars Portfolio Dataset

> The open dataset of every Techstars portfolio company — **5,000+ companies**, updated daily. No scraping, no setup, just data.

[![companies](https://img.shields.io/badge/dynamic/json?url=https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/stats.json&query=$.total&label=companies&color=blue)](data/all.json)
[![updated](https://img.shields.io/badge/dynamic/json?url=https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/stats.json&query=$.generatedAt&label=updated)](STATS.md)
[![license](https://img.shields.io/badge/license-MIT-green)](LICENSE)

There's [`yc-oss/api`](https://github.com/yc-oss/api) for Y Combinator. This is the equivalent for **Techstars** — clean, structured, free, and refreshed every day by a GitHub Action.

## Get the data

Grab it instantly over the jsDelivr CDN (or [browse `data/`](data/)):

```bash
# everything
curl https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/all.json

# just the unicorns
curl https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/unicorns.json
```

```python
import requests
companies = requests.get(
    "https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/all.json"
).json()
print(len(companies), "companies")
```

```javascript
const companies = await fetch(
  "https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/all.json"
).then((r) => r.json());
```

## What's in it

Every company looks like this:

```json
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
```

## Files

| File | Contents |
|---|---|
| [`data/all.json`](data/all.json) | Every company (also `all.csv`, `all.xlsx`) |
| [`data/unicorns.json`](data/unicorns.json) | Companies valued $1B+ |
| [`data/exits.json`](data/exits.json) | Companies that have exited |
| [`data/b-corps.json`](data/b-corps.json) | Certified B Corps |
| [`data/current.json`](data/current.json) | Current accelerator session |
| [`data/by-year/`](data/by-year) | One file per cohort year |
| [`data/by-program/`](data/by-program) | One file per accelerator program |
| [`data/by-region/`](data/by-region) | One file per world region |
| [`data/by-industry/`](data/by-industry) | One file per industry vertical |
| [`data/stats.json`](data/stats.json) | Aggregate stats |
| [`STATS.md`](STATS.md) | 📊 Techstars by the numbers |

See **[STATS.md](STATS.md)** for charts: companies per year, top cities, unicorns, exits, and more.

## How it's built

The portfolio is powered by a public **Typesense** search cluster. A [daily GitHub Action](.github/workflows/update-data.yml) queries it directly (no browser) and commits the refreshed dataset. There's also a local REST API and an Excel exporter if you'd rather run it yourself.

<details>
<summary>Run it yourself</summary>

```bash
npm install

# Seed data/ locally (uses a headless browser to grab the search key):
npm run install:browsers
npm run build:data

# ...or, if you have the Typesense search key, no browser needed:
TYPESENSE_API_KEY=xxxx npm run fetch:data

# Run the REST API:
npm start
#   GET /portfolio            all companies (paginated, filterable)
#   GET /portfolio.xlsx       download as Excel
#   GET /portfolio/:name      lookup by name

# One-off Excel export:
npm run export
```

</details>

## License

[MIT](LICENSE). Data is sourced from the public Techstars portfolio page; please respect Techstars' terms when using it.
