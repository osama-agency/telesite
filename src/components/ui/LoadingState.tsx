import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

export function LoadingState({ 
  message = 'Загрузка данных...', 
  size = 'md',
  fullPage = false 
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };
  
  const containerClasses = fullPage 
    ? 'fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/50 dark:bg-slate-950/50 z-50' 
    : 'flex flex-col items-center justify-center p-8 sm:p-12 space-y-4 min-h-[300px] sm:min-h-[400px]';
  
  return (
    <div className={containerClasses}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center space-y-4"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <Loader2 className={`${sizeClasses[size]} text-primary`} />
          </motion.div>
          <div className={`absolute inset-0 ${sizeClasses[size]} bg-primary/20 blur-xl`} />
        </div>
        
        {message && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base text-muted-foreground text-center"
          >
            {message}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}