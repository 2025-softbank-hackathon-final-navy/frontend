import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  RouterDecisionCard,
  WarmStatusBar,
  RoutingHistoryTable,
  QpsWarmChart,
  TrafficHeatmap,
  PredictionChart,
} from '../components/routing'
import {
  mockFunctionDetail,
  mockLatestDecision,
  mockDecisionHistory,
  mockTimeSeriesData,
  mockHeatmapData,
  mockPredictionData,
  getPoolColor,
} from '../data/mockRoutingData'

type Tab = 'overview' | 'run-logs' | 'triggers' | 'env-secrets'

export function FunctionDetailPage() {
  const { id: _id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const fn = mockFunctionDetail

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'fa-gauge-high' },
    { id: 'run-logs', label: 'Run & Logs', icon: 'fa-terminal' },
    { id: 'triggers', label: 'Triggers', icon: 'fa-bolt' },
    { id: 'env-secrets', label: 'Env & Secrets', icon: 'fa-key' },
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
        <button
          onClick={() => navigate(`/functions/${_id}/edit`)}
          className="px-4 py-2 text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
        >
          <i className="fa-solid fa-pen mr-2"></i>
          Edit
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="text-xs text-stone-400 mb-1">QPS (1분)</div>
          <div className="text-2xl font-bold text-stone-800">{fn.recentStats.qps.toFixed(1)}</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="text-xs text-stone-400 mb-1">Avg Latency</div>
          <div className="text-2xl font-bold text-stone-800">{fn.recentStats.avgLatencyMs}ms</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="text-xs text-stone-400 mb-1">Error Rate</div>
          <div className="text-2xl font-bold text-stone-800">{(fn.recentStats.errorRate * 100).toFixed(1)}%</div>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <div className="text-xs text-stone-400 mb-1">P99 Latency</div>
          <div className="text-2xl font-bold text-stone-800">{fn.recentStats.p99LatencyMs}ms</div>
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
      {activeTab === 'overview' && <OverviewTab fn={fn} />}
      {activeTab === 'run-logs' && <RunLogsTab />}
      {activeTab === 'triggers' && <TriggersTab />}
      {activeTab === 'env-secrets' && <EnvSecretsTab />}
    </div>
  )
}

// Overview Tab Component
function OverviewTab({ fn }: { fn: typeof mockFunctionDetail }) {
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
      <QpsWarmChart data={mockTimeSeriesData} />

      {/* Row 3: Traffic & Prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficHeatmap data={mockHeatmapData} />
        <PredictionChart data={mockPredictionData} />
      </div>

      {/* Row 4: History Table */}
      <RoutingHistoryTable logs={mockDecisionHistory} />
    </div>
  )
}

// Run & Logs Tab Component
function RunLogsTab() {
  const mockLogs = [
    { id: 1, timestamp: new Date(Date.now() - 5000).toISOString(), level: 'INFO', message: 'Function executed successfully', duration: 245 },
    { id: 2, timestamp: new Date(Date.now() - 15000).toISOString(), level: 'INFO', message: 'Processing request from user-123', duration: 312 },
    { id: 3, timestamp: new Date(Date.now() - 30000).toISOString(), level: 'WARN', message: 'High memory usage detected', duration: 520 },
    { id: 4, timestamp: new Date(Date.now() - 45000).toISOString(), level: 'INFO', message: 'Function executed successfully', duration: 198 },
    { id: 5, timestamp: new Date(Date.now() - 60000).toISOString(), level: 'ERROR', message: 'Timeout exceeded, retrying...', duration: 3000 },
  ]

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'INFO': return 'bg-blue-100 text-blue-700'
      case 'WARN': return 'bg-amber-100 text-amber-700'
      case 'ERROR': return 'bg-red-100 text-red-700'
      default: return 'bg-stone-100 text-stone-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Run Function */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <h3 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-play text-green-500"></i>
          Run Function
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-2">Request Body (JSON)</label>
            <textarea
              className="w-full h-32 px-4 py-3 border border-stone-200 rounded-lg font-mono text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              placeholder='{"key": "value"}'
              defaultValue='{"test": true}'
            />
          </div>
          <button className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all">
            <i className="fa-solid fa-play mr-2"></i>
            Run Now
          </button>
        </div>
      </div>

      {/* Execution Logs */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-800 flex items-center gap-2">
            <i className="fa-solid fa-scroll text-stone-500"></i>
            Execution Logs
          </h3>
          <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
            <i className="fa-solid fa-rotate-right mr-1"></i>
            Refresh
          </button>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {mockLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg font-mono text-sm">
              <span className="text-xs text-stone-400 whitespace-nowrap">
                {new Date(log.timestamp).toLocaleTimeString('ko-KR')}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getLevelColor(log.level)}`}>
                {log.level}
              </span>
              <span className="text-stone-700 flex-1">{log.message}</span>
              <span className="text-xs text-stone-400">{log.duration}ms</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Triggers Tab Component
function TriggersTab() {
  const mockTriggers = [
    { id: 1, type: 'HTTP', endpoint: '/api/process-image', method: 'POST', enabled: true },
    { id: 2, type: 'CRON', schedule: '0 */6 * * *', description: '매 6시간마다 실행', enabled: true },
    { id: 3, type: 'EVENT', source: 'S3', event: 's3:ObjectCreated:*', enabled: false },
  ]

  return (
    <div className="space-y-6">
      {/* Add Trigger Button */}
      <div className="flex justify-end">
        <button className="px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors">
          <i className="fa-solid fa-plus mr-2"></i>
          Add Trigger
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
                      {trigger.enabled ? 'Active' : 'Disabled'}
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
          트리거 유형
        </h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-stone-600">
          <div>
            <span className="font-medium">HTTP:</span> REST API 엔드포인트로 호출
          </div>
          <div>
            <span className="font-medium">CRON:</span> 일정에 따라 주기적 실행
          </div>
          <div>
            <span className="font-medium">EVENT:</span> 외부 이벤트 소스와 연동
          </div>
        </div>
      </div>
    </div>
  )
}

// Env & Secrets Tab Component
function EnvSecretsTab() {
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
            Environment Variables
          </h3>
          <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
            <i className="fa-solid fa-plus mr-1"></i>
            Add Variable
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
            Secrets
          </h3>
          <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
            <i className="fa-solid fa-plus mr-1"></i>
            Add Secret
          </button>
        </div>
        <div className="space-y-2">
          {mockSecrets.map((secret, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3 bg-amber-50/50 rounded-lg border border-amber-100">
              <i className="fa-solid fa-lock text-amber-500"></i>
              <code className="font-mono text-sm font-semibold text-stone-700 min-w-[140px]">{secret.key}</code>
              <span className="text-stone-400">=</span>
              <span className="font-mono text-sm text-stone-400 flex-1">••••••••••••</span>
              <span className="text-xs text-stone-400">Updated: {secret.lastUpdated}</span>
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
          보안 주의사항
        </h4>
        <ul className="text-sm text-stone-600 space-y-1 list-disc list-inside">
          <li>Secrets는 암호화되어 저장되며, UI에서 값을 확인할 수 없습니다</li>
          <li>함수 실행 시 환경변수로 주입됩니다</li>
          <li>민감한 정보(API 키, DB 비밀번호 등)는 반드시 Secrets로 등록하세요</li>
        </ul>
      </div>
    </div>
  )
}
