# Contributing

Contributions are welcome — bug reports, data corrections, feature suggestions, and code improvements.

## Reporting a data issue

If a company is missing, has wrong info, or appears twice, [open an issue](https://github.com/yigitmeteozcan/startups/issues/new?template=data-issue.md). The data comes from the public Techstars, Y Combinator, Antler, 500 Global, Entrepreneur First, Alchemist, and Plug and Play portfolios; if a company is missing from its portfolio page, it won't appear here until the source adds it.

## Suggesting a feature

Open a [feature request](https://github.com/yigitmeteozcan/startups/issues/new?template=feature-request.md). Describe what you're trying to do and why the current data doesn't support it.

## Code changes

1. Fork the repo and create a branch from `main`.
2. Make your changes and run `npm test`.
   - Changing normalization or output code? Run `npm run rebuild` to re-render `data/` from the committed dataset without any network access, and check the diff.
   - Changing a fetcher? Run `SOURCES=<name> npm run fetch:data` — only that source is fetched live; every other source keeps its committed records. (Techstars uses `TYPESENSE_API_KEY` if set, otherwise a headless browser via `npm run install:browsers`.)
3. Open a pull request. Keep PRs focused — one thing per PR.

The build never drops a source on a bad day: a source that fails, returns junk, or suddenly shrinks below 80% of its committed size keeps its committed records. If a source was damaged anyway, restore it from an earlier commit with `npm run restore -- <source> <commit>`.

### Project structure

```
src/
  sources/          One fetcher per portfolio + gatherAll (guards, fallback)
  scraper.js        Browser-based Techstars scraper (captures the Typesense key)
  typesense.js      Direct Techstars Typesense client (needs TYPESENSE_API_KEY)
  normalize.js      Shared normalization, URL repair, junk filter
  finalize.js       Last clean-up pass: repairs, tags, country, id, alsoIn
  dataset.js        Writes every output file + regenerates README/STATS
  readme.js         README template (generated from meta.json + stats.json)
  excel.js          Excel (XLSX) workbook builder
  index.js          Express REST API
  store.js          In-memory dataset for the API (file or DATA_URL)
  query.js          API filtering / sorting / pagination
  http.js           fetch with timeouts

scripts/
  fetch-direct.js   npm run fetch:data / build:data — full live build
  rebuild.js        npm run rebuild — re-render data/ offline
  restore-source.js npm run restore -- <source> <commit>
  build-readme.js   npm run build:readme
  export.js         npm run export — one-off Excel export
  get-key.js        npm run get-key — print the Techstars Typesense key

docs/               Live explorer (GitHub Pages): index.html, app.js, style.css
data/               Generated dataset (all.json/csv/xlsx, slices, stats, meta)
test/               node:test suite (npm test)
```

## License

By contributing you agree that your contributions will be licensed under the [MIT License](LICENSE).
