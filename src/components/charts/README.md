# Animated Chart Components

A collection of modern, animated, and accessible chart components built with React, Recharts, Framer Motion, and Tailwind CSS.

## Features

- 🎨 **Consistent Design Language** - All charts follow your Tailwind theme
- ✨ **Smooth Animations** - Initial render animations and data transitions
- 🎯 **Interactive** - Hover tooltips, clickable legends, and visual feedback
- 📱 **Responsive** - Charts resize fluidly on all screen sizes
- ♿ **Accessible** - Keyboard navigation and respects `prefers-reduced-motion`
- 🔧 **Customizable** - Flexible props for complete control

## Components

### ChartWrapper

A container component that provides consistent styling, loading states, and error handling.

```tsx
import { ChartWrapper } from '@/components/charts';

<ChartWrapper
  title="Chart Title"
  subtitle="Chart description"
  icon={<IconComponent />}
  loading={false}
  error={null}
  delay={0.2}
>
  {/* Your chart component */}
</ChartWrapper>
```

### AnimatedLineChart

Displays line charts with smooth draw-in animations and interactive legends.

```tsx
import { AnimatedLineChart } from '@/components/charts';

<AnimatedLineChart
  data={[
    { month: 'Jan', sales: 1000, orders: 500 },
    { month: 'Feb', sales: 1200, orders: 600 }
  ]}
  lines={[
    {
      dataKey: 'sales',
      stroke: '#3B82F6',
      name: 'Sales',
      strokeWidth: 3
    },
    {
      dataKey: 'orders',
      stroke: '#8B5CF6',
      name: 'Orders',
      strokeWidth: 3
    }
  ]}
  xDataKey="month"
  height={300}
  showGrid={true}
  showLegend={true}
  animationDuration={1500}
  formatTooltip={(value) => `$${value.toLocaleString()}`}
  formatYAxis={(value) => `$${value}`}
/>
```

### AnimatedAreaChart

Creates area charts with gradient fills and hover effects.

```tsx
import { AnimatedAreaChart } from '@/components/charts';

<AnimatedAreaChart
  data={data}
  areas={[
    {
      dataKey: 'revenue',
      stroke: '#10B981',
      fill: 'url(#colorRevenue)',
      name: 'Revenue'
    }
  ]}
  xDataKey="date"
  gradients={[
    {
      id: 'colorRevenue',
      startColor: '#10B981',
      endColor: '#10B981',
      startOpacity: 0.8,
      endOpacity: 0.1
    }
  ]}
  height={300}
/>
```

### AnimatedBarChart

Displays bar charts with staggered animations and hover effects.

```tsx
import { AnimatedBarChart } from '@/components/charts';

<AnimatedBarChart
  data={data}
  bars={[
    {
      dataKey: 'sales',
      fill: '#F59E0B',
      name: 'Sales',
      radius: [4, 4, 0, 0]
    }
  ]}
  xDataKey="product"
  layout="vertical" // or "horizontal"
  height={300}
  animationDuration={800}
  staggerDelay={50}
/>
```

### AnimatedPieChart

Creates pie/donut charts with segment animations and interactive legends.

```tsx
import { AnimatedPieChart } from '@/components/charts';

<AnimatedPieChart
  data={[
    { name: 'Desktop', value: 400 },
    { name: 'Mobile', value: 300 }
  ]}
  dataKey="value"
  nameKey="name"
  height={400}
  innerRadius={0} // Set > 0 for donut chart
  outerRadius={120}
  colors={['#3B82F6', '#8B5CF6', '#10B981']}
  showLabel={true}
  showLegend={true}
  formatLabel={(value, percentage) => `${percentage}%`}
/>
```

## Props Reference

### Common Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `height` | `number` | `300` | Chart height in pixels |
| `animationDuration` | `number` | Varies | Animation duration in milliseconds |
| `formatTooltip` | `function` | - | Custom tooltip formatter |

### ChartWrapper Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Chart title |
| `subtitle` | `string` | - | Chart subtitle |
| `icon` | `ReactNode` | - | Icon component |
| `loading` | `boolean` | `false` | Loading state |
| `error` | `string \| null` | `null` | Error message |
| `delay` | `number` | `0` | Animation delay |

### AnimatedLineChart Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `array` | Required | Chart data |
| `lines` | `array` | Required | Line configurations |
| `xDataKey` | `string` | Required | X-axis data key |
| `showGrid` | `boolean` | `true` | Show grid lines |
| `showLegend` | `boolean` | `true` | Show legend |
| `formatXAxis` | `function` | - | X-axis formatter |
| `formatYAxis` | `function` | - | Y-axis formatter |

### AnimatedAreaChart Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `array` | Required | Chart data |
| `areas` | `array` | Required | Area configurations |
| `xDataKey` | `string` | Required | X-axis data key |
| `gradients` | `array` | `[]` | Gradient definitions |
| `showGrid` | `boolean` | `true` | Show grid lines |
| `showLegend` | `boolean` | `true` | Show legend |

### AnimatedBarChart Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `array` | Required | Chart data |
| `bars` | `array` | Required | Bar configurations |
| `xDataKey` | `string` | Required | X-axis data key |
| `layout` | `'vertical' \| 'horizontal'` | `'vertical'` | Chart layout |
| `maxBarSize` | `number` | `60` | Maximum bar width |
| `staggerDelay` | `number` | `50` | Animation stagger delay |

### AnimatedPieChart Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `array` | Required | Chart data |
| `dataKey` | `string` | Required | Value data key |
| `nameKey` | `string` | Required | Name data key |
| `colors` | `array` | Default palette | Color array |
| `innerRadius` | `number` | `0` | Inner radius (donut) |
| `outerRadius` | `number` | `120` | Outer radius |
| `showLabel` | `boolean` | `true` | Show value labels |
| `showLegend` | `boolean` | `true` | Show legend |
| `formatLabel` | `function` | - | Label formatter |

## Accessibility

All chart components support:

- **Keyboard Navigation**: Navigate through chart elements using Tab and Arrow keys
- **Screen Readers**: Proper ARIA labels and descriptions
- **Reduced Motion**: Respects `prefers-reduced-motion` system preference
- **Focus Indicators**: Clear focus states for interactive elements

## Performance Tips

1. **Data Optimization**: Keep data arrays reasonable in size (< 1000 points)
2. **Animation Control**: Disable animations for large datasets
3. **Responsive Sizing**: Use percentage-based widths instead of fixed pixels
4. **Memoization**: Use `React.memo` or `useMemo` for data transformations

## Examples

### Revenue Dashboard

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <ChartWrapper title="Monthly Revenue">
    <AnimatedAreaChart
      data={revenueData}
      areas={[
        { dataKey: 'revenue', stroke: '#3B82F6', fill: 'url(#revenue)' }
      ]}
      xDataKey="month"
    />
  </ChartWrapper>
  
  <ChartWrapper title="Sales by Category">
    <AnimatedPieChart
      data={categoryData}
      dataKey="sales"
      nameKey="category"
    />
  </ChartWrapper>
</div>
```

### Performance Metrics

```tsx
<ChartWrapper 
  title="Performance Over Time"
  loading={isLoading}
  error={error}
>
  <AnimatedLineChart
    data={performanceData}
    lines={[
      { dataKey: 'cpu', stroke: '#EF4444', name: 'CPU Usage' },
      { dataKey: 'memory', stroke: '#3B82F6', name: 'Memory Usage' }
    ]}
    xDataKey="time"
    formatYAxis={(value) => `${value}%`}
  />
</ChartWrapper>
```

## Customization

### Custom Colors

```tsx
const customColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'];

<AnimatedPieChart
  data={data}
  colors={customColors}
  // ... other props
/>
```

### Custom Tooltips

```tsx
const formatTooltip = (value: number, name: string) => {
  if (name === 'Revenue') return `$${value.toLocaleString()}`;
  if (name === 'Users') return `${value} users`;
  return value.toString();
};

<AnimatedLineChart
  formatTooltip={formatTooltip}
  // ... other props
/>
```

### Theme Integration

All components automatically adapt to your Tailwind theme:

```css
/* Colors from CSS variables */
--primary: 262.1 83.3% 57.8%;
--border: 214.3 31.8% 91.4%;
--muted-foreground: 215.4 16.3% 46.9%;
```

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (with -webkit prefixes)
- Mobile browsers: Optimized touch interactions

## License

MIT 