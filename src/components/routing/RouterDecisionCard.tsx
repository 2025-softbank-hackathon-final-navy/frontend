import { RouterDecision } from '../../types/routing'
import { getPoolColor, getPriorityColor } from '../../data/mockRoutingData'

interface RouterDecisionCardProps {
  decision: RouterDecision
}

export function RouterDecisionCard({ decision }: RouterDecisionCardProps) {
  return (
    <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-xl p-6 text-white">
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
        <i className="fa-solid fa-route text-amber-400"></i>
        <h3 className="font-semibold">최신 라우팅 결정</h3>
        <span className="text-xs text-stone-400 ml-auto">
          {new Date(decision.decidedAt).toLocaleTimeString('ko-KR')}
        </span>
      </div>

      {/* Main Message */}
      <div className="text-lg mb-4">
        이번 요청은 <span className="text-amber-400 font-bold">{decision.poolType} 풀</span>
        (<span className="text-amber-300">{decision.nodeId}</span>)에 보냈습니다.
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPoolColor(decision.poolType)}`}>
          POOL: {decision.poolType}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
          NODE: {decision.nodeId}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          WARM TARGET: {decision.desiredWarm}
        </span>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(decision.priority)}`}>
          PRIORITY: {decision.priority}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-400">{decision.stats.qps.toFixed(1)}</div>
          <div className="text-xs text-stone-400">QPS</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-400">{Math.round(decision.stats.avgLatencyMs)}ms</div>
          <div className="text-xs text-stone-400">Latency</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-400">{(decision.stats.errorRate * 100).toFixed(1)}%</div>
          <div className="text-xs text-stone-400">Error</div>
        </div>
      </div>
    </div>
  )
}

