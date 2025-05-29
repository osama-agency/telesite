# Структура баз данных проекта TELESITE ANALYTICS

## 🗄️ Используемая СУБД
Проект использует **MongoDB** (NoSQL база данных) для хранения всех данных.

## 📊 Схемы данных и коллекции

### 1. 📦 Products (Товары)
Хранит информацию о всех товарах, импортированных из внешней системы.

**Поля:**
- `id` (Number) - уникальный ID товара
- `name` (String) - название товара
- `description` (String) - описание
- `price` (String) - цена продажи
- `stock_quantity` (Number) - количество на складе
- `ancestry` (String) - иерархия категорий
- `weight` (String) - вес
- `dosage_form` (String) - форма выпуска
- `package_quantity` (Number) - количество в упаковке
- `main_ingredient` (String) - основной ингредиент
- `brand` (String) - бренд
- `old_price` (String) - старая цена
- `costPriceTRY` (Number) - себестоимость в турецких лирах
- `created_at`, `updated_at`, `deleted_at` - временные метки

### 2. 🛒 Orders (Заказы с внешнего сайта)
Заказы, синхронизированные с внешней системой strattera.tgapp.online.

**Поля:**
- `id` (String) - уникальный ID заказа
- `status` (String) - статус: pending, paid, failed, shipped, delivered, cancelled, overdue
- `total_amount` (String) - общая сумма
- `bonus` (Number) - бонусы
- `bank_card` (String) - банковская карта
- `delivery_cost` (Number) - стоимость доставки
- `paid_at`, `shipped_at` - даты оплаты и отправки
- `user` (Object) - информация о пользователе:
  - `id`, `city`, `full_name`
- `order_items` (Array) - товары в заказе:
  - `quantity`, `price`, `name`

### 3. 👥 CustomerOrders (Заказы клиентов)
Локальные заказы клиентов, созданные в системе.

**Поля:**
- `id` (String) - уникальный ID
- `paymentDate` (String) - дата оплаты
- `customerId` (String) - ID клиента
- `customerName` (String) - имя клиента
- `address` (String) - адрес доставки
- `deliveryCost` (Number) - стоимость доставки
- `productName` (String) - название товара
- `quantity` (Number) - количество
- `price` (Number) - цена
- `status` (String) - статус заказа

### 4. 📥 Purchases (Закупки)
Информация о закупках товаров у поставщиков.

**Поля:**
- `date` (Date) - дата закупки
- `supplier` (String) - поставщик
- `liraRate` (Number) - курс лиры
- `items` (Array) - товары в закупке:
  - `productId` - ссылка на товар
  - `qty` - количество
  - `unitCostTRY` - цена за единицу в лирах
- `totalTRY` (Number) - общая сумма в лирах
- `estimatedDeliveryDays` (Number) - ожидаемые дни доставки
- `status` (String) - статус: pending, in_transit, delivered
- `deliveredItems` (Array) - оприходованные товары
- `deliveryExpenseRUB` (Number) - расходы на доставку в рублях
- `deliveredAt` (Date) - дата оприходования

### 5. 💸 Expenses (Расходы)
Учёт всех видов расходов компании.

**Поля:**
- `date` (Date) - дата расхода
- `type` (String) - тип: "Логистика", "Реклама", "ФОТ", "Прочее"
- `description` (String) - описание расхода
- `productId` (ObjectId) - связь с товаром (опционально)
- `amountRUB` (Number) - сумма в рублях

**Текущие данные (примеры):**
- ФОТ: 80,000 руб. (Зарплата менеджера)
- Логистика: 57,000 руб. (Доставки из Турции)
- Прочее: 35,000 руб. (Аренда офиса)
- Реклама: 25,000 руб. (Реклама в соцсетях)

### 6. 📊 InventoryMovements (Движения товаров)
Отслеживание всех движений товаров на складе.

**Поля:**
- `date` (Date) - дата движения
- `productId` (ObjectId) - ссылка на товар
- `changeQty` (Number) - изменение количества (+/-)
- `type` (String) - тип: purchase, sale, expense_adjustment
- `refId` (ObjectId) - ссылка на документ-основание
- `liraRate` (Number) - курс лиры (для закупок)

### 7. 📈 Analytics (Аналитические данные)
Предрассчитанные аналитические данные для быстрых отчетов.

#### 7.1 AnalyticsInventory (Аналитика остатков)
- `productId`, `productName` - товар
- `currentStock` - текущий остаток
- `reorderPoint` - точка заказа
- `lastUpdated` - последнее обновление

#### 7.2 AnalyticsPurchases (Аналитика закупок)
- `period` - период (YYYY-MM-DD)
- `totalTRY`, `totalRUB` - суммы в валютах
- `avgLiraRate` - средний курс
- `suppliersCount` - количество поставщиков
- `itemsCount` - количество позиций

#### 7.3 AnalyticsExpenses (Аналитика расходов)
- `period` - период
- `type` - тип расхода
- `totalAmount` - общая сумма
- `transactionsCount` - количество транзакций

#### 7.4 AnalyticsProfit (Аналитика прибыли)
- `period` - период
- `productId`, `productName` - товар (опционально)
- `revenue` - выручка
- `purchaseCost` - себестоимость
- `expenses` - расходы
- `grossProfit` - валовая прибыль
- `netProfit` - чистая прибыль
- `margin` - маржа

## 🔄 Синхронизация данных

1. **Товары** - синхронизируются с внешним API через `/products/sync`
2. **Заказы** - синхронизируются с внешним API через `/orders/sync`
3. **Аналитика** - обновляется по расписанию через SchedulerService:
   - Ежедневно: остатки товаров
   - Еженедельно: аналитика прибыли
   - При изменениях: движения товаров

## 📊 Текущая статистика

- **Товары**: синхронизированы из внешней системы
- **Заказы**: 989 заказов (shipped/processing)
- **Расходы**: 5 записей, общая сумма 197,000 руб.
- **Закупки**: данные о закупках из Турции
- **Аналитика**: автоматически обновляется планировщиком 