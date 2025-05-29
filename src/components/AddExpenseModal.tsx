import React, { useEffect, useState } from 'react';
import { X, Calendar, Package2, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';

export type ExpenseType = 'Логистика' | 'Реклама' | 'ФОТ' | 'Прочее' | 'Закупка товара';

interface ExpenseTypeInfo {
  id: ExpenseType;
  name: string;
  icon: any;
  color: string;
}

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: {
    date: string;
    type: ExpenseType;
    description: string;
    amount: number;
    productId?: string;
    productName?: string;
  }) => void;
  expense?: {
    id: string;
    date: string;
    type: ExpenseType;
    description: string;
    amount: number;
    productId?: string;
    productName?: string;
  } | null;
  expenseTypes: ExpenseTypeInfo[];
}

export function AddExpenseModal({
  isOpen,
  onClose,
  onSave,
  expense,
  expenseTypes
}: AddExpenseModalProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: '' as ExpenseType | '',
    description: '',
    amount: 0,
    productId: '',
    productName: ''
  });
  useEffect(() => {
    if (expense) {
      setFormData({
        date: expense.date,
        type: expense.type,
        description: expense.description,
        amount: expense.amount,
        productId: expense.productId || '',
        productName: expense.productName || ''
      });
    }
  }, [expense]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверяем, что type выбран
    if (!formData.type) {
      return;
    }
    
    onSave({
      ...formData,
      type: formData.type as ExpenseType // Теперь мы знаем, что type не пустой
    });
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: '' as ExpenseType | '',
      description: '',
      amount: 0,
      productId: '',
      productName: ''
    });
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <motion.div 
          initial={{
            scale: 0.95,
            opacity: 0
          }} 
          animate={{
            scale: 1,
            opacity: 1
          }} 
          exit={{
            scale: 0.95,
            opacity: 0
          }} 
          className="relative bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-xl overflow-y-auto max-h-[90vh] p-4 sm:p-6 lg:p-8"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center">
                <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold">
                  {expense ? 'Редактировать расход' : 'Добавить расход'}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Заполните детали расхода
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-accent rounded-lg"
              aria-label="Закрыть"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 sm:mb-2">
                <Calendar className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Дата
              </label>
              <input 
                type="date" 
                value={formData.date} 
                onChange={e => setFormData(prev => ({
                  ...prev,
                  date: e.target.value
                }))} 
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm sm:text-base" 
                required 
                aria-label="Дата расхода"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 sm:mb-2">Тип</label>
              <select 
                value={formData.type} 
                onChange={e => setFormData(prev => ({
                  ...prev,
                  type: e.target.value as ExpenseType
                }))} 
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm sm:text-base" 
                required
                aria-label="Тип расхода"
              >
                <option value="">Выберите тип</option>
                {expenseTypes.map(type => <option key={type.id} value={type.id}>
                    {type.name}
                  </option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 sm:mb-2">Описание</label>
              <input 
                type="text" 
                value={formData.description} 
                onChange={e => setFormData(prev => ({
                  ...prev,
                  description: e.target.value
                }))} 
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm sm:text-base" 
                required 
                placeholder="Краткое описание расхода"
                aria-label="Описание расхода"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 sm:mb-2">
                Сумма (в рублях)
              </label>
              <input 
                type="number" 
                min="0" 
                step="0.01" 
                value={formData.amount} 
                onChange={e => setFormData(prev => ({
                  ...prev,
                  amount: parseFloat(e.target.value) || 0
                }))} 
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm sm:text-base" 
                required 
                placeholder="0.00"
                aria-label="Сумма расхода"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 border border-border rounded-xl hover:bg-accent transition-colors"
              >
                Отмена
              </button>
              <button 
                type="submit" 
                className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                {expense ? 'Сохранить' : 'Добавить'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>;
}