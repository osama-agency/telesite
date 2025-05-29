import { Request, Response } from 'express';
import { Purchase } from '../models/Purchase';
import { InventoryMovement } from '../models/InventoryMovement';
import { Expense } from '../models/Expense';
import { Product } from '../models/Product';
import mongoose from 'mongoose';

export const purchaseController = {
  // GET /purchases
  async getAllPurchases(req: Request, res: Response) {
    try {
      const { page = 1, limit = 50, supplier, from, to } = req.query;
      
      const query: any = {};
      if (supplier) query.supplier = new RegExp(supplier as string, 'i');
      if (from || to) {
        query.date = {};
        if (from) query.date.$gte = new Date(from as string);
        if (to) query.date.$lte = new Date(to as string);
      }

      const purchases = await Purchase.find(query)
        .populate('items.productId', 'id name category')
        .populate('deliveredItems.productId', 'id name category')
        .sort({ date: -1 })
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit));

      const total = await Purchase.countDocuments(query);

      // Преобразуем _id в id для совместимости с фронтендом
      const purchasesWithId = purchases.map(purchase => {
        const purchaseObj = purchase.toObject();
        return {
          ...purchaseObj,
          id: (purchase as any)._id.toString(),
          _id: undefined
        };
      });

      res.json({
        success: true,
        data: purchasesWithId,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error getting purchases:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get purchases',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // GET /purchases/:id
  async getPurchaseById(req: Request, res: Response) {
    try {
      const purchase = await Purchase.findById(req.params.id)
        .populate('items.productId', 'name category price');

      if (!purchase) {
        return res.status(404).json({
          success: false,
          message: 'Purchase not found'
        });
      }

      res.json({
        success: true,
        data: purchase
      });
    } catch (error) {
      console.error('Error getting purchase:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get purchase',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // POST /purchases
  async createPurchase(req: Request, res: Response) {
    try {
      const purchaseData = req.body;
      
      console.log('Creating purchase with data:', purchaseData);
      
      // Валидация входящих данных
      if (!purchaseData.items || !Array.isArray(purchaseData.items) || purchaseData.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Items array is required and cannot be empty'
        });
      }

      // Преобразуем числовые productId в ObjectId
      for (let i = 0; i < purchaseData.items.length; i++) {
        const item = purchaseData.items[i];
        
        if (!item.productId) {
          return res.status(400).json({
            success: false,
            message: `Product ID is required for item ${i + 1}`
          });
        }

        // Ищем продукт по числовому ID
        const product = await Product.findOne({ id: Number(item.productId) });
        if (product) {
          item.productId = product._id;
        } else {
          return res.status(400).json({
            success: false,
            message: `Product with ID ${item.productId} not found`
          });
        }

        // Проверяем числовые поля
        if (!item.qty || item.qty <= 0) {
          return res.status(400).json({
            success: false,
            message: `Valid quantity is required for item ${i + 1}`
          });
        }

        if (!item.unitCostTRY || item.unitCostTRY <= 0) {
          return res.status(400).json({
            success: false,
            message: `Valid unit cost is required for item ${i + 1}`
          });
        }
      }

      // Убираем ручной расчет totalTRY - это делается автоматически в модели
      // totalTRY будет рассчитан в pre('validate') middleware
      
      // Создаем закупку
      const purchase = new Purchase(purchaseData);
      await purchase.save();

      console.log('Purchase created successfully:', purchase._id);

      const populatedPurchase = await Purchase.findById(purchase._id)
        .populate('items.productId', 'id name category');

      if (!populatedPurchase) {
        throw new Error('Failed to populate purchase');
      }

      const purchaseWithId = {
        ...populatedPurchase.toObject(),
        id: (populatedPurchase as any)._id.toString(),
        _id: undefined
      };

      res.status(201).json({
        success: true,
        data: purchaseWithId,
        message: 'Purchase created successfully'
      });
    } catch (error) {
      console.error('Error creating purchase:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create purchase',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // PUT /purchases/:id
  async updatePurchase(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Получаем старую закупку для обновления движений
      const oldPurchase = await Purchase.findById(id);
      if (!oldPurchase) {
        return res.status(404).json({
          success: false,
          message: 'Purchase not found'
        });
      }

      // Удаляем старые движения по складу
      await InventoryMovement.deleteMany({ refId: id, type: 'purchase' });

      // Обновляем закупку
      const purchase = await Purchase.findByIdAndUpdate(id, updateData, { 
        new: true, 
        runValidators: true 
      }).populate('items.productId', 'name category');

      if (!purchase) {
        return res.status(404).json({
          success: false,
          message: 'Purchase not found'
        });
      }

      // Создаем новые записи движения по складу
      const inventoryMovements = purchase.items.map(item => ({
        date: purchase.date,
        productId: item.productId,
        changeQty: item.qty,
        type: 'purchase' as const,
        refId: purchase._id
      }));

      await InventoryMovement.insertMany(inventoryMovements);

      res.json({
        success: true,
        data: purchase,
        message: 'Purchase updated successfully'
      });
    } catch (error) {
      console.error('Error updating purchase:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update purchase',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // DELETE /purchases/:id
  async deletePurchase(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const purchase = await Purchase.findByIdAndDelete(id);
      if (!purchase) {
        return res.status(404).json({
          success: false,
          message: 'Purchase not found'
        });
      }

      // Удаляем связанные движения по складу
      await InventoryMovement.deleteMany({ refId: id, type: 'purchase' });

      res.json({
        success: true,
        message: 'Purchase deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting purchase:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete purchase',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // POST /purchases/:id/receive
  async receivePurchase(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { deliveredItems, deliveryExpenseRUB } = req.body;

      console.log('Receiving purchase:', id, 'with data:', { deliveredItems, deliveryExpenseRUB });

      const purchase = await Purchase.findById(id);
      if (!purchase) {
        return res.status(404).json({
          success: false,
          message: 'Purchase not found'
        });
      }

      if (purchase.status === 'delivered') {
        return res.status(400).json({
          success: false,
          message: 'Purchase already delivered'
        });
      }

      // Валидация deliveredItems
      if (!deliveredItems || !Array.isArray(deliveredItems) || deliveredItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Delivered items array is required and cannot be empty'
        });
      }

      // Преобразуем и валидируем deliveredItems
      const processedDeliveredItems = [];
      for (let i = 0; i < deliveredItems.length; i++) {
        const item = deliveredItems[i];
        
        if (!item.productId) {
          return res.status(400).json({
            success: false,
            message: `Product ID is required for delivered item ${i + 1}`
          });
        }

        let productObjectId;
        
        // Если productId это уже ObjectId
        if (mongoose.Types.ObjectId.isValid(item.productId) && typeof item.productId === 'string' && item.productId.length === 24) {
          productObjectId = new mongoose.Types.ObjectId(item.productId);
        } else {
          // Ищем продукт по числовому ID
          const product = await Product.findOne({ id: Number(item.productId) });
          if (product) {
            productObjectId = product._id;
          } else {
            return res.status(400).json({
              success: false,
              message: `Product with ID ${item.productId} not found`
            });
          }
        }

        if (!item.qtyDelivered || item.qtyDelivered < 0) {
          return res.status(400).json({
            success: false,
            message: `Valid delivered quantity is required for item ${i + 1}`
          });
        }

        processedDeliveredItems.push({
          productId: productObjectId as mongoose.Types.ObjectId,
          qtyDelivered: Number(item.qtyDelivered)
        });
      }

      // Обновляем статус закупки
      purchase.status = 'delivered';
      purchase.deliveredAt = new Date();
      purchase.deliveredItems = processedDeliveredItems as any;
      if (deliveryExpenseRUB && deliveryExpenseRUB > 0) {
        purchase.deliveryExpenseRUB = Number(deliveryExpenseRUB);
      }
      await purchase.save();

      console.log('Purchase status updated to delivered');

      // Создаем записи движения по складу для оприходованных товаров и обновляем остатки
      const inventoryMovements = [];
      
      for (const item of processedDeliveredItems) {
        if (item.qtyDelivered > 0) {
          // Находим продукт и обновляем его остатки
          const product = await Product.findOne({ _id: item.productId });
          if (product) {
            // Обновляем остатки товара
            product.stock_quantity = (product.stock_quantity || 0) + item.qtyDelivered;
            
            // Сохраняем курс лиры для этого товара
            // Находим цену из закупки для расчета средневзвешенной стоимости
            const purchaseItem = purchase.items.find(pi => 
              pi.productId.toString() === (item.productId as mongoose.Types.ObjectId).toString()
            );
            
            if (purchaseItem) {
              // Сохраняем последний курс закупки
              (product as any).lastPurchaseRate = purchase.liraRate;
              (product as any).lastPurchaseDate = new Date();
            }
            
            await product.save();
            console.log(`Updated stock for product ${product.id}: +${item.qtyDelivered}, new stock: ${product.stock_quantity}`);
          }
          
          inventoryMovements.push({
            date: new Date(),
            productId: item.productId,
            changeQty: item.qtyDelivered,
            type: 'purchase' as const,
            refId: purchase._id,
            liraRate: purchase.liraRate // Сохраняем курс лиры в движении
          });
        }
      }

      if (inventoryMovements.length > 0) {
        await InventoryMovement.insertMany(inventoryMovements);
        console.log(`Created ${inventoryMovements.length} inventory movements`);
      }

      // Создаем расход на доставку, если указан
      if (deliveryExpenseRUB && deliveryExpenseRUB > 0) {
        const expense = new Expense({
          date: new Date(),
          type: 'Логистика',
          description: `Доставка закупки от ${purchase.supplier}`,
          amountRUB: Number(deliveryExpenseRUB)
        });
        await expense.save();
        console.log('Created delivery expense:', deliveryExpenseRUB);
      }

      const populatedPurchase = await Purchase.findById(purchase._id)
        .populate('items.productId', 'id name category')
        .populate('deliveredItems.productId', 'id name category');

      if (!populatedPurchase) {
        throw new Error('Failed to populate purchase after receiving');
      }

      const purchaseWithId = {
        ...populatedPurchase.toObject(),
        id: (populatedPurchase as any)._id.toString(),
        _id: undefined
      };

      res.json({
        success: true,
        data: purchaseWithId,
        message: 'Purchase received successfully'
      });
    } catch (error) {
      console.error('Error receiving purchase:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to receive purchase',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}; 