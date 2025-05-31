import React from 'react';
import { 
  Package2, Search, Filter, Database, FileX, Users, 
  ShoppingCart, TrendingDown, AlertCircle, Inbox,
  Sparkles, Coffee, Smile, BookOpen, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  message: string;
  description?: string;
  icon?: React.ElementType;
  action?: {
    label: string;
    onClick: () => void;
  };
  type?: 'default' | 'search' | 'filter' | 'error' | 'products' | 'orders' | 'customers' | 'analytics' | 'loading' | 'maintenance';
  size?: 'sm' | 'md' | 'lg';
  showIllustration?: boolean;
}

export function EmptyState({
  message,
  description,
  icon,
  action,
  type = 'default',
  size = 'md',
  showIllustration = true
}: EmptyStateProps) {
  const iconMap = {
    default: Package2,
    search: Search,
    filter: Filter,
    error: AlertCircle,
    products: Package2,
    orders: ShoppingCart,
    customers: Users,
    analytics: TrendingDown,
    loading: Sparkles,
    maintenance: Coffee
  };

  const illustrationMap = {
    default: '📦',
    search: '🔍',
    filter: '🔽',
    error: '⚠️',
    products: '📦',
    orders: '🛒',
    customers: '👥',
    analytics: '📊',
    loading: '✨',
    maintenance: '☕'
  };

  const colorMap = {
    default: 'from-slate-400/20 to-slate-500/20 text-slate-500',
    search: 'from-blue-400/20 to-blue-500/20 text-blue-500',
    filter: 'from-purple-400/20 to-purple-500/20 text-purple-500',
    error: 'from-red-400/20 to-red-500/20 text-red-500',
    products: 'from-emerald-400/20 to-emerald-500/20 text-emerald-500',
    orders: 'from-orange-400/20 to-orange-500/20 text-orange-500',
    customers: 'from-pink-400/20 to-pink-500/20 text-pink-500',
    analytics: 'from-indigo-400/20 to-indigo-500/20 text-indigo-500',
    loading: 'from-yellow-400/20 to-yellow-500/20 text-yellow-500',
    maintenance: 'from-amber-400/20 to-amber-500/20 text-amber-500'
  };
  
  const Icon = icon || iconMap[type];
  const illustration = illustrationMap[type];
  const colors = colorMap[type];

  const containerSizes = {
    sm: 'p-6 space-y-3 min-h-[200px]',
    md: 'p-8 sm:p-12 space-y-4 min-h-[300px] sm:min-h-[400px]',
    lg: 'p-12 sm:p-16 space-y-6 min-h-[400px] sm:min-h-[500px]'
  };

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8 sm:h-10 sm:w-10',
    lg: 'h-10 w-10 sm:h-12 sm:w-12'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg'
  };

  // Floating background elements
  const FloatingElements = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary/10 rounded-full"
          animate={{
            y: [0, -30, 0],
            x: [0, Math.sin(i) * 20, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeInOut"
          }}
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + i * 10}%`
          }}
        />
      ))}
    </div>
  );

  // Animated illustration
  const AnimatedIllustration = () => (
    <motion.div
      className="text-6xl sm:text-7xl lg:text-8xl"
      animate={{
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0]
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {illustration}
    </motion.div>
  );
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`flex flex-col items-center justify-center relative ${containerSizes[size]}`}
    >
      <FloatingElements />
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          delay: 0.1,
          type: "spring",
          stiffness: 200,
          damping: 20
        }}
        className="relative mb-4"
      >
        {/* Background blur effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colors} rounded-full blur-3xl opacity-60`} />
        
        {/* Main icon container */}
        <div className={`relative rounded-full bg-gradient-to-br ${colors} p-6 sm:p-8 backdrop-blur-sm border border-white/10`}>
          <Icon className={`${iconSizes[size]} text-current`} />
          
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-current opacity-20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Orbiting elements */}
        {type === 'loading' && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                animate={{
                  rotate: 360
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  transform: `rotate(${i * 120}deg) translateX(40px) rotate(-${i * 120}deg)`
                }}
              />
            ))}
          </>
        )}
      </motion.div>

      {/* Illustration */}
      {showIllustration && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <AnimatedIllustration />
        </motion.div>
      )}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center space-y-3 max-w-md mx-auto"
      >
        <h3 className={`${textSizes[size]} font-semibold text-foreground leading-relaxed`}>
          {message}
        </h3>
        
        {description && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xs sm:text-sm text-muted-foreground leading-relaxed"
          >
            {description}
          </motion.p>
        )}

        {/* Context-specific tips */}
        {type === 'search' && !action && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-muted-foreground space-y-1"
          >
            <p>💡 Попробуйте:</p>
            <ul className="text-left space-y-1 inline-block">
              <li>• Упростить запрос</li>
              <li>• Проверить орфографию</li>
              <li>• Использовать синонимы</li>
            </ul>
          </motion.div>
        )}

        {type === 'filter' && !action && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-muted-foreground"
          >
            🔄 Попробуйте изменить фильтры или сбросить их
          </motion.p>
        )}
      </motion.div>
      
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <motion.button 
            onClick={action.onClick} 
            className="btn-primary group relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">{action.label}</span>
            <motion.span
              className="inline-block ml-2 relative z-10"
              animate={{ x: [0, 3, 0] }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.5,
                ease: "easeInOut"
              }}
            >
              →
            </motion.span>
            
            {/* Button glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
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
          </motion.button>
        </motion.div>
      )}

      {/* Decorative elements based on type */}
      {type === 'analytics' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-4 right-4 text-xs text-muted-foreground opacity-50"
        >
          📈 Аналитика появится после первых данных
        </motion.div>
      )}

      {type === 'maintenance' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-4 left-4 text-xs text-muted-foreground opacity-50"
        >
          ⏰ Скоро вернемся
        </motion.div>
      )}
    </motion.div>
  );
}