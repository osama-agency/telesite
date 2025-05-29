import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  id: number;
  name: string;
  description?: string;
  price?: number;
  stock_quantity: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
  ancestry?: string;
  weight?: string;
  dosage_form?: string;
  package_quantity?: number;
  main_ingredient?: string;
  brand?: string;
  old_price?: number;
  costPriceTRY?: number; // Себестоимость в турецких лирах
  defaultExchangeRate?: number; // Дефолтный курс для старых товаров
  averageExchangeRate?: number; // Средний курс из закупок
}

const ProductSchema = new Schema<IProduct>({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  description: String,
  price: Number,
  stock_quantity: {
    type: Number,
    required: true,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  deleted_at: Date,
  ancestry: String,
  weight: String,
  dosage_form: String,
  package_quantity: Number,
  main_ingredient: String,
  brand: String,
  old_price: Number,
  costPriceTRY: {
    type: Number,
    default: 0
  },
  defaultExchangeRate: {
    type: Number,
    default: 2.19
  },
  averageExchangeRate: {
    type: Number
  }
});

// Индексы для оптимизации запросов
ProductSchema.index({ name: 'text' });
ProductSchema.index({ created_at: -1 });
ProductSchema.index({ stock_quantity: 1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema); 