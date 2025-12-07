import { useQuery } from '@tanstack/react-query'
import apiClient from '../../instance'
import {
  GetExecutionHistoryResponseBackendSchema,
  type ExecutionHistoryItem,
  type ExecutionHistoryItemBackend,
} from '../dto'
import { functionKeys } from './useFunction'

/**
 * 함수 실행 히스토리 조회 Query
 * 
 * GET /function/{function_id}/logs
 * 
 * 실제 백엔드 API 스펙:
 * - 엔드포인트: GET /function/{function_id}/logs
 * - 응답: { content: [...], pageable: {...}, totalPages: number, totalElements: number }
 */

interface UseFunctionRunsOptions {
  functionId: string
  refetchInterval?: number // 주기적 갱신 간격 (ms)
}

interface UseFunctionRunsResult {
  content: ExecutionHistoryItem[]
  totalPages: number
  totalElements: number
}

// 백엔드 응답을 프론트엔드 형식으로 변환
function transformBackendToFrontend(backendItem: ExecutionHistoryItemBackend): ExecutionHistoryItem {
  // execution_type 매핑: warm -> warm, cold -> cold, cold_fail -> cold_fail
  const mode = backendItem.execution_type as 'warm' | 'cold' | 'cold_fail'
  
  // status 매핑: success -> success, failed/error -> failed
  const status = backendItem.status === 'success' ? 'success' : 'failed'
  
  return {
    requestId: backendItem.request_id,
    duration: backendItem.duration,
    mode,
    requestAt: backendItem.request_at,
    status,
  }
}

// API 함수
async function getFunctionRuns(
  functionId: string
): Promise<UseFunctionRunsResult> {
  const response = await apiClient.get(`/function/${functionId}/logs`, {
    params: {
      sort: 'requestAt,desc', // camelCase 필드명 사용
    },
  })
  
  // 백엔드 응답 형식 검증
  const parsed = GetExecutionHistoryResponseBackendSchema.parse(response.data)
  
  // 프론트엔드 형식으로 변환
  return {
    content: parsed.content.map(transformBackendToFrontend),
    totalPages: parsed.totalPages,
    totalElements: parsed.totalElements,
  }
}

// React Query Hook
export function useFunctionRuns({ 
  functionId, 
  refetchInterval 
}: UseFunctionRunsOptions) {
  return useQuery({
    queryKey: [...functionKeys.runs(functionId)],
    queryFn: () => getFunctionRuns(functionId),
    enabled: !!functionId,
    staleTime: 1000 * 15, // 15초 - 캐싱 활용도 증가
    refetchInterval: refetchInterval, // 주기적 갱신 (ms)
    refetchIntervalInBackground: false, // 백그라운드에서 갱신하지 않음
    retry: 2,
  })
}

