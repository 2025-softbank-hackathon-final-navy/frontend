// ===== 라우팅 관련 타입 정의 =====

// Pool 타입
export type PoolType = 'CPU' | 'GPU' | 'LARGE'

// 우선순위
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

// 함수 상태
export type FunctionStatus = 'STABLE' | 'HOT' | 'ERROR_PRONE' | 'COLD'

// 함수 요약 정보 (리스트용)
export interface FunctionSummary {
  id: string
  name: string
  language: 'node' | 'python' | 'go'
  description: string
  status: FunctionStatus
  lastExecutedAt: string
  tags: string[]
  recentQps: number
  errorRate: number
}

// 함수 상세 정보
export interface FunctionDetail {
  id: string
  name: string
  language: 'node' | 'python' | 'go'
  description: string
  poolType: PoolType
  tags: string[]
  createdAt: string
  recentStats: {
    qps: number
    avgLatencyMs: number
    errorRate: number
    p99LatencyMs: number
  }
  warmStatus: {
    desiredWarm: number
    currentWarm: number
  }
}

// 라우터 결정 (실시간)
export interface RouterDecision {
  runId: string
  functionId: string
  poolType: PoolType
  nodeId: string
  desiredWarm: number
  priority: Priority
  stats: {
    qps: number
    avgLatencyMs: number
    errorRate: number
  }
  decidedAt: string
}

// 라우터 결정 로그 (히스토리)
export interface RouterDecisionLog {
  id: string
  runId: string
  functionId: string
  poolType: PoolType
  nodeId: string
  desiredWarm: number
  currentWarm: number
  qps: number
  latencyMs: number
  priority: Priority
  decidedAt: string
}

// QPS/Warm 시계열 데이터
export interface TimeSeriesPoint {
  timestamp: string
  qps: number
  desiredWarm: number
  currentWarm: number
  latencyMs?: number
}

// 요일/시간별 히트맵 데이터
export interface HeatmapCell {
  dayOfWeek: number // 0(일) ~ 6(토)
  hour: number // 0 ~ 23
  avgQps: number
  avgLatencyMs: number
}

// 예측 데이터
export interface PredictionPoint {
  timestamp: string
  actualQps: number | null // 과거만
  predictedQps: number
  desiredWarm: number
}

// 노드 상태
export interface NodeStatus {
  nodeId: string
  poolType: PoolType
  freeCpuPercent: number
  freeMemGiB: number
  currentWarm: number
  runningFunctionsCount: number
  status: 'HEALTHY' | 'BUSY' | 'UNHEALTHY'
}

