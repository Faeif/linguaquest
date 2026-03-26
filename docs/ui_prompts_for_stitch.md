# 🎨 LinguaQuest UX/UI Prompts for Google Stitch

*คัดลอก Prompt แต่ละหน้านี้ไปวางใน Google Stitch (หรือ v0.dev / Claude Artifacts) เพื่อสร้าง UI ได้เลยครับ*
*Prompt จะบังคับใช้กฎ Design System (Minimalist Café) และโครงสร้าง HSK ให้เรียบร้อย*

---

## 🏗️ 0. System Prompt (ใส่ทุกครั้งที่เริ่มโปรเจกต์ใหม่ใน Stitch)
> **Goal:** បังคับโทนสีและ "กฎห้ามทำ" แบบเด็ดขาด

```text
You are an expert Frontend Developer and UX/UI Designer. 
I am building a web app called "LinguaQuest", an AI-native Chinese (HSK) learning platform.
Please strictly adhere to the following "Minimalist Café" Design Tokens:
- Background: Off-white `#FAFAF9` (bg-[#FAFAF9])
- Primary Color: Earthy brown `#8B5E3C` (bg-[#8B5E3C], text-[#8B5E3C])
- Accent Color (Use Sparingly for primary CTAs only): Orange `#F97316` (bg-orange-500)
- Text Color: `#1C1917` (text-stone-900) or `#44403C` (text-stone-700). DO NOT use pure black.
- Borders: `border-stone-200` or `border-stone-300`.

CRITICAL "ANTI-AI" RULES:
1. NO gradients (no bg-gradient-to).
2. NO heavy drop shadows. Use 1px solid borders or very subtle `shadow-sm`.
3. NO glassmorphism / excessive blur.
4. DO NOT spam emojis. Use Lucide React icons instead.
5. Emphasize typography, whitespace, and padding (p-6, p-8) over colorful blocks.
```

---

## 🏠 1. Landing Page (`/`)
```text
Build a modern, minimalist Landing Page for "LinguaQuest", a Chinese (HSK) language learning web app.
- Context: It uses AI to adapt to individual weaknesses and generate zero-cost global flashcards.
- Structure:
  1. Hero Section: A large, clean headline "Master Chinese with Adaptive AI". A short subtext about HSK preparation. Two buttons: Primary ("Start Learning", orange accent) and Secondary ("Log in", outlined brown).
  2. Features Grid: 3 simple cards (border-stone-200, bg-white) with Lucide icons (Brain, Mic, Cards) explaining: "AI Memory Profile", "Voice-First Coach", and "Instant Global Flashcards".
  3. Simple Footer.
- Styling: Use the System Prompt's "Minimalist Café" design tokens. Clean typography. No gradients.
```

---

## 🔑 2. Login / Register (`/login`)
```text
Build a minimal Login/Registration page.
- Layout: Centered content on a `#FAFAF9` background.
- UI: A clean white card (`bg-white border border-stone-200 shadow-sm rounded-xl`) in the center.
- Elements: 
  - Logo/Title "LinguaQuest" at the top.
  - Email and Password input fields (border-stone-200, focus:ring-1 focus:ring-[#8B5E3C]).
  - Primary CTA button "Sign In" (bg-[#8B5E3C] text-white).
  - A subtle divider "OR" and a "Sign in with Google" button (outlined).
  - Text link "Don't have an account? Sign up" (text-[#8B5E3C]).
- Ensure the aesthetic is mature, not childish. No emojis.
```

---

## 👋 3. Onboarding Flow (`/onboarding`)
```text
Build a progressive onboarding UI wizard for a Chinese learning app.
- Layout: Minimalist, centered white card on `#FAFAF9` background, similar to Notion's clean style.
- Elements:
  - A subtle progress bar at the top (e.g., 25% complete).
  - Step 1: "What is your primary goal?" (Options: HSK 1-6 Exam, Business Chinese BCT, Travel, General Conversational).
  - Show the options as clean clickable boxes (`border-stone-200`, hover effect to `border-[#8B5E3C]`).
  - Step 2: "What is your current estimated level?" (Options: Complete Beginner, HSK 1-2, HSK 3-4, HSK 5-6).
  - Bottom Navigation: "Back" (ghost button) and "Continue" (bg-[#8B5E3C]).
- Styling: Elegant typography. No childish graphics.
```

---

## 📱 4. Home Dashboard (`/home`)
```text
Build the main Home Dashboard for a logged-in user learning Chinese.
- Layout: A clean top navigation bar with a hamburger menu or user avatar. Bottom navigation bar (Home, Learn, Coach, Explore).
- Main Content: 
  - Greeting: "Welcome back, {User}"
  - Gamification Strip: A clean horizontal section showing current HSK Level (e.g., "HSK 3"), a "12 Day Streak" (with a flame icon, use orange here), and daily goal progress (e.g., 15/30 mins).
  - "Continue Learning" section: A large prominent card showing the next recommended action (e.g., "Review 20 overdue flashcards" or "Chat with Lin").
  - "Weakness Focus": A minimal card listing current weaknesses from the AI profile (e.g., "Tone 3 changes", "把 sentences").
- Styling: Soft off-white background. White cards with 1px stone-200 borders. Very clean and spacious.
```

---

## 🃏 5. Learn & Flashcards (`/learn`)
```text
Build the "Learn" tab focusing on Flashcards and the AI Card Generator.
- Layout: Split into two states: 1. Search/Generate, 2. Flashcard Swiping.
- Search Bar (Top): A large, prominent input field "Search for a Chinese word to generate a flashcard...". Include a search icon.
- Generated Card Preview (Center): 
  - A clean, large flashcard (`bg-white border-stone-200 shadow-sm`). 
  - Front: Large Chinese character (Hanzi) in the center (e.g., "普遍"), Pinyin below it ("pǔbiàn").
  - Back (revealed state): Thai definition ("แพร่หลาย"), HSK level badge ("HSK 4" in grey), and a highlighted example sentence in Chinese with Pinyin and Thai translation.
  - Action buttons below the card: "Add to Deck" (bg-orange-500) and "Skip" (outlined).
- Styling: The flashcard should look like a premium physical paper card. Minimalist typography.
```

---

## 🗣️ 6. AI Companion Coach (`/coach`)
```text
Build a Voice-First AI Conversational Chat UI for practicing Chinese speaking.
- Layout: Full height chat interface.
- Header: Shows the AI persona (e.g., "Lin - Native Speaker") and current mode (e.g., "Casual Chat").
- Messages Area: 
  - AI Messages: Left-aligned, white bubble (`bg-white border border-stone-200`). Contains Hanzi + Pinyin underneath. Has a prominent "Speaker" icon button for Text-to-Speech.
  - Feedback/Hint Zone: Nested inside the AI bubble or right below it, a distinct zone (`bg-stone-50 border-l-2 border-[#8B5E3C]`) displaying grammar hints or Thai translations for beginners.
  - User Messages: Right-aligned, earthy brown bubble (`bg-[#8B5E3C] text-white`). 
- Input Area (Bottom): Voice-first. A large, prominent, round microphone button (hold to talk). A smaller keyboard icon to switch to text input. 
- Styling: Clean, mature chat interface. No gradient chat bubbles.
```

---

## 🎤 7. Practice (Speaking/Essay) (`/practice`)
```text
Build a Practice Hub menu for specific language drills.
- Layout: Grid or list of practice options on `#FAFAF9` background.
- Cards:
  - "Speaking Fluency Evaluator": Icon (Mic). "Record a 1-minute response to a prompt. AI will evaluate your grammar, phrasing, and flow."
  - "Essay Grader": Icon (Pen). "Write a short paragraph responding to an HSK prompt. AI will grade your syntax and vocabulary."
- Inside the Essay Grader View: 
  - A large `<textarea>` for the user to write Chinese characters. 
  - A "Submit for Review" button. 
  - A mock "Feedback" result state: Showing the text with specific words highlighted in red (errors) or green (better phrasing), with a sidebar/bottom panel explaining the grammatical corrections.
- Styling: Focus on readability, using a font stack that perfectly renders Chinese characters.
```
