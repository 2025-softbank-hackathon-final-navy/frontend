import type {
  FunctionSummary,
  FunctionDetail,
  RouterDecision,
  RouterDecisionLog,
  TimeSeriesPoint,
  HeatmapCell,
  PredictionPoint,
  NodeStatus,
} from '../types/routing'

// ===== 함수 목록 Mock 데이터 =====
export const mockFunctions: FunctionSummary[] = [
  {
    id: 'fn-001',
    name: 'image-processor',
    language: 'python',
    description: 'GPU 기반 이미지 처리 함수',
    status: 'HOT',
    lastExecutedAt: new Date(Date.now() - 30000).toISOString(),
    tags: ['gpu', 'ml', 'image'],
    recentQps: 12.5,
    errorRate: 0.02,
  },
  {
    id: 'fn-002',
    name: 'data-aggregator',
    language: 'node',
    description: '실시간 데이터 집계 함수',
    status: 'STABLE',
    lastExecutedAt: new Date(Date.now() - 60000).toISOString(),
    tags: ['data', 'realtime'],
    recentQps: 8.3,
    errorRate: 0.01,
  },
  {
    id: 'fn-003',
    name: 'payment-validator',
    language: 'go',
    description: '결제 검증 및 처리',
    status: 'STABLE',
    lastExecutedAt: new Date(Date.now() - 120000).toISOString(),
    tags: ['payment', 'critical'],
    recentQps: 5.2,
    errorRate: 0.005,
  },
  {
    id: 'fn-004',
    name: 'ml-inference',
    language: 'python',
    description: 'ML 모델 추론 서비스',
    status: 'HOT',
    lastExecutedAt: new Date(Date.now() - 15000).toISOString(),
    tags: ['gpu', 'ml', 'inference'],
    recentQps: 18.7,
    errorRate: 0.03,
  },
  {
    id: 'fn-005',
    name: 'log-processor',
    language: 'node',
    description: '로그 수집 및 분석',
    status: 'COLD',
    lastExecutedAt: new Date(Date.now() - 3600000).toISOString(),
    tags: ['logging', 'analytics'],
    recentQps: 0.5,
    errorRate: 0.0,
  },
]

// ===== 함수 상세 Mock 데이터 =====
export const mockFunctionDetail: FunctionDetail = {
  id: 'fn-001',
  name: 'image-processor',
  language: 'python',
  description: 'GPU 기반 이미지 처리 함수 - ResNet50 모델 사용',
  poolType: 'GPU',
  tags: ['gpu', 'ml', 'image', 'latency-sensitive'],
  createdAt: '2024-01-15T09:00:00Z',
  recentStats: {
    qps: 9.6,
    avgLatencyMs: 480,
    errorRate: 0.03,
    p99LatencyMs: 1200,
  },
  warmStatus: {
    desiredWarm: 7,
    currentWarm: 5,
  },
}

// ===== 최신 라우터 결정 Mock =====
export const mockLatestDecision: RouterDecision = {
  runId: 'run-abc123',
  functionId: 'fn-001',
  poolType: 'GPU',
  nodeId: 'gpu-node-1',
  desiredWarm: 7,
  priority: 'HIGH',
  stats: {
    qps: 9.6,
    avgLatencyMs: 480,
    errorRate: 0.03,
  },
  decidedAt: new Date().toISOString(),
}

// ===== 라우터 결정 히스토리 Mock =====
export const mockDecisionHistory: RouterDecisionLog[] = Array.from({ length: 20 }, (_, i) => ({
  id: `log-${i + 1}`,
  runId: `run-${String(i + 1).padStart(3, '0')}`,
  functionId: 'fn-001',
  poolType: i % 5 === 0 ? 'CPU' : 'GPU' as const,
  nodeId: i % 5 === 0 ? 'cpu-node-1' : `gpu-node-${(i % 2) + 1}`,
  desiredWarm: Math.floor(5 + Math.random() * 5),
  currentWarm: Math.floor(3 + Math.random() * 4),
  qps: 8 + Math.random() * 4,
  latencyMs: 400 + Math.random() * 200,
  priority: i % 3 === 0 ? 'HIGH' : i % 3 === 1 ? 'MEDIUM' : 'LOW' as const,
  decidedAt: new Date(Date.now() - i * 180000).toISOString(), // 3분 간격
}))

// ===== QPS/Warm 시계열 데이터 (최근 1시간) =====
export const mockTimeSeriesData: TimeSeriesPoint[] = Array.from({ length: 60 }, (_, i) => {
  const baseQps = 8
  const peakHour = 20 // 20시 피크
  const currentHour = new Date().getHours()
  const hourDiff = Math.abs(currentHour - peakHour)
  const peakFactor = Math.max(0, 1 - hourDiff * 0.1)
  
  const qps = baseQps + peakFactor * 6 + Math.sin(i * 0.3) * 2 + Math.random() * 2
  const desiredWarm = Math.ceil(qps / 2) + 2
  
  return {
    timestamp: new Date(Date.now() - (59 - i) * 60000).toISOString(),
    qps: Math.round(qps * 10) / 10,
    desiredWarm,
    currentWarm: Math.max(desiredWarm - Math.floor(Math.random() * 3), 3),
    latencyMs: 400 + Math.random() * 150,
  }
})

// ===== 요일/시간별 히트맵 데이터 =====
export const mockHeatmapData: HeatmapCell[] = []
for (let day = 0; day < 7; day++) {
  for (let hour = 0; hour < 24; hour++) {
    // 평일 9-18시, 저녁 20-22시에 트래픽 높음
    let baseQps = 2
    const isWeekday = day >= 1 && day <= 5
    
    if (isWeekday && hour >= 9 && hour <= 18) {
      baseQps = 8 + Math.random() * 4
    }
    if (hour >= 20 && hour <= 22) {
      baseQps = 12 + Math.random() * 6 // 저녁 피크
    }
    if (hour >= 0 && hour <= 6) {
      baseQps = 0.5 + Math.random() * 1 // 새벽 저조
    }
    
    mockHeatmapData.push({
      dayOfWeek: day,
      hour,
      avgQps: Math.round(baseQps * 10) / 10,
      avgLatencyMs: 400 + Math.random() * 200,
    })
  }
}

// ===== 예측 vs 실제 데이터 (현재 기준 ±30분) =====
export const mockPredictionData: PredictionPoint[] = Array.from({ length: 61 }, (_, i) => {
  const minuteOffset = i - 30 // -30분 ~ +30분
  const timestamp = new Date(Date.now() + minuteOffset * 60000).toISOString()
  const isPast = minuteOffset <= 0
  
  // 피크 시간대 시뮬레이션 (현재 시간 기준 +10분에 피크)
  const peakMinute = 10
  const distFromPeak = Math.abs(minuteOffset - peakMinute)
  const peakFactor = Math.max(0, 1 - distFromPeak * 0.03)
  
  const baseQps = 8 + peakFactor * 8
  const actualQps = isPast ? baseQps + Math.random() * 2 - 1 : null
  const predictedQps = baseQps + (isPast ? 0 : Math.random() * 1.5)
  
  return {
    timestamp,
    actualQps: actualQps ? Math.round(actualQps * 10) / 10 : null,
    predictedQps: Math.round(predictedQps * 10) / 10,
    desiredWarm: Math.ceil(predictedQps / 2) + 2,
  }
})

// ===== 노드 상태 Mock =====
export const mockNodeStatus: NodeStatus[] = [
  {
    nodeId: 'cpu-node-1',
    poolType: 'CPU',
    freeCpuPercent: 60,
    freeMemGiB: 4,
    currentWarm: 3,
    runningFunctionsCount: 5,
    status: 'HEALTHY',
  },
  {
    nodeId: 'cpu-node-2',
    poolType: 'CPU',
    freeCpuPercent: 45,
    freeMemGiB: 3.2,
    currentWarm: 4,
    runningFunctionsCount: 7,
    status: 'HEALTHY',
  },
  {
    nodeId: 'gpu-node-1',
    poolType: 'GPU',
    freeCpuPercent: 30,
    freeMemGiB: 8,
    currentWarm: 7,
    runningFunctionsCount: 12,
    status: 'BUSY',
  },
  {
    nodeId: 'gpu-node-2',
    poolType: 'GPU',
    freeCpuPercent: 55,
    freeMemGiB: 10,
    currentWarm: 5,
    runningFunctionsCount: 8,
    status: 'HEALTHY',
  },
  {
    nodeId: 'large-node-1',
    poolType: 'LARGE',
    freeCpuPercent: 70,
    freeMemGiB: 24,
    currentWarm: 2,
    runningFunctionsCount: 3,
    status: 'HEALTHY',
  },
]

// 헬퍼 함수들
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'STABLE':
    case 'HEALTHY':
      return 'bg-green-100 text-green-700'
    case 'HOT':
    case 'BUSY':
      return 'bg-amber-100 text-amber-700'
    case 'ERROR_PRONE':
    case 'UNHEALTHY':
      return 'bg-red-100 text-red-700'
    case 'COLD':
      return 'bg-stone-100 text-stone-500'
    default:
      return 'bg-stone-100 text-stone-600'
  }
}

export const getPoolColor = (poolType: string) => {
  switch (poolType) {
    case 'GPU':
      return 'bg-purple-100 text-purple-700'
    case 'CPU':
      return 'bg-blue-100 text-blue-700'
    case 'LARGE':
      return 'bg-orange-100 text-orange-700'
    default:
      return 'bg-stone-100 text-stone-600'
  }
}

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'CRITICAL':
      return 'bg-red-100 text-red-700'
    case 'HIGH':
      return 'bg-amber-100 text-amber-700'
    case 'MEDIUM':
      return 'bg-blue-100 text-blue-700'
    case 'LOW':
      return 'bg-stone-100 text-stone-500'
    default:
      return 'bg-stone-100 text-stone-600'
  }
}

