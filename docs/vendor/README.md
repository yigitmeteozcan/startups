# Vendored files

Self-hosted (rather than loaded from a CDN) so the explorer's Content-Security-Policy can stay `script-src 'self'` / `font-src 'self'`. The globe files load only when someone opens the Globe view.

| File | Source | Version | License |
|---|---|---|---|
| `globe.gl.min.js` | [globe.gl](https://github.com/vasturiano/globe.gl) (bundles three.js) | 2.46.2 | MIT — see `globe.gl.LICENSE.txt` |
| `earth-dark.jpg` | three-globe example textures (NASA imagery) | three-globe 2.45.6 | Public domain (NASA) — fallback only, used if the country shapes fail to load |
| `countries-110m.json` | [Natural Earth](https://www.naturalearthdata.com/) Admin 0 countries, 1:110m, reduced to `{ name, iso2 }` with coordinates rounded to 0.01° (France and Norway given their ISO codes) | from globe.gl 2.46.2's `example/datasets` | Public domain |
| `fonts/Geist-Variable.woff2`, `fonts/GeistMono-Variable.woff2` | [Geist](https://github.com/vercel/geist-font) by Vercel | `geist` npm 1.9.2 | SIL Open Font License 1.1 — see `fonts/OFL-Geist.txt` |

To update: `npm pack globe.gl@<version>` and copy `package/dist/globe.gl.min.js` here; bump the version above.
