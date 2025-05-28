import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Products } from './pages/Products';
import { Expenses } from './pages/Expenses';
import { Orders } from './pages/Orders';
import { CustomerOrders } from './pages/CustomerOrders';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from 'sonner';
export function App() {
  return <ThemeProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Products />} />
              <Route path="/products" element={<Products />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/customer-orders" element={<CustomerOrders />} />
            </Routes>
          </Layout>
        </Router>
      <Toaster richColors position="top-right" />
    </ThemeProvider>;
}