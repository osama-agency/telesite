import axios from 'axios';
import config from '../config/config';
import { CustomerOrder } from '../models/CustomerOrder';
import { ApiOrder } from '../types/index';

export interface ApiCustomerOrder {
  id: string;
  paymentDate: string;
  customerId: string;
  customerName: string;
  address: string;
  deliveryCost: number;
  productName: string;
  quantity: number;
  price: number;
  status: string;
}

export class CustomerOrderService {
  private readonly apiUrl: string;
  private readonly apiToken: string;

  constructor() {
    this.apiUrl = config.apiUrl;
    this.apiToken = config.apiToken;
  }

  private mapNumericStatusToString(numericStatus: number | string): string {
    // Маппинг числовых статусов в строковые
    const statusMap: { [key: number]: string } = {
      1: 'unpaid',     // Ожидание платежа
      2: 'paid',       // На проверке
      3: 'processing', // На отправке  
      4: 'shipped',    // Отправлено
      5: 'cancelled',  // Отменено
      7: 'overdue',    // Просрочено
      8: 'refunded'    // Возврат
    };

    // Если статус уже строка, возвращаем как есть
    if (typeof numericStatus === 'string') {
      return numericStatus;
    }

    // Если это число, возвращаем соответствующий строковый статус
    return statusMap[numericStatus] || 'unpaid';
  }

  private calculatePaymentDate(order: ApiOrder): string {
    console.log(`Processing order ${order.id}: paid_at = ${order.paid_at}, created_at = ${order.created_at}`);
    
    // Если paid_at не null, используем его
    if (order.paid_at) {
      console.log(`Using paid_at: ${order.paid_at}`);
      return order.paid_at;
    }
    
    console.log(`paid_at is null, using created_at as payment date`);
    // Если paid_at null, используем created_at БЕЗ +1 день
    return order.created_at;
  }

  private transformOrderToCustomerOrders(order: ApiOrder): ApiCustomerOrder[] {
    // Преобразуем один заказ в массив записей для каждого товара
    const paymentDate = this.calculatePaymentDate(order);
    
    return order.order_items.map((item, index) => ({
      id: `${order.id}-${index}`,
      paymentDate: paymentDate,
      customerId: order.user.id.toString(),
      customerName: order.user.full_name,
      address: order.user.city,
      deliveryCost: order.delivery_cost,
      productName: item.name,
      quantity: item.quantity,
      price: parseFloat(item.price),
      status: this.mapNumericStatusToString((order as any).status)
    }));
  }

  async getAllOrders(): Promise<ApiCustomerOrder[]> {
    try {
      console.log('Fetching orders from external API...');
      console.log('API URL:', this.apiUrl);
      console.log('API Token:', this.apiToken);
      console.log('Full URL:', `${this.apiUrl}/orders`);
      console.log('Authorization header:', this.apiToken);
      
      const response = await axios.get<ApiOrder[]>(`${this.apiUrl}/orders`, {
        headers: {
          'Authorization': this.apiToken,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log(`Processing ${response.data.length} orders...`);
      
      // Логируем первый заказ для проверки структуры
      if (response.data.length > 0) {
        console.log('Sample order structure:', JSON.stringify(response.data[0], null, 2));
      }
      
      // Преобразуем каждый заказ в записи для таблицы заказов клиентов
      const customerOrders: ApiCustomerOrder[] = [];
      for (const order of response.data) {
        const transformedOrders = this.transformOrderToCustomerOrders(order);
        customerOrders.push(...transformedOrders);
      }

      // Сохраняем в базу данных
      for (const order of customerOrders) {
        await CustomerOrder.findOneAndUpdate(
          { id: order.id },
          order,
          { upsert: true, new: true }
        );
      }

      const orders = await CustomerOrder.find().sort({ paymentDate: -1 });
      console.log(`Found ${orders.length} customer orders in database`);

      return orders.map((order: any) => order.toObject() as ApiCustomerOrder);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Failed to fetch orders:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      } else {
        console.error('Failed to fetch orders:', error);
      }
      throw error;
    }
  }

  async getOrderById(id: string): Promise<ApiCustomerOrder | null> {
    try {
      console.log(`Fetching customer order ${id} from database...`);
      const order = await CustomerOrder.findOne({ id });
      if (!order) {
        console.log(`Customer order ${id} not found`);
        return null;
      }

      return order.toObject() as ApiCustomerOrder;
    } catch (error) {
      console.error(`Failed to fetch customer order ${id}:`, error);
      throw error;
    }
  }
}

// Создаем и экспортируем экземпляр сервиса
export const customerOrderService = new CustomerOrderService(); 