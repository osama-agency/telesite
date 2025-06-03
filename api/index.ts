import { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient, ObjectId } from 'mongodb';
import axios from 'axios';

// MongoDB connection
let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) {
    try {
      // Test if connection is still alive
      await cachedClient.db('admin').command({ ping: 1 });
      return cachedClient;
    } catch (error) {
      console.log('Cached connection is stale, reconnecting...');
      cachedClient = null;
    }
  }

  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    throw new Error('MongoDB connection string not configured. Please set MONGODB_URI environment variable.');
  }

  console.log('Connecting to MongoDB Atlas...');
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 15000, // Increased timeout for Atlas
    connectTimeoutMS: 15000,
    maxPoolSize: 10,
    minPoolSize: 0,
    maxIdleTimeMS: 30000,
    retryWrites: true,
    retryReads: true
  });
  
  try {
    await client.connect();
    
    // Test the connection
    await client.db('admin').command({ ping: 1 });
    console.log('Successfully connected to MongoDB Atlas');
    
    cachedClient = client;
    return client;
  } catch (error) {
    console.error('MongoDB Atlas connection failed:', error);
    
    // Close the client if connection failed
    try {
      await client.close();
    } catch (closeError) {
      console.error('Error closing failed connection:', closeError);
    }
    
    throw new Error(`Failed to connect to MongoDB Atlas: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// External API configuration
const EXTERNAL_API_URL = process.env.API_URL || 'https://strattera.tgapp.online/api/v1';
const EXTERNAL_API_TOKEN = process.env.API_TOKEN || '8cM9wVBrY3p56k4L1VBpIBwOsw';

// CORS headers
function setCORSHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Helper function to make external API requests
async function makeExternalApiRequest(endpoint: string, method = 'GET', data?: any) {
  try {
    console.log(`Making external API request to: ${EXTERNAL_API_URL}${endpoint}`);
    
    const response = await axios({
      url: `${EXTERNAL_API_URL}${endpoint}`,
      method,
      headers: {
        'Authorization': `Bearer ${EXTERNAL_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'ps-open-analytics/1.0'
      },
      data,
      timeout: 10000, // 10 second timeout
      validateStatus: (status) => status < 500 // Accept 4xx errors to handle them properly
    });
    
    if (response.status >= 400) {
      console.error(`External API error: ${response.status} - ${response.statusText}`, response.data);
      throw new Error(`External API error: ${response.status} - ${response.statusText}`);
    }
    
    console.log(`External API response: ${response.status}, data length: ${JSON.stringify(response.data).length}`);
    return response.data;
  } catch (error) {
    console.error('External API error:', error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('Response error:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('Request error:', error.message);
      }
    }
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCORSHeaders(res);

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method, query } = req;
  const pathWithQuery = req.url?.replace('/api', '') || '';
  const [cleanPath] = pathWithQuery.split('?');
  const path = pathWithQuery; // keep original for startsWith checks with query

  try {
    // Health check
    if (path === '/health') {
      try {
        const client = await connectToDatabase();
        const db = client.db('telesite');
        await db.command({ ping: 1 });
        
        // Test external API connection
        let externalApiStatus = 'disconnected';
        let externalApiError: string | null = null;
        try {
          await makeExternalApiRequest('/health');
          externalApiStatus = 'connected';
        } catch (error) {
          externalApiError = error instanceof Error ? error.message : 'Unknown error';
        }
        
        res.status(200).json({ 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          message: 'API is working on Vercel!',
          database: 'connected',
          externalApi: {
            status: externalApiStatus,
            url: EXTERNAL_API_URL,
            error: externalApiError
          }
        });
      } catch (dbError) {
        // Test external API connection even if DB fails
        let externalApiStatus = 'disconnected';
        let externalApiError: string | null = null;
        try {
          await makeExternalApiRequest('/health');
          externalApiStatus = 'connected';
        } catch (error) {
          externalApiError = error instanceof Error ? error.message : 'Unknown error';
        }
        
        res.status(200).json({ 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          message: 'API is working on Vercel!',
          database: 'disconnected',
          dbError: dbError instanceof Error ? dbError.message : 'Unknown database error',
          externalApi: {
            status: externalApiStatus,
            url: EXTERNAL_API_URL,
            error: externalApiError
          }
        });
      }
      return;
    }

    // Products endpoints
    if (path.startsWith('/products')) {
      try {
        const client = await connectToDatabase();
        const db = client.db('telesite');
        const productsCollection = db.collection('products');

        if (cleanPath === '/products' && method === 'GET') {
          const products = await productsCollection.find({}).toArray();
          res.status(200).json({ data: products });
          return;
        }

        if (cleanPath === '/products/sync' && method === 'POST') {
          try {
            // Sync products from external API
            const externalProducts = await makeExternalApiRequest('/products');
            
            // Clear existing products first
            await productsCollection.deleteMany({});
            console.log('Cleared existing products for fresh sync');
            
            // Process and save products to database
            const processedProducts = externalProducts.map((product: any) => ({
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
              costPriceRUB: product.costPriceRUB || 0,
              createdAt: new Date(),
              updatedAt: new Date()
            }));

            if (processedProducts.length > 0) {
              await productsCollection.insertMany(processedProducts, { ordered: false });
            }

            console.log(`Products sync completed: ${processedProducts.length} products saved`);
            res.status(200).json({ 
              message: 'Products synchronized successfully', 
              count: processedProducts.length,
              source: 'external_api',
              timestamp: new Date().toISOString()
            });
            return;
          } catch (syncError) {
            console.error('Failed to sync from external API:', syncError);
            
            // Fallback: show that sync failed but keep existing data
            const existingProducts = await productsCollection.find({}).toArray();
            
            res.status(200).json({ 
              message: 'Синхронизация не удалась. Внешний API недоступен.', 
              count: existingProducts.length,
              source: 'local_database',
              error: syncError instanceof Error ? syncError.message : 'Unknown sync error',
              timestamp: new Date().toISOString(),
              warning: 'Показываются последние сохраненные данные'
            });
            return;
          }
        }

        if (cleanPath === '/products/force-sync' && method === 'POST') {
          try {
            console.log('Starting force sync from external API...');
            
            // Try to get fresh data from external API
            const externalProducts = await makeExternalApiRequest('/products');
            
            // Clear all existing products
            const deleteResult = await productsCollection.deleteMany({});
            console.log(`Deleted ${deleteResult.deletedCount} existing products`);
            
            // Save fresh products
            if (Array.isArray(externalProducts) && externalProducts.length > 0) {
              const processedProducts = externalProducts.map((product: any) => ({
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
                costPriceRUB: product.costPriceRUB || 0,
                forceSync: true,
                lastSyncDate: new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
              }));

              const insertResult = await productsCollection.insertMany(processedProducts, { ordered: false });
              console.log(`Force sync completed: ${insertResult.insertedCount} products saved`);
              
              res.status(200).json({ 
                message: 'Принудительная синхронизация завершена успешно!', 
                count: insertResult.insertedCount,
                source: 'external_api_force',
                timestamp: new Date().toISOString(),
                deletedCount: deleteResult.deletedCount
              });
            } else {
              res.status(200).json({ 
                message: 'Внешний API вернул пустой список товаров', 
                count: 0,
                source: 'external_api_force',
                timestamp: new Date().toISOString()
              });
            }
            return;
          } catch (forceSyncError) {
            console.error('Force sync failed:', forceSyncError);
            res.status(500).json({ 
              message: 'Принудительная синхронизация не удалась', 
              error: forceSyncError instanceof Error ? forceSyncError.message : 'Unknown error',
              timestamp: new Date().toISOString()
            });
            return;
          }
        }
      } catch (dbError) {
        console.error('Database error in products endpoint:', dbError);
        
        // Return mock products if database unavailable
        if (cleanPath === '/products' && method === 'GET') {
          const mockProducts = [
            {
              id: 1,
              name: 'Демо-товар A',
              costPriceTRY: 10,
              costPriceRUB: 30,
              quantity: 100,
              logisticsCost: 0,
              markup: 0,
              marginality: 0,
              netProfit: 0,
              reorderPoint: 10,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: 2,
              name: 'Демо-товар B',
              costPriceTRY: 15,
              costPriceRUB: 45,
              quantity: 50,
              logisticsCost: 0,
              markup: 0,
              marginality: 0,
              netProfit: 0,
              reorderPoint: 10,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: 3,
              name: 'Демо-товар C',
              costPriceTRY: 20,
              costPriceRUB: 60,
              quantity: 75,
              logisticsCost: 0,
              markup: 0,
              marginality: 0,
              netProfit: 0,
              reorderPoint: 10,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ];
          res.status(200).json({ 
            data: mockProducts, 
            total: mockProducts.length, 
            demo: true,
            dbError: dbError instanceof Error ? dbError.message : 'Database connection failed'
          });
          return;
        }
        
        res.status(500).json({ 
          message: 'Database connection failed', 
          error: dbError instanceof Error ? dbError.message : 'Unknown database error'
        });
        return;
      }
    }

    // Orders endpoints
    if (path.startsWith('/orders')) {
      if (path === '/orders' && method === 'GET') {
        // Get orders from external API
        const orders = await makeExternalApiRequest('/orders');
        res.status(200).json({ data: orders });
        return;
      }
    }

    // Customer orders endpoints
    if (path.startsWith('/customer-orders')) {
      // Handle resync endpoint
      if (cleanPath === '/customer-orders/resync' && method === 'POST') {
        try {
          const client = await connectToDatabase();
          const db = client.db('telesite');
          const ordersCollection = db.collection('customerOrders');

          // Try to sync from external API
          try {
            const externalOrders = await makeExternalApiRequest('/customer-orders');
            
            if (externalOrders && Array.isArray(externalOrders)) {
              // Process and save orders to database
              const processedOrders = externalOrders.map((order: any) => ({
                _id: order.id,
                customerName: order.customerName || 'Unknown Customer',
                productName: order.productName || 'Unknown Product',
                quantity: order.quantity || 1,
                price: order.price || 0,
                totalAmount: order.totalAmount || (order.quantity * order.price),
                paymentDate: order.paymentDate || new Date().toISOString(),
                status: order.status || 'completed',
                createdAt: new Date(),
                updatedAt: new Date()
              }));

              // Clear existing and insert new
              await ordersCollection.deleteMany({});
              const result = await ordersCollection.insertMany(processedOrders, { ordered: false });
              
              res.status(200).json({ 
                message: 'Customer orders resynced successfully', 
                count: result.insertedCount,
                data: processedOrders
              });
            } else {
              res.status(200).json({ 
                message: 'No orders found in external API', 
                count: 0,
                data: []
              });
            }
          } catch (apiError) {
            console.error('External API sync failed:', apiError);
            
            // Generate demo data for testing
            const demoOrders = Array.from({ length: 10 }, (_, i) => ({
              id: `demo_order_${i + 1}`,
              customerName: [
                'Иванов Иван Иванович',
                'Петрова Анна Сергеевна', 
                'Сидоров Михаил Петрович',
                'Козлова Елена Александровна',
                'Морозов Дмитрий Владимирович',
                'Соколова Мария Николаевна',
                'Новиков Алексей Андреевич',
                'Федорова Ольга Игоревна',
                'Киселев Павел Романович',
                'Зайцева Наталья Викторовна'
              ][i],
              productName: [
                'Atominex 25 mg',
                'Strattera 40 mg',
                'Concerta 27 mg',
                'Ritalin 10 mg',
                'Elvanse 30 mg',
                'Medikinet 20 mg',
                'Rubifen 5 mg',
                'Abilify 15 mg',
                'Risperdal 1 mg',
                'Attex 100 mg'
              ][i],
              quantity: Math.floor(Math.random() * 3) + 1,
              price: [2500, 3000, 2800, 2200, 3500, 2700, 2000, 2100, 1800, 3200][i],
              totalAmount: 0, // Will be calculated below
              paymentDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
              status: ['pending', 'processing', 'shipped', 'delivered'][Math.floor(Math.random() * 4)],
              customerId: `customer_${i + 1}`,
              address: [
                'Москва, ул. Тверская, д. 12',
                'Санкт-Петербург, Невский пр., д. 25',
                'Екатеринбург, ул. Ленина, д. 8',
                'Новосибирск, ул. Красный пр., д. 15',
                'Казань, ул. Баумана, д. 30',
                'Нижний Новгород, ул. Большая Покровская, д. 18',
                'Челябинск, ул. Кирова, д. 7',
                'Омск, ул. Ленина, д. 22',
                'Самара, ул. Молодогвардейская, д. 33',
                'Ростов-на-Дону, ул. Большая Садовая, д. 105'
              ][i],
              deliveryCost: 500,
              createdAt: new Date(),
              updatedAt: new Date()
            }));

            // Calculate totalAmount
            demoOrders.forEach(order => {
              order.totalAmount = order.quantity * order.price + order.deliveryCost;
            });

            // Insert demo data
            await ordersCollection.deleteMany({});
            const result = await ordersCollection.insertMany(demoOrders, { ordered: false });
            
            res.status(200).json({ 
              message: 'Демо-данные успешно загружены (внешний API недоступен)', 
              count: result.insertedCount,
              data: demoOrders,
              demo: true,
              warning: 'Используются демо-данные. Внешний API недоступен.'
            });
          }
          return;
        } catch (dbError) {
          console.error('Database error in resync:', dbError);
          res.status(500).json({ 
            message: 'Failed to resync customer orders', 
            error: dbError instanceof Error ? dbError.message : 'Database connection failed'
          });
          return;
        }
      }

      // Handle clear all endpoint
      if (cleanPath === '/customer-orders/clear-all' && method === 'POST') {
        try {
          const client = await connectToDatabase();
          const db = client.db('telesite');
          const ordersCollection = db.collection('customerOrders');

          const result = await ordersCollection.deleteMany({});
          res.status(200).json({ 
            message: 'All customer orders cleared successfully', 
            deletedCount: result.deletedCount
          });
          return;
        } catch (dbError) {
          console.error('Database error in clear-all:', dbError);
          res.status(500).json({ 
            message: 'Failed to clear customer orders', 
            error: dbError instanceof Error ? dbError.message : 'Database connection failed'
          });
          return;
        }
      }

      // Handle customers endpoint  
      if (cleanPath === '/customer-orders/customers' && method === 'GET') {
        try {
          const client = await connectToDatabase();
          const db = client.db('telesite');
          const ordersCollection = db.collection('customerOrders');

          const customers = await ordersCollection.distinct('customerName');
          res.status(200).json({ data: customers });
          return;
        } catch (dbError) {
          console.error('Database error in customers endpoint:', dbError);
          res.status(200).json({ 
            data: ['Demo Customer 1', 'Demo Customer 2'],
            demo: true,
            dbError: dbError instanceof Error ? dbError.message : 'Database connection failed'
          });
          return;
        }
      }

      // Handle specific order operations
      if (cleanPath.startsWith('/customer-orders/') && cleanPath !== '/customer-orders/resync' && cleanPath !== '/customer-orders/clear-all' && cleanPath !== '/customer-orders/customers') {
        const orderId = cleanPath.split('/')[2];
        
        try {
          const client = await connectToDatabase();
          const db = client.db('telesite');
          const ordersCollection = db.collection('customerOrders');

          if (method === 'PUT') {
            // Try to use ObjectId if valid, otherwise use string
            let query: any;
            if (ObjectId.isValid(orderId)) {
              query = { _id: new ObjectId(orderId) };
            } else {
              query = { _id: orderId };
            }
            
            const result = await ordersCollection.updateOne(
              query,
              { $set: { ...req.body, updatedAt: new Date() } }
            );
            
            if (result.matchedCount === 0) {
              res.status(404).json({ message: 'Order not found' });
              return;
            }
            
            const updatedOrder = await ordersCollection.findOne(query);
            res.status(200).json(updatedOrder);
            return;
          }

          if (method === 'DELETE') {
            // Try to use ObjectId if valid, otherwise use string
            let query: any;
            if (ObjectId.isValid(orderId)) {
              query = { _id: new ObjectId(orderId) };
            } else {
              query = { _id: orderId };
            }
            
            const result = await ordersCollection.deleteOne(query);
            
            if (result.deletedCount === 0) {
              res.status(404).json({ message: 'Order not found' });
              return;
            }
            
            res.status(200).json({ message: 'Order deleted successfully' });
            return;
          }
        } catch (dbError) {
          console.error('Database error in order operations:', dbError);
          res.status(500).json({ 
            message: 'Database operation failed', 
            error: dbError instanceof Error ? dbError.message : 'Unknown database error'
          });
          return;
        }
      }

      if (cleanPath === '/customer-orders' && method === 'GET') {
        try {
          const client = await connectToDatabase();
          const db = client.db('telesite');
          const ordersCollection = db.collection('customerOrders');

          const { page = 1, limit = 20, from, to, search, statusFilter } = query;
          
          const filter: any = {};
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
          if (statusFilter && Array.isArray(statusFilter)) {
            filter.status = { $in: statusFilter };
          }

          const orders = await ordersCollection
            .find(filter)
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit))
            .toArray();

          const total = await ordersCollection.countDocuments(filter);

          res.status(200).json({
            orders: orders,
            data: orders,
            total,
            metadata: {
              total,
              page: Number(page),
              limit: Number(limit)
            }
          });
          return;
        } catch (dbError) {
          console.error('Database error in customer-orders endpoint:', dbError);
          res.status(200).json({
            orders: [],
            data: [],
            total: 0,
            metadata: {
              total: 0,
              page: Number(query.page || 1),
              limit: Number(query.limit || 20)
            },
            demo: true,
            dbError: dbError instanceof Error ? dbError.message : 'Database connection failed'
          });
          return;
        }
      }

      // Handle create order
      if (cleanPath === '/customer-orders' && method === 'POST') {
        try {
          const client = await connectToDatabase();
          const db = client.db('telesite');
          const ordersCollection = db.collection('customerOrders');

          const orderData = {
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          const result = await ordersCollection.insertOne(orderData);
          res.status(201).json({ 
            _id: result.insertedId,
            ...orderData 
          });
          return;
        } catch (dbError) {
          console.error('Database error in create order:', dbError);
          res.status(500).json({ 
            message: 'Failed to create order', 
            error: dbError instanceof Error ? dbError.message : 'Database connection failed'
          });
          return;
        }
      }
    }

    // Purchases endpoints
    if (path.startsWith('/purchases')) {
      try {
        const client = await connectToDatabase();
        const db = client.db('telesite');
        const purchasesCollection = db.collection('purchases');

        if (cleanPath === '/purchases' && method === 'GET') {
          const { page = 1, limit = 50, supplier, from, to } = query;
          
          const filter: any = {};
          if (supplier) filter.supplier = supplier;
          if (from || to) {
            filter.purchaseDate = {};
            if (from) filter.purchaseDate.$gte = from;
            if (to) filter.purchaseDate.$lte = to;
          }

          const purchases = await purchasesCollection
            .find(filter)
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit))
            .toArray();

          const total = await purchasesCollection.countDocuments(filter);

          res.status(200).json({
            data: purchases,
            pagination: {
              total,
              page: Number(page),
              limit: Number(limit)
            }
          });
          return;
        }

        if (cleanPath === '/purchases' && method === 'POST') {
          const purchaseData = {
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          const result = await purchasesCollection.insertOne(purchaseData);
          res.status(201).json({ 
            _id: result.insertedId,
            ...purchaseData 
          });
          return;
        }
      } catch (dbError) {
        console.error('Database error in purchases endpoint:', dbError);
        
        if (cleanPath === '/purchases' && method === 'GET') {
          res.status(200).json({
            data: [],
            pagination: {
              total: 0,
              page: Number(query.page || 1),
              limit: Number(query.limit || 50)
            },
            demo: true,
            dbError: dbError instanceof Error ? dbError.message : 'Database connection failed'
          });
          return;
        }
        
        if (cleanPath === '/purchases' && method === 'POST') {
          res.status(500).json({ 
            message: 'Database connection failed', 
            error: dbError instanceof Error ? dbError.message : 'Unknown database error'
          });
          return;
        }
      }
    }

    // Analytics endpoints
    if (path.startsWith('/analytics')) {
      try {
        const client = await connectToDatabase();
        const db = client.db('telesite');

        if (cleanPath === '/analytics/dashboard/summary') {
          const ordersCollection = db.collection('customerOrders');
          const purchasesCollection = db.collection('purchases');
          const expensesCollection = db.collection('expenses');

          const totalOrders = await ordersCollection.countDocuments();
          const totalRevenue = await ordersCollection.aggregate([
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
          ]).toArray();

          const totalExpenses = await expensesCollection.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ]).toArray();

          res.status(200).json({
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            totalExpenses: totalExpenses[0]?.total || 0
          });
          return;
        }

        if (cleanPath === '/analytics/profit' && method === 'GET') {
          const { from, to } = query;
          res.status(200).json({
            data: [
              { date: from, profit: 0 },
              { date: to, profit: 0 }
            ]
          });
          return;
        }

        if (cleanPath === '/analytics/purchases' && method === 'GET') {
          const { from, to } = query;
          const purchasesCollection = db.collection('purchases');
          
          const filter: any = {};
          if (from || to) {
            filter.date = {};
            if (from) filter.date.$gte = from;
            if (to) filter.date.$lte = to;
          }

          const purchases = await purchasesCollection.find(filter).toArray();
          
          res.status(200).json({
            data: purchases
          });
          return;
        }
      } catch (dbError) {
        console.error('Database error in analytics endpoint:', dbError);
        
        if (cleanPath === '/analytics/dashboard/summary') {
          res.status(200).json({
            totalOrders: 0,
            totalRevenue: 0,
            totalExpenses: 0,
            demo: true,
            dbError: dbError instanceof Error ? dbError.message : 'Database connection failed'
          });
          return;
        }
        if (cleanPath === '/analytics/profit' && method === 'GET') {
          const { from, to } = query;
          res.status(200).json({
            data: [
              { date: from, profit: 0 },
              { date: to, profit: 0 }
            ],
            demo: true,
            dbError: dbError instanceof Error ? dbError.message : 'Database connection failed'
          });
          return;
        }
        if (cleanPath === '/analytics/purchases' && method === 'GET') {
          res.status(200).json({
            data: [],
            demo: true,
            dbError: dbError instanceof Error ? dbError.message : 'Database connection failed'
          });
          return;
        }
      }
    }

    // Expenses endpoints
    if (path.startsWith('/expenses')) {
      try {
        const client = await connectToDatabase();
        const db = client.db('telesite');
        const expensesCollection = db.collection('expenses');

        if (cleanPath === '/expenses' && method === 'GET') {
          const { page = 1, limit = 10 } = query;
          
          const expenses = await expensesCollection
            .find({})
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit))
            .toArray();
            
          const total = await expensesCollection.countDocuments({});
          
          res.status(200).json({ 
            data: expenses,
            pagination: {
              total,
              page: Number(page),
              limit: Number(limit)
            }
          });
          return;
        }

        if (cleanPath === '/expenses' && method === 'POST') {
          const expenseData = {
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          const result = await expensesCollection.insertOne(expenseData);
          res.status(201).json({ 
            _id: result.insertedId,
            ...expenseData 
          });
          return;
        }
      } catch (dbError) {
        console.error('Database error in expenses endpoint:', dbError);
        
        if (cleanPath === '/expenses' && method === 'GET') {
          res.status(200).json({ 
            data: [],
            pagination: {
              total: 0,
              page: Number(query.page || 1),
              limit: Number(query.limit || 10)
            },
            demo: true,
            dbError: dbError instanceof Error ? dbError.message : 'Database connection failed'
          });
          return;
        }
        
        if (cleanPath === '/expenses' && method === 'POST') {
          res.status(500).json({ 
            message: 'Database connection failed', 
            error: dbError instanceof Error ? dbError.message : 'Unknown database error'
          });
          return;
        }
      }
    }

    // Data status endpoint
    if (path === '/data-status') {
      try {
        const client = await connectToDatabase();
        const db = client.db('telesite');
        
        // Check products status
        const productsCollection = db.collection('products');
        const productsCount = await productsCollection.countDocuments();
        const lastProduct = await productsCollection.findOne({}, { sort: { updatedAt: -1 } });
        
        // Check customer orders status  
        const ordersCollection = db.collection('customerOrders');
        const ordersCount = await ordersCollection.countDocuments();
        const lastOrder = await ordersCollection.findOne({}, { sort: { updatedAt: -1 } });
        
        // Test external API connection
        let externalApiStatus = 'disconnected';
        let externalApiError: string | null = null;
        try {
          await makeExternalApiRequest('/health');
          externalApiStatus = 'connected';
        } catch (error) {
          externalApiError = error instanceof Error ? error.message : 'Unknown error';
        }
        
        res.status(200).json({
          timestamp: new Date().toISOString(),
          database: 'connected',
          externalApi: {
            status: externalApiStatus,
            url: EXTERNAL_API_URL,
            error: externalApiError
          },
          data: {
            products: {
              count: productsCount,
              lastUpdated: lastProduct?.updatedAt || null,
              hasForceSync: lastProduct?.forceSync || false
            },
            orders: {
              count: ordersCount,
              lastUpdated: lastOrder?.updatedAt || null
            }
          },
          recommendations: externalApiStatus === 'disconnected' 
            ? ['Внешний API недоступен - данные могут быть устаревшими', 'Проверьте токен авторизации', 'Попробуйте принудительную синхронизацию через /products/force-sync']
            : ['Внешний API доступен - данные должны быть актуальными']
        });
      } catch (error) {
        res.status(500).json({
          timestamp: new Date().toISOString(),
          database: 'disconnected',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      return;
    }

    // Default response for unknown endpoints
    res.status(404).json({ 
      message: 'API endpoint not found',
      path,
      method,
      availableEndpoints: [
        'GET /api/health',
        'GET /api/products',
        'POST /api/products/sync',
        'GET /api/orders',
        'GET /api/customer-orders',
        'POST /api/customer-orders',
        'POST /api/customer-orders/resync',
        'POST /api/customer-orders/clear-all',
        'GET /api/customer-orders/customers',
        'PUT /api/customer-orders/{id}',
        'DELETE /api/customer-orders/{id}',
        'GET /api/purchases',
        'POST /api/purchases',
        'GET /api/expenses',
        'POST /api/expenses',
        'GET /api/analytics/dashboard/summary',
        'GET /api/analytics/profit',
        'GET /api/analytics/purchases'
      ]
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 