import mongoose, { Document, Schema } from 'mongoose';

export interface IExpense extends Document {
  date: Date;
  type: 'Логистика' | 'Реклама' | 'ФОТ' | 'Прочее' | 'Закупка товара';
  description: string;
  productId?: mongoose.Types.ObjectId | null;
  amountRUB: number;
  purchaseItems?: Array<{
    productName: string;
    quantity: number;
    unitCostTRY: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>({
  date: {
    type: Date,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Логистика', 'Реклама', 'ФОТ', 'Прочее', 'Закупка товара'],
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    default: null,
    index: true
  },
  amountRUB: {
    type: Number,
    required: true,
    min: 0
  },
  purchaseItems: [
    {
      productName: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      unitCostTRY: {
        type: Number,
        required: true
      }
    }
  ]
}, {
  timestamps: true
});

// Составные индексы для аналитики
ExpenseSchema.index({ date: 1, type: 1 });
ExpenseSchema.index({ productId: 1, date: 1 });
ExpenseSchema.index({ type: 1, date: 1 });

export const Expense = mongoose.model<IExpense>('Expense', ExpenseSchema); 