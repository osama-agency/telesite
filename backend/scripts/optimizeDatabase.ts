import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { CustomerOrder } from '../src/models/CustomerOrder';

dotenv.config();

// Схема для архивных заказов
const CustomerOrderArchiveSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  paymentDate: { type: String, required: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  address: { type: String, required: true },
  deliveryCost: { type: Number, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { type: String, required: true },
  archivedAt: { type: Date, default: Date.now }
});

const CustomerOrderArchive = mongoose.model('CustomerOrderArchive', CustomerOrderArchiveSchema);

async function optimizeDatabase() {
  try {
    // Подключаемся к MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/telesite-analytics');
    console.log('✅ Подключение к MongoDB установлено');

    // 1. Создаем правильные индексы для основной коллекции
    console.log('\n📋 Создание индексов для customerorders...');
    
    // Удаляем старые индексы (кроме _id)
    const indexes = await CustomerOrder.collection.getIndexes();
    for (const indexName in indexes) {
      if (indexName !== '_id_') {
        await CustomerOrder.collection.dropIndex(indexName);
      }
    }
    
    // Создаем новые оптимизированные индексы
    await CustomerOrder.collection.createIndex({ paymentDate: -1 }, { background: true });
    console.log('✅ Индекс по paymentDate создан');
    
    await CustomerOrder.collection.createIndex({ status: 1, paymentDate: -1 }, { background: true });
    console.log('✅ Составной индекс status + paymentDate создан');
    
    await CustomerOrder.collection.createIndex({ customerId: 1 }, { background: true });
    console.log('✅ Индекс по customerId создан');
    
    await CustomerOrder.collection.createIndex({ id: 1 }, { unique: true, background: true });
    console.log('✅ Уникальный индекс по id создан');
    
    // Текстовый индекс для поиска
    await CustomerOrder.collection.createIndex(
      { customerName: "text", address: "text", productName: "text" },
      { background: true }
    );
    console.log('✅ Текстовый индекс для поиска создан');

    // 2. Создаем индексы для архивной коллекции
    console.log('\n📋 Создание индексов для архива...');
    
    await CustomerOrderArchive.collection.createIndex({ paymentDate: -1 }, { background: true });
    await CustomerOrderArchive.collection.createIndex({ id: 1 }, { unique: true, background: true });
    await CustomerOrderArchive.collection.createIndex({ archivedAt: 1 }, { background: true });
    console.log('✅ Индексы для архива созданы');

    // 3. Архивируем старые заказы (старше 6 месяцев)
    console.log('\n📦 Архивация старых заказов...');
    
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const sixMonthsAgoStr = sixMonthsAgo.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).split('.').reverse().join('.');

    // Находим старые заказы
    const oldOrders = await CustomerOrder.find({
      paymentDate: { $lt: sixMonthsAgoStr }
    });

    if (oldOrders.length > 0) {
      // Добавляем поле archivedAt и сохраняем в архив
      const ordersToArchive = oldOrders.map(order => ({
        ...order.toObject(),
        archivedAt: new Date()
      }));

      await CustomerOrderArchive.insertMany(ordersToArchive);
      
      // Удаляем из основной коллекции
      const deleteResult = await CustomerOrder.deleteMany({
        paymentDate: { $lt: sixMonthsAgoStr }
      });

      console.log(`✅ Архивировано ${oldOrders.length} заказов`);
      console.log(`✅ Удалено из основной коллекции: ${deleteResult.deletedCount}`);
    } else {
      console.log('ℹ️  Нет заказов для архивации');
    }

    // 4. Показываем статистику
    console.log('\n📊 Статистика базы данных:');
    
    const activeOrdersCount = await CustomerOrder.countDocuments();
    const archivedOrdersCount = await CustomerOrderArchive.countDocuments();
    
    console.log(`📌 Активные заказы: ${activeOrdersCount}`);
    console.log(`📦 Архивированные заказы: ${archivedOrdersCount}`);
    console.log(`📊 Всего заказов: ${activeOrdersCount + archivedOrdersCount}`);

    // 5. Проверяем производительность
    console.log('\n⚡ Проверка производительности...');
    
    const startTime = Date.now();
    const testQuery = await CustomerOrder.find({ status: 'processing' })
      .sort({ paymentDate: -1 })
      .limit(20)
      .explain('executionStats');
    
    const endTime = Date.now();
    console.log(`✅ Тестовый запрос выполнен за ${endTime - startTime}мс`);

    console.log('\n✅ Оптимизация базы данных завершена!');
    
  } catch (error) {
    console.error('❌ Ошибка при оптимизации базы данных:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Соединение с MongoDB закрыто');
  }
}

// Запускаем оптимизацию
optimizeDatabase(); 