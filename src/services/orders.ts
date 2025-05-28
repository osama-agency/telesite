import { toast } from 'sonner';
// More defensive API_URL initialization
const API_URL = (() => {
  try {
    return import.meta?.env?.VITE_API_URL || 'http://localhost:3000';
  } catch {
    return 'http://localhost:3000';
  }
})();
export interface OrderProduct {
  id: string;
  name: string;
  quantity: number;
  costPriceTRY: number;
}
export interface Order {
  id: string;
  date: string;
  tryRate: number;
  products: OrderProduct[];
  totalTRY: number;
  totalRUB: number;
  createdAt: string;
  status: 'pending' | 'received';
}
export const ordersApi = {
  getAll: async (): Promise<Order[]> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      return await response.json();
    } catch (error) {
      toast.error('Не удалось загрузить заказы');
      return [];
    }
  },
  create: async (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'totalTRY' | 'totalRUB'>): Promise<Order> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      if (!response.ok) throw new Error('Failed to create order');
      return await response.json();
    } catch (error) {
      toast.error('Не удалось создать заказ');
      throw error;
    }
  },
  update: async (id: string, updates: Partial<Order>): Promise<Order> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update order');
      return await response.json();
    } catch (error) {
      toast.error('Не удалось обновить заказ');
      throw error;
    }
  },
  delete: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete order');
    } catch (error) {
      toast.error('Не удалось удалить заказ');
      throw error;
    }
  },
  receive: async (id: string, data: {
    products: {
      id: string;
      quantity: number;
    }[];
    deliveryCost: number;
  }): Promise<Order> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${id}/receive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to receive order');
      return await response.json();
    } catch (error) {
      toast.error('Не удалось оприходовать заказ');
      throw error;
    }
  }
};