// Product Types
export interface Product {
  id: string;
  name: string;
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
  soldQuantity: number;
  averageConsumptionDaily: number;
  currentStock: number;
  inDelivery: number;
  daysInStock: number;
  orderPoint: boolean;
  exchangeRate: number;
  fixedCosts: number;
  deliveryDays: number;
  tryRate?: number;
  revenue?: number;
}

// Analytics Types
export interface AnalyticsSummary {
  totalRevenue: number;
  totalProfit: number;
  profitMargin: number;
  productsSold: number;
  changeFromLastMonth: {
    revenue: number;
    profit: number;
    margin: number;
    quantity: number;
  };
}

export interface RevenueData {
  date: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface TopProduct {
  name: string;
  revenue: number;
  quantity: number;
  profit: number;
  growth: number;
}

// Purchase Types
export interface Purchase {
  id: string;
  date: string;
  supplier: string;
  totalAmount: number;
  exchangeRate: number;
  status: 'pending' | 'received' | 'partial';
  items: PurchaseItem[];
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

// Expense Types
export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  type: 'fixed' | 'variable' | 'one-time';
}

// Customer Order Types
export interface CustomerOrder {
  id: string;
  date: string;
  customer: string;
  products: OrderProduct[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface OrderProduct {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
} 