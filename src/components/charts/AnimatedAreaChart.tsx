import React from 'react';
import { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';

export interface AnimatedAreaChartProps {
  data: any[];
  height: number;
  keys: string[];
  index: string;
  colors: string[];
  legends: string[];
}

export function AnimatedAreaChart({ data, height, keys, index, colors, legends }: AnimatedAreaChartProps) {
  // Преобразуем данные в формат для ApexCharts
  const transformedData = data.map(item => ({
    ...item,
    x: new Date(item[index]).getTime() // Преобразуем дату в timestamp
  }));

  const options: ApexOptions = {
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
    },
    colors: colors,
    chart: {
      fontFamily: "Inter, sans-serif",
      height: height,
      type: "area",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      background: 'transparent',
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    stroke: {
      curve: "smooth",
      width: 2,
      lineCap: 'round'
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 0,
      hover: {
        size: 6,
        sizeOffset: 3
      }
    },
    xaxis: {
      type: "datetime",
      tickAmount: 6,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: '#64748B',
          fontSize: '12px',
          fontWeight: 400,
        },
        formatter: function(value: any) {
          return new Date(value).toLocaleDateString('ru-RU', { 
            month: 'short', 
            day: 'numeric' 
          });
        }
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      title: {
        text: "",
        style: {
          fontSize: "0px",
        },
      },
      labels: {
        style: {
          colors: '#64748B',
          fontSize: '12px',
          fontWeight: 400,
        },
        formatter: function(value: number) {
          return (value / 1000).toFixed(0) + 'к';
        }
      },
    },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      theme: 'light',
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif'
      },
      x: {
        format: "dd MMM yyyy",
      },
      y: {
        formatter: function(value: number, { seriesIndex }: any) {
          return new Intl.NumberFormat('ru-RU', { 
            style: 'currency', 
            currency: 'RUB',
            minimumFractionDigits: 0
          }).format(value);
        }
      },
      custom: function({ series, seriesIndex, dataPointIndex, w }: any) {
        const date = new Date(w.globals.seriesX[seriesIndex][dataPointIndex]);
        const formattedDate = date.toLocaleDateString('ru-RU', { 
          year: 'numeric',
          month: 'long', 
          day: 'numeric' 
        });
        
        let tooltipContent = `<div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
          <p class="text-sm font-semibold text-slate-900 dark:text-white mb-2">${formattedDate}</p>`;
        
        series.forEach((seriesData: any, index: number) => {
          const value = seriesData[dataPointIndex];
          const color = colors[index];
          const legend = legends[index];
          
          tooltipContent += `
            <div class="flex items-center justify-between gap-4 text-xs mb-1">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full" style="background-color: ${color}"></div>
                <span class="text-slate-600 dark:text-slate-400">${legend}:</span>
              </div>
              <span class="font-medium text-slate-900 dark:text-white">
                ${new Intl.NumberFormat('ru-RU', { 
                  style: 'currency', 
                  currency: 'RUB',
                  minimumFractionDigits: 0
                }).format(value)}
              </span>
            </div>`;
        });
        
        tooltipContent += '</div>';
        return tooltipContent;
      }
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.6,
        opacityTo: 0.1,
        stops: [0, 90, 100],
        colorStops: colors.map(color => [
          {
            offset: 0,
            color: color,
            opacity: 0.6
          },
          {
            offset: 100,
            color: color,
            opacity: 0.1
          }
        ]).flat()
      },
    },
    grid: {
      show: true,
      borderColor: '#E5E7EB',
      strokeDashArray: 0,
      position: 'back',
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      row: {
        colors: undefined,
        opacity: 0.5
      },
      column: {
        colors: undefined,
        opacity: 0.5
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: height * 0.8,
          },
          xaxis: {
            tickAmount: 4,
          }
        }
      }
    ]
  };

  // Создаем серии данных для ApexCharts
  const series = keys.map((key, index) => ({
    name: legends[index],
    data: transformedData.map(item => ({
      x: item.x,
      y: item[key] || 0
    }))
  }));

  return (
    <div className="max-w-full overflow-x-auto">
      <div className="min-w-[600px] md:min-w-full">
        <Chart 
          options={options} 
          series={series} 
          type="area" 
          height={height} 
        />
      </div>
    </div>
  );
} 