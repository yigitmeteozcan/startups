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
    sosv: "SOSV (HAX, IndieBio)", speedrun: "a16z speedrun", itucekirdek: "İTÜ Çekirdek",
    sparklabs: "SparkLabs", founderinstitute: "Founder Institute",
  };
  const SOURCE_SHORT = {
    techstars: "Techstars", yc: "YC", antler: "Antler", 500: "500",
    ef: "EF", alchemist: "Alchemist", plugandplay: "Plug and Play",
    sosv: "SOSV", speedrun: "speedrun", itucekirdek: "İTÜ Çekirdek",
    sparklabs: "SparkLabs", founderinstitute: "FI",
  };
  // 1500000 -> "$1.5M"
  const money = (n) => {
    const v = Number(n);
    if (!(v > 0)) return "";
    const short = (x) => (x >= 10 ? Math.round(x) : Math.round(x * 10) / 10);
    if (v >= 1e9) return `$${short(v / 1e9)}B`;
    if (v >= 1e6) return `$${short(v / 1e6)}M`;
    return `$${Math.round(v / 1e3)}K`;
  };
  const FLAGS = ["isUnicorn", "isExit", "isBCorp", "hasFounders", "isHiring", "isNew"];
  const SELECTS = ["source", "country", "region", "industry", "status", "yearFrom", "yearTo", "sort"];

  let companies = [];
  let view = "list";      // "list" | "globe"
  let place = "";         // geo.json point key, e.g. "us/san-francisco"
  let geo = null;         // data/geo.json
  let idToPoint = null;   // company id -> geo point
  let haystacks = [];
  let filtered = [];
  let page = 0;
  const selected = new Set();
  const flags = { isUnicorn: false, isExit: false, isBCorp: false, hasFounders: false, isHiring: false, isNew: false };
  // "New" = first seen in its source portfolio within NEW_DAYS of the data date.
  const NEW_DAYS = 30;
  let newCutoff = "9999";
  const isNew = (c) => !!c.firstSeen && c.firstSeen >= newCutoff;
  const STATUS_LABELS = { active: "Active", acquired: "Acquired", public: "Public (IPO)", inactive: "Inactive" };

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
      if (place || view === "globe") await ensureGeo().catch(() => {});
      apply({ keepPage: true });
      showView(view);
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
      stat(s?.unicorns ?? count((c) => c.isUnicorn), "unicorns"),
      stat(s?.exits ?? count((c) => c.isExit), "exits"),
      stat(s?.founders ?? companies.reduce((n, c) => n + (c.founders || []).length, 0), "founder profiles"),
      stat(Object.keys(s?.bySource || {}).length || new Set(companies.map((c) => c.source)).size, "sources"),
    );
    if (s?.generatedAt) $("updated").textContent = `Updated ${s.generatedAt.slice(0, 10)} · `;
    const asOf = Date.parse(s?.generatedAt || "") || Date.now();
    newCutoff = new Date(asOf - NEW_DAYS * 86400000).toISOString().slice(0, 10);
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
    const statuses = counts((c) => c.status);
    fillSelect("status", ["active", "acquired", "public", "inactive"].filter((v) => statuses.has(v)).map((v) => [v, statuses.get(v)]), (v) => STATUS_LABELS[v] || v);
    $("status-field").hidden = statuses.size === 0;
    // Toggles for data a source may not have yet stay hidden until it does.
    document.querySelector('.toggle[data-flag="isHiring"]').hidden = !companies.some((c) => c.isHiring);
    document.querySelector('.toggle[data-flag="isNew"]').hidden = !companies.some(isNew);
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
    return SELECTS.filter((id) => id !== "sort" && s[id]).length + FLAGS.filter((f) => s[f]).length + (place ? 1 : 0);
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
      if (s.status && c.status !== s.status) return false;
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
      if (flags.isHiring && !c.isHiring) return false;
      if (flags.isNew && !isNew(c)) return false;
      if (place && idToPoint) {
        const pt = idToPoint.get(c.id);
        if (!pt || pt.key !== place) return false;
      }
      return true;
    });
    sortFiltered(s.sort);
    const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
    if (!keepPage) page = 0;
    page = Math.min(Math.max(0, page), pages - 1);
    const n = activeFilterCount();
    $("filters-count").hidden = n === 0;
    $("filters-count").textContent = String(n);
    const pill = $("place-pill");
    const pt = place && geo ? geo.points.find((x) => x.key === place) : null;
    pill.hidden = !pt;
    pill.textContent = pt ? pt.place : "";
    render();
    if (view === "globe") updateGlobe();
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
    view = p.get("view") === "globe" ? "globe" : "list";
    place = (p.get("place") || "").slice(0, 120);
  }

  function writeUrl(push) {
    const s = state();
    const p = new URLSearchParams();
    if (s.q) p.set("q", s.q);
    for (const id of SELECTS) if (s[id]) p.set(id, s[id]);
    for (const f of FLAGS) if (s[f]) p.set(f, "1");
    if (place) p.set("place", place);
    if (view === "globe") p.set("view", "globe");
    if (page > 0) p.set("page", String(page + 1));
    const qs = p.toString();
    const url = `${location.pathname}${qs ? `?${qs}` : ""}`;
    if (url === `${location.pathname}${location.search}`) return;
    history[push ? "pushState" : "replaceState"](null, "", url);
  }

  window.addEventListener("popstate", async () => {
    readUrl();
    if (place || view === "globe") await ensureGeo().catch(() => {});
    apply({ keepPage: true });
    showView(view);
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

  // YC lists open roles at <company page>/jobs.
  function hiringBadge(c) {
    const page = safeUrl(c.sourceUrl);
    const jobs = page && /^https:\/\/www\.ycombinator\.com\/companies\/[^/?#]+$/.test(page) ? `${page}/jobs` : "";
    return jobs
      ? h("a", { class: "badge b-hiring", href: jobs, target: "_blank", rel: "noopener noreferrer", title: `Open roles at ${c.name}` }, "Hiring →")
      : h("span", { class: "badge b-hiring" }, "Hiring");
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
      c.isUnicorn && h("span", { class: "badge b-uni" }, "Unicorn"),
      isNew(c) && h("span", { class: "badge b-new", title: `First seen ${c.firstSeen}` }, "New"),
      c.isExit && h("span", { class: "badge b-exit" }, c.status === "public" ? "Public" : c.status === "acquired" ? "Acquired" : "Exit"),
      c.status === "inactive" && h("span", { class: "badge b-delisted", title: `${sourceLabel(c.source)} lists this company as inactive` }, "Inactive"),
      c.isHiring && hiringBadge(c),
      c.topCompany && h("span", { class: "badge b-top", title: "On Y Combinator's list of top companies" }, "Top YC"),
      c.isBCorp && h("span", { class: "badge b-bcorp" }, "B Corp"),
      c.listed === false && h("span", { class: "badge b-delisted", title: `No longer on the ${sourceLabel(c.source)} portfolio page${c.delistedAt ? ` (since ${c.delistedAt})` : ""}` }, "No longer listed"),
    ];

    // Founders: photo, name (role) and every public profile link we have.
    const founders = (c.founders || []).filter((f) => f && f.name).map((f) => {
      const avatarUrl = safeUrl(f.avatar);
      let avatar = null;
      if (avatarUrl) {
        avatar = h("img", { class: "f-avatar", src: avatarUrl, alt: "", loading: "lazy", decoding: "async", referrerpolicy: "no-referrer" });
        avatar.addEventListener("error", () => avatar.remove(), { once: true });
      }
      const links = [
        extLink(f.linkedin, "LinkedIn", `${f.name} on LinkedIn`),
        extLink(f.twitter, "X", `${f.name} on X`),
        extLink(f.github, "GitHub", `${f.name} on GitHub`),
        extLink(f.website, "Web", `${f.name}'s website`),
      ].filter(Boolean);
      return h("span", { class: "founder", title: f.bio || null },
        avatar,
        h("span", { class: "f-name" }, f.name),
        (f.role || f.active === false) && h("span", { class: "f-role" }, ` (${[f.role, f.active === false && "former"].filter(Boolean).join(", ")})`),
        links.length > 0 && h("span", { class: "f-links" }, links));
    });
    const founderLine = founders.length ? h("div", { class: "founders" }, founders) : null;

    const soc = c.social || {};
    const socialLinks = [
      extLink(soc.linkedin, "LinkedIn", `${c.name} on LinkedIn`),
      extLink(soc.twitter, "X", `${c.name} on X (Twitter)`),
      extLink(soc.crunchbase, "Crunchbase", `${c.name} on Crunchbase`),
    ].filter(Boolean);

    // Locations like "San Francisco, CA, USA" already name the country.
    const loc = String(c.location || "");
    const place = loc && (loc.includes(",") || !c.country || loc.includes(c.country)) ? loc : [loc, c.country].filter(Boolean).join(", ");
    const meta = h("div", { class: "meta" },
      c.source && h("span", { class: "chip chip-src", title: sourceLabel(c.source) }, SOURCE_SHORT[c.source] || c.source),
      (c.alsoIn || []).map((s) => h("span", { class: "chip chip-also", title: `Also in the ${sourceLabel(s)} portfolio` }, `also ${SOURCE_SHORT[s] || s}`)),
      place && h("span", {}, place),
      c.teamSize
        ? h("span", { class: "chip", title: "Team size" }, `${Number(c.teamSize).toLocaleString()} ${c.teamSize === 1 ? "person" : "people"}`)
        : c.teamSizeRange && h("span", { class: "chip", title: "Team size" }, `${c.teamSizeRange} people`),
      c.stage && !/^(exit|exited)$/i.test(c.stage) && !(c.source === "yc" && c.stage === "Early") && h("span", { class: "chip", title: "Stage" }, c.stage),
      money(c.totalRaised) && h("span", { class: "chip", title: "Total raised, as reported by the source" }, `${money(c.totalRaised)} raised`),
      c.year && h("span", { class: "chip" }, String(c.year)),
      c.program && c.program !== sourceLabel(c.source) && c.program !== SOURCE_SHORT[c.source] && h("span", { class: "chip" }, c.program),
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
        "Founder X": founders.map((f) => f.twitter).filter(Boolean).join("; "),
        "Founder GitHub": founders.map((f) => f.github).filter(Boolean).join("; "),
        "Founder Websites": founders.map((f) => f.website).filter(Boolean).join("; "),
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
        Status: STATUS_LABELS[c.status] || "",
        "Team Size": c.teamSize || "",
        Hiring: c.isHiring == null ? "" : c.isHiring ? "Yes" : "No",
        Stage: c.stage || "",
        "First Seen": c.firstSeen || "",
        "Team Size Range": c.teamSizeRange || "",
        "Total Raised (USD)": c.totalRaised || "",
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
    const original = [...btn.childNodes].map((n) => n.cloneNode(true));
    btn.disabled = true;
    btn.textContent = "Preparing…";
    try {
      const XLSX = await loadSheetJs();
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      ws["!cols"] = [14, 30, 60, 30, 30, 18, 15, 18, 40, 8, 40, 50, 50, 40, 40, 40, 25, 8, 10, 8, 15, 35, 35, 35, 35, 35, 18, 20, 14, 10, 8, 9, 12, 12, 14, 28].map((w) => ({ wch: w }));
      XLSX.utils.book_append_sheet(wb, ws, "Startups");
      XLSX.writeFile(wb, `startups-${fileLabel()}.xlsx`);
    } catch (err) {
      alert(`${err.message}. You can still export as CSV.`);
    } finally {
      btn.replaceChildren(...original);
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
    $("pager").hidden = view === "globe" || filtered.length <= PER_PAGE;
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

  // ── Globe ───────────────────────────────────────────────────────────────────
  // data/geo.json groups company ids by place (city, or country centre when the
  // city is unknown). globe.gl is self-hosted and loaded only on first use.
  let geoPromise = null;
  let globe = null;
  let globePromise = null;
  let selectedKey = "";
  let globePoints = [];

  function ensureGeo() {
    if (!geoPromise) {
      geoPromise = getJson("geo.json").then((g) => {
        geo = g;
        idToPoint = new Map();
        for (const pt of g.points) for (const id of pt.ids) idToPoint.set(id, pt);
        return g;
      });
      geoPromise.catch(() => { geoPromise = null; });
    }
    return geoPromise;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error(`Could not load ${src}`));
      document.head.append(s);
    });
  }

  function webglAvailable() {
    try {
      const c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (_) {
      return false;
    }
  }

  // Tooltip text is rendered as HTML by globe.gl, so escape everything.
  const escHtml = (v) => String(v).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

  // Paperfinch palette: paper countries on a blue desk, ink bars for cities,
  // accent bars for country centres, amber for the selected place.
  const POV_HOME = { lat: 28, lng: -40, altitude: 2.3 };
  const INK = "#111318";
  const ACCENT = "#4f5dff";
  const SELECTED = "#fab219";
  const isoOf = (key) => String(key || "").split("/")[0];
  const shortPlace = (p) => (p.precision === "city" ? p.place.split(", ")[0] : p.place);
  let countryShapes = null;            // GeoJSON features (Natural Earth 110m)
  let isoCounts = new Map();           // "jp" -> startups in the current filter
  let hoverIso = "";

  // Same-origin fetch; on failure the globe falls back to the satellite texture.
  function loadCountryShapes() {
    return fetch("vendor/countries-110m.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((g) => (g && Array.isArray(g.features) ? g.features : null))
      .catch(() => null);
  }

  const shapeIso = (f) => String((f && f.properties && f.properties.iso2) || "").toLowerCase();

  // Mix paper -> periwinkle by how many startups a country has.
  function capColor(f) {
    const iso = shapeIso(f);
    if (iso && iso === hoverIso) return "#ffffff";
    const n = isoCounts.get(iso) || 0;
    if (!n) return "#e6e5de";
    const max = Math.max(1, ...isoCounts.values());
    const t = Math.min(1, Math.log10(n + 1) / Math.log10(max + 1));
    const mix = (a, b) => Math.round(a + (b - a) * t * 0.85);
    return `rgb(${mix(247, 165)}, ${mix(246, 173)}, ${mix(242, 255)})`;
  }

  function polygonTip(f) {
    const iso = shapeIso(f);
    const n = isoCounts.get(iso) || 0;
    const name = (f.properties && f.properties.name) || "";
    return `<b>${escHtml(name)}</b><br>` +
      (n ? `${n.toLocaleString()} startup${n === 1 ? "" : "s"}<br><small>Click to filter by this country</small>` : "<small>No startups in the current filter</small>");
  }

  const pointAlt = (d) => 0.014 + Math.min(0.22, Math.log10(d.count + 1) * 0.055);

  // Paper name tags for the biggest places, pinned to the top of their bar.
  // Phones get a wider view of the globe and fewer tags.
  const narrow = () => $("globe").clientWidth < 560;
  const homePov = () => ({ ...POV_HOME, altitude: narrow() ? 3.3 : POV_HOME.altitude });

  // Only tag places well on the visible side, not ones peeking over the rim.
  function facing(elm) {
    if (!globe) return true;
    const pov = globe.pointOfView();
    const r = Math.PI / 180;
    const a = Number(elm.dataset.lat) * r;
    const b = pov.lat * r;
    const dl = (Number(elm.dataset.lng) - pov.lng) * r;
    return Math.sin(a) * Math.sin(b) + Math.cos(a) * Math.cos(b) * Math.cos(dl) > (narrow() ? 0.62 : 0.4);
  }

  function placeTag(d) {
    const wrap = h("div", { class: "gl-tag" });
    wrap.dataset.lat = String(d.lat);
    wrap.dataset.lng = String(d.lng);
    const tag = h("button", { type: "button", class: "gl-chip", title: d.place },
      h("span", {}, shortPlace(d)), h("b", {}, d.count.toLocaleString()));
    tag.addEventListener("click", (e) => { e.stopPropagation(); selectPlace(d.key, { fly: true }); });
    wrap.append(tag);
    return wrap;
  }

  // A few readable labels: the biggest places, skipping ones too close to an
  // already-labelled place so they don't overlap.
  function pickLabels(points) {
    const out = [];
    for (const p of points) {
      if (out.length >= (narrow() ? 5 : 10)) break;
      if (out.some((q) => Math.abs(q.lat - p.lat) < 9 && Math.abs(q.lng - p.lng) < 24)) continue;
      out.push(p);
    }
    return out;
  }

  function resizeGlobe() {
    if (!globe) return;
    const el = $("globe");
    if (el.clientWidth && el.clientHeight) globe.width(el.clientWidth).height(el.clientHeight);
  }

  function setSpin(on) {
    if (globe) globe.controls().autoRotate = on;
    $("gt-spin").setAttribute("aria-pressed", on ? "true" : "false");
  }

  function ensureGlobe() {
    if (globePromise) return globePromise;
    const status = $("globe-status");
    status.hidden = false;
    status.textContent = "Loading globe…";
    globePromise = (async () => {
      const [, shapes] = await Promise.all([ensureGeo(), loadCountryShapes()]);
      if (!webglAvailable()) throw new Error("Your browser can't show the 3D globe (WebGL is off). The list of places on the right still works.");
      if (!window.Globe) await loadScript("vendor/globe.gl.min.js");
      const el = $("globe");
      globe = window.Globe({ animateIn: true })(el)
        .backgroundColor("rgba(0,0,0,0)")
        .showAtmosphere(true)
        .atmosphereColor("#9aa3ff")
        .atmosphereAltitude(0.16)
        .pointLat("lat")
        .pointLng("lng")
        .pointAltitude(pointAlt)
        .pointRadius((d) => Math.min(0.75, 0.18 + Math.sqrt(d.count) * 0.012))
        .pointColor((d) => (d.key === selectedKey ? SELECTED : d.precision === "city" ? INK : ACCENT))
        .pointLabel((d) =>
          `<b>${escHtml(d.place)}</b><br>${d.count.toLocaleString()} startup${d.count === 1 ? "" : "s"}` +
          (d.precision === "country" ? "<br><small>City unknown — shown at the country centre</small>" : ""))
        .onPointClick((d) => selectPlace(d.key, { fly: true }))
        .onPointHover((d) => { el.style.cursor = d ? "pointer" : ""; })
        .htmlLat("lat")
        .htmlLng("lng")
        .htmlAltitude(pointAlt)
        .htmlElement(placeTag)
        .htmlTransitionDuration(0)
        .htmlElementVisibilityModifier((elm, visible) => elm.classList.toggle("off", !visible || !facing(elm)))
        .width(el.clientWidth)
        .height(el.clientHeight);
      if (shapes) {
        countryShapes = shapes;
        const mat = globe.globeMaterial();
        mat.color.set("#2536c8");
        if (mat.emissive) mat.emissive.set("#0d1670");
        if ("shininess" in mat) mat.shininess = 6;
        globe
          .polygonsData(shapes)
          .polygonAltitude(0.008)
          .polygonCapColor(capColor)
          .polygonSideColor(() => "rgba(17,28,134,.85)")
          .polygonStrokeColor(() => "rgba(17,19,24,.22)")
          .polygonLabel(polygonTip)
          .polygonsTransitionDuration(200)
          .onPolygonHover((f) => {
            hoverIso = f ? shapeIso(f) : "";
            el.style.cursor = f && isoCounts.get(hoverIso) ? "pointer" : "";
            globe.polygonCapColor(capColor).polygonAltitude((g) => (hoverIso && shapeIso(g) === hoverIso ? 0.016 : 0.008));
          })
          .onPolygonClick((f) => selectCountry(shapeIso(f)));
      } else {
        globe.globeImageUrl("vendor/earth-dark.jpg");
      }
      globe.pointOfView(homePov(), 0);
      const controls = globe.controls();
      controls.autoRotateSpeed = 0.35;
      setSpin(true);
      controls.addEventListener("start", () => setSpin(false));
      if (window.ResizeObserver) new ResizeObserver(resizeGlobe).observe(el);
      else window.addEventListener("resize", resizeGlobe);
      status.hidden = true;
      return globe;
    })();
    globePromise.catch((err) => {
      status.hidden = false;
      status.textContent = err.message;
      globePromise = null;
    });
    return globePromise;
  }

  // Aggregate the currently filtered companies per place.
  function placeCounts() {
    const byKey = new Map();
    let unplaced = 0;
    for (const c of filtered) {
      const pt = idToPoint && idToPoint.get(c.id);
      if (!pt) { unplaced++; continue; }
      const e = byKey.get(pt.key) || { key: pt.key, place: pt.place, country: pt.country, lat: pt.lat, lng: pt.lng, precision: pt.precision, count: 0 };
      e.count++;
      byKey.set(pt.key, e);
    }
    return { points: [...byKey.values()].sort((a, b) => b.count - a.count), unplaced };
  }

  function updateGlobe() {
    if (!geo) {
      ensureGeo().then(updateGlobe, () => {
        $("globe-status").hidden = false;
        $("globe-status").textContent = "Couldn't load the map data.";
      });
      return;
    }
    const { points, unplaced } = placeCounts();
    globePoints = points;
    isoCounts = new Map();
    for (const p of points) isoCounts.set(isoOf(p.key), (isoCounts.get(isoOf(p.key)) || 0) + p.count);
    if (globe) {
      globe.pointsData(points).htmlElementsData(pickLabels(points));
      if (countryShapes) globe.polygonCapColor(capColor);
    }
    if (selectedKey && points.some((p) => p.key === selectedKey)) selectPlace(selectedKey);
    else renderOverview(points, unplaced);
  }

  // Click a country: filter everything (list, stats, globe) to it.
  function selectCountry(iso) {
    if (!iso || !isoCounts.get(iso) || !geo) return;
    const pt = geo.points.find((p) => isoOf(p.key) === iso && p.country);
    const name = pt && pt.country;
    const sel = $("country");
    if (!name || ![...sel.options].some((o) => o.value === name)) return;
    sel.value = name;
    place = "";
    selectedKey = "";
    apply();
    writeUrl(true);
    flyToCountry(iso);
  }

  function flyToCountry(iso) {
    const pts = globePoints.filter((p) => isoOf(p.key) === iso);
    if (!globe || !pts.length) return;
    const n = pts.reduce((s, p) => s + p.count, 0);
    const lat = pts.reduce((s, p) => s + p.lat * p.count, 0) / n;
    const lng = pts.reduce((s, p) => s + p.lng * p.count, 0) / n;
    setSpin(false);
    globe.pointOfView({ lat, lng, altitude: 1.4 }, 900);
  }

  function renderOverview(points, unplaced) {
    selectedKey = "";
    const total = points.reduce((n, p) => n + p.count, 0);
    const cf = $("country").value;
    $("gp-title").textContent = cf ? `Startups in ${cf}` : "Startups around the world";
    $("gp-sub").textContent =
      `${total.toLocaleString()} startup${total === 1 ? "" : "s"} in ${points.length.toLocaleString()} place${points.length === 1 ? "" : "s"}` +
      (unplaced ? ` · ${unplaced.toLocaleString()} without a known location` : "") +
      (cf ? "." : ". Click a country to filter, or a bar to see who is there.");
    const rows = [];
    if (cf) {
      const all = h("button", { type: "button", class: "gp-place gp-back" }, h("span", {}, "← All countries"), h("span", {}, ""));
      all.addEventListener("click", () => {
        $("country").value = "";
        place = "";
        apply();
        writeUrl(true);
        if (globe) globe.pointOfView(homePov(), 900);
      });
      rows.push(all);
    }
    const top = points.slice(0, 15);
    const max = top.length ? top[0].count : 1;
    for (const p of top) {
      const bar = h("i", { class: "gp-bar" });
      bar.style.width = `${Math.max(2, Math.round((p.count / max) * 100))}%`;
      const b = h("button", { type: "button", class: "gp-place" }, h("span", {}, p.place), h("span", {}, p.count.toLocaleString()), bar);
      b.addEventListener("click", () => selectPlace(p.key, { fly: true }));
      rows.push(b);
    }
    $("gp-places").replaceChildren(...rows);
    $("gp-list").replaceChildren();
    $("gp-show").hidden = true;
    if (globe) globe.pointsData(globePoints);
  }

  function selectPlace(key, { fly = false } = {}) {
    const pt = globePoints.find((p) => p.key === key);
    if (!pt) return;
    selectedKey = key;
    const here = filtered.filter((c) => { const g = idToPoint.get(c.id); return g && g.key === key; });
    $("gp-title").textContent = pt.place;
    $("gp-sub").textContent =
      `${here.length.toLocaleString()} startup${here.length === 1 ? "" : "s"}` +
      (pt.precision === "country" ? " · city unknown, shown at the country centre" : "");
    const back = h("button", { type: "button", class: "gp-place gp-back" }, h("span", {}, "← All places"), h("span", {}, ""));
    back.addEventListener("click", () => { renderOverview(globePoints, placeCounts().unplaced); });
    $("gp-places").replaceChildren(back);
    $("gp-list").replaceChildren(
      ...here.slice(0, 40).map((c) => {
        const href = safeUrl(c.website);
        const body = [c.name, h("small", {}, [SOURCE_SHORT[c.source] || c.source, c.year, c.description].filter(Boolean).join(" · "))];
        return href
          ? h("a", { class: "gp-co", href, target: "_blank", rel: "noopener noreferrer" }, ...body)
          : h("div", { class: "gp-co" }, ...body);
      })
    );
    const show = $("gp-show");
    show.hidden = false;
    show.textContent = here.length > 40 ? `Show all ${here.length.toLocaleString()} in the list →` : "Show in the list →";
    if (globe) {
      globe.pointsData(globePoints);
      if (fly) {
        setSpin(false);
        globe.pointOfView({ lat: pt.lat, lng: pt.lng, altitude: 1.2 }, 900);
      }
    }
  }

  function showView(v) {
    view = v === "globe" ? "globe" : "list";
    $("view-list").setAttribute("aria-pressed", view === "list" ? "true" : "false");
    $("view-globe").setAttribute("aria-pressed", view === "globe" ? "true" : "false");
    $("globe-view").hidden = view !== "globe";
    $("results").hidden = view === "globe";
    $("cb-all").closest(".toolbar-left").style.visibility = view === "globe" ? "hidden" : "";
    $("pager").hidden = view === "globe" || filtered.length <= PER_PAGE;
    if (view === "globe") {
      ensureGlobe().then(() => {
        resizeGlobe();
        updateGlobe();
      }, () => updateGlobe());
    }
  }

  $("view-list").addEventListener("click", () => { showView("list"); writeUrl(true); });
  $("view-globe").addEventListener("click", () => {
    showView("globe");
    writeUrl(true);
    $("globe-view").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  $("gp-show").addEventListener("click", () => {
    place = selectedKey;
    showView("list");
    apply();
    writeUrl(true);
    $("results").scrollIntoView({ block: "start" });
  });
  $("place-pill").addEventListener("click", () => {
    place = "";
    apply();
    writeUrl(true);
  });

  // Globe toolbar: zoom, reset, auto-rotate, full screen.
  function zoomBy(f) {
    if (!globe) return;
    const p = globe.pointOfView();
    setSpin(false);
    globe.pointOfView({ lat: p.lat, lng: p.lng, altitude: Math.min(4.5, Math.max(0.3, p.altitude * f)) }, 450);
  }
  $("gt-in").addEventListener("click", () => zoomBy(0.65));
  $("gt-out").addEventListener("click", () => zoomBy(1.5));
  $("gt-reset").addEventListener("click", () => { if (globe) globe.pointOfView(homePov(), 900); });
  $("gt-spin").addEventListener("click", () => setSpin($("gt-spin").getAttribute("aria-pressed") !== "true"));
  // Real full screen where the browser allows it; otherwise (iPhone Safari) a
  // fixed overlay that Escape or the same button closes.
  function setOverlay(on) {
    $("globe-wrap").classList.toggle("is-full", on);
    document.documentElement.classList.toggle("no-scroll", on);
    $("gt-full").setAttribute("aria-pressed", on ? "true" : "false");
  }
  $("gt-full").addEventListener("click", () => {
    const wrap = $("globe-wrap");
    if (document.fullscreenElement) document.exitFullscreen();
    else if (wrap.classList.contains("is-full")) setOverlay(false);
    else if (wrap.requestFullscreen) wrap.requestFullscreen().catch(() => setOverlay(true));
    else setOverlay(true);
  });
  document.addEventListener("fullscreenchange", () => {
    $("gt-full").setAttribute("aria-pressed", document.fullscreenElement ? "true" : "false");
    resizeGlobe();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && $("globe-wrap").classList.contains("is-full")) setOverlay(false);
  });

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
    place = "";
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
