import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Users, Receipt, ShoppingCart, BarChart3, PlayCircle, AlertTriangle, Eye, Database, Lock, LogOut, User } from 'lucide-react';
import { useResponsive } from '../hooks/useResponsive';
import AccountMenuDropdown from './ui/dropdown/AccountMenuDropdown';
import { useTheme } from './ThemeProvider';

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
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  
  // Initialize demo mode state and user info
  useEffect(() => {
    // Check user role and email from localStorage
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');
    setUserRole(role);
    setUserEmail(email);
    setIsDemoMode(role === 'demo');
    window.isDemoMode = role === 'demo';
  }, []);
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('rememberMe');
    window.isDemoMode = false;
    navigate('/login');
  };
  
  const sidebarVariants = {
    closed: { width: 0, x: -20, opacity: 0 },
    open: { 
      width: isMobile ? '85vw' : 280, 
      x: 0, 
      opacity: 1 
    }
  };
  
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 touch-none"
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <motion.aside
        ref={sidebarRef}
        variants={sidebarVariants}
        initial={false}
        animate={isOpen ? 'open' : 'closed'}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
        className={`
          fixed top-0 left-0 bottom-0 z-50
          ${!isMobile ? 'sm:top-2 sm:bottom-2 sm:left-2 md:top-3 md:bottom-3 md:left-3 lg:top-4 lg:bottom-4 lg:left-4' : ''}
          bg-white/95 dark:bg-slate-900/95
          backdrop-blur-xl 
          ${isMobile ? 'border-r' : 'sm:border'} 
          border-gray-200/50 dark:border-slate-800/60
          ${!isMobile ? 'sm:rounded-xl md:rounded-2xl lg:rounded-2xl shadow-2xl shadow-black/10' : ''}
          overflow-hidden
          transition-all duration-300
        `}
        aria-label="Навигационная панель"
        aria-expanded={isOpen}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className={`
            px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6
            ${isMobile ? 'pt-6' : ''}
          `}>
            <Link 
              to="/" 
              className="group block transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              aria-label="Главная страница"
            >
              <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative flex-shrink-0"
                >
                  <svg 
                    viewBox="0 0 377 313" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 sm:h-7 sm:w-7 md:h-8 md:w-8 transition-all duration-300 group-hover:drop-shadow-lg"
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
                  <div className="absolute inset-0 blur-lg bg-primary/30" />
                </motion.div>
                
                <div className="flex flex-col min-w-0 overflow-hidden min-w-[110px] md:min-w-[130px] max-w-full">
                  <span
                    className="font-bold italic text-slate-900 dark:text-white text-base sm:text-base md:text-lg leading-tight truncate"
                    style={{ fontFamily: 'Futura PT Extra Bold Italic, Futura, Arial, sans-serif' }}
                  >
                    ТЕЛЕСАЙТ
                  </span>
                  <span className="text-[10px] sm:text-[11px] md:text-xs text-muted-foreground font-medium">
                    Analytics
                  </span>
                </div>
              </div>
            </Link>
          </div>
          
          {/* Divider */}
          <div className="px-3 sm:px-4 md:px-6 py-1 sm:py-1.5 md:py-2">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200/50 dark:via-slate-700/50 to-transparent" />
          </div>
          
          {/* Navigation */}
          <nav className="px-2 sm:px-3 md:px-4 space-y-2 flex-1 overflow-y-auto sidebar-scroll pb-2 sm:pb-3 md:pb-4">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 + 0.1 }}
                >
                  <Link
                    to={item.href}
                    onClick={() => isMobile && onClose()}
                    className={`
                      group relative flex items-center
                      gap-x-2 sm:gap-x-2.5 md:gap-x-3
                      rounded-lg sm:rounded-lg md:rounded-xl
                      px-2.5 py-2 sm:px-3 sm:py-2.5 md:px-4 md:py-3
                      text-xs sm:text-sm md:text-sm font-medium
                      transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]
                      ${isActive 
                        ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md' 
                        : 'bg-gray-100/50 dark:bg-slate-800/50 text-gray-700 dark:text-slate-300 hover:bg-gray-200/70 dark:hover:bg-slate-700/70 hover:text-gray-900 dark:hover:text-white'}
                    `}
                    aria-label={item.name}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="relative flex items-center justify-center flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8">
                      <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5" aria-hidden="true" />
                    </div>
                    <span className="font-medium min-w-0 truncate break-words">
                      {item.name}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>
          
          {/* Bottom Section - User Info */}
          <div className="p-2 sm:p-3 md:p-4 border-t border-gray-200/50 dark:border-slate-800/50">
            {/* User Profile with Dropdown */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-2 sm:mb-2.5 md:mb-3 rounded-lg sm:rounded-lg md:rounded-xl p-2 sm:p-2.5 md:p-3 bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200/30 dark:border-slate-700/30"
            >
              <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3">
                <AccountMenuDropdown
                  userEmail={userEmail}
                  userRole={userRole}
                  isDemoMode={isDemoMode}
                  theme={theme}
                  setTheme={setTheme}
                  onLogout={handleLogout}
                >
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {userEmail || 'Пользователь'}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-600 dark:text-slate-400 flex items-center gap-1">
                      {isDemoMode ? (
                        <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded font-medium">
                          Демо режим
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-green-500/20 text-green-700 dark:text-green-400 rounded font-medium">
                          Администратор
                        </span>
                      )}
                    </div>
                  </div>
                </AccountMenuDropdown>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}