import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryMovement extends Document {
  date: Date;
  productId: mongoose.Types.ObjectId;
  changeQty: number;
  type: 'purchase' | 'sale' | 'expense_adjustment';
  refId: mongoose.Types.ObjectId;
  liraRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryMovementSchema = new Schema<IInventoryMovement>({
  date: {
    type: Date,
    required: true,
    index: true
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  changeQty: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['purchase', 'sale', 'expense_adjustment'],
    index: true
  },
  refId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  liraRate: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

// Составные индексы для быстрых агрегаций
InventoryMovementSchema.index({ productId: 1, date: 1 });
InventoryMovementSchema.index({ type: 1, date: 1 });
InventoryMovementSchema.index({ productId: 1, type: 1 });

export const InventoryMovement = mongoose.model<IInventoryMovement>('InventoryMovement', InventoryMovementSchema); 