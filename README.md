# Esferas Encantadas — Landing Page

Atualização da landing page com:

- logo e imagens reais das esferas nas cores vermelho, dourado e branco;
- modelos corporativos;
- Kit BTS com 7 bolas por R$ 89,90;
- cupom BTS com 10% de desconto exclusivo do Kit BTS;
- pagamentos apenas Pix, cartão de crédito e débito;
- cálculo de frete por CEP com regra local de frete grátis acima de R$ 100 para Palhoça e Florianópolis;
- estrutura pronta para cotação nacional via API de transportadora;
- área de rastreio por código;
- e-mail `lusudigital@gmail.com`.

## Importante sobre frete e rastreio

O GitHub Pages hospeda apenas conteúdo estático. Como a API de frete exige autenticação por token, o token não deve ser colocado no JavaScript público do site. Esta versão inclui as funções `api/freight.js` e `api/tracking.js` preparadas para Vercel/Node.

Para cotação e rastreio reais em produção, configure no backend:

- `FRENET_TOKEN`
- `ORIGIN_CEP`

E publique o projeto em uma plataforma que execute funções serverless (por exemplo, Vercel). A documentação da Frenet informa que a cotação requer token e CEP de origem/destino, e que a API de rastreio também requer token e código de rastreio. Ver documentação oficial: https://docs.frenet.com.br/reference/calculateshippingquote e https://docs.frenet.com.br/reference/trackorder

### Dimensões/peso

No arquivo `api/freight.js`, os dados da embalagem estão como valores provisórios (10 × 10 × 10 cm, 0,15 kg). Antes de usar a cotação em produção, troque pelos dados reais do produto/embalagem.
