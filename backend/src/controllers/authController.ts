import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { JsonDB } from '../utils/JsonDB';
import { User, Session } from '../types';

const userDB = new JsonDB<User>('users.json');
const sessionDB = new JsonDB<Session>('sessions.json');

export const register = async (req: Request, res: Response): Promise<void> => {
  const { name, email, login, phone, password } = req.body;
  
  // В реальности пароль нужно хэшировать (bcrypt), тут для примера упрощено
  const users = await userDB.readAll();
  
  if (users.some(u => u.email === email || u.login === login)) {
    res.status(400).json({ error: 'Пользователь уже существует' });
    return;
  }

  const newUser: User = { id: uuidv4(), name, email, login, phone, passwordHash: password };
  users.push(newUser);
  await userDB.writeAll(users);

  // Создаем сессию
  const sessionId = uuidv4();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 минут
  
  const sessions = await sessionDB.readAll();
  sessions.push({ sessionId, userId: newUser.id, expiresAt });
  await sessionDB.writeAll(sessions);

  // Ставим куку. httpOnly: true скрывает ее от document.cookie!
  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    maxAge: 10 * 60 * 1000, 
  });

  res.status(201).json({ message: 'Регистрация успешна', user: { name: newUser.name, login: newUser.login } });
};
export const login = async (req: Request, res: Response): Promise<void> => {
  const { login, password } = req.body;
  
  const userDB = new JsonDB<User>('users.json');
  const sessionDB = new JsonDB<Session>('sessions.json');
  
  const users = await userDB.readAll();
  const user = users.find(u => u.login === login && u.passwordHash === password);

  if (!user) {
    res.status(401).json({ error: 'Неверный логин или пароль' });
    return;
  }

  // Создаем новую сессию
  const sessionId = uuidv4();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 минут по ТЗ
  
  const sessions = await sessionDB.readAll();
  sessions.push({ sessionId, userId: user.id, expiresAt });
  await sessionDB.writeAll(sessions);

  // Ставим куку
  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    maxAge: 10 * 60 * 1000,
  });

  res.status(200).json({ message: 'Успешный вход', user: { name: user.name } });
};