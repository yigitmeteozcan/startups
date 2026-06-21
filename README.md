# Techstars Portfolio Dataset

> The open dataset of every Techstars portfolio company — **5,000+ companies**, updated daily. No scraping, no setup, just data.

[![companies](https://img.shields.io/badge/dynamic/json?url=https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/stats.json&query=$.total&label=companies&color=blue)](data/all.json)
[![updated](https://img.shields.io/badge/dynamic/json?url=https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/stats.json&query=$.generatedAt&label=updated)](STATS.md)
[![license](https://img.shields.io/badge/license-MIT-green)](LICENSE)

The complete Techstars portfolio — clean, structured, and free.

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

**Every endpoint** — all 240+ sliced URLs (by year, program, region, industry) with counts — is catalogued in one place:

```
https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/meta.json
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

## Run it yourself

```bash
npm install

# Seed data/ locally (uses a headless browser):
npm run install:browsers
npm run build:data

# Run the REST API:
npm start
#   GET /portfolio            all companies (paginated, filterable)
#   GET /portfolio.xlsx       download as Excel
#   GET /portfolio/:name      lookup by name

# One-off Excel export:
npm run export
```

## License

[MIT](LICENSE). Data is sourced from the public Techstars portfolio page; please respect Techstars' terms when using it.
