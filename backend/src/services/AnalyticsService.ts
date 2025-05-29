import mongoose from 'mongoose';
import { Purchase } from '../models/Purchase';
import { Expense } from '../models/Expense';
import { InventoryMovement } from '../models/InventoryMovement';
import { Product } from '../models/Product';
import { CustomerOrder } from '../models/CustomerOrder';
import { 
  AnalyticsInventory, 
  AnalyticsPurchases, 
  AnalyticsExpenses, 
  AnalyticsProfit 
} from '../models/Analytics';

export class AnalyticsService {
  
  // Обновление аналитики остатков
  async updateInventoryAnalytics(): Promise<void> {
    try {
      console.log('Updating inventory analytics...');
      
      const inventoryData = await InventoryMovement.aggregate([
        {
          $group: {
            _id: "$productId",
            currentStock: { $sum: "$changeQty" }
          }
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product"
          }
        },
        {
          $unwind: "$product"
        },
        {
          $project: {
            productId: "$_id",
            productName: "$product.name",
            currentStock: 1,
            reorderPoint: "$product.reorderPoint"
          }
        }
      ]);

      // Обновляем аналитику для каждого продукта
      for (const item of inventoryData) {
        await AnalyticsInventory.findOneAndUpdate(
          { productId: item.productId },
          {
            productId: item.productId,
            productName: item.productName,
            currentStock: item.currentStock,
            reorderPoint: item.reorderPoint,
            lastUpdated: new Date()
          },
          { upsert: true }
        );
      }
      
      console.log(`Updated inventory analytics for ${inventoryData.length} products`);
    } catch (error) {
      console.error('Error updating inventory analytics:', error);
      throw error;
    }
  }

  // Обновление аналитики закупок по периодам
  async updatePurchasesAnalytics(startDate?: Date, endDate?: Date): Promise<void> {
    try {
      console.log('Updating purchases analytics...');
      
      const matchStage: any = {};
      if (startDate || endDate) {
        matchStage.date = {};
        if (startDate) matchStage.date.$gte = startDate;
        if (endDate) matchStage.date.$lte = endDate;
      }

      const purchasesData = await Purchase.aggregate([
        ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
        {
          $addFields: {
            period: {
              $dateToString: { format: "%Y-%m-%d", date: "$date" }
            },
            totalRUB: { $multiply: ["$totalTRY", "$liraRate"] }
          }
        },
        {
          $group: {
            _id: "$period",
            totalTRY: { $sum: "$totalTRY" },
            totalRUB: { $sum: "$totalRUB" },
            avgLiraRate: { $avg: "$liraRate" },
            suppliersCount: { $addToSet: "$supplier" },
            itemsCount: { $sum: { $size: "$items" } }
          }
        },
        {
          $project: {
            period: "$_id",
            totalTRY: 1,
            totalRUB: 1,
            avgLiraRate: 1,
            suppliersCount: { $size: "$suppliersCount" },
            itemsCount: 1
          }
        }
      ]);

      for (const item of purchasesData) {
        await AnalyticsPurchases.findOneAndUpdate(
          { period: item.period },
          {
            ...item,
            lastUpdated: new Date()
          },
          { upsert: true }
        );
      }
      
      console.log(`Updated purchases analytics for ${purchasesData.length} periods`);
    } catch (error) {
      console.error('Error updating purchases analytics:', error);
      throw error;
    }
  }

  // Обновление аналитики расходов
  async updateExpensesAnalytics(startDate?: Date, endDate?: Date): Promise<void> {
    try {
      console.log('Updating expenses analytics...');
      
      const matchStage: any = {};
      if (startDate || endDate) {
        matchStage.date = {};
        if (startDate) matchStage.date.$gte = startDate;
        if (endDate) matchStage.date.$lte = endDate;
      }

      const expensesData = await Expense.aggregate([
        ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
        {
          $addFields: {
            period: {
              $dateToString: { format: "%Y-%m-%d", date: "$date" }
            }
          }
        },
        {
          $group: {
            _id: {
              period: "$period",
              type: "$type"
            },
            totalAmount: { $sum: "$amountRUB" },
            transactionsCount: { $sum: 1 }
          }
        },
        {
          $project: {
            period: "$_id.period",
            type: "$_id.type",
            totalAmount: 1,
            transactionsCount: 1
          }
        }
      ]);

      for (const item of expensesData) {
        await AnalyticsExpenses.findOneAndUpdate(
          { period: item.period, type: item.type },
          {
            ...item,
            lastUpdated: new Date()
          },
          { upsert: true }
        );
      }
      
      console.log(`Updated expenses analytics for ${expensesData.length} records`);
    } catch (error) {
      console.error('Error updating expenses analytics:', error);
      throw error;
    }
  }

  // Обновление аналитики прибыли
  async updateProfitAnalytics(startDate?: Date, endDate?: Date): Promise<void> {
    try {
      console.log('Updating profit analytics...');
      
      // Получаем данные о продажах с группировкой по продуктам и периодам
      const revenueData = await CustomerOrder.aggregate([
        {
          $addFields: {
            period: {
              $dateToString: { 
                format: "%Y-%m-%d", 
                date: {
                  $dateFromString: {
                    dateString: "$paymentDate",
                    format: "%d.%m.%Y %H:%M:%S"
                  }
                }
              }
            }
          }
        },
        {
          $group: {
            _id: {
              period: "$period",
              productName: "$productName"
            },
            revenue: { $sum: { $multiply: ["$quantity", "$price"] } },
            quantitySold: { $sum: "$quantity" }
          }
        }
      ]);

      // Получаем данные о закупках по продуктам
      const purchaseCostData = await Purchase.aggregate([
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.productId",
            foreignField: "_id",
            as: "product"
          }
        },
        { $unwind: "$product" },
        {
          $addFields: {
            period: {
              $dateToString: { format: "%Y-%m-%d", date: "$date" }
            },
            costRUB: { 
              $multiply: ["$items.qty", "$items.unitCostTRY", "$liraRate"] 
            }
          }
        },
        {
          $group: {
            _id: {
              period: "$period",
              productName: "$product.name"
            },
            purchaseCost: { $sum: "$costRUB" }
          }
        }
      ]);

      // Получаем расходы по продуктам
      const expensesByProduct = await Expense.aggregate([
        { $match: { productId: { $ne: null } } },
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "product"
          }
        },
        { $unwind: "$product" },
        {
          $addFields: {
            period: {
              $dateToString: { format: "%Y-%m-%d", date: "$date" }
            }
          }
        },
        {
          $group: {
            _id: {
              period: "$period",
              productName: "$product.name"
            },
            expenses: { $sum: "$amountRUB" }
          }
        }
      ]);

      // Объединяем данные и рассчитываем прибыль
      const profitMap = new Map();

      // Добавляем выручку
      for (const item of revenueData) {
        const key = `${item._id.period}_${item._id.productName}`;
        profitMap.set(key, {
          period: item._id.period,
          productName: item._id.productName,
          revenue: item.revenue,
          purchaseCost: 0,
          expenses: 0
        });
      }

      // Добавляем себестоимость закупок
      for (const item of purchaseCostData) {
        const key = `${item._id.period}_${item._id.productName}`;
        const existing = profitMap.get(key) || {
          period: item._id.period,
          productName: item._id.productName,
          revenue: 0,
          purchaseCost: 0,
          expenses: 0
        };
        existing.purchaseCost = item.purchaseCost;
        profitMap.set(key, existing);
      }

      // Добавляем расходы
      for (const item of expensesByProduct) {
        const key = `${item._id.period}_${item._id.productName}`;
        const existing = profitMap.get(key) || {
          period: item._id.period,
          productName: item._id.productName,
          revenue: 0,
          purchaseCost: 0,
          expenses: 0
        };
        existing.expenses = item.expenses;
        profitMap.set(key, existing);
      }

      // Сохраняем рассчитанную прибыль
      for (const [key, data] of profitMap) {
        const grossProfit = data.revenue - data.purchaseCost;
        const netProfit = grossProfit - data.expenses;
        const margin = data.revenue > 0 ? (netProfit / data.revenue) * 100 : 0;

        await AnalyticsProfit.findOneAndUpdate(
          { 
            period: data.period, 
            productName: data.productName 
          },
          {
            period: data.period,
            productName: data.productName,
            revenue: data.revenue,
            purchaseCost: data.purchaseCost,
            expenses: data.expenses,
            grossProfit,
            netProfit,
            margin,
            lastUpdated: new Date()
          },
          { upsert: true }
        );
      }
      
      console.log(`Updated profit analytics for ${profitMap.size} records`);
    } catch (error) {
      console.error('Error updating profit analytics:', error);
      throw error;
    }
  }

  // Обновление всей аналитики
  async updateAllAnalytics(): Promise<void> {
    console.log('Starting full analytics update...');
    
    await Promise.all([
      this.updateInventoryAnalytics(),
      this.updatePurchasesAnalytics(),
      this.updateExpensesAnalytics(),
      this.updateProfitAnalytics()
    ]);
    
    console.log('All analytics updated successfully');
  }

  // Получение аналитики по остаткам
  async getInventoryAnalytics() {
    return await AnalyticsInventory.find({})
      .sort({ currentStock: -1 })
      .populate('productId');
  }

  // Получение аналитики по закупкам
  async getPurchasesAnalytics(from?: string, to?: string) {
    const query: any = {};
    if (from || to) {
      if (from) query.period = { $gte: from };
      if (to) query.period = { ...query.period, $lte: to };
    }
    
    return await AnalyticsPurchases.find(query).sort({ period: -1 });
  }

  // Получение аналитики по расходам
  async getExpensesAnalytics(type?: string, from?: string, to?: string) {
    const query: any = {};
    if (type) query.type = type;
    if (from || to) {
      if (from) query.period = { $gte: from };
      if (to) query.period = { ...query.period, $lte: to };
    }
    
    return await AnalyticsExpenses.find(query).sort({ period: -1, type: 1 });
  }

  // Получение аналитики по прибыли
  async getProfitAnalytics(from?: string, to?: string) {
    const query: any = {};
    if (from || to) {
      if (from) query.period = { $gte: from };
      if (to) query.period = { ...query.period, $lte: to };
    }
    
    return await AnalyticsProfit.find(query).sort({ period: -1, netProfit: -1 });
  }

  // Получение сводной аналитики по логистике
  async getLogisticsAnalytics(from?: string, to?: string) {
    const query: any = { type: 'Логистика' };
    if (from || to) {
      if (from) query.period = { $gte: from };
      if (to) query.period = { ...query.period, $lte: to };
    }
    
    return await AnalyticsExpenses.find(query).sort({ period: -1 });
  }
} 