# MongoDB Atlas Setup Guide

## Проблема
API на Vercel не может подключиться к MongoDB Atlas и возвращает демо-данные вместо реальных.

## Решение

### 1. Настройка MongoDB Atlas

#### Шаг 1: Создайте кластер в MongoDB Atlas
1. Перейдите на [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Войдите в аккаунт или создайте новый
3. Создайте новый кластер (бесплатный M0 подойдёт)

#### Шаг 2: Создайте пользователя базы данных
1. В панели Atlas перейдите в **Database Access**
2. Нажмите **Add New Database User**
3. Выберите **Password** authentication
4. Введите имя пользователя и пароль (запомните их!)
5. В **Database User Privileges** выберите **Read and write to any database**
6. Нажмите **Add User**

#### Шаг 3: Настройте Network Access
1. Перейдите в **Network Access**
2. Нажмите **Add IP Address**
3. Для тестирования добавьте **0.0.0.0/0** (позволяет доступ отовсюду)
   - ⚠️ Это небезопасно для продакшена, но подойдёт для тестирования
4. Для продакшена добавьте IP-диапазоны Vercel или используйте VPC Peering

#### Шаг 4: Получите строку подключения
1. В **Database** нажмите **Connect** рядом с вашим кластером
2. Выберите **Connect your application**
3. Выберите **Node.js** и версию **4.1 or later**
4. Скопируйте строку подключения:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
5. Замените `<username>` и `<password>` на данные пользователя из шага 2
6. Добавьте название базы данных: `/telesite` перед `?retryWrites`
   ```
   mongodb+srv://username:password@cluster.mongodb.net/telesite?retryWrites=true&w=majority
   ```

### 2. Настройка локального окружения

#### Создайте файл .env
Создайте файл `.env` в корне проекта:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/telesite?retryWrites=true&w=majority
```

#### Тестирование локально
```bash
# Установите зависимости если не установлены
npm install mongodb dotenv

# Запустите тест подключения
node test-mongodb.js
```

### 3. Настройка Vercel

#### Шаг 1: Добавьте переменную окружения в Vercel
1. Перейдите в панель управления Vercel
2. Выберите ваш проект
3. Перейдите в **Settings** → **Environment Variables**
4. Добавьте новую переменную:
   - **Name**: `MONGODB_URI`
   - **Value**: ваша строка подключения MongoDB Atlas
   - **Environments**: выберите все (Production, Preview, Development)
5. Нажмите **Save**

#### Шаг 2: Повторное развертывание (не требуется)
Для serverless функций Vercel новые переменные окружения подхватываются автоматически при следующем холодном старте.

### 4. Проверка работы

#### Тест API
Перейдите по адресу: `https://your-vercel-app.vercel.app/api/health`

Успешный ответ:
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "message": "API is working on Vercel!",
  "database": "connected"
}
```

Ошибка подключения:
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "message": "API is working on Vercel!",
  "database": "disconnected",
  "dbError": "Error message here"
}
```

#### Проверка данных
- `GET /api/products` - должен вернуть реальные продукты из базы
- `GET /api/customer-orders` - должен вернуть реальные заказы

Если возвращается `"demo": true` в ответе, значит подключение к базе всё ещё не работает.

### 5. Решение типичных проблем

#### "Authentication failed"
- Проверьте имя пользователя и пароль в строке подключения
- Убедитесь что пользователь имеет права на чтение/запись
- Проверьте что не используете специальные символы в пароле без URL-кодирования

#### "Network timeout" или "ENOTFOUND"
- Добавьте 0.0.0.0/0 в Network Access для тестирования
- Проверьте что кластер запущен
- Проверьте правильность URL кластера

#### "serverSelectionTimeoutMS"
- Увеличены таймауты до 15 секунд (уже исправлено в коде)
- Проверьте стабильность интернет-соединения

### 6. Безопасность для продакшена

После успешного тестирования:
1. Удалите 0.0.0.0/0 из Network Access
2. Добавьте конкретные IP-диапазоны Vercel
3. Используйте сложные пароли
4. Регулярно ротируйте пароли

### Контакты для поддержки
Если проблемы продолжаются, проверьте логи в Vercel Dashboard → Functions → View Function Logs 