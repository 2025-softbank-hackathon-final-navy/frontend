import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../instance'
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
 * POST /api/functions
 */

// API 함수
async function createFunction(
  request: CreateFunctionRequest
): Promise<CreateFunctionResponse['data']> {
  // 요청 데이터 검증
  const validatedRequest = CreateFunctionRequestSchema.parse(request)
  
  const response = await apiClient.post('/api/functions', validatedRequest)
  
  // 응답 검증
  const parsed = CreateFunctionResponseSchema.parse(response.data)
  return parsed.data
}

// React Query Hook
export function useCreateFunction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createFunction,
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

