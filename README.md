# Techstars Portfolio API

The open API for every company in the [Techstars](https://www.techstars.com/portfolio) portfolio. The data is pulled directly from the portfolio's public search index (not scraped from HTML) and refreshed automatically every day, then served as static JSON, CSV, and XLSX over the jsDelivr CDN — no key, no rate limits, no setup.

[![companies](https://img.shields.io/badge/dynamic/json?url=https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/stats.json&query=$.total&label=companies&color=blue)](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/all.json)
[![updated](https://img.shields.io/badge/dynamic/json?url=https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/stats.json&query=$.generatedAt&label=updated)](STATS.md)
[![license](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**[🔎 Live explorer →](https://yigitmeteozcan.github.io/techstars/)** · search and filter all 5,105 companies in your browser.

## ℹ️ Metadata

> Last updated: **2026-06-21**

- **5,105** companies
- **157** accelerator programs
- **57** industry verticals
- **6** world regions, across **20** cohort years
- 🦄 **23** unicorns · 💰 **621** exits · 🌱 **29** B Corps

## 🚀 Quick start

```bash
# everything
curl https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/all.json

# just the unicorns
curl https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/unicorns.json
```

```python
import requests
companies = requests.get("https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/all.json").json()
print(len(companies), "companies")
```

```javascript
const companies = await fetch("https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/all.json").then((r) => r.json());
```

### Recipes

```python
import requests

base = "https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data"

# Fintech unicorns
unicorns = requests.get(f"{base}/unicorns.json").json()
fintech = [c for c in unicorns if "Fintech" in c["tags"]]

# Every company from a single program
boulder = requests.get(f"{base}/by-program/techstars-boulder-accelerator.json").json()

# Discover every endpoint and its count
meta = requests.get(f"{base}/meta.json").json()
print(meta["collections"]["by-industry"][:3])
```

## 💻 APIs

The base URL for every endpoint is:

```
https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/
```

### 🏢 Companies

| Description | API |
|---|---|
| All companies | [`all.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/all.json) |
| All companies (CSV) | [`all.csv`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/all.csv) |
| All companies (Excel) | [`all.xlsx`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/all.xlsx) |
| Unicorns (valued $1B+) | [`unicorns.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/unicorns.json) |
| Exited companies | [`exits.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/exits.json) |
| Certified B Corps | [`b-corps.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/b-corps.json) |
| Current accelerator session | [`current.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/current.json) |
| Aggregate stats | [`stats.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/stats.json) |
| **Catalog of every endpoint** | [`meta.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/meta.json) |

### 🎓 By year

<details>
<summary>20 cohort years — <a href="https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-year/index.json">index.json</a></summary>

| Year | Companies | API |
|---|---|---|
| 2026 | 52 | [`by-year/2026.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-year/2026.json) |
| 2025 | 221 | [`by-year/2025.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-year/2025.json) |
| 2024 | 637 | [`by-year/2024.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-year/2024.json) |
| 2023 | 767 | [`by-year/2023.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-year/2023.json) |
| 2022 | 575 | [`by-year/2022.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-year/2022.json) |
| 2021 | 459 | [`by-year/2021.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-year/2021.json) |
| 2020 | 412 | [`by-year/2020.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-year/2020.json) |
| 2019 | 404 | [`by-year/2019.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-year/2019.json) |
| 2018 | 378 | [`by-year/2018.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-year/2018.json) |
| 2017 | 291 | [`by-year/2017.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-year/2017.json) |
| 2016 | 217 | [`by-year/2016.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-year/2016.json) |
| 2015 | 194 | [`by-year/2015.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-year/2015.json) |
| 2014 | 151 | [`by-year/2014.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-year/2014.json) |
| 2013 | 128 | [`by-year/2013.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-year/2013.json) |
| 2012 | 92 | [`by-year/2012.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-year/2012.json) |
| 2011 | 57 | [`by-year/2011.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-year/2011.json) |
| 2010 | 31 | [`by-year/2010.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-year/2010.json) |
| 2009 | 19 | [`by-year/2009.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-year/2009.json) |
| 2008 | 10 | [`by-year/2008.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-year/2008.json) |
| 2007 | 10 | [`by-year/2007.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-year/2007.json) |

</details>

### 🏭 By industry

<details>
<summary>57 industry verticals — <a href="https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/index.json">index.json</a></summary>

| Industry | Companies | API |
|---|---|---|
| Artificial intelligence and machine learning | 1510 | [`by-industry/artificial-intelligence-and-machine-learning.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/artificial-intelligence-and-machine-learning.json) |
| Mobile | 1136 | [`by-industry/mobile.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/mobile.json) |
| Fintech | 1031 | [`by-industry/fintech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/fintech.json) |
| Healthtech | 440 | [`by-industry/healthtech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/healthtech.json) |
| Lifestyles of Health and Sustainability and wellness | 384 | [`by-industry/lifestyles-of-health-and-sustainability-and-wellness.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/lifestyles-of-health-and-sustainability-and-wellness.json) |
| Internet of Things | 384 | [`by-industry/internet-of-things.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/internet-of-things.json) |
| Climate tech | 360 | [`by-industry/climate-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/climate-tech.json) |
| Cleantech | 339 | [`by-industry/cleantech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/cleantech.json) |
| HRtech | 332 | [`by-industry/hrtech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/hrtech.json) |
| Technology, media and telecommunications | 311 | [`by-industry/technology-media-and-telecommunications.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/technology-media-and-telecommunications.json) |
| Infrastructure | 271 | [`by-industry/infrastructure.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/infrastructure.json) |
| Big Data | 266 | [`by-industry/big-data.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/big-data.json) |
| Cryptocurrency/Blockchain | 261 | [`by-industry/cryptocurrency-blockchain.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/cryptocurrency-blockchain.json) |
| Edtech | 234 | [`by-industry/edtech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/edtech.json) |
| SaaS | 229 | [`by-industry/saas.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/saas.json) |
| Digital health | 204 | [`by-industry/digital-health.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/digital-health.json) |
| Robotics and Drones | 195 | [`by-industry/robotics-and-drones.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/robotics-and-drones.json) |
| Marketing tech | 188 | [`by-industry/marketing-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/marketing-tech.json) |
| Gaming | 183 | [`by-industry/gaming.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/gaming.json) |
| Real estate tech | 179 | [`by-industry/real-estate-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/real-estate-tech.json) |
| Manufacturing | 178 | [`by-industry/manufacturing.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/manufacturing.json) |
| Supply chain technology | 163 | [`by-industry/supply-chain-technology.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/supply-chain-technology.json) |
| Insurtech | 159 | [`by-industry/insurtech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/insurtech.json) |
| Mobility tech | 142 | [`by-industry/mobility-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/mobility-tech.json) |
| Virtual reality | 133 | [`by-industry/virtual-reality.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/virtual-reality.json) |
| Cybersecurity | 122 | [`by-industry/cybersecurity.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/cybersecurity.json) |
| Impact investing | 114 | [`by-industry/impact-investing.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/impact-investing.json) |
| Cloudtech and DevOps | 112 | [`by-industry/cloudtech-and-devops.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/cloudtech-and-devops.json) |
| Foodtech | 105 | [`by-industry/foodtech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/foodtech.json) |
| E-commerce | 102 | [`by-industry/e-commerce.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/e-commerce.json) |
| Industrials | 101 | [`by-industry/industrials.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/industrials.json) |
| Adtech | 90 | [`by-industry/adtech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/adtech.json) |
| Mobile commerce | 80 | [`by-industry/mobile-commerce.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/mobile-commerce.json) |
| Agtech | 70 | [`by-industry/agtech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/agtech.json) |
| Femtech | 69 | [`by-industry/femtech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/femtech.json) |
| Oil and gas | 69 | [`by-industry/oil-and-gas.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/oil-and-gas.json) |
| Space tech | 68 | [`by-industry/space-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/space-tech.json) |
| Legal tech | 62 | [`by-industry/legal-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/legal-tech.json) |
| Audiotech | 40 | [`by-industry/audiotech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/audiotech.json) |
| Augmented reality | 38 | [`by-industry/augmented-reality.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/augmented-reality.json) |
| Beauty | 35 | [`by-industry/beauty.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/beauty.json) |
| 3D printing | 29 | [`by-industry/3d-printing.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/3d-printing.json) |
| eSports | 25 | [`by-industry/esports.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/esports.json) |
| Future of work | 25 | [`by-industry/future-of-work.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/future-of-work.json) |
| Oncology | 18 | [`by-industry/oncology.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/oncology.json) |
| Pet tech | 17 | [`by-industry/pet-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/pet-tech.json) |
| Micromobility | 15 | [`by-industry/micromobility.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/micromobility.json) |
| Nanotechnology | 15 | [`by-industry/nanotechnology.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/nanotechnology.json) |
| Ridesharing | 9 | [`by-industry/ridesharing.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/ridesharing.json) |
| Carsharing | 5 | [`by-industry/carsharing.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/carsharing.json) |
| B2B payments | 3 | [`by-industry/b2b-payments.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/b2b-payments.json) |
| Wearables and quantified self | 3 | [`by-industry/wearables-and-quantified-self.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/wearables-and-quantified-self.json) |
| Construction technology | 3 | [`by-industry/construction-technology.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/construction-technology.json) |
| Restaurant tech | 2 | [`by-industry/restaurant-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/restaurant-tech.json) |
| Life sciences | 2 | [`by-industry/life-sciences.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/life-sciences.json) |
| Autonomous cars | 1 | [`by-industry/autonomous-cars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/autonomous-cars.json) |
| Robotics | 1 | [`by-industry/robotics.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-industry/robotics.json) |

</details>

### 🌍 By region

<details>
<summary>6 world regions — <a href="https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-region/index.json">index.json</a></summary>

| Region | Companies | API |
|---|---|---|
| Americas | 3749 | [`by-region/americas.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-region/americas.json) |
| Europe | 894 | [`by-region/europe.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-region/europe.json) |
| Middle East | 159 | [`by-region/middle-east.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-region/middle-east.json) |
| Asia | 142 | [`by-region/asia.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-region/asia.json) |
| Africa | 88 | [`by-region/africa.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-region/africa.json) |
| Oceania | 73 | [`by-region/oceania.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-region/oceania.json) |

</details>

### 🏷️ By program

<details>
<summary>157 accelerator programs — <a href="https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/index.json">index.json</a></summary>

| Program | Companies | API |
|---|---|---|
| Techstars New York City Accelerator | 274 | [`by-program/techstars-new-york-city-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-new-york-city-accelerator.json) |
| Techstars Boston Accelerator | 239 | [`by-program/techstars-boston-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-boston-accelerator.json) |
| Techstars Boulder Accelerator | 216 | [`by-program/techstars-boulder-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-boulder-accelerator.json) |
| Techstars London Accelerator | 177 | [`by-program/techstars-london-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-london-accelerator.json) |
| Techstars Seattle Accelerator | 165 | [`by-program/techstars-seattle-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-seattle-accelerator.json) |
| Techstars Austin Accelerator | 138 | [`by-program/techstars-austin-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-austin-accelerator.json) |
| Techstars Berlin Accelerator | 129 | [`by-program/techstars-berlin-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-berlin-accelerator.json) |
| Techstars Chicago Accelerator | 116 | [`by-program/techstars-chicago-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-chicago-accelerator.json) |
| Techstars Anywhere Accelerator | 116 | [`by-program/techstars-anywhere-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-anywhere-accelerator.json) |
| Techstars Space Accelerator | 104 | [`by-program/techstars-space-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-space-accelerator.json) |
| Techstars Toronto Accelerator | 100 | [`by-program/techstars-toronto-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-toronto-accelerator.json) |
| Techstars Atlanta powered by Cox Enterprises | 86 | [`by-program/techstars-atlanta-powered-by-cox-enterprises.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-atlanta-powered-by-cox-enterprises.json) |
| Techstars Future of Food Powered by Ecolab | 84 | [`by-program/techstars-future-of-food-powered-by-ecolab.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-future-of-food-powered-by-ecolab.json) |
| Techstars Tel Aviv Accelerator | 80 | [`by-program/techstars-tel-aviv-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-tel-aviv-accelerator.json) |
| Build in Tulsa Techstars Accelerator | 79 | [`by-program/build-in-tulsa-techstars-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/build-in-tulsa-techstars-accelerator.json) |
| London Barclays Accelerator, powered by Techstars | 72 | [`by-program/london-barclays-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/london-barclays-accelerator-powered-by-techstars.json) |
| Techstars Music Accelerator | 71 | [`by-program/techstars-music-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-music-accelerator.json) |
| Sustainability Paris Techstars Accelerator | 68 | [`by-program/sustainability-paris-techstars-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/sustainability-paris-techstars-accelerator.json) |
| Techstars Sports Accelerator Powered by Indy | 67 | [`by-program/techstars-sports-accelerator-powered-by-indy.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-sports-accelerator-powered-by-indy.json) |
| Techstars Transformative World Torino | 66 | [`by-program/techstars-transformative-world-torino.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-transformative-world-torino.json) |
| Techstars Workforce Development Accelerator | 66 | [`by-program/techstars-workforce-development-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-workforce-development-accelerator.json) |
| Techstars Chicago powered by J.P. Morgan | 60 | [`by-program/techstars-chicago-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-chicago-powered-by-j-p-morgan.json) |
| Techstars Alabama EnergyTech Accelerator | 59 | [`by-program/techstars-alabama-energytech-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-alabama-energytech-accelerator.json) |
| Techstars Detroit powered by J.P. Morgan | 59 | [`by-program/techstars-detroit-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-detroit-powered-by-j-p-morgan.json) |
| Techstars Miami powered by J.P. Morgan | 58 | [`by-program/techstars-miami-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-miami-powered-by-j-p-morgan.json) |
| New York Barclays Accelerator, powered by Techstars | 57 | [`by-program/new-york-barclays-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/new-york-barclays-accelerator-powered-by-techstars.json) |
| Techstars Atlanta powered by J.P. Morgan | 56 | [`by-program/techstars-atlanta-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-atlanta-powered-by-j-p-morgan.json) |
| Comcast NBCUniversal LIFT Labs Accelerator Powered by Techstars | 55 | [`by-program/comcast-nbcuniversal-lift-labs-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/comcast-nbcuniversal-lift-labs-accelerator-powered-by-techstars.json) |
| Techstars Detroit Accelerator | 54 | [`by-program/techstars-detroit-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-detroit-accelerator.json) |
| Techstars Washington DC powered by J.P. Morgan | 53 | [`by-program/techstars-washington-dc-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-washington-dc-powered-by-j-p-morgan.json) |
| Techstars Los Angeles powered by J.P. Morgan | 49 | [`by-program/techstars-los-angeles-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-los-angeles-powered-by-j-p-morgan.json) |
| Techstars New York City powered by J.P. Morgan | 49 | [`by-program/techstars-new-york-city-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-new-york-city-powered-by-j-p-morgan.json) |
| ABN AMRO & Techstars Future of Finance Accelerator | 48 | [`by-program/abn-amro-techstars-future-of-finance-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/abn-amro-techstars-future-of-finance-accelerator.json) |
| Techstars Oakland powered by J.P. Morgan | 47 | [`by-program/techstars-oakland-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-oakland-powered-by-j-p-morgan.json) |
| Techstars Cloud | 44 | [`by-program/techstars-cloud.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-cloud.json) |
| Techstars Impact powered by Cox Enterprises | 44 | [`by-program/techstars-impact-powered-by-cox-enterprises.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-impact-powered-by-cox-enterprises.json) |
| Equinor & Techstars Energy Accelerator | 43 | [`by-program/equinor-techstars-energy-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/equinor-techstars-energy-accelerator.json) |
| Techstars Montréal AI Accelerator | 41 | [`by-program/techstars-montr-al-ai-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-montr-al-ai-accelerator.json) |
| Techstars Columbus Powered by The Ohio State University | 41 | [`by-program/techstars-columbus-powered-by-the-ohio-state-university.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-columbus-powered-by-the-ohio-state-university.json) |
| METRO Accelerator for Hospitality powered by Techstars | 41 | [`by-program/metro-accelerator-for-hospitality-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/metro-accelerator-for-hospitality-powered-by-techstars.json) |
| STANLEY+Techstars Accelerator | 39 | [`by-program/stanley-techstars-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/stanley-techstars-accelerator.json) |
| Techstars Kansas City Accelerator | 39 | [`by-program/techstars-kansas-city-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-kansas-city-accelerator.json) |
| Barclays Accelerator, Powered by Techstars - Tel Aviv | 38 | [`by-program/barclays-accelerator-powered-by-techstars-tel-aviv.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/barclays-accelerator-powered-by-techstars-tel-aviv.json) |
| Techstars Healthcare, in partnership with Cedars-Sinai | 36 | [`by-program/techstars-healthcare-in-partnership-with-cedars-sinai.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-healthcare-in-partnership-with-cedars-sinai.json) |
| Techstars Tech Central Sydney powered by NSW Government | 36 | [`by-program/techstars-tech-central-sydney-powered-by-nsw-government.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-tech-central-sydney-powered-by-nsw-government.json) |
| Techstars Paris Accelerator | 31 | [`by-program/techstars-paris-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-paris-accelerator.json) |
| Techstars Physical Health Fort Worth | 31 | [`by-program/techstars-physical-health-fort-worth.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-physical-health-fort-worth.json) |
| Techstars Iowa Accelerator | 30 | [`by-program/techstars-iowa-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-iowa-accelerator.json) |
| Air Force Accelerator Powered by Techstars | 30 | [`by-program/air-force-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/air-force-accelerator-powered-by-techstars.json) |
| Techstars Future of Longevity Accelerator | 30 | [`by-program/techstars-future-of-longevity-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-future-of-longevity-accelerator.json) |
| UnitedHealthcare Accelerator Powered by Techstars | 30 | [`by-program/unitedhealthcare-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/unitedhealthcare-accelerator-powered-by-techstars.json) |
| Techstars Sustainability in Partnership with The Nature Conservancy | 30 | [`by-program/techstars-sustainability-in-partnership-with-the-nature-conservancy.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-sustainability-in-partnership-with-the-nature-conservancy.json) |
| The Minnesota Twins Accelerator by Techstars | 30 | [`by-program/the-minnesota-twins-accelerator-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/the-minnesota-twins-accelerator-by-techstars.json) |
| Techstars Web3 Accelerator | 30 | [`by-program/techstars-web3-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-web3-accelerator.json) |
| Techstars San Diego powered by San Diego State University | 30 | [`by-program/techstars-san-diego-powered-by-san-diego-state-university.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-san-diego-powered-by-san-diego-state-university.json) |
| MetLife Digital Accelerator powered by Techstars | 29 | [`by-program/metlife-digital-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/metlife-digital-accelerator-powered-by-techstars.json) |
| Techstars & Western Union Accelerator | 29 | [`by-program/techstars-western-union-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-western-union-accelerator.json) |
| Sprint Accelerator, powered by Techstars | 29 | [`by-program/sprint-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/sprint-accelerator-powered-by-techstars.json) |
| Techstars Bangalore Accelerator | 29 | [`by-program/techstars-bangalore-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-bangalore-accelerator.json) |
| Techstars Retail Accelerator, in partnership with Target | 28 | [`by-program/techstars-retail-accelerator-in-partnership-with-target.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-retail-accelerator-in-partnership-with-target.json) |
| Techstars Starburst Space Accelerator | 28 | [`by-program/techstars-starburst-space-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-starburst-space-accelerator.json) |
| Techstars Economic Mobility Powered by Samvid Ventures | 28 | [`by-program/techstars-economic-mobility-powered-by-samvid-ventures.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-economic-mobility-powered-by-samvid-ventures.json) |
| Techstars Industries of the Future Accelerator | 28 | [`by-program/techstars-industries-of-the-future-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-industries-of-the-future-accelerator.json) |
| Alexa Accelerator, Powered by Techstars | 27 | [`by-program/alexa-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/alexa-accelerator-powered-by-techstars.json) |
| The Heritage Group Accelerator powered by Techstars | 27 | [`by-program/the-heritage-group-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/the-heritage-group-accelerator-powered-by-techstars.json) |
| Techstars Equitech Accelerator | 27 | [`by-program/techstars-equitech-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-equitech-accelerator.json) |
| Eastern Pacific Accelerator Powered by Techstars | 25 | [`by-program/eastern-pacific-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/eastern-pacific-accelerator-powered-by-techstars.json) |
| Techstars AI Health Baltimore | 25 | [`by-program/techstars-ai-health-baltimore.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-ai-health-baltimore.json) |
| Techstars Healthcare sponsored by Cedars-Sinai, Point32Health, UCI Health, and UnitedHealthcare | 24 | [`by-program/techstars-healthcare-sponsored-by-cedars-sinai-point32health-uci-health-and-unitedhealthcare.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-healthcare-sponsored-by-cedars-sinai-point32health-uci-health-and-unitedhealthcare.json) |
| ARM Labs Lagos Techstars Accelerator | 24 | [`by-program/arm-labs-lagos-techstars-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/arm-labs-lagos-techstars-accelerator.json) |
| Techstars Tokyo Accelerator | 24 | [`by-program/techstars-tokyo-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-tokyo-accelerator.json) |
| Techstars Payments Powered by Stellar and MoneyGram | 23 | [`by-program/techstars-payments-powered-by-stellar-and-moneygram.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-payments-powered-by-stellar-and-moneygram.json) |
| Techstars IoT Accelerator | 22 | [`by-program/techstars-iot-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-iot-accelerator.json) |
| The Riyadh Techstars Accelerator | 22 | [`by-program/the-riyadh-techstars-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/the-riyadh-techstars-accelerator.json) |
| Stockholm Techstars Accelerator | 22 | [`by-program/stockholm-techstars-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/stockholm-techstars-accelerator.json) |
| Kaplan EdTech Accelerator, powered by Techstars | 21 | [`by-program/kaplan-edtech-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/kaplan-edtech-accelerator-powered-by-techstars.json) |
| Barclays Accelerator, Powered by Techstars - Cape Town | 21 | [`by-program/barclays-accelerator-powered-by-techstars-cape-town.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/barclays-accelerator-powered-by-techstars-cape-town.json) |
| Techstars San Francisco | 21 | [`by-program/techstars-san-francisco.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-san-francisco.json) |
| Techstars New Orleans Powered by J.P. Morgan | 21 | [`by-program/techstars-new-orleans-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-new-orleans-powered-by-j-p-morgan.json) |
| R/GA Accelerator, powered by Techstars | 20 | [`by-program/r-ga-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/r-ga-accelerator-powered-by-techstars.json) |
| Techstars Lisbon in Partnership with Semapa Next | 20 | [`by-program/techstars-lisbon-in-partnership-with-semapa-next.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-lisbon-in-partnership-with-semapa-next.json) |
| The Roux Institute Techstars Accelerator | 20 | [`by-program/the-roux-institute-techstars-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/the-roux-institute-techstars-accelerator.json) |
| Techstars Hub71 Accelerator | 20 | [`by-program/techstars-hub71-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-hub71-accelerator.json) |
| SAP.iO Foundry, Powered by Techstars Accelerator | 20 | [`by-program/sap-io-foundry-powered-by-techstars-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/sap-io-foundry-powered-by-techstars-accelerator.json) |
| Techstars SportsTech Melbourne Accelerator | 20 | [`by-program/techstars-sportstech-melbourne-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-sportstech-melbourne-accelerator.json) |
| The Arcadis City of 2030 Accelerator Powered by Techstars | 20 | [`by-program/the-arcadis-city-of-2030-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/the-arcadis-city-of-2030-accelerator-powered-by-techstars.json) |
| BSH Future Home Accelerator Powered by Techstars | 20 | [`by-program/bsh-future-home-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/bsh-future-home-accelerator-powered-by-techstars.json) |
| Colliers Proptech Accelerator Powered by Techstars | 19 | [`by-program/colliers-proptech-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/colliers-proptech-accelerator-powered-by-techstars.json) |
| Microsoft Accelerator for Windows Azure, powered by Techstars | 19 | [`by-program/microsoft-accelerator-for-windows-azure-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/microsoft-accelerator-for-windows-azure-powered-by-techstars.json) |
| Techstars Dubai Accelerator in Partnership with GINCO | 19 | [`by-program/techstars-dubai-accelerator-in-partnership-with-ginco.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-dubai-accelerator-in-partnership-with-ginco.json) |
| Techstars Impact Accelerator | 19 | [`by-program/techstars-impact-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-impact-accelerator.json) |
| Disney Accelerator, powered by Techstars | 18 | [`by-program/disney-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/disney-accelerator-powered-by-techstars.json) |
| METRO Retail Accelerator powered by Techstars | 18 | [`by-program/metro-retail-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/metro-retail-accelerator-powered-by-techstars.json) |
| USC and Techstars Accelerator | 13 | [`by-program/usc-and-techstars-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/usc-and-techstars-accelerator.json) |
| Techstars London Powered by Polygon | 12 | [`by-program/techstars-london-powered-by-polygon.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-london-powered-by-polygon.json) |
| Techstars Crypto Boston Powered by Algorand | 12 | [`by-program/techstars-crypto-boston-powered-by-algorand.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-crypto-boston-powered-by-algorand.json) |
| Filecoin Techstars Accelerator | 11 | [`by-program/filecoin-techstars-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/filecoin-techstars-accelerator.json) |
| Techstars Future of Ecommerce powered by eBay | 11 | [`by-program/techstars-future-of-ecommerce-powered-by-ebay.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-future-of-ecommerce-powered-by-ebay.json) |
| Techstars and Audi Mobility Accelerator | 11 | [`by-program/techstars-and-audi-mobility-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-and-audi-mobility-accelerator.json) |
| Rakuten Accelerator, Powered by Techstars | 10 | [`by-program/rakuten-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/rakuten-accelerator-powered-by-techstars.json) |
| Techstars Allied Space Accelerator | 10 | [`by-program/techstars-allied-space-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-allied-space-accelerator.json) |
| Alchemist Blockchain Techstars Accelerator | 10 | [`by-program/alchemist-blockchain-techstars-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/alchemist-blockchain-techstars-accelerator.json) |
| Microsoft Accelerator for Kinect, powered by Techstars | 10 | [`by-program/microsoft-accelerator-for-kinect-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/microsoft-accelerator-for-kinect-powered-by-techstars.json) |
| Techstars Adelaide | 10 | [`by-program/techstars-adelaide.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-adelaide.json) |
| Northwestern Medicine & Techstars Healthcare Accelerator | 10 | [`by-program/northwestern-medicine-techstars-healthcare-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/northwestern-medicine-techstars-healthcare-accelerator.json) |
| Techstars Healthcare Accelerator powered by Permanente Medicine Mid-Atlantic States | 10 | [`by-program/techstars-healthcare-accelerator-powered-by-permanente-medicine-mid-atlantic-states.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-healthcare-accelerator-powered-by-permanente-medicine-mid-atlantic-states.json) |
| Qualcomm Robotics Accelerator, powered by Techstars | 9 | [`by-program/qualcomm-robotics-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/qualcomm-robotics-accelerator-powered-by-techstars.json) |
| Techstars Connection | 9 | [`by-program/techstars-connection.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-connection.json) |
| Virgin Media Accelerator powered by Techstars | 9 | [`by-program/virgin-media-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/virgin-media-accelerator-powered-by-techstars.json) |
| Launchpool Web3 Techstars Accelerator | 9 | [`by-program/launchpool-web3-techstars-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/launchpool-web3-techstars-accelerator.json) |
| Nike+ Accelerator, powered by Techstars | 8 | [`by-program/nike-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/nike-accelerator-powered-by-techstars.json) |
| Techstars Chicago | 7 | [`by-program/techstars-chicago.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-chicago.json) |
| Techstars WaterTech & Sustainability | 7 | [`by-program/techstars-watertech-sustainability.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-watertech-sustainability.json) |
| Techstars Korea Accelerator | 6 | [`by-program/techstars-korea-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-korea-accelerator.json) |
| Founder Catalyst WaterTech & Sustainability, Techstars WaterTech & Sustainability | 5 | [`by-program/founder-catalyst-watertech-sustainability-techstars-watertech-sustainability.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/founder-catalyst-watertech-sustainability-techstars-watertech-sustainability.json) |
| Founder Catalyst in partnership with J.P. Morgan, Techstars Atlanta powered by Cox Enterprises | 4 | [`by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-atlanta-powered-by-cox-enterprises.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-atlanta-powered-by-cox-enterprises.json) |
| USC and Techstars Accelerator, USC and Techstars University Catalyst | 4 | [`by-program/usc-and-techstars-accelerator-usc-and-techstars-university-catalyst.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/usc-and-techstars-accelerator-usc-and-techstars-university-catalyst.json) |
| Founder Catalyst in partnership with J.P. Morgan, Techstars Impact powered by Cox Enterprises | 4 | [`by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-impact-powered-by-cox-enterprises.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-impact-powered-by-cox-enterprises.json) |
| Disney Accelerator, powered by Techstars, Techstars Boulder Accelerator | 3 | [`by-program/disney-accelerator-powered-by-techstars-techstars-boulder-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/disney-accelerator-powered-by-techstars-techstars-boulder-accelerator.json) |
| Founder Catalyst sponsored by Stanley Black & Decker, Techstars New York City Accelerator | 3 | [`by-program/founder-catalyst-sponsored-by-stanley-black-decker-techstars-new-york-city-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/founder-catalyst-sponsored-by-stanley-black-decker-techstars-new-york-city-accelerator.json) |
| Founder Catalyst in partnership with J.P. Morgan, Techstars Equitech Accelerator | 3 | [`by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-equitech-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-equitech-accelerator.json) |
| Founder Catalyst in partnership with J.P. Morgan, Techstars Workforce Development Accelerator | 2 | [`by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-workforce-development-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-workforce-development-accelerator.json) |
| Anjal Z Techstars Founder Catalyst, Techstars Atlanta powered by J.P. Morgan | 2 | [`by-program/anjal-z-techstars-founder-catalyst-techstars-atlanta-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/anjal-z-techstars-founder-catalyst-techstars-atlanta-powered-by-j-p-morgan.json) |
| Alexa Next Stage, Powered by Techstars, Techstars Seattle Accelerator | 1 | [`by-program/alexa-next-stage-powered-by-techstars-techstars-seattle-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/alexa-next-stage-powered-by-techstars-techstars-seattle-accelerator.json) |
| Alexa Next Stage, Powered by Techstars, Techstars London Accelerator | 1 | [`by-program/alexa-next-stage-powered-by-techstars-techstars-london-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/alexa-next-stage-powered-by-techstars-techstars-london-accelerator.json) |
| Founder Catalyst in partnership with J.P. Morgan, Techstars Economic Mobility Powered by Samvid Ventures | 1 | [`by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-economic-mobility-powered-by-samvid-ventures.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-economic-mobility-powered-by-samvid-ventures.json) |
| Founder Catalyst in partnership with J.P. Morgan, Techstars Industries of the Future Accelerator | 1 | [`by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-industries-of-the-future-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-industries-of-the-future-accelerator.json) |
| Founder Catalyst sponsored by Stanley Black & Decker, Techstars Space Accelerator | 1 | [`by-program/founder-catalyst-sponsored-by-stanley-black-decker-techstars-space-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/founder-catalyst-sponsored-by-stanley-black-decker-techstars-space-accelerator.json) |
| Techstars Chicago, Techstars Founder Catalyst Global Program | 1 | [`by-program/techstars-chicago-techstars-founder-catalyst-global-program.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-chicago-techstars-founder-catalyst-global-program.json) |
| Founder Catalyst sponsored by Stanley Black & Decker, Northwestern Medicine & Techstars Healthcare Accelerator | 1 | [`by-program/founder-catalyst-sponsored-by-stanley-black-decker-northwestern-medicine-techstars-healthcare-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/founder-catalyst-sponsored-by-stanley-black-decker-northwestern-medicine-techstars-healthcare-accelerator.json) |
| Founder Catalyst in partnership with J.P. Morgan, Techstars Anywhere Accelerator | 1 | [`by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-anywhere-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-anywhere-accelerator.json) |
| Founder Catalyst in partnership with J.P. Morgan, Techstars Alabama EnergyTech Accelerator | 1 | [`by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-alabama-energytech-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-alabama-energytech-accelerator.json) |
| Founder Innovation Lab Pre-accelerator, Techstars and Audi Mobility Accelerator | 1 | [`by-program/founder-innovation-lab-pre-accelerator-techstars-and-audi-mobility-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/founder-innovation-lab-pre-accelerator-techstars-and-audi-mobility-accelerator.json) |
| Founder Catalyst in partnership with J.P. Morgan, Techstars Oakland powered by J.P. Morgan | 1 | [`by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-oakland-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-oakland-powered-by-j-p-morgan.json) |
| Founder Catalyst in partnership with J.P. Morgan, Techstars Miami powered by J.P. Morgan | 1 | [`by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-miami-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-miami-powered-by-j-p-morgan.json) |
| Founder Catalyst Jeddah, Techstars San Francisco | 1 | [`by-program/founder-catalyst-jeddah-techstars-san-francisco.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/founder-catalyst-jeddah-techstars-san-francisco.json) |
| MIH for startups powered by Techstars, Techstars Industries of the Future Accelerator | 1 | [`by-program/mih-for-startups-powered-by-techstars-techstars-industries-of-the-future-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/mih-for-startups-powered-by-techstars-techstars-industries-of-the-future-accelerator.json) |
| Founder Catalyst sponsored by Stanley Black & Decker, Techstars Economic Mobility Powered by Samvid Ventures | 1 | [`by-program/founder-catalyst-sponsored-by-stanley-black-decker-techstars-economic-mobility-powered-by-samvid-ventures.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/founder-catalyst-sponsored-by-stanley-black-decker-techstars-economic-mobility-powered-by-samvid-ventures.json) |
| Founder Catalyst WaterTech & Sustainability, Techstars Columbus Powered by The Ohio State University | 1 | [`by-program/founder-catalyst-watertech-sustainability-techstars-columbus-powered-by-the-ohio-state-university.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/founder-catalyst-watertech-sustainability-techstars-columbus-powered-by-the-ohio-state-university.json) |
| MIH for startups powered by Techstars, Techstars Starburst Space Accelerator | 1 | [`by-program/mih-for-startups-powered-by-techstars-techstars-starburst-space-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/mih-for-startups-powered-by-techstars-techstars-starburst-space-accelerator.json) |
| Founder Catalyst in partnership with J.P. Morgan, Techstars Detroit powered by J.P. Morgan | 1 | [`by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-detroit-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-detroit-powered-by-j-p-morgan.json) |
| Founder Catalyst Jeddah, Techstars London Accelerator | 1 | [`by-program/founder-catalyst-jeddah-techstars-london-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/founder-catalyst-jeddah-techstars-london-accelerator.json) |
| Founder Catalyst WaterTech & Sustainability, Sustainability Paris Techstars Accelerator | 1 | [`by-program/founder-catalyst-watertech-sustainability-sustainability-paris-techstars-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/founder-catalyst-watertech-sustainability-sustainability-paris-techstars-accelerator.json) |
| STANLEY+Techstars Accelerator, Techstars Boston Accelerator | 1 | [`by-program/stanley-techstars-accelerator-techstars-boston-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/stanley-techstars-accelerator-techstars-boston-accelerator.json) |
| Techstars Founder Catalyst powered by WeXchange, Techstars Washington DC powered by J.P. Morgan | 1 | [`by-program/techstars-founder-catalyst-powered-by-wexchange-techstars-washington-dc-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-founder-catalyst-powered-by-wexchange-techstars-washington-dc-powered-by-j-p-morgan.json) |
| Founder Catalyst sponsored by Stanley Black & Decker, Techstars Equitech Accelerator | 1 | [`by-program/founder-catalyst-sponsored-by-stanley-black-decker-techstars-equitech-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/founder-catalyst-sponsored-by-stanley-black-decker-techstars-equitech-accelerator.json) |
| Founder Catalyst in partnership with J.P. Morgan, Techstars Seattle Accelerator | 1 | [`by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-seattle-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-seattle-accelerator.json) |
| Build in Tulsa Techstars Accelerator, Founder Catalyst in partnership with J.P. Morgan | 1 | [`by-program/build-in-tulsa-techstars-accelerator-founder-catalyst-in-partnership-with-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/build-in-tulsa-techstars-accelerator-founder-catalyst-in-partnership-with-j-p-morgan.json) |
| New York Barclays Accelerator, powered by Techstars, Nike+ Accelerator, powered by Techstars | 1 | [`by-program/new-york-barclays-accelerator-powered-by-techstars-nike-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/new-york-barclays-accelerator-powered-by-techstars-nike-accelerator-powered-by-techstars.json) |
| Founder Catalyst sponsored by Stanley Black & Decker, Techstars Washington DC powered by J.P. Morgan | 1 | [`by-program/founder-catalyst-sponsored-by-stanley-black-decker-techstars-washington-dc-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/founder-catalyst-sponsored-by-stanley-black-decker-techstars-washington-dc-powered-by-j-p-morgan.json) |
| Founder Innovation Lab Pre-accelerator, Sustainability Paris Techstars Accelerator | 1 | [`by-program/founder-innovation-lab-pre-accelerator-sustainability-paris-techstars-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/founder-innovation-lab-pre-accelerator-sustainability-paris-techstars-accelerator.json) |
| Techstars Founder Catalyst powered by WeXchange, Techstars Miami powered by J.P. Morgan | 1 | [`by-program/techstars-founder-catalyst-powered-by-wexchange-techstars-miami-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-founder-catalyst-powered-by-wexchange-techstars-miami-powered-by-j-p-morgan.json) |
| Founder Catalyst in partnership with J.P. Morgan, Techstars Atlanta powered by J.P. Morgan | 1 | [`by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-atlanta-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-atlanta-powered-by-j-p-morgan.json) |
| Sprint Accelerator, powered by Techstars, Techstars Healthcare, in partnership with Cedars-Sinai | 1 | [`by-program/sprint-accelerator-powered-by-techstars-techstars-healthcare-in-partnership-with-cedars-sinai.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/sprint-accelerator-powered-by-techstars-techstars-healthcare-in-partnership-with-cedars-sinai.json) |
| Techstars Boulder Accelerator, Techstars Retail Accelerator, in partnership with Target | 1 | [`by-program/techstars-boulder-accelerator-techstars-retail-accelerator-in-partnership-with-target.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-boulder-accelerator-techstars-retail-accelerator-in-partnership-with-target.json) |
| Techstars New York City Accelerator, Techstars Retail Accelerator, in partnership with Target | 1 | [`by-program/techstars-new-york-city-accelerator-techstars-retail-accelerator-in-partnership-with-target.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/techstars-new-york-city-accelerator-techstars-retail-accelerator-in-partnership-with-target.json) |
| Founder Catalyst in partnership with J.P. Morgan, Techstars Boulder Accelerator | 1 | [`by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-boulder-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-boulder-accelerator.json) |

</details>

> Tip: pull [`meta.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/techstars@main/data/meta.json) once to discover every available URL and count programmatically.

## 📀 Schema

Each company is an object with the following fields:

| Field | Type | Description |
|---|---|---|
| `name` | string | Company name |
| `description` | string | Short description |
| `website` | string | Company website URL |
| `logo` | string | Logo image URL |
| `location` | string | `City, State, Country` |
| `region` | string | World region (e.g. Americas) |
| `subregion` | string | World subregion (e.g. North America) |
| `tags` | string[] | Industry verticals / tags |
| `year` | number | First session (cohort) year |
| `program` | string | Accelerator program name |
| `programSlugs` | string[] | Program slug(s) |
| `isExit` | boolean | Has exited |
| `isUnicorn` | boolean | Valued $1B+ |
| `isBCorp` | boolean | Certified B Corp |
| `isCurrentSession` | boolean | In the current session |
| `social` | object | `linkedin`, `twitter`, `facebook`, `crunchbase` URLs |
| `extra` | object | Raw source record (all original fields) |

### Example

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

## 📊 Stats

See **[STATS.md](STATS.md)** for charts — companies per year, top countries and cities, top programs, leading industries, and more. You can also [browse the raw files](data/) directly in the repo.

## 🔄 How it stays fresh

The Techstars portfolio is powered by a public search index. A scheduled job queries it directly, rebuilds every JSON/CSV/XLSX file, regenerates the stats and this README, and commits the result — so the data here tracks the live portfolio without any manual work.

## 🛠️ Run it yourself

```bash
npm install
npm run install:browsers
npm run build:data        # rebuild data/ + README locally

npm start                 # REST API
#   GET /portfolio          all companies (paginated, filterable)
#   GET /portfolio.xlsx     download as Excel
#   GET /portfolio/:name    lookup by name

npm run export            # one-off Excel export
```

## 📄 License

[MIT](LICENSE). Data is sourced from the public Techstars portfolio; please respect Techstars' terms when using it. This project is not affiliated with or endorsed by Techstars.
