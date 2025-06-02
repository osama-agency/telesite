import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Search, AlertCircle, RefreshCw, Filter, Calendar, Trash2, Package2, Users, ShoppingBag } from 'lucide-react';
import { useCustomerOrders } from '../hooks/useCustomerOrders';
import { ModernDateFilter, DateRange } from '../components/ui/ModernDateFilter';
import { ImprovedPagination } from '../components/ui/ImprovedPagination';
import { TableSkeleton } from '../components/ui/TableSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { customerOrdersApi } from '../services/api';

const ITEMS_PER_PAGE = 20; // Оптимальное количество для UX (диапазон 15-25)

export function CustomerOrders() {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [loadMoreMode, setLoadMoreMode] = useState(false);
  const [allLoadedData, setAllLoadedData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({});
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>(['shipped', 'processing']); // По умолчанию Отправлено и На отправке
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Refs for status filter dropdown
  const statusButtonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Calculate dropdown position when opening
  useEffect(() => {
    if (showFilters && statusButtonRef.current) {
      const rect = statusButtonRef.current.getBoundingClientRect();
      const isMobile = window.innerWidth < 640;
      
      if (isMobile) {
        // На мобильных устройствах центрируем окно
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8,
          left: 16, // Отступ от края экрана
          width: window.innerWidth - 32 // Полная ширина минус отступы
        });
      } else {
        // На десктопе позиционируем относительно кнопки
        const dropdownWidth = window.innerWidth >= 1024 ? 320 : 288; // lg:w-80 или sm:w-72
        
        // Проверяем, не выходит ли меню за правый край экрана
        let leftPosition = rect.left + window.scrollX;
        if (leftPosition + dropdownWidth > window.innerWidth - 16) {
          leftPosition = window.innerWidth - dropdownWidth - 16;
        }
        
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8,
          left: Math.max(16, leftPosition),
          width: dropdownWidth
        });
      }
    }
  }, [showFilters]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showFilters &&
        statusButtonRef.current &&
        !statusButtonRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('.status-dropdown-portal')
      ) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showFilters]);

  // Use debounced search to avoid too many API calls
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Initialize search term from URL params
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    const statusFromUrl = searchParams.get('status');
    
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl);
      setShowFilters(true); // Show filters when coming from external link
      
      // Set status filter based on URL parameter
      if (statusFromUrl === 'shipped') {
        setStatusFilter(['shipped']);
      } else {
        // Show all statuses when coming from external link to avoid missing orders
        setStatusFilter(['unpaid', 'paid', 'processing', 'shipped', 'cancelled', 'overdue', 'refunded']);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page when search changes
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, loading, error, refetch } = useCustomerOrders({
    page,
    limit: ITEMS_PER_PAGE,
    from: dateRange.from,
    to: dateRange.to,
    search: debouncedSearch.trim() || undefined,
    statusFilter: statusFilter.length > 0 ? statusFilter : undefined
  });

  // Toggle expand function for table rows
  const toggleExpand = (orderId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  // Обновляем данные для режима "Показать ещё"
  React.useEffect(() => {
    if (data?.data && !loadMoreMode) {
      setAllLoadedData(data.data);
    }
  }, [data, loadMoreMode]);

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    setPage(1); // Reset pagination when filters change
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setLoadMoreMode(false);
    setAllLoadedData([]);
  };

  const handleLoadMore = async () => {
    if (!data?.metadata.total || (page * ITEMS_PER_PAGE) >= data.metadata.total) return;
    
    if (!loadMoreMode) {
      setLoadMoreMode(true);
      setAllLoadedData(data?.data || []);
    }
    
    const nextPage = page + 1;
    setPage(nextPage);
  };

  // Обновляем allLoadedData когда получаем новые данные в режиме loadMore
  React.useEffect(() => {
    if (loadMoreMode && data?.data && page > 1) {
      setAllLoadedData(prev => {
        // Избегаем дублирования данных
        const existingIds = new Set(prev.map(item => item.id));
        const newItems = data.data.filter(item => !existingIds.has(item.id));
        return [...prev, ...newItems];
      });
    }
  }, [data, loadMoreMode, page]);

  const displayData = loadMoreMode ? allLoadedData : data?.data || [];
  const hasNextPage = data?.metadata.total ? (page * ITEMS_PER_PAGE) < data.metadata.total : false;

  const handleClearAllData = async () => {
    if (window.confirm('Вы уверены, что хотите удалить ВСЕ заказы клиентов? Это действие нельзя отменить.')) {
      try {
        await customerOrdersApi.clearAll();
        refetch(); // Обновляем данные после очистки
      } catch (error) {
        console.error('Failed to clear all data:', error);
      }
    }
  };

  const totalPages = useMemo(() => {
    if (!data?.metadata.total) return 0;
    return Math.ceil(data.metadata.total / ITEMS_PER_PAGE);
  }, [data?.metadata.total]);

  const formatDate = (dateString: string) => {
    try {
      // Handle different date formats
      let date: Date;
      
      if (dateString.includes('.')) {
        // Format: DD.MM.YYYY HH:mm:ss
        const [datePart, timePart] = dateString.split(' ');
        const [day, month, year] = datePart.split('.');
        const [hours, minutes, seconds] = (timePart || '00:00:00').split(':');
        
        date = new Date(
          parseInt(year), 
          parseInt(month) - 1, 
          parseInt(day),
          parseInt(hours || '0'),
          parseInt(minutes || '0'),
          parseInt(seconds || '0')
        );
      } else {
        // ISO format or other standard formats
        date = new Date(dateString);
      }
      
      return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return dateString;
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'unpaid': { 
        label: 'Ожидание платежа', 
        className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/20' 
      },
      'paid': { 
        label: 'На проверке', 
        className: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20' 
      },
      'processing': { 
        label: 'На отправке', 
        className: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200/50 dark:border-purple-500/20' 
      },
      'shipped': { 
        label: 'Отправлено', 
        className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20' 
      },
      'cancelled': { 
        label: 'Отменено', 
        className: 'bg-slate-50 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border border-slate-200/50 dark:border-slate-500/20' 
      },
      'overdue': { 
        label: 'Просрочено', 
        className: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200/50 dark:border-red-500/20' 
      },
      'refunded': { 
        label: 'Возврат', 
        className: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-500/20' 
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: 'bg-slate-50 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border border-slate-200/50 dark:border-slate-500/20'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilter(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
    setPage(1); // Reset to first page when filters change
  };

  const allStatuses = ['unpaid', 'paid', 'processing', 'shipped', 'cancelled', 'overdue', 'refunded'];

  const hasActiveFilters = dateRange.from || dateRange.to || searchTerm || 
    !(statusFilter.length === 2 && statusFilter.includes('shipped') && statusFilter.includes('processing')) &&
    !(statusFilter.length === allStatuses.length) &&
    !(statusFilter.length === 1 && statusFilter.includes('shipped'));

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <ErrorState 
          title="Ошибка загрузки заказов"
          message={error}
          action={{
            label: 'Повторить попытку',
            onClick: refetch
          }}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full min-w-0 space-y-6 sm:space-y-8 lg:space-y-10"
    >
      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
        <div className="relative min-w-0 flex-1">
          <div className="relative">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
              Заказы клиентов
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400 mt-1 sm:mt-2">
              {data?.metadata.total ? `${data.metadata.total} заказов найдено` : 'Управление и отслеживание заказов'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={async () => {
              try {
                setIsRefreshing(true);
                await customerOrdersApi.resync();
                refetch();
              } catch (error) {
                console.error('Failed to resync:', error);
              } finally {
                setIsRefreshing(false);
              }
            }}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 transition-all disabled:opacity-50 text-sm sm:text-base font-medium"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Обновить</span>
          </motion.button>

          {/* Clear All Data Button */}
          {data && data.data && data.data.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClearAllData}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 transition-all disabled:opacity-50 text-sm sm:text-base font-medium"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Очистить данные</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-4 lg:p-6 overflow-visible relative">
        <div className="flex flex-col gap-3 sm:gap-4 overflow-visible">
          {/* Search - full width on mobile, limited width on desktop */}
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-2.5 sm:left-3 lg:left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Поиск..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 sm:pl-9 lg:pl-10 pr-3 py-2.5 sm:py-2.5 lg:py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:focus:ring-purple-400 transition-all text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 placeholder:text-xs"
              title="Поиск по номеру заказа, имени клиента или адресу"
              aria-label="Поиск по номеру заказа, имени клиента или адресу"
            />
          </div>

          {/* Date and Status filters - vertical on mobile, horizontal on desktop */}
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
            {/* Date Range Picker */}
            <div className="w-full lg:w-auto lg:min-w-[280px]">
              <ModernDateFilter
                value={dateRange}
                onChange={handleDateRangeChange}
                placeholder="Выберите период"
                className="w-full"
              />
            </div>

            {/* Status Filter */}
            <div className="relative w-full lg:w-auto lg:min-w-[160px]">
              <motion.button
                ref={statusButtonRef}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 sm:py-2.5 lg:py-2 rounded-lg border transition-all font-medium text-sm min-w-0 ${
                  statusFilter.length !== 2 || !statusFilter.includes('shipped') || !statusFilter.includes('processing')
                    ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-400'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <Filter className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap truncate">
                  Статусы ({statusFilter.length})
                </span>
              </motion.button>
            </div>
          </div>

          {/* Active Filters Summary */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-4 sm:pt-6 border-t border-slate-200/50 dark:border-slate-800/50"
              >
                <div className="flex flex-wrap gap-2 sm:gap-3 min-w-0">
                  {dateRange.from && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs sm:text-sm rounded-md border border-purple-200 dark:border-purple-500/20 whitespace-nowrap">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      От: {new Date(dateRange.from).toLocaleDateString('ru-RU')}
                    </span>
                  )}
                  {dateRange.to && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs sm:text-sm rounded-md border border-purple-200 dark:border-purple-500/20 whitespace-nowrap">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      До: {new Date(dateRange.to).toLocaleDateString('ru-RU')}
                    </span>
                  )}
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs sm:text-sm rounded-md border border-blue-200 dark:border-blue-500/20 min-w-0">
                      <Search className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate max-w-[120px] sm:max-w-[150px]" title={searchTerm}>"{searchTerm}"</span>
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Orders Table */}
      <div className="w-full">
        <div className="overflow-x-auto w-full rounded-lg border border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {/* Desktop Table - Enhanced for 820px+ */}
          <div className="hidden sm:block">
            <table className="w-full min-w-[950px] md:min-w-[1050px] lg:min-w-full">
              <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 text-left text-[10px] md:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 text-left text-[10px] md:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 text-left text-[10px] md:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Клиент
                  </th>
                  <th className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 text-left text-[10px] md:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Товар
                  </th>
                  <th className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 text-left text-[10px] md:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Кол-во
                  </th>
                  <th className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 text-left text-[10px] md:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Цена
                  </th>
                  <th className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 text-left text-[10px] md:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider hidden xl:table-cell">
                    Доставка
                  </th>
                  <th className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 text-left text-[10px] md:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Дата оплаты
                  </th>
                  <th className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 text-left text-[10px] md:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Детали
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-0">
                      <TableSkeleton rows={10} columns={9} />
                    </td>
                  </tr>
                ) : !displayData?.length ? (
                  <tr>
                    <td colSpan={9} className="p-6 sm:p-8 lg:p-12">
                      <EmptyState
                        message={hasActiveFilters ? "Заказы не найдены. Попробуйте изменить критерии фильтрации" : "Нет данных в таблице"}
                        type={hasActiveFilters ? "search" : "orders"}
                        action={!hasActiveFilters ? {
                          label: "Загрузить данные из API",
                          onClick: refetch
                        } : undefined}
                      />
                    </td>
                  </tr>
                ) : (
                  displayData.map((order, index) => {
                    const isExpanded = expandedRows.has(order.id);
                    
                    return (
                      <React.Fragment key={order.id}>
                        <motion.tr 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors duration-150"
                        >
                          <td className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 text-xs md:text-sm">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 text-[10px] md:text-xs font-mono text-slate-500 dark:text-slate-400">
                            <div className="min-w-[60px] md:min-w-[80px]">
                              #{order.id.endsWith('-0') ? order.id.slice(0, -2) : order.id}
                            </div>
                          </td>
                          <td className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 text-xs md:text-sm font-medium text-slate-900 dark:text-slate-100">
                            <div className="min-w-[100px] md:min-w-[120px]" title={order.customerName}>
                              {order.customerName}
                            </div>
                          </td>
                          <td className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 text-xs md:text-sm text-slate-700 dark:text-slate-300">
                            <div className="min-w-[100px] md:min-w-[120px]" title={order.productName}>
                              {order.productName}
                            </div>
                          </td>
                          <td className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 text-xs md:text-sm text-center text-slate-700 dark:text-slate-300 font-medium">
                            {order.quantity}
                          </td>
                          <td className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 text-xs md:text-sm font-semibold text-slate-900 dark:text-slate-100">
                            <div className="min-w-[80px]">
                              {formatPrice(order.price)}
                            </div>
                          </td>
                          <td className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 text-xs md:text-sm text-slate-700 dark:text-slate-300 hidden xl:table-cell">
                            <div className="min-w-[80px]">
                              {formatPrice(order.deliveryCost)}
                            </div>
                          </td>
                          <td className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                            <div className="min-w-[120px] md:min-w-[140px]" title={formatDate(order.paymentDate)}>
                              {formatDate(order.paymentDate)}
                            </div>
                          </td>
                          <td className="px-2 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4">
                            <button
                              onClick={() => toggleExpand(order.id)}
                              className="p-1 md:p-1.5 lg:p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                              title={isExpanded ? "Скрыть детали" : "Показать детали"}
                            >
                              <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <svg className="w-3 h-3 md:w-4 md:h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </motion.div>
                            </button>
                          </td>
                        </motion.tr>
                        
                        {/* Expandable Details Row */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.tr
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="bg-slate-50/50 dark:bg-slate-800/30"
                            >
                              <td colSpan={9} className="px-2 md:px-4 lg:px-6 py-3 md:py-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 text-xs md:text-sm">
                                  <div className="space-y-1">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Адрес доставки:</span>
                                    <p className="text-slate-700 dark:text-slate-300 break-words">{order.address}</p>
                                  </div>
                                  <div className="space-y-1 xl:hidden">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Стоимость доставки:</span>
                                    <p className="text-slate-700 dark:text-slate-300 font-medium">{formatPrice(order.deliveryCost)}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">Общая сумма:</span>
                                    <p className="text-slate-900 dark:text-slate-100 font-semibold text-sm md:text-base">
                                      {formatPrice(order.price + order.deliveryCost)}
                                    </p>
                                  </div>
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards - Shown only on mobile */}
          <div className="sm:hidden">
            {loading ? (
              <div className="p-3 sm:p-4">
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 animate-pulse">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
                          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                        </div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : !displayData?.length ? (
              <div className="p-4 sm:p-6">
                <EmptyState
                  message={hasActiveFilters ? "Заказы не найдены. Попробуйте изменить критерии фильтрации" : "Нет данных в таблице"}
                  type={hasActiveFilters ? "search" : "orders"}
                  action={!hasActiveFilters ? {
                    label: "Загрузить данные из API",
                    onClick: refetch
                  } : undefined}
                />
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {displayData.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.3 }}
                    className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-lg p-3 space-y-2 hover:shadow-sm dark:hover:shadow-lg hover:border-slate-300/60 dark:hover:border-slate-600/60 transition-all duration-200"
                  >
                    {/* Header with Status and ID */}
                    <div className="flex items-center justify-between gap-2">
                      {getStatusBadge(order.status)}
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex-shrink-0">
                        #{order.id.endsWith('-0') ? order.id.slice(0, -2) : order.id}
                      </span>
                    </div>

                    {/* Customer and Product */}
                    <div className="space-y-2">
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Клиент:</span>
                        <div className="font-medium text-xs text-slate-900 dark:text-slate-100 truncate mt-0.5">{order.customerName}</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Товар:</span>
                        <div className="text-xs text-slate-700 dark:text-slate-300 truncate mt-0.5">{order.productName}</div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Адрес:</span>
                        <div className="text-xs text-slate-600 dark:text-slate-400 break-words mt-0.5">{order.address}</div>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Количество:</span>
                        <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">{order.quantity} шт</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Цена:</span>
                        <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">{formatPrice(order.price)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Доставка:</span>
                        <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">{formatPrice(order.deliveryCost)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Сумма:</span>
                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                          {formatPrice(order.price + order.deliveryCost)}
                        </span>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Дата оплаты:</span>
                        <span className="text-[10px] text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
                          {formatDate(order.paymentDate)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Improved Pagination */}
          {data && data.data && data.data.length > 0 && (
            <div className="border-t border-slate-200/50 dark:border-slate-800/50">
              <ImprovedPagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={data.metadata.total}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
                onLoadMore={handleLoadMore}
                loading={loading || isRefreshing}
                showLoadMore={true}
                hasNextPage={hasNextPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Stats Footer */}
      {data && displayData && displayData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
        >
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8 text-center group hover:shadow-md dark:hover:shadow-lg transition-all duration-200">
            <Package2 className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-purple-600 dark:text-purple-400 mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200" />
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
              {loadMoreMode ? allLoadedData.length : data?.metadata.total || 0}
            </div>
            <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 sm:mt-2 font-medium">
              {loadMoreMode ? 'Загруженных заказов' : 'Отфильтрованных заказов'}
            </div>
          </div>
          
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8 text-center group hover:shadow-md dark:hover:shadow-lg transition-all duration-200">
            <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-indigo-600 dark:text-indigo-400 mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200" />
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
              {data?.metadata.total || 0}
            </div>
            <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 sm:mt-2 font-medium">Всего заказов</div>
          </div>
          
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 lg:p-8 text-center group hover:shadow-md dark:hover:shadow-lg transition-all duration-200">
            <Filter className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-blue-600 dark:text-blue-400 mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200" />
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
              {statusFilter.length}
            </div>
            <div className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1 sm:mt-2 font-medium">Активных статусов</div>
          </div>
        </motion.div>
      )}
      
      {/* Status Filter Dropdown Portal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="status-dropdown-portal fixed bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg sm:rounded-xl shadow-2xl z-[10000] p-3 sm:p-4"
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width
              }}
            >
              <div className="space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">Статусы заказов</h4>
                  <button
                    onClick={() => setStatusFilter(allStatuses)}
                    className="text-[10px] sm:text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                  >
                    Все
                  </button>
                </div>
                <div className="space-y-1.5 sm:space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                  {allStatuses.map(status => (
                    <label key={status} className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 sm:p-2.5 rounded-lg transition-colors">
                      <input
                        type="checkbox"
                        checked={statusFilter.includes(status)}
                        onChange={() => toggleStatusFilter(status)}
                        className="rounded border-slate-300 dark:border-slate-600 text-purple-600 dark:text-purple-400 focus:ring-purple-500 dark:focus:ring-purple-400 focus:ring-offset-0 w-3.5 h-3.5 sm:w-4 sm:h-4"
                      />
                      {getStatusBadge(status)}
                    </label>
                  ))}
                </div>
                <div className="pt-2.5 sm:pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                  <button
                    onClick={() => setStatusFilter(['shipped', 'processing'])}
                    className="flex-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-all font-medium"
                  >
                    По умолчанию
                  </button>
                  <button
                    onClick={() => setStatusFilter([])}
                    className="flex-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all font-medium"
                  >
                    Очистить
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
}