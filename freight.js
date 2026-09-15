// Vercel/Node serverless function for Melhor Envio.
// Required environment variables:
//   ME_TOKEN   -> OAuth access token from Melhor Envio
//   ORIGIN_CEP -> 88133600 (default below for this store)
// Optional:
//   ME_USER_AGENT -> e.g. "Esferas Encantadas (lusudigital@gmail.com)"

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
    const {
      recipientCep,
      shipmentInvoiceValue,
      quantity = 1,
      product = {},
      originCep,
    } = req.body || {};

    const token = process.env.ME_TOKEN;
    const sellerCep = String(process.env.ORIGIN_CEP || originCep || '88133600').replace(/\D/g, '');
    const destinationCep = String(recipientCep || '').replace(/\D/g, '');

    if (!token) return res.status(503).json({ error: 'ME_TOKEN não configurado no backend.' });
    if (sellerCep.length !== 8 || destinationCep.length !== 8) {
      return res.status(400).json({ error: 'CEP de origem ou destino inválido.' });
    }

    // Valores iniciais de embalagem para a cotação.
    // Ajuste no Vercel/env após definir as medidas reais do produto.
    const width = Number(process.env.PRODUCT_WIDTH_CM || product.width || 10);
    const height = Number(process.env.PRODUCT_HEIGHT_CM || product.height || 10);
    const length = Number(process.env.PRODUCT_LENGTH_CM || product.length || 10);
    const weight = Number(process.env.PRODUCT_WEIGHT_KG || product.weight || 0.15);
    const qty = Math.max(1, Number(quantity || 1));
    const insurance = Number(shipmentInvoiceValue || 0);

    const payload = {
      from: { postal_code: sellerCep },
      to: { postal_code: destinationCep },
      products: [{
        id: 'esfera-personalizada',
        width,
        height,
        length,
        weight,
        insurance_value: insurance > 0 ? Number((insurance / qty).toFixed(2)) : 0,
        quantity: qty,
      }],
      options: { receipt: false, own_hand: false },
    };

    const response = await fetch(`${PROD_BASE}/api/v2/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': process.env.ME_USER_AGENT || 'Esferas Encantadas (lusudigital@gmail.com)',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    const rawOptions = Array.isArray(data) ? data : (Array.isArray(data?.services) ? data.services : (Array.isArray(data?.data) ? data.data : []));
    const options = rawOptions
      .map(item => ({
        id: item.id ?? item.service_id ?? item.serviceId ?? null,
        service: item.company?.name ? `${item.company.name} — ${item.name || item.service}` : (item.name || item.service || item.company?.name || 'Transportadora'),
        price: Number(item.custom_price ?? item.price ?? item.shipping_price ?? item.ShippingPrice ?? 0),
        deadline: Number(item.custom_delivery_time ?? item.delivery_time ?? item.deliveryTime ?? item.DeliveryTime ?? 0) || null,
      }))
      .filter(item => Number.isFinite(item.price) && item.price >= 0);

    return res.status(200).json({ options });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Erro ao consultar o Melhor Envio.' });
  }
}
