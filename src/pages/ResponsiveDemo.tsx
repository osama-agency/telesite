import React from 'react';
import { PreviewWrapper } from '../components/ui/PreviewWrapper';
import { Analytics } from './AnalyticsResponsive';

export function ResponsiveDemo() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Responsive Analytics Demo
          </h1>
          <p className="text-gray-600">
            Тестирование адаптивности компонента Analytics на разных размерах экрана
          </p>
        </div>
        
        <PreviewWrapper defaultSize="desktop" showDebug={true}>
          <Analytics />
        </PreviewWrapper>
      </div>
    </div>
  );
} 