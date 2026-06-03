import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';
import { JsonDB } from '../utils/JsonDB';
import { Session } from '../types';

const sessionDB = new JsonDB<Session>('sessions.json');

export const checkRole = (allowedRoles: string[]) => {
  return async (req: AuthRequest & { cookies?: any }, res: Response, next: NextFunction): Promise<void> => {
    const sessionId = req.cookies?.sessionId;

    if (!sessionId) {
      res.status(401).json({ error: 'Необходима авторизация' });
      return;
    }

    const sessions = await sessionDB.readAll();
    const session = sessions.find((s) => s.sessionId === sessionId);

    if (!session || session.expiresAt < Date.now()) {
      res.status(401).json({ error: 'Сессия истекла или недействительна' });
      return;
    }

    if (!allowedRoles.includes(session.role)) {
      res.status(403).json({ error: 'Доступ запрещен: недостаточно прав' });
      return;
    }

    req.userId = session.userId;
    next();
  };
};