import mongoose from 'mongoose';
import { CustomerOrder } from '../models/CustomerOrder';
import dotenv from 'dotenv';

dotenv.config();

async function addRecentOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/telesite');
    console.log('Подключено к MongoDB');
    
    const today = new Date();
    const orders = [
      {
        id: `TEST-${Date.now()}-1`,
        paymentDate: today.toISOString(),
        customerId: 'TEST001',
        customerName: 'Иван Иванов',
        address: 'Москва, ул. Ленина, 10',
        deliveryCost: 350,
        productName: 'Atominex 10 mg',
        quantity: 2,
        price: 5000,
        status: 'Доставлен'
      },
      {
        id: `TEST-${Date.now()}-2`,
        paymentDate: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString(),
        customerId: 'TEST002',
        customerName: 'Петр Петров',
        address: 'Санкт-Петербург, пр. Невский, 50',
        deliveryCost: 350,
        productName: 'Abilify 15 mg',
        quantity: 1,
        price: 3600,
        status: 'Доставлен'
      },
      {
        id: `TEST-${Date.now()}-3`,
        paymentDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        customerId: 'TEST003',
        customerName: 'Елена Сидорова',
        address: 'Москва, ул. Тверская, 25',
        deliveryCost: 350,
        productName: 'Attex 100 mg',
        quantity: 3,
        price: 6500,
        status: 'Доставлен'
      },
      {
        id: `TEST-${Date.now()}-4`,
        paymentDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        customerId: 'TEST004',
        customerName: 'Михаил Смирнов',
        address: 'Москва, ул. Арбат, 15',
        deliveryCost: 350,
        productName: 'Atominex 10 mg',
        quantity: 5,
        price: 5000,
        status: 'Доставлен'
      },
      {
        id: `TEST-${Date.now()}-5`,
        paymentDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        customerId: 'TEST005',
        customerName: 'Анна Козлова',
        address: 'Екатеринбург, ул. Ленина, 100',
        deliveryCost: 400,
        productName: 'Atominex 25 mg',
        quantity: 2,
        price: 5500,
        status: 'Доставлен'
      },
      {
        id: `TEST-${Date.now()}-6`,
        paymentDate: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        customerId: 'TEST006',
        customerName: 'Сергей Новиков',
        address: 'Новосибирск, ул. Красный проспект, 50',
        deliveryCost: 450,
        productName: 'Atominex 60 mg',
        quantity: 1,
        price: 5500,
        status: 'Доставлен'
      }
    ];
    
    console.log('Добавляю тестовые заказы за последние дни...\n');
    
    for (const order of orders) {
      await CustomerOrder.create(order);
      const orderDate = new Date(order.paymentDate);
      const daysAgo = Math.floor((today.getTime() - orderDate.getTime()) / (24 * 60 * 60 * 1000));
      const dateStr = orderDate.toLocaleDateString('ru-RU');
      console.log(`✓ ${order.productName} x${order.quantity} - ${dateStr} (${daysAgo === 0 ? 'сегодня' : `${daysAgo} дн. назад`})`);
    }
    
    console.log('\n✅ Все заказы добавлены успешно!');
    console.log('Теперь обновите страницу и выберите период "7 дней" чтобы увидеть изменения.');
    
    process.exit(0);
  } catch (error) {
    console.error('Ошибка:', error);
    process.exit(1);
  }
}

addRecentOrders(); 