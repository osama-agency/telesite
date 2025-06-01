import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon?: LucideIcon;
  loading?: boolean;
  variant?: 'default' | 'gradient' | 'outline' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  suffix?: string;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  sparkline?: number[];
  onClick?: () => void;
}

const colorVariants = {
  primary: {
    gradient: 'from-blue-500/10 to-indigo-500/10',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200/50 dark:border-blue-800/50',
    changePositive: 'text-emerald-600 dark:text-emerald-400',
    changeNegative: 'text-red-600 dark:text-red-400'
  },
  success: {
    gradient: 'from-emerald-500/10 to-green-500/10',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200/50 dark:border-emerald-800/50',
    changePositive: 'text-emerald-600 dark:text-emerald-400',
    changeNegative: 'text-red-600 dark:text-red-400'
  },
  warning: {
    gradient: 'from-amber-500/10 to-yellow-500/10',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200/50 dark:border-amber-800/50',
    changePositive: 'text-emerald-600 dark:text-emerald-400',
    changeNegative: 'text-red-600 dark:text-red-400'
  },
  danger: {
    gradient: 'from-red-500/10 to-rose-500/10',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-600 dark:text-red-400',
    border: 'border-red-200/50 dark:border-red-800/50',
    changePositive: 'text-emerald-600 dark:text-emerald-400',
    changeNegative: 'text-red-600 dark:text-red-400'
  },
  info: {
    gradient: 'from-cyan-500/10 to-blue-500/10',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-200/50 dark:border-cyan-800/50',
    changePositive: 'text-emerald-600 dark:text-emerald-400',
    changeNegative: 'text-red-600 dark:text-red-400'
  }
};

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  loading = false,
  variant = 'default',
  size = 'md',
  color = 'primary',
  suffix,
  description,
  trend,
  sparkline,
  onClick
}: StatCardProps) {
  const colorConfig = colorVariants[color];
  
  // Responsive size configurations
  const sizeConfig = {
    sm: {
      padding: 'p-3 sm:p-4',
      iconSize: 'h-4 w-4 sm:h-5 sm:w-5',
      titleSize: 'text-xs sm:text-sm',
      valueSize: 'text-lg sm:text-xl',
      changeSize: 'text-[10px] sm:text-xs'
    },
    md: {
      padding: 'p-4 sm:p-5 lg:p-6',
      iconSize: 'h-5 w-5 sm:h-6 sm:w-6',
      titleSize: 'text-xs sm:text-sm',
      valueSize: 'text-xl sm:text-2xl lg:text-3xl',
      changeSize: 'text-xs sm:text-sm'
    },
    lg: {
      padding: 'p-5 sm:p-6 lg:p-8',
      iconSize: 'h-6 w-6 sm:h-7 sm:w-7',
      titleSize: 'text-sm sm:text-base',
      valueSize: 'text-2xl sm:text-3xl lg:text-4xl',
      changeSize: 'text-sm sm:text-base'
    }
  };

  const config = sizeConfig[size];

  // Trend icon component
  const TrendIcon = () => {
    if (!change && !trend) return null;
    
    let TrendComponent = Minus;
    let trendColor = 'text-muted-foreground';
    
    const isPositive = change?.isPositive ?? (trend === 'up');
    const isNegative = change ? !change.isPositive : (trend === 'down');
    
    if (isPositive) {
      TrendComponent = TrendingUp;
      trendColor = 'text-emerald-600 dark:text-emerald-400';
    } else if (isNegative) {
      TrendComponent = TrendingDown;
      trendColor = 'text-red-600 dark:text-red-400';
    }
    
    return <TrendComponent className={`h-3 w-3 sm:h-4 sm:w-4 ${trendColor}`} />;
  };

  // Sparkline component
  const SparklineChart = ({ data }: { data: number[] }) => {
    if (!data || data.length === 0) return null;
    
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = range === 0 ? 50 : 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');
    
    const isPositiveTrend = data[data.length - 1] > data[0];
    
    return (
      <div className="absolute bottom-0 right-0 w-12 h-6 sm:w-16 sm:h-8 opacity-20 sm:opacity-30">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke={isPositiveTrend ? '#10b981' : '#ef4444'}
            strokeWidth="2"
            points={points}
            className="drop-shadow-sm"
          />
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isPositiveTrend ? '#10b981' : '#ef4444'} stopOpacity="0.3"/>
              <stop offset="100%" stopColor={isPositiveTrend ? '#10b981' : '#ef4444'} stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          <polygon
            fill={`url(#gradient-${color})`}
            points={`0,100 ${points} 100,100`}
          />
        </svg>
      </div>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={`
        glass rounded-xl sm:rounded-2xl ${config.padding} animate-pulse
      `}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-3 w-16 sm:h-4 sm:w-20 rounded bg-muted/50" />
            <div className="h-5 w-5 rounded bg-muted/50" />
          </div>
          <div className="h-6 w-20 sm:h-8 sm:w-24 rounded bg-muted/50" />
          <div className="h-3 w-14 sm:w-16 rounded bg-muted/50" />
        </div>
      </div>
    );
  }

  // Base card classes
  const baseClasses = `
    relative overflow-hidden transition-all duration-300 ${config.padding}
    ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''}
  `;

  // Variant-specific classes
  const variantClasses = {
    default: `
      glass glass-border rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md
    `,
    gradient: `
      bg-gradient-to-br ${colorConfig.gradient} backdrop-blur-xl
      rounded-xl sm:rounded-2xl border ${colorConfig.border}
      shadow-sm hover:shadow-lg hover:shadow-primary/10
    `,
    outline: `
      bg-transparent rounded-xl sm:rounded-2xl 
      border-2 ${colorConfig.border} hover:${colorConfig.iconBg}
    `,
    minimal: `
      bg-transparent rounded-lg hover:bg-muted/30
      border-0
    `
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={onClick}
      whileHover={onClick ? { y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      {/* Background decoration */}
      {variant === 'gradient' && (
        <div className="absolute inset-0 opacity-30">
          <div className={`absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-bl ${colorConfig.gradient} blur-3xl`} />
        </div>
      )}

      {/* Sparkline */}
      {sparkline && <SparklineChart data={sparkline} />}
      
      <div className="relative z-10 space-y-2 sm:space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <motion.h3 
            className={`${config.titleSize} font-medium text-muted-foreground leading-tight`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {title}
          </motion.h3>
          
          {Icon && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className={`
                flex-shrink-0 p-2 rounded-lg ${colorConfig.iconBg}
              `}
            >
              <Icon className={`${config.iconSize} ${colorConfig.iconColor}`} />
            </motion.div>
          )}
        </div>

        {/* Value */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
          className="space-y-1"
        >
          <div className={`${config.valueSize} font-bold text-foreground leading-tight flex items-baseline gap-1`}>
            <span className="tabular-nums">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            {suffix && <span className="text-muted-foreground text-xs sm:text-sm font-normal">{suffix}</span>}
          </div>
          
          {description && (
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </motion.div>

        {/* Change indicator */}
        {change && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-1"
          >
            <TrendIcon />
            <span className={`
              ${config.changeSize} font-medium tabular-nums
              ${change.isPositive 
                ? colorConfig.changePositive 
                : colorConfig.changeNegative
              }
            `}>
              {Math.abs(change.value)}%
            </span>
            <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">
              vs прошлый период
            </span>
          </motion.div>
        )}

        {/* Progress bar for values with known max */}
        {variant === 'gradient' && typeof value === 'number' && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            className="h-0.5 sm:h-1 bg-gradient-to-r from-primary/20 to-primary rounded-full overflow-hidden"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '75%' }} // Mock progress
              transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
              className="h-full bg-primary rounded-full"
            />
          </motion.div>
        )}
      </div>

      {/* Hover overlay */}
      {onClick && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl"
          initial={false}
        />
      )}
    </motion.div>
  );
} 