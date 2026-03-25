# Feature: AI Card Generator (F05 - MVP Day 3)

## 🎯 Goal
Provide a frictionless way for users to search for a word, have Gemini generate a rich flashcard, and save it globally so subsequent searches are instantaneous (Cost Flywheel).

## ✅ Acceptance Criteria
- [ ] User searches for a word (e.g., "ephemeral").
- [ ] Backend checks `global_cards` DB first.
- [ ] If HIT -> return immediately (Cost $0).
- [ ] If MISS -> call Gemini Flash -> parse JSON -> save to `global_cards` -> return.

## 🗄️ Database Changes
`global_cards` table creation:
- `id` (uuid, pk)
- `word` (text, unique index)
- `definition_th` (text)
- `examples` (jsonb array of `{en: '', th: ''}`)
- `cefr_level` (text)
- `usage_count` (int defaults to 1)

## 📡 API Contracts
`GET /api/study/cards/generate?word=ephemeral`
- Action: Implements the Cache -> Gemini -> Save pattern.
- Returns: `{ data: GlobalCard, error: null }`
