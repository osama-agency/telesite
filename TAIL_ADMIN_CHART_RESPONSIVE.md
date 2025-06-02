# TailAdminChart - Адаптивный график в стиле Tail Admin Pro

## Описание

`TailAdminChart` - это полностью адаптивный компонент графика, созданный на основе ApexCharts и стилизованный в соответствии с дизайном Tail Admin Pro LineChartThree.

## Особенности

### 🎨 Дизайн
- Цвет графика: `#465FFF` (как в оригинальном Tail Admin Pro)
- Плавные градиенты и анимации
- Современный дизайн tooltip'ов
- Скрытые оси и рамки для чистого вида

### 📱 Адаптивность

#### Мобильные устройства (< 768px)
- **Высота**: Уменьшена до 70% от исходной (макс. 250px)
- **Подписи осей**: Повернуты на -45° для экономии места
- **Формат дат**: Краткий формат (DD.MM)
- **Значения**: Компактное отображение (1.2М вместо 1,200,000)
- **Stroke**: Уменьшен до 1.5px
- **Grid**: Скрыты горизонтальные линии

#### Планшеты (768px - 1024px)
- **Высота**: 85% от исходной (макс. 300px)
- **Tick amount**: 6 точек на оси X
- **Размер шрифта**: 11px
- **Stroke**: 2px

#### Десктоп (> 1024px)
- **Высота**: Полная исходная высота
- **Tick amount**: 10 точек на оси X
- **Размер шрифта**: 12px
- **Stroke**: 2px

### 🔧 Responsive Breakpoints

```javascript
responsive: [
  {
    breakpoint: 480,  // Экстра маленькие экраны
    options: {
      chart: { height: Math.min(height * 0.6, 220) },
      xaxis: { tickAmount: 3 },
      // Повернутые подписи и меньший шрифт
    }
  },
  {
    breakpoint: 768,  // Мобильные устройства
    options: {
      chart: { height: Math.min(height * 0.75, 280) },
      xaxis: { tickAmount: 5 },
    }
  },
  {
    breakpoint: 1024, // Планшеты
    options: {
      chart: { height: Math.min(height * 0.9, 320) },
      xaxis: { tickAmount: 8 },
    }
  }
]
```

## Использование

```tsx
import { TailAdminChart } from '../components/charts';

<TailAdminChart
  data={revenueChartData}
  height={350}
  keys={['revenue']}
  index="date"
  colors={['#465FFF']}
  legends={['Выручка']}
/>
```

## Параметры

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `data` | `any[]` | обязательный | Массив данных для графика |
| `height` | `number` | `335` | Базовая высота графика |
| `keys` | `string[]` | `['revenue']` | Ключи данных для отображения |
| `index` | `string` | `'date'` | Ключ для оси X (обычно дата) |
| `colors` | `string[]` | `['#465FFF']` | Цвета линий графика |
| `legends` | `string[]` | `['Выручка']` | Подписи для легенды |

## Технические детали

### Автоматическое определение размера экрана
Компонент использует `useState` и `useEffect` для отслеживания изменений размера окна:

```tsx
const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

useEffect(() => {
  const updateScreenSize = () => {
    const width = window.innerWidth;
    if (width < 768) setScreenSize('mobile');
    else if (width < 1024) setScreenSize('tablet');
    else setScreenSize('desktop');
  };
  
  updateScreenSize();
  window.addEventListener('resize', updateScreenSize);
  return () => window.removeEventListener('resize', updateScreenSize);
}, []);
```

### Динамические настройки
Все настройки графика вычисляются динамически на основе размера экрана:

```tsx
const getResponsiveSettings = () => {
  switch (screenSize) {
    case 'mobile': return { height: Math.min(height * 0.7, 250), ... };
    case 'tablet': return { height: Math.min(height * 0.85, 300), ... };
    default: return { height: height, ... };
  }
};
```

## Совместимость

- ✅ React 18+
- ✅ ApexCharts 3+
- ✅ Tailwind CSS
- ✅ TypeScript
- ✅ Все современные браузеры
- ✅ Мобильные устройства iOS/Android

## Примеры адаптации

### Мобильная версия
- Компактные tooltip'ы
- Повернутые подписи дат
- Убранные лишние элементы UI
- Оптимизированная высота

### Планшетная версия
- Средний размер элементов
- Сбалансированное количество точек на осях
- Комфортная высота для просмотра

### Десктопная версия
- Полный функционал
- Максимальная детализация
- Лучший пользовательский опыт

## Интеграция с проектом

График автоматически адаптируется к существующей системе breakpoint'ов проекта и использует:

- `useResponsive` hook для определения устройства
- Tailwind CSS классы для стилизации
- Framer Motion для анимаций (в wrapper'е)
- Существующую цветовую схему проекта 