"use strict";
// Startup Portfolios Explorer. All rendering uses DOM APIs (textContent /
// attributes), never HTML strings, so scraped text can't inject markup, and
// every link is checked to be http(s) before it is used.

(() => {
  const RAW = "https://raw.githubusercontent.com/yigitmeteozcan/startups/main/data";
  const CDN = "https://cdn.jsdelivr.net/gh/yigitmeteozcan/startups@main/data";
  const SHEETJS = "https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js";
  const PER_PAGE = 30;

  const SOURCE_LABELS = {
    techstars: "Techstars", yc: "Y Combinator", antler: "Antler", 500: "500 Global",
    ef: "Entrepreneur First", alchemist: "Alchemist", plugandplay: "Plug and Play",
  };
  const SOURCE_SHORT = {
    techstars: "Techstars", yc: "YC", antler: "Antler", 500: "500",
    ef: "EF", alchemist: "Alchemist", plugandplay: "Plug and Play",
  };
  const FLAGS = ["isUnicorn", "isExit", "isBCorp", "hasFounders"];
  const SELECTS = ["source", "country", "region", "industry", "yearFrom", "yearTo", "sort"];

  let companies = [];
  let haystacks = [];
  let filtered = [];
  let page = 0;
  const selected = new Set();
  const flags = { isUnicorn: false, isExit: false, isBCorp: false, hasFounders: false };

  const $ = (id) => document.getElementById(id);
  const plural = (n, one, many) => `${n.toLocaleString()} ${n === 1 ? one : many}`;
  const sourceLabel = (s) => SOURCE_LABELS[s] || s;

  // Only absolute http(s) URLs are ever put into href/src.
  function safeUrl(u) {
    if (!u) return null;
    try {
      const url = new URL(String(u));
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
    } catch (_) {
      return null;
    }
  }

  // Tiny DOM builder: h("a", { href, class }, "text", childNode, ...)
  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "dataset") Object.assign(el.dataset, v);
      else el.setAttribute(k, v === true ? "" : String(v));
    }
    for (const c of children.flat()) {
      if (c == null || c === false || c === "" || c === 0) continue; // never render a stray 0 from `n && el`
      el.append(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return el;
  }

  function extLink(url, text, label) {
    const href = safeUrl(url);
    if (!href) return null;
    return h("a", { href, target: "_blank", rel: "noopener noreferrer", "aria-label": label || null, title: label || null }, text);
  }

  const uid = (c, i) => c.id || `${c.source}|${c.name}|${c.website || ""}|${i}`;

  // ── Load ────────────────────────────────────────────────────────────────────
  // Raw GitHub first (fresh within minutes of a data push), jsDelivr as backup.
  // "no-cache" revalidates with the server (ETag) instead of re-downloading the
  // full file on every visit.
  async function getJson(file) {
    let lastErr;
    for (const base of [RAW, CDN]) {
      try {
        const r = await fetch(`${base}/${file}`, { cache: "no-cache" });
        if (r.ok) return await r.json();
        lastErr = new Error(`${file}: HTTP ${r.status}`);
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr || new Error(`Could not load ${file}`);
  }

  async function load() {
    try {
      const [all, stats] = await Promise.all([getJson("all.json"), getJson("stats.json").catch(() => null)]);
      if (!Array.isArray(all)) throw new Error("Unexpected data format");
      companies = all;
      haystacks = companies.map((c) =>
        [c.name, (c.formerNames || []).join(" "), c.description, (c.tags || []).join(" "), c.location, c.country, c.program,
          (c.founders || []).map((f) => f && f.name).join(" ")]
          .filter(Boolean).join("\n").toLowerCase()
      );
      companies.forEach((c, i) => { c.__uid = uid(c, i); });
      renderStats(stats);
      buildFilters();
      readUrl();
      apply({ keepPage: true });
    } catch (err) {
      const list = $("results");
      list.replaceChildren(
        h("div", { class: "loading" }, "Couldn't load the dataset.",
          h("small", {}, `${err.message}. Check your connection and refresh the page.`))
      );
    }
  }

  function renderStats(s) {
    const stat = (val, label) => h("div", { class: "stat" }, h("b", {}, Number(val || 0).toLocaleString()), h("span", {}, label));
    const count = (f) => companies.filter(f).length;
    $("stats").replaceChildren(
      stat(s?.total ?? companies.length, "companies"),
      stat(s?.unicorns ?? count((c) => c.isUnicorn), "🦄 unicorns"),
      stat(s?.exits ?? count((c) => c.isExit), "💰 exits"),
      stat(s?.founders ?? companies.reduce((n, c) => n + (c.founders || []).length, 0), "👤 founders"),
      stat(Object.keys(s?.bySource || {}).length || new Set(companies.map((c) => c.source)).size, "sources"),
    );
    if (s?.generatedAt) $("updated").textContent = `Updated ${s.generatedAt.slice(0, 10)} · `;
  }

  // ── Filters ──────────────────────────────────────────────────────────────────
  function counts(fn) {
    const m = new Map();
    for (const c of companies) for (const v of [].concat(fn(c)).filter((x) => x !== "" && x != null)) m.set(v, (m.get(v) || 0) + 1);
    return m;
  }

  function fillSelect(id, entries, label = (v) => v) {
    const sel = $(id);
    const frag = document.createDocumentFragment();
    for (const [value, n] of entries) frag.append(h("option", { value }, n == null ? label(value) : `${label(value)} (${n.toLocaleString()})`));
    sel.append(frag);
  }

  function buildFilters() {
    const byCount = (m) => [...m.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
    fillSelect("source", byCount(counts((c) => c.source)), sourceLabel);
    fillSelect("country", byCount(counts((c) => c.country)));
    fillSelect("region", byCount(counts((c) => c.region)));
    fillSelect("industry", byCount(counts((c) => c.tags)));
    const years = [...counts((c) => c.year).keys()].filter((y) => /^\d{4}$/.test(String(y))).map(Number).sort((a, b) => a - b);
    fillSelect("yearFrom", years.map((y) => [String(y)]));
    fillSelect("yearTo", years.map((y) => [String(y)]));
  }

  function state() {
    const s = { q: $("q").value.trim() };
    for (const id of SELECTS) s[id] = $(id).value;
    for (const f of FLAGS) s[f] = flags[f];
    return s;
  }

  function activeFilterCount() {
    const s = state();
    return SELECTS.filter((id) => id !== "sort" && s[id]).length + FLAGS.filter((f) => s[f]).length;
  }

  function apply({ keepPage = false } = {}) {
    const s = state();
    const terms = s.q.toLowerCase().split(/\s+/).filter(Boolean);
    const from = parseInt(s.yearFrom, 10);
    const to = parseInt(s.yearTo, 10);
    filtered = companies.filter((c, i) => {
      if (terms.length && !terms.every((t) => haystacks[i].includes(t))) return false;
      if (s.source && c.source !== s.source) return false;
      if (s.country && c.country !== s.country) return false;
      if (s.region && c.region !== s.region) return false;
      if (s.industry && !(c.tags || []).includes(s.industry)) return false;
      if (!Number.isNaN(from) || !Number.isNaN(to)) {
        const y = parseInt(c.year, 10);
        if (Number.isNaN(y)) return false;
        if (!Number.isNaN(from) && y < from) return false;
        if (!Number.isNaN(to) && y > to) return false;
      }
      if (flags.isUnicorn && !c.isUnicorn) return false;
      if (flags.isExit && !c.isExit) return false;
      if (flags.isBCorp && !c.isBCorp) return false;
      if (flags.hasFounders && !(c.founders || []).length) return false;
      return true;
    });
    sortFiltered(s.sort);
    const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    if (!keepPage) page = 0;
    page = Math.min(Math.max(0, page), pages - 1);
    const n = activeFilterCount();
    $("filters-count").hidden = n === 0;
    $("filters-count").textContent = String(n);
    render();
  }

  function sortFiltered(mode) {
    if (!mode) return;
    const yr = (c) => { const y = parseInt(c.year, 10); return Number.isNaN(y) ? null : y; };
    const byName = (a, b) => String(a.name || "").localeCompare(String(b.name || ""), undefined, { sensitivity: "base" });
    const byYear = (dir) => (a, b) => {
      const ya = yr(a), yb = yr(b);
      if (ya === null && yb === null) return 0;
      if (ya === null) return 1;
      if (yb === null) return -1;
      return dir * (ya - yb);
    };
    if (mode === "name-asc") filtered.sort(byName);
    if (mode === "name-desc") filtered.sort((a, b) => byName(b, a));
    if (mode === "year-asc") filtered.sort(byYear(1));
    if (mode === "year-desc") filtered.sort(byYear(-1));
  }

  // ── URL state (shareable links, back button) ────────────────────────────────
  function readUrl() {
    const p = new URLSearchParams(location.search);
    $("q").value = p.get("q") || "";
    for (const id of SELECTS) {
      const v = p.get(id) || "";
      const sel = $(id);
      sel.value = [...sel.options].some((o) => o.value === v) ? v : "";
    }
    for (const f of FLAGS) setFlag(f, p.get(f) === "1");
    page = Math.max(0, (parseInt(p.get("page"), 10) || 1) - 1);
  }

  function writeUrl(push) {
    const s = state();
    const p = new URLSearchParams();
    if (s.q) p.set("q", s.q);
    for (const id of SELECTS) if (s[id]) p.set(id, s[id]);
    for (const f of FLAGS) if (s[f]) p.set(f, "1");
    if (page > 0) p.set("page", String(page + 1));
    const qs = p.toString();
    const url = `${location.pathname}${qs ? `?${qs}` : ""}`;
    if (url === `${location.pathname}${location.search}`) return;
    history[push ? "pushState" : "replaceState"](null, "", url);
  }

  window.addEventListener("popstate", () => {
    readUrl();
    apply({ keepPage: true });
  });

  function setFlag(f, on) {
    flags[f] = on;
    const btn = document.querySelector(`.toggle[data-flag="${f}"]`);
    if (btn) btn.setAttribute("aria-pressed", on ? "true" : "false");
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  function pageSlice() {
    const start = page * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }

  function render() {
    const slice = pageSlice();
    const list = $("results");
    if (slice.length) {
      list.replaceChildren(...slice.map(card));
    } else {
      list.replaceChildren(h("div", { class: "loading" }, "No matches.", h("small", {}, "Try removing a filter or searching for something else.")));
    }
    renderPager();
    syncPageCheckbox();
    updateToolbar();
  }

  // Signed CDN URLs (e.g. Plug and Play logos) stop working after `Expires`;
  // skip the request and show the placeholder straight away.
  function expired(url) {
    const exp = Number(new URL(url).searchParams.get("Expires"));
    return exp > 0 && exp * 1000 < Date.now();
  }

  function logoPlaceholder(c) {
    return h("div", { class: "logo ph", "aria-hidden": "true" }, (c.name || "?").slice(0, 2).toUpperCase());
  }

  function card(c) {
    const key = c.__uid;
    const isSel = selected.has(key);
    const cb = h("input", { type: "checkbox", class: "cb", "aria-label": `Select ${c.name || "company"}` });
    cb.checked = isSel;
    cb.dataset.key = key;

    const logoUrl = safeUrl(c.logo);
    let logo = logoPlaceholder(c);
    if (logoUrl && !/\/missing\.png$/.test(logoUrl) && !expired(logoUrl)) {
      logo = h("img", { class: "logo", src: logoUrl, alt: "", loading: "lazy", decoding: "async", referrerpolicy: "no-referrer" });
      logo.addEventListener("error", () => logo.replaceWith(logoPlaceholder(c)), { once: true });
    }

    const title = extLink(c.website, c.name || "(unnamed)") || h("span", {}, c.name || "(unnamed)");
    const badges = [
      c.isUnicorn && h("span", { class: "badge b-uni" }, "🦄 Unicorn"),
      c.isExit && h("span", { class: "badge b-exit" }, "💰 Exit"),
      c.isBCorp && h("span", { class: "badge b-bcorp" }, "🌱 B Corp"),
      c.listed === false && h("span", { class: "badge b-delisted", title: `No longer on the ${sourceLabel(c.source)} portfolio page${c.delistedAt ? ` (since ${c.delistedAt})` : ""}` }, "No longer listed"),
    ];

    const founders = (c.founders || []).filter((f) => f && f.name).map((f) => {
      const label = f.role ? `${f.name} (${f.role})` : f.name;
      return extLink(f.linkedin, label, `${f.name} on LinkedIn`) || h("span", {}, label);
    });
    const founderLine = founders.length
      ? h("div", { class: "founders" }, "👤 ", ...founders.flatMap((f, i) => (i ? [" · ", f] : [f])))
      : null;

    const soc = c.social || {};
    const socialLinks = [
      extLink(soc.linkedin, "LinkedIn", `${c.name} on LinkedIn`),
      extLink(soc.twitter, "X", `${c.name} on X (Twitter)`),
      extLink(soc.crunchbase, "Crunchbase", `${c.name} on Crunchbase`),
    ].filter(Boolean);

    const place = [c.location, c.country && !String(c.location || "").includes(c.country) ? c.country : ""].filter(Boolean).join(", ");
    const meta = h("div", { class: "meta" },
      c.source && h("span", { class: "chip chip-src", title: sourceLabel(c.source) }, SOURCE_SHORT[c.source] || c.source),
      (c.alsoIn || []).map((s) => h("span", { class: "chip chip-also", title: `Also in the ${sourceLabel(s)} portfolio` }, `also ${SOURCE_SHORT[s] || s}`)),
      place && h("span", {}, `📍 ${place}`),
      c.year && h("span", { class: "chip" }, String(c.year)),
      c.program && h("span", { class: "chip" }, c.program),
      (c.tags || []).slice(0, 3).map((t) => h("span", { class: "chip" }, t)),
      socialLinks.length > 0 && h("span", { class: "social" }, socialLinks),
    );

    return h("article", { class: `card${isSel ? " selected" : ""}`, dataset: { key } },
      cb,
      logo,
      h("div", { class: "body" },
        h("div", { class: "name" }, title, (c.formerNames || []).length > 0 && h("span", { class: "formerly" }, `formerly ${c.formerNames.join(", ")}`), badges),
        c.description && h("div", { class: "desc" }, c.description),
        founderLine,
        meta,
      ),
    );
  }

  // One delegated listener for every card checkbox.
  $("results").addEventListener("change", (e) => {
    const cb = e.target.closest(".card .cb");
    if (!cb) return;
    const key = cb.dataset.key;
    if (cb.checked) selected.add(key); else selected.delete(key);
    cb.closest(".card").classList.toggle("selected", cb.checked);
    syncPageCheckbox();
    updateToolbar();
  });

  function syncPageCheckbox() {
    const slice = pageSlice();
    const all = slice.length > 0 && slice.every((c) => selected.has(c.__uid));
    const some = slice.some((c) => selected.has(c.__uid));
    const cb = $("cb-all");
    cb.checked = all;
    cb.indeterminate = some && !all;
  }

  $("cb-all").addEventListener("change", (e) => {
    for (const c of pageSlice()) {
      if (e.target.checked) selected.add(c.__uid); else selected.delete(c.__uid);
    }
    render();
  });

  // ── Toolbar ───────────────────────────────────────────────────────────────────
  function updateToolbar() {
    const n = selected.size;
    const label = $("sel-label");
    if (n > 0) label.replaceChildren(h("b", {}, n.toLocaleString()), ` ${n === 1 ? "company" : "companies"} selected`);
    else label.textContent = "Select all on page";
    $("count").textContent = `${plural(filtered.length, "company", "companies")} shown`;
    const hasData = n > 0 || filtered.length > 0;
    $("btn-csv").disabled = !hasData;
    $("btn-xl").disabled = !hasData;
    $("btn-clear").disabled = n === 0;
    const scope = n > 0 ? `${n.toLocaleString()} selected` : `all ${filtered.length.toLocaleString()} shown`;
    $("btn-csv").title = `Download ${scope} as CSV`;
    $("btn-xl").title = `Download ${scope} as Excel`;
  }

  $("btn-clear").addEventListener("click", () => { selected.clear(); render(); });

  // ── Export ────────────────────────────────────────────────────────────────────
  function exportData() {
    return selected.size > 0 ? companies.filter((c) => selected.has(c.__uid)) : filtered;
  }

  function toRows(data) {
    return data.map((c) => {
      const founders = (c.founders || []).filter((f) => f && f.name);
      return {
        Source: sourceLabel(c.source || ""),
        Name: c.name || "",
        Description: c.description || "",
        Website: c.website || "",
        Location: c.location || "",
        Country: c.country || "",
        Region: c.region || "",
        Subregion: c.subregion || "",
        Industries: (c.tags || []).join("; "),
        Year: c.year || "",
        Program: c.program || "",
        Founders: founders.map((f) => (f.role ? `${f.name} (${f.role})` : f.name)).join("; "),
        "Founder LinkedIn": founders.map((f) => f.linkedin).filter(Boolean).join("; "),
        "Investor / Acquirer": c.extra?.investor || "",
        IsExit: c.isExit ? "Yes" : "No",
        IsUnicorn: c.isUnicorn ? "Yes" : "No",
        IsBCorp: c.isBCorp ? "Yes" : "No",
        IsCurrentSession: c.isCurrentSession ? "Yes" : "No",
        LinkedIn: c.social?.linkedin || "",
        Twitter: c.social?.twitter || "",
        Facebook: c.social?.facebook || "",
        Crunchbase: c.social?.crunchbase || "",
        Logo: c.logo || "",
        "Also In": (c.alsoIn || []).map(sourceLabel).join("; "),
        "Still Listed": c.listed === false ? `No (since ${c.delistedAt || "?"})` : "Yes",
        ID: c.id || "",
      };
    });
  }

  // Cells starting with = + - @ are run as formulas by spreadsheet apps; the
  // data is scraped from third-party sites, so neutralize them.
  function csvCell(v) {
    let s = v == null ? "" : String(v);
    if (/^[=+\-@\t\r]/.test(s) && !/^-+$/.test(s.trim())) s = `'${s}`;
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }

  $("btn-csv").addEventListener("click", () => {
    const rows = toRows(exportData());
    if (!rows.length) return;
    const cols = Object.keys(rows[0]);
    const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(","))].join("\r\n");
    // BOM so Excel opens UTF-8 (accents, CJK names) correctly.
    download(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }), `startups-${fileLabel()}.csv`);
  });

  let sheetJsPromise = null;
  function loadSheetJs() {
    if (window.XLSX) return Promise.resolve(window.XLSX);
    if (!sheetJsPromise) {
      sheetJsPromise = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = SHEETJS;
        s.crossOrigin = "anonymous";
        s.referrerPolicy = "no-referrer";
        s.onload = () => (window.XLSX ? resolve(window.XLSX) : reject(new Error("SheetJS failed to initialise")));
        s.onerror = () => { sheetJsPromise = null; reject(new Error("Could not load the Excel library")); };
        document.head.append(s);
      });
    }
    return sheetJsPromise;
  }

  $("btn-xl").addEventListener("click", async () => {
    const btn = $("btn-xl");
    const rows = toRows(exportData());
    if (!rows.length) return;
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Preparing…";
    try {
      const XLSX = await loadSheetJs();
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      ws["!cols"] = [14, 30, 60, 30, 30, 18, 15, 18, 40, 8, 40, 50, 50, 25, 8, 10, 8, 15, 35, 35, 35, 35, 35, 18, 20, 28].map((w) => ({ wch: w }));
      XLSX.utils.book_append_sheet(wb, ws, "Startups");
      XLSX.writeFile(wb, `startups-${fileLabel()}.xlsx`);
    } catch (err) {
      alert(`${err.message}. You can still export as CSV.`);
    } finally {
      btn.textContent = original;
      updateToolbar();
    }
  });

  function fileLabel() {
    const s = state();
    const yr = s.yearFrom || s.yearTo ? `${s.yearFrom || "all"}-${s.yearTo || "now"}` : "";
    const parts = [s.q, s.source, s.country, s.region, yr, s.industry].filter(Boolean);
    const label = parts.join("-").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
    return label || "portfolio";
  }

  function download(blob, name) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // ── Pagination ─────────────────────────────────────────────────────────────────
  function renderPager() {
    const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    $("pager").hidden = filtered.length <= PER_PAGE;
    $("page-total").textContent = pages.toLocaleString();
    $("page-input").max = String(pages);
    $("page-input").value = String(page + 1);
    $("first").disabled = $("prev").disabled = page === 0;
    $("last").disabled = $("next").disabled = page >= pages - 1;
  }

  function goTo(p) {
    const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    const next = Math.min(Math.max(0, p), pages - 1);
    if (next === page) { renderPager(); return; }
    page = next;
    render();
    writeUrl(true);
    $("results").scrollIntoView({ block: "start" });
    $("results").focus({ preventScroll: true });
  }

  $("first").addEventListener("click", () => goTo(0));
  $("prev").addEventListener("click", () => goTo(page - 1));
  $("next").addEventListener("click", () => goTo(page + 1));
  $("last").addEventListener("click", () => goTo(Infinity));
  $("page-input").addEventListener("change", (e) => goTo((parseInt(e.target.value, 10) || 1) - 1));

  // ── Event wiring ──────────────────────────────────────────────────────────────
  let t;
  $("q").addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(() => { apply(); writeUrl(false); }, 150);
  });
  for (const id of SELECTS) $(id).addEventListener("change", () => { apply(); writeUrl(true); });
  document.querySelectorAll(".toggle").forEach((btn) => btn.addEventListener("click", () => {
    const f = btn.dataset.flag;
    setFlag(f, !flags[f]);
    apply();
    writeUrl(true);
  }));
  $("reset").addEventListener("click", () => {
    $("q").value = "";
    for (const id of SELECTS) $(id).value = "";
    for (const f of FLAGS) setFlag(f, false);
    apply();
    writeUrl(true);
  });
  $("filters-btn").addEventListener("click", () => {
    const open = $("filters").classList.toggle("open");
    $("filters-btn").setAttribute("aria-expanded", open ? "true" : "false");
  });

  load();
})();
