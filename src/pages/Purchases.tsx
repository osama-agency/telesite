import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Calendar, Calculator, Package, X, Save, Loader2, History, Eye, Trash2, Truck, CheckCircle } from 'lucide-react';
import { productsApi, purchasesApi, expensesApi, type ApiProduct, type Purchase } from '../services/api';

interface PurchaseItem {
  productId: string;
  qty: number;
  unitCostTRY: number;
}

interface PurchaseForm {
  date: string;
  supplier: string;
  liraRate: number;
  estimatedDeliveryDays: number;
  items: PurchaseItem[];
}

interface NewProductForm {
  name: string;
  costPriceTRY: number;
}

interface ReceiveForm {
  deliveredItems: Array<{
    productId: string;
    qtyDelivered: number;
  }>;
  deliveryExpenseRUB: number;
}

export function Purchases() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [purchaseForm, setPurchaseForm] = useState<PurchaseForm>({
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

  const [newProductForm, setNewProductForm] = useState<NewProductForm>({
    name: '',
    costPriceTRY: 0
  });

  const [receiveForm, setReceiveForm] = useState<ReceiveForm>({
    deliveredItems: [],
    deliveryExpenseRUB: 0
  });

  // Загрузка товаров
  useEffect(() => {
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
    fetchProducts();
  }, []);

  // Загрузка истории закупок
  useEffect(() => {
    const fetchPurchases = async () => {
      setPurchasesLoading(true);
      try {
        const response = await purchasesApi.getAll({ limit: 20 });
        setPurchases(response.data);
      } catch (error) {
        console.error('Failed to fetch purchases:', error);
      } finally {
        setPurchasesLoading(false);
      }
    };
    fetchPurchases();
  }, []);

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
  };

  const handleCreateProduct = async () => {
    if (!newProductForm.name || newProductForm.costPriceTRY <= 0) {
      return;
    }

    setLoading(true);
    try {
      const newProduct = await productsApi.create(newProductForm);
      setProducts(prev => [...prev, newProduct]);
      setNewProductForm({ name: '', costPriceTRY: 0 });
      setIsAddProductModalOpen(false);
    } catch (error) {
      console.error('Failed to create product:', error);
    } finally {
      setLoading(false);
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

      const newPurchase = await purchasesApi.create(purchaseData);
      
      // Добавляем новую закупку в начало списка
      setPurchases(prev => [newPurchase, ...prev]);
      
      // Создаем расход для закупки
      const totalAmountTRY = purchaseForm.items.reduce((sum, item) => sum + (item.qty * item.unitCostTRY), 0);
      const totalAmountRUB = totalAmountTRY * purchaseForm.liraRate;
      
      // Подготавливаем информацию о товарах для расхода
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
        // Не прерываем процесс, если не удалось создать расход
      }
      
      // Сбрасываем форму
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
    } catch (error) {
      console.error('Failed to create purchase:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePurchase = async (id?: string) => {
    if (!id) return;
    
    console.log('Attempting to delete purchase:', id);
    
    if (!window.confirm('Удалить эту закупку?')) return;
    
    setLoading(true);
    try {
      console.log('Calling purchasesApi.delete with id:', id);
      await purchasesApi.delete(id);
      
      console.log('Purchase deleted successfully, updating state');
      setPurchases(prev => prev.filter(p => p.id !== id));
      
    } catch (error) {
      console.error('Failed to delete purchase:', error);
      alert('Ошибка при удалении закупки. Проверьте консоль для деталей.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReceiveModal = (purchase: Purchase) => {
    console.log('Opening receive modal for purchase:', purchase);
    console.log('Purchase items:', purchase.items);
    
    setSelectedPurchase(purchase);
    // Инициализируем форму оприходования с товарами из закупки
    const deliveredItems = purchase.items.map(item => {
      // Если item.productId это объект (популированный), берем id из него
      // Если это строка, используем как есть
      let productId;
      if (typeof item.productId === 'object' && item.productId !== null) {
        // Популированный объект из базы данных
        productId = (item.productId as any).id || (item.productId as any)._id;
      } else {
        // Простая строка ID
        productId = item.productId;
      }
      
      console.log('Processing item:', item, 'productId:', productId);
      
      return {
        productId: String(productId),
        qtyDelivered: item.qty // По умолчанию ставим полное количество
      };
    });
    
    console.log('Prepared delivered items:', deliveredItems);
    
    setReceiveForm({
      deliveredItems,
      deliveryExpenseRUB: 0
    });
    setIsReceiveModalOpen(true);
  };

  const handleReceivePurchase = async () => {
    if (!selectedPurchase?.id) return;

    console.log('Receiving purchase:', selectedPurchase.id);
    console.log('Receive form data:', receiveForm);

    setLoading(true);
    try {
      const updatedPurchase = await purchasesApi.receive(selectedPurchase.id, receiveForm);
      
      console.log('Purchase received successfully:', updatedPurchase);
      
      // Обновляем закупку в списке
      setPurchases(prev => prev.map(p => 
        p.id === updatedPurchase.id ? updatedPurchase : p
      ));
      
      // Если есть расходы на доставку, создаем расход типа "Логистика"
      if (receiveForm.deliveryExpenseRUB > 0) {
        try {
          await expensesApi.create({
            date: new Date().toISOString().split('T')[0],
            type: 'Логистика',
            description: `Доставка закупки от ${selectedPurchase.supplier}`,
            amount: receiveForm.deliveryExpenseRUB,
          });
        } catch (expenseError) {
          console.error('Failed to create logistics expense:', expenseError);
          // Не прерываем процесс, если не удалось создать расход
        }
      }
      
      setIsReceiveModalOpen(false);
      setSelectedPurchase(null);
    } catch (error) {
      console.error('Failed to receive purchase:', error);
      alert('Ошибка при оприходовании закупки. Проверьте консоль для деталей.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsDetailsModalOpen(true);
  };

  const getStatusBadge = (status: Purchase['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">
            Ожидает отправки
          </span>
        );
      case 'in_transit':
        return (
          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
            В пути
          </span>
        );
      case 'delivered':
        return (
          <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
            Оприходовано
          </span>
        );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800/50"
    >
      {/* Header */}
      <div className="relative">
        <motion.div 
          initial={{ scale: 0.95 }} 
          animate={{ scale: 1 }} 
          className="absolute -top-8 -left-8 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-2xl hidden sm:block" 
        />
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
            Закупка товара
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground/80 mt-2">
            Создание закупок и управление историей
          </p>
        </div>
      </div>

      {/* Purchase Form */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-border/50 shadow-xl p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="purchaseDate">
                <Calendar className="inline h-4 w-4 mr-1" />
                Дата закупки
              </label>
              <input
                id="purchaseDate"
                type="date"
                value={purchaseForm.date}
                onChange={e => setPurchaseForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="supplier">
                <Package className="inline h-4 w-4 mr-1" />
                Поставщик
              </label>
              <input
                id="supplier"
                type="text"
                value={purchaseForm.supplier}
                onChange={e => setPurchaseForm(prev => ({ ...prev, supplier: e.target.value }))}
                className="w-full px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                placeholder="Название поставщика"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="liraRate">
                <Calculator className="inline h-4 w-4 mr-1" />
                Курс лиры
              </label>
              <input
                id="liraRate"
                type="number"
                step="0.01"
                min="0.01"
                value={purchaseForm.liraRate}
                onChange={e => setPurchaseForm(prev => ({ ...prev, liraRate: parseFloat(e.target.value) || 0 }))}
                className="w-full px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="deliveryDays">
                <Truck className="inline h-4 w-4 mr-1" />
                Срок доставки (дней)
              </label>
              <input
                id="deliveryDays"
                type="number"
                min="1"
                value={purchaseForm.estimatedDeliveryDays}
                onChange={e => setPurchaseForm(prev => ({ ...prev, estimatedDeliveryDays: parseInt(e.target.value) || 1 }))}
                className="w-full px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                required
              />
            </div>
          </div>

          {/* Products Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-lg font-semibold">Товары</h3>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={addPurchaseItem}
                className="relative w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-xl shadow-lg transition-all duration-300 overflow-hidden group bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
              >
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                <Plus className="h-4 w-4 mr-2 text-white" />
                <span className="text-white font-medium">Добавить товар</span>
              </motion.button>
            </div>

            {/* Purchase Items */}
            <div className="space-y-4">
              {purchaseForm.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col lg:flex-row gap-4 p-4 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-border/50 hover:shadow-lg transition-all duration-300"
                >
                  {/* Product Selection */}
                  <div className="flex-[2]">
                    <label className="block text-sm font-medium mb-2">Товар</label>
                    <div className="flex gap-2">
                      <select
                        value={item.productId}
                        onChange={e => updatePurchaseItem(index, 'productId', e.target.value)}
                        disabled={productsLoading}
                        className="flex-1 px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      >
                        <option value="">Выберите товар</option>
                        {productsLoading ? (
                          <option disabled>Загрузка товаров...</option>
                        ) : (
                          products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))
                        )}
                      </select>
                      <button
                        type="button"
                        onClick={() => setIsAddProductModalOpen(true)}
                        className="px-3 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors"
                        title="Добавить новый товар"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">Количество</label>
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={e => updatePurchaseItem(index, 'qty', parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  {/* Unit Cost */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">Цена за ед. (TRY)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitCostTRY}
                      onChange={e => updatePurchaseItem(index, 'unitCostTRY', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  {/* Remove Button */}
                  {purchaseForm.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePurchaseItem(index)}
                      className="self-end p-3 rounded-xl transition-all duration-300 group relative overflow-hidden bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-end">
              <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4">
                <p className="text-lg font-semibold">
                  Итого: {calculateTotal().toFixed(2)} TRY 
                  <span className="text-sm text-muted-foreground ml-2">
                    ({(calculateTotal() * purchaseForm.liraRate).toFixed(2)} ₽)
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="relative w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl shadow-lg transition-all duration-300 overflow-hidden group bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 className="h-5 w-5 text-white" />
                </motion.div>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2 text-white" />
                  <span className="text-white font-medium">Создать закупку</span>
                </>
              )}
            </motion.button>
          </div>
          
          {/* Info Message */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Примечание:</strong> При создании закупки автоматически создается расход в разделе "Расходы". 
              При оприходовании закупки с указанием расходов на доставку также будет создан расход типа "Логистика".
            </p>
          </div>
        </form>
      </div>

      {/* Purchases History */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-border/50 shadow-xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <History className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">История закупок</h2>
                <p className="text-sm text-muted-foreground">
                  {purchases.length} закупок найдено
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Purchases List */}
        <div className="divide-y divide-border/50">
          {purchasesLoading ? (
            <div className="p-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="mx-auto w-8 h-8 text-emerald-500"
              >
                <Loader2 className="h-8 w-8" />
              </motion.div>
              <p className="mt-4 text-muted-foreground">Загрузка закупок...</p>
            </div>
          ) : purchases.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Нет закупок
              </h3>
              <p className="text-sm text-muted-foreground/70">
                Создайте первую закупку, используя форму выше
              </p>
            </div>
          ) : (
            purchases.map((purchase) => (
              <motion.div
                key={purchase.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 sm:p-6 hover:bg-accent/30 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Purchase Info */}
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                      <h3 className="font-medium text-lg">{purchase.supplier}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">
                          {new Date(purchase.date).toLocaleDateString('ru-RU')}
                        </span>
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                          {purchase.items.length} товаров
                        </span>
                        {getStatusBadge(purchase.status || 'pending')}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Курс лиры</p>
                        <p className="font-medium">{purchase.liraRate}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Сумма TRY</p>
                        <p className="font-medium">{purchase.totalTRY.toFixed(2)} TRY</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Сумма ₽</p>
                        <p className="font-medium">
                          {(purchase.totalTRY * purchase.liraRate).toFixed(2)} ₽
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Срок доставки</p>
                        <p className="font-medium">
                          {purchase.estimatedDeliveryDays || '-'} дней
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Создана</p>
                        <p className="font-medium">
                          {purchase.createdAt ? new Date(purchase.createdAt).toLocaleDateString('ru-RU') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {purchase.status !== 'delivered' && (
                      <button
                        onClick={() => handleOpenReceiveModal(purchase)}
                        className="p-2 rounded-lg transition-all duration-300 group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                        title="Оприходовать"
                      >
                        <CheckCircle className="h-4 w-4 text-white" />
                      </button>
                    )}
                    <button
                      onClick={() => handleViewDetails(purchase)}
                      className="p-2 rounded-lg transition-all duration-300 group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                      title="Просмотреть детали"
                    >
                      <Eye className="h-4 w-4 text-white" />
                    </button>
                    <button
                      onClick={() => handleDeletePurchase(purchase.id)}
                      className="p-2 rounded-lg transition-all duration-300 group relative overflow-hidden bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600"
                      title="Удалить закупку"
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {isAddProductModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsAddProductModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Добавить новый товар</h2>
                  <button
                    onClick={() => setIsAddProductModalOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleCreateProduct();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Название товара
                    </label>
                    <input
                      type="text"
                      value={newProductForm.name}
                      onChange={e => setNewProductForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      placeholder="Введите название товара"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Стоимость в лире (TRY)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newProductForm.costPriceTRY}
                      onChange={e => setNewProductForm(prev => ({ ...prev, costPriceTRY: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsAddProductModalOpen(false)}
                      className="flex-1 px-4 py-3 border border-border rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !newProductForm.name || newProductForm.costPriceTRY <= 0}
                      className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                    >
                      {loading ? 'Создание...' : 'Создать'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Receive Purchase Modal */}
      <AnimatePresence>
        {isReceiveModalOpen && selectedPurchase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsReceiveModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Оприходование закупки</h2>
                  <button
                    onClick={() => setIsReceiveModalOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleReceivePurchase();
                  }}
                  className="space-y-6"
                >
                  {/* Purchase Info */}
                  <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
                    <h3 className="font-medium mb-2">{selectedPurchase.supplier}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Дата закупки</p>
                        <p className="font-medium">{new Date(selectedPurchase.date).toLocaleDateString('ru-RU')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Сумма</p>
                        <p className="font-medium">{selectedPurchase.totalTRY.toFixed(2)} TRY</p>
                      </div>
                    </div>
                  </div>

                  {/* Delivered Items */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Оприходованные товары</h3>
                    {receiveForm.deliveredItems.map((deliveredItem, index) => {
                      // Ищем исходный товар в закупке
                      const originalItem = selectedPurchase.items.find(item => {
                        // Если item.productId это объект (популированный), сравниваем с id
                        if (typeof item.productId === 'object' && item.productId !== null) {
                          const itemId = (item.productId as any).id || (item.productId as any)._id;
                          return String(itemId) === String(deliveredItem.productId);
                        }
                        // Если это строка, сравниваем напрямую
                        return String(item.productId) === String(deliveredItem.productId);
                      });
                      
                      // Ищем продукт в списке продуктов
                      const product = products.find(p => p.id.toString() === deliveredItem.productId);
                      
                      console.log('Rendering delivered item:', deliveredItem, 'originalItem:', originalItem, 'product:', product);
                      
                      return (
                        <div key={index} className="border border-border rounded-xl p-4">
                          <div className="font-medium mb-2">{product?.name || `Товар ID: ${deliveredItem.productId}`}</div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm text-muted-foreground mb-1">
                                Заказано
                              </label>
                              <p className="font-medium">{originalItem?.qty || 0} шт.</p>
                            </div>
                            <div>
                              <label className="block text-sm text-muted-foreground mb-1">
                                Получено
                              </label>
                              <input
                                type="number"
                                min="0"
                                max={originalItem?.qty || 999}
                                value={deliveredItem.qtyDelivered}
                                onChange={e => {
                                  const newValue = parseInt(e.target.value) || 0;
                                  console.log('Updating delivered quantity for item', index, 'to', newValue);
                                  setReceiveForm(prev => ({
                                    ...prev,
                                    deliveredItems: prev.deliveredItems.map((item, i) =>
                                      i === index 
                                        ? { ...item, qtyDelivered: newValue }
                                        : item
                                    )
                                  }));
                                }}
                                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-muted-foreground mb-1">
                                Разница
                              </label>
                              <p className={`font-medium ${
                                deliveredItem.qtyDelivered < (originalItem?.qty || 0)
                                  ? 'text-red-600'
                                  : deliveredItem.qtyDelivered === (originalItem?.qty || 0)
                                  ? 'text-green-600'
                                  : 'text-blue-600'
                              }`}>
                                {deliveredItem.qtyDelivered - (originalItem?.qty || 0)} шт.
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Delivery Expense */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Truck className="inline h-4 w-4 mr-1" />
                      Расходы на доставку (₽)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={receiveForm.deliveryExpenseRUB}
                      onChange={e => setReceiveForm(prev => ({
                        ...prev,
                        deliveryExpenseRUB: parseFloat(e.target.value) || 0
                      }))}
                      className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      placeholder="0.00"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Эта сумма будет добавлена в расходы по логистике
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsReceiveModalOpen(false)}
                      className="flex-1 px-4 py-3 border border-border rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={loading || receiveForm.deliveredItems.every(item => item.qtyDelivered === 0)}
                      className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      <span>{loading ? 'Обработка...' : 'Оприходовать'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Details Modal */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedPurchase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsDetailsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Детали закупки</h2>
                  <button
                    onClick={() => setIsDetailsModalOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Purchase Header Info */}
                <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-lg mb-4">{selectedPurchase.supplier}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Дата закупки</p>
                      <p className="font-medium">{new Date(selectedPurchase.date).toLocaleDateString('ru-RU')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Курс лиры</p>
                      <p className="font-medium">{selectedPurchase.liraRate} ₽/TRY</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Статус</p>
                      <div className="mt-1">{getStatusBadge(selectedPurchase.status || 'pending')}</div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Срок доставки</p>
                      <p className="font-medium">{selectedPurchase.estimatedDeliveryDays || '-'} дней</p>
                    </div>
                  </div>
                </div>

                {/* Products Details */}
                <div className="space-y-4 mb-6">
                  <h3 className="font-semibold">Товары в закупке</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-2">Товар</th>
                          <th className="text-right py-3 px-2">Кол-во</th>
                          <th className="text-right py-3 px-2">Цена за ед. (TRY)</th>
                          <th className="text-right py-3 px-2">Сумма (TRY)</th>
                          <th className="text-right py-3 px-2">Сумма (₽)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPurchase.items.map((item, index) => {
                          // Определяем ID продукта для поиска
                          let productId;
                          if (typeof item.productId === 'object' && item.productId !== null) {
                            productId = (item.productId as any).id || (item.productId as any)._id;
                          } else {
                            productId = item.productId;
                          }
                          
                          const product = products.find(p => p.id.toString() === String(productId));
                          const itemTotalTRY = item.qty * item.unitCostTRY;
                          const itemTotalRUB = itemTotalTRY * selectedPurchase.liraRate;
                          
                          return (
                            <tr key={index} className="border-b border-border/50">
                              <td className="py-3 px-2 font-medium">
                                {product?.name || `Товар ID: ${productId}`}
                              </td>
                              <td className="text-right py-3 px-2">{item.qty} шт.</td>
                              <td className="text-right py-3 px-2">{item.unitCostTRY.toFixed(2)}</td>
                              <td className="text-right py-3 px-2 font-medium">{itemTotalTRY.toFixed(2)}</td>
                              <td className="text-right py-3 px-2 text-muted-foreground">
                                {itemTotalRUB.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-border font-semibold">
                          <td colSpan={3} className="py-3 px-2 text-right">Итого:</td>
                          <td className="text-right py-3 px-2 text-lg">
                            {selectedPurchase.totalTRY.toFixed(2)} TRY
                          </td>
                          <td className="text-right py-3 px-2 text-lg text-emerald-600 dark:text-emerald-400">
                            {(selectedPurchase.totalTRY * selectedPurchase.liraRate).toFixed(2)} ₽
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Delivery Info if delivered */}
                {selectedPurchase.status === 'delivered' && selectedPurchase.deliveredItems && (
                  <div className="space-y-4 mb-6">
                    <h3 className="font-semibold">Информация о доставке</h3>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Дата оприходования</p>
                          <p className="font-medium">
                            {selectedPurchase.deliveredAt 
                              ? new Date(selectedPurchase.deliveredAt).toLocaleDateString('ru-RU')
                              : '-'
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Расходы на доставку</p>
                          <p className="font-medium">
                            {selectedPurchase.deliveryExpenseRUB 
                              ? `${selectedPurchase.deliveryExpenseRUB.toFixed(2)} ₽`
                              : '-'
                            }
                          </p>
                        </div>
                      </div>
                      
                      {selectedPurchase.deliveredItems.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-muted-foreground mb-2">Оприходованные товары:</p>
                          <div className="space-y-1">
                            {selectedPurchase.deliveredItems.map((item, index) => {
                              // Определяем ID продукта для поиска
                              let productId;
                              if (typeof item.productId === 'object' && item.productId !== null) {
                                productId = (item.productId as any).id || (item.productId as any)._id;
                              } else {
                                productId = item.productId;
                              }
                              
                              const product = products.find(p => p.id.toString() === String(productId));
                              const originalItem = selectedPurchase.items.find(i => {
                                let originalProductId;
                                if (typeof i.productId === 'object' && i.productId !== null) {
                                  originalProductId = (i.productId as any).id || (i.productId as any)._id;
                                } else {
                                  originalProductId = i.productId;
                                }
                                return String(originalProductId) === String(productId);
                              });
                              
                              return (
                                <div key={index} className="text-sm flex justify-between">
                                  <span>{product?.name || `Товар ID: ${productId}`}</span>
                                  <span className={
                                    item.qtyDelivered < (originalItem?.qty || 0)
                                      ? 'text-red-600 dark:text-red-400'
                                      : 'text-green-600 dark:text-green-400'
                                  }>
                                    {item.qtyDelivered} из {originalItem?.qty || 0} шт.
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="text-xs text-muted-foreground/70 flex justify-between">
                  <span>Создано: {selectedPurchase.createdAt ? new Date(selectedPurchase.createdAt).toLocaleString('ru-RU') : 'N/A'}</span>
                  <span>Обновлено: {selectedPurchase.updatedAt ? new Date(selectedPurchase.updatedAt).toLocaleString('ru-RU') : 'N/A'}</span>
                </div>

                {/* Close Button */}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setIsDetailsModalOpen(false)}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 