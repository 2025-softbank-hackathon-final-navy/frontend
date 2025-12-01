import { HeatmapCell } from '../../types/routing'

interface TrafficHeatmapProps {
  data: HeatmapCell[]
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토']
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function TrafficHeatmap({ data }: TrafficHeatmapProps) {
  const maxQps = Math.max(...data.map(d => d.avgQps))
  
  const getCell = (day: number, hour: number) => {
    return data.find(d => d.dayOfWeek === day && d.hour === hour)
  }

  const getColor = (qps: number) => {
    const intensity = qps / maxQps
    if (intensity < 0.1) return 'bg-stone-50'
    if (intensity < 0.25) return 'bg-amber-100'
    if (intensity < 0.5) return 'bg-amber-200'
    if (intensity < 0.75) return 'bg-amber-400'
    return 'bg-amber-600'
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-stone-700 flex items-center gap-2">
          <i className="fa-solid fa-calendar-week text-amber-500"></i>
          시간대별 트래픽 패턴 (최근 7일)
        </h4>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Hour Labels */}
          <div className="flex mb-1">
            <div className="w-8 flex-shrink-0"></div>
            {HOURS.map(hour => (
              <div key={hour} className="flex-1 text-center text-xs text-stone-400">
                {hour % 3 === 0 ? `${hour}시` : ''}
              </div>
            ))}
          </div>

          {/* Rows */}
          {DAYS.map((day, dayIndex) => (
            <div key={day} className="flex items-center mb-0.5">
              <div className="w-8 flex-shrink-0 text-xs text-stone-500 font-medium">
                {day}
              </div>
              <div className="flex-1 flex gap-0.5">
                {HOURS.map(hour => {
                  const cell = getCell(dayIndex, hour)
                  return (
                    <div
                      key={hour}
                      className={`flex-1 h-6 rounded-sm ${getColor(cell?.avgQps || 0)} cursor-pointer hover:ring-2 hover:ring-amber-400 transition-all`}
                      title={`${day} ${hour}시: ${cell?.avgQps.toFixed(1)} QPS`}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-stone-100">
        <span className="text-xs text-stone-500">낮음</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 bg-stone-50 rounded"></div>
          <div className="w-4 h-4 bg-amber-100 rounded"></div>
          <div className="w-4 h-4 bg-amber-200 rounded"></div>
          <div className="w-4 h-4 bg-amber-400 rounded"></div>
          <div className="w-4 h-4 bg-amber-600 rounded"></div>
        </div>
        <span className="text-xs text-stone-500">높음</span>
      </div>

      <p className="mt-3 text-xs text-stone-500 text-center">
        💡 이 패턴을 기반으로 특정 시간대(예: 20시~22시)에 expected_qps를 계산합니다
      </p>
    </div>
  )
}

