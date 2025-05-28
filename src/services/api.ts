import { toast } from 'sonner';
// Define pagination types first
export interface PaginationParams {
  page?: number;
  limit?: number;
}
export interface PaginatedResponse<T> {
  data: T[];
  metadata: {
    total: number;
    page: number;
    limit: number;
  };
}
// Base API URL
const API_URL = typeof import.meta.env !== 'undefined' ? import.meta.env.VITE_API_URL || 'http://localhost:5000/api' : 'http://localhost:5000/api';
// Error types
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
export interface ApiProduct {
  id: string;
  name: string;
  costPriceTRY: number;
  averageSellingPrice: number;
  soldPeriod: number;
  currentStock: number;
  inDelivery: number;
  deliveryDays: number;
  logisticsCost: number;
  tryRate?: number;
}
// Order types
export interface ApiOrder {
  id: string;
  date: string;
  tryRate: number;
  products: {
    id: string;
    name: string;
    quantity: number;
    costPriceTRY: number;
  }[];
  totalTRY: number;
  totalRUB: number;
  createdAt: string;
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
}
// Expense type
export interface Expense {
  id: string;
  date: string;
  type: 'logistics' | 'advertising' | 'courier' | 'payroll' | 'other';
  description: string;
  amount: number;
  productId?: string;
  productName?: string;
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
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<ApiProduct>> => {
    try {
      const queryParams = new URLSearchParams({
        page: String(params?.page || 1),
        limit: String(params?.limit || 10)
      });
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      return {
        data: data.products,
        metadata: {
          total: data.total,
          page: data.page,
          limit: data.limit
        }
      };
    } catch (error) {
      toast.error('Не удалось загрузить товары');
      throw error;
    }
  },
  update: async (id: string, updates: Partial<ApiProduct>): Promise<ApiProduct> => {
    try {
      // Show optimistic toast
      const toastId = toast.loading('Обновление товара...');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update product');
      const updatedProduct = await response.json();
      // Update success toast
      toast.success('Товар успешно обновлен', {
        id: toastId
      });
      return updatedProduct;
    } catch (error) {
      toast.error('Не удалось обновить товар');
      throw error;
    }
  },
  bulkUpdate: async (ids: string[], updates: Partial<ApiProduct>): Promise<ApiProduct[]> => {
    try {
      // Show optimistic toast
      const toastId = toast.loading(`Обновление ${ids.length} товаров...`);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products/bulk`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids,
          updates
        })
      });
      if (!response.ok) throw new Error('Failed to bulk update products');
      const updatedProducts = await response.json();
      // Update success toast
      toast.success(`${ids.length} товаров успешно обновлены`, {
        id: toastId
      });
      return updatedProducts;
    } catch (error) {
      toast.error('Не удалось обновить товары');
      throw error;
    }
  },
  receiveDelivery: async (productId: string, data: {
    quantity: number;
    deliveryCost: number;
  }): Promise<ApiProduct> => {
    try {
      // Show optimistic toast
      const toastId = toast.loading('Оприходование товара...');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${productId}/receive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to receive delivery');
      const updatedProduct = await response.json();
      // Update success toast
      toast.success('Товар успешно оприходован', {
        id: toastId
      });
      return updatedProduct;
    } catch (error) {
      toast.error('Не удалось оприходовать товар');
      throw error;
    }
  }
};
// Enhanced Orders API with success messages
export const ordersApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<ApiOrder>> => {
    try {
      const queryParams = new URLSearchParams({
        page: String(params?.page || 1),
        limit: String(params?.limit || 10)
      });
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      return {
        data: data.orders,
        metadata: {
          total: data.total,
          page: data.page,
          limit: data.limit
        }
      };
    } catch (error) {
      toast.error('Не удалось загрузить заказы');
      throw error;
    }
  },
  create: (order: Omit<ApiOrder, 'id' | 'createdAt'>) => fetchApi<ApiOrder>('/orders', {
    method: 'POST',
    body: JSON.stringify(order),
    showSuccessToast: true,
    successMessage: 'Заказ успешно создан'
  }),
  update: (id: string, updates: Partial<ApiOrder>) => fetchApi<ApiOrder>(`/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
    showSuccessToast: true,
    successMessage: 'Заказ успешно обновлен'
  }),
  delete: (id: string) => fetchApi<void>(`/orders/${id}`, {
    method: 'DELETE',
    showSuccessToast: true,
    successMessage: 'Заказ успешно удален'
  }),
  receive: (id: string, data: {
    products: {
      id: string;
      quantity: number;
    }[];
    deliveryCost: number;
  }) => fetchApi<ApiOrder>(`/orders/${id}/receive`, {
    method: 'POST',
    body: JSON.stringify(data),
    showSuccessToast: true,
    successMessage: 'Заказ успешно оприходован'
  })
};
// Enhanced Customer Orders API with success messages
export const customerOrdersApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<ApiCustomerOrder>> => {
    try {
      const queryParams = new URLSearchParams({
        page: String(params?.page || 1),
        limit: String(params?.limit || 10)
      });
      const response = await fetch(`${import.meta.env.VITE_API_URL}/customer-orders?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch customer orders');
      const data = await response.json();
      return {
        data: data.orders,
        metadata: {
          total: data.total,
          page: data.page,
          limit: data.limit
        }
      };
    } catch (error) {
      toast.error('Не удалось загрузить заказы клиентов');
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
  })
};
// Enhanced Expenses API with pagination
export const expensesApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Expense>> => {
    try {
      const queryParams = new URLSearchParams({
        page: String(params?.page || 1),
        limit: String(params?.limit || 10)
      });
      const response = await fetch(`${import.meta.env.VITE_API_URL}/expenses?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch expenses');
      const data = await response.json();
      return {
        data: data.expenses,
        metadata: {
          total: data.total,
          page: data.page,
          limit: data.limit
        }
      };
    } catch (error) {
      toast.error('Не удалось загрузить расходы');
      throw error;
    }
  }
};