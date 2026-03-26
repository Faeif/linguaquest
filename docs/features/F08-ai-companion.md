# Feature: AI Companion (F08 - MVP Day 2)

## 🎯 Goal
A voice-first conversational AI interface that dynamically injects the `ai_user_profile`. It allows the user to practice speaking Chinese back and forth, building confidence without strict tone/pronunciation nitpicking.

## ✅ Acceptance Criteria
- [ ] Voice-first UI (Hold to talk / Speech-to-Text).
- [ ] AI responds with Voice (Text-to-Speech) + Hanzi/Pinyin transcription.
- [ ] Progressive Language Prompting:
  - If user is HSK 1/2 -> AI speaks simple Chinese with Pinyin + Thai feedback.
  - If user is HSK 5/6 -> strict formal Chinese (Hanzi only).
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
