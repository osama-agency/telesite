/**
 * API Service Module
 * Централизованный модуль для работы с API бэкенда
 * Поддерживает как реальный бэкенд, так и демо-режим
 */

import { toast } from 'sonner';

// Import demo API if in demo mode
import * as demoApi from './demoApi';

/**
 * Проверяет, активен ли демо-режим
 * Демо-режим используется для демонстрации функционала без реального бэкенда
 */
const isDemoMode = () => {
  if (typeof window !== 'undefined') {
    // Check localStorage first, then window.isDemoMode
    const savedDemoMode = localStorage.getItem('isDemoMode') === 'true';
    return savedDemoMode || window.isDemoMode === true;
  }
  return false;
};

// Типы для пагинации
export interface PaginationParams {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  metadata: {
    total: number;
    page: number;
    limit: number;
  };
}

// Базовый URL для API бэкенда
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Типы ошибок API
export interface ApiError {
  message: string;
  status: number;
  details?: Record<string, string[]>;
  code?: string;
}

// Base response type
export interface ApiResponse<T> {
  data: T;
  message?: string;
  metadata?: {
    total?: number;
    page?: number;
    perPage?: number;
  };
}

// Product types
export interface ApiProductBase {
  id: number;
  name: string;
  description: string | null;
  price: string | null;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  ancestry: string | null;
  weight: string | null;
  dosage_form: string | null;
  package_quantity: number | null;
  main_ingredient: string | null;
  brand: string | null;
  old_price: string | null;
}

export interface ApiProduct extends ApiProductBase {
  // Additional calculated fields from backend
  averageSellingPrice: number;
  costPriceTRY: number;
  costPriceRUB: number;
  logisticsCost: number;
  markup: number;
  marginPercent: number;
  netProfit: number;
  netProfitTotal: number;
  totalCosts: number;
  profitPercentTotal: number;
  soldPeriod: number;
  soldQuantity?: number; // Количество проданных товаров
  averageConsumptionDaily: number;
  daysInStock: number;
  orderPoint: boolean;
  exchangeRate: number;
  fixedCosts: number;
  deliveryDays: number;
  revenue?: number; // Оборот за период
  inDelivery?: number; // Количество товаров в доставке
  firstSaleDate?: string; // Дата первой продажи товара
}

// Order types
export interface OrderWithProducts {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  payment_status: 'pending' | 'paid' | 'failed';
  delivery_status: 'pending' | 'processing' | 'shipped' | 'delivered';
  total_amount: string;
  items: Array<{
    product_id: number;
    product_name: string;
    quantity: number;
    price: string;
  }>;
  created_at: string;
  updated_at: string;
}

// Customer Order types
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

// Expense type
export interface Expense {
  id: string;
  date: string;
  type: 'Логистика' | 'Реклама' | 'ФОТ' | 'Прочее' | 'Закупка товара';
  description: string;
  amount: number;
  amountRUB?: number;
  productId?: string;
  productName?: string;
  purchaseItems?: Array<{
    productName: string;
    quantity: number;
    unitCostTRY: number;
  }>;
  createdAt: string;
}

// Enhanced error handler with toast notifications
const handleApiError = async (response: Response): Promise<never> => {
  const error: ApiError = {
    message: 'An unexpected error occurred',
    status: response.status,
    details: {},
    code: 'UNKNOWN_ERROR'
  };
  try {
    const data = await response.json();
    error.message = data.message || error.message;
    error.details = data.details;
    error.code = data.code;
    // Show error toast
    toast.error(error.message);
  } catch {
    toast.error('Произошла неизвестная ошибка');
  }
  throw error;
};

// Enhanced fetch wrapper with success notifications
async function fetchApi<T>(endpoint: string, options?: RequestInit & {
  timeout?: number;
  showSuccessToast?: boolean;
  successMessage?: string;
}): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeout = options?.timeout || 30000;
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      await handleApiError(response);
    }
    const data = await response.json();
    // Show success toast if requested
    if (options?.showSuccessToast) {
      toast.success(options.successMessage || 'Операция выполнена успешно');
    }
    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        toast.error('Превышено время ожидания запроса');
        throw new Error('Request timeout');
      }
      throw error;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Enhanced Products API with success messages
export const productsApi = {
  getAll: async (params?: PaginationParams & { exchangeRate?: number }): Promise<PaginatedResponse<ApiProduct>> => {
    // Use demo API if in demo mode
    if (isDemoMode()) {
      const result = await demoApi.productsApi.getAll();
      return {
        data: result.data as any,
        metadata: {
          total: result.data.length,
          page: 1,
          limit: 20
        }
      };
    }
    
    try {
      const queryParams = new URLSearchParams();
      if (params?.exchangeRate) {
        queryParams.append('exchangeRate', params.exchangeRate.toString());
      }
      if (params?.from) {
        queryParams.append('from', params.from);
      }
      if (params?.to) {
        queryParams.append('to', params.to);
      }
      
      const response = await fetch(`${API_URL}/products?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return await response.json();
    } catch (error) {
      toast.error('Не удалось загрузить товары');
      throw error;
    }
  },
  create: async (productData: {
    name: string;
    costPriceTRY: number;
  }): Promise<ApiProduct> => {
    // Use demo API if in demo mode
    if (isDemoMode()) {
      return await demoApi.productsApi.create(productData) as any;
    }
    
    try {
      const toastId = toast.loading('Создание товара...');
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) throw new Error('Failed to create product');
      const newProduct = await response.json();
      
      toast.success('Товар успешно создан', {
        id: toastId
      });
      
      return newProduct;
    } catch (error) {
      toast.error('Не удалось создать товар');
      throw error;
    }
  },
  sync: async (): Promise<void> => {
    try {
      const toastId = toast.loading('Синхронизация товаров...');
      const response = await fetch(`${API_URL}/products/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to sync products');
      
      toast.success('Товары успешно синхронизированы', {
        id: toastId
      });
    } catch (error) {
      toast.error('Не удалось синхронизировать товары');
      throw error;
    }
  },
  update: async (id: number, updates: Partial<ApiProduct>): Promise<ApiProduct> => {
    try {
      const toastId = toast.loading('Обновление товара...');
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) throw new Error('Failed to update product');
      const updatedProduct = await response.json();
      
      toast.success('Товар успешно обновлен', {
        id: toastId
      });
      
      return updatedProduct;
    } catch (error) {
      toast.error('Не удалось обновить товар');
      throw error;
    }
  },
  bulkUpdate: async (ids: number[], updates: Partial<ApiProduct>): Promise<ApiProduct[]> => {
    try {
      const toastId = toast.loading(`Обновление ${ids.length} товаров...`);
      const response = await fetch(`${API_URL}/products/bulk`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids, updates })
      });
      
      if (!response.ok) throw new Error('Failed to bulk update products');
      const updatedProducts = await response.json();
      
      toast.success(`${ids.length} товаров успешно обновлены`, {
        id: toastId
      });
      
      return updatedProducts;
    } catch (error) {
      toast.error('Не удалось обновить товары');
      throw error;
    }
  },
  receiveDelivery: async (productId: number, data: {
    quantity: number;
    deliveryCost: number;
  }): Promise<ApiProduct> => {
    try {
      const toastId = toast.loading('Оприходование товара...');
      const response = await fetch(`${API_URL}/products/${productId}/receive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Failed to receive delivery');
      const updatedProduct = await response.json();
      
      toast.success('Товар успешно оприходован', {
        id: toastId
      });
      
      return updatedProduct;
    } catch (error) {
      toast.error('Не удалось оприходовать товар');
      throw error;
    }
  },
  delete: async (id: number): Promise<void> => {
    try {
      const toastId = toast.loading('Удаление товара...');
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete product');
      
      toast.success('Товар успешно удален', {
        id: toastId
      });
    } catch (error) {
      toast.error('Не удалось удалить товар');
      throw error;
    }
  }
};

// Enhanced Orders API with success messages
export const ordersApi = {
  getAll: async (): Promise<PaginatedResponse<OrderWithProducts>> => {
    // Use demo API if in demo mode
    if (isDemoMode()) {
      const result = await demoApi.ordersApi.getAll();
      return {
        data: result.data as any,
        metadata: {
          total: result.total || result.data.length,
          page: result.page || 1,
          limit: result.limit || 20
        }
      };
    }
    
    try {
      console.log('Fetching orders from:', `${API_URL}/orders`);
      const response = await fetch(`${API_URL}/orders`);
      if (!response.ok) {
        console.error('Failed to fetch orders:', {
          status: response.status,
          statusText: response.statusText
        });
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      console.log('Orders response:', data);
      return data;
    } catch (error) {
      console.error('Error in getAll:', error);
      toast.error('Не удалось загрузить заказы');
      throw error;
    }
  },
  getById: async (id: string): Promise<OrderWithProducts> => {
    try {
      const response = await fetch(`${API_URL}/orders/${id}`);
      if (!response.ok) throw new Error('Failed to fetch order');
      return await response.json();
    } catch (error) {
      toast.error('Не удалось загрузить заказ');
      throw error;
    }
  },
  update: async (id: string, updates: Partial<OrderWithProducts>): Promise<OrderWithProducts> => {
    try {
      const toastId = toast.loading('Обновление заказа...');
      const response = await fetch(`${API_URL}/orders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) throw new Error('Failed to update order');
      const updatedOrder = await response.json();
      
      toast.success('Заказ успешно обновлен', {
        id: toastId
      });
      
      return updatedOrder;
    } catch (error) {
      toast.error('Не удалось обновить заказ');
      throw error;
    }
  },
  sync: async (): Promise<void> => {
    try {
      console.log('Syncing orders...');
      const response = await fetch(`${API_URL}/orders/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error('Failed to sync orders:', {
          status: response.status,
          statusText: response.statusText
        });
        throw new Error('Failed to sync orders');
      }
      
      const data = await response.json();
      console.log('Sync response:', data);
      toast.success('Заказы успешно синхронизированы');
    } catch (error) {
      console.error('Error in sync:', error);
      toast.error('Не удалось синхронизировать заказы');
      throw error;
    }
  }
};

// Enhanced Customer Orders API with success messages
export const customerOrdersApi = {
  getAll: async (params?: PaginationParams & {
    from?: string;
    to?: string;
    search?: string;
    statusFilter?: string[];
  }): Promise<PaginatedResponse<ApiCustomerOrder>> => {
    // Use demo API if in demo mode
    if (isDemoMode()) {
      const result = await demoApi.ordersApi.getAll();
      // Transform demo orders to customer orders format
      const customerOrders = result.data.map((order: any) => ({
        id: order.id,
        paymentDate: order.orderDate,
        customerId: order.id,
        customerName: order.customerName,
        address: 'Москва, ул. Примерная, д. 1',
        deliveryCost: 500,
        productName: order.products[0]?.name || 'Товар',
        quantity: order.products.reduce((sum: number, p: any) => sum + p.quantity, 0),
        price: order.totalAmount,
        status: order.status
      }));
      
      return {
        data: customerOrders,
        metadata: {
          total: customerOrders.length,
          page: 1,
          limit: 20
        }
      };
    }
    
    try {
      const queryParams = new URLSearchParams({
        page: String(params?.page || 1),
        limit: String(params?.limit || 20)
      });
      
      if (params?.from) queryParams.append('from', params.from);
      if (params?.to) queryParams.append('to', params.to);
      if (params?.search) queryParams.append('search', params.search);
      if (params?.statusFilter && params.statusFilter.length > 0) {
        queryParams.append('statusFilter', params.statusFilter.join(','));
      }
      
      const url = `${API_URL}/customer-orders?${queryParams}`;
      console.log('🔍 customerOrdersApi.getAll: Making request to:', url);
      console.log('🔍 customerOrdersApi.getAll: Request params:', params);
      
      const response = await fetch(url);
      console.log('🔍 customerOrdersApi.getAll: Response status:', response.status);
      console.log('🔍 customerOrdersApi.getAll: Response ok:', response.ok);
      
      if (!response.ok) {
        console.error('❌ customerOrdersApi.getAll: Response not ok:', response.status, response.statusText);
        throw new Error('Failed to fetch customer orders');
      }
      
      const data = await response.json();
      console.log('🔍 customerOrdersApi.getAll: Raw response data:', data);
      
      const result = {
        data: data.orders || data.data || data,
        metadata: {
          total: data.total || data.metadata?.total || data.length,
          page: data.page || data.metadata?.page || 1,
          limit: data.limit || data.metadata?.limit || 20
        }
      };
      
      console.log('🔍 customerOrdersApi.getAll: Processed result:', result);
      console.log('🔍 customerOrdersApi.getAll: Orders count:', result.data.length);
      
      return result;
    } catch (error) {
      console.error('❌ customerOrdersApi.getAll: Error occurred:', error);
      toast.error('Не удалось загрузить заказы клиентов');
      throw error;
    }
  },
  resync: async (): Promise<void> => {
    // Skip resync in demo mode
    if (isDemoMode()) {
      toast.success('Данные демо режима всегда актуальны');
      return;
    }

    try {
      const toastId = toast.loading('Обновление данных с внешнего API...');
      
      const response = await fetch(`${API_URL}/customer-orders/resync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to resync customer orders');
      }
      
      const data = await response.json();
      console.log('Resync response:', data);
      
      toast.success(`Данные успешно обновлены! Синхронизировано ${data.total || 0} заказов`, {
        id: toastId
      });
    } catch (error) {
      console.error('Error in resync:', error);
      toast.error('Не удалось обновить данные с сервера');
      throw error;
    }
  },
  create: (order: Omit<ApiCustomerOrder, 'id'>) => fetchApi<ApiCustomerOrder>('/customer-orders', {
    method: 'POST',
    body: JSON.stringify(order),
    showSuccessToast: true,
    successMessage: 'Заказ клиента успешно создан'
  }),
  update: (id: string, updates: Partial<ApiCustomerOrder>) => fetchApi<ApiCustomerOrder>(`/customer-orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
    showSuccessToast: true,
    successMessage: 'Заказ клиента успешно обновлен'
  }),
  delete: (id: string) => fetchApi<void>(`/customer-orders/${id}`, {
    method: 'DELETE',
    showSuccessToast: true,
    successMessage: 'Заказ клиента успешно удален'
  }),
  clearAll: async (): Promise<void> => {
    try {
      const toastId = toast.loading('Очистка всех заказов клиентов...');
      const response = await fetch(`${API_URL}/customer-orders/clear-all`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to clear customer orders');
      
      const data = await response.json();
      
      toast.success(`Все заказы клиентов очищены (${data.deletedCount || 0} записей)`, {
        id: toastId
      });
    } catch (error) {
      toast.error('Не удалось очистить заказы клиентов');
      throw error;
    }
  }
};

// Enhanced Expenses API with pagination
export const expensesApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Expense>> => {
    // Use demo API if in demo mode
    if (isDemoMode()) {
      const result = await demoApi.expensesApi.getAll();
      return {
        data: result.data as any,
        metadata: {
          total: result.data.length,
          page: 1,
          limit: 10
        }
      };
    }
    
    try {
      const queryParams = new URLSearchParams({
        page: String(params?.page || 1),
        limit: String(params?.limit || 10)
      });
      const response = await fetch(`${API_URL}/expenses?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch expenses');
      const data = await response.json();
      
      // Преобразуем формат ответа бэкенда в ожидаемый формат
      const transformedExpenses = (data.data || []).map((expense: any) => ({
        id: expense._id || expense.id,
        date: expense.date,
        type: expense.type,
        description: expense.description,
        amount: expense.amountRUB || expense.amount || 0, // Преобразуем amountRUB в amount
        amountRUB: expense.amountRUB || expense.amount || 0,
        productId: expense.productId?._id || expense.productId,
        productName: expense.productId?.name || expense.productName,
        purchaseItems: expense.purchaseItems,
        createdAt: expense.createdAt || expense.created_at
      }));
      
      return {
        data: transformedExpenses,
        metadata: {
          total: data.pagination?.total || transformedExpenses.length,
          page: data.pagination?.page || Number(params?.page || 1),
          limit: data.pagination?.limit || Number(params?.limit || 10)
        }
      };
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Не удалось загрузить расходы');
      throw error;
    }
  },
  create: async (expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> => {
    // Use demo API if in demo mode
    if (isDemoMode()) {
      return await demoApi.expensesApi.create(expense) as any;
    }
    
    try {
      const toastId = toast.loading('Добавление расхода...');
      
      // Преобразуем формат для бэкенда
      const backendExpense = {
        date: expense.date,
        type: expense.type,
        description: expense.description,
        amountRUB: expense.amount, // Преобразуем amount в amountRUB
        productId: expense.productId || null,
        purchaseItems: expense.purchaseItems || null
      };
      
      const response = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backendExpense)
      });
      
      if (!response.ok) throw new Error('Failed to create expense');
      const result = await response.json();
      
      // Преобразуем ответ обратно в формат фронтенда
      const createdExpense: Expense = {
        id: result.data._id,
        date: result.data.date,
        type: result.data.type,
        description: result.data.description,
        amount: result.data.amountRUB,
        productId: result.data.productId?._id || result.data.productId,
        productName: result.data.productId?.name,
        purchaseItems: result.data.purchaseItems,
        createdAt: result.data.createdAt
      };
      
      toast.success('Расход успешно добавлен', {
        id: toastId
      });
      
      return createdExpense;
    } catch (error) {
      toast.error('Не удалось добавить расход');
      throw error;
    }
  },
  update: async (id: string, expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> => {
    // Use demo API if in demo mode
    if (isDemoMode()) {
      // Demo doesn't have update, but we can simulate it
      return { ...expense, id, createdAt: new Date().toISOString() };
    }
    
    try {
      const toastId = toast.loading('Обновление расхода...');
      
      // Преобразуем формат для бэкенда
      const backendExpense = {
        date: expense.date,
        type: expense.type,
        description: expense.description,
        amountRUB: expense.amount,
        productId: expense.productId || null
      };
      
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backendExpense)
      });
      
      if (!response.ok) throw new Error('Failed to update expense');
      const result = await response.json();
      
      // Преобразуем ответ обратно в формат фронтенда
      const updatedExpense: Expense = {
        id: result.data._id,
        date: result.data.date,
        type: result.data.type,
        description: result.data.description,
        amount: result.data.amountRUB,
        productId: result.data.productId?._id || result.data.productId,
        productName: result.data.productId?.name,
        createdAt: result.data.createdAt
      };
      
      toast.success('Расход успешно обновлен', {
        id: toastId
      });
      
      return updatedExpense;
    } catch (error) {
      toast.error('Не удалось обновить расход');
      throw error;
    }
  },
  delete: async (id: string): Promise<void> => {
    // Use demo API if in demo mode
    if (isDemoMode()) {
      await demoApi.expensesApi.delete(id);
      return;
    }
    
    try {
      const toastId = toast.loading('Удаление расхода...');
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete expense');
      
      toast.success('Расход успешно удален', {
        id: toastId
      });
    } catch (error) {
      toast.error('Не удалось удалить расход');
      throw error;
    }
  }
};

// Purchase types
export interface Purchase {
  id?: string;
  date: string;
  supplier: string;
  liraRate: number;
  items: Array<{
    productId: string;
    qty: number;
    unitCostTRY: number;
  }>;
  totalTRY: number;
  totalRUB?: number;
  estimatedDeliveryDays?: number;
  status: 'pending' | 'in_transit' | 'delivered';
  deliveredItems?: Array<{
    productId: string;
    qtyDelivered: number;
  }>;
  deliveryExpenseRUB?: number;
  deliveredAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Enhanced Purchases API
export const purchasesApi = {
  getAll: async (params?: PaginationParams & {
    supplier?: string;
    from?: string;
    to?: string;
  }): Promise<PaginatedResponse<Purchase>> => {
    // Use demo API if in demo mode
    if (isDemoMode()) {
      const result = await demoApi.purchasesApi.getAll();
      return {
        data: result.data as any,
        metadata: {
          total: result.data.length,
          page: 1,
          limit: 50
        }
      };
    }
    
    try {
      const queryParams = new URLSearchParams({
        page: String(params?.page || 1),
        limit: String(params?.limit || 50)
      });
      
      if (params?.supplier) queryParams.append('supplier', params.supplier);
      if (params?.from) queryParams.append('from', params.from);
      if (params?.to) queryParams.append('to', params.to);
      
      const response = await fetch(`${API_URL}/purchases?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch purchases');
      const data = await response.json();
      
      return {
        data: data.data,
        metadata: {
          total: data.pagination.total,
          page: data.pagination.page,
          limit: data.pagination.limit
        }
      };
    } catch (error) {
      toast.error('Не удалось загрузить закупки');
      throw error;
    }
  },
  
  create: async (purchaseData: {
    date: string;
    supplier: string;
    liraRate: number;
    items: Array<{
      productId: string;
      qty: number;
      unitCostTRY: number;
    }>;
    estimatedDeliveryDays?: number;
  }): Promise<Purchase> => {
    // Use demo API if in demo mode
    if (isDemoMode()) {
      return await demoApi.purchasesApi.create(purchaseData) as any;
    }
    
    try {
      const toastId = toast.loading('Создание закупки...');
      const response = await fetch(`${API_URL}/purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(purchaseData)
      });
      
      if (!response.ok) throw new Error('Failed to create purchase');
      const result = await response.json();
      
      toast.success('Закупка успешно создана', {
        id: toastId
      });
      
      return result.data;
    } catch (error) {
      toast.error('Не удалось создать закупку');
      throw error;
    }
  },
  
  getById: async (id: string): Promise<Purchase> => {
    try {
      const response = await fetch(`${API_URL}/purchases/${id}`);
      if (!response.ok) throw new Error('Failed to fetch purchase');
      const result = await response.json();
      return result.data;
    } catch (error) {
      toast.error('Не удалось загрузить закупку');
      throw error;
    }
  },
  
  update: async (id: string, updates: Partial<Purchase>): Promise<Purchase> => {
    try {
      const toastId = toast.loading('Обновление закупки...');
      const response = await fetch(`${API_URL}/purchases/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) throw new Error('Failed to update purchase');
      const result = await response.json();
      
      toast.success('Закупка успешно обновлена', {
        id: toastId
      });
      
      return result.data;
    } catch (error) {
      toast.error('Не удалось обновить закупку');
      throw error;
    }
  },
  
  delete: async (id: string): Promise<void> => {
    // Use demo API if in demo mode
    if (isDemoMode()) {
      await demoApi.purchasesApi.delete(id);
      return;
    }
    
    try {
      const toastId = toast.loading('Удаление закупки...');
      const response = await fetch(`${API_URL}/purchases/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete purchase');
      
      toast.success('Закупка успешно удалена', {
        id: toastId
      });
    } catch (error) {
      toast.error('Не удалось удалить закупку');
      throw error;
    }
  },
  
  receive: async (id: string, data: {
    deliveredItems: Array<{
      productId: string;
      qtyDelivered: number;
    }>;
    deliveryExpenseRUB: number;
  }): Promise<Purchase> => {
    // Use demo API if in demo mode
    if (isDemoMode()) {
      return await demoApi.purchasesApi.receive(id, data) as any;
    }
    
    try {
      const toastId = toast.loading('Оприходование закупки...');
      const response = await fetch(`${API_URL}/purchases/${id}/receive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Failed to receive purchase');
      const result = await response.json();
      
      toast.success('Закупка успешно оприходована', {
        id: toastId
      });
      
      return result.data;
    } catch (error) {
      toast.error('Не удалось оприходовать закупку');
      throw error;
    }
  }
};