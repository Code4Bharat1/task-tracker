'use client';
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip);

// Dummy data simulating daily work tracking
const performanceData = {
  'This Week': {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    timeSpent: [2.5, 4, 3.5, 5, 2, 1, 0], // hours
    progress: [15, 30, 45, 70, 80, 85, 100], // percentage
    efficiency: [6, 7.5, 12.8, 14, 40, 85, 0], // progress/hour
  },
  'This Month': {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    timeSpent: [12, 18, 15, 10], // hours
    progress: [20, 45, 70, 90], // percentage
    efficiency: [1.67, 2.5, 4.67, 9], // progress/hour
  },
  'This Year': {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    timeSpent: [45, 42, 50, 55, 60, 40, 35, 50, 55, 60, 65, 30], // hours
    progress: [10, 20, 30, 45, 60, 65, 70, 80, 85, 90, 95, 100], // percentage
    efficiency: [0.22, 0.48, 0.6, 0.82, 1.0, 1.63, 2.0, 1.6, 1.55, 1.5, 1.46, 3.33], // progress/hour
  },
};

const PerformanceChart = ({ timeframe = 'This Week' }) => {
  const { labels, progress, efficiency } = performanceData[timeframe];
  
  // Calculate overall performance metrics
  const totalProgress = progress[progress.length - 1];
  const avgEfficiency = (efficiency.reduce((a, b) => a + b, 0) / efficiency.length).toFixed(1);
  const peakDayIndex = efficiency.indexOf(Math.max(...efficiency));

  const chartData = {
    labels,
    datasets: [
      {
        label: "Daily Progress",
        data: progress,
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: labels.map((_, i) => i === peakDayIndex ? "#FF5722" : "#4CAF50"),
        pointRadius: labels.map((_, i) => i === peakDayIndex ? 6 : 3),
      },
      {
        label: "Efficiency (Progress/Hour)",
        data: efficiency,
        borderColor: "#2196F3",
        backgroundColor: "rgba(33, 150, 243, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        hidden: timeframe === 'This Year', // Hide efficiency for yearly view
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 20,
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.raw;
            if (label.includes('Progress')) {
              return `${label}: ${value}%`;
            }
            return `${label}: ${value}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#666" },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#f0f0f0" },
        ticks: {
          callback: (value) => {
            if (chartData.datasets.some(d => !d.hidden)) {
              return value % 20 === 0 ? `${value}%` : '';
            }
            return value;
          }
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-[1px_4px_10px_lightgray] p-5 w-full max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">OVERALL PERFORMANCE</h2>
        <div className="text-sm text-gray-600">
          Current: <span className="font-medium">{totalProgress}%</span> | 
          Avg Efficiency: <span className="font-medium">{avgEfficiency}%/hr</span>
        </div>
      </div>

      <div className="h-44 mb-4">
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className="grid grid-cols-3 text-center">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-500">Time Invested</div>
          <div className="text-lg font-semibold">
            {performanceData[timeframe].timeSpent.reduce((a, b) => a + b, 0)} hrs
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-500">Total Progress</div>
          <div className="text-lg font-semibold text-green-600">{totalProgress}%</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-500">Peak Efficiency</div>
          <div className="text-lg font-semibold text-blue-600">
            {Math.max(...efficiency).toFixed(1)}%/hr
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;