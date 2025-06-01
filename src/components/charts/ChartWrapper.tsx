import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
  loading?: boolean;
  error?: string;
  className?: string;
}

export function ChartWrapper({
  title,
  subtitle,
  icon,
  children,
  action,
  loading = false,
  error,
  className = ''
}: ChartWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        w-full min-w-0 glass glass-border rounded-xl sm:rounded-2xl
        shadow-sm hover:shadow-lg transition-all duration-300
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 sm:p-5 lg:p-6 border-b border-border/50">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 sm:gap-3">
            {icon && (
              <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                {icon}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-foreground truncate">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-1 truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 lg:p-6">
        {loading ? (
          <div className="flex items-center justify-center h-48 sm:h-64 lg:h-80">
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-primary"></div>
              <p className="text-sm sm:text-base text-muted-foreground">Загрузка...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-48 sm:h-64 lg:h-80">
            <div className="text-center">
              <div className="text-red-500 mb-2 sm:mb-3">
                <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-sm sm:text-base text-red-600 dark:text-red-400 font-medium mb-1 sm:mb-2">Ошибка загрузки</p>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">{error}</p>
            </div>
          </div>
        ) : (
          <div className="w-full overflow-hidden">
            {children}
          </div>
        )}
      </div>
    </motion.div>
  );
} 