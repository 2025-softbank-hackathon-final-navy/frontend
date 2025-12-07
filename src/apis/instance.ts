import axios from 'axios'
import { API_CONFIG } from '../config/api'

/**
 * Axios 공통 인스턴스
 * 
 * Base URL은 src/config/api.ts에서 관리됩니다.
 * 환경변수 VITE_API_BASE_URL로 설정 가능합니다.
 */
export const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: API_CONFIG.timeout,
  withCredentials: false, // CORS 문제 방지를 위해 명시적으로 false
})

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    // baseURL과 url 결합 시 중복 경로 제거
    if (config.baseURL && config.url) {
      try {
        const baseURL = (config.baseURL as string).replace(/\/+$/, '') // 끝의 슬래시 제거
        const url = (config.url as string)
        
        const urlObj = new URL(baseURL)
        const basePath = urlObj.pathname.replace(/\/+$/, '') // baseURL의 경로 부분
        
        // baseURL의 경로가 있고, url이 해당 경로로 시작하면 중복 제거
        if (basePath && url.startsWith(basePath)) {
          // baseURL에서 경로 제거 (프로토콜 + 도메인만 남김)
          config.baseURL = `${urlObj.protocol}//${urlObj.host}`
        }
      } catch {
        // URL 파싱 실패 시 원본 유지 (상대 경로 등)
      }
    }
    
    // TODO: 인증 토큰이 필요한 경우 여기서 추가
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    console.error('[Request Interceptor Error]', error)
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
      const { status, data, config } = error.response
      const fullURL = `${config?.baseURL}${config?.url}`
      
      console.error(`[API Error] ${status} ${config?.method?.toUpperCase()} ${fullURL}`)
      
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

