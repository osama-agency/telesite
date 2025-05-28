import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  maxVisiblePages?: number;
}
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  maxVisiblePages = 5
}: PaginationProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [sliderWidth, setSliderWidth] = useState(0);
  const [hoveredPage, setHoveredPage] = useState<number | null>(null);
  // Calculate which pages to show
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({
        length: totalPages
      }, (_, i) => i + 1);
    }
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    return Array.from({
      length: endPage - startPage + 1
    }, (_, i) => startPage + i);
  };
  const visiblePages = getVisiblePages();
  // Generate page ranges for dropdown
  const pageRanges = [];
  const rangeSize = 10;
  for (let i = 1; i <= totalPages; i += rangeSize) {
    const end = Math.min(i + rangeSize - 1, totalPages);
    pageRanges.push({
      start: i,
      end
    });
  }
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  // Update slider width on resize
  useEffect(() => {
    const updateSliderWidth = () => {
      if (sliderRef.current) {
        setSliderWidth(sliderRef.current.offsetWidth);
      }
    };
    updateSliderWidth();
    window.addEventListener('resize', updateSliderWidth);
    return () => window.removeEventListener('resize', updateSliderWidth);
  }, [totalPages]);
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };
  if (totalPages <= 1) return null;
  return <div className="flex flex-col items-center justify-center space-y-4 py-6">
      {/* Current page indicator */}
      <motion.div initial={{
      y: 10,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} className="text-sm text-center font-medium text-slate-700 dark:text-slate-300 mb-2">
        Страница {currentPage} из {totalPages}
      </motion.div>
      {/* Slider track */}
      <div className="w-full max-w-md flex items-center justify-center mb-4">
        <div ref={sliderRef} className="relative h-1.5 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex-1 mx-4">
          {/* Progress bar */}
          <motion.div className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" initial={{
          width: `${(currentPage - 1) / (totalPages - 1) * 100}%`
        }} animate={{
          width: `${(currentPage - 1) / (totalPages - 1) * 100}%`
        }} transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30
        }} />
          {/* Page markers */}
          {Array.from({
          length: Math.min(totalPages, 10)
        }, (_, i) => {
          const pageNum = Math.ceil((i + 1) * totalPages / Math.min(totalPages, 10));
          const position = `${i / (Math.min(totalPages, 10) - 1) * 100}%`;
          const isCurrentPage = pageNum === currentPage;
          return <motion.button key={i} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2" style={{
            left: position
          }} whileHover={{
            scale: 1.5
          }} whileTap={{
            scale: 0.9
          }} onClick={() => onPageChange(pageNum)} onMouseEnter={() => setHoveredPage(pageNum)} onMouseLeave={() => setHoveredPage(null)} onKeyDown={e => handleKeyDown(e, () => onPageChange(pageNum))} tabIndex={0} aria-label={`Перейти на страницу ${pageNum}`} disabled={isLoading}>
                  <span className={`block w-3 h-3 rounded-full transition-all duration-200 ${isCurrentPage ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-slate-400 dark:bg-slate-600 hover:bg-emerald-400 dark:hover:bg-emerald-600'}`} />
                  {/* Tooltip */}
                  <AnimatePresence>
                    {hoveredPage === pageNum && <motion.div initial={{
                opacity: 0,
                y: 10
              }} animate={{
                opacity: 1,
                y: -30
              }} exit={{
                opacity: 0,
                y: 10
              }} className="absolute left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-medium bg-slate-800 text-white rounded pointer-events-none whitespace-nowrap">
                        Страница {pageNum}
                      </motion.div>}
                  </AnimatePresence>
                </motion.button>;
        })}
        </div>
      </div>
      <div className="flex items-center justify-center space-x-2">
        {/* First page button */}
        <motion.button whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }} onClick={() => onPageChange(1)} disabled={currentPage === 1 || isLoading} className="p-2 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2" aria-label="Перейти на первую страницу" onKeyDown={e => handleKeyDown(e, () => onPageChange(1))}>
          <ChevronsLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        </motion.button>
        {/* Previous button */}
        <motion.button whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }} onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1 || isLoading} className="flex items-center px-3 py-2 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2" aria-label="Предыдущая страница" onKeyDown={e => handleKeyDown(e, () => currentPage > 1 && onPageChange(currentPage - 1))}>
          <ChevronLeft className="h-4 w-4 mr-1 text-slate-600 dark:text-slate-300" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Назад
          </span>
        </motion.button>
        {/* Page number buttons for smaller page counts */}
        {totalPages <= 7 && <div className="flex items-center space-x-1">
            {Array.from({
          length: totalPages
        }, (_, i) => i + 1).map(page => <motion.button key={page} whileHover={{
          scale: 1.1
        }} whileTap={{
          scale: 0.9
        }} onClick={() => onPageChange(page)} disabled={isLoading} className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${currentPage === page ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/30 focus:ring-emerald-500' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 focus:ring-slate-500'}`} aria-label={`Страница ${page}`} aria-current={currentPage === page ? 'page' : undefined} onKeyDown={e => handleKeyDown(e, () => onPageChange(page))}>
                {page}
              </motion.button>)}
          </div>}
        {/* Page dropdown for larger page counts */}
        {totalPages > 7 && <div className="relative" ref={dropdownRef}>
            <motion.button whileHover={{
          scale: 1.02
        }} whileTap={{
          scale: 0.98
        }} onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2" aria-label="Выбрать страницу" aria-expanded={isDropdownOpen} aria-haspopup="true" onKeyDown={e => handleKeyDown(e, () => setIsDropdownOpen(!isDropdownOpen))}>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mr-1">
                {visiblePages[0]}-{visiblePages[visiblePages.length - 1]}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            </motion.button>
            <AnimatePresence>
              {isDropdownOpen && <motion.div initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: 10
          }} transition={{
            duration: 0.2
          }} className="absolute z-50 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
                  <div className="max-h-60 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                    {pageRanges.map((range, i) => <button key={i} onClick={() => {
                onPageChange(range.start);
                setIsDropdownOpen(false);
              }} className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${currentPage >= range.start && currentPage <= range.end ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-700 dark:text-slate-300'}`} onKeyDown={e => handleKeyDown(e, () => {
                onPageChange(range.start);
                setIsDropdownOpen(false);
              })}>
                        {range.start} - {range.end}
                      </button>)}
                  </div>
                </motion.div>}
            </AnimatePresence>
          </div>}
        {/* Next button */}
        <motion.button whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }} onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages || isLoading} className="flex items-center px-3 py-2 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2" aria-label="Следующая страница" onKeyDown={e => handleKeyDown(e, () => currentPage < totalPages && onPageChange(currentPage + 1))}>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Вперед
          </span>
          <ChevronRight className="h-4 w-4 ml-1 text-slate-600 dark:text-slate-300" />
        </motion.button>
        {/* Last page button */}
        <motion.button whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }} onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages || isLoading} className="p-2 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2" aria-label="Перейти на последнюю страницу" onKeyDown={e => handleKeyDown(e, () => onPageChange(totalPages))}>
          <ChevronsRight className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        </motion.button>
      </div>
      {/* Loading indicator */}
      {isLoading && <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} exit={{
      opacity: 0
    }} className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Загрузка...
        </motion.div>}
    </div>;
}