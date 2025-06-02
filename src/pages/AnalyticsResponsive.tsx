import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  PieChart,
  Activity,
  MapPin,
  Package
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { ModernDateFilter, DateRange } from '../components/ui/ModernDateFilter';
import { ResponsiveDebugger } from '../components/ui/ResponsiveDebugger';
import { PreviewWrapper } from '../components/ui/PreviewWrapper';
import { 
  ChartWrapper, 
  AnimatedAreaChart, 
  AnimatedPieChart,
  AnimatedLineChart,
  LeaderboardChart,
  TailAdminChart
} from '../components/charts';
import { useResponsive } from '../hooks/useResponsive';
import axios from 'axios';
import { EmptyState } from '../components/ui/EmptyState';
import { cn } from '../lib/utils';

// ... (keeping all the interfaces and constants from original file)
interface PeriodFilter {
  label: string;
  days: number;
  value: string;
}

const periodFilters: PeriodFilter[] = [
  { label: '1 день', days: 1, value: '1d' },
  { label: '7 дней', days: 7, value: '7d' },
  { label: '30 дней', days: 30, value: '30d' },
  { label: '3 месяца', days: 90, value: '3m' },
  { label: '1 год', days: 365, value: '1y' }
];

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'];

interface AnalyticsData {
  profit: any[];
  purchases: any[];
  expenses: any[];
  orders: any[];
  customers: any[];
  cities: any[];
  products: any[];
}

interface SummaryMetrics {
  totalRevenue: number;
  totalProfit: number;
  totalExpenses: any;
  profitMargin: number;
  ordersByStatus: any;
  totalOrders: number;
  uniqueCustomers: number;
  revenueTrend: { value: number; isPositive: boolean };
  profitTrend: { value: number; isPositive: boolean };
  ordersTrend: { value: number; isPositive: boolean };
  customersTrend: { value: number; isPositive: boolean };
  ordersByDay: Array<{ date: string; orders: number }>;
}

function AnalyticsContent() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const { isMobile, isTablet } = useResponsive();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    profit: [],
    purchases: [],
    expenses: [],
    orders: [],
    customers: [],
    cities: [],
    products: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Simulate data loading for demo
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnalyticsData({
        profit: [],
        purchases: [],
        expenses: [
          { id: '1', type: 'Закупка товара', description: 'iPhone партия', amountRUB: 2500000, date: '2025-05-20' },
          { id: '2', type: 'Логистика', description: 'Доставка', amountRUB: 150000, date: '2025-05-21' },
          { id: '3', type: 'Реклама', description: 'Яндекс.Директ', amountRUB: 80000, date: '2025-05-22' }
        ],
        orders: [
          { id: '1', customerName: 'ООО ТехноМир', productName: 'iPhone 15 Pro', quantity: 2, price: 89900, paymentDate: '28.05.2025 15:31:51', status: 'shipped', address: 'Москва, ул. Ленина 15' },
          { id: '2', customerName: 'Иван Петров', productName: 'Samsung Galaxy S24', quantity: 1, price: 79900, paymentDate: '27.05.2025 14:20:30', status: 'delivered', address: 'СПб, пр. Невский 100' }
        ],
        customers: [
          { name: 'ООО ТехноМир', total: 179800, orders: 2 },
          { name: 'Иван Петров', total: 79900, orders: 1 }
        ],
        cities: [
          { name: 'Москва', total: 179800, orders: 2 },
          { name: 'СПб', total: 79900, orders: 1 }
        ],
        products: [
          { name: 'iPhone 15 Pro', avgDailyConsumption: 2.1, totalQuantity: 63, orders: 30 },
          { name: 'Samsung Galaxy S24', avgDailyConsumption: 1.8, totalQuantity: 54, orders: 27 }
        ]
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [dateRange]);

  // Calculate summary metrics
  const summaryMetrics = React.useMemo(() => {
    const totalRevenue = analyticsData.orders.reduce((sum: number, order: any) => {
      return sum + (order.quantity * order.price);
    }, 0);
    
    const totalExpenses = analyticsData.expenses.reduce((sum: number, expense: any) => {
      return sum + (expense.amountRUB || 0);
    }, 0);

    const totalProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const uniqueCustomers = new Set(analyticsData.orders.map((order: any) => order.customerName)).size;

    return {
      totalRevenue,
      totalProfit,
      totalExpenses,
      profitMargin,
      ordersByStatus: {},
      totalOrders: analyticsData.orders.length,
      uniqueCustomers,
      revenueTrend: { value: 12.5, isPositive: true },
      profitTrend: { value: 8.2, isPositive: true },
      ordersTrend: { value: 15.3, isPositive: true },
      customersTrend: { value: 5.7, isPositive: true },
      ordersByDay: []
    } as SummaryMetrics;
  }, [analyticsData]);

  const revenueChartData = React.useMemo(() => {
    return [
      { date: '2025-05-25', revenue: 150000, profit: 50000 },
      { date: '2025-05-26', revenue: 180000, profit: 60000 },
      { date: '2025-05-27', revenue: 220000, profit: 80000 },
      { date: '2025-05-28', revenue: 190000, profit: 70000 }
    ];
  }, []);

  const expensesChartData = React.useMemo(() => {
    const expensesByType = analyticsData.expenses.reduce((acc: any, expense: any) => {
      if (!acc[expense.type]) {
        acc[expense.type] = { name: expense.type, value: 0 };
      }
      acc[expense.type].value += expense.amountRUB || 0;
      return acc;
    }, {});
    
    return Object.values(expensesByType);
  }, [analyticsData.expenses]);

  if (loading) return <LoadingState variant="sparkle" size="lg" message="Загружаем аналитику..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="w-full min-w-0 overflow-hidden">
      {/* Main Container with Debug Border */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "w-full min-w-0 space-y-4 sm:space-y-6 lg:space-y-8",
          "p-3 sm:p-4 lg:p-6", // Responsive padding
          "border-2 border-dashed border-purple-300 bg-purple-50/30" // Debug styling
        )}
      >
        {/* Header Section - Adaptive Layout */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={cn(
            "w-full space-y-4",
            "border border-dashed border-blue-300 bg-blue-50/30 p-3 rounded-lg" // Debug styling
          )}
        >
          {/* Title and Description */}
          <div className="space-y-2">
            <h1 className={cn(
              "font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent",
              "text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl",
              "break-words" // Prevent text overflow
            )}>
              Аналитика
            </h1>
            <p className={cn(
              "text-muted-foreground",
              "text-sm sm:text-base lg:text-lg",
              "max-w-none text-wrap" // Ensure text wraps properly
            )}>
              Детальный анализ продаж, прибыли и эффективности
            </p>
          </div>

          {/* Date Filter - Responsive */}
          <div className={cn(
            "w-full",
            "border border-dashed border-green-300 bg-green-50/30 p-2 rounded" // Debug styling
          )}>
            <ModernDateFilter
              value={dateRange}
              onChange={setDateRange}
              placeholder="Выберите период анализа"
              className="w-full sm:max-w-md lg:max-w-lg"
            />
          </div>
        </motion.div>

        {/* Metrics Grid - Fully Responsive */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={cn(
            "w-full",
            "grid gap-3 sm:gap-4 lg:gap-6",
            "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4", // Responsive grid
            "border border-dashed border-red-300 bg-red-50/30 p-3 rounded-lg" // Debug styling
          )}
        >
          <div className="border border-yellow-400 bg-yellow-100/50 p-1 rounded"> {/* Debug wrapper */}
            <StatCard
              title="Общая выручка"
              value={summaryMetrics.totalRevenue}
              change={summaryMetrics.revenueTrend}
              icon={DollarSign}
              variant="gradient"
              color="success"
              suffix="₽"
              description="За выбранный период"
              sparkline={revenueChartData.slice(-7).map((d: any) => d.revenue)}
            />
          </div>
          
          <div className="border border-yellow-400 bg-yellow-100/50 p-1 rounded">
            <StatCard
              title="Чистая прибыль"
              value={summaryMetrics.totalProfit}
              change={summaryMetrics.profitTrend}
              icon={TrendingUp}
              variant="default"
              color="primary"
              suffix="₽"
              description="После вычета расходов"
            />
          </div>
          
          <div className="border border-yellow-400 bg-yellow-100/50 p-1 rounded">
            <StatCard
              title="Всего заказов"
              value={summaryMetrics.totalOrders}
              change={summaryMetrics.ordersTrend}
              icon={ShoppingCart}
              variant="outline"
              color="info"
              description="Обработанных заказов"
            />
          </div>
          
          <div className="border border-yellow-400 bg-yellow-100/50 p-1 rounded">
            <StatCard
              title="Уникальных клиентов"
              value={summaryMetrics.uniqueCustomers}
              change={summaryMetrics.customersTrend}
              icon={Users}
              variant="minimal"
              color="warning"
              description="Активных покупателей"
            />
          </div>
        </motion.div>

        {/* Charts Section - Adaptive Layout */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={cn(
            "w-full space-y-4 sm:space-y-6 lg:space-y-8",
            "border border-dashed border-indigo-300 bg-indigo-50/30 p-3 rounded-lg" // Debug styling
          )}
        >
          {/* Main Revenue Chart - Full Width */}
          <div className={cn(
            "w-full",
            "border border-teal-400 bg-teal-100/50 p-2 rounded" // Debug styling
          )}>
            <ChartWrapper
              title="Динамика доходов"
              icon={<BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />}
            >
              {revenueChartData.length > 0 ? (
                <div className="w-full overflow-x-auto"> {/* Prevent horizontal overflow */}
                  <div className="min-w-[300px]"> {/* Minimum width for chart */}
                    <TailAdminChart
                      data={revenueChartData}
                      height={isMobile ? 180 : isTablet ? 220 : 300}
                      keys={['revenue']}
                      index="date"
                      colors={['#465FFF']}
                      legends={['Выручка']}
                    />
                  </div>
                </div>
              ) : (
                <EmptyState
                  type="analytics"
                  message="Нет данных о доходах"
                  description="Данные появятся после первых продаж"
                  size="sm"
                  showIllustration={false}
                />
              )}
            </ChartWrapper>
          </div>

          {/* Two Column Charts - Responsive */}
          <div className={cn(
            "w-full",
            "grid gap-4 sm:gap-6 lg:gap-8",
            "grid-cols-1 lg:grid-cols-2", // Stack on mobile, side-by-side on desktop
            "border border-orange-400 bg-orange-100/50 p-2 rounded" // Debug styling
          )}>
            {/* Expenses Chart */}
            <div className="border border-pink-400 bg-pink-100/50 p-2 rounded min-w-0"> {/* Debug + prevent overflow */}
              <ChartWrapper
                title="Структура расходов"
                icon={<PieChart className="h-4 w-4 sm:h-5 sm:w-5" />}
              >
                {expensesChartData.some((item: any) => item.value > 0) ? (
                  <div className="w-full overflow-hidden">
                    <AnimatedPieChart
                      data={expensesChartData.map((expense: any) => ({
                        id: expense.name,
                        label: expense.name,
                        value: expense.value
                      }))}
                      colors={COLORS}
                      height={isMobile ? 160 : isTablet ? 200 : 250}
                    />
                  </div>
                ) : (
                  <EmptyState
                    type="analytics"  
                    message="Нет данных о расходах"
                    description="Добавьте расходы в соответствующем разделе"
                    size="sm"
                    action={{
                      label: "Добавить расход",
                      onClick: () => navigate('/expenses')
                    }}
                  />
                )}
              </ChartWrapper>
            </div>

            {/* Top Customers */}
            <div className="border border-pink-400 bg-pink-100/50 p-2 rounded min-w-0">
              <ChartWrapper
                title="Топ клиенты"
                icon={<Users className="h-4 w-4 sm:h-5 sm:w-5" />}
              >
                {analyticsData.customers.length > 0 ? (
                  <div className="w-full overflow-hidden">
                    <LeaderboardChart
                      data={analyticsData.customers.map((customer: any) => ({
                        name: customer.name,
                        value: customer.total
                      }))}
                      onItemClick={(customer) => navigate(`/customer-orders?search=${encodeURIComponent(customer.name)}`)}
                      height={isMobile ? 160 : isTablet ? 200 : 250}
                      colors={COLORS}
                      valueFormatter={(value: number) => `₽${value.toLocaleString()}`}
                    />
                  </div>
                ) : (
                  <EmptyState
                    type="customers"
                    message="Нет данных о клиентах"
                    description="Клиенты появятся после первых заказов"
                    size="sm"
                  />
                )}
              </ChartWrapper>
            </div>
          </div>
        </motion.div>

        {/* Additional Charts - Mobile First Layout */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={cn(
            "w-full",
            "grid gap-4 sm:gap-6 lg:gap-8",
            "grid-cols-1 md:grid-cols-2", // Stack on mobile/small tablets, side-by-side on larger screens
            "border border-dashed border-violet-300 bg-violet-50/30 p-3 rounded-lg" // Debug styling
          )}
        >
          {/* Geography */}
          <div className="border border-cyan-400 bg-cyan-100/50 p-2 rounded min-w-0">
            <ChartWrapper
              title="География продаж"
              icon={<MapPin className="h-4 w-4 sm:h-5 sm:w-5" />}
            >
              {analyticsData.cities.length > 0 ? (
                <div className="w-full overflow-hidden">
                  <LeaderboardChart
                    data={analyticsData.cities.map((city: any) => ({
                      name: city.name,
                      value: city.total
                    }))}
                    onItemClick={(city) => !isMobile && navigate(`/customer-orders?search=${encodeURIComponent(city.name)}`)}
                    height={isMobile ? 140 : isTablet ? 180 : 220}
                    colors={COLORS}
                    valueFormatter={(value: number) => `₽${value.toLocaleString()}`}
                  />
                </div>
              ) : (
                <EmptyState
                  type="analytics"
                  message="Нет географических данных"
                  description="Данные появятся после обработки заказов"
                  size="sm"
                />
              )}
            </ChartWrapper>
          </div>

          {/* Top Products */}
          <div className="border border-cyan-400 bg-cyan-100/50 p-2 rounded min-w-0">
            <ChartWrapper
              title="Популярные товары"
              icon={<Package className="h-4 w-4 sm:h-5 sm:w-5" />}
            >
              {analyticsData.products.length > 0 ? (
                <div className="w-full space-y-2 sm:space-y-3 max-h-60 overflow-y-auto"> {/* Scrollable on small screens */}
                  {analyticsData.products.slice(0, 5).map((product: any, index: number) => (
                    <motion.div
                      key={product.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "flex items-center justify-between gap-2 sm:gap-3 p-2 sm:p-3",
                        "rounded-lg bg-muted/30 hover:bg-muted/50",
                        "transition-colors cursor-pointer group min-w-0",
                        "border border-gray-300" // Debug border
                      )}
                      onClick={() => !isMobile && navigate(`/customer-orders?search=${encodeURIComponent(product.name)}`)}
                      whileHover={{ x: isMobile ? 0 : 4 }}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="flex h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                          <Package className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm lg:text-base font-medium truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.avgDailyConsumption.toFixed(1)} шт/день
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs sm:text-sm font-medium">#{index + 1}</div>
                        <div className="text-xs text-muted-foreground">
                          {product.totalQuantity} шт
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  type="products"
                  message="Нет данных о продуктах"
                  description="Добавьте товары для анализа популярности"
                  size="sm"
                  action={{
                    label: "Перейти к товарам",
                    onClick: () => navigate('/products')
                  }}
                />
              )}
            </ChartWrapper>
          </div>
        </motion.div>
      </motion.div>

      {/* Responsive Debugger */}
      <ResponsiveDebugger />
    </div>
  );
}

// Main export with PreviewWrapper for development
export function Analytics() {
  // Check if we're in development mode
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    return (
      <PreviewWrapper defaultSize="desktop" showDebug={true}>
        <AnalyticsContent />
      </PreviewWrapper>
    );
  }
  
  // Production mode - return component directly
  return <AnalyticsContent />;
} 