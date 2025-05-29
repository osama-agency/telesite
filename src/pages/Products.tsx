import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Package, Truck, CheckCircle, DollarSign, Edit3, Calculator, ShoppingCart, AlertCircle, Sparkles, ChevronsUpDown, Settings2, Calendar, RefreshCw, ChevronDown } from 'lucide-react';
import { ProductTable } from '../components/ProductTable';
import { AddOrderModal } from '../components/AddOrderModal';
import { CreatePurchaseModal } from '../components/CreatePurchaseModal';
import { BulkEditModal } from '../components/BulkEditModal';
import { ReceiveDeliveryModal } from '../components/ReceiveDeliveryModal';
import { productsApi, expensesApi, type ApiProduct, type Expense as ApiExpense } from '../services/api';
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
  soldQuantity: number;
  averageConsumptionDaily: number;
  currentStock: number;
  inDelivery: number;
  daysInStock: number;
  orderPoint: boolean;
  exchangeRate: number;
  fixedCosts: number;
  deliveryDays: number;
  revenue?: number;
}

const DEMO_PRODUCTS: Product[] = [{
  id: '1',
  name: 'Atominex 10mg',
  averageSellingPrice: 2800,
  costPriceTRY: 450,
  costPriceRUB: 1440,
  logisticsCost: 350,
  markup: 93.75,
  marginPercent: 10.89,
  netProfit: 305,
  netProfitTotal: 305 * 10,
  totalCosts: 2495,
  profitPercentTotal: 10,
  soldPeriod: 30,
  soldQuantity: 10,
  averageConsumptionDaily: 0.33,
  currentStock: 20,
  inDelivery: 0,
  daysInStock: 60,
  orderPoint: false,
  exchangeRate: 3.2,
  fixedCosts: 705,
  deliveryDays: 7,
  revenue: 28000
}, {
  id: '2',
  name: 'Abilify 15mg',
  averageSellingPrice: 2100,
  costPriceTRY: 380,
  costPriceRUB: 1216,
  logisticsCost: 350,
  markup: 72.37,
  marginPercent: -8.14,
  netProfit: -171,
  netProfitTotal: -171 * 5,
  totalCosts: 2271,
  profitPercentTotal: -8,
  soldPeriod: 30,
  soldQuantity: 5,
  averageConsumptionDaily: 0.16,
  currentStock: 10,
  inDelivery: 0,
  daysInStock: 60,
  orderPoint: false,
  exchangeRate: 3.2,
  fixedCosts: 705,
  deliveryDays: 7,
  revenue: 10500
}, {
  id: '3',
  name: 'Attex 100mg',
  averageSellingPrice: 3200,
  costPriceTRY: 520,
  costPriceRUB: 1664,
  logisticsCost: 350,
  markup: 92.31,
  marginPercent: 15.03,
  netProfit: 481,
  netProfitTotal: 481 * 7,
  totalCosts: 2719,
  profitPercentTotal: 15,
  soldPeriod: 30,
  soldQuantity: 7,
  averageConsumptionDaily: 0.23,
  currentStock: 15,
  inDelivery: 0,
  daysInStock: 65,
  orderPoint: false,
  exchangeRate: 3.2,
  fixedCosts: 705,
  deliveryDays: 7,
  revenue: 22400
}];

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [isCreatePurchaseModalOpen, setIsCreatePurchaseModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'needOrder' | 'lowProfit' | 'profitable' | 'inTransit'>('all');
  const [exchangeRate, setExchangeRate] = useState(3.2);
  const [isDemoData, setIsDemoData] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkEditModal, setBulkEditModal] = useState<{
    isOpen: boolean;
    type: 'costPriceTRY' | 'logisticsCost' | 'expenses' | null;
  }>({
    isOpen: false,
    type: null
  });
  const [bulkEditLoading, setBulkEditLoading] = useState(false);
  const [receiveDeliveryModal, setReceiveDeliveryModal] = useState<{
    isOpen: boolean;
    productId: string | null;
  }>({
    isOpen: false,
    productId: null
  });
  
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [customDateRange, setCustomDateRange] = useState<{
    start: string;
    end: string;
  }>({
    start: '',
    end: ''
  });
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.period-dropdown-container')) {
        setIsPeriodDropdownOpen(false);
      }
    };
    
    if (isPeriodDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isPeriodDropdownOpen]);
  
  const getPeriodDates = (period: string): { start: string; end: string } => {
    const today = new Date();
    const start = new Date();
    const end = new Date();
    
    switch (period) {
      case '7days':
        start.setDate(today.getDate() - 7);
        break;
      case '14days':
        start.setDate(today.getDate() - 14);
        break;
      case '30days':
        start.setDate(today.getDate() - 30);
        break;
      case 'lastMonth':
        start.setMonth(today.getMonth() - 1);
        start.setDate(1);
        end.setMonth(today.getMonth());
        end.setDate(0);
        break;
      case 'quarter':
        start.setMonth(today.getMonth() - 3);
        break;
      case 'halfYear':
        start.setMonth(today.getMonth() - 6);
        break;
      case 'year':
        start.setFullYear(today.getFullYear() - 1);
        break;
      case 'custom':
        return customDateRange;
      default:
        return { start: '', end: '' };
    }
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  };
  
  const periodOptions = [
    { value: 'all', label: 'Все время' },
    { value: '7days', label: '7 дней' },
    { value: '14days', label: '14 дней' },
    { value: '30days', label: '30 дней' },
    { value: 'lastMonth', label: 'Прошлый месяц' },
    { value: 'quarter', label: 'Квартал' },
    { value: 'halfYear', label: 'Полгода' },
    { value: 'year', label: 'Год' },
    { value: 'custom', label: 'Свой период' }
  ];

  const addExpense = async (expense: Omit<ApiExpense, 'id' | 'createdAt'>) => {
    try {
      const typeMap: Record<string, string> = {
        logistics: 'Логистика',
        advertising: 'Реклама',
        courier: 'Курьер',
        payroll: 'ФОТ',
        other: 'Прочее',
        purchase: 'Закупка товара',
      };
      const ruType = typeMap[expense.type] || expense.type;
      await expensesApi.create({ ...expense, type: ruType as any });
    } catch (error) {
      console.error('Failed to add expense:', error);
    }
  };

  const calculateMetrics = (product: ApiProduct, fallbackRate: number = exchangeRate): Product => {
    const effectiveRate = product.exchangeRate || fallbackRate;
    const costPriceRUB = product.costPriceRUB || (product.costPriceTRY * effectiveRate);
    const fixedCosts = product.fixedCosts || 705;
    const logisticsCost = product.logisticsCost || 350;
    const totalCosts = product.totalCosts || (costPriceRUB + logisticsCost + fixedCosts);
    const netProfit = product.netProfit || (product.averageSellingPrice - totalCosts);
    const markup = product.markup || (costPriceRUB > 0 ? (product.averageSellingPrice - costPriceRUB - logisticsCost) / costPriceRUB * 100 : 0);
    const marginPercent = product.marginPercent || (product.averageSellingPrice > 0 ? netProfit / product.averageSellingPrice * 100 : 0);
    const soldPeriod = product.soldPeriod || 30;
    const soldQuantity = product.soldQuantity || 0;
    const netProfitTotal = product.netProfitTotal || (netProfit * soldQuantity);
    const profitPercentTotal = product.profitPercentTotal || (totalCosts > 0 ? netProfit / totalCosts * 100 : 0);
    const averageConsumptionDaily = product.averageConsumptionDaily || (soldQuantity / soldPeriod);
    const currentStock = product.stock_quantity || 0;
    const inDelivery = product.inDelivery || 0;
    const deliveryDays = product.deliveryDays || 7;
    const daysInStock = product.daysInStock !== undefined ? product.daysInStock : (averageConsumptionDaily > 0 ? currentStock / averageConsumptionDaily : 0);
    const orderPoint = product.orderPoint !== undefined ? product.orderPoint : (daysInStock < deliveryDays);
    const revenue = product.revenue || (product.averageSellingPrice * soldQuantity);
    return {
      id: product.id.toString(),
      name: product.name,
      averageSellingPrice: product.averageSellingPrice,
      costPriceTRY: product.costPriceTRY,
      costPriceRUB,
      logisticsCost,
      markup,
      marginPercent,
      netProfit,
      netProfitTotal,
      totalCosts,
      profitPercentTotal,
      soldPeriod,
      soldQuantity,
      averageConsumptionDaily,
      currentStock,
      inDelivery,
      daysInStock,
      orderPoint,
      exchangeRate: effectiveRate,
      fixedCosts,
      deliveryDays,
      revenue
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
  }, [selectedPeriod, customDateRange, exchangeRate]);
  
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsDemoData(false);
      
      const dates = selectedPeriod !== 'all' ? getPeriodDates(selectedPeriod) : { start: '', end: '' };
      
      console.log('Loading products with period:', selectedPeriod);
      console.log('Date range:', dates);
      
      const params: any = { exchangeRate };
      if (dates.start) params.from = dates.start;
      if (dates.end) params.to = dates.end;
      
      console.log('API params:', params);
      
      const response = await productsApi.getAll(params);
      
      console.log('API response:', response);
      console.log('First product data:', response.data?.[0]);
      console.log('SoldQuantity for first product:', response.data?.[0]?.soldQuantity);
      console.log('Revenue for first product:', response.data?.[0]?.revenue);
      
      const productsToUse = !response || !response.data || response.data.length === 0 ? DEMO_PRODUCTS : response.data.map(product => calculateMetrics(product, exchangeRate));
      if (!response || !response.data || response.data.length === 0) {
        setIsDemoData(true);
        setError('Не удалось загрузить данные с сервера. Отображаются демонстрационные данные.');
      }
      
      const hasNoSalesData = response.data?.every(p => !p.soldQuantity || p.soldQuantity === 0);
      if (hasNoSalesData && selectedPeriod !== 'all') {
        console.warn('API returned products but with no sales data for the selected period');
      }
      
      setProducts(productsToUse);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Не удалось загрузить данные с сервера. Отображаются демонстрационные данные.');
      setIsDemoData(true);
      setProducts(DEMO_PRODUCTS);
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
      setProducts(prev => prev.map(p => {
        if (p.id === id) {
          const updated = { ...p, ...updates };
          return calculateMetrics(updated as any, exchangeRate);
        }
        return p;
      }));
      const apiUpdates: Partial<ApiProduct> = {};
      if (updates.costPriceTRY !== undefined) apiUpdates.costPriceTRY = updates.costPriceTRY;
      if (updates.logisticsCost !== undefined) apiUpdates.logisticsCost = updates.logisticsCost;
      if (updates.exchangeRate !== undefined) apiUpdates.exchangeRate = updates.exchangeRate;
      const updatedApiProduct = await productsApi.update(Number(id), apiUpdates);
      setProducts(prev => prev.map(p => {
        if (p.id === id) {
          return calculateMetrics(updatedApiProduct, exchangeRate);
        }
        return p;
      }));
    } catch (err) {
      loadProducts();
    }
  };

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
      let apiUpdates: Partial<ApiProduct> = {};
      if (bulkEditModal.type === 'costPriceTRY') apiUpdates.costPriceTRY = value;
      if (bulkEditModal.type === 'logisticsCost') apiUpdates.logisticsCost = value;
      setProducts(prev => prev.map(p => {
        if (selectedProducts.includes(p.id)) {
          const updated = { ...p, ...apiUpdates };
          return calculateMetrics(updated as any, exchangeRate);
        }
        return p;
      }));
      await productsApi.bulkUpdate(selectedProducts.map(id => Number(id)), apiUpdates);
      setBulkEditModal({
        isOpen: false,
        type: null
      });
      setSelectedProducts([]);
    } catch (error) {
      loadProducts();
    } finally {
      setBulkEditLoading(false);
    }
  };

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
        setProducts(prev => prev.map(p => {
          if (p.id === productId) {
            const updated = { ...p, currentStock: p.currentStock + data.quantity, inDelivery: Math.max(0, p.inDelivery - data.quantity), logisticsCost: p.logisticsCost + data.deliveryCost };
            return calculateMetrics(updated as any, exchangeRate);
          }
          return p;
        }));
        await productsApi.receiveDelivery(Number(productId), data);
        if (data.deliveryCost > 0) {
          await addExpense({
            date: new Date().toISOString().split('T')[0],
            type: 'Логистика',
            description: `Оприходование ${data.quantity} шт товара "${product.name}"`,
            amount: data.deliveryCost,
            productId: product.id,
            productName: product.name
          });
        }
      } catch (error) {
        loadProducts();
      }
    }
    setReceiveDeliveryModal({
      isOpen: false,
      productId: null
    });
  };

  const handleBulkEditTryRate = (productIds: string[], newRate: number) => {
    setProducts(prev => prev.map(p => {
      if (productIds.includes(p.id)) {
        const updatedProduct = {
          ...p,
          exchangeRate: newRate
        };
        return calculateMetrics(updatedProduct, exchangeRate);
      }
      return p;
    }));
    console.log(`Updated TRY rate to ${newRate} for ${productIds.length} products`);
  };

  return <motion.div initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} className="space-y-6 sm:space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
        <div className="relative">
          <motion.div initial={{
          scale: 0.95
        }} animate={{
          scale: 1
        }} className="absolute -top-4 sm:-top-8 -left-4 sm:-left-8 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-2xl hidden sm:block" />
          <div className="relative">
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
              Управление товарами
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mt-1 sm:mt-2">
              Аналитика прибыльности и планирование заказов
            </p>
          </div>
        </div>
      </div>
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
                `}
                aria-label={`Показать ${tab.name.toLowerCase()}`}
          >
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
      <div className="flex flex-col gap-4">
        {/* Search and Period Filter Row */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1 max-w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70 h-5 w-5" />
            <input 
              type="text" 
              placeholder="Поиск товаров..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="w-full pl-12 pr-4 h-11 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-sm" 
            />
          </div>
          
          <div className="relative period-dropdown-container flex-shrink-0">
            <button
              onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
              className="inline-flex items-center justify-between w-full sm:w-auto h-11 px-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 rounded-xl hover:bg-accent/50 transition-all sm:min-w-[180px]"
            >
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium truncate">
                  {periodOptions.find(opt => opt.value === selectedPeriod)?.label || 'Все время'}
                </span>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform flex-shrink-0 ${isPeriodDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isPeriodDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 left-0 right-0 sm:left-auto sm:right-auto sm:w-56 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-border/20 z-50 max-h-96 overflow-y-auto"
                >
                  <div className="py-1">
                    {periodOptions.slice(0, selectedPeriod === 'custom' ? -1 : periodOptions.length).map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedPeriod(option.value);
                          if (option.value !== 'custom') {
                            setIsPeriodDropdownOpen(false);
                          }
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-accent/80 transition-all ${
                          selectedPeriod === option.value ? 'bg-emerald-500/10 text-emerald-600 font-medium' : 'text-foreground/80'
                        }`}
                      >
                        <Calendar className="h-4 w-4 opacity-60 flex-shrink-0" />
                        <span className="flex-1 text-left">{option.label}</span>
                        {selectedPeriod === option.value && (
                          <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                    
                    {selectedPeriod !== 'custom' && (
                      <button
                        onClick={() => {
                          setSelectedPeriod('custom');
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-accent/80 transition-all text-foreground/80"
                      >
                        <Calendar className="h-4 w-4 opacity-60 flex-shrink-0" />
                        <span className="flex-1 text-left">Свой период</span>
                      </button>
                    )}
                  </div>
                  
                  {selectedPeriod === 'custom' && (
                    <div className="border-t border-border/20 bg-slate-50 dark:bg-slate-800/50 p-4 space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Начало</label>
                        <input
                          type="date"
                          value={customDateRange.start}
                          onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                          className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-border/50 rounded-md focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Конец</label>
                        <input
                          type="date"
                          value={customDateRange.end}
                          onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                          className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-border/50 rounded-md focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (customDateRange.start && customDateRange.end) {
                            setIsPeriodDropdownOpen(false);
                          }
                        }}
                        disabled={!customDateRange.start || !customDateRange.end}
                        className="w-full px-3 py-1.5 mt-1 text-sm bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md transition-colors font-medium"
                      >
                        Применить
                      </button>
                    </div>
                  )}
                  
                  {selectedPeriod !== 'all' && (
                    <div className="border-t border-border/20 p-1 bg-slate-50 dark:bg-slate-800/50">
                      <button
                        onClick={() => {
                          setSelectedPeriod('all');
                          setCustomDateRange({ start: '', end: '' });
                          setIsPeriodDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-center space-x-1 px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded transition-colors"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Сбросить</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Action Button Row */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button 
            onClick={() => setIsCreatePurchaseModalOpen(true)} 
            className="inline-flex items-center justify-center h-11 px-4 sm:px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 font-medium"
          >
            <Plus className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="truncate">Добавить заказ</span>
          </button>
        </div>
      </div>
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
      <AddOrderModal isOpen={isAddOrderModalOpen} onClose={() => setIsAddOrderModalOpen(false)} products={products} onAddOrder={order => {
      console.log('Adding order:', order);
      setIsAddOrderModalOpen(false);
    }} onAddExpense={expense => {
      addExpense(expense);
    }} />
      <CreatePurchaseModal 
        isOpen={isCreatePurchaseModalOpen} 
        onClose={() => setIsCreatePurchaseModalOpen(false)}
        onSuccess={() => {
          console.log('Purchase created successfully');
        }}
      />
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

<style>{`
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`}</style>;