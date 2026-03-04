import { navigate } from '../router';
import type { PopulatedCart, PopulatedCartItem } from '../types';
export const renderCart = async (): Promise<void> => {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `<h2>Моя корзина</h2><div id="cart-content">Загрузка...</div>`;

  await loadCart();
};

const loadCart = async (): Promise<void> => {
  const content = document.getElementById('cart-content');
  if (!content) return;

  try {
    const res = await fetch('http://localhost:3000/api/cart', { credentials: 'include' });
    
    if (res.status === 401) {
      content.innerHTML = `<p>Вы не авторизованы. <button id="to-login">Войти</button></p>`;
      document.getElementById('to-login')?.addEventListener('click', () => navigate('/login'));
      return;
    }

    const cart: PopulatedCart = await res.json();

    content.innerHTML = cart.items.map((item: PopulatedCartItem) => `
      <div class="cart-item">
        <div class="cart-item-info">
          <h3 data-title="basket">${item.product.title}</h3>
          <p data-price="basket" class="price">${item.product.price} руб.</p>
        </div>
        <div class="cart-controls">
          <button class="btn btn-small" onclick="window.updateCartItem('${item.product.id}', 'subtract')">-</button>
          <span>${item.quantity}</span>
          <button class="btn btn-small" onclick="window.updateCartItem('${item.product.id}', 'add')">+</button>
          <button class="btn btn-danger btn-small" onclick="window.updateCartItem('${item.product.id}', 'remove')">🗑️</button>
        </div>
      </div>
    `).join('') + `
      <h3>Итого: ${cart.totalPrice} руб.</h3>
      <button id="btn-delivery" style="background: green; color: white;">Оформить доставку</button>
      <button id="btn-back">Назад</button>
    `;

    document.getElementById('btn-delivery')?.addEventListener('click', () => navigate('/delivery'));
    document.getElementById('btn-back')?.addEventListener('click', () => navigate('/'));

  } catch (e) {
    content.innerHTML = 'Ошибка загрузки корзины';
  }
};

window.updateCartItem = async (productId: string, action: 'add' | 'subtract' | 'remove'): Promise<void> => {
  await fetch('http://localhost:3000/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, action }),
    credentials: 'include'
  });
  await loadCart(); // Перерисовываем корзину
};