# 🍃 Настройка MongoDB для TELESITE Analytics

## 📋 Что сейчас происходит

Ваш проект сейчас работает в **демо-режиме**, потому что MongoDB не настроен. 
API сервер автоматически предоставляет демо-данные, но для работы с реальными данными нужно подключить MongoDB.

## 🚀 Варианты подключения MongoDB

### 1. **MongoDB Atlas (облачное решение) - РЕКОМЕНДУЕТСЯ**

1. Зайдите на [mongodb.com](https://www.mongodb.com/atlas)
2. Создайте бесплатный аккаунт
3. Создайте новый кластер (выберите FREE tier)
4. В разделе "Database Access" создайте пользователя
5. В разделе "Network Access" добавьте IP `0.0.0.0/0` (для разработки)
6. Получите connection string в формате:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/telesite?retryWrites=true&w=majority
   ```

### 2. **Локальный MongoDB**

1. Установите MongoDB:
   ```bash
   # macOS
   brew install mongodb-community
   
   # Windows
   # Скачайте с mongodb.com
   
   # Ubuntu
   sudo apt install mongodb
   ```

2. Запустите MongoDB:
   ```bash
   mongod --dbpath /path/to/data/directory
   ```

3. Connection string будет:
   ```
   mongodb://localhost:27017/telesite
   ```

## 🔧 Настройка проекта

1. **Создайте файл `.env` в корне проекта:**
   ```bash
   # В корневой директории проекта
   touch .env
   ```

2. **Добавьте в `.env` ваш MongoDB URI:**
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/telesite?retryWrites=true&w=majority
   VITE_API_URL=/api
   ```

3. **Перезапустите сервер:**
   ```bash
   # Остановите текущие процессы (Ctrl+C)
   # Затем запустите снова
   npm run dev:api
   ```

## 📊 Структура базы данных

Проект использует следующие коллекции в MongoDB:

### `products` - Товары
```json
{
  "_id": "ObjectId",
  "id": "number",
  "name": "string",
  "costPriceTRY": "number",
  "costPriceRUB": "number", 
  "stock_quantity": "number",
  "price": "string",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

### `customerOrders` - Заказы клиентов
```json
{
  "_id": "ObjectId",
  "id": "string",
  "paymentDate": "string",
  "customerId": "string",
  "customerName": "string",
  "address": "string",
  "deliveryCost": "number",
  "productName": "string",
  "quantity": "number",
  "price": "number",
  "status": "string"
}
```

### `expenses` - Расходы
```json
{
  "_id": "ObjectId", 
  "id": "string",
  "date": "string",
  "type": "string",
  "description": "string",
  "amountRUB": "number",
  "createdAt": "ISODate"
}
```

## 🎯 Проверка подключения

После настройки MongoDB проверьте подключение:

1. **API Health Check:**
   ```bash
   curl http://localhost:3000/api/health
   ```
   
   Должен вернуть:
   ```json
   {
     "status": "ok",
     "message": "API is working with MongoDB!",
     "database": "connected"
   }
   ```

2. **Через браузер:**
   - Откройте `http://localhost:5173`
   - Данные должны загружаться из вашей MongoDB базы
   - В консоли браузера не должно быть ошибок API

## 🔍 Отладка проблем

### Проблема: "MongoDB connection failed"
- Проверьте правильность MONGODB_URI
- Убедитесь, что IP адрес добавлен в whitelist (Atlas)
- Проверьте логин/пароль

### Проблема: "ECONNREFUSED"
- Для локального MongoDB: убедитесь, что mongod запущен
- Для Atlas: проверьте интернет-соединение

### Проблема: "Authentication failed"
- Проверьте username/password в connection string
- Убедитесь, что пользователь создан в Database Access

## 💡 Полезные команды

```bash
# Запуск только API сервера
npm run dev:api

# Запуск только фронтенда
npm run dev

# Запуск API + фронтенда одновременно
npm run dev:full

# Проверка здоровья API
curl http://localhost:3000/api/health

# Просмотр логов API сервера
# (логи видны в терминале где запущен dev:api)
```

## 🎉 Что произойдет после подключения

1. ✅ Данные будут загружаться из вашей MongoDB
2. ✅ Исчезнет индикатор "демо-режима"  
3. ✅ Вы сможете добавлять/редактировать реальные данные
4. ✅ Все изменения будут сохраняться в базе
5. ✅ Аналитика будет строиться на основе реальных данных

---

**Нужна помощь?** Если возникают проблемы, проверьте логи API сервера в терминале или создайте issue с описанием ошибки. 