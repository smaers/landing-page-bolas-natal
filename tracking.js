// Vercel/Node serverless function for Melhor Envio tracking.
// Required environment variable: ME_TOKEN

const ALLOWED_ORIGIN = 'https://smaers.github.io';
const PROD_BASE = 'https://melhorenvio.com.br';

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { trackingNumber } = req.body || {};
    const token = process.env.ME_TOKEN;
    const code = String(trackingNumber || '').trim();

    if (!token) return res.status(503).json({ error: 'ME_TOKEN não configurado no backend.' });
    if (!code) return res.status(400).json({ error: 'trackingNumber obrigatório.' });

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'User-Agent': process.env.ME_USER_AGENT || 'Esferas Encantadas (lusudigital@gmail.com)',
    };

    // Pesquisa a etiqueta/pedido pelo código de rastreio.
    const searchUrl = `${PROD_BASE}/api/v2/me/orders/search?q=${encodeURIComponent(code)}`;
    const searchResponse = await fetch(searchUrl, { headers });
    const searchData = await searchResponse.json();
    if (!searchResponse.ok) return res.status(searchResponse.status).json(searchData);

    const result = Array.isArray(searchData) ? searchData[0] : (Array.isArray(searchData?.data) ? searchData.data[0] : null);
    if (!result) return res.status(404).json({ error: 'Código de rastreio não encontrado.' });

    const orderId = result.id || result.order_id;
    let events = [];

    if (orderId) {
      const trackingResponse = await fetch(`${PROD_BASE}/api/v2/me/shipment/tracking`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: [String(orderId)] }),
      });
      if (trackingResponse.ok) {
        const trackingData = await trackingResponse.json();
        events = trackingData?.[0]?.events || trackingData?.events || trackingData?.data?.[0]?.events || [];
      }
    }

    const latest = Array.isArray(events) && events.length ? events[events.length - 1] : null;
    const status = latest?.status || latest?.Status || result.status || result.shipment_status || 'Atualizado';
    const message = latest?.description || latest?.Description || latest?.message || result.message || '';

    return res.status(200).json({
      tracking: code,
      status,
      message,
      events,
      orderId: orderId || null,
    });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Erro ao consultar rastreio.' });
  }
}
