import React, { useState } from 'react';
import { X, Edit3, Calculator, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'costPriceTRY' | 'logisticsCost' | 'expenses' | null;
  selectedCount: number;
  onSave: (value: number) => void;
  loading: boolean;
}
export function BulkEditModal({
  isOpen,
  onClose,
  type,
  selectedCount,
  onSave,
  loading
}: BulkEditModalProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const handleSubmit = () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      setError('Введите корректное положительное число');
      return;
    }
    onSave(numValue);
  };
  const getTitle = () => {
    switch (type) {
      case 'costPriceTRY':
        return 'Изменение себестоимости TRY';
      case 'logisticsCost':
        return 'Изменение расходов на логистику';
      case 'expenses':
        return 'Изменение дополнительных расходов';
      default:
        return 'Массовое редактирование';
    }
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
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                {type === 'expenses' ? <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400" /> : <Edit3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
              </div>
              <div>
                <h2 className="text-lg font-semibold">{getTitle()}</h2>
                <p className="text-sm text-muted-foreground">
                  Выбрано товаров: {selectedCount}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Новое значение
              </label>
              <input type="number" min="0" step="0.01" value={value} onChange={e => {
              setValue(e.target.value);
              setError('');
            }} className={`w-full px-4 py-3 border rounded-xl bg-background focus:outline-none focus:ring-2 transition-all ${error ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-blue-500'}`} />
              {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
            </div>
            <div className="flex space-x-3">
              <button onClick={onClose} className="flex-1 px-4 py-3 border border-border rounded-xl hover:bg-accent transition-colors">
                Отмена
              </button>
              <button onClick={handleSubmit} disabled={loading} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                {loading ? <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Применяется...
                  </> : 'Применить'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>;
}