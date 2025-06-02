import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PreviewSize {
  id: string;
  label: string;
  icon: React.ReactNode;
  width: string;
  height: string;
  className: string;
}

const previewSizes: PreviewSize[] = [
  {
    id: 'mobile',
    label: 'Mobile',
    icon: <Smartphone className="h-4 w-4" />,
    width: '375px',
    height: '812px',
    className: 'w-[375px] h-[812px]'
  },
  {
    id: 'tablet',
    label: 'Tablet',
    icon: <Tablet className="h-4 w-4" />,
    width: '768px',
    height: '1024px',
    className: 'w-[768px] h-[1024px]'
  },
  {
    id: 'desktop',
    label: 'Desktop',
    icon: <Monitor className="h-4 w-4" />,
    width: '1280px',
    height: '800px',
    className: 'w-[1280px] h-[800px]'
  }
];

interface PreviewWrapperProps {
  children: React.ReactNode;
  defaultSize?: string;
  showDebug?: boolean;
}

export function PreviewWrapper({ 
  children, 
  defaultSize = 'desktop',
  showDebug = true 
}: PreviewWrapperProps) {
  const [currentSize, setCurrentSize] = useState(defaultSize);
  const [isRotated, setIsRotated] = useState(false);
  
  const activeSize = previewSizes.find(size => size.id === currentSize) || previewSizes[2];
  
  const toggleRotation = () => {
    setIsRotated(!isRotated);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Control Panel */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">Responsive Preview</h3>
            <div className="text-sm text-gray-500">
              {activeSize.width} × {activeSize.height}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Size Selector */}
            <div className="flex rounded-lg border bg-gray-50 p-1">
              {previewSizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setCurrentSize(size.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
                    currentSize === size.id
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {size.icon}
                  {size.label}
                </button>
              ))}
            </div>
            
            {/* Rotation Toggle */}
            {currentSize !== 'desktop' && (
              <button
                onClick={toggleRotation}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium border transition-all",
                  isRotated
                    ? "bg-blue-50 text-blue-600 border-blue-200"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                )}
              >
                <RotateCcw className="h-4 w-4" />
                Rotate
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Preview Container */}
      <div className="flex justify-center">
        <div className="relative">
          {/* Device Frame */}
          <div 
            className={cn(
              "relative bg-white border-2 border-gray-300 rounded-lg shadow-xl overflow-hidden transition-all duration-300",
              activeSize.className,
              isRotated && currentSize !== 'desktop' && "transform rotate-90 origin-center",
              // Debug borders
              showDebug && "border-dashed border-red-400 bg-red-50"
            )}
            style={{
              ...(isRotated && currentSize !== 'desktop' && {
                width: activeSize.height,
                height: activeSize.width
              })
            }}
          >
            {/* Device Header */}
            <div className={cn(
              "bg-gray-100 border-b px-4 py-2 flex items-center justify-between text-sm text-gray-600",
              showDebug && "bg-yellow-100 border-yellow-300"
            )}>
              <div className="flex items-center gap-2">
                {activeSize.icon}
                <span className="font-medium">{activeSize.label}</span>
                {isRotated && <span className="text-xs">(Rotated)</span>}
              </div>
              <div className="text-xs">
                {isRotated && currentSize !== 'desktop' 
                  ? `${activeSize.height} × ${activeSize.width}`
                  : `${activeSize.width} × ${activeSize.height}`
                }
              </div>
            </div>
            
            {/* Content Area */}
            <div className={cn(
              "h-full overflow-auto",
              showDebug && "bg-blue-50 border-2 border-dashed border-blue-300"
            )}>
              {children}
            </div>
          </div>
          
          {/* Debug Info */}
          {showDebug && (
            <div className="absolute -bottom-8 left-0 right-0 text-center">
              <div className="inline-block bg-black text-white text-xs px-2 py-1 rounded">
                Current: {activeSize.id} 
                {isRotated && ' (rotated)'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 