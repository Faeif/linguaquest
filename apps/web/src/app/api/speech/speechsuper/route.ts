/**
 * /api/speech/speechsuper — DEPRECATED
 * This project uses Azure Cognitive Services (/api/speech/evaluate) instead.
 * Kept as a placeholder to avoid 404s from old bookmarks.
 */

export async function POST() {
  return Response.json(
    {
      data: null,
      error: 'Use /api/speech/evaluate (Azure) instead',
    },
    { status: 410 }
  )
}
