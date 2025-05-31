import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { customerOrderService } from '../src/services/customerOrderService';
import { CustomerOrder } from '../src/models/CustomerOrder';

dotenv.config();

async function syncAllOrders() {
  try {
    // Подключаемся к MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/telesite-analytics');
    console.log('✅ Подключение к MongoDB установлено');

    // Очищаем текущие заказы
    console.log('\n🧹 Очистка текущих заказов...');
    const deleteResult = await CustomerOrder.deleteMany({});
    console.log(`Удалено ${deleteResult.deletedCount} заказов`);

    // Загружаем все заказы из API
    console.log('\n📥 Загрузка заказов из API...');
    const orders = await customerOrderService.getAllOrders();
    console.log(`✅ Загружено ${orders.length} заказов из API`);

    // Проверяем, сколько заказов в БД
    const totalInDb = await CustomerOrder.countDocuments();
    console.log(`📊 Сохранено в БД: ${totalInDb} заказов`);

    // Показываем распределение по статусам
    const statusStats = await CustomerOrder.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    console.log('\n📊 Распределение по статусам:');
    statusStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} заказов`);
    });

    // Показываем распределение по месяцам
    const monthStats = await CustomerOrder.aggregate([
      {
        $group: {
          _id: {
            $substr: ['$paymentDate', 3, 7] // Извлекаем MM.YYYY
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: -1 }
      },
      {
        $limit: 12
      }
    ]);

    console.log('\n📅 Распределение по месяцам:');
    monthStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} заказов`);
    });

    // Проверяем последние заказы
    const latestOrders = await CustomerOrder
      .find()
      .sort({ paymentDate: -1 })
      .limit(5);

    console.log('\n🕐 Последние 5 заказов:');
    latestOrders.forEach(order => {
      console.log(`   ${order.id} - ${order.paymentDate} - ${order.status} - ${order.customerName}`);
    });

    console.log('\n✅ Синхронизация завершена!');
    console.log(`📊 Итого в БД: ${totalInDb} заказов`);

  } catch (error) {
    console.error('❌ Ошибка при синхронизации:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Соединение с MongoDB закрыто');
  }
}

// Запускаем синхронизацию
syncAllOrders(); 