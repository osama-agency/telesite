import express from 'express';
import { analyticsController } from '../controllers/analyticsController';

const router = express.Router();

// Аналитические эндпоинты
router.get('/inventory', analyticsController.getInventory);
router.get('/purchases', analyticsController.getPurchases);
router.get('/expenses', analyticsController.getExpenses);
router.get('/profit', analyticsController.getProfit);
router.get('/logistics', analyticsController.getLogistics);

// Новые эндпоинты для дашборда
router.get('/dashboard/summary', analyticsController.getDashboardSummary);
router.get('/dashboard/revenue-trends', analyticsController.getRevenueTrends);
router.get('/dashboard/top-customers', analyticsController.getTopCustomers);
router.get('/dashboard/top-cities', analyticsController.getTopCities);
router.get('/dashboard/order-status', analyticsController.getOrderStatusAnalytics);

// Обновление аналитики
router.post('/update', analyticsController.updateAnalytics);

export default router; 