import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Search, AlertCircle, RefreshCw, Filter, Calendar, Trash2 } from 'lucide-react';
import { useCustomerOrders } from '../hooks/useCustomerOrders';
import { DateRangePicker } from '../components/ui/DateRangePicker';
import { Pagination } from '../components/ui/Pagination';
import { TableSkeleton } from '../components/ui/TableSkeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { customerOrdersApi } from '../services/api';

const ITEMS_PER_PAGE = 20;

export function CustomerOrders() {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState<string | undefined>();
  const [dateTo, setDateTo] = useState<string | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>(['shipped', 'processing']); // По умолчанию Отправлено и На отправке

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
    from: dateFrom,
    to: dateTo,
    search: debouncedSearch.trim() || undefined,
    statusFilter: statusFilter.length > 0 ? statusFilter : undefined
  });

  // Больше не фильтруем данные на фронтенде
  const filteredData = data;

  const handleDateRangeChange = (from?: string, to?: string) => {
    console.log('handleDateRangeChange called with:', { from, to });
    setDateFrom(from);
    setDateTo(to);
    setPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

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
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' 
      },
      'paid': { 
        label: 'На проверке', 
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
      },
      'processing': { 
        label: 'На отправке', 
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
      },
      'shipped': { 
        label: 'Отправлено', 
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
      },
      'cancelled': { 
        label: 'Отменено', 
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' 
      },
      'overdue': { 
        label: 'Просрочено', 
        className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' 
      },
      'refunded': { 
        label: 'Возврат', 
        className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' 
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
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

  const hasActiveFilters = dateFrom || dateTo || searchTerm || 
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
      className="space-y-6 sm:space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
        <div className="relative">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="absolute -top-8 -left-8 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-full blur-2xl hidden sm:block"
          />
          <div className="relative">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
              Заказы клиентов
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mt-2">
              {data?.metadata.total ? `${data.metadata.total} заказов найдено` : 'Управление и отслеживание заказов'}
            </p>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              refetch();
            }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 rounded-xl hover:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Обновить</span>
          </motion.button>

          {/* Clear All Data Button */}
          {data && data.data && data.data.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClearAllData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 backdrop-blur-xl border border-red-200 dark:border-red-800 rounded-xl hover:border-red-400 dark:hover:border-red-600 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all disabled:opacity-50 text-red-700 dark:text-red-300"
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-sm font-medium">Очистить данные</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-lg p-4 sm:p-6 relative overflow-visible z-10">
        <div className="flex flex-col gap-4">
          {/* Search - full width on all screens */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70 h-5 w-5" />
            <input
              type="text"
              placeholder="Поиск по номеру заказа, имени клиента или адресу..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 h-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm sm:text-base"
            />
          </div>

          {/* Date and Status filters - responsive layout */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Date Range Picker */}
            <div className="flex-1 sm:flex-initial sm:w-auto relative z-20">
              <DateRangePicker
                from={dateFrom}
                to={dateTo}
                onRangeChange={handleDateRangeChange}
              />
            </div>

            {/* Status Filter */}
            <div className="relative z-30">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-4 py-3 rounded-xl border transition-all ${
                  statusFilter.length !== 2 || !statusFilter.includes('shipped') || !statusFilter.includes('processing')
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                    : 'bg-white/80 dark:bg-slate-900/80 border-border/50 hover:border-purple-500/50'
                }`}
              >
                <Filter className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium whitespace-nowrap">
                  Статусы ({statusFilter.length})
                </span>
              </motion.button>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute top-full left-0 right-0 sm:left-auto sm:right-auto mt-2 w-full sm:w-64 p-4 bg-white dark:bg-slate-900 rounded-xl border border-border/50 shadow-2xl backdrop-blur-xl max-w-[calc(100vw-2rem)] sm:max-w-none mx-auto sm:mx-0"
                    style={{ zIndex: 9999 }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">Статусы заказов</h4>
                        <button
                          onClick={() => setStatusFilter(allStatuses)}
                          className="text-xs text-purple-600 hover:text-purple-700"
                        >
                          Все
                        </button>
                      </div>
                      <div className="space-y-2">
                        {allStatuses.map(status => (
                          <label key={status} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={statusFilter.includes(status)}
                              onChange={() => toggleStatusFilter(status)}
                              className="rounded border-border/50 text-purple-600 focus:ring-purple-500/20"
                            />
                            {getStatusBadge(status)}
                          </label>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-border/50 flex gap-2">
                        <button
                          onClick={() => setStatusFilter(['shipped', 'processing'])}
                          className="flex-1 px-3 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md hover:bg-purple-200 dark:hover:bg-purple-900/50"
                        >
                          По умолчанию
                        </button>
                        <button
                          onClick={() => setStatusFilter([])}
                          className="flex-1 px-3 py-1 text-xs bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-900/50"
                        >
                          Очистить
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Active Filters Summary */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-border/50 overflow-x-auto"
              >
                <div className="flex flex-wrap gap-2 min-w-0">
                  {dateFrom && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs sm:text-sm rounded-full whitespace-nowrap">
                      <Calendar className="h-3 w-3" />
                      От: {new Date(dateFrom).toLocaleDateString('ru-RU')}
                    </span>
                  )}
                  {dateTo && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs sm:text-sm rounded-full whitespace-nowrap">
                      <Calendar className="h-3 w-3" />
                      До: {new Date(dateTo).toLocaleDateString('ru-RU')}
                    </span>
                  )}
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs sm:text-sm rounded-full">
                      <Search className="h-3 w-3" />
                      <span className="truncate max-w-[150px]" title={searchTerm}>"{searchTerm}"</span>
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-xl overflow-hidden relative z-0">
        {/* Desktop Table - Hidden on mobile */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-gray-50/50 dark:bg-slate-800/50">
                <th className="px-4 lg:px-6 py-4 text-left text-xs lg:text-sm font-semibold text-muted-foreground">Статус</th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs lg:text-sm font-semibold text-muted-foreground">ID</th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs lg:text-sm font-semibold text-muted-foreground">Клиент</th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs lg:text-sm font-semibold text-muted-foreground hidden lg:table-cell">Адрес</th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs lg:text-sm font-semibold text-muted-foreground">Товар</th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs lg:text-sm font-semibold text-muted-foreground">Кол-во</th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs lg:text-sm font-semibold text-muted-foreground">Цена</th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs lg:text-sm font-semibold text-muted-foreground hidden lg:table-cell">Доставка</th>
                <th className="px-4 lg:px-6 py-4 text-left text-xs lg:text-sm font-semibold text-muted-foreground hidden md:table-cell">Дата оплаты</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-0">
                    <TableSkeleton rows={10} columns={9} />
                  </td>
                </tr>
              ) : !data?.data?.length ? (
                <tr>
                  <td colSpan={9} className="p-8">
                    <EmptyState
                      message={hasActiveFilters ? "Заказы не найдены. Попробуйте изменить критерии фильтрации" : "Нет данных в таблице"}
                      type={hasActiveFilters ? "search" : "default"}
                      action={!hasActiveFilters ? {
                        label: "Загрузить данные из API",
                        onClick: refetch
                      } : undefined}
                    />
                  </td>
                </tr>
              ) : (
                data.data.map((order, index) => (
                  <motion.tr 
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-border/50 hover:bg-muted/30 transition-all duration-200"
                  >
                    <td className="px-4 lg:px-6 py-4 text-sm">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-xs lg:text-sm font-mono text-muted-foreground">
                      #{order.id.endsWith('-0') ? order.id.slice(0, -2) : order.id}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm font-medium">
                      <div className="max-w-[120px] sm:max-w-[200px] truncate">
                        {order.customerName}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-muted-foreground max-w-xs truncate hidden lg:table-cell">
                      {order.address}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm">
                      <div className="max-w-[120px] sm:max-w-[200px] truncate">
                        {order.productName}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-center">{order.quantity}</td>
                    <td className="px-4 lg:px-6 py-4 text-sm font-semibold">
                      {formatPrice(order.price)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm hidden lg:table-cell">
                      {formatPrice(order.deliveryCost)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-muted-foreground hidden md:table-cell">
                      <div className="max-w-[140px] truncate">
                        {formatDate(order.paymentDate)}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards - Shown only on mobile */}
        <div className="sm:hidden">
          {loading ? (
            <div className="p-4">
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 animate-pulse">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                      </div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : !data?.data?.length ? (
            <div className="p-8">
              <EmptyState
                message={hasActiveFilters ? "Заказы не найдены. Попробуйте изменить критерии фильтрации" : "Нет данных в таблице"}
                type={hasActiveFilters ? "search" : "default"}
                action={!hasActiveFilters ? {
                  label: "Загрузить данные из API",
                  onClick: refetch
                } : undefined}
              />
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {data.data.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-xl p-4 border border-border/50 space-y-3 hover:shadow-lg transition-all duration-200"
                >
                  {/* Header with Status and ID */}
                  <div className="flex items-center justify-between">
                    {getStatusBadge(order.status)}
                    <span className="text-xs font-mono text-muted-foreground">
                      #{order.id.endsWith('-0') ? order.id.slice(0, -2) : order.id}
                    </span>
                  </div>

                  {/* Customer and Product */}
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-muted-foreground">Клиент:</span>
                      <div className="font-medium text-sm truncate">{order.customerName}</div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Товар:</span>
                      <div className="text-sm truncate">{order.productName}</div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Адрес:</span>
                      <div className="text-sm text-muted-foreground truncate">{order.address}</div>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-border/50">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Количество:</span>
                      <span className="text-xs font-medium">{order.quantity} шт</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Цена:</span>
                      <span className="text-xs font-medium">{formatPrice(order.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Доставка:</span>
                      <span className="text-xs font-medium">{formatPrice(order.deliveryCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">Сумма:</span>
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                        {formatPrice(order.price + order.deliveryCost)}
                      </span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Дата оплаты:</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(order.paymentDate)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {data && data.data && data.data.length > 0 && data.metadata.total > ITEMS_PER_PAGE && (
          <div className="border-t border-border/50 px-4 sm:px-6 py-4">
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(data.metadata.total / ITEMS_PER_PAGE)}
              onPageChange={handlePageChange}
              isLoading={loading}
            />
          </div>
        )}
      </div>

      {/* Stats Footer */}
      {data && data.data && data.data.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-lg p-4 sm:p-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {data.metadata.total}
              </div>
              <div className="text-sm text-muted-foreground">Отфильтрованных заказов</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {data?.metadata.total || 0}
              </div>
              <div className="text-sm text-muted-foreground">Всего заказов</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {statusFilter.length}
              </div>
              <div className="text-sm text-muted-foreground">Активных статусов</div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}