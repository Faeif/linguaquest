import { createHmac } from 'node:crypto'

export interface AnonymizedContext {
  sessionId: string
  hskLevel: string
  goalTag: string
  grammarWeakPoints: string[]
  toneWeakPoints: string[]
  turnNumber: number
}

const PII_PATTERNS = [/\b[\w.+-]+@[\w-]+\.[\w.]+\b/g, /\b(\+66|0)[689]\d{8}\b/g, /\b\d{13}\b/g]

export function hashUserId(userId: string): string {
  const secret = process.env.ANONYMIZER_SECRET ?? 'linguaquest-default-secret'
  return createHmac('sha256', secret).update(userId).digest('hex').slice(0, 16)
}

export function stripPII(text: string): string {
  let result = text
  for (const pattern of PII_PATTERNS) {
    result = result.replace(pattern, '[REDACTED]')
  }
  return result
}

export function buildAnonymizedContext(params: {
  userId: string
  hskLevel: string | null
  learningGoal: string | null
  grammarWeakPoints: string[] | null
  toneWeakPoints: string[] | null
  turnNumber: number
}): AnonymizedContext {
  return {
    sessionId: hashUserId(params.userId),
    hskLevel: params.hskLevel ?? 'HSK1',
    goalTag: params.learningGoal ?? 'general',
    grammarWeakPoints: params.grammarWeakPoints ?? [],
    toneWeakPoints: params.toneWeakPoints ?? [],
    turnNumber: params.turnNumber,
  }
}
