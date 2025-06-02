import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X } from 'lucide-react';

interface DateRangePickerProps {
  from?: string;
  to?: string;
  onRangeChange: (from?: string, to?: string) => void;
  className?: string;
}

export function DateRangePicker({ from, to, onRangeChange, className = '' }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate dropdown position
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 640;
      
      if (isMobile) {
        // На мобильных устройствах центрируем окно
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8,
          left: 16, // Отступ от края экрана
          width: window.innerWidth - 32 // Полная ширина минус отступы
        });
      } else {
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width
      });
      }
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      return () => {
        document.removeEventListener('keydown', handleEscKey);
      };
    }
  }, [isOpen]);

  const handleFromChange = (value: string) => {
    onRangeChange(value || undefined, to);
  };

  const handleToChange = (value: string) => {
    onRangeChange(from, value || undefined);
  };

  const clearRange = () => {
    onRangeChange(undefined, undefined);
  };

  const hasRange = from || to;

  const dropdownContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="fixed bg-white dark:bg-slate-900 rounded-lg sm:rounded-xl border border-border/50 shadow-2xl backdrop-blur-xl p-3 sm:p-4 z-[10000]"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: Math.max(dropdownPosition.width, window.innerWidth < 640 ? window.innerWidth - 32 : 320),
            maxWidth: window.innerWidth < 640 ? window.innerWidth - 32 : 'none',
            zIndex: 10000
          }}
        >
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2">
                От
              </label>
              <input
                type="date"
                value={from || ''}
                onChange={(e) => handleFromChange(e.target.value)}
                className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-sm sm:text-base bg-white/80 dark:bg-slate-900/80 border border-border/50 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2">
                До
              </label>
              <input
                type="date"
                value={to || ''}
                onChange={(e) => handleToChange(e.target.value)}
                className="w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-sm sm:text-base bg-white/80 dark:bg-slate-900/80 border border-border/50 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-3 py-2 text-xs sm:text-sm bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                Применить
              </button>
              <button
                onClick={() => {
                  clearRange();
                  setIsOpen(false);
                }}
                className="px-3 py-2 text-xs sm:text-sm border border-border/50 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Очистить
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`relative ${className}`}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="relative"
      >
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2.5 sm:py-2.5 lg:py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 rounded-lg hover:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 text-sm"
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs sm:text-sm text-muted-foreground truncate">
              {hasRange ? (
                <>
                  {from && new Date(from).toLocaleDateString('ru-RU')}
                  {from && to && ' — '}
                  {to && new Date(to).toLocaleDateString('ru-RU')}
                </>
              ) : (
                'Выберите период'
              )}
            </span>
          </div>
          {hasRange && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearRange();
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors flex-shrink-0"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </button>
          )}
        </button>
      </motion.div>
      
      {/* Render dropdown in portal */}
      {typeof document !== 'undefined' && createPortal(dropdownContent, document.body)}
    </div>
  );
} 