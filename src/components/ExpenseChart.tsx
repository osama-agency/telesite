import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Expense {
  id: string;
  date: string;
  type: 'Логистика' | 'Реклама' | 'ФОТ' | 'Прочее' | 'Закупка товара';
  description: string;
  amount: number;
  productId?: string;
  productName?: string;
  createdAt: string;
}

interface ExpenseChartProps {
  expenses: Expense[];
}

export function ExpenseChart({ expenses }: ExpenseChartProps) {
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

  const typeColors = {
    'Логистика': '#3B82F6',
    'Реклама': '#A855F7',
    'ФОТ': '#F97316',
    'Прочее': '#6B7280',
    'Закупка товара': '#10B981'
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-border shadow-xl p-3 sm:p-4 lg:p-5 xl:p-6">
      <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4">Динамика расходов</h3>
      <div style={{ height: 'clamp(240px, 40vh, 420px)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={chartData}
            role="img"
            aria-label="График динамики расходов по типам"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              tickFormatter={(value) => new Intl.NumberFormat('ru-RU', { 
                style: 'currency', 
                currency: 'RUB',
                minimumFractionDigits: 0
              }).format(value)}
            />
            <Tooltip 
              formatter={(value: number) => new Intl.NumberFormat('ru-RU', { 
                style: 'currency', 
                currency: 'RUB' 
              }).format(value)}
              labelFormatter={(label) => new Date(label).toLocaleDateString('ru-RU')}
            />
            {Object.entries(typeColors).map(([type, color]) => (
              <Area
                key={type}
                type="monotone"
                dataKey={type}
                stackId="1"
                stroke={color}
                fill={color}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}