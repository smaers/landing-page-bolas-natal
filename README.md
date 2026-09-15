# Esferas Encantadas — Landing Page

Landing page de Natal personalizada com:

- Esferas nas cores vermelho, dourado e branco.
- Kit SPECIAL BTS: 7 bolas por R$ 89,90.
- Cupom BTS: 10% OFF apenas no Kit BTS.
- Pagamento: Pix, cartão de crédito e cartão de débito.
- Frete grátis para Palhoça e Florianópolis em pedidos acima de R$ 100.
- Campo de CEP para cotação nacional via Melhor Envio.
- Área para rastreamento por código.
- E-mail: lusudigital@gmail.com.

## Origem configurada

CEP de origem: `88133600`.

## Integração Melhor Envio

A API do Melhor Envio exige OAuth 2.0 e um token que não deve ser exposto no navegador. O projeto usa funções serverless em `api/` para manter o token no backend.

Variáveis de ambiente no Vercel:

- `ME_TOKEN` — token OAuth do Melhor Envio.
- `ORIGIN_CEP` — `88133600`.
- `ME_USER_AGENT` — por exemplo `Esferas Encantadas (lusudigital@gmail.com)`.
- `PRODUCT_WIDTH_CM` — largura real da embalagem.
- `PRODUCT_HEIGHT_CM` — altura real da embalagem.
- `PRODUCT_LENGTH_CM` — comprimento real da embalagem.
- `PRODUCT_WEIGHT_KG` — peso real da embalagem/produto.

Os valores padrão de dimensão/peso no backend são provisórios (10 × 10 × 10 cm e 0,15 kg). Substitua pelos dados reais antes de usar a cotação como preço final.

## GitHub Pages + Vercel

O GitHub Pages hospeda a parte estática. O Vercel executa `api/freight.js` e `api/tracking.js`.

Depois de publicar o backend no Vercel, edite `script.js` e troque:

`https://SEU-BACKEND.vercel.app/api/freight`

`https://SEU-BACKEND.vercel.app/api/tracking`

pelo domínio real do projeto Vercel.
