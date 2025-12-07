import { useQuery } from '@tanstack/react-query'
import apiClient from '../../instance'
import type { FunctionSummary } from '../dto'
import { functionKeys } from './useFunction'
import type { TimeSeriesPoint } from '../../../types/routing'

/**
 * 단일 함수 통계 조회 Query
 * 
 * GET /function/{function_id}/stats
 * 
 * 실제 백엔드 API 스펙:
 * - 엔드포인트: GET /function/{function_id}/stats
 * - 응답: { function_id, function_name, description, runtime, timeout, last_executed, status, total_requests, error_rate, qps, avg_latency, history }
 */

interface HistoryItem {
  timestamp: string
  qps: number
  desired_replicas: number
  current_replicas: number
}

interface FunctionStatsResponse {
  function_id: string
  function_name: string
  description?: string
  runtime: string
  timeout: number
  last_executed?: string
  status: string // 'HOT' | 'STABLE' | 'COLD'
  total_requests: number
  error_rate: number
  qps?: number // QPS - 초당 요청 수
  avg_latency?: number // 평균 지연시간, 초 단위
  history?: HistoryItem[] // 60분치 히스토리 데이터
}

// 확장된 통계 정보 (qps, avg_latency, history 포함)
export interface FunctionStatsWithMetrics extends FunctionSummary {
  qps?: number // QPS - 초당 요청 수
  avgLatencyMs?: number // 평균 지연시간 (밀리초 단위)
  history?: TimeSeriesPoint[] // 시계열 데이터 (QpsWarmChart용)
}

// API 함수
async function getFunctionStats(functionId: string): Promise<FunctionStatsWithMetrics> {
  const response = await apiClient.get<FunctionStatsResponse>(`/function/${functionId}/stats`)
  
  const item = response.data
  
  // 백엔드 런타임을 프론트엔드 형식으로 변환
  const runtimeMap: Record<string, 'nodejs-18' | 'python-3.11' | 'go-1.22'> = {
    'node': 'nodejs-18',
    'python': 'python-3.11',
    'go': 'go-1.22',
  }
  const runtime = runtimeMap[item.runtime.toLowerCase()] || 'python-3.11'
  
  // avg_latency를 초 단위에서 밀리초 단위로 변환
  const avgLatencyMs = item.avg_latency !== undefined ? item.avg_latency * 1000 : undefined
  
  // history 배열을 TimeSeriesPoint 배열로 변환
  const history: TimeSeriesPoint[] | undefined = item.history?.map((h) => ({
    timestamp: h.timestamp,
    qps: h.qps,
    desiredWarm: h.desired_replicas,
    currentWarm: h.current_replicas,
  }))
  
  // qps는 history의 마지막 항목(lastUpdated)에서 가져오기
  const qps = history && history.length > 0 
    ? history[history.length - 1].qps 
    : item.qps
  
  // 백엔드 응답을 DTO 형식으로 변환
  return {
    functionId: item.function_id,
    name: item.function_name,
    runtime,
    description: item.description,
    status: item.status as 'HOT' | 'STABLE' | 'COLD',
    timeout: item.timeout,
    invocations: item.total_requests,
    errorRate: item.error_rate,
    lastDeployedAt: item.last_executed || new Date().toISOString(),
    updatedAt: item.last_executed || new Date().toISOString(),
    qps,
    avgLatencyMs,
    history,
  }
}

interface UseFunctionStatsOptions {
  functionId: string | undefined
  refetchInterval?: number // 주기적 갱신 간격 (ms)
  enabled?: boolean
}

// React Query Hook
export function useFunctionStats({ 
  functionId, 
  refetchInterval,
  enabled = true 
}: UseFunctionStatsOptions) {
  return useQuery<FunctionStatsWithMetrics>({
    queryKey: [...functionKeys.detail(functionId ?? ''), 'stats'],
    queryFn: () => getFunctionStats(functionId!),
    enabled: enabled && !!functionId,
    staleTime: 1000 * 10, // 10초 - 캐싱 활용도 증가
    refetchInterval: refetchInterval, // 주기적 갱신 (ms)
    refetchIntervalInBackground: false, // 백그라운드에서 갱신하지 않음
    retry: 2,
  })
}

