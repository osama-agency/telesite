import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import productRoutes from './routes/productRoutes';
import { OrderController } from './controllers/orderController';
import { connectDB } from './config/database';
import customerOrderRoutes from './routes/customerOrderRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import purchaseRoutes from './routes/purchaseRoutes';
import expenseRoutes from './routes/expenseRoutes';
import { SchedulerService } from './services/SchedulerService';
import { customerOrderService } from './services/customerOrderService';
import { CustomerOrder } from './models/CustomerOrder';
import mongoose from 'mongoose';

const app = express();
const port = process.env.PORT || 3000;

// Получаем подключение к MongoDB
connectDB();

// Запускаем задачи по расписанию
export const schedulerService = new SchedulerService();

// Синхронизация с внешним API при старте
(async () => {
  try {
    await mongoose.connection.asPromise();
    console.log('Clearing existing customer orders...');
    await CustomerOrder.deleteMany({});
    console.log('Re-syncing customer orders with status mapping...');
    await customerOrderService.getAllOrders();
    console.log('Customer orders re-synced successfully');
    
    // Запускаем scheduled tasks после первоначальной синхронизации
    schedulerService.startScheduledTasks();
    console.log('Scheduler started - orders will auto-update every 10 minutes');
  } catch (error) {
    console.error('Failed to re-sync customer orders:', error);
    // Запускаем scheduler даже если первоначальная синхронизация не удалась
    schedulerService.startScheduledTasks();
  }
})();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Controllers
const orderController = new OrderController();

// Routes
const router = express.Router();

// Product routes - используем импортированные роуты
router.use('/products', productRoutes);

// Order routes
router.get('/orders', (req, res, next) => {
  orderController.getOrders(req, res).catch(next);
});

router.post('/orders/sync', (req, res, next) => {
  orderController.syncOrders(req, res).catch(next);
});

router.get('/orders/:id', (req, res, next) => {
  orderController.getOrder(req, res).catch(next);
});

router.patch('/orders/:id', (req, res, next) => {
  orderController.updateOrder(req, res).catch(next);
});

// Customer Order routes
router.use('/customer-orders', customerOrderRoutes);

// Analytics routes
router.use('/analytics', analyticsRoutes);

// Purchase routes
router.use('/purchases', purchaseRoutes);

// Expense routes
router.use('/expenses', expenseRoutes);

// Apply routes
app.use('/api', router);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handling middleware
interface ErrorWithStatus extends Error {
  status?: number;
}

app.use((err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  schedulerService.stopScheduledTasks();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  schedulerService.stopScheduledTasks();
  process.exit(0);
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 