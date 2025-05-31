import React, { useEffect } from 'react';
import { Analytics } from './Analytics';
import { PlayCircle } from 'lucide-react';

// Extend window type for demo mode
declare global {
  interface Window {
    isDemoMode?: boolean;
  }
}

// Demo banner component
const DemoBanner = () => (
  <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 text-center z-[60] shadow-md">
    <div className="flex items-center justify-center gap-2">
      <PlayCircle className="h-4 w-4" />
      <span className="text-sm font-medium">
        Демо режим - данные являются тестовыми
      </span>
    </div>
  </div>
);

export function Demo() {
  useEffect(() => {
    // Устанавливаем флаг демо режима
    window.isDemoMode = true;
    
    return () => {
      window.isDemoMode = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <DemoBanner />
      <div className="pt-8"> {/* Отступ для баннера */}
        <Analytics />
      </div>
    </div>
  );
} 