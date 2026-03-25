# Feature: Onboarding Flow (MVP Day 1)

## 🎯 Goal
Collect essential user data to initialize their `ai_user_profile` so the AI Companion has immediate context.

## ✅ Acceptance Criteria
- [ ] 4-step UI flow (Name -> Goal -> Level -> Daily Minutes).
- [ ] Successfully updates `profiles` table.
- [ ] Initializes an empty/base `ai_user_profile` record for the user.

## 🗄️ Database Changes
`profiles` table updates:
- `display_name` (text)
- `learning_goal` (text)
- `cefr_self_assessed` (text)
- `daily_goal_minutes` (int)

`ai_user_profiles` table creation (if not exists):
- `user_id` (uuid, primary key)
- `cefr_estimate` (text)
- `grammar_weak_points` (text array)
- `active_vocab` (jsonb)

## 📡 API Contracts
`POST /api/auth/onboarding`
- Body: `{ displayName: string, goal: string, level: string, dailyMinutes: number }`
- Action: Updates `profiles` and inserts into `ai_user_profiles`.
