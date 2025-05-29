import { Request, Response } from 'express';
import { Expense } from '../models/Expense';

export const expenseController = {
  // GET /expenses
  async getAllExpenses(req: Request, res: Response) {
    try {
      const { page = 1, limit = 50, type, from, to, productId } = req.query;
      
      const query: any = {};
      if (type) query.type = type;
      if (productId) query.productId = productId;
      if (from || to) {
        query.date = {};
        if (from) query.date.$gte = new Date(from as string);
        if (to) query.date.$lte = new Date(to as string);
      }

      const expenses = await Expense.find(query)
        .populate('productId', 'name category')
        .sort({ date: -1 })
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit));

      const total = await Expense.countDocuments(query);

      // Агрегация по типам расходов
      const summary = await Expense.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$type',
            totalAmount: { $sum: '$amountRUB' },
            count: { $sum: 1 }
          }
        },
        { $sort: { totalAmount: -1 } }
      ]);

      res.json({
        success: true,
        data: expenses,
        summary,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error getting expenses:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get expenses',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // GET /expenses/:id
  async getExpenseById(req: Request, res: Response) {
    try {
      const expense = await Expense.findById(req.params.id)
        .populate('productId', 'name category price');

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      res.json({
        success: true,
        data: expense
      });
    } catch (error) {
      console.error('Error getting expense:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get expense',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // POST /expenses
  async createExpense(req: Request, res: Response) {
    try {
      const expenseData = req.body;
      
      const expense = new Expense(expenseData);
      await expense.save();

      const populatedExpense = await Expense.findById(expense._id)
        .populate('productId', 'name category');

      res.status(201).json({
        success: true,
        data: populatedExpense,
        message: 'Expense created successfully'
      });
    } catch (error) {
      console.error('Error creating expense:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create expense',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // PUT /expenses/:id
  async updateExpense(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const expense = await Expense.findByIdAndUpdate(id, updateData, { 
        new: true, 
        runValidators: true 
      }).populate('productId', 'name category');

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      res.json({
        success: true,
        data: expense,
        message: 'Expense updated successfully'
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update expense',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // DELETE /expenses/:id
  async deleteExpense(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const expense = await Expense.findByIdAndDelete(id);
      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found'
        });
      }

      res.json({
        success: true,
        message: 'Expense deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete expense',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // GET /expenses/types
  async getExpenseTypes(req: Request, res: Response) {
    try {
      const types = ['Логистика', 'Реклама', 'ФОТ', 'Прочее', 'Закупка товара'];
      res.json({
        success: true,
        data: types
      });
    } catch (error) {
      console.error('Error getting expense types:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get expense types',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}; 