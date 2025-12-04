import { useQuery } from '@tanstack/react-query'
import apiClient from '../../instance'
import {
  GetExecutionHistoryResponseSchema,
  type ExecutionHistoryItem,
} from '../dto'
import { functionKeys } from './useFunction'

/**
 * 함수 실행 히스토리 조회 Query
 * 
 * GET /api/functions/{functionId}/runs?limit=20
 */

interface UseFunctionRunsOptions {
  functionId: string
  limit?: number
}

// API 함수
async function getFunctionRuns(
  functionId: string,
  limit: number = 20
): Promise<ExecutionHistoryItem[]> {
  const response = await apiClient.get(`/api/functions/${functionId}/runs`, {
    params: { limit },
  })
  
  // Zod로 응답 검증
  const parsed = GetExecutionHistoryResponseSchema.parse(response.data)
  return parsed.data
}

// React Query Hook
export function useFunctionRuns({ functionId, limit = 20 }: UseFunctionRunsOptions) {
  return useQuery({
    queryKey: [...functionKeys.runs(functionId), { limit }],
    queryFn: () => getFunctionRuns(functionId, limit),
    enabled: !!functionId,
    staleTime: 1000 * 30, // 30초 (실행 기록은 더 자주 갱신)
    retry: 2,
  })
}

