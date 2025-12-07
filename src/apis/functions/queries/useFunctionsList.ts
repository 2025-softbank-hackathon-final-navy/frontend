import { useQuery } from '@tanstack/react-query'
import apiClient from '../../instance'
import type { FunctionSummary } from '../dto'
import { functionKeys } from './useFunction'

/**
 * 함수 리스트 조회 Query
 * 
 * GET /function/stats
 * 
 * 실제 백엔드 API 스펙:
 * - 엔드포인트: GET /function/stats
 * - Query Parameters: page, size, sort
 * - 응답: { content: [...], pageable: {...}, totalPages: number, totalElements: number }
 */

interface UseFunctionsListOptions {
  page?: number
  size?: number
  sort?: string
}

interface FunctionsListResponse {
  content: Array<{
    function_id: string
    function_name: string
    description?: string
    runtime: string
    timeout: number
    last_executed?: string
    status: string // 'HOT' | 'STABLE' | 'COLD'
    total_requests: number
    error_rate: number
  }>
  pageable: {
    pageNumber: number
    pageSize: number
  }
  totalPages: number
  totalElements: number
}

// API 응답 타입 (페이지네이션 정보 포함)
export interface FunctionsListResult {
  functions: FunctionSummary[]
  totalPages: number
  totalElements: number
  currentPage: number
  pageSize: number
}

// API 함수
async function getFunctionsList(
  options: UseFunctionsListOptions = {}
): Promise<FunctionsListResult> {
  const { page = 0, size = 20, sort = 'createdAt,desc' } = options
  
  const response = await apiClient.get<FunctionsListResponse>('/function/stats', {
    params: { page, size, sort },
  })
  
  const data = response.data
  
  // 백엔드 응답을 DTO 형식으로 변환
  const functions = data.content.map((item) => ({
    functionId: item.function_id,
    name: item.function_name,
    runtime: mapBackendRuntimeToFrontend(item.runtime),
    description: item.description,
    status: item.status as 'HOT' | 'STABLE' | 'COLD',
    timeout: item.timeout,
    invocations: item.total_requests,
    errorRate: item.error_rate,
    lastDeployedAt: item.last_executed || new Date().toISOString(),
    updatedAt: item.last_executed || new Date().toISOString(),
  }))
  
  return {
    functions,
    totalPages: data.totalPages,
    totalElements: data.totalElements,
    currentPage: page,
    pageSize: size,
  }
}

// 백엔드 런타임을 프론트엔드 형식으로 변환
function mapBackendRuntimeToFrontend(backendRuntime: string): 'nodejs-18' | 'python-3.11' | 'go-1.22' {
  const runtimeMap: Record<string, 'nodejs-18' | 'python-3.11' | 'go-1.22'> = {
    'node': 'nodejs-18',
    'python': 'python-3.11',
    'go': 'go-1.22',
  }
  return runtimeMap[backendRuntime.toLowerCase()] || 'nodejs-18'
}

// React Query Hook
export function useFunctionsList(options: UseFunctionsListOptions = {}) {
  return useQuery({
    queryKey: functionKeys.list(options as Record<string, unknown>),
    queryFn: () => getFunctionsList(options),
    staleTime: 1000 * 30, // 30초
    retry: 2,
  })
}

