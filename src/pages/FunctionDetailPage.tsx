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

type Tab = 'overview' | 'traffic'

export function FunctionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const fn = mockFunctionDetail

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
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            <i className="fa-solid fa-gauge-high mr-2"></i>
            Overview
          </button>
          <button
            onClick={() => setActiveTab('traffic')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'traffic'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            <i className="fa-solid fa-fire mr-2"></i>
            Traffic & Pre-warm
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
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

          {/* Row 3: History Table */}
          <RoutingHistoryTable logs={mockDecisionHistory} />
        </div>
      )}

      {activeTab === 'traffic' && (
        <div className="space-y-6">
          {/* Heatmap */}
          <TrafficHeatmap data={mockHeatmapData} />

          {/* Prediction Chart */}
          <PredictionChart data={mockPredictionData} />

          {/* Explanation Card */}
          <div className="bg-gradient-to-r from-purple-50 to-amber-50 rounded-xl p-6 border border-purple-100">
            <h4 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
              <i className="fa-solid fa-lightbulb text-amber-500"></i>
              패턴 기반 예열(Pre-warm) 전략
            </h4>
            <div className="text-sm text-stone-600 space-y-2">
              <p>
                1. <strong>최근 7일</strong>의 시간대별 QPS를 수집하여 트래픽 패턴을 분석합니다.
              </p>
              <p>
                2. <strong>특정 버킷</strong>(예: 20:00~20:15)에 대한 expected_qps를 계산합니다.
              </p>
              <p>
                3. 피크 시간대 <strong>5~10분 전</strong>부터 Router가 desiredWarm을 올려 Cold Start를 방지합니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

