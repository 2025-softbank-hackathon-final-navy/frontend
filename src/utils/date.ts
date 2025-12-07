/**
 * 날짜/시간 유틸리티 함수
 * UTC+9 (KST - 한국 표준시) 기준
 * 
 * 백엔드에서 받은 시간 문자열은 UTC+0으로 가정하고 KST로 변환합니다.
 */

/**
 * UTC 시간 문자열을 Date 객체로 명시적으로 파싱
 * 백엔드에서 받은 ISO 문자열이 UTC+0인 경우를 처리
 * 
 * 예: "2025-12-04T07:09:20.922192" -> UTC로 해석
 * 예: "2025-12-04T07:09:20.922192Z" -> 이미 UTC
 * 예: "2025-12-04T07:09:20.922192+09:00" -> 타임존 정보 있음
 */
function parseUTCString(dateString: string): Date {
  // 빈 문자열 체크
  if (!dateString || dateString.trim() === '') {
    return new Date()
  }
  
  const trimmed = dateString.trim()
  
  // 이미 'Z'로 끝나면 UTC로 해석됨
  if (trimmed.endsWith('Z')) {
    return new Date(trimmed)
  }
  
  // 타임존 오프셋이 있으면 그대로 파싱
  if (trimmed.includes('+') || trimmed.includes('-', 10)) {
    return new Date(trimmed)
  }
  
  // ISO 형식이지만 타임존 정보가 없으면 UTC로 명시적으로 해석
  // '2025-12-04T07:09:20.922192' -> '2025-12-04T07:09:20.922192Z'
  if (trimmed.includes('T')) {
    return new Date(trimmed + 'Z')
  }
  
  // 일반 날짜 문자열
  return new Date(trimmed)
}

/**
 * 날짜를 UTC+9 시간대로 변환하여 로케일 형식으로 반환
 * 백엔드에서 받은 시간은 UTC+0으로 가정하고 KST로 변환
 */
export function formatDateKST(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? parseUTCString(date) : date
  return dateObj.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    ...options,
  })
}

/**
 * 날짜를 UTC+9 시간대로 변환하여 날짜 형식으로 반환
 */
export function formatDateOnlyKST(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  return formatDateKST(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  })
}

/**
 * 날짜를 UTC+9 시간대로 변환하여 시간 형식으로 반환
 */
export function formatTimeKST(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  return formatDateKST(date, {
    hour: '2-digit',
    minute: '2-digit',
    second: options?.second ? '2-digit' : undefined,
    ...options,
  })
}

/**
 * 날짜와 시간을 모두 표시 (UTC+9)
 */
export function formatDateTimeKST(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  return formatDateKST(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  })
}

/**
 * 현재 시간을 UTC+9로 반환
 */
export function getNowKST(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
}

