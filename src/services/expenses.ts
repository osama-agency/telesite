import { toast } from 'sonner';
export interface Expense {
  id: string;
  date: string;
  type: 'logistics' | 'advertising' | 'courier' | 'payroll' | 'other';
  description: string;
  amount: number;
  productId?: string;
  productName?: string;
  createdAt: string;
}
export const expensesApi = {
  create: async (expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expense)
      });
      if (!response.ok) throw new Error('Failed to create expense');
      return await response.json();
    } catch (error) {
      toast.error('Не удалось создать расход');
      throw error;
    }
  }
};