const CONFIG = {
  unitPrice: 9.90,
  btsKitPrice: 89.90,
  btsCoupon: 'BTS',
  btsDiscount: 0.10,
  freeShippingThreshold: 100,
  freeShippingCities: ['PALHOCA', 'FLORIANOPOLIS'],
  shippingApiUrl: 'https://SEU-BACKEND.vercel.app/api/freight',
  trackingApiUrl: 'https://SEU-BACKEND.vercel.app/api/tracking',
  // Preencha no ambiente do backend/serverless. Não coloque token privado aqui.
  originCep: '88133600'
};

let qty = 1;
let selectedMode = 'regular';
let btsDiscountApplied = false;
let shippingQuote = null;

const $ = id => document.getElementById(id);
const brl = n => Number(n || 0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const colorName = () => document.querySelector('input[name="color"]:checked')?.value || 'vermelho';
const title = s => s.charAt(0).toUpperCase()+s.slice(1);
const currentBaseTotal = () => selectedMode === 'bts' ? CONFIG.btsKitPrice : CONFIG.unitPrice * qty;
const currentDiscount = () => (selectedMode === 'bts' && btsDiscountApplied) ? CONFIG.btsKitPrice * CONFIG.btsDiscount : 0;
const currentProductTotal = () => Math.max(0, currentBaseTotal() - currentDiscount());

function updateSummary(){
  const base = currentBaseTotal();
  const discount = currentDiscount();
  const productTotal = currentProductTotal();
  $('qty').textContent = qty;
  $('total').textContent = brl(base);
  $('summaryTotal').textContent = brl(productTotal + (shippingQuote?.price || 0));
  if(selectedMode==='bts') $('summaryText').textContent = `Kit BTS • 7 bolas${btsDiscountApplied ? ' • cupom BTS' : ''}`;
  else $('summaryText').textContent = `${qty} ${qty===1?'bola':'bolas'} • ${title(colorName())}`;
  const subject = encodeURIComponent('Pedido Esferas Encantadas');
  const body = encodeURIComponent(buildOrderText());
  $('emailCta').href = `mailto:lusudigital@gmail.com?subject=${subject}&body=${body}`;
  $('couponMsg').textContent = discount ? `Cupom BTS aplicado: -${brl(discount)}.` : '';
}

function buildOrderText(){
  const lines = selectedMode==='bts'
    ? [`Kit BTS (7 bolas): ${brl(CONFIG.btsKitPrice)}`]
    : [`Bolas personalizadas: ${qty} x ${brl(CONFIG.unitPrice)} — ${title(colorName())}`];
  if(btsDiscountApplied && selectedMode==='bts') lines.push(`Desconto cupom BTS: -${brl(CONFIG.btsKitPrice*CONFIG.btsDiscount)}`);
  if(shippingQuote) lines.push(`Frete: ${shippingQuote.free ? 'GRÁTIS' : brl(shippingQuote.price)}${shippingQuote.service ? ' — '+shippingQuote.service : ''}${shippingQuote.deadline ? ' — prazo '+shippingQuote.deadline+' dias' : ''}`);
  lines.push(`Total: ${brl(currentProductTotal() + (shippingQuote?.price || 0))}`);
  return lines.join('\n');
}

function toastMsg(msg){ $('toast').textContent=msg; $('toast').classList.add('show'); setTimeout(()=>$('toast').classList.remove('show'),2600); }

function clearShipping(){ shippingQuote=null; $('shippingResult').innerHTML='<div class="result-icon">🚚</div><h3>Seu frete aparecerá aqui</h3><p>Informe o CEP para consultar as opções disponíveis.</p>'; updateSummary(); }
function normalizeCep(v){ return (v||'').replace(/\D/g,'').slice(0,8); }
function fmtCep(v){ const n=normalizeCep(v); return n.length>5 ? `${n.slice(0,5)}-${n.slice(5)}` : n; }
function cityNormalized(city){ return String(city||'').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
function isFreeLocal(total, city){ return total > CONFIG.freeShippingThreshold && CONFIG.freeShippingCities.includes(cityNormalized(city)); }

$('cep').addEventListener('input', e=> e.target.value=fmtCep(e.target.value));
$('quoteShipping').addEventListener('click', async ()=>{
  const cep=normalizeCep($('cep').value);
  if(cep.length!==8){ toastMsg('Digite um CEP válido com 8 números.'); return; }
  const result=$('shippingResult');
  result.innerHTML='<div class="loader"></div><h3>Consultando frete...</h3><p>Buscando endereço e condições de entrega.</p>';
  try{
    const via=await fetch(`https://viacep.com.br/ws/${cep}/json/`).then(r=>r.json());
    if(via.erro) throw new Error('CEP não encontrado.');
    const total=currentProductTotal();
    if(isFreeLocal(total, via.localidade)){
      shippingQuote={free:true,price:0,city:via.localidade,service:'Frete grátis local'};
      result.innerHTML=`<div class="result-icon">🎁</div><h3>Frete grátis!</h3><p>Seu CEP é de <b>${via.localidade}</b> e o pedido supera R$ 100.</p><strong>R$ 0,00</strong>`;
      updateSummary(); return;
    }
    try{
      const api=await fetch(CONFIG.shippingApiUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({recipientCep:cep,recipientCity:via.localidade,recipientState:via.uf,shipmentInvoiceValue:total,quantity:selectedMode==='bts'?7:qty,originCep:CONFIG.originCep})});
      if(!api.ok) throw new Error('API de frete indisponível');
      const data=await api.json();
      const options=Array.isArray(data.options)?data.options:[];
      if(!options.length) throw new Error('Nenhuma opção de frete retornada');
      const first=options[0];
      shippingQuote={free:false,price:Number(first.price||0),city:via.localidade,service:first.service||'Transportadora',deadline:first.deadline||null};
      const deadline=shippingQuote.deadline?`<small>Prazo estimado: ${shippingQuote.deadline} dias</small>`:'';
      result.innerHTML=`<div class="result-icon">🚚</div><h3>Frete calculado</h3><p>${via.localidade} - ${via.uf}</p><div class="freight-option"><span>${shippingQuote.service}${deadline}</span><strong>${brl(shippingQuote.price)}</strong></div>`;
      updateSummary();
    }catch(err){
      shippingQuote=null;
      result.innerHTML=`<div class="result-icon">📦</div><h3>CEP encontrado</h3><p>${via.localidade} - ${via.uf}</p><p class="api-warning">A calculadora nacional está pronta para a integração da transportadora. Configure o endpoint <code>/api/freight</code> com sua conta de frete para mostrar preço e prazo em tempo real.</p>`;
      updateSummary();
    }
  }catch(err){ result.innerHTML='<div class="result-icon">⚠️</div><h3>CEP inválido</h3><p>Confira os números e tente novamente.</p>'; }
});

document.querySelectorAll('input[name="color"]').forEach(input=>input.addEventListener('change',()=>{document.querySelectorAll('.color-option').forEach(c=>c.classList.remove('active'));input.closest('.color-option').classList.add('active');selectedMode='regular';btsDiscountApplied=false;updateSummary();}));
document.querySelectorAll('.select-color').forEach(b=>b.onclick=()=>{const input=document.querySelector(`input[name="color"][value="${b.dataset.color}"]`);input.checked=true;input.dispatchEvent(new Event('change'));$('pedido').scrollIntoView({behavior:'smooth'});});
$('plus').onclick=()=>{if(selectedMode!=='regular'){selectedMode='regular';btsDiscountApplied=false;}qty=Math.min(99,qty+1);clearShipping();};
$('minus').onclick=()=>{if(selectedMode!=='regular'){selectedMode='regular';btsDiscountApplied=false;}qty=Math.max(1,qty-1);clearShipping();};
$('applyCoupon').onclick=()=>{
  const code=$('coupon').value.trim().toUpperCase();
  if(code===CONFIG.btsCoupon && selectedMode==='bts'){btsDiscountApplied=true;toastMsg('Cupom BTS aplicado: 10% de desconto!');updateSummary();}
  else if(code===CONFIG.btsCoupon){toastMsg('O cupom BTS é exclusivo do Kit BTS. Adicione o kit para usar.');}
  else {btsDiscountApplied=false; $('couponMsg').textContent='Cupom inválido.'; toastMsg('Cupom inválido.'); updateSummary();}
};
$('chooseBts').onclick=()=>{selectedMode='bts';qty=1;clearShipping();$('bts-pedido').classList.add('selected-bts');$('coupon').focus();$('pedido').scrollIntoView({behavior:'smooth'});updateSummary();toastMsg('Kit BTS selecionado. Use o cupom BTS para 10% OFF.');};

$('trackButton').onclick=async()=>{
  const code=$('trackingCode').value.trim(); const service=$('serviceCode').value.trim();
  if(!code){toastMsg('Digite o código de rastreio.');return;}
  const out=$('trackingResult'); out.textContent='Consultando rastreio...';
  try{
    const r=await fetch(CONFIG.trackingApiUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({trackingNumber:code,shippingServiceCode:service||null})});
    if(!r.ok) throw new Error();
    const data=await r.json();
    out.innerHTML = `<b>${data.status||'Rastreio atualizado'}</b>${data.message?`<span>${data.message}</span>`:''}`;
  }catch(e){
    out.innerHTML = `O código foi recebido. O rastreio será consultado pelo Melhor Envio após a configuração do backend.`;
  }
};

updateSummary();
