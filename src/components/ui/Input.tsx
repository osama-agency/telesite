import React, { useState, forwardRef } from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { Eye, EyeOff, Search, AlertCircle, CheckCircle2, LucideIcon } from 'lucide-react';

interface InputProps extends Omit<HTMLMotionProps<"input">, 'size'> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  variant?: 'default' | 'filled' | 'underline' | 'search';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  required?: boolean;
  showPasswordToggle?: boolean;
  onPasswordToggle?: (visible: boolean) => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  success,
  hint,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  variant = 'default',
  size = 'md',
  loading = false,
  required = false,
  showPasswordToggle = false,
  onPasswordToggle,
  className = '',
  type = 'text',
  disabled = false,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(props.value || props.defaultValue));

  const handlePasswordToggle = () => {
    const newState = !showPassword;
    setShowPassword(newState);
    onPasswordToggle?.(newState);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(Boolean(e.target.value));
    props.onChange?.(e);
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      input: 'px-3 py-2 text-sm',
      label: 'text-xs',
      icon: 'h-4 w-4',
      spacing: 'space-y-1'
    },
    md: {
      input: 'px-4 py-3 text-sm',
      label: 'text-sm',
      icon: 'h-5 w-5',
      spacing: 'space-y-2'
    },
    lg: {
      input: 'px-5 py-4 text-base',
      label: 'text-base',
      icon: 'h-6 w-6',
      spacing: 'space-y-3'
    }
  };

  // Variant styles
  const variantStyles = {
    default: `
      bg-white dark:bg-slate-900 border border-border/50
      focus:border-primary focus:ring-2 focus:ring-primary/20
      hover:border-border/70 transition-all duration-200
      rounded-xl backdrop-blur-sm
    `,
    filled: `
      bg-muted/30 border border-transparent
      focus:bg-white dark:focus:bg-slate-900 focus:border-primary 
      focus:ring-2 focus:ring-primary/20
      hover:bg-muted/50 transition-all duration-200
      rounded-xl
    `,
    underline: `
      bg-transparent border-0 border-b-2 border-border/50
      focus:border-primary focus:ring-0
      hover:border-border/70 transition-all duration-200
      rounded-none px-0
    `,
    search: `
      bg-muted/20 border border-border/30
      focus:bg-white dark:focus:bg-slate-900 focus:border-primary
      focus:ring-2 focus:ring-primary/20
      hover:bg-muted/30 transition-all duration-200
      rounded-full
    `
  };

  const config = sizeConfig[size];
  
  const inputClasses = `
    w-full outline-none
    ${config.input}
    ${variantStyles[variant]}
    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
    ${success ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${LeftIcon ? (variant === 'underline' ? 'pl-6' : 'pl-10') : ''}
    ${(RightIcon || showPasswordToggle || loading) ? (variant === 'underline' ? 'pr-6' : 'pr-10') : ''}
    ${className}
  `;

  const actualType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={`relative ${config.spacing}`}>
      {/* Label */}
      {label && (
        <motion.label
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`
            block font-medium text-foreground ${config.label}
            ${required ? "after:content-['*'] after:text-red-500 after:ml-1" : ''}
          `}
        >
          {label}
        </motion.label>
      )}

      {/* Input container */}
      <div className="relative">
        {/* Floating label for underline variant */}
        {variant === 'underline' && label && (
          <motion.label
            animate={{
              y: isFocused || hasValue ? -20 : 0,
              scale: isFocused || hasValue ? 0.85 : 1,
              color: isFocused ? 'rgb(var(--primary))' : 'rgb(var(--muted-foreground))'
            }}
            transition={{ duration: 0.2 }}
            className={`
              absolute left-0 top-3 pointer-events-none origin-left
              ${config.label} font-medium transition-colors
            `}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </motion.label>
        )}

        {/* Left icon */}
        {LeftIcon && (
          <div className={`
            absolute left-3 top-1/2 -translate-y-1/2 
            ${config.icon} text-muted-foreground
            ${variant === 'underline' ? 'left-0' : ''}
          `}>
            <LeftIcon className="w-full h-full" />
          </div>
        )}

        {/* Search icon for search variant */}
        {variant === 'search' && !LeftIcon && (
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${config.icon} text-muted-foreground`}>
            <Search className="w-full h-full" />
          </div>
        )}

        {/* Input field */}
        <motion.input
          ref={ref}
          type={actualType}
          className={inputClasses}
          disabled={disabled || loading}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleChange}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300 }}
          {...props}
        />

        {/* Right side icons */}
        <div className={`
          absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2
          ${variant === 'underline' ? 'right-0' : ''}
        `}>
          {/* Loading spinner */}
          {loading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className={`${config.icon} text-primary`}
            >
              <div className="w-full h-full border-2 border-current border-t-transparent rounded-full" />
            </motion.div>
          )}

          {/* Success icon */}
          {success && !loading && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`${config.icon} text-emerald-600`}
            >
              <CheckCircle2 className="w-full h-full" />
            </motion.div>
          )}

          {/* Error icon */}
          {error && !loading && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`${config.icon} text-red-600`}
            >
              <AlertCircle className="w-full h-full" />
            </motion.div>
          )}

          {/* Password toggle */}
          {type === 'password' && showPasswordToggle && !loading && (
            <motion.button
              type="button"
              onClick={handlePasswordToggle}
              className={`
                ${config.icon} text-muted-foreground hover:text-foreground 
                transition-colors focus:outline-none
              `}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {showPassword ? (
                <EyeOff className="w-full h-full" />
              ) : (
                <Eye className="w-full h-full" />
              )}
            </motion.button>
          )}

          {/* Custom right icon */}
          {RightIcon && !loading && !error && !success && !(type === 'password' && showPasswordToggle) && (
            <div className={`${config.icon} text-muted-foreground`}>
              <RightIcon className="w-full h-full" />
            </div>
          )}
        </div>

        {/* Focus ring for underline variant */}
        {variant === 'underline' && (
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-primary"
            initial={{ width: 0 }}
            animate={{ width: isFocused ? '100%' : 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>

      {/* Helper text */}
      <AnimatePresence mode="wait">
        {(error || success || hint) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className={`
              text-xs leading-relaxed
              ${error ? 'text-red-600 dark:text-red-400' : ''}
              ${success ? 'text-emerald-600 dark:text-emerald-400' : ''}
              ${hint && !error && !success ? 'text-muted-foreground' : ''}
            `}
          >
            {error || success || hint}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}); 