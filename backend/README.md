# Telesite Analytics Backend

## Установка и настройка

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env` в корне backend папки со следующим содержимым:
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

3. Убедитесь, что MongoDB запущен на вашей системе.

4. Запустите сервер в режиме разработки:
```bash
npm run dev
```

## API Endpoints

### Товары (Products)
- `GET /api/products` - Получить все товары
- `POST /api/products/sync` - Синхронизировать товары с внешним API
- `PATCH /api/products/:id` - Обновить товар
- `PATCH /api/products/bulk` - Массовое обновление товаров
- `POST /api/products/:id/receive` - Оприходование товара

### Заказы (Orders)
- `GET /api/orders` - Получить все заказы
- `POST /api/orders/sync` - Синхронизировать заказы с внешним API
- `GET /api/orders/:id` - Получить заказ по ID
- `PATCH /api/orders/:id` - Обновить заказ

### Заказы клиентов (Customer Orders)
- `GET /api/customer-orders` - Получить все заказы клиентов
- `GET /api/customer-orders/:id` - Получить заказ клиента по ID

## Внешние API

Backend интегрируется с внешним API для получения данных о товарах и заказах:
- Товары: https://strattera.tgapp.online/api/v1/products
- Заказы: https://strattera.tgapp.online/api/v1/orders

Авторизация осуществляется через Bearer токен, указанный в переменной окружения `API_TOKEN`.

## Структура данных

### Товары
Товары синхронизируются из внешнего API и обогащаются расчетными полями:
- Себестоимость в TRY и RUB
- Логистические расходы
- Наценка и маржинальность
- Чистая прибыль
- Точка заказа

### Заказы
Заказы синхронизируются из внешнего API и преобразуются в формат для отображения в таблице заказов клиентов.

## Примечания

- При первом запуске необходимо выполнить синхронизацию данных через соответствующие эндпоинты
- База данных MongoDB автоматически создается при первом подключении
- Все расчеты производятся на стороне backend для оптимизации производительности 