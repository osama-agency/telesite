import React, { useState, useEffect } from 'react';
import { RefreshCw, Database, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';
import { apiRequest } from '../api/config';

// Simple toast notification function
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 3000);
};

interface DataStatus {
  timestamp: string;
  database: string;
  externalApi: {
    status: string;
    url: string;
    error?: string;
  };
  data: {
    products: {
      count: number;
      lastUpdated: string | null;
      hasForceSync: boolean;
    };
    orders: {
      count: number;
      lastUpdated: string | null;
    };
  };
  recommendations: string[];
}

export default function DataSync() {
  const [status, setStatus] = useState<DataStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/data-status');
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
      showToast('Не удалось получить статус данных', 'error');
    } finally {
      setLoading(false);
    }
  };

  const syncProducts = async () => {
    setSyncing(true);
    try {
      const response = await apiRequest('/products/sync', {
        method: 'POST'
      });
      showToast(`${response.message}. Синхронизировано: ${response.count} товаров`);
      await fetchStatus(); // Refresh status
    } catch (error) {
      console.error('Sync failed:', error);
      showToast('Синхронизация не удалась', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const forceSyncProducts = async () => {
    setSyncing(true);
    try {
      const response = await apiRequest('/products/force-sync', {
        method: 'POST'
      });
      showToast(`${response.message}. Синхронизировано: ${response.count} товаров`);
      await fetchStatus(); // Refresh status
    } catch (error) {
      console.error('Force sync failed:', error);
      showToast('Принудительная синхронизация не удалась', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const syncCustomerOrders = async () => {
    setSyncing(true);
    try {
      const response = await apiRequest('/customer-orders/resync', {
        method: 'POST'
      });
      showToast(`${response.message}`);
      await fetchStatus(); // Refresh status
    } catch (error) {
      console.error('Customer orders sync failed:', error);
      showToast('Синхронизация заказов не удалась', 'error');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading && !status) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
        <span className="ml-2">Загрузка статуса...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Синхронизация данных</h1>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Обновить статус
        </button>
      </div>

      {status && (
        <>
          {/* API Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Статус подключений
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">База данных</span>
                  <div className="flex items-center">
                    {status.database === 'connected' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`ml-1 text-sm ${status.database === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                      {status.database === 'connected' ? 'Подключена' : 'Отключена'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Внешний API</span>
                  <div className="flex items-center">
                    {status.externalApi.status === 'connected' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`ml-1 text-sm ${status.externalApi.status === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                      {status.externalApi.status === 'connected' ? 'Доступен' : 'Недоступен'}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 break-all">
                  {status.externalApi.url}
                </div>
                {status.externalApi.error && (
                  <div className="text-xs text-red-500 mt-1">
                    Ошибка: {status.externalApi.error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Data Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Состояние данных</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Товары</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Количество: {status.data.products.count}</div>
                  <div>
                    Последнее обновление: {' '}
                    {status.data.products.lastUpdated 
                      ? new Date(status.data.products.lastUpdated).toLocaleString('ru-RU')
                      : 'Неизвестно'
                    }
                  </div>
                  {status.data.products.hasForceSync && (
                    <div className="text-blue-600">✓ Была принудительная синхронизация</div>
                  )}
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Заказы клиентов</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Количество: {status.data.orders.count}</div>
                  <div>
                    Последнее обновление: {' '}
                    {status.data.orders.lastUpdated 
                      ? new Date(status.data.orders.lastUpdated).toLocaleString('ru-RU')
                      : 'Неизвестно'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {status.recommendations.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-800 mb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Рекомендации
              </h3>
              <ul className="space-y-1 text-sm text-yellow-700">
                {status.recommendations.map((rec, index) => (
                  <li key={index}>• {rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Действия</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={syncProducts}
                disabled={syncing}
                className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                Синхронизировать товары
              </button>

              <button
                onClick={forceSyncProducts}
                disabled={syncing}
                className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Принудительная синхронизация
              </button>

              <button
                onClick={syncCustomerOrders}
                disabled={syncing}
                className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                Синхронизировать заказы
              </button>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Обычная синхронизация:</strong> использует кешированные данные, быстро</p>
              <p><strong>Принудительная синхронизация:</strong> получает свежие данные из внешнего API, медленно</p>
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Последнее обновление статуса: {new Date(status.timestamp).toLocaleString('ru-RU')}
          </div>
        </>
      )}
    </div>
  );
} 