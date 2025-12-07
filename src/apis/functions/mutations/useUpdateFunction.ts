import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../instance'
import {
  UpdateFunctionRequestSchema,
  UpdateFunctionResponseSchema,
  type UpdateFunctionRequest,
  type UpdateFunctionResponse,
} from '../dto'
import { functionKeys } from '../queries/useFunction'

/**
 * 함수 수정 Mutation
 * 
 * PUT /function/{function_id}
 * 
 * 실제 백엔드 API 스펙:
 * - 엔드포인트: PUT /function/{function_id}
 * - 요청 필드: function_name, function_code, env_vars, runtime, timeout, description (snake_case)
 * - 응답: { function_id: string }
 */

interface UpdateFunctionParams {
  functionId: string
  request: UpdateFunctionRequest
}

// API 함수
async function updateFunction({
  functionId,
  request,
}: UpdateFunctionParams): Promise<UpdateFunctionResponse & { functionId: string }> {
  // 요청 데이터 검증
  const validatedRequest = UpdateFunctionRequestSchema.parse(request)
  
  // 런타임 변환: "node","python", "go"
  const runtimeMap: Record<string, string> = {
    'nodejs-18': 'node',
    'python-3.11': 'python',
    'go-1.22': 'go',
  }
  const backendRuntime = runtimeMap[validatedRequest.runtime] || validatedRequest.runtime
  
  // 백엔드 API 형식으로 변환 (camelCase => snake_case)
  const apiRequest = {
    function_name: validatedRequest.name,
    function_code: validatedRequest.sourceCode,
    runtime: backendRuntime,
    env_vars: validatedRequest.envVars || {},
    ...(validatedRequest.description && { description: validatedRequest.description }),
    ...(validatedRequest.timeout && { timeout: validatedRequest.timeout }),
  }
  
  console.log('[UpdateFunction] Request payload:', {
    function_id: functionId,
    function_name: apiRequest.function_name,
    function_code_length: apiRequest.function_code.length,
    runtime: apiRequest.runtime,
  })
  
  const response = await apiClient.put<UpdateFunctionResponse>(`/function/${functionId}`, apiRequest)
  
  // 백엔드 응답: { function_id: "..." }
  const backendResponse = response.data
  const parsed = UpdateFunctionResponseSchema.parse(backendResponse)
  
  return {
    ...parsed,
    functionId: parsed.function_id,
  }
}

// React Query Hook
export function useUpdateFunction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateFunction,
    retry: 0, // PUT 요청은 재시도하지 않음
    onSuccess: (_data, variables) => {
      // 함수 리스트 캐시 무효화
      queryClient.invalidateQueries({ queryKey: functionKeys.lists() })
      
      // 수정된 함수의 상세 캐시 무효화
      queryClient.invalidateQueries({ queryKey: functionKeys.detail(variables.functionId) })
      queryClient.invalidateQueries({ queryKey: [...functionKeys.detail(variables.functionId), 'stats'] })
      
      console.log(`[Function Updated] ${variables.functionId}`)
    },
    onError: (error, variables) => {
      console.error(`[UpdateFunction Error] ${variables.functionId}`, error)
    },
  })
}

