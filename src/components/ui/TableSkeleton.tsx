import React from 'react';
import { motion } from 'framer-motion';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, columns = 8, className = '' }: TableSkeletonProps) {
  return (
    <div className={`w-full ${className}`}>
      {/* Table Rows Skeleton */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <motion.div
          key={rowIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            delay: rowIndex * 0.05,
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="border-b border-border/30 last:border-0"
        >
          <div className="px-4 sm:px-6 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-4 items-center">
              {Array.from({ length: Math.min(columns, 2) }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="skeleton h-3 sm:h-4 rounded-md col-span-1"
                  style={{
                    width: colIndex === 0 ? '60%' : '80%',
                    animationDelay: `${colIndex * 0.1}s`
                  }}
                />
              ))}
              
              {/* Hidden on mobile, shown on tablet and up */}
              {columns > 2 && (
                <>
                  {Array.from({ length: Math.min(columns - 2, 2) }).map((_, colIndex) => (
                    <div
                      key={colIndex + 2}
                      className="hidden sm:block skeleton h-3 sm:h-4 rounded-md col-span-1"
                      style={{
                        width: `${70 + Math.random() * 30}%`,
                        animationDelay: `${(colIndex + 2) * 0.1}s`
                      }}
                    />
                  ))}
                </>
              )}
              
              {/* Hidden on tablet, shown on desktop */}
              {columns > 4 && (
                <>
                  {Array.from({ length: columns - 4 }).map((_, colIndex) => (
                    <div
                      key={colIndex + 4}
                      className="hidden lg:block skeleton h-3 sm:h-4 rounded-md col-span-1"
                      style={{
                        width: `${60 + Math.random() * 40}%`,
                        animationDelay: `${(colIndex + 4) * 0.1}s`
                      }}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
} 