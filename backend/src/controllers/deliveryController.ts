import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { JsonDB } from '../utils/JsonDB';
import { Cart } from '../types';

const cartDB = new JsonDB<Cart>('carts.json');

export const checkoutDelivery = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { address, phone, email } = req.body;

  if (!address || !phone || !email) {
    res.status(400).json({ error: 'Заполните все поля доставки' });
    return;
  }

  // Здесь должна быть логика сохранения заказа, но по ТЗ просят просто очистить корзину
  const carts = await cartDB.readAll();
  const cartIndex = carts.findIndex(c => c.userId === userId);

  if (cartIndex > -1) {
    carts[cartIndex].items = []; // Очищаем корзину
    await cartDB.writeAll(carts);
  }

  res.status(200).json({ message: 'Доставка успешно оформлена! Корзина очищена.' });
};