/// <reference types="vite/client" />

// JSON 모듈 타입 선언
declare module '*.json' {
  const value: Record<string, unknown>
  export default value
}

