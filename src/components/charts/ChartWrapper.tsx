import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ChartWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  className?: string;
  delay?: number;
}

export function ChartWrapper({
  children,
  title,
  subtitle,
  icon,
  loading = false,
  error = null,
  className = '',
  delay = 0,
}: ChartWrapperProps) {
  const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const containerVariants = {
    hidden: { 
      opacity: 0, 
      y: shouldReduceMotion ? 0 : 30,
      scale: shouldReduceMotion ? 1 : 0.96
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0.2 : 0.6,
        delay: shouldReduceMotion ? 0 : delay,
        ease: [0.25, 0.1, 0.25, 1.0]
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ 
        y: shouldReduceMotion ? 0 : -2,
        transition: { duration: 0.2 }
      }}
      className={`
        chart-wrapper group relative container-query
        bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl
        rounded-2xl lg:rounded-3xl border border-border/50
        shadow-lg hover:shadow-xl hover:shadow-primary/5
        transition-all duration-300 ease-out
        overflow-hidden
        ${className}
      `}
    >
      {/* Header section with improved responsive design */}
      {(title || subtitle || icon) && (
        <motion.div 
          variants={contentVariants}
          className="chart-header px-3 sm:px-4 lg:px-5 xl:px-6 cq:px-4 cq:px-5 cq:px-6 pt-3 sm:pt-4 lg:pt-5 xl:pt-6 cq:py-4 cq:py-5 cq:py-6 pb-2 sm:pb-3 lg:pb-4"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            {/* Icon container */}
            {icon && (
              <div className="flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                {icon}
              </div>
            )}
            
            {/* Title and subtitle container */}
            <div className="flex-1 min-w-0 space-y-1">
              {title && (
                <h3 className="chart-title font-semibold text-slate-900 dark:text-white text-responsive-lg cq:text-base cq:text-lg cq:text-xl leading-tight truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="chart-subtitle text-muted-foreground text-responsive-sm cq:text-base leading-relaxed line-clamp-2">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Content area with responsive padding */}
      <div className="chart-content px-3 sm:px-4 lg:px-5 xl:px-6 cq:px-4 cq:px-5 cq:px-6 pb-3 sm:pb-4 lg:pb-5 xl:pb-6 cq:py-4 cq:py-5 cq:py-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="loading-state flex flex-col items-center justify-center space-y-4"
              style={{ height: 'clamp(240px, 40vh, 420px)' }}
            >
              <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-primary" />
              <p className="text-sm sm:text-base text-muted-foreground">Загрузка данных...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="error-state flex flex-col items-center justify-center space-y-4 text-center"
              style={{ height: 'clamp(240px, 40vh, 420px)' }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="space-y-2">
                <p className="text-sm sm:text-base font-medium text-destructive">Ошибка загрузки</p>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed">{error}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="chart-content-wrapper"
            >
              {/* Content with overflow handling for mobile */}
              <div className="chart-scroll-container overflow-x-auto overflow-y-hidden">
                <div className="chart-inner min-w-full">
                  {children}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subtle gradient overlay for enhanced depth */}
      <div className="absolute inset-0 rounded-2xl lg:rounded-3xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Enhanced focus indicator */}
      <div className="absolute inset-0 rounded-2xl lg:rounded-3xl ring-2 ring-transparent group-focus-within:ring-primary/30 transition-all duration-200 pointer-events-none" />
    </motion.div>
  );
} 