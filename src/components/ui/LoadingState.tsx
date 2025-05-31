import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, Zap } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullPage?: boolean;
  variant?: 'default' | 'pulse' | 'dots' | 'shimmer' | 'sparkle';
  showProgress?: boolean;
  progress?: number;
}

export function LoadingState({ 
  message = 'Загрузка данных...', 
  size = 'md',
  fullPage = false,
  variant = 'default',
  showProgress = false,
  progress = 0
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const spinnerSizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  };
  
  const containerClasses = fullPage 
    ? 'fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-white/50 dark:bg-slate-950/50 z-50' 
    : 'flex flex-col items-center justify-center p-8 sm:p-12 space-y-6 min-h-[300px] sm:min-h-[400px]';

  // Dots Loading Animation
  const DotsLoader = () => (
    <div className="flex space-x-2">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-3 h-3 bg-primary rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );

  // Shimmer Loading Animation  
  const ShimmerLoader = () => (
    <div className="relative overflow-hidden bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl p-8">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10"
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <Loader2 className={`${spinnerSizes[size]} text-primary opacity-50`} />
    </div>
  );

  // Sparkle Loading Animation
  const SparkleLoader = () => (
    <div className="relative">
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          rotate: { duration: 3, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
        className="relative"
      >
        <div className={`absolute inset-0 ${spinnerSizes[size]} bg-gradient-to-r from-primary via-purple-500 to-pink-500 blur-xl opacity-60`} />
        <Sparkles className={`${spinnerSizes[size]} text-primary relative z-10`} />
      </motion.div>
      
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/60 rounded-full"
          animate={{
            y: [0, -20, 0],
            x: [0, Math.sin(i) * 20, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 2 + i * 0.2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut"
          }}
          style={{
            left: `${20 + i * 10}%`,
            top: `${20 + i * 5}%`
          }}
        />
      ))}
    </div>
  );

  // Pulse Loading Animation
  const PulseLoader = () => (
    <div className="relative">
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        <div className={`absolute inset-0 ${spinnerSizes[size]} bg-primary/30 blur-2xl rounded-full`} />
        <Zap className={`${spinnerSizes[size]} text-primary relative z-10`} />
      </motion.div>
      
      {/* Ripple effect */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 border border-primary/20 rounded-full"
          animate={{
            scale: [1, 2.5],
            opacity: [0.8, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.7,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoader />;
      case 'shimmer':
        return <ShimmerLoader />;
      case 'sparkle':
        return <SparkleLoader />;
      case 'pulse':
        return <PulseLoader />;
      default:
        return (
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <Loader2 className={`${spinnerSizes[size]} text-primary`} />
            </motion.div>
            <div className={`absolute inset-0 ${spinnerSizes[size]} bg-primary/20 blur-xl rounded-full`} />
          </div>
        );
    }
  };
  
  return (
    <div className={containerClasses}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center space-y-6 text-center max-w-sm"
      >
        {renderLoader()}
        
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="space-y-2"
          >
            <p className="text-sm sm:text-base text-foreground font-medium">
              {message}
            </p>
            
            {/* Progress bar */}
            {showProgress && (
              <div className="w-32 sm:w-48 h-1 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-purple-500"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
            
            {/* Loading tips */}
            {variant === 'sparkle' && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xs text-muted-foreground"
              >
                ✨ Подготавливаем данные...
              </motion.p>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}