import React from 'react';
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

export function App() {
  return <ThemeProvider>
        <Router>
          <Layout>
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
      <Toaster richColors position="top-right" />
    </ThemeProvider>;
}