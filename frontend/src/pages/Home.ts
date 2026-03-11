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
        <div class="search-wrapper">
          <input type="text" id="search-input" placeholder="Поиск товара... (или Enter)" class="input w-100" />
        </div>
        
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

        <!-- Вернули кнопку Применить -->
        <button id="btn-search" class="btn btn-secondary">Применить</button>
      </section>
      
      <div id="product-list" class="product-grid">Загрузка товаров...</div>
    </main>
  `;

  document.getElementById('btn-login')?.addEventListener('click', () => navigate('/login'));
  document.getElementById('btn-cart')?.addEventListener('click', () => navigate('/cart'));

  await loadProducts();

  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  const categorySelect = document.getElementById('category-select') as HTMLSelectElement;
  const sortSelect = document.getElementById('sort-select') as HTMLSelectElement;

  let searchTimeout: ReturnType<typeof setTimeout>;

  const triggerSearch = async () => {
    await loadProducts(searchInput.value, categorySelect.value, sortSelect.value);
  };

  searchInput?.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(triggerSearch, 300);
  });

  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      clearTimeout(searchTimeout);
      triggerSearch();
    }
  });

  document.getElementById('btn-search')?.addEventListener('click', () => {
    clearTimeout(searchTimeout);
    triggerSearch();
  });

  categorySelect?.addEventListener('change', triggerSearch);
  sortSelect?.addEventListener('change', triggerSearch);
};

const loadProducts = async (search = '', category = '', sort = ''): Promise<void> => {
  const list = document.getElementById('product-list');
  if (!list) return;

  try {
    const url = new URL('http://localhost:3000/api/products');
    
    if (search.trim()) url.searchParams.append('search', search.trim());
    if (category) url.searchParams.append('category', category);
    if (sort) url.searchParams.append('sort', sort);

    const res = await fetch(url.toString(), { cache: 'no-store' });
    const products: Product[] = await res.json();

    if (products.length === 0) {
      list.innerHTML = `
        <div class="empty-cart" style="grid-column: 1 / -1;">
          <h3>Товары не найдены 🔍</h3>
          <p>Попробуйте изменить параметры поиска</p>
        </div>`;
      return;
    }

    list.innerHTML = products.map(p => `
      <div class="product-card">
        <div class="product-info">
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