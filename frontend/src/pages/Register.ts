import { navigate } from '../router';

export const renderRegister = (): void => {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="container">
      <form id="reg-form" data-registration>
        <h2>Создать аккаунт</h2>
        <!-- required означает, что браузер сам не даст отправить пустую форму -->
        <input class="input" type="text" name="name" placeholder="Ваше Имя" required minlength="2" />
        <input class="input" type="email" name="email" placeholder="Email" required />
        <input class="input" type="text" name="login" placeholder="Логин" required minlength="3" />
        <input class="input" type="tel" name="phone" placeholder="Телефон (например: +375...)" required pattern="^\\+?[0-9]{9,15}$" title="Введите корректный номер телефона"/>
        <input class="input" type="password" name="password" placeholder="Пароль (минимум 6 символов)" required minlength="6" />
        
        <button class="btn btn-primary w-100" type="submit">Зарегистрироваться</button>
        <button class="btn btn-outline w-100" type="button" id="btn-back">Вернуться в магазин</button>
      </form>
    </div>
  `;

  document.getElementById('btn-back')?.addEventListener('click', () => navigate('/'));

  document.getElementById('reg-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    // НАШИ ПРОВЕРКИ (ФРОНТЕНД ВАЛИДАЦИЯ)
    if (String(data.password).length < 6) {
      window.showToast('Пароль должен быть не менее 6 символов!', true);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include' 
      });

      if (response.ok) {
        window.showToast('Регистрация успешна! Добро пожаловать.', false); // Зеленое уведомление
        navigate('/');
      } else {
        const err = await response.json();
        window.showToast(err.error, true); // Красное уведомление
      }
    } catch (err) {
      window.showToast('Ошибка соединения с сервером', true);
    }
  });
};