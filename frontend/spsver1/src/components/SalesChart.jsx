import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto'; // Import thư viện Chart.js

const SalesChart = ({ labels = [], values = [], label = 'Xu hướng theo ngày' }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // Hủy biểu đồ cũ nếu component bị re-render để tránh lỗi "Canvas is already in use"
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label,
          data: values,
          borderColor: '#00529C',
          backgroundColor: 'rgba(0, 82, 156, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    });

    // Cleanup function khi component unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [labels, values, label]);

  return <canvas ref={chartRef} height="80"></canvas>;
};

export default SalesChart;