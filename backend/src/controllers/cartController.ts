import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { JsonDB } from '../utils/JsonDB';
import { Cart, Product, PopulatedCart, PopulatedCartItem } from '../types';

const cartDB = new JsonDB<Cart>('carts.json');
const productDB = new JsonDB<Product>('products.json');

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const carts = await cartDB.readAll();
  const products = await productDB.readAll();
  
  const userCart = carts.find(c => c.userId === userId) || { userId, items: [] };

  let totalPrice = 0;
  const populatedItems: PopulatedCartItem[] = [];

  for (const item of userCart.items) {
    const product = products.find(p => p.id === item.productId);
    if (product) {
      populatedItems.push({ product, quantity: item.quantity });
      totalPrice += product.price * item.quantity;
    }
  }

  const response: PopulatedCart = { userId, items: populatedItems, totalPrice };
  res.json(response);
};

export const updateCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const { productId, action } = req.body; 

  const products = await productDB.readAll();
  const product = products.find(p => p.id === productId);

  if (!product || !product.isAvailable) {
    res.status(404).json({ error: 'Товар недоступен' });
    return;
  }

  const carts = await cartDB.readAll();
  let userCart = carts.find(c => c.userId === userId);

  if (!userCart) {
    userCart = { userId, items: [] };
    carts.push(userCart);
  }

  const itemIndex = userCart.items.findIndex(i => i.productId === productId);

  if (action === 'add') {
    if (itemIndex > -1) {
      if (userCart.items[itemIndex].quantity >= product.stockCount) {
        res.status(400).json({ error: 'Больше нет на складе' });
        return;
      }
      userCart.items[itemIndex].quantity += 1;
    } else {
      userCart.items.push({ productId, quantity: 1 });
    }
  } else if (action === 'subtract') {
    if (itemIndex > -1) {
      userCart.items[itemIndex].quantity -= 1;
      if (userCart.items[itemIndex].quantity <= 0) {
        userCart.items.splice(itemIndex, 1);
      }
    }
  } else if (action === 'remove') {
    if (itemIndex > -1) {
      userCart.items.splice(itemIndex, 1);
    }
  }

  await cartDB.writeAll(carts);
  res.json({ message: 'Корзина обновлена' });
};