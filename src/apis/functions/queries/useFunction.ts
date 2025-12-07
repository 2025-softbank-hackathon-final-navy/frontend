import { useQuery } from '@tanstack/react-query'
import type { FunctionDetail } from '../dto'

/**
 * 함수 상세 조회 Query
 * 
 * ⚠️ 주의: api.html에 함수 조회(GET) 엔드포인트가 없습니다.
 * 현재는 Mock 데이터를 사용하거나, 백엔드에 엔드포인트 추가가 필요합니다.
 * 
 * TODO: 백엔드 API 스펙 확인 후 엔드포인트 수정 필요
 * 예상: GET /function/{function_id} 또는 GET /function/{function_id}/info
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
async function getFunction(_functionId: string): Promise<FunctionDetail> {
  // TODO: 실제 엔드포인트 확인 후 수정 필요
  // 현재는 임시로 에러 발생 (백엔드에 엔드포인트가 없음)
  throw new Error('Function detail endpoint not implemented in backend API')
  
  // const response = await apiClient.get(`/function/${functionId}`)
  // const parsed = GetFunctionResponseSchema.parse(response.data)
  // return parsed.data
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

