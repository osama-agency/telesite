import mongoose, { Document, Schema } from 'mongoose';

export interface IPurchaseItem {
  productId: mongoose.Types.ObjectId;
  qty: number;
  unitCostTRY: number;
}

export interface IDeliveredItem {
  productId: mongoose.Types.ObjectId;
  qtyDelivered: number;
}

export interface IPurchase extends Document {
  date: Date;
  supplier: string;
  liraRate: number;
  items: IPurchaseItem[];
  totalTRY: number;
  estimatedDeliveryDays?: number;
  status: 'pending' | 'in_transit' | 'delivered';
  deliveredItems?: IDeliveredItem[];
  deliveryExpenseRUB?: number;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseItemSchema = new Schema<IPurchaseItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  qty: {
    type: Number,
    required: true,
    min: 0
  },
  unitCostTRY: {
    type: Number,
    required: true,
    min: 0
  }
});

const DeliveredItemSchema = new Schema<IDeliveredItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  qtyDelivered: {
    type: Number,
    required: true,
    min: 0
  }
});

const PurchaseSchema = new Schema<IPurchase>({
  date: {
    type: Date,
    required: true,
    index: true
  },
  supplier: {
    type: String,
    required: true,
    trim: true
  },
  liraRate: {
    type: Number,
    required: true,
    min: 0
  },
  items: [PurchaseItemSchema],
  totalTRY: {
    type: Number,
    min: 0,
    default: 0,
    required: false
  },
  estimatedDeliveryDays: {
    type: Number,
    min: 0,
    default: null
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in_transit', 'delivered'],
    default: 'pending',
    index: true
  },
  deliveredItems: {
    type: [DeliveredItemSchema],
    default: undefined
  },
  deliveryExpenseRUB: {
    type: Number,
    min: 0,
    default: null
  },
  deliveredAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Индексы для быстрого поиска
PurchaseSchema.index({ date: 1 });
PurchaseSchema.index({ supplier: 1 });
PurchaseSchema.index({ 'items.productId': 1 });
PurchaseSchema.index({ status: 1, date: 1 });

// Виртуальное поле для расчета общей стоимости в рублях
PurchaseSchema.virtual('totalRUB').get(function() {
  return this.totalTRY * this.liraRate;
});

// Middleware для автоматического расчета totalTRY
PurchaseSchema.pre('validate', function(next) {
  this.totalTRY = this.items.reduce((sum, item) => sum + (item.qty * item.unitCostTRY), 0);
  next();
});

export const Purchase = mongoose.model<IPurchase>('Purchase', PurchaseSchema); 