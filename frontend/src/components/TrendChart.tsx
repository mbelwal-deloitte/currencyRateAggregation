import React from 'react';
import { Line } from 'react-chartjs-2';
import { Box } from '@mui/material';
import { TrendData } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TrendChartProps {
  data: TrendData;
  timeframe: string;
}

const TrendChart: React.FC<TrendChartProps> = ({ data, timeframe }) => {
  if (!data || !data.data_points || data.data_points.length === 0) {
    return <Box sx={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No data available</Box>;
  }

  const chartData = {
    labels: data.data_points.map((point) => new Date(Object.keys(point)[0]).toLocaleDateString()),
    datasets: [
      {
        label: `${data.currency}/USD Rate`,
        data: data.data_points.map((point) => Object.values(point)[0]),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${data.currency}/USD ${timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Trend`,
        font: {
          size: 16
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        beginAtZero: false,
        ticks: {
          precision: 4,
          callback: function(value: any) {
            return Number(value).toFixed(4);
          }
        }
      },
      x: {
        type: 'category' as const,
        display: true,
        grid: {
          display: false
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  return (
    <Box sx={{ height: '400px', width: '100%', position: 'relative' }}>
      <Line data={chartData} options={options} />
    </Box>
  );
};

export default TrendChart;