import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2, LucideIcon } from 'lucide-react';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, 'size' | 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: boolean;
  animation?: 'scale' | 'bounce' | 'pulse' | 'glow' | 'none';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  rounded = false,
  animation = 'scale',
  className = '',
  children,
  ...props
}: ButtonProps) {
  
  // Variant styles
  const variants = {
    primary: `
      bg-primary text-primary-foreground 
      hover:bg-primary/90 focus:ring-primary/20
      shadow-sm hover:shadow-md
    `,
    secondary: `
      bg-secondary text-secondary-foreground 
      hover:bg-secondary/80 focus:ring-secondary/20
      border border-border/50 shadow-sm hover:shadow-md
    `,
    outline: `
      bg-transparent border border-border 
      hover:bg-muted/50 focus:ring-primary/20
      text-foreground hover:border-border/70
    `,
    ghost: `
      bg-transparent hover:bg-muted/50 
      text-foreground focus:ring-primary/20
    `,
    danger: `
      bg-red-600 text-white 
      hover:bg-red-700 focus:ring-red-500/20
      shadow-sm hover:shadow-md
    `,
    success: `
      bg-emerald-600 text-white 
      hover:bg-emerald-700 focus:ring-emerald-500/20
      shadow-sm hover:shadow-md
    `,
    warning: `
      bg-amber-600 text-white 
      hover:bg-amber-700 focus:ring-amber-500/20
      shadow-sm hover:shadow-md
    `,
    gradient: `
      bg-gradient-to-r from-primary via-purple-500 to-primary 
      text-white shadow-lg hover:shadow-xl
      bg-size-200 hover:bg-pos-0 focus:ring-primary/30
    `
  };

  // Size styles
  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  // Icon sizes
  const iconSizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-6 w-6'
  };

  // Animation configurations
  const animations = {
    scale: {
      whileHover: { scale: 1.02 },
      whileTap: { scale: 0.98 }
    },
    bounce: {
      whileHover: { y: -2 },
      whileTap: { y: 0 }
    },
    pulse: {
      whileHover: { scale: [1, 1.05, 1] },
      whileTap: { scale: 0.95 }
    },
    glow: {
      whileHover: { 
        boxShadow: "0 0 20px rgba(var(--primary), 0.4)" 
      },
      whileTap: { scale: 0.98 }
    },
    none: {}
  };

  const animationProps = animations[animation];

  // Base button classes
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    disabled:hover:scale-100 disabled:hover:shadow-none
    ${rounded ? 'rounded-full' : 'rounded-xl'}
    ${fullWidth ? 'w-full' : ''}
    ${variants[variant]}
    ${sizes[size]}
  `;

  const isDisabled = disabled || loading;

  return (
    <motion.button
      className={`${baseClasses} ${className}`}
      disabled={isDisabled}
      {...(animation !== 'none' && !isDisabled ? animationProps : {})}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      {...props}
    >
      {/* Loading spinner or left icon */}
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`${iconSizes[size]} mr-2`}
        >
          <Loader2 className="w-full h-full" />
        </motion.div>
      ) : (
        Icon && iconPosition === 'left' && (
          <Icon className={`${iconSizes[size]} mr-2 flex-shrink-0`} />
        )
      )}

      {/* Button content */}
      <span className={loading ? 'opacity-70' : ''}>
        {children}
      </span>

      {/* Right icon */}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className={`${iconSizes[size]} ml-2 flex-shrink-0`} />
      )}

      {/* Gradient animation overlay */}
      {variant === 'gradient' && !isDisabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "linear"
          }}
        />
      )}

      {/* Success ripple effect */}
      {variant === 'success' && !isDisabled && (
        <motion.div
          className="absolute inset-0 bg-emerald-400 rounded-xl opacity-0"
          animate={{
            scale: [1, 1.1],
            opacity: [0.3, 0]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatDelay: 2
          }}
        />
      )}
    </motion.button>
  );
}
