import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getStatusColor } from '../../data/mockRoutingData'
import { useFunctionsList } from '../../apis'
import { formatDateTimeKST } from '../../utils/date'
import { getGrafanaURL } from '../../config/api'

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

export function FunctionsList({ onSelectFunction }: FunctionsListProps) {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [runtimeFilter, setRuntimeFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(0)
  const pageSize = 20
  
  // API로 함수 리스트 조회 (전체 데이터를 가져오기 위해 큰 size 사용)
  // 필터링이 클라이언트 사이드에서 이루어지므로 한 번에 많은 데이터를 가져옴
  const { data, isLoading, error } = useFunctionsList({ 
    page: 0, // 필터링을 위해 항상 첫 페이지부터 가져옴
    size: 1000 // 충분히 큰 값으로 전체 데이터 가져오기 (백엔드가 지원하는 최대값까지)
  })
  
  const allFunctions = data?.functions || []
  
  // 클라이언트 사이드 필터링
  const filteredFunctions = allFunctions.filter((fn) => {
    // 상태 필터
    if (statusFilter !== 'ALL' && fn.status !== statusFilter) {
      return false
    }
    
    // 런타임 필터
    if (runtimeFilter !== 'ALL') {
      const runtimeMap: Record<string, string> = {
        'Node.js': 'nodejs-18',
        'Python': 'python-3.11',
        'Go': 'go-1.22',
      }
      if (fn.runtime !== runtimeMap[runtimeFilter]) {
        return false
      }
    }
    
    // 검색 필터 (함수 이름)
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim()
      if (!fn.name.toLowerCase().includes(query)) {
        return false
      }
    }
    
    return true
  })
  
  // 필터링된 결과로 페이지네이션 재계산
  const totalFiltered = filteredFunctions.length
  const startIndex = currentPage * pageSize
  const endIndex = startIndex + pageSize
  const paginatedFunctions = filteredFunctions.slice(startIndex, endIndex)
  const totalPages = Math.ceil(totalFiltered / pageSize)
  const totalElements = totalFiltered
  
  // 필터 변경 시 첫 페이지로 이동
  const handleFilterChange = () => {
    setCurrentPage(0)
  }

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
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage)
      // 페이지 변경 시 테이블 상단으로 스크롤
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  
  // 페이지 번호 배열 생성 (현재 페이지 기준 앞뒤 2페이지씩)
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5 // 최대 표시할 페이지 번호 수
    
    if (totalPages <= maxVisible) {
      // 전체 페이지가 적으면 모두 표시
      for (let i = 0; i < totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 처음 페이지
      pages.push(0)
      
      // 중간 페이지들
      const start = Math.max(1, currentPage - 1)
      const end = Math.min(totalPages - 2, currentPage + 1)
      
      if (start > 1) pages.push('...')
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      if (end < totalPages - 2) pages.push('...')
      
      // 마지막 페이지
      pages.push(totalPages - 1)
    }
    
    return pages
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{t('functions.title')}</h1>
          <p className="text-stone-500 text-sm mt-1">
            {isLoading 
              ? t('functions.loading', { defaultValue: 'Loading...' })
              : totalElements > 0
              ? t('functions.subtitle', { count: totalElements, defaultValue: `총 ${totalElements}개의 함수` })
              : t('functions.empty', { defaultValue: 'No functions found' })
            }
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
        <select 
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            handleFilterChange()
          }}
          className="px-3 py-2 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
        >
          <option value="ALL">{t('functions.allStatus')}</option>
          <option value="HOT">{t('functions.status.hot')}</option>
          <option value="STABLE">{t('functions.status.stable')}</option>
          <option value="COLD">{t('functions.status.cold')}</option>
        </select>
        <select 
          value={runtimeFilter}
          onChange={(e) => {
            setRuntimeFilter(e.target.value)
            handleFilterChange()
          }}
          className="px-3 py-2 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
        >
          <option value="ALL">{t('functions.allRuntime')}</option>
          <option value="Node.js">Node.js</option>
          <option value="Python">Python</option>
          <option value="Go">Go</option>
        </select>
        <div className="flex-1"></div>
        <a
          href={getGrafanaURL()}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-2"
        >
          <i className="fa-solid fa-chart-line"></i>
          Grafana
          <i className="fa-solid fa-external-link text-xs"></i>
        </a>
        <div className="relative">
          <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              handleFilterChange()
            }}
            placeholder={t('functions.search')}
            className="pl-9 pr-4 py-2 rounded-lg border border-stone-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 w-64"
          />
        </div>
      </div>

      {/* Functions Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {error && (
          <div className="p-6 text-center text-red-600">
            <i className="fa-solid fa-triangle-exclamation mr-2"></i>
            {t('functions.error', { defaultValue: 'Failed to load functions' })}
          </div>
        )}
        {isLoading && (
          <div className="p-6 text-center text-stone-500">
            <i className="fa-solid fa-spinner fa-spin mr-2"></i>
            {t('functions.loading', { defaultValue: 'Loading functions...' })}
          </div>
        )}
        {!isLoading && !error && allFunctions.length === 0 && (
          <div className="p-6 text-center text-stone-500">
            <i className="fa-solid fa-inbox mr-2"></i>
            {t('functions.empty', { defaultValue: 'No functions found' })}
          </div>
        )}
        {!isLoading && !error && allFunctions.length > 0 && (
          <>
            {filteredFunctions.length === 0 ? (
              <div className="p-12 text-center text-stone-500">
                <i className="fa-solid fa-filter-circle-xmark text-4xl mb-3 text-stone-300"></i>
                <p className="font-medium">{t('functions.noResults', { defaultValue: '필터 조건에 맞는 함수가 없습니다' })}</p>
                <button
                  onClick={() => {
                    setStatusFilter('ALL')
                    setRuntimeFilter('ALL')
                    setSearchQuery('')
                    setCurrentPage(0)
                  }}
                  className="mt-4 text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  {t('functions.clearFilters', { defaultValue: '필터 초기화' })}
                </button>
              </div>
            ) : (
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
                    {paginatedFunctions.map((fn) => {
                  // 런타임 매핑: nodejs-18 -> node, python-3.11 -> python, go-1.22 -> go
                  const runtimeKey = fn.runtime.includes('node') ? 'node' : fn.runtime.includes('python') ? 'python' : 'go'
                  const config = runtimeConfig[runtimeKey] || runtimeConfig.node
                  const runtimeLabel = fn.runtime.includes('node') ? 'Node.js 18' : fn.runtime.includes('python') ? 'Python 3.11' : 'Go 1.22'
                  
                  return (
                    <tr
                      key={fn.functionId}
                      onClick={() => onSelectFunction(fn.functionId)}
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
                            {fn.description && (
                              <div className="text-xs text-stone-400 line-clamp-1 max-w-[200px]">
                                {fn.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${config.bgColor} ${config.textColor}`}>
                          <i className={`${config.icon} text-sm`}></i>
                          <span>{runtimeLabel}</span>
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
                          {formatDateTimeKST(fn.lastDeployedAt, {
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
                          fn.errorRate > 2.0 ? 'text-red-600' : 
                          fn.errorRate > 1.0 ? 'text-amber-600' : 'text-green-600'
                        }`}>
                          {fn.errorRate.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <a
                            href={getGrafanaURL()}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Grafana"
                          >
                            <i className="fa-solid fa-chart-line"></i>
                          </a>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              // More actions menu
                            }}
                            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                          >
                            <i className="fa-solid fa-ellipsis-vertical"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Table Footer - Pagination */}
        {!isLoading && !error && totalPages > 0 && filteredFunctions.length > 0 && (
          <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-stone-500">
              {(() => {
                const start = currentPage * pageSize + 1
                const end = Math.min((currentPage + 1) * pageSize, totalElements)
                return t('functions.showing', { 
                  start, 
                  end, 
                  total: totalElements,
                  defaultValue: `${start}-${end} / ${totalElements}개 표시`
                })
              })()}
            </span>
            <div className="flex items-center gap-2">
              {/* 이전 페이지 */}
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-3 py-1.5 text-sm text-stone-500 hover:text-stone-700 hover:bg-stone-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fa-solid fa-chevron-left mr-1"></i>
                {t('common.prev', { defaultValue: '이전' })}
              </button>
              
              {/* 페이지 번호 */}
              {getPageNumbers().map((page, idx) => {
                if (page === '...') {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-2 text-stone-400">
                      ...
                    </span>
                  )
                }
                
                const pageNum = page as number
                const isActive = pageNum === currentPage
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`
                      px-3 py-1.5 text-sm rounded transition-colors min-w-[2.5rem]
                      ${isActive 
                        ? 'font-medium text-amber-600 bg-amber-50 border border-amber-200' 
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                      }
                    `}
                  >
                    {pageNum + 1}
                  </button>
                )
              })}
              
              {/* 다음 페이지 */}
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-1.5 text-sm text-stone-500 hover:text-stone-700 hover:bg-stone-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.next', { defaultValue: '다음' })}
                <i className="fa-solid fa-chevron-right ml-1"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
