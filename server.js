import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// External API configuration
const EXTERNAL_API_URL = process.env.API_URL || 'https://strattera.tgapp.online/api/v1';
const EXTERNAL_API_TOKEN = process.env.API_TOKEN || '8cM9wVBrY3p56k4L1VBpIBwOsw';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    try {
      await cachedClient.db('admin').command({ ping: 1 });
      return cachedClient;
    } catch (error) {
      console.log('Cached connection is stale, reconnecting...');
      cachedClient = null;
    }
  }

  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('⚠️ MONGODB_URI not set. API will work in demo mode.');
    throw new Error('MongoDB connection string not configured.');
  }

  console.log('🔗 Connecting to MongoDB...');
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    maxPoolSize: 10,
    minPoolSize: 0,
    maxIdleTimeMS: 30000,
    retryWrites: true,
    retryReads: true
  });
  
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('✅ Successfully connected to MongoDB');
    
    cachedClient = client;
    return client;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    try {
      await client.close();
    } catch (closeError) {
      console.error('Error closing failed connection:', closeError);
    }
    throw new Error(`Failed to connect to MongoDB: ${error.message}`);
  }
}

// Function to make requests to external API
async function makeExternalApiRequest(endpoint) {
  try {
    console.log(`🌐 Making request to: ${EXTERNAL_API_URL}${endpoint}`);
    const response = await fetch(`${EXTERNAL_API_URL}${endpoint}`, {
      headers: {
        'Authorization': EXTERNAL_API_TOKEN,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`📡 Received ${Array.isArray(data) ? data.length : 'non-array'} items from external API`);
    return data;
  } catch (error) {
    console.error(`❌ External API request failed for ${endpoint}:`, error.message);
    throw error;
  }
}

// Utility function to generate demo data
function generateDemoData(type) {
  const demoData = {
    products: [
      {
        _id: '1',
        id: 1,
        name: 'Товар Demo A',
        costPriceTRY: 10,
        costPriceRUB: 320,
        stock_quantity: 100,
        price: '320',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        _id: '2',
        id: 2,
        name: 'Товар Demo B', 
        costPriceTRY: 15,
        costPriceRUB: 480,
        stock_quantity: 50,
        price: '480',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    customerOrders: [
      {
        _id: '1',
        id: '1',
        paymentDate: '2024-01-15',
        customerId: '1',
        customerName: 'Иван Петров',
        address: 'Москва, ул. Тверская, д. 1',
        deliveryCost: 500,
        productName: 'Товар Demo A',
        quantity: 2,
        price: 640,
        status: 'delivered'
      },
      {
        _id: '2',
        id: '2',
        paymentDate: '2024-01-16',
        customerId: '2',
        customerName: 'Анна Сидорова',
        address: 'СПб, Невский пр., д. 50',
        deliveryCost: 600,
        productName: 'Товар Demo B',
        quantity: 1,
        price: 480,
        status: 'shipped'
      }
    ],
    expenses: [
      {
        _id: '1',
        id: '1',
        date: '2024-01-10',
        type: 'Логистика',
        description: 'Доставка товаров',
        amountRUB: 5000,
        createdAt: new Date().toISOString()
      },
      {
        _id: '2',
        id: '2',
        date: '2024-01-12',
        type: 'Реклама',
        description: 'Yandex Direct',
        amountRUB: 15000,
        createdAt: new Date().toISOString()
      }
    ]
  };
  
  return demoData[type] || [];
}

// API Routes

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const client = await connectToDatabase();
    const db = client.db('telesite');
    await db.command({ ping: 1 });
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'API is working with MongoDB!',
      database: 'connected',
      externalApi: EXTERNAL_API_URL
    });
  } catch (dbError) {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'API is working in demo mode!',
      database: 'disconnected',
      dbError: dbError.message,
      externalApi: EXTERNAL_API_URL
    });
  }
});

// Products endpoints
app.get('/api/products', async (req, res) => {
  try {
    const client = await connectToDatabase();
    const db = client.db('telesite');
    const productsCollection = db.collection('products');
    const products = await productsCollection.find({}).toArray();
    
    console.log(`📦 Products fetched from MongoDB: ${products.length} items`);
    res.json({ data: products, total: products.length });
  } catch (error) {
    console.warn('⚠️ MongoDB unavailable, using demo data for products');
    const demoProducts = generateDemoData('products');
    res.json({ 
      data: demoProducts, 
      total: demoProducts.length, 
      demo: true,
      dbError: error.message
    });
  }
});

// Products sync endpoint - NEW!
app.post('/api/products/sync', async (req, res) => {
  try {
    console.log('🔄 Starting products synchronization...');
    
    // Fetch products from external API
    const externalProducts = await makeExternalApiRequest('/products');
    
    if (!Array.isArray(externalProducts)) {
      throw new Error('External API returned non-array data');
    }

    const client = await connectToDatabase();
    const db = client.db('telesite');
    const productsCollection = db.collection('products');

    // Clear existing products
    await productsCollection.deleteMany({});
    console.log('🧹 Cleared existing products');

    // Process and save products
    const processedProducts = externalProducts.map((product) => ({
      _id: product.id,
      id: product.id,
      name: product.name || 'Unknown Product',
      description: product.description || '',
      price: product.price || '0',
      stock_quantity: product.stock_quantity || 0,
      created_at: product.created_at || new Date().toISOString(),
      updated_at: product.updated_at || new Date().toISOString(),
      ancestry: product.ancestry || '',
      weight: product.weight || '',
      dosage_form: product.dosage_form || '',
      package_quantity: product.package_quantity || 0,
      main_ingredient: product.main_ingredient || '',
      brand: product.brand || '',
      old_price: product.old_price || '',
      costPriceTRY: product.costPriceTRY || 0,
      costPriceRUB: product.costPriceRUB || 0
    }));

    if (processedProducts.length > 0) {
      await productsCollection.insertMany(processedProducts, { ordered: false });
    }

    console.log(`✅ Products sync completed: ${processedProducts.length} products saved`);
    res.json({ 
      message: 'Products synchronized successfully', 
      count: processedProducts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Products sync failed:', error.message);
    res.status(500).json({ 
      message: 'Failed to synchronize products',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Customer orders endpoints
app.get('/api/customer-orders', async (req, res) => {
  try {
    const client = await connectToDatabase();
    const db = client.db('telesite');
    const ordersCollection = db.collection('customerOrders');

    const { page = 1, limit = 20, from, to, search, statusFilter } = req.query;
    
    // Build MongoDB filter
    const filter = {};
    if (from || to) {
      filter.paymentDate = {};
      if (from) filter.paymentDate.$gte = from;
      if (to) filter.paymentDate.$lte = to;
    }
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { productName: { $regex: search, $options: 'i' } }
      ];
    }
    if (statusFilter) {
      const statuses = typeof statusFilter === 'string' ? statusFilter.split(',') : statusFilter;
      filter.status = { $in: statuses };
    }

    const orders = await ordersCollection
      .find(filter)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .toArray();

    const total = await ordersCollection.countDocuments(filter);

    console.log(`📋 Customer orders fetched from MongoDB: ${orders.length}/${total} items`);

    res.json({
      orders: orders,
      data: orders,
      total,
      metadata: {
        total,
        page: Number(page),
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.warn('⚠️ MongoDB unavailable, using demo data for customer orders');
    const demoOrders = generateDemoData('customerOrders');
    res.json({
      orders: demoOrders,
      data: demoOrders,
      total: demoOrders.length,
      metadata: {
        total: demoOrders.length,
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 20)
      },
      demo: true,
      dbError: error.message
    });
  }
});

// Customer orders sync endpoint - NEW!
app.post('/api/customer-orders/resync', async (req, res) => {
  try {
    console.log('🔄 Starting customer orders synchronization...');
    
    // Fetch orders from external API
    const externalOrders = await makeExternalApiRequest('/orders');
    
    if (!Array.isArray(externalOrders)) {
      throw new Error('External API returned non-array data');
    }

    const client = await connectToDatabase();
    const db = client.db('telesite');
    const ordersCollection = db.collection('customerOrders');

    // Clear existing orders
    await ordersCollection.deleteMany({});
    console.log('🧹 Cleared existing customer orders');

    // Process and transform orders into customer orders format
    const customerOrders = [];
    
    externalOrders.forEach((order) => {
      // Skip orders without order_items
      if (!order.order_items || !Array.isArray(order.order_items) || order.order_items.length === 0) {
        return;
      }

      // Create a customer order for each item in the order
      order.order_items.forEach((item, index) => {
        customerOrders.push({
          _id: `${order.id}_${index}`,
          id: `${order.id}_${index}`,
          orderId: order.id,
          paymentDate: order.paid_at || order.created_at || new Date().toISOString(),
          customerId: order.user?.id || order.id,
          customerName: order.user?.full_name || 'Unknown Customer',
          address: order.user?.city || 'Unknown City',
          deliveryCost: order.delivery_cost || 0,
          productName: item.name || `Product ${item.product_id || 'Unknown'}`,
          quantity: item.quantity || 1,
          price: parseFloat(item.price) || 0,
          status: order.status || 'unknown',
          totalAmount: parseFloat(order.total_amount) || 0,
          bonus: order.bonus || 0,
          createdAt: order.created_at || new Date().toISOString(),
          updatedAt: order.updated_at || new Date().toISOString()
        });
      });
    });

    if (customerOrders.length > 0) {
      await ordersCollection.insertMany(customerOrders, { ordered: false });
    }

    console.log(`✅ Customer orders sync completed: ${customerOrders.length} orders saved`);
    res.json({ 
      message: 'Customer orders synchronized successfully', 
      total: customerOrders.length,
      originalOrders: externalOrders.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Customer orders sync failed:', error.message);
    res.status(500).json({ 
      message: 'Failed to synchronize customer orders',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Orders sync endpoint (legacy support)
app.post('/api/orders/sync', async (req, res) => {
  // Redirect to customer orders sync
  try {
    const response = await fetch(`http://localhost:${PORT}/api/customer-orders/resync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to sync orders',
      error: error.message
    });
  }
});

// Expenses endpoints
app.get('/api/expenses', async (req, res) => {
  try {
    const client = await connectToDatabase();
    const db = client.db('telesite');
    const expensesCollection = db.collection('expenses');
    
    const { page = 1, limit = 10 } = req.query;
    
    const expenses = await expensesCollection
      .find({})
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .toArray();
      
    const total = await expensesCollection.countDocuments({});

    console.log(`💰 Expenses fetched from MongoDB: ${expenses.length}/${total} items`);

    res.json({
      data: expenses,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.warn('⚠️ MongoDB unavailable, using demo data for expenses');
    const demoExpenses = generateDemoData('expenses');
    res.json({
      data: demoExpenses,
      pagination: {
        total: demoExpenses.length,
        page: Number(req.query.page || 1),
        limit: Number(req.query.limit || 10)
      },
      demo: true,
      dbError: error.message
    });
  }
});

// Analytics endpoints
app.get('/api/analytics/profit', async (req, res) => {
  const { from, to } = req.query;
  console.log(`📊 Analytics profit request: ${from} to ${to}`);
  
  // Mock analytics data
  res.json({
    data: [
      { date: from || '2024-01-01', profit: 25000 },
      { date: to || '2024-01-31', profit: 48000 }
    ]
  });
});

app.get('/api/analytics/purchases', async (req, res) => {
  const { from, to } = req.query;
  console.log(`📊 Analytics purchases request: ${from} to ${to}`);
  
  res.json({ 
    data: [
      { date: from || '2024-01-01', amount: 15000 },
      { date: to || '2024-01-31', amount: 32000 }
    ]
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('💥 Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Express API Server running on port ${PORT}`);
  console.log(`🔧 API Health: http://localhost:${PORT}/api/health`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🌐 External API: ${EXTERNAL_API_URL}`);
  console.log(`🔑 API Token: ${EXTERNAL_API_TOKEN ? '✅ Set' : '❌ Missing'}`);
  
  // Test MongoDB connection on startup
  connectToDatabase()
    .then(() => {
      console.log('✅ MongoDB connection test successful');
    })
    .catch((error) => {
      console.log('⚠️ MongoDB connection test failed - running in demo mode');
      console.log('💡 Set MONGODB_URI environment variable to connect to your database');
    });
}); 