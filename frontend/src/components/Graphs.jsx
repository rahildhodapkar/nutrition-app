import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  PointElement,
  BarElement,
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import 'chartjs-adapter-date-fns';  

ChartJS.register(
  ArcElement,
  LineElement,
  PointElement,
  BarElement,
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  TimeScale, 
  ChartDataLabels
);

export function CaloriesOverTime({ stats }) {
  const dates = Array.from(stats.keys());
  const calories = Array.from(stats.values());

  const data = {
    labels: dates, 
    datasets: [
      {
        label: 'Calories',
        data: calories, 
        backgroundColor: '#FF6384',
        borderColor: '#FF6384',
        tension: 0.1, 
      },
    ],
  };

  const options = {
    scales: {
      x: {
        type: 'time', 
        time: {
          unit: 'day',
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Calories',
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `Calories: ${tooltipItem.raw}`;
          },
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}

export function WeightOverTime({ stats }) {
  const dates = Array.from(stats.keys());
  const weights = Array.from(stats.values());

  const data = {
    labels: dates, 
    datasets: [
      {
        label: 'Weight',
        data: weights, 
        fill: false,
        backgroundColor: '#36A2EB',
        borderColor: '#36A2EB',
        tension: 0.1, 
      },
    ],
  };

  const options = {
    scales: {
      x: {
        type: 'time', 
        time: {
          unit: 'day',
        },
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Weight (kg)',
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `Weight: ${tooltipItem.raw} kg`;
          },
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}

export function CaloriesLeft({ caloriesConsumed, caloriesTotal }) {
  const data = {
    labels: ['Calories Consumed', 'Calories Left'],
    datasets: [
      {
        data: [caloriesConsumed, Math.max(0, caloriesTotal - caloriesConsumed)],
        backgroundColor: ['#FF6384', '#36A2EB'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB'],
      },
    ],
  };

  const options = {
    cutout: '70%',
    plugins: {
      datalabels: {
        color: '#fff',
        font: {
          size: 16,
          weight: 'bold',
        },
        formatter: function (value, context) {
          return value + (context.dataIndex === 0 ? ' consumed' : ' left');
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return tooltipItem.label + ': ' + tooltipItem.raw;
          },
        },
      },
    },
  };

  return <Doughnut data={data} options={options} />;
}

export function ProteinLeft({ proteinConsumed, proteinTotal }) {
  const data = {
    labels: ['Protein Consumed', 'Protein Left'],
    datasets: [
      {
        data: [proteinConsumed, Math.max(0, proteinTotal - proteinConsumed)],
        backgroundColor: ['#FFCE56', '#FF6384'],
        hoverBackgroundColor: ['#FFCE56', '#FF6384'],
      },
    ],
  };

  const options = {
    cutout: '70%',
    plugins: {
      datalabels: {
        color: '#fff',
        font: {
          size: 16,
          weight: 'bold',
        },
        formatter: function (value, context) {
          return value + 'g';
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return tooltipItem.label + ': ' + tooltipItem.raw + 'g';
          },
        },
      },
    },
  };

  return <Doughnut data={data} options={options} />;
}

export function FatLeft({ fatConsumed, fatTotal }) {
  const data = {
    labels: ['Fat Consumed', 'Fat Left'],
    datasets: [
      {
        data: [fatConsumed, Math.max(0, fatTotal - fatConsumed)],
        backgroundColor: ['#4BC0C0', '#FFCE56'],
        hoverBackgroundColor: ['#4BC0C0', '#FFCE56'],
      },
    ],
  };

  const options = {
    cutout: '70%',
    plugins: {
      datalabels: {
        color: '#fff',
        font: {
          size: 16,
          weight: 'bold',
        },
        formatter: function (value, context) {
          return value + 'g';
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return tooltipItem.label + ': ' + tooltipItem.raw + 'g';
          },
        },
      },
    },
  };

  return <Doughnut data={data} options={options} />;
}

export function CarbsLeft({ carbsConsumed, carbsTotal }) {
  const data = {
    labels: ['Carbs Consumed', 'Carbs Left'],
    datasets: [
      {
        data: [carbsConsumed, Math.max(0, carbsTotal - carbsConsumed)],
        backgroundColor: ['#36A2EB', '#4BC0C0'],
        hoverBackgroundColor: ['#36A2EB', '#4BC0C0'],
      },
    ],
  };

  const options = {
    cutout: '70%',
    plugins: {
      datalabels: {
        color: '#fff',
        font: {
          size: 16,
          weight: 'bold',
        },
        formatter: function (value, context) {
          return value + 'g';
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return tooltipItem.label + ': ' + tooltipItem.raw + 'g';
          },
        },
      },
    },
  };

  return <Doughnut data={data} options={options} />;
}

