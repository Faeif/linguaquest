# Rule: UI Components & Aesthetic
# Version: 2.0.0

## 🎨 Theme & Vibe: "Earthy Minimalist" (อบอุ่น สบายตา)
We are avoiding the "Cyberpunk AI" look (no dark mode + neon purple/blue glows).
The style should feel like **Claude.ai** mixed with a warm, earthy Chinese learning app.

### Color Palette (Earthy Tones)

| Role | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| **Background** | `#FAF7F2` | `bg-[#FAF7F2]` | Main page background (Warm Cream) |
| **Surface/Card** | `#FFFEFB` | `bg-[#FFFEFB]` | Card backgrounds |
| **Border** | `#E8E0D5` | `border-[#E8E0D5]` | Card borders, dividers (Sand) |
| **Primary Text** | `#3D3630` | `text-[#3D3630]` | Main text (Warm Charcoal) |
| **Secondary Text** | `#7A7067` | `text-[#7A7067]` | Pinyin, metadata |
| **Chinese Hanzi** | `#2C2824` | `text-[#2C2824]` | Chinese characters (Ink Black) |
| **Accent 1 (CTA)** | `#C4704B` | `bg-[#C4704B]` | Primary buttons (Terracotta) |
| **Accent 1 Hover** | `#A85A3A` | `hover:bg-[#A85A3A]` | Button hover state |
| **Accent 2 (Info)** | `#7D8B6A` | `bg-[#7D8B6A]` | Secondary actions (Sage Green) |
| **Hint Text (Thai)** | `#9A9179` | `text-[#9A9179]` | Thai hints, explanations (Muted Olive) |
| **Success** | `#6B7F5E` | `text-[#6B7F5E]` | Correct answers (Moss) |
| **Error** | `#B56B6B` | `text-[#B56B6B]` | Wrong answers (Dusty Rose) |

## 🚫 The "Anti-AI-Generated" Rules
AI tends to generate UI that looks predictably "AI-ish". **NEVER DO THESE:**
1. ❌ **NO Gradients:** Do not use `bg-gradient-to-r`. Flat colors only.
2. ❌ **NO Heavy Shadows:** Do not use `shadow-lg` or `shadow-xl`. Use only `shadow-sm` or simple `border-b-2` for depth.
3. ❌ **NO Overuse of Emojis:** AI loves adding emojis to every heading (e.g., 🚀 Welcome!). Only use emojis if strictly necessary for bullet points or navigation, otherwise omit them. Use clean SVG icons (Lucide/Heroicons) instead.
4. ❌ **NO "AI Sparkles":** Do not put ✨ icons next to features just because they are AI-powered. Treat AI as a backend feature, not a shiny toy.
5. ❌ **NO Glassmorphism:** Do not use `backdrop-blur` heavily. Keep it solid and readable.

## ✅ DO THIS INSTEAD: "Brutalist / Clean Typography"
1. **Typography First:** Rely on text size, weight (`font-semibold`, `tracking-tight`), and spacing to create hierarchy, not colored backgrounds.
2. **Plenty of Whitespace:** Use `p-6` or `p-8` for padding. Let the interface breathe.
3. **Pill Shapes:** Use `rounded-full` for chips and tags, but keep buttons `rounded-md` or `rounded-lg` for structure.
4. **Soft Interactions:** Use `hover:bg-stone-100 transition-colors` instead of making buttons jump around or glow.

## Component Example (Chinese Vocab Card)
```tsx
// ✅ Correct (Earthy, Clean, Minimal)
<div className="p-6 bg-[#FFFEFB] border border-[#E8E0D5] rounded-xl">
  <p className="text-3xl font-medium text-[#2C2824] tracking-wide">普遍</p>
  <p className="mt-1 text-sm text-[#7A7067]">pǔ biàn</p>
  <p className="mt-2 text-[#3D3630]">ทั่วไป, แพร่หลาย</p>
  <p className="mt-3 text-sm text-[#9A9179]">ใช้บอกว่าสิ่งใดสิ่งหนึ่งพบได้ทั่วไป</p>
  <button className="mt-4 px-4 py-2 bg-[#C4704B] text-white text-sm font-medium rounded-lg hover:bg-[#A85A3A] transition">
    เพิ่มเข้า Deck
  </button>
</div>

// ❌ Incorrect (Gradients, Dropshadows, Emojis)
<div className="p-6 bg-gradient-to-r from-purple-500 to-indigo-600 shadow-xl rounded-2xl">
  <h3 className="text-xl font-bold text-white">✨ 普遍 🚀</h3>
  {/* The typical AI-generated look */}
</div>
```
