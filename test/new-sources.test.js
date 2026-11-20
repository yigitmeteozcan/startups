const test = require('node:test');
const assert = require('node:assert/strict');
const { parseCards, fetchItuCekirdek } = require('../src/sources/itucekirdek');
const { normalizeSosv } = require('../src/sources/sosv');
const { normalizeSpeedrun, nextData } = require('../src/sources/speedrun');
const { normalizeAlchemist } = require('../src/sources/alchemist');
const { normalizeYc } = require('../src/sources/yc');
const { finalizeCompanies } = require('../src/finalize');
const { decodeHtml, htmlText } = require('../src/html');

const ituCard = (name, sector, site) => `
  <div class="rounded-lg shadow-lg overflow-hidden relative group transition duration-300">
    <div class="p-6 text-center">
      <img src="https://girisimler.itucekirdek.com/storage/startup-logos/${name.toLowerCase()}.png" alt="${name}">
      <h3 class="text-xl font-bold">${name}</h3>
      <div class="tooltip mb-4"><p class="text-white/80">Makes &quot;smart&quot; things.</p></div>
      <div class="mb-4"><div class="text-sm font-medium text-white mb-2">Sector</div>
        <div class="flex flex-wrap"><span class="inline-flex">${sector}</span></div></div>
      <div class="flex items-center justify-center space-x-6 py-5">
        <a href="/cdn-cgi/l/email-protection#f1989f979e" class="text-white"></a>
        ${site ? `<a href="${site}" target="_blank" class="text-white"></a>` : ''}
      </div>
    </div>
  </div>`;
const ituPage = (...cards) => `<html><body>${cards.join('')}<nav><a href="https://twitter.com/itucekirdek" target="_blank">x</a></nav></body></html>`;

test('İTÜ Çekirdek cards: name, description, sector, website — never the email', () => {
  const cards = parseCards(ituPage(ituCard('Abidos', 'Transportation', 'https://www.abidos.com.tr/'), ituCard('Acrome', 'Robotics', '')));
  assert.equal(cards.length, 2);
  assert.deepEqual(cards[0], {
    name: 'Abidos', description: 'Makes "smart" things.', logo: 'https://girisimler.itucekirdek.com/storage/startup-logos/abidos.png',
    sectors: ['Transportation'], website: 'https://www.abidos.com.tr/', linkedin: '', twitter: '', facebook: '',
  });
  assert.equal(cards[1].website, '', 'the footer link after the last card is not taken as its website');
  assert.ok(!JSON.stringify(cards).includes('email'), 'no email collected');
});

test('İTÜ Çekirdek paging stops when the site repeats or runs out', async () => {
  const pages = { 1: ituPage(ituCard('A', 'X', 'https://a.com')), 2: ituPage(ituCard('B', 'Y', 'https://b.com')), 3: ituPage(ituCard('B', 'Y', 'https://b.com')) };
  const calls = [];
  const fetchFn = async (url) => {
    const n = Number(new URL(url).searchParams.get('page'));
    calls.push(n);
    return { ok: true, status: 200, text: async () => pages[n] || ituPage() };
  };
  const list = await fetchItuCekirdek({ fetchFn, maxPages: 10 });
  assert.deepEqual(list.map((c) => c.name), ['A', 'B']);
  assert.deepEqual(calls, [1, 2, 3]);
  const [a] = finalizeCompanies(list);
  assert.equal(a.country, 'Turkey');
  assert.equal(a.program, 'İTÜ Çekirdek');
});

test('SOSV: taxonomy ids become cohort, stage, location; Exit stage sets isExit', () => {
  const names = {
    tx_cohort: new Map([[1, 'HAX 2022']]),
    tx_category: new Map([[5, 'Climate Tech']]),
    tx_stage: new Map([[9, 'Exit'], [10, 'Accelerator']]),
    tx_location: new Map([[20, 'New Jersey'], [21, 'United States'], [22, 'Argentina']]),
    tx_program: new Map([[30, 'HAX']]),
  };
  const c = normalizeSosv({
    slug: 'still-bright', link: 'https://sosv.com/company/still-bright/', title: { rendered: 'Still Bright &#8211; Copper' },
    excerpt: { rendered: '<p>Long text […]</p>' },
    acf: { tagline: '', website: 'stillbright.com', linked_in: 'https://www.linkedin.com/company/sb', founded_year: '2019', employee_count_range: '2-10', total_capital_raised: '1' },
    tx_cohort: [1], tx_category: [5], tx_stage: [9, 10], tx_location: [20, 21, 22], tx_program: [30],
  }, names);
  assert.equal(c.name, 'Still Bright – Copper');
  assert.equal(c.description, 'Long text');
  assert.equal(c.website, 'https://stillbright.com');
  assert.equal(c.location, 'New Jersey, United States; Argentina');
  assert.equal(c.extra.country, 'United States');
  assert.equal(c.year, 2022, 'cohort year wins over founded year');
  assert.equal(c.program, 'HAX 2022');
  assert.equal(c.stage, 'Exit');
  assert.equal(c.isExit, true);
  assert.equal(c.totalRaised, null, 'placeholder amounts are ignored');
});

test('speedrun: detail page adds website, founders and socials; US states give the country', () => {
  const list = { slug: 'abl', name: 'Abliteration.ai', oneLiner: 'LLMs for security', industries: ['AI'], location: 'Palo Alto, California', cohort: 'SR007', logoUrl: 'https://cdn/x.jpg', teamSize: 2, faces: [{ name: 'Devon Thomas', photoUrl: 'https://cdn/d.jpg' }] };
  const detail = { ...list, websiteUrl: 'https://abliteration.ai/', foundedYear: 2026, linkedinUrl: 'https://linkedin.com/company/abl', xUrl: 'https://x.com/abl', founders: [{ name: 'Devon Thomas', title: 'CEO', linkedinUrl: 'https://linkedin.com/in/devon', photoUrl: 'https://cdn/d.jpg' }] };
  const [c] = finalizeCompanies([normalizeSpeedrun(list, detail)]);
  assert.equal(c.website, 'https://abliteration.ai/');
  assert.equal(c.program, 'a16z speedrun SR007');
  assert.equal(c.teamSize, 2);
  assert.equal(c.year, 2026);
  assert.equal(c.country, 'United States');
  assert.deepEqual(c.founders, [{ name: 'Devon Thomas', role: 'CEO', linkedin: 'https://linkedin.com/in/devon', avatar: 'https://cdn/d.jpg' }]);
  // Without a detail page the list data is kept.
  const [bare] = finalizeCompanies([normalizeSpeedrun(list, null)]);
  assert.equal(bare.founders[0].name, 'Devon Thomas');
  assert.throws(() => nextData('<html></html>'), /__NEXT_DATA__/);
});

test('Alchemist and YC extra fields', () => {
  const al = normalizeAlchemist({
    attributes: { name: 'Melurna' },
    meta: { status: 'Acquired', last_round_stage: 'Seed', nrofemployees: '1-10', startup_totalraise: 1500000, deck_link: 'https://drive.google.com/x', traction: 'secret' },
  }, {});
  assert.equal(al.status, 'acquired');
  assert.equal(al.isExit, true);
  assert.equal(al.stage, 'Seed');
  assert.equal(al.teamSizeRange, '1-10');
  assert.equal(al.totalRaised, 1500000);
  assert.ok(!JSON.stringify(al).includes('drive.google.com') && !JSON.stringify(al).includes('secret'), 'decks / traction are not collected');

  const yc = normalizeYc({ name: 'CopilotKit', former_names: ['TawkitAI', 'CopilotKit', ''], industries: [], regions: [] });
  assert.deepEqual(yc.formerNames, ['TawkitAI']);
});

test('html helpers', () => {
  assert.equal(decodeHtml('Caf&eacute; &amp; &#8216;x&#x2019; &bogus;'), 'Caf&eacute; & ‘x’ &bogus;');
  assert.equal(htmlText('<p>a &lt;b&gt;</p>\n<span> c </span>'), 'a <b> c');
});

test('SparkLabs: list cards plus company page details', () => {
  const { parseList, parseDetail, normalizeSparkLabs } = require('../src/sources/sparklabs');
  const list = parseList(`
    <li class="list-item border-bottom"><a href="https://www.sparklabs.co.kr/en/portfolio/bitsensing/">
      <img src="https://www.sparklabs.co.kr/en/data/file/portfolio/b.jpg" alt="Bitsensing"></a>
      <h6 class=""><b>Bitsensing</b></h6><span class="colored-span" style="x">AI</span>
      <p class="">Radar for autonomous driving, cut off mid-wo…</p></li>
    <li class="list-item border-bottom"><p>no link, skipped</p></li>`);
  assert.equal(list.length, 1);
  assert.equal(list[0].slug, 'bitsensing');
  const detail = parseDetail(`
    <meta name="description" content="Radar for autonomous driving, the full text.">
    <a class="tumblr" href="https://bitsensing.com/" target="_blank"></a>
    <a class="linkedin" href="https://www.linkedin.com/company/bitsensing/" target="_blank"></a>
    <div class="row"><div class="col-3"><div class="category_title">Category</div></div>
      <div class="col-7"><div style="x">AI</div></div></div>
    <div class="row"><div class="col-3"><div class="category_title">Status</div></div>
      <div class="col-6"><div style="x">Exit</div></div></div>
    <div class="row"><div class="col-3"><div class="category_title">Founded</div></div>
      <div class="col-6"><div style="x">2018</div></div></div>
    <div class="row"><div class="col-3"><div class="category_title">Location</div></div>
      <div class="col-6"><div style="x">Korea</div></div></div>
    <div class="row"><div class="col-3"><div class="category_title">CEO</div></div>
      <div class="col-6"><div style="x">Lee Jae-eun</div></div></div>
    <div class="row"><div class="col-3"><div class="category_title">Batch</div></div>
      <div class="col-6"><div style="x">14</div></div></div>`);
  const [c] = finalizeCompanies([normalizeSparkLabs(list[0], detail)]);
  assert.equal(c.description, 'Radar for autonomous driving, the full text.');
  assert.equal(c.website, 'https://bitsensing.com/');
  assert.equal(c.isExit, true);
  assert.equal(c.year, 2018);
  assert.equal(c.program, 'SparkLabs Batch 14');
  assert.equal(c.country, 'South Korea');
  assert.deepEqual(c.founders, [{ name: 'Lee Jae-eun', role: 'CEO', linkedin: '' }]);
});

test('Founder Institute graduates', () => {
  const { parseGraduates, normalizeFi } = require('../src/sources/founderinstitute');
  const card = (name, flag, status) => `<div class='w-full js-graduate-each'>
    <img class="object-contain object-left w-36" loading="lazy" src="https://fi-blobs/x" />
    ${status ? `<span class='rounded-full bg-acai-100'>${status}</span>` : ''}
    <img class="h-4" src="/assets/pages/flags/${flag}-aa8c12.svg" /><h3 class='font-bold'>${name}</h3></div>
    <span class='md:mt-1 font-medium'>Silicon Valley, US</span>
    <p class='md:mt-2 text-sm'>Does &amp; things.</p>
    <a class="md:mt-2" target="_blank" rel="nofollow" href="https://${name.toLowerCase()}.com"><span>Website</span></a>
    <span class='text-xs'>Founder(s)</span><p class='text-base'>Ann Lee, Bo Kim</p>`;
  const g = parseGraduates(card('Refactr', 'us', 'Acquired') + card('Esusu', 'us', ''));
  assert.equal(g.length, 2);
  const [a] = finalizeCompanies([normalizeFi(g[0])]);
  assert.equal(a.name, 'Refactr');
  assert.equal(a.description, 'Does & things.');
  assert.equal(a.website, 'https://refactr.com');
  assert.equal(a.country, 'United States');
  assert.equal(a.status, 'acquired');
  assert.equal(a.isExit, true);
  assert.deepEqual(a.founders.map((f) => f.name), ['Ann Lee', 'Bo Kim']);
});

test('SOSV team block -> founders with roles and links', () => {
  const { parseTeam, pickBatch } = require('../src/sources/sosv-team');
  const team = parseTeam(`
    <h2 class="single-company-section__title">Team</h2>
    <div class="single-company-team__item">
      <div class="single-company-team__item-image"><img src="https://res.cloudinary.com/sosv/a.jpg?_a=X" /></div>
      <h3 class="single-company-team__item-name">Samip  Desai</h3>
      <div class="single-company-team__item-position">CSO</div>
      <div class="single-company-team__item-social">
        <a target="_BLANK" href="https://www.linkedin.com/in/samipdesai1/?lipi=urn%3Ali" class="single-company-team__item-social-icon--linkedin"></a>
      </div>
    </div>
    <div class="single-company-team__item">
      <h3 class="single-company-team__item-name">Johann Sammy</h3>
      <div class="single-company-team__item-position">CEO</div>
      <div class="single-company-team__item-social">
        <a target="_BLANK" href="https://twitter.com/carbix2" class="single-company-team__item-social-icon--twitter"></a>
      </div>
    </div></section>`);
  assert.deepEqual(team, [
    { name: 'Samip Desai', role: 'CSO', linkedin: 'https://www.linkedin.com/in/samipdesai1/', avatar: 'https://res.cloudinary.com/sosv/a.jpg?_a=X' },
    { name: 'Johann Sammy', role: 'CEO', linkedin: '', twitter: 'https://twitter.com/carbix2' },
  ]);
  const cos = [
    { source: 'sosv', name: 'A', year: 2020, sourceUrl: 'https://sosv.com/company/a/' },
    { source: 'sosv', name: 'B', year: 2024, sourceUrl: 'https://sosv.com/company/b/' },
    { source: 'sosv', name: 'C', year: 2010, sourceUrl: 'https://sosv.com/company/c/' },
  ];
  const now = Date.parse('2026-11-20');
  assert.deepEqual(pickBatch(cos, { c: { checkedAt: '2026-11-01' } }, { now }).map((c) => c.name), ['B', 'A']);
});

test('EF tiles: current markup gives location and industries; hub city gives the country', () => {
  const { parseTiles, withHubCountry } = require('../src/sources/ef');
  const tile = `<div class="tile tile--company tile--company--featured"><div class="tile__link" data-companyname="Tractable" data-companyslug="tractable">Tractable</div>
    <div class="tile__tags text-xsml"><a class='locationtag' href='https://www.joinef.com/location/london/'>London</a><a class='categorytag' href='x'>Automotive &amp; Mobility</a><a class='categorytag' href='y'>Insurance</a></div>
    <div class="tile__description heading-xsml">AI for accident recovery.</div></div>`;
  const old = `<div class="tile tile--company"><div data-companyname="Old Co" data-companyslug="old"></div>
    <a class="locationtag" href="z"><span class="linkline">Paris</span></a><a class="categorytag" href="w"><span class="linkline">Fintech</span></a></div>`;
  const [t, o] = parseTiles(tile + old);
  assert.equal(t.location, 'London');
  assert.deepEqual(t.industries, ['Automotive & Mobility', 'Insurance']);
  assert.equal(o.location, 'Paris', 'older markup still parses');
  assert.deepEqual(o.industries, ['Fintech']);
  assert.equal(withHubCountry({ location: 'London', extra: {} }).extra.country, 'United Kingdom');
  assert.equal(withHubCountry({ location: 'Europe', extra: {} }).extra.country, undefined);
});

test('Antler cards: location, sector, year, website', () => {
  const { parseAntlerPage, normalizeAntler } = require('../src/sources/antler');
  const html = `<div role="listitem" class="w-dyn-item"><div class="portco_card"><img src="https://cdn/logo.svg" alt="3Square"/>
    <p fs-cmsfilter-field="name" class="u-text">3Square</p><p fs-cmsfilter-field="description" class="u-text">The Decision OS &amp; more.</p>
    <div fs-cmsfilter-field="UK" class="tag_small_wrap"><div fs-cmsfilter-field="location" class="tag_small_text">UK</div></div>
    <div fs-cmsfilter-field="sector" class="tag_small_wrap"><div fs-cmsfilter-field="location" class="tag_small_text">Enterprise Software &amp; SaaS</div></div>
    <div fs-cmsfilter-field="year" class="tag_small_wrap"><div fs-cmsfilter-field="location" class="tag_small_text">2026</div></div>
    <a target="_blank" href="https://www.3square.ai" class="clickable_link w-inline-block"></a></div></div>`;
  const [card] = parseAntlerPage(html);
  const [c] = finalizeCompanies([normalizeAntler(card)]);
  assert.equal(c.name, '3Square');
  assert.equal(c.description, 'The Decision OS & more.');
  assert.equal(c.country, 'United Kingdom');
  assert.deepEqual(c.tags, ['Enterprise Software & SaaS']);
  assert.equal(c.year, 2026);
  assert.equal(c.website, 'https://www.3square.ai');
});
