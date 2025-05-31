import React from 'react';
import { motion } from 'framer-motion';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
  type?: 'products' | 'orders' | 'customers' | 'analytics' | 'default';
  showHeader?: boolean;
  variant?: 'default' | 'card' | 'list' | 'compact';
  animated?: boolean;
}

export function TableSkeleton({ 
  rows = 5, 
  columns = 8, 
  className = '',
  type = 'default',
  showHeader = true,
  variant = 'default',
  animated = true
}: TableSkeletonProps) {

  // Column width patterns for different table types
  const columnPatterns = {
    products: [
      { width: '20%', priority: 'high' },    // Product name
      { width: '12%', priority: 'medium' },  // Price
      { width: '12%', priority: 'medium' },  // Cost
      { width: '10%', priority: 'low' },     // Stock
      { width: '15%', priority: 'low' },     // Profit
      { width: '12%', priority: 'low' },     // Margin
      { width: '10%', priority: 'low' },     // Status
      { width: '9%', priority: 'low' }       // Actions
    ],
    orders: [
      { width: '15%', priority: 'high' },    // Order ID
      { width: '20%', priority: 'high' },    // Customer
      { width: '15%', priority: 'medium' },  // Date
      { width: '12%', priority: 'medium' },  // Amount
      { width: '15%', priority: 'medium' },  // Products
      { width: '10%', priority: 'low' },     // Status
      { width: '8%', priority: 'low' },      // Priority
      { width: '5%', priority: 'low' }       // Actions
    ],
    customers: [
      { width: '25%', priority: 'high' },    // Name
      { width: '20%', priority: 'high' },    // Email
      { width: '15%', priority: 'medium' },  // Phone
      { width: '15%', priority: 'medium' },  // Orders
      { width: '12%', priority: 'low' },     // Total spent
      { width: '8%', priority: 'low' },      // Status
      { width: '5%', priority: 'low' }       // Actions
    ],
    analytics: [
      { width: '20%', priority: 'high' },    // Metric
      { width: '15%', priority: 'high' },    // Value
      { width: '15%', priority: 'medium' },  // Change
      { width: '20%', priority: 'medium' },  // Trend
      { width: '15%', priority: 'low' },     // Period
      { width: '15%', priority: 'low' }      // Details
    ],
    default: Array.from({ length: columns }, (_, i) => ({
      width: `${Math.max(8, 100 / columns)}%`,
      priority: i < 2 ? 'high' : i < 4 ? 'medium' : 'low'
    }))
  };

  const pattern = columnPatterns[type] || columnPatterns.default;

  // Responsive column visibility
  const getVisibleColumns = () => {
    return pattern.map((col, index) => ({
      ...col,
      visible: {
        mobile: col.priority === 'high',
        tablet: col.priority !== 'low',
        desktop: true
      }
    }));
  };

  const visibleColumns = getVisibleColumns();

  // Header skeleton
  const HeaderSkeleton = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="border-b border-border/30 bg-muted/20"
    >
      <div className="px-4 sm:px-6 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-4 items-center">
          {visibleColumns.slice(0, 8).map((col, index) => (
            <div
              key={index}
              className={`
                skeleton h-4 rounded-md
                ${!col.visible.mobile ? 'hidden sm:block' : ''}
                ${!col.visible.tablet ? 'hidden lg:block' : ''}
              `}
              style={{
                width: '80%',
                animationDelay: animated ? `${index * 0.1}s` : '0s'
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );

  // Card variant skeleton
  const CardSkeleton = ({ index }: { index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: animated ? index * 0.05 : 0,
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 rounded-xl p-4 sm:p-6 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="skeleton h-5 rounded-md" style={{ width: '40%' }} />
        <div className="skeleton h-6 w-16 rounded-full" />
      </div>
      
      {/* Content grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-1">
            <div 
              className="skeleton h-3 rounded-md" 
              style={{ 
                width: '60%',
                animationDelay: animated ? `${i * 0.1}s` : '0s'
              }} 
            />
            <div 
              className="skeleton h-4 rounded-md" 
              style={{ 
                width: '80%',
                animationDelay: animated ? `${i * 0.1 + 0.05}s` : '0s'
              }} 
            />
          </div>
        ))}
      </div>
    </motion.div>
  );

  // List variant skeleton
  const ListSkeleton = ({ index }: { index: number }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        delay: animated ? index * 0.05 : 0,
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="border-b border-border/30 last:border-0"
    >
      <div className="px-4 sm:px-6 py-4 flex items-center space-x-4">
        {/* Avatar/Icon */}
        <div className="skeleton h-10 w-10 rounded-full flex-shrink-0" />
        
        {/* Content */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div 
              className="skeleton h-4 rounded-md" 
              style={{ 
                width: '30%',
                animationDelay: animated ? `${index * 0.1}s` : '0s'
              }} 
            />
            <div 
              className="skeleton h-3 w-16 rounded-md" 
              style={{ 
                animationDelay: animated ? `${index * 0.1 + 0.05}s` : '0s'
              }} 
            />
          </div>
          <div 
            className="skeleton h-3 rounded-md" 
            style={{ 
              width: '60%',
              animationDelay: animated ? `${index * 0.1 + 0.1}s` : '0s'
            }} 
          />
        </div>
        
        {/* Actions */}
        <div className="flex space-x-2">
          <div className="skeleton h-8 w-8 rounded-md" />
          <div className="skeleton h-8 w-8 rounded-md" />
        </div>
      </div>
    </motion.div>
  );

  // Default table row skeleton
  const TableRowSkeleton = ({ index }: { index: number }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        delay: animated ? index * 0.05 : 0,
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }}
      className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
    >
      <div className="px-4 sm:px-6 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-4 items-center">
          {visibleColumns.slice(0, 8).map((col, colIndex) => {
            // Different skeleton patterns based on column type
            let skeletonElement;
            
            if (type === 'products' && colIndex === 0) {
              // Product name with icon
              skeletonElement = (
                <div className="flex items-center space-x-2">
                  <div className="skeleton h-8 w-8 rounded-md" />
                  <div className="skeleton h-4 rounded-md" style={{ width: '70%' }} />
                </div>
              );
            } else if ((type === 'orders' || type === 'customers') && colIndex === 0) {
              // Name/ID with status
              skeletonElement = (
                <div className="space-y-1">
                  <div className="skeleton h-4 rounded-md" style={{ width: '80%' }} />
                  <div className="skeleton h-3 rounded-md" style={{ width: '50%' }} />
                </div>
              );
            } else if (colIndex === visibleColumns.length - 1) {
              // Actions column
              skeletonElement = (
                <div className="flex space-x-1">
                  <div className="skeleton h-6 w-6 rounded-md" />
                  <div className="skeleton h-6 w-6 rounded-md" />
                </div>
              );
            } else {
              // Regular content
              skeletonElement = (
                <div 
                  className="skeleton h-4 rounded-md"
                  style={{ 
                    width: `${60 + Math.random() * 30}%`,
                    animationDelay: animated ? `${(index * visibleColumns.length + colIndex) * 0.02}s` : '0s'
                  }}
                />
              );
            }

            return (
              <div
                key={colIndex}
                className={`
                  ${!col.visible.mobile ? 'hidden sm:block' : ''}
                  ${!col.visible.tablet ? 'hidden lg:block' : ''}
                `}
              >
                {skeletonElement}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );

  // Compact variant skeleton
  const CompactSkeleton = ({ index }: { index: number }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        delay: animated ? index * 0.03 : 0,
        duration: 0.2
      }}
      className="border-b border-border/20 last:border-0"
    >
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="skeleton h-3 rounded-md" style={{ width: '25%' }} />
          <div className="skeleton h-3 rounded-md" style={{ width: '20%' }} />
          <div className="skeleton h-3 rounded-md" style={{ width: '15%' }} />
        </div>
        <div className="skeleton h-6 w-12 rounded-full" />
      </div>
    </motion.div>
  );

  return (
    <div className={`w-full ${className}`}>
      {/* Loading indicator */}
      {animated && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 mb-4"
        />
      )}

      {/* Header */}
      {showHeader && variant === 'default' && <HeaderSkeleton />}

      {/* Rows */}
      <div className="space-y-0">
        {Array.from({ length: rows }).map((_, index) => {
          switch (variant) {
            case 'card':
              return <CardSkeleton key={index} index={index} />;
            case 'list':
              return <ListSkeleton key={index} index={index} />;
            case 'compact':
              return <CompactSkeleton key={index} index={index} />;
            default:
              return <TableRowSkeleton key={index} index={index} />;
          }
        })}
      </div>

      {/* Pagination skeleton */}
      {variant === 'default' && rows > 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-border/30"
        >
          <div className="flex items-center space-x-2">
            <div className="skeleton h-4 w-20 rounded-md" />
            <div className="skeleton h-4 w-16 rounded-md" />
          </div>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-8 w-8 rounded-md" />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
} 