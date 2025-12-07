import { z } from 'zod/v4'

/**
 * Function API DTO 맞추기
 * 
 */

// 기본 Types

/** 런타임 타입 */
export const RuntimeSchema = z.enum(['nodejs-18', 'python-3.11', 'go-1.22'])
export type Runtime = z.infer<typeof RuntimeSchema>

/** 실행 모드 (warm: 웜 컨테이너, cold: 콜드 스타트, cold_fail: 콜드 스타트 실패) */
export const ExecutionModeSchema = z.enum(['warm', 'cold', 'cold_fail'])
export type ExecutionMode = z.infer<typeof ExecutionModeSchema>

/** 실행 상태 */
export const ExecutionStatusSchema = z.enum(['success', 'failed', 'error'])
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

/** POST /function - Request Body (내부 DTO, API 전송 시 snake_case로 변환) */
export const CreateFunctionRequestSchema = z.object({
  name: z.string().min(1, '함수 이름은 필수입니다'),
  runtime: RuntimeSchema,
  sourceCode: z.string().min(1, '코드는 필수입니다'),
  envVars: z.record(z.string(), z.string()).optional().default({}),
  description: z.string().optional(),
  timeout: z.number().optional(), // API 스펙에 있음
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
    invokeUrl: z.string().url().optional(), // 배포 후 받는 실제 Invoke URL
  }),
})
export type CreateFunctionResponse = z.infer<typeof CreateFunctionResponseSchema>

// Function 수정 API

/** PUT /function/{function_id} - Request Body (CreateFunctionRequest와 동일) */
export const UpdateFunctionRequestSchema = CreateFunctionRequestSchema
export type UpdateFunctionRequest = z.infer<typeof UpdateFunctionRequestSchema>

/** PUT /function/{function_id} - Response */
export const UpdateFunctionResponseSchema = z.object({
  function_id: z.string().uuid(),
})
export type UpdateFunctionResponse = z.infer<typeof UpdateFunctionResponseSchema>

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

/** 실행 히스토리 아이템 (백엔드 응답 - snake_case) */
export const ExecutionHistoryItemBackendSchema = z.object({
  request_id: z.string(),
  duration: z.number(),
  execution_type: z.enum(['warm', 'cold', 'cold_fail']),
  request_at: z.string(),
  status: z.enum(['success', 'failed', 'error']),
})
export type ExecutionHistoryItemBackend = z.infer<typeof ExecutionHistoryItemBackendSchema>

/** 실행 히스토리 아이템 (프론트엔드 - camelCase) */
export const ExecutionHistoryItemSchema = z.object({
  requestId: z.string(),
  duration: z.number(),
  mode: ExecutionModeSchema,
  requestAt: z.string(),
  status: ExecutionStatusSchema,
})
export type ExecutionHistoryItem = z.infer<typeof ExecutionHistoryItemSchema>

/** GET /function/{function_id}/logs - Response (백엔드 형식) */
export const GetExecutionHistoryResponseBackendSchema = z.object({
  content: z.array(ExecutionHistoryItemBackendSchema),
  pageable: z.object({
    pageNumber: z.number(),
    pageSize: z.number(),
    sort: z.object({
      unsorted: z.boolean(),
      sorted: z.boolean(),
      empty: z.boolean(),
    }).optional(),
    offset: z.number().optional(),
    unpaged: z.boolean().optional(),
    paged: z.boolean().optional(),
  }).optional(),
  totalPages: z.number(),
  totalElements: z.number(),
  last: z.boolean().optional(),
  numberOfElements: z.number().optional(),
  size: z.number().optional(),
  number: z.number().optional(),
  sort: z.object({
    unsorted: z.boolean(),
    sorted: z.boolean(),
    empty: z.boolean(),
  }).optional(),
  first: z.boolean().optional(),
  empty: z.boolean().optional(),
})
export type GetExecutionHistoryResponseBackend = z.infer<typeof GetExecutionHistoryResponseBackendSchema>

/** GET /function/{function_id}/logs - Response (프론트엔드용) */
export interface GetExecutionHistoryResponse {
  content: ExecutionHistoryItem[]
  totalPages: number
  totalElements: number
}

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

