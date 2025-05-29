import React, { useEffect, useState } from 'react';
import { X, Package2, Truck } from 'lucide-react';
interface Product {
  id: string;
  name: string;
  inDelivery: number;
}
interface ReceiveDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  onSave: (data: {
    quantity: number;
    deliveryCost: number;
  }) => void;
}
export function ReceiveDeliveryModal({
  isOpen,
  onClose,
  product,
  onSave
}: ReceiveDeliveryModalProps) {
  const [formData, setFormData] = useState({
    quantity: 0,
    deliveryCost: 0
  });
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        quantity: product.inDelivery,
        deliveryCost: 0
      });
    }
  }, [product, isOpen]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.quantity <= 0 || formData.quantity > (product?.inDelivery || 0)) return;
    onSave(formData);
    setFormData({
      quantity: 0,
      deliveryCost: 0
    });
  };
  if (!isOpen || !product) return null;
  return <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        <div className="relative bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-xl overflow-y-auto max-h-[90vh] p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 dark:bg-emerald-900 rounded-xl flex items-center justify-center">
                <Package2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold">Оприходовать товар</h2>
                <p className="text-xs sm:text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-none">{product.name}</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-accent rounded-lg"
              aria-label="Закрыть"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Количество */}
            <div>
              <label className="block text-sm font-medium mb-1.5 sm:mb-2">
                <Package2 className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Сколько приехало?
              </label>
              <input 
                type="number" 
                min="1" 
                max={product.inDelivery} 
                value={formData.quantity} 
                onChange={e => setFormData(prev => ({
                  ...prev,
                  quantity: parseInt(e.target.value) || 0
                }))} 
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" 
                required 
                autoFocus 
                aria-label="Количество товара"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Максимум: {product.inDelivery} шт
              </p>
            </div>
            {/* Расходы на доставку */}
            <div>
              <label className="block text-sm font-medium mb-1.5 sm:mb-2">
                <Truck className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Расходы на доставку (₽)
              </label>
              <input 
                type="number" 
                min="0" 
                step="0.01" 
                value={formData.deliveryCost} 
                onChange={e => setFormData(prev => ({
                  ...prev,
                  deliveryCost: parseFloat(e.target.value) || 0
                }))} 
                placeholder="Введите сумму расходов" 
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" 
                aria-label="Расходы на доставку"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Включает почту, курьера, таможню и другие расходы
              </p>
            </div>
            {/* Сводка */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 sm:p-4">
              <h4 className="text-sm font-medium text-emerald-900 dark:text-emerald-100 mb-2">
                Сводка операции:
              </h4>
              <div className="space-y-1 text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
                <div className="flex justify-between">
                  <span>Товар:</span>
                  <span className="truncate max-w-[150px] sm:max-w-none">{product.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Оприходуется:</span>
                  <span>{formData.quantity} шт</span>
                </div>
                <div className="flex justify-between">
                  <span>Останется в пути:</span>
                  <span>{product.inDelivery - formData.quantity} шт</span>
                </div>
                <div className="flex justify-between">
                  <span>Расходы:</span>
                  <span>{formData.deliveryCost.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 border border-border rounded-xl hover:bg-accent transition-colors"
              >
                Отмена
              </button>
              <button 
                type="submit" 
                className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={formData.quantity <= 0 || formData.quantity > product.inDelivery}
              >
                Оприходовать
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>;
}