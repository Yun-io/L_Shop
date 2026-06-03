export const translations: Record<string, Record<string, string>> = {
  ru: {
    title: "TechStore 21vek",
    login_btn: "Войти / Регистрация",
    cart_btn: "🛒 Корзина",
    search_placeholder: "Поиск товара...",
    all_categories: "Все категории",
    laptops: "Ноутбуки",
    phones: "Телефоны",
    accessories: "Аксессуары",
    sort_none: "Без сортировки",
    sort_asc: "Сначала дешевые",
    sort_desc: "Сначала дорогие",
    add_to_cart: "В корзину",
    confirm_country: "Вы из Беларуси?",
    yes: "Да",
    no: "Нет, сменить язык",
  },
  en: {
    title: "TechStore 21st Century",
    login_btn: "Login / Register",
    cart_btn: "🛒 Cart",
    search_placeholder: "Search products...",
    all_categories: "All Categories",
    laptops: "Laptops",
    phones: "Phones",
    accessories: "Accessories",
    sort_none: "No sorting",
    sort_asc: "Price: Low to High",
    sort_desc: "Price: High to Low",
    add_to_cart: "Add to cart",
    confirm_country: "Are you from Belarus?",
    yes: "Yes",
    no: "No, switch language",
  }
};

export const getLocale = (): 'ru' | 'en' => {
  const match = document.cookie.match(new RegExp('(^| )locale=([^;]+)'));
  return (match ? match[2] : 'ru') as 'ru' | 'en';
};

export const setLocale = (locale: 'ru' | 'en'): void => {
  // Сессионная кука без указания Max-Age или Expires удаляется при закрытии вкладки/браузера
  document.cookie = `locale=${locale}; path=/; SameSite=Strict`;
};