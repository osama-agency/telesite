import axios from 'axios';
import { ApiProduct, CalculatedProduct } from '../types';
import { Product, IProduct } from '../models/Product';
import config from '../config/config';
import { CustomerOrder } from '../models/CustomerOrder';
import { Purchase } from '../models/Purchase';
import { Expense } from '../models/Expense';

export class ProductService {
  private apiUrl: string;
  private apiToken: string;

  constructor() {
    this.apiUrl = config.apiUrl;
    this.apiToken = config.apiToken;
  }

  private calculateMetrics(product: ApiProduct | null, exchangeRate: number = 3.2): CalculatedProduct {
    if (!product) {
      throw new Error('Product is null');
    }

    const price = product.price ? parseFloat(product.price) : 0;
    const oldPrice = product.old_price ? parseFloat(product.old_price) : price;
    const currentStock = product.stock_quantity;
    
    // Default values
    const costPriceTRY = oldPrice * 0.7; // Estimate cost as 70% of old price
    const logisticsCost = 350; // Default logistics cost
    const soldPeriod = 30; // Default to 30 days
    const deliveryDays = 7; // Default delivery days
    const fixedCosts = 705; // Default fixed costs
    
    const costPriceRUB = costPriceTRY * exchangeRate;
    const totalCosts = costPriceRUB + logisticsCost + fixedCosts;
    const netProfit = price - totalCosts;
    const markup = costPriceRUB > 0 ? (price - costPriceRUB - logisticsCost) / costPriceRUB * 100 : 0;
    const marginPercent = price > 0 ? netProfit / price * 100 : 0;
    const netProfitTotal = netProfit * soldPeriod;
    const profitPercentTotal = totalCosts > 0 ? netProfit / totalCosts * 100 : 0;
    
    // ИСПРАВЛЕНО: правильная формула - проданное количество за период / количество дней в периоде
    // Для дефолтного расчета используем 0, так как у нас нет данных о продажах
    const averageConsumptionDaily = 0; // Будет рассчитано в getAllProducts с реальными данными о продажах
    
    const daysInStock = averageConsumptionDaily > 0 ? currentStock / averageConsumptionDaily : 0;
    const orderPoint = daysInStock < deliveryDays;

    return {
      ...product,
      averageSellingPrice: price,
      costPriceTRY,
      costPriceRUB,
      logisticsCost,
      markup,
      marginPercent,
      netProfit,
      netProfitTotal,
      totalCosts,
      profitPercentTotal,
      soldPeriod,
      averageConsumptionDaily,
      daysInStock,
      orderPoint,
      exchangeRate,
      fixedCosts,
      deliveryDays
    };
  }

  private convertToApiProduct(doc: any): ApiProduct | null {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return {
      id: obj.id,
      name: obj.name,
      description: obj.description,
      price: obj.price,
      stock_quantity: obj.stock_quantity,
      created_at: obj.created_at,
      updated_at: obj.updated_at,
      deleted_at: obj.deleted_at,
      ancestry: obj.ancestry,
      weight: obj.weight,
      dosage_form: obj.dosage_form,
      package_quantity: obj.package_quantity,
      main_ingredient: obj.main_ingredient,
      brand: obj.brand,
      old_price: obj.old_price,
      costPriceTRY: obj.costPriceTRY
    };
  }

  // Функция для парсинга дат в русском формате
  private parseDateFromRussianFormat(dateString: string): Date {
    try {
      // Формат: DD.MM.YYYY HH:mm:ss
      const [datePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('.');
      
      return new Date(
        parseInt(year), 
        parseInt(month) - 1, // месяцы в JS начинаются с 0
        parseInt(day)
      );
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return new Date(0); // возвращаем минимальную дату в случае ошибки
    }
  }

  // Функция для расчета среднего курса лиры из закупок конкретного товара
  private async calculateAverageExchangeRate(productId: string): Promise<number | null> {
    try {
      const purchases = await Purchase.find({
        'items.productId': productId,
        status: 'delivered'
      });

      if (purchases.length === 0) return null;

      let totalQuantity = 0;
      let weightedSum = 0;

      purchases.forEach(purchase => {
        purchase.items.forEach(item => {
          if (item.productId.toString() === productId) {
            totalQuantity += item.qty;
            weightedSum += item.qty * purchase.liraRate;
          }
        });
      });

      return totalQuantity > 0 ? weightedSum / totalQuantity : null;
    } catch (error) {
      console.error('Error calculating average exchange rate:', error);
      return null;
    }
  }

  // Функция для расчета средней себестоимости из закупок
  private async calculateAverageCostPrice(productId: string): Promise<number | null> {
    try {
      const purchases = await Purchase.find({
        'items.productId': productId,
        status: 'delivered'
      });

      if (purchases.length === 0) return null;

      let totalQuantity = 0;
      let weightedSum = 0;

      purchases.forEach(purchase => {
        purchase.items.forEach(item => {
          if (item.productId.toString() === productId) {
            totalQuantity += item.qty;
            weightedSum += item.qty * item.unitCostTRY;
          }
        });
      });

      return totalQuantity > 0 ? weightedSum / totalQuantity : null;
    } catch (error) {
      console.error('Error calculating average cost price:', error);
      return null;
    }
  }

  // Функция для получения первой даты продажи товара
  private async getFirstSaleDate(productName: string): Promise<Date | null> {
    try {
      // Ищем все продажи этого товара
      const orders = await CustomerOrder.find({
        productName: productName,
        status: { $in: ['processing', 'shipped', 'delivered'] }
      });
      
      if (orders.length === 0) return null;
      
      // Парсим даты и находим самую раннюю
      let earliestDate: Date | null = null;
      
      for (const order of orders) {
        const orderDate = this.parseDateFromRussianFormat(order.paymentDate);
        
        // Проверяем, что дата корректная (не 1970 год)
        if (orderDate.getFullYear() < 2020) continue;
        
        if (!earliestDate || orderDate < earliestDate) {
          earliestDate = orderDate;
        }
      }
      
      if (earliestDate) {
        console.log(`First sale date for ${productName}: ${earliestDate.toISOString()}`);
      }
      
      return earliestDate;
    } catch (error) {
      console.error('Error getting first sale date:', error);
      return null;
    }
  }

  // Функция для расчета распределенных расходов на товар
  private async calculateDistributedExpenses(productId: string, productName: string, soldQuantity: number, from?: string, to?: string): Promise<number> {
    try {
      // Получаем период для расчета
      let dateFilter: any = {};
      if (from || to) {
        dateFilter.date = {};
        if (from) dateFilter.date.$gte = this.parseDateFromRussianFormat(from);
        if (to) dateFilter.date.$lte = this.parseDateFromRussianFormat(to);
      } else {
        // По умолчанию берем последние 30 дней
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        dateFilter.date = { $gte: thirtyDaysAgo };
      }
      
      const expenses = await Expense.aggregate([
        {
          $match: {
            type: { $in: ['Реклама', 'Логистика'] },
            ...dateFilter
          }
        },
        {
          $group: {
            _id: null,
            totalAdvertising: {
              $sum: {
                $cond: [{ $eq: ['$type', 'Реклама'] }, '$amountRUB', 0]
              }
            },
            totalLogistics: {
              $sum: {
                $cond: [{ $eq: ['$type', 'Логистика'] }, '$amountRUB', 0]
              }
            }
          }
        }
      ]);

      const expenseSummary = expenses[0] || { totalAdvertising: 0, totalLogistics: 0 };
      
      // Получаем общее количество проданных товаров за период
      let orderFilter: any = {
        status: { $in: ['processing', 'shipped'] } // Считаем только заказы "На отправке" и "Отправлено"
      };
      if (from || to) {
        orderFilter.paymentDate = {};
        if (from) orderFilter.paymentDate.$gte = from;
        if (to) orderFilter.paymentDate.$lte = to;
      } else {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        orderFilter.paymentDate = { $gte: thirtyDaysAgo.toISOString() };
      }
      
      const totalSoldOrders = await CustomerOrder.aggregate([
        {
          $match: orderFilter
        },
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: '$quantity' }
          }
        }
      ]);

      const totalSoldQuantity = totalSoldOrders[0]?.totalQuantity || 1; // Избегаем деления на 0
      
      // Расчет расходов на единицу товара
      let expensePerUnit = 0;
      
      // 1. Фиксированная стоимость доставки курьером
      const deliveryCostPerUnit = 350; // 350₽ за упаковку
      
      // 2. Распределенные расходы на рекламу (пропорционально продажам)
      const advertisingPerUnit = soldQuantity > 0 ? 
        (expenseSummary.totalAdvertising / totalSoldQuantity) : 0;
      
      // 3. Распределенные расходы на логистику (пропорционально продажам)
      const logisticsPerUnit = soldQuantity > 0 ? 
        (expenseSummary.totalLogistics / totalSoldQuantity) : 0;
      
      // Суммируем все расходы
      expensePerUnit = deliveryCostPerUnit + advertisingPerUnit + logisticsPerUnit;
      
      return Math.round(expensePerUnit);
    } catch (error) {
      console.error('Error calculating distributed expenses:', error);
      return 350; // Возвращаем минимальную стоимость доставки в случае ошибки
    }
  }

  async getAllProducts(exchangeRate: number = 3.2, from?: string, to?: string): Promise<ApiProduct[]> {
    try {
      const products = await Product.find({}).sort({ id: 1 });
      
      // Расчет аналитики для каждого продукта
      const productsWithAnalytics = await Promise.all(products.map(async (product: IProduct) => {
        // Получаем средний курс из закупок
        const productId = (product as any)._id.toString();
        const avgExchangeRate = await this.calculateAverageExchangeRate(productId);
        const avgCostPrice = await this.calculateAverageCostPrice(productId);
        
        // Используем средний курс если есть, иначе дефолтный, иначе текущий
        const effectiveExchangeRate = avgExchangeRate || product.defaultExchangeRate || exchangeRate;
        
        // Используем среднюю себестоимость если есть, иначе из базы
        const effectiveCostPriceTRY = avgCostPrice || product.costPriceTRY || 0;
        
        // Получаем продажи за указанный период
        let orderFilter: any = {
          productName: product.name,
          status: { $in: ['processing', 'shipped'] }
        };
        
        // Если указан период, сначала получаем все заказы, потом фильтруем в памяти
        let orders = await CustomerOrder.find(orderFilter);
        
        if (from || to) {
          const fromDate = from ? new Date(from) : null;
          const toDate = to ? new Date(to) : null;
          
          orders = orders.filter((order: any) => {
            const orderDate = this.parseDateFromRussianFormat(order.paymentDate);
            
            if (fromDate && orderDate < fromDate) return false;
            if (toDate && orderDate > toDate) return false;
            
            return true;
          });
        }
        
        const totalSold = orders.reduce((sum, order: any) => sum + order.quantity, 0);
        const totalRevenue = orders.reduce((sum, order: any) => sum + (order.price * order.quantity), 0);
        const averageSellingPrice = totalSold > 0 ? totalRevenue / totalSold : product.price || 0;

        // Расчет метрик
        const costPriceRUB = effectiveCostPriceTRY * effectiveExchangeRate;
        const logisticsCost = 350; // фиксированная стоимость логистики
        const fixedCosts = 350; // фиксированные расходы
        const totalCosts = costPriceRUB + logisticsCost + fixedCosts;
        
        const netProfit = averageSellingPrice - totalCosts;
        const markup = averageSellingPrice > 0 ? ((averageSellingPrice - costPriceRUB) / costPriceRUB) * 100 : 0;
        const marginPercent = averageSellingPrice > 0 ? (netProfit / averageSellingPrice) * 100 : 0;
        
        const netProfitTotal = netProfit * totalSold;
        const profitPercentTotal = totalRevenue > 0 ? (netProfitTotal / totalRevenue) * 100 : 0;
        
        // Получаем первую дату продажи для расчета периода
        let firstSaleDate: Date | null = null;
        
        // Для расчета среднего потребления используем период в днях
        let periodDays = 30; // дефолт если нет продаж
        
        if (from && to) {
          // Если указан конкретный период
          const startDate = new Date(from);
          const endDate = new Date(to);
          periodDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
        } else if (!from && !to && totalSold > 0) {
          // Если выбран "Все время" и есть продажи - считаем от первой продажи
          firstSaleDate = await this.getFirstSaleDate(product.name);
          
          if (firstSaleDate) {
            const today = new Date();
            const daysSinceFirstSale = Math.ceil((today.getTime() - firstSaleDate.getTime()) / (1000 * 60 * 60 * 24));
            periodDays = Math.max(1, daysSinceFirstSale);
            
            console.log(`Product ${product.name}: first sale ${firstSaleDate.toISOString()}, days since: ${periodDays}`);
          } else {
            // Если не удалось найти первую продажу, используем количество дней с создания товара
            const createdDate = new Date(product.created_at);
            const today = new Date();
            const daysSinceCreated = Math.ceil((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
            periodDays = Math.max(1, Math.min(daysSinceCreated, 365)); // максимум год
          }
        }
        
        const soldPeriod = periodDays;
        const averageConsumptionDaily = totalSold / soldPeriod;
        const daysInStock = averageConsumptionDaily > 0 ? product.stock_quantity / averageConsumptionDaily : 999;
        const deliveryDays = 10;
        const orderPoint = daysInStock <= deliveryDays;

        // Получаем количество товаров в закупках со статусом "В пути"
        const purchasesInTransit = await Purchase.find({
          status: 'in_transit',
          'items.productId': productId
        });

        let inDelivery = 0;
        purchasesInTransit.forEach((purchase: any) => {
          purchase.items.forEach((item: any) => {
            if (item.productId.toString() === productId) {
              inDelivery += item.qty;
            }
          });
        });

        // Рассчитываем распределенные расходы на единицу товара
        const distributedExpenses = await this.calculateDistributedExpenses(productId, product.name, totalSold, from, to);
        
        // Пересчитываем метрики с учетом распределенных расходов
        const finalTotalCosts = costPriceRUB + distributedExpenses;
        const finalNetProfit = averageSellingPrice - finalTotalCosts;
        const finalMarginPercent = averageSellingPrice > 0 ? (finalNetProfit / averageSellingPrice) * 100 : 0;
        const finalNetProfitTotal = finalNetProfit * totalSold;
        const finalProfitPercentTotal = totalRevenue > 0 ? (finalNetProfitTotal / totalRevenue) * 100 : 0;

        const apiProduct: ApiProduct = {
          id: product.id,
          name: product.name,
          description: product.description || null,
          price: product.price?.toString() || null,
          stock_quantity: product.stock_quantity,
          created_at: product.created_at.toISOString(),
          updated_at: product.updated_at.toISOString(),
          deleted_at: product.deleted_at?.toISOString() || null,
          ancestry: product.ancestry || null,
          weight: product.weight || null,
          dosage_form: product.dosage_form || null,
          package_quantity: product.package_quantity || null,
          main_ingredient: product.main_ingredient || null,
          brand: product.brand || null,
          old_price: product.old_price?.toString() || null,
          // Расчетные поля
          averageSellingPrice,
          costPriceTRY: effectiveCostPriceTRY,
          costPriceRUB,
          logisticsCost: distributedExpenses, // Теперь это общие распределенные расходы
          markup,
          marginPercent: finalMarginPercent,
          netProfit: finalNetProfit,
          netProfitTotal: finalNetProfitTotal,
          totalCosts: finalTotalCosts,
          profitPercentTotal: finalProfitPercentTotal,
          soldPeriod,
          soldQuantity: totalSold, // Количество проданных товаров
          averageConsumptionDaily,
          daysInStock,
          orderPoint,
          exchangeRate: effectiveExchangeRate,
          fixedCosts,
          deliveryDays,
          revenue: totalRevenue, // Добавляем оборот
          inDelivery, // Количество товаров в доставке
          firstSaleDate: firstSaleDate ? firstSaleDate.toISOString() : undefined // Дата первой продажи
        };

        return apiProduct;
      }));

      return productsWithAnalytics;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async createProduct(productData: any): Promise<ApiProduct> {
    try {
      // Генерируем ID для нового товара
      const maxIdProduct = await Product.findOne().sort({ id: -1 });
      const newId = maxIdProduct ? maxIdProduct.id + 1 : 1;
      
      const newProduct = new Product({
        ...productData,
        id: newId,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      await newProduct.save();
      
      // Возвращаем в формате ApiProduct
      const products = await this.getAllProducts();
      const createdProduct = products.find(p => p.id === newId);
      
      if (!createdProduct) {
        throw new Error('Product created but not found');
      }
      
      return createdProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id: number, updates: any): Promise<ApiProduct> {
    try {
      const product = await Product.findOneAndUpdate(
        { id },
        { ...updates, updated_at: new Date() },
        { new: true }
      );
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      // Возвращаем в формате ApiProduct
      const products = await this.getAllProducts();
      const updatedProduct = products.find(p => p.id === id);
      
      if (!updatedProduct) {
        throw new Error('Product updated but not found');
      }
      
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async bulkUpdateProducts(ids: number[], updates: any): Promise<ApiProduct[]> {
    try {
      await Product.updateMany(
        { id: { $in: ids } },
        { ...updates, updated_at: new Date() }
      );
      
      // Возвращаем обновленные продукты
      const products = await this.getAllProducts();
      return products.filter(p => ids.includes(p.id));
    } catch (error) {
      console.error('Error bulk updating products:', error);
      throw error;
    }
  }

  async receiveDelivery(id: number, quantity: number, deliveryCost: number): Promise<ApiProduct> {
    try {
      const product = await Product.findOneAndUpdate(
        { id },
        { 
          $inc: { stock_quantity: quantity },
          updated_at: new Date()
        },
        { new: true }
      );
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      // TODO: Создать запись о поставке и расходе на логистику
      
      // Возвращаем в формате ApiProduct
      const products = await this.getAllProducts();
      const updatedProduct = products.find(p => p.id === id);
      
      if (!updatedProduct) {
        throw new Error('Product updated but not found');
      }
      
      return updatedProduct;
    } catch (error) {
      console.error('Error receiving delivery:', error);
      throw error;
    }
  }

  async syncProducts(): Promise<void> {
    // Здесь должна быть логика синхронизации с 1С
    console.log('Syncing products with 1C...');
  }
} 