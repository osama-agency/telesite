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
import Login from './pages/Login';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from 'sonner';
import { ProtectedRoute } from './components/ProtectedRoute';

// Extend window type for demo mode
declare global {
  interface Window {
    isDemoMode?: boolean;
  }
}

// Защищенный Layout с проверкой демо-режима
const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Проверяем роль пользователя из localStorage
    const userRole = localStorage.getItem('userRole');
    const isDemo = userRole === 'demo';
    setIsDemoMode(isDemo);
    window.isDemoMode = isDemo;
  }, []);

  const handleExitDemo = () => {
    // Выход из демо = выход из системы
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    window.location.href = '/login';
  };

  return (
    <ProtectedRoute>
      <Layout isDemoMode={isDemoMode} onExitDemo={handleExitDemo}>
        {children}
      </Layout>
    </ProtectedRoute>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Публичный маршрут */}
          <Route path="/login" element={<Login />} />
          
          {/* Защищенные маршруты */}
          <Route path="/" element={<ProtectedLayout><Analytics /></ProtectedLayout>} />
          <Route path="/analytics" element={<ProtectedLayout><Analytics /></ProtectedLayout>} />
          <Route path="/products" element={<ProtectedLayout><Products /></ProtectedLayout>} />
          <Route path="/expenses" element={<ProtectedLayout><Expenses /></ProtectedLayout>} />
          <Route path="/orders" element={<ProtectedLayout><Orders /></ProtectedLayout>} />
          <Route path="/purchases" element={<ProtectedLayout><Purchases /></ProtectedLayout>} />
          <Route path="/customer-orders" element={<ProtectedLayout><CustomerOrders /></ProtectedLayout>} />
          <Route path="/test" element={<ProtectedLayout><Test /></ProtectedLayout>} />
          
          {/* Редирект по умолчанию */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
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