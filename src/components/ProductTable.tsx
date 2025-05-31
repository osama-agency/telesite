import React, { useState } from 'react';
import { Edit2, TrendingUp, AlertTriangle, CheckCircle, DollarSign, Package2, Edit3, Info } from 'lucide-react';
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
      return currency === 'RUB' ? '₽0' : '0';
    }
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
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
    if (product.orderPoint) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (product.profitPercentTotal < 10) return <DollarSign className="h-4 w-4 text-yellow-500" />;
    if (product.profitPercentTotal > 20) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <TrendingUp className="h-4 w-4 text-blue-500" />;
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
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border rounded-xl lg:rounded-2xl shadow-xl">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 sticky top-0 z-10">
                <tr>
                  <th className="px-2 sm:px-4 py-3 sm:py-4 text-left sticky left-0 bg-gradient-to-r from-slate-100 to-slate-100 dark:from-slate-800 dark:to-slate-800 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
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
                  <th className="px-2 sm:px-4 py-3 sm:py-4 text-left sticky left-8 sm:left-12 bg-gradient-to-r from-slate-100 to-slate-100 dark:from-slate-800 dark:to-slate-800 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r-2 border-slate-300 dark:border-slate-600">
                    <div className="flex items-center space-x-2">
                      <div className="font-medium text-xs sm:text-sm">Товар</div>
                    </div>
                  </th>
                  <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Цена продажи
                  </th>
                  <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/20">
                    <div className="flex items-center space-x-1">
                      <span className="hidden md:inline">Себестоимость</span>
                      <span className="md:hidden">Себест.</span>
                      <span>TRY</span>
                      <Edit3 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </th>
                  <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex items-center space-x-1">
                      <span>TRY Rate</span>
                      <TrendingUp className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    </div>
                  </th>
                  <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider hidden lg:table-cell">
                    Себест. RUB
                  </th>
                  <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <span className="hidden md:inline">Расходы на ед.</span>
                      <span className="md:hidden">Расходы</span>
                      <div className="relative group">
                        <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 sm:w-64 p-2 sm:p-3 bg-slate-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                          <div className="space-y-1">
                            <p className="font-semibold">Включает:</p>
                            <p>• Доставка курьером: 350₽/уп</p>
                            <p>• Распределенная реклама</p>
                            <p>• Распределенная логистика</p>
                          </div>
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="border-4 border-transparent border-t-slate-900"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </th>
                  <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider hidden xl:table-cell">
                    Оборот
                  </th>
                  <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider hidden lg:table-cell">
                    Наценка %
                  </th>
                  <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider hidden lg:table-cell">
                    Маржа %
                  </th>
                  <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    <span className="hidden md:inline">Чистая прибыль</span>
                    <span className="md:hidden">Прибыль</span>
                  </th>
                  <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    <span className="hidden lg:inline">Прибыль за период</span>
                    <span className="lg:hidden">За период</span>
                  </th>
                  <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    % прибыли
                  </th>
                  <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider hidden 2xl:table-cell">
                    Продано
                  </th>
                  <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider hidden 2xl:table-cell">
                    Потребление/день
                  </th>
                  <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Остаток
                  </th>
                  <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    <span className="hidden lg:inline">В доставке</span>
                    <span className="lg:hidden">В пути</span>
                  </th>
                  <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider hidden xl:table-cell">
                    Дней запаса
                  </th>
                  <th className="px-2 sm:px-4 py-3 sm:py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
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
                      <td className={`px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap sticky left-0 ${stickyBgClass} z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]`}>
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={e => handleSelectProduct(product.id, e.target.checked)} 
                          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                          aria-label={`Выбрать ${product.name}`} 
                        />
                      </td>
                      {/* Название товара */}
                      <td className={`px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap sticky left-8 sm:left-12 ${stickyBgClass} z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] border-r-2 border-slate-200 dark:border-slate-700`}>
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          {getStatusIcon(product)}
                          <div className="font-medium text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[150px] lg:max-w-[200px]">
                            {product.name}
                          </div>
                        </div>
                      </td>
                      {/* Средняя цена продажи */}
                      <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                        {formatCurrency(product.averageSellingPrice)}
                      </td>
                      {/* Себестоимость в лирах - редактируемое */}
                      <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap bg-emerald-50 dark:bg-emerald-900/20">
                        {editingField?.id === product.id && editingField?.field === 'costPriceTRY' ? <div className="flex items-center space-x-1 sm:space-x-2">
                            <input 
                              type="number" 
                              value={editValue} 
                              onChange={e => setEditValue(e.target.value)} 
                              className="w-16 sm:w-24 px-1 sm:px-2 py-1 text-xs sm:text-sm border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800" 
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleSave();
                                if (e.key === 'Escape') handleCancel();
                              }} 
                              autoFocus 
                              aria-label="Себестоимость в лирах"
                            />
                            <button onClick={handleSave} className="text-green-600 hover:text-green-800 transition-colors" aria-label="Сохранить">
                              ✓
                            </button>
                            <button onClick={handleCancel} className="text-red-600 hover:text-red-800 transition-colors" aria-label="Отмена">
                              ✕
                            </button>
                          </div> : <div className="flex items-center space-x-1 sm:space-x-2">
                            <span className="text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-300">
                              <span className="hidden sm:inline">{product.costPriceTRY.toFixed(0)} TRY</span>
                              <span className="sm:hidden">{product.costPriceTRY.toFixed(0)}</span>
                            </span>
                            <button 
                              onClick={() => handleEdit(product.id, 'costPriceTRY', product.costPriceTRY)} 
                              className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-200 transition-colors opacity-0 group-hover:opacity-100 lg:opacity-100"
                              aria-label="Редактировать себестоимость"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </div>}
                      </td>
                      {/* TRY Rate - новая колонка */}
                      <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap bg-blue-50 dark:bg-blue-900/20">
                        {editingField?.id === product.id && editingField?.field === 'tryRate' ? <div className="flex items-center space-x-2">
                            <input type="number" step="0.01" min="0.01" max="50" value={editValue} onChange={e => setEditValue(e.target.value)} className="w-20 px-2 py-1 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800" onKeyDown={e => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') handleCancel();
                      }} autoFocus />
                            <button onClick={handleSave} className="text-green-600 hover:text-green-800 transition-colors">
                              ✓
                            </button>
                            <button onClick={handleCancel} className="text-red-600 hover:text-red-800 transition-colors">
                              ✕
                            </button>
                          </div> : <div className="flex items-center space-x-2">
                            <span className={`text-sm font-semibold ${product.tryRate ? 'text-blue-700 dark:text-blue-300' : 'text-blue-500 dark:text-blue-400'}`}>
                              {product.tryRate || product.exchangeRate ? (product.tryRate || product.exchangeRate).toFixed(2) : '—'}
                            </span>
                            <button onClick={() => handleEdit(product.id, 'tryRate', product.tryRate || exchangeRate)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors">
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </div>}
                      </td>
                      {/* Себестоимость в рублях - автоматический расчет */}
                      <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm hidden lg:table-cell">
                        {formatCurrency(product.costPriceRUB)}
                      </td>
                      {/* Расходы - редактируемое */}
                      <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                        {editingField?.id === product.id && editingField?.field === 'logisticsCost' ? <div className="flex items-center space-x-2">
                            <input type="number" value={editValue} onChange={e => setEditValue(e.target.value)} className="w-24 px-2 py-1 text-sm border border-border rounded-lg focus:ring-2 focus:ring-blue-500" onKeyDown={e => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') handleCancel();
                      }} autoFocus />
                            <button onClick={handleSave} className="text-green-600 hover:text-green-800 transition-colors">
                              ✓
                            </button>
                            <button onClick={handleCancel} className="text-red-600 hover:text-red-800 transition-colors">
                              ✕
                            </button>
                          </div> : <div className="flex items-center space-x-2">
                            <div className="relative group">
                              <span className="text-sm cursor-help">
                                {formatCurrency(product.logisticsCost)}
                              </span>
                              <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-40">
                                <div className="space-y-1">
                                  <p>Доставка: ₽350</p>
                                  <p>Реклама: {formatCurrency(Math.max(0, product.logisticsCost - 350) * 0.6)}</p>
                                  <p>Логистика: {formatCurrency(Math.max(0, product.logisticsCost - 350) * 0.4)}</p>
                                </div>
                                <div className="absolute top-full left-4 -mt-1">
                                  <div className="border-4 border-transparent border-t-slate-900"></div>
                                </div>
                              </div>
                            </div>
                            <button onClick={() => handleEdit(product.id, 'logisticsCost', product.logisticsCost)} className="text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </div>}
                      </td>
                      {/* Оборот - выручка за период */}
                      <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm hidden xl:table-cell">
                        <span className="font-medium">
                          {formatCurrency(product.revenue || 0)}
                        </span>
                      </td>
                      {/* Наценка */}
                      <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm hidden lg:table-cell">
                        <span className={`font-medium ${product.markup > 50 ? 'text-green-600' : product.markup > 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {formatPercent(product.markup)}
                        </span>
                      </td>
                      {/* Маржа в процентах */}
                      <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm hidden lg:table-cell">
                        <span className={`font-medium ${product.marginPercent > 30 ? 'text-green-600' : product.marginPercent > 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {formatPercent(product.marginPercent)}
                        </span>
                      </td>
                      {/* Чистая прибыль */}
                      <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                        <span className={`font-medium ${product.netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(product.netProfit)}
                        </span>
                      </td>
                      {/* Чистая прибыль за весь период */}
                      <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                        <span className={`font-medium ${product.netProfitTotal > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(product.netProfitTotal)}
                        </span>
                      </td>
                      {/* Процент прибыли общий */}
                      <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                        <span className={`font-medium ${product.profitPercentTotal > 20 ? 'text-green-600' : product.profitPercentTotal > 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {formatPercent(product.profitPercentTotal)}
                        </span>
                      </td>
                      {/* Продано за период */}
                      <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm hidden 2xl:table-cell">
                        <div className="relative group">
                          <div>
                            <div className="font-medium">{product.soldQuantity} шт</div>
                            <div className="text-xs text-muted-foreground">
                              за {product.soldPeriod} {product.soldPeriod === 1 ? 'день' : 'дней'}
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
                      <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm hidden 2xl:table-cell">
                        {product.averageConsumptionDaily.toFixed(2)} шт/день
                      </td>
                      {/* Остаток сейчас */}
                      <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                        <span className={`inline-flex px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full ${product.currentStock > 50 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : product.currentStock > 20 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                          {product.currentStock}
                          <span className="hidden sm:inline ml-1">шт</span>
                        </span>
                      </td>
                      {/* В доставке едет с кнопкой "Оприходовать" */}
                      <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <span className="text-xs sm:text-sm">
                            {product.inDelivery} 
                            <span className="hidden sm:inline">шт</span>
                          </span>
                          {product.inDelivery > 0 && <button 
                            onClick={() => onReceiveDelivery(product.id)} 
                            className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition-colors"
                            aria-label="Оприходовать товар"
                          >
                              <Package2 className="h-3 w-3 sm:mr-1" />
                              <span className="hidden lg:inline">Оприходовать</span>
                            </button>}
                        </div>
                      </td>
                      {/* Кол-во дней запаса */}
                      <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm hidden xl:table-cell">
                        <span className={`font-medium ${product.daysInStock < 7 ? 'text-red-600' : product.daysInStock < 14 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {product.daysInStock.toFixed(1)} дней
                        </span>
                      </td>
                      {/* Точка заказа */}
                      <td className="px-2 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                        {product.orderPoint ? <span className="inline-flex px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            <span className="hidden sm:inline">Нужен заказ</span>
                            <span className="sm:hidden">Заказ</span>
                          </span> : <span className="inline-flex px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <span className="hidden sm:inline">В норме</span>
                            <span className="sm:hidden">ОК</span>
                          </span>}
                      </td>
                    </tr>;
              })}
              </tbody>
            </table>
          </div>
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