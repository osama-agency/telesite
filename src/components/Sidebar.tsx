import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Package, Users, Receipt, ShoppingCart, Moon, Sun, Palette, BarChart3, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useResponsive } from '../hooks/useResponsive';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
  gradient: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type SidebarState = 'collapsed' | 'mini' | 'full';

const menuItems: MenuItem[] = [
  {
    name: 'Аналитика',
    href: '/',
    icon: BarChart3,
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    name: 'Товары',
    href: '/products',
    icon: Package,
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    name: 'Заказы клиентов',
    href: '/customer-orders',
    icon: Users,
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    name: 'Закупка товаров',
    href: '/purchases',
    icon: ShoppingCart,
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    name: 'Расходы',
    href: '/expenses',
    icon: Receipt,
    gradient: 'from-orange-500 to-red-500'
  }
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { isMobile, isTablet, isTouchDevice } = useResponsive();
  const [sidebarState, setSidebarState] = useState<SidebarState>('full');
  const x = useMotionValue(0);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Sidebar widths for different states
  const sidebarWidth = {
    collapsed: 0,
    mini: 64, // 4rem
    full: 256 // 16rem
  };
  
  // Set initial sidebar state based on screen size
  useEffect(() => {
    if (isMobile || isTablet) {
      setSidebarState(isOpen ? 'full' : 'collapsed');
    } else {
      setSidebarState(isOpen ? 'full' : 'mini');
    }
  }, [isMobile, isTablet, isOpen]);
  
  // Handle swipe gestures
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    const velocity = info.velocity.x;
    const offset = info.offset.x;
    
    if (isTouchDevice) {
      if (velocity > 500 || offset > threshold) {
        // Swipe right - open
        setSidebarState('full');
      } else if (velocity < -500 || offset < -threshold) {
        // Swipe left - close
        setSidebarState('collapsed');
        onClose();
      } else {
        // Return to original position
        x.set(0);
      }
    }
  };
  
  // Toggle sidebar state for desktop
  const toggleSidebar = () => {
    if (isMobile || isTablet) {
      setSidebarState(sidebarState === 'collapsed' ? 'full' : 'collapsed');
      if (sidebarState === 'collapsed') {
        onClose();
      }
    } else {
      const states: SidebarState[] = ['collapsed', 'mini', 'full'];
      const currentIndex = states.indexOf(sidebarState);
      const nextIndex = (currentIndex + 1) % states.length;
      setSidebarState(states[nextIndex]);
    }
  };
  
  const sidebarVariants = {
    collapsed: { width: 0, x: -20, opacity: 0 },
    mini: { width: sidebarWidth.mini, x: 0, opacity: 1 },
    full: { width: sidebarWidth.full, x: 0, opacity: 1 }
  };
  
  const contentVariants = {
    collapsed: { opacity: 0, scale: 0.95 },
    mini: { opacity: 1, scale: 1 },
    full: { opacity: 1, scale: 1 }
  };
  
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isTouchDevice && sidebarState === 'full' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <motion.aside
        ref={sidebarRef}
        variants={sidebarVariants}
        initial={false}
        animate={sidebarState}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
        drag={isTouchDevice ? "x" : false}
        dragConstraints={{ left: -sidebarWidth.full, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={`
          fixed top-0 left-0 bottom-0 z-50 
          bg-white/95 dark:bg-slate-950/95 
          backdrop-blur-2xl border-r border-border/30 
          shadow-2xl shadow-black/5 overflow-hidden
          ${isTouchDevice ? 'touch-none' : ''}
        `}
        aria-label="Навигационная панель"
        aria-expanded={sidebarState === 'full'}
      >
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={`
            absolute top-6 ${sidebarState === 'collapsed' ? 'left-full' : 'right-2'} z-10
            w-8 h-8 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl
            border border-border/50 shadow-lg
            flex items-center justify-center
            hover:bg-gray-100 dark:hover:bg-slate-700
            focus:outline-none focus:ring-2 focus:ring-primary/20
            transition-all duration-300
            ${sidebarState === 'collapsed' ? 'translate-x-2' : ''}
          `}
          aria-label={sidebarState === 'collapsed' ? 'Развернуть боковое меню' : 'Свернуть боковое меню'}
        >
          {sidebarState === 'full' ? (
            <ChevronLeft className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>
        
        {/* Logo Section */}
        <div className={`p-4 ${sidebarState === 'mini' ? 'px-2' : 'px-4 sm:px-6'} pb-2`}>
          <Link 
            to="/" 
            className="group block transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            aria-label="Главная страница"
          >
            <div className={`flex items-center ${sidebarState === 'mini' ? 'justify-center' : 'gap-3'}`}>
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  x: [0, 3, 0],
                  y: [0, -2, 0]
                }}
                transition={{ 
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.5, 1]
                }}
                className="relative flex-shrink-0"
              >
                <svg 
                  width="28" 
                  height="23" 
                  viewBox="0 0 377 313" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className={`${sidebarState === 'mini' ? 'h-6' : 'h-6 sm:h-7'} w-auto`}
                  aria-hidden="true"
                >
                  <path d="M10.3357 142.918C11.2001 142.481 12.0557 142.071 12.9113 141.678C27.5617 134.876 42.4129 128.529 57.2553 122.173C58.0673 122.173 59.4031 121.256 60.1627 120.933C61.3065 120.444 62.4503 119.964 63.594 119.466C65.7942 118.524 67.9943 117.589 70.1945 116.646C74.5949 114.761 78.9952 112.875 83.4043 110.998C92.205 107.234 101.006 103.471 109.806 99.6997C127.408 92.1737 145.009 84.639 162.611 77.113C180.212 69.5869 197.822 62.0522 215.424 54.5175C233.025 46.9915 250.627 39.4654 268.228 31.9307C285.838 24.396 303.44 16.87 321.041 9.34402C324.952 7.66769 329.187 5.14444 333.378 4.41978C336.896 3.79115 340.336 2.5688 343.872 1.89652C350.604 0.621814 358.016 0.0892996 364.451 2.88318C366.686 3.84357 368.72 5.2143 370.449 6.92555C378.612 15.0191 377.469 28.2812 375.74 39.6575C363.691 118.908 351.651 198.167 339.612 277.425C337.961 288.304 335.726 300.222 327.135 307.093C319.88 312.908 309.534 313.571 300.567 311.092C291.618 308.612 283.69 303.4 275.946 298.266C243.747 276.945 211.556 255.633 179.365 234.312C171.708 229.248 163.187 222.639 163.283 213.463C163.327 207.928 166.627 203.012 169.997 198.62C197.962 162.134 238.342 137.05 268.368 102.249C272.593 97.3511 275.937 88.4719 270.114 85.6518C266.665 83.9668 262.675 86.2542 259.523 88.4457C219.842 116.009 180.16 143.581 140.478 171.153C127.53 180.146 113.945 189.401 98.3429 191.618C84.3822 193.591 70.3342 189.706 56.8101 185.734C45.4862 182.407 34.1797 178.985 22.9169 175.475C16.9362 173.607 10.7547 171.607 6.11864 167.39C1.49128 163.173 -1.15417 156.092 1.62224 150.47C3.36842 146.951 6.77352 144.725 10.3357 142.918Z" fill="url(#paint0_linear_71_3617)"/>
                  <defs>
                    <linearGradient id="paint0_linear_71_3617" x1="0.489746" y1="156.657" x2="376.979" y2="156.657" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#078EF7"/>
                      <stop offset="0.326923" stopColor="#BB61F9"/>
                      <stop offset="0.620192" stopColor="#DF4C9D"/>
                      <stop offset="0.822115" stopColor="#F2445B"/>
                      <stop offset="0.9999" stopColor="#F45409"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 blur-xl bg-primary/50" />
              </motion.div>
              <AnimatePresence mode="wait">
                {sidebarState === 'full' && (
                  <motion.div
                    className="flex flex-col min-w-0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span
                      className="font-bold italic text-slate-900 dark:text-white text-base sm:text-lg leading-tight truncate"
                      style={{ fontFamily: 'Futura PT Extra Bold Italic, Futura, Arial, sans-serif' }}
                    >
                      ТЕЛЕСАЙТ
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      Analytics
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Link>
        </div>
        
        {/* Divider */}
        <div className={`${sidebarState === 'mini' ? 'px-2' : 'px-4 sm:px-6'} py-2 sm:py-4`}>
          <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
        </div>
        
        {/* Theme Toggle */}
        <div className={`${sidebarState === 'mini' ? 'px-1' : 'px-4'} mb-2`}>
          <motion.button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="
              group relative p-3 sm:p-2.5 md:p-3
              rounded-xl
              bg-gradient-to-br from-primary/10 via-primary/5 to-transparent
              hover:from-primary/20 hover:via-primary/10 hover:to-primary/5
              border border-primary/20 hover:border-primary/30
              transition-all duration-300
              hover:shadow-lg hover:shadow-primary/20
              hover:-translate-y-0.5
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2
            "
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
          >
            <div className={`
              flex items-center justify-center rounded-lg
              ${sidebarState === 'mini' ? 'w-8 h-8' : 'w-10 h-10'}
              bg-gradient-to-br from-amber-400 to-orange-500 
              shadow-lg shadow-amber-500/20
            `}>
              {theme === 'dark' ? (
                <Sun className={`${sidebarState === 'mini' ? 'h-4 w-4' : 'h-5 w-5'} text-white`} />
              ) : (
                <Moon className={`${sidebarState === 'mini' ? 'h-4 w-4' : 'h-5 w-5'} text-white`} />
              )}
            </div>
            {sidebarState === 'full' && (
              <>
                <div className="flex flex-col items-start min-w-0">
                  <span className="font-medium">
                    {theme === 'dark' ? 'Светлая тема' : 'Темная тема'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Изменить оформление
                  </span>
                </div>
                <Palette className="h-4 w-4 ml-auto flex-shrink-0 opacity-60" />
              </>
            )}
          </motion.button>
        </div>
        
        {/* Navigation */}
        <nav className={`${sidebarState === 'mini' ? 'px-1' : 'px-4'} space-y-1.5 flex-1 overflow-y-auto`}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 + 0.2 }}
              >
                <Link
                  to={item.href}
                  onClick={() => isTouchDevice && onClose()}
                  className={`
                    group relative flex items-center
                    ${sidebarState === 'mini' ? 'justify-center' : 'gap-x-3.5'}
                    rounded-xl ${sidebarState === 'mini' ? 'px-2 py-2' : 'px-4 py-3'}
                    text-sm sm:text-[15px]
                    transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]
                    ${isActive 
                      ? 'bg-gradient-to-r from-primary/10 to-purple-500/10 text-slate-900 dark:text-white shadow-sm border border-primary/20' 
                      : 'text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                    }
                  `}
                  aria-label={item.name}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className={`
                        absolute left-0 top-1/2 -translate-y-1/2 
                        ${sidebarState === 'mini' ? 'w-0.5 h-6' : 'w-1 h-8'}
                        bg-gradient-to-b from-primary via-primary to-purple-500 rounded-r-full
                      `}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  {/* Icon with gradient background */}
                  <div className={`
                    relative flex items-center justify-center flex-shrink-0
                    ${sidebarState === 'mini' ? 'w-8 h-8' : 'w-10 h-10'} rounded-lg
                    transition-all duration-200
                    ${isActive 
                      ? `bg-gradient-to-br ${item.gradient} shadow-lg shadow-primary/20` 
                      : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                    }
                  `}>
                    <Icon className={`
                      ${sidebarState === 'mini' ? 'h-4 w-4' : 'h-5 w-5'}
                      ${isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'}
                    `} aria-hidden="true" />
                  </div>
                  
                  {/* Label */}
                  {sidebarState === 'full' && (
                    <span className="font-medium min-w-0 truncate">
                      {item.name}
                    </span>
                  )}
                  
                  {/* Hover effect */}
                  <div className={`
                    absolute inset-0 rounded-xl
                    bg-gradient-to-r ${item.gradient}
                    opacity-0 group-hover:opacity-5
                    transition-opacity duration-200
                  `} />
                </Link>
              </motion.div>
            );
          })}
        </nav>
        
        {/* Bottom Section */}
        {sidebarState === 'full' && (
          <div className="p-4 sm:p-6 mt-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-gradient-to-br from-primary/5 to-purple-500/5 p-4 border border-primary/10 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Система активна
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Все сервисы работают
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.aside>
      
      {/* Mobile Menu Button */}
      {isMobile && sidebarState === 'collapsed' && (
        <button
          onClick={() => setSidebarState('full')}
          className="fixed bottom-6 right-6 z-40 p-3 bg-primary text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 md:hidden"
          aria-label="Открыть меню"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
    </>
  );
}