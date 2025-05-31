import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Search, AlertCircle, RefreshCw, Filter, Calendar, Trash2, Package2, Users, ShoppingBag } from 'lucide-react';
import { useCustomerOrders } from '../hooks/useCustomerOrders';
import { DateRangePicker } from '../components/ui/DateRangePicker';
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
  const [dateFrom, setDateFrom] = useState<string | undefined>();
  const [dateTo, setDateTo] = useState<string | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>(['shipped', 'processing']); // По умолчанию Отправлено и На отправке
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Обновляем данные для режима "Показать ещё"
  React.useEffect(() => {
    if (data?.data && !loadMoreMode) {
      setAllLoadedData(data.data);
    }
  }, [data, loadMoreMode]);

  const handleDateRangeChange = (from?: string, to?: string) => {
    console.log('handleDateRangeChange called with:', { from, to });
    setDateFrom(from);
    setDateTo(to);
    setPage(1); // Reset to first page when filters change
    setLoadMoreMode(false);
    setAllLoadedData([]);
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
      className="space-y-6 sm:space-y-8 min-h-screen bg-white dark:bg-slate-950 px-4 sm:px-6 lg:px-8 py-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
        <div className="relative">
          <div className="relative">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              Заказы клиентов
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
              {data?.metadata.total ? `${data.metadata.total} заказов найдено` : 'Управление и отслеживание заказов'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={async () => {
              try {
                setIsRefreshing(true);
                await customerOrdersApi.resync();
                // После синхронизации обновляем данные на странице
                refetch();
              } catch (error) {
                console.error('Failed to resync:', error);
              } finally {
                setIsRefreshing(false);
              }
            }}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Обновить</span>
          </motion.button>

          {/* Clear All Data Button */}
          {data && data.data && data.data.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClearAllData}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 transition-all disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-sm font-medium">Очистить данные</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4 sm:p-6 relative overflow-visible z-10">
        <div className="flex flex-col gap-4">
          {/* Search - full width on all screens */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Поиск по номеру заказа, имени клиента или адресу..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:focus:ring-purple-400 transition-all text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400"
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
                className={`w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 rounded-lg border transition-all font-medium text-sm ${
                  statusFilter.length !== 2 || !statusFilter.includes('shipped') || !statusFilter.includes('processing')
                    ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-400'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <Filter className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">
                  Статусы ({statusFilter.length})
                </span>
              </motion.button>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute top-full left-0 right-0 sm:left-auto sm:right-auto mt-2 w-full sm:w-72 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg dark:shadow-xl max-w-[calc(100vw-2rem)] sm:max-w-none mx-auto sm:mx-0"
                    style={{ zIndex: 9999 }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Статусы заказов</h4>
                        <button
                          onClick={() => setStatusFilter(allStatuses)}
                          className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                        >
                          Все
                        </button>
                      </div>
                      <div className="space-y-2">
                        {allStatuses.map(status => (
                          <label key={status} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors">
                            <input
                              type="checkbox"
                              checked={statusFilter.includes(status)}
                              onChange={() => toggleStatusFilter(status)}
                              className="rounded border-slate-300 dark:border-slate-600 text-purple-600 dark:text-purple-400 focus:ring-purple-500 dark:focus:ring-purple-400 focus:ring-offset-0"
                            />
                            {getStatusBadge(status)}
                          </label>
                        ))}
                      </div>
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                        <button
                          onClick={() => setStatusFilter(['shipped', 'processing'])}
                          className="flex-1 px-3 py-2 text-xs bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-all font-medium"
                        >
                          По умолчанию
                        </button>
                        <button
                          onClick={() => setStatusFilter([])}
                          className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all font-medium"
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
                className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 overflow-x-auto"
              >
                <div className="flex flex-wrap gap-2 min-w-0">
                  {dateFrom && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs rounded-md border border-purple-200 dark:border-purple-500/20 whitespace-nowrap">
                      <Calendar className="h-3 w-3" />
                      От: {new Date(dateFrom).toLocaleDateString('ru-RU')}
                    </span>
                  )}
                  {dateTo && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs rounded-md border border-purple-200 dark:border-purple-500/20 whitespace-nowrap">
                      <Calendar className="h-3 w-3" />
                      До: {new Date(dateTo).toLocaleDateString('ru-RU')}
                    </span>
                  )}
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs rounded-md border border-blue-200 dark:border-blue-500/20">
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden relative z-0">
        {/* Desktop Table - Hidden on mobile */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Статус</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">ID</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Клиент</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Адрес</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Товар</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Кол-во</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Цена</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Доставка</th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Дата оплаты</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-0">
                    <TableSkeleton rows={10} columns={9} />
                  </td>
                </tr>
              ) : !displayData?.length ? (
                <tr>
                  <td colSpan={9} className="p-8">
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
                displayData.map((order, index) => (
                  <motion.tr 
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150"
                  >
                    <td className="px-4 lg:px-6 py-4 text-sm">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-xs lg:text-sm font-mono text-slate-500 dark:text-slate-400">
                      #{order.id.endsWith('-0') ? order.id.slice(0, -2) : order.id}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                      <div className="max-w-[120px] sm:max-w-[200px] truncate">
                        {order.customerName}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate hidden lg:table-cell">
                      {order.address}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                      <div className="max-w-[120px] sm:max-w-[200px] truncate">
                        {order.productName}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-center text-slate-700 dark:text-slate-300">{order.quantity}</td>
                    <td className="px-4 lg:px-6 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {formatPrice(order.price)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-slate-700 dark:text-slate-300 hidden lg:table-cell">
                      {formatPrice(order.deliveryCost)}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">
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
                  <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 animate-pulse">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                      </div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : !displayData?.length ? (
            <div className="p-8">
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
            <div className="p-4 space-y-3">
              {displayData.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3 hover:shadow-md dark:hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200"
                >
                  {/* Header with Status and ID */}
                  <div className="flex items-center justify-between">
                    {getStatusBadge(order.status)}
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                      #{order.id.endsWith('-0') ? order.id.slice(0, -2) : order.id}
                    </span>
                  </div>

                  {/* Customer and Product */}
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Клиент:</span>
                      <div className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate mt-0.5">{order.customerName}</div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Товар:</span>
                      <div className="text-sm text-slate-700 dark:text-slate-300 truncate mt-0.5">{order.productName}</div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Адрес:</span>
                      <div className="text-sm text-slate-600 dark:text-slate-400 truncate mt-0.5">{order.address}</div>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Количество:</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{order.quantity} шт</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Цена:</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{formatPrice(order.price)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Доставка:</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{formatPrice(order.deliveryCost)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Сумма:</span>
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                        {formatPrice(order.price + order.deliveryCost)}
                      </span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Дата оплаты:</span>
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {formatDate(order.paymentDate)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Улучшенная пагинация */}
        {data && data.data && data.data.length > 0 && (
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
        )}
      </div>

      {/* Stats Footer */}
      {data && displayData && displayData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4 sm:p-6 text-center group hover:shadow-md dark:hover:shadow-lg transition-all duration-200">
            <Package2 className="h-8 w-8 mx-auto text-purple-600 dark:text-purple-400 mb-3 group-hover:scale-110 transition-transform duration-200" />
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {loadMoreMode ? allLoadedData.length : data?.metadata.total || 0}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
              {loadMoreMode ? 'Загруженных заказов' : 'Отфильтрованных заказов'}
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4 sm:p-6 text-center group hover:shadow-md dark:hover:shadow-lg transition-all duration-200">
            <ShoppingBag className="h-8 w-8 mx-auto text-indigo-600 dark:text-indigo-400 mb-3 group-hover:scale-110 transition-transform duration-200" />
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {data?.metadata.total || 0}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">Всего заказов</div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-4 sm:p-6 text-center group hover:shadow-md dark:hover:shadow-lg transition-all duration-200">
            <Filter className="h-8 w-8 mx-auto text-blue-600 dark:text-blue-400 mb-3 group-hover:scale-110 transition-transform duration-200" />
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {statusFilter.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">Активных статусов</div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}