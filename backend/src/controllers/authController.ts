import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { JsonDB } from '../utils/JsonDB';
import { User, Session } from '../types';

const userDB = new JsonDB<User>('users.json');
const sessionDB = new JsonDB<Session>('sessions.json');

/**
 * Обработчик регистрации нового пользователя.
 * Присваивает роль 'owner' первому зарегистрированному пользователю, остальным — 'user'.
 * 
 * @param {Request} req - Объект запроса Express
 * @param {Response} res - Объект ответа Express
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, login, phone, password } = req.body;
  const users = await userDB.readAll();
  
  if (users.some(u => u.email === email || u.login === login)) {
    res.status(400).json({ error: 'Пользователь уже существует' });
    return;
  }

  const role = users.length === 0 ? 'owner' : 'user';

  const newUser: User = { 
    id: uuidv4(), 
    name, 
    email, 
    login, 
    phone, 
    passwordHash: password,
    role,
    recommendedTags: []
  };
  users.push(newUser);
  await userDB.writeAll(users);

  // Никаких кук и сессий здесь не создаем — только подтверждаем успешность записи в БД
  res.status(201).json({ message: 'Регистрация успешна. Войдите под своими данными.' });
};

/**
 * Обработчик авторизации существующего пользователя.
 * Проверяет логин/пароль и создает сессионную куку.
 * 
 * @param {Request} req - Объект запроса Express
 * @param {Response} res - Объект ответа Express
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const { login, password } = req.body;
  
  const users = await userDB.readAll();
  const user = users.find(u => u.login === login && u.passwordHash === password);

  if (!user) {
    res.status(401).json({ error: 'Неверный логин или пароль' });
    return;
  }

  const sessionId = uuidv4();
  const expiresAt = Date.now() + 30 * 60 * 1000;
  
  const sessions = await sessionDB.readAll();
  const userRole = user.role || 'user';
  
  sessions.push({ sessionId, userId: user.id, expiresAt, role: userRole });
  await sessionDB.writeAll(sessions);

  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    maxAge: 30 * 60 * 1000,
    sameSite: 'lax',
    path: '/'
  });

  res.status(200).json({ message: 'Успешный вход', user: { name: user.name, role: userRole } });
};

/**
 * Проверяет текущую сессию по куке sessionId и возвращает данные активного пользователя.
 * 
 * @param {Request} req - Объект запроса Express
 * @param {Response} res - Объект ответа Express
 */
export const checkMe = async (req: Request, res: Response): Promise<void> => {
  const sessionId = req.cookies.sessionId;
  if (!sessionId) {
    res.status(401).json({ error: 'Гость' });
    return;
  }

  const sessions = await sessionDB.readAll();
  const session = sessions.find(s => s.sessionId === sessionId && s.expiresAt > Date.now());

  if (!session) {
    res.status(401).json({ error: 'Сессия истекла' });
    return;
  }

  const users = await userDB.readAll();
  const user = users.find(u => u.id === session.userId);

  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' });
    return;
  }

  res.json({ name: user.name, role: user.role || 'user', id: user.id });
};