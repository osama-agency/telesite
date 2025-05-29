import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  delay?: number;
  compact?: boolean;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend,
  color = 'primary',
  delay = 0,
  compact = false
}: StatCardProps) {
  const colorClasses = {
    primary: 'from-primary/10 to-purple-500/10 border-primary/20 text-primary',
    success: 'from-emerald-500/10 to-green-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    warning: 'from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
    danger: 'from-red-500/10 to-rose-500/10 border-red-500/20 text-red-600 dark:text-red-400',
    info: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
  };
  
  const iconBgClasses = {
    primary: 'bg-gradient-to-br from-primary to-purple-500',
    success: 'bg-gradient-to-br from-emerald-500 to-green-500',
    warning: 'bg-gradient-to-br from-amber-500 to-orange-500',
    danger: 'bg-gradient-to-br from-red-500 to-rose-500',
    info: 'bg-gradient-to-br from-blue-500 to-cyan-500'
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay,
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={{ 
        scale: compact ? 1.02 : 1.03,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      className={`
        stat-card group relative overflow-hidden
        rounded-2xl lg:rounded-3xl border bg-gradient-to-br
        ${colorClasses[color]}
        backdrop-blur-xl shadow-lg hover:shadow-xl
        transition-all duration-300 ease-out
        ${compact ? 'p-4 sm:p-5 lg:p-6' : 'p-5 sm:p-6 lg:p-7'}
        cursor-pointer touch-target
      `}
    >
      {/* Background decoration with enhanced responsiveness */}
      <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-lg lg:blur-2xl transform translate-x-6 sm:translate-x-12 lg:translate-x-16 -translate-y-6 sm:-translate-y-12 lg:-translate-y-16 transition-all duration-500 group-hover:scale-110" />
      
      {/* Content container with improved spacing */}
      <div className={`
        relative flex items-start justify-between gap-3 sm:gap-4 lg:gap-5
        ${compact ? 'flex-row' : 'flex-col sm:flex-row'}
      `}>
        
        {/* Text content with responsive typography */}
        <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
          <p className={`
            font-medium text-muted-foreground truncate
            ${compact 
              ? 'text-responsive-card-title' 
              : 'text-xs sm:text-sm lg:text-base'
            }
          `}>
            {title}
          </p>
          
          <div className={`
            font-bold leading-tight text-slate-900 dark:text-white
            ${compact 
              ? 'text-responsive-card-value' 
              : 'text-lg sm:text-xl lg:text-2xl xl:text-3xl'
            }
          `}>
            {typeof value === 'string' && value.length > 15 
              ? (
                <span className="break-words hyphens-auto" lang="ru">
                  {value}
                </span>
              )
              : (
                <span className="tabular-nums">
                  {value}
                </span>
              )
            }
          </div>
          
          {description && (
            <p className={`
              text-muted-foreground leading-relaxed
              ${compact 
                ? 'text-xs line-clamp-2 sm:line-clamp-1 lg:line-clamp-2' 
                : 'text-xs sm:text-sm line-clamp-2'
              }
            `}>
              {description}
            </p>
          )}
          
          {trend && (
            <div className={`
              flex items-center gap-1.5 flex-wrap
              ${compact ? 'mt-1.5 sm:mt-2' : 'mt-2 sm:mt-3'}
            `}>
              <span className={`
                font-semibold tabular-nums
                ${compact ? 'text-xs sm:text-sm' : 'text-sm lg:text-base'}
                ${trend.isPositive 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-red-600 dark:text-red-400'
                }
              `}>
                {trend.isPositive ? '↗' : '↘'} {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className={`
                text-muted-foreground
                ${compact 
                  ? 'text-xs hidden sm:inline lg:hidden xl:inline' 
                  : 'text-xs sm:text-sm'
                }
              `}>
                vs прошлый период
              </span>
            </div>
          )}
        </div>
        
        {/* Icon container with improved sizing */}
        <div className={`
          ${iconBgClasses[color]}
          flex-shrink-0 flex items-center justify-center
          rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl
          transition-all duration-300 ease-out
          group-hover:scale-105 group-hover:rotate-3
          ${compact 
            ? 'w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14' 
            : 'w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16'
          }
          ${!compact ? 'sm:order-first sm:self-start' : ''}
        `}>
          <Icon className={`
            text-white drop-shadow-sm
            ${compact 
              ? 'h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7' 
              : 'h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8'
            }
          `} />
        </div>
      </div>
      
      {/* Enhanced focus indicator */}
      <div className="absolute inset-0 rounded-2xl lg:rounded-3xl ring-2 ring-transparent group-focus-within:ring-primary/30 transition-all duration-200" />
    </motion.div>
  );
} 