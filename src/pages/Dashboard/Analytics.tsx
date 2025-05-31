import React, { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { 
  CardLineChart,
  CardAreaChart, 
  CardBarChart, 
  CardPieChart 
} from "../../components/common/CardCharts";
import { analyticsService } from "../../api/services";
import { AnalyticsSummary, RevenueData, TopProduct } from "../../types";

const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [summary, revenue, products] = await Promise.all([
        analyticsService.getSummary(selectedPeriod),
        analyticsService.getRevenue(selectedPeriod),
        analyticsService.getTopProducts(selectedPeriod, 5)
      ]);
      
      setAnalyticsData(summary);
      setRevenueData(revenue);
      setTopProducts(products);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  // Prepare chart data
  const revenueChartData = {
    labels: revenueData.map(d => new Date(d.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })),
    datasets: [
      {
        name: 'Выручка',
        data: revenueData.map(d => d.revenue),
      },
      {
        name: 'Расходы',
        data: revenueData.map(d => d.expenses),
      }
    ]
  };

  const profitChartData = {
    labels: revenueData.map(d => new Date(d.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })),
    datasets: [
      {
        name: 'Прибыль',
        data: revenueData.map(d => d.profit),
      }
    ]
  };

  const topProductsChartData = {
    labels: topProducts.map(p => p.name),
    datasets: [
      {
        name: 'Выручка',
        data: topProducts.map(p => p.revenue),
      }
    ]
  };

  const productsPieData = {
    labels: topProducts.map(p => p.name),
    datasets: [
      {
        name: 'Выручка',
        data: topProducts.map(p => p.revenue),
      }
    ]
  };

  return (
    <>
      <PageMeta
        title="Аналитика | TeleSite"
        description="Анализ продаж и прибыли"
      />
      
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Аналитика
        </h1>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="7d">7 дней</option>
          <option value="30d">30 дней</option>
          <option value="90d">90 дней</option>
          <option value="365d">Год</option>
        </select>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                Общая выручка
              </p>
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(analyticsData?.totalRevenue || 0)}
                </h3>
                <span className={`text-sm font-medium ${
                  (analyticsData?.changeFromLastMonth.revenue || 0) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {formatPercentage(analyticsData?.changeFromLastMonth.revenue || 0)}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                Чистая прибыль
              </p>
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(analyticsData?.totalProfit || 0)}
                </h3>
                <span className={`text-sm font-medium ${
                  (analyticsData?.changeFromLastMonth.profit || 0) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {formatPercentage(analyticsData?.changeFromLastMonth.profit || 0)}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                Маржинальность
              </p>
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(analyticsData?.profitMargin || 0).toFixed(1)}%
                </h3>
                <span className={`text-sm font-medium ${
                  (analyticsData?.changeFromLastMonth.margin || 0) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {formatPercentage(analyticsData?.changeFromLastMonth.margin || 0)}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                Продано товаров
              </p>
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {analyticsData?.productsSold || 0}
                </h3>
                <span className={`text-sm font-medium ${
                  (analyticsData?.changeFromLastMonth.quantity || 0) >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {formatPercentage(analyticsData?.changeFromLastMonth.quantity || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CardAreaChart
              title="Выручка и расходы"
              chartData={revenueChartData}
              height={350}
            />
            
            <CardLineChart
              title="Динамика прибыли"
              chartData={profitChartData}
              height={350}
            />
            
            <CardBarChart
              title="Топ товары по выручке"
              chartData={topProductsChartData}
              height={350}
            />
            
            <CardPieChart
              title="Распределение выручки"
              chartData={productsPieData}
              height={350}
            />
          </div>

          {/* Top Products Table */}
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Топ товары по прибыли
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="pb-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Товар
                    </th>
                    <th className="pb-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      Выручка
                    </th>
                    <th className="pb-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      Количество
                    </th>
                    <th className="pb-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      Прибыль
                    </th>
                    <th className="pb-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      Рост
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-3 text-gray-900 dark:text-white">
                        {product.name}
                      </td>
                      <td className="py-3 text-right">
                        {formatCurrency(product.revenue)}
                      </td>
                      <td className="py-3 text-right">
                        {product.quantity}
                      </td>
                      <td className="py-3 text-right font-medium text-green-600">
                        {formatCurrency(product.profit)}
                      </td>
                      <td className="py-3 text-right">
                        <span className={`font-medium ${
                          product.growth >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatPercentage(product.growth)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Analytics;
