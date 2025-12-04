import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { mockFunctions, getStatusColor } from '../../data/mockRoutingData'

interface FunctionsListProps {
  onSelectFunction: (id: string) => void
}

// Runtime별 아이콘 및 스타일 설정 (Font Awesome Brand Icons)
const runtimeConfig: Record<string, { 
  icon: string
  bgColor: string
  textColor: string
  iconColor: string
  label: string
}> = {
  node: { 
    icon: 'fa-brands fa-node-js',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    iconColor: 'text-emerald-500',
    label: 'Node.js'
  },
  python: { 
    icon: 'fa-brands fa-python',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    iconColor: 'text-amber-500',
    label: 'Python'
  },
  go: { 
    icon: 'fa-brands fa-golang',
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    iconColor: 'text-cyan-500',
    label: 'Go'
  },
}

// Extended mock data with additional fields
const extendedMockFunctions = mockFunctions.map((fn, idx) => ({
  ...fn,
  runtime: fn.language === 'node' ? 'Node.js 18' : fn.language === 'python' ? 'Python 3.11' : 'Go 1.22',
  lastDeployed: new Date(Date.now() - (idx + 1) * 86400000).toISOString(),
  invocations: Math.floor(Math.random() * 50000) + 1000,
  timeout: [30, 60, 120, 300, 600][idx % 5],
}))

export function FunctionsList({ onSelectFunction }: FunctionsListProps) {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  // 타임아웃 포맷 함수 (언어별)
  const formatTimeout = (seconds: number) => {
    if (seconds >= 60) {
      return t('time.minutes', { count: Math.floor(seconds / 60) })
    }
    return t('time.seconds', { count: seconds })
  }

  // 날짜 포맷 (언어별 로케일)
  const getDateLocale = () => {
    const localeMap: Record<string, string> = {
      ko: 'ko-KR',
      en: 'en-US',
      ja: 'ja-JP',
    }
    return localeMap[i18n.language] || 'ko-KR'
  }

  const handleCreateFunction = () => {
    navigate('/functions/new')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{t('functions.title')}</h1>
          <p className="text-stone-500 text-sm mt-1">
            {t('functions.subtitle', { count: extendedMockFunctions.length })}
          </p>
        </div>
        <button
          onClick={handleCreateFunction}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-amber-500/25 transition-all flex items-center gap-2"
        >
          <i className="fa-solid fa-plus"></i>
          {t('functions.newFunction')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select className="px-3 py-2 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30">
          <option>{t('functions.allStatus')}</option>
          <option>{t('functions.status.hot')}</option>
          <option>{t('functions.status.stable')}</option>
          <option>{t('functions.status.cold')}</option>
        </select>
        <select className="px-3 py-2 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30">
          <option>{t('functions.allRuntime')}</option>
          <option>Node.js</option>
          <option>Python</option>
          <option>Go</option>
        </select>
        <div className="flex-1"></div>
        <div className="relative">
          <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm"></i>
          <input
            type="text"
            placeholder={t('functions.search')}
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
                  {t('functions.table.name')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  {t('functions.table.runtime')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  {t('functions.table.timeout')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  {t('functions.table.lastDeployed')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  {t('functions.table.status')}
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  {t('functions.table.invocations')}
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  {t('functions.table.errorRate')}
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {extendedMockFunctions.map((fn) => {
                const config = runtimeConfig[fn.language] || runtimeConfig.node
                return (
                  <tr
                    key={fn.id}
                    onClick={() => onSelectFunction(fn.id)}
                    className="hover:bg-amber-50/50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* Runtime Icon Badge */}
                        <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center`}>
                          <i className={`${config.icon} ${config.iconColor} text-xl`}></i>
                        </div>
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
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${config.bgColor} ${config.textColor}`}>
                        <i className={`${config.icon} text-sm`}></i>
                        <span>{fn.runtime}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <i className="fa-solid fa-clock text-stone-400 text-xs"></i>
                        <span className="text-sm text-stone-600 font-medium">
                          {formatTimeout(fn.timeout)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-stone-600">
                        {new Date(fn.lastDeployed).toLocaleDateString(getDateLocale(), {
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
                        {fn.invocations.toLocaleString(getDateLocale())}
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
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <span className="text-sm text-stone-500">
            {t('functions.showing', { count: extendedMockFunctions.length })}
          </span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm text-stone-500 hover:text-stone-700 hover:bg-stone-200 rounded transition-colors disabled:opacity-50" disabled>
              <i className="fa-solid fa-chevron-left mr-1"></i>
              {t('common.prev')}
            </button>
            <span className="px-3 py-1.5 text-sm font-medium text-amber-600 bg-amber-50 rounded">1</span>
            <button className="px-3 py-1.5 text-sm text-stone-500 hover:text-stone-700 hover:bg-stone-200 rounded transition-colors disabled:opacity-50" disabled>
              {t('common.next')}
              <i className="fa-solid fa-chevron-right ml-1"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
