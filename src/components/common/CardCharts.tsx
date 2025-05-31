import React from 'react';
import { ApexOptions } from 'apexcharts';
import ReactApexChart from 'react-apexcharts';

interface ChartData {
  labels: string[];
  datasets: {
    name: string;
    data: number[];
  }[];
}

interface ChartCardProps {
  title: string;
  chartData: ChartData;
  height?: number;
}

const defaultOptions: ApexOptions = {
  legend: {
    show: true,
    position: 'bottom',
    labels: {
      colors: '#64748B',
    },
  },
  grid: {
    xaxis: {
      lines: {
        show: true,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: 2,
    curve: 'smooth',
  },
  xaxis: {
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
      },
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: '#64748B',
        fontSize: '12px',
      },
      formatter: (value) => {
        if (value >= 1000000) {
          return `${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
          return `${(value / 1000).toFixed(1)}K`;
        }
        return value.toFixed(0);
      },
    },
  },
  tooltip: {
    y: {
      formatter: (val) => {
        return new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      },
    },
  },
};

export const CardLineChart: React.FC<ChartCardProps> = ({ title, chartData, height = 350 }) => {
  const series = chartData.datasets.map(dataset => ({
    name: dataset.name,
    data: dataset.data,
  }));

  const options: ApexOptions = {
    ...defaultOptions,
    chart: {
      type: 'line',
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      ...defaultOptions.xaxis,
      categories: chartData.labels,
    },
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <ReactApexChart
        options={options}
        series={series}
        type="line"
        height={height}
      />
    </div>
  );
};

export const CardAreaChart: React.FC<ChartCardProps> = ({ title, chartData, height = 350 }) => {
  const series = chartData.datasets.map(dataset => ({
    name: dataset.name,
    data: dataset.data,
  }));

  const options: ApexOptions = {
    ...defaultOptions,
    chart: {
      type: 'area',
      toolbar: {
        show: false,
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.4,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      ...defaultOptions.xaxis,
      categories: chartData.labels,
    },
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <ReactApexChart
        options={options}
        series={series}
        type="area"
        height={height}
      />
    </div>
  );
};

export const CardBarChart: React.FC<ChartCardProps> = ({ title, chartData, height = 350 }) => {
  const series = chartData.datasets.map(dataset => ({
    name: dataset.name,
    data: dataset.data,
  }));

  const options: ApexOptions = {
    ...defaultOptions,
    chart: {
      type: 'bar',
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 8,
        columnWidth: '55%',
        distributed: false,
      },
    },
    xaxis: {
      ...defaultOptions.xaxis,
      categories: chartData.labels,
    },
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={height}
      />
    </div>
  );
};

export const CardPieChart: React.FC<ChartCardProps> = ({ title, chartData, height = 350 }) => {
  const series = chartData.datasets[0]?.data || [];

  const options: ApexOptions = {
    chart: {
      type: 'pie',
    },
    labels: chartData.labels,
    legend: {
      show: true,
      position: 'bottom',
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
    tooltip: {
      y: {
        formatter: (val) => {
          return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(val);
        },
      },
    },
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <ReactApexChart
        options={options}
        series={series}
        type="pie"
        height={height}
      />
    </div>
  );
}; 