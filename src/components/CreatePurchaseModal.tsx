import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Package, 
  Calendar, 
  Calculator, 
  Truck, 
  Plus, 
  Save, 
  Loader2,
  Trash2 
} from 'lucide-react';
import { productsApi, purchasesApi, expensesApi } from '../services/api';
import type { ApiProduct } from '../services/api';

interface PurchaseItem {
  productId: string;
  qty: number;
  unitCostTRY: number;
}

interface CreatePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreatePurchaseModal({ isOpen, onClose, onSuccess }: CreatePurchaseModalProps) {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [purchaseForm, setPurchaseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    liraRate: 3.2,
    estimatedDeliveryDays: 7,
    items: [{
      productId: '',
      qty: 1,
      unitCostTRY: 0
    }] as PurchaseItem[]
  });

  // Загрузка товаров при открытии модалки
  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await productsApi.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const resetForm = () => {
    setPurchaseForm({
      date: new Date().toISOString().split('T')[0],
      supplier: '',
      liraRate: 3.2,
      estimatedDeliveryDays: 7,
      items: [{
        productId: '',
        qty: 1,
        unitCostTRY: 0
      }]
    });
  };

  const addPurchaseItem = () => {
    setPurchaseForm(prev => ({
      ...prev,
      items: [...prev.items, {
        productId: '',
        qty: 1,
        unitCostTRY: 0
      }]
    }));
  };

  const removePurchaseItem = (index: number) => {
    setPurchaseForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updatePurchaseItem = (index: number, field: keyof PurchaseItem, value: string | number) => {
    setPurchaseForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));

    // Если выбрали товар, автоматически подставляем его цену
    if (field === 'productId' && value) {
      const product = products.find(p => p.id.toString() === value);
      if (product) {
        updatePurchaseItem(index, 'unitCostTRY', product.costPriceTRY);
      }
    }
  };

  const calculateTotal = () => {
    return purchaseForm.items.reduce((sum, item) => sum + (item.qty * item.unitCostTRY), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    if (!purchaseForm.supplier.trim()) {
      alert('Пожалуйста, укажите поставщика');
      return;
    }
    
    if (purchaseForm.items.some(item => !item.productId || item.qty <= 0 || item.unitCostTRY <= 0)) {
      alert('Пожалуйста, заполните все поля товаров корректно');
      return;
    }

    setLoading(true);
    try {
      const purchaseData = {
        date: purchaseForm.date,
        supplier: purchaseForm.supplier,
        liraRate: purchaseForm.liraRate,
        estimatedDeliveryDays: purchaseForm.estimatedDeliveryDays,
        items: purchaseForm.items
      };

      await purchasesApi.create(purchaseData);
      
      // Создаем расход для закупки
      const totalAmountTRY = calculateTotal();
      const totalAmountRUB = totalAmountTRY * purchaseForm.liraRate;
      
      const purchaseItemsForExpense = purchaseForm.items.map(item => {
        const product = products.find(p => p.id.toString() === item.productId);
        return {
          productName: product?.name || `Товар ID: ${item.productId}`,
          quantity: item.qty,
          unitCostTRY: item.unitCostTRY
        };
      });
      
      try {
        await expensesApi.create({
          date: purchaseForm.date,
          type: 'Закупка товара',
          description: `Закупка у поставщика ${purchaseForm.supplier}`,
          amount: totalAmountRUB,
          purchaseItems: purchaseItemsForExpense
        });
      } catch (expenseError) {
        console.error('Failed to create expense for purchase:', expenseError);
      }
      
      resetForm();
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create purchase:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalTRY = calculateTotal();
  const totalRUB = totalTRY * purchaseForm.liraRate;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-xl lg:max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 dark:bg-emerald-900 rounded-xl flex items-center justify-center">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold">Создать закупку товара</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Быстрое создание закупки с нескольких товаров
                  </p>
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
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 sm:mb-2">
                    <Calendar className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Дата закупки
                  </label>
                  <input
                    type="date"
                    value={purchaseForm.date}
                    onChange={e => setPurchaseForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 sm:mb-2">
                    <Package className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Поставщик
                  </label>
                  <input
                    type="text"
                    value={purchaseForm.supplier}
                    onChange={e => setPurchaseForm(prev => ({ ...prev, supplier: e.target.value }))}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm sm:text-base"
                    placeholder="Название поставщика"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 sm:mb-2">
                    <Calculator className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Курс лиры
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={purchaseForm.liraRate}
                    onChange={e => setPurchaseForm(prev => ({ ...prev, liraRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 sm:mb-2">
                    <Truck className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Срок доставки</span>
                    <span className="sm:hidden">Дней</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={purchaseForm.estimatedDeliveryDays}
                    onChange={e => setPurchaseForm(prev => ({ ...prev, estimatedDeliveryDays: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              {/* Products Section */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-semibold">Товары</h3>
                  <button
                    type="button"
                    onClick={addPurchaseItem}
                    className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors text-sm sm:text-base"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Добавить товар</span>
                    <span className="sm:hidden">Добавить</span>
                  </button>
                </div>

                {/* Purchase Items */}
                <div className="space-y-2 sm:space-y-3">
                  {purchaseForm.items.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col sm:flex-row gap-2 sm:gap-4 p-3 sm:p-4 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-border/50"
                    >
                      {/* Product Selection */}
                      <div className="flex-[2]">
                        <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Товар</label>
                        <select
                          value={item.productId}
                          onChange={e => updatePurchaseItem(index, 'productId', e.target.value)}
                          disabled={productsLoading}
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/80 dark:bg-slate-900/80 border border-border/50 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm sm:text-base"
                          required
                        >
                          <option value="">Выберите товар</option>
                          {productsLoading ? (
                            <option disabled>Загрузка товаров...</option>
                          ) : (
                            products.map(p => (
                              <option key={p.id} value={p.id.toString()}>
                                {p.name}
                              </option>
                            ))
                          )}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div className="flex-1">
                        <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Количество</label>
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={e => updatePurchaseItem(index, 'qty', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/80 dark:bg-slate-900/80 border border-border/50 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm sm:text-base"
                          required
                        />
                      </div>

                      {/* Unit Cost */}
                      <div className="flex-1">
                        <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                          <span className="hidden sm:inline">Цена за ед.</span>
                          <span className="sm:hidden">Цена</span>
                          (TRY)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitCostTRY}
                          onChange={e => updatePurchaseItem(index, 'unitCostTRY', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-white/80 dark:bg-slate-900/80 border border-border/50 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm sm:text-base"
                          required
                        />
                      </div>

                      {/* Remove Button */}
                      {purchaseForm.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePurchaseItem(index)}
                          className="self-end p-2 sm:p-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
                          aria-label="Удалить товар"
                        >
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-accent/50 rounded-xl p-3 sm:p-4">
                <h4 className="font-medium mb-2 sm:mb-3 text-sm sm:text-base">Итого по закупке:</h4>
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-muted-foreground">Общая сумма:</span>
                    <span className="font-mono font-medium">
                      {totalTRY.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TRY
                    </span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-muted-foreground">В рублях:</span>
                    <span className="font-mono font-medium">
                      {totalRUB.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 border border-border rounded-xl hover:bg-accent transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl transition-colors font-medium shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Создание...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Создать закупку</span>
                    </>
                  )}
                </button>
              </div>

              {/* Info Message */}
              <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                  <strong>Примечание:</strong> При создании закупки автоматически создается расход в разделе "Расходы". 
                  При оприходовании закупки с указанием расходов на доставку также будет создан расход типа "Логистика".
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 