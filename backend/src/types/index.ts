export interface ApiProduct {
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
  costPriceTRY?: number;
  // Расчетные поля для аналитики
  averageSellingPrice?: number;
  costPriceRUB?: number;
  logisticsCost?: number;
  markup?: number;
  marginPercent?: number;
  netProfit?: number;
  netProfitTotal?: number;
  totalCosts?: number;
  profitPercentTotal?: number;
  soldPeriod?: number;
  soldQuantity?: number; // Количество проданных товаров
  averageConsumptionDaily?: number;
  daysInStock?: number;
  orderPoint?: boolean;
  exchangeRate?: number;
  fixedCosts?: number;
  deliveryDays?: number;
  revenue?: number; // Оборот за период
  inDelivery?: number; // Количество товаров в доставке
}

export interface CalculatedProduct extends ApiProduct {
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
  averageConsumptionDaily: number;
  daysInStock: number;
  orderPoint: boolean;
  exchangeRate: number;
  fixedCosts: number;
  deliveryDays: number;
}

export interface ApiOrder {
  id: string;
  status: 'pending' | 'paid' | 'failed' | 'shipped' | 'delivered' | 'cancelled' | 'overdue';
  total_amount: string;
  bonus: number;
  bank_card: string | null;
  delivery_cost: number;
  paid_at: string | null;
  shipped_at: string | null;
  created_at: string;
  user: {
    id: number;
    city: string;
    full_name: string;
  };
  order_items: Array<{
    quantity: number;
    price: string;
    name: string;
  }>;
}

export interface OrderWithProducts extends ApiOrder {
  order_items: Array<{
    quantity: number;
    price: string;
    name: string;
    product_id?: number;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  metadata: {
    total: number;
    page: number;
    limit: number;
  };
} 