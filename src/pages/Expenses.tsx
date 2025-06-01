import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Receipt, Edit2, Trash2, Calendar, Package, Truck, Megaphone, Users, MoreHorizontal, ShoppingBag, ChevronDown, ChevronUp, X } from 'lucide-react';
import { AddExpenseModal, type ExpenseType } from '../components/AddExpenseModal';
import { ExpenseChart } from '../components/ExpenseChart';
import { expensesApi, type Expense } from '../services/api';

// Компонент для отображения товаров закупки
function PurchaseItemsDisplay({ expense, onShowDetails }: { expense: Expense, onShowDetails?: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!expense.purchaseItems || expense.purchaseItems.length === 0) {
    return expense.productName ? (
      <div className="flex items-center space-x-2">
        <Package className="h-4 w-4 text-muted-foreground" />
        <span>{expense.productName}</span>
      </div>
    ) : (
      <span className="text-muted-foreground">—</span>
    );
  }

  const itemsCount = expense.purchaseItems.length;
  const displayLimit = 3;
  const hasMoreItems = itemsCount > displayLimit;

  return (
    <div className="space-y-2">
      {/* Краткая информация */}
      <button
        onClick={() => {
          if (hasMoreItems && onShowDetails) {
            onShowDetails();
          } else {
            setIsExpanded(!isExpanded);
          }
        }}
        className="flex items-center space-x-2 text-sm hover:text-primary transition-colors"
      >
        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{itemsCount} товар{itemsCount === 1 ? '' : itemsCount < 5 ? 'а' : 'ов'}</span>
        {hasMoreItems && !onShowDetails && (
          isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
        )}
      </button>

      {/* Список товаров (если мало товаров или развернуто) */}
      {(!hasMoreItems || (isExpanded && !onShowDetails)) && (
        <div className="space-y-1 ml-6 text-xs text-muted-foreground">
          {expense.purchaseItems.slice(0, isExpanded ? undefined : displayLimit).map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="truncate max-w-[200px]">{item.productName}</span>
              <span className="ml-2 whitespace-nowrap">
                {item.quantity} шт. × {item.unitCostTRY} TRY
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* Кнопка "Показать все" для большого количества товаров */}
      {hasMoreItems && onShowDetails && (
        <button 
          onClick={onShowDetails} 
          className="text-xs text-blue-600 hover:text-blue-700 ml-6 underline"
        >
          Показать все товары
        </button>
      )}
    </div>
  );
}

export function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedExpenseForDetails, setSelectedExpenseForDetails] = useState<Expense | null>(null);
  const [isPurchaseDetailsModalOpen, setIsPurchaseDetailsModalOpen] = useState(false);
  const expenseTypes = [{
    id: 'Логистика' as ExpenseType,
    name: 'Логистика',
    icon: Truck,
    color: 'blue'
  }, {
    id: 'Реклама' as ExpenseType,
    name: 'Реклама',
    icon: Megaphone,
    color: 'purple'
  }, {
    id: 'ФОТ' as ExpenseType,
    name: 'ФОТ',
    icon: Users,
    color: 'orange'
  }, {
    id: 'Закупка товара' as ExpenseType,
    name: 'Закупка товара',
    icon: ShoppingBag,
    color: 'emerald'
  }, {
    id: 'Прочее' as ExpenseType,
    name: 'Прочее',
    icon: MoreHorizontal,
    color: 'gray'
  }];
  useEffect(() => {
    // Загружаем расходы из API
    const loadExpenses = async () => {
      setLoading(true);
      try {
        const response = await expensesApi.getAll({ limit: 100 });
        setExpenses(response.data);
      } catch (error) {
        console.error('Failed to load expenses:', error);
        // В случае ошибки загружаем из localStorage
        const savedExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        setExpenses(savedExpenses);
      } finally {
        setLoading(false);
      }
    };
    loadExpenses();
  }, []);
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) || expense.productName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || expense.type === selectedType;
    const matchesDateRange = (!dateRange.start || expense.date >= dateRange.start) && (!dateRange.end || expense.date <= dateRange.end);
    return matchesSearch && matchesType && matchesDateRange;
  });
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const getTypeInfo = (type: string) => {
    return expenseTypes.find(t => t.id === type) || expenseTypes[3];
  };
  const getTypeColor = (type: string, hasPurchaseItems: boolean = false) => {
    const typeInfo = getTypeInfo(type);
    const colors = {
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
    };
    
    return colors[typeInfo.color as keyof typeof colors];
  };
  const handleAddExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    try {
      const newExpense = await expensesApi.create(expense);
      setExpenses(prev => [...prev, newExpense]);
    } catch (error) {
      console.error('Failed to add expense:', error);
    }
  };
  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsAddExpenseModalOpen(true);
  };
  const handleUpdateExpense = async (updatedExpense: Omit<Expense, 'id' | 'createdAt'>) => {
    if (!editingExpense) return;
    
    try {
      const updated = await expensesApi.update(editingExpense.id, updatedExpense);
      setExpenses(prev => prev.map(e => e.id === editingExpense.id ? updated : e));
      setEditingExpense(null);
    } catch (error) {
      console.error('Failed to update expense:', error);
    }
  };
  const handleDeleteExpense = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот расход?')) {
      try {
        await expensesApi.delete(id);
        setExpenses(prev => prev.filter(e => e.id !== id));
      } catch (error) {
        console.error('Failed to delete expense:', error);
      }
    }
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };
  return <div className="flex-1 flex flex-col p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 min-h-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Учёт расходов
          </h1>
          <p className="text-muted-foreground mt-1">
            Управление и анализ всех видов расходов
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl px-4 py-2 border border-border">
            <p className="text-sm text-muted-foreground">Общие расходы</p>
            <p className="text-xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
          <button onClick={() => {
          setEditingExpense(null);
          setIsAddExpenseModalOpen(true);
        }} className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <Plus className="h-5 w-5 mr-2" />
            Добавить расход
          </button>
        </div>
      </div>
      {/* Filters */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-border shadow-xl p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Поиск */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground pointer-events-none" />
            <input 
              type="text" 
              placeholder="Поиск..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="w-full pl-8 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-border rounded-xl bg-background focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all placeholder:text-xs sm:placeholder:text-sm" 
              title="Поиск по описанию или товару"
              aria-label="Поиск по описанию или товару"
            />
          </div>
          
          {/* Тип и даты в одном ряду на больших экранах */}
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
            {/* Выбор типа */}
            <select 
              value={selectedType} 
              onChange={e => setSelectedType(e.target.value)} 
              className="w-full lg:w-auto min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-border rounded-xl bg-background focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            >
              <option value="all">Все типы</option>
              {expenseTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            
            {/* Даты */}
            <div className="flex flex-col sm:flex-row gap-2 lg:gap-2 w-full lg:w-auto">
              <input 
                type="date" 
                value={dateRange.start} 
                onChange={e => setDateRange(prev => ({
                  ...prev,
                  start: e.target.value
                }))} 
                className="w-full sm:flex-1 lg:w-auto min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-border rounded-xl bg-background focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
                placeholder="С даты"
              />
              <input 
                type="date" 
                value={dateRange.end} 
                onChange={e => setDateRange(prev => ({
                  ...prev,
                  end: e.target.value
                }))} 
                className="w-full sm:flex-1 lg:w-auto min-w-0 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-border rounded-xl bg-background focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
                placeholder="По дату"
              />
            </div>
          </div>
        </div>
      </div>
      {/* Chart */}
      <ExpenseChart expenses={filteredExpenses} />
      {/* Expenses Table */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-xl">
        {loading ? <div className="p-8 flex items-center justify-center">
            <div className="text-muted-foreground">Загрузка расходов...</div>
          </div> : <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Дата
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Тип
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Описание
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Товар
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Сумма
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredExpenses.map(expense => {
              const typeInfo = getTypeInfo(expense.type);
              const TypeIcon = typeInfo.icon;
              return <tr key={expense.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(expense.date).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <TypeIcon className="h-4 w-4" />
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(expense.type, expense.purchaseItems && expense.purchaseItems.length > 0)}`}>
                            {typeInfo.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="max-w-xs truncate">
                          {expense.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <PurchaseItemsDisplay 
                          expense={expense} 
                          onShowDetails={expense.purchaseItems && expense.purchaseItems.length > 3 ? () => {
                            setSelectedExpenseForDetails(expense);
                            setIsPurchaseDetailsModalOpen(true);
                          } : undefined}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <button onClick={() => handleEditExpense(expense)} className="text-blue-600 hover:text-blue-800 transition-colors">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDeleteExpense(expense.id)} className="text-red-600 hover:text-red-800 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>;
            })}
              </tbody>
            </table>
          </div>}
      </div>
      {/* Add/Edit Expense Modal */}
      <AddExpenseModal isOpen={isAddExpenseModalOpen} onClose={() => {
      setIsAddExpenseModalOpen(false);
      setEditingExpense(null);
    }} onSave={editingExpense ? handleUpdateExpense : handleAddExpense} expense={editingExpense} expenseTypes={expenseTypes} />
      
      {/* Purchase Details Modal */}
      {isPurchaseDetailsModalOpen && selectedExpenseForDetails && selectedExpenseForDetails.purchaseItems && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" 
              onClick={() => setIsPurchaseDetailsModalOpen(false)} 
            />
            <div className="relative bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Детали закупки</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedExpenseForDetails.description}
                  </p>
                </div>
                <button
                  onClick={() => setIsPurchaseDetailsModalOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Summary Info */}
              <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Дата</p>
                    <p className="font-medium">{new Date(selectedExpenseForDetails.date).toLocaleDateString('ru-RU')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Тип расхода</p>
                    <p className="font-medium">{selectedExpenseForDetails.type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Общая сумма</p>
                    <p className="font-medium text-red-600">{formatCurrency(selectedExpenseForDetails.amount)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Количество товаров</p>
                    <p className="font-medium">{selectedExpenseForDetails.purchaseItems.length}</p>
                  </div>
                </div>
              </div>
              
              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2">Товар</th>
                      <th className="text-right py-3 px-2">Количество</th>
                      <th className="text-right py-3 px-2">Цена за ед. (TRY)</th>
                      <th className="text-right py-3 px-2">Сумма (TRY)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedExpenseForDetails.purchaseItems.map((item, index) => {
                      const totalTRY = item.quantity * item.unitCostTRY;
                      return (
                        <tr key={index} className="border-b border-border/50">
                          <td className="py-3 px-2 font-medium">{item.productName}</td>
                          <td className="text-right py-3 px-2">{item.quantity} шт.</td>
                          <td className="text-right py-3 px-2">{item.unitCostTRY.toFixed(2)}</td>
                          <td className="text-right py-3 px-2">{totalTRY.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border font-semibold">
                      <td colSpan={3} className="py-3 px-2 text-right">Итого в TRY:</td>
                      <td className="text-right py-3 px-2">
                        {selectedExpenseForDetails.purchaseItems
                          .reduce((sum, item) => sum + item.quantity * item.unitCostTRY, 0)
                          .toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              {/* Close Button */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setIsPurchaseDetailsModalOpen(false)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>;
}