# 🤖 LinguaQuest — AI Model Architecture (Chinese Focus)

> **หลักการ Dual-Language Design:** ใช้โมเดลที่เก่งภาษาจีน (Chinese Specialist) จับผิดและประเมินให้แม่น → ส่งผลให้โมเดล/ระบบที่เก่งภาษาไทย (Thai Explainer) อธิบายให้ผู้เรียน

---

## ♟️ กลยุทธ์ Dual-Model

| Layer | โมเดล | หน้าที่ | ราคา |
|-------|-------|---------|------|
| **🔬 Chinese Specialist** | DeepSeek V3.2 | Parse โครงสร้างประโยคจีน, วิเคราะห์ความถูกต้อง, หา Index คำผิด | $0.028/1M tokens (cache) |
| **🎓 Thai Explainer** | Qwen3 (Thinking Off) | แปลงผลวิเคราะห์เป็นคำอธิบายภาษาไทยที่ครูพูดได้ | $0.015/1M tokens |
| **🎙️ Chinese STT** | Qwen3-ASR | Speech-to-text ภาษาจีนรองรับ Mandarin + ภาษาถิ่น | Open-source (Free) |
| **📊 Tone & Pronunciation** | SpeechSuper API | ประเมินเสียงวรรณยุกต์, Phoneme ระดับ syllable | ต้องลงทะเบียน (มีฟรีทดลอง) |

---

## 🔌 API Integration สำหรับแต่ละฟีเจอร์

### 🃏 F05: AI Card Generator

```
Flow: User search "普遍"
    ↓
ตรวจ global_cards DB → MISS
    ↓
DeepSeek V3.2: "Generate an HSK flashcard for '普遍' in this JSON schema:
  { word, pinyin, hsk_level, definition_th, examples[{zh,pinyin,th}], synonyms }"
    ↓
Save to global_cards (พร้อม Cache warmup)
Cost: ~400 tokens = $0.000011/card ≈ แทบฟรี
```

**หมายเหตุ:** อย่าใช้ Qwen3 ตรงนี้ เพราะ DeepSeek V3.2 อ่านจีนแม่นกว่าและแห่งถูกกว่ามาก

---

### 🗣️ F08: AI Companion (Voice Chat)

```
Voice Input (User พูด)
    ↓
Qwen3-ASR (self-hosted / Alibaba Cloud API)
    → แปลงเสียงจีนเป็น Text (รองรับ tone markers)
    ↓
DeepSeek V3.2:
  System Prompt: "You are Lin, a native Beijing speaker. User is HSK {level}.
                  Reply in Chinese. Keep Hanzi. Add Pinyin in brackets if level <= HSK2."
    ↓
Response Text
    ↓
Qwen3 (Thai): (เฉพาะ level <= HSK 3)
  "Translate the [FEEDBACK] block to Thai naturally, as a teacher would say"
    ↓
TTS: Alibaba Cloud / Web Speech API อ่านออกเสียงจีนให้ user
```

**Cost/conversation:**
- Qwen3-ASR: ฟรี (open-source, host เอง) หรือ ~$0.002/นาที (Alibaba Cloud API)
- DeepSeek V3.2: ~$0.005/10 messages
- Qwen3 Thai: ~$0.001/10 messages

---

### 🎤 F06: Speaking Coach (SpeechSuper + Qwen3-ASR)

> **ปัญหาเดิม:** ใช้ไมค์ธรรมดาจับ Phoneme → ผลไม่แม่น
> **ทางออก:** แยกสองโหมด

#### โหมด A: Tone Assessment (เสียงวรรณยุกต์) — ใช้ SpeechSuper
```
User พูดคำ/ประโยค (อัดเสียง)
    ↓
SpeechSuper API (coreType: "cn.word.eval")
  → ส่ง audio + refText (คำอ้างอิง)
  → ได้กลับมา: tone_score, phoneme_scores, syllable_errors
    ↓
Qwen3 (Thai Explainer):
  Input: SpeechSuper JSON result
  Prompt: "Explain to a Thai learner in natural Thai why their tone was wrong and how to fix it"
    ↓
แสดงผล: "เสียงวรรณยุกต์ที่ 3 ของคุณฟังดูเหมือนเสียงที่ 2 ลองออกเสียงแบบ U-shape ดูค่ะ"
```

**SpeechSuper coreType สำหรับจีน:**
- `cn.word.eval` — ประเมินคำเดี่ยว + วรรณยุกต์
- `cn.sent.eval` — ประเมินประโยค + Fluency
- `cn.syllable.eval` — ประเมินระดับพยางค์

#### โหมด B: Grammar & Fluency — ใช้ Qwen3-ASR + DeepSeek
```
User พูดอิสระ (ไม่มี Script)
    ↓
Qwen3-ASR → แปลงเป็น Text
    ↓
DeepSeek V3.2: "Find grammar errors in this spoken Chinese. 
  Focus on: BA-structure, complements, measure words.
  Ignore tones (already assessed separately).
  Return JSON: { errors[{char, index, correct, type}] }"
    ↓
Qwen3 (Thai): อธิบายเป็นภาษาไทยแบบครูพูด
```

---

### ✍️ F07: Essay Grader (4-Dimension)

```
User เขียน essay ภาษาจีน
    ↓
DeepSeek V3.2 (Chinese Specialist):
  Prompt: "Grade this HSK essay. Return strict JSON:
  {
    scores: {
      grammar: 0-100,      // syntax correctness
      vocabulary: 0-100,   // HSK-appropriate word choice
      coherence: 0-100,    // paragraph flow & logic
      naturalness: 0-100   // native speaker likeness
    },
    errors: [{
      char: '的',
      index: 42,
      correct_char: '地',
      error_type: 'particle_confusion',
      severity: 'high'
    }],
    corrected_version: '...'
  }"
    ↓
Qwen3 (Thai Explainer):
  Input: DeepSeek JSON errors array
  Prompt: "Explain each error to a Thai learner as a friendly Chinese teacher.
           Use natural Thai. Give one easy-to-remember tip per error."
    ↓
UI: Hanzi Highlighting (ไฮไลต์ตัวอักษรผิดสีแดง) + คำอธิบายไทยเด้งขึ้นมา
```

---

## 💰 Cost Summary (ต่อ User ต่อวัน)

| Feature | Operations | Cost/วัน |
|---------|-----------|---------|
| Card Gen (F05) | 10 cards | ~$0.0001 |
| AI Companion (F08) | 20 messages | ~$0.01 |
| Speaking Coach (F06) | 5 evaluations | SpeechSuper pricing |
| Essay Grader (F07) | 1 essay | ~$0.015 |
| **รวม** | | **<$0.03/user/วัน** |

---

## 🔧 Environment Variables ที่ต้องเพิ่ม

```bash
# DeepSeek
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=https://api.deepseek.com

# Qwen3 / Alibaba Cloud  
ALIBABA_CLOUD_API_KEY=
QWEN3_ASR_MODEL=qwen3-asr-flash

# SpeechSuper
SPEECHSUPER_APP_KEY=
SPEECHSUPER_SECRET_KEY=
SPEECHSUPER_BASE_URL=https://api.speechsuper.com

# Qwen3 Chat (Thai Explainer)
QWEN3_CHAT_MODEL=qwen-max
```

---

## 📐 Decision Matrix (เลือก Model ให้ถูก)

| Task | ใช้ Model | เหตุผล |
|------|----------|--------|
| สร้าง Flashcard | DeepSeek V3.2 | จีนแม่น, ถูกสุด |
| AI Chat (ตอบจีน) | DeepSeek V3.2 | Native-quality Chinese |
| คำอธิบายไทย | Qwen3 | ภาษาไทยราบรื่นกว่า |
| แปลงเสียง → Text | Qwen3-ASR | ฟรี, รองรับ Mandarin + dialect |
| ประเมินวรรณยุกต์ | SpeechSuper | Phoneme-level accuracy สูงสุด |
| ตรวจ Grammar | DeepSeek V3.2 | วิเคราะห์โครงสร้างจีนเก่งสุด |
