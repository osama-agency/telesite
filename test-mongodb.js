import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

config();

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI environment variable is not set');
    console.log('Please create a .env file with your MongoDB Atlas connection string:');
    console.log('MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/telesite?retryWrites=true&w=majority');
    process.exit(1);
  }

  console.log('🔄 Testing MongoDB Atlas connection...');
  console.log(`📡 URI: ${uri.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@')}`);

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
    // Connect to MongoDB
    await client.connect();
    console.log('✅ Successfully connected to MongoDB Atlas');

    // Test ping
    await client.db('admin').command({ ping: 1 });
    console.log('✅ Ping successful');

    // Test database access
    const db = client.db('telesite');
    const collections = await db.listCollections().toArray();
    console.log(`✅ Database 'telesite' accessible`);
    console.log(`📊 Found ${collections.length} collections:`, collections.map(c => c.name));

    // Test insert (optional)
    const testCollection = db.collection('connection_test');
    const testDoc = { 
      timestamp: new Date(), 
      message: 'Connection test successful',
      source: 'test-mongodb.js'
    };
    
    const result = await testCollection.insertOne(testDoc);
    console.log('✅ Test document inserted:', { id: result.insertedId });

    // Clean up test document
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('✅ Test document cleaned up');

    console.log('🎉 All tests passed! MongoDB Atlas is properly configured.');

  } catch (error) {
    console.error('❌ MongoDB Atlas connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('authentication')) {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check your username and password in the connection string');
      console.log('2. Verify user has read/write permissions to the database');
    } else if (error.message.includes('network') || error.message.includes('timeout')) {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check your internet connection');
      console.log('2. Add your IP address to MongoDB Atlas Network Access list');
      console.log('3. Try adding 0.0.0.0/0 to allow all IPs (for testing only)');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Possible solutions:');
      console.log('1. Check the cluster URL in your connection string');
      console.log('2. Verify your cluster is running');
    }
    
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
}

testConnection(); 