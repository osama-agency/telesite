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
  
  // Color schemes for different variants
  const colorSchemes = {
    primary: {
      gradient: 'from-blue-500/10 via-purple-500/10 to-blue-500/10',
      border: 'border-blue-200/50 dark:border-blue-800/50',
      icon: 'text-blue-600 dark:text-blue-400',
      accent: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50/50 dark:bg-blue-900/20'
    },
    success: {
      gradient: 'from-emerald-500/10 via-green-500/10 to-emerald-500/10',
      border: 'border-emerald-200/50 dark:border-emerald-800/50',
      icon: 'text-emerald-600 dark:text-emerald-400',
      accent: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50/50 dark:bg-emerald-900/20'
    },
    warning: {
      gradient: 'from-amber-500/10 via-yellow-500/10 to-amber-500/10',
      border: 'border-amber-200/50 dark:border-amber-800/50',
      icon: 'text-amber-600 dark:text-amber-400',
      accent: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50/50 dark:bg-amber-900/20'
    },
    danger: {
      gradient: 'from-red-500/10 via-pink-500/10 to-red-500/10',
      border: 'border-red-200/50 dark:border-red-800/50',
      icon: 'text-red-600 dark:text-red-400',
      accent: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50/50 dark:bg-red-900/20'
    },
    info: {
      gradient: 'from-cyan-500/10 via-sky-500/10 to-cyan-500/10',
      border: 'border-cyan-200/50 dark:border-cyan-800/50',
      icon: 'text-cyan-600 dark:text-cyan-400',
      accent: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-50/50 dark:bg-cyan-900/20'
    }
  };

  const scheme = colorSchemes[color];

  // Size configurations
  const sizeConfig = {
    sm: {
      padding: 'p-4',
      iconSize: 'h-5 w-5',
      titleSize: 'text-xs',
      valueSize: 'text-lg',
      changeSize: 'text-xs'
    },
    md: {
      padding: 'p-5 sm:p-6',
      iconSize: 'h-6 w-6',
      titleSize: 'text-sm',
      valueSize: 'text-xl sm:text-2xl',
      changeSize: 'text-sm'
    },
    lg: {
      padding: 'p-6 sm:p-8',
      iconSize: 'h-7 w-7',
      titleSize: 'text-base',
      valueSize: 'text-2xl sm:text-3xl',
      changeSize: 'text-base'
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
      <div className="absolute bottom-0 right-0 w-16 h-8 opacity-50">
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
        bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl 
        rounded-xl sm:rounded-2xl border border-border/50 
        ${config.padding} shadow-sm
      `}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="skeleton h-4 w-20 rounded-md" />
            <div className="skeleton h-5 w-5 rounded-md" />
          </div>
          <div className="skeleton h-8 w-24 rounded-md" />
          <div className="skeleton h-3 w-16 rounded-md" />
        </div>
      </div>
    );
  }

  // Base card classes
  const baseClasses = `
    relative overflow-hidden transition-all duration-300
    ${config.padding} shadow-sm hover:shadow-md
    ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''}
  `;

  // Variant-specific classes
  const variantClasses = {
    default: `
      bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl 
      rounded-xl sm:rounded-2xl border border-border/50
      hover:border-border/70
    `,
    gradient: `
      bg-gradient-to-br ${scheme.gradient} backdrop-blur-xl
      rounded-xl sm:rounded-2xl border ${scheme.border}
      hover:shadow-lg hover:shadow-primary/10
    `,
    outline: `
      bg-transparent rounded-xl sm:rounded-2xl 
      border-2 ${scheme.border} hover:${scheme.bg}
    `,
    minimal: `
      bg-transparent rounded-lg hover:bg-muted/50
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
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${scheme.gradient} blur-3xl`} />
        </div>
      )}

      {/* Sparkline */}
      {sparkline && <SparklineChart data={sparkline} />}
      
      <div className="relative z-10 space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
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
                ${config.iconSize} ${scheme.icon} flex-shrink-0
                p-2 rounded-lg ${scheme.bg}
              `}
            >
              <Icon className="w-full h-full" />
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
          <div className={`${config.valueSize} font-bold text-foreground leading-tight`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
            {suffix && <span className="text-muted-foreground text-sm ml-1">{suffix}</span>}
          </div>
          
          {description && (
            <p className="text-xs text-muted-foreground leading-relaxed">
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
            className="flex items-center space-x-1"
          >
            <TrendIcon />
            <span className={`
              ${config.changeSize} font-medium
              ${change.isPositive 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-red-600 dark:text-red-400'
              }
            `}>
              {Math.abs(change.value)}%
            </span>
            <span className="text-xs text-muted-foreground">vs прошлый период</span>
          </motion.div>
        )}

        {/* Progress bar for values with known max */}
        {variant === 'gradient' && typeof value === 'number' && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            className="h-1 bg-gradient-to-r from-primary/20 to-primary rounded-full overflow-hidden"
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
          className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300"
          initial={false}
        />
      )}
    </motion.div>
  );
} 