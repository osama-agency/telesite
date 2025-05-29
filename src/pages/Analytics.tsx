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
  Package,
  Box
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { 
  ChartWrapper, 
  AnimatedAreaChart, 
  AnimatedBarChart, 
  AnimatedPieChart,
  AnimatedLineChart,
  LeaderboardChart
} from '../components/charts';
import { useResponsive } from '../hooks/useResponsive';
import axios from 'axios';

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

export function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30d');
  const { isMobile, width } = useResponsive();
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
    
    // Net profit = Revenue - Expenses
    const totalProfit = totalRevenue - totalExpenses;
    
    // Profit margin as percentage
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    
    // Count unique orders (not individual items)
    const uniqueOrderIds = new Set(analyticsData.orders.map((order: any) => order.id));
    const totalOrders = uniqueOrderIds.size;
    
    // Group orders by status
    const ordersByStatus = analyticsData.orders.reduce((acc: any, order: any) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalRevenue,
      totalProfit,
      totalExpenses,
      profitMargin,
      ordersByStatus,
      totalOrders
    };
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

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="analytics-page min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Container with responsive padding - full width on screens 1400px+ */}
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-0 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-6">
        
        {/* Content wrapper with padding only for very large screens */}
        <div className="2xl:px-6 3xl:px-8">
          {/* Header Section - Improved typography and spacing */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* Main Title with responsive typography using clamp() */}
            <div className="text-center sm:text-left">
              <h1 className="text-responsive-header font-bold text-slate-900 dark:text-white bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
                Аналитика товаров
              </h1>
              <p className="text-responsive-body text-muted-foreground mt-2 sm:mt-3 max-w-3xl mx-auto sm:mx-0 leading-relaxed">
                Комплексная аналитика продаж, закупок и прибыльности бизнеса с современными интерактивными графиками
              </p>
            </div>
            
            {/* Period Filter - Enhanced mobile experience */}
            <div className="period-filter-container">
              <div className="flex gap-2 overflow-x-auto overflow-y-hidden scrollbar-hide pb-2 snap-x snap-mandatory">
                {periodFilters.map((period, index) => (
                  <motion.button
                    key={period.value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedPeriod(period.value)}
                    className={`
                      period-btn flex-shrink-0 snap-start touch-target
                      px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl
                      text-sm sm:text-base font-medium whitespace-nowrap
                      transition-all duration-300 ease-out
                      ${selectedPeriod === period.value
                        ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105 ring-2 ring-primary/20'
                        : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-border/50 hover:border-primary/30 hover:shadow-md'
                      }
                      focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2
                    `}
                  >
                    {period.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Key Metrics Grid - Enhanced responsive grid with better spacing */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="metrics-grid grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-4 lg:gap-5 xl:gap-6"
          >
            <StatCard
              title="Общий доход"
              value={`₽${summaryMetrics.totalRevenue.toLocaleString()}`}
              trend={{ value: 12.5, isPositive: true }}
              icon={DollarSign}
              color="success"
              compact={isMobile}
              delay={0}
            />
            <StatCard
              title="Чистая прибыль"
              value={`₽${summaryMetrics.totalProfit.toLocaleString()}`}
              trend={{ value: 8.2, isPositive: true }}
              icon={TrendingUp}
              color="info"
              compact={isMobile}
              delay={0.1}
            />
            <StatCard
              title="Рентабельность"
              value={`${summaryMetrics.profitMargin.toFixed(1)}%`}
              trend={{ value: 2.1, isPositive: false }}
              icon={BarChart3}
              color="primary"
              compact={isMobile}
              delay={0.2}
            />
            <StatCard
              title="Всего заказов"
              value={summaryMetrics.totalOrders.toString()}
              trend={{ value: 15.3, isPositive: true }}
              icon={ShoppingCart}
              color="warning"
              compact={isMobile}
              delay={0.3}
            />
          </motion.div>

          {/* Charts Grid - Reduced gaps for better spacing */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="charts-grid grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-4 xl:gap-5 2xl:gap-6"
          >
            {/* Revenue and Profit Trend - Full width chart */}
            <div className="chart-main lg:col-span-2">
              <ChartWrapper
                title="Динамика доходов и прибыли"
                subtitle="По дням за выбранный период"
                icon={
                  <div className="chart-icon p-2 sm:p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                    <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                }
                delay={0}
                className="chart-wrapper"
              >
                <div className="chart-container overflow-x-auto">
                  <AnimatedAreaChart
                    data={revenueChartData}
                    areas={[
                      {
                        dataKey: 'revenue',
                        stroke: '#3B82F6',
                        fill: 'url(#colorRevenue)',
                        name: 'Доход',
                        stackId: '1'
                      },
                      {
                        dataKey: 'profit',
                        stroke: '#10B981',
                        fill: 'url(#colorProfit)',
                        name: 'Прибыль',
                        stackId: '2'
                      }
                    ]}
                    xDataKey="date"
                    height={width < 640 ? 280 : width < 1024 ? 320 : width < 1920 ? 380 : 420}
                    formatXAxis={(value) => {
                      const date = new Date(value);
                      if (width < 640) {
                        // Ultra short format for mobile: "5/12"
                        return `${date.getDate()}/${date.getMonth() + 1}`;
                      } else if (width < 1024) {
                        // Short format for tablet: "5 дек"
                        const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
                        return `${date.getDate()} ${months[date.getMonth()]}`;
                      }
                      // Full format for desktop
                      const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
                      return `${date.getDate()} ${months[date.getMonth()]}`;
                    }}
                    gradients={[
                      {
                        id: 'colorRevenue',
                        startColor: '#3B82F6',
                        endColor: '#3B82F6',
                        startOpacity: 0.4,
                        endOpacity: 0.05
                      },
                      {
                        id: 'colorProfit',
                        startColor: '#10B981',
                        endColor: '#10B981',
                        startOpacity: 0.4,
                        endOpacity: 0.05
                      }
                    ]}
                  />
                </div>
              </ChartWrapper>
            </div>

            {/* Secondary Charts - Responsive grid layout */}
            <ChartWrapper
              title="Статусы заказов"
              subtitle="Распределение по статусам"
              icon={
                <div className="chart-icon p-2 sm:p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <PieChart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              }
              delay={0.1}
              className="chart-wrapper"
            >
              <div className="chart-container">
                <AnimatedPieChart
                  data={orderStatusData}
                  dataKey="value"
                  nameKey="name"
                  height={width < 640 ? 300 : width < 1024 ? 340 : width < 1920 ? 380 : 420}
                  outerRadius={width < 640 ? 85 : width < 1024 ? 100 : width < 1920 ? 120 : 140}
                  formatTooltip={(value) => value.toLocaleString()}
                />
              </div>
            </ChartWrapper>

            <ChartWrapper
              title="ТОП-5 покупателей"
              subtitle="По объему покупок"
              icon={
                <div className="chart-icon p-2 sm:p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              }
              delay={0.2}
              className="chart-wrapper"
            >
              <div className="chart-container">
                <LeaderboardChart
                  data={analyticsData.customers.map(c => ({ 
                    name: c.name, 
                    value: c.total 
                  }))}
                  formatValue={(value) => `₽${value.toLocaleString()}`}
                  onItemClick={handleCustomerClick}
                />
              </div>
            </ChartWrapper>

            <ChartWrapper
              title="ТОП-3 города"
              subtitle="По объему продаж"
              icon={
                <div className="chart-icon p-2 sm:p-2.5 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              }
              delay={0.3}
              className="chart-wrapper"
            >
              <div className="chart-container">
                <LeaderboardChart
                  data={analyticsData.cities.map(c => ({ 
                    name: c.name, 
                    value: c.total 
                  }))}
                  formatValue={(value) => `₽${value.toLocaleString()}`}
                  onItemClick={handleCityClick}
                />
              </div>
            </ChartWrapper>

            <ChartWrapper
              title="ТОП-5 товаров"
              subtitle="По среднему потреблению в день"
              icon={
                <div className="chart-icon p-2 sm:p-2.5 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl shadow-lg">
                  <Box className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              }
              delay={0.35}
              className="chart-wrapper"
            >
              <div className="chart-container">
                <LeaderboardChart
                  data={analyticsData.products.map(p => ({ 
                    name: p.name, 
                    value: p.avgDailyConsumption 
                  }))}
                  formatValue={(value) => `${value.toFixed(1)} шт/день`}
                  onItemClick={handleProductClick}
                />
              </div>
            </ChartWrapper>

            {/* Expenses Analysis - Full width bottom chart */}
            <div className="chart-main lg:col-span-2">
              <ChartWrapper
                title="Структура расходов"
                subtitle="Расходы по категориям за период"
                icon={
                  <div className="chart-icon p-2 sm:p-2.5 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl shadow-lg">
                    <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                }
                delay={0.4}
                className="chart-wrapper"
              >
                <div className="chart-container overflow-hidden">
                  <AnimatedPieChart
                    data={expensesChartData}
                    dataKey="value"
                    nameKey="name"
                    height={width < 640 ? 350 : width < 1024 ? 400 : width < 1920 ? 450 : 500}
                    outerRadius={width < 640 ? 110 : width < 1024 ? 130 : width < 1920 ? 150 : 170}
                    showLabel={true}
                    formatLabel={(value, percentage) => width < 640 ? `${percentage.toFixed(0)}%` : `${percentage.toFixed(1)}%`}
                  />
                </div>
              </ChartWrapper>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 