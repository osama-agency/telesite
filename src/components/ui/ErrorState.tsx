import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';
interface ErrorStateProps {
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
export function ErrorState({
  title = 'Произошла ошибка',
  message,
  action = {
    label: 'Повторить попытку',
    onClick: () => window.location.reload()
  }
}: ErrorStateProps) {
  return <div className="min-h-[200px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-red-200/50 dark:border-red-800/50 p-8 flex flex-col items-center justify-center text-center">
      <motion.div initial={{
      scale: 0.95,
      opacity: 0
    }} animate={{
      scale: 1,
      opacity: 1
    }} className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
      </motion.div>
      <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
        {title}
      </h3>
      <p className="text-sm text-red-700/90 dark:text-red-300/90 mb-4">
        {message}
      </p>
      {action && <button onClick={action.onClick} className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors">
          <RefreshCcw className="h-4 w-4 mr-2" />
          {action.label}
        </button>}
    </div>;
}