const axios = require('axios');

const API_BASE = 'https://ps-open.com/api';

async function testAPI() {
  console.log('🔧 Testing API endpoints...\n');

  const tests = [
    { method: 'GET', endpoint: '/health', description: 'Health Check' },
    { method: 'GET', endpoint: '/products', description: 'Get Products' },
    { method: 'GET', endpoint: '/customer-orders', description: 'Get Customer Orders' },
    { method: 'POST', endpoint: '/customer-orders/resync', description: 'Resync Customer Orders' },
    { method: 'GET', endpoint: '/customer-orders/customers', description: 'Get Customers' },
    { method: 'GET', endpoint: '/purchases', description: 'Get Purchases' },
    { method: 'GET', endpoint: '/expenses', description: 'Get Expenses' },
    { method: 'GET', endpoint: '/analytics/dashboard/summary', description: 'Analytics Summary' },
    { method: 'GET', endpoint: '/analytics/purchases', description: 'Analytics Purchases' },
    { method: 'GET', endpoint: '/analytics/profit', description: 'Analytics Profit' },
  ];

  for (const test of tests) {
    try {
      console.log(`📡 Testing ${test.method} ${test.endpoint} - ${test.description}`);
      
      const config = {
        method: test.method,
        url: `${API_BASE}${test.endpoint}`,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (test.method === 'POST') {
        config.data = {};
      }

      const response = await axios(config);
      console.log(`✅ Status: ${response.status} - ${response.statusText}`);
      console.log(`📊 Response: ${JSON.stringify(response.data, null, 2).substring(0, 200)}...\n`);
      
    } catch (error) {
      console.log(`❌ Error: ${error.response?.status || 'Network Error'} - ${error.response?.statusText || error.message}`);
      if (error.response?.data) {
        console.log(`📊 Error Response: ${JSON.stringify(error.response.data, null, 2).substring(0, 200)}...\n`);
      }
    }
  }
}

testAPI().then(() => {
  console.log('🎯 API testing completed!');
}).catch(console.error); 