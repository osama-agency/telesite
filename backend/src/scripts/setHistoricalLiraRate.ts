import mongoose from 'mongoose';
import { InventoryMovement } from '../models/InventoryMovement';
import dotenv from 'dotenv';

dotenv.config();

async function setHistoricalLiraRate() {
  try {
    // Подключение к MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/marketplace');
    console.log('Connected to MongoDB');

    // Устанавливаем курс лиры 2.19 для всех движений до текущей даты, где курс не установлен
    const result = await InventoryMovement.updateMany(
      {
        type: 'sale',
        liraRate: { $exists: false },
        date: { $lt: new Date() }
      },
      {
        $set: { liraRate: 2.19 }
      }
    );

    console.log(`Updated ${result.modifiedCount} inventory movements with historical lira rate 2.19`);

    // Также можем обновить для покупок, если нужно
    const purchaseResult = await InventoryMovement.updateMany(
      {
        type: 'purchase',
        liraRate: { $exists: false },
        date: { $lt: new Date('2024-01-01') } // Для старых закупок
      },
      {
        $set: { liraRate: 2.19 }
      }
    );

    console.log(`Updated ${purchaseResult.modifiedCount} purchase movements with historical lira rate 2.19`);

    await mongoose.disconnect();
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

setHistoricalLiraRate(); 