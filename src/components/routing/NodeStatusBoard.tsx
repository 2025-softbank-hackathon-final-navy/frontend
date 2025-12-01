import { NodeStatus } from '../../types/routing'
import { getPoolColor, getStatusColor } from '../../data/mockRoutingData'

interface NodeStatusBoardProps {
  nodes: NodeStatus[]
}

export function NodeStatusBoard({ nodes }: NodeStatusBoardProps) {
  const poolGroups = nodes.reduce((acc, node) => {
    if (!acc[node.poolType]) acc[node.poolType] = []
    acc[node.poolType].push(node)
    return acc
  }, {} as Record<string, NodeStatus[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-stone-700 flex items-center gap-2">
          <i className="fa-solid fa-server text-stone-500"></i>
          Pool / Node 상태
        </h4>
        <span className="text-xs text-stone-400">
          총 {nodes.length}개 노드
        </span>
      </div>

      {/* Pool Groups */}
      {Object.entries(poolGroups).map(([poolType, poolNodes]) => (
        <div key={poolType} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          {/* Pool Header */}
          <div className="px-5 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getPoolColor(poolType)}`}>
                {poolType}
              </span>
              <span className="text-sm text-stone-600">
                {poolNodes.length}개 노드
              </span>
            </div>
            <div className="text-xs text-stone-500">
              총 Warm: {poolNodes.reduce((sum, n) => sum + n.currentWarm, 0)}
            </div>
          </div>

          {/* Node Cards */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {poolNodes.map((node) => (
              <div
                key={node.nodeId}
                className="border border-stone-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Node Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-sm font-medium text-stone-700">
                    {node.nodeId}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(node.status)}`}>
                    {node.status}
                  </span>
                </div>

                {/* Resource Bars */}
                <div className="space-y-2 mb-3">
                  {/* CPU */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-stone-500">CPU Free</span>
                      <span className="text-stone-700">{node.freeCpuPercent}%</span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          node.freeCpuPercent > 50 ? 'bg-green-400' : 
                          node.freeCpuPercent > 20 ? 'bg-amber-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${node.freeCpuPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Memory */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-stone-500">Memory Free</span>
                      <span className="text-stone-700">{node.freeMemGiB} GiB</span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-400 rounded-full transition-all"
                        style={{ width: `${Math.min(node.freeMemGiB / 32 * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-stone-100">
                  <div className="text-center">
                    <div className="text-lg font-bold text-amber-600">{node.currentWarm}</div>
                    <div className="text-xs text-stone-400">Warm</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-stone-700">{node.runningFunctionsCount}</div>
                    <div className="text-xs text-stone-400">Running</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

