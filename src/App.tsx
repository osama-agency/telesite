import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Analytics } from './pages/Analytics';
import { Products } from './pages/Products';
import { Expenses } from './pages/Expenses';
import { Orders } from './pages/Orders';
import { Purchases } from './pages/Purchases';
import { CustomerOrders } from './pages/CustomerOrders';
import { Test } from './pages/Test';
import { ResponsiveDemo } from './pages/ResponsiveDemo';
import DataSync from './pages/DataSync';
import Login from './pages/Login';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from 'sonner';
import { ProtectedRoute } from './components/ProtectedRoute';

// Расширение типа window для поддержки демо-режима
declare global {
  interface Window {
    isDemoMode?: boolean;
  }
}

/**
 * Защищенный Layout компонент
 * Проверяет роль пользователя и устанавливает флаг демо-режима
 */
const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Проверяем роль пользователя из localStorage
    const userRole = localStorage.getItem('userRole');
    const isDemo = userRole === 'demo';
    window.isDemoMode = isDemo;
  }, []);

  return (
    <ProtectedRoute>
      <Layout>
        {children}
      </Layout>
    </ProtectedRoute>
  );
};

/**
 * Главный компонент приложения
 * Настраивает маршрутизацию и глобальные провайдеры
 */
export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Публичный маршрут для страницы входа */}
          <Route path="/login" element={<Login />} />
          
          {/* Демо-страница для тестирования адаптивности (без Layout) */}
          <Route path="/responsive-demo" element={<ResponsiveDemo />} />
          
          {/* Защищенные маршруты приложения */}
          <Route path="/" element={<ProtectedLayout><Analytics /></ProtectedLayout>} />
          <Route path="/analytics" element={<ProtectedLayout><Analytics /></ProtectedLayout>} />
          <Route path="/products" element={<ProtectedLayout><Products /></ProtectedLayout>} />
          <Route path="/expenses" element={<ProtectedLayout><Expenses /></ProtectedLayout>} />
          <Route path="/orders" element={<ProtectedLayout><Orders /></ProtectedLayout>} />
          <Route path="/purchases" element={<ProtectedLayout><Purchases /></ProtectedLayout>} />
          <Route path="/customer-orders" element={<ProtectedLayout><CustomerOrders /></ProtectedLayout>} />
          <Route path="/test" element={<ProtectedLayout><Test /></ProtectedLayout>} />
          <Route path="/data-sync" element={<ProtectedLayout><DataSync /></ProtectedLayout>} />
          
          {/* Редирект для несуществующих маршрутов */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      
      {/* Глобальный компонент для отображения уведомлений */}
      <Toaster 
        richColors 
        position="top-right" 
        toastOptions={{
          style: {
            marginTop: '16px',
          },
        }}
      />
    </ThemeProvider>
  );
}