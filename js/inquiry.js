/**
 * Inquiry System - Core Logic
 * Three Squirrels Overseas
 */

const INQUIRY_KEY = 'ts_overseas_inquiry_v2';

// ─────────────────────────────────
// DATA OPERATIONS
// ─────────────────────────────────

function getInquiryList() {
  try {
    return JSON.parse(localStorage.getItem(INQUIRY_KEY)) || [];
  } catch { return []; }
}

function saveInquiryList(list) {
  localStorage.setItem(INQUIRY_KEY, JSON.stringify(list));
}

function addToInquiry(product) {
  const list = getInquiryList();
  if (list.find(p => p.id === product.id)) return false;
  list.push({ ...product, qty: product.moq || 1 });
  saveInquiryList(list);
  updateCartBadge();
  return true;
}

function removeFromInquiry(productId) {
  let list = getInquiryList();
  list = list.filter(p => p.id !== productId);
  saveInquiryList(list);
  updateCartBadge();
}

function updateProductQty(productId, qty) {
  const list = getInquiryList();
  const item = list.find(p => p.id === productId);
  if (item) {
    item.qty = Math.max(item.moq || 1, qty);
    saveInquiryList(list);
  }
}

function clearInquiry() {
  localStorage.removeItem(INQUIRY_KEY);
}

// ─────────────────────────────────
// CART BADGE
// ─────────────────────────────────

function updateCartBadge() {
  const count = getInquiryList().length;
  document.querySelectorAll('.cart-badge').forEach(badge => {
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  });
}

// ─────────────────────────────────
// CART SIDEBAR PANEL
// ─────────────────────────────────

let cartPanelOpen = false;

function toggleCartPanel() {
  const panel = document.getElementById('inquiryCartPanel');
  const overlay = document.getElementById('cartOverlay');
  if (!panel) return;

  cartPanelOpen = !cartPanelOpen;
  if (cartPanelOpen) {
    renderCartPanel();
    panel.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  } else {
    panel.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function renderCartPanel() {
  const list = getInquiryList();
  const emptyEl = document.getElementById('cartEmpty');
  const contentEl = document.getElementById('cartContent');
  const itemsEl = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');

  if (list.length === 0) {
    if (emptyEl) emptyEl.style.display = 'flex';
    if (contentEl) contentEl.style.display = 'none';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (contentEl) contentEl.style.display = 'flex';

  if (itemsEl) {
    itemsEl.innerHTML = list.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img"
             onerror="this.src='https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=60&h=60&fit=crop'">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-meta">MOQ: ${item.moq} ${item.unit || 'units'} | $${(item.priceMin||0).toFixed(2)} – $${(item.priceMax||0).toFixed(2)}</div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
            <div class="qty-group" style="transform:scale(0.85);transform-origin:left;">
              <button class="qty-btn" onclick="event.stopPropagation();panelAdjustQty('${item.id}',-${item.moq||1})">−</button>
              <input type="number" value="${item.qty}" min="${item.moq||1}" step="${item.moq||1}"
                     onchange="event.stopPropagation();panelSetQty('${item.id}',this.value)"
                     class="qty-input" style="width:50px;height:28px;font-size:0.8rem;">
              <button class="qty-btn" onclick="event.stopPropagation();panelAdjustQty('${item.id}',${item.moq||1})">+</button>
            </div>
            <button class="cart-item-remove" onclick="event.stopPropagation();panelRemove('${item.id}')" title="Remove">
              <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
  }

  if (totalEl) {
    const est = list.reduce((s, p) => s + (p.priceMin||0) * p.qty, 0);
    totalEl.innerHTML = `
      <span>${list.length} product${list.length>1?'s':''} selected</span>
      <span class="cart-total-est">Est. ~$${est.toFixed(2)}</span>
    `;
  }
}

function panelAdjustQty(productId, delta) {
  const list = getInquiryList();
  const item = list.find(p => p.id === productId);
  if (item) {
    item.qty = Math.max(item.moq || 1, item.qty + delta);
    saveInquiryList(list);
    renderCartPanel();
    updateCartBadge();
  }
}

function panelSetQty(productId, value) {
  const list = getInquiryList();
  const item = list.find(p => p.id === productId);
  if (item) {
    item.qty = Math.max(item.moq || 1, parseInt(value) || item.moq || 1);
    saveInquiryList(list);
    renderCartPanel();
    updateCartBadge();
  }
}

function panelRemove(productId) {
  removeFromInquiry(productId);
  renderCartPanel();
  updateCartBadge();
}

// ─────────────────────────────────
// INIT
// ─────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();

  // ESC closes cart
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cartPanelOpen) toggleCartPanel();
  });
});

// Make functions globally available
window.toggleCartPanel = toggleCartPanel;
window.addToInquiry = addToInquiry;
window.removeFromInquiry = removeFromInquiry;
window.getInquiryList = getInquiryList;
window.saveInquiryList = saveInquiryList;
window.clearInquiry = clearInquiry;
window.updateCartBadge = updateCartBadge;
window.renderCartPanel = renderCartPanel;
window.panelAdjustQty = panelAdjustQty;
window.panelSetQty = panelSetQty;
window.panelRemove = panelRemove;
