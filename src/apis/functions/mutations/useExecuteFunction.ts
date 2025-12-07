import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../instance'
import {
  ExecuteFunctionRequestSchema,
  ExecuteFunctionResponseSchema,
  type ExecutionResult,
} from '../dto'
import { functionKeys } from '../queries/useFunction'

/**
 * 함수 실행 Mutation
 * 
 * POST /function/invoke
 * 
 * 실제 백엔드 API 스펙:
 * - 엔드포인트: POST /function/invoke
 * - 요청 Body: { function_id: string, args?: Record<string, unknown> }
 * - 응답: { status, executionType, duration, logs, result }
 * 
 */

interface ExecuteFunctionParams {
  functionId: string
  args?: Record<string, unknown>
}

// API 함수
async function executeFunction({
  functionId,
  args = {},
}: ExecuteFunctionParams): Promise<ExecutionResult> {
  // 요청 데이터 검증
  const validatedRequest = ExecuteFunctionRequestSchema.parse({ args })
  
  // 백엔드 API 형식으로 변환
  const apiRequest = {
    function_id: functionId,
    args: validatedRequest.args || {},
  }
  
  const response = await apiClient.post('/function/invoke', apiRequest)
  
  // 백엔드 응답 형식 변환
  // 백엔드: { status, executionType, duration, logs, result }
  // DTO: { requestId, functionId, mode, duration, status, logs, result, ... }
  const backendResponse = response.data
  
  // 응답이 이미 DTO 형식인 경우
  if (backendResponse.functionId && backendResponse.mode) {
    const parsed = ExecuteFunctionResponseSchema.parse(response.data)
    return parsed.data
  }
  
  // 백엔드 형식으로 응답하는 경우 변환
  if (backendResponse.status && backendResponse.executionType) {
    return {
      requestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      functionId,
      mode: backendResponse.executionType === 'warm' ? 'warm' : 'cold',
      duration: Math.round((backendResponse.duration || 0) * 1000), // 초 → 밀리초
      status: backendResponse.status === 'success' ? 'success' : 'failed',
      logs: backendResponse.logs || '',
      result: backendResponse.result || '',
    }
  }
  
  // 예상치 못한 응답 형식
  throw new Error('Unexpected API response format')
}

// React Query Hook
export function useExecuteFunction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: executeFunction,
    onSuccess: (data, variables) => {
      // 실행 히스토리 캐시 무효화 (새 실행 결과 반영)
      queryClient.invalidateQueries({ 
        queryKey: functionKeys.runs(variables.functionId) 
      })
      
      console.log(
        `[Function Executed] ${variables.functionId}`,
        `| Mode: ${data.mode}`,
        `| Duration: ${data.duration}ms`,
        `| Status: ${data.status}`
      )
    },
    onError: (error, variables) => {
      console.error(`[ExecuteFunction Error] ${variables.functionId}`, error)
    },
  })
}

