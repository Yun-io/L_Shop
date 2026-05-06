import { navigate } from '../router';
import { Product } from '../types'; // Автоматически возьмет из папки types/index.ts
import { createButton } from '../components/ui';

/**
 * Рендерит главную страницу магазина с фильтрами и списком товаров.
 * @returns {Promise<void>}
 */
export const renderHome = async (): Promise<void> => {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <header class="navbar">
      <h1>TechStore 21vek</h1>
      <div class="nav-buttons">
        ${createButton('Войти / Регистрация', 'outline', "document.getElementById('btn-login-click').click()")}
        ${createButton('🛒 Корзина', 'primary', "document.getElementById('btn-cart-click').click()")}
      </div>
    </header>
    
    <main class="container">
      <section class="filters" style="display: flex; gap: 15px; margin-bottom: 20px;">
        <input type="text" id="search-input" placeholder="Поиск товара..." class="input" style="flex: 1;" />
        
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
      </section>
      
      <div id="product-list" class="product-grid">Загрузка товаров...</div>
    </main>

    <!-- Скрытые кнопки для программного роутинга через onclick -->
    <button id="btn-login-click" hidden></button>
    <button id="btn-cart-click" hidden></button>
  `;

  document.getElementById('btn-login-click')?.addEventListener('click', () => navigate('/login'));
  document.getElementById('btn-cart-click')?.addEventListener('click', () => navigate('/cart'));

  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  const categorySelect = document.getElementById('category-select') as HTMLSelectElement;
  const sortSelect = document.getElementById('sort-select') as HTMLSelectElement;

  const triggerSearch = () => {
    loadProducts(searchInput.value, categorySelect.value, sortSelect.value);
  };

  let timeoutId: number;
  searchInput.addEventListener('input', () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(triggerSearch, 400);
  });

  categorySelect.addEventListener('change', triggerSearch);
  sortSelect.addEventListener('change', triggerSearch);

  await triggerSearch();
};

/**
 * Загружает товары с API и отрисовывает их на странице.
 * Данные типизированы интерфейсом Product[].
 * 
 * @param {string} [search=''] - Строка поиска
 * @param {string} [category=''] - Фильтр по категории
 * @param {string} [sort=''] - Сортировка (asc/desc)
 * @returns {Promise<void>}
 */
const loadProducts = async (search = '', category = '', sort = ''): Promise<void> => {
  const list = document.getElementById('product-list');
  if (!list) return;

  try {
    const url = new URL('http://localhost:3000/api/products');
    if (search) url.searchParams.append('search', search);
    if (category) url.searchParams.append('category', category);
    if (sort) url.searchParams.append('sort', sort);

    const res = await fetch(url.toString());

    if (res.status === 500 || res.status === 400) {
      const err = await res.json().catch(() => ({ error: 'Ошибка сервера' }));
      list.innerHTML = `<h3 style="color: red; grid-column: 1/-1; text-align: center;">${err.error || 'Ошибка 500'}</h3>`;
      return;
    }

    // ТИПИЗАЦИЯ ПРИХОДЯЩИХ ДАННЫХ ПО ТЗ
    const products: Product[] = await res.json();

    if (products.length === 0) {
      list.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Товары не найдены</p>';
      return;
    }

    list.innerHTML = products.map((p: Product) => `
      <div class="product-card">
        <div class="product-info">
          <h3 data-title>${p.title}</h3>
          <p class="desc">${p.description}</p>
          <p class="stock" style="color: #777; font-size: 14px; margin-bottom: 5px;">В наличии: ${p.stockCount} шт.</p>
          <strong data-price class="price">${p.price} руб.</strong>
        </div>
        ${createButton('В корзину', 'primary', `window.addToCart('${p.id}')`, 'w-100')}
      </div>
    `).join('');
  } catch (e) {
    list.innerHTML = '<p style="color: red;">Ошибка сети. Проверьте, запущен ли бэкенд.</p>';
  }
};

/**
 * Глобальная функция добавления товара в корзину.
 * @param {string} productId - ID товара
 * @returns {Promise<void>}
 */
window.addToCart = async (productId: string): Promise<void> => {
  try {
    const res = await fetch('http://localhost:3000/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, action: 'add' }),
      credentials: 'include' 
    });

    if (res.status === 401) {
      if(window.showToast) window.showToast('Сначала нужно войти в систему!', true);
      navigate('/login');
    } else if (!res.ok) {
      const err = await res.json();
      if(window.showToast) window.showToast(err.error, true);
    } else {
      if(window.showToast) window.showToast('Товар успешно добавлен в корзину! 🛒', false);
    }
  } catch (e) {
    if(window.showToast) window.showToast('Ошибка при добавлении товара', true);
  }
};