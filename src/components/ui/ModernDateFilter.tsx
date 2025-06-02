import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, X, Clock } from 'lucide-react';

export interface DateRange {
  from?: string;
  to?: string;
}

interface DatePreset {
  key: string;
  label: string;
  getValue: () => DateRange;
}

interface ModernDateFilterProps {
  value?: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
  placeholder?: string;
}

// Утилитарные функции для работы с датами
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const formatDisplayDate = (dateString: string): string => {
  return new Date(dateString + 'T00:00:00').toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  });
};

const getDatePresets = (): DatePreset[] => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1); // Понедельник
  
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  return [
    {
      key: 'today',
      label: 'Сегодня',
      getValue: () => ({
        from: formatDate(today),
        to: formatDate(today)
      })
    },
    {
      key: 'yesterday',
      label: 'Вчера',
      getValue: () => ({
        from: formatDate(yesterday),
        to: formatDate(yesterday)
      })
    },
    {
      key: 'thisWeek',
      label: 'Эта неделя',
      getValue: () => ({
        from: formatDate(weekStart),
        to: formatDate(today)
      })
    },
    {
      key: 'thisMonth',
      label: 'Этот месяц',
      getValue: () => ({
        from: formatDate(monthStart),
        to: formatDate(today)
      })
    },
    {
      key: 'last7Days',
      label: '7 дней',
      getValue: () => ({
        from: formatDate(sevenDaysAgo),
        to: formatDate(today)
      })
    },
    {
      key: 'last30Days',
      label: '30 дней',
      getValue: () => ({
        from: formatDate(thirtyDaysAgo),
        to: formatDate(today)
      })
    }
  ];
};

export function ModernDateFilter({
  value = {},
  onChange,
  className = '',
  placeholder = 'Выберите период'
}: ModernDateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showCustomCalendar, setShowCustomCalendar] = useState(false);
  const [customRange, setCustomRange] = useState<DateRange>({ from: '', to: '' });
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isMobile, setIsMobile] = useState(false);
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const presets = getDatePresets();

  // Определяем мобильное устройство
  useEffect(() => {
    const checkIsMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768);
      }
    };

    checkIsMobile();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkIsMobile);
      return () => window.removeEventListener('resize', checkIsMobile);
    }
  }, []);

  // Определяем выбранный пресет на основе текущих значений
  useEffect(() => {
    if (!value.from && !value.to) {
      setSelectedPreset(null);
      return;
    }

    const matchingPreset = presets.find(preset => {
      const presetValue = preset.getValue();
      return presetValue.from === value.from && presetValue.to === value.to;
    });

    setSelectedPreset(matchingPreset?.key || 'custom');
  }, [value.from, value.to]);

  // Расчет позиции выпадающего меню
  useEffect(() => {
    if (isOpen && buttonRef.current && typeof window !== 'undefined') {
      const rect = buttonRef.current.getBoundingClientRect();
      
      if (isMobile) {
        // На мобильных устройствах делаем dropdown на всю ширину с отступами
        // и проверяем, достаточно ли места снизу
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropdownHeight = 400; // примерная высота dropdown
        
        let top = rect.bottom + window.scrollY + 8;
        
        // Если места снизу мало, показываем сверху
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
          top = rect.top + window.scrollY - dropdownHeight - 8;
        }
        
        setDropdownPosition({
          top: Math.max(8, top), // минимум 8px от верха
          left: 12,
          width: window.innerWidth - 24
        });
      } else {
        // Для десктопа оставляем как есть
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const dropdownHeight = 300;
        
        let top = rect.bottom + window.scrollY + 8;
        let left = rect.left + window.scrollX;
        const width = Math.max(rect.width, 320);
        
        // Проверяем не выходит ли за правый край
        if (left + width > window.innerWidth) {
          left = window.innerWidth - width - 8;
        }
        
        // Проверяем место снизу
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
          top = rect.top + window.scrollY - dropdownHeight - 8;
        }
        
        setDropdownPosition({
          top: Math.max(8, top),
          left: Math.max(8, left),
          width
        });
      }
    }
  }, [isOpen, isMobile]);

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowCustomCalendar(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Закрытие по ESC
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setShowCustomCalendar(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
  }, [isOpen]);

  // Обработка прокрутки для корректировки позиции dropdown
  useEffect(() => {
    const handleScroll = () => {
      if (isOpen && buttonRef.current && typeof window !== 'undefined') {
        const rect = buttonRef.current.getBoundingClientRect();
        
        if (isMobile) {
          const spaceBelow = window.innerHeight - rect.bottom;
          const spaceAbove = rect.top;
          const dropdownHeight = 400;
          
          let top = rect.bottom + window.scrollY + 8;
          
          if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
            top = rect.top + window.scrollY - dropdownHeight - 8;
          }
          
          setDropdownPosition(prev => ({
            ...prev,
            top: Math.max(8, top)
          }));
        } else {
          const spaceBelow = window.innerHeight - rect.bottom;
          const spaceAbove = rect.top;
          const dropdownHeight = 300;
          
          let top = rect.bottom + window.scrollY + 8;
          let left = rect.left + window.scrollX;
          const width = Math.max(rect.width, 320);
          
          if (left + width > window.innerWidth) {
            left = window.innerWidth - width - 8;
          }
          
          if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
            top = rect.top + window.scrollY - dropdownHeight - 8;
          }
          
          setDropdownPosition(prev => ({
            ...prev,
            top: Math.max(8, top),
            left: Math.max(8, left)
          }));
        }
      }
    };

    if (isOpen) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [isOpen, isMobile]);

  const handlePresetSelect = (preset: DatePreset) => {
    const range = preset.getValue();
    onChange(range);
    setSelectedPreset(preset.key);
    setIsOpen(false);
    setShowCustomCalendar(false);
  };

  const handleCustomRangeSelect = () => {
    setShowCustomCalendar(true);
    setCustomRange(value);
  };

  const handleCustomRangeApply = () => {
    onChange(customRange);
    setSelectedPreset('custom');
    setShowCustomCalendar(false);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ from: undefined, to: undefined });
    setSelectedPreset(null);
    setIsOpen(false);
    setShowCustomCalendar(false);
  };

  const getDisplayText = () => {
    if (!value.from && !value.to) return placeholder;
    
    const preset = presets.find(p => p.key === selectedPreset);
    if (preset) return preset.label;
    
    if (value.from && value.to) {
      if (value.from === value.to) {
        return formatDisplayDate(value.from);
      }
      return `${formatDisplayDate(value.from)} — ${formatDisplayDate(value.to)}`;
    }
    
    if (value.from) return `С ${formatDisplayDate(value.from)}`;
    if (value.to) return `До ${formatDisplayDate(value.to)}`;
    
    return placeholder;
  };

  const hasValue = value.from || value.to;

  const dropdownContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={`fixed bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl z-[100000] overflow-hidden ${isMobile ? 'mobile-dropdown' : ''}`}
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            maxHeight: isMobile ? '70vh' : '80vh'
          }}
        >
          {!showCustomCalendar ? (
            // Пресеты
            <div className={`${isMobile ? 'p-4' : 'p-2'} max-h-full overflow-y-auto`}>
              <div className={`flex items-center gap-2 px-3 py-2 mb-3`}>
                <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span className={`${isMobile ? 'text-base' : 'text-sm'} font-medium text-slate-600 dark:text-slate-300`}>
                  Быстрый выбор
                </span>
              </div>
              
              <div className="space-y-1">
                {presets.map((preset) => (
                  <motion.button
                    key={preset.key}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handlePresetSelect(preset)}
                    className={`w-full text-left px-4 ${isMobile ? 'py-4' : 'py-2.5'} rounded-lg ${isMobile ? 'text-base' : 'text-sm'} transition-all duration-150 touch-target ${
                      selectedPreset === preset.key
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    {preset.label}
                  </motion.button>
                ))}
                
                <div className="border-t border-slate-200/50 dark:border-slate-700/50 my-2"></div>
                
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleCustomRangeSelect}
                  className={`w-full text-left px-4 ${isMobile ? 'py-4' : 'py-2.5'} rounded-lg ${isMobile ? 'text-base' : 'text-sm'} transition-all duration-150 touch-target ${
                    selectedPreset === 'custom'
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Произвольный период
                  </div>
                </motion.button>
              </div>
            </div>
          ) : (
            // Кастомный календарь
            <div className={`${isMobile ? 'p-5' : 'p-4'} max-h-full overflow-y-auto`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`${isMobile ? 'text-base' : 'text-sm'} font-medium text-slate-700 dark:text-slate-300`}>
                  Выберите период
                </h3>
                <button
                  onClick={() => setShowCustomCalendar(false)}
                  className={`${isMobile ? 'p-3' : 'p-1'} hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors touch-target`}
                >
                  <X className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} text-slate-500`} />
                </button>
              </div>
              
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                <div>
                  <label className={`block ${isMobile ? 'text-sm' : 'text-xs'} font-medium text-slate-600 dark:text-slate-400 mb-2`}>
                    От
                  </label>
                  <input
                    type="date"
                    value={customRange.from || ''}
                    onChange={(e) => setCustomRange(prev => ({ ...prev, from: e.target.value }))}
                    className={`w-full px-4 ${isMobile ? 'py-4 text-base' : 'py-2 text-sm'} bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all touch-target`}
                  />
                </div>
                
                <div>
                  <label className={`block ${isMobile ? 'text-sm' : 'text-xs'} font-medium text-slate-600 dark:text-slate-400 mb-2`}>
                    До
                  </label>
                  <input
                    type="date"
                    value={customRange.to || ''}
                    onChange={(e) => setCustomRange(prev => ({ ...prev, to: e.target.value }))}
                    className={`w-full px-4 ${isMobile ? 'py-4 text-base' : 'py-2 text-sm'} bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all touch-target`}
                  />
                </div>
              </div>
              
              <div className={`flex gap-3 mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 ${isMobile ? 'flex-col' : 'flex-row'}`}>
                <button
                  onClick={handleCustomRangeApply}
                  className={`${isMobile ? 'w-full py-4 text-base' : 'flex-1 py-2 text-sm'} px-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-medium touch-target`}
                >
                  Применить
                </button>
                <button
                  onClick={() => setShowCustomCalendar(false)}
                  className={`${isMobile ? 'w-full py-4 text-base' : 'py-2 text-sm'} px-4 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg transition-colors touch-target`}
                >
                  Отмена
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`relative ${className}`}>
      <motion.button
        ref={buttonRef}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 ${isMobile ? 'py-4 text-base' : 'py-2.5 text-sm'} bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl hover:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 touch-target ${
          hasValue ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} text-slate-500 dark:text-slate-400 flex-shrink-0`} />
          <span className="truncate">{getDisplayText()}</span>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          {hasValue && (
            <button
              onClick={handleClear}
              className={`${isMobile ? 'p-3' : 'p-1'} hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors touch-target`}
            >
              <X className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'} text-slate-500`} />
            </button>
          )}
          <ChevronDown className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </motion.button>
      
      {typeof document !== 'undefined' && createPortal(dropdownContent, document.body)}
    </div>
  );
} 