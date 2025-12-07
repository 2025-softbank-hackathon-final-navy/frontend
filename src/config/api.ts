/**
 * API 설정
 * 
 * - Local 환경: 다이렉트 HTTP (프록시 없이 직접 백엔드로 연결)
 * - Vercel 환경: HTTPS 프록시 (/api를 통해 백엔드로 연결)
 * 
 * Local 환경의 백엔드 URL은 환경변수 VITE_API_BASE_URL로 설정 가능합니다.
 */

const getBaseURL = (): string => {
  // 모든 환경에서 /api 사용
  // - Local: 다이렉트 HTTP (프록시 없이 직접 백엔드로 연결)
  // - Vercel: HTTPS 프록시 (/api를 통해 백엔드로 연결)
  return '/api'
}

export const API_CONFIG = {
  baseURL: getBaseURL(),
  timeout: 30000, // 30초
} as const

/**
 * Grafana URL 설정
 * 환경변수 VITE_GRAFANA_URL로 Grafana 대시보드 URL을 설정할 수 있습니다.
 * 설정되지 않은 경우 기본값은 http://localhost:3000 입니다.
 */
export const getGrafanaURL = (): string => {
  const envURL = import.meta.env.VITE_GRAFANA_URL
  
  if (!envURL) {
    return 'http://localhost:3000'
  }
  
  let url = envURL.trim()
  
  // 프로토콜 처리: 없으면 http:// 추가
  if (!url.match(/^https?:\/\//)) {
    url = `http://${url}`
  }
  
  // 끝의 슬래시 제거
  url = url.replace(/\/+$/, '')
  
  return url
}

