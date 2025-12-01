interface WarmStatusBarProps {
  desiredWarm: number
  currentWarm: number
}

export function WarmStatusBar({ desiredWarm, currentWarm }: WarmStatusBarProps) {
  const maxWarm = Math.max(desiredWarm, currentWarm, 10)
  const desiredPercent = (desiredWarm / maxWarm) * 100
  const currentPercent = (currentWarm / maxWarm) * 100
  const gap = desiredWarm - currentWarm

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-stone-700 flex items-center gap-2">
          <i className="fa-solid fa-fire text-amber-500"></i>
          Warm 인스턴스 현황
        </h4>
        {gap > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            +{gap} 추가 필요
          </span>
        )}
      </div>

      <div className="space-y-3">
        {/* Desired Warm */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-stone-500">목표 (desiredWarm)</span>
            <span className="font-bold text-amber-600">{desiredWarm}</span>
          </div>
          <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${desiredPercent}%` }}
            />
          </div>
        </div>

        {/* Current Warm */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-stone-500">현재 (currentWarm)</span>
            <span className="font-bold text-green-600">{currentWarm}</span>
          </div>
          <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
              style={{ width: `${currentPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className={`mt-4 p-3 rounded-lg text-sm ${
        gap > 2 
          ? 'bg-red-50 text-red-700' 
          : gap > 0 
          ? 'bg-amber-50 text-amber-700' 
          : 'bg-green-50 text-green-700'
      }`}>
        {gap > 2 
          ? `⚠️ Router는 ${desiredWarm}개를 원하지만, 현재 ${currentWarm}개만 준비됨. 스케일업 중...`
          : gap > 0 
          ? `📈 ${gap}개 인스턴스 추가 예열 중...`
          : `✅ 충분한 Warm 인스턴스가 준비되어 있습니다.`
        }
      </div>
    </div>
  )
}

