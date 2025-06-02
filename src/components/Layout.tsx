import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Moon, Sun, Menu, X, PlayCircle } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { useResponsive } from '../hooks/useResponsive';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Основной Layout компонент приложения
 * Управляет структурой страницы, включая боковую панель, хедер и основной контент
 * Адаптивный дизайн для мобильных, планшетов и десктопов
 */
export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isMobile, isTablet, isDesktop, width } = useResponsive();
  
  // Определяем, показывать ли десктопную версию
  const shouldShowDesktop = isDesktop || width >= 1024;
  
  // Закрываем сайдбар при смене маршрута (только для мобильных)
  useEffect(() => {
    if (isMobile || isTablet) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile, isTablet]);
  
  return (
    <div className="relative min-h-screen-safe">
      {/* Анимированные фоновые эффекты */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-violet-50/20 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800/50" />
        <motion.div 
          className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-300 mix-blend-multiply blur-3xl filter opacity-20 dark:opacity-10"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-pink-300 mix-blend-multiply blur-3xl filter opacity-20 dark:opacity-10"
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>
      
      {/* Мобильный хедер - показывается только на маленьких экранах */}
      <header className={`
        lg:hidden fixed inset-x-0 top-0 z-40
        glass glass-border
        safe-top
      `}>
        <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
          {/* Кнопка открытия/закрытия меню */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="focus-ring -ml-2 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 motion-safe:transition-all"
            aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
          >
            <AnimatePresence mode="wait">
              {isSidebarOpen ? (
                <motion.div
                  key="close"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
          
          {/* Логотип ТЕЛЕСАЙТ */}
          <Link to="/" className="flex items-center gap-2">
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 377 313" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
            >
              <path d="M10.3357 142.918C11.2001 142.481 12.0557 142.071 12.9113 141.678C27.5617 134.876 42.4129 128.529 57.2553 122.173C58.0673 122.173 59.4031 121.256 60.1627 120.933C61.3065 120.444 62.4503 119.964 63.594 119.466C65.7942 118.524 67.9943 117.589 70.1945 116.646C74.5949 114.761 78.9952 112.875 83.4043 110.998C92.205 107.234 101.006 103.471 109.806 99.6997C127.408 92.1737 145.009 84.639 162.611 77.113C180.212 69.5869 197.822 62.0522 215.424 54.5175C233.025 46.9915 250.627 39.4654 268.228 31.9307C285.838 24.396 303.44 16.87 321.041 9.34402C324.952 7.66769 329.187 5.14444 333.378 4.41978C336.896 3.79115 340.336 2.5688 343.872 1.89652C350.604 0.621814 358.016 0.0892996 364.451 2.88318C366.686 3.84357 368.72 5.2143 370.449 6.92555C378.612 15.0191 377.469 28.2812 375.74 39.6575C363.691 118.908 351.651 198.167 339.612 277.425C337.961 288.304 335.726 300.222 327.135 307.093C319.88 312.908 309.534 313.571 300.567 311.092C291.618 308.612 283.69 303.4 275.946 298.266C243.747 276.945 211.556 255.633 179.365 234.312C171.708 229.248 163.187 222.639 163.283 213.463C163.327 207.928 166.627 203.012 169.997 198.62C197.962 162.134 238.342 137.05 268.368 102.249C272.593 97.3511 275.937 88.4719 270.114 85.6518C266.665 83.9668 262.675 86.2542 259.523 88.4457C219.842 116.009 180.16 143.581 140.478 171.153C127.53 180.146 113.945 189.401 98.3429 191.618C84.3822 193.591 70.3342 189.706 56.8101 185.734C45.4862 182.407 34.1797 178.985 22.9169 175.475C16.9362 173.607 10.7547 171.607 6.11864 167.39C1.49128 163.173 -1.15417 156.092 1.62224 150.47C3.36842 146.951 6.77352 144.725 10.3357 142.918Z" fill="url(#paint0_linear_mobile)"/>
              <defs>
                <linearGradient id="paint0_linear_mobile" x1="0.489746" y1="156.657" x2="376.979" y2="156.657" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#078EF7"/>
                  <stop offset="0.326923" stopColor="#BB61F9"/>
                  <stop offset="0.620192" stopColor="#DF4C9D"/>
                  <stop offset="0.822115" stopColor="#F2445B"/>
                  <stop offset="0.9999" stopColor="#F45409"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="telesite-logo font-bold text-sm sm:text-base text-gray-900 dark:text-white">ТЕЛЕСАЙТ</span>
          </Link>
          
          {/* Переключатель темы */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="focus-ring rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 motion-safe:transition-all"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div
                    key="sun"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="h-5 w-5 text-amber-500" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>
      
      {/* Основная структура с сайдбаром и контентом */}
      <div className="flex">
        {/* Боковая панель навигации */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        {/* Основной контент страницы */}
        <main className={`
          flex-1 min-h-screen-safe w-full
          ${shouldShowDesktop ? 'lg:ml-72' : ''}
          ${isMobile || isTablet ? 'pt-14' : ''}
        `}>
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-4 xl:px-6 py-4 sm:py-6 lg:py-8 animate-in">
            <div className="w-full min-w-0">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}