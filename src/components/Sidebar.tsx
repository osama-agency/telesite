import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Users, Receipt, ShoppingCart } from 'lucide-react';
import { useTheme } from './ThemeProvider';
interface MenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
}
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}
const menuItems: MenuItem[] = [{
  name: 'Товары',
  href: '/products',
  icon: Package
}, {
  name: 'Заказы клиентов',
  href: '/customer-orders',
  icon: Users
}, {
  name: 'Закупка товаров',
  href: '/orders',
  icon: ShoppingCart
}, {
  name: 'Расходы',
  href: '/expenses',
  icon: Receipt
}];
export function Sidebar({
  isOpen,
  onClose
}: SidebarProps) {
  const location = useLocation();
  const {
    theme
  } = useTheme();
  const logoUrl = theme === 'dark' ? "/%D0%9B%D0%BE%D0%B3%D0%BE_%D0%B4%D0%BB%D1%8F_%D1%82%D0%B5%D0%BC%D0%BD%D0%BE%D0%B8_%D1%82%D0%B5%D0%BC%D1%8B.svg" : "/%D0%9B%D0%BE%D0%B3%D0%BE_%D0%B4%D0%BB%D1%8F_%D1%81%D0%B2%D0%B5%D1%82%D0%BB%D0%BE%D0%B8_%D1%82%D0%B5%D0%BC%D1%8B_%D1%81%D0%B0%D0%B8%D1%82%D0%B0.svg";
  return <motion.aside initial={false} animate={{
    x: isOpen ? 0 : -280,
    opacity: isOpen ? 1 : 0
  }} className={`
        fixed top-0 left-0 bottom-0 z-50 w-[280px]
        bg-white dark:bg-slate-950
        border-r border-border/10
        pt-8 pb-4
        overflow-y-auto
        transition-all duration-300
      `}>
      {/* Logo */}
      <div className="px-6 mb-8">
        <Link to="/" className="block transition-transform hover:scale-[1.02] active:scale-[0.98]">
          <motion.img src={logoUrl} alt="Logo" className="h-7 w-auto" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          duration: 0.2
        }} />
        </Link>
      </div>
      {/* Navigation */}
      <nav className="space-y-1 px-4">
        {menuItems.map(item => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        return <Link key={item.href} to={item.href} onClick={() => onClose()} className={`
                group relative flex items-center gap-x-3 
                rounded-xl px-4 py-2.5 text-[15px]
                transition-colors duration-200
                ${isActive ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400' : 'text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}
              `}>
              <div className={`
                relative flex items-center justify-center
                w-5 h-5
                transition-colors duration-200
                ${isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500 dark:text-slate-400'}
              `}>
                <Icon className="h-[18px] w-[18px]" />
              </div>
              <span className="font-medium">{item.name}</span>
            </Link>;
      })}
      </nav>
    </motion.aside>;
}