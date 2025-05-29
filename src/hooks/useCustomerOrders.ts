import { useState, useEffect, useCallback } from 'react';
import { customerOrdersApi, type PaginatedResponse, type ApiCustomerOrder } from '../services/api';

interface UseCustomerOrdersParams {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  search?: string;
  statusFilter?: string[];
  enabled?: boolean;
}

interface UseCustomerOrdersReturn {
  data: PaginatedResponse<ApiCustomerOrder> | undefined;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCustomerOrders({
  page = 1,
  limit = 20,
  from,
  to,
  search,
  statusFilter,
  enabled = true
}: UseCustomerOrdersParams = {}): UseCustomerOrdersReturn {
  const [data, setData] = useState<PaginatedResponse<ApiCustomerOrder> | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    console.log('useCustomerOrders fetchData called with params:', { page, limit, from, to, search, statusFilter });
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await customerOrdersApi.getAll({ page, limit, from, to, search, statusFilter });
      console.log('useCustomerOrders API response:', result);
      setData(result);
    } catch (err) {
      console.error('useCustomerOrders API error:', err);
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  }, [page, limit, from, to, search, statusFilter, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch
  };
} 