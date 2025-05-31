import { Request, Response } from 'express';
import { CustomerOrderService } from '../services/customerOrderService';
import { CustomerOrder } from '../models/CustomerOrder';
import { schedulerService } from '../app';

const customerOrderService = new CustomerOrderService();

// Helper function to parse date from DD.MM.YYYY HH:mm:ss format
function parseDateFromRussianFormat(dateStr: string): Date {
  const [datePart, timePart] = dateStr.split(' ');
  const [day, month, year] = datePart.split('.');
  const [hours, minutes, seconds] = (timePart || '00:00:00').split(':');
  
  return new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hours || '0'),
    parseInt(minutes || '0'),
    parseInt(seconds || '0')
  );
}

export const customerOrderController = {
  async getAllOrders(req: Request, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        from, 
        to, 
        search,
        statusFilter
      } = req.query;

      console.log('getAllOrders params:', { page, limit, from, to, search, statusFilter });

      // Build query object
      const query: any = {};
      
      // Parse status filter if provided
      const statusList = statusFilter ? (statusFilter as string).split(',') : [];
      
      // Date filtering - paymentDate is stored as string in DD.MM.YYYY format
      if (from || to) {
        // Convert YYYY-MM-DD format to DD.MM.YYYY for comparison
        const dateConditions: any[] = [];
        
        if (from) {
          const fromDate = new Date(from as string);
          const fromDateStr = fromDate.toLocaleDateString('ru-RU').split('.').reverse().join('.');
          console.log('From filter:', from, '-> searching for dates >=', fromDateStr);
        }
        
        if (to) {
          const toDate = new Date(to as string);
          const toDateStr = toDate.toLocaleDateString('ru-RU').split('.').reverse().join('.');
          console.log('To filter:', to, '-> searching for dates <=', toDateStr);
        }
        
        // Use regex to filter dates in DD.MM.YYYY format
        if (from && to) {
          const fromDate = new Date(from as string);
          const toDate = new Date(to as string);
          
          // Get all orders and filter them in memory for now
          // TODO: Optimize this with proper date indexing
          const allOrders = await CustomerOrder.find();
          const filteredOrders = allOrders.filter(order => {
            const orderDateParts = (order.paymentDate as string).split(' ')[0].split('.');
            if (orderDateParts.length !== 3) return false;
            
            const orderDate = new Date(
              parseInt(orderDateParts[2]), // year
              parseInt(orderDateParts[1]) - 1, // month (0-indexed)
              parseInt(orderDateParts[0]) // day
            );
            
            return orderDate >= fromDate && orderDate <= toDate;
          });
          
          // Apply search filter if needed
          let finalOrders = filteredOrders;
          if (search) {
            const searchRegex = new RegExp(search as string, 'i');
            finalOrders = filteredOrders.filter(order => 
              searchRegex.test(order.id as string) ||
              searchRegex.test(order.customerName as string) || 
              searchRegex.test(order.address as string) || 
              searchRegex.test(order.productName as string)
            );
          }
          
          // Apply status filter
          if (statusList.length > 0) {
            finalOrders = finalOrders.filter(order => 
              statusList.includes(order.status as string)
            );
          }
          
          // Apply pagination
          const total = finalOrders.length;
          const skip = (Number(page) - 1) * Number(limit);
          const paginatedOrders = finalOrders
            .sort((a, b) => {
              // Sort by payment date descending
              const aDate = parseDateFromRussianFormat(a.paymentDate as string);
              const bDate = parseDateFromRussianFormat(b.paymentDate as string);
              return bDate.getTime() - aDate.getTime();
            })
            .slice(skip, skip + Number(limit));
          
          console.log(`Filtered ${total} orders, returning ${paginatedOrders.length} for page ${page}`);
          
          return res.json({
            orders: paginatedOrders.map(order => order.toObject()),
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit))
          });
        } else if (from) {
          const fromDate = new Date(from as string);
          const allOrders = await CustomerOrder.find();
          const filteredOrders = allOrders.filter(order => {
            const orderDateParts = (order.paymentDate as string).split(' ')[0].split('.');
            if (orderDateParts.length !== 3) return false;
            
            const orderDate = new Date(
              parseInt(orderDateParts[2]),
              parseInt(orderDateParts[1]) - 1,
              parseInt(orderDateParts[0])
            );
            
            return orderDate >= fromDate;
          });
          
          let finalOrders = filteredOrders;
          if (search) {
            const searchRegex = new RegExp(search as string, 'i');
            finalOrders = filteredOrders.filter(order => 
              searchRegex.test(order.id as string) ||
              searchRegex.test(order.customerName as string) || 
              searchRegex.test(order.address as string) || 
              searchRegex.test(order.productName as string)
            );
          }
          
          // Apply status filter
          if (statusList.length > 0) {
            finalOrders = finalOrders.filter(order => 
              statusList.includes(order.status as string)
            );
          }
          
          const total = finalOrders.length;
          const skip = (Number(page) - 1) * Number(limit);
          const paginatedOrders = finalOrders
            .sort((a, b) => {
              // Sort by payment date descending
              const aDate = parseDateFromRussianFormat(a.paymentDate as string);
              const bDate = parseDateFromRussianFormat(b.paymentDate as string);
              return bDate.getTime() - aDate.getTime();
            })
            .slice(skip, skip + Number(limit));
          
          return res.json({
            orders: paginatedOrders.map(order => order.toObject()),
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit))
          });
        } else if (to) {
          const toDate = new Date(to as string);
          const allOrders = await CustomerOrder.find();
          const filteredOrders = allOrders.filter(order => {
            const orderDateParts = (order.paymentDate as string).split(' ')[0].split('.');
            if (orderDateParts.length !== 3) return false;
            
            const orderDate = new Date(
              parseInt(orderDateParts[2]),
              parseInt(orderDateParts[1]) - 1,
              parseInt(orderDateParts[0])
            );
            
            return orderDate <= toDate;
          });
          
          let finalOrders = filteredOrders;
          if (search) {
            const searchRegex = new RegExp(search as string, 'i');
            finalOrders = filteredOrders.filter(order => 
              searchRegex.test(order.id as string) ||
              searchRegex.test(order.customerName as string) || 
              searchRegex.test(order.address as string) || 
              searchRegex.test(order.productName as string)
            );
          }
          
          // Apply status filter
          if (statusList.length > 0) {
            finalOrders = finalOrders.filter(order => 
              statusList.includes(order.status as string)
            );
          }
          
          const total = finalOrders.length;
          const skip = (Number(page) - 1) * Number(limit);
          const paginatedOrders = finalOrders
            .sort((a, b) => {
              // Sort by payment date descending
              const aDate = parseDateFromRussianFormat(a.paymentDate as string);
              const bDate = parseDateFromRussianFormat(b.paymentDate as string);
              return bDate.getTime() - aDate.getTime();
            })
            .slice(skip, skip + Number(limit));
          
          return res.json({
            orders: paginatedOrders.map(order => order.toObject()),
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit))
          });
        }
      }
      
      // Search filtering (without date filters)
      if (search) {
        const searchRegex = new RegExp(search as string, 'i');
        query.$or = [
          { id: searchRegex },
          { customerName: searchRegex },
          { address: searchRegex },
          { productName: searchRegex }
        ];
      }
      
      // Status filtering
      if (statusList.length > 0) {
        query.status = { $in: statusList };
      }

      console.log('MongoDB query:', JSON.stringify(query, null, 2));

      // Execute query with pagination
      const skip = (Number(page) - 1) * Number(limit);
      
      // First get all matching orders for sorting
      const allMatchingOrders = await CustomerOrder.find(query);
      
      // Sort orders by payment date descending (newest first)
      allMatchingOrders.sort((a, b) => {
        const aDate = parseDateFromRussianFormat(a.paymentDate as string);
        const bDate = parseDateFromRussianFormat(b.paymentDate as string);
        return bDate.getTime() - aDate.getTime();
      });
      
      // Apply pagination after sorting
      const orders = allMatchingOrders.slice(skip, skip + Number(limit));

      // Get total count for pagination
      const total = allMatchingOrders.length;

      console.log(`Found ${total} orders total, returning ${orders.length} orders for page ${page}`);

      res.json({
        orders: orders.map(order => order.toObject()),
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      });
    } catch (error) {
      console.error('Error in getAllOrders:', error);
      res.status(500).json({
        message: 'Failed to fetch customer orders',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async getOrderById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const order = await customerOrderService.getOrderById(id);
      
      if (!order) {
        return res.status(404).json({ message: 'Customer order not found' });
      }

      res.json(order);
    } catch (error) {
      console.error('Error in getOrderById:', error);
      res.status(500).json({
        message: 'Failed to fetch customer order',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async resyncOrders(req: Request, res: Response) {
    try {
      console.log('Manual re-sync requested...');
      
      // Используем schedulerService для принудительного обновления
      const result = await schedulerService.forceUpdateCustomerOrders();
      
      if (result.success) {
        res.json({
          message: 'Orders synchronized successfully',
          total: result.ordersCount,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          message: 'Failed to synchronize orders',
          error: result.error,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error in resyncOrders:', error);
      res.status(500).json({
        message: 'Failed to re-sync customer orders',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async clearAllOrders(req: Request, res: Response) {
    try {
      console.log('Clearing all customer orders...');
      const result = await CustomerOrder.deleteMany({});
      
      console.log(`Deleted ${result.deletedCount} customer orders`);
      
      res.json({
        message: 'All customer orders cleared successfully',
        deletedCount: result.deletedCount
      });
    } catch (error) {
      console.error('Error in clearAllOrders:', error);
      res.status(500).json({
        message: 'Failed to clear customer orders',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}; 