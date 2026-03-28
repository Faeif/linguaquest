/**
 * POST /api/writing/grade
 * AI-grades writing exercises using DeepSeek V3 (Chinese specialist).
 * Returns a GradeResult with score, feedback (Thai), and optional rubric.
 */

import { getChineseModel } from '@linguaquest/core/ai/deepseek'
import { getThaiModel } from '@linguaquest/core/ai/qwen'
import type { GradeResult, RubricScore } from '@linguaquest/core/writing/types'
import { generateText } from 'ai'
import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/server'

// ─── Zod Schemas ───────────────────────────────────────────────────────────────

const zImageComposeBody = z.object({
  exerciseType: z.literal('image_compose'),
  hskLevel: z.literal(4),
  requiredWords: z.array(z.string()),
  userAnswer: z.string().min(1),
})

const zShortEssayBody = z.object({
  exerciseType: z.literal('short_essay'),
  hskLevel: z.literal(5),
  requiredWords: z.array(z.string()),
  targetChars: z.number(),
  userAnswer: z.string().min(1),
})

const zReadingSummaryBody = z.object({
  exerciseType: z.literal('reading_to_summary'),
  hskLevel: z.literal(6),
  articleText: z.string(),
  targetSummaryChars: z.number(),
  userAnswer: z.string().min(1),
})

const zGradeBody = z.discriminatedUnion('exerciseType', [
  zImageComposeBody,
  zShortEssayBody,
  zReadingSummaryBody,
])

// ─── Grading logic ─────────────────────────────────────────────────────────────

interface DeepSeekGrade {
  score: number
  corrections: string
  feedback_zh: string
  rubric?: { criterion: string; score: number; maxScore: number; comment_zh: string }[]
}

async function gradeWithDeepSeek(
  systemPrompt: string,
  userContent: string
): Promise<DeepSeekGrade> {
  const { text } = await generateText({
    model: getChineseModel(),
    system: systemPrompt,
    prompt: userContent,
    temperature: 0.3,
    maxOutputTokens: 600,
  })

  // Extract JSON from model response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return { score: 50, corrections: '', feedback_zh: text.slice(0, 200) }
  }
  try {
    return JSON.parse(jsonMatch[0]) as DeepSeekGrade
  } catch {
    return { score: 50, corrections: '', feedback_zh: text.slice(0, 200) }
  }
}

async function translateFeedback(feedbackZh: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: getThaiModel(),
      system: 'คุณเป็นครูสอนภาษาจีนที่พูดภาษาไทยได้คล่อง แปลคำแนะนำต่อไปนี้เป็นภาษาไทยให้เป็นธรรมชาติและเป็นมิตร',
      prompt: feedbackZh,
      temperature: 0.4,
      maxOutputTokens: 300,
    })
    return text.trim()
  } catch {
    return feedbackZh // fallback to Chinese if Qwen fails
  }
}

// ─── Per-exercise grade handlers ───────────────────────────────────────────────

async function gradeImageCompose(body: z.infer<typeof zImageComposeBody>): Promise<GradeResult> {
  const requiredStr = body.requiredWords.join('、')
  const system = `
你是汉语写作批改老师。学生的任务是根据图片，用指定词汇造句（HSK 4级）。
必须使用的词汇：${requiredStr}

请用JSON格式回复：
{
  "score": <0-100的整数>,
  "corrections": "<如果有语法错误，给出正确句子；否则为空字符串>",
  "feedback_zh": "<用中文给出简短的建议（2-3句话）>"
}

评分标准：
- 使用了所有必须词汇（40分）
- 句子语法正确（30分）
- 句子通顺自然（20分）
- 字数达标（10分）
`.trim()

  const deepseekResult = await gradeWithDeepSeek(system, `学生的答案：${body.userAnswer}`)

  const feedbackThai = await translateFeedback(deepseekResult.feedback_zh)
  const passed = deepseekResult.score >= 60

  return {
    score: deepseekResult.score,
    passed,
    feedback: feedbackThai,
    corrections: deepseekResult.corrections || undefined,
  }
}

async function gradeShortEssay(body: z.infer<typeof zShortEssayBody>): Promise<GradeResult> {
  const requiredStr = body.requiredWords.join('、')
  const system = `
你是汉语写作批改老师。学生的任务是用以下5个词语写一篇约${body.targetChars}字的短文（HSK 5级）。
必须使用的词语：${requiredStr}

请用JSON格式回复：
{
  "score": <0-100的整数>,
  "corrections": "<指出主要语法或用词错误，给出修改建议；如无错误则为空字符串>",
  "feedback_zh": "<用中文给出详细建议（3-4句话）>"
}

评分标准：
- 使用了所有5个词语（30分）
- 语法和用词准确（30分）
- 文章连贯自然（25分）
- 字数达标（15分）
`.trim()

  const deepseekResult = await gradeWithDeepSeek(
    system,
    `学生的短文（${body.userAnswer.length}字）：\n${body.userAnswer}`
  )

  const feedbackThai = await translateFeedback(deepseekResult.feedback_zh)
  const passed = deepseekResult.score >= 65

  return {
    score: deepseekResult.score,
    passed,
    feedback: feedbackThai,
    corrections: deepseekResult.corrections || undefined,
  }
}

async function gradeReadingSummary(
  body: z.infer<typeof zReadingSummaryBody>
): Promise<GradeResult> {
  const system = `
你是汉语写作批改老师。学生阅读了一篇文章后，需要凭记忆写出约${body.targetSummaryChars}字的摘要（HSK 6级）。

原文如下：
${body.articleText}

请用JSON格式回复：
{
  "score": <0-100的整数>,
  "corrections": "<指出语法或表达问题；如无则为空字符串>",
  "feedback_zh": "<详细点评（4-5句话）>",
  "rubric": [
    {"criterion": "内容覆盖", "score": <0-40>, "maxScore": 40, "comment_zh": "<评语>"},
    {"criterion": "语言表达", "score": <0-30>, "maxScore": 30, "comment_zh": "<评语>"},
    {"criterion": "字数和独创性", "score": <0-30>, "maxScore": 30, "comment_zh": "<评语>"}
  ]
}

评分标准：
- 内容覆盖（40分）：是否涵盖原文的主要信息
- 语言表达（30分）：语法正确、表达流畅
- 字数和独创性（30分）：字数达标，用自己的语言复述而非原文照抄
`.trim()

  const deepseekResult = await gradeWithDeepSeek(
    system,
    `学生的摘要（${body.userAnswer.length}字）：\n${body.userAnswer}`
  )

  // Translate rubric comments
  const rubric: RubricScore[] | undefined = deepseekResult.rubric
    ? await Promise.all(
        deepseekResult.rubric.map(async (r) => ({
          criterion: r.criterion,
          score: r.score,
          maxScore: r.maxScore,
          comment: await translateFeedback(r.comment_zh),
        }))
      )
    : undefined

  const feedbackThai = await translateFeedback(deepseekResult.feedback_zh)
  const passed = deepseekResult.score >= 60

  return {
    score: deepseekResult.score,
    passed,
    feedback: feedbackThai,
    corrections: deepseekResult.corrections || undefined,
    rubric,
  }
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request): Promise<Response> {
  try {
    // 1. Auth
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse & validate
    const body = await req.json()
    const input = zGradeBody.parse(body)

    // 3. Grade
    let result: GradeResult

    if (input.exerciseType === 'image_compose') {
      result = await gradeImageCompose(input)
    } else if (input.exerciseType === 'short_essay') {
      result = await gradeShortEssay(input)
    } else {
      result = await gradeReadingSummary(input)
    }

    return Response.json({ data: result, error: null })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { data: null, error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }
    console.error('[writing/grade] error:', error)
    return Response.json({ data: null, error: 'Internal Server Error' }, { status: 500 })
  }
}
