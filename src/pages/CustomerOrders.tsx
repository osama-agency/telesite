import React, { useEffect, useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Search, Package2, User, MapPin, Truck, CreditCard, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface CustomerOrder {
  id: string;
  paymentDate: string;
  customerId: string;
  customerName: string;
  address: string;
  deliveryCost: number;
  productName: string;
  quantity: number;
  price: number;
}
type SortField = keyof CustomerOrder;
type SortDirection = 'asc' | 'desc';
export function CustomerOrders() {
  // State
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [sort, setSort] = useState<{
    field: SortField;
    direction: SortDirection;
  }>({
    field: 'paymentDate',
    direction: 'desc'
  });
  // Demo data
  const demoOrders: CustomerOrder[] = [{
    id: 'ORD-001',
    paymentDate: '2024-01-15',
    customerId: 'CST-001',
    customerName: 'Иван Петров',
    address: 'ул. Ленина 123, кв. 45',
    deliveryCost: 0,
    productName: 'Atominex 10mg',
    quantity: 2,
    price: 2800
  }, {
    id: 'ORD-002',
    paymentDate: '2024-01-16',
    customerId: 'CST-002',
    customerName: 'Анна Сидорова',
    address: 'пр. Мира 45, кв. 12',
    deliveryCost: 350,
    productName: 'Abilify 15mg',
    quantity: 1,
    price: 2100
  }];
  // Load orders
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOrders(demoOrders);
      } catch (err) {
        setError('Ошибка загрузки данных');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);
  // Filter orders by date range
  const filteredOrders = orders.filter(order => {
    if (!dateRange.start && !dateRange.end) return true;
    const orderDate = new Date(order.paymentDate);
    const start = dateRange.start ? new Date(dateRange.start) : null;
    const end = dateRange.end ? new Date(dateRange.end) : null;
    if (start && end) {
      return orderDate >= start && orderDate <= end;
    }
    if (start) return orderDate >= start;
    if (end) return orderDate <= end;
    return true;
  });
  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const aValue = a[sort.field];
    const bValue = b[sort.field];
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sort.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    return sort.direction === 'asc' ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
  });
  // Handle sort
  const handleSort = (field: SortField) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  return <motion.div initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} className="p-8 space-y-8 min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800/50">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="relative">
          <motion.div initial={{
          scale: 0.95
        }} animate={{
          scale: 1
        }} className="absolute -top-8 -left-8 w-32 h-32 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-2xl hidden sm:block" />
          <div className="relative">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
              Заказы клиентов
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground/80 mt-2">
              Управление и аналитика заказов
            </p>
          </div>
        </div>
      </div>
      {/* Date Range Filter */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-xl p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Начальная дата
            </label>
            <input type="date" value={dateRange.start} onChange={e => setDateRange(prev => ({
            ...prev,
            start: e.target.value
          }))} className="w-full px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Конечная дата
            </label>
            <input type="date" value={dateRange.end} onChange={e => setDateRange(prev => ({
            ...prev,
            end: e.target.value
          }))} className="w-full px-4 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all" />
          </div>
        </div>
      </div>
      {/* Orders Table */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 sticky top-0 z-10">
              <tr>
                {[{
                field: 'id',
                label: 'ID заказа',
                icon: Package2
              }, {
                field: 'paymentDate',
                label: 'Дата оплаты',
                icon: CreditCard
              }, {
                field: 'customerId',
                label: 'ID клиента',
                icon: User
              }, {
                field: 'customerName',
                label: 'ФИО клиента',
                icon: User
              }, {
                field: 'address',
                label: 'Адрес',
                icon: MapPin
              }, {
                field: 'deliveryCost',
                label: 'Доставка',
                icon: Truck
              }, {
                field: 'productName',
                label: 'Товар',
                icon: Package2
              }, {
                field: 'quantity',
                label: 'Кол-во',
                icon: Package2
              }, {
                field: 'price',
                label: 'Цена (₽)',
                icon: CreditCard
              }].map(({
                field,
                label,
                icon: Icon
              }) => <th key={field} className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider cursor-pointer group" onClick={() => handleSort(field as SortField)}>
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                      <ArrowUpDown className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                    </div>
                  </th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? <tr>
                  <td colSpan={9} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                      <motion.div animate={{
                    rotate: 360
                  }} transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear'
                  }}>
                        <Package2 className="h-5 w-5" />
                      </motion.div>
                      <span>Загрузка заказов...</span>
                    </div>
                  </td>
                </tr> : sortedOrders.length === 0 ? <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
                    Заказы не найдены
                  </td>
                </tr> : sortedOrders.map(order => <motion.tr key={order.id} initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} className="hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(order.paymentDate).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.customerId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 text-sm max-w-xs truncate">
                      {order.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.deliveryCost === 0 ? <span className="text-emerald-600 dark:text-emerald-400">
                          Бесплатно
                        </span> : `${order.deliveryCost.toLocaleString('ru-RU')} ₽`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.productName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {order.price.toLocaleString('ru-RU')} ₽
                    </td>
                  </motion.tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>;
}