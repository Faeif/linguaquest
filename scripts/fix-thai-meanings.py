#!/usr/bin/env python3
"""
fix-thai-meanings.py

Cleans up Thai translation cache files:
1. Deduplicates comma-separated synonyms → keeps first unique value
2. Strips trailing POS hints like (คำช่วย), (ลักษณนาม), etc.
3. Applies manual overrides for known wrong translations

Run: python3 scripts/fix-thai-meanings.py
Then: pnpm hsk:generate   (rebake into TS bundle)
"""

import json
import os
import re

ROOT = os.path.join(os.path.dirname(__file__), '..')
CACHE_DIR = os.path.join(ROOT, 'packages/db/src/data/hsk/th')

# ─── Manual overrides for known wrong/bad translations ───────────────────────
# Format: simplified_chinese -> correct_thai
OVERRIDES: dict[str, str] = {
    # HSK 1 wrong meanings
    '北': 'เหนือ',             # north (was: ปรอท = mercury!)
    '好看': 'สวยงาม',          # pretty/nice to look at (was: น่าอาย = embarrassing!)
    '唱': 'ร้อง',              # sing (was: ร้องไห้ = cry)
    '国': 'ประเทศ',            # country (was: นามสกุลกัว = surname Guo)
    '飞': 'บิน',               # fly (was: ลอย = float)
    '非常': 'มาก',             # very/extremely (was: พิเศษ = special)
    '星期': 'สัปดาห์',         # week (was: วันอาทิตย์ = Sunday!)
    '星期日': 'วันอาทิตย์',    # Sunday
    '星期天': 'วันอาทิตย์',    # Sunday
    '爸爸': 'พ่อ',             # father (was: พ่อ, ผู้ชายสูงวัย)
    '班': 'ชั้นเรียน',         # class/period (was: เหตุการณ์ = event)
    '包子': 'ซาลาเปา',         # steamed bun (was: บันชิ่ว)
    '本子': 'สมุดโน้ต',        # notebook (was: หนังสือ = book)
    '放': 'วาง',               # put/place (was: หลวม = loose)
    '长': 'ยาว',               # long (was: ใกล้เคียง = nearby!)
    '正': 'กำลัง',             # in the middle of (was: แน่นอน = certain)
    '着': '(แสดงสถานะ)',        # aspect particle (was: สถานะการณ์,สถานะการณ์,สถานะการณ์)

    # HSK 7-9 specific fixes
    '口香糖': 'หมากฝรั่ง',        # chewing gum (was: กัดกร่อน = corrosion!)
    '水管': 'ท่อประปา',           # water pipe (was: ท่อประป = truncated)
    '落地': 'ลงจอด',              # land/touch down (was: เกิด = to be born)

    # Common particles - clean descriptions
    '吧': '(คำช่วย นะ/สิ)',
    '呢': '(คำช่วย แล้วล่ะ)',
    '啊': '(คำอุทาน)',
    '的': '(คำช่วยเชื่อม)',
    '地': '(คำช่วยกริยา)',
    '得': '(แสดงผลลัพธ์)',
    '了': '(แสดงการสำเร็จ)',
    '过': 'เคย',
    '吗': '(คำถาม)',
    '嘛': '(คำช่วยแสดงเหตุผล)',
    '嗯': 'อืม',
    '哦': 'โอ้',
    '哇': 'ว้าว',

    # HSK 1 misc fixes
    '北边': 'ทางเหนือ',
    '本': '(ลักษณนามหนังสือ)',
    '号': 'วันที่, หมายเลข',
    '国外': 'ต่างประเทศ',
    '回': 'กลับ',
    '花': 'ดอกไม้',         # could also mean "spend" - but 花 as a noun is ดอกไม้
    '好看': 'สวยงาม',

    # Common words that often get weird translations
    '吃': 'กิน',
    '喝': 'ดื่ม',
    '说': 'พูด',
    '看': 'ดู, มอง',
    '走': 'เดิน, ไป',
    '来': 'มา',
    '去': 'ไป',
    '做': 'ทำ',
    '有': 'มี',
    '是': 'เป็น, คือ',
    '在': 'อยู่ที่',
    '和': 'และ',
    '都': 'ล้วน, ทั้งหมด',
    '也': 'ก็, ด้วย',
    '很': 'มาก',
    '不': 'ไม่',
    '没': 'ไม่มี',
    '我': 'ฉัน',
    '你': 'คุณ',
    '他': 'เขา (ชาย)',
    '她': 'เธอ (หญิง)',
    '它': 'มัน (สิ่งของ)',
    '们': '(แสดงพหูพจน์)',
    '这': 'นี้',
    '那': 'นั้น',
    '什么': 'อะไร',
    '怎么': 'อย่างไร',
    '哪': 'ที่ไหน, อัน/คน/สิ่งไหน',
    '谁': 'ใคร',
    '为什么': 'ทำไม',
    '因为': 'เพราะว่า',
    '所以': 'ดังนั้น',
    '如果': 'ถ้า',
    '但是': 'แต่',
    '或者': 'หรือ',
    '虽然': 'ทั้งที่, แม้ว่า',
    '一': 'หนึ่ง',
    '两': 'สอง (คู่)',
    '三': 'สาม',
    '四': 'สี่',
    '五': 'ห้า',
    '六': 'หก',
    '七': 'เจ็ด',
    '八': 'แปด',
    '九': 'เก้า',
    '十': 'สิบ',
    '百': 'ร้อย',
    '千': 'พัน',
    '万': 'หมื่น',
}

# ─── POS suffix patterns to strip ────────────────────────────────────────────
# These appear at the end of some translations
POS_SUFFIX_RE = re.compile(
    r',\s*\((คำกริยา|คำช่วย|ลักษณนาม|คำเชื่อม|คำวิเศษณ์|คำนาม|กริยาช่วย|คำอุทาน)\)\s*$'
)

def clean_value(value: str) -> str:
    """Clean a single Thai translation value."""
    # Strip trailing POS suffix
    value = POS_SUFFIX_RE.sub('', value).strip()

    # Split by comma, strip each part
    parts = [p.strip() for p in value.split(',')]

    # Remove empty parts
    parts = [p for p in parts if p]

    if not parts:
        return value

    # Deduplicate while preserving order
    seen = set()
    unique_parts = []
    for p in parts:
        if p not in seen:
            seen.add(p)
            unique_parts.append(p)

    # Keep max 2 unique values for display clarity
    result = ', '.join(unique_parts[:2])

    return result


def process_cache(level_label: str) -> tuple[int, int]:
    """Process one cache file. Returns (total, changed)."""
    path = os.path.join(CACHE_DIR, f'hsk-{level_label}-th.json')
    if not os.path.exists(path):
        return 0, 0

    with open(path, 'r', encoding='utf-8') as f:
        data: dict[str, str] = json.load(f)

    changed = 0
    result = {}

    for simplified, thai in data.items():
        original = thai

        # Apply manual override first
        if simplified in OVERRIDES:
            new_val = OVERRIDES[simplified]
        else:
            new_val = clean_value(thai)

        result[simplified] = new_val
        if new_val != original:
            changed += 1

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    return len(data), changed


def main():
    levels = ['1', '2', '3', '4', '5', '6', '7-9']
    print('🧹 Cleaning Thai translation caches...\n')

    total_words = 0
    total_changed = 0

    for level in levels:
        count, changed = process_cache(level)
        total_words += count
        total_changed += changed
        label = f'HSK {level}'
        print(f'   {label:10s} {count:5d} words  |  {changed:4d} fixed')

    print(f'\n✅ Done! {total_changed} translations cleaned out of {total_words} total')
    print('\nNext step: pnpm hsk:generate  (rebake TS bundle)')


if __name__ == '__main__':
    main()
