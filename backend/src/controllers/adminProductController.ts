import { Response, Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { JsonDB } from '../utils/JsonDB';
import { Product } from '../types';

const productDB = new JsonDB<Product>('products.json');

export const addProduct = async (req: Request, res: Response): Promise<void> => {
  const { title, description, price, category, stockCount, tags, translations } = req.body;

  if (!title || !price || !category) {
    res.status(400).json({ error: 'Укажите обязательные поля: название, цена, категория' });
    return;
  }

  const products = await productDB.readAll();
  const newProduct: Product = {
    id: uuidv4(),
    title,
    description: description || '',
    price: Number(price),
    category,
    isAvailable: true,
    stockCount: Number(stockCount || 0),
    tags: tags || [],
    translations: translations || {}
  };

  products.push(newProduct);
  await productDB.writeAll(products);

  res.status(201).json({ message: 'Товар добавлен', product: newProduct });
};

export const editProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const updates = req.body;

  const products = await productDB.readAll();
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Товар не найден' });
    return;
  }

  products[index] = { ...products[index], ...updates };
  await productDB.writeAll(products);

  res.status(200).json({ message: 'Товар обновлен', product: products[index] });
};