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
import { PredictionPoint } from '../../types/routing'

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

interface PredictionChartProps {
  data: PredictionPoint[]
}

export function PredictionChart({ data }: PredictionChartProps) {
  const nowIndex = data.findIndex(d => d.actualQps === null) - 1
  
  const labels = data.map(d => {
    const date = new Date(d.timestamp)
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  })

  const chartData = {
    labels,
    datasets: [
      {
        label: '실제 QPS',
        data: data.map(d => d.actualQps),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
        pointRadius: 0,
        borderWidth: 2,
        spanGaps: false,
      },
      {
        label: '예측 QPS',
        data: data.map((d, i) => i >= nowIndex ? d.predictedQps : null),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        borderDash: [5, 5],
        tension: 0.4,
        yAxisID: 'y',
        pointRadius: 0,
        borderWidth: 2,
        spanGaps: false,
      },
      {
        label: 'desiredWarm',
        data: data.map(d => d.desiredWarm),
        borderColor: '#22c55e',
        backgroundColor: 'transparent',
        tension: 0,
        yAxisID: 'y1',
        pointRadius: 0,
        borderWidth: 2,
        stepped: true,
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
      annotation: {
        annotations: {
          nowLine: {
            type: 'line',
            xMin: nowIndex,
            xMax: nowIndex,
            borderColor: '#ef4444',
            borderWidth: 2,
            borderDash: [6, 6],
          },
        },
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
          <i className="fa-solid fa-crystal-ball text-purple-500"></i>
          예측 vs 실제 QPS & Pre-warm
        </h4>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-amber-500"></span>
            <span className="text-stone-500">과거(실제)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-purple-500 border-dashed" style={{ borderBottom: '2px dashed #8b5cf6', height: 0 }}></span>
            <span className="text-stone-500">미래(예측)</span>
          </span>
        </div>
      </div>
      
      <div className="h-72">
        <Line data={chartData} options={options} />
      </div>

      {/* Explanation */}
      <div className="mt-4 p-4 bg-purple-50 rounded-lg">
        <p className="text-sm text-purple-800">
          <strong>💡 예열 전략:</strong> 예측 QPS(보라 점선)가 올라가는 시점 이전에 
          Router가 desiredWarm(초록 계단)을 미리 올려 Cold Start를 방지합니다.
        </p>
      </div>
    </div>
  )
}

