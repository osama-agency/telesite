import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Устанавливаем CORS заголовки
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Обрабатываем OPTIONS запрос для CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Health check
  if (req.url === '/api/health') {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      message: 'API is working on Vercel!' 
    });
    return;
  }

  // Простой роут для тестирования
  if (req.url?.startsWith('/api/test')) {
    res.status(200).json({ 
      message: 'API working!',
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Заглушка для других API endpoints
  res.status(200).json({ 
    message: 'API endpoint under construction',
    availableEndpoints: [
      '/api/health',
      '/api/test'
    ]
  });
} 