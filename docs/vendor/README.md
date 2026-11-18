# Vendored files

Self-hosted (rather than loaded from a CDN) so the explorer's Content-Security-Policy can stay `script-src 'self'`, and loaded only when someone opens the Globe view.

| File | Source | Version | License |
|---|---|---|---|
| `globe.gl.min.js` | [globe.gl](https://github.com/vasturiano/globe.gl) (bundles three.js) | 2.46.2 | MIT — see `globe.gl.LICENSE.txt` |
| `earth-dark.jpg` | three-globe example textures (NASA imagery) | three-globe 2.45.6 | Public domain (NASA) |

To update: `npm pack globe.gl@<version>` and copy `package/dist/globe.gl.min.js` here; bump the version above.
