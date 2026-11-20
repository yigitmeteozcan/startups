// Small helpers for scrapers that read HTML: entity decoding and tag stripping.

const NAMED = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…',
  rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', laquo: '«', raquo: '»', middot: '·', bull: '•',
};

// "&amp;" / "&#8217;" / "&#x27;" -> the character. Unknown entities are left alone.
function decodeHtml(s) {
  return String(s == null ? '' : s).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m;
    }
    return NAMED[e.toLowerCase()] ?? m;
  });
}

// Visible text of an HTML fragment, on one line. Tags are removed before
// entities are decoded, so an encoded "&lt;b&gt;" stays text.
function htmlText(s) {
  return decodeHtml(String(s == null ? '' : s).replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = { decodeHtml, htmlText };
