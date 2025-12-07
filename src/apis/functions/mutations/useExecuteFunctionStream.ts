import { API_CONFIG } from '../../../config/api'

/**
 * 함수 스트리밍 실행 Hook
 * 
 * POST /function/invoke/stream
 * 
 * 실제 백엔드 API 스펙:
 * - 엔드포인트: POST /function/invoke/stream
 * - Headers: Content-Type: application/json, Accept: text/event-stream
 * - 요청 Body: { function_id: string, args?: Record<string, unknown> }
 * - 응답: SSE 스트림 (event: connect, ping, result 등)
 */

interface ExecuteFunctionStreamParams {
  functionId: string
  args?: Record<string, unknown>
}

interface SSEEventCallbacks {
  onConnect?: (data: string) => void
  onPing?: (data: string) => void
  onLog?: (data: string) => void
  onResult?: (data: string) => void
  onError?: (error: Error) => void
  onClose?: () => void
}

/**
 * SSE 스트리밍 실행 함수
 */
export async function executeFunctionStream(
  params: ExecuteFunctionStreamParams,
  callbacks: SSEEventCallbacks
): Promise<() => void> {
  const { functionId, args = {} } = params
  
  // API 요청 URL
  const url = `${API_CONFIG.baseURL}/function/invoke/stream`
  
  // 요청 Body
  const requestBody = {
    function_id: functionId,
    args,
  }
  
  // AbortController로 스트림 취소 가능하게
  const abortController = new AbortController()
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(requestBody),
      signal: abortController.signal,
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    if (!response.body) {
      throw new Error('Response body is null')
    }
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    
    // 스트림 읽기
    const readStream = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) {
            callbacks.onClose?.()
            break
          }
          
          // 디코딩
          buffer += decoder.decode(value, { stream: true })
          
          // SSE 메시지 파싱
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // 마지막 불완전한 라인은 버퍼에 보관
          
          let currentEvent = 'message'
          let currentData = ''
          
          for (const line of lines) {
            if (line.startsWith('event:')) {
              currentEvent = line.substring(6).trim()
            } else if (line.startsWith('data:')) {
              currentData = line.substring(5).trim()
              
              // 이벤트 타입에 따라 콜백 호출
              switch (currentEvent) {
                case 'connect':
                  callbacks.onConnect?.(currentData)
                  break
                case 'ping':
                  callbacks.onPing?.(currentData)
                  break
                case 'log':
                case 'logs':
                  callbacks.onLog?.(currentData)
                  break
                case 'result':
                  callbacks.onResult?.(currentData)
                  break
                default:
                  // 기본적으로 로그로 처리
                  callbacks.onLog?.(currentData)
              }
              
              currentData = ''
            } else if (line.trim() === '') {
              // 빈 라인 = 메시지 종료
              if (currentData) {
                switch (currentEvent) {
                  case 'connect':
                    callbacks.onConnect?.(currentData)
                    break
                  case 'ping':
                    callbacks.onPing?.(currentData)
                    break
                  case 'log':
                  case 'logs':
                    callbacks.onLog?.(currentData)
                    break
                  case 'result':
                    callbacks.onResult?.(currentData)
                    break
                  default:
                    callbacks.onLog?.(currentData)
                }
                currentData = ''
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // 정상적인 취소
          callbacks.onClose?.()
        } else {
          callbacks.onError?.(error instanceof Error ? error : new Error(String(error)))
        }
      }
    }
    
    // 비동기로 스트림 읽기 시작
    readStream()
    
    // 취소 함수 반환
    return () => {
      abortController.abort()
      reader.cancel()
    }
  } catch (error) {
    callbacks.onError?.(error instanceof Error ? error : new Error(String(error)))
    return () => {} // 빈 취소 함수
  }
}

/**
 * React Hook for Function Stream Execution
 */
export function useExecuteFunctionStream() {
  return {
    executeStream: executeFunctionStream,
  }
}

