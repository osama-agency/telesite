import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  TooltipProps,
  Sector,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedPieChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  colors?: string[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLabel?: boolean;
  showLegend?: boolean;
  animationDuration?: number;
  formatTooltip?: (value: any, name: string) => string;
  formatLabel?: (value: any, percentage: number) => string;
}

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6B7280', '#EC4899', '#14B8A6'];

const CustomTooltip = ({ active, payload, formatTooltip }: TooltipProps<number, string> & { formatTooltip?: (value: any, name: string) => string }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-4 py-3 rounded-xl shadow-xl border border-border/50"
        >
          <p className="text-sm font-medium text-slate-900 dark:text-white">{data.name}</p>
          <p className="text-lg font-semibold mt-1" style={{ color: data.payload.fill }}>
            {formatTooltip ? formatTooltip(data.value, data.name!) : data.value?.toLocaleString()}
          </p>
          {(data as any).percent !== undefined && (
            <p className="text-xs text-muted-foreground mt-1">
              {((data as any).percent * 100).toFixed(1)}% от общего
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }
  return null;
};

const renderActiveShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, value, percent, formatTooltip
  } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{
          filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
          transition: 'all 0.3s ease',
        }}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 5}
        outerRadius={innerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.3}
      />
    </g>
  );
};

export function AnimatedPieChart({
  data,
  dataKey,
  nameKey,
  colors = COLORS,
  height,
  innerRadius = 0,
  outerRadius = 80,
  showLabel = true,
  showLegend = true,
  animationDuration = 1500,
  formatTooltip,
  formatLabel,
}: AnimatedPieChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [animatedData, setAnimatedData] = useState(data.map(item => ({ ...item, [dataKey]: 0 })));
  const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (shouldReduceMotion) {
      setAnimatedData(data);
      return;
    }

    // Animate data in with staggered timing
    data.forEach((item, index) => {
      setTimeout(() => {
        setAnimatedData(prev => {
          const newData = [...prev];
          newData[index] = item;
          return newData;
        });
      }, index * 100);
    });
  }, [data, dataKey, shouldReduceMotion]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  const renderLabel = ({ value, percent, name }: any) => {
    if (!showLabel) return null;
    if (formatLabel) return formatLabel(value, percent * 100);
    return `${(percent * 100).toFixed(0)}%`;
  };

  // Custom tooltip with data context
  const CustomTooltipWithData = (props: TooltipProps<number, string>) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      const tooltipData = payload[0];
      const total = data.reduce((sum, item) => sum + (item[dataKey] || 0), 0);
      const percentage = total > 0 ? ((tooltipData.value || 0) / total) * 100 : 0;
      
      return (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-4 py-3 rounded-xl shadow-xl border border-border/50"
          >
            <p className="text-sm font-medium text-slate-900 dark:text-white">{tooltipData.name}</p>
            <p className="text-lg font-semibold mt-1" style={{ color: tooltipData.payload.fill }}>
              {formatTooltip ? formatTooltip(tooltipData.value, tooltipData.name!) : tooltipData.value?.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {percentage.toFixed(1)}% от общего
            </p>
          </motion.div>
        </AnimatePresence>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: height || 'clamp(240px, 40vh, 420px)' }} className="relative flex flex-col">
      <div className="flex-1" style={{ minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={animatedData}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              dataKey={dataKey}
              animationBegin={0}
              animationDuration={shouldReduceMotion ? 0 : animationDuration}
              animationEasing="ease-out"
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              label={renderLabel}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                  style={{
                    filter: activeIndex !== undefined && activeIndex !== index ? 'brightness(0.8)' : 'none',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltipWithData />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {showLegend && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-wrap gap-2 sm:gap-3 justify-center mt-4 px-2"
        >
          {data.map((entry, index) => {
            const total = data.reduce((sum, item) => sum + (item[dataKey] || 0), 0);
            const percentage = total > 0 ? ((entry[dataKey] || 0) / total) * 100 : 0;
            
            return (
              <motion.div
                key={entry[nameKey]}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-md sm:rounded-lg border border-border/30 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm cursor-pointer transition-all hover:scale-105 hover:shadow-md ${
                  activeIndex === index ? 'ring-2 ring-primary ring-offset-2' : ''
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
              >
                <div
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 truncate max-w-[100px] sm:max-w-none">
                  {entry[nameKey]}
                </span>
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  {percentage.toFixed(0)}%
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Animated background decoration - Commented out as it can be distracting */}
      {/* <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] opacity-5"
        >
          <div className="w-full h-full rounded-full border-2 border-dashed border-current" />
        </motion.div>
      </div> */}
    </div>
  );
} 