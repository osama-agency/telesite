import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
  Cell,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedBarChartProps {
  data: any[];
  bars: {
    dataKey: string;
    fill: string;
    name: string;
    radius?: [number, number, number, number];
  }[];
  xDataKey: string;
  height?: number;
  layout?: 'horizontal' | 'vertical';
  showGrid?: boolean;
  animationDuration?: number;
  staggerDelay?: number;
  formatTooltip?: (value: any, name: string) => string;
  formatXAxis?: (value: any) => string;
  formatYAxis?: (value: any) => string;
  maxBarSize?: number;
}

const CustomTooltip = ({ active, payload, label, formatTooltip }: TooltipProps<number, string> & { formatTooltip?: (value: any, name: string) => string }) => {
  if (active && payload && payload.length) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-4 py-3 rounded-xl shadow-xl border border-border/50"
        >
          <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">{label}</p>
          {payload.map((entry, index) => (
            <motion.div
              key={index}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-2 mt-1"
            >
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {formatTooltip ? formatTooltip(entry.value, entry.name!) : `₽${entry.value?.toLocaleString()}`}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    );
  }
  return null;
};

export function AnimatedBarChart({
  data,
  bars,
  xDataKey,
  height,
  layout = 'vertical',
  showGrid = true,
  animationDuration = 800,
  staggerDelay = 50,
  formatTooltip,
  formatXAxis,
  formatYAxis,
  maxBarSize = 60,
}: AnimatedBarChartProps) {
  const [animatedData, setAnimatedData] = useState(data.map(item => ({
    ...item,
    ...bars.reduce((acc, bar) => ({ ...acc, [bar.dataKey]: 0 }), {})
  })));
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (shouldReduceMotion) {
      setAnimatedData(data);
      return;
    }

    const animateData = () => {
      data.forEach((item, index) => {
        setTimeout(() => {
          setAnimatedData(prev => {
            const newData = [...prev];
            newData[index] = item;
            return newData;
          });
        }, index * staggerDelay);
      });
    };

    animateData();
  }, [data, staggerDelay, shouldReduceMotion]);

  return (
    <div style={{ width: '100%', height: height || 'clamp(240px, 40vh, 420px)' }} className="relative">
      <ResponsiveContainer>
        <BarChart
          data={animatedData}
          layout={layout}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              className="opacity-20"
              stroke="currentColor"
              strokeWidth={0.5}
            />
          )}
          
          {layout === 'vertical' ? (
            <>
              <XAxis
                dataKey={xDataKey}
                tick={{ fontSize: 12 }}
                tickFormatter={formatXAxis}
                className="text-slate-600 dark:text-slate-400"
                axisLine={{ strokeWidth: 0.5 }}
                tickLine={{ strokeWidth: 0.5 }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={formatYAxis || ((value) => `₽${value.toLocaleString()}`)}
                className="text-slate-600 dark:text-slate-400"
                axisLine={{ strokeWidth: 0.5 }}
                tickLine={{ strokeWidth: 0.5 }}
              />
            </>
          ) : (
            <>
              <XAxis
                type="number"
                tick={{ fontSize: 12 }}
                tickFormatter={formatXAxis || ((value) => `₽${value.toLocaleString()}`)}
                className="text-slate-600 dark:text-slate-400"
                axisLine={{ strokeWidth: 0.5 }}
                tickLine={{ strokeWidth: 0.5 }}
              />
              <YAxis
                dataKey={xDataKey}
                type="category"
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => {
                  const formattedValue = formatYAxis ? formatYAxis(value) : value;
                  if (formattedValue.length > 15) {
                    return formattedValue.substring(0, 15) + '...';
                  }
                  return formattedValue;
                }}
                className="text-slate-600 dark:text-slate-400"
                axisLine={{ strokeWidth: 0.5 }}
                tickLine={{ strokeWidth: 0.5 }}
                width={120}
              />
            </>
          )}
          
          <Tooltip
            content={<CustomTooltip formatTooltip={formatTooltip} />}
            cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
          />
          
          {bars.map((bar) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              fill={bar.fill}
              name={bar.name}
              radius={bar.radius || [4, 4, 0, 0]}
              maxBarSize={maxBarSize}
              animationDuration={shouldReduceMotion ? 0 : animationDuration}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={bar.fill}
                  style={{
                    filter: hoveredBar !== null && hoveredBar !== index ? 'brightness(0.7)' : 'none',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={() => setHoveredBar(index)}
                  onMouseLeave={() => setHoveredBar(null)}
                />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, currentColor 35px, currentColor 70px)`,
        }} />
      </div>
    </div>
  );
} 