// frontend/src/pages/Cart.ts

import { navigate } from '../router';
import type { PopulatedCart, PopulatedCartItem } from '../types';
import { getLocale } from '../utils/i18n';

// Объявляем глобальный метод в самом верху файла для гарантированной доступности при рендере
window.updateCartItem = async (productId: string, action: 'add' | 'subtract' | 'remove'): Promise<void> => {
  try {
    const res = await fetch('http://localhost:3000/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, action }),
      credentials: 'include'
    });
    
    if (res.ok) {
      await renderCart(); // Перерисовываем корзину
    } else {
      const err = await res.json();
      if (window.showToast) window.showToast(err.error, true);
    }
  } catch {
    if (window.showToast) window.showToast('Ошибка сети', true);
  }
};

export const renderCart = async (): Promise<void> => {
  const app = document.getElementById('app');
  if (!app) return;

  const lang = getLocale();
  const dict = {
    ru: {
      title: "Моя корзина 🛒",
      back: "← Вернуться к покупкам",
      empty: "Ваша корзина пуста",
      empty_desc: "Посмотрите наши товары на главной странице и добавьте что-нибудь!",
      to_products: "Перейти к покупкам",
      summary: "Сумма заказа",
      items: "Товары",
      total: "Итого:",
      checkout: "Оформить доставку",
      unauthorized: "Вы не авторизованы 🔒",
      unauthorized_desc: "Войдите в свой аккаунт, чтобы просматривать корзину.",
      login: "Войти в систему",
      price_per_item: "руб. / шт.",
      total_price: "руб.",
      error_loading: "Ошибка загрузки корзины"
    },
    en: {
      title: "My Cart 🛒",
      back: "← Back to shopping",
      empty: "Your cart is empty",
      empty_desc: "Browse our products on the home page and add something!",
      to_products: "Go to catalog",
      summary: "Order Summary",
      items: "Items",
      total: "Total:",
      checkout: "Proceed to Checkout",
      unauthorized: "Unauthorized 🔒",
      unauthorized_desc: "Please log in to view your cart.",
      login: "Log In",
      price_per_item: "BYN / pc.",
      total_price: "BYN",
      error_loading: "Error loading cart"
    }
  }[lang];

  app.innerHTML = `
    <div class="container">
      <div class="cart-header">
        <h2>${dict.title}</h2>
        <button id="btn-back" class="btn btn-outline btn-small">${dict.back}</button>
      </div>
      <div id="cart-content">
        <div class="loading-text">Загрузка...</div>
      </div>
    </div>
  `;

  document.getElementById('btn-back')?.addEventListener('click', () => navigate('/'));
  await loadCart(dict);
};

const loadCart = async (dict: any): Promise<void> => {
  const content = document.getElementById('cart-content');
  if (!content) return;

  try {
    const res = await fetch('http://localhost:3000/api/cart', { 
      credentials: 'include', 
      cache: 'no-store' 
    });
    
    if (res.status === 401) {
      content.innerHTML = `
        <div class="empty-cart">
          <h3>${dict.unauthorized}</h3>
          <p>${dict.unauthorized_desc}</p>
          <button id="to-login" class="btn btn-primary">${dict.login}</button>
        </div>`;
      document.getElementById('to-login')?.addEventListener('click', () => navigate('/login'));
      return;
    }

    const cart: PopulatedCart = await res.json();

    if (!cart.items || cart.items.length === 0) {
      content.innerHTML = `
        <div class="empty-cart">
          <h3>${dict.empty}</h3>
          <p>${dict.empty_desc}</p>
          <button id="to-home" class="btn btn-primary">${dict.to_products}</button>
        </div>`;
      document.getElementById('to-home')?.addEventListener('click', () => navigate('/'));
      return;
    }

    content.innerHTML = `
      <div class="cart-layout">
        <div class="cart-items-list">
          ${cart.items.map((item: PopulatedCartItem) => `
            <div class="cart-item-row">
              <div class="cart-item-info">
                <h3 data-title="basket">${item.product.title}</h3>
                <p class="cart-item-price">${item.product.price} ${dict.price_per_item}</p>
              </div>
              <div class="cart-item-actions">
                <div class="qty-control">
                  <button class="qty-btn" onclick="window.updateCartItem('${item.product.id}', 'subtract')">−</button>
                  <span class="qty-number">${item.quantity}</span>
                  <button class="qty-btn" onclick="window.updateCartItem('${item.product.id}', 'add')">+</button>
                </div>
                <p data-price="basket" class="cart-item-total">${item.product.price * item.quantity} ${dict.total_price}</p>
                <button class="btn-remove" onclick="window.updateCartItem('${item.product.id}', 'remove')" title="Удалить">🗑️</button>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="cart-summary">
          <h3>${dict.summary}</h3>
          <div class="summary-row">
            <span>${dict.items} (${cart.items.reduce((acc, item) => acc + item.quantity, 0)} шт.)</span>
            <span>${cart.totalPrice} ${dict.total_price}</span>
          </div>
          <hr>
          <div class="summary-row total">
            <span>${dict.total}</span>
            <span>${cart.totalPrice} ${dict.total_price}</span>
          </div>
          <button id="btn-delivery" class="btn btn-primary w-100 summary-btn">${dict.checkout}</button>
        </div>
      </div>
    `;

    document.getElementById('btn-delivery')?.addEventListener('click', () => navigate('/delivery'));

  } catch (e) {
    content.innerHTML = `<div class="empty-cart"><h3>${dict.error_loading}</h3></div>`;
  }
};