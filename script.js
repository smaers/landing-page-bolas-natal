const UNIT_PRICE=9.90; let qty=1;
const qtyEl=document.getElementById("qty"), totalEl=document.getElementById("total"), summaryTotal=document.getElementById("summaryTotal"), summaryText=document.getElementById("summaryText"), toast=document.getElementById("toast");
const email="lusudigital@gmail.com";
const brl=n=>n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const colorName=()=>document.querySelector('input[name="color"]:checked')?.value||"vermelho";
function title(s){return s.charAt(0).toUpperCase()+s.slice(1)}
function update(){const total=UNIT_PRICE*qty;qtyEl.textContent=qty;totalEl.textContent=brl(total);summaryTotal.textContent=brl(total);summaryText.textContent=`${qty} ${qty===1?"bola":"bolas"} • ${title(colorName())}`;}
function toastMsg(msg){toast.textContent=msg;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),2300)}
document.getElementById("plus").onclick=()=>{qty=Math.min(99,qty+1);update()};
document.getElementById("minus").onclick=()=>{qty=Math.max(1,qty-1);update()};
document.querySelectorAll('input[name="color"]').forEach(input=>input.addEventListener("change",()=>{document.querySelectorAll(".color-option").forEach(c=>c.classList.remove("active"));input.closest(".color-option").classList.add("active");update()}));
document.querySelectorAll(".select-color").forEach(b=>b.onclick=()=>{const i=document.querySelector(`input[name="color"][value="${b.dataset.color}"]`);i.checked=true;i.dispatchEvent(new Event("change"));document.getElementById("pedido").scrollIntoView({behavior:"smooth"})});
document.getElementById("emailCta").addEventListener("click",()=>{toastMsg("Abrindo seu e-mail para finalizar o pedido.")});
update();
