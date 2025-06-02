import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Dot } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Expense {
  id: string;
  date: string;
  type: 'Логистика' | 'Реклама' | 'ФОТ' | 'Прочее' | 'Закупка товара';
  description: string;
  amount: number;
  productId?: string;
  productName?: string;
  createdAt: string;
  purchaseItems?: Array<{
    productName: string;
    quantity: number;
    unitCostTRY: number;
  }>;
}

interface ExpenseChartProps {
  expenses: Expense[];
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700"
      >
        <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
          {new Date(label).toLocaleDateString('ru-RU', { 
            year: 'numeric',
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-600 dark:text-slate-400">{entry.name}:</span>
              </div>
              <span className="font-medium text-slate-900 dark:text-white">
                {new Intl.NumberFormat('ru-RU', { 
                  style: 'currency', 
                  currency: 'RUB',
                  minimumFractionDigits: 0
                }).format(entry.value)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-slate-700 dark:text-slate-300">Итого:</span>
            <span className="text-rose-600 dark:text-rose-400">
              {new Intl.NumberFormat('ru-RU', { 
                style: 'currency', 
                currency: 'RUB',
                minimumFractionDigits: 0
              }).format(total)}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }
  
  return null;
};

// Custom dot for single data point
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  
  return (
    <motion.circle
      initial={{ r: 0 }}
      animate={{ r: 6 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      cx={cx}
      cy={cy}
      fill="#F43F5E"
      stroke="#FFF"
      strokeWidth={2}
      className="cursor-pointer"
    />
  );
};

export function ExpenseChart({ expenses }: ExpenseChartProps) {
  const [animationKey, setAnimationKey] = useState(0);
  
  // Re-trigger animation when expenses change
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [expenses]);
  
  // Prepare data for the chart
  const chartData = expenses.reduce((acc: any[], expense) => {
    const date = expense.date;
    const existingDate = acc.find(item => item.date === date);
    
    if (existingDate) {
      existingDate[expense.type] = (existingDate[expense.type] || 0) + expense.amount;
      existingDate.total += expense.amount;
    } else {
      const newEntry = {
        date,
        [expense.type]: expense.amount,
        total: expense.amount
      };
      acc.push(newEntry);
    }
    
    return acc;
  }, []);

  // Sort by date
  chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate trend
  const trend = chartData.length > 1 
    ? chartData[chartData.length - 1].total - chartData[chartData.length - 2].total
    : 0;

  const typeConfig = {
    'Логистика': { color: '#3B82F6', gradient: ['#60A5FA', '#3B82F6'] },
    'Реклама': { color: '#A855F7', gradient: ['#C084FC', '#A855F7'] },
    'ФОТ': { color: '#F97316', gradient: ['#FB923C', '#F97316'] },
    'Закупка товара': { color: '#10B981', gradient: ['#34D399', '#10B981'] },
    'Прочее': { color: '#6B7280', gradient: ['#9CA3AF', '#6B7280'] }
  };

  const totalExpenses = chartData.reduce((sum, day) => sum + day.total, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-border shadow-xl p-4 sm:p-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
            Динамика расходов
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {chartData.length > 0 
              ? `${new Date(chartData[0].date).toLocaleDateString('ru-RU')} — ${new Date(chartData[chartData.length - 1].date).toLocaleDateString('ru-RU')}`
              : 'Нет данных'
            }
          </p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          <div className="text-right">
            <p className="text-xs text-slate-600 dark:text-slate-400">Всего расходов</p>
            <p className="text-lg sm:text-xl font-bold text-rose-600 dark:text-rose-400">
              {new Intl.NumberFormat('ru-RU', { 
                style: 'currency', 
                currency: 'RUB',
                minimumFractionDigits: 0
              }).format(totalExpenses)}
            </p>
          </div>
          {trend !== 0 && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
              trend > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'
            }`}>
              {trend > 0 ? (
                <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
              )}
              <span className={`text-xs font-medium ${
                trend > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
              }`}>
                {Math.abs(trend / chartData[chartData.length - 2].total * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[360px] sm:h-[400px] lg:h-[420px]">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-500 dark:text-slate-400">Нет данных для отображения</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              key={animationKey}
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                {Object.entries(typeConfig).map(([type, config]) => (
                  <linearGradient key={type} id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={config.gradient[0]} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={config.gradient[1]} stopOpacity={0.1} />
                  </linearGradient>
                ))}
                <linearGradient id="gradient-rose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FB7185" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#F43F5E" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#E5E7EB" 
                className="dark:opacity-20"
                vertical={false}
              />
              
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('ru-RU', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
                tick={{ fontSize: 12, fill: '#64748B' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={{ stroke: '#E5E7EB' }}
              />
              
              <YAxis 
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}к`}
                tick={{ fontSize: 12, fill: '#64748B' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={{ stroke: '#E5E7EB' }}
                width={45}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
                formatter={(value) => <span className="text-xs text-slate-600 dark:text-slate-400">{value}</span>}
              />
              
              {Object.entries(typeConfig).map(([type, config]) => (
              <Area
                key={type}
                type="monotone"
                dataKey={type}
                stackId="1"
                  stroke={config.color}
                  fill={`url(#gradient-${type})`}
                  strokeWidth={2}
                  animationDuration={1000}
                  animationBegin={0}
                  dot={chartData.length === 1 ? <CustomDot /> : false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>

      {/* Legend Pills */}
      <div className="mt-6 flex flex-wrap gap-2">
        {Object.entries(typeConfig).map(([type, config]) => {
          const typeTotal = chartData.reduce((sum, day) => sum + (day[type] || 0), 0);
          const percentage = totalExpenses > 0 ? (typeTotal / totalExpenses * 100).toFixed(1) : '0';
          
          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-full"
            >
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: config.color }}
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {type}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {percentage}%
              </span>
            </motion.div>
          );
        })}
    </div>
    </motion.div>
  );
}