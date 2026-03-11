import { Request, Response, NextFunction } from 'express';
import { JsonDB } from '../utils/JsonDB';
import { Session } from '../types';

// Расширяем тип Request, чтобы передавать userId дальше
export interface AuthRequest extends Request {
  userId?: string;
}

const sessionDB = new JsonDB<Session>('sessions.json');

export const checkAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const sessionId = req.cookies.sessionId;

  if (!sessionId) {
    res.status(401).json({ error: 'Не авторизован. Иди на расстрел.' });
    return;
  }

  const sessions = await sessionDB.readAll();
  const session = sessions.find((s) => s.sessionId === sessionId);

  if (!session || session.expiresAt < Date.now()) {
    res.status(401).json({ error: 'Сессия истекла или недействительна.' });
    return;
  }

  req.userId = session.userId;
  next();
};