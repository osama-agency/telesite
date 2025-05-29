import mongoose from 'mongoose';
import { ApiOrder } from '../types';

const orderItemSchema = new mongoose.Schema({
  quantity: { type: Number, required: true },
  price: { type: String, required: true },
  name: { type: String, required: true }
});

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  city: { type: String, required: true },
  full_name: { type: String, required: true }
});

const orderSchema = new mongoose.Schema<ApiOrder>({
  id: { type: String, required: true, unique: true },
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'shipped', 'delivered', 'cancelled', 'overdue'],
    required: true 
  },
  total_amount: { type: String, required: true },
  bonus: { type: Number, required: true },
  bank_card: { type: String, default: null },
  delivery_cost: { type: Number, required: true },
  paid_at: { type: String, default: null },
  shipped_at: { type: String, default: null },
  created_at: { type: String, required: true },
  user: { type: userSchema, required: true },
  order_items: [orderItemSchema]
}, {
  timestamps: true
});

export const Order = mongoose.model<ApiOrder>('Order', orderSchema); 