import { useState } from 'react'
import { RouterDecisionLog } from '../../types/routing'
import { getPoolColor, getPriorityColor } from '../../data/mockRoutingData'

interface RoutingHistoryTableProps {
  logs: RouterDecisionLog[]
}

export function RoutingHistoryTable({ logs }: RoutingHistoryTableProps) {
  const [filter, setFilter] = useState<'ALL' | 'HIGH'>('ALL')
  
  const filteredLogs = filter === 'HIGH' 
    ? logs.filter(log => log.priority === 'HIGH' || log.priority === 'CRITICAL')
    : logs

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-stone-200 flex justify-between items-center">
        <h4 className="font-semibold text-stone-700 flex items-center gap-2">
          <i className="fa-solid fa-clock-rotate-left text-stone-400"></i>
          라우팅 히스토리
        </h4>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === 'ALL' 
                ? 'bg-stone-800 text-white' 
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilter('HIGH')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === 'HIGH' 
                ? 'bg-amber-500 text-white' 
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            HIGH만
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-stone-50 text-xs text-stone-500 uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Time</th>
              <th className="px-4 py-3 text-left">Run ID</th>
              <th className="px-4 py-3 text-left">Pool</th>
              <th className="px-4 py-3 text-left">Node</th>
              <th className="px-4 py-3 text-center">Desired</th>
              <th className="px-4 py-3 text-center">Current</th>
              <th className="px-4 py-3 text-right">QPS</th>
              <th className="px-4 py-3 text-right">Latency</th>
              <th className="px-4 py-3 text-center">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-stone-50 transition-colors">
                <td className="px-4 py-3 text-sm text-stone-600">
                  {new Date(log.decidedAt).toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-stone-500">
                  {log.runId}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPoolColor(log.poolType)}`}>
                    {log.poolType}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-mono text-stone-600">
                  {log.nodeId}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-semibold text-amber-600">{log.desiredWarm}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-semibold ${log.currentWarm < log.desiredWarm ? 'text-red-500' : 'text-green-600'}`}>
                    {log.currentWarm}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm text-stone-700">
                  {log.qps.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right text-sm text-stone-700">
                  {Math.round(log.latencyMs)}ms
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(log.priority)}`}>
                    {log.priority}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

