import request from 'supertest';
import express from 'express';
import cookieParser from 'cookie-parser';
import { describe, it, expect } from '@jest/globals'; // ДОБАВЬТЕ ЭТУ СТРОКУ

import { register, login } from '../src/controllers/authController';
import { getProducts } from '../src/controllers/productController';
const app = express();
app.use(express.json());
app.use(cookieParser());

app.post('/api/register', register);
app.post('/api/login', login);
app.get('/api/products', getProducts);

describe('Тестирование API L_Shop', () => {
  it('GET /api/products - должен возвращать статус 200 и массив товаров', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/login - должен возвращать 401 при неверных учетных данных', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ login: 'wronglogin', password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});