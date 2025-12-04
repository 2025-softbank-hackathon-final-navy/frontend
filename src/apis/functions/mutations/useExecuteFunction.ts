import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../instance'
import {
  ExecuteFunctionRequestSchema,
  ExecuteFunctionResponseSchema,
  type ExecuteFunctionRequest,
  type ExecutionResult,
} from '../dto'
import { functionKeys } from '../queries/useFunction'

/**
 * 함수 실행 Mutation
 * 
 * POST /api/functions/{functionId}/execute
 * 
 * DATA_STREAM.md 흐름:
 * 1. Router가 requestId 생성
 * 2. Redis Queue에 실행 요청 적재
 * 3. Worker가 함수 실행 (cold/warm)
 * 4. 결과 Pub/Sub으로 전달
 * 5. HTTP 응답 반환
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
  
  const response = await apiClient.post(
    `/api/functions/${functionId}/execute`,
    validatedRequest
  )
  
  // 응답 검증
  const parsed = ExecuteFunctionResponseSchema.parse(response.data)
  return parsed.data
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

