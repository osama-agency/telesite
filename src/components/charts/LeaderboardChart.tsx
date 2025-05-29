import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Crown, Star } from 'lucide-react';

interface LeaderboardItem {
  name: string;
  value: number;
  total?: number;
}

interface LeaderboardChartProps {
  data: LeaderboardItem[];
  title?: string;
  formatValue?: (value: number) => string;
  showPercentage?: boolean;
  onItemClick?: (item: LeaderboardItem) => void;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="w-6 h-6" />;
    case 2:
      return <Medal className="w-5 h-5" />;
    case 3:
      return <Award className="w-5 h-5" />;
    default:
      return <span className="text-lg font-bold">#{rank}</span>;
  }
};

const getRankColors = (rank: number) => {
  switch (rank) {
    case 1:
      return {
        bg: 'from-yellow-400/20 to-amber-400/20 dark:from-yellow-600/20 dark:to-amber-600/20',
        border: 'border-yellow-400/50 dark:border-yellow-600/50',
        text: 'text-yellow-700 dark:text-yellow-400',
        icon: 'text-yellow-600 dark:text-yellow-400',
        bar: 'from-yellow-400 to-amber-500',
        glow: 'shadow-yellow-400/50'
      };
    case 2:
      return {
        bg: 'from-gray-300/20 to-gray-400/20 dark:from-gray-600/20 dark:to-gray-700/20',
        border: 'border-gray-400/50 dark:border-gray-600/50',
        text: 'text-gray-700 dark:text-gray-400',
        icon: 'text-gray-600 dark:text-gray-400',
        bar: 'from-gray-400 to-gray-500',
        glow: 'shadow-gray-400/50'
      };
    case 3:
      return {
        bg: 'from-orange-400/20 to-orange-500/20 dark:from-orange-600/20 dark:to-orange-700/20',
        border: 'border-orange-400/50 dark:border-orange-600/50',
        text: 'text-orange-700 dark:text-orange-400',
        icon: 'text-orange-600 dark:text-orange-400',
        bar: 'from-orange-400 to-orange-500',
        glow: 'shadow-orange-400/50'
      };
    default:
      return {
        bg: 'from-slate-100/50 to-slate-200/50 dark:from-slate-800/50 dark:to-slate-900/50',
        border: 'border-slate-300/50 dark:border-slate-700/50',
        text: 'text-slate-700 dark:text-slate-400',
        icon: 'text-slate-600 dark:text-slate-400',
        bar: 'from-slate-400 to-slate-500',
        glow: ''
      };
  }
};

export function LeaderboardChart({ 
  data, 
  title, 
  formatValue = (v) => `₽${v.toLocaleString()}`,
  showPercentage = true,
  onItemClick
}: LeaderboardChartProps) {
  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const rank = index + 1;
        const colors = getRankColors(rank);
        const percentage = (item.value / maxValue) * 100;
        
        return (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              delay: index * 0.1, 
              duration: 0.5,
              ease: [0.25, 0.1, 0.25, 1.0]
            }}
            whileHover={{ scale: 1.02 }}
            className={`relative`}
          >
            <motion.div
              className={`
                relative overflow-hidden rounded-xl border backdrop-blur-sm
                ${colors.border} ${colors.bg} bg-gradient-to-br
                transition-all duration-300 hover:shadow-lg
                ${rank === 1 ? 'shadow-lg ' + colors.glow : ''}
                ${onItemClick ? 'cursor-pointer hover:scale-105' : ''}
              `}
              onClick={() => onItemClick?.(item)}
              animate={rank === 1 ? {
                boxShadow: [
                  '0 0 20px rgba(251, 191, 36, 0.3)',
                  '0 0 40px rgba(251, 191, 36, 0.5)',
                  '0 0 20px rgba(251, 191, 36, 0.3)',
                ]
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Animated background pattern for #1 */}
              {rank === 1 && (
                <motion.div
                  className="absolute inset-0 opacity-10"
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23fbbf24" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    backgroundSize: '60px 60px',
                  }}
                />
              )}

              <div className="relative p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  {/* Rank Badge */}
                  <motion.div
                    className={`
                      flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 
                      flex items-center justify-center
                      rounded-full bg-white/50 dark:bg-slate-900/50
                      ${colors.icon}
                    `}
                    animate={rank === 1 ? { 
                      rotate: [0, -10, 10, -10, 10, 0],
                      scale: [1, 1.1, 1]
                    } : {}}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                  >
                    {getRankIcon(rank)}
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-2">
                      <h4 className={`font-semibold text-sm sm:text-base truncate ${colors.text}`}>
                        {item.name}
                      </h4>
                      <span className={`font-bold text-sm sm:text-base ${colors.text} flex-shrink-0`}>
                        {formatValue(item.value)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ 
                          delay: index * 0.1 + 0.3, 
                          duration: 0.8,
                          ease: [0.25, 0.1, 0.25, 1.0]
                        }}
                        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colors.bar} rounded-full`}
                      >
                        {rank === 1 && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{
                              x: ['-100%', '200%']
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 1,
                              ease: "easeInOut"
                            }}
                          />
                        )}
                      </motion.div>
                    </div>

                    {/* Percentage */}
                    {showPercentage && (
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}% от лидера
                        </span>
                        {rank === 1 && (
                          <motion.div
                            className="flex items-center gap-1"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                              Лидер
                            </span>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Crown for #1 */}
            {rank === 1 && (
              <motion.div
                className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <Crown className="w-6 h-6 text-yellow-500 fill-yellow-400" />
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
} 