# Инструкция по тестированию Telesite Analytics

## Настройка и запуск

### Backend

1. Перейдите в папку backend:
```bash
cd backend
```

2. Создайте файл `.env` со следующим содержимым:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/telesite

# External API Configuration
API_URL=https://strattera.tgapp.online/api/v1
API_TOKEN=8cM9wVBrY3p56k4L1VBpIBwOsw
```

3. Установите зависимости:
```bash
npm install
```

4. Запустите MongoDB (если не запущен):
```bash
mongod
```

5. Запустите backend сервер:
```bash
npm run dev
```

### Frontend

1. В новом терминале, вернитесь в корневую папку проекта и установите зависимости:
```bash
npm install
```

2. Запустите frontend:
```bash
npm run dev
```

## Тестирование функционала

### 1. Синхронизация товаров

1. Откройте браузер и перейдите на http://localhost:5173 (или другой порт, указанный при запуске)
2. Перейдите на страницу "Товары"
3. Если товары не загружены, выполните синхронизацию через Postman или curl:
   ```bash
   curl -X POST http://localhost:3000/api/products/sync
   ```
4. Обновите страницу - товары должны появиться

### 2. Синхронизация заказов

1. Перейдите на страницу "Заказы клиентов"
2. Если заказы не загружены, выполните синхронизацию:
   ```bash
   curl -X POST http://localhost:3000/api/orders/sync
   ```
3. Обновите страницу - заказы должны появиться в таблице

## Структура данных

### Товары (Products)
- Загружаются из API: https://strattera.tgapp.online/api/v1/products
- Автоматически рассчитываются метрики прибыльности
- Фильтруются только товары категории СДВГ (ancestry содержит '20')

### Заказы клиентов (Customer Orders)
- Загружаются из API: https://strattera.tgapp.online/api/v1/orders
- Преобразуются в формат для отображения в таблице
- Каждый товар в заказе отображается отдельной строкой

## Возможные проблемы

1. **Ошибка подключения к MongoDB**
   - Убедитесь, что MongoDB запущен
   - Проверьте правильность MONGO_URI в .env файле

2. **Ошибка авторизации API**
   - Проверьте правильность API_TOKEN в .env файле
   - Токен должен быть: 8cM9wVBrY3p56k4L1VBpIBwOsw

3. **Товары/заказы не отображаются**
   - Выполните синхронизацию через API endpoints
   - Проверьте консоль браузера и логи сервера на наличие ошибок

## API Endpoints для тестирования

### Backend API (http://localhost:3000/api)

- `GET /products` - Получить все товары
- `POST /products/sync` - Синхронизировать товары с внешним API
- `GET /orders` - Получить все заказы  
- `POST /orders/sync` - Синхронизировать заказы с внешним API
- `GET /customer-orders` - Получить заказы клиентов в табличном формате 