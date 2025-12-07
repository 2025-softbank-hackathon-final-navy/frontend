import { useEffect, useRef, useMemo } from 'react'
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

// 시간대별 가중치 (ARCHITECTURE.md 참고)
function getTimeCoefficient(hour: number): number {
  if (hour >= 0 && hour <= 5) return 0.6  // 낮은 트래픽
  if (hour >= 6 && hour <= 8) return 0.9  // 아침
  if (hour >= 9 && hour <= 18) return 1.3 // 업무 시간
  if (hour >= 19 && hour <= 22) return 1.5 // 저녁 피크
  return 0.8 // 23시
}

// EMA 계산 (alpha = 0.3)
function calculateEMA(currentQps: number, oldEma: number, alpha: number = 0.3): number {
  return alpha * currentQps + (1 - alpha) * oldEma
}

export function AISousChef({ aiEnabled, onToggle }: AISousChefProps) {
  const chartRef = useRef<ChartJS<'line'>>(null)

  // 실제 QPS (트래픽 급증 시나리오) - 28개 포인트
  const actualQps = [
    // 평상시
    10, 12, 15, 18, 20, 22, 25, 28, 
    // 급증
    35, 45, 60, 80, 100, 130, 160, 190,
    // 피크
    220, 250, 270, 280, 275, 260,
    // 급감
    200, 140, 90, 50, 30, 20
  ]

  // 시간별 데이터 (5분 간격, 데이터 포인트 수에 맞춤)
  const labels = Array.from({ length: actualQps.length }, (_, i) => {
    const totalMinutes = i * 5
    const hour = 10 + Math.floor(totalMinutes / 60)
    const minute = totalMinutes % 60
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  })

  // 우리 방식: EMA 기반 예측으로 선제적 스케일링
  const emaQps: number[] = []
  for (let i = 0; i < actualQps.length; i++) {
    if (i === 0) {
      emaQps.push(actualQps[i])
    } else {
      emaQps.push(calculateEMA(actualQps[i], emaQps[i - 1], 0.3))
    }
  }
  
  // 예측 EMA (선제적 대응)
  const predictedEmaQps = emaQps.map((ema, i) => {
    if (i < emaQps.length - 1) {
      const trend = actualQps[i + 1] - actualQps[i]
      return ema + trend * 0.2
    }
    return ema
  })

  // 시간대별 가중치
  const timeCoeffs = actualQps.map((_, i) => {
    const hour = 10 + Math.floor((i * 5) / 60)
    return getTimeCoefficient(hour)
  })
  
  const weights = predictedEmaQps.map((ema, i) => ema * timeCoeffs[i] * 1.0)
  
  // desiredWarm 계산: weight를 QPS 스케일로 환산 후 적절히 나눔
  // weight = predictedEmaQps * timeCoeff 이므로, QPS 스케일로 환산하려면 weight를 timeCoeff로 나눔
  // 기존 FaaS는 QPS/10을 사용하지만, 예측 기반이므로 선제적으로 약간 더 준비 (1.2배)
  const ourDesiredWarm = weights.map((weight, i) => {
    // weight를 원래 QPS 스케일로 환산
    const predictedQps = weight / (timeCoeffs[i] * 1.0)
    // QPS 기반 replica 계산: QPS/10 * 1.2 (선제적 대응을 위한 여유)
    const base = Math.ceil(predictedQps / 10 * 1.2)
    return Math.max(2, base)
  })

  // 우리 방식: 예측 기반 선제적 스케일링
  const ourReplicas: number[] = []
  for (let i = 0; i < ourDesiredWarm.length; i++) {
    if (i === 0) {
      ourReplicas.push(Math.max(2, ourDesiredWarm[i]))
    } else {
      const desired = ourDesiredWarm[i]
      ourReplicas.push(desired) // 즉시 반영
    }
  }

  // 기존 FaaS 방식: 반응형 스케일링 (트래픽 증가 후에야 반응)
  const traditionalReplicas: number[] = []
  for (let i = 0; i < actualQps.length; i++) {
    if (i === 0) {
      traditionalReplicas.push(2) // 초기값
    } else {
      const prevReplicas = traditionalReplicas[i - 1]
      const currentQps = actualQps[i]
      const needed = Math.ceil(currentQps / 10) // 단순 계산: QPS/10
      const newReplicas = Math.max(2, needed)
      
      // 기존 FaaS: 트래픽 증가 후에 반응 (지연)
      if (newReplicas > prevReplicas) {
        // 스케일업: 천천히 증가 (최대 1개씩)
        traditionalReplicas.push(Math.min(prevReplicas + 1, newReplicas))
      } else if (newReplicas < prevReplicas) {
        // 스케일다운: 매우 천천히 (5분마다 1개씩 감소)
        traditionalReplicas.push(Math.max(newReplicas, prevReplicas - (i % 5 === 0 ? 1 : 0)))
      } else {
        traditionalReplicas.push(prevReplicas)
      }
    }
  }

  const data = {
    labels,
    datasets: [
      {
        label: '실제 트래픽 (QPS)',
        data: actualQps,
        borderColor: '#57534e',
        backgroundColor: 'rgba(87, 83, 78, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#57534e',
        yAxisID: 'y',
      },
      {
        label: '기존 FaaS (반응형)',
        data: traditionalReplicas,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: false,
        tension: 0.2,
        pointRadius: 4,
        pointBackgroundColor: '#ef4444',
        borderWidth: 2.5,
        borderDash: [5, 5],
        yAxisID: 'y1',
      },
      {
        label: '우리 방식 (예측형, AI)',
        data: aiEnabled ? ourReplicas : [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: false,
        tension: 0.2,
        pointRadius: 5,
        pointBackgroundColor: '#10b981',
        borderWidth: 3,
        yAxisID: 'y1',
      },
    ],
  }

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { 
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
        }
      },
      title: {
        display: true,
        text: '기존 FaaS vs 우리 방식: 레플리카 수 조절 비교',
        font: {
          size: 18,
          weight: 'bold' as const,
        },
        padding: {
          bottom: 20,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || ''
            const value = context.parsed.y
            if (label.includes('FaaS') || label.includes('방식') || label.includes('레플리카')) {
              return `${label}: ${Math.round(value)}개`
            }
            return `${label}: ${Math.round(value)} QPS`
          }
        }
      }
    },
    scales: { 
        y: { 
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'QPS (Queries Per Second)',
          font: {
            weight: 'bold' as const,
            size: 14,
          }
        },
        beginAtZero: true,
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: '레플리카 수',
          font: {
            weight: 'bold' as const,
            size: 14,
          }
        },
        beginAtZero: true,
        max: aiEnabled ? undefined : 30, // 토글 비활성화 시 최대값 30
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        title: {
          display: true,
          text: '시간',
          font: {
            weight: 'bold' as const,
          }
        }
      }
    },
  }), [aiEnabled])

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update()
    }
  }, [aiEnabled])

  // 현재 상태 요약
  const currentQps = actualQps[actualQps.length - 1]
  const currentTraditional = traditionalReplicas[traditionalReplicas.length - 1]
  const currentOur = ourReplicas[ourReplicas.length - 1]

  return (
    <section id="ai-chef" className="scroll-mt-20 py-10 border-t border-stone-200 mb-20">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold text-stone-900 mb-2">
              <i className="fa-solid fa-chart-line text-amber-600 mr-2"></i>
              레플리카 수 조절 방식 비교
            </h2>
            <p className="text-stone-600">
              기존 FaaS의 반응형 스케일링과 우리의 예측형 스케일링 방식을 비교합니다.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-stone-200 shadow-sm">
            <span className="text-sm font-bold text-stone-600">AI 예측 활성화</span>
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

        {/* 비교 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-chart-line text-stone-600"></i>
              </div>
              <div>
                <div className="text-xs text-stone-500 font-medium">현재 트래픽 (QPS)</div>
                <div className="text-2xl font-bold text-stone-900">{currentQps.toFixed(0)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-clock-rotate-left text-red-600"></i>
              </div>
              <div>
                <div className="text-xs text-stone-500 font-medium">기존 FaaS (반응형)</div>
                <div className="text-2xl font-bold text-red-600">{currentTraditional.toFixed(0)}개</div>
                <div className="text-xs text-red-400 mt-1">Cold Start 발생</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-green-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-brain text-green-600"></i>
              </div>
              <div>
                <div className="text-xs text-stone-500 font-medium">우리 방식 (예측형)</div>
                <div className="text-2xl font-bold text-green-600">{aiEnabled ? currentOur.toFixed(0) : '--'}개</div>
                <div className="text-xs text-green-400 mt-1">Cold Start 방지</div>
              </div>
            </div>
          </div>
        </div>

        {/* 차트 */}
        <div className="bg-gradient-to-br from-white to-stone-50 p-4 md:p-8 rounded-2xl shadow-xl border-2 border-stone-200">
          <div className="chart-container" style={{ height: '500px' }}>
            <Line ref={chartRef} data={data} options={options} />
          </div>
          
          {/* 비교 설명 */}
          <div className="mt-4 bg-gradient-to-r from-red-50 to-green-50 border-2 border-stone-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border-l-4 border-red-500">
                <h4 className="font-bold text-red-700 mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-clock-rotate-left text-red-600"></i>
                  기존 FaaS (반응형)
                </h4>
                <ul className="text-sm text-stone-600 space-y-1">
                  <li>• 트래픽 증가 <strong>후</strong>에만 스케일업</li>
                  <li>• Cold Start 발생 (컨테이너 생성 대기)</li>
                  <li>• 천천히 증가 (최대 1개씩)</li>
                  <li>• 응답 시간 지연</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-brain text-green-600"></i>
                  우리 방식 (예측형, AI)
                </h4>
                <ul className="text-sm text-stone-600 space-y-1">
                  <li>• EMA 기반으로 트래픽 <strong>증가 전</strong> 예측</li>
                  <li>• Cold Start <strong>방지</strong> (선제적 스케일업)</li>
                  <li>• 즉시 반영 (필요한 만큼)</li>
                  <li>• 즉시 응답 가능</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

