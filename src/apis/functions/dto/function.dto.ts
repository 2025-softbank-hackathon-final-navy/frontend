import { z } from 'zod/v4'

/**
 * Function API DTO 맞추기
 * 
 */

// 기본 Types

/** 런타임 타입 */
export const RuntimeSchema = z.enum(['nodejs-18', 'python-3.11', 'go-1.22'])
export type Runtime = z.infer<typeof RuntimeSchema>

/** 실행 모드 (warm: 웜 컨테이너, cold: 콜드 스타트) */
export const ExecutionModeSchema = z.enum(['warm', 'cold'])
export type ExecutionMode = z.infer<typeof ExecutionModeSchema>

/** 실행 상태 */
export const ExecutionStatusSchema = z.enum(['success', 'failed'])
export type ExecutionStatus = z.infer<typeof ExecutionStatusSchema>

/** 함수 상태 (HOT: 최근 실행됨, STABLE: 안정, COLD: 미사용) */
export const FunctionStatusSchema = z.enum(['HOT', 'STABLE', 'COLD'])
export type FunctionStatus = z.infer<typeof FunctionStatusSchema>

// Function 관련 Types

/** 함수 요약 정보 (리스트용) */
export const FunctionSummarySchema = z.object({
  functionId: z.string().uuid(),
  name: z.string(),
  runtime: RuntimeSchema,
  description: z.string().optional(),
  status: FunctionStatusSchema,
  timeout: z.number(), // seconds
  invocations: z.number(), // 총 호출 횟수
  errorRate: z.number(), // 에러율 (0~1)
  lastDeployedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type FunctionSummary = z.infer<typeof FunctionSummarySchema>

/** 함수 상세 정보 */
export const FunctionDetailSchema = FunctionSummarySchema.extend({
  sourceCode: z.string(),
  envVars: z.record(z.string(), z.string()),
})
export type FunctionDetail = z.infer<typeof FunctionDetailSchema>


// Function 생성/저장 API

/** POST /api/functions - Request Body */
export const CreateFunctionRequestSchema = z.object({
  name: z.string().min(1, '함수 이름은 필수입니다'),
  runtime: RuntimeSchema,
  sourceCode: z.string().min(1, '코드는 필수입니다'),
  envVars: z.record(z.string(), z.string()).optional().default({}),
  description: z.string().optional(),
})
export type CreateFunctionRequest = z.infer<typeof CreateFunctionRequestSchema>

/** POST /api/functions - Response */
export const CreateFunctionResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    functionId: z.string().uuid(),
    name: z.string(),
    runtime: RuntimeSchema,
    description: z.string().optional(),
    updatedAt: z.string().datetime(),
  }),
})
export type CreateFunctionResponse = z.infer<typeof CreateFunctionResponseSchema>

// Function 조회 API

/** GET /api/functions/{functionId} - Response */
export const GetFunctionResponseSchema = z.object({
  success: z.literal(true),
  data: FunctionDetailSchema,
})
export type GetFunctionResponse = z.infer<typeof GetFunctionResponseSchema>

// Function 실행 API (핵심)

/** POST /api/functions/{functionId}/execute - Request Body */
export const ExecuteFunctionRequestSchema = z.object({
  args: z.record(z.string(), z.unknown()).optional().default({}), // 함수별 파라미터 (any JSON)
})
export type ExecuteFunctionRequest = z.infer<typeof ExecuteFunctionRequestSchema>

/** 실행 결과 (ExecutionResult) */
export const ExecutionResultSchema = z.object({
  requestId: z.string(),
  functionId: z.string().uuid(),
  mode: ExecutionModeSchema, // API_SPEC: mode, DATA_STREAM: executionType (통일 필요)
  duration: z.number(), // ms 단위
  status: ExecutionStatusSchema,
  logs: z.string(), // 여러 줄 포함한 통 문자열
  result: z.string(), // 실행 결과 (텍스트/JSON-string)
  startedAt: z.string().datetime().optional(),
  finishedAt: z.string().datetime().optional(),
  // DATA_STREAM.md 추가 필드
  memory: z.number().optional(), // 메모리 사용량
  nodeType: z.string().optional(), // 노드 타입 (CPU/GPU)
})
export type ExecutionResult = z.infer<typeof ExecutionResultSchema>

/** POST /api/functions/{functionId}/execute - Response (성공) */
export const ExecuteFunctionResponseSchema = z.object({
  success: z.literal(true),
  data: ExecutionResultSchema,
})
export type ExecuteFunctionResponse = z.infer<typeof ExecuteFunctionResponseSchema>

// 실행 히스토리 API

/** 실행 히스토리 아이템 */
export const ExecutionHistoryItemSchema = z.object({
  requestId: z.string(),
  mode: ExecutionModeSchema,
  duration: z.number(),
  status: ExecutionStatusSchema,
  startedAt: z.string().datetime(),
  finishedAt: z.string().datetime(),
})
export type ExecutionHistoryItem = z.infer<typeof ExecutionHistoryItemSchema>

/** GET /api/functions/{functionId}/runs - Response */
export const GetExecutionHistoryResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(ExecutionHistoryItemSchema),
})
export type GetExecutionHistoryResponse = z.infer<typeof GetExecutionHistoryResponseSchema>

// 에러 응답 스키마

/** API 에러 응답 */
export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
})
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>

// UI 매핑 헬퍼

/** 런타임을 UI 표시용으로 변환 */
export const runtimeDisplayMap: Record<Runtime, { label: string; extension: string }> = {
  'nodejs-18': { label: 'Node.js 18', extension: 'js' },
  'python-3.11': { label: 'Python 3.11', extension: 'py' },
  'go-1.22': { label: 'Go 1.22', extension: 'go' },
}

/** duration(ms)을 표시 문자열로 변환 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

