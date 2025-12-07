import { useEffect, useRef } from 'react'
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
import { Line } from 'react-chartjs-2'

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

interface AISousChefProps {
  aiEnabled: boolean
  onToggle: () => void
}

export function AISousChef({ aiEnabled, onToggle }: AISousChefProps) {
  const chartRef = useRef<ChartJS<'line'>>(null)

  const labels = Array.from({ length: 12 }, (_, i) => `${i + 10}:00`)
  const trafficData = [10, 15, 20, 45, 80, 95, 85, 60, 40, 30, 20, 15]

  const data = {
    labels,
    datasets: [
      {
        label: 'Actual Traffic',
        data: trafficData,
        borderColor: '#57534e',
        backgroundColor: 'rgba(87, 83, 78, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: aiEnabled ? 'Provisioned (AI Predicted)' : 'Provisioned (Standard)',
        data: aiEnabled 
          ? trafficData.map(v => v + 10) 
          : trafficData.map(v => Math.max(0, v - 20)),
        borderColor: aiEnabled ? '#d97706' : '#ef4444',
        borderDash: aiEnabled ? [] : [5, 5],
        tension: 0.1,
        pointRadius: 0,
        fill: false,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: { legend: { position: 'bottom' as const } },
    scales: { 
      y: { display: false }, 
      x: { display: false } 
    },
  }

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update()
    }
  }, [aiEnabled])

  return (
    <section id="ai-chef" className="scroll-mt-20 py-10 border-t border-stone-200 mb-20">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-stone-900 mb-2">
            <i className="fa-solid fa-robot text-amber-600 mr-2"></i>AI Sous-Chef
          </h2>
          <p className="text-stone-600">트래픽 패턴을 분석하여 피크 타임 전에 미리 컨테이너를 예열합니다.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-stone-200 shadow-sm">
          <span className="text-sm font-bold text-stone-600">AI Optimization</span>
          <button 
            onClick={onToggle}
            className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none ${
              aiEnabled ? 'bg-amber-500' : 'bg-stone-300'
            }`}
          >
            <div 
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                aiEnabled ? 'translate-x-6' : ''
              }`}
            />
          </button>
        </div>
      </div>
      <div className="bg-white p-4 md:p-8 rounded-2xl shadow-lg border border-stone-100">
        <div className="chart-container">
          <Line ref={chartRef} data={data} options={options} />
        </div>
      </div>
    </section>
  )
}

