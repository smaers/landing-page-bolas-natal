# Esferas Encantadas — versão 4

Esta versão acrescenta:

- upload de fotos do cliente com pré-visualização;
- página de checkout;
- página de pagamento com Pix/Crédito/Débito;
- página de cadastro e login;
- persistência local da sessão/protótipo de conta;
- estrutura de endpoints serverless para autenticação, upload e pagamento.

## Importante para produção

O GitHub Pages é estático. As páginas de interface funcionam como protótipo, mas dados sensíveis e operações reais precisam de um backend.

### Fotos
O navegador guarda as imagens temporariamente em IndexedDB. Para produção, conecte `api/upload.js` a um storage como S3, Cloudinary ou Supabase Storage.

### Conta
A versão de demonstração usa Web Crypto para armazenar um hash de senha no navegador. Não use isso como autenticação de produção. Conecte `api/auth-register.js` e `api/auth-login.js` a um provedor de identidade/banco seguro.

### Pagamento
A página aceita a interface de Pix, crédito e débito. Os dados de cartão não são salvos. Para cobrança real, faça a tokenização diretamente pelo seu gateway e só envie o token ao backend (`api/create-payment.js`).

### Pix
Em `pagamento.js`, substitua `PIX_KEY` pela chave Pix comercial antes de usar o QR Code em produção.

### Frete
A regra local permanece: Palhoça e Florianópolis com frete grátis acima de R$ 100. A cotação nacional continua devendo ser conectada ao backend do Melhor Envio.
