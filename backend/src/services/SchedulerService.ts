import * as cron from 'node-cron';
import { AnalyticsService } from './AnalyticsService';
import { customerOrderService } from './customerOrderService';

export class SchedulerService {
  private analyticsService: AnalyticsService;
  private tasks: Map<string, cron.ScheduledTask> = new Map();

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  // Запуск всех scheduled задач
  startScheduledTasks(): void {
    console.log('Starting scheduled tasks...');

    // Обновление заказов клиентов каждые 10 минут
    const customerOrdersTask = cron.schedule('*/10 * * * *', async () => {
      console.log('Running customer orders update (every 10 minutes)...');
      try {
        const orders = await customerOrderService.getAllOrders();
        console.log(`Customer orders update completed successfully - ${orders.length} orders synchronized`);
      } catch (error) {
        console.error('Error in customer orders update:', error);
      }
    }, {
      timezone: 'Europe/Moscow'
    });
    this.tasks.set('customerOrders', customerOrdersTask);

    // Обновление аналитики каждый день в 00:30
    const dailyTask = cron.schedule('30 0 * * *', async () => {
      console.log('Running daily analytics update...');
      try {
        await this.analyticsService.updateAllAnalytics();
        console.log('Daily analytics update completed successfully');
      } catch (error) {
        console.error('Error in daily analytics update:', error);
      }
    }, {
      timezone: 'Europe/Moscow'
    });
    this.tasks.set('daily', dailyTask);

    // Обновление аналитики остатков каждые 2 часа
    const inventoryTask = cron.schedule('0 */2 * * *', async () => {
      console.log('Running inventory analytics update...');
      try {
        await this.analyticsService.updateInventoryAnalytics();
        console.log('Inventory analytics update completed successfully');
      } catch (error) {
        console.error('Error in inventory analytics update:', error);
      }
    }, {
      timezone: 'Europe/Moscow'
    });
    this.tasks.set('inventory', inventoryTask);

    // Обновление аналитики прибыли каждые 6 часов
    const profitTask = cron.schedule('0 */6 * * *', async () => {
      console.log('Running profit analytics update...');
      try {
        await this.analyticsService.updateProfitAnalytics();
        console.log('Profit analytics update completed successfully');
      } catch (error) {
        console.error('Error in profit analytics update:', error);
      }
    }, {
      timezone: 'Europe/Moscow'
    });
    this.tasks.set('profit', profitTask);

    // Еженедельное полное обновление аналитики (понедельник в 01:00)
    const weeklyTask = cron.schedule('0 1 * * 1', async () => {
      console.log('Running weekly full analytics update...');
      try {
        await this.analyticsService.updateAllAnalytics();
        console.log('Weekly full analytics update completed successfully');
      } catch (error) {
        console.error('Error in weekly full analytics update:', error);
      }
    }, {
      timezone: 'Europe/Moscow'
    });
    this.tasks.set('weekly', weeklyTask);

    console.log('Scheduled tasks started successfully - customer orders will update every 10 minutes');
  }

  // Остановка всех scheduled задач
  stopScheduledTasks(): void {
    this.tasks.forEach((task, name) => {
      task.stop();
      console.log(`Stopped task: ${name}`);
    });
    this.tasks.clear();
    console.log('All scheduled tasks stopped');
  }

  // Получение информации о запущенных задачах
  getTasksInfo(): any[] {
    const tasks: any[] = [];
    this.tasks.forEach((task, name) => {
      tasks.push({
        name,
        scheduled: true,
        exists: true
      });
    });
    return tasks;
  }

  // Метод для принудительного обновления customer orders
  async forceUpdateCustomerOrders(): Promise<{ success: boolean; ordersCount?: number; error?: string }> {
    try {
      console.log('Force updating customer orders...');
      const orders = await customerOrderService.getAllOrders();
      console.log(`Force update completed - ${orders.length} orders synchronized`);
      return { success: true, ordersCount: orders.length };
    } catch (error) {
      console.error('Error in force customer orders update:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
} 