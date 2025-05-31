// API Configuration
export const API_BASE_URL = 'http://localhost:3000/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Analytics
  analytics: {
    summary: '/analytics/summary',
    revenue: '/analytics/revenue',
    topProducts: '/analytics/top-products',
    periods: '/analytics/periods',
  },
  
  // Products
  products: {
    list: '/products',
    update: (id: string) => `/products/${id}`,
    bulkEdit: '/products/bulk-edit-try-rate',
  },
  
  // Orders
  orders: {
    list: '/orders',
    update: (id: string) => `/orders/${id}`,
    receive: (id: string) => `/orders/${id}/receive`,
  },
  
  // Purchases
  purchases: {
    list: '/purchases',
    create: '/purchases',
    receive: (id: string) => `/purchases/${id}/receive`,
  },
  
  // Expenses
  expenses: {
    list: '/expenses',
    create: '/expenses',
    summary: '/expenses/summary',
  },
  
  // Customer Orders
  customerOrders: {
    list: '/customer-orders',
    create: '/customer-orders',
    customers: '/customer-orders/customers',
  },
};

// API Headers
export const getHeaders = () => ({
  'Content-Type': 'application/json',
});

// API Request helper
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}; 