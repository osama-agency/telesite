import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  TooltipProps,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedAreaChartProps {
  data: any[];
  areas: {
    dataKey: string;
    stroke: string;
    fill: string;
    name: string;
    strokeWidth?: number;
    stackId?: string;
  }[];
  xDataKey: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  animationDuration?: number;
  formatTooltip?: (value: any, name: string) => string;
  formatXAxis?: (value: any) => string;
  formatYAxis?: (value: any) => string;
  gradients?: {
    id: string;
    startColor: string;
    endColor: string;
    startOpacity?: number;
    endOpacity?: number;
  }[];
}

const CustomTooltip = ({ active, payload, label, formatTooltip }: TooltipProps<number, string> & { formatTooltip?: (value: any, name: string) => string }) => {
  if (active && payload && payload.length) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-4 py-3 rounded-xl shadow-xl border border-border/50"
        >
          <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <motion.p
              key={index}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="text-sm flex items-center gap-2"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-700 dark:text-slate-300">
                {entry.name}: {formatTooltip ? formatTooltip(entry.value, entry.name!) : `₽${entry.value?.toLocaleString()}`}
              </span>
            </motion.p>
          ))}
        </motion.div>
      </AnimatePresence>
    );
  }
  return null;
};

export function AnimatedAreaChart({
  data,
  areas,
  xDataKey,
  height,
  showGrid = true,
  showLegend = true,
  animationDuration = 1500,
  formatTooltip,
  formatXAxis,
  formatYAxis,
  gradients = [],
}: AnimatedAreaChartProps) {
  const [animationComplete, setAnimationComplete] = useState(false);
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);
  const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!shouldReduceMotion) {
      const timer = setTimeout(() => setAnimationComplete(true), animationDuration);
      return () => clearTimeout(timer);
    } else {
      setAnimationComplete(true);
    }
  }, [animationDuration, shouldReduceMotion]);

  return (
    <div style={{ width: '100%', height: height || 'clamp(240px, 40vh, 420px)' }} className="relative">
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          onMouseLeave={() => setHoveredArea(null)}
        >
          <defs>
            {gradients.map((gradient) => (
              <linearGradient key={gradient.id} id={gradient.id} x1="0" y1="0" x2="0" y2="1">
                <stop 
                  offset="5%" 
                  stopColor={gradient.startColor} 
                  stopOpacity={gradient.startOpacity || 0.8}
                />
                <stop 
                  offset="95%" 
                  stopColor={gradient.endColor} 
                  stopOpacity={gradient.endOpacity || 0.1}
                />
              </linearGradient>
            ))}
          </defs>
          
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              className="opacity-20"
              stroke="currentColor"
              strokeWidth={0.5}
            />
          )}
          
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
          
          <Tooltip
            content={<CustomTooltip formatTooltip={formatTooltip} />}
            cursor={{ 
              stroke: 'rgba(148, 163, 184, 0.2)', 
              strokeWidth: 1,
              strokeDasharray: '5 5'
            }}
          />
          
          {areas.map((area, index) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              stackId={area.stackId}
              stroke={area.stroke}
              strokeWidth={hoveredArea === area.dataKey ? 3 : area.strokeWidth || 2}
              fill={area.fill}
              name={area.name}
              onMouseEnter={() => setHoveredArea(area.dataKey)}
              style={{
                filter: hoveredArea && hoveredArea !== area.dataKey ? 'brightness(0.7)' : 'none',
                transition: 'all 0.3s ease',
                opacity: animationComplete || shouldReduceMotion ? 1 : 0,
                animation: !shouldReduceMotion ? `fadeInArea ${animationDuration}ms ease-out forwards` : 'none',
                animationDelay: `${index * 200}ms`,
              }}
            />
          ))}
          
          {showLegend && (
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
              }}
              iconType="rect"
              iconSize={12}
              formatter={(value: string) => (
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {value}
                </span>
              )}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
      
      <style>{`
        @keyframes fadeInArea {
          from {
            opacity: 0;
            transform: scaleY(0.8);
            transform-origin: bottom;
          }
          to {
            opacity: 1;
            transform: scaleY(1);
          }
        }
      `}</style>
    </div>
  );
} 