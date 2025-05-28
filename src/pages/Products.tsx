import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Package, Truck, CheckCircle, DollarSign, Edit3, Calculator, ShoppingCart, AlertCircle, Sparkles, ChevronsUpDown, Settings2, Calendar } from 'lucide-react';
import { ProductTable } from '../components/ProductTable';
import { AddOrderModal } from '../components/AddOrderModal';
import { BulkEditModal } from '../components/BulkEditModal';
import { ReceiveDeliveryModal } from '../components/ReceiveDeliveryModal';
import { productsApi, type ApiProduct } from '../services/api';
import { expensesApi } from '../services/expenses';
import { motion, AnimatePresence } from 'framer-motion';
interface Product {
  id: string;
  name: string;
  averageSellingPrice: number;
  costPriceTRY: number;
  costPriceRUB: number;
  logisticsCost: number;
  markup: number;
  marginPercent: number;
  netProfit: number;
  netProfitTotal: number;
  totalCosts: number;
  profitPercentTotal: number;
  soldPeriod: number;
  averageConsumptionDaily: number;
  currentStock: number;
  inDelivery: number;
  daysInStock: number;
  orderPoint: boolean;
  exchangeRate: number;
  fixedCosts: number;
  deliveryDays: number;
  tryRate?: number; // New field for per-row exchange rate
}
export interface Expense {
  id: string;
  date: string;
  type: 'logistics' | 'advertising' | 'courier' | 'payroll' | 'other';
  description: string;
  amount: number;
  productId?: string;
  productName?: string;
  createdAt: string;
}
const DEMO_PRODUCTS: ApiProduct[] = [{
  id: 'demo-1',
  name: 'Atominex 10mg',
  costPriceTRY: 450,
  averageSellingPrice: 2800,
  soldPeriod: 45,
  currentStock: 28,
  inDelivery: 100,
  deliveryDays: 7,
  logisticsCost: 350
}, {
  id: 'demo-2',
  name: 'Abilify 15mg',
  costPriceTRY: 380,
  averageSellingPrice: 2100,
  soldPeriod: 30,
  currentStock: 15,
  inDelivery: 0,
  deliveryDays: 7,
  logisticsCost: 350
}, {
  id: 'demo-3',
  name: 'Attex 100mg',
  costPriceTRY: 520,
  averageSellingPrice: 3200,
  soldPeriod: 60,
  currentStock: 5,
  inDelivery: 50,
  deliveryDays: 7,
  logisticsCost: 350
}];
export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'needOrder' | 'lowProfit' | 'profitable' | 'inTransit'>('all');
  const [exchangeRate, setExchangeRate] = useState(3.2);
  const [isDemoData, setIsDemoData] = useState(false);
  // Новые состояния для массового редактирования
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkEditModal, setBulkEditModal] = useState<{
    isOpen: boolean;
    type: 'costPriceTRY' | 'logisticsCost' | 'expenses' | null;
  }>({
    isOpen: false,
    type: null
  });
  const [bulkEditLoading, setBulkEditLoading] = useState(false);
  // Состояния для оприходования
  const [receiveDeliveryModal, setReceiveDeliveryModal] = useState<{
    isOpen: boolean;
    productId: string | null;
  }>({
    isOpen: false,
    productId: null
  });
  // Функция для добавления расхода (будет вызываться при оприходовании)
  const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    try {
      await expensesApi.create(expense);
    } catch (error) {
      console.error('Failed to add expense:', error);
      // Error toast is already shown by the API
    }
  };
  // Функция для расчета всех показателей с использованием per-row rate
  const calculateMetrics = (product: Partial<Product>, fallbackRate: number = exchangeRate): Product => {
    // Use product's own tryRate if available, otherwise use fallback
    const effectiveRate = product.tryRate || fallbackRate;
    const costPriceRUB = (product.costPriceTRY || 0) * effectiveRate;
    const logisticsCost = product.logisticsCost || 0;
    const fixedCosts = product.fixedCosts || 705;
    const totalCosts = costPriceRUB + logisticsCost + fixedCosts;
    const netProfit = (product.averageSellingPrice || 0) - totalCosts;
    const markup = costPriceRUB > 0 ? ((product.averageSellingPrice || 0) - costPriceRUB - logisticsCost) / costPriceRUB * 100 : 0;
    const marginPercent = (product.averageSellingPrice || 0) > 0 ? netProfit / (product.averageSellingPrice || 0) * 100 : 0;
    const netProfitTotal = netProfit * (product.soldPeriod || 0);
    const profitPercentTotal = totalCosts > 0 ? netProfit / totalCosts * 100 : 0;
    const averageConsumptionDaily = (product.soldPeriod || 0) / 30;
    const daysInStock = averageConsumptionDaily > 0 ? (product.currentStock || 0) / averageConsumptionDaily : 0;
    const orderPoint = daysInStock < (product.deliveryDays || 7);
    return {
      id: product.id || '',
      name: product.name || '',
      averageSellingPrice: product.averageSellingPrice || 0,
      costPriceTRY: product.costPriceTRY || 0,
      costPriceRUB,
      logisticsCost,
      markup,
      marginPercent,
      netProfit,
      netProfitTotal,
      totalCosts,
      profitPercentTotal,
      soldPeriod: product.soldPeriod || 0,
      averageConsumptionDaily,
      currentStock: product.currentStock || 0,
      inDelivery: product.inDelivery || 0,
      daysInStock,
      orderPoint,
      exchangeRate: effectiveRate,
      fixedCosts,
      deliveryDays: product.deliveryDays || 7,
      tryRate: product.tryRate // Preserve the per-row rate
    };
  };
  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
  }>({
    start: '',
    end: ''
  });
  useEffect(() => {
    loadProducts();
  }, []);
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsDemoData(false);
      const apiProducts = await productsApi.getAll();
      // Если API вернул пустой массив или undefined, используем демо-данные
      const productsToUse = !apiProducts || apiProducts.length === 0 ? DEMO_PRODUCTS : apiProducts;
      if (!apiProducts || apiProducts.length === 0) {
        setIsDemoData(true);
        setError('Не удалось загрузить данные с сервера. Отображаются демонстрационные данные.');
      }
      const calculatedProducts = productsToUse.map(product => calculateMetrics(product, exchangeRate));
      setProducts(calculatedProducts);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Не удалось загрузить данные с сервера. Отображаются демонстрационные данные.');
      setIsDemoData(true);
      // При ошибке используем демо-данные
      const calculatedDemoProducts = DEMO_PRODUCTS.map(product => calculateMetrics(product, exchangeRate));
      setProducts(calculatedDemoProducts);
    } finally {
      setLoading(false);
    }
  };
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    switch (selectedTab) {
      case 'needOrder':
        return matchesSearch && product.orderPoint;
      case 'lowProfit':
        return matchesSearch && product.profitPercentTotal < 10;
      case 'profitable':
        return matchesSearch && product.profitPercentTotal > 20;
      case 'inTransit':
        return matchesSearch && product.inDelivery > 0;
      default:
        return matchesSearch;
    }
  });
  const tabs = [{
    id: 'all',
    name: 'Все товары',
    icon: Package
  }, {
    id: 'needOrder',
    name: 'Нужен заказ',
    icon: Truck
  }, {
    id: 'lowProfit',
    name: 'Низкая прибыль',
    icon: DollarSign
  }, {
    id: 'profitable',
    name: 'Прибыльные',
    icon: CheckCircle
  }, {
    id: 'inTransit',
    name: 'В пути',
    icon: ShoppingCart
  }];
  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      // Optimistic update
      setProducts(prev => prev.map(p => {
        if (p.id === id) {
          return calculateMetrics({
            ...p,
            ...updates
          }, exchangeRate);
        }
        return p;
      }));
      // API call
      const updatedApiProduct = await productsApi.update(id, updates);
      // Update with real data
      setProducts(prev => prev.map(p => {
        if (p.id === id) {
          return calculateMetrics({
            ...p,
            ...updatedApiProduct
          }, exchangeRate);
        }
        return p;
      }));
    } catch (err) {
      // Revert on error - no need to show toast as API already handles it
      loadProducts();
    }
  };
  // Обработчики для массового редактирования
  const handleBulkEdit = (type: 'costPriceTRY' | 'logisticsCost' | 'expenses') => {
    if (selectedProducts.length === 0) return;
    setBulkEditModal({
      isOpen: true,
      type
    });
  };
  const handleBulkEditSave = async (value: number) => {
    setBulkEditLoading(true);
    try {
      // Prepare updates based on modal type
      const updates: Partial<Product> = {};
      if (bulkEditModal.type) {
        updates[bulkEditModal.type] = value;
      }
      // Optimistic update
      setProducts(prev => prev.map(p => {
        if (selectedProducts.includes(p.id)) {
          return calculateMetrics({
            ...p,
            ...updates
          }, exchangeRate);
        }
        return p;
      }));
      // API call
      await productsApi.bulkUpdate(selectedProducts, updates);
      // Reset state
      setBulkEditModal({
        isOpen: false,
        type: null
      });
      setSelectedProducts([]);
    } catch (error) {
      // Revert on error - no need to show toast as API already handles it
      loadProducts();
    } finally {
      setBulkEditLoading(false);
    }
  };
  // Обработчики для оприходования
  const handleReceiveDelivery = (productId: string) => {
    setReceiveDeliveryModal({
      isOpen: true,
      productId
    });
  };
  const handleReceiveDeliverySave = async (data: {
    quantity: number;
    deliveryCost: number;
  }) => {
    if (!receiveDeliveryModal.productId) return;
    const productId = receiveDeliveryModal.productId;
    const product = products.find(p => p.id === productId);
    if (product) {
      try {
        // Optimistic update
        setProducts(prev => prev.map(p => {
          if (p.id === productId) {
            const updatedProduct = {
              ...p,
              currentStock: p.currentStock + data.quantity,
              inDelivery: Math.max(0, p.inDelivery - data.quantity),
              logisticsCost: p.logisticsCost + data.deliveryCost
            };
            return calculateMetrics(updatedProduct, exchangeRate);
          }
          return p;
        }));
        // API call
        await productsApi.receiveDelivery(productId, data);
        // Create expense record if there are delivery costs
        if (data.deliveryCost > 0) {
          await addExpense({
            date: new Date().toISOString().split('T')[0],
            type: 'logistics',
            description: `Оприходование ${data.quantity} шт товара "${product.name}"`,
            amount: data.deliveryCost,
            productId: product.id,
            productName: product.name
          });
        }
      } catch (error) {
        // Revert on error - no need to show toast as API already handles it
        loadProducts();
      }
    }
    setReceiveDeliveryModal({
      isOpen: false,
      productId: null
    });
  };
  // New function for bulk editing TRY rates
  const handleBulkEditTryRate = (productIds: string[], newRate: number) => {
    setProducts(prev => prev.map(p => {
      if (productIds.includes(p.id)) {
        const updatedProduct = {
          ...p,
          tryRate: newRate
        };
        return calculateMetrics(updatedProduct, exchangeRate);
      }
      return p;
    }));
    // Show success toast (you can implement a proper toast system)
    console.log(`Updated TRY rate to ${newRate} for ${productIds.length} products`);
  };
  return <motion.div initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} className="space-y-6 sm:space-y-8">
      {/* Header - Improved responsive layout */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
        <div className="relative">
          <motion.div initial={{
          scale: 0.95
        }} animate={{
          scale: 1
        }} className="absolute -top-8 -left-8 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-2xl hidden sm:block" />
          <div className="relative">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
              Управление товарами
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mt-2">
              Аналитика прибыльности и планирование заказов
            </p>
          </div>
        </div>
      </div>
      {/* Alerts */}
      <AnimatePresence>
        {isDemoData && <motion.div initial={{
        opacity: 0,
        y: -10
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -10
      }} className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 backdrop-blur-xl border border-amber-200/50 dark:border-amber-800/50 rounded-2xl p-4 flex items-start gap-3 shadow-lg">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-amber-900 dark:text-amber-200">
                Демонстрационные данные
              </h3>
              <p className="text-sm text-amber-700/90 dark:text-amber-300/90 mt-0.5">
                Отображаются тестовые данные, так как не удалось получить
                актуальную информацию с сервера.
              </p>
            </div>
          </motion.div>}
        {error && !isDemoData && <motion.div initial={{
        opacity: 0,
        y: -10
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -10
      }} className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 backdrop-blur-xl border border-red-200/50 dark:border-red-800/50 rounded-2xl p-4 flex items-start gap-3 shadow-lg">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-900 dark:text-red-200">
                Ошибка загрузки данных
              </h3>
              <p className="text-sm text-red-700/90 dark:text-red-300/90 mt-0.5">
                {error}
              </p>
            </div>
          </motion.div>}
      </AnimatePresence>
      {/* Tabs */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-xl overflow-hidden">
        <nav className="flex flex-nowrap gap-2 p-3 overflow-x-auto hide-scrollbar">
          {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = selectedTab === tab.id;
          const count = tab.id === 'all' ? products.length : tab.id === 'needOrder' ? products.filter(p => p.orderPoint).length : tab.id === 'lowProfit' ? products.filter(p => p.profitPercentTotal < 10).length : tab.id === 'profitable' ? products.filter(p => p.profitPercentTotal > 20).length : products.filter(p => p.inDelivery > 0).length;
          return <motion.button key={tab.id} whileHover={{
            scale: isActive ? 1 : 1.02
          }} whileTap={{
            scale: 0.98
          }} onClick={() => setSelectedTab(tab.id as any)} className={`
                  relative flex items-center px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300
                  ${isActive ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}
                `}>
                <Icon className={`h-4 w-4 mr-2 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                {tab.name}
                <span className={`
                  ml-2 px-2 py-0.5 rounded-full text-xs 
                  ${isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}
                `}>
                  {count}
                </span>
                {isActive && <motion.div layoutId="activeTab" className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl -z-10" transition={{
              type: 'spring',
              bounce: 0.2,
              duration: 0.6
            }} />}
              </motion.button>;
        })}
        </nav>
      </div>
      {/* Bulk Actions Panel */}
      <AnimatePresence>
        {selectedProducts.length > 0 && <motion.div initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -20
      }} className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-emerald-200/50 dark:border-emerald-800/50 shadow-xl p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-lg">
                    Выбрано товаров: {selectedProducts.length}
                  </p>
                  <p className="text-sm text-muted-foreground/80">
                    Выберите действие для массового редактирования
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <motion.button whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} onClick={() => handleBulkEdit('costPriceTRY')} className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 text-sm font-medium" disabled={bulkEditLoading}>
                  <Edit3 className="h-4 w-4 mr-2 opacity-80" />
                  Себестоимость TRY
                </motion.button>
                <motion.button whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} onClick={() => {
              const rate = prompt('Введите новый курс TRY (от 0.01 до 50.00):');
              if (rate) {
                const numericRate = parseFloat(rate);
                if (!isNaN(numericRate) && numericRate > 0 && numericRate <= 50) {
                  handleBulkEditTryRate(selectedProducts, numericRate);
                } else {
                  alert('Неверный курс. Введите число от 0.01 до 50.00');
                }
              }
            }} className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 text-sm font-medium" disabled={bulkEditLoading}>
                  <Edit3 className="h-4 w-4 mr-2 opacity-80" />
                  Курс лиры
                </motion.button>
                <motion.button whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} onClick={() => handleBulkEdit('expenses')} className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 text-sm font-medium" disabled={bulkEditLoading}>
                  <Calculator className="h-4 w-4 mr-2 opacity-80" />
                  Расходы
                </motion.button>
                <motion.button whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} onClick={() => setSelectedProducts([])} className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl shadow-lg shadow-gray-500/20 hover:shadow-xl hover:shadow-gray-500/30 transition-all duration-300 text-sm font-medium">
                  Отменить
                </motion.button>
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>
      {/* Search and Filters - Improved mobile layout */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70 h-5 w-5" />
          <input type="text" placeholder="Поиск товаров..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 h-11 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
        </div>
        <button onClick={() => setIsAddOrderModalOpen(true)} className="inline-flex items-center justify-center h-11 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300">
          <Plus className="h-5 w-5 mr-2" />
          <span className="font-medium">Добавить заказ</span>
        </button>
      </div>
      {/* Products Table */}
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.2
    }}>
        <ProductTable products={filteredProducts} loading={loading} onUpdateProduct={handleUpdateProduct} exchangeRate={exchangeRate} selectedProducts={selectedProducts} onSelectProducts={setSelectedProducts} onReceiveDelivery={handleReceiveDelivery} onBulkEditTryRate={handleBulkEditTryRate} />
      </motion.div>
      {/* Modals */}
      <AddOrderModal isOpen={isAddOrderModalOpen} onClose={() => setIsAddOrderModalOpen(false)} products={products} onAddOrder={order => {
      // Existing order handling
      console.log('Adding order:', order);
      setIsAddOrderModalOpen(false);
    }} onAddExpense={expense => {
      // Add the expense to the system
      addExpense(expense);
    }} />
      <BulkEditModal isOpen={bulkEditModal.isOpen} onClose={() => setBulkEditModal({
      isOpen: false,
      type: null
    })} type={bulkEditModal.type} selectedCount={selectedProducts.length} onSave={handleBulkEditSave} loading={bulkEditLoading} />
      <ReceiveDeliveryModal isOpen={receiveDeliveryModal.isOpen} onClose={() => setReceiveDeliveryModal({
      isOpen: false,
      productId: null
    })} product={products.find(p => p.id === receiveDeliveryModal.productId)} onSave={handleReceiveDeliverySave} />
    </motion.div>;
}
;
<style jsx>{`
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`}</style>;