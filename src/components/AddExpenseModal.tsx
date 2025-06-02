import React, { useEffect, useState } from 'react';
import { X, Calendar, Package2, Receipt, Loader2, Truck, Megaphone, Users, MoreHorizontal, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

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
  }) => Promise<void>;
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
  onExpenseAdded?: () => void;
}

export function AddExpenseModal({
  isOpen,
  onClose,
  onSave,
  expense,
  expenseTypes,
  onExpenseAdded
}: AddExpenseModalProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: '' as ExpenseType | '',
    description: '',
    amount: 0,
    productId: '',
    productName: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isClosing, setIsClosing] = useState(false);

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
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        type: '' as ExpenseType | '',
        description: '',
        amount: 0,
        productId: '',
        productName: ''
      });
    }
    setErrorMessage('');
    setIsSubmitting(false);
    setIsClosing(false);
  }, [expense, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setErrorMessage('');
    
    if (!formData.type) {
      setErrorMessage('Пожалуйста, выберите тип расхода');
      return;
    }
    
    setIsSubmitting(true);

    try {
      await onSave({
        ...formData,
        type: formData.type as ExpenseType
      });

      toast.success(expense ? 'Расход успешно обновлён' : 'Расход успешно добавлен');
      
      setIsClosing(true);
      setTimeout(() => {
        onClose();
        if (onExpenseAdded) {
          onExpenseAdded();
        }
        setFormData({
          date: new Date().toISOString().split('T')[0],
          type: '' as ExpenseType | '',
          description: '',
          amount: 0,
          productId: '',
          productName: ''
        });
        setIsClosing(false);
      }, 200);

    } catch (error) {
      console.error('Failed to save expense:', error);
      setErrorMessage('Не удалось сохранить расход. Пожалуйста, попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  // Функция для получения иконки типа расхода
  const getTypeIcon = (type: ExpenseType) => {
    switch (type) {
      case 'Логистика': return Truck;
      case 'Реклама': return Megaphone;
      case 'ФОТ': return Users;
      case 'Закупка товара': return ShoppingBag;
      default: return MoreHorizontal;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end md:items-center justify-center p-0 md:p-4">
        {/* Backdrop with blur */}
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
          onClick={handleClose} 
          aria-modal="true"
        />
        
        <motion.div 
          initial={{
            y: 100,
            opacity: 0,
            scale: 0.95
          }} 
          animate={{
            y: isClosing ? 100 : 0,
            opacity: isClosing ? 0 : 1,
            scale: isClosing ? 0.95 : 1
          }} 
          exit={{
            y: 100,
            opacity: 0,
            scale: 0.95
          }} 
          transition={{
            duration: 0.3,
            ease: [0.4, 0.0, 0.2, 1]
          }}
          className="relative w-full md:max-w-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[95vh]"
        >
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-white" />
                </div>
                <div className="text-white">
                  <h2 className="text-xl md:text-2xl font-bold">
                    {expense ? 'Редактировать расход' : 'Новый расход'}
                  </h2>
                  <p className="text-sm text-white/80 mt-1">
                    Заполните детали для учета расходов
                  </p>
                </div>
              </div>
              <button 
                onClick={handleClose} 
                disabled={isSubmitting}
                className="text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 p-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Закрыть"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date Field */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <Calendar className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                  Дата расхода
                </label>
                <input 
                  type="date" 
                  value={formData.date} 
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    date: e.target.value
                  }))} 
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed" 
                  required 
                  aria-label="Дата расхода"
                />
              </div>

              {/* Type Field */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <Package2 className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                  Тип расхода
                </label>
                <div className="relative">
                  <select 
                    value={formData.type} 
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      type: e.target.value as ExpenseType
                    }))} 
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed appearance-none" 
                    required
                    aria-label="Тип расхода"
                  >
                    <option value="">Выберите тип расхода</option>
                    {expenseTypes.map(type => {
                      const IconComponent = getTypeIcon(type.id);
                      return (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      );
                    })}
                  </select>
                  {/* Selected type preview */}
                  {formData.type && (
                    <div className="absolute right-12 top-1/2 transform -translate-y-1/2 flex items-center">
                      {(() => {
                        const IconComponent = getTypeIcon(formData.type as ExpenseType);
                        return <IconComponent className="h-4 w-4 text-slate-500" />;
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <Receipt className="h-4 w-4 mr-2 text-slate-500 dark:text-slate-400" />
                  Описание
                </label>
                <input 
                  type="text" 
                  value={formData.description} 
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))} 
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed" 
                  required 
                  placeholder="Например: Доставка товаров клиентам"
                  aria-label="Описание расхода"
                />
              </div>

              {/* Amount Field */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
                  <span className="text-lg mr-2">₽</span>
                  Сумма расхода
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={formData.amount} 
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      amount: parseFloat(e.target.value) || 0
                    }))} 
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold" 
                    required 
                    placeholder="0"
                    aria-label="Сумма расхода"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium">
                    ₽
                  </div>
                </div>
                
                {errorMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
                  >
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                      {errorMessage}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button 
                  type="button" 
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 px-6 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Отмена
                </button>
                
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:from-red-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {expense ? 'Сохранение...' : 'Добавление...'}
                    </>
                  ) : (
                    <>
                      <Receipt className="h-4 w-4" />
                      {expense ? 'Сохранить изменения' : 'Добавить расход'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}