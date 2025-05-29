import mongoose from 'mongoose';
import { CustomerOrder } from '../models/CustomerOrder';
import dotenv from 'dotenv';

dotenv.config();

async function createTestOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/telesite');
    console.log('Connected to MongoDB');

    // Очищаем существующие заказы
    await CustomerOrder.deleteMany({});
    console.log('Cleared existing orders');

    // Создаем тестовые заказы
    const testOrders = [
      {
        id: '1001-0',
        paymentDate: '25.12.2024 14:30:00',
        customerId: '1',
        customerName: 'Иван Иванов',
        address: 'Москва',
        deliveryCost: 300,
        productName: 'Крем для лица',
        quantity: 2,
        price: 1500,
        status: 'shipped'
      },
      {
        id: '1002-0',
        paymentDate: '26.12.2024 10:15:00',
        customerId: '2',
        customerName: 'Петр Петров',
        address: 'Санкт-Петербург',
        deliveryCost: 250,
        productName: 'Шампунь',
        quantity: 3,
        price: 800,
        status: 'processing'
      },
      {
        id: '1003-0',
        paymentDate: '27.12.2024 16:45:00',
        customerId: '3',
        customerName: 'Елена Сидорова',
        address: 'Екатеринбург',
        deliveryCost: 400,
        productName: 'Маска для волос',
        quantity: 1,
        price: 2000,
        status: 'paid'
      },
      {
        id: '1004-0',
        paymentDate: '28.12.2024 09:20:00',
        customerId: '4',
        customerName: 'Алексей Смирнов',
        address: 'Новосибирск',
        deliveryCost: 350,
        productName: 'Сыворотка для лица',
        quantity: 2,
        price: 3500,
        status: 'shipped'
      },
      {
        id: '1005-0',
        paymentDate: '28.12.2024 18:30:00',
        customerId: '5',
        customerName: 'Мария Козлова',
        address: 'Казань',
        deliveryCost: 280,
        productName: 'Крем для рук',
        quantity: 4,
        price: 600,
        status: 'unpaid'
      }
    ];

    // Добавляем еще заказов для разнообразия
    for (let i = 6; i <= 50; i++) {
      const statuses = ['shipped', 'processing', 'paid', 'unpaid', 'cancelled'];
      const cities = ['Москва', 'Санкт-Петербург', 'Екатеринбург', 'Новосибирск', 'Казань', 'Нижний Новгород', 'Челябинск', 'Самара'];
      const products = ['Крем для лица', 'Шампунь', 'Маска для волос', 'Сыворотка для лица', 'Крем для рук', 'Гель для душа', 'Лосьон для тела', 'Скраб для тела'];
      const names = ['Анна', 'Михаил', 'Ольга', 'Дмитрий', 'Татьяна', 'Сергей', 'Наталья', 'Андрей'];
      const surnames = ['Иванова', 'Петров', 'Сидорова', 'Смирнов', 'Козлова', 'Новиков', 'Морозова', 'Волков'];
      
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomSurname = surnames[Math.floor(Math.random() * surnames.length)];
      
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Заказы за последние 30 дней
      
      testOrders.push({
        id: `${1000 + i}-0`,
        paymentDate: date.toLocaleString('ru-RU', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).replace(',', ''),
        customerId: i.toString(),
        customerName: `${randomName} ${randomSurname}`,
        address: randomCity,
        deliveryCost: 200 + Math.floor(Math.random() * 300),
        productName: randomProduct,
        quantity: 1 + Math.floor(Math.random() * 5),
        price: 500 + Math.floor(Math.random() * 3000),
        status: randomStatus
      });
    }

    // Сохраняем в базу
    for (const order of testOrders) {
      await CustomerOrder.create(order);
    }

    console.log(`Created ${testOrders.length} test orders`);

    // Проверяем количество по статусам
    const statusCounts = await Promise.all([
      { status: 'shipped', count: await CustomerOrder.countDocuments({ status: 'shipped' }) },
      { status: 'processing', count: await CustomerOrder.countDocuments({ status: 'processing' }) },
      { status: 'paid', count: await CustomerOrder.countDocuments({ status: 'paid' }) },
      { status: 'unpaid', count: await CustomerOrder.countDocuments({ status: 'unpaid' }) },
      { status: 'cancelled', count: await CustomerOrder.countDocuments({ status: 'cancelled' }) }
    ]);

    console.log('Orders by status:', statusCounts);

    process.exit(0);
  } catch (error) {
    console.error('Error creating test orders:', error);
    process.exit(1);
  }
}

createTestOrders(); 