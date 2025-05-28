import React, { useEffect, useState } from 'react';
import { X, Package2, Truck, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
interface OrderProduct {
  id: string;
  name: string;
  quantity: number;
  costPriceTRY: number;
}
interface Order {
  id: string;
  date: string;
  tryRate: number;
  products: OrderProduct[];
  totalTRY: number;
  totalRUB: number;
  createdAt: string;
}
interface ReceiveOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSave: (data: {
    products: {
      id: string;
      quantity: number;
    }[];
    deliveryCost: number;
  }) => void;
}
export function ReceiveOrderModal({
  isOpen,
  onClose,
  order,
  onSave
}: ReceiveOrderModalProps) {
  const [formData, setFormData] = useState<{
    products: {
      id: string;
      quantity: number;
    }[];
    deliveryCost: number;
  }>({
    products: [],
    deliveryCost: 0
  });
  const [errors, setErrors] = useState<{
    products?: string;
    deliveryCost?: string;
  }>({});
  useEffect(() => {
    if (order) {
      setFormData({
        products: order.products.map(p => ({
          id: p.id,
          quantity: p.quantity
        })),
        deliveryCost: 0
      });
    }
  }, [order]);
  const handleQuantityChange = (productId: string, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === productId ? {
        ...p,
        quantity: Math.max(0, quantity)
      } : p)
    }));
  };
  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (formData.products.some(p => p.quantity <= 0)) {
      newErrors.products = 'Количество должно быть больше 0';
    }
    if (formData.deliveryCost < 0) {
      newErrors.deliveryCost = 'Расходы не могут быть отрицательными';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSave(formData);
  };
  if (!isOpen || !order) return null;
  return <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <motion.div initial={{
        scale: 0.95,
        opacity: 0
      }} animate={{
        scale: 1,
        opacity: 1
      }} exit={{
        scale: 0.95,
        opacity: 0
      }} className="relative bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-2xl w-full max-w-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-xl flex items-center justify-center">
                <Package2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Оприходовать заказ</h2>
                <p className="text-sm text-muted-foreground">{order.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Products */}
            <div>
              <h3 className="text-sm font-medium mb-4">Товары</h3>
              <div className="space-y-4">
                {order.products.map(product => <div key={product.id} className="flex items-center justify-between p-4 bg-accent/50 rounded-xl">
                    <span className="font-medium">{product.name}</span>
                    <div className="flex items-center space-x-4">
                      <input type="number" min="0" max={product.quantity} value={formData.products.find(p => p.id === product.id)?.quantity || 0} onChange={e => handleQuantityChange(product.id, parseInt(e.target.value) || 0)} className="w-24 px-3 py-2 bg-white dark:bg-slate-800 border border-border rounded-lg" />
                      <span className="text-sm text-muted-foreground">
                        из {product.quantity} шт
                      </span>
                    </div>
                  </div>)}
              </div>
              {errors.products && <p className="mt-2 text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.products}
                </p>}
            </div>
            {/* Delivery Cost */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Truck className="inline h-4 w-4 mr-1" />
                Расходы на доставку (₽)
              </label>
              <input type="number" min="0" step="0.01" value={formData.deliveryCost} onChange={e => setFormData(prev => ({
              ...prev,
              deliveryCost: parseFloat(e.target.value) || 0
            }))} className="w-full px-4 py-3 border border-border rounded-xl bg-background" />
              {errors.deliveryCost && <p className="mt-2 text-sm text-red-500 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.deliveryCost}
                </p>}
            </div>
            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-border rounded-xl hover:bg-accent transition-colors">
                Отмена
              </button>
              <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
                Оприходовать
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>;
}