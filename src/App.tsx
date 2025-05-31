import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Analytics } from './pages/Analytics';
import { Products } from './pages/Products';
import { Expenses } from './pages/Expenses';
import { Orders } from './pages/Orders';
import { Purchases } from './pages/Purchases';
import { CustomerOrders } from './pages/CustomerOrders';
import { Test } from './pages/Test';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from 'sonner';

// Extend window type for demo mode
declare global {
  interface Window {
    isDemoMode?: boolean;
  }
}

export default function App() {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check localStorage and window for demo mode
    const savedDemoMode = localStorage.getItem('isDemoMode') === 'true';
    setIsDemoMode(savedDemoMode || window.isDemoMode === true);
    window.isDemoMode = savedDemoMode;
  }, []);

  const handleExitDemo = () => {
    window.isDemoMode = false;
    localStorage.setItem('isDemoMode', 'false');
    window.location.reload();
  };

  return <ThemeProvider>
        <Router>
          <Layout isDemoMode={isDemoMode} onExitDemo={handleExitDemo}>
            <Routes>
              <Route path="/" element={<Analytics />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/products" element={<Products />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/purchases" element={<Purchases />} />
              <Route path="/customer-orders" element={<CustomerOrders />} />
              <Route path="/test" element={<Test />} />
            </Routes>
          </Layout>
        </Router>
        <Toaster 
          richColors 
          position="top-right" 
          toastOptions={{
            style: {
              marginTop: isDemoMode ? '50px' : '16px',
            },
          }}
        />
    </ThemeProvider>;
}