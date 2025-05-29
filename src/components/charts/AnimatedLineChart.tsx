import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  TooltipProps,
  LegendProps,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedLineChartProps {
  data: any[];
  lines: {
    dataKey: string;
    stroke: string;
    name: string;
    strokeWidth?: number;
  }[];
  xDataKey: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  animationDuration?: number;
  formatTooltip?: (value: any, name: string) => string;
  formatXAxis?: (value: any) => string;
  formatYAxis?: (value: any) => string;
}

const CustomTooltip = ({ active, payload, label, formatTooltip }: TooltipProps<number, string> & { formatTooltip?: (value: any, name: string) => string }) => {
  if (active && payload && payload.length) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-slate-800 px-4 py-3 rounded-xl shadow-xl border border-border/50"
        >
          <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatTooltip ? formatTooltip(entry.value, entry.name!) : entry.value?.toLocaleString()}
            </p>
          ))}
        </motion.div>
      </AnimatePresence>
    );
  }
  return null;
};

const CustomLegend = (props: LegendProps) => {
  const { payload } = props;
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap gap-4 justify-center mt-4">
      {payload?.map((entry, index) => (
        <motion.div
          key={`item-${index}`}
          className="flex items-center gap-2 cursor-pointer"
          onHoverStart={() => setHoveredItem(entry.value)}
          onHoverEnd={() => setHoveredItem(null)}
          animate={{
            scale: hoveredItem === entry.value ? 1.05 : 1,
            opacity: hoveredItem && hoveredItem !== entry.value ? 0.5 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">
            {entry.value}
          </span>
        </motion.div>
      ))}
    </div>
  );
};

export function AnimatedLineChart({
  data,
  lines,
  xDataKey,
  height,
  showGrid = true,
  showLegend = true,
  animationDuration = 1500,
  formatTooltip,
  formatXAxis,
  formatYAxis,
}: AnimatedLineChartProps) {
  const [isAnimating, setIsAnimating] = useState(true);
  const [visibleLines, setVisibleLines] = useState<Set<string>>(new Set(lines.map(l => l.dataKey)));
  const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!shouldReduceMotion) {
      const timer = setTimeout(() => setIsAnimating(false), animationDuration);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [animationDuration, shouldReduceMotion]);

  const toggleLine = (dataKey: string) => {
    setVisibleLines(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dataKey)) {
        newSet.delete(dataKey);
      } else {
        newSet.add(dataKey);
      }
      return newSet;
    });
  };

  return (
    <div style={{ width: '100%', height: height || 'clamp(240px, 40vh, 420px)' }} className="relative">
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              className="opacity-30"
              stroke="currentColor"
            />
          )}
          <XAxis
            dataKey={xDataKey}
            tick={{ fontSize: 12 }}
            tickFormatter={formatXAxis}
            className="text-slate-600 dark:text-slate-400"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={formatYAxis}
            className="text-slate-600 dark:text-slate-400"
          />
          <Tooltip
            content={<CustomTooltip formatTooltip={formatTooltip} />}
            cursor={{ stroke: 'rgba(148, 163, 184, 0.3)', strokeWidth: 1 }}
          />
          {lines.map((line, index) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.stroke}
              strokeWidth={line.strokeWidth || 2}
              name={line.name}
              dot={false}
              activeDot={{
                r: 6,
                onMouseEnter: (e: any) => {
                  e.target.style.r = 8;
                  e.target.style.transition = 'all 0.2s ease';
                },
                onMouseLeave: (e: any) => {
                  e.target.style.r = 6;
                }
              }}
              hide={!visibleLines.has(line.dataKey)}
              strokeDasharray={isAnimating && !shouldReduceMotion ? "1000 1000" : "0"}
              strokeDashoffset={isAnimating && !shouldReduceMotion ? 1000 : 0}
              style={{
                animation: isAnimating && !shouldReduceMotion
                  ? `drawLine ${animationDuration}ms ease-out forwards`
                  : 'none',
                animationDelay: `${index * 200}ms`,
                transition: 'opacity 0.3s ease',
                opacity: visibleLines.has(line.dataKey) ? 1 : 0,
              }}
            />
          ))}
          {showLegend && (
            <Legend
              content={<CustomLegend />}
              onClick={(e) => toggleLine(e.dataKey as string)}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      <style>{`
        @keyframes drawLine {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
} 