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
import { 
  ChartWrapper, 
  AnimatedAreaChart, 
  AnimatedPieChart,
  AnimatedLineChart,
  LeaderboardChart
} from '../components/charts';
import { useResponsive } from '../hooks/useResponsive';
import axios from 'axios';
import { EmptyState } from '../components/ui/EmptyState';
import { cn } from '../lib/utils';

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

  // Helper function to parse order date
  const parseOrderDate = (dateString: string) => {
    // Check if it's ISO format (demo data)
    if (dateString.includes('-') && dateString.includes('T')) {
      return new Date(dateString);
    }
    
    // Check if it's just a date without time (YYYY-MM-DD)
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return new Date(dateString + 'T00:00:00');
    }
    
    // Original format: "28.05.2025 15:31:51"
    const parts = dateString.split(' ');
    if (parts.length === 2) {
      const [datePart, timePart] = parts;
      const [day, month, year] = datePart.split('.');
      return new Date(`${year}-${month}-${day}T${timePart}`);
    }
    
    // Fallback - try to parse as is
    return new Date(dateString);
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
    const now = new Date('2025-05-29'); // Use current date from screenshot
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

  // Generate demo orders for different date ranges
  const generateDemoOrders = () => {
    const orders = [];
    const products = [
      { name: 'iPhone 15 Pro 256GB', price: 89900 },
      { name: 'iPhone 15 Pro Max 512GB', price: 94900 },
      { name: 'Samsung Galaxy S24 Ultra', price: 79900 },
      { name: 'MacBook Air M3', price: 119900 },
      { name: 'AirPods Pro 2', price: 54900 },
      { name: 'iPad Pro 12.9"', price: 84900 },
      { name: 'iPhone 14 Pro 128GB', price: 69900 },
      { name: 'MacBook Pro 14"', price: 134900 },
      { name: 'Apple Watch Series 9', price: 44900 },
      { name: 'Samsung Galaxy Watch 6', price: 32900 },
      { name: 'Google Pixel 8 Pro', price: 74900 },
      { name: 'Xiaomi Redmi Buds 4', price: 19900 },
      { name: 'Samsung Galaxy Tab S9 Ultra', price: 99900 },
      { name: 'OnePlus 12', price: 59900 },
      { name: 'Nothing Phone (2)', price: 49900 }
    ];
    
    const customers = [
      { name: 'ООО "ТехноМир"', address: 'Москва, ул. Ленина 15' },
      { name: 'Иван Петров', address: 'Санкт-Петербург, пр. Невский 100' },
      { name: 'ИП Сидоров А.В.', address: 'Казань, ул. Баумана 45' },
      { name: 'Анна Смирнова', address: 'Екатеринбург, ул. Малышева 30' },
      { name: 'ООО "МегаТрейд"', address: 'Новосибирск, пр. Красный 78' },
      { name: 'Сергей Иванов', address: 'Москва, ул. Тверская 25' },
      { name: 'Елена Васильева', address: 'Санкт-Петербург, ул. Садовая 50' },
      { name: 'ИП Козлов Д.С.', address: 'Ростов-на-Дону, пр. Ворошиловский 20' },
      { name: 'ООО "ГаджетСтор"', address: 'Челябинск, ул. Кирова 88' },
      { name: 'Михаил Новиков', address: 'Москва, ул. Арбат 10' },
      { name: 'Ольга Федорова', address: 'Самара, ул. Молодогвардейская 60' },
      { name: 'ИП Морозов П.Н.', address: 'Омск, пр. Мира 35' },
      { name: 'ООО "СмартТех"', address: 'Нижний Новгород, ул. Большая Покровская 20' },
      { name: 'Дмитрий Волков', address: 'Краснодар, ул. Красная 135' },
      { name: 'ООО "АйФонСервис"', address: 'Москва, ул. Профсоюзная 45' }
    ];
    
    const statuses = ['shipped', 'delivered', 'processing'];
    
    // Generate orders for the current date (May 2025) and backwards
    const currentDate = new Date('2025-05-29'); // Set to current date shown in screenshot
    
    for (let i = 0; i < 200; i++) {
      const daysAgo = Math.floor(Math.random() * 365);
      const orderDate = new Date(currentDate.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      const product = products[Math.floor(Math.random() * products.length)];
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const quantity = Math.floor(Math.random() * 10) + 1;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const hours = Math.floor(Math.random() * 24);
      const minutes = Math.floor(Math.random() * 60);
      const seconds = Math.floor(Math.random() * 60);
      
      const day = orderDate.getDate().toString().padStart(2, '0');
      const month = (orderDate.getMonth() + 1).toString().padStart(2, '0');
      const year = orderDate.getFullYear();
      const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      orders.push({
        id: `demo-${i}`,
        paymentDate: `${day}.${month}.${year} ${timeStr}`,
        customerName: customer.name,
        address: customer.address,
        quantity: quantity,
        price: product.price,
        productName: product.name,
        status: status
      });
    }
    
    return orders.sort((a, b) => {
      const dateA = parseOrderDate(a.paymentDate);
      const dateB = parseOrderDate(b.paymentDate);
      return dateB.getTime() - dateA.getTime();
    });
  };

  // Generate demo expenses for different date ranges
  const generateDemoExpenses = () => {
    const expenses = [];
    const types = [
      { type: 'Закупка товара', descriptions: ['Закупка iPhone партия', 'Закупка Samsung партия', 'Закупка MacBook партия'], minAmount: 1000000, maxAmount: 5000000 },
      { type: 'Логистика', descriptions: ['Доставка из Турции', 'Доставка из Китая', 'Таможенное оформление'], minAmount: 50000, maxAmount: 300000 },
      { type: 'ФОТ', descriptions: ['Зарплата сотрудников', 'Премии', 'Страховые взносы'], minAmount: 300000, maxAmount: 600000 },
      { type: 'Реклама', descriptions: ['Яндекс.Директ', 'Google Ads', 'SMM продвижение'], minAmount: 50000, maxAmount: 200000 },
      { type: 'Прочее', descriptions: ['Аренда офиса и склада', 'Коммунальные услуги', 'Канцелярия'], minAmount: 50000, maxAmount: 300000 }
    ];
    
    const currentDate = new Date('2025-05-29'); // Set to current date shown in screenshot
    
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 365);
      const expenseDate = new Date(currentDate.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      const typeData = types[Math.floor(Math.random() * types.length)];
      const description = typeData.descriptions[Math.floor(Math.random() * typeData.descriptions.length)];
      const amount = Math.floor(Math.random() * (typeData.maxAmount - typeData.minAmount)) + typeData.minAmount;
      
      expenses.push({
        id: `exp-${i}`,
        date: expenseDate.toISOString().split('T')[0],
        type: typeData.type,
        description: description,
        amountRUB: amount
      });
    }
    
    return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
      setLoading(true);
      setError(null);
      
    try {
      // Check if we're in demo mode
      if (window.isDemoMode) {
        // Generate demo data
        const { from, to } = getDateRange(selectedPeriod);
          const fromDate = new Date(from);
          const toDate = new Date(to);
        
        // Demo orders
        const demoOrders = generateDemoOrders();
        
        // Demo expenses
        const demoExpenses = generateDemoExpenses();
        
        // Filter orders by date range
        const filteredOrders = demoOrders.filter(order => {
          const orderDate = parseOrderDate(order.paymentDate);
          return orderDate >= fromDate && orderDate <= toDate;
        });

        // Filter expenses by date range
        const filteredExpenses = demoExpenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= fromDate && expenseDate <= toDate;
        });
        
        // Calculate analytics from demo data
        const customerStats = filteredOrders.reduce((acc: any, order: any) => {
          const total = order.quantity * order.price;
          if (!acc[order.customerName]) {
            acc[order.customerName] = { name: order.customerName, total: 0, orders: 0 };
          }
          acc[order.customerName].total += total;
          acc[order.customerName].orders += 1;
          return acc;
        }, {});
        
        const topCustomers = Object.values(customerStats)
          .sort((a: any, b: any) => b.total - a.total)
          .slice(0, 5);

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
          .slice(0, 3);
        
        const productStats = filteredOrders.reduce((acc: any, order: any) => {
          const productName = order.productName;
          if (!acc[productName]) {
            acc[productName] = { name: productName, totalQuantity: 0, orders: 0 };
            }
          acc[productName].totalQuantity += order.quantity;
          acc[productName].orders += 1;
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
          profit: [],
          purchases: [],
          expenses: filteredExpenses,
          orders: filteredOrders,
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
      className="w-full min-w-0 space-y-6 sm:space-y-8 lg:space-y-10"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full"
      >
        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Аналитика
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mt-1 sm:mt-2">
              Детальный анализ продаж, прибыли и эффективности
            </p>
          </div>

          {/* Period filter */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full sm:w-auto flex-shrink-0"
          >
            <div className="inline-flex flex-wrap gap-1 p-1 bg-muted/30 rounded-xl border w-full sm:w-auto">
              {periodFilters.map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`
                    flex-1 sm:flex-none px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg
                    transition-all whitespace-nowrap focus-ring min-w-0
                    ${selectedPeriod === period.value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }
                  `}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
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
        className="w-full grid gap-6 sm:gap-8 lg:gap-10"
      >
        {/* Revenue Chart - Full Width */}
        <div className="w-full">
          <ChartWrapper
            title="Динамика доходов"
            icon={<BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />}
          >
            {revenueChartData.length > 0 ? (
              <div className="w-full overflow-hidden">
                <AnimatedAreaChart
                  data={revenueChartData}
                  height={isMobile ? 250 : isTablet ? 300 : 350}
                  keys={['revenue', 'profit']}
                  index="date"
                  colors={['#3B82F6', '#10B981']}
                  legends={['Выручка', 'Прибыль']}
                />
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

        {/* Two Column Charts */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
          {/* Expenses Chart */}
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
                  height={isMobile ? 200 : 300}
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

          {/* Top Customers */}
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
                  onItemClick={handleCustomerClick}
                  height={isMobile ? 200 : 300}
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
      </motion.div>

      {/* Additional Charts */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10"
      >
        {/* Top Cities */}
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
                onItemClick={isMobile ? undefined : handleCityClick}
                height={isMobile ? 180 : 250}
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

        {/* Top Products */}
        <ChartWrapper
          title="Популярные товары"
          icon={<Package className="h-4 w-4 sm:h-5 sm:w-5" />}
        >
          {analyticsData.products.length > 0 ? (
            <div className="w-full space-y-2 sm:space-y-3">
              {analyticsData.products.slice(0, 5).map((product: any, index: number) => (
                <motion.div
                  key={product.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    flex items-center justify-between gap-3 p-3 sm:p-4
                    rounded-lg bg-muted/30 hover:bg-muted/50 
                    transition-colors cursor-pointer group min-w-0
                  `}
                  onClick={() => !isMobile && handleProductClick(product)}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                      <Package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-base font-medium truncate">
                        {product.name}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {product.avgDailyConsumption.toFixed(1)} шт/день
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm sm:text-base font-medium">#{index + 1}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
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