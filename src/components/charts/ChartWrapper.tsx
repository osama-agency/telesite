import React from 'react';
import { motion } from 'framer-motion';

export interface ChartWrapperProps {
  children: React.ReactNode;
  title: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ChartWrapper({ children, title, icon, onClick, className = '' }: ChartWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`bg-card rounded-xl p-6 ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {icon && (
          <div className="rounded-full bg-primary/10 p-2">
            {icon}
          </div>
        )}
      </div>
      {children}
    </motion.div>
  );
} 