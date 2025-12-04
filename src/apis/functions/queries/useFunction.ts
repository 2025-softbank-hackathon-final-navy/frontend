import { useQuery } from '@tanstack/react-query'
import apiClient from '../../instance'
import {
  GetFunctionResponseSchema,
  type FunctionDetail,
} from '../dto'

/**
 * 함수 상세 조회 Query
 * 
 * GET /api/functions/{functionId}
 */

// Query Key Factory
export const functionKeys = {
  all: ['functions'] as const,
  lists: () => [...functionKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...functionKeys.lists(), filters] as const,
  details: () => [...functionKeys.all, 'detail'] as const,
  detail: (functionId: string) => [...functionKeys.details(), functionId] as const,
  runs: (functionId: string) => [...functionKeys.detail(functionId), 'runs'] as const,
}

// API 함수
async function getFunction(functionId: string): Promise<FunctionDetail> {
  const response = await apiClient.get(`/api/functions/${functionId}`)
  
  // Zod로 응답 검증
  const parsed = GetFunctionResponseSchema.parse(response.data)
  return parsed.data
}

// React Query Hook
export function useFunction(functionId: string | undefined) {
  return useQuery({
    queryKey: functionKeys.detail(functionId ?? ''),
    queryFn: () => getFunction(functionId!),
    enabled: !!functionId, // functionId가 있을 때만 실행
    staleTime: 1000 * 60 * 5, // 5분
    retry: 2,
  })
}

