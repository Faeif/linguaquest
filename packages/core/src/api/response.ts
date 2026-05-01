/**
 * API Response Helpers — Standardized response builders
 * 
 * Use these helpers to ensure consistent API response format
 */

import { type ApiSuccessResponse, type ApiErrorResponse, HttpStatus, ApiErrorCode } from './types'

/**
 * Create a successful API response
 * 
 * @example
 * ```ts
 * return successResponse({ user: { id: 1, name: 'John' } })
 * return successResponse(cards, { status: 201 })
 * ```
 */
export function successResponse<T>(
  data: T,
  options?: { status?: number; headers?: Record<string, string> }
): Response {
  const body: ApiSuccessResponse<T> = { data, error: null }
  const status = options?.status ?? HttpStatus.OK

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
}

/**
 * Create an error API response
 * 
 * @example
 * ```ts
 * return errorResponse('Invalid input', { status: 400, code: 'VALIDATION_ERROR' })
 * return errorResponse('Unauthorized', { status: 401 })
 * ```
 */
export function errorResponse(
  message: string,
  options?: {
    status?: number
    code?: string
    details?: unknown
  }
): Response {
  const body: ApiErrorResponse = {
    data: null,
    error: message,
    code: options?.code ?? ApiErrorCode.INTERNAL_ERROR,
    details: options?.details,
  }
  const status = options?.status ?? HttpStatus.INTERNAL_SERVER_ERROR

  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Predefined error responses for common scenarios
 */
export const commonErrors = {
  unauthorized: (message = 'Unauthorized'): Response =>
    errorResponse(message, {
      status: HttpStatus.UNAUTHORIZED,
      code: ApiErrorCode.UNAUTHORIZED,
    }),

  forbidden: (message = 'Forbidden'): Response =>
    errorResponse(message, {
      status: HttpStatus.FORBIDDEN,
      code: ApiErrorCode.FORBIDDEN,
    }),

  notFound: (resource = 'Resource'): Response =>
    errorResponse(`${resource} not found`, {
      status: HttpStatus.NOT_FOUND,
      code: ApiErrorCode.NOT_FOUND,
    }),

  validationError: (details: unknown): Response =>
    errorResponse('Validation failed', {
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      code: ApiErrorCode.VALIDATION_ERROR,
      details,
    }),

  rateLimited: (message = 'Too many requests'): Response =>
    errorResponse(message, {
      status: HttpStatus.TOO_MANY_REQUESTS,
      code: ApiErrorCode.RATE_LIMITED,
    }),

  internalError: (message = 'Internal server error'): Response =>
    errorResponse(message, {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ApiErrorCode.INTERNAL_ERROR,
    }),
} as const
