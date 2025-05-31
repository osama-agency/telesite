import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Crown, Star } from 'lucide-react';

interface LeaderboardItem {
  name: string;
  value: number;
  total?: number;
}

export interface LeaderboardChartProps {
  data: Array<{ name: string; value: number }>;
  height: number;
  colors: string[];
  valueFormatter: (value: number) => string;
  onItemClick?: (item: any) => void;
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

export function LeaderboardChart({ data, height, colors, valueFormatter, onItemClick }: LeaderboardChartProps) {
  return (
    <div style={{ height }} className="overflow-y-auto">
      <div className="space-y-2">
        {data.map((item, index) => (
          <div
            key={item.name}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer"
            onClick={() => onItemClick?.(item)}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="font-medium">{item.name}</span>
            </div>
            <span className="text-muted-foreground">
              {valueFormatter(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 