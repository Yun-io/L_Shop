import { navigate } from '../router';
import type { Product } from '../types';
import { createButton } from '../components/ui';
import { getLocale, translations } from '../utils/i18n';

let currentUser: { name: string; role: string } | null = null;

/**
 * Рендерит главную страницу каталога со списком товаров, фильтрацией и локализацией.
 * 
 * @returns {Promise<void>}
 */
export const renderHome = async (): Promise<void> => {
  const app = document.getElementById('app');
  if (!app) return;

  const lang = getLocale();
  const dict = translations[lang];

  // Проверка сессии (внутри функции renderHome в Home.ts)
  try {
    const meRes = await fetch('http://localhost:3000/api/me', { credentials: 'include' });
    if (meRes.ok) {
      currentUser = await meRes.json(); // Просто считываем объект пользователя напрямую
    } else {
      currentUser = null;
    }
  } catch (e) {
    currentUser = null;
  }

  app.innerHTML = `
    <header class="navbar">
      <h1>${dict.title}</h1>
      <div class="nav-buttons">
        ${currentUser && (currentUser.role === 'owner' || currentUser.role === 'manager') 
          ? createButton(dict.admin_btn, 'secondary', "document.getElementById('btn-admin-click').click()") 
          : ''
        }
        ${currentUser 
          ? `<span class="user-greeting">Привет, ${currentUser.name}!</span>` 
          : createButton(dict.login_btn, 'outline', "document.getElementById('btn-login-click').click()")
        }
        ${createButton(dict.cart_btn, 'primary', "document.getElementById('btn-cart-click').click()")}
      </div>
    </header>
    
    <main class="container">
      <section class="filters" style="display: flex; gap: 15px; margin-bottom: 20px;">
        <input type="text" id="search-input" placeholder="${dict.search_placeholder}" class="input" style="flex: 1;" />
        
        <select id="category-select" class="input">
          <option value="">${dict.all_categories}</option>
          <option value="laptops">${dict.laptops}</option>
          <option value="phones">${dict.phones}</option>
          <option value="accessories">${dict.accessories}</option>
        </select>

        <select id="sort-select" class="input">
          <option value="">${dict.sort_none}</option>
          <option value="asc">${dict.sort_asc}</option>
          <option value="desc">${dict.sort_desc}</option>
        </select>
      </section>
      
      <div id="product-list" class="product-grid">Загрузка товаров...</div>
    </main>

    <button id="btn-login-click" hidden></button>
    <button id="btn-cart-click" hidden></button>
    <button id="btn-admin-click" hidden></button>
  `;

  document.getElementById('btn-login-click')?.addEventListener('click', () => navigate('/login'));
  document.getElementById('btn-cart-click')?.addEventListener('click', () => navigate('/cart'));
  document.getElementById('btn-admin-click')?.addEventListener('click', () => navigate('/admin'));

  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  const categorySelect = document.getElementById('category-select') as HTMLSelectElement;
  const sortSelect = document.getElementById('sort-select') as HTMLSelectElement;

  const triggerSearch = () => {
    loadProducts(searchInput.value, categorySelect.value, sortSelect.value);
  };

  let timeoutId: number;
  searchInput.addEventListener('input', () => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(triggerSearch, 400);
  });

  categorySelect.addEventListener('change', triggerSearch);
  sortSelect.addEventListener('change', triggerSearch);

  await triggerSearch();
};

/**
 * Загружает отфильтрованный список продуктов с API и рендерит их на страницу.
 * 
 * @param {string} [search=''] - Строка текстового поиска.
 * @param {string} [category=''] - Выбранная категория фильтрации.
 * @param {string} [sort=''] - Тип сортировки (asc / desc).
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

    const res = await fetch(url.toString(), {
      headers: { 'Accept-Language': getLocale() },
      credentials: 'include'
    });

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
          <p class="stock">В наличии: ${p.stockCount} шт.</p>
          <strong data-price class="price">${p.price} руб.</strong>
        </div>
        ${createButton('В корзину', 'primary', `window.addToCart('${p.id}')`, 'w-100')}
      </div>
    `).join('');
  } catch (e) {
    list.innerHTML = '<p style="color: red;">Ошибка сети при подключении к API.</p>';
  }
};
/**
 * Глобальная функция добавления товара в корзину.
 * 
 * @param {string} productId - Уникальный идентификатор товара
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
      if (window.showToast) window.showToast('Сначала нужно войти в систему!', true);
      navigate('/login');
    } else if (!res.ok) {
      const err = await res.json();
      if (window.showToast) window.showToast(err.error, true);
    } else {
      if (window.showToast) window.showToast('Товар успешно добавлен в корзину! 🛒', false);
    }
  } catch (e) {
    if (window.showToast) window.showToast('Ошибка при добавлении товара', true);
  }
};