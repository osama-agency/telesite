import React from 'react';
import { Package2 } from 'lucide-react';
import { motion } from 'framer-motion';
interface LoadingStateProps {
  message?: string;
}
export function LoadingState({
  message = 'Загрузка данных...'
}: LoadingStateProps) {
  return <div className="flex flex-col items-center justify-center p-8 space-y-4 min-h-[200px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-border/50">
      <motion.div animate={{
      rotate: 360
    }} transition={{
      duration: 2,
      repeat: Infinity,
      ease: 'linear'
    }}>
        <Package2 className="h-8 w-8 text-muted-foreground" />
      </motion.div>
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>;
}