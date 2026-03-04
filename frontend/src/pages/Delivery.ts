import { navigate } from '../router';

export const renderDelivery = (): void => {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="container">
      <h2>Оформление доставки</h2>
      <form id="delivery-form" data-delivery>
        <input class="input" type="text" name="address" placeholder="Адрес доставки" required />
        <input class="input" type="tel" name="phone" placeholder="Телефон" required />
        <input class="input" type="email" name="email" placeholder="Email для чека" required />
        <button class="btn btn-primary" type="submit">Оплатить и заказать</button>
      </form>
      <button class="btn btn-secondary" id="btn-back">Отмена (в корзину)</button>
    </div>
  `;

  document.getElementById('btn-back')?.addEventListener('click', () => navigate('/cart'));

  document.getElementById('delivery-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target as HTMLFormElement).entries());

    try {
      const res = await fetch('http://localhost:3000/api/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      if (res.ok) {
        alert('Заказ оформлен! Корзина очищена.');
        navigate('/');
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (e) {
      console.error(e);
    }
  });
};