import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
interface LayoutProps {
  children: React.ReactNode;
}
export function Layout({
  children
}: LayoutProps) {
  const location = useLocation();
  const {
    theme,
    setTheme
  } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  return <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800/50">
      {/* Mobile Header - Improved responsive behavior */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-border">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 hover:bg-accent/50 rounded-lg transition-colors" aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}>
            <AnimatePresence mode="wait">
              {isMobileMenuOpen ? <motion.div key="close" initial={{
              scale: 0.8,
              opacity: 0
            }} animate={{
              scale: 1,
              opacity: 1
            }} exit={{
              scale: 0.8,
              opacity: 0
            }}>
                  <X className="h-5 w-5" />
                </motion.div> : <motion.div key="menu" initial={{
              scale: 0.8,
              opacity: 0
            }} animate={{
              scale: 1,
              opacity: 1
            }} exit={{
              scale: 0.8,
              opacity: 0
            }}>
                  <Menu className="h-5 w-5" />
                </motion.div>}
            </AnimatePresence>
          </button>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 hover:bg-accent/50 rounded-lg transition-colors" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <AnimatePresence mode="wait">
              {theme === 'dark' ? <motion.div key="sun" initial={{
              scale: 0.8,
              opacity: 0,
              rotate: -90
            }} animate={{
              scale: 1,
              opacity: 1,
              rotate: 0
            }} exit={{
              scale: 0.8,
              opacity: 0,
              rotate: 90
            }}>
                  <Sun className="h-5 w-5" />
                </motion.div> : <motion.div key="moon" initial={{
              scale: 0.8,
              opacity: 0,
              rotate: 90
            }} animate={{
              scale: 1,
              opacity: 1,
              rotate: 0
            }} exit={{
              scale: 0.8,
              opacity: 0,
              rotate: -90
            }}>
                  <Moon className="h-5 w-5" />
                </motion.div>}
            </AnimatePresence>
          </button>
        </div>
      </header>
      {/* Backdrop - Improved animation and blur */}
      <AnimatePresence>
        {isMobileMenuOpen && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} transition={{
        duration: 0.2
      }} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileMenuOpen(false)} aria-hidden="true" />}
      </AnimatePresence>
      {/* Desktop Sidebar - Improved positioning and shadow */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-50 w-[280px] transition-transform duration-300">
        <Sidebar isOpen={true} onClose={() => {}} />
      </div>
      {/* Mobile Sidebar - Improved animation and positioning */}
      <div className="lg:hidden">
        <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      </div>
      {/* Main Content - Improved responsive padding and max-width */}
      <main className="flex-1 min-h-screen w-full transition-all duration-300 lg:pl-[280px]">
        {/* Mobile header spacer */}
        <div className="h-14 lg:h-0" aria-hidden="true" />
        {/* Content wrapper with responsive padding */}
        <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="w-full overflow-x-hidden">{children}</div>
        </div>
      </main>
    </div>;
}