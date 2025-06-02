import React, { useEffect, useState } from 'react';
import { ApexOptions } from 'apexcharts';
import Chart from 'react-apexcharts';

export interface TailAdminChartProps {
  data: any[];
  height?: number;
  keys?: string[];
  index?: string;
  colors?: string[];
  legends?: string[];
}

export function TailAdminChart({ 
  data, 
  height = 335, 
  keys = ['revenue'], 
  index = 'date',
  colors = ["#465FFF"],
  legends = ['Выручка']
}: TailAdminChartProps) {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  // Определяем размер экрана
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // Преобразуем данные в формат ApexCharts (timestamp, value)
  const mainKey = keys[0];
  const chartData = data.map(item => [
    new Date(item[index]).getTime(),
    item[mainKey] || 0
  ]);

  // Адаптивные настройки в зависимости от размера экрана
  const getResponsiveSettings = () => {
    switch (screenSize) {
      case 'mobile':
        return {
          height: Math.min(height * 0.7, 250),
          tickAmount: 3,
          fontSize: '10px',
          padding: { top: 5, right: 5, bottom: 5, left: 5 },
          strokeWidth: 1.5,
          markerSize: 4
        };
      case 'tablet':
        return {
          height: Math.min(height * 0.85, 300),
          tickAmount: 6,
          fontSize: '11px',
          padding: { top: 10, right: 10, bottom: 10, left: 10 },
          strokeWidth: 2,
          markerSize: 5
        };
      default:
        return {
          height: height,
          tickAmount: 10,
          fontSize: '12px',
          padding: { top: 15, right: 15, bottom: 15, left: 15 },
          strokeWidth: 2,
          markerSize: 6
        };
    }
  };

  const responsiveSettings = getResponsiveSettings();

  const options: ApexOptions = {
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
    },
    colors: [colors[0]],
    chart: {
      fontFamily: "Inter, sans-serif",
      height: responsiveSettings.height,
      id: "area-datetime",
      type: "area",
      toolbar: {
        show: false,
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
      },
      zoom: {
        enabled: false
      },
      selection: {
        enabled: false
      }
    },
    stroke: {
      curve: "straight",
      width: [responsiveSettings.strokeWidth],
      lineCap: 'round'
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 0,
      hover: {
        size: responsiveSettings.markerSize,
        sizeOffset: 2
      }
    },
    xaxis: {
      type: "datetime",
      tickAmount: responsiveSettings.tickAmount,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: '#64748B',
          fontSize: responsiveSettings.fontSize,
          fontWeight: 400,
        },
        rotate: screenSize === 'mobile' ? -45 : 0,
        rotateAlways: screenSize === 'mobile',
        maxHeight: screenSize === 'mobile' ? 60 : undefined,
        formatter: function(value: any) {
          const date = new Date(value);
          if (screenSize === 'mobile') {
            return date.toLocaleDateString('ru-RU', { 
              day: '2-digit',
              month: '2-digit'
            });
          } else {
            return date.toLocaleDateString('ru-RU', { 
              month: 'short', 
              day: 'numeric' 
            });
          }
        }
      },
      tooltip: {
        enabled: false,
      },
    },
    tooltip: {
      enabled: true,
      theme: 'light',
      style: {
        fontSize: responsiveSettings.fontSize,
        fontFamily: 'Inter, sans-serif'
      },
      x: {
        format: "dd MMM yyyy",
      },
      y: {
        formatter: function(value: number) {
          return new Intl.NumberFormat('ru-RU', { 
            style: 'currency', 
            currency: 'RUB',
            minimumFractionDigits: 0
          }).format(value);
        }
      },
      custom: function({ series, seriesIndex, dataPointIndex, w }: any) {
        const timestamp = w.globals.seriesX[seriesIndex][dataPointIndex];
        const date = new Date(timestamp);
        const formattedDate = date.toLocaleDateString('ru-RU', { 
          year: 'numeric',
          month: 'long', 
          day: 'numeric' 
        });
        
        const value = series[seriesIndex][dataPointIndex];
        
        const tooltipPadding = screenSize === 'mobile' ? 'p-3' : 'p-4';
        const textSize = screenSize === 'mobile' ? 'text-xs' : 'text-sm';
        
        return `<div class="bg-white dark:bg-slate-800 ${tooltipPadding} rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-xs">
          <p class="${textSize} font-semibold text-slate-900 dark:text-white mb-2">${formattedDate}</p>
          <div class="flex items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full" style="background-color: ${colors[0]}"></div>
              <span class="text-slate-600 dark:text-slate-400">${legends[0]}:</span>
            </div>
            <span class="font-medium text-slate-900 dark:text-white">
              ${new Intl.NumberFormat('ru-RU', { 
                style: 'currency', 
                currency: 'RUB',
                minimumFractionDigits: 0,
                notation: screenSize === 'mobile' ? 'compact' : 'standard'
              }).format(value)}
            </span>
          </div>
        </div>`;
      }
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: screenSize === 'mobile' ? 0.4 : 0.55,
        opacityTo: 0,
        stops: [0, 90, 100]
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
          show: screenSize !== 'mobile',
        },
      },
      padding: responsiveSettings.padding,
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
          fontSize: responsiveSettings.fontSize,
          fontWeight: 400,
        },
        formatter: function(value: number) {
          if (screenSize === 'mobile' && value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'М';
          }
          return (value / 1000).toFixed(0) + 'к';
        }
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            height: Math.min(height * 0.6, 220),
          },
          xaxis: {
            tickAmount: 3,
            labels: {
              rotate: -45,
              rotateAlways: true,
              maxHeight: 50,
              style: {
                fontSize: '9px'
              }
            }
          },
          yaxis: {
            labels: {
              style: {
                fontSize: '9px'
              }
            }
          },
          grid: {
            padding: {
              top: 5,
              right: 5,
              bottom: 10,
              left: 5
            }
          }
        }
      },
      {
        breakpoint: 768,
        options: {
          chart: {
            height: Math.min(height * 0.75, 280),
          },
          xaxis: {
            tickAmount: 5,
            labels: {
              style: {
                fontSize: '10px'
              }
            }
          },
          yaxis: {
            labels: {
              style: {
                fontSize: '10px'
              }
            }
          }
        }
      },
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: Math.min(height * 0.9, 320),
          },
          xaxis: {
            tickAmount: 8,
            labels: {
              style: {
                fontSize: '11px'
              }
            }
          }
        }
      }
    ]
  };

  const series = [
    {
      name: legends[0],
      data: chartData,
    },
  ];

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className={`
        w-full 
        ${screenSize === 'mobile' ? 'min-w-full' : 'min-w-[500px] md:min-w-full'}
        ${screenSize === 'mobile' ? 'overflow-x-auto' : ''}
      `}>
        <Chart 
          options={options} 
          series={series} 
          type="area" 
          height={responsiveSettings.height}
          width="100%"
        />
      </div>
    </div>
  );
} 