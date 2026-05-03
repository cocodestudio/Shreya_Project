/* ═══════════════════════════════════════════════════════════
   EXPENSES TRACKER DASHBOARD — app.js
   Student: Shreya Sharma | Roll: 22014168977
   CoCode Studio Pvt. Ltd.
═══════════════════════════════════════════════════════════ */

// ── CONSTANTS ─────────────────────────────────────────────
const STORAGE_KEY = 'spendSmart_transactions';

const CATEGORY_META = {
  Food:          { icon: '🍔', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  Transport:     { icon: '🚌', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  Shopping:      { icon: '🛍', color: '#EC4899', bg: 'rgba(236,72,153,0.15)' },
  Bills:         { icon: '⚡', color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' },
  Entertainment: { icon: '🎮', color: '#14B8A6', bg: 'rgba(20,184,166,0.15)' },
  Healthcare:    { icon: '💊', color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
  Education:     { icon: '📚', color: '#06B6D4', bg: 'rgba(6,182,212,0.15)' },
  Others:        { icon: '📦', color: '#6B7280', bg: 'rgba(107,114,128,0.15)' },
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── STATE ─────────────────────────────────────────────────
let transactions = [];
let currentType  = 'expense';
let deleteTargetId = null;
let pieChart = null;
let barChart = null;

// ── INIT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  setDefaultDate();
  setDateDisplay();
  populateYearSelect();
  renderAll();
});

// ── STORAGE ───────────────────────────────────────────────
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    transactions = raw ? JSON.parse(raw) : seedData();
  } catch { transactions = seedData(); }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function seedData() {
  // Sample data so dashboard looks populated on first load
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const d = (mo, da) => `${y}-${String(mo+1).padStart(2,'0')}-${String(da).padStart(2,'0')}`;
  const data = [
    { id: uid(), type:'income',  desc:'Freelance Project',    amount:15000, category:'Others',        date: d(m, 2)  },
    { id: uid(), type:'income',  desc:'Part-time Tutoring',   amount:4500,  category:'Education',     date: d(m, 5)  },
    { id: uid(), type:'expense', desc:'Grocery Shopping',     amount:1800,  category:'Food',          date: d(m, 3)  },
    { id: uid(), type:'expense', desc:'Monthly Bus Pass',     amount:600,   category:'Transport',     date: d(m, 1)  },
    { id: uid(), type:'expense', desc:'Netflix Subscription', amount:499,   category:'Entertainment', date: d(m, 6)  },
    { id: uid(), type:'expense', desc:'Electricity Bill',     amount:1200,  category:'Bills',         date: d(m, 4)  },
    { id: uid(), type:'expense', desc:'Pharmacy',             amount:350,   category:'Healthcare',    date: d(m, 8)  },
    { id: uid(), type:'expense', desc:'Online Course',        amount:2999,  category:'Education',     date: d(m, 7)  },
    { id: uid(), type:'expense', desc:'Clothes Shopping',     amount:1500,  category:'Shopping',      date: d(m, 9)  },
    { id: uid(), type:'income',  desc:'Salary',               amount:22000, category:'Others',        date: d(m-1, 1)},
    { id: uid(), type:'expense', desc:'Dinner Out',           amount:850,   category:'Food',          date: d(m-1,15)},
    { id: uid(), type:'expense', desc:'Mobile Recharge',      amount:299,   category:'Bills',         date: d(m-1,10)},
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

// ── HELPERS ───────────────────────────────────────────────
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

function fmtCurrency(n) {
  return '₹' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(str) {
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}

// ── DATE / UI SETUP ───────────────────────────────────────
function setDateDisplay() {
  const el = document.getElementById('date-display');
  el.textContent = new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
}

function setDefaultDate() {
  const el = document.getElementById('f-date');
  el.value = new Date().toISOString().split('T')[0];
}

function populateYearSelect() {
  const sel = document.getElementById('year-select');
  sel.innerHTML = '';
  const years = [...new Set(transactions.map(t => t.date.slice(0,4)))];
  if (!years.includes(String(new Date().getFullYear()))) years.push(String(new Date().getFullYear()));
  years.sort((a,b) => b - a).forEach(y => {
    const o = document.createElement('option');
    o.value = y; o.textContent = y;
    sel.appendChild(o);
  });
  sel.value = String(new Date().getFullYear());
}

// ── RENDER ALL ─────────────────────────────────────────────
function renderAll() {
  renderSummary();
  renderCharts();
  applyFilters();
}

// ── SUMMARY CARDS ──────────────────────────────────────────
function renderSummary() {
  const inc = transactions.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0);
  const exp = transactions.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0);
  const bal = inc - exp;

  document.getElementById('total-income').textContent  = fmtCurrency(inc);
  document.getElementById('total-expense').textContent = fmtCurrency(exp);
  document.getElementById('net-balance').textContent   = fmtCurrency(bal);
  document.getElementById('tx-count').textContent      = transactions.length;

  // Progress bars
  const total = inc + exp || 1;
  document.getElementById('income-bar').style.width  = (inc / total * 100) + '%';
  document.getElementById('expense-bar').style.width = (exp / total * 100) + '%';

  // Balance color
  const balEl = document.getElementById('net-balance');
  balEl.style.color = bal >= 0 ? 'var(--income)' : 'var(--expense)';
  document.getElementById('balance-status').textContent = bal >= 0 ? '✔ Balance is positive' : '⚠ You are over budget';

  // This month count
  const now = new Date();
  const thisMonth = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  document.getElementById('tx-this-month').textContent = `This month: ${thisMonth}`;
}

// ── CHARTS ─────────────────────────────────────────────────
function renderCharts() {
  renderPieChart();
  renderBarChart();
}

function renderPieChart() {
  const expenses = transactions.filter(t => t.type === 'expense');
  const catMap = {};
  expenses.forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + t.amount;
  });

  const labels  = Object.keys(catMap);
  const data    = Object.values(catMap);
  const colors  = labels.map(l => CATEGORY_META[l]?.color || '#6B7280');
  const total   = data.reduce((s, v) => s + v, 0);

  document.getElementById('cat-count').textContent  = `${labels.length} categor${labels.length === 1 ? 'y' : 'ies'}`;
  document.getElementById('doughnut-top').textContent = fmtCurrency(total);

  const ctx = document.getElementById('pieChart').getContext('2d');
  if (pieChart) pieChart.destroy();
  pieChart = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: '#141C2F', borderWidth: 3, hoverOffset: 8 }] },
    options: {
      cutout: '68%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#7C8BA0', font: { size: 11, family: 'DM Sans' }, padding: 10, boxWidth: 10, usePointStyle: true }
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ₹${ctx.parsed.toLocaleString('en-IN')}  (${((ctx.parsed/total)*100).toFixed(1)}%)`
          }
        }
      }
    }
  });
}

function renderBarChart() {
  const year = parseInt(document.getElementById('year-select')?.value || new Date().getFullYear());
  const incData = new Array(12).fill(0);
  const expData = new Array(12).fill(0);

  transactions.forEach(t => {
    const d = new Date(t.date);
    if (d.getFullYear() === year) {
      const m = d.getMonth();
      if (t.type === 'income')  incData[m] += t.amount;
      else                      expData[m] += t.amount;
    }
  });

  const ctx = document.getElementById('barChart').getContext('2d');
  if (barChart) barChart.destroy();
  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: MONTHS,
      datasets: [
        { label: 'Income',   data: incData, backgroundColor: 'rgba(16,185,129,0.75)', borderRadius: 6, borderSkipped: false },
        { label: 'Expenses', data: expData, backgroundColor: 'rgba(244,63,94,0.75)',  borderRadius: 6, borderSkipped: false },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { labels: { color: '#7C8BA0', font: { size: 11, family: 'DM Sans' }, usePointStyle: true } },
        tooltip: {
          callbacks: { label: ctx => ` ${ctx.dataset.label}: ₹${ctx.parsed.y.toLocaleString('en-IN')}` }
        }
      },
      scales: {
        x: { ticks: { color: '#7C8BA0', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
        y: {
          ticks: { color: '#7C8BA0', font: { size: 11 },
            callback: v => '₹' + (v >= 1000 ? (v/1000).toFixed(0) + 'k' : v)
          },
          grid: { color: 'rgba(255,255,255,0.04)' }
        }
      }
    }
  });
}

// ── FILTER & SORT ──────────────────────────────────────────
function applyFilters() {
  const search  = document.getElementById('search-input').value.trim().toLowerCase();
  const cat     = document.getElementById('filter-category').value;
  const type    = document.getElementById('filter-type').value;
  const from    = document.getElementById('filter-from').value;
  const to      = document.getElementById('filter-to').value;
  const minAmt  = parseFloat(document.getElementById('filter-min').value) || 0;
  const maxAmt  = parseFloat(document.getElementById('filter-max').value) || Infinity;
  const sort    = document.getElementById('sort-select').value;

  let filtered = transactions.filter(t => {
    if (search && !t.desc.toLowerCase().includes(search) && !t.category.toLowerCase().includes(search)) return false;
    if (cat  && t.category !== cat)  return false;
    if (type && t.type     !== type) return false;
    if (from && t.date < from)       return false;
    if (to   && t.date > to)         return false;
    if (t.amount < minAmt || t.amount > maxAmt) return false;
    return true;
  });

  filtered.sort((a, b) => {
    if (sort === 'date-desc')   return b.date.localeCompare(a.date);
    if (sort === 'date-asc')    return a.date.localeCompare(b.date);
    if (sort === 'amount-desc') return b.amount - a.amount;
    if (sort === 'amount-asc')  return a.amount - b.amount;
    return 0;
  });

  document.getElementById('filtered-count').textContent = filtered.length;
  renderTransactionList(filtered);
}

function clearFilters() {
  document.getElementById('search-input').value   = '';
  document.getElementById('filter-category').value= '';
  document.getElementById('filter-type').value    = '';
  document.getElementById('filter-from').value    = '';
  document.getElementById('filter-to').value      = '';
  document.getElementById('filter-min').value     = '';
  document.getElementById('filter-max').value     = '';
  applyFilters();
}

// ── RENDER TRANSACTION LIST ────────────────────────────────
function renderTransactionList(list) {
  const container = document.getElementById('tx-list');
  const empty     = document.getElementById('empty-state');

  if (list.length === 0) {
    container.innerHTML = '';
    container.appendChild(empty);
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  container.innerHTML = list.map(t => {
    const meta  = CATEGORY_META[t.category] || CATEGORY_META.Others;
    const sign  = t.type === 'income' ? '+' : '-';
    return `
      <div class="tx-item ${t.type}" data-id="${t.id}">
        <div class="tx-cat-icon" style="background:${meta.bg};">${meta.icon}</div>
        <div class="tx-info">
          <div class="tx-desc">${escHtml(t.desc)}</div>
          <div class="tx-meta">${fmtDate(t.date)}</div>
        </div>
        <span class="tx-cat-tag" style="background:${meta.bg};color:${meta.color};">${t.category}</span>
        <div class="tx-amount ${t.type}">${sign}${fmtCurrency(t.amount)}</div>
        <div class="tx-actions">
          <button class="btn-icon edit" onclick="openEditModal('${t.id}')" title="Edit">✎</button>
          <button class="btn-icon del"  onclick="openConfirm('${t.id}')"   title="Delete">✕</button>
        </div>
      </div>`;
  }).join('');
}

function escHtml(str) {
  return str.replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

// ── MODAL ──────────────────────────────────────────────────
function openModal() {
  document.getElementById('modal-title').textContent = 'Add Transaction';
  document.getElementById('edit-id').value  = '';
  document.getElementById('f-desc').value   = '';
  document.getElementById('f-amount').value = '';
  document.getElementById('f-category').value = 'Food';
  setDefaultDate();
  setType('expense');
  document.getElementById('modal-overlay').classList.add('open');
  setTimeout(() => document.getElementById('f-desc').focus(), 50);
}

function openEditModal(id) {
  const t = transactions.find(x => x.id === id);
  if (!t) return;
  document.getElementById('modal-title').textContent   = 'Edit Transaction';
  document.getElementById('edit-id').value             = id;
  document.getElementById('f-desc').value              = t.desc;
  document.getElementById('f-amount').value            = t.amount;
  document.getElementById('f-category').value          = t.category;
  document.getElementById('f-date').value              = t.date;
  setType(t.type);
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() { document.getElementById('modal-overlay').classList.remove('open'); }
function closeModalOutside(e) { if (e.target.id === 'modal-overlay') closeModal(); }

function setType(type) {
  currentType = type;
  document.getElementById('btn-expense').classList.toggle('active', type === 'expense');
  document.getElementById('btn-income').classList.toggle('active',  type === 'income');
}

function saveTransaction() {
  const desc   = document.getElementById('f-desc').value.trim();
  const amount = parseFloat(document.getElementById('f-amount').value);
  const cat    = document.getElementById('f-category').value;
  const date   = document.getElementById('f-date').value;

  if (!desc)          { shakeInput('f-desc');   return; }
  if (!amount || amount <= 0) { shakeInput('f-amount'); return; }
  if (!date)          { shakeInput('f-date');   return; }

  const editId = document.getElementById('edit-id').value;
  if (editId) {
    const idx = transactions.findIndex(t => t.id === editId);
    if (idx > -1) transactions[idx] = { ...transactions[idx], desc, amount, category: cat, date, type: currentType };
  } else {
    transactions.unshift({ id: uid(), type: currentType, desc, amount, category: cat, date });
  }

  saveToStorage();
  closeModal();
  populateYearSelect();
  renderAll();
}

function shakeInput(id) {
  const el = document.getElementById(id);
  el.style.borderColor = 'var(--expense)';
  el.focus();
  el.style.animation = 'shake 0.3s';
  el.addEventListener('animationend', () => { el.style.animation = ''; el.style.borderColor = ''; }, { once: true });
}

// ── DELETE CONFIRM ─────────────────────────────────────────
function openConfirm(id) {
  deleteTargetId = id;
  document.getElementById('confirm-overlay').classList.add('open');
  document.getElementById('btn-confirm-delete').onclick = () => {
    transactions = transactions.filter(t => t.id !== deleteTargetId);
    saveToStorage();
    closeConfirm();
    populateYearSelect();
    renderAll();
  };
}
function closeConfirm() { document.getElementById('confirm-overlay').classList.remove('open'); deleteTargetId = null; }
function closeConfirmOutside(e) { if (e.target.id === 'confirm-overlay') closeConfirm(); }

// ── SIDEBAR TOGGLE ─────────────────────────────────────────
function toggleSidebar() { document.querySelector('.sidebar').classList.toggle('open'); }

// ── PRINT ──────────────────────────────────────────────────
function printSummary() {
  const inc = transactions.filter(t => t.type === 'income').reduce((s,t)  => s + t.amount, 0);
  const exp = transactions.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0);
  const win = window.open('', '_blank');
  win.document.write(`
    <html><head><title>SpendSmart – Summary</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 700px; margin: 40px auto; color: #1a1a2e; }
      h1 { font-size: 1.4rem; margin-bottom: 4px; }
      .cards { display: flex; gap: 20px; margin: 20px 0; }
      .card { flex: 1; padding: 16px; border: 1px solid #ddd; border-radius: 10px; text-align: center; }
      .card .label { font-size: 0.75rem; color: #666; text-transform: uppercase; margin-bottom: 6px; }
      .card .val { font-size: 1.3rem; font-weight: 700; }
      table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
      th { background: #f0f4ff; padding: 8px 12px; text-align: left; }
      td { padding: 8px 12px; border-bottom: 1px solid #eee; }
      .inc { color: #16a34a; } .exp { color: #dc2626; }
    </style></head><body>
    <h1>SpendSmart – Transaction Summary</h1>
    <p style="color:#666;font-size:0.85rem">Generated: ${new Date().toLocaleString('en-IN')}</p>
    <div class="cards">
      <div class="card"><div class="label">Total Income</div><div class="val inc">₹${inc.toLocaleString('en-IN')}</div></div>
      <div class="card"><div class="label">Total Expenses</div><div class="val exp">₹${exp.toLocaleString('en-IN')}</div></div>
      <div class="card"><div class="label">Net Balance</div><div class="val" style="color:${inc-exp>=0?'#16a34a':'#dc2626'}">₹${(inc-exp).toLocaleString('en-IN')}</div></div>
    </div>
    <table>
      <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th>Amount</th></tr></thead>
      <tbody>
        ${transactions.map(t => `
          <tr>
            <td>${fmtDate(t.date)}</td>
            <td>${t.desc}</td>
            <td>${t.category}</td>
            <td class="${t.type}">${t.type.charAt(0).toUpperCase()+t.type.slice(1)}</td>
            <td class="${t.type}" style="font-weight:600">${t.type==='income'?'+':'-'}₹${t.amount.toLocaleString('en-IN')}</td>
          </tr>`).join('')}
      </tbody>
    </table>
    <script>window.print();<\/script>
    </body></html>
  `);
  win.document.close();
}

// ── CSS SHAKE ANIMATION ────────────────────────────────────
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%,100%{transform:translateX(0)}
    25%{transform:translateX(-6px)}
    75%{transform:translateX(6px)}
  }
`;
document.head.appendChild(style);
