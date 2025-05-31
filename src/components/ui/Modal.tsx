import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2 } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'drawer' | 'center' | 'fullscreen';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  maxWidth?: string;
  footer?: React.ReactNode;
  scrollable?: boolean;
  blur?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'default',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  maxWidth,
  footer,
  scrollable = true,
  blur = true
}: ModalProps) {
  
  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = scrollable ? '0' : '17px'; // Compensate for scrollbar
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0';
    };
  }, [isOpen, scrollable]);

  // Size configurations
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };

  // Variant configurations
  const variantConfig = {
    default: {
      container: 'flex items-center justify-center min-h-screen p-4',
      modal: 'relative w-full mx-auto',
      animation: {
        initial: { opacity: 0, scale: 0.9, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.9, y: 20 }
      }
    },
    drawer: {
      container: 'flex items-end justify-center min-h-screen',
      modal: 'relative w-full mx-auto',
      animation: {
        initial: { opacity: 0, y: '100%' },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: '100%' }
      }
    },
    center: {
      container: 'flex items-center justify-center min-h-screen p-4',
      modal: 'relative w-full mx-auto',
      animation: {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 }
      }
    },
    fullscreen: {
      container: 'flex items-center justify-center min-h-screen',
      modal: 'relative w-full h-full',
      animation: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      }
    }
  };

  const config = variantConfig[variant];

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 overflow-y-auto"
          onClick={handleOverlayClick}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`
              fixed inset-0 bg-black/50 dark:bg-black/70
              ${blur ? 'backdrop-blur-sm' : ''}
            `}
          />
          
          {/* Modal container */}
          <div className={config.container}>
            <motion.div
              initial={config.animation.initial}
              animate={config.animation.animate}
              exit={config.animation.exit}
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 300,
                duration: 0.3 
              }}
              className={`
                ${config.modal}
                ${variant === 'fullscreen' ? 'max-w-none' : sizeClasses[size]}
                ${maxWidth ? maxWidth : ''}
                ${className}
              `}
              style={{ maxWidth: maxWidth }}
            >
              {/* Modal content */}
              <div className={`
                relative 
                ${variant === 'fullscreen' 
                  ? 'h-screen' 
                  : 'max-h-[90vh]'
                }
                ${variant === 'drawer' 
                  ? 'rounded-t-2xl' 
                  : variant === 'fullscreen' 
                    ? 'rounded-none' 
                    : 'rounded-2xl'
                }
                bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl
                border border-border/50 shadow-2xl
                overflow-hidden
              `}>
                {/* Header */}
                {(title || showCloseButton) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center justify-between p-6 border-b border-border/50"
                  >
                    {title && (
                      <h2 className="text-lg sm:text-xl font-semibold text-foreground leading-tight">
                        {title}
                      </h2>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      {variant !== 'fullscreen' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                          title="Развернуть"
                        >
                          <Maximize2 className="h-4 w-4 text-muted-foreground" />
                        </motion.button>
                      )}
                      
                      {showCloseButton && (
                        <motion.button
                          onClick={onClose}
                          whileHover={{ scale: 1.05, rotate: 90 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                          title="Закрыть"
                        >
                          <X className="h-4 w-4 text-muted-foreground group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                )}
                
                {/* Body */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className={`
                    p-6
                    ${scrollable && variant !== 'fullscreen' 
                      ? 'overflow-y-auto max-h-[60vh]' 
                      : ''
                    }
                    ${footer ? 'pb-0' : ''}
                  `}
                >
                  {children}
                </motion.div>
                
                {/* Footer */}
                {footer && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-end space-x-3 p-6 border-t border-border/50 bg-muted/20"
                  >
                    {footer}
                  </motion.div>
                )}

                {/* Loading bar animation for content */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20"
                />
              </div>
            </motion.div>
          </div>

          {/* Focus trap and aria */}
          <div 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby={title ? "modal-title" : undefined}
            className="sr-only"
          >
            {title}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 