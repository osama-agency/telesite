import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { useResponsive } from '../hooks/useResponsive';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  
  // Sidebar state management
  const [sidebarWidth, setSidebarWidth] = useState(256); // Default to full width
  
  useEffect(() => {
    // Set initial sidebar width based on screen size
    if (isMobile || isTablet) {
      setSidebarWidth(0); // Collapsed on mobile/tablet
    } else {
      setSidebarWidth(256); // Full width on desktop
    }
  }, [isMobile, isTablet]);
  
  return (
    <div className="min-h-screen flex relative">
      {/* Background gradient effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800/50" />
        <div className="absolute top-0 -left-4 w-72 h-72 sm:w-96 sm:h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 sm:w-96 sm:h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 sm:w-96 sm:h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-4000" />
      </div>
      
      {/* Mobile Header - only shown on mobile/tablet */}
      {(isMobile || isTablet) && (
        <header className="md:hidden fixed top-0 left-0 right-0 z-30 glass border-b border-border/50 shadow-sm">
          <div className="flex h-14 items-center justify-between px-4">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="p-2 hover:bg-accent/50 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95" 
              aria-label={isMobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div 
                    key="close" 
                    initial={{ scale: 0.8, opacity: 0, rotate: -90 }} 
                    animate={{ scale: 1, opacity: 1, rotate: 0 }} 
                    exit={{ scale: 0.8, opacity: 0, rotate: 90 }}
                    transition={{ type: "spring", duration: 0.3 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="menu" 
                    initial={{ scale: 0.8, opacity: 0, rotate: 90 }} 
                    animate={{ scale: 1, opacity: 1, rotate: 0 }} 
                    exit={{ scale: 0.8, opacity: 0, rotate: -90 }}
                    transition={{ type: "spring", duration: 0.3 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
            
            <div className="flex items-center gap-2">
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
                  className="h-5 w-auto"
                  aria-hidden="true"
                >
                  <path d="M10.3357 142.918C11.2001 142.481 12.0557 142.071 12.9113 141.678C27.5617 134.876 42.4129 128.529 57.2553 122.173C58.0673 122.173 59.4031 121.256 60.1627 120.933C61.3065 120.444 62.4503 119.964 63.594 119.466C65.7942 118.524 67.9943 117.589 70.1945 116.646C74.5949 114.761 78.9952 112.875 83.4043 110.998C92.205 107.234 101.006 103.471 109.806 99.6997C127.408 92.1737 145.009 84.639 162.611 77.113C180.212 69.5869 197.822 62.0522 215.424 54.5175C233.025 46.9915 250.627 39.4654 268.228 31.9307C285.838 24.396 303.44 16.87 321.041 9.34402C324.952 7.66769 329.187 5.14444 333.378 4.41978C336.896 3.79115 340.336 2.5688 343.872 1.89652C350.604 0.621814 358.016 0.0892996 364.451 2.88318C366.686 3.84357 368.72 5.2143 370.449 6.92555C378.612 15.0191 377.469 28.2812 375.74 39.6575C363.691 118.908 351.651 198.167 339.612 277.425C337.961 288.304 335.726 300.222 327.135 307.093C319.88 312.908 309.534 313.571 300.567 311.092C291.618 308.612 283.69 303.4 275.946 298.266C243.747 276.945 211.556 255.633 179.365 234.312C171.708 229.248 163.187 222.639 163.283 213.463C163.327 207.928 166.627 203.012 169.997 198.62C197.962 162.134 238.342 137.05 268.368 102.249C272.593 97.3511 275.937 88.4719 270.114 85.6518C266.665 83.9668 262.675 86.2542 259.523 88.4457C219.842 116.009 180.16 143.581 140.478 171.153C127.53 180.146 113.945 189.401 98.3429 191.618C84.3822 193.591 70.3342 189.706 56.8101 185.734C45.4862 182.407 34.1797 178.985 22.9169 175.475C16.9362 173.607 10.7547 171.607 6.11864 167.39C1.49128 163.173 -1.15417 156.092 1.62224 150.47C3.36842 146.951 6.77352 144.725 10.3357 142.918Z" fill="url(#paint0_linear_71_3617_mobile)"/>
                  <defs>
                    <linearGradient id="paint0_linear_71_3617_mobile" x1="0.489746" y1="156.657" x2="376.979" y2="156.657" gradientUnits="userSpaceOnUse">
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
              <div className="min-w-0">
                <span className="font-bold italic text-slate-900 dark:text-white text-sm leading-tight truncate block"
                  style={{ fontFamily: 'Futura PT Extra Bold Italic, Futura, Arial, sans-serif' }}>
                  ТЕЛЕСАЙТ
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
              className="p-2 hover:bg-accent/50 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95" 
              aria-label={`Переключить на ${theme === 'dark' ? 'светлую' : 'темную'} тему`}
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div 
                    key="sun" 
                    initial={{ scale: 0.8, opacity: 0, rotate: -180 }} 
                    animate={{ scale: 1, opacity: 1, rotate: 0 }} 
                    exit={{ scale: 0.8, opacity: 0, rotate: 180 }}
                    transition={{ type: "spring", duration: 0.3 }}
                  >
                    <Sun className="h-5 w-5 text-amber-500" />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="moon" 
                    initial={{ scale: 0.8, opacity: 0, rotate: 180 }} 
                    animate={{ scale: 1, opacity: 1, rotate: 0 }} 
                    exit={{ scale: 0.8, opacity: 0, rotate: -180 }}
                    transition={{ type: "spring", duration: 0.3 }}
                  >
                    <Moon className="h-5 w-5 text-slate-700" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </header>
      )}
      
      {/* Sidebar - Always rendered, manages its own visibility */}
      <Sidebar 
        isOpen={isMobile || isTablet ? isMobileMenuOpen : true} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      
      {/* Main Content */}
      <main 
        className={`
          flex-1 min-h-screen w-full transition-all duration-300
          ${isDesktop ? 'md:ml-16 lg:ml-64' : ''}
        `}
      >
        {/* Mobile header spacer */}
        {(isMobile || isTablet) && (
          <div className="h-14" aria-hidden="true" />
        )}
        
        {/* Content wrapper with responsive padding */}
        <div className="max-w-[1920px] mx-auto">
          <div className="
            px-4 py-4
            sm:px-6 sm:py-6
            md:px-8 md:py-8
            lg:px-10 lg:py-10
            xl:px-12
            2xl:px-16
          ">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {children}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}