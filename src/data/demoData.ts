// Demo data for testing without API connection

export const demoProducts = [
  {
    id: '1',
    name: 'iPhone 14 Pro Max 256GB',
    costPriceTRY: 45000,
    retailPriceRUB: 89900,
    wholesalePriceRUB: 84900,
    barcode: '194252430620',
    quantity: 25,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z'
  },
  {
    id: '2',
    name: 'Samsung Galaxy S23 Ultra 512GB',
    costPriceTRY: 42000,
    retailPriceRUB: 84900,
    wholesalePriceRUB: 79900,
    barcode: '888744052133',
    quantity: 18,
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-22T14:20:00Z'
  },
  {
    id: '3',
    name: 'iPhone 15 Pro 128GB',
    costPriceTRY: 48000,
    retailPriceRUB: 94900,
    wholesalePriceRUB: 89900,
    barcode: '194252652428',
    quantity: 22,
    createdAt: '2024-01-12T11:30:00Z',
    updatedAt: '2024-01-23T16:45:00Z'
  },
  {
    id: '4',
    name: 'Google Pixel 8 Pro 256GB',
    costPriceTRY: 35000,
    retailPriceRUB: 74900,
    wholesalePriceRUB: 69900,
    barcode: '842776133212',
    quantity: 15,
    createdAt: '2024-01-08T08:15:00Z',
    updatedAt: '2024-01-19T12:00:00Z'
  },
  {
    id: '5',
    name: 'OnePlus 11 256GB',
    costPriceTRY: 28000,
    retailPriceRUB: 59900,
    wholesalePriceRUB: 54900,
    barcode: '619876543210',
    quantity: 30,
    createdAt: '2024-01-14T13:45:00Z',
    updatedAt: '2024-01-21T10:30:00Z'
  },
  {
    id: '6',
    name: 'Xiaomi 13 Pro 512GB',
    costPriceTRY: 32000,
    retailPriceRUB: 64900,
    wholesalePriceRUB: 59900,
    barcode: '692134567890',
    quantity: 28,
    createdAt: '2024-01-11T09:20:00Z',
    updatedAt: '2024-01-22T11:15:00Z'
  },
  {
    id: '7',
    name: 'iPhone 14 128GB',
    costPriceTRY: 35000,
    retailPriceRUB: 69900,
    wholesalePriceRUB: 64900,
    barcode: '194252651234',
    quantity: 35,
    createdAt: '2024-01-09T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: '8',
    name: 'Samsung Galaxy Z Fold5 512GB',
    costPriceTRY: 65000,
    retailPriceRUB: 139900,
    wholesalePriceRUB: 129900,
    barcode: '888744123456',
    quantity: 8,
    createdAt: '2024-01-13T15:00:00Z',
    updatedAt: '2024-01-21T17:20:00Z'
  },
  {
    id: '9',
    name: 'Nothing Phone (2) 256GB',
    costPriceTRY: 25000,
    retailPriceRUB: 54900,
    wholesalePriceRUB: 49900,
    barcode: '752398461234',
    quantity: 20,
    createdAt: '2024-01-16T08:30:00Z',
    updatedAt: '2024-01-23T09:45:00Z'
  },
  {
    id: '10',
    name: 'OPPO Find X6 Pro 256GB',
    costPriceTRY: 38000,
    retailPriceRUB: 79900,
    wholesalePriceRUB: 74900,
    barcode: '695847123654',
    quantity: 12,
    createdAt: '2024-01-07T11:00:00Z',
    updatedAt: '2024-01-18T13:30:00Z'
  },
  {
    id: '11',
    name: 'Realme GT3 256GB',
    costPriceTRY: 22000,
    retailPriceRUB: 44900,
    wholesalePriceRUB: 39900,
    barcode: '625489731254',
    quantity: 40,
    createdAt: '2024-01-06T09:15:00Z',
    updatedAt: '2024-01-17T10:20:00Z'
  },
  {
    id: '12',
    name: 'iPhone 13 256GB',
    costPriceTRY: 30000,
    retailPriceRUB: 64900,
    wholesalePriceRUB: 59900,
    barcode: '194252098765',
    quantity: 45,
    createdAt: '2024-01-05T14:00:00Z',
    updatedAt: '2024-01-19T15:45:00Z'
  }
];

export const demoOrders = [
  {
    id: '1001',
    customerName: 'Иван Петров',
    orderDate: '2024-01-23',
    status: 'shipped',
    totalAmount: 154800,
    createdAt: '2024-01-23T09:00:00Z',
    updatedAt: '2024-01-23T15:30:00Z',
    products: [
      { name: 'iPhone 14 Pro Max 256GB', quantity: 1, price: 89900 },
      { name: 'iPhone 13 256GB', quantity: 1, price: 64900 }
    ]
  },
  {
    id: '1002',
    customerName: 'ООО "МобилТрейд"',
    orderDate: '2024-01-22',
    status: 'processing',
    totalAmount: 849000,
    createdAt: '2024-01-22T11:20:00Z',
    updatedAt: '2024-01-22T11:20:00Z',
    products: [
      { name: 'Samsung Galaxy S23 Ultra 512GB', quantity: 10, price: 84900 }
    ]
  },
  {
    id: '1003',
    customerName: 'Анна Сидорова',
    orderDate: '2024-01-21',
    status: 'delivered',
    totalAmount: 94900,
    createdAt: '2024-01-21T14:00:00Z',
    updatedAt: '2024-01-22T10:15:00Z',
    products: [
      { name: 'iPhone 15 Pro 128GB', quantity: 1, price: 94900 }
    ]
  },
  {
    id: '1004',
    customerName: 'ИП Козлов С.А.',
    orderDate: '2024-01-20',
    status: 'shipped',
    totalAmount: 374500,
    createdAt: '2024-01-20T16:45:00Z',
    updatedAt: '2024-01-23T09:30:00Z',
    products: [
      { name: 'Google Pixel 8 Pro 256GB', quantity: 5, price: 74900 }
    ]
  },
  {
    id: '1005',
    customerName: 'Мария Иванова',
    orderDate: '2024-01-19',
    status: 'processing',
    totalAmount: 139900,
    createdAt: '2024-01-19T10:30:00Z',
    updatedAt: '2024-01-19T10:30:00Z',
    products: [
      { name: 'Samsung Galaxy Z Fold5 512GB', quantity: 1, price: 139900 }
    ]
  },
  {
    id: '1006',
    customerName: 'ООО "ТехноПарк"',
    orderDate: '2024-01-18',
    status: 'delivered',
    totalAmount: 549000,
    createdAt: '2024-01-18T12:00:00Z',
    updatedAt: '2024-01-20T14:20:00Z',
    products: [
      { name: 'OnePlus 11 256GB', quantity: 10, price: 54900 }
    ]
  },
  {
    id: '1007',
    customerName: 'Алексей Новиков',
    orderDate: '2024-01-17',
    status: 'shipped',
    totalAmount: 209700,
    createdAt: '2024-01-17T09:15:00Z',
    updatedAt: '2024-01-18T11:30:00Z',
    products: [
      { name: 'iPhone 14 128GB', quantity: 3, price: 69900 }
    ]
  },
  {
    id: '1008',
    customerName: 'ИП Смирнова Е.В.',
    orderDate: '2024-01-16',
    status: 'delivered',
    totalAmount: 599000,
    createdAt: '2024-01-16T13:45:00Z',
    updatedAt: '2024-01-17T16:00:00Z',
    products: [
      { name: 'Xiaomi 13 Pro 512GB', quantity: 10, price: 59900 }
    ]
  }
];

export const demoPurchases = [
  {
    id: 'p1',
    date: '2024-01-15',
    supplier: 'TechWorld Turkey',
    liraRate: 3.2,
    estimatedDeliveryDays: 7,
    status: 'delivered',
    totalTRY: 450000,
    items: [
      { productId: '1', productName: 'iPhone 14 Pro Max 256GB', qty: 10, unitCostTRY: 45000 }
    ],
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-22T14:00:00Z'
  },
  {
    id: 'p2',
    date: '2024-01-10',
    supplier: 'Digital Bazaar Istanbul',
    liraRate: 3.15,
    estimatedDeliveryDays: 10,
    status: 'in_transit',
    totalTRY: 560000,
    items: [
      { productId: '2', productName: 'Samsung Galaxy S23 Ultra 512GB', qty: 10, unitCostTRY: 42000 },
      { productId: '5', productName: 'OnePlus 11 256GB', qty: 5, unitCostTRY: 28000 }
    ],
    createdAt: '2024-01-10T09:30:00Z',
    updatedAt: '2024-01-10T09:30:00Z'
  },
  {
    id: 'p3',
    date: '2024-01-08',
    supplier: 'Mobile Hub Ankara',
    liraRate: 3.18,
    estimatedDeliveryDays: 5,
    status: 'delivered',
    totalTRY: 320000,
    items: [
      { productId: '6', productName: 'Xiaomi 13 Pro 512GB', qty: 10, unitCostTRY: 32000 }
    ],
    createdAt: '2024-01-08T14:20:00Z',
    updatedAt: '2024-01-13T10:00:00Z'
  }
];

export const demoExpenses = [
  {
    id: 'e1',
    date: '2024-01-22',
    type: 'Закупка товара',
    description: 'Закупка iPhone 14 Pro Max у поставщика TechWorld Turkey',
    amount: 1440000,
    createdAt: '2024-01-22T10:00:00Z',
    updatedAt: '2024-01-22T10:00:00Z'
  },
  {
    id: 'e2',
    date: '2024-01-20',
    type: 'Логистика',
    description: 'Доставка груза из Турции (авиа)',
    amount: 85000,
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: 'e3',
    date: '2024-01-18',
    type: 'Аренда',
    description: 'Аренда склада и офиса за январь',
    amount: 180000,
    createdAt: '2024-01-18T09:00:00Z',
    updatedAt: '2024-01-18T09:00:00Z'
  },
  {
    id: 'e4',
    date: '2024-01-15',
    type: 'Зарплата',
    description: 'Зарплата сотрудников за первую половину января',
    amount: 450000,
    createdAt: '2024-01-15T17:00:00Z',
    updatedAt: '2024-01-15T17:00:00Z'
  },
  {
    id: 'e5',
    date: '2024-01-12',
    type: 'Реклама',
    description: 'Реклама в Яндекс.Директ и Google Ads',
    amount: 120000,
    createdAt: '2024-01-12T11:30:00Z',
    updatedAt: '2024-01-12T11:30:00Z'
  },
  {
    id: 'e6',
    date: '2024-01-10',
    type: 'Прочее',
    description: 'Канцелярия, хозтовары, интернет',
    amount: 25000,
    createdAt: '2024-01-10T16:00:00Z',
    updatedAt: '2024-01-10T16:00:00Z'
  }
];

export const demoAnalytics = {
  summary: {
    totalRevenue: 3285100,
    totalExpenses: 2300000,
    netProfit: 985100,
    totalOrders: 45,
    averageOrderValue: 73002,
    topProducts: [
      { name: 'iPhone 14 Pro Max 256GB', revenue: 719200, quantity: 8 },
      { name: 'Samsung Galaxy S23 Ultra 512GB', revenue: 594300, quantity: 7 },
      { name: 'iPhone 15 Pro 128GB', revenue: 474500, quantity: 5 },
      { name: 'Xiaomi 13 Pro 512GB', revenue: 389350, quantity: 6 },
      { name: 'OnePlus 11 256GB', revenue: 329400, quantity: 6 }
    ],
    topCustomers: [
      { name: 'ООО "МобилТрейд"', totalSpent: 849000, orders: 3 },
      { name: 'ИП Смирнова Е.В.', totalSpent: 599000, orders: 2 },
      { name: 'ООО "ТехноПарк"', totalSpent: 549000, orders: 2 },
      { name: 'ИП Козлов С.А.', totalSpent: 374500, orders: 1 },
      { name: 'Алексей Новиков', totalSpent: 209700, orders: 2 }
    ]
  },
  charts: {
    dailyRevenue: [
      { date: '2024-01-17', revenue: 325000 },
      { date: '2024-01-18', revenue: 438000 },
      { date: '2024-01-19', revenue: 289000 },
      { date: '2024-01-20', revenue: 512000 },
      { date: '2024-01-21', revenue: 478000 },
      { date: '2024-01-22', revenue: 695000 },
      { date: '2024-01-23', revenue: 548100 }
    ],
    categoryBreakdown: [
      { category: 'Флагманы Apple', revenue: 1667700, percentage: 51 },
      { category: 'Флагманы Samsung', revenue: 818900, percentage: 25 },
      { category: 'Средний сегмент', revenue: 658750, percentage: 20 },
      { category: 'Бюджетные смартфоны', revenue: 139750, percentage: 4 }
    ]
  }
};

// Функция для имитации задержки API
export const simulateDelay = (ms: number = 300) => 
  new Promise(resolve => setTimeout(resolve, ms)); 