import { navigate } from '../router';
import type { PopulatedCart, PopulatedCartItem } from '../types';

export const renderCart = async (): Promise<void> => {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="container">
      <div class="cart-header">
        <h2> Моя корзина</h2>
        <button id="btn-back" class="btn btn-outline btn-small">← Вернуться к покупкам</button>
      </div>
      <div id="cart-content">
        <div class="loading-text">Загрузка корзины...</div>
      </div>
    </div>
  `;

  document.getElementById('btn-back')?.addEventListener('click', () => navigate('/'));
  await loadCart();
};

const loadCart = async (): Promise<void> => {
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
          <h3>Вы не авторизованы </h3>
          <p>Чтобы просматривать корзину, войдите в свой аккаунт.</p>
          <button id="to-login" class="btn btn-primary">Войти в систему</button>
        </div>`;
      document.getElementById('to-login')?.addEventListener('click', () => navigate('/login'));
      return;
    }

    const cart: PopulatedCart = await res.json();

    if (cart.items.length === 0) {
      content.innerHTML = `
        <div class="empty-cart">
          <h3>Ваша корзина пуста </h3>
          <p>Посмотрите наши товары на главной странице и добавьте что-нибудь!</p>
          <button id="to-home" class="btn btn-primary">Перейти к товарам</button>
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
                <p class="cart-item-price">${item.product.price} руб. / шт.</p>
              </div>
              <div class="cart-item-actions">
                <div class="qty-control">
                  <button class="qty-btn" onclick="window.updateCartItem('${item.product.id}', 'subtract')">−</button>
                  <span class="qty-number">${item.quantity}</span>
                  <button class="qty-btn" onclick="window.updateCartItem('${item.product.id}', 'add')">+</button>
                </div>
                <p data-price="basket" class="cart-item-total">${item.product.price * item.quantity} руб.</p>
                <button class="btn-remove" onclick="window.updateCartItem('${item.product.id}', 'remove')" title="Удалить товар"></button>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="cart-summary">
          <h3>Сумма заказа</h3>
          <div class="summary-row">
            <span>Товары (${cart.items.reduce((acc, item) => acc + item.quantity, 0)} шт.)</span>
            <span>${cart.totalPrice} руб.</span>
          </div>
          <hr>
          <div class="summary-row total">
            <span>Итого:</span>
            <span>${cart.totalPrice} руб.</span>
          </div>
          <button id="btn-delivery" class="btn btn-primary w-100 summary-btn">Оформить доставку</button>
        </div>
      </div>
    `;

    document.getElementById('btn-delivery')?.addEventListener('click', () => navigate('/delivery'));

  } catch (e) {
    content.innerHTML = '<div class="empty-cart"><h3>Ошибка загрузки корзины </h3></div>';
  }
};

window.updateCartItem = async (productId: string, action: 'add' | 'subtract' | 'remove'): Promise<void> => {
  await fetch('http://localhost:3000/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, action }),
    credentials: 'include'
  });
  await loadCart();
};