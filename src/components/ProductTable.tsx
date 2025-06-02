import React, { useState, useRef, useEffect } from 'react';
import { Edit2, TrendingUp, AlertTriangle, CheckCircle, DollarSign, Package2, Edit3 } from 'lucide-react';
import { useResponsive } from '../hooks/useResponsive';

interface Product {
  id: string;
  name: string;
  averageSellingPrice: number;
  costPriceTRY: number;
  costPriceRUB: number;
  logisticsCost: number;
  markup: number;
  marginPercent: number;
  netProfit: number;
  netProfitTotal: number;
  totalCosts: number;
  profitPercentTotal: number;
  soldPeriod: number;
  soldQuantity: number; // Количество проданных товаров
  averageConsumptionDaily: number;
  currentStock: number;
  inDelivery: number;
  daysInStock: number;
  orderPoint: boolean;
  exchangeRate: number;
  fixedCosts: number;
  deliveryDays: number;
  tryRate?: number; // New field for per-row exchange rate
  revenue?: number; // Оборот за период
  firstSaleDate?: string; // Дата первой продажи товара
}

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  exchangeRate: number;
  selectedProducts: string[];
  onSelectProducts: (ids: string[]) => void;
  onReceiveDelivery: (productId: string) => void;
  onBulkEditTryRate?: (productIds: string[], newRate: number) => void;
}

export function ProductTable({
  products,
  loading,
  onUpdateProduct,
  exchangeRate,
  selectedProducts,
  onSelectProducts,
  onReceiveDelivery,
  onBulkEditTryRate
}: ProductTableProps) {
  const [editingField, setEditingField] = useState<{
    id: string;
    field: string;
  } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkTryRate, setBulkTryRate] = useState('');
  const [bulkEditError, setBulkEditError] = useState('');
  const { isMobile } = useResponsive();

  // Drag/Swipe scrolling state
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollLeft, setStartScrollLeft] = useState(0);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start dragging if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, a, [role="button"]')) {
      return;
    }
    
    if (!tableContainerRef.current) return;
    
    setIsDragging(true);
    setStartX(e.clientX);
    setStartScrollLeft(tableContainerRef.current.scrollLeft);
    
    // Prevent default behaviors
    e.preventDefault();
    document.body.style.userSelect = 'none';
  };

  // Global mouse move and up handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !tableContainerRef.current) return;
      
      e.preventDefault();
      const currentX = e.clientX;
      const diffX = currentX - startX;
      const newScrollLeft = startScrollLeft - diffX;
      
      tableContainerRef.current.scrollLeft = newScrollLeft;
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        document.body.style.userSelect = '';
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !tableContainerRef.current || e.touches.length !== 1) return;
      
      e.preventDefault();
      const currentX = e.touches[0].clientX;
      const diffX = currentX - startX;
      const newScrollLeft = startScrollLeft - diffX;
      
      tableContainerRef.current.scrollLeft = newScrollLeft;
    };

    const handleTouchEnd = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mouseleave', handleMouseUp);
      
      // Add touch events with passive: false to allow preventDefault
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.body.style.userSelect = '';
    };
  }, [isDragging, startX, startScrollLeft]);

  // Touch handlers (only for start)
  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't start dragging if touching interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, a, [role="button"]')) {
      return;
    }
    
    if (!tableContainerRef.current || e.touches.length !== 1) return;
    
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setStartScrollLeft(tableContainerRef.current.scrollLeft);
  };

  // Prevent text selection during drag
  useEffect(() => {
    const handleSelectStart = (e: Event) => {
      if (isDragging) e.preventDefault();
    };

    document.addEventListener('selectstart', handleSelectStart);
    return () => document.removeEventListener('selectstart', handleSelectStart);
  }, [isDragging]);

  const handleEdit = (id: string, field: string, currentValue: number) => {
    setEditingField({
      id,
      field
    });
    setEditValue(currentValue.toString());
  };

  const handleSave = () => {
    if (!editingField) return;
    const numericValue = parseFloat(editValue);
    if (isNaN(numericValue)) return;
    // Validation for TRY Rate
    if (editingField.field === 'tryRate') {
      if (numericValue <= 0 || numericValue > 50) {
        return;
      }
    }
    onUpdateProduct(editingField.id, {
      [editingField.field]: numericValue
    });
    setEditingField(null);
    setEditValue('');
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectProducts(products.map(p => p.id));
    } else {
      onSelectProducts([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      onSelectProducts([...selectedProducts, productId]);
    } else {
      onSelectProducts(selectedProducts.filter(id => id !== productId));
    }
  };

  const handleBulkEditSave = () => {
    const rate = parseFloat(bulkTryRate);
    if (isNaN(rate) || rate <= 0 || rate > 50) {
      setBulkEditError('Курс должен быть положительным числом до 50');
      return;
    }
    if (selectedProducts.length === 0) {
      setBulkEditError('Выберите товары для редактирования');
      return;
    }
    onBulkEditTryRate?.(selectedProducts, rate);
    setBulkEditMode(false);
    setBulkTryRate('');
    setBulkEditError('');
    onSelectProducts([]);
  };

  const formatCurrency = (amount: number, currency: string = 'RUB') => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '0';
    }
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0%';
    }
    return `${value.toFixed(1)}%`;
  };

  const formatRate = (rate?: number) => {
    if (rate === undefined || rate === null) return '—';
    return rate.toFixed(2);
  };

  const getRowColor = (product: Product) => {
    if (product.orderPoint) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    if (product.profitPercentTotal < 10) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    if (product.profitPercentTotal > 20) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    return 'bg-white/80 dark:bg-slate-900/80 border-border';
  };

  const getStatusIcon = (product: Product) => {
    if (product.orderPoint) return <AlertTriangle className="h-3 w-3 text-red-500" />;
    if (product.profitPercentTotal < 10) return <DollarSign className="h-3 w-3 text-yellow-500" />;
    if (product.profitPercentTotal > 20) return <CheckCircle className="h-3 w-3 text-green-500" />;
    return <TrendingUp className="h-3 w-3 text-blue-500" />;
  };

  if (loading) {
    return <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl">
        <div className="min-h-[16rem] flex items-center justify-center">
          <div className="text-muted-foreground">Загрузка товаров...</div>
        </div>
      </div>;
  }
  const isAllSelected = products.length > 0 && selectedProducts.length === products.length;
  const isPartiallySelected = selectedProducts.length > 0 && selectedProducts.length < products.length;
  
  return <div>
      {/* Desktop/Tablet Table - Hidden on mobile */}
      <div className="hidden sm:block">
        <div 
          ref={tableContainerRef}
          className={`w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 rounded-xl lg:rounded-2xl border border-border bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl cursor-grab select-none transition-all duration-200 ${
            isDragging ? 'cursor-grabbing shadow-2xl bg-white/90 dark:bg-slate-900/90' : 'hover:shadow-2xl'
          }`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <table className="w-full min-w-[700px] text-xs">
            <thead className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 sticky top-0 z-10">
              <tr>
                <th className="px-1.5 py-2 text-left sticky left-0 bg-gradient-to-r from-slate-100 to-slate-100 dark:from-slate-800 dark:to-slate-800 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      checked={isAllSelected} 
                      ref={input => {
                        if (input) input.indeterminate = isPartiallySelected;
                      }} 
                      onChange={e => handleSelectAll(e.target.checked)} 
                      className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                      aria-label="Выбрать все товары" 
                    />
                  </div>
                </th>
                <th className="px-1.5 py-2 text-left sticky left-8 bg-gradient-to-r from-slate-100 to-slate-100 dark:from-slate-800 dark:to-slate-800 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-slate-200 dark:border-slate-700">
                  <div className="flex items-center">
                    <div className="font-medium text-xs">Товар</div>
                  </div>
                </th>
                <th className="px-1.5 py-2 text-left text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase">
                  Цена
                </th>
                <th className="px-1.5 py-2 text-left text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase bg-emerald-50 dark:bg-emerald-900/20">
                  <div className="flex items-center space-x-0.5">
                    <span>Себ.TRY</span>
                    <Edit3 className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </th>
                <th className="px-1.5 py-2 text-left text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center space-x-0.5">
                    <span>Rate</span>
                    <TrendingUp className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400" />
                  </div>
                </th>
                <th className="px-1.5 py-2 text-left text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase">
                  Себ.₽
                </th>
                <th className="px-1.5 py-2 text-left text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase">
                  Расх.
                </th>
                <th className="px-1.5 py-2 text-left text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase">
                  Оборот
                </th>
                <th className="px-1.5 py-2 text-left text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase">
                  Нац.%
                </th>
                <th className="px-1.5 py-2 text-left text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase">
                  Маржа
                </th>
                <th className="px-1.5 py-2 text-left text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase">
                  <span>Чист.₽</span>
                </th>
                <th className="px-1.5 py-2 text-left text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase">
                  <span>За период</span>
                </th>
                <th className="px-1.5 py-2 text-left text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase">
                  %приб.
                </th>
                <th className="px-1.5 py-2 text-left text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase">
                  Прод.
                </th>
                <th className="px-1.5 py-2 text-left text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase">
                  Потр/д
                </th>
                <th className="px-1.5 py-2 text-left text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase">
                  Ост.
                </th>
                <th className="px-1.5 py-2 text-left text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase">
                  В пути
                </th>
                <th className="px-1.5 py-2 text-left text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase">
                  Дней
                </th>
                <th className="px-1.5 py-2 text-left text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase">
                  Статус
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {products.map(product => {
              const isSelected = selectedProducts.includes(product.id);
              const rowColor = getRowColor(product);
              const stickyBgClass = rowColor.includes('bg-red-50') ? 'bg-red-50 dark:bg-red-900/90' :
                                   rowColor.includes('bg-yellow-50') ? 'bg-yellow-50 dark:bg-yellow-900/90' :
                                   rowColor.includes('bg-green-50') ? 'bg-green-50 dark:bg-green-900/90' :
                                   'bg-white dark:bg-slate-900';
              return <tr key={product.id} className={`${rowColor} hover:shadow-lg transition-all duration-200 ${isSelected ? 'ring-2 ring-emerald-500 ring-opacity-50' : ''}`}>
                    {/* Checkbox */}
                    <td className={`px-1.5 py-2 whitespace-nowrap sticky left-0 ${stickyBgClass} z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]`}>
                      <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={e => handleSelectProduct(product.id, e.target.checked)} 
                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        aria-label={`Выбрать ${product.name}`} 
                      />
                    </td>
                    {/* Название товара */}
                    <td className={`px-1.5 py-2 whitespace-nowrap sticky left-8 ${stickyBgClass} z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r border-slate-200 dark:border-slate-700`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(product)}
                        <div className="font-medium text-xs truncate max-w-[100px] lg:max-w-[150px]">
                          {product.name}
                        </div>
                      </div>
                    </td>
                    {/* Средняя цена продажи */}
                    <td className="px-1.5 py-2 whitespace-nowrap text-xs font-medium">
                      {formatCurrency(product.averageSellingPrice)}
                    </td>
                    {/* Себестоимость в лирах - редактируемое */}
                    <td className="px-1.5 py-2 whitespace-nowrap bg-emerald-50 dark:bg-emerald-900/20">
                      {editingField?.id === product.id && editingField?.field === 'costPriceTRY' ? <div className="flex items-center space-x-1">
                          <input 
                            type="number" 
                            value={editValue} 
                            onChange={e => setEditValue(e.target.value)} 
                            className="w-14 px-1 py-0.5 text-xs border border-emerald-300 rounded focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-slate-800" 
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSave();
                              if (e.key === 'Escape') handleCancel();
                            }} 
                            autoFocus 
                            aria-label="Себестоимость в лирах"
                          />
                          <button onClick={handleSave} className="text-green-600 hover:text-green-800 transition-colors text-xs" aria-label="Сохранить">
                            ✓
                          </button>
                          <button onClick={handleCancel} className="text-red-600 hover:text-red-800 transition-colors text-xs" aria-label="Отмена">
                            ✕
                          </button>
                        </div> : <div className="flex items-center space-x-1">
                          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                            {product.costPriceTRY.toFixed(0)}
                          </span>
                          <button 
                            onClick={() => handleEdit(product.id, 'costPriceTRY', product.costPriceTRY)} 
                            className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200 transition-colors opacity-0 group-hover:opacity-100 lg:opacity-100"
                            aria-label="Редактировать себестоимость"
                          >
                            <Edit2 className="h-2.5 w-2.5" />
                          </button>
                        </div>}
                    </td>
                    {/* TRY Rate - новая колонка */}
                    <td className="px-1.5 py-2 whitespace-nowrap bg-blue-50 dark:bg-blue-900/20">
                      {editingField?.id === product.id && editingField?.field === 'tryRate' ? <div className="flex items-center space-x-1">
                          <input type="number" step="0.01" min="0.01" max="50" value={editValue} onChange={e => setEditValue(e.target.value)} className="w-14 px-1 py-0.5 text-xs border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-800" onKeyDown={e => {
                      if (e.key === 'Enter') handleSave();
                      if (e.key === 'Escape') handleCancel();
                    }} autoFocus />
                          <button onClick={handleSave} className="text-green-600 hover:text-green-800 transition-colors text-xs">
                            ✓
                          </button>
                          <button onClick={handleCancel} className="text-red-600 hover:text-red-800 transition-colors text-xs">
                            ✕
                          </button>
                        </div> : <div className="flex items-center space-x-1">
                          <span className={`text-xs font-semibold ${product.tryRate ? 'text-blue-700 dark:text-blue-300' : 'text-blue-500 dark:text-blue-400'}`}>
                            {product.tryRate || product.exchangeRate ? (product.tryRate || product.exchangeRate).toFixed(2) : '—'}
                          </span>
                          <button onClick={() => handleEdit(product.id, 'tryRate', product.tryRate || exchangeRate)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors">
                            <Edit2 className="h-2.5 w-2.5" />
                          </button>
                        </div>}
                    </td>
                    {/* Себестоимость в рублях - автоматический расчет */}
                    <td className="px-1.5 py-2 whitespace-nowrap text-xs">
                      {formatCurrency(product.costPriceRUB)}
                    </td>
                    {/* Расходы - редактируемое */}
                    <td className="px-1.5 py-2 whitespace-nowrap">
                      {editingField?.id === product.id && editingField?.field === 'logisticsCost' ? <div className="flex items-center space-x-1">
                          <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)} className="w-16 px-1 py-0.5 text-xs border border-border rounded focus:ring-1 focus:ring-blue-500" onKeyDown={e => {
                      if (e.key === 'Enter') handleSave();
                      if (e.key === 'Escape') handleCancel();
                    }} autoFocus />
                          <button onClick={handleSave} className="text-green-600 hover:text-green-800 transition-colors text-xs">
                            ✓
                          </button>
                          <button onClick={handleCancel} className="text-red-600 hover:text-red-800 transition-colors text-xs">
                            ✕
                          </button>
                        </div> : <div className="flex items-center space-x-1">
                          <div className="relative group">
                            <span className="text-xs cursor-help">
                              {formatCurrency(product.logisticsCost)}
                            </span>
                            <div className="absolute bottom-full left-0 mb-2 w-40 p-1.5 bg-slate-900 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-40">
                              <div className="space-y-0.5">
                                <p>Доставка: 350</p>
                                <p>Реклама: {formatCurrency(Math.max(0, product.logisticsCost - 350) * 0.6)}</p>
                                <p>Логистика: {formatCurrency(Math.max(0, product.logisticsCost - 350) * 0.4)}</p>
                              </div>
                              <div className="absolute top-full left-4 -mt-1">
                                <div className="border-4 border-transparent border-t-slate-900"></div>
                              </div>
                            </div>
                          </div>
                          <button onClick={() => handleEdit(product.id, 'logisticsCost', product.logisticsCost)} className="text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">
                            <Edit2 className="h-2.5 w-2.5" />
                          </button>
                        </div>}
                    </td>
                    {/* Оборот - выручка за период */}
                    <td className="px-1.5 py-2 whitespace-nowrap text-xs">
                      <span className="font-medium">
                        {formatCurrency(product.revenue || 0)}
                      </span>
                    </td>
                    {/* Наценка */}
                    <td className="px-1.5 py-2 whitespace-nowrap text-xs">
                      <span className={`font-medium ${product.markup > 50 ? 'text-green-600' : product.markup > 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {formatPercent(product.markup)}
                      </span>
                    </td>
                    {/* Маржа в процентах */}
                    <td className="px-1.5 py-2 whitespace-nowrap text-xs">
                      <span className={`font-medium ${product.marginPercent > 30 ? 'text-green-600' : product.marginPercent > 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {formatPercent(product.marginPercent)}
                      </span>
                    </td>
                    {/* Чистая прибыль */}
                    <td className="px-1.5 py-2 whitespace-nowrap text-xs">
                      <span className={`font-medium ${product.netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(product.netProfit)}
                      </span>
                    </td>
                    {/* Чистая прибыль за весь период */}
                    <td className="px-1.5 py-2 whitespace-nowrap text-xs">
                      <span className={`font-medium ${product.netProfitTotal > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(product.netProfitTotal)}
                      </span>
                    </td>
                    {/* Процент прибыли общий */}
                    <td className="px-1.5 py-2 whitespace-nowrap text-xs">
                      <span className={`font-medium ${product.profitPercentTotal > 20 ? 'text-green-600' : product.profitPercentTotal > 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {formatPercent(product.profitPercentTotal)}
                      </span>
                    </td>
                    {/* Продано за период */}
                    <td className="px-1.5 py-2 whitespace-nowrap text-xs">
                      <div className="relative group">
                        <div>
                          <div className="font-medium">{product.soldQuantity}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {product.soldPeriod}д
                          </div>
                        </div>
                        {product.firstSaleDate && (
                          <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-40">
                            <div className="space-y-1">
                              <p className="font-semibold">Первая продажа:</p>
                              <p>{new Date(product.firstSaleDate).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}</p>
                            </div>
                            <div className="absolute top-full left-4 -mt-1">
                              <div className="border-4 border-transparent border-t-slate-900"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Среднее потребление в сутки */}
                    <td className="px-1.5 py-2 whitespace-nowrap text-xs">
                      {product.averageConsumptionDaily.toFixed(1)}
                    </td>
                    {/* Остаток сейчас */}
                    <td className="px-1.5 py-2 whitespace-nowrap">
                      <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${product.currentStock > 50 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : product.currentStock > 20 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                        {product.currentStock}
                      </span>
                    </td>
                    {/* В доставке едет с кнопкой "Оприходовать" */}
                    <td className="px-1.5 py-2 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <span className="text-xs">
                          {product.inDelivery} 
                        </span>
                        {product.inDelivery > 0 && <button 
                          onClick={() => onReceiveDelivery(product.id)} 
                          className="inline-flex items-center px-1 py-0.5 text-[10px] bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors"
                          aria-label="Оприходовать товар"
                        >
                            <Package2 className="h-2.5 w-2.5" />
                          </button>}
                      </div>
                    </td>
                    {/* Кол-во дней запаса */}
                    <td className="px-1.5 py-2 whitespace-nowrap text-xs">
                      <span className={`font-medium ${product.daysInStock < 7 ? 'text-red-600' : product.daysInStock < 14 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {product.daysInStock.toFixed(0)}
                      </span>
                    </td>
                    {/* Точка заказа */}
                    <td className="px-1.5 py-2 whitespace-nowrap">
                      {product.orderPoint ? <span className="inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Заказ
                        </span> : <span className="inline-flex px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          ОК
                        </span>}
                    </td>
                  </tr>;
            })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Mobile Cards - Shown only on mobile */}
      <div className="sm:hidden space-y-3">
        {products.map(product => {
        const isSelected = selectedProducts.includes(product.id);
        return <div key={product.id} className={`
                bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl
                border border-border rounded-xl p-3 space-y-3
                transition-all duration-200
                hover:shadow-lg active:scale-[0.98]
                ${isSelected ? 'ring-2 ring-emerald-500 ring-opacity-50 bg-emerald-50/20 dark:bg-emerald-900/10' : ''}
                ${product.orderPoint ? 'border-red-200 dark:border-red-800 bg-red-50/20 dark:bg-red-900/5' : ''}
              `}>
              {/* Header with Checkbox and Name */}
              <div className="flex items-start space-x-3">
                <input 
                  type="checkbox" 
                  checked={isSelected} 
                  onChange={e => handleSelectProduct(product.id, e.target.checked)} 
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 flex-shrink-0 mt-0.5" 
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {getStatusIcon(product)}
                    <span className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                      {product.name}
                    </span>
                  </div>
                  {/* Price and Profit on same line */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {formatCurrency(product.averageSellingPrice)}
                    </span>
                    <span className={`font-medium ${product.netProfitTotal > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(product.netProfitTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between">
                {product.orderPoint ? (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Нужен заказ
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    В норме
                  </span>
                )}
                
                {/* Profit margin badge */}
                <span className={`
                  inline-flex items-center px-2 py-1 text-xs font-medium rounded-md
                  ${product.profitPercentTotal > 20 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200' : 
                    product.profitPercentTotal > 10 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200' : 
                    'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'}
                `}>
                  {formatPercent(product.profitPercentTotal)}
                </span>
              </div>

              {/* Compact metrics grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Остаток:</span>
                  <span className={`
                    text-xs font-medium
                    ${product.currentStock > 50 ? 'text-green-600 dark:text-green-400' : 
                      product.currentStock > 20 ? 'text-yellow-600 dark:text-yellow-400' : 
                      'text-red-600 dark:text-red-400'}
                  `}>
                    {product.currentStock} шт
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Дней:</span>
                  <span className={`
                    text-xs font-medium
                    ${product.daysInStock < 7 ? 'text-red-600 dark:text-red-400' : 
                      product.daysInStock < 14 ? 'text-yellow-600 dark:text-yellow-400' : 
                      'text-green-600 dark:text-green-400'}
                  `}>
                    {product.daysInStock.toFixed(1)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Продано:</span>
                  <span className="text-xs font-medium text-slate-900 dark:text-slate-100">
                    {product.soldQuantity} шт
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">В пути:</span>
                  <span className="text-xs font-medium text-slate-900 dark:text-slate-100">
                    {product.inDelivery || '—'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Оборот:</span>
                  <span className="text-xs font-medium text-slate-900 dark:text-slate-100">
                    {formatCurrency(product.revenue || 0)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Маржа:</span>
                  <span className={`
                    text-xs font-medium
                    ${product.marginPercent > 30 ? 'text-green-600 dark:text-green-400' : 
                      product.marginPercent > 15 ? 'text-yellow-600 dark:text-yellow-400' : 
                      'text-red-600 dark:text-red-400'}
                  `}>
                    {formatPercent(product.marginPercent)}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              {product.inDelivery > 0 && (
                <button 
                  onClick={() => onReceiveDelivery(product.id)} 
                  className="w-full flex items-center justify-center px-3 py-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-lg transition-colors text-sm font-medium"
                >
                  <Package2 className="h-4 w-4 mr-2" />
                  Оприходовать {product.inDelivery} шт
                </button>
              )}
              
              {/* Expandable details */}
              <details className="group">
                <summary className="flex items-center justify-between text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  <span>Подробности</span>
                  <span className="transform group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                
                <div className="mt-2 pt-2 border-t border-border/50 space-y-2">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Себестоимость:</span>
                      <span className="font-medium">{product.costPriceTRY.toFixed(0)} TRY</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Курс:</span>
                      <span className="font-medium">{(product.tryRate || product.exchangeRate).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">В рублях:</span>
                      <span className="font-medium">{formatCurrency(product.costPriceRUB)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Расходы:</span>
                      <span className="font-medium">{formatCurrency(product.logisticsCost)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Потребление:</span>
                      <span className="font-medium">{product.averageConsumptionDaily.toFixed(2)}/день</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Наценка:</span>
                      <span className="font-medium">{formatPercent(product.markup)}</span>
                    </div>
                  </div>
                </div>
              </details>
            </div>;
      })}
      </div>
    </div>;
}