import { useNavigate } from 'react-router-dom'
import { mockFunctions, getStatusColor } from '../../data/mockRoutingData'

interface FunctionsListProps {
  onSelectFunction: (id: string) => void
}

const runtimeIcons: Record<string, { icon: string; color: string }> = {
  node: { icon: '🟢', color: 'bg-green-100 text-green-700' },
  python: { icon: '🐍', color: 'bg-blue-100 text-blue-700' },
  go: { icon: '🔵', color: 'bg-cyan-100 text-cyan-700' },
}

// Extended mock data with additional fields
const extendedMockFunctions = mockFunctions.map((fn, idx) => ({
  ...fn,
  runtime: fn.language === 'node' ? 'Node.js 20' : fn.language === 'python' ? 'Python 3.11' : 'Go 1.21',
  resourceType: idx % 3 === 0 ? 'GPU' : 'CPU' as const,
  lastDeployed: new Date(Date.now() - (idx + 1) * 86400000).toISOString(),
  invocations: Math.floor(Math.random() * 50000) + 1000,
  memory: idx % 3 === 0 ? '8GB' : '2GB',
}))

export function FunctionsList({ onSelectFunction }: FunctionsListProps) {
  const navigate = useNavigate()

  const handleCreateFunction = () => {
    navigate('/functions/new')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Functions</h1>
          <p className="text-stone-500 text-sm mt-1">
            총 {extendedMockFunctions.length}개의 함수가 등록되어 있습니다
          </p>
        </div>
        <button
          onClick={handleCreateFunction}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-amber-500/25 transition-all flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i>
          New Function
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select className="px-3 py-2 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30">
          <option>모든 상태</option>
          <option>HOT</option>
          <option>STABLE</option>
          <option>COLD</option>
        </select>
        <select className="px-3 py-2 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30">
          <option>모든 Runtime</option>
          <option>Node.js</option>
          <option>Python</option>
          <option>Go</option>
        </select>
        <select className="px-3 py-2 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30">
          <option>모든 리소스</option>
          <option>CPU</option>
          <option>GPU</option>
        </select>
        <div className="flex-1"></div>
        <div className="relative">
          <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm"></i>
          <input
            type="text"
            placeholder="함수 검색..."
            className="pl-9 pr-4 py-2 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 w-64"
          />
        </div>
      </div>

      {/* Functions Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Runtime
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Last Deployed
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Invocations
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  Error Rate
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {extendedMockFunctions.map((fn) => (
                <tr
                  key={fn.id}
                  onClick={() => onSelectFunction(fn.id)}
                  className="hover:bg-amber-50/50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{runtimeIcons[fn.language]?.icon}</span>
                      <div>
                        <div className="font-semibold text-stone-900 group-hover:text-amber-600 transition-colors">
                          {fn.name}
                        </div>
                        <div className="text-xs text-stone-400 line-clamp-1 max-w-[200px]">
                          {fn.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${runtimeIcons[fn.language]?.color}`}>
                      {fn.runtime}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        fn.resourceType === 'GPU' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {fn.resourceType}
                      </span>
                      <span className="text-xs text-stone-400">{fn.memory}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-stone-600">
                      {new Date(fn.lastDeployed).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(fn.status)}`}>
                      {fn.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-medium text-stone-700">
                      {fn.invocations.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-medium ${
                      fn.errorRate > 0.02 ? 'text-red-600' : fn.errorRate > 0.01 ? 'text-amber-600' : 'text-green-600'
                    }`}>
                      {(fn.errorRate * 100).toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // More actions menu
                      }}
                      className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <span className="text-sm text-stone-500">
            {extendedMockFunctions.length}개 함수 표시 중
          </span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm text-stone-500 hover:text-stone-700 hover:bg-stone-200 rounded transition-colors disabled:opacity-50" disabled>
              <i className="fa-solid fa-chevron-left mr-1"></i>
              이전
            </button>
            <span className="px-3 py-1.5 text-sm font-medium text-amber-600 bg-amber-50 rounded">1</span>
            <button className="px-3 py-1.5 text-sm text-stone-500 hover:text-stone-700 hover:bg-stone-200 rounded transition-colors disabled:opacity-50" disabled>
              다음
              <i className="fa-solid fa-chevron-right ml-1"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
