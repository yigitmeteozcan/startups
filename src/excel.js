const ExcelJS = require('exceljs');

// XML 1.0 forbids most control characters; one stray \x0B in a scraped
// description makes Excel report the whole file as corrupt.
const XML_INVALID = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g;
// Excel's hard limit for a single cell.
const MAX_CELL = 32767;

function text(v) {
  const s = v == null ? '' : String(v).replace(XML_INVALID, '');
  return s.length > MAX_CELL ? s.slice(0, MAX_CELL) : s;
}

const yesNo = (b) => (b ? 'Yes' : 'No');

// Flatten a normalized company into a single spreadsheet row.
function toRow(c) {
  const d = c.extra || {};
  const founders = (c.founders || []).filter((f) => f && f.name);
  return {
    source: text(c.source),
    name: text(c.name),
    description: text(c.description),
    website: text(c.website),
    city: text(d.city),
    state: text(d.state_province),
    country: text(c.country || d.country),
    region: text(c.region),
    subregion: text(c.subregion),
    tags: text((c.tags || []).join(', ')),
    year: c.year || '',
    program: text(c.program),
    founders: text(founders.map((f) => (f.role ? `${f.name} (${f.role})` : f.name)).join('; ')),
    founderLinkedins: text(founders.map((f) => f.linkedin).filter(Boolean).join('; ')),
    investor: text(d.investor),
    isExit: yesNo(c.isExit),
    isUnicorn: yesNo(c.isUnicorn),
    isBCorp: yesNo(c.isBCorp),
    isCurrentSession: yesNo(c.isCurrentSession),
    linkedin: text(c.social?.linkedin),
    twitter: text(c.social?.twitter),
    facebook: text(c.social?.facebook),
    crunchbase: text(c.social?.crunchbase),
    logo: text(c.logo),
    alsoIn: text((c.alsoIn || []).join(', ')),
    listed: c.listed === false ? `No (since ${c.delistedAt || '?'})` : 'Yes',
    id: text(c.id),
  };
}

const COLUMNS = [
  { header: 'Source', key: 'source', width: 12 },
  { header: 'Company', key: 'name', width: 30 },
  { header: 'Description', key: 'description', width: 60 },
  { header: 'Website', key: 'website', width: 30 },
  { header: 'City', key: 'city', width: 20 },
  { header: 'State/Province', key: 'state', width: 18 },
  { header: 'Country', key: 'country', width: 20 },
  { header: 'Region', key: 'region', width: 14 },
  { header: 'Subregion', key: 'subregion', width: 16 },
  { header: 'Industry/Tags', key: 'tags', width: 35 },
  { header: 'Year', key: 'year', width: 8 },
  { header: 'Program', key: 'program', width: 35 },
  { header: 'Founders', key: 'founders', width: 40 },
  { header: 'Founder LinkedIn', key: 'founderLinkedins', width: 45 },
  { header: 'Investor / Acquirer', key: 'investor', width: 25 },
  { header: 'Exit?', key: 'isExit', width: 8 },
  { header: 'Unicorn ($1B)?', key: 'isUnicorn', width: 14 },
  { header: 'B Corp?', key: 'isBCorp', width: 10 },
  { header: 'Current Session?', key: 'isCurrentSession', width: 16 },
  { header: 'LinkedIn', key: 'linkedin', width: 35 },
  { header: 'Twitter', key: 'twitter', width: 30 },
  { header: 'Facebook', key: 'facebook', width: 35 },
  { header: 'Crunchbase', key: 'crunchbase', width: 40 },
  { header: 'Logo URL', key: 'logo', width: 50 },
  { header: 'Also In', key: 'alsoIn', width: 16 },
  { header: 'Still Listed?', key: 'listed', width: 20 },
  { header: 'ID', key: 'id', width: 30 },
];

// Build an ExcelJS workbook from a list of normalized companies.
function buildWorkbook(companies) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'startup-portfolios-api';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Portfolio', {
    views: [{ state: 'frozen', ySplit: 1 }], // freeze header row
  });
  sheet.columns = COLUMNS;

  // Style the header row.
  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  header.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1A1A2E' },
  };
  header.alignment = { vertical: 'middle' };

  for (const c of companies) sheet.addRow(toRow(c));

  // Enable autofilter across all columns + the data range.
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: COLUMNS.length },
  };

  return workbook;
}

module.exports = { buildWorkbook, toRow, COLUMNS };
