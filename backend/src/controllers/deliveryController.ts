
import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { JsonDB } from '../utils/JsonDB';
import { Cart, Product } from '../types';

const cartDB = new JsonDB<Cart>('carts.json');
const productDB = new JsonDB<Product>('products.json');

export const checkoutDelivery = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { address, phone, email } = req.body;

  if (!address || !phone || !email) {
    res.status(400).json({ error: 'Заполните все поля доставки' });
    return;
  }

  const carts = await cartDB.readAll();
  const cartIndex = carts.findIndex(c => c.userId === userId);

  if (cartIndex > -1) {
    const userCart = carts[cartIndex];
    const products = await productDB.readAll();

    // Списание товаров со склада
    for (const item of userCart.items) {
      const productIndex = products.findIndex(p => p.id === item.productId);
      if (productIndex > -1) {
        // Уменьшаем количество на складе, не уходя в отрицательные числа
        products[productIndex].stockCount = Math.max(0, products[productIndex].stockCount - item.quantity);
      }
    }

    // Сохраняем измененные остатки товаров в базе
    await productDB.writeAll(products);

    // Очищаем корзину пользователя
    carts[cartIndex].items = []; 
    await cartDB.writeAll(carts);
  }

  res.status(200).json({ message: 'Доставка успешно оформлена! Склад обновлен, корзина очищена.' });
};