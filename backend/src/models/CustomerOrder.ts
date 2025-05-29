import mongoose from 'mongoose';

const customerOrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  paymentDate: { type: String, required: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  address: { type: String, required: true },
  deliveryCost: { type: Number, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { type: String, required: true }
}, {
  timestamps: true,
  toObject: {
    transform: function(doc, ret) {
      delete ret._id;
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;
      return ret;
    }
  }
});

export const CustomerOrder = mongoose.model('CustomerOrder', customerOrderSchema); 