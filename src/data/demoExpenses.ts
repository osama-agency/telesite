export interface DemoExpense {
  id: string;
  date: string;
  type: 'Логистика' | 'Реклама' | 'ФОТ' | 'Прочее' | 'Закупка товара';
  description: string;
  amount: number;
  amountRUB: number;
  productId?: string;
  productName?: string;
  createdAt: string;
  purchaseItems?: Array<{
    productName: string;
    quantity: number;
    unitCostTRY: number;
  }>;
}

// Функция для генерации реалистичных демо данных
export const generateDemoExpenses = (): DemoExpense[] => {
  const expenses: DemoExpense[] = [];
  const today = new Date();

  // Типы расходов с примерами описаний
  const expenseExamples = {
    'Логистика': [
      'Доставка товаров из Турции',
      'Упаковочные материалы',
      'Таможенные сборы',
      'Курьерская доставка клиентам',
      'Аренда склада',
      'Топливо для доставки'
    ],
    'Реклама': [
      'Реклама в Instagram',
      'Google Ads кампания',
      'Продвижение ВКонтакте',
      'Контекстная реклама Яндекс',
      'Блогер-реклама',
      'Печатные материалы'
    ],
    'ФОТ': [
      'Зарплата менеджера',
      'Зарплата курьера',
      'Бонусы сотрудникам',
      'Социальные взносы',
      'Премия за месяц',
      'Компенсация расходов'
    ],
    'Закупка товара': [
      'Закупка косметики Турция',
      'Заказ товаров у поставщика',
      'Дополнительная партия хит-товаров',
      'Новая коллекция осень-зима',
      'Образцы новых товаров',
      'Срочный довоз популярных позиций'
    ],
    'Прочее': [
      'Канцелярские товары',
      'Интернет и связь',
      'Банковские комиссии',
      'Ремонт оборудования',
      'Программное обеспечение',
      'Консультации юриста'
    ]
  };

  // Продукты для примера
  const sampleProducts = [
    'Крем для лица Anti-Age',
    'Сыворотка с витамином C',
    'Маска увлажняющая',
    'Тональный крем',
    'Губная помада',
    'Палетка теней',
    'Консилер',
    'Румяна компактные'
  ];

  // Генерируем расходы за последние 60 дней
  for (let i = 59; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Случайное количество расходов в день (1-4)
    const expensesPerDay = Math.floor(Math.random() * 4) + 1;
    
    for (let j = 0; j < expensesPerDay; j++) {
      const types = Object.keys(expenseExamples) as Array<keyof typeof expenseExamples>;
      const randomType = types[Math.floor(Math.random() * types.length)];
      const descriptions = expenseExamples[randomType];
      const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
      
      // Реалистичные суммы по типам расходов
      let amount = 0;
      switch (randomType) {
        case 'Логистика':
          amount = Math.floor(Math.random() * 25000) + 3000; // 3-28к
          break;
        case 'Реклама':
          amount = Math.floor(Math.random() * 40000) + 5000; // 5-45к
          break;
        case 'ФОТ':
          amount = Math.floor(Math.random() * 60000) + 20000; // 20-80к
          break;
        case 'Закупка товара':
          amount = Math.floor(Math.random() * 100000) + 15000; // 15-115к
          break;
        case 'Прочее':
          amount = Math.floor(Math.random() * 15000) + 1000; // 1-16к
          break;
      }

      // Для закупки товаров создаем детали
      let purchaseItems = undefined;
      let productName = undefined;
      
      if (randomType === 'Закупка товара' && Math.random() > 0.3) {
        const itemCount = Math.floor(Math.random() * 5) + 1;
        purchaseItems = [];
        
        for (let k = 0; k < itemCount; k++) {
          const product = sampleProducts[Math.floor(Math.random() * sampleProducts.length)];
          const quantity = Math.floor(Math.random() * 20) + 5;
          const unitCost = Math.floor(Math.random() * 800) + 200; // 200-1000 TRY
          
          purchaseItems.push({
            productName: product,
            quantity,
            unitCostTRY: unitCost
          });
        }
        
        productName = purchaseItems[0].productName;
      }

      const expense: DemoExpense = {
        id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: date.toISOString().split('T')[0],
        type: randomType,
        description: randomDescription,
        amount: amount,
        amountRUB: amount,
        productName,
        purchaseItems,
        createdAt: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString()
      };

      expenses.push(expense);
    }
  }

  // Сортируем по дате (новые сначала)
  return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Статичные демо данные для более стабильного отображения
export const demoExpenses: DemoExpense[] = [
  {
    id: 'demo-1',
    date: '2024-12-29',
    type: 'Реклама',
    description: 'Реклама в Instagram - продвижение новых товаров',
    amount: 15000,
    amountRUB: 15000,
    createdAt: '2024-12-29T10:30:00Z'
  },
  {
    id: 'demo-2',
    date: '2024-12-29',
    type: 'Логистика',
    description: 'Доставка товаров клиентам по Москве',
    amount: 7500,
    amountRUB: 7500,
    createdAt: '2024-12-29T14:15:00Z'
  },
  {
    id: 'demo-3',
    date: '2024-12-28',
    type: 'Закупка товара',
    description: 'Закупка косметики у турецкого поставщика',
    amount: 85000,
    amountRUB: 85000,
    productName: 'Крем для лица Anti-Age',
    purchaseItems: [
      { productName: 'Крем для лица Anti-Age', quantity: 50, unitCostTRY: 450 },
      { productName: 'Сыворотка с витамином C', quantity: 30, unitCostTRY: 380 },
      { productName: 'Маска увлажняющая', quantity: 25, unitCostTRY: 320 }
    ],
    createdAt: '2024-12-28T09:00:00Z'
  },
  {
    id: 'demo-4',
    date: '2024-12-28',
    type: 'ФОТ',
    description: 'Зарплата менеджера по продажам',
    amount: 45000,
    amountRUB: 45000,
    createdAt: '2024-12-28T12:00:00Z'
  },
  {
    id: 'demo-5',
    date: '2024-12-27',
    type: 'Реклама',
    description: 'Google Ads кампания - таргетированная реклама',
    amount: 22000,
    amountRUB: 22000,
    createdAt: '2024-12-27T16:20:00Z'
  },
  {
    id: 'demo-6',
    date: '2024-12-27',
    type: 'Прочее',
    description: 'Банковские комиссии за переводы',
    amount: 3500,
    amountRUB: 3500,
    createdAt: '2024-12-27T11:45:00Z'
  },
  {
    id: 'demo-7',
    date: '2024-12-26',
    type: 'Логистика',
    description: 'Таможенные сборы за партию товаров',
    amount: 12000,
    amountRUB: 12000,
    createdAt: '2024-12-26T08:30:00Z'
  },
  {
    id: 'demo-8',
    date: '2024-12-26',
    type: 'Закупка товара',
    description: 'Срочный довоз популярных позиций',
    amount: 42000,
    amountRUB: 42000,
    productName: 'Тональный крем',
    purchaseItems: [
      { productName: 'Тональный крем', quantity: 40, unitCostTRY: 520 },
      { productName: 'Консилер', quantity: 35, unitCostTRY: 280 }
    ],
    createdAt: '2024-12-26T13:15:00Z'
  },
  {
    id: 'demo-9',
    date: '2024-12-25',
    type: 'ФОТ',
    description: 'Новогодние бонусы сотрудникам',
    amount: 60000,
    amountRUB: 60000,
    createdAt: '2024-12-25T15:00:00Z'
  },
  {
    id: 'demo-10',
    date: '2024-12-25',
    type: 'Реклама',
    description: 'Новогодняя рекламная кампания ВКонтакте',
    amount: 18000,
    amountRUB: 18000,
    createdAt: '2024-12-25T10:00:00Z'
  }
]; 