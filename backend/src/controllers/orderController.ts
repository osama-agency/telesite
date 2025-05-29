import { Request, Response } from 'express';
import { OrderService } from '../services/orderService';

const orderService = new OrderService();

export class OrderController {
  async syncOrders(req: Request, res: Response) {
    try {
      console.log('Starting orders synchronization...');
      await orderService.syncOrders();
      console.log('Orders synchronization completed');
      res.json({ message: 'Orders synchronized successfully' });
    } catch (error) {
      console.error('Controller error during sync:', error);
      res.status(500).json({ 
        message: 'Failed to sync orders',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getOrders(req: Request, res: Response) {
    try {
      console.log('Fetching all orders...');
      const orders = await orderService.getAllOrders();
      console.log(`Found ${orders.length} orders`);
      res.json({
        data: orders,
        metadata: {
          total: orders.length,
          page: 1,
          limit: orders.length
        }
      });
    } catch (error) {
      console.error('Controller error:', error);
      res.status(500).json({ 
        message: 'Failed to fetch orders',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getOrder(req: Request, res: Response) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      console.error('Controller error:', error);
      res.status(500).json({ 
        message: 'Failed to fetch order',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async updateOrder(req: Request, res: Response) {
    try {
      const order = await orderService.updateOrder(req.params.id, req.body);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      console.error('Controller error:', error);
      res.status(500).json({ 
        message: 'Failed to update order',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 