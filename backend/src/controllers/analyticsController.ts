import { Request, Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { CustomerOrder } from '../models/CustomerOrder';
import { Order } from '../models/Order';

const analyticsService = new AnalyticsService();

export const analyticsController = {
  // GET /analytics/inventory
  async getInventory(req: Request, res: Response) {
    try {
      const data = await analyticsService.getInventoryAnalytics();
      res.json({
        success: true,
        data,
        total: data.length
      });
    } catch (error) {
      console.error('Error getting inventory analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get inventory analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // GET /analytics/purchases?from=...&to=...
  async getPurchases(req: Request, res: Response) {
    try {
      const { from, to } = req.query;
      const data = await analyticsService.getPurchasesAnalytics(
        from as string,
        to as string
      );
      
      res.json({
        success: true,
        data,
        total: data.length,
        filters: { from, to }
      });
    } catch (error) {
      console.error('Error getting purchases analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get purchases analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // GET /analytics/expenses?type=...&from=...&to=...
  async getExpenses(req: Request, res: Response) {
    try {
      const { type, from, to } = req.query;
      const data = await analyticsService.getExpensesAnalytics(
        type as string,
        from as string,
        to as string
      );
      
      res.json({
        success: true,
        data,
        total: data.length,
        filters: { type, from, to }
      });
    } catch (error) {
      console.error('Error getting expenses analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get expenses analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // GET /analytics/profit?from=...&to=...
  async getProfit(req: Request, res: Response) {
    try {
      const { from, to } = req.query;
      const data = await analyticsService.getProfitAnalytics(
        from as string,
        to as string
      );
      
      res.json({
        success: true,
        data,
        total: data.length,
        filters: { from, to }
      });
    } catch (error) {
      console.error('Error getting profit analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profit analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // GET /analytics/logistics?from=...&to=...
  async getLogistics(req: Request, res: Response) {
    try {
      const { from, to } = req.query;
      const data = await analyticsService.getLogisticsAnalytics(
        from as string,
        to as string
      );
      
      res.json({
        success: true,
        data,
        total: data.length,
        filters: { from, to }
      });
    } catch (error) {
      console.error('Error getting logistics analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get logistics analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // POST /analytics/update
  async updateAnalytics(req: Request, res: Response) {
    try {
      await analyticsService.updateAllAnalytics();
      res.json({
        success: true,
        message: 'Analytics updated successfully'
      });
    } catch (error) {
      console.error('Error updating analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // GET /analytics/dashboard/summary
  async getDashboardSummary(req: Request, res: Response) {
    try {
      const { from, to } = req.query;
      
      // Получаем данные прибыли
      const profitData = await analyticsService.getProfitAnalytics(
        from as string,
        to as string
      );
      
      // Получаем данные расходов
      const expensesData = await analyticsService.getExpensesAnalytics(
        undefined,
        from as string,
        to as string
      );
      
      // Подсчитываем общие метрики
      const totalRevenue = profitData.reduce((sum, item) => sum + (item.revenue || 0), 0);
      const totalProfit = profitData.reduce((sum, item) => sum + (item.netProfit || 0), 0);
      const totalExpenses = expensesData.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
      const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
      
      res.json({
        success: true,
        data: {
          totalRevenue,
          totalProfit,
          totalExpenses,
          profitMargin,
          period: { from, to }
        }
      });
    } catch (error) {
      console.error('Error getting dashboard summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get dashboard summary',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // GET /analytics/dashboard/revenue-trends
  async getRevenueTrends(req: Request, res: Response) {
    try {
      const { from, to } = req.query;
      
      const profitData = await analyticsService.getProfitAnalytics(
        from as string,
        to as string
      );
      
      // Группируем данные по дням
      const dailyData = profitData.reduce((acc: any, item: any) => {
        const date = item.period;
        if (!acc[date]) {
          acc[date] = { date, revenue: 0, profit: 0 };
        }
        acc[date].revenue += item.revenue || 0;
        acc[date].profit += item.netProfit || 0;
        return acc;
      }, {});
      
      const trends = Object.values(dailyData).sort((a: any, b: any) => 
        a.date.localeCompare(b.date)
      );
      
      res.json({
        success: true,
        data: trends,
        total: trends.length
      });
    } catch (error) {
      console.error('Error getting revenue trends:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get revenue trends',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // GET /analytics/dashboard/top-customers
  async getTopCustomers(req: Request, res: Response) {
    try {
      const { limit = 10 } = req.query;
      
      const customerOrders = await CustomerOrder.find({});
      
      // Группируем по клиентам
      const customerStats = customerOrders.reduce((acc: any, order: any) => {
        const total = order.quantity * order.price;
        if (!acc[order.customerName]) {
          acc[order.customerName] = { 
            name: order.customerName, 
            total: 0, 
            orders: 0,
            lastOrder: order.paymentDate
          };
        }
        acc[order.customerName].total += total;
        acc[order.customerName].orders += 1;
        
        // Обновляем дату последнего заказа
        if (order.paymentDate > acc[order.customerName].lastOrder) {
          acc[order.customerName].lastOrder = order.paymentDate;
        }
        
        return acc;
      }, {});
      
      const topCustomers = Object.values(customerStats)
        .sort((a: any, b: any) => b.total - a.total)
        .slice(0, parseInt(limit as string));
      
      res.json({
        success: true,
        data: topCustomers,
        total: topCustomers.length
      });
    } catch (error) {
      console.error('Error getting top customers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get top customers',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // GET /analytics/dashboard/top-cities
  async getTopCities(req: Request, res: Response) {
    try {
      const { limit = 10 } = req.query;
      
      const customerOrders = await CustomerOrder.find({});
      
      // Группируем по городам
      const cityStats = customerOrders.reduce((acc: any, order: any) => {
        const city = order.address.split(',')[0]?.trim() || 'Неизвестно';
        const total = order.quantity * order.price;
        
        if (!acc[city]) {
          acc[city] = { 
            name: city, 
            total: 0, 
            orders: 0,
            customers: new Set()
          };
        }
        
        acc[city].total += total;
        acc[city].orders += 1;
        acc[city].customers.add(order.customerName);
        
        return acc;
      }, {});
      
      // Конвертируем Set в число
      Object.keys(cityStats).forEach(city => {
        cityStats[city].customers = cityStats[city].customers.size;
      });
      
      const topCities = Object.values(cityStats)
        .sort((a: any, b: any) => b.total - a.total)
        .slice(0, parseInt(limit as string));
      
      res.json({
        success: true,
        data: topCities,
        total: topCities.length
      });
    } catch (error) {
      console.error('Error getting top cities:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get top cities',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // GET /analytics/dashboard/order-status
  async getOrderStatusAnalytics(req: Request, res: Response) {
    try {
      const orders = await Order.find({});
      
      // Группируем по статусам
      const statusStats = orders.reduce((acc: any, order: any) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});
      
      // Конвертируем в массив для графиков
      const statusData = Object.entries(statusStats).map(([status, count]) => ({
        name: status,
        value: count as number,
        percentage: ((count as number) / orders.length * 100).toFixed(1)
      }));
      
      res.json({
        success: true,
        data: statusData,
        total: orders.length
      });
    } catch (error) {
      console.error('Error getting order status analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get order status analytics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}; 