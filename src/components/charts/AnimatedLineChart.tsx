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

export interface AnimatedLineChartProps {
  data: any[];
  height: number;
  index: string;
  keys: string[];
  colors: string[];
  legends: string[];
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

export function AnimatedLineChart({ data, height, index, keys, colors, legends }: AnimatedLineChartProps) {
  const [isAnimating, setIsAnimating] = useState(true);
  const [visibleLines, setVisibleLines] = useState<Set<string>>(new Set(keys));
  const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!shouldReduceMotion) {
      const timer = setTimeout(() => setIsAnimating(false), 1500);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [shouldReduceMotion]);

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
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={index} />
          <YAxis />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: 'rgba(148, 163, 184, 0.3)', strokeWidth: 1 }}
          />
          {keys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={legends[i]}
              stroke={colors[i]}
              strokeWidth={2}
              dot={{ r: 4, fill: colors[i] }}
              activeDot={{ r: 6 }}
              hide={!visibleLines.has(key)}
              strokeDasharray={isAnimating && !shouldReduceMotion ? "1000 1000" : "0"}
              strokeDashoffset={isAnimating && !shouldReduceMotion ? 1000 : 0}
              style={{
                animation: isAnimating && !shouldReduceMotion
                  ? `drawLine 1500ms ease-out forwards`
                  : 'none',
                animationDelay: `${i * 200}ms`,
                transition: 'opacity 0.3s ease',
                opacity: visibleLines.has(key) ? 1 : 0,
              }}
            />
          ))}
          <Legend
            content={<CustomLegend />}
            onClick={(e) => toggleLine(e.dataKey as string)}
          />
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