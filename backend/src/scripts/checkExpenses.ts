import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Expense } from '../models/Expense';
import { Product } from '../models/Product';

async function checkExpenses() {
  try {
    // Подключаемся к MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/telesite-analytics');
    console.log('Connected to MongoDB');

    // Проверяем существующие расходы
    const expenseCount = await Expense.countDocuments();
    console.log(`\nТекущее количество расходов в базе: ${expenseCount}`);

    if (expenseCount === 0) {
      console.log('\nСоздаём тестовые расходы...');
      
      // Получаем несколько продуктов для связи с расходами
      const products = await Product.find().limit(3);
      
      const testExpenses = [
        {
          date: new Date('2025-01-15'),
          type: 'Логистика',
          description: 'Доставка товаров из Турции',
          amountRUB: 45000,
          productId: products[0]?._id || null
        },
        {
          date: new Date('2025-01-20'),
          type: 'Реклама',
          description: 'Реклама в социальных сетях',
          amountRUB: 25000,
          productId: null
        },
        {
          date: new Date('2025-01-25'),
          type: 'ФОТ',
          description: 'Зарплата менеджера',
          amountRUB: 80000,
          productId: null
        },
        {
          date: new Date('2025-01-28'),
          type: 'Прочее',
          description: 'Аренда офиса',
          amountRUB: 35000,
          productId: null
        },
        {
          date: new Date('2025-02-01'),
          type: 'Логистика',
          description: 'Экспресс-доставка',
          amountRUB: 12000,
          productId: products[1]?._id || null
        }
      ];

      for (const expenseData of testExpenses) {
        const expense = new Expense(expenseData);
        await expense.save();
        console.log(`Создан расход: ${expense.description} - ${expense.amountRUB} руб.`);
      }
      
      console.log('\nТестовые расходы успешно созданы!');
    } else {
      // Показываем существующие расходы
      const expenses = await Expense.find()
        .populate('productId', 'name')
        .sort({ date: -1 })
        .limit(5);
        
      console.log('\nПоследние 5 расходов:');
      expenses.forEach(expense => {
        const productName = expense.productId ? (expense.productId as any).name : 'Без товара';
        console.log(`- ${expense.date.toLocaleDateString('ru-RU')} | ${expense.type} | ${expense.description} | ${expense.amountRUB} руб. | ${productName}`);
      });
    }

    // Показываем общую статистику
    const stats = await Expense.aggregate([
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amountRUB' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);
    
    console.log('\nСтатистика по типам расходов:');
    stats.forEach(stat => {
      console.log(`- ${stat._id}: ${stat.count} записей, сумма: ${stat.totalAmount} руб.`);
    });

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkExpenses(); 