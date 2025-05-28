import React, { useState } from 'react';
import { X, Calendar, Package, Truck, Edit2, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface Product {
  id: string;
  name: string;
  stock: number;
  inTransit: number;
  costPrice: number;
  sellingPrice: number;
  currency: 'TRY' | 'RUB';
  exchangeRate: number;
  logisticsCost: number;
  profitability: number;
  averageConsumption: number;
  recommendedOrder: number;
  costPriceTRY?: number;
}
interface OrderData {
  productId: string;
  quantity: number;
  shippingCost: number;
  orderDate: string;
  deliveryDays: number;
  costPriceTRY?: number;
  tryRate: number;
}
interface AddOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddOrder: (order: OrderData) => void;
  onAddExpense?: (expense: {
    date: string;
    type: 'logistics';
    description: string;
    amount: number;
    productId?: string;
    productName?: string;
  }) => void;
}
export function AddOrderModal({
  isOpen,
  onClose,
  products,
  onAddOrder,
  onAddExpense
}: AddOrderModalProps) {
  const [formData, setFormData] = useState<OrderData>({
    productId: '',
    quantity: 1,
    shippingCost: 0,
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDays: 7,
    costPriceTRY: undefined,
    tryRate: 3.2
  });
  const [isEditingCostPrice, setIsEditingCostPrice] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId) return;
    onAddOrder(formData);
    // If there are shipping costs, create an expense record in RUB
    if (formData.shippingCost > 0 && onAddExpense) {
      const product = products.find(p => p.id === formData.productId);
      onAddExpense({
        date: formData.orderDate,
        type: 'logistics',
        description: `Доставка заказа ${product?.name} (${formData.quantity} шт)`,
        // Convert shipping cost to RUB
        amount: formData.shippingCost * formData.tryRate,
        productId: formData.productId,
        productName: product?.name
      });
    }
    setFormData({
      productId: '',
      quantity: 1,
      shippingCost: 0,
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDays: 7,
      costPriceTRY: undefined,
      tryRate: 3.2
    });
    onClose();
  };
  const selectedProduct = products.find(p => p.id === formData.productId);
  // Calculate totals
  const costPriceTRY = formData.costPriceTRY ?? selectedProduct?.costPriceTRY ?? 0;
  const totalCostTRY = costPriceTRY * formData.quantity;
  const totalWithShippingTRY = totalCostTRY + formData.shippingCost;
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <motion.div initial={{
        opacity: 0,
        scale: 0.95
      }} animate={{
        opacity: 1,
        scale: 1
      }} exit={{
        opacity: 0,
        scale: 0.95
      }} className="relative bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-xl flex items-center justify-center">
                <Package className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Добавить заказ</h2>
                <p className="text-sm text-muted-foreground">
                  Укажите детали заказа
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Package className="inline h-4 w-4 mr-1" />
                Товар
              </label>
              <select value={formData.productId} onChange={e => {
              const product = products.find(p => p.id === e.target.value);
              setFormData(prev => ({
                ...prev,
                productId: e.target.value,
                costPriceTRY: product?.costPriceTRY
              }));
            }} className="w-full h-11 px-4 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" required>
                <option value="">Выберите товар</option>
                {products.map(product => <option key={product.id} value={product.id}>
                    {product.name}
                  </option>)}
              </select>
            </div>
            {/* Cost Price TRY - Shows only when product is selected */}
            <AnimatePresence>
              {selectedProduct && <motion.div initial={{
              opacity: 0,
              y: -10
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: -10
            }}>
                  <label className="block text-sm font-medium mb-2">
                    <Calculator className="inline h-4 w-4 mr-1" />
                    Себестоимость (TRY)
                  </label>
                  <div className="relative">
                    <input type="number" value={formData.costPriceTRY ?? selectedProduct.costPriceTRY ?? ''} onChange={e => setFormData(prev => ({
                  ...prev,
                  costPriceTRY: parseFloat(e.target.value) || undefined
                }))} className="w-full h-11 px-4 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" disabled={!isEditingCostPrice} />
                    <button type="button" onClick={() => setIsEditingCostPrice(!isEditingCostPrice)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>}
            </AnimatePresence>
            {/* TRY Rate - Shows only when product is selected */}
            <AnimatePresence>
              {selectedProduct && <motion.div initial={{
              opacity: 0,
              y: -10
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: -10
            }}>
                  <label className="block text-sm font-medium mb-2">
                    <Calculator className="inline h-4 w-4 mr-1" />
                    Курс лиры (TRY)
                  </label>
                  <input type="number" min="0.01" step="0.01" value={formData.tryRate} onChange={e => setFormData(prev => ({
                ...prev,
                tryRate: parseFloat(e.target.value) || 3.2
              }))} className="w-full h-11 px-4 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="Введите курс лиры" />
                </motion.div>}
            </AnimatePresence>
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Количество
              </label>
              <input type="number" min="1" value={formData.quantity} onChange={e => setFormData(prev => ({
              ...prev,
              quantity: parseInt(e.target.value) || 1
            }))} className="w-full h-11 px-4 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" required />
              {selectedProduct && <p className="text-xs text-muted-foreground mt-1">
                  Рекомендуется: {selectedProduct.recommendedOrder} шт
                </p>}
            </div>
            {/* Shipping Cost */}
            {/* Order Date */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Дата заказа
              </label>
              <input type="date" value={formData.orderDate} onChange={e => setFormData(prev => ({
              ...prev,
              orderDate: e.target.value
            }))} className="w-full h-11 px-4 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" required />
            </div>
            {/* Delivery Days */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Срок доставки (дней)
              </label>
              <input type="number" min="1" value={formData.deliveryDays} onChange={e => setFormData(prev => ({
              ...prev,
              deliveryDays: parseInt(e.target.value) || 7
            }))} className="w-full h-11 px-4 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" required />
            </div>
            {/* Summary */}
            <motion.div initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: 10
          }} className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 space-y-2">
              <h4 className="font-medium text-emerald-900 dark:text-emerald-100">
                Итого по заказу:
              </h4>
              <div className="space-y-1.5 text-sm text-emerald-800 dark:text-emerald-200">
                <div className="flex justify-between">
                  <span>Себестоимость:</span>
                  <div className="text-right">
                    <div className="font-mono">
                      {costPriceTRY} × {formData.quantity} = {totalCostTRY} TRY
                    </div>
                    <div className="font-mono text-emerald-600 dark:text-emerald-400 text-xs">
                      {(costPriceTRY * formData.tryRate).toLocaleString('ru-RU')}{' '}
                      × {formData.quantity} ={' '}
                      {(totalCostTRY * formData.tryRate).toLocaleString('ru-RU')}{' '}
                      ₽
                    </div>
                  </div>
                </div>
                <div className="h-px bg-emerald-200 dark:bg-emerald-700 my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Итого:</span>
                  <div className="text-right">
                    <div className="font-mono">{totalCostTRY} TRY</div>
                    <div className="font-mono text-emerald-600 dark:text-emerald-400">
                      {(totalCostTRY * formData.tryRate).toLocaleString('ru-RU')}{' '}
                      ₽
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 h-11 px-4 border border-border rounded-xl hover:bg-accent transition-all duration-200">
                Отмена
              </button>
              <button type="submit" className="flex-1 h-11 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 font-medium shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30">
                Создать заказ
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>;
}