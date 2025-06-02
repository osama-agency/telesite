import React from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';

interface ResponsiveDebuggerProps {
  className?: string;
}

export function ResponsiveDebugger({ className = '' }: ResponsiveDebuggerProps) {
  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Mobile indicator */}
      <div className="sm:hidden flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg border-2 border-red-600">
        <Smartphone className="h-4 w-4" />
        <span className="text-sm font-medium">Mobile</span>
        <span className="text-xs opacity-75">&lt;640px</span>
      </div>
      
      {/* Tablet indicator */}
      <div className="hidden sm:block md:hidden lg:hidden xl:hidden">
        <div className="flex items-center gap-2 bg-yellow-500 text-white px-3 py-2 rounded-lg shadow-lg border-2 border-yellow-600">
          <Tablet className="h-4 w-4" />
          <span className="text-sm font-medium">Tablet SM</span>
          <span className="text-xs opacity-75">640px+</span>
        </div>
      </div>
      
      {/* Medium tablet indicator */}
      <div className="hidden md:block lg:hidden xl:hidden">
        <div className="flex items-center gap-2 bg-orange-500 text-white px-3 py-2 rounded-lg shadow-lg border-2 border-orange-600">
          <Tablet className="h-4 w-4" />
          <span className="text-sm font-medium">Tablet MD</span>
          <span className="text-xs opacity-75">768px+</span>
        </div>
      </div>
      
      {/* Large screen indicator */}
      <div className="hidden lg:block xl:hidden">
        <div className="flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg border-2 border-blue-600">
          <Monitor className="h-4 w-4" />
          <span className="text-sm font-medium">Desktop LG</span>
          <span className="text-xs opacity-75">1024px+</span>
        </div>
      </div>
      
      {/* XL screen indicator */}
      <div className="hidden xl:block">
        <div className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg border-2 border-green-600">
          <Monitor className="h-4 w-4" />
          <span className="text-sm font-medium">Desktop XL</span>
          <span className="text-xs opacity-75">1280px+</span>
        </div>
      </div>
    </div>
  );
} 