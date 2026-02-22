import { renderHome } from './pages/Home';
import { renderRegister } from './pages/Register';
import { renderLogin } from './pages/Login';
import { renderCart } from './pages/Cart';
import { renderDelivery } from './pages/Delivery';

const routes: { [key: string]: () => void } = {
  '/': renderHome,
  '/register': renderRegister,
  '/login': renderLogin,
  '/cart': renderCart,
  '/delivery': renderDelivery,
};

export const navigate = (path: string): void => {
  window.history.pushState({}, '', path);
  handleLocation();
};

export const handleLocation = (): void => {
  const path = window.location.pathname;
  const render = routes[path] || routes['/'];
  
  const appElement = document.getElementById('app');
  if (appElement) {
    appElement.innerHTML = ''; // Очищаем экран
    render(); // Рисуем новую страницу
  }
};

// Слушаем кнопки Назад/Вперед в браузере
window.addEventListener('popstate', handleLocation);