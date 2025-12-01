import { mockFunctions, getStatusColor } from '../../data/mockRoutingData'

interface FunctionsListProps {
  onSelectFunction: (id: string) => void
}

const languageIcons: Record<string, string> = {
  node: '🟢',
  python: '🐍',
  go: '🔵',
}

export function FunctionsList({ onSelectFunction }: FunctionsListProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Functions</h1>
          <p className="text-stone-500 text-sm mt-1">
            총 {mockFunctions.length}개의 함수가 등록되어 있습니다
          </p>
        </div>
        <div className="flex gap-2">
          <select className="px-3 py-2 rounded-lg border border-stone-200 text-sm bg-white">
            <option>모든 상태</option>
            <option>HOT</option>
            <option>STABLE</option>
            <option>COLD</option>
          </select>
          <select className="px-3 py-2 rounded-lg border border-stone-200 text-sm bg-white">
            <option>모든 언어</option>
            <option>Node.js</option>
            <option>Python</option>
            <option>Go</option>
          </select>
        </div>
      </div>

      {/* Functions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockFunctions.map((fn) => (
          <div
            key={fn.id}
            onClick={() => onSelectFunction(fn.id)}
            className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-lg hover:border-amber-300 transition-all cursor-pointer group"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{languageIcons[fn.language]}</span>
                <h3 className="font-semibold text-stone-900 group-hover:text-amber-600 transition-colors">
                  {fn.name}
                </h3>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(fn.status)}`}>
                {fn.status}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-stone-500 mb-4 line-clamp-2">{fn.description}</p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-stone-50 rounded-lg p-2">
                <div className="text-xs text-stone-400">QPS</div>
                <div className="text-lg font-bold text-stone-800">{fn.recentQps.toFixed(1)}</div>
              </div>
              <div className="bg-stone-50 rounded-lg p-2">
                <div className="text-xs text-stone-400">Error Rate</div>
                <div className="text-lg font-bold text-stone-800">{(fn.errorRate * 100).toFixed(1)}%</div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {fn.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-stone-100 text-stone-500 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Last Executed */}
            <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-400">
              마지막 실행: {new Date(fn.lastExecutedAt).toLocaleTimeString('ko-KR')}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

