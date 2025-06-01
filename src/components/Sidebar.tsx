import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Users, 
  Receipt, 
  ShoppingCart, 
  BarChart3, 
  PlayCircle, 
  AlertTriangle, 
  Eye, 
  Database, 
  Lock, 
  LogOut, 
  User,
  X
} from 'lucide-react';
import { useResponsive } from '../hooks/useResponsive';
import AccountMenuDropdown from './ui/dropdown/AccountMenuDropdown';
import { useTheme } from './ThemeProvider';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
  gradient: string;
  description?: string;
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
    gradient: 'from-indigo-500 to-purple-500',
    description: 'Статистика и отчеты'
  },
  {
    name: 'Товары',
    href: '/products',
    icon: Package,
    gradient: 'from-blue-500 to-cyan-500',
    description: 'Управление каталогом'
  },
  {
    name: 'Заказы клиентов',
    href: '/customer-orders',
    icon: Users,
    gradient: 'from-purple-500 to-pink-500',
    description: 'История покупок'
  },
  {
    name: 'Закупка товаров',
    href: '/purchases',
    icon: ShoppingCart,
    gradient: 'from-emerald-500 to-teal-500',
    description: 'Поставки и склад'
  },
  {
    name: 'Расходы',
    href: '/expenses',
    icon: Receipt,
    gradient: 'from-orange-500 to-red-500',
    description: 'Учет затрат'
  }
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile, isTablet, isDesktop, width } = useResponsive();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  
  // Check if we should show desktop version
  const shouldShowDesktop = isDesktop || width >= 1024;
  
  // Initialize demo mode state and user info
  useEffect(() => {
    console.log('Sidebar Debug:', { width, isDesktop, shouldShowDesktop });
    const role = localStorage.getItem('userRole');
    const email = localStorage.getItem('userEmail');
    setUserRole(role);
    setUserEmail(email);
    setIsDemoMode(role === 'demo');
    window.isDemoMode = role === 'demo';
  }, [width, isDesktop, shouldShowDesktop]);
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('rememberMe');
    window.isDemoMode = false;
    navigate('/login');
  };
  
  // Sidebar content component
  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-6 lg:px-6">
        <Link 
          to="/" 
          className="group flex items-center gap-3 focus-ring rounded-lg relative"
          onClick={() => isMobile && onClose()}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              duration: 0.6, 
              ease: [0.68, -0.55, 0.265, 1.55],
              delay: 0.1 
            }}
            whileHover={{ 
              scale: 1.1, 
              rotate: 5,
              transition: { duration: 0.3 }
            }}
            whileTap={{ 
              scale: 0.9,
              rotate: -5,
              transition: { duration: 0.2 }
            }}
            className="relative"
          >
            {/* Animated gradient background */}
            <motion.div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              animate={{
                background: [
                  "radial-gradient(circle at 30% 30%, #3B82F6 0%, transparent 50%)",
                  "radial-gradient(circle at 70% 70%, #A855F7 0%, transparent 50%)",
                  "radial-gradient(circle at 30% 70%, #F43F5E 0%, transparent 50%)",
                  "radial-gradient(circle at 70% 30%, #3B82F6 0%, transparent 50%)",
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            
            {/* Pulsing glow effect */}
            <motion.div
              className="absolute -inset-2 blur-xl bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-xl opacity-0 group-hover:opacity-100"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            <svg 
              viewBox="0 0 377 313" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 relative z-10"
            >
              <defs>
                <linearGradient id="animated-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#078EF7">
                    <animate attributeName="stop-color" values="#078EF7;#BB61F9;#DF4C9D;#F2445B;#F45409;#078EF7" dur="5s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="50%" stopColor="#BB61F9">
                    <animate attributeName="stop-color" values="#BB61F9;#DF4C9D;#F2445B;#F45409;#078EF7;#BB61F9" dur="5s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#F45409">
                    <animate attributeName="stop-color" values="#F45409;#078EF7;#BB61F9;#DF4C9D;#F2445B;#F45409" dur="5s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
              </defs>
              <path 
                d="M10.3357 142.918C11.2001 142.481 12.0557 142.071 12.9113 141.678C27.5617 134.876 42.4129 128.529 57.2553 122.173C58.0673 122.173 59.4031 121.256 60.1627 120.933C61.3065 120.444 62.4503 119.964 63.594 119.466C65.7942 118.524 67.9943 117.589 70.1945 116.646C74.5949 114.761 78.9952 112.875 83.4043 110.998C92.205 107.234 101.006 103.471 109.806 99.6997C127.408 92.1737 145.009 84.639 162.611 77.113C180.212 69.5869 197.822 62.0522 215.424 54.5175C233.025 46.9915 250.627 39.4654 268.228 31.9307C285.838 24.396 303.44 16.87 321.041 9.34402C324.952 7.66769 329.187 5.14444 333.378 4.41978C336.896 3.79115 340.336 2.5688 343.872 1.89652C350.604 0.621814 358.016 0.0892996 364.451 2.88318C366.686 3.84357 368.72 5.2143 370.449 6.92555C378.612 15.0191 377.469 28.2812 375.74 39.6575C363.691 118.908 351.651 198.167 339.612 277.425C337.961 288.304 335.726 300.222 327.135 307.093C319.88 312.908 309.534 313.571 300.567 311.092C291.618 308.612 283.69 303.4 275.946 298.266C243.747 276.945 211.556 255.633 179.365 234.312C171.708 229.248 163.187 222.639 163.283 213.463C163.327 207.928 166.627 203.012 169.997 198.62C197.962 162.134 238.342 137.05 268.368 102.249C272.593 97.3511 275.937 88.4719 270.114 85.6518C266.665 83.9668 262.675 86.2542 259.523 88.4457C219.842 116.009 180.16 143.581 140.478 171.153C127.53 180.146 113.945 189.401 98.3429 191.618C84.3822 193.591 70.3342 189.706 56.8101 185.734C45.4862 182.407 34.1797 178.985 22.9169 175.475C16.9362 173.607 10.7547 171.607 6.11864 167.39C1.49128 163.173 -1.15417 156.092 1.62224 150.47C3.36842 146.951 6.77352 144.725 10.3357 142.918Z" 
                fill="url(#animated-gradient)"
                className="drop-shadow-lg"
              />
            </svg>
          </motion.div>
          
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="overflow-visible"
              style={{ 
                transform: 'skewX(-10deg)',
                marginLeft: '2px',
                marginRight: '-2px'
              }}
            >
              <span 
                className="text-lg font-normal bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent leading-none block"
                style={{ 
                  fontFamily: '"Russo One", sans-serif', 
                  letterSpacing: '0.02em',
                  fontStyle: 'italic',
                  padding: '0 2px'
                }}
              >
                ТЕЛЕСАЙТ
              </span>
            </motion.div>
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="text-xs font-medium relative overflow-hidden ml-0.5"
            >
              <span className="relative z-10 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
                Analytics
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </motion.span>
          </div>
        </Link>
        
        {isMobile && (
          <button
            onClick={onClose}
            className="focus-ring rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4 scrollbar-thin">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={item.href}
                onClick={() => isMobile && onClose()}
                className={`
                  group relative flex items-center gap-3 rounded-lg px-3 py-2.5
                  text-sm font-medium transition-all focus-ring
                  ${isActive 
                    ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary' 
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-y-0 left-0 w-1 rounded-r-full bg-primary"
                  />
                )}
                
                {/* Icon */}
                <div className={`
                  relative z-10 flex h-9 w-9 items-center justify-center rounded-lg
                  ${isActive 
                    ? 'bg-gradient-to-br ' + item.gradient + ' text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:group-hover:bg-gray-700'
                  }
                `}>
                  <Icon className="h-4 w-4" />
                </div>
                
                {/* Label and description */}
                <div className="relative z-10 flex-1 min-w-0">
                  <div className="font-medium">{item.name}</div>
                  {shouldShowDesktop && item.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 truncate transition-colors">
                      {item.description}
                    </div>
                  )}
                </div>
                
                {/* Hover effect */}
                <div className={`
                  absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                  ${!isActive && 'bg-gradient-to-r ' + item.gradient + ' opacity-[0.03]'}
                `} />
              </Link>
            </motion.div>
          );
        })}
      </nav>
      
      {/* User section */}
      <div className="border-t p-4">
        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
          <AccountMenuDropdown
            userEmail={userEmail}
            userRole={userRole}
            isDemoMode={isDemoMode}
            theme={theme}
            setTheme={setTheme}
            onLogout={handleLogout}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 min-w-0 text-left">
                <div className="text-sm font-medium truncate">
                  {userEmail || 'Пользователь'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isDemoMode ? (
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Демо режим
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      Администратор
                    </span>
                  )}
                </div>
              </div>
            </div>
          </AccountMenuDropdown>
        </div>
      </div>
    </div>
  );
  
  // Desktop sidebar - show for all screens >= 1024px
  if (shouldShowDesktop) {
    return (
      <aside className="fixed left-0 top-0 z-30 h-screen w-72 border-r bg-white dark:bg-gray-900">
        <SidebarContent />
      </aside>
    );
  }
  
  // Mobile/Tablet drawer
  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>
      
      {/* Drawer */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`
          fixed left-0 top-0 z-50 h-full w-full max-w-xs
          bg-white dark:bg-gray-900 shadow-2xl
          safe-left safe-top safe-bottom
          lg:hidden
        `}
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
}