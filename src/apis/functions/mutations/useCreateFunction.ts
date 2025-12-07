import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../instance'
import { API_CONFIG } from '../../../config/api'
import {
  CreateFunctionRequestSchema,
  CreateFunctionResponseSchema,
  type CreateFunctionRequest,
  type CreateFunctionResponse,
} from '../dto'
import { functionKeys } from '../queries/useFunction'

/**
 * 함수 생성/저장 Mutation
 * 
 * POST /function
 * 
 * 실제 백엔드 API 스펙:
 * - 엔드포인트: POST /function
 * - 요청 필드: function_name, function_code, env_vars, runtime, timeout, description (snake_case)
 * - 응답: { function_id: string }
 */

// API 함수
async function createFunction(
  request: CreateFunctionRequest
): Promise<CreateFunctionResponse['data']> {
  // 요청 데이터 검증
  const validatedRequest = CreateFunctionRequestSchema.parse(request)
  
  // 런타임 변환: "node","python", "go"
  const runtimeMap: Record<string, string> = {
    'nodejs-18': 'node',
    'python-3.11': 'python',
    'go-1.22': 'go',
  }
  const backendRuntime = runtimeMap[validatedRequest.runtime] || validatedRequest.runtime
  
  // 백엔드 API 형식으로 변환 (camelCase => snake_case)
  // sourceCode는 그대로 전달 (줄바꿈은 JSON.stringify가 자동으로 \n으로 이스케이프)
  const apiRequest = {
    function_name: validatedRequest.name,
    function_code: validatedRequest.sourceCode, // 실제 코드 문자열 (줄바꿈 포함)
    runtime: backendRuntime,
    env_vars: validatedRequest.envVars || {},
    ...(validatedRequest.description && { description: validatedRequest.description }),
    ...(validatedRequest.timeout && { timeout: validatedRequest.timeout }),
  }
  
  // 디버깅: 실제 전송되는 코드 확인
  console.log('[CreateFunction] Request payload:', {
    function_name: apiRequest.function_name,
    function_code_length: apiRequest.function_code.length,
    function_code_preview: apiRequest.function_code.substring(0, 100) + '...',
    runtime: apiRequest.runtime,
  })
  
  const response = await apiClient.post('/function', apiRequest)
  
  // 백엔드 응답: { function_id: "..." }
  // DTO 형식으로 변환: { success: true, data: { functionId, ... } }
  const backendResponse = response.data
  
  // 응답이 이미 { success, data } 형식인 경우
  if (backendResponse.success && backendResponse.data) {
    const parsed = CreateFunctionResponseSchema.parse(backendResponse)
    return parsed.data
  }
  
  // 백엔드가 { function_id } 형식으로 응답하는 경우 변환
  if (backendResponse.function_id) {
    return {
      functionId: backendResponse.function_id,
      name: validatedRequest.name,
      runtime: validatedRequest.runtime,
      description: validatedRequest.description,
      updatedAt: new Date().toISOString(),
      invokeUrl: `${API_CONFIG.baseURL}/function/${backendResponse.function_id}`,
    }
  }
  
  // 예상치 못한 응답 형식
  throw new Error('Unexpected API response format')
}

// React Query Hook
export function useCreateFunction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createFunction,
    retry: 0, // POST 요청은 재시도하지 않음 (중복 생성 방지)
    onSuccess: (data) => {
      // 함수 리스트 캐시 무효화
      queryClient.invalidateQueries({ queryKey: functionKeys.lists() })
      
      // 새로 생성된 함수 상세 캐시에 추가
      queryClient.setQueryData(functionKeys.detail(data.functionId), data)
      
      console.log(`[Function Created] ${data.name} (${data.functionId})`)
    },
    onError: (error) => {
      console.error('[CreateFunction Error]', error)
    },
  })
}

