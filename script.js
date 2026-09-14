const unitPrice = 9.90;
let qty = 1;

const qtyEl = document.getElementById('qty');
const totalEl = document.getElementById('total');
const summaryEl = document.getElementById('summaryTotal');
const summaryText = document.getElementById('summaryText');
const toast = document.getElementById('toast');

function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function currentColor() {
  return document.querySelector('input[name="color"]:checked')?.value || 'vermelho';
}

function updateTotal() {
  qtyEl.textContent = qty;
  const total = unitPrice * qty;
  totalEl.textContent = formatBRL(total);
  summaryEl.textContent = formatBRL(total);
  const color = currentColor();
  summaryText.textContent = `${qty} ${qty === 1 ? 'bola' : 'bolas'} • ${color[0].toUpperCase() + color.slice(1)}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2300);
}

document.getElementById('plus').addEventListener('click', () => {
  qty = Math.min(qty + 1, 99);
  updateTotal();
});

document.getElementById('minus').addEventListener('click', () => {
  qty = Math.max(qty - 1, 1);
  updateTotal();
});

document.querySelectorAll('input[name="color"]').forEach(input => {
  input.addEventListener('change', () => {
    document.querySelectorAll('.color-option').forEach(card => card.classList.remove('active'));
    input.closest('.color-option').classList.add('active');
    updateTotal();
  });
});

document.querySelectorAll('.select-color').forEach(button => {
  button.addEventListener('click', () => {
    const value = button.dataset.color;
    const target = document.querySelector(`input[name="color"][value="${value}"]`);
    if (target) {
      target.checked = true;
      target.dispatchEvent(new Event('change', { bubbles: true }));
      document.getElementById('pedido').scrollIntoView({ behavior: 'smooth' });
    }
  });
});

document.getElementById('buyButton').addEventListener('click', () => {
  const color = currentColor();
  const payment = document.querySelector('input[name="payment"]:checked')?.value || 'pix';
  showToast(`Pedido pronto: ${qty} ${qty === 1 ? 'bola' : 'bolas'} ${color} • pagamento ${payment}.`);
});

updateTotal();
