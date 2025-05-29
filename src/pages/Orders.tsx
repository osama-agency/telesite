import React, { useEffect, useState, Fragment } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Calculator, Calendar, CheckCircle, ChevronDown, ChevronRight, Edit2, Minus, Package, Package2, Plus, Save, Sparkles, Trash2, Truck, X, Loader2 } from 'lucide-react';
import { productsApi, type ApiProduct } from '../services/api';
// Placeholder components and hooks
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading
}: any) => {
  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
      >
        Пред.
      </button>
      <span className="text-sm text-muted-foreground">
        {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
      >
        След.
      </button>
    </div>
  );
};
const usePagination = ({
  totalItems,
  itemsPerPage
}: any) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  return {
    currentPage,
    totalPages,
    onPageChange: setCurrentPage,
    paginatedItems: {
      startIndex: (currentPage - 1) * itemsPerPage,
      endIndex: Math.min(currentPage * itemsPerPage, totalItems)
    }
  };
};
// Placeholder API
const ordersApi = {
  getAll: async () => [],
  create: async (data: any) => ({
    id: Date.now().toString(),
    ...data,
    totalTRY: data.products.reduce((sum: number, p: any) => sum + p.quantity * p.costPriceTRY, 0),
    totalRUB: data.products.reduce((sum: number, p: any) => sum + p.quantity * p.costPriceTRY, 0) * data.tryRate,
    createdAt: new Date().toISOString(),
    status: 'pending',
    products: data.products.map((p: any) => ({
      ...p,
      name: demoProducts.find(dp => dp.id === p.id)?.name || 'Unknown Product'
    }))
  })
};
// Placeholder function
const addExpense = async (data: any) => {
  console.log('Adding expense:', data);
};
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
  status: string;
}
// Demo data
const demoProducts = [{
  id: '1',
  name: 'Atominex 10mg'
}, {
  id: '2',
  name: 'Abilify 15mg'
}, {
  id: '3',
  name: 'Attex 100mg'
}];
const shimmerButton = `
  @keyframes shimmer {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;
export function Orders() {
  // Form state
  const [orderForm, setOrderForm] = useState({
    date: new Date().toISOString().split('T')[0],
    tryRate: 3.2,
    products: [{
      id: '',
      quantity: 1,
      costPriceTRY: 0
    }]
  });
  // Add API products state inside the component
  const [apiProducts, setApiProducts] = useState<ApiProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  // Orders history
  const [orders, setOrders] = useState<Order[]>([]);
  // UI state
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [receivingOrder, setReceivingOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  // Error state
  const [errors, setErrors] = useState<{
    date?: string;
    tryRate?: string;
    products?: string;
  }>({});
  // Add validation function
  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!orderForm.date) {
      newErrors.date = 'Дата обязательна';
    }
    if (!orderForm.tryRate || orderForm.tryRate <= 0) {
      newErrors.tryRate = 'Введите корректный курс';
    }
    if (orderForm.products.some(p => !p.id || p.quantity <= 0)) {
      newErrors.products = 'Проверьте данные товаров';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // Handlers
  const addProduct = () => {
    setOrderForm(prev => ({
      ...prev,
      products: [...prev.products, {
        id: '',
        quantity: 1,
        costPriceTRY: 0
      }]
    }));
  };
  const removeProduct = (index: number) => {
    setOrderForm(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };
  const updateProduct = (index: number, field: keyof OrderProduct, value: string | number) => {
    setOrderForm(prev => ({
      ...prev,
      products: prev.products.map((p, i) => i === index ? {
        ...p,
        [field]: value
      } : p)
    }));
  };
  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders(prev => prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]);
  };
  // Product List Rendering
  const renderProductForm = () => {
    return orderForm.products.map((product, index) => <motion.div key={index} initial={{
      opacity: 0,
      y: -10
    }} animate={{
      opacity: 1,
      y: 0
    }} exit={{
      opacity: 0,
      y: -10
    }} className="flex flex-col sm:flex-row gap-4 p-4 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-border/50 hover:shadow-lg transition-all duration-300">
        {/* Product Selection */}
        <div className="flex-[2]">
          <label className="block text-sm font-medium mb-2">Товар</label>
          <select value={product.id} onChange={e => updateProduct(index, 'id', e.target.value)} disabled={productsLoading} className={`
            w-full px-4 py-3 
            bg-white/80 dark:bg-slate-900/80 
            backdrop-blur-xl border border-border/50 rounded-xl 
            focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 
            transition-all
            ${productsLoading ? 'opacity-50 cursor-wait' : ''}
          `}>
            <option value="">Выберите товар</option>
            {productsLoading ? <option disabled>Загрузка товаров...</option> : apiProducts.map(p => <option key={p.id} value={p.id}>
                  {p.name}
                </option>)}
          </select>
        </div>
        {/* Quantity */}
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Количество</label>
          <input type="number" min="1" value={product.quantity} onChange={e => updateProduct(index, 'quantity', parseInt(e.target.value) || 1)} className="w-full px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
        </div>
        {/* Cost Price TRY */}
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2">Цена TRY</label>
          <input type="number" min="0" step="0.01" value={product.costPriceTRY} onChange={e => updateProduct(index, 'costPriceTRY', parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
        </div>
        {/* Remove Button */}
        {orderForm.products.length > 1 && <button type="button" onClick={() => removeProduct(index)} className="self-end p-3 rounded-xl transition-all duration-300 group relative overflow-hidden" style={{
        background: 'linear-gradient(45deg, #ef4444, #f43f5e, #ec4899, #f97316)',
        backgroundSize: '300% 300%',
        animation: 'shimmer 8s ease-in-out infinite'
      }}>
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
            <Trash2 className="h-5 w-5 text-white" />
          </button>}
      </motion.div>);
  };
  // Load orders on mount
  useEffect(() => {
    loadOrders();
  }, []);
  const loadOrders = async () => {
    try {
      const data = await ordersApi.getAll();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
      // Error toast is already shown by the API
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    // Store form data for potential revert
    const originalForm = {
      ...orderForm
    };
    try {
      // Validate form data
      if (!orderForm.products[0].id || orderForm.tryRate <= 0) {
        return;
      }
      // Create order data
      const orderData = {
        date: orderForm.date,
        tryRate: orderForm.tryRate,
        products: orderForm.products.map(p => ({
          id: p.id,
          quantity: p.quantity,
          costPriceTRY: p.costPriceTRY
        }))
      };
      // Reset form immediately for better UX
      setOrderForm({
        date: new Date().toISOString().split('T')[0],
        tryRate: 3.2,
        products: [{
          id: '',
          quantity: 1,
          costPriceTRY: 0
        }]
      });
      // Make API call
      const newOrder = await ordersApi.create(orderData);
      // Update orders list
      setOrders(prev => [newOrder, ...prev]);
    } catch (error) {
      console.error('Failed to create order:', error);
      setOrderForm(originalForm);
      // Error toast is already shown by the API
    }
  };
  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
  };
  const handleSaveOrder = async (updatedOrder: Order) => {
    try {
      // Store original order for potential revert
      const originalOrderToRevert = orders.find(o => o.id === updatedOrder.id);
      // Calculate totals
      const totalTRY = updatedOrder.products.reduce((sum, p) => sum + p.quantity * p.costPriceTRY, 0);
      const totalRUB = totalTRY * updatedOrder.tryRate;
      const finalOrder = {
        ...updatedOrder,
        totalTRY,
        totalRUB
      };
      // Optimistic update
      setOrders(prev => prev.map(order => order.id === finalOrder.id ? finalOrder : order));
      // Here you would make the API call
      // await ordersApi.update(updatedOrder.id, finalOrder)
      setEditingOrder(null);
    } catch (error) {
      console.error('Failed to save order:', error);
      // Revert optimistic update on error
      const originalOrderToRevert = orders.find(o => o.id === updatedOrder.id);
      if (originalOrderToRevert) {
        setOrders(prev => prev.map(order => order.id === updatedOrder.id ? originalOrderToRevert : order));
      }
      // Show error notification
      // toast.error('Failed to save order. Please try again.')
    }
  };
  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот заказ?')) return;
    // Store order for potential revert
    const orderToDelete = orders.find(o => o.id === orderId);
    try {
      // Optimistic update
      setOrders(prev => prev.filter(o => o.id !== orderId));
      // Here you would make the API call
      // await ordersApi.delete(orderId)
    } catch (error) {
      console.error('Failed to delete order:', error);
      // Revert optimistic update on error
      if (orderToDelete) {
        setOrders(prev => [...prev, orderToDelete]);
      }
    }
  };
  const handleReceiveOrder = (order: Order) => {
    setReceivingOrder(order);
  };
  const handleReceiveOrderSave = async (data: {
    products: {
      id: string;
      expectedQuantity: number;
      actualQuantity: number;
    }[];
    deliveryCost: number;
  }) => {
    if (!receivingOrder) return;
    // Store original order for potential revert
    const originalOrder = orders.find(o => o.id === receivingOrder.id);
    try {
      // Convert from expected/actual to just quantity
      const processedData = {
        products: data.products.map(p => ({
          id: p.id,
          quantity: p.actualQuantity
        })),
        deliveryCost: data.deliveryCost
      };
      
      // Optimistic update
      setOrders(prev => prev.map(order => {
        if (order.id === receivingOrder.id) {
          return {
            ...order,
            products: order.products.map(product => {
              const receivedProduct = processedData.products.find(p => p.id === product.id);
              return {
                ...product,
                quantity: product.quantity - (receivedProduct?.quantity || 0)
              };
            }).filter(p => p.quantity > 0) // Remove products with 0 quantity
          };
        }
        return order;
      }));
      // Here you would make the API call
      // await ordersApi.receiveOrder(receivingOrder.id, processedData)
      // Create expense record if there are delivery costs
      if (data.deliveryCost > 0) {
        try {
          await addExpense({
            date: new Date().toISOString().split('T')[0],
            type: 'logistics',
            description: `Оприходование заказа ${receivingOrder.id}`,
            amount: data.deliveryCost
          });
        } catch (error) {
          console.error('Failed to add expense:', error);
        }
      }
      setReceivingOrder(null);
    } catch (error) {
      console.error('Failed to receive order:', error);
      // Revert optimistic update on error
      if (originalOrder) {
        setOrders(prev => prev.map(order => order.id === receivingOrder.id ? originalOrder : order));
      }
      // Show error notification
      // toast.error('Failed to receive order. Please try again.')
    }
  };
  const {
    currentPage,
    totalPages,
    onPageChange,
    paginatedItems
  } = usePagination({
    totalItems: orders.length,
    itemsPerPage: 10
  });
  // Add this useEffect near the top of the component
  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const response = await productsApi.getAll();
        setApiProducts(response.data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        // Fallback to demo products if API fails - using minimal required fields
        setApiProducts(demoProducts.map(dp => ({
          id: dp.id as any,
          name: dp.name,
        } as ApiProduct)));
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);
  return <motion.div initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800/50">
      {/* Header with improved mobile spacing */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
        <div className="relative">
          <motion.div initial={{
          scale: 0.95
        }} animate={{
          scale: 1
        }} className="absolute -top-8 -left-8 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-2xl hidden sm:block" />
          <div className="relative">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
              Закупка товара
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground/80 mt-2">
              Создание закупок и управление историей
            </p>
          </div>
        </div>
      </div>
      {/* Order Form with validation and loading states */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-border/50 shadow-xl p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Date with validation */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2" htmlFor="orderDate">
                <Calendar className="inline h-4 w-4 mr-1" />
                Дата закупки
              </label>
              <input id="orderDate" type="date" value={orderForm.date} onChange={e => setOrderForm(prev => ({
              ...prev,
              date: e.target.value
            }))} className={`w-full px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border rounded-xl focus:ring-2 transition-all ${errors?.date ? 'border-red-500 focus:ring-red-500/20' : 'border-border/50 focus:ring-emerald-500/20 focus:border-emerald-500'}`} aria-invalid={errors?.date ? 'true' : 'false'} required />
              {errors?.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
            </div>
            {/* TRY Rate with validation */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2" htmlFor="tryRate">
                <Calculator className="inline h-4 w-4 mr-1" />
                Курс лиры
              </label>
              <input id="tryRate" type="number" step="0.01" min="0.01" value={orderForm.tryRate} onChange={e => setOrderForm(prev => ({
              ...prev,
              tryRate: parseFloat(e.target.value) || 0
            }))} className={`w-full px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border rounded-xl focus:ring-2 transition-all ${errors?.tryRate ? 'border-red-500 focus:ring-red-500/20' : 'border-border/50 focus:ring-emerald-500/20 focus:border-emerald-500'}`} aria-invalid={errors?.tryRate ? 'true' : 'false'} required />
              {errors?.tryRate && <p className="mt-1 text-sm text-red-500">{errors.tryRate}</p>}
            </div>
          </div>
          {/* Products Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-lg font-semibold">Товары</h3>
              <motion.button whileHover={{
              scale: 1.02
            }} whileTap={{
              scale: 0.98
            }} type="button" onClick={addProduct} className="relative w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-xl shadow-lg transition-all duration-300 overflow-hidden group bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                <Plus className="h-4 w-4 mr-2 text-white" />
                <span className="text-white font-medium">Добавить товар</span>
              </motion.button>
            </div>
            {/* Product List */}
            <div className="space-y-4">
              {orderForm.products.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                  Добавьте товары для заказа
                </div> : renderProductForm()}
            </div>
          </div>
          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <motion.button whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }} type="submit" disabled={loading} className="relative w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl shadow-lg transition-all duration-300 overflow-hidden group bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed">
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
              {loading ? <motion.div animate={{
              rotate: 360
            }} transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'linear'
            }}>
                  <Loader2 className="h-5 w-5 text-white" />
                </motion.div> : <>
                  <Sparkles className="h-5 w-5 mr-2 text-white" />
                  <span className="text-white font-medium">
                    Создать закупку
                  </span>
                </>}
            </motion.button>
          </div>
        </form>
      </div>
      {/* Orders History with responsive table */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-border/50 shadow-xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border/50">
          <h2 className="text-lg sm:text-xl font-semibold">История закупок</h2>
        </div>
        {/* Responsive table wrapper */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 sticky top-0 z-10">
              <tr>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider sticky left-0 bg-gradient-to-r from-slate-100 to-slate-100 dark:from-slate-800 dark:to-slate-800 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  Дата
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Курс
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider hidden md:table-cell">
                  <span className="hidden lg:inline">Товары</span>
                  <span className="lg:hidden">Тов.</span>
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  <span className="hidden sm:inline">Сумма</span>
                  TRY
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  <span className="hidden sm:inline">Сумма</span>
                  ₽
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider hidden xl:table-cell">
                  Создан
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  <span className="hidden sm:inline">Действия</span>
                  <span className="sm:hidden">Действ.</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {orders.slice(paginatedItems.startIndex, paginatedItems.endIndex).map(order => <Fragment key={order.id}>
                      <tr className={`bg-white/80 dark:bg-slate-900/80 hover:shadow-lg transition-all duration-200 ${expandedOrders.includes(order.id) ? 'bg-accent/30' : ''}`}>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap sticky left-0 bg-white dark:bg-slate-900 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                          <div className="flex items-center space-x-2">
                            <button onClick={() => toggleOrderExpand(order.id)} className="hover:bg-accent rounded p-1 transition-colors" aria-label={expandedOrders.includes(order.id) ? 'Свернуть' : 'Развернуть'}>
                              {expandedOrders.includes(order.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                            <span className="font-medium text-xs sm:text-sm">
                              {new Date(order.date).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className="text-xs sm:text-sm font-mono">{order.tryRate}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                          <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400">
                            {order.products.length}
                            <span className="hidden lg:inline ml-1">товаров</span>
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className="font-medium text-xs sm:text-sm">
                            {order.totalTRY.toLocaleString('ru-RU')}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className="font-medium text-xs sm:text-sm">
                            {order.totalRUB.toLocaleString('ru-RU')}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden xl:table-cell">
                          <span className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleString('ru-RU')}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          {order.status === 'received' ? <span className="inline-flex items-center px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-400">
                              <CheckCircle className="w-3 h-3 sm:mr-1" />
                              <span className="hidden sm:inline">Оприходован</span>
                              <span className="sm:hidden">OK</span>
                            </span> : <span className="inline-flex items-center px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400">
                              <Truck className="w-3 h-3 sm:mr-1" />
                              <span className="hidden sm:inline">В пути</span>
                            </span>}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <button 
                              onClick={() => handleReceiveOrder(order)} 
                              className="p-1.5 sm:p-2 rounded-lg transition-all duration-300 group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600" 
                              title="Оприходовать"
                              aria-label="Оприходовать заказ"
                            >
                              <Package2 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                            </button>
                            <button 
                              onClick={() => handleEditOrder(order)} 
                              className="p-1.5 sm:p-2 rounded-lg transition-all duration-300 group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600" 
                              title="Редактировать"
                              aria-label="Редактировать заказ"
                            >
                              <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm('Вы уверены, что хотите удалить этот заказ?')) {
                                  handleDeleteOrder(order.id);
                                }
                              }} 
                              className="p-1.5 sm:p-2 rounded-lg transition-all duration-300 group relative overflow-hidden bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600" 
                              title="Удалить"
                              aria-label="Удалить заказ"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      <AnimatePresence>
                        {expandedOrders.includes(order.id) && <motion.tr initial={{
                    opacity: 0,
                    height: 0
                  }} animate={{
                    opacity: 1,
                    height: 'auto'
                  }} exit={{
                    opacity: 0,
                    height: 0
                  }}>
                            <td colSpan={8} className="px-3 sm:px-6 py-3 sm:py-4 bg-accent/30">
                              <div className="space-y-2">
                                {order.products.map(product => <div key={product.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm bg-white/50 dark:bg-slate-800/50 rounded-lg p-2 sm:p-3 space-y-1 sm:space-y-0">
                                    <span className="font-medium flex items-center">
                                      <Package2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-muted-foreground" />
                                      {product.name}
                                    </span>
                                    <div className="flex items-center space-x-3 sm:space-x-6 text-xs sm:text-sm">
                                      <span className="text-muted-foreground">
                                        {product.quantity} шт
                                      </span>
                                      <span className="text-muted-foreground">
                                        {product.costPriceTRY.toLocaleString('ru-RU')}{' '}
                                        <span className="hidden sm:inline">TRY</span>
                                      </span>
                                      <span className="font-medium">
                                        {(product.quantity * product.costPriceTRY).toLocaleString('ru-RU')}{' '}
                                        <span className="hidden sm:inline">TRY</span>
                                      </span>
                                    </div>
                                  </div>)}
                              </div>
                            </td>
                          </motion.tr>}
                      </AnimatePresence>
                    </Fragment>)}
            </tbody>
          </table>
        </div>

        {/* Mobile cards view for orders */}
        <div className="sm:hidden p-4 space-y-3">
          {orders.slice(paginatedItems.startIndex, paginatedItems.endIndex).map(order => (
            <div key={order.id} className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-border rounded-xl p-3 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">
                    {new Date(order.date).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                {order.status === 'received' ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    OK
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Truck className="w-3 h-3 mr-1" />
                    В пути
                  </span>
                )}
              </div>
              
              {/* Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Курс:</span>
                  <span className="font-mono">{order.tryRate}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Товаров:</span>
                  <span className="font-medium">{order.products.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Сумма:</span>
                  <div className="text-right">
                    <div className="font-medium">{order.totalTRY.toLocaleString('ru-RU')} TRY</div>
                    <div className="text-xs text-muted-foreground">{order.totalRUB.toLocaleString('ru-RU')} ₽</div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border/50">
                <button 
                  onClick={() => handleReceiveOrder(order)} 
                  className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                  aria-label="Оприходовать"
                >
                  <Package2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleEditOrder(order)} 
                  className="p-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                  aria-label="Редактировать"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm('Вы уверены, что хотите удалить этот заказ?')) {
                      handleDeleteOrder(order.id);
                    }
                  }} 
                  className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                  aria-label="Удалить"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Improved pagination with loading state */}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} isLoading={loading} />
      {/* Modals remain the same */}
      <AnimatePresence>
        {editingOrder && <EditOrderModal isOpen={true} onClose={() => setEditingOrder(null)} order={editingOrder} onSave={handleSaveOrder} />}
      </AnimatePresence>
      <ReceiveOrderModal isOpen={receivingOrder !== null} onClose={() => setReceivingOrder(null)} order={receivingOrder} onSave={handleReceiveOrderSave} />
    </motion.div>;
}
interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSave: (updatedOrder: Order) => void;
}
function EditOrderModal({
  isOpen,
  onClose,
  order,
  onSave
}: EditOrderModalProps) {
  const [formData, setFormData] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    date?: string;
    tryRate?: string;
    products?: string;
  }>({});
  useEffect(() => {
    if (order) {
      setFormData({
        ...order
      });
    }
  }, [order]);
  const handleProductUpdate = (productId: string, field: string, value: any) => {
    if (!formData) return;
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        products: prev.products.map(p => p.id === productId ? {
          ...p,
          [field]: field === 'quantity' ? Math.max(1, parseInt(value) || 0) : value
        } : p),
        totalTRY: prev.products.reduce((sum, p) => sum + p.quantity * p.costPriceTRY, 0)
      };
    });
  };
  const handleRemoveProduct = (productId: string) => {
    if (!formData || formData.products.length <= 1) return;
    setFormData(prev => {
      if (!prev) return prev;
      const updatedProducts = prev.products.filter(p => p.id !== productId);
      return {
        ...prev,
        products: updatedProducts,
        totalTRY: updatedProducts.reduce((sum, p) => sum + p.quantity * p.costPriceTRY, 0)
      };
    });
  };
  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!formData?.date) {
      newErrors.date = 'Дата обязательна';
    }
    if (!formData?.tryRate || formData.tryRate <= 0) {
      newErrors.tryRate = 'Введите корректный курс';
    }
    if (!formData?.products.length) {
      newErrors.products = 'Добавьте хотя бы один товар';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async () => {
    if (!formData || !validateForm()) return;
    try {
      setLoading(true);
      // Calculate totals
      const totalTRY = formData.products.reduce((sum, p) => sum + p.quantity * p.costPriceTRY, 0);
      const totalRUB = totalTRY * formData.tryRate;
      const finalOrder = {
        ...formData,
        totalTRY,
        totalRUB
      };
      await onSave(finalOrder);
      onClose();
    } catch (error) {
      console.error('Failed to save order:', error);
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen || !formData) return null;
  return <motion.div initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} exit={{
    opacity: 0
  }} className="fixed inset-0 z-50 overflow-y-auto">
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
      }} className="relative bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-2xl w-full max-w-4xl p-6 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Edit2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Редактирование заказа</h2>
                <p className="text-sm text-muted-foreground">{formData.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          {/* Form */}
          <div className="space-y-6">
            {/* Date and Rate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Дата заказа
                </label>
                <input type="date" value={formData.date} onChange={e => setFormData(prev => prev ? {
                ...prev,
                date: e.target.value
              } : null)} className={`w-full px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border rounded-xl transition-all ${errors.date ? 'border-red-500 focus:ring-red-500' : 'border-border/50 focus:ring-blue-500'}`} />
                {errors.date && <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.date}
                  </p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calculator className="inline h-4 w-4 mr-1" />
                  Курс лиры
                </label>
                <input type="number" min="0.01" step="0.01" value={formData.tryRate} onChange={e => setFormData(prev => prev ? {
                ...prev,
                tryRate: parseFloat(e.target.value) || 0
              } : null)} className={`w-full px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border rounded-xl transition-all ${errors.tryRate ? 'border-red-500 focus:ring-red-500' : 'border-border/50 focus:ring-blue-500'}`} />
                {errors.tryRate && <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.tryRate}
                  </p>}
              </div>
            </div>
            {/* Products */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Товары</h3>
              <div className="space-y-4">
                {formData.products.map((product, index) => <motion.div key={index} initial={{
                opacity: 0,
                y: -10
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                y: -10
              }} className="flex flex-col sm:flex-row gap-4 p-4 bg-accent/50 rounded-xl border border-border/50">
                    <div className="flex-[2]">
                      <label className="block text-sm font-medium mb-2">
                        Товар
                      </label>
                      <input type="text" value={product.name} readOnly className="w-full px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 rounded-xl text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2">
                        Количество
                      </label>
                      <input type="number" min="1" value={product.quantity} onChange={e => handleProductUpdate(product.id, 'quantity', e.target.value)} className="w-full px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 rounded-xl" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2">
                        Цена TRY
                      </label>
                      <input type="number" value={product.costPriceTRY} onChange={e => handleProductUpdate(product.id, 'costPriceTRY', e.target.value)} className="w-full px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 rounded-xl" />
                    </div>
                    {formData.products.length > 1 && <button onClick={() => handleRemoveProduct(product.id)} className="self-end p-3 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors">
                        <Trash2 className="h-5 w-5" />
                      </button>}
                  </motion.div>)}
              </div>
            </div>
            {/* Summary */}
            <div className="bg-accent/50 rounded-xl p-4">
              <h4 className="font-medium mb-2">Итого по заказу:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Общая сумма:</span>
                  <span className="font-mono">
                    {formData.totalTRY.toLocaleString('ru-RU')} TRY
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>В рублях:</span>
                  <span className="font-mono">
                    {(formData.totalTRY * formData.tryRate).toLocaleString('ru-RU')}{' '}
                    ₽
                  </span>
                </div>
              </div>
            </div>
            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button onClick={onClose} className="px-6 py-3 border border-border rounded-xl hover:bg-accent transition-colors">
                Отмена
              </button>
              <button onClick={handleSubmit} disabled={loading} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all flex items-center space-x-2">
                {loading ? <motion.div animate={{
                rotate: 360
              }} transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear'
              }}>
                    <Save className="h-5 w-5" />
                  </motion.div> : <Save className="h-5 w-5" />}
                <span>Сохранить изменения</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>;
}
interface ReceiveOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSave: (data: {
    products: {
      id: string;
      expectedQuantity: number;
      actualQuantity: number;
    }[];
    deliveryCost: number;
  }) => void;
}
function ReceiveOrderModal({
  isOpen,
  onClose,
  order,
  onSave
}: ReceiveOrderModalProps) {
  const [formData, setFormData] = useState<{
    products: {
      id: string;
      expectedQuantity: number;
      actualQuantity: number;
    }[];
    deliveryCost: number;
  }>({
    products: [],
    deliveryCost: 0
  });
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  // Initialize form data when order changes
  useEffect(() => {
    if (order) {
      setFormData({
        products: order.products.map(p => ({
          id: p.id,
          expectedQuantity: p.quantity,
          actualQuantity: p.quantity // Default to expected
        })),
        deliveryCost: 0
      });
    }
  }, [order]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setLoading(true);
    try {
      await onSave({
        products: formData.products.map(p => ({
          id: p.id,
          expectedQuantity: p.expectedQuantity,
          actualQuantity: p.actualQuantity
        })),
        deliveryCost: formData.deliveryCost
      });
      // Update order status
      const updatedOrder = {
        ...order,
        status: 'received'
      };
      onClose();
    } catch (error) {
      console.error('Failed to receive order:', error);
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen || !order) return null;
  const hasDiscrepancies = formData.products.some(p => p.actualQuantity !== p.expectedQuantity);
  return <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div className="relative bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-2xl w-full max-w-4xl p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-xl flex items-center justify-center">
                <Package2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Оприходовать товары</h2>
                <p className="text-sm text-muted-foreground">{order.id}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Products List */}
            <div>
              <label className="flex items-center justify-between text-sm font-medium mb-3">
                <span className="flex items-center">
                  <Package2 className="inline h-4 w-4 mr-1" />
                  Товары к оприходованию
                </span>
                <span className="text-muted-foreground">
                  {order.products.length} позиций
                </span>
              </label>
              <div className="space-y-3">
                {formData.products.map(product => {
                const orderProduct = order.products.find(p => p.id === product.id);
                if (!orderProduct) return null;
                const hasDiscrepancy = product.actualQuantity !== product.expectedQuantity;
                return <div key={product.id} className={`bg-accent/50 rounded-xl border transition-colors ${hasDiscrepancy ? 'border-amber-500/50 dark:border-amber-500/30' : 'border-border/50'}`}>
                      <div className="p-4 space-y-3">
                        {/* Product Header */}
                        <div className="flex items-center justify-between">
                          <span className="font-medium" title={orderProduct.name}>
                            {orderProduct.name}
                          </span>
                          {hasDiscrepancy && <span className="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                              Расхождение
                            </span>}
                        </div>
                        {/* Quantities */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1">
                              Ожидается
                            </label>
                            <input type="number" value={product.expectedQuantity} disabled className="w-full px-3 py-1.5 bg-muted/50 border border-border/50 rounded-lg text-muted-foreground text-center" />
                          </div>
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1">
                              Фактически
                            </label>
                            <input type="number" min="0" value={product.actualQuantity} onChange={e => {
                          const newQuantity = parseInt(e.target.value) || 0;
                          setFormData(prev => ({
                            ...prev,
                            products: prev.products.map(p => p.id === product.id ? {
                              ...p,
                              actualQuantity: newQuantity
                            } : p)
                          }));
                        }} className={`w-full px-3 py-1.5 border rounded-lg text-center focus:ring-2 transition-all ${hasDiscrepancy ? 'border-amber-500/50 focus:ring-amber-500/20 focus:border-amber-500' : 'border-border/50 focus:ring-emerald-500/20 focus:border-emerald-500'}`} />
                          </div>
                        </div>
                      </div>
                    </div>;
              })}
              </div>
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
            }))} placeholder="Введите сумму расходов" className="w-full px-4 py-2.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" />
            </div>
            {/* Summary */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}>
                <h4 className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                  Сводка операции
                </h4>
                <ChevronDown className={`h-4 w-4 transition-transform ${isSummaryExpanded ? 'rotate-180' : ''}`} />
              </div>
              {isSummaryExpanded && <div className="mt-3 space-y-2 text-sm">
                  {formData.products.map(product => {
                const orderProduct = order.products.find(p => p.id === product.id);
                if (!orderProduct) return null;
                const hasDiscrepancy = product.actualQuantity !== product.expectedQuantity;
                return <div key={product.id} className={`flex items-center justify-between py-2 border-b border-emerald-100 dark:border-emerald-800 last:border-0 ${hasDiscrepancy ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-300'}`}>
                        <span className="truncate">{orderProduct.name}</span>
                        <span className="ml-2 whitespace-nowrap">
                          {product.actualQuantity} / {product.expectedQuantity}{' '}
                          шт
                        </span>
                      </div>;
              })}
                  <div className="flex justify-between pt-2 font-medium text-emerald-800 dark:text-emerald-200">
                    <span>Расходы на доставку:</span>
                    <span>
                      {formData.deliveryCost.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>}
            </div>
            {/* Actions */}
            <div className="flex space-x-3">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-border rounded-xl hover:bg-accent transition-colors">
                Отмена
              </button>
              <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                {loading ? <span className="flex items-center">
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Оприходование...
                  </span> : 'Оприходовать'}
              </button>
            </div>
            {hasDiscrepancies && <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                Обнаружены расхождения между ожидаемым и фактическим количеством
                товаров
              </p>}
          </form>
        </div>
      </div>
    </div>;
}