import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '../../instance'
import { functionKeys } from '../queries/useFunction'

/**
 * 함수 삭제 Mutation
 * 
 * DELETE /api/functions/{functionId}
 * 
 * 등록된 함수를 영구적으로 삭제 (DB 메타데이터 및 S3 소스 코드 삭제)
 * 성공 시 204 No Content 반환
 */

// API 함수
async function deleteFunction(functionId: string): Promise<void> {
  await apiClient.delete(`/api/functions/${functionId}`)
}

// React Query Hook
export function useDeleteFunction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: deleteFunction,
    onSuccess: (_data, functionId) => {
      // 함수 리스트 캐시 무효화
      queryClient.invalidateQueries({ queryKey: functionKeys.lists() })
      
      // 삭제된 함수의 상세 캐시 제거
      queryClient.removeQueries({ queryKey: functionKeys.detail(functionId) })
      
      console.log(`[Function Deleted] ${functionId}`)
    },
    onError: (error, functionId) => {
      console.error(`[DeleteFunction Error] ${functionId}`, error)
    },
  })
}

