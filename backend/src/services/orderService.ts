import axios from 'axios';
import { ApiOrder, OrderWithProducts } from '../types';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import config from '../config/config';

export class OrderService {
  private readonly apiUrl: string;
  private readonly apiToken: string;

  constructor() {
    this.apiUrl = config.apiUrl;
    this.apiToken = config.apiToken;
  }

  private async enrichOrderWithProductIds(order: ApiOrder): Promise<OrderWithProducts> {
    try {
      // Найти продукты по имени
      const productNames = order.order_items.map(item => item.name);
      const products = await Product.find({ name: { $in: productNames } });
      const productMap = new Map(products.map(p => [p.name, p.id]));

      return {
        ...order,
        order_items: order.order_items.map(item => ({
          ...item,
          product_id: productMap.get(item.name)
        }))
      };
    } catch (error) {
      console.error(`Failed to enrich order ${order.id}:`, error);
      throw error;
    }
  }

  async syncOrders(): Promise<void> {
    try {
      console.log('Fetching orders from external API...');
      const response = await axios.get<ApiOrder[]>(`${this.apiUrl}/orders`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log(`Processing ${response.data.length} orders...`);
      for (const order of response.data) {
        console.log(`Updating order ${order.id} in database...`);
        await Order.findOneAndUpdate(
          { id: order.id },
          order,
          { upsert: true, new: true }
        );
      }

      console.log('Orders synchronization completed successfully');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Failed to sync orders:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      } else {
        console.error('Failed to sync orders:', error);
      }
      throw error;
    }
  }

  async getAllOrders(): Promise<OrderWithProducts[]> {
    try {
      console.log('Fetching orders from database...');
      const orders = await Order.find().sort({ created_at: -1 });
      console.log(`Found ${orders.length} orders in database`);

      console.log('Enriching orders with product IDs...');
      const enrichedOrders = await Promise.all(
        orders.map(order => this.enrichOrderWithProductIds(order.toObject()))
      );
      console.log('Orders enrichment completed');

      return enrichedOrders;
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw error;
    }
  }

  async getOrderById(id: string): Promise<OrderWithProducts | null> {
    try {
      console.log(`Fetching order ${id} from database...`);
      const order = await Order.findOne({ id });
      if (!order) {
        console.log(`Order ${id} not found`);
        return null;
      }

      console.log(`Enriching order ${id} with product IDs...`);
      return this.enrichOrderWithProductIds(order.toObject());
    } catch (error) {
      console.error(`Failed to fetch order ${id}:`, error);
      throw error;
    }
  }

  async updateOrder(id: string, updates: Partial<ApiOrder>): Promise<OrderWithProducts | null> {
    try {
      console.log(`Updating order ${id} in external API...`);
      const response = await axios.patch<ApiOrder>(
        `${this.apiUrl}/orders/${id}`,
        updates,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`Updating order ${id} in database...`);
      const updatedOrder = await Order.findOneAndUpdate(
        { id },
        response.data,
        { new: true }
      );

      if (!updatedOrder) {
        console.log(`Order ${id} not found in database`);
        return null;
      }

      console.log(`Enriching updated order ${id} with product IDs...`);
      return this.enrichOrderWithProductIds(updatedOrder.toObject());
    } catch (error) {
      console.error(`Failed to update order ${id}:`, error);
      throw error;
    }
  }
} 