import mongoose, { Document, Schema } from 'mongoose';

// Аналитика остатков
export interface IAnalyticsInventory extends Document {
  productId: mongoose.Types.ObjectId;
  productName: string;
  currentStock: number;
  reorderPoint?: number;
  lastUpdated: Date;
}

const AnalyticsInventorySchema = new Schema<IAnalyticsInventory>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    unique: true
  },
  productName: {
    type: String,
    required: true
  },
  currentStock: {
    type: Number,
    required: true,
    default: 0
  },
  reorderPoint: {
    type: Number,
    default: null
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Аналитика закупок по периодам
export interface IAnalyticsPurchases extends Document {
  period: string; // YYYY-MM-DD
  totalTRY: number;
  totalRUB: number;
  avgLiraRate: number;
  suppliersCount: number;
  itemsCount: number;
  lastUpdated: Date;
}

const AnalyticsPurchasesSchema = new Schema<IAnalyticsPurchases>({
  period: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  totalTRY: {
    type: Number,
    required: true,
    default: 0
  },
  totalRUB: {
    type: Number,
    required: true,
    default: 0
  },
  avgLiraRate: {
    type: Number,
    required: true,
    default: 0
  },
  suppliersCount: {
    type: Number,
    required: true,
    default: 0
  },
  itemsCount: {
    type: Number,
    required: true,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Аналитика расходов
export interface IAnalyticsExpenses extends Document {
  period: string; // YYYY-MM-DD
  type: string;
  totalAmount: number;
  transactionsCount: number;
  lastUpdated: Date;
}

const AnalyticsExpensesSchema = new Schema<IAnalyticsExpenses>({
  period: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    index: true
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  transactionsCount: {
    type: Number,
    required: true,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

AnalyticsExpensesSchema.index({ period: 1, type: 1 }, { unique: true });

// Аналитика прибыли
export interface IAnalyticsProfit extends Document {
  period: string; // YYYY-MM-DD
  productId?: mongoose.Types.ObjectId;
  productName?: string;
  revenue: number;
  purchaseCost: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
  margin: number;
  lastUpdated: Date;
}

const AnalyticsProfitSchema = new Schema<IAnalyticsProfit>({
  period: {
    type: String,
    required: true,
    index: true
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    default: null,
    index: true
  },
  productName: {
    type: String,
    default: null
  },
  revenue: {
    type: Number,
    required: true,
    default: 0
  },
  purchaseCost: {
    type: Number,
    required: true,
    default: 0
  },
  expenses: {
    type: Number,
    required: true,
    default: 0
  },
  grossProfit: {
    type: Number,
    required: true,
    default: 0
  },
  netProfit: {
    type: Number,
    required: true,
    default: 0
  },
  margin: {
    type: Number,
    required: true,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

AnalyticsProfitSchema.index({ period: 1, productId: 1 }, { unique: true });

export const AnalyticsInventory = mongoose.model<IAnalyticsInventory>('AnalyticsInventory', AnalyticsInventorySchema);
export const AnalyticsPurchases = mongoose.model<IAnalyticsPurchases>('AnalyticsPurchases', AnalyticsPurchasesSchema);
export const AnalyticsExpenses = mongoose.model<IAnalyticsExpenses>('AnalyticsExpenses', AnalyticsExpensesSchema);
export const AnalyticsProfit = mongoose.model<IAnalyticsProfit>('AnalyticsProfit', AnalyticsProfitSchema); 