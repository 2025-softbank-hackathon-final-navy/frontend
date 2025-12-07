import { useQuery } from '@tanstack/react-query'
import apiClient from '../../instance'
import { functionKeys } from './useFunction'

/**
 * 함수 로그 상세 조회 Query
 * 
 * GET /function/{function_id}/logs/{request_id}
 * 
 * 실제 백엔드 API 스펙:
 * - 엔드포인트: GET /function/{function_id}/logs/{request_id}
 * - 응답: text/plain (실행 로그 텍스트)
 */

interface UseFunctionLogDetailOptions {
  functionId: string
  requestId: string
  enabled?: boolean
}

// API 함수
async function getFunctionLogDetail(
  functionId: string,
  requestId: string
): Promise<string> {
  const response = await apiClient.get(`/function/${functionId}/logs/${requestId}`, {
    responseType: 'text', // text/plain 응답 처리
  })
  
  return response.data as string
}

// React Query Hook
export function useFunctionLogDetail({ 
  functionId, 
  requestId,
  enabled = true 
}: UseFunctionLogDetailOptions) {
  return useQuery({
    queryKey: [...functionKeys.runs(functionId), 'detail', requestId],
    queryFn: () => getFunctionLogDetail(functionId, requestId),
    enabled: enabled && !!functionId && !!requestId,
    staleTime: 1000 * 60 * 5, // 5분 (로그는 변경되지 않으므로)
    retry: 1,
  })
}

