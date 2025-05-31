import { useState, useRef, ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { LogOut, User, Palette } from "lucide-react";

type Theme = 'dark' | 'light';

interface AccountMenuDropdownProps {
  userEmail?: string | null;
  userRole?: string | null;
  isDemoMode?: boolean;
  theme?: Theme;
  setTheme?: (theme: Theme) => void;
  onLogout?: () => void;
  /** Дополнительный контент (например, email и роль), который будет отображён справа от аватара и тоже откроет меню при клике */
  children?: ReactNode;
}

const AccountMenuDropdown: React.FC<AccountMenuDropdownProps> = ({
  userEmail = null,
  userRole = null,
  isDemoMode = false,
  theme = 'light',
  setTheme = () => {},
  onLogout = () => {},
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    console.log('Button clicked! Current isOpen:', isOpen);
    setIsOpen(!isOpen);
  };

  const handleThemeToggle = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  // Закрытие при клике вне меню
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (buttonRef.current && !buttonRef.current.contains(target)) {
        const dropdown = document.querySelector('.dropdown-menu');
        if (dropdown && !dropdown.contains(target)) {
          setIsOpen(false);
        }
      }
    };

    // Добавляем обработчик с небольшой задержкой
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      {/* Кнопка */}
      <div
        ref={buttonRef}
        className="flex items-center gap-2 cursor-pointer"
        onClick={handleClick}
      >
        <div
          className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all
            ${isDemoMode
              ? 'bg-gradient-to-br from-amber-400 to-orange-500'
              : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500'}
            shadow-lg hover:scale-105`}
        >
          <User className="w-5 h-5 text-white" />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-900 rounded-full"></div>
        </div>
        {children}
      </div>

      {/* Меню */}
      {isOpen && createPortal(
        <div 
          className="dropdown-menu fixed w-72 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800"
          style={{ 
            position: 'fixed', 
            zIndex: 99999,
            bottom: buttonRef.current ? window.innerHeight - buttonRef.current.getBoundingClientRect().top + 8 : 0,
            left: buttonRef.current ? buttonRef.current.getBoundingClientRect().left : 0
          }}
        >
          <div className={`p-4 ${isDemoMode
            ? 'bg-gradient-to-br from-amber-400/10 to-orange-500/10'
            : 'bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg
                ${isDemoMode
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                  : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500'}`}>
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {userEmail || 'Пользователь'}
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1
                  ${isDemoMode
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'}`}>
                  {isDemoMode ? 'Демо режим' : 'Администратор'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-800 dark:text-gray-200">Тема оформления</span>
              </div>
              <button
                onClick={handleThemeToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${theme === 'dark' ? 'bg-purple-600' : 'bg-gray-300'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4" /> Выйти из аккаунта
            </button>
          </div>
        </div>
      , document.body)}
    </div>
  );
};

export default AccountMenuDropdown;