// Cross-source unicorn detection. Only the Techstars source exposes a $1B+
// flag, so the "unicorns" view was Techstars-only. Here we maintain a curated
// set of well-known unicorn/decacorn domains and flag any company (from any
// source) whose website matches. This is high-precision but not exhaustive —
// add domains here to extend coverage. Native source flags still apply on top.

const DOMAINS = new Set(
  [
    // Fintech
    'stripe.com', 'coinbase.com', 'brex.com', 'ramp.com', 'plaid.com', 'chime.com',
    'gusto.com', 'deel.com', 'rippling.com', 'mercury.com', 'razorpay.com', 'cred.club',
    'revolut.com', 'n26.com', 'monzo.com', 'klarna.com', 'wise.com', 'checkout.com',
    'gocardless.com', 'airwallex.com', 'nubank.com.br', 'nubank.com', 'ramp.com',
    'pinwheel.com', 'moderntreasury.com', 'mantl.com', 'pipe.com', 'bolt.com',
    'creditkarma.com', 'sofi.com', 'affirm.com', 'marqeta.com', 'flutterwave.com',
    // Dev tools / infra / data
    'gitlab.com', 'github.com', 'hashicorp.com', 'databricks.com', 'snowflake.com',
    'confluent.io', 'cockroachlabs.com', 'fivetran.com', 'dbt.com', 'getdbt.com',
    'temporal.io', 'render.com', 'vercel.com', 'netlify.com', 'planetscale.com',
    'supabase.com', 'retool.com', 'airbyte.com', 'grafana.com', 'postman.com',
    'sourcegraph.com', 'replit.com', 'docker.com', 'digitalocean.com', 'segment.com',
    'amplitude.com', 'mixpanel.com', 'launchdarkly.com', 'pagerduty.com',
    // AI
    'openai.com', 'anthropic.com', 'scale.com', 'huggingface.co', 'cohere.com',
    'mistral.ai', 'perplexity.ai', 'glean.com', 'jasper.ai', 'runwayml.com',
    'character.ai', 'together.ai', 'cerebras.net', 'adept.ai', 'imbue.com',
    // SaaS / productivity / collaboration
    'notion.so', 'airtable.com', 'figma.com', 'canva.com', 'miro.com', 'loom.com',
    'calendly.com', 'monday.com', 'asana.com', 'intercom.com', 'gong.io', 'lattice.com',
    'webflow.com', 'zapier.com', 'clickup.com', 'grammarly.com', 'discord.com',
    'twilio.com', 'sendbird.com', 'whatnot.com', 'gametime.co',
    // Marketplaces / commerce / consumer
    'airbnb.com', 'doordash.com', 'instacart.com', 'faire.com', 'gopuff.com',
    'getir.com', 'gorillas.io', 'grab.com', 'gojek.com', 'bukalapak.com', 'flipkart.com',
    'meesho.com', 'swiggy.com', 'zomato.com', 'ola.com', 'olacabs.com', 'rappi.com',
    'kavak.com', 'gympass.com', 'wildlifestudios.com', 'therealreal.com', 'reddit.com',
    'discord.com', 'whatnot.com', 'thirdlove.com', 'allbirds.com', 'glossier.com',
    'faire.com', 'shippo.com', 'flexport.com', 'convoy.com', 'shipbob.com',
    // Health / bio
    'rocompany.com', 'ro.co', 'cedar.com', 'devoted.com', 'cityblock.com',
    'commure.com', 'benchling.com', 'tempus.com', 'hingehealth.com', 'cerebral.com',
    // Security
    '1password.com', 'snyk.io', 'wiz.io', 'abnormalsecurity.com', 'material.security',
    'vanta.com', 'drata.com', 'socure.com', 'persona.com', 'checkr.com',
    // Other notable
    'gitpod.io', 'rappi.com', 'truebill.com', 'lev.co', 'mux.com',
  ].map((d) => d.toLowerCase())
);

function domainOf(website) {
  if (!website) return '';
  try {
    const u = website.startsWith('http') ? website : `https://${website}`;
    return new URL(u).hostname.replace(/^www\./, '').toLowerCase();
  } catch (_) {
    return '';
  }
}

function isKnownUnicorn(website) {
  const d = domainOf(website);
  return !!d && DOMAINS.has(d);
}

module.exports = { isKnownUnicorn, domainOf, DOMAINS };
