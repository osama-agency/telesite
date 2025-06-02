import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  isDeleting?: boolean;
  items?: Array<{
    name: string;
    qty: number;
    unitPrice?: number;
    currency?: string;
  }>;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Удалить расход",
  description = "Это действие необратимо. Все данные о расходе будут удалены безвозвратно.",
  itemName,
  isDeleting = false,
  items
}: ConfirmDeleteModalProps) {
  console.log('ConfirmDeleteModal render:', { isOpen, itemName, isDeleting });
  
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="flex min-h-screen items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        {/* Backdrop with blur */}
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
        
        <motion.div 
          initial={{
            opacity: 0,
            scale: 0.9,
            y: 20
          }} 
          animate={{
            opacity: 1,
            scale: 1,
            y: 0
          }} 
          exit={{
            opacity: 0,
            scale: 0.9,
            y: 20
          }} 
          transition={{
            duration: 0.2,
            ease: [0.4, 0.0, 0.2, 1]
          }}
          className={`relative w-full ${items && items.length > 0 ? 'max-w-lg' : 'max-w-md'} bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden`}
        >
          {/* Header with warning gradient */}
          <div className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div className="text-white">
                  <h2 className="text-xl font-bold">
                    {title}
                  </h2>
                  <p className="text-sm text-white/80 mt-1">
                    Подтверждение действия
                  </p>
                </div>
              </div>
              {!isDeleting && (
                <button 
                  onClick={onClose} 
                  className="text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 p-2 rounded-xl"
                  aria-label="Закрыть"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 bg-gradient-to-br from-slate-50 to-red-50 dark:from-slate-900 dark:to-red-900/20">
            {/* Warning Icon and Message */}
            <div className="text-center mb-6">
              <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Вы уверены в своем решении?
                </h3>
                
                {itemName && (
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      Будет удален расход:
                    </p>
                    <p className="font-medium text-slate-900 dark:text-white truncate">
                      {itemName}
                    </p>
                  </div>
                )}
                
                {items && items.length > 0 && (
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Товары в закупке:
                    </p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="font-medium text-slate-900 dark:text-white truncate mr-2">
                            {item.name}
                          </span>
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 flex-shrink-0">
                            <span>{item.qty} шт.</span>
                            {item.unitPrice && item.currency && (
                              <span className="text-xs">
                                × {item.unitPrice.toFixed(2)} {item.currency}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                type="button" 
                onClick={onClose}
                disabled={isDeleting}
                className="w-full sm:flex-1 px-6 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Отмена
              </button>
              
              <button 
                type="button" 
                onClick={onConfirm}
                disabled={isDeleting}
                className="w-full sm:flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Удаление...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Удалить навсегда
                  </>
                )}
              </button>
            </div>

            {/* Warning Notice */}
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  <strong>Внимание:</strong> Отменить это действие будет невозможно. Убедитесь, что выбрали правильный элемент для удаления.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 