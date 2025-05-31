import { API_ENDPOINTS, apiRequest } from './config';
import type { 
  Product, 
  AnalyticsSummary, 
  RevenueData, 
  TopProduct,
  Purchase,
  Expense,
  CustomerOrder 
} from '../types';

// Analytics Services
export const analyticsService = {
  getSummary: async (period = '30d'): Promise<AnalyticsSummary> => {
    return apiRequest(`${API_ENDPOINTS.analytics.summary}?period=${period}`);
  },
  
  getRevenue: async (period = '30d'): Promise<RevenueData[]> => {
    return apiRequest(`${API_ENDPOINTS.analytics.revenue}?period=${period}`);
  },
  
  getTopProducts: async (period = '30d', limit = 10): Promise<TopProduct[]> => {
    return apiRequest(`${API_ENDPOINTS.analytics.topProducts}?period=${period}&limit=${limit}`);
  },
};

// Products Services
export const productsService = {
  getProducts: async (): Promise<Product[]> => {
    return apiRequest(API_ENDPOINTS.products.list);
  },
  
  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    return apiRequest(API_ENDPOINTS.products.update(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  bulkEditTryRate: async (productIds: string[], newRate: number): Promise<void> => {
    return apiRequest(API_ENDPOINTS.products.bulkEdit, {
      method: 'POST',
      body: JSON.stringify({ productIds, newRate }),
    });
  },
};

// Purchases Services
export const purchasesService = {
  getPurchases: async (): Promise<Purchase[]> => {
    return apiRequest(API_ENDPOINTS.purchases.list);
  },
  
  createPurchase: async (data: Omit<Purchase, 'id'>): Promise<Purchase> => {
    return apiRequest(API_ENDPOINTS.purchases.create, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  receivePurchase: async (id: string): Promise<Purchase> => {
    return apiRequest(API_ENDPOINTS.purchases.receive(id), {
      method: 'POST',
    });
  },
};

// Expenses Services
export const expensesService = {
  getExpenses: async (): Promise<Expense[]> => {
    return apiRequest(API_ENDPOINTS.expenses.list);
  },
  
  createExpense: async (data: Omit<Expense, 'id'>): Promise<Expense> => {
    return apiRequest(API_ENDPOINTS.expenses.create, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  getExpenseSummary: async (): Promise<any> => {
    return apiRequest(API_ENDPOINTS.expenses.summary);
  },
};

// Customer Orders Services
export const customerOrdersService = {
  getOrders: async (): Promise<CustomerOrder[]> => {
    return apiRequest(API_ENDPOINTS.customerOrders.list);
  },
  
  createOrder: async (data: Omit<CustomerOrder, 'id'>): Promise<CustomerOrder> => {
    return apiRequest(API_ENDPOINTS.customerOrders.create, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  getCustomers: async (): Promise<string[]> => {
    return apiRequest(API_ENDPOINTS.customerOrders.customers);
  },
}; 