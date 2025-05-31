import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  MapPin, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Package
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { 
  ChartWrapper, 
  AnimatedAreaChart, 
  AnimatedPieChart,
  AnimatedLineChart,
  LeaderboardChart,
  type ChartWrapperProps,
  type AnimatedAreaChartProps,
  type AnimatedLineChartProps,
  type AnimatedPieChartProps,
  type LeaderboardChartProps
} from '../components/charts';
import { useResponsive } from '../hooks/useResponsive';
import axios from 'axios';
import { EmptyState } from '../components/ui/EmptyState';

// Demo data import for demo mode
import { demoAnalytics, demoOrders, demoExpenses } from '../data/demoData';

// Check if we're in demo mode
const isDemoMode = () => typeof window !== 'undefined' && window.isDemoMode === true;

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

export function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30d');
  const { isMobile } = useResponsive();
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

  // Helper function to parse order date
  const parseOrderDate = (dateString: string) => {
    // Format: "28.05.2025 15:31:51"
    const [datePart, timePart] = dateString.split(' ');
    const [day, month, year] = datePart.split('.');
    return new Date(`${year}-${month}-${day}T${timePart}`);
  };

  // Helper function to translate order status to Russian
  const translateOrderStatus = (status: string): string => {
    const statusTranslations: { [key: string]: string } = {
      'shipped': 'Отправлен',
      'delivered': 'Доставлен',
      'pending': 'В ожидании',
      'processing': 'В обработке',
      'cancelled': 'Отменен',
      'overdue': 'Просрочен',
      'completed': 'Завершен',
      'refunded': 'Возвращен',
      'failed': 'Неудачный',
      // Add more translations as needed
    };
    
    return statusTranslations[status.toLowerCase()] || status;
  };

  // Calculate date range based on selected period
  const getDateRange = (periodValue: string) => {
    const now = new Date();
    const period = periodFilters.find(p => p.value === periodValue);
    if (!period) return { from: '', to: '' };
    
    // For "1y" period, use a wider range to capture all data
    let fromDate: Date;
    
    if (periodValue === '1y') {
      // Go back 2 years to make sure we capture all data
      fromDate = new Date(now.getTime() - (2 * 365 * 24 * 60 * 60 * 1000));
    } else {
      fromDate = new Date(now.getTime() - (period.days * 24 * 60 * 60 * 1000));
    }
    
    // Extend "to" date slightly into the future to capture recent orders
    const toDate = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // +7 days
    
    return {
      from: fromDate.toISOString().split('T')[0],
      to: toDate.toISOString().split('T')[0]
    };
  };

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if we're in demo mode
      if (isDemoMode()) {
        // Use demo data
        const { from, to } = getDateRange(selectedPeriod);
        
        // Filter demo orders by selected period
        const filteredOrders = demoOrders.filter((order: any) => {
          const orderDate = new Date(order.orderDate);
          const fromDate = new Date(from);
          const toDate = new Date(to);
          return orderDate >= fromDate && orderDate <= toDate;
        });

        // Filter demo expenses by selected period
        const filteredExpenses = demoExpenses.filter((expense: any) => {
          const expenseDate = new Date(expense.date);
          const fromDate = new Date(from);
          const toDate = new Date(to);
          return expenseDate >= fromDate && expenseDate <= toDate;
        });
        
        // Calculate top customers with orders
        const customerStats = filteredOrders.reduce((acc: any, order: any) => {
          const total = order.totalAmount;
          const cleanName = order.customerName;
          if (!acc[cleanName]) {
            acc[cleanName] = { name: cleanName, total: 0, orders: 0 };
          }
          acc[cleanName].total += total;
          acc[cleanName].orders += 1;
          return acc;
        }, {});
        
        const topCustomers = Object.values(customerStats)
          .sort((a: any, b: any) => b.total - a.total)
          .slice(0, 5);

        // Mock cities for demo
        const topCities = [
          { name: 'Москва', total: 1850000, orders: 25 },
          { name: 'Санкт-Петербург', total: 850000, orders: 12 },
          { name: 'Казань', total: 450000, orders: 8 }
        ];

        // Calculate top products from orders
        const productStats = filteredOrders.reduce((acc: any, order: any) => {
          order.products.forEach((product: any) => {
            if (!acc[product.name]) {
              acc[product.name] = { name: product.name, totalQuantity: 0, orders: 0 };
            }
            acc[product.name].totalQuantity += product.quantity;
            acc[product.name].orders += 1;
          });
          return acc;
        }, {});

        const period = periodFilters.find(p => p.value === selectedPeriod);
        const daysInPeriod = period ? period.days : 30;
        
        const topProducts = Object.values(productStats)
          .map((product: any) => ({
            name: product.name,
            avgDailyConsumption: product.totalQuantity / daysInPeriod,
            totalQuantity: product.totalQuantity,
            orders: product.orders
          }))
          .sort((a: any, b: any) => b.avgDailyConsumption - a.avgDailyConsumption)
          .slice(0, 5);

        setAnalyticsData({
          profit: demoAnalytics.charts.dailyRevenue.map(d => ({
            period: d.date,
            revenue: d.revenue,
            netProfit: d.revenue * 0.3 // 30% profit margin
          })),
          purchases: [],
          expenses: filteredExpenses,
          orders: filteredOrders.map((order: any) => ({
            ...order,
            paymentDate: order.orderDate + ' 12:00:00',
            address: 'Москва, ул. Примерная, д. 1',
            price: order.totalAmount / order.products.reduce((sum: number, p: any) => sum + p.quantity, 0),
            quantity: order.products.reduce((sum: number, p: any) => sum + p.quantity, 0),
            productName: order.products[0]?.name || 'Товар'
          })),
          customers: topCustomers,
          cities: topCities,
          products: topProducts
        });
        
        setLoading(false);
        return;
      }
      
      // Original API calls for non-demo mode
      const { from, to } = getDateRange(selectedPeriod);
      
      const [profitRes, purchasesRes, expensesRes, customerOrdersRes] = await Promise.all([
        axios.get(`http://localhost:3000/api/analytics/profit?from=${from}&to=${to}`),
        axios.get(`http://localhost:3000/api/analytics/purchases?from=${from}&to=${to}`),
        axios.get(`http://localhost:3000/api/expenses`), // Get all expenses, filter later
        axios.get(`http://localhost:3000/api/customer-orders?limit=2000`) // Get ALL orders, not just first 20
      ]);

      // Get all customer orders and expenses for processing
      const allCustomerOrders = customerOrdersRes.data.orders || [];
      const allExpenses = expensesRes.data.data || [];
      
      // Filter orders by selected period
      const filteredOrders = allCustomerOrders.filter((order: any) => {
        const orderDate = parseOrderDate(order.paymentDate);
        const fromDate = new Date(from);
        const toDate = new Date(to);
        return orderDate >= fromDate && orderDate <= toDate;
      });

      // Filter expenses by selected period
      const filteredExpenses = allExpenses.filter((expense: any) => {
        const expenseDate = new Date(expense.date);
        const fromDate = new Date(from);
        const toDate = new Date(to);
        return expenseDate >= fromDate && expenseDate <= toDate;
      });
      
      // Calculate top customers with patronymic removed
      // Filter only orders with 'shipped' status for top customers
      const shippedOrders = filteredOrders.filter((order: any) => order.status === 'shipped');
      
      const customerStats = shippedOrders.reduce((acc: any, order: any) => {
        const total = order.quantity * order.price;
        const cleanName = order.customerName;
        if (!acc[cleanName]) {
          acc[cleanName] = { name: cleanName, total: 0, orders: 0 };
        }
        acc[cleanName].total += total;
        acc[cleanName].orders += 1;
        return acc;
      }, {});
      
      const topCustomers = Object.values(customerStats)
        .sort((a: any, b: any) => b.total - a.total)
        .slice(0, 5); // TOP 5 customers

      // Calculate top cities
      const cityStats = filteredOrders.reduce((acc: any, order: any) => {
        const city = order.address.split(',')[0]?.trim() || 'Неизвестно';
        const total = order.quantity * order.price;
        if (!acc[city]) {
          acc[city] = { name: city, total: 0, orders: 0 };
        }
        acc[city].total += total;
        acc[city].orders += 1;
        return acc;
      }, {});
      
      const topCities = Object.values(cityStats)
        .sort((a: any, b: any) => b.total - a.total)
        .slice(0, 3); // TOP 3 cities

      // Calculate top products by average daily consumption
      const productStats = filteredOrders.reduce((acc: any, order: any) => {
        const productName = order.productName;
        if (!acc[productName]) {
          acc[productName] = { name: productName, totalQuantity: 0, orders: 0 };
        }
        acc[productName].totalQuantity += order.quantity;
        acc[productName].orders += 1;
        return acc;
      }, {});

      // Calculate average daily consumption for each product
      const period = periodFilters.find(p => p.value === selectedPeriod);
      const daysInPeriod = period ? period.days : 30;
      
      const topProducts = Object.values(productStats)
        .map((product: any) => ({
          name: product.name,
          avgDailyConsumption: product.totalQuantity / daysInPeriod,
          totalQuantity: product.totalQuantity,
          orders: product.orders
        }))
        .sort((a: any, b: any) => b.avgDailyConsumption - a.avgDailyConsumption)
        .slice(0, 5); // TOP 5 products

      setAnalyticsData({
        profit: profitRes.data.data || [],
        purchases: purchasesRes.data.data || [],
        expenses: filteredExpenses,
        orders: filteredOrders,
        customers: topCustomers,
        cities: topCities,
        products: topProducts
      });
    } catch (err: any) {
      console.error('Error fetching analytics data:', err);
      setError(err.message || 'Ошибка загрузки данных аналитики');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  // Calculate summary metrics
  const summaryMetrics = React.useMemo(() => {
    // Calculate total revenue from customer orders
    const totalRevenue = analyticsData.orders.reduce((sum: number, order: any) => {
      return sum + (order.quantity * order.price);
    }, 0);
    
    // Calculate total expenses from real expense data
    const totalExpenses = analyticsData.expenses.reduce((sum: number, expense: any) => {
      return sum + (expense.amountRUB || 0);
    }, 0);

    // Calculate total profit
    const totalProfit = totalRevenue - totalExpenses;

    // Calculate profit margin
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Count unique customers
    const uniqueCustomers = new Set(analyticsData.orders.map((order: any) => order.customerName)).size;

    // Calculate trends (mock data for now)
    const revenueTrend = { value: 12.5, isPositive: true };
    const profitTrend = { value: 8.2, isPositive: true };
    const ordersTrend = { value: 15.3, isPositive: true };
    const customersTrend = { value: 5.7, isPositive: true };

    // Group orders by day
    const ordersByDay = analyticsData.orders.reduce((acc: any[], order: any) => {
      const date = order.paymentDate.split(' ')[0];
      const existingDay = acc.find(day => day.date === date);
      if (existingDay) {
        existingDay.orders += 1;
      } else {
        acc.push({ date, orders: 1 });
      }
      return acc;
    }, []).sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalRevenue,
      totalProfit,
      totalExpenses,
      profitMargin,
      ordersByStatus: {},
      totalOrders: analyticsData.orders.length,
      uniqueCustomers,
      revenueTrend,
      profitTrend,
      ordersTrend,
      customersTrend,
      ordersByDay
    } as SummaryMetrics;
  }, [analyticsData]);

  // Prepare chart data
  const revenueChartData = React.useMemo(() => {
    // Group customer orders by date
    const dailyData = analyticsData.orders.reduce((acc: any, order: any) => {
      const orderDate = parseOrderDate(order.paymentDate);
      const dateKey = orderDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, revenue: 0, profit: 0, orders: 0, expenses: 0 };
      }
      
      const orderTotal = order.quantity * order.price;
      acc[dateKey].revenue += orderTotal;
      acc[dateKey].orders += 1;
      
      return acc;
    }, {});

    // Add real expenses by date
    analyticsData.expenses.forEach((expense: any) => {
      const expenseDate = new Date(expense.date);
      const dateKey = expenseDate.toISOString().split('T')[0];
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { date: dateKey, revenue: 0, profit: 0, orders: 0, expenses: 0 };
      }
      
      dailyData[dateKey].expenses += expense.amountRUB || 0;
    });
    
    // Calculate profit = revenue - expenses for each day
    Object.keys(dailyData).forEach(date => {
      dailyData[date].profit = dailyData[date].revenue - dailyData[date].expenses;
    });
    
    return Object.values(dailyData).sort((a: any, b: any) => a.date.localeCompare(b.date));
  }, [analyticsData.orders, analyticsData.expenses]);

  const expensesChartData = React.useMemo(() => {
    // Group real expenses by type
    const expensesByType = analyticsData.expenses.reduce((acc: any, expense: any) => {
      if (!acc[expense.type]) {
        acc[expense.type] = { name: expense.type, value: 0 };
      }
      acc[expense.type].value += expense.amountRUB || 0;
      return acc;
    }, {});
    
    const expensesArray = Object.values(expensesByType);
    
    // If no expenses data, show message instead of fake data
    if (expensesArray.length === 0) {
      return [{ name: 'Нет данных о расходах', value: 0 }];
    }
    
    return expensesArray;
  }, [analyticsData.expenses]);

  const orderStatusData = React.useMemo(() => {
    return Object.entries(summaryMetrics.ordersByStatus).map(([status, count]) => ({
      name: translateOrderStatus(status),
      value: count as number
    }));
  }, [summaryMetrics.ordersByStatus]);

  // Handler for clicking on top customers
  const handleCustomerClick = (customer: { name: string; value: number }) => {
    // Navigate to customer orders page with search filter and shipped status
    navigate(`/customer-orders?search=${encodeURIComponent(customer.name)}&status=shipped`);
  };

  // Handler for clicking on top cities
  const handleCityClick = (city: { name: string; value: number }) => {
    // Navigate to customer orders page with address filter
    navigate(`/customer-orders?search=${encodeURIComponent(city.name)}`);
  };

  // Handler for clicking on top products
  const handleProductClick = (product: { name: string; value: number }) => {
    // Navigate to customer orders page with product filter
    navigate(`/customer-orders?search=${encodeURIComponent(product.name)}`);
  };

  if (loading) return <LoadingState variant="sparkle" size="lg" message="Загружаем аналитику..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="analytics-container space-y-6 lg:space-y-8"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-responsive-header font-bold gradient-text">
            Аналитика
          </h1>
          <p className="text-responsive-body text-muted-foreground mt-2">
            Детальный анализ продаж, прибыли и эффективности
          </p>
        </div>

        {/* Period filter */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="period-filter-container"
        >
          <div className="flex flex-wrap gap-2 p-1 bg-muted/30 rounded-xl border border-border/50">
            {periodFilters.map((period) => (
              <motion.button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`
                  px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-lg
                  transition-all duration-200 whitespace-nowrap period-btn
                  ${selectedPeriod === period.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {period.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 metrics-grid"
      >
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
        
        <StatCard
          title="Всего заказов"
          value={summaryMetrics.totalOrders}
          change={summaryMetrics.ordersTrend}
          icon={ShoppingCart}
          variant="outline"
          color="info"
          description="Обработанных заказов"
        />
        
        <StatCard
          title="Уникальных клиентов"
          value={summaryMetrics.uniqueCustomers}
          change={summaryMetrics.customersTrend}
          icon={Users}
          variant="minimal"
          color="warning"
          description="Активных покупателей"
        />
      </motion.div>

      {/* Charts Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 charts-grid"
      >
        {/* Revenue Chart */}
        <ChartWrapper
          title="Динамика доходов"
          icon={<BarChart3 className="h-5 w-5" />}
          className="lg:col-span-2"
        >
          {revenueChartData.length > 0 ? (
            <AnimatedAreaChart
              data={revenueChartData}
              height={300}
              keys={['revenue', 'profit']}
              index="date"
              colors={['#3B82F6', '#10B981']}
              legends={['Выручка', 'Прибыль']}
            />
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

        {/* Expenses Chart */}
        <ChartWrapper
          title="Структура расходов"
          icon={<PieChart className="h-5 w-5" />}
        >
          {expensesChartData.some((item: any) => item.value > 0) ? (
            <AnimatedPieChart
              data={expensesChartData.map((expense: any) => ({
                id: expense.name,
                label: expense.name,
                value: expense.value
              }))}
              colors={COLORS}
              height={250}
            />
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

        {/* Top Customers */}
        <ChartWrapper
          title="Топ клиенты"
          icon={<Users className="h-5 w-5" />}
        >
          {analyticsData.customers.length > 0 ? (
            <LeaderboardChart
              data={analyticsData.customers.map((customer: any, index: number) => ({
                name: customer.name,
                value: customer.total
              }))}
              onItemClick={handleCustomerClick}
              height={250}
              colors={COLORS}
              valueFormatter={(value: number) => `₽${value.toLocaleString()}`}
            />
          ) : (
            <EmptyState
              type="customers"
              message="Нет данных о клиентах"
              description="Клиенты появятся после первых заказов"
              size="sm"
            />
          )}
        </ChartWrapper>
      </motion.div>

      {/* Additional Charts */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8"
      >
        {/* Top Cities */}
        <ChartWrapper
          title="География продаж"
          icon={<MapPin className="h-5 w-5" />}
        >
          {analyticsData.cities.length > 0 ? (
            <LeaderboardChart
              data={analyticsData.cities.map((city: any) => ({
                name: city.name,
                value: city.total
              }))}
              onItemClick={handleCityClick}
              height={200}
              colors={COLORS}
              valueFormatter={(value: number) => `₽${value.toLocaleString()}`}
            />
          ) : (
            <EmptyState
              type="analytics"
              message="Нет географических данных"
              description="Данные появятся после обработки заказов"
              size="sm"
            />
          )}
        </ChartWrapper>

        {/* Top Products */}
        <ChartWrapper
          title="Популярные товары"
          icon={<Package className="h-5 w-5" />}
        >
          {analyticsData.products.length > 0 ? (
            <div className="space-y-3">
              {analyticsData.products.slice(0, 5).map((product: any, index: number) => (
                <motion.div
                  key={product.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleProductClick(product)}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.avgDailyConsumption.toFixed(1)} шт/день
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">
                      #{index + 1}
                    </div>
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
      </motion.div>
    </motion.div>
  );
}