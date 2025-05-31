import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export interface AnimatedPieChartProps {
  data: Array<{ id: string; label: string; value: number }>;
  height: number;
  colors: string[];
  onItemClick?: (item: any) => void;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-4 py-3 rounded-xl shadow-xl border border-border/50">
        <p className="text-sm font-medium text-slate-900 dark:text-white">{payload[0].name}</p>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export function AnimatedPieChart({ data, height, colors, onItemClick }: AnimatedPieChartProps) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="label"
            onClick={onItemClick}
          >
            {data.map((entry, index) => (
              <Cell key={entry.id} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
} 