# Startup Portfolios API

The open API for every company across multiple startup portfolios — [Techstars](https://www.techstars.com/portfolio), [Y Combinator](https://www.ycombinator.com/companies), [Antler](https://www.antler.co/portfolio), [500 Global](https://500.co/portfolio), [Entrepreneur First](https://www.joinef.com/portfolio/), [Alchemist](https://www.alchemistaccelerator.com/portfolio), and [Plug and Play](https://www.plugandplaytechcenter.com/innovation-services/startups/our-startups). Every record carries a `source` field, so you can query one combined dataset or filter to a single program. The data is refreshed automatically every day and served as static JSON, CSV, and XLSX over the jsDelivr CDN — no key, no rate limits, no setup.

**Sources:** [yc](https://www.ycombinator.com/companies) (5,964) · [plugandplay](https://www.plugandplaytechcenter.com/innovation-services/startups/our-startups) (5,507) · [techstars](https://www.techstars.com/portfolio) (5,105) · [500](https://500.co/portfolio) (2,241) · [antler](https://www.antler.co/portfolio) (1,237) · [alchemist](https://www.alchemistaccelerator.com/portfolio) (519) · [ef](https://www.joinef.com/portfolio/) (498)

[![companies](https://img.shields.io/badge/dynamic/json?url=https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/stats.json&query=$.total&label=companies&color=blue)](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/all.json)
[![updated](https://img.shields.io/badge/dynamic/json?url=https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/stats.json&query=$.generatedAt&label=updated)](STATS.md)
[![license](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**[🔎 Live explorer →](https://yigitmeteozcan.github.io/startups/)** · search and filter all 21,071 companies in your browser.

## ℹ️ Metadata

> Last updated: **2026-06-23**

- **21,071** companies across **7** portfolio sources
- **339** accelerator programs / cohorts
- **473** industry verticals
- **97** world regions, across **23** cohort years
- 🦄 **146** unicorns · 💰 **2691** exits · 🌱 **29** B Corps

## 🚀 Quick start

```bash
# everything
curl https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/all.json

# just the unicorns
curl https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/unicorns.json
```

```python
import requests
companies = requests.get("https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/all.json").json()
print(len(companies), "companies")
```

```javascript
const companies = await fetch("https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/all.json").then((r) => r.json());
```

### Recipes

```python
import requests

base = "https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data"

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
https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/
```

### 🏢 Companies

| Description | API |
|---|---|
| All companies | [`all.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/all.json) |
| All companies (CSV) | [`all.csv`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/all.csv) |
| All companies (Excel) | [`all.xlsx`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/all.xlsx) |
| Unicorns (valued $1B+) | [`unicorns.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/unicorns.json) |
| Exited companies | [`exits.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/exits.json) |
| Certified B Corps | [`b-corps.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/b-corps.json) |
| Current accelerator session | [`current.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/current.json) |
| Aggregate stats | [`stats.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/stats.json) |
| **Catalog of every endpoint** | [`meta.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/meta.json) |

### 🏛️ By source

<details open>
<summary>7 portfolio sources — <a href="https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-source/index.json">index.json</a></summary>

| Source | Companies | API |
|---|---|---|
| yc | 5964 | [`by-source/yc.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-source/yc.json) |
| plugandplay | 5507 | [`by-source/plugandplay.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-source/plugandplay.json) |
| techstars | 5105 | [`by-source/techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-source/techstars.json) |
| 500 | 2241 | [`by-source/500.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-source/500.json) |
| antler | 1237 | [`by-source/antler.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-source/antler.json) |
| alchemist | 519 | [`by-source/alchemist.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-source/alchemist.json) |
| ef | 498 | [`by-source/ef.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-source/ef.json) |

</details>

### 🎓 By year

<details>
<summary>23 cohort years — <a href="https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-year/index.json">index.json</a></summary>

| Year | Companies | API |
|---|---|---|
| 2027 | 1 | [`by-year/2027.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-year/2027.json) |
| 2026 | 518 | [`by-year/2026.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-year/2026.json) |
| 2025 | 1050 | [`by-year/2025.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-year/2025.json) |
| 2024 | 1448 | [`by-year/2024.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-year/2024.json) |
| 2023 | 1493 | [`by-year/2023.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-year/2023.json) |
| 2022 | 1457 | [`by-year/2022.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-year/2022.json) |
| 2021 | 1384 | [`by-year/2021.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-year/2021.json) |
| 2020 | 1053 | [`by-year/2020.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-year/2020.json) |
| 2019 | 1033 | [`by-year/2019.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-year/2019.json) |
| 2018 | 866 | [`by-year/2018.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-year/2018.json) |
| 2017 | 816 | [`by-year/2017.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-year/2017.json) |
| 2016 | 724 | [`by-year/2016.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-year/2016.json) |
| 2015 | 685 | [`by-year/2015.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-year/2015.json) |
| 2014 | 470 | [`by-year/2014.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-year/2014.json) |
| 2013 | 341 | [`by-year/2013.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-year/2013.json) |
| 2012 | 361 | [`by-year/2012.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-year/2012.json) |
| 2011 | 253 | [`by-year/2011.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-year/2011.json) |
| 2010 | 149 | [`by-year/2010.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-year/2010.json) |
| 2009 | 63 | [`by-year/2009.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-year/2009.json) |
| 2008 | 53 | [`by-year/2008.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-year/2008.json) |
| 2007 | 42 | [`by-year/2007.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-year/2007.json) |
| 2006 | 18 | [`by-year/2006.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-year/2006.json) |
| 2005 | 9 | [`by-year/2005.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-year/2005.json) |

</details>

### 🏭 By industry

<details>
<summary>473 industry verticals — <a href="https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/index.json">index.json</a></summary>

| Industry | Companies | API |
|---|---|---|
| Fintech | 2456 | [`by-industry/fintech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/fintech.json) |
| Artificial intelligence and machine learning | 1510 | [`by-industry/artificial-intelligence-and-machine-learning.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/artificial-intelligence-and-machine-learning.json) |
| SaaS | 1402 | [`by-industry/saas.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/saas.json) |
| Mobile | 1141 | [`by-industry/mobile.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/mobile.json) |
| Consumer | 1045 | [`by-industry/consumer.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/consumer.json) |
| Artificial Intelligence | 879 | [`by-industry/artificial-intelligence.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/artificial-intelligence.json) |
| Healthcare | 796 | [`by-industry/healthcare.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/healthcare.json) |
| AI | 786 | [`by-industry/ai.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/ai.json) |
| Developer Tools | 680 | [`by-industry/developer-tools.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/developer-tools.json) |
| Health | 673 | [`by-industry/health.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/health.json) |
| Infrastructure | 654 | [`by-industry/infrastructure.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/infrastructure.json) |
| Engineering, Product and Design | 604 | [`by-industry/engineering-product-and-design.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/engineering-product-and-design.json) |
| Industrials | 565 | [`by-industry/industrials.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/industrials.json) |
| B2B Software | 544 | [`by-industry/b2b-software.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/b2b-software.json) |
| Insurtech | 505 | [`by-industry/insurtech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/insurtech.json) |
| Healthtech | 440 | [`by-industry/healthtech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/healthtech.json) |
| Deeptech | 436 | [`by-industry/deeptech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/deeptech.json) |
| Mobility & Physical AI | 427 | [`by-industry/mobility-physical-ai.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/mobility-physical-ai.json) |
| Energy | 422 | [`by-industry/energy.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/energy.json) |
| Brand & Retail | 422 | [`by-industry/brand-retail.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/brand-retail.json) |
| Lifestyles of Health and Sustainability and wellness | 384 | [`by-industry/lifestyles-of-health-and-sustainability-and-wellness.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/lifestyles-of-health-and-sustainability-and-wellness.json) |
| Internet of Things | 384 | [`by-industry/internet-of-things.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/internet-of-things.json) |
| Productivity | 381 | [`by-industry/productivity.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/productivity.json) |
| Supply Chain | 374 | [`by-industry/supply-chain.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/supply-chain.json) |
| Climate tech | 360 | [`by-industry/climate-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/climate-tech.json) |
| Marketplace | 345 | [`by-industry/marketplace.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/marketplace.json) |
| FinTech | 343 | [`by-industry/fintech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/fintech.json) |
| Cleantech | 339 | [`by-industry/cleantech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/cleantech.json) |
| HRtech | 332 | [`by-industry/hrtech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/hrtech.json) |
| Gaming | 329 | [`by-industry/gaming.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/gaming.json) |
| Technology, media and telecommunications | 311 | [`by-industry/technology-media-and-telecommunications.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/technology-media-and-telecommunications.json) |
| Big Data | 299 | [`by-industry/big-data.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/big-data.json) |
| Media & Advertising | 295 | [`by-industry/media-advertising.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/media-advertising.json) |
| E-commerce | 291 | [`by-industry/e-commerce.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/e-commerce.json) |
| Education | 278 | [`by-industry/education.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/education.json) |
| Content | 272 | [`by-industry/content.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/content.json) |
| Manufacturing | 266 | [`by-industry/manufacturing.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/manufacturing.json) |
| Cryptocurrency/Blockchain | 261 | [`by-industry/cryptocurrency-blockchain.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/cryptocurrency-blockchain.json) |
| Sustainability | 260 | [`by-industry/sustainability.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/sustainability.json) |
| Payments | 258 | [`by-industry/payments.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/payments.json) |
| Edtech | 253 | [`by-industry/edtech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/edtech.json) |
| Analytics | 246 | [`by-industry/analytics.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/analytics.json) |
| Generative AI | 246 | [`by-industry/generative-ai.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/generative-ai.json) |
| Food & Beverage | 244 | [`by-industry/food-beverage.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/food-beverage.json) |
| Health Tech | 231 | [`by-industry/health-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/health-tech.json) |
| Machine Learning | 227 | [`by-industry/machine-learning.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/machine-learning.json) |
| ConsumerTech | 223 | [`by-industry/consumertech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/consumertech.json) |
| Marketing | 218 | [`by-industry/marketing.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/marketing.json) |
| Digital health | 204 | [`by-industry/digital-health.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/digital-health.json) |
| Cybersecurity | 198 | [`by-industry/cybersecurity.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/cybersecurity.json) |
| Enterprise & AI | 198 | [`by-industry/enterprise-ai.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/enterprise-ai.json) |
| Robotics and Drones | 195 | [`by-industry/robotics-and-drones.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/robotics-and-drones.json) |
| Sales | 189 | [`by-industry/sales.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/sales.json) |
| Marketing tech | 188 | [`by-industry/marketing-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/marketing-tech.json) |
| Real estate tech | 179 | [`by-industry/real-estate-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/real-estate-tech.json) |
| Real Estate | 179 | [`by-industry/real-estate.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/real-estate.json) |
| HR Tech | 179 | [`by-industry/hr-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/hr-tech.json) |
| Retail | 170 | [`by-industry/retail.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/retail.json) |
| Operations | 169 | [`by-industry/operations.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/operations.json) |
| Supply chain technology | 163 | [`by-industry/supply-chain-technology.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/supply-chain-technology.json) |
| Open Source | 161 | [`by-industry/open-source.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/open-source.json) |
| Real Estate and Construction | 158 | [`by-industry/real-estate-and-construction.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/real-estate-and-construction.json) |
| Social | 157 | [`by-industry/social.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/social.json) |
| Climate | 154 | [`by-industry/climate.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/climate.json) |
| Logistics | 154 | [`by-industry/logistics.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/logistics.json) |
| AI Assistant | 153 | [`by-industry/ai-assistant.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/ai-assistant.json) |
| Healthcare IT | 150 | [`by-industry/healthcare-it.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/healthcare-it.json) |
| Security | 144 | [`by-industry/security.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/security.json) |
| Mobility tech | 142 | [`by-industry/mobility-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/mobility-tech.json) |
| API | 141 | [`by-industry/api.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/api.json) |
| Smart Cities | 139 | [`by-industry/smart-cities.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/smart-cities.json) |
| Biotech | 136 | [`by-industry/biotech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/biotech.json) |
| Hardware | 135 | [`by-industry/hardware.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/hardware.json) |
| Finance and Accounting | 134 | [`by-industry/finance-and-accounting.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/finance-and-accounting.json) |
| Supply Chain and Logistics | 134 | [`by-industry/supply-chain-and-logistics.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/supply-chain-and-logistics.json) |
| Virtual reality | 133 | [`by-industry/virtual-reality.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/virtual-reality.json) |
| Travel & Hospitality | 133 | [`by-industry/travel-hospitality.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/travel-hospitality.json) |
| AI/Machine Learning | 131 | [`by-industry/ai-machine-learning.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/ai-machine-learning.json) |
| Agtech | 125 | [`by-industry/agtech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/agtech.json) |
| Home and Personal | 123 | [`by-industry/home-and-personal.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/home-and-personal.json) |
| Enterprise | 121 | [`by-industry/enterprise.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/enterprise.json) |
| Health and BioTech | 121 | [`by-industry/health-and-biotech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/health-and-biotech.json) |
| Impact investing | 114 | [`by-industry/impact-investing.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/impact-investing.json) |
| Consumer Health and Wellness | 114 | [`by-industry/consumer-health-and-wellness.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/consumer-health-and-wellness.json) |
| Robotics | 113 | [`by-industry/robotics.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/robotics.json) |
| Cloudtech and DevOps | 112 | [`by-industry/cloudtech-and-devops.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/cloudtech-and-devops.json) |
| Enterprise Software | 111 | [`by-industry/enterprise-software.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/enterprise-software.json) |
| Digital Health | 111 | [`by-industry/digital-health.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/digital-health.json) |
| Data & Analytics | 111 | [`by-industry/data-analytics.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/data-analytics.json) |
| Global Overseas Acceleration & Learning (GOAL) | 110 | [`by-industry/global-overseas-acceleration-learning-goal.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/global-overseas-acceleration-learning-goal.json) |
| New Materials & Packaging | 110 | [`by-industry/new-materials-packaging.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/new-materials-packaging.json) |
| Manufacturing and Robotics | 108 | [`by-industry/manufacturing-and-robotics.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/manufacturing-and-robotics.json) |
| Consumer Health Services | 106 | [`by-industry/consumer-health-services.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/consumer-health-services.json) |
| Foodtech | 105 | [`by-industry/foodtech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/foodtech.json) |
| Consumer Finance | 105 | [`by-industry/consumer-finance.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/consumer-finance.json) |
| Medtech | 105 | [`by-industry/medtech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/medtech.json) |
| Data Engineering | 99 | [`by-industry/data-engineering.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/data-engineering.json) |
| Insurance | 96 | [`by-industry/insurance.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/insurance.json) |
| B2A | 94 | [`by-industry/b2a.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/b2a.json) |
| Food and Beverage | 93 | [`by-industry/food-and-beverage.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/food-and-beverage.json) |
| Construction | 92 | [`by-industry/construction.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/construction.json) |
| Adtech | 90 | [`by-industry/adtech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/adtech.json) |
| Hard Tech | 90 | [`by-industry/hard-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/hard-tech.json) |
| Social Media | 90 | [`by-industry/social-media.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/social-media.json) |
| Legal | 90 | [`by-industry/legal.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/legal.json) |
| Human Resources | 89 | [`by-industry/human-resources.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/human-resources.json) |
| Fashion | 89 | [`by-industry/fashion.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/fashion.json) |
| Crypto / Web3 | 89 | [`by-industry/crypto-web3.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/crypto-web3.json) |
| Video | 87 | [`by-industry/video.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/video.json) |
| Finance | 86 | [`by-industry/finance.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/finance.json) |
| Housing and Real Estate | 84 | [`by-industry/housing-and-real-estate.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/housing-and-real-estate.json) |
| Proptech | 83 | [`by-industry/proptech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/proptech.json) |
| Social Impact | 83 | [`by-industry/social-impact.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/social-impact.json) |
| Automation | 82 | [`by-industry/automation.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/automation.json) |
| Therapeutics | 81 | [`by-industry/therapeutics.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/therapeutics.json) |
| Mobile commerce | 80 | [`by-industry/mobile-commerce.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/mobile-commerce.json) |
| Recruiting and Talent | 75 | [`by-industry/recruiting-and-talent.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/recruiting-and-talent.json) |
| Computer Vision | 75 | [`by-industry/computer-vision.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/computer-vision.json) |
| Femtech | 74 | [`by-industry/femtech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/femtech.json) |
| Credit and Lending | 74 | [`by-industry/credit-and-lending.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/credit-and-lending.json) |
| Medical Devices | 74 | [`by-industry/medical-devices.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/medical-devices.json) |
| Healthcare Services | 73 | [`by-industry/healthcare-services.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/healthcare-services.json) |
| Energy and ClimateTech | 73 | [`by-industry/energy-and-climatetech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/energy-and-climatetech.json) |
| Workflow Automation | 71 | [`by-industry/workflow-automation.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/workflow-automation.json) |
| Banking and Exchange | 70 | [`by-industry/banking-and-exchange.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/banking-and-exchange.json) |
| Oil and gas | 69 | [`by-industry/oil-and-gas.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/oil-and-gas.json) |
| Ecommerce | 69 | [`by-industry/ecommerce.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/ecommerce.json) |
| Space tech | 68 | [`by-industry/space-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/space-tech.json) |
| Compliance | 68 | [`by-industry/compliance.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/compliance.json) |
| Diagnostics | 66 | [`by-industry/diagnostics.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/diagnostics.json) |
| Recruiting | 65 | [`by-industry/recruiting.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/recruiting.json) |
| Automotive | 63 | [`by-industry/automotive.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/automotive.json) |
| Legal tech | 62 | [`by-industry/legal-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/legal-tech.json) |
| Aviation and Space | 60 | [`by-industry/aviation-and-space.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/aviation-and-space.json) |
| Beauty | 58 | [`by-industry/beauty.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/beauty.json) |
| Design Tools | 58 | [`by-industry/design-tools.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/design-tools.json) |
| Community | 58 | [`by-industry/community.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/community.json) |
| Investing | 57 | [`by-industry/investing.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/investing.json) |
| Drug Discovery and Delivery | 56 | [`by-industry/drug-discovery-and-delivery.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/drug-discovery-and-delivery.json) |
| Real Estate and PropTech | 56 | [`by-industry/real-estate-and-proptech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/real-estate-and-proptech.json) |
| Delivery | 54 | [`by-industry/delivery.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/delivery.json) |
| Asset Management | 54 | [`by-industry/asset-management.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/asset-management.json) |
| Government | 54 | [`by-industry/government.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/government.json) |
| LegalTech | 53 | [`by-industry/legaltech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/legaltech.json) |
| AIOps | 53 | [`by-industry/aiops.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/aiops.json) |
| Travel & Tourism | 53 | [`by-industry/travel-tourism.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/travel-tourism.json) |
| DevOps | 52 | [`by-industry/devops.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/devops.json) |
| Crypto & Digital Assets | 52 | [`by-industry/crypto-digital-assets.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/crypto-digital-assets.json) |
| IoT | 51 | [`by-industry/iot.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/iot.json) |
| Mobility | 51 | [`by-industry/mobility.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/mobility.json) |
| Entertainment / Media | 51 | [`by-industry/entertainment-media.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/entertainment-media.json) |
| Apparel and Cosmetics | 50 | [`by-industry/apparel-and-cosmetics.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/apparel-and-cosmetics.json) |
| eLearning | 50 | [`by-industry/elearning.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/elearning.json) |
| Travel | 49 | [`by-industry/travel.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/travel.json) |
| Entertainment | 49 | [`by-industry/entertainment.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/entertainment.json) |
| Food Tech | 48 | [`by-industry/food-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/food-tech.json) |
| GovTech | 48 | [`by-industry/govtech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/govtech.json) |
| Neobank | 48 | [`by-industry/neobank.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/neobank.json) |
| Cloud Computing | 46 | [`by-industry/cloud-computing.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/cloud-computing.json) |
| Collaboration | 45 | [`by-industry/collaboration.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/collaboration.json) |
| Advertising | 45 | [`by-industry/advertising.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/advertising.json) |
| AI-Enhanced Learning | 45 | [`by-industry/ai-enhanced-learning.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/ai-enhanced-learning.json) |
| Creator Economy | 45 | [`by-industry/creator-economy.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/creator-economy.json) |
| Food | 44 | [`by-industry/food.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/food.json) |
| Conversational AI | 44 | [`by-industry/conversational-ai.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/conversational-ai.json) |
| Credit & Lending | 44 | [`by-industry/credit-lending.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/credit-lending.json) |
| Real Estate & Construction | 44 | [`by-industry/real-estate-construction.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/real-estate-construction.json) |
| Agriculture | 43 | [`by-industry/agriculture.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/agriculture.json) |
| Consumer Electronics | 43 | [`by-industry/consumer-electronics.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/consumer-electronics.json) |
| Health & Wellness | 43 | [`by-industry/health-wellness.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/health-wellness.json) |
| Messaging | 42 | [`by-industry/messaging.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/messaging.json) |
| Media | 41 | [`by-industry/media.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/media.json) |
| Audiotech | 40 | [`by-industry/audiotech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/audiotech.json) |
| E-Commerce | 40 | [`by-industry/e-commerce.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/e-commerce.json) |
| Deep Learning | 39 | [`by-industry/deep-learning.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/deep-learning.json) |
| InsurTech | 39 | [`by-industry/insurtech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/insurtech.json) |
| Augmented reality | 38 | [`by-industry/augmented-reality.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/augmented-reality.json) |
| Oncology | 38 | [`by-industry/oncology.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/oncology.json) |
| Subscriptions | 38 | [`by-industry/subscriptions.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/subscriptions.json) |
| Sales Enablement | 38 | [`by-industry/sales-enablement.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/sales-enablement.json) |
| Advanced Manufacturing | 38 | [`by-industry/advanced-manufacturing.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/advanced-manufacturing.json) |
| Mental Health Tech | 37 | [`by-industry/mental-health-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/mental-health-tech.json) |
| Wellness | 37 | [`by-industry/wellness.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/wellness.json) |
| Telecommunications | 36 | [`by-industry/telecommunications.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/telecommunications.json) |
| Transportation | 36 | [`by-industry/transportation.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/transportation.json) |
| Drones | 36 | [`by-industry/drones.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/drones.json) |
| No-code | 35 | [`by-industry/no-code.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/no-code.json) |
| Travel, Leisure and Tourism | 35 | [`by-industry/travel-leisure-and-tourism.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/travel-leisure-and-tourism.json) |
| Aerospace | 35 | [`by-industry/aerospace.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/aerospace.json) |
| AI-powered Drug Discovery | 34 | [`by-industry/ai-powered-drug-discovery.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/ai-powered-drug-discovery.json) |
| DevSecOps | 33 | [`by-industry/devsecops.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/devsecops.json) |
| Documents | 33 | [`by-industry/documents.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/documents.json) |
| Industrial Bio | 32 | [`by-industry/industrial-bio.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/industrial-bio.json) |
| Drug discovery | 32 | [`by-industry/drug-discovery.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/drug-discovery.json) |
| Grocery | 31 | [`by-industry/grocery.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/grocery.json) |
| Robotic Process Automation | 31 | [`by-industry/robotic-process-automation.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/robotic-process-automation.json) |
| Data Visualization | 30 | [`by-industry/data-visualization.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/data-visualization.json) |
| Data Science | 30 | [`by-industry/data-science.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/data-science.json) |
| FinOps | 30 | [`by-industry/finops.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/finops.json) |
| Synthetic Biology | 30 | [`by-industry/synthetic-biology.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/synthetic-biology.json) |
| ClimateTech | 30 | [`by-industry/climatetech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/climatetech.json) |
| Aerospace & Defense | 30 | [`by-industry/aerospace-defense.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/aerospace-defense.json) |
| 3D printing | 29 | [`by-industry/3d-printing.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/3d-printing.json) |
| Design | 29 | [`by-industry/design.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/design.json) |
| Telemedicine | 29 | [`by-industry/telemedicine.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/telemedicine.json) |
| Reinforcement Learning | 28 | [`by-industry/reinforcement-learning.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/reinforcement-learning.json) |
| Customer Support | 28 | [`by-industry/customer-support.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/customer-support.json) |
| AgTech | 28 | [`by-industry/agtech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/agtech.json) |
| eSports | 27 | [`by-industry/esports.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/esports.json) |
| Health Insurance | 27 | [`by-industry/health-insurance.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/health-insurance.json) |
| Defense | 27 | [`by-industry/defense.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/defense.json) |
| Transportation Services | 27 | [`by-industry/transportation-services.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/transportation-services.json) |
| Email | 27 | [`by-industry/email.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/email.json) |
| CRM | 27 | [`by-industry/crm.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/crm.json) |
| Telehealth | 27 | [`by-industry/telehealth.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/telehealth.json) |
| Genomics | 27 | [`by-industry/genomics.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/genomics.json) |
| Banking as a Service | 26 | [`by-industry/banking-as-a-service.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/banking-as-a-service.json) |
| Crypto | 26 | [`by-industry/crypto.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/crypto.json) |
| Sportstech | 26 | [`by-industry/sportstech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/sportstech.json) |
| Nanotechnology | 25 | [`by-industry/nanotechnology.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/nanotechnology.json) |
| Future of work | 25 | [`by-industry/future-of-work.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/future-of-work.json) |
| Nonprofit | 25 | [`by-industry/nonprofit.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/nonprofit.json) |
| Housing | 25 | [`by-industry/housing.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/housing.json) |
| Databases | 24 | [`by-industry/databases.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/databases.json) |
| Office Management | 24 | [`by-industry/office-management.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/office-management.json) |
| Electric Vehicles | 24 | [`by-industry/electric-vehicles.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/electric-vehicles.json) |
| Customer Success | 24 | [`by-industry/customer-success.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/customer-success.json) |
| Augmented Reality | 23 | [`by-industry/augmented-reality.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/augmented-reality.json) |
| Industrial | 23 | [`by-industry/industrial.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/industrial.json) |
| Customer Service | 22 | [`by-industry/customer-service.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/customer-service.json) |
| Social Network | 22 | [`by-industry/social-network.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/social-network.json) |
| Web Development | 22 | [`by-industry/web-development.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/web-development.json) |
| B2B Marketplaces | 22 | [`by-industry/b2b-marketplaces.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/b2b-marketplaces.json) |
| Animal Health | 22 | [`by-industry/animal-health.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/animal-health.json) |
| NLP | 21 | [`by-industry/nlp.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/nlp.json) |
| Blockchain | 21 | [`by-industry/blockchain.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/blockchain.json) |
| Virtual and Augmented Reality | 20 | [`by-industry/virtual-and-augmented-reality.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/virtual-and-augmented-reality.json) |
| Music | 20 | [`by-industry/music.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/music.json) |
| Privacy | 19 | [`by-industry/privacy.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/privacy.json) |
| Fitness | 19 | [`by-industry/fitness.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/fitness.json) |
| Job and Career Services | 19 | [`by-industry/job-and-career-services.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/job-and-career-services.json) |
| Solar Power | 19 | [`by-industry/solar-power.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/solar-power.json) |
| Satellites | 19 | [`by-industry/satellites.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/satellites.json) |
| Regtech | 19 | [`by-industry/regtech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/regtech.json) |
| Semiconductors | 19 | [`by-industry/semiconductors.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/semiconductors.json) |
| Climate Tech | 19 | [`by-industry/climate-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/climate-tech.json) |
| Lending | 18 | [`by-industry/lending.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/lending.json) |
| Retail Tech | 18 | [`by-industry/retail-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/retail-tech.json) |
| ML | 18 | [`by-industry/ml.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/ml.json) |
| Sports Tech | 18 | [`by-industry/sports-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/sports-tech.json) |
| Search | 18 | [`by-industry/search.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/search.json) |
| Pet tech | 17 | [`by-industry/pet-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/pet-tech.json) |
| SMB | 17 | [`by-industry/smb.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/smb.json) |
| Renewable Energy | 17 | [`by-industry/renewable-energy.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/renewable-energy.json) |
| Payroll | 16 | [`by-industry/payroll.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/payroll.json) |
| Remote Work | 16 | [`by-industry/remote-work.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/remote-work.json) |
| Space Exploration | 16 | [`by-industry/space-exploration.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/space-exploration.json) |
| PropTech | 16 | [`by-industry/proptech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/proptech.json) |
| Web 3 | 16 | [`by-industry/web-3.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/web-3.json) |
| Micromobility | 15 | [`by-industry/micromobility.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/micromobility.json) |
| Women's Health | 15 | [`by-industry/women-s-health.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/women-s-health.json) |
| Market Research | 15 | [`by-industry/market-research.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/market-research.json) |
| Team Collaboration | 15 | [`by-industry/team-collaboration.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/team-collaboration.json) |
| Neurotechnology | 15 | [`by-industry/neurotechnology.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/neurotechnology.json) |
| Biotechnology | 15 | [`by-industry/biotechnology.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/biotechnology.json) |
| Identity | 15 | [`by-industry/identity.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/identity.json) |
| Data Labeling | 15 | [`by-industry/data-labeling.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/data-labeling.json) |
| BioTech & Life Sciences | 15 | [`by-industry/biotech-life-sciences.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/biotech-life-sciences.json) |
| Restaurant Tech | 14 | [`by-industry/restaurant-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/restaurant-tech.json) |
| Monitoring | 14 | [`by-industry/monitoring.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/monitoring.json) |
| Energy Storage | 14 | [`by-industry/energy-storage.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/energy-storage.json) |
| Kubernetes | 14 | [`by-industry/kubernetes.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/kubernetes.json) |
| Gene Therapy | 14 | [`by-industry/gene-therapy.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/gene-therapy.json) |
| App | 14 | [`by-industry/app.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/app.json) |
| Aviation | 14 | [`by-industry/aviation.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/aviation.json) |
| AdTech | 14 | [`by-industry/adtech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/adtech.json) |
| 3D Printing | 13 | [`by-industry/3d-printing.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/3d-printing.json) |
| Virtual Reality | 13 | [`by-industry/virtual-reality.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/virtual-reality.json) |
| Carbon Capture and Removal | 13 | [`by-industry/carbon-capture-and-removal.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/carbon-capture-and-removal.json) |
| Warehouse Management Tech | 13 | [`by-industry/warehouse-management-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/warehouse-management-tech.json) |
| Subscription | 13 | [`by-industry/subscription.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/subscription.json) |
| Crowdfunding | 12 | [`by-industry/crowdfunding.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/crowdfunding.json) |
| Scheduling | 12 | [`by-industry/scheduling.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/scheduling.json) |
| Procurement | 12 | [`by-industry/procurement.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/procurement.json) |
| Trading | 12 | [`by-industry/trading.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/trading.json) |
| Home Services | 12 | [`by-industry/home-services.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/home-services.json) |
| DeFi | 12 | [`by-industry/defi.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/defi.json) |
| Maritime | 12 | [`by-industry/maritime.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/maritime.json) |
| Impact | 12 | [`by-industry/impact.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/impact.json) |
| Work | 12 | [`by-industry/work.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/work.json) |
| Ridesharing | 11 | [`by-industry/ridesharing.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/ridesharing.json) |
| Autonomous Trucking | 11 | [`by-industry/autonomous-trucking.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/autonomous-trucking.json) |
| Consumer Products | 11 | [`by-industry/consumer-products.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/consumer-products.json) |
| Cryptocurrency | 11 | [`by-industry/cryptocurrency.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/cryptocurrency.json) |
| Airplanes | 11 | [`by-industry/airplanes.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/airplanes.json) |
| Ghost Kitchens | 11 | [`by-industry/ghost-kitchens.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/ghost-kitchens.json) |
| SME Solution | 11 | [`by-industry/sme-solution.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/sme-solution.json) |
| Food Service Robots & Machines | 10 | [`by-industry/food-service-robots-machines.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/food-service-robots-machines.json) |
| Personalization | 10 | [`by-industry/personalization.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/personalization.json) |
| Chatbot | 10 | [`by-industry/chatbot.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/chatbot.json) |
| CloudTech | 10 | [`by-industry/cloudtech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/cloudtech.json) |
| Pet Tech | 10 | [`by-industry/pet-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/pet-tech.json) |
| Kids | 9 | [`by-industry/kids.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/kids.json) |
| Electronics | 9 | [`by-industry/electronics.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/electronics.json) |
| APIs | 9 | [`by-industry/apis.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/apis.json) |
| Fraud Detection | 9 | [`by-industry/fraud-detection.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/fraud-detection.json) |
| Sleep Tech | 9 | [`by-industry/sleep-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/sleep-tech.json) |
| Mental Health | 9 | [`by-industry/mental-health.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/mental-health.json) |
| Emerging Markets | 9 | [`by-industry/emerging-markets.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/emerging-markets.json) |
| Sustainable Fashion | 9 | [`by-industry/sustainable-fashion.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/sustainable-fashion.json) |
| Commerce | 9 | [`by-industry/commerce.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/commerce.json) |
| Artificial Intelligence / Machine Learning | 9 | [`by-industry/artificial-intelligence-machine-learning.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/artificial-intelligence-machine-learning.json) |
| Accounting | 9 | [`by-industry/accounting.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/accounting.json) |
| Deep Tech | 9 | [`by-industry/deep-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/deep-tech.json) |
| Autonomous Delivery | 8 | [`by-industry/autonomous-delivery.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/autonomous-delivery.json) |
| Primary Care | 8 | [`by-industry/primary-care.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/primary-care.json) |
| Civic Tech | 8 | [`by-industry/civic-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/civic-tech.json) |
| Metaverse | 8 | [`by-industry/metaverse.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/metaverse.json) |
| Fertility Tech | 8 | [`by-industry/fertility-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/fertility-tech.json) |
| Call Center | 8 | [`by-industry/call-center.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/call-center.json) |
| CPG (Consumer packaged goods) | 8 | [`by-industry/cpg-consumer-packaged-goods.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/cpg-consumer-packaged-goods.json) |
| Creative Industry | 8 | [`by-industry/creative-industry.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/creative-industry.json) |
| Augmented Reality / Virtual Reality | 8 | [`by-industry/augmented-reality-virtual-reality.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/augmented-reality-virtual-reality.json) |
| Fund | 8 | [`by-industry/fund.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/fund.json) |
| Calendar | 7 | [`by-industry/calendar.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/calendar.json) |
| SMS | 7 | [`by-industry/sms.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/sms.json) |
| Biometrics | 7 | [`by-industry/biometrics.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/biometrics.json) |
| Smart Home Assistants | 7 | [`by-industry/smart-home-assistants.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/smart-home-assistants.json) |
| Cannabis | 7 | [`by-industry/cannabis.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/cannabis.json) |
| Podcasts | 7 | [`by-industry/podcasts.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/podcasts.json) |
| Anti-Aging | 7 | [`by-industry/anti-aging.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/anti-aging.json) |
| Investments | 7 | [`by-industry/investments.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/investments.json) |
| Direct to Consumer | 7 | [`by-industry/direct-to-consumer.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/direct-to-consumer.json) |
| Agnostic (all) | 7 | [`by-industry/agnostic-all.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/agnostic-all.json) |
| CleanTech | 7 | [`by-industry/cleantech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/cleantech.json) |
| Dating | 6 | [`by-industry/dating.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/dating.json) |
| Chat | 6 | [`by-industry/chat.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/chat.json) |
| Talent Acquisition | 6 | [`by-industry/talent-acquisition.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/talent-acquisition.json) |
| Immigration | 6 | [`by-industry/immigration.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/immigration.json) |
| Feedback | 6 | [`by-industry/feedback.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/feedback.json) |
| Furniture | 6 | [`by-industry/furniture.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/furniture.json) |
| International | 6 | [`by-industry/international.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/international.json) |
| Cellular Agriculture | 6 | [`by-industry/cellular-agriculture.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/cellular-agriculture.json) |
| AR | 6 | [`by-industry/ar.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/ar.json) |
| Live | 6 | [`by-industry/live.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/live.json) |
| Assistive Tech | 6 | [`by-industry/assistive-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/assistive-tech.json) |
| Remittances | 6 | [`by-industry/remittances.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/remittances.json) |
| Crowdsourcing | 6 | [`by-industry/crowdsourcing.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/crowdsourcing.json) |
| Speech Recognition | 6 | [`by-industry/speech-recognition.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/speech-recognition.json) |
| Drug Delivery | 6 | [`by-industry/drug-delivery.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/drug-delivery.json) |
| Mining | 6 | [`by-industry/mining.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/mining.json) |
| Commercial Space Launch | 6 | [`by-industry/commercial-space-launch.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/commercial-space-launch.json) |
| Sports | 6 | [`by-industry/sports.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/sports.json) |
| FemTech (women's health) | 6 | [`by-industry/femtech-women-s-health.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/femtech-women-s-health.json) |
| Hospitality | 6 | [`by-industry/hospitality.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/hospitality.json) |
| AI Center of Excellence | 6 | [`by-industry/ai-center-of-excellence.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/ai-center-of-excellence.json) |
| Carsharing | 5 | [`by-industry/carsharing.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/carsharing.json) |
| Cloud Workload Protection | 5 | [`by-industry/cloud-workload-protection.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/cloud-workload-protection.json) |
| Next-gen Network Security | 5 | [`by-industry/next-gen-network-security.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/next-gen-network-security.json) |
| Cashierless Checkout | 5 | [`by-industry/cashierless-checkout.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/cashierless-checkout.json) |
| Note-taking | 5 | [`by-industry/note-taking.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/note-taking.json) |
| Self-Driving Vehicles | 5 | [`by-industry/self-driving-vehicles.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/self-driving-vehicles.json) |
| Advanced Materials | 5 | [`by-industry/advanced-materials.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/advanced-materials.json) |
| Nanomedicine | 5 | [`by-industry/nanomedicine.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/nanomedicine.json) |
| Air Taxis | 5 | [`by-industry/air-taxis.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/air-taxis.json) |
| Fraud Prevention | 5 | [`by-industry/fraud-prevention.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/fraud-prevention.json) |
| Smart Clothing | 5 | [`by-industry/smart-clothing.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/smart-clothing.json) |
| Auto Commerce | 5 | [`by-industry/auto-commerce.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/auto-commerce.json) |
| Nanosensors | 5 | [`by-industry/nanosensors.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/nanosensors.json) |
| Microfluidics | 5 | [`by-industry/microfluidics.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/microfluidics.json) |
| Cell Therapy | 5 | [`by-industry/cell-therapy.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/cell-therapy.json) |
| Dental | 5 | [`by-industry/dental.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/dental.json) |
| Medical Robotics | 5 | [`by-industry/medical-robotics.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/medical-robotics.json) |
| Geographic Information System | 5 | [`by-industry/geographic-information-system.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/geographic-information-system.json) |
| Billing | 5 | [`by-industry/billing.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/billing.json) |
| Leisure & Entretainment | 5 | [`by-industry/leisure-entretainment.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/leisure-entretainment.json) |
| No Code | 5 | [`by-industry/no-code.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/no-code.json) |
| Lifetech | 5 | [`by-industry/lifetech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/lifetech.json) |
| SEO | 4 | [`by-industry/seo.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/seo.json) |
| Recommendation System | 4 | [`by-industry/recommendation-system.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/recommendation-system.json) |
| Airlines | 4 | [`by-industry/airlines.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/airlines.json) |
| Stocks | 4 | [`by-industry/stocks.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/stocks.json) |
| Apparel | 4 | [`by-industry/apparel.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/apparel.json) |
| Ticketing | 4 | [`by-industry/ticketing.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/ticketing.json) |
| Networks | 4 | [`by-industry/networks.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/networks.json) |
| Genetic Engineering | 4 | [`by-industry/genetic-engineering.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/genetic-engineering.json) |
| Quantum Computing | 4 | [`by-industry/quantum-computing.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/quantum-computing.json) |
| Navigation | 4 | [`by-industry/navigation.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/navigation.json) |
| Home Automation | 4 | [`by-industry/home-automation.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/home-automation.json) |
| Industrial Workplace Safety | 4 | [`by-industry/industrial-workplace-safety.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/industrial-workplace-safety.json) |
| Careers | 4 | [`by-industry/careers.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/careers.json) |
| COVID-19 | 4 | [`by-industry/covid-19.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/covid-19.json) |
| Income Share Agreements | 4 | [`by-industry/income-share-agreements.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/income-share-agreements.json) |
| NFT | 4 | [`by-industry/nft.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/nft.json) |
| CRISPR | 4 | [`by-industry/crispr.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/crispr.json) |
| Edge Computing Semiconductors | 4 | [`by-industry/edge-computing-semiconductors.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/edge-computing-semiconductors.json) |
| Architecture | 4 | [`by-industry/architecture.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/architecture.json) |
| Hydrogen Energy | 4 | [`by-industry/hydrogen-energy.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/hydrogen-energy.json) |
| Talent Management | 4 | [`by-industry/talent-management.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/talent-management.json) |
| Utilities (energy, water, waste) | 4 | [`by-industry/utilities-energy-water-waste.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/utilities-energy-water-waste.json) |
| Gambling | 4 | [`by-industry/gambling.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/gambling.json) |
| B2B payments | 3 | [`by-industry/b2b-payments.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/b2b-payments.json) |
| Wearables and quantified self | 3 | [`by-industry/wearables-and-quantified-self.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/wearables-and-quantified-self.json) |
| Construction technology | 3 | [`by-industry/construction-technology.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/construction-technology.json) |
| Fundraising | 3 | [`by-industry/fundraising.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/fundraising.json) |
| GraphQL | 3 | [`by-industry/graphql.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/graphql.json) |
| Location-based | 3 | [`by-industry/location-based.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/location-based.json) |
| Reviews | 3 | [`by-industry/reviews.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/reviews.json) |
| Sustainable Tourism | 3 | [`by-industry/sustainable-tourism.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/sustainable-tourism.json) |
| Booking | 3 | [`by-industry/booking.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/booking.json) |
| Time Series | 3 | [`by-industry/time-series.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/time-series.json) |
| Fusion Energy | 3 | [`by-industry/fusion-energy.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/fusion-energy.json) |
| Bioplastic | 3 | [`by-industry/bioplastic.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/bioplastic.json) |
| Sustainable Agriculture | 3 | [`by-industry/sustainable-agriculture.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/sustainable-agriculture.json) |
| Chatbots | 3 | [`by-industry/chatbots.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/chatbots.json) |
| Unmanned Vehicle | 3 | [`by-industry/unmanned-vehicle.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/unmanned-vehicle.json) |
| Rocketry | 3 | [`by-industry/rocketry.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/rocketry.json) |
| Diversity & Inclusion | 3 | [`by-industry/diversity-inclusion.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/diversity-inclusion.json) |
| Cryptography | 3 | [`by-industry/cryptography.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/cryptography.json) |
| Microinsurance | 3 | [`by-industry/microinsurance.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/microinsurance.json) |
| Pediatrics | 3 | [`by-industry/pediatrics.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/pediatrics.json) |
| Robotic Surgery | 3 | [`by-industry/robotic-surgery.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/robotic-surgery.json) |
| Culture | 3 | [`by-industry/culture.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/culture.json) |
| Weather | 3 | [`by-industry/weather.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/weather.json) |
| Cultured Meat | 3 | [`by-industry/cultured-meat.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/cultured-meat.json) |
| Banking & Exchange | 3 | [`by-industry/banking-exchange.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/banking-exchange.json) |
| AudioTech | 3 | [`by-industry/audiotech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/audiotech.json) |
| Gig Economy | 3 | [`by-industry/gig-economy.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/gig-economy.json) |
| Restaurant tech | 2 | [`by-industry/restaurant-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/restaurant-tech.json) |
| Life sciences | 2 | [`by-industry/life-sciences.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/life-sciences.json) |
| Coding Bootcamps | 2 | [`by-industry/coding-bootcamps.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/coding-bootcamps.json) |
| Referrals | 2 | [`by-industry/referrals.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/referrals.json) |
| Customization | 2 | [`by-industry/customization.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/customization.json) |
| Indoor Mapping | 2 | [`by-industry/indoor-mapping.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/indoor-mapping.json) |
| Notifications | 2 | [`by-industry/notifications.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/notifications.json) |
| Small Modular Reactors | 2 | [`by-industry/small-modular-reactors.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/small-modular-reactors.json) |
| Conversational Banking | 2 | [`by-industry/conversational-banking.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/conversational-banking.json) |
| Cloud Gaming | 2 | [`by-industry/cloud-gaming.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/cloud-gaming.json) |
| Vertical Farming | 2 | [`by-industry/vertical-farming.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/vertical-farming.json) |
| VR Health | 2 | [`by-industry/vr-health.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/vr-health.json) |
| Alternative Battery Tech | 2 | [`by-industry/alternative-battery-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/alternative-battery-tech.json) |
| Radar | 2 | [`by-industry/radar.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/radar.json) |
| Plant-based Meat | 2 | [`by-industry/plant-based-meat.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/plant-based-meat.json) |
| Cultivated Meat | 2 | [`by-industry/cultivated-meat.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/cultivated-meat.json) |
| Election Tech | 2 | [`by-industry/election-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/election-tech.json) |
| IoT Security | 2 | [`by-industry/iot-security.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/iot-security.json) |
| Digital Freight Brokerage | 2 | [`by-industry/digital-freight-brokerage.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/digital-freight-brokerage.json) |
| DAO | 2 | [`by-industry/dao.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/dao.json) |
| Trust & Safety | 2 | [`by-industry/trust-safety.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/trust-safety.json) |
| Network Effects | 2 | [`by-industry/network-effects.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/network-effects.json) |
| Female Founders | 2 | [`by-industry/female-founders.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/female-founders.json) |
| Autonomous cars | 1 | [`by-industry/autonomous-cars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/autonomous-cars.json) |
| Smart Locks | 1 | [`by-industry/smart-locks.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/smart-locks.json) |
| Cyber Insurance | 1 | [`by-industry/cyber-insurance.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/cyber-insurance.json) |
| 3D Printed Foods | 1 | [`by-industry/3d-printed-foods.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/3d-printed-foods.json) |
| Lab-on-a-chip | 1 | [`by-industry/lab-on-a-chip.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/lab-on-a-chip.json) |
| Computational Storage | 1 | [`by-industry/computational-storage.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/computational-storage.json) |
| Alternative Fuels | 1 | [`by-industry/alternative-fuels.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/alternative-fuels.json) |
| Batteryless IoT Sensors | 1 | [`by-industry/batteryless-iot-sensors.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/batteryless-iot-sensors.json) |
| Security Orchestration, Automation and Response (SOAR) | 1 | [`by-industry/security-orchestration-automation-and-response-soar.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/security-orchestration-automation-and-response-soar.json) |
| Psychedelics | 1 | [`by-industry/psychedelics.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/psychedelics.json) |
| Gardening | 1 | [`by-industry/gardening.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/gardening.json) |
| Art Trading Platforms | 1 | [`by-industry/art-trading-platforms.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/art-trading-platforms.json) |
| Skincare | 1 | [`by-industry/skincare.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/skincare.json) |
| Clean Meat | 1 | [`by-industry/clean-meat.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/clean-meat.json) |
| Deepfake Detection | 1 | [`by-industry/deepfake-detection.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/deepfake-detection.json) |
| Swarm Robotics | 1 | [`by-industry/swarm-robotics.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/swarm-robotics.json) |
| Lidar | 1 | [`by-industry/lidar.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/lidar.json) |
| Livestock Health | 1 | [`by-industry/livestock-health.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/livestock-health.json) |
| Debt | 1 | [`by-industry/debt.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/debt.json) |
| CivicTech | 1 | [`by-industry/civictech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/civictech.json) |
| VR/AR | 1 | [`by-industry/vr-ar.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/vr-ar.json) |
| Space Tech | 1 | [`by-industry/space-tech.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-industry/space-tech.json) |

</details>

### 🌍 By region

<details>
<summary>97 world regions — <a href="https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/index.json">index.json</a></summary>

| Region | Companies | API |
|---|---|---|
| Americas | 5479 | [`by-region/americas.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/americas.json) |
| United States of America | 4431 | [`by-region/united-states-of-america.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/united-states-of-america.json) |
| Asia | 3180 | [`by-region/asia.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/asia.json) |
| Europe | 1014 | [`by-region/europe.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/europe.json) |
| North America | 903 | [`by-region/north-america.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/north-america.json) |
| EMEA | 726 | [`by-region/emea.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/emea.json) |
| Middle East & Africa | 285 | [`by-region/middle-east-africa.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/middle-east-africa.json) |
| South Asia | 265 | [`by-region/south-asia.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/south-asia.json) |
| United Kingdom | 210 | [`by-region/united-kingdom.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/united-kingdom.json) |
| India | 201 | [`by-region/india.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/india.json) |
| Canada | 194 | [`by-region/canada.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/canada.json) |
| Unspecified | 185 | [`by-region/unspecified.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/unspecified.json) |
| Latin America | 165 | [`by-region/latin-america.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/latin-america.json) |
| Middle East | 159 | [`by-region/middle-east.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/middle-east.json) |
| Remote | 114 | [`by-region/remote.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/remote.json) |
| North Asia | 110 | [`by-region/north-asia.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/north-asia.json) |
| Africa | 107 | [`by-region/africa.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/africa.json) |
| Southeast Asia | 95 | [`by-region/southeast-asia.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/southeast-asia.json) |
| Mexico | 80 | [`by-region/mexico.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/mexico.json) |
| Oceania | 73 | [`by-region/oceania.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/oceania.json) |
| Brazil | 67 | [`by-region/brazil.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/brazil.json) |
| France | 53 | [`by-region/france.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/france.json) |
| Nigeria | 51 | [`by-region/nigeria.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/nigeria.json) |
| Singapore | 49 | [`by-region/singapore.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/singapore.json) |
| Germany | 46 | [`by-region/germany.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/germany.json) |
| Indonesia | 30 | [`by-region/indonesia.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/indonesia.json) |
| Colombia | 29 | [`by-region/colombia.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/colombia.json) |
| Israel | 28 | [`by-region/israel.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/israel.json) |
| Argentina | 17 | [`by-region/argentina.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/argentina.json) |
| Spain | 16 | [`by-region/spain.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/spain.json) |
| Chile | 16 | [`by-region/chile.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/chile.json) |
| Denmark | 13 | [`by-region/denmark.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/denmark.json) |
| Australia & NZ | 13 | [`by-region/australia-nz.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/australia-nz.json) |
| Netherlands | 11 | [`by-region/netherlands.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/netherlands.json) |
| Egypt | 11 | [`by-region/egypt.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/egypt.json) |
| Australia | 11 | [`by-region/australia.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/australia.json) |
| Sweden | 10 | [`by-region/sweden.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/sweden.json) |
| United Arab Emirates | 10 | [`by-region/united-arab-emirates.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/united-arab-emirates.json) |
| Pakistan | 10 | [`by-region/pakistan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/pakistan.json) |
| Kenya | 9 | [`by-region/kenya.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/kenya.json) |
| Switzerland | 9 | [`by-region/switzerland.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/switzerland.json) |
| Ireland | 8 | [`by-region/ireland.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/ireland.json) |
| Philippines | 8 | [`by-region/philippines.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/philippines.json) |
| China | 7 | [`by-region/china.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/china.json) |
| Peru | 7 | [`by-region/peru.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/peru.json) |
| Hong Kong | 6 | [`by-region/hong-kong.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/hong-kong.json) |
| Malaysia | 6 | [`by-region/malaysia.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/malaysia.json) |
| Vietnam | 6 | [`by-region/vietnam.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/vietnam.json) |
| Poland | 5 | [`by-region/poland.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/poland.json) |
| South Korea | 5 | [`by-region/south-korea.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/south-korea.json) |
| Panama | 5 | [`by-region/panama.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/panama.json) |
| Austria | 4 | [`by-region/austria.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/austria.json) |
| Slovenia | 4 | [`by-region/slovenia.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/slovenia.json) |
| Ghana | 4 | [`by-region/ghana.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/ghana.json) |
| Norway | 4 | [`by-region/norway.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/norway.json) |
| Saudi Arabia | 4 | [`by-region/saudi-arabia.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/saudi-arabia.json) |
| Morocco | 3 | [`by-region/morocco.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/morocco.json) |
| Estonia | 3 | [`by-region/estonia.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/estonia.json) |
| Belgium | 3 | [`by-region/belgium.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/belgium.json) |
| East Asia | 3 | [`by-region/east-asia.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/east-asia.json) |
| Senegal | 2 | [`by-region/senegal.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/senegal.json) |
| South Africa | 2 | [`by-region/south-africa.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/south-africa.json) |
| New Zealand | 2 | [`by-region/new-zealand.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/new-zealand.json) |
| Turkey | 2 | [`by-region/turkey.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/turkey.json) |
| Ukraine | 2 | [`by-region/ukraine.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/ukraine.json) |
| Italy | 2 | [`by-region/italy.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/italy.json) |
| Finland | 2 | [`by-region/finland.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/finland.json) |
| Nepal | 1 | [`by-region/nepal.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/nepal.json) |
| Bangladesh | 1 | [`by-region/bangladesh.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/bangladesh.json) |
| Russia | 1 | [`by-region/russia.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/russia.json) |
| Hungary | 1 | [`by-region/hungary.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/hungary.json) |
| Latvia | 1 | [`by-region/latvia.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/latvia.json) |
| Puerto Rico | 1 | [`by-region/puerto-rico.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/puerto-rico.json) |
| Czechia | 1 | [`by-region/czechia.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/czechia.json) |
| Greece | 1 | [`by-region/greece.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/greece.json) |
| Iraq | 1 | [`by-region/iraq.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/iraq.json) |
| Kyrgyzstan | 1 | [`by-region/kyrgyzstan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/kyrgyzstan.json) |
| Tanzania | 1 | [`by-region/tanzania.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/tanzania.json) |
| Algeria | 1 | [`by-region/algeria.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/algeria.json) |
| Croatia | 1 | [`by-region/croatia.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/croatia.json) |
| Lithuania | 1 | [`by-region/lithuania.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/lithuania.json) |
| Ivory Coast | 1 | [`by-region/ivory-coast.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/ivory-coast.json) |
| Romania | 1 | [`by-region/romania.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/romania.json) |
| Zambia | 1 | [`by-region/zambia.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/zambia.json) |
| Ecuador | 1 | [`by-region/ecuador.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/ecuador.json) |
| Cyprus | 1 | [`by-region/cyprus.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/cyprus.json) |
| Georgia | 1 | [`by-region/georgia.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/georgia.json) |
| Namibia | 1 | [`by-region/namibia.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/namibia.json) |
| Costa Rica | 1 | [`by-region/costa-rica.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/costa-rica.json) |
| Uganda | 1 | [`by-region/uganda.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/uganda.json) |
| Bahrain | 1 | [`by-region/bahrain.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/bahrain.json) |
| Venezuela | 1 | [`by-region/venezuela.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/venezuela.json) |
| Ethiopia | 1 | [`by-region/ethiopia.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/ethiopia.json) |
| Japan | 1 | [`by-region/japan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/japan.json) |
| Democratic Republic of the Congo | 1 | [`by-region/democratic-republic-of-the-congo.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/democratic-republic-of-the-congo.json) |
| Americas - United States | 1 | [`by-region/americas-united-states.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/americas-united-states.json) |
| Global | 1 | [`by-region/global.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-region/global.json) |

</details>

### 🏷️ By program

<details>
<summary>339 accelerator programs — <a href="https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/index.json">index.json</a></summary>

| Program | Companies | API |
|---|---|---|
| Plug and Play | 5507 | [`by-program/plug-and-play.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/plug-and-play.json) |
| 500 Global | 1401 | [`by-program/500-global.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/500-global.json) |
| Antler | 1237 | [`by-program/antler.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/antler.json) |
| Entrepreneur First | 498 | [`by-program/entrepreneur-first.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/entrepreneur-first.json) |
| YC Winter 2022 | 398 | [`by-program/yc-winter-2022.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-winter-2022.json) |
| YC Summer 2021 | 391 | [`by-program/yc-summer-2021.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-summer-2021.json) |
| YC Winter 2021 | 336 | [`by-program/yc-winter-2021.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-winter-2021.json) |
| Techstars New York City Accelerator | 274 | [`by-program/techstars-new-york-city-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-new-york-city-accelerator.json) |
| YC Winter 2023 | 274 | [`by-program/yc-winter-2023.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-winter-2023.json) |
| YC Winter 2024 | 249 | [`by-program/yc-winter-2024.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-winter-2024.json) |
| YC Summer 2024 | 248 | [`by-program/yc-summer-2024.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-summer-2024.json) |
| Techstars Boston Accelerator | 239 | [`by-program/techstars-boston-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-boston-accelerator.json) |
| YC Summer 2022 | 234 | [`by-program/yc-summer-2022.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-summer-2022.json) |
| YC Winter 2020 | 229 | [`by-program/yc-winter-2020.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-winter-2020.json) |
| YC Summer 2023 | 219 | [`by-program/yc-summer-2023.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-summer-2023.json) |
| Techstars Boulder Accelerator | 216 | [`by-program/techstars-boulder-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-boulder-accelerator.json) |
| YC Summer 2020 | 208 | [`by-program/yc-summer-2020.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-summer-2020.json) |
| YC Winter 2026 | 198 | [`by-program/yc-winter-2026.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-winter-2026.json) |
| YC Spring 2026 | 197 | [`by-program/yc-spring-2026.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-spring-2026.json) |
| YC Winter 2019 | 195 | [`by-program/yc-winter-2019.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-winter-2019.json) |
| Techstars London Accelerator | 177 | [`by-program/techstars-london-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-london-accelerator.json) |
| YC Summer 2019 | 176 | [`by-program/yc-summer-2019.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-summer-2019.json) |
| YC Winter 2025 | 167 | [`by-program/yc-winter-2025.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-winter-2025.json) |
| YC Summer 2025 | 166 | [`by-program/yc-summer-2025.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-summer-2025.json) |
| Techstars Seattle Accelerator | 165 | [`by-program/techstars-seattle-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-seattle-accelerator.json) |
| YC Fall 2025 | 148 | [`by-program/yc-fall-2025.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-fall-2025.json) |
| YC Winter 2018 | 146 | [`by-program/yc-winter-2018.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-winter-2018.json) |
| YC Spring 2025 | 143 | [`by-program/yc-spring-2025.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-spring-2025.json) |
| Techstars Austin Accelerator | 138 | [`by-program/techstars-austin-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-austin-accelerator.json) |
| YC Summer 2018 | 131 | [`by-program/yc-summer-2018.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-summer-2018.json) |
| Techstars Berlin Accelerator | 129 | [`by-program/techstars-berlin-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-berlin-accelerator.json) |
| YC Summer 2017 | 125 | [`by-program/yc-summer-2017.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-summer-2017.json) |
| YC Winter 2016 | 122 | [`by-program/yc-winter-2016.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-winter-2016.json) |
| Techstars Chicago Accelerator | 116 | [`by-program/techstars-chicago-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-chicago-accelerator.json) |
| Techstars Anywhere Accelerator | 116 | [`by-program/techstars-anywhere-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-anywhere-accelerator.json) |
| YC Winter 2017 | 116 | [`by-program/yc-winter-2017.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-winter-2017.json) |
| YC Winter 2015 | 110 | [`by-program/yc-winter-2015.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-winter-2015.json) |
| Techstars Space Accelerator | 104 | [`by-program/techstars-space-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-space-accelerator.json) |
| YC Summer 2015 | 104 | [`by-program/yc-summer-2015.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-summer-2015.json) |
| YC Summer 2016 | 102 | [`by-program/yc-summer-2016.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-summer-2016.json) |
| Techstars Toronto Accelerator | 100 | [`by-program/techstars-toronto-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-toronto-accelerator.json) |
| YC Fall 2024 | 94 | [`by-program/yc-fall-2024.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-fall-2024.json) |
| Techstars Atlanta powered by Cox Enterprises | 86 | [`by-program/techstars-atlanta-powered-by-cox-enterprises.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-atlanta-powered-by-cox-enterprises.json) |
| Techstars Future of Food Powered by Ecolab | 84 | [`by-program/techstars-future-of-food-powered-by-ecolab.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-future-of-food-powered-by-ecolab.json) |
| YC Summer 2012 | 83 | [`by-program/yc-summer-2012.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-summer-2012.json) |
| Techstars Tel Aviv Accelerator | 80 | [`by-program/techstars-tel-aviv-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-tel-aviv-accelerator.json) |
| Build in Tulsa Techstars Accelerator | 79 | [`by-program/build-in-tulsa-techstars-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/build-in-tulsa-techstars-accelerator.json) |
| YC Summer 2014 | 78 | [`by-program/yc-summer-2014.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-summer-2014.json) |
| YC Winter 2014 | 74 | [`by-program/yc-winter-2014.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-winter-2014.json) |
| London Barclays Accelerator, powered by Techstars | 72 | [`by-program/london-barclays-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/london-barclays-accelerator-powered-by-techstars.json) |
| Techstars Music Accelerator | 71 | [`by-program/techstars-music-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-music-accelerator.json) |
| Sustainability Paris Techstars Accelerator | 68 | [`by-program/sustainability-paris-techstars-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/sustainability-paris-techstars-accelerator.json) |
| Techstars Sports Accelerator Powered by Indy | 67 | [`by-program/techstars-sports-accelerator-powered-by-indy.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-sports-accelerator-powered-by-indy.json) |
| Techstars Transformative World Torino | 66 | [`by-program/techstars-transformative-world-torino.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-transformative-world-torino.json) |
| Techstars Workforce Development Accelerator | 66 | [`by-program/techstars-workforce-development-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-workforce-development-accelerator.json) |
| YC Winter 2012 | 66 | [`by-program/yc-winter-2012.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-winter-2012.json) |
| Techstars Chicago powered by J.P. Morgan | 60 | [`by-program/techstars-chicago-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-chicago-powered-by-j-p-morgan.json) |
| YC Summer 2011 | 60 | [`by-program/yc-summer-2011.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-summer-2011.json) |
| Techstars Alabama EnergyTech Accelerator | 59 | [`by-program/techstars-alabama-energytech-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-alabama-energytech-accelerator.json) |
| Techstars Detroit powered by J.P. Morgan | 59 | [`by-program/techstars-detroit-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-detroit-powered-by-j-p-morgan.json) |
| Techstars Miami powered by J.P. Morgan | 58 | [`by-program/techstars-miami-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-miami-powered-by-j-p-morgan.json) |
| New York Barclays Accelerator, powered by Techstars | 57 | [`by-program/new-york-barclays-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/new-york-barclays-accelerator-powered-by-techstars.json) |
| Techstars Atlanta powered by J.P. Morgan | 56 | [`by-program/techstars-atlanta-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-atlanta-powered-by-j-p-morgan.json) |
| Comcast NBCUniversal LIFT Labs Accelerator Powered by Techstars | 55 | [`by-program/comcast-nbcuniversal-lift-labs-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/comcast-nbcuniversal-lift-labs-accelerator-powered-by-techstars.json) |
| Techstars Detroit Accelerator | 54 | [`by-program/techstars-detroit-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-detroit-accelerator.json) |
| Techstars Washington DC powered by J.P. Morgan | 53 | [`by-program/techstars-washington-dc-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-washington-dc-powered-by-j-p-morgan.json) |
| YC Summer 2013 | 52 | [`by-program/yc-summer-2013.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-summer-2013.json) |
| Techstars Los Angeles powered by J.P. Morgan | 49 | [`by-program/techstars-los-angeles-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-los-angeles-powered-by-j-p-morgan.json) |
| Techstars New York City powered by J.P. Morgan | 49 | [`by-program/techstars-new-york-city-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-new-york-city-powered-by-j-p-morgan.json) |
| ABN AMRO & Techstars Future of Finance Accelerator | 48 | [`by-program/abn-amro-techstars-future-of-finance-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/abn-amro-techstars-future-of-finance-accelerator.json) |
| Techstars Oakland powered by J.P. Morgan | 47 | [`by-program/techstars-oakland-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-oakland-powered-by-j-p-morgan.json) |
| YC Winter 2013 | 46 | [`by-program/yc-winter-2013.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-winter-2013.json) |
| YC Winter 2011 | 45 | [`by-program/yc-winter-2011.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-winter-2011.json) |
| Techstars Cloud | 44 | [`by-program/techstars-cloud.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-cloud.json) |
| Techstars Impact powered by Cox Enterprises | 44 | [`by-program/techstars-impact-powered-by-cox-enterprises.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-impact-powered-by-cox-enterprises.json) |
| Equinor & Techstars Energy Accelerator | 43 | [`by-program/equinor-techstars-energy-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/equinor-techstars-energy-accelerator.json) |
| Distro 1 | 43 | [`by-program/distro-1.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/distro-1.json) |
| Techstars Montréal AI Accelerator | 41 | [`by-program/techstars-montr-al-ai-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-montr-al-ai-accelerator.json) |
| Techstars Columbus Powered by The Ohio State University | 41 | [`by-program/techstars-columbus-powered-by-the-ohio-state-university.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-columbus-powered-by-the-ohio-state-university.json) |
| METRO Accelerator for Hospitality powered by Techstars | 41 | [`by-program/metro-accelerator-for-hospitality-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/metro-accelerator-for-hospitality-powered-by-techstars.json) |
| STANLEY+Techstars Accelerator | 39 | [`by-program/stanley-techstars-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/stanley-techstars-accelerator.json) |
| Techstars Kansas City Accelerator | 39 | [`by-program/techstars-kansas-city-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-kansas-city-accelerator.json) |
| Barclays Accelerator, Powered by Techstars - Tel Aviv | 38 | [`by-program/barclays-accelerator-powered-by-techstars-tel-aviv.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/barclays-accelerator-powered-by-techstars-tel-aviv.json) |
| Techstars Healthcare, in partnership with Cedars-Sinai | 36 | [`by-program/techstars-healthcare-in-partnership-with-cedars-sinai.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-healthcare-in-partnership-with-cedars-sinai.json) |
| Techstars Tech Central Sydney powered by NSW Government | 36 | [`by-program/techstars-tech-central-sydney-powered-by-nsw-government.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-tech-central-sydney-powered-by-nsw-government.json) |
| YC Summer 2010 | 36 | [`by-program/yc-summer-2010.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-summer-2010.json) |
| Techstars Paris Accelerator | 31 | [`by-program/techstars-paris-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-paris-accelerator.json) |
| Techstars Physical Health Fort Worth | 31 | [`by-program/techstars-physical-health-fort-worth.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-physical-health-fort-worth.json) |
| Techstars Iowa Accelerator | 30 | [`by-program/techstars-iowa-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-iowa-accelerator.json) |
| Air Force Accelerator Powered by Techstars | 30 | [`by-program/air-force-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/air-force-accelerator-powered-by-techstars.json) |
| Techstars Future of Longevity Accelerator | 30 | [`by-program/techstars-future-of-longevity-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-future-of-longevity-accelerator.json) |
| UnitedHealthcare Accelerator Powered by Techstars | 30 | [`by-program/unitedhealthcare-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/unitedhealthcare-accelerator-powered-by-techstars.json) |
| Techstars Sustainability in Partnership with The Nature Conservancy | 30 | [`by-program/techstars-sustainability-in-partnership-with-the-nature-conservancy.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-sustainability-in-partnership-with-the-nature-conservancy.json) |
| The Minnesota Twins Accelerator by Techstars | 30 | [`by-program/the-minnesota-twins-accelerator-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/the-minnesota-twins-accelerator-by-techstars.json) |
| Techstars Web3 Accelerator | 30 | [`by-program/techstars-web3-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-web3-accelerator.json) |
| Techstars San Diego powered by San Diego State University | 30 | [`by-program/techstars-san-diego-powered-by-san-diego-state-university.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-san-diego-powered-by-san-diego-state-university.json) |
| MetLife Digital Accelerator powered by Techstars | 29 | [`by-program/metlife-digital-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/metlife-digital-accelerator-powered-by-techstars.json) |
| Techstars & Western Union Accelerator | 29 | [`by-program/techstars-western-union-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-western-union-accelerator.json) |
| Sprint Accelerator, powered by Techstars | 29 | [`by-program/sprint-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/sprint-accelerator-powered-by-techstars.json) |
| Techstars Bangalore Accelerator | 29 | [`by-program/techstars-bangalore-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-bangalore-accelerator.json) |
| Techstars Retail Accelerator, in partnership with Target | 28 | [`by-program/techstars-retail-accelerator-in-partnership-with-target.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-retail-accelerator-in-partnership-with-target.json) |
| Techstars Starburst Space Accelerator | 28 | [`by-program/techstars-starburst-space-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-starburst-space-accelerator.json) |
| Techstars Economic Mobility Powered by Samvid Ventures | 28 | [`by-program/techstars-economic-mobility-powered-by-samvid-ventures.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-economic-mobility-powered-by-samvid-ventures.json) |
| Techstars Industries of the Future Accelerator | 28 | [`by-program/techstars-industries-of-the-future-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-industries-of-the-future-accelerator.json) |
| GA 18 | 28 | [`by-program/ga-18.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-18.json) |
| Alexa Accelerator, Powered by Techstars | 27 | [`by-program/alexa-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alexa-accelerator-powered-by-techstars.json) |
| The Heritage Group Accelerator powered by Techstars | 27 | [`by-program/the-heritage-group-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/the-heritage-group-accelerator-powered-by-techstars.json) |
| Techstars Equitech Accelerator | 27 | [`by-program/techstars-equitech-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-equitech-accelerator.json) |
| YC Winter 2010 | 27 | [`by-program/yc-winter-2010.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-winter-2010.json) |
| GA 25 | 27 | [`by-program/ga-25.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-25.json) |
| GA 16 | 27 | [`by-program/ga-16.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-16.json) |
| GA 17 | 27 | [`by-program/ga-17.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-17.json) |
| YC Summer 2009 | 26 | [`by-program/yc-summer-2009.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-summer-2009.json) |
| GA 15 | 26 | [`by-program/ga-15.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-15.json) |
| GA 20 | 26 | [`by-program/ga-20.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-20.json) |
| Alchemist Class 41 | 26 | [`by-program/alchemist-class-41.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-41.json) |
| Eastern Pacific Accelerator Powered by Techstars | 25 | [`by-program/eastern-pacific-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/eastern-pacific-accelerator-powered-by-techstars.json) |
| Techstars AI Health Baltimore | 25 | [`by-program/techstars-ai-health-baltimore.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-ai-health-baltimore.json) |
| GA 27 | 25 | [`by-program/ga-27.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-27.json) |
| Techstars Healthcare sponsored by Cedars-Sinai, Point32Health, UCI Health, and UnitedHealthcare | 24 | [`by-program/techstars-healthcare-sponsored-by-cedars-sinai-point32health-uci-health-and-unitedhealthcare.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-healthcare-sponsored-by-cedars-sinai-point32health-uci-health-and-unitedhealthcare.json) |
| ARM Labs Lagos Techstars Accelerator | 24 | [`by-program/arm-labs-lagos-techstars-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/arm-labs-lagos-techstars-accelerator.json) |
| Techstars Tokyo Accelerator | 24 | [`by-program/techstars-tokyo-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-tokyo-accelerator.json) |
| Techstars Payments Powered by Stellar and MoneyGram | 23 | [`by-program/techstars-payments-powered-by-stellar-and-moneygram.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-payments-powered-by-stellar-and-moneygram.json) |
| GA 19 | 23 | [`by-program/ga-19.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-19.json) |
| Techstars IoT Accelerator | 22 | [`by-program/techstars-iot-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-iot-accelerator.json) |
| The Riyadh Techstars Accelerator | 22 | [`by-program/the-riyadh-techstars-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/the-riyadh-techstars-accelerator.json) |
| Stockholm Techstars Accelerator | 22 | [`by-program/stockholm-techstars-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/stockholm-techstars-accelerator.json) |
| YC Summer 2008 | 22 | [`by-program/yc-summer-2008.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-summer-2008.json) |
| YC Summer 2026 | 22 | [`by-program/yc-summer-2026.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-summer-2026.json) |
| Kaplan EdTech Accelerator, powered by Techstars | 21 | [`by-program/kaplan-edtech-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/kaplan-edtech-accelerator-powered-by-techstars.json) |
| Barclays Accelerator, Powered by Techstars - Cape Town | 21 | [`by-program/barclays-accelerator-powered-by-techstars-cape-town.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/barclays-accelerator-powered-by-techstars-cape-town.json) |
| Techstars San Francisco | 21 | [`by-program/techstars-san-francisco.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-san-francisco.json) |
| Techstars New Orleans Powered by J.P. Morgan | 21 | [`by-program/techstars-new-orleans-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-new-orleans-powered-by-j-p-morgan.json) |
| YC Winter 2008 | 21 | [`by-program/yc-winter-2008.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-winter-2008.json) |
| Alchemist Class 37 | 21 | [`by-program/alchemist-class-37.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-37.json) |
| R/GA Accelerator, powered by Techstars | 20 | [`by-program/r-ga-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/r-ga-accelerator-powered-by-techstars.json) |
| Techstars Lisbon in Partnership with Semapa Next | 20 | [`by-program/techstars-lisbon-in-partnership-with-semapa-next.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-lisbon-in-partnership-with-semapa-next.json) |
| The Roux Institute Techstars Accelerator | 20 | [`by-program/the-roux-institute-techstars-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/the-roux-institute-techstars-accelerator.json) |
| Techstars Hub71 Accelerator | 20 | [`by-program/techstars-hub71-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-hub71-accelerator.json) |
| SAP.iO Foundry, Powered by Techstars Accelerator | 20 | [`by-program/sap-io-foundry-powered-by-techstars-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/sap-io-foundry-powered-by-techstars-accelerator.json) |
| Techstars SportsTech Melbourne Accelerator | 20 | [`by-program/techstars-sportstech-melbourne-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-sportstech-melbourne-accelerator.json) |
| The Arcadis City of 2030 Accelerator Powered by Techstars | 20 | [`by-program/the-arcadis-city-of-2030-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/the-arcadis-city-of-2030-accelerator-powered-by-techstars.json) |
| BSH Future Home Accelerator Powered by Techstars | 20 | [`by-program/bsh-future-home-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/bsh-future-home-accelerator-powered-by-techstars.json) |
| Alchemist Class 22 | 20 | [`by-program/alchemist-class-22.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-22.json) |
| Alchemist Class 34 | 20 | [`by-program/alchemist-class-34.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-34.json) |
| Alchemist Class 39 | 20 | [`by-program/alchemist-class-39.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-39.json) |
| Colliers Proptech Accelerator Powered by Techstars | 19 | [`by-program/colliers-proptech-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/colliers-proptech-accelerator-powered-by-techstars.json) |
| Microsoft Accelerator for Windows Azure, powered by Techstars | 19 | [`by-program/microsoft-accelerator-for-windows-azure-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/microsoft-accelerator-for-windows-azure-powered-by-techstars.json) |
| Techstars Dubai Accelerator in Partnership with GINCO | 19 | [`by-program/techstars-dubai-accelerator-in-partnership-with-ginco.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-dubai-accelerator-in-partnership-with-ginco.json) |
| Techstars Impact Accelerator | 19 | [`by-program/techstars-impact-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-impact-accelerator.json) |
| YC Summer 2007 | 19 | [`by-program/yc-summer-2007.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-summer-2007.json) |
| GA 26 | 19 | [`by-program/ga-26.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-26.json) |
| Disney Accelerator, powered by Techstars | 18 | [`by-program/disney-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/disney-accelerator-powered-by-techstars.json) |
| METRO Retail Accelerator powered by Techstars | 18 | [`by-program/metro-retail-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/metro-retail-accelerator-powered-by-techstars.json) |
| Alchemist Class 23 | 18 | [`by-program/alchemist-class-23.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-23.json) |
| GA 21 | 17 | [`by-program/ga-21.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-21.json) |
| GA 22 | 17 | [`by-program/ga-22.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-22.json) |
| Alchemist Class 30 | 17 | [`by-program/alchemist-class-30.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-30.json) |
| Alchemist Class 36 | 17 | [`by-program/alchemist-class-36.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-36.json) |
| Alchemist Class 26 | 17 | [`by-program/alchemist-class-26.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-26.json) |
| YC Winter 2009 | 16 | [`by-program/yc-winter-2009.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-winter-2009.json) |
| Alchemist Class 20 | 16 | [`by-program/alchemist-class-20.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-20.json) |
| Alchemist Class 19 | 16 | [`by-program/alchemist-class-19.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-19.json) |
| Alchemist Class 27 | 16 | [`by-program/alchemist-class-27.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-27.json) |
| Alchemist Class 32 | 16 | [`by-program/alchemist-class-32.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-32.json) |
| Alchemist Class 25 | 16 | [`by-program/alchemist-class-25.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-25.json) |
| Mena 1 | 15 | [`by-program/mena-1.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/mena-1.json) |
| GA 9 | 15 | [`by-program/ga-9.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-9.json) |
| GA 3 | 15 | [`by-program/ga-3.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-3.json) |
| Alchemist Class 17 | 15 | [`by-program/alchemist-class-17.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-17.json) |
| Alchemist Class 31 | 15 | [`by-program/alchemist-class-31.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-31.json) |
| GA 14 | 14 | [`by-program/ga-14.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-14.json) |
| GA 1 | 14 | [`by-program/ga-1.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-1.json) |
| GA 10 | 14 | [`by-program/ga-10.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-10.json) |
| Alchemist Class 14 | 14 | [`by-program/alchemist-class-14.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-14.json) |
| Alchemist Class 28 | 14 | [`by-program/alchemist-class-28.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-28.json) |
| Alchemist Class 21 | 14 | [`by-program/alchemist-class-21.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-21.json) |
| Alchemist Class 33 | 14 | [`by-program/alchemist-class-33.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-33.json) |
| Alchemist Class 16 | 14 | [`by-program/alchemist-class-16.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-16.json) |
| USC and Techstars Accelerator | 13 | [`by-program/usc-and-techstars-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/usc-and-techstars-accelerator.json) |
| YC Winter 2007 | 13 | [`by-program/yc-winter-2007.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-winter-2007.json) |
| Mena 4 | 13 | [`by-program/mena-4.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/mena-4.json) |
| GA 7 | 13 | [`by-program/ga-7.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-7.json) |
| Misk 1 | 13 | [`by-program/misk-1.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/misk-1.json) |
| GA 13 | 13 | [`by-program/ga-13.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-13.json) |
| GA 5 | 13 | [`by-program/ga-5.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-5.json) |
| Alchemist Class 15 | 13 | [`by-program/alchemist-class-15.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-15.json) |
| Alchemist Class 35 | 13 | [`by-program/alchemist-class-35.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-35.json) |
| Techstars London Powered by Polygon | 12 | [`by-program/techstars-london-powered-by-polygon.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-london-powered-by-polygon.json) |
| Techstars Crypto Boston Powered by Algorand | 12 | [`by-program/techstars-crypto-boston-powered-by-algorand.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-crypto-boston-powered-by-algorand.json) |
| GA 2 | 12 | [`by-program/ga-2.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-2.json) |
| MENA 7 | 12 | [`by-program/mena-7.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/mena-7.json) |
| MENA 5 | 12 | [`by-program/mena-5.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/mena-5.json) |
| GA 8 | 12 | [`by-program/ga-8.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-8.json) |
| GA 6 | 12 | [`by-program/ga-6.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-6.json) |
| Alchemist Class 24 | 12 | [`by-program/alchemist-class-24.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-24.json) |
| Filecoin Techstars Accelerator | 11 | [`by-program/filecoin-techstars-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/filecoin-techstars-accelerator.json) |
| Techstars Future of Ecommerce powered by eBay | 11 | [`by-program/techstars-future-of-ecommerce-powered-by-ebay.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-future-of-ecommerce-powered-by-ebay.json) |
| Techstars and Audi Mobility Accelerator | 11 | [`by-program/techstars-and-audi-mobility-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-and-audi-mobility-accelerator.json) |
| YC Summer 2006 | 11 | [`by-program/yc-summer-2006.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-summer-2006.json) |
| GA 12 | 11 | [`by-program/ga-12.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-12.json) |
| Lucha 7 | 11 | [`by-program/lucha-7.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/lucha-7.json) |
| Georgia 4 | 11 | [`by-program/georgia-4.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/georgia-4.json) |
| GA 24 | 11 | [`by-program/ga-24.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-24.json) |
| Alchemist Class 18 | 11 | [`by-program/alchemist-class-18.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-18.json) |
| Alchemist Class 29 | 11 | [`by-program/alchemist-class-29.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-29.json) |
| Alchemist Class 38 | 11 | [`by-program/alchemist-class-38.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-38.json) |
| Alchemist Class 40 | 11 | [`by-program/alchemist-class-40.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-40.json) |
| Rakuten Accelerator, Powered by Techstars | 10 | [`by-program/rakuten-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/rakuten-accelerator-powered-by-techstars.json) |
| Techstars Allied Space Accelerator | 10 | [`by-program/techstars-allied-space-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-allied-space-accelerator.json) |
| Alchemist Blockchain Techstars Accelerator | 10 | [`by-program/alchemist-blockchain-techstars-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-blockchain-techstars-accelerator.json) |
| Microsoft Accelerator for Kinect, powered by Techstars | 10 | [`by-program/microsoft-accelerator-for-kinect-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/microsoft-accelerator-for-kinect-powered-by-techstars.json) |
| Techstars Adelaide | 10 | [`by-program/techstars-adelaide.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-adelaide.json) |
| Northwestern Medicine & Techstars Healthcare Accelerator | 10 | [`by-program/northwestern-medicine-techstars-healthcare-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/northwestern-medicine-techstars-healthcare-accelerator.json) |
| Techstars Healthcare Accelerator powered by Permanente Medicine Mid-Atlantic States | 10 | [`by-program/techstars-healthcare-accelerator-powered-by-permanente-medicine-mid-atlantic-states.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-healthcare-accelerator-powered-by-permanente-medicine-mid-atlantic-states.json) |
| Misk 3 | 10 | [`by-program/misk-3.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/misk-3.json) |
| Mena 2 | 10 | [`by-program/mena-2.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/mena-2.json) |
| Dojo II | 10 | [`by-program/dojo-ii.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/dojo-ii.json) |
| Qualcomm Robotics Accelerator, powered by Techstars | 9 | [`by-program/qualcomm-robotics-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/qualcomm-robotics-accelerator-powered-by-techstars.json) |
| Techstars Connection | 9 | [`by-program/techstars-connection.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-connection.json) |
| Virgin Media Accelerator powered by Techstars | 9 | [`by-program/virgin-media-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/virgin-media-accelerator-powered-by-techstars.json) |
| Launchpool Web3 Techstars Accelerator | 9 | [`by-program/launchpool-web3-techstars-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/launchpool-web3-techstars-accelerator.json) |
| YC Summer 2005 | 9 | [`by-program/yc-summer-2005.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-summer-2005.json) |
| GA 23 | 9 | [`by-program/ga-23.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-23.json) |
| GA 11 | 9 | [`by-program/ga-11.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-11.json) |
| MENA 6 | 9 | [`by-program/mena-6.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/mena-6.json) |
| GA 28 | 9 | [`by-program/ga-28.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-28.json) |
| MENA 9 | 9 | [`by-program/mena-9.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/mena-9.json) |
| Misk 2 | 9 | [`by-program/misk-2.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/misk-2.json) |
| Alchemist Class 8 | 9 | [`by-program/alchemist-class-8.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-8.json) |
| Alchemist Class 12 | 9 | [`by-program/alchemist-class-12.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-12.json) |
| Alchemist Class 10 | 9 | [`by-program/alchemist-class-10.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-10.json) |
| Nike+ Accelerator, powered by Techstars | 8 | [`by-program/nike-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/nike-accelerator-powered-by-techstars.json) |
| GA 34 | 8 | [`by-program/ga-34.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-34.json) |
| GA 4 | 8 | [`by-program/ga-4.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-4.json) |
| GA 33 | 8 | [`by-program/ga-33.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-33.json) |
| GA 29 | 8 | [`by-program/ga-29.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-29.json) |
| MENA 8 | 8 | [`by-program/mena-8.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/mena-8.json) |
| MENA 10 | 8 | [`by-program/mena-10.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/mena-10.json) |
| Alchemist Class 13 | 8 | [`by-program/alchemist-class-13.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-13.json) |
| Techstars Chicago | 7 | [`by-program/techstars-chicago.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-chicago.json) |
| Techstars WaterTech & Sustainability | 7 | [`by-program/techstars-watertech-sustainability.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-watertech-sustainability.json) |
| YC Winter 2006 | 7 | [`by-program/yc-winter-2006.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-winter-2006.json) |
| Dojo III | 7 | [`by-program/dojo-iii.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/dojo-iii.json) |
| Lucha 15 | 7 | [`by-program/lucha-15.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/lucha-15.json) |
| Lucha - NONE | 7 | [`by-program/lucha-none.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/lucha-none.json) |
| Alchemist Class 9 | 7 | [`by-program/alchemist-class-9.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-9.json) |
| Alchemist Class 5 | 7 | [`by-program/alchemist-class-5.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-5.json) |
| Alchemist Class 4 | 7 | [`by-program/alchemist-class-4.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-4.json) |
| Techstars Korea Accelerator | 6 | [`by-program/techstars-korea-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-korea-accelerator.json) |
| Lucha 12 | 6 | [`by-program/lucha-12.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/lucha-12.json) |
| Georgia 7 | 6 | [`by-program/georgia-7.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/georgia-7.json) |
| Eurasia 7 | 6 | [`by-program/eurasia-7.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/eurasia-7.json) |
| Lucha 18 | 6 | [`by-program/lucha-18.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/lucha-18.json) |
| Lucha 6 | 6 | [`by-program/lucha-6.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/lucha-6.json) |
| Lucha 9 | 6 | [`by-program/lucha-9.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/lucha-9.json) |
| Eurasia 10 | 6 | [`by-program/eurasia-10.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/eurasia-10.json) |
| Alchemist Class 7 | 6 | [`by-program/alchemist-class-7.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-7.json) |
| Alchemist Class 6 | 6 | [`by-program/alchemist-class-6.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-6.json) |
| Alchemist Class 11 | 6 | [`by-program/alchemist-class-11.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-11.json) |
| Founder Catalyst WaterTech & Sustainability, Techstars WaterTech & Sustainability | 5 | [`by-program/founder-catalyst-watertech-sustainability-techstars-watertech-sustainability.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/founder-catalyst-watertech-sustainability-techstars-watertech-sustainability.json) |
| SF 36 | 5 | [`by-program/sf-36.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/sf-36.json) |
| Lucha 10 | 5 | [`by-program/lucha-10.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/lucha-10.json) |
| Lucha 14 | 5 | [`by-program/lucha-14.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/lucha-14.json) |
| Dojo I | 5 | [`by-program/dojo-i.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/dojo-i.json) |
| MENA 11 | 5 | [`by-program/mena-11.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/mena-11.json) |
| Lucha 5 | 5 | [`by-program/lucha-5.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/lucha-5.json) |
| Georgia 5 | 5 | [`by-program/georgia-5.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/georgia-5.json) |
| GA 35 | 5 | [`by-program/ga-35.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-35.json) |
| Founder Catalyst in partnership with J.P. Morgan, Techstars Atlanta powered by Cox Enterprises | 4 | [`by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-atlanta-powered-by-cox-enterprises.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-atlanta-powered-by-cox-enterprises.json) |
| USC and Techstars Accelerator, USC and Techstars University Catalyst | 4 | [`by-program/usc-and-techstars-accelerator-usc-and-techstars-university-catalyst.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/usc-and-techstars-accelerator-usc-and-techstars-university-catalyst.json) |
| Founder Catalyst in partnership with J.P. Morgan, Techstars Impact powered by Cox Enterprises | 4 | [`by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-impact-powered-by-cox-enterprises.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-impact-powered-by-cox-enterprises.json) |
| Lucha 4 | 4 | [`by-program/lucha-4.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/lucha-4.json) |
| Lucha 3 | 4 | [`by-program/lucha-3.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/lucha-3.json) |
| Eurasia 9 | 4 | [`by-program/eurasia-9.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/eurasia-9.json) |
| Alchemist Class 3 | 4 | [`by-program/alchemist-class-3.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-3.json) |
| Disney Accelerator, powered by Techstars, Techstars Boulder Accelerator | 3 | [`by-program/disney-accelerator-powered-by-techstars-techstars-boulder-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/disney-accelerator-powered-by-techstars-techstars-boulder-accelerator.json) |
| Founder Catalyst sponsored by Stanley Black & Decker, Techstars New York City Accelerator | 3 | [`by-program/founder-catalyst-sponsored-by-stanley-black-decker-techstars-new-york-city-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/founder-catalyst-sponsored-by-stanley-black-decker-techstars-new-york-city-accelerator.json) |
| Founder Catalyst in partnership with J.P. Morgan, Techstars Equitech Accelerator | 3 | [`by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-equitech-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-equitech-accelerator.json) |
| YC Fall 2026 | 3 | [`by-program/yc-fall-2026.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-fall-2026.json) |
| Eurasia 8 | 3 | [`by-program/eurasia-8.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/eurasia-8.json) |
| Lucha 8 | 3 | [`by-program/lucha-8.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/lucha-8.json) |
| Georgia 6 | 3 | [`by-program/georgia-6.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/georgia-6.json) |
| GA 32 | 3 | [`by-program/ga-32.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-32.json) |
| Lucha 11 | 3 | [`by-program/lucha-11.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/lucha-11.json) |
| Founder Catalyst in partnership with J.P. Morgan, Techstars Workforce Development Accelerator | 2 | [`by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-workforce-development-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-workforce-development-accelerator.json) |
| Anjal Z Techstars Founder Catalyst, Techstars Atlanta powered by J.P. Morgan | 2 | [`by-program/anjal-z-techstars-founder-catalyst-techstars-atlanta-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/anjal-z-techstars-founder-catalyst-techstars-atlanta-powered-by-j-p-morgan.json) |
| Georgia 3 | 2 | [`by-program/georgia-3.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/georgia-3.json) |
| Egypt Scale Up1 | 2 | [`by-program/egypt-scale-up1.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/egypt-scale-up1.json) |
| Lucha 2 | 2 | [`by-program/lucha-2.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/lucha-2.json) |
| Alchemist Class 1 | 2 | [`by-program/alchemist-class-1.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-1.json) |
| Alexa Next Stage, Powered by Techstars, Techstars Seattle Accelerator | 1 | [`by-program/alexa-next-stage-powered-by-techstars-techstars-seattle-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alexa-next-stage-powered-by-techstars-techstars-seattle-accelerator.json) |
| Alexa Next Stage, Powered by Techstars, Techstars London Accelerator | 1 | [`by-program/alexa-next-stage-powered-by-techstars-techstars-london-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alexa-next-stage-powered-by-techstars-techstars-london-accelerator.json) |
| Founder Catalyst in partnership with J.P. Morgan, Techstars Economic Mobility Powered by Samvid Ventures | 1 | [`by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-economic-mobility-powered-by-samvid-ventures.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-economic-mobility-powered-by-samvid-ventures.json) |
| Founder Catalyst in partnership with J.P. Morgan, Techstars Industries of the Future Accelerator | 1 | [`by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-industries-of-the-future-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-industries-of-the-future-accelerator.json) |
| Founder Catalyst sponsored by Stanley Black & Decker, Techstars Space Accelerator | 1 | [`by-program/founder-catalyst-sponsored-by-stanley-black-decker-techstars-space-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/founder-catalyst-sponsored-by-stanley-black-decker-techstars-space-accelerator.json) |
| Techstars Chicago, Techstars Founder Catalyst Global Program | 1 | [`by-program/techstars-chicago-techstars-founder-catalyst-global-program.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-chicago-techstars-founder-catalyst-global-program.json) |
| Founder Catalyst sponsored by Stanley Black & Decker, Northwestern Medicine & Techstars Healthcare Accelerator | 1 | [`by-program/founder-catalyst-sponsored-by-stanley-black-decker-northwestern-medicine-techstars-healthcare-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/founder-catalyst-sponsored-by-stanley-black-decker-northwestern-medicine-techstars-healthcare-accelerator.json) |
| Founder Catalyst in partnership with J.P. Morgan, Techstars Anywhere Accelerator | 1 | [`by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-anywhere-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-anywhere-accelerator.json) |
| Founder Catalyst in partnership with J.P. Morgan, Techstars Alabama EnergyTech Accelerator | 1 | [`by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-alabama-energytech-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-alabama-energytech-accelerator.json) |
| Founder Innovation Lab Pre-accelerator, Techstars and Audi Mobility Accelerator | 1 | [`by-program/founder-innovation-lab-pre-accelerator-techstars-and-audi-mobility-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/founder-innovation-lab-pre-accelerator-techstars-and-audi-mobility-accelerator.json) |
| Founder Catalyst in partnership with J.P. Morgan, Techstars Oakland powered by J.P. Morgan | 1 | [`by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-oakland-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-oakland-powered-by-j-p-morgan.json) |
| Founder Catalyst in partnership with J.P. Morgan, Techstars Miami powered by J.P. Morgan | 1 | [`by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-miami-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-miami-powered-by-j-p-morgan.json) |
| Founder Catalyst Jeddah, Techstars San Francisco | 1 | [`by-program/founder-catalyst-jeddah-techstars-san-francisco.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/founder-catalyst-jeddah-techstars-san-francisco.json) |
| MIH for startups powered by Techstars, Techstars Industries of the Future Accelerator | 1 | [`by-program/mih-for-startups-powered-by-techstars-techstars-industries-of-the-future-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/mih-for-startups-powered-by-techstars-techstars-industries-of-the-future-accelerator.json) |
| Founder Catalyst sponsored by Stanley Black & Decker, Techstars Economic Mobility Powered by Samvid Ventures | 1 | [`by-program/founder-catalyst-sponsored-by-stanley-black-decker-techstars-economic-mobility-powered-by-samvid-ventures.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/founder-catalyst-sponsored-by-stanley-black-decker-techstars-economic-mobility-powered-by-samvid-ventures.json) |
| Founder Catalyst WaterTech & Sustainability, Techstars Columbus Powered by The Ohio State University | 1 | [`by-program/founder-catalyst-watertech-sustainability-techstars-columbus-powered-by-the-ohio-state-university.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/founder-catalyst-watertech-sustainability-techstars-columbus-powered-by-the-ohio-state-university.json) |
| MIH for startups powered by Techstars, Techstars Starburst Space Accelerator | 1 | [`by-program/mih-for-startups-powered-by-techstars-techstars-starburst-space-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/mih-for-startups-powered-by-techstars-techstars-starburst-space-accelerator.json) |
| Founder Catalyst in partnership with J.P. Morgan, Techstars Detroit powered by J.P. Morgan | 1 | [`by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-detroit-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-detroit-powered-by-j-p-morgan.json) |
| Founder Catalyst Jeddah, Techstars London Accelerator | 1 | [`by-program/founder-catalyst-jeddah-techstars-london-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/founder-catalyst-jeddah-techstars-london-accelerator.json) |
| Founder Catalyst WaterTech & Sustainability, Sustainability Paris Techstars Accelerator | 1 | [`by-program/founder-catalyst-watertech-sustainability-sustainability-paris-techstars-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/founder-catalyst-watertech-sustainability-sustainability-paris-techstars-accelerator.json) |
| STANLEY+Techstars Accelerator, Techstars Boston Accelerator | 1 | [`by-program/stanley-techstars-accelerator-techstars-boston-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/stanley-techstars-accelerator-techstars-boston-accelerator.json) |
| Techstars Founder Catalyst powered by WeXchange, Techstars Washington DC powered by J.P. Morgan | 1 | [`by-program/techstars-founder-catalyst-powered-by-wexchange-techstars-washington-dc-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-founder-catalyst-powered-by-wexchange-techstars-washington-dc-powered-by-j-p-morgan.json) |
| Founder Catalyst sponsored by Stanley Black & Decker, Techstars Equitech Accelerator | 1 | [`by-program/founder-catalyst-sponsored-by-stanley-black-decker-techstars-equitech-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/founder-catalyst-sponsored-by-stanley-black-decker-techstars-equitech-accelerator.json) |
| Founder Catalyst in partnership with J.P. Morgan, Techstars Seattle Accelerator | 1 | [`by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-seattle-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-seattle-accelerator.json) |
| Build in Tulsa Techstars Accelerator, Founder Catalyst in partnership with J.P. Morgan | 1 | [`by-program/build-in-tulsa-techstars-accelerator-founder-catalyst-in-partnership-with-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/build-in-tulsa-techstars-accelerator-founder-catalyst-in-partnership-with-j-p-morgan.json) |
| New York Barclays Accelerator, powered by Techstars, Nike+ Accelerator, powered by Techstars | 1 | [`by-program/new-york-barclays-accelerator-powered-by-techstars-nike-accelerator-powered-by-techstars.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/new-york-barclays-accelerator-powered-by-techstars-nike-accelerator-powered-by-techstars.json) |
| Founder Catalyst sponsored by Stanley Black & Decker, Techstars Washington DC powered by J.P. Morgan | 1 | [`by-program/founder-catalyst-sponsored-by-stanley-black-decker-techstars-washington-dc-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/founder-catalyst-sponsored-by-stanley-black-decker-techstars-washington-dc-powered-by-j-p-morgan.json) |
| Founder Innovation Lab Pre-accelerator, Sustainability Paris Techstars Accelerator | 1 | [`by-program/founder-innovation-lab-pre-accelerator-sustainability-paris-techstars-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/founder-innovation-lab-pre-accelerator-sustainability-paris-techstars-accelerator.json) |
| Techstars Founder Catalyst powered by WeXchange, Techstars Miami powered by J.P. Morgan | 1 | [`by-program/techstars-founder-catalyst-powered-by-wexchange-techstars-miami-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-founder-catalyst-powered-by-wexchange-techstars-miami-powered-by-j-p-morgan.json) |
| Founder Catalyst in partnership with J.P. Morgan, Techstars Atlanta powered by J.P. Morgan | 1 | [`by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-atlanta-powered-by-j-p-morgan.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-atlanta-powered-by-j-p-morgan.json) |
| Sprint Accelerator, powered by Techstars, Techstars Healthcare, in partnership with Cedars-Sinai | 1 | [`by-program/sprint-accelerator-powered-by-techstars-techstars-healthcare-in-partnership-with-cedars-sinai.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/sprint-accelerator-powered-by-techstars-techstars-healthcare-in-partnership-with-cedars-sinai.json) |
| Techstars Boulder Accelerator, Techstars Retail Accelerator, in partnership with Target | 1 | [`by-program/techstars-boulder-accelerator-techstars-retail-accelerator-in-partnership-with-target.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-boulder-accelerator-techstars-retail-accelerator-in-partnership-with-target.json) |
| Techstars New York City Accelerator, Techstars Retail Accelerator, in partnership with Target | 1 | [`by-program/techstars-new-york-city-accelerator-techstars-retail-accelerator-in-partnership-with-target.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/techstars-new-york-city-accelerator-techstars-retail-accelerator-in-partnership-with-target.json) |
| Founder Catalyst in partnership with J.P. Morgan, Techstars Boulder Accelerator | 1 | [`by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-boulder-accelerator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/founder-catalyst-in-partnership-with-j-p-morgan-techstars-boulder-accelerator.json) |
| Y Combinator | 1 | [`by-program/y-combinator.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/y-combinator.json) |
| YC Winter 2027 | 1 | [`by-program/yc-winter-2027.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/yc-winter-2027.json) |
| Distro 1, GA 16 | 1 | [`by-program/distro-1-ga-16.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/distro-1-ga-16.json) |
| GA 30 | 1 | [`by-program/ga-30.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-30.json) |
| Lucha 1 | 1 | [`by-program/lucha-1.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/lucha-1.json) |
| MENA 12 | 1 | [`by-program/mena-12.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/mena-12.json) |
| GA 12, Dojo I | 1 | [`by-program/ga-12-dojo-i.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-12-dojo-i.json) |
| Distro 1, GA 13 | 1 | [`by-program/distro-1-ga-13.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/distro-1-ga-13.json) |
| Saola | 1 | [`by-program/saola.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/saola.json) |
| Distro 1, GA 7, Lucha 2 | 1 | [`by-program/distro-1-ga-7-lucha-2.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/distro-1-ga-7-lucha-2.json) |
| Distro 1, GA 11 | 1 | [`by-program/distro-1-ga-11.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/distro-1-ga-11.json) |
| Distro 1, GA 10 | 1 | [`by-program/distro-1-ga-10.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/distro-1-ga-10.json) |
| GA 6, Distro 1 | 1 | [`by-program/ga-6-distro-1.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/ga-6-distro-1.json) |
| Alchemist Class 2 | 1 | [`by-program/alchemist-class-2.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/by-program/alchemist-class-2.json) |

</details>

> Tip: pull [`meta.json`](https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data/meta.json) once to discover every available URL and count programmatically.

## 📀 Schema

Each company is an object with the following fields:

| Field | Type | Description |
|---|---|---|
| `source` | string | Portfolio source (`techstars`, `yc`, `antler`, `500`, `ef`, `alchemist`, `plugandplay`) |
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
| `founders` | object[] | Founders: `name`, `role`, `linkedin` (where available, e.g. EF / 500) |
| `isExit` | boolean | Has exited |
| `isUnicorn` | boolean | Valued $1B+ |
| `isBCorp` | boolean | Certified B Corp |
| `isCurrentSession` | boolean | In the current session |
| `social` | object | `linkedin`, `twitter`, `facebook`, `crunchbase` URLs |
| `extra` | object | Selected raw source fields (`city`, `state_province`, `country`) |

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

A scheduled job pulls each source — Techstars from its public search index, Y Combinator from its public company directory, 500 Global and Entrepreneur First from their public endpoints, and Antler, Alchemist, and Plug and Play via a headless browser — merges them into one dataset, rebuilds every JSON/CSV/XLSX file, regenerates the stats and this README, and commits the result. So the data here tracks the live portfolios without any manual work.

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

[MIT](LICENSE). Data is sourced from the public Techstars, Y Combinator, Antler, 500 Global, Entrepreneur First, Alchemist, and Plug and Play portfolios; please respect each provider's terms when using it. This project is not affiliated with or endorsed by any of them.
