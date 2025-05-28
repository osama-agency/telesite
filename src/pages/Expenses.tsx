import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Receipt, Edit2, Trash2, Calendar, Package, Truck, Megaphone, Users, MoreHorizontal } from 'lucide-react';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { ExpenseChart } from '../components/ExpenseChart';
export interface Expense {
  id: string;
  date: string;
  type: 'logistics' | 'advertising' | 'courier' | 'payroll' | 'other';
  description: string;
  amount: number;
  productId?: string;
  productName?: string;
  createdAt: string;
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
  const expenseTypes = [{
    id: 'logistics',
    name: 'Логистика',
    icon: Truck,
    color: 'blue'
  }, {
    id: 'advertising',
    name: 'Реклама',
    icon: Megaphone,
    color: 'purple'
  }, {
    id: 'courier',
    name: 'Курьер',
    icon: Package,
    color: 'green'
  }, {
    id: 'payroll',
    name: 'ФОТ',
    icon: Users,
    color: 'orange'
  }, {
    id: 'other',
    name: 'Прочее',
    icon: MoreHorizontal,
    color: 'gray'
  }];
  useEffect(() => {
    // Загружаем расходы из localStorage
    const loadExpenses = () => {
      const savedExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
      // Добавляем демо данные если их нет
      if (savedExpenses.length === 0) {
        const demoExpenses: Expense[] = [{
          id: '1',
          date: '2024-01-15',
          type: 'logistics',
          description: 'Доставка товаров из Турции',
          amount: 15000,
          createdAt: '2024-01-15T10:00:00Z'
        }, {
          id: '2',
          date: '2024-01-18',
          type: 'advertising',
          description: 'Реклама в Яндекс.Директ',
          amount: 25000,
          createdAt: '2024-01-18T14:30:00Z'
        }, {
          id: '3',
          date: '2024-01-20',
          type: 'courier',
          description: 'Курьерская доставка клиентам',
          amount: 8500,
          createdAt: '2024-01-20T09:15:00Z'
        }, {
          id: '4',
          date: '2024-01-22',
          type: 'payroll',
          description: 'Зарплата сотрудников',
          amount: 120000,
          createdAt: '2024-01-22T16:00:00Z'
        }, {
          id: '5',
          date: '2024-01-25',
          type: 'other',
          description: 'Офисные расходы',
          amount: 12000,
          createdAt: '2024-01-25T11:45:00Z'
        }];
        localStorage.setItem('expenses', JSON.stringify(demoExpenses));
        setExpenses(demoExpenses);
      } else {
        setExpenses(savedExpenses);
      }
      setLoading(false);
    };
    setTimeout(loadExpenses, 500);
  }, []);
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) || expense.productName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || expense.type === selectedType;
    const matchesDateRange = (!dateRange.start || expense.date >= dateRange.start) && (!dateRange.end || expense.date <= dateRange.end);
    return matchesSearch && matchesType && matchesDateRange;
  });
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const getTypeInfo = (type: string) => {
    return expenseTypes.find(t => t.id === type) || expenseTypes[4];
  };
  const getTypeColor = (type: string) => {
    const typeInfo = getTypeInfo(type);
    const colors = {
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[typeInfo.color as keyof typeof colors];
  };
  const handleAddExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
  };
  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsAddExpenseModalOpen(true);
  };
  const handleUpdateExpense = (updatedExpense: Omit<Expense, 'id' | 'createdAt'>) => {
    if (!editingExpense) return;
    const updated: Expense = {
      ...updatedExpense,
      id: editingExpense.id,
      createdAt: editingExpense.createdAt
    };
    const updatedExpenses = expenses.map(e => e.id === editingExpense.id ? updated : e);
    setExpenses(updatedExpenses);
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
    setEditingExpense(null);
  };
  const handleDeleteExpense = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот расход?')) {
      const updatedExpenses = expenses.filter(e => e.id !== id);
      setExpenses(updatedExpenses);
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
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
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-border shadow-xl p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input type="text" placeholder="Поиск по описанию или товару..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" />
          </div>
          <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all">
            <option value="all">Все типы</option>
            {expenseTypes.map(type => <option key={type.id} value={type.id}>
                {type.name}
              </option>)}
          </select>
          <div className="flex gap-2">
            <input type="date" value={dateRange.start} onChange={e => setDateRange(prev => ({
            ...prev,
            start: e.target.value
          }))} className="px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" />
            <input type="date" value={dateRange.end} onChange={e => setDateRange(prev => ({
            ...prev,
            end: e.target.value
          }))} className="px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" />
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
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(expense.type)}`}>
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
                        {expense.productName ? <div className="flex items-center space-x-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span>{expense.productName}</span>
                          </div> : <span className="text-muted-foreground">—</span>}
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
    </div>;
}