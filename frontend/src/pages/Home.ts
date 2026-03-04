import { navigate } from '../router';
import type { Product } from '../types';
export const renderHome = async (): Promise<void> => {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <header class="navbar">
      <h1>TechStore 21vek</h1>
      <div class="nav-buttons">
        <button id="btn-login" class="btn btn-outline">Войти / Регистрация</button>
        <button id="btn-cart" class="btn btn-primary">🛒 Корзина</button>
      </div>
    </header>
    
    <main class="container">
      <section class="filters">
        <input type="text" id="search-input" placeholder="Поиск товара..." class="input" />
        
        <select id="category-select" class="input">
          <option value="">Все категории</option>
          <option value="laptops">Ноутбуки</option>
          <option value="phones">Телефоны</option>
          <option value="accessories">Аксессуары</option>
        </select>

        <select id="sort-select" class="input">
          <option value="">Без сортировки</option>
          <option value="asc">Сначала дешевые</option>
          <option value="desc">Сначала дорогие</option>
        </select>

        <button id="btn-search" class="btn btn-secondary">Применить</button>
      </section>
      
      <div id="product-list" class="product-grid">Загрузка товаров...</div>
    </main>
  `;

  document.getElementById('btn-login')?.addEventListener('click', () => navigate('/login'));
  document.getElementById('btn-cart')?.addEventListener('click', () => navigate('/cart'));

  await loadProducts();

  document.getElementById('btn-search')?.addEventListener('click', async () => {
    const searchVal = (document.getElementById('search-input') as HTMLInputElement).value;
    const categoryVal = (document.getElementById('category-select') as HTMLSelectElement).value;
    const sortVal = (document.getElementById('sort-select') as HTMLSelectElement).value;
    await loadProducts(searchVal, categoryVal, sortVal);
  });
};

const loadProducts = async (search = '', category = '', sort = ''): Promise<void> => {
  const list = document.getElementById('product-list');
  if (!list) return;

  try {
    const url = new URL('http://localhost:3000/api/products');
    if (search) url.searchParams.append('search', search);
    if (category) url.searchParams.append('category', category);
    if (sort) url.searchParams.append('sort', sort);

    const res = await fetch(url.toString());
    const products: Product[] = await res.json();

    if (products.length === 0) {
      list.innerHTML = '<p>Товары не найдены</p>';
      return;
    }

    list.innerHTML = products.map(p => `
      <div class="product-card">
        <div class="product-info">
          <!-- ВАЖНО ПО ТЗ: data-title и data-price -->
          <h3 data-title>${p.title}</h3>
          <p class="desc">${p.description}</p>
          <p class="stock">В наличии: ${p.stockCount} шт.</p>
          <strong data-price class="price">${p.price} руб.</strong>
        </div>
        <button class="btn btn-primary w-100" onclick="window.addToCart('${p.id}')">В корзину</button>
      </div>
    `).join('');
  } catch (e) {
    list.innerHTML = '<p>Ошибка загрузки товаров</p>';
  }
};

window.addToCart = async (productId: string): Promise<void> => {
  try {
    const res = await fetch('http://localhost:3000/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, action: 'add' }),
      credentials: 'include' 
    });

    if (res.status === 401) {
      window.showToast('Сначала нужно войти в систему!', true);
      navigate('/login');
    } else if (!res.ok) {
      const err = await res.json();
      window.showToast(err.error, true);
    } else {
      window.showToast('Товар успешно добавлен в корзину! 🛒', false);
    }
  } catch (e) {
    window.showToast('Ошибка при добавлении товара', true);
  }
};