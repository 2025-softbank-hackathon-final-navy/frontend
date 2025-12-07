/**
 * API 설정
 * 
 * 환경변수 VITE_API_BASE_URL로 baseURL을 설정할 수 있습니다.
 * 설정되지 않은 경우 기본값은 http://localhost:8080 입니다.
 * 
 * baseURL은 사용자가 설정한 대로 사용됩니다.
 * 각 API 엔드포인트는 필요한 경로를 추가하여 호출합니다.
 */

const getBaseURL = (): string => {
  const envURL = import.meta.env.VITE_API_BASE_URL
  
  if (!envURL) {
    return 'http://localhost:8080'
  }
  
  let url = envURL.trim()
  
  // 프로토콜 처리: 없으면 http:// 추가, https://면 http://로 변경
  if (!url.match(/^https?:\/\//)) {
    url = `http://${url}`
  } else if (url.startsWith('https://')) {
    url = url.replace('https://', 'http://')
  }
  
  // 끝의 슬래시 제거
  url = url.replace(/\/+$/, '')
  
  return url
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

