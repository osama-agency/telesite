import React, { useState } from 'react';
import { Edit2, TrendingUp, AlertTriangle, CheckCircle, DollarSign, Package2, Edit3 } from 'lucide-react';
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
  averageConsumptionDaily: number;
  currentStock: number;
  inDelivery: number;
  daysInStock: number;
  orderPoint: boolean;
  exchangeRate: number;
  fixedCosts: number;
  deliveryDays: number;
  tryRate?: number; // New field for per-row exchange rate
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
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };
  const formatPercent = (value: number) => {
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
    return <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-xl">
        <div className="h-64 flex items-center justify-center">
          <div className="text-muted-foreground">Загрузка товаров...</div>
        </div>
      </div>;
  }
  const isAllSelected = products.length > 0 && selectedProducts.length === products.length;
  const isPartiallySelected = selectedProducts.length > 0 && selectedProducts.length < products.length;
  return <div>
      {/* Desktop Table - Hidden on mobile */}
      <div className="hidden sm:block">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-4 text-left sticky left-0 bg-inherit z-20">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" checked={isAllSelected} ref={input => {
                      if (input) input.indeterminate = isPartiallySelected;
                    }} onChange={e => handleSelectAll(e.target.checked)} className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" />
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left sticky left-12 bg-inherit z-20">
                    <div className="flex items-center space-x-2">
                      <div className="font-medium text-sm">Товар</div>
                    </div>
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Цена продажи
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Себестоимость TRY
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    TRY Rate
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Себестоимость RUB
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Расходы
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Наценка %
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Маржа %
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Чистая прибыль
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Прибыль за период
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    % прибыли общий
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Продано
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Потребление/день
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Остаток
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    В доставке
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Дней запаса
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {products.map(product => {
                const isSelected = selectedProducts.includes(product.id);
                return <tr key={product.id} className={`${getRowColor(product)} hover:shadow-lg transition-all duration-200 ${isSelected ? 'ring-2 ring-emerald-500 ring-opacity-50' : ''}`}>
                      {/* Checkbox */}
                      <td className="px-4 py-4 whitespace-nowrap sticky left-0 bg-inherit z-10">
                        <input type="checkbox" checked={isSelected} onChange={e => handleSelectProduct(product.id, e.target.checked)} className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" />
                      </td>
                      {/* Название товара */}
                      <td className="px-4 py-4 whitespace-nowrap sticky left-12 bg-inherit z-10">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(product)}
                          <div className="font-medium text-sm">
                            {product.name}
                          </div>
                        </div>
                      </td>
                      {/* Средняя цена продажи */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        {formatCurrency(product.averageSellingPrice)}
                      </td>
                      {/* Себестоимость в лирах - редактируемое */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {editingField?.id === product.id && editingField?.field === 'costPriceTRY' ? <div className="flex items-center space-x-2">
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
                            <span className="text-sm">
                              {formatCurrency(product.costPriceTRY, 'TRY')}
                            </span>
                            <button onClick={() => handleEdit(product.id, 'costPriceTRY', product.costPriceTRY)} className="text-muted-foreground hover:text-foreground transition-colors">
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </div>}
                      </td>
                      {/* TRY Rate - новая колонка */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {editingField?.id === product.id && editingField?.field === 'tryRate' ? <div className="flex items-center space-x-2">
                            <input type="number" step="0.01" min="0.01" max="50" value={editValue} onChange={e => setEditValue(e.target.value)} className="w-20 px-2 py-1 text-sm border border-border rounded-lg focus:ring-2 focus:ring-blue-500" onKeyDown={e => {
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
                            <span className={`text-sm ${product.tryRate ? '' : 'text-muted-foreground'}`}>
                              {formatRate(product.tryRate)}
                            </span>
                            <button onClick={() => handleEdit(product.id, 'tryRate', product.tryRate || exchangeRate)} className="text-muted-foreground hover:text-foreground transition-colors">
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </div>}
                      </td>
                      {/* Себестоимость в рублях - автоматический расчет */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {formatCurrency(product.costPriceRUB)}
                      </td>
                      {/* Расходы - редактируемое */}
                      <td className="px-4 py-4 whitespace-nowrap">
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
                            <span className="text-sm">
                              {formatCurrency(product.logisticsCost)}
                            </span>
                            <button onClick={() => handleEdit(product.id, 'logisticsCost', product.logisticsCost)} className="text-muted-foreground hover:text-foreground transition-colors">
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </div>}
                      </td>
                      {/* Наценка */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className={`font-medium ${product.markup > 50 ? 'text-green-600' : product.markup > 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {formatPercent(product.markup)}
                        </span>
                      </td>
                      {/* Маржа в процентах */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className={`font-medium ${product.marginPercent > 30 ? 'text-green-600' : product.marginPercent > 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {formatPercent(product.marginPercent)}
                        </span>
                      </td>
                      {/* Чистая прибыль */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className={`font-medium ${product.netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(product.netProfit)}
                        </span>
                      </td>
                      {/* Чистая прибыль за весь период */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className={`font-medium ${product.netProfitTotal > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(product.netProfitTotal)}
                        </span>
                      </td>
                      {/* Процент прибыли общий */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className={`font-medium ${product.profitPercentTotal > 20 ? 'text-green-600' : product.profitPercentTotal > 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {formatPercent(product.profitPercentTotal)}
                        </span>
                      </td>
                      {/* Продано за период */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {product.soldPeriod} шт
                      </td>
                      {/* Среднее потребление в сутки */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        {product.averageConsumptionDaily.toFixed(2)} шт/день
                      </td>
                      {/* Остаток сейчас */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.currentStock > 50 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : product.currentStock > 20 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                          {product.currentStock} шт
                        </span>
                      </td>
                      {/* В доставке едет с кнопкой "Оприходовать" */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">
                            {product.inDelivery} шт
                          </span>
                          {product.inDelivery > 0 && <button onClick={() => onReceiveDelivery(product.id)} className="inline-flex items-center px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 transition-colors">
                              <Package2 className="h-3 w-3 mr-1" />
                              Оприходовать
                            </button>}
                        </div>
                      </td>
                      {/* Кол-во дней запаса */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className={`font-medium ${product.daysInStock < 7 ? 'text-red-600' : product.daysInStock < 14 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {product.daysInStock.toFixed(1)} дней
                        </span>
                      </td>
                      {/* Точка заказа */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {product.orderPoint ? <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            Нужен заказ
                          </span> : <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            В норме
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
      <div className="sm:hidden space-y-4">
        {products.map(product => {
        const isSelected = selectedProducts.includes(product.id);
        return <div key={product.id} className={`
                bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
                border border-border rounded-xl p-4 space-y-4
                transition-all duration-200
                hover:shadow-lg
                ${isSelected ? 'ring-2 ring-emerald-500 ring-opacity-50' : ''}
                ${product.orderPoint ? 'border-red-200 dark:border-red-800' : ''}
              `}>
              {/* Header with Checkbox and Name */}
              <div className="flex items-center space-x-3">
                <input type="checkbox" checked={isSelected} onChange={e => handleSelectProduct(product.id, e.target.checked)} className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" />
                <div className="flex-1 flex items-center space-x-2">
                  {getStatusIcon(product)}
                  <span className="font-medium">{product.name}</span>
                </div>
              </div>
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {product.orderPoint ? <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Нужен заказ
                    </span> : <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                      <CheckCircle className="w-4 h-4 mr-1" />В норме
                    </span>}
                </div>
              </div>
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Остаток</span>
                  <div className={`
                    text-sm font-medium px-2 py-1 rounded-lg inline-block
                    ${product.currentStock > 50 ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200' : product.currentStock > 20 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'}
                  `}>
                    {product.currentStock} шт
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">
                    Дней запаса
                  </span>
                  <div className={`text-sm font-medium ${product.daysInStock < 7 ? 'text-red-600' : product.daysInStock < 14 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {product.daysInStock.toFixed(1)} дней
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">
                    Прибыль за период
                  </span>
                  <div className={`text-sm font-medium ${product.netProfitTotal > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(product.netProfitTotal)}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">В пути</span>
                  <div className="text-sm">
                    {product.inDelivery > 0 ? <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {product.inDelivery} шт
                        </span>
                      </div> : <span className="text-muted-foreground">—</span>}
                  </div>
                </div>
              </div>
              {/* Receive Button */}
              {product.inDelivery > 0 && <button onClick={() => onReceiveDelivery(product.id)} className="w-full mt-2 inline-flex items-center justify-center px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors">
                  <Package2 className="h-4 w-4 mr-2" />
                  Оприходовать {product.inDelivery} шт
                </button>}
            </div>;
      })}
      </div>
    </div>;
}