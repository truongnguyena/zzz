export default async function handler(req, res) {
  try {
    const { type = 'dataset' } = req.query;
    const { BIGML_USERNAME, BIGML_API_KEY, BIGML_PROJECT } = process.env;
    if (!BIGML_USERNAME || !BIGML_API_KEY) {
      res.status(500).json({ error: 'Missing BIGML credentials' });
      return;
    }
    const cred = `username=${encodeURIComponent(BIGML_USERNAME)}&api_key=${encodeURIComponent(BIGML_API_KEY)}`;
    const project = BIGML_PROJECT ? `&project=${encodeURIComponent(BIGML_PROJECT)}` : '';
    const base = 'https://bigml.io/andromeda';
    const resource = type === 'dataset' ? 'dataset' : type === 'model' ? 'model' : type;
    const url = `${base}/${resource}?${cred}${project}`;
    const r = await fetch(url);
    if (!r.ok) {
      const txt = await r.text();
      res.status(r.status).send(txt);
      return;
    }
    const json = await r.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(json);
  } catch (e) {
    res.status(500).json({ error: e?.message || 'List failed' });
  }
}

export const config = { api: { bodyParser: false } };

