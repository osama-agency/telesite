import { Request, Response } from 'express';
import { ProductService } from '../services/productService';
import { Product } from '../models/Product';
import { Purchase } from '../models/Purchase';
import { CustomerOrder } from '../models/CustomerOrder';
import { ApiProduct } from '../types';

const productService = new ProductService();

// Функция для расчета среднего курса лиры из закупок конкретного товара
async function calculateAverageExchangeRate(productId: string): Promise<number | null> {
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
async function calculateAverageCostPrice(productId: string): Promise<number | null> {
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

export const productController = {
  async getAllProducts(req: Request, res: Response) {
    try {
      const exchangeRate = parseFloat(req.query.exchangeRate as string) || 3.2;
      const from = req.query.from as string | undefined;
      const to = req.query.to as string | undefined;
      
      const productService = new ProductService();
      const products = await productService.getAllProducts(exchangeRate, from, to);
      
      res.json({
        success: true,
        data: products,
        metadata: {
          total: products.length,
          exchangeRate
        }
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create product' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await productService.updateProduct(Number(id), req.body);
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update product' });
    }
  },

  async bulkUpdate(req: Request, res: Response) {
    try {
      const { ids, updates } = req.body;
      const products = await productService.bulkUpdateProducts(ids, updates);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'Failed to bulk update products' });
    }
  },

  async receiveDelivery(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { quantity, deliveryCost } = req.body;
      const product = await productService.receiveDelivery(Number(id), quantity, deliveryCost);
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: 'Failed to receive delivery' });
    }
  },

  async sync(req: Request, res: Response) {
    try {
      // Здесь должна быть логика синхронизации с 1С
      res.json({ message: 'Products synced successfully', synced: 0 });
    } catch (error) {
      res.status(500).json({ error: 'Sync failed' });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await Product.findOne({ id: Number(id) });
      
      if (!product) {
        return res.status(404).json({ 
          success: false,
          error: 'Product not found' 
        });
      }
      
      // Используем жесткое удаление (hard delete)
      await Product.deleteOne({ id: Number(id) });
      
      res.json({ 
        success: true,
        message: 'Product deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to delete product' 
      });
    }
  }
}; 