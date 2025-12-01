import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { TimeSeriesPoint } from '../../types/routing'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface QpsWarmChartProps {
  data: TimeSeriesPoint[]
}

export function QpsWarmChart({ data }: QpsWarmChartProps) {
  const labels = data.map(d => 
    new Date(d.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  )

  const chartData = {
    labels,
    datasets: [
      {
        label: 'QPS',
        data: data.map(d => d.qps),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: 'desiredWarm',
        data: data.map(d => d.desiredWarm),
        borderColor: '#8b5cf6',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0,
        yAxisID: 'y1',
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: 'currentWarm',
        data: data.map(d => d.currentWarm),
        borderColor: '#22c55e',
        backgroundColor: 'transparent',
        tension: 0,
        yAxisID: 'y1',
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { 
          maxTicksLimit: 12,
          font: { size: 10 },
        },
      },
      y: {
        type: 'linear' as const,
        position: 'left' as const,
        title: {
          display: true,
          text: 'QPS',
          font: { size: 11 },
        },
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
      },
      y1: {
        type: 'linear' as const,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Warm Count',
          font: { size: 11 },
        },
        grid: { drawOnChartArea: false },
      },
    },
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-stone-700 flex items-center gap-2">
          <i className="fa-solid fa-chart-line text-amber-500"></i>
          QPS vs Warm 추이 (최근 1시간)
        </h4>
        <span className="text-xs text-stone-400">1분 단위</span>
      </div>
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
      <p className="mt-3 text-xs text-stone-500 text-center">
        💡 QPS가 올라갈 때 desiredWarm(보라 점선)이 미리 따라 올라가는 패턴을 확인하세요
      </p>
    </div>
  )
}

