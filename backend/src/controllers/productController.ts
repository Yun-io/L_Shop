import { Request, Response } from 'express';
import { JsonDB } from '../utils/JsonDB';
import { Product } from '../types';

const productDB = new JsonDB<Product>('products.json');

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  let products = await productDB.readAll();
 const category = req.query.category as string | undefined;
  if (category) {
    products = products.filter(p => p.category === category);
  }
  const search = req.query.search as string | undefined;
  const sort = req.query.sort as 'asc' | 'desc' | undefined;

  if (search) {
    const lowerSearch = search.toLowerCase();
    products = products.filter(
      (p) => p.title.toLowerCase().includes(lowerSearch) || p.description.toLowerCase().includes(lowerSearch)
    );
  }

  if (sort === 'asc') products.sort((a, b) => a.price - b.price);
  if (sort === 'desc') products.sort((a, b) => b.price - a.price);

  res.json(products);
};