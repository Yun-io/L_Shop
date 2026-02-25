import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { register } from './controllers/authController';
import { getProducts } from './controllers/productController';
import { checkAuth, AuthRequest } from './middlewares/authMiddleware';
import { login } from './controllers/authController';
import { getCart, updateCart } from './controllers/cartController';
import { checkoutDelivery } from './controllers/deliveryController';

const app = express();
const PORT = 3000;

// Настройка CORS ВАЖНА для работы кук!
app.use(cors({
  origin: 'http://localhost:5173', // Порт Vite фронтенда
  credentials: true // Разрешает передачу кук
}));
app.use(express.json());
app.use(cookieParser());

// Роуты
app.post('/api/register', register);
app.get('/api/products', getProducts);
app.post('/api/login', login);
app.get('/api/cart', checkAuth, getCart);
app.post('/api/cart', checkAuth, updateCart);
app.post('/api/delivery', checkAuth, checkoutDelivery);
// Пример защищенного роута корзины
app.get('/api/cart', checkAuth, (req: AuthRequest, res) => {
  res.json({ message: `Корзина пользователя ${req.userId}` });
});

app.listen(PORT, () => {
  console.log(`Бэкенд запущен на http://localhost:${PORT}`);
});