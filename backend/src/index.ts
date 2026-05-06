import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

import { register, login } from './controllers/authController';
import { getProducts } from './controllers/productController';
import { getCart, updateCart } from './controllers/cartController';
import { checkoutDelivery } from './controllers/deliveryController';
import { checkAuth } from './middlewares/authMiddleware';

const app = express();
const PORT = 3000;

// Умная настройка CORS: разрешает любые порты localhost (5173, 5174 и т.д.)
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// --- НАСТРОЙКА SWAGGER ДЛЯ ДОКУМЕНТАЦИИ (ПО ТЗ) ---
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'L_Shop API',
      version: '1.0.0',
      description: 'Документация API для магазина L_Shop',
    },
    servers: [{ url: `http://localhost:${PORT}` }],
  },
  apis: ['./src/index.ts'], // Ищем JSDoc документацию прямо в этом файле
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// ---------------------------------------------------

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован
 *       400:
 *         description: Ошибка валидации
 */
app.post('/api/register', register);

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Авторизация пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успешный вход (устанавливается cookie)
 *       401:
 *         description: Неверные данные
 */
app.post('/api/login', login);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список товаров
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Поиск по названию
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Категория товара
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Сортировка по цене
 *     responses:
 *       200:
 *         description: Массив товаров
 *       400:
 *         description: Некорректный запрос
 *       500:
 *         description: Внутренняя ошибка сервера
 */
app.get('/api/products', getProducts);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Получить корзину (Требуется авторизация)
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Корзина пользователя
 *       401:
 *         description: Не авторизован
 *   post:
 *     summary: Изменить состояние корзины (добавить/удалить)
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               action:
 *                 type: string
 *                 enum: [add, subtract, remove]
 *     responses:
 *       200:
 *         description: Корзина обновлена
 */
app.get('/api/cart', checkAuth, getCart);
app.post('/api/cart', checkAuth, updateCart);

/**
 * @swagger
 * /api/delivery:
 *   post:
 *     summary: Оформление доставки (Требуется авторизация)
 *     tags: [Delivery]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Доставка оформлена, корзина очищена
 *       400:
 *         description: Заполнены не все поля
 */
app.post('/api/delivery', checkAuth, checkoutDelivery);


app.listen(PORT, () => {
  console.log(`Бэкенд запущен на http://localhost:${PORT}`);
  console.log(`Документация API (Swagger) доступна на http://localhost:${PORT}/api-docs`);
});