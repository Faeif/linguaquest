# Feature: AI Companion (F08 - MVP Day 2)

## 🎯 Goal
A conversational AI interface (Text-only for MVP) that dynamically injects the `ai_user_profile` so the AI "knows" the user's name, goal, and CEFR level.

## ✅ Acceptance Criteria
- [ ] Simple Chat UI (Input bar + message list).
- [ ] Progressive Language Prompting:
  - If user is A1/A2 -> AI speaks simple English + Thai feedback.
  - If user is C1 -> strict academic English.
- [ ] "Tap-to-Translate" concept stubbed out.

## 🗄️ Database Changes
Uses `ai_conversations` and `ai_messages` (Promoted to Phase 1).

## 📡 API Contracts
`POST /api/ai/chat`
- Body: `{ message: string, conversationId: string }`
- Action:
  1. Fetch `ai_user_profile`.
  2. Assemble System Prompt containing Persona + Context.
  3. Call Gemini (streaming response).
  4. Save to `ai_messages`.
