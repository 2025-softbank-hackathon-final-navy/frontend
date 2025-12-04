import axios from 'axios'

/**
 * Axios 공통 인스턴스
 * 
 * Base URL 예시: https://api.codebistro.dev
 * - 환경변수 VITE_API_BASE_URL로 설정 가능
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.codebistro.dev',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30초 (함수 실행 대기 고려)
})

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // TODO: 인증 토큰이 필요한 경우 여기서 추가
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    // API 응답이 { success: true, data: ... } 형태이므로 data 추출
    return response
  },
  (error) => {
    // 공통 에러 처리
    if (error.response) {
      const { status, data } = error.response
      
      // API_SPEC.md 에러 응답 형태: { success: false, error: { code, message } }
      if (data?.error) {
        console.error(`[API Error] ${data.error.code}: ${data.error.message}`)
      }
      
      // 401 Unauthorized
      if (status === 401) {
        // TODO: 로그인 페이지로 리다이렉트 등
        console.error('Unauthorized - redirecting to login')
      }
      
      // 500 Internal Server Error
      if (status >= 500) {
        console.error('Server error occurred')
      }
    }
    
    return Promise.reject(error)
  }
)

export default apiClient

