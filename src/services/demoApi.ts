// Demo API service that returns demo data instead of making real API calls

import { 
  demoProducts, 
  demoOrders, 
  demoPurchases, 
  demoExpenses, 
  demoAnalytics,
  simulateDelay 
} from '../data/demoData';

// Products API
export const productsApi = {
  getAll: async () => {
    await simulateDelay();
    
    // Enhance demo products with calculated fields
    const exchangeRate = 3.20;
    const fixedCosts = 350;
    
    const enhancedProducts = demoProducts.map((product: any) => ({
      ...product,
      id: Number(product.id), // Convert to number for API compatibility
      // Price fields
      costPriceRUB: Math.round(product.costPriceTRY * exchangeRate),
      averageSellingPrice: product.retailPriceRUB,
      // Sales data
      revenue: product.revenue || 0,
      soldQuantity: product.soldQuantity || 0,
      soldPeriod: 30, // 30 days period
      // Profitability
      netProfit: product.netProfit || 0,
      netProfitTotal: product.netProfit || 0,
      marginPercent: product.marginPercent || 30,
      markup: Math.round(((product.retailPriceRUB - product.costPriceTRY * exchangeRate) / (product.costPriceTRY * exchangeRate)) * 100),
      profitPercentTotal: product.marginPercent || 30,
      // Logistics
      logisticsCost: fixedCosts,
      totalCosts: Math.round(product.costPriceTRY * exchangeRate + fixedCosts),
      // Stock info
      stock_quantity: product.quantity,
      averageConsumptionDaily: product.averageConsumptionDaily || 0,
      daysInStock: product.daysInStock || 0,
      inDelivery: product.inDelivery || 0,
      orderPoint: product.quantity < 10,
      // Other fields
      exchangeRate: exchangeRate,
      fixedCosts: fixedCosts,
      deliveryDays: 7,
      firstSaleDate: product.firstSaleDate || null,
      // API compatibility fields
      description: null,
      price: String(product.retailPriceRUB),
      created_at: product.createdAt,
      updated_at: product.updatedAt,
      deleted_at: null,
      ancestry: null,
      weight: null,
      dosage_form: null,
      package_quantity: null,
      main_ingredient: null,
      brand: null,
      old_price: null
    }));
    
    return { data: enhancedProducts };
  },
  
  create: async (product: any) => {
    await simulateDelay();
    const newProduct = {
      ...product,
      id: Math.random().toString(36).substr(2, 9),
      quantity: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    demoProducts.push(newProduct);
    return newProduct;
  },
  
  update: async (id: string, updates: any) => {
    await simulateDelay();
    const index = demoProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      demoProducts[index] = {
        ...demoProducts[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      return demoProducts[index];
    }
    throw new Error('Product not found');
  },
  
  delete: async (id: string) => {
    await simulateDelay();
    const index = demoProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      demoProducts.splice(index, 1);
      return { success: true };
    }
    throw new Error('Product not found');
  }
};

// Orders API
export const ordersApi = {
  getAll: async (params?: any) => {
    await simulateDelay();
    return { 
      data: demoOrders,
      total: demoOrders.length,
      page: 1,
      limit: 20
    };
  },
  
  create: async (order: any) => {
    await simulateDelay();
    const newOrder = {
      ...order,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    demoOrders.push(newOrder);
    return newOrder;
  },
  
  delete: async (id: string) => {
    await simulateDelay();
    const index = demoOrders.findIndex(o => o.id === id);
    if (index !== -1) {
      demoOrders.splice(index, 1);
      return { success: true };
    }
    throw new Error('Order not found');
  }
};

// Purchases API
export const purchasesApi = {
  getAll: async (params?: any) => {
    await simulateDelay();
    return { data: demoPurchases };
  },
  
  create: async (purchase: any) => {
    await simulateDelay();
    const newPurchase = {
      ...purchase,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      totalTRY: purchase.items.reduce((sum: number, item: any) => 
        sum + (item.qty * item.unitCostTRY), 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    demoPurchases.push(newPurchase);
    return newPurchase;
  },
  
  receive: async (id: string, data: any) => {
    await simulateDelay();
    const purchase = demoPurchases.find(p => p.id === id);
    if (purchase) {
      purchase.status = 'delivered';
      purchase.updatedAt = new Date().toISOString();
      return purchase;
    }
    throw new Error('Purchase not found');
  },
  
  delete: async (id: string) => {
    await simulateDelay();
    const index = demoPurchases.findIndex(p => p.id === id);
    if (index !== -1) {
      demoPurchases.splice(index, 1);
      return { success: true };
    }
    throw new Error('Purchase not found');
  }
};

// Expenses API
export const expensesApi = {
  getAll: async (params?: any) => {
    await simulateDelay();
    return { data: demoExpenses };
  },
  
  create: async (expense: any) => {
    await simulateDelay();
    const newExpense = {
      ...expense,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    demoExpenses.push(newExpense);
    return newExpense;
  },
  
  delete: async (id: string) => {
    await simulateDelay();
    const index = demoExpenses.findIndex(e => e.id === id);
    if (index !== -1) {
      demoExpenses.splice(index, 1);
      return { success: true };
    }
    throw new Error('Expense not found');
  }
};

// Analytics API
export const analyticsApi = {
  getSummary: async () => {
    await simulateDelay();
    return { data: demoAnalytics.summary };
  },
  
  getCharts: async () => {
    await simulateDelay();
    return { data: demoAnalytics.charts };
  }
};

// Export types matching the original API
export type ApiProduct = typeof demoProducts[0];
export type CustomerOrder = typeof demoOrders[0];
export type Purchase = typeof demoPurchases[0];
export type Expense = typeof demoExpenses[0]; 