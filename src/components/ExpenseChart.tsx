import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
interface Expense {
  id: string;
  date: string;
  type: 'logistics' | 'advertising' | 'courier' | 'payroll' | 'other';
  description: string;
  amount: number;
  productId?: string;
  productName?: string;
  createdAt: string;
}
interface ExpenseChartProps {
  expenses: Expense[];
}
export function ExpenseChart({
  expenses
}: ExpenseChartProps) {
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
  return;
}