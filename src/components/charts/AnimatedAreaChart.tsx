import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export interface AnimatedAreaChartProps {
  data: any[];
  height: number;
  keys: string[];
  index: string;
  colors: string[];
  legends: string[];
}

export function AnimatedAreaChart({ data, height, keys, index, colors, legends }: AnimatedAreaChartProps) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            {colors.map((color, i) => (
              <linearGradient key={i} id={`color${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0.1} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={index} />
          <YAxis />
          <Tooltip />
          {keys.map((key, i) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              name={legends[i]}
              stroke={colors[i]}
              fillOpacity={1}
              fill={`url(#color${i})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
} 