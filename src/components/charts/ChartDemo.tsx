import React from 'react';
import { 
  ChartWrapper, 
  AnimatedLineChart, 
  AnimatedAreaChart, 
  AnimatedBarChart, 
  AnimatedPieChart 
} from './index';
import { 
  Activity, 
  TrendingUp, 
  DollarSign, 
  Users,
  Package
} from 'lucide-react';

// Sample data for demonstrations
const lineChartData = [
  { date: '2024-01', sales: 4000, orders: 2400 },
  { date: '2024-02', sales: 3000, orders: 1398 },
  { date: '2024-03', sales: 2000, orders: 9800 },
  { date: '2024-04', sales: 2780, orders: 3908 },
  { date: '2024-05', sales: 1890, orders: 4800 },
  { date: '2024-06', sales: 2390, orders: 3800 },
];

const areaChartData = [
  { date: '2024-01', revenue: 4000, profit: 2400, expenses: 1600 },
  { date: '2024-02', revenue: 3000, profit: 1398, expenses: 1602 },
  { date: '2024-03', revenue: 2000, profit: 800, expenses: 1200 },
  { date: '2024-04', revenue: 2780, profit: 1908, expenses: 872 },
  { date: '2024-05', revenue: 1890, profit: 800, expenses: 1090 },
  { date: '2024-06', revenue: 2390, profit: 1800, expenses: 590 },
];

const barChartData = [
  { name: 'Product A', sales: 4000, returns: 240 },
  { name: 'Product B', sales: 3000, returns: 139 },
  { name: 'Product C', sales: 2000, returns: 980 },
  { name: 'Product D', sales: 2780, returns: 390 },
  { name: 'Product E', sales: 1890, returns: 480 },
];

const pieChartData = [
  { name: 'Desktop', value: 400 },
  { name: 'Mobile', value: 300 },
  { name: 'Tablet', value: 200 },
  { name: 'Smart TV', value: 100 },
];

export function ChartDemo() {
  return (
    <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Animated Chart Components Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Modern, interactive, and accessible chart components with smooth animations
        </p>

        {/* Line Chart Example */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartWrapper
            title="Sales & Orders Trend"
            subtitle="Monthly performance metrics"
            icon={
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            }
          >
            <AnimatedLineChart
              data={lineChartData}
              lines={[
                {
                  dataKey: 'sales',
                  stroke: '#3B82F6',
                  name: 'Sales',
                  strokeWidth: 3
                },
                {
                  dataKey: 'orders',
                  stroke: '#8B5CF6',
                  name: 'Orders',
                  strokeWidth: 3
                }
              ]}
              xDataKey="date"
              formatTooltip={(value) => `$${value.toLocaleString()}`}
            />
          </ChartWrapper>

          {/* Area Chart Example */}
          <ChartWrapper
            title="Revenue Analysis"
            subtitle="Revenue, profit, and expenses breakdown"
            icon={
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            }
          >
            <AnimatedAreaChart
              data={areaChartData}
              areas={[
                {
                  dataKey: 'revenue',
                  stroke: '#10B981',
                  fill: 'url(#colorRevenue)',
                  name: 'Revenue'
                },
                {
                  dataKey: 'profit',
                  stroke: '#3B82F6',
                  fill: 'url(#colorProfit)',
                  name: 'Profit'
                }
              ]}
              xDataKey="date"
              gradients={[
                {
                  id: 'colorRevenue',
                  startColor: '#10B981',
                  endColor: '#10B981'
                },
                {
                  id: 'colorProfit',
                  startColor: '#3B82F6',
                  endColor: '#3B82F6'
                }
              ]}
            />
          </ChartWrapper>
        </div>

        {/* Bar Chart Examples */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartWrapper
            title="Product Performance"
            subtitle="Sales and returns by product"
            icon={
              <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl">
                <Package className="h-5 w-5 text-white" />
              </div>
            }
          >
            <AnimatedBarChart
              data={barChartData}
              bars={[
                {
                  dataKey: 'sales',
                  fill: '#F59E0B',
                  name: 'Sales'
                },
                {
                  dataKey: 'returns',
                  fill: '#EF4444',
                  name: 'Returns'
                }
              ]}
              xDataKey="name"
              formatTooltip={(value) => `$${value.toLocaleString()}`}
            />
          </ChartWrapper>

          {/* Horizontal Bar Chart */}
          <ChartWrapper
            title="Top Performers"
            subtitle="Horizontal bar chart example"
            icon={
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <Users className="h-5 w-5 text-white" />
              </div>
            }
          >
            <AnimatedBarChart
              data={barChartData.slice(0, 3)}
              bars={[
                {
                  dataKey: 'sales',
                  fill: '#8B5CF6',
                  name: 'Sales',
                  radius: [0, 4, 4, 0]
                }
              ]}
              xDataKey="name"
              layout="horizontal"
              formatTooltip={(value) => `$${value.toLocaleString()}`}
            />
          </ChartWrapper>
        </div>

        {/* Pie Chart Examples */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartWrapper
            title="Device Distribution"
            subtitle="User sessions by device type"
            icon={
              <div className="p-2 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl">
                <Activity className="h-5 w-5 text-white" />
              </div>
            }
          >
            <AnimatedPieChart
              data={pieChartData}
              dataKey="value"
              nameKey="name"
              height={350}
            />
          </ChartWrapper>

          {/* Donut Chart */}
          <ChartWrapper
            title="Traffic Sources"
            subtitle="Donut chart variant"
            icon={
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
                <Activity className="h-5 w-5 text-white" />
              </div>
            }
          >
            <AnimatedPieChart
              data={pieChartData}
              dataKey="value"
              nameKey="name"
              height={350}
              innerRadius={60}
              outerRadius={120}
              colors={['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B']}
            />
          </ChartWrapper>
        </div>

        {/* Feature Highlights */}
        <div className="mt-12 bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-border/50">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                🎨 Consistent Design
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                All charts follow your Tailwind theme with consistent shadows, borders, and colors
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                ✨ Smooth Animations
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Initial render animations, data transitions, and micro-interactions
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                🎯 Interactive
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Hover tooltips, clickable legends, and visual feedback
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                📱 Responsive
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Charts resize fluidly on all screen sizes and orientations
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                ♿ Accessible
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Keyboard navigation support and respects prefers-reduced-motion
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                🔧 Customizable
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Flexible props for colors, formatters, animations, and more
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 