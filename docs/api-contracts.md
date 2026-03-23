# API Contracts — LinguaQuest
# Version: 1.0.0

## 📐 Standard Response Format

ทุก endpoint ต้อง return format นี้เสมอ:

```typescript
// Success
{
  "data": { ... },
  "error": null,
  "meta": {
    "timestamp": "2025-03-23T12:00:00Z",
    "version": "1.0.0"
  }
}

// Error
{
  "data": null,
  "error": "Human-readable error message",
  "details": [...] // Zod errors (optional)
}
```

---

## 🔒 Auth Headers
```
Authorization: Bearer {supabase_jwt_token}
Content-Type:  application/json
```

---

## 📚 Study Endpoints

### POST /api/study/complete
```typescript
// Request
{
  sessionId: string,          // UUID
  deckId: string,             // UUID
  results: Array<{
    cardId: string,           // UUID
    rating: 1 | 2 | 3,       // 1=hard, 2=good, 3=easy
    timeSpentMs: number,      // milliseconds
  }>
}

// Response
{
  data: {
    xpEarned: number,
    streakUpdated: boolean,
    currentStreak: number,
    newLevel: number | null,  // null if no level up
    masteredCards: string[],  // card IDs that are now mastered
    nextReviewDates: Array<{
      cardId: string,
      nextReviewAt: string,   // ISO datetime
    }>
  }
}
```

### GET /api/study/due-cards
```typescript
// Query params
?deckId=uuid&limit=50

// Response
{
  data: {
    cards: Array<{
      id: string,
      word: string,
      ipa: string,
      meaningTh: string,
      examples: Array<{ en: string, th: string }>,
      audioUrlUk: string | null,
      audioUrlUs: string | null,
      // SRS fields
      repetitions: number,
      easeFactor: number,
      intervalDays: number,
    }>,
    totalDue: number,
  }
}
```

---

## 🤖 AI Endpoints

### POST /api/ai/cards/generate
```typescript
// Request
{
  word: string,               // Max 100 chars
  targetLanguage: "th",       // Always "th" for now
}

// Response
{
  data: {
    word: string,
    ipa: string,
    meaningTh: string,
    meaningEn: string,
    examples: Array<{ en: string, th: string }>,
    etymology: string | null,
    wordFamily: string[],
    collocations: string[],
    cefrLevel: "A1"|"A2"|"B1"|"B2"|"C1"|"C2",
    register: "formal"|"informal"|"academic"|"technical"|null,
    cached: boolean,          // true if from Redis cache
  }
}

// Rate Limits:
// Free: 20/day
// Pro: unlimited
```

### POST /api/ai/speaking/analyze
```typescript
// Request (multipart/form-data)
{
  audio: File,                // WAV, max 10MB, max 3 minutes
  sessionType: "free" | "ielts_p1" | "ielts_p2" | "ielts_p3" | "drill",
  taskDescription: string,    // What user was asked to speak about
}

// Response
{
  data: {
    pronunciationScore: number,   // 0-100
    fluencyScore: number,         // 0-100
    vocabularyScore: number,      // 0-100
    grammarScore: number,         // 0-100
    overallScore: number,         // 0-100
    bandEstimate: number | null,  // IELTS band, null for free users
    wordsPerMinute: number,
    fillerWords: Array<{ word: string, count: number }>,
    phonemeIssues: Array<{
      phoneme: string,
      accuracy: number,
      tip: string,
    }>,
    actionPlan: string,           // AI-generated improvement plan
    transcript: string,           // What user said
  }
}

// Rate Limits:
// Free: 3/week
// Pro: unlimited
```

### POST /api/ai/essay/grade
```typescript
// Request
{
  text: string,               // Essay text, max 500 words
  taskType: "task1" | "task2",
  targetBand: number | null,  // Optional target band
}

// Response
{
  data: {
    scores: {
      taskAchievement: number,    // 0-9
      coherenceCohesion: number,  // 0-9
      lexicalResource: number,    // 0-9
      grammaticalRange: number,   // 0-9
    },
    overallBand: number,          // 0-9
    feedback: {
      taskAchievement: string,
      coherenceCohesion: string,
      lexicalResource: string,
      grammaticalRange: string,
    },
    suggestedImprovements: string[],
    keyWordsToAdd: string[],
    grammarErrors: Array<{
      original: string,
      corrected: string,
      explanation: string,
    }>
  }
}

// Rate Limits:
// Free: 2/week
// Pro: unlimited
```

### POST /api/ai/companion/message
```typescript
// Request
{
  conversationId: string | null,  // null for new conversation
  characterId: "alex" | "sarah" | "johnson" | "mei",
  message: string,                // Max 1000 chars
  mode: "text" | "voice",
}

// Response (streaming SSE)
data: {"type": "chunk", "text": "Hey! "}
data: {"type": "chunk", "text": "How's it going?"}
data: {"type": "done", "conversationId": "uuid", "corrections": [...]}

// Corrections format
{
  corrections: Array<{
    original: string,
    corrected: string,
    type: "grammar" | "vocabulary" | "collocation",
  }>
}

// Rate Limits:
// Free: 15 messages/day
// Pro: unlimited
```

---

## 💳 Payment Endpoints

### POST /api/payment/create-charge
```typescript
// Request
{
  planId: "coffee_monthly" | "pro_monthly" | "pro_yearly" | "tutor_monthly",
  paymentMethod: "promptpay" | "credit_card",
  cardToken: string | null,   // Omise card token (if credit card)
}

// Response
{
  data: {
    chargeId: string,
    status: "pending" | "successful" | "failed",
    amount: number,           // In satang (฿149 = 14900)
    currency: "thb",
    qrCodeUrl: string | null, // For PromptPay
    authorizeUri: string | null, // For credit card 3DS
  }
}
```

---

## 🎮 Battle Endpoints

### POST /api/battle/join
```typescript
// Request
{
  deckId: string,
  mode: "random" | "private",
  roomCode: string | null,    // For private mode
}

// Response
{
  data: {
    battleId: string,
    status: "waiting" | "active",
    roomCode: string,         // Share with friend
  }
}
```

### Realtime Battle (Supabase Realtime)
```typescript
// Subscribe to battle channel
const channel = supabase
  .channel(`battle:${battleId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'battles',
    filter: `id=eq.${battleId}`,
  }, (payload) => {
    // Handle battle state changes
  })
  .on('broadcast', { event: 'answer' }, (payload) => {
    // Handle opponent answers
  })
  .subscribe()
```
