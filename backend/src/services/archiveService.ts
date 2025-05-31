import mongoose from 'mongoose';
import { CustomerOrder } from '../models/CustomerOrder';

// Модель для архивных заказов
const CustomerOrderArchiveSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  paymentDate: { type: String, required: true },
  paymentDateObj: { type: Date, index: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  address: { type: String, required: true },
  deliveryCost: { type: Number, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { type: String, required: true },
  archivedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const CustomerOrderArchive = mongoose.model('CustomerOrderArchive', CustomerOrderArchiveSchema);

export class ArchiveService {
  /**
   * Архивирует заказы старше указанного количества месяцев
   */
  async archiveOldOrders(monthsOld: number = 6): Promise<{
    archivedCount: number;
    deletedCount: number;
  }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - monthsOld);

      // Находим старые заказы
      const oldOrders = await CustomerOrder.find({
        paymentDateObj: { $lt: cutoffDate }
      });

      if (oldOrders.length === 0) {
        return { archivedCount: 0, deletedCount: 0 };
      }

      // Подготавливаем данные для архивации
      const ordersToArchive = oldOrders.map(order => ({
        ...order.toObject(),
        archivedAt: new Date()
      }));

      // Сохраняем в архив
      await CustomerOrderArchive.insertMany(ordersToArchive, { ordered: false });

      // Удаляем из основной коллекции
      const deleteResult = await CustomerOrder.deleteMany({
        paymentDateObj: { $lt: cutoffDate }
      });

      console.log(`Архивировано ${oldOrders.length} заказов старше ${monthsOld} месяцев`);

      return {
        archivedCount: oldOrders.length,
        deletedCount: deleteResult.deletedCount
      };
    } catch (error) {
      console.error('Ошибка при архивации заказов:', error);
      throw error;
    }
  }

  /**
   * Получает архивные заказы с пагинацией
   */
  async getArchivedOrders(params: {
    page: number;
    limit: number;
    search?: string;
    from?: Date;
    to?: Date;
  }) {
    const { page = 1, limit = 20, search, from, to } = params;
    const skip = (page - 1) * limit;

    const query: any = {};

    // Фильтр по датам
    if (from || to) {
      query.paymentDateObj = {};
      if (from) query.paymentDateObj.$gte = from;
      if (to) query.paymentDateObj.$lte = to;
    }

    // Поиск по тексту
    if (search) {
      query.$text = { $search: search };
    }

    const [orders, total] = await Promise.all([
      CustomerOrderArchive
        .find(query)
        .sort({ paymentDateObj: -1 })
        .skip(skip)
        .limit(limit),
      CustomerOrderArchive.countDocuments(query)
    ]);

    return {
      data: orders,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Восстанавливает заказ из архива
   */
  async restoreOrder(orderId: string): Promise<boolean> {
    try {
      const archivedOrder = await CustomerOrderArchive.findOne({ id: orderId });
      
      if (!archivedOrder) {
        throw new Error(`Архивный заказ ${orderId} не найден`);
      }

      // Удаляем поля архивации
      const { _id, archivedAt, ...orderData } = archivedOrder.toObject();

      // Восстанавливаем в основную коллекцию
      await CustomerOrder.create(orderData);

      // Удаляем из архива
      await CustomerOrderArchive.deleteOne({ id: orderId });

      console.log(`Заказ ${orderId} успешно восстановлен из архива`);
      return true;
    } catch (error) {
      console.error('Ошибка при восстановлении заказа:', error);
      throw error;
    }
  }

  /**
   * Получает статистику по архиву
   */
  async getArchiveStats() {
    const [totalArchived, byStatus, byMonth] = await Promise.all([
      CustomerOrderArchive.countDocuments(),
      
      CustomerOrderArchive.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$price' }
          }
        }
      ]),
      
      CustomerOrderArchive.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$paymentDateObj' },
              month: { $month: '$paymentDateObj' }
            },
            count: { $sum: 1 },
            revenue: { $sum: '$price' }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    ]);

    return {
      totalArchived,
      byStatus,
      byMonth
    };
  }
}

export const archiveService = new ArchiveService(); 