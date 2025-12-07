import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  RouterDecisionCard,
  WarmStatusBar,
  QpsWarmChart,
  TrafficHeatmap,
} from '../components/routing'
import {
  mockFunctionDetail,
  mockLatestDecision,
  mockTimeSeriesData,
  mockHeatmapData,
  getPoolColor,
} from '../data/mockRoutingData'
import { useDeleteFunction, useFunctionRuns, useExecuteFunction, useFunctionLogDetail } from '../apis'
import { useExecuteFunctionStream } from '../apis/functions/mutations/useExecuteFunctionStream'
import { useFunctionStats } from '../apis/functions/queries/useFunctionStats'
import { formatTimeKST } from '../utils/date'
import type { TimeSeriesPoint } from '../types/routing'
import { getGrafanaURL } from '../config/api'

// 지연시간 포맷팅 함수 (밀리초 -> ms 또는 s)
function formatLatency(ms: number): string {
  if (ms >= 1000) {
    // 1000ms 이상이면 초 단위로 변환 (소수점 2자리)
    return `${(ms / 1000).toFixed(2)}s`
  }
  // 1000ms 미만이면 밀리초 단위로 표시 (소수점 없음)
  return `${Math.round(ms)}ms`
}

// 에러율 포맷팅 함수 (백엔드가 퍼센트 형식으로 보냄)
function formatErrorRate(errorRate: number): string {
  return `${errorRate.toFixed(1)}%`
}

type Tab = 'overview' | 'run-logs' | 'triggers' | 'env-secrets'

export function FunctionDetailPage() {
  const { id: functionId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  const deleteFunction = useDeleteFunction()
  
  // 함수 통계 주기적 조회 (15초마다 갱신 - API 부하 감소)
  const { data: functionStats } = useFunctionStats({ 
    functionId, 
    refetchInterval: 15000 // 15초마다 갱신
  })
  
  // 통계가 있으면 사용, 없으면 mock 데이터 사용
  // API 응답의 qps, avgLatencyMs를 recentStats로 매핑
  const fn = functionStats ? {
    ...mockFunctionDetail,
    ...functionStats,
    id: functionStats.functionId,
    recentStats: {
      qps: functionStats.qps ?? mockFunctionDetail.recentStats.qps,
      avgLatencyMs: functionStats.avgLatencyMs ?? mockFunctionDetail.recentStats.avgLatencyMs,
      errorRate: functionStats.errorRate,
      p99LatencyMs: mockFunctionDetail.recentStats.p99LatencyMs, // API에 없으므로 mock 데이터 유지
    },
  } : mockFunctionDetail
  
  const handleDelete = async () => {
    if (!functionId) return
    
    try {
      await deleteFunction.mutateAsync(functionId)
      navigate('/functions')
    } catch (error) {
      console.error('Failed to delete function:', error)
    }
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: t('functionDetail.tabs.overview'), icon: 'fa-gauge-high' },
    { id: 'run-logs', label: t('functionDetail.tabs.runLogs'), icon: 'fa-terminal' },
    { id: 'triggers', label: t('functionDetail.tabs.triggers'), icon: 'fa-bolt' },
    { id: 'env-secrets', label: t('functionDetail.tabs.envSecrets'), icon: 'fa-key' },
  ]

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/functions')}
          className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
        >
          <i className="fa-solid fa-arrow-left text-stone-500"></i>
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-stone-900">{fn.name}</h1>
            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getPoolColor(fn.poolType)}`}>
              {fn.poolType}
            </span>
          </div>
          <p className="text-stone-500 text-sm mt-1">{fn.description}</p>
        </div>
        <div className="flex items-center gap-2">
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
          <button
            onClick={() => navigate(`/functions/${functionId}/edit`)}
            className="px-4 py-2 text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <i className="fa-solid fa-pen mr-2"></i>
            {t('functionDetail.edit')}
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <i className="fa-solid fa-trash mr-2"></i>
            {t('functionDetail.delete')}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-triangle-exclamation text-red-600 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-stone-900">
                    {t('functionDetail.deleteModal.title')}
                  </h3>
                </div>
              </div>
              <p className="text-stone-600 mb-2">
                {t('functionDetail.deleteModal.message', { name: fn.name })}
              </p>
              <p className="text-sm text-stone-500 bg-stone-50 p-3 rounded-lg">
                <i className="fa-solid fa-info-circle mr-2 text-stone-400"></i>
                {t('functionDetail.deleteModal.warning')}
              </p>
            </div>
            <div className="flex gap-3 p-4 bg-stone-50 border-t border-stone-200">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteFunction.isPending}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-stone-600 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors disabled:opacity-50"
              >
                {t('functionDetail.deleteModal.cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteFunction.isPending}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleteFunction.isPending ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    {t('functionDetail.deleteModal.deleting')}
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-trash"></i>
                    {t('functionDetail.deleteModal.confirm')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="text-xs text-stone-400 mb-1">{t('functionDetail.stats.qps')}</div>
          <div className="text-2xl font-bold text-stone-800">{fn.recentStats.qps.toFixed(1)}</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="text-xs text-stone-400 mb-1">{t('functionDetail.stats.avgLatency')}</div>
          <div className="text-2xl font-bold text-stone-800">{formatLatency(fn.recentStats.avgLatencyMs)}</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="text-xs text-stone-400 mb-1">{t('functionDetail.stats.errorRate')}</div>
          <div className="text-2xl font-bold text-stone-800">{formatErrorRate(fn.recentStats.errorRate)}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-stone-200">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              <i className={`fa-solid ${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab 
          fn={fn}
          functionId={functionId || ''}
          timeSeriesData={functionStats?.history ? functionStats.history as typeof mockTimeSeriesData : undefined}
        />
      )}
      {activeTab === 'run-logs' && functionId && <RunLogsTab functionId={functionId} />}
      {activeTab === 'triggers' && <TriggersTab />}
      {activeTab === 'env-secrets' && <EnvSecretsTab />}
    </div>
  )
}

// Overview Tab Component
function OverviewTab({ 
  fn,
  functionId,
  timeSeriesData 
}: { 
  fn: typeof mockFunctionDetail
  functionId: string
  timeSeriesData?: TimeSeriesPoint[]
}) {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  
  // 함수 실행 로그 조회 (15초마다 갱신 - API 부하 감소)
  const { data: runsData, isLoading: isLoadingRuns, error: runsError } = useFunctionRuns({ 
    functionId, 
    refetchInterval: 15000 // 15초마다 갱신
  })
  
  const runs = runsData?.content || []
  
  // 로그 상세 조회
  const { data: logDetail, isLoading: isLoadingLogDetail } = useFunctionLogDetail({
    functionId,
    requestId: selectedRequestId || '',
    enabled: !!selectedRequestId,
  })

  const getLevelColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-700'
      case 'failed': return 'bg-red-100 text-red-700'
      default: return 'bg-stone-100 text-stone-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Row 1: Router Decision + Warm Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RouterDecisionCard decision={mockLatestDecision} />
        <WarmStatusBar
          desiredWarm={fn.warmStatus.desiredWarm}
          currentWarm={fn.warmStatus.currentWarm}
        />
      </div>

      {/* Row 2: QPS/Warm Chart */}
      <div className="space-y-3">
        <QpsWarmChart data={timeSeriesData || mockTimeSeriesData} />
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800 flex items-start gap-2">
            <i className="fa-solid fa-lightbulb text-amber-500 mt-0.5"></i>
            <span>
              <span className="font-semibold">예열 전략:</span> 예측 QPS(보라 점선)가 올라가는 시점 이전에 Router가 desiredWarm(초록 계단)을 미리 올려 Cold Start를 방지합니다.
            </span>
          </p>
        </div>
      </div>

      {/* Row 3: 시간대별 트래픽 패턴 */}
      <TrafficHeatmap data={mockHeatmapData} />

      {/* Row 4: 실행 로그 */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-800 flex items-center gap-2">
            <i className="fa-solid fa-scroll text-stone-500"></i>
            실행 로그
          </h3>
        </div>
        {isLoadingRuns && (
          <div className="p-6 text-center text-stone-500">
            <i className="fa-solid fa-spinner fa-spin mr-2"></i>
            로그 로딩 중...
          </div>
        )}
        {!isLoadingRuns && runsError && (
          <div className="p-6 text-center text-red-600">
            <i className="fa-solid fa-triangle-exclamation mr-2"></i>
            로그를 불러올 수 없습니다.
          </div>
        )}
        {!isLoadingRuns && !runsError && runs.length === 0 && (
          <div className="p-6 text-center text-stone-500">
            <i className="fa-solid fa-inbox mr-2"></i>
            실행 로그가 없습니다.
          </div>
        )}
        {!isLoadingRuns && runs.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {runs.map((run) => (
              <div 
                key={run.requestId} 
                onClick={() => setSelectedRequestId(run.requestId)}
                className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg font-mono text-sm cursor-pointer hover:bg-stone-100 transition-colors"
              >
                <span className="text-xs text-stone-400 whitespace-nowrap">
                  {formatTimeKST(run.requestAt)}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getLevelColor(run.status)}`}>
                  {run.status.toUpperCase()}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  run.mode === 'warm' 
                    ? 'bg-blue-100 text-blue-700' 
                    : run.mode === 'cold_fail'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {run.mode === 'cold_fail' ? 'COLD FAIL' : run.mode.toUpperCase()}
                </span>
                <span className="text-stone-700 flex-1">
                  {run.status === 'success' ? 'Execution completed' : 'Execution failed'}
                </span>
                <span className="text-xs text-stone-400">
                  {run.duration < 1 
                    ? `${Math.round(run.duration * 1000)}ms` 
                    : `${run.duration.toFixed(2)}s`}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedRequestId(run.requestId)
                  }}
                  className="text-amber-600 hover:text-amber-700 text-xs"
                  title="View detailed logs"
                >
                  <i className="fa-solid fa-eye"></i>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedRequestId && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedRequestId(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-stone-800 flex items-center gap-2">
                  <i className="fa-solid fa-file-lines text-amber-500"></i>
                  실행 로그 상세
                </h3>
                <p className="text-xs text-stone-500 mt-1 font-mono">{selectedRequestId}</p>
              </div>
              <button
                onClick={() => setSelectedRequestId(null)}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <i className="fa-solid fa-times text-stone-500"></i>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingLogDetail ? (
                <div className="text-center py-8">
                  <i className="fa-solid fa-spinner fa-spin text-amber-500 text-2xl mb-2"></i>
                  <p className="text-stone-500">로딩 중...</p>
                </div>
              ) : logDetail ? (
                <pre className="bg-stone-900 text-stone-100 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                  {logDetail}
                </pre>
              ) : (
                <div className="text-center py-8 text-stone-500">
                  <i className="fa-solid fa-exclamation-circle mb-2"></i>
                  <p>로그 상세 정보를 사용할 수 없습니다.</p>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setSelectedRequestId(null)}
                className="px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Run & Logs Tab Component
function RunLogsTab({ functionId }: { functionId: string }) {
  const [requestBody, setRequestBody] = useState('{"test": true}')
  const [isExecuting, setIsExecuting] = useState(false)
  const [executeResult, setExecuteResult] = useState<any>(null)
  const [streamLogs, setStreamLogs] = useState<string[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [stopStream, setStopStream] = useState<(() => void) | null>(null)
  
  // 함수 실행 hook
  const executeFunction = useExecuteFunction()
  const { executeStream } = useExecuteFunctionStream()
  
  const handleRun = async () => {
    if (!functionId) return
    
    setIsExecuting(true)
    setExecuteResult(null)
    try {
      let args = {}
      try {
        args = JSON.parse(requestBody)
      } catch (e) {
        alert('Invalid JSON format')
        setIsExecuting(false)
        return
      }
      
      const result = await executeFunction.mutateAsync({
        functionId,
        args,
      })
      
      setExecuteResult(result)
      setRequestBody('{"test": true}') // 초기화
    } catch (error) {
      console.error('Failed to execute function:', error)
      setExecuteResult({ error: error instanceof Error ? error.message : String(error) })
    } finally {
      setIsExecuting(false)
    }
  }
  
  const handleStream = async () => {
    if (!functionId) return
    
    // 이미 스트리밍 중이면 중지
    if (isStreaming && stopStream) {
      stopStream()
      setStopStream(null)
      setIsStreaming(false)
      return
    }
    
    setIsStreaming(true)
    setStreamLogs([])
    try {
      let args = {}
      try {
        args = JSON.parse(requestBody)
      } catch (e) {
        alert('Invalid JSON format')
        setIsStreaming(false)
        return
      }
      
      // SSE 스트리밍 시작
      const cancel = await executeStream(
        {
          functionId,
          args,
        },
        {
          onConnect: (data) => {
            setStreamLogs(prev => [...prev, `[CONNECT] ${data}`])
          },
          onPing: () => {
            // ping은 무시
          },
          onLog: (data) => {
            setStreamLogs(prev => [...prev, data])
          },
          onResult: (data) => {
            try {
              const result = JSON.parse(data)
              setStreamLogs(prev => [...prev, `[RESULT] ${JSON.stringify(result, null, 2)}`])
            } catch {
              setStreamLogs(prev => [...prev, `[RESULT] ${data}`])
            }
            setIsStreaming(false)
            setStopStream(null)
          },
          onError: (error) => {
            setStreamLogs(prev => [...prev, `[ERROR] ${error.message}`])
            setIsStreaming(false)
            setStopStream(null)
          },
          onClose: () => {
            setIsStreaming(false)
            setStopStream(null)
          },
        }
      )
      
      setStopStream(() => cancel)
    } catch (error) {
      console.error('Failed to stream function:', error)
      setStreamLogs(prev => [...prev, `[ERROR] ${error instanceof Error ? error.message : String(error)}`])
      setIsStreaming(false)
      setStopStream(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Request Body */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-code text-stone-500"></i>
          요청 본문
        </h3>
        <textarea
          value={requestBody}
          onChange={(e) => setRequestBody(e.target.value)}
          className="w-full h-32 px-4 py-3 border border-stone-200 rounded-lg font-mono text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          placeholder='{"key": "value"}'
        />
      </div>

      {/* Execute Function - /function/invoke */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-800 flex items-center gap-2">
            <i className="fa-solid fa-play text-green-500"></i>
            실행
          </h3>
          <button 
            onClick={handleRun}
            disabled={isExecuting || executeFunction.isPending}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isExecuting || executeFunction.isPending ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                실행 중...
              </>
            ) : (
              <>
                <i className="fa-solid fa-play mr-2"></i>
                실행
              </>
            )}
          </button>
        </div>
        
        {/* Execute Response */}
        {executeResult && (
          <div className="mt-4 p-4 bg-stone-50 rounded-lg border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-600">응답</span>
            </div>
            <pre className="bg-stone-900 text-stone-100 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">
              {executeResult.error 
                ? executeResult.error 
                : JSON.stringify(executeResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Stream Logs - /function/invoke/stream */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-800 flex items-center gap-2">
            <i className="fa-solid fa-stream text-blue-500"></i>
            로그
          </h3>
          <button 
            onClick={handleStream}
            className={`px-4 py-2 text-white font-semibold rounded-lg hover:shadow-lg transition-all text-sm ${
              isStreaming
                ? 'bg-gradient-to-r from-red-500 to-pink-500'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500'
            }`}
          >
            {isStreaming ? (
              <>
                <i className="fa-solid fa-stop mr-2"></i>
                중지
              </>
            ) : (
              <>
                <i className="fa-solid fa-play mr-2"></i>
                스트리밍 시작
              </>
            )}
          </button>
        </div>
        
        {/* Stream Logs Output */}
        <div className="mt-4 p-4 bg-stone-900 rounded-lg border border-stone-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-400">스트리밍 로그</span>
            {streamLogs.length > 0 && (
              <button
                onClick={() => setStreamLogs([])}
                className="text-xs text-stone-400 hover:text-stone-200"
              >
                <i className="fa-solid fa-trash mr-1"></i>
                초기화
              </button>
            )}
          </div>
          <div className="font-mono text-sm text-stone-100 max-h-96 overflow-y-auto">
            {streamLogs.length === 0 ? (
              <div className="text-stone-500 italic">스트리밍 로그가 여기에 표시됩니다.</div>
            ) : (
              streamLogs.map((log, idx) => (
                <div key={idx} className="py-1 whitespace-pre-wrap">{log}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Triggers Tab Component
function TriggersTab() {
  const { t } = useTranslation()
  const mockTriggers = [
    { id: 1, type: 'HTTP', endpoint: '/api/process-image', method: 'POST', enabled: true },
    { id: 2, type: 'CRON', schedule: '0 */6 * * *', description: t('functionDetail.triggers.everyNHours', { count: 6 }), enabled: true },
    { id: 3, type: 'EVENT', source: 'S3', event: 's3:ObjectCreated:*', enabled: false },
  ]

  return (
    <div className="space-y-6">
      {/* Add Trigger Button */}
      <div className="flex justify-end">
        <button className="px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors">
          <i className="fa-solid fa-plus mr-2"></i>
          {t('functionDetail.triggers.addTrigger')}
        </button>
      </div>

      {/* Triggers List */}
      <div className="grid gap-4">
        {mockTriggers.map((trigger) => (
          <div key={trigger.id} className="bg-white rounded-xl border border-stone-200 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  trigger.type === 'HTTP' ? 'bg-blue-100' :
                  trigger.type === 'CRON' ? 'bg-purple-100' : 'bg-green-100'
                }`}>
                  <i className={`fa-solid ${
                    trigger.type === 'HTTP' ? 'fa-globe text-blue-600' :
                    trigger.type === 'CRON' ? 'fa-clock text-purple-600' : 'fa-bolt text-green-600'
                  }`}></i>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-800">{trigger.type}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      trigger.enabled ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'
                    }`}>
                      {trigger.enabled ? t('functionDetail.triggers.active') : t('functionDetail.triggers.disabled')}
                    </span>
                  </div>
                  <div className="text-sm text-stone-500 mt-1">
                    {trigger.type === 'HTTP' && (
                      <span><span className="font-medium text-stone-600">{trigger.method}</span> {trigger.endpoint}</span>
                    )}
                    {trigger.type === 'CRON' && (
                      <span><code className="bg-stone-100 px-1 rounded">{trigger.schedule}</code> - {trigger.description}</span>
                    )}
                    {trigger.type === 'EVENT' && (
                      <span>{trigger.source}: {trigger.event}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">
                  <i className="fa-solid fa-pen"></i>
                </button>
                <button className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h4 className="font-semibold text-stone-800 mb-2 flex items-center gap-2">
          <i className="fa-solid fa-lightbulb text-amber-500"></i>
          {t('functionDetail.triggers.triggerTypes')}
        </h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-stone-600">
          <div>
            <span className="font-medium">HTTP:</span> {t('functionDetail.triggers.httpDesc')}
          </div>
          <div>
            <span className="font-medium">CRON:</span> {t('functionDetail.triggers.cronDesc')}
          </div>
          <div>
            <span className="font-medium">EVENT:</span> {t('functionDetail.triggers.eventDesc')}
          </div>
        </div>
      </div>
    </div>
  )
}

// Env & Secrets Tab Component
function EnvSecretsTab() {
  const { t } = useTranslation()
  const mockEnvVars = [
    { key: 'NODE_ENV', value: 'production', isSecret: false },
    { key: 'LOG_LEVEL', value: 'info', isSecret: false },
    { key: 'MAX_WORKERS', value: '4', isSecret: false },
  ]

  const mockSecrets = [
    { key: 'DATABASE_URL', lastUpdated: '2024-12-01' },
    { key: 'API_KEY', lastUpdated: '2024-11-28' },
    { key: 'AWS_SECRET_KEY', lastUpdated: '2024-11-15' },
  ]

  return (
    <div className="space-y-6">
      {/* Environment Variables */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-800 flex items-center gap-2">
            <i className="fa-solid fa-sliders text-stone-500"></i>
            {t('functionDetail.envSecrets.environmentVariables')}
          </h3>
          <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
            <i className="fa-solid fa-plus mr-1"></i>
            {t('functionDetail.envSecrets.addVariable')}
          </button>
        </div>
        <div className="space-y-2">
          {mockEnvVars.map((env, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3 bg-stone-50 rounded-lg">
              <code className="font-mono text-sm font-semibold text-stone-700 min-w-[140px]">{env.key}</code>
              <span className="text-stone-400">=</span>
              <code className="font-mono text-sm text-stone-600 flex-1">{env.value}</code>
              <button className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-200 rounded transition-colors">
                <i className="fa-solid fa-pen text-xs"></i>
              </button>
              <button className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                <i className="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Secrets */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-800 flex items-center gap-2">
            <i className="fa-solid fa-key text-amber-500"></i>
            {t('functionDetail.envSecrets.secrets')}
          </h3>
          <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
            <i className="fa-solid fa-plus mr-1"></i>
            {t('functionDetail.envSecrets.addSecret')}
          </button>
        </div>
        <div className="space-y-2">
          {mockSecrets.map((secret, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3 bg-amber-50/50 rounded-lg border border-amber-100">
              <i className="fa-solid fa-lock text-amber-500"></i>
              <code className="font-mono text-sm font-semibold text-stone-700 min-w-[140px]">{secret.key}</code>
              <span className="text-stone-400">=</span>
              <span className="font-mono text-sm text-stone-400 flex-1">••••••••••••</span>
              <span className="text-xs text-stone-400">{t('functionDetail.envSecrets.updated')}: {secret.lastUpdated}</span>
              <button className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-amber-100 rounded transition-colors">
                <i className="fa-solid fa-pen text-xs"></i>
              </button>
              <button className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                <i className="fa-solid fa-trash text-xs"></i>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security Note */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
        <h4 className="font-semibold text-stone-800 mb-2 flex items-center gap-2">
          <i className="fa-solid fa-shield-halved text-amber-500"></i>
          {t('functionDetail.envSecrets.securityNote')}
        </h4>
        <ul className="text-sm text-stone-600 space-y-1 list-disc list-inside">
          <li>{t('functionDetail.envSecrets.securityItems.encrypted')}</li>
          <li>{t('functionDetail.envSecrets.securityItems.injected')}</li>
          <li>{t('functionDetail.envSecrets.securityItems.recommendation')}</li>
        </ul>
      </div>
    </div>
  )
}
