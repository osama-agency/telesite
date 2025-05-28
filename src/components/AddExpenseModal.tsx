import React, { useEffect, useState } from 'react';
import { X, Calendar, Package2, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';
interface ExpenseType {
  id: string;
  name: string;
  icon: any;
  color: string;
}
interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: {
    date: string;
    type: string;
    description: string;
    amount: number;
    productId?: string;
    productName?: string;
  }) => void;
  expense?: {
    id: string;
    date: string;
    type: string;
    description: string;
    amount: number;
    productId?: string;
    productName?: string;
  } | null;
  expenseTypes: ExpenseType[];
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
    type: '',
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
    onSave(formData);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: '',
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
        <motion.div initial={{
        scale: 0.95,
        opacity: 0
      }} animate={{
        scale: 1,
        opacity: 1
      }} exit={{
        scale: 0.95,
        opacity: 0
      }} className="relative bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center">
                <Receipt className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  {expense ? 'Редактировать расход' : 'Добавить расход'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Заполните детали расхода
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Дата
              </label>
              <input type="date" value={formData.date} onChange={e => setFormData(prev => ({
              ...prev,
              date: e.target.value
            }))} className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Тип</label>
              <select value={formData.type} onChange={e => setFormData(prev => ({
              ...prev,
              type: e.target.value
            }))} className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" required>
                <option value="">Выберите тип</option>
                {expenseTypes.map(type => <option key={type.id} value={type.id}>
                    {type.name}
                  </option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Описание</label>
              <input type="text" value={formData.description} onChange={e => setFormData(prev => ({
              ...prev,
              description: e.target.value
            }))} className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Сумма (в рублях)
              </label>
              <input type="number" min="0" step="0.01" value={formData.amount} onChange={e => setFormData(prev => ({
              ...prev,
              amount: parseFloat(e.target.value) || 0
            }))} className="w-full px-4 py-3 border border-border rounded-xl bg-background focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" required />
            </div>
            <div className="flex space-x-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-border rounded-xl hover:bg-accent transition-colors">
                Отмена
              </button>
              <button type="submit" className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
                {expense ? 'Сохранить' : 'Добавить'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>;
}