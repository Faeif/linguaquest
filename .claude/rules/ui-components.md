# Rule: UI Components & Aesthetic
# Version: 1.0.0

## 🎨 Theme & Vibe: "Minimalist Café" (วัยรุ่น ไม่แสบตา)
We are avoiding the "Cyberpunk AI" look (no dark mode + neon purple/blue glows).
The style should feel like **Claude.ai** mixed with a modern, clean indie app.

### Color Palette (Tailwind Tokens)
- **Background:** `bg-[#FAFAF9]` (Stone 50) — Off-white, comfortable for reading.
- **Card/Surface:** `bg-white` with very subtle borders `border-stone-200`.
- **Primary Text:** `text-stone-800` (Never pure black `#000`).
- **Secondary Text:** `text-stone-500`.
- **Brand/Accent 1 (Brown):** `text-[#8B5E3C]` or `bg-[#8B5E3C]`. This is for elegant, grounding elements.
- **Brand/Accent 2 (Orange):** `bg-[#F97316]` (Orange 500). Use extremely sparingly for primary CTAs or notification dots only.

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

## Component Example (Card)
```tsx
// ✅ Correct (Clean, Flat, Minimal)
<div className="p-6 bg-white border border-stone-200 rounded-xl">
  <h3 className="text-lg font-medium text-stone-800 tracking-tight">SRS Review</h3>
  <p className="mt-1 text-sm text-stone-500">24 cards due today</p>
  <button className="mt-4 px-4 py-2 bg-[#8B5E3C] text-white text-sm font-medium rounded-lg hover:bg-[#724C30] transition">
    Start Learning
  </button>
</div>

// ❌ Incorrect (Gradients, Dropshadows, Emojis)
<div className="p-6 bg-gradient-to-r from-purple-500 to-indigo-600 shadow-xl rounded-2xl">
  <h3 className="text-xl font-bold text-white">✨ SRS Review 🚀</h3>
  {/* The typical AI-generated look */}
</div>
```
