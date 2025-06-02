import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Package, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
  id: string | number;
  name: string;
}

interface ProductSelectorProps {
  products: Product[];
  selectedProductId: string | number;
  onProductSelect: (productId: string | number) => void;
  onAddNewProduct?: () => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ProductSelector({
  products,
  selectedProductId,
  onProductSelect,
  onAddNewProduct,
  placeholder = "Выберите товар",
  loading = false,
  disabled = false,
  className
}: ProductSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Фильтрация товаров по поисковому запросу
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Выбранный товар
  const selectedProduct = products.find(p => p.id.toString() === selectedProductId.toString());

  // Закрытие dropdown при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Фокус на поле поиска при открытии
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleProductSelect = (product: Product) => {
    onProductSelect(product.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleToggle = () => {
    if (!disabled && !loading) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <motion.button
        type="button"
        onClick={handleToggle}
        disabled={disabled || loading}
        whileHover={!disabled && !loading ? { scale: 1.01, y: -1 } : {}}
        whileTap={!disabled && !loading ? { scale: 0.99 } : {}}
        className={cn(
          "w-full flex items-center justify-between gap-3 px-4 py-3 text-left rounded-xl border transition-all duration-200",
          "bg-white/80 dark:bg-slate-800/80 text-gray-900 dark:text-white backdrop-blur-sm",
          "border-gray-300 dark:border-slate-600",
          "hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md",
          "focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500",
          isOpen && "border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/20 shadow-lg",
          disabled && "opacity-50 cursor-not-allowed",
          loading && "opacity-70"
        )}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={cn(
            "p-1.5 rounded-lg transition-colors",
            selectedProduct ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-gray-100 dark:bg-slate-700"
          )}>
            <Package className={cn(
              "h-4 w-4 transition-colors",
              selectedProduct ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"
            )} />
          </div>
          <span className={cn(
            "truncate transition-colors",
            !selectedProduct && "text-gray-500 dark:text-gray-400"
          )}>
            {loading ? "Загрузка товаров..." : selectedProduct?.name || placeholder}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </motion.div>
      </motion.button>

      {/* Dropdown Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2 z-50 bg-white/95 dark:bg-slate-800/95 border border-gray-300 dark:border-slate-600 rounded-xl shadow-xl backdrop-blur-md overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-3 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-slate-700/50 dark:to-slate-800/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Поиск товаров..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Products List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredProducts.length > 0 ? (
                <div className="p-2 space-y-1">
                  {filteredProducts.map((product) => (
                    <motion.button
                      key={product.id}
                      type="button"
                      onClick={() => handleProductSelect(product)}
                      whileHover={{ 
                        backgroundColor: "rgba(16, 185, 129, 0.1)",
                        x: 2
                      }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "w-full flex items-center justify-between gap-3 px-3 py-3 text-left rounded-lg transition-all group",
                        "hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
                        "focus:outline-none focus:bg-emerald-50 dark:focus:bg-emerald-900/20",
                        selectedProduct?.id === product.id && "bg-emerald-100 dark:bg-emerald-900/30 shadow-sm"
                      )}
                    >
                      <span className="text-gray-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                        {product.name}
                      </span>
                      {selectedProduct?.id === product.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {searchTerm ? `Товары "${searchTerm}" не найдены` : "Нет доступных товаров"}
                  </motion.div>
                </div>
              )}
            </div>

            {/* Add New Product Button */}
            {onAddNewProduct && !selectedProductId && (
              <div className="p-2 border-t border-gray-200 dark:border-slate-700 bg-gradient-to-r from-emerald-50/50 to-white/50 dark:from-emerald-900/10 dark:to-slate-800/50">
                <motion.button
                  type="button"
                  onClick={() => {
                    onAddNewProduct();
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 hover:from-emerald-100 hover:to-emerald-200 dark:hover:from-emerald-900/30 dark:hover:to-emerald-800/30 text-emerald-700 dark:text-emerald-300 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="p-1 bg-emerald-200 dark:bg-emerald-800/50 rounded-md">
                    <Plus className="h-3 w-3" />
                  </div>
                  <span className="font-medium">Добавить новый товар</span>
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 