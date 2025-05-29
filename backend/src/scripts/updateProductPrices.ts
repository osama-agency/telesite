import mongoose from 'mongoose';
import { Product } from '../models/Product';
import dotenv from 'dotenv';

dotenv.config();

// Данные о себестоимости товаров
const productPrices = [
  { name: 'Atominex 10 mg', costPriceTRY: 455 },
  { name: 'Abilify 15 mg', costPriceTRY: 430 },
  { name: 'Attex 100 mg', costPriceTRY: 1170 },
  { name: 'Atominex 25 mg', costPriceTRY: 765 },
  { name: 'Atominex 60 mg', costPriceTRY: 595 },
  { name: 'Atominex 40 mg', costPriceTRY: 416 },
  { name: 'Atominex 18 mg', costPriceTRY: 605 },
  { name: 'Atominex 80 mg', costPriceTRY: 770 },
  { name: 'Attex 4 mg (сироп)', costPriceTRY: 280 },
  { name: 'Attex 10 mg', costPriceTRY: 420 },
  { name: 'Atominex 100 mg', costPriceTRY: 970 },
  { name: 'Attex 18 mg', costPriceTRY: 740 },
  { name: 'Attex 80 mg', costPriceTRY: 960 },
  { name: 'HHS A1 L-Carnitine Lepidium', costPriceTRY: 280 },
  { name: 'Мирена 20 мкг/24 часа', costPriceTRY: 1300 },
  { name: 'Arislow 1 mg', costPriceTRY: 255 },
  { name: 'Arislow 2 mg', costPriceTRY: 285 },
  { name: 'Arislow 3 mg', costPriceTRY: 310 },
  { name: 'Arislow 4 mg', costPriceTRY: 340 },
  { name: 'Attex 25 mg', costPriceTRY: 797 },
  { name: 'Attex 40 mg', costPriceTRY: 495 },
  { name: 'Attex 60 mg', costPriceTRY: 730 },
  { name: 'Abilify 5 mg', costPriceTRY: 300 },
  { name: 'Risperdal 1 Mg/ml сироп', costPriceTRY: 245 },
  { name: 'Salazopyrin 500 mg', costPriceTRY: 220 },
  { name: 'Euthyrox 100 mcg', costPriceTRY: 105 }
];

async function updateProductPrices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/telesite');
    console.log('Connected to MongoDB');

    // Обновляем цены для каждого товара
    for (const productData of productPrices) {
      const result = await Product.updateOne(
        { name: productData.name },
        { 
          $set: { 
            costPriceTRY: productData.costPriceTRY,
            defaultExchangeRate: 2.19 // Курс для старых товаров
          }
        }
      );
      
      if (result.matchedCount > 0) {
        console.log(`✓ Updated ${productData.name}: ${productData.costPriceTRY} TRY`);
      } else {
        console.log(`✗ Product not found: ${productData.name}`);
      }
    }

    // Устанавливаем курс 2.19 для всех товаров, созданных до 29 мая 2025
    const cutoffDate = new Date('2025-05-29');
    const updateOldProducts = await Product.updateMany(
      { 
        created_at: { $lt: cutoffDate },
        defaultExchangeRate: { $exists: false }
      },
      { 
        $set: { defaultExchangeRate: 2.19 }
      }
    );
    
    console.log(`\nUpdated ${updateOldProducts.modifiedCount} old products with exchange rate 2.19`);

    console.log('\nPrice update completed!');
  } catch (error) {
    console.error('Error updating prices:', error);
  } finally {
    await mongoose.connection.close();
  }
}

updateProductPrices(); 