# Techstars Portfolio API

An Express API that scrapes [techstars.com/portfolio](https://www.techstars.com/portfolio) using a headless Playwright browser and returns structured company data.

## Setup

```bash
npm install
npm run install:browsers   # installs Chromium for Playwright
npm start
```

Server runs on `http://localhost:3000` (override with `PORT` env var).

## Endpoints

### `GET /portfolio`

Returns all portfolio companies. Results are cached for 1 hour.

**Query parameters**

| Param | Type | Description |
|-------|------|-------------|
| `refresh` | `true` | Bypass cache and re-scrape |
| `search` | string | Filter by name, description, or tag |
| `tag` | string | Filter by industry tag |
| `location` | string | Filter by location/city |
| `year` | string | Filter by cohort/founded year |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 50, max: 500) |
| `debug` | `true` | Include discovered JSON endpoints + api/dom counts in the response |

**Example response**
```json
{
  "status": "ok",
  "source": "typesense",
  "cached": false,
  "cacheExpiresAt": "2025-01-01T13:00:00.000Z",
  "pagination": { "page": 1, "limit": 50, "total": 4200, "totalPages": 84 },
  "companies": [
    {
      "name": "DigitalOcean",
      "description": "Cloud infrastructure for developers",
      "logo": "https://apimg.techstars.com/.../do-icon-logo.png",
      "website": "https://digitalocean.com/",
      "location": "New York, NY, USA",
      "region": "North America",
      "tags": ["Cloud", "DevTools"],
      "year": 2012,
      "program": "Techstars NYC",
      "isExit": false,
      "isUnicorn": true,
      "isBCorp": false,
      "extra": { "...": "raw Typesense document" }
    }
  ]
}
```

`source` indicates where the data came from:
- `typesense` — the site's underlying Typesense search API (preferred: complete + clean)
- `api` — another intercepted JSON endpoint
- `dom` — HTML scraping fallback

### `GET /portfolio/:name`

Look up a single company by partial name match.

```
GET /portfolio/airbnb
```

### `DELETE /cache`

Invalidate the portfolio cache so the next request re-scrapes.

### `GET /health`

Returns server status and cache info.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port |
| `CACHE_TTL_MS` | `3600000` | Cache TTL in milliseconds (default 1 hour) |

## How it works

The Techstars portfolio is powered by a **Typesense** search cluster. The scraper:

1. Launches headless Chromium with a realistic user-agent/viewport and loads the portfolio page (the site blocks plain HTTP requests from datacenter IPs, so a real browser load is needed).
2. Intercepts the page's Typesense search request to grab the cluster URL and the search-only API key (which the site exposes client-side).
3. Replays that search **directly** server-side, paging through all results (`per_page=250`) to collect every company with clean structured fields (`source: "typesense"`).
4. If the Typesense request can't be captured, it falls back to intercepted JSON (`source: "api"`) or, last resort, DOM scraping with auto-scroll (`source: "dom"`).
5. Results are cached in-memory for 1 hour to avoid hammering the site.

> **Note:** Run this from a residential IP. Datacenter/cloud IPs are blocked by the site's CDN (`403 host_not_allowed`).
