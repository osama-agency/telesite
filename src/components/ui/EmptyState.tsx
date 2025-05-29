import React from 'react';
import { Package2, Search, Filter, Database } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  message: string;
  icon?: React.ElementType;
  action?: {
    label: string;
    onClick: () => void;
  };
  type?: 'default' | 'search' | 'filter' | 'error';
}

export function EmptyState({
  message,
  icon,
  action,
  type = 'default'
}: EmptyStateProps) {
  const iconMap = {
    default: Package2,
    search: Search,
    filter: Filter,
    error: Database
  };
  
  const Icon = icon || iconMap[type];
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center p-8 sm:p-12 space-y-4 min-h-[300px] sm:min-h-[400px]"
    >
      <motion.div 
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ 
          delay: 0.1,
          type: "spring",
          stiffness: 200,
          damping: 15
        }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-2xl" />
        <div className="relative rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 p-6 sm:p-8">
          <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center space-y-2 max-w-sm"
      >
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          {message}
        </p>
      </motion.div>
      
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button 
            onClick={action.onClick} 
            className="btn-primary group"
          >
            <span>{action.label}</span>
            <motion.span
              className="inline-block ml-2"
              animate={{ x: [0, 3, 0] }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.5,
                ease: "easeInOut"
              }}
            >
              →
            </motion.span>
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}