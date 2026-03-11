import { navigate } from '../router';

export const renderLogin = (): void => {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="container">
      <h2>Вход в систему</h2>
      <form id="login-form">
        <input class="input" type="text" name="login" placeholder="Логин" required />
        <input class="input" type="password" name="password" placeholder="Пароль" required />
        <button class="btn btn-primary" type="submit">Войти</button>
      </form>
      <button class="btn btn-outline" id="btn-to-reg">Нет аккаунта? Регистрация</button>
      <br><br>
      <button class="btn btn-secondary" id="btn-back">На главную</button>
    </div>
  `;

  document.getElementById('btn-back')?.addEventListener('click', () => navigate('/'));
  document.getElementById('btn-to-reg')?.addEventListener('click', () => navigate('/register'));

  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target as HTMLFormElement).entries());

    try {
      const res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });

      if (res.ok) {
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