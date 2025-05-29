import mongoose from 'mongoose';
import { CustomerOrder } from '../models/CustomerOrder';
import dotenv from 'dotenv';

dotenv.config();

const customerNames = [
  'Иван Иванов', 'Петр Петров', 'Елена Сидорова', 'Алексей Смирнов', 'Мария Козлова',
  'Михаил Смирнов', 'Наталья Петрова', 'Ольга Новикова', 'Дмитрий Смирнов', 'Татьяна Козлова',
  'Андрей Сидоров', 'Светлана Иванова', 'Сергей Петров', 'Анна Смирнова', 'Владимир Козлов'
];

const cities = ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Нижний Новгород', 
                'Казань', 'Челябинск', 'Омск', 'Самара', 'Ростов-на-Дону'];

const products = [
  'Крем для лица', 'Шампунь', 'Гель для душа', 'Маска для волос', 'Крем для рук',
  'Сыворотка для лица', 'Лосьон для тела', 'Скраб для тела', 'Тоник для лица', 'Масло для волос'
];

const statuses = ['unpaid', 'paid', 'processing', 'shipped', 'cancelled', 'overdue', 'refunded'];

// Генерация случайной даты в диапазоне
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Форматирование даты в российский формат
function formatDateRussian(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
}

async function seedCustomerOrders() {
  try {
    // Подключаемся к MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/telesite-analytics');
    console.log('Connected to MongoDB');

    // Очищаем существующие данные
    await CustomerOrder.deleteMany({});
    console.log('Cleared existing customer orders');

    // Генерируем тестовые данные
    const orders = [];
    const startDate = new Date('2024-01-01');
    const endDate = new Date();
    
    for (let i = 1; i <= 100; i++) {
      const customer = customerNames[Math.floor(Math.random() * customerNames.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const product = products[Math.floor(Math.random() * products.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const quantity = Math.floor(Math.random() * 5) + 1;
      const price = Math.floor(Math.random() * 4000) + 500;
      const deliveryCost = Math.floor(Math.random() * 300) + 200;
      const paymentDate = randomDate(startDate, endDate);
      
      orders.push({
        id: `ORDER-${i}`,
        paymentDate: formatDateRussian(paymentDate),
        customerId: String(Math.floor(Math.random() * 50) + 1),
        customerName: customer,
        address: city,
        deliveryCost: deliveryCost,
        productName: product,
        quantity: quantity,
        price: price,
        status: status
      });
    }

    // Сохраняем в базу данных
    await CustomerOrder.insertMany(orders);
    console.log(`Created ${orders.length} test customer orders`);

    // Выводим статистику
    const stats = await CustomerOrder.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    console.log('\nOrder statistics by status:');
    stats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count} orders`);
    });

    console.log('\nDone!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding customer orders:', error);
    process.exit(1);
  }
}

// Запускаем seed
seedCustomerOrders(); 