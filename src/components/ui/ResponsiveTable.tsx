import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useResponsive } from '../../hooks/useResponsive';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  hideOnMobile?: boolean;
  mobileLabel?: string;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyMessage = 'Нет данных',
  loading = false,
  className = ''
}: ResponsiveTableProps<T>) {
  const { isMobile } = useResponsive();
  
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }
  
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }
  
  // Mobile card view
  if (isMobile) {
    return (
      <div className={`space-y-3 ${className}`}>
        {data.map((item, index) => {
          const key = keyExtractor(item);
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onRowClick?.(item)}
              className={`
                rounded-lg border bg-card p-4 space-y-3
                ${onRowClick ? 'cursor-pointer hover:bg-muted/50 active:scale-[0.98]' : ''}
                transition-all
              `}
            >
              {columns
                .filter(col => !col.hideOnMobile)
                .map((column) => {
                  const value = column.render 
                    ? column.render(item) 
                    : (item[column.key as keyof T] as React.ReactNode);
                  
                  return (
                    <div key={String(column.key)} className="flex justify-between items-start gap-2">
                      <span className="text-xs text-muted-foreground">
                        {column.mobileLabel || column.label}
                      </span>
                      <span className="text-sm font-medium text-right">
                        {value}
                      </span>
                    </div>
                  );
                })}
              {onRowClick && (
                <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
              )}
            </motion.div>
          );
        })}
      </div>
    );
  }
  
  // Desktop table view
  return (
    <div className={`overflow-hidden rounded-lg border ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`
                    px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider
                    ${column.align === 'center' ? 'text-center' : ''}
                    ${column.align === 'right' ? 'text-right' : ''}
                  `}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y bg-card">
            {data.map((item, index) => {
              const key = keyExtractor(item);
              return (
                <motion.tr
                  key={key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => onRowClick?.(item)}
                  className={`
                    ${onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                    transition-colors
                  `}
                >
                  {columns.map((column) => {
                    const value = column.render 
                      ? column.render(item) 
                      : (item[column.key as keyof T] as React.ReactNode);
                    
                    return (
                      <td
                        key={String(column.key)}
                        className={`
                          px-4 py-4 text-sm
                          ${column.align === 'center' ? 'text-center' : ''}
                          ${column.align === 'right' ? 'text-right' : ''}
                        `}
                      >
                        {value}
                      </td>
                    );
                  })}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 