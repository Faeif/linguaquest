-- Seed: Vocabulary Categories
-- Populates the 3-level category hierarchy with HSK, Topic, Grammar, Special, and Thai Context.

-- ═══════════════════════════════════════════════════════════════
-- LEVEL 1: Major Categories
-- ═══════════════════════════════════════════════════════════════

INSERT INTO vocabulary_categories (slug, category_type, level, name_en, name_th, name_zh, icon, priority, difficulty)
VALUES
  ('hsk', 'hsk', 1, 'HSK Levels', 'ระดับ HSK', '汉语水平考试', '🎯', 1, NULL),
  ('topic', 'topic', 1, 'Topics', 'หัวข้อ', '主题', '📚', 2, NULL),
  ('grammar', 'grammar', 1, 'Grammar', 'ไวยากรณ์', '语法', '📝', 3, NULL),
  ('special', 'special', 1, 'Special', 'พิเศษ', '特殊', '⭐', 4, NULL);

-- ═══════════════════════════════════════════════════════════════
-- LEVEL 2: HSK Categories
-- ═══════════════════════════════════════════════════════════════

INSERT INTO vocabulary_categories (slug, category_type, level, parent_id, name_en, name_th, name_zh, icon, priority, word_count, difficulty)
VALUES
  ('hsk_1', 'hsk', 2, (SELECT id FROM vocabulary_categories WHERE slug = 'hsk'), 'HSK Level 1', 'HSK ระดับ 1', '汉语水平考试一级', '1️⃣', 1, 150, 'beginner'),
  ('hsk_2', 'hsk', 2, (SELECT id FROM vocabulary_categories WHERE slug = 'hsk'), 'HSK Level 2', 'HSK ระดับ 2', '汉语水平考试二级', '2️⃣', 2, 300, 'beginner'),
  ('hsk_3', 'hsk', 2, (SELECT id FROM vocabulary_categories WHERE slug = 'hsk'), 'HSK Level 3', 'HSK ระดับ 3', '汉语水平考试三级', '3️⃣', 3, 600, 'intermediate'),
  ('hsk_4', 'hsk', 2, (SELECT id FROM vocabulary_categories WHERE slug = 'hsk'), 'HSK Level 4', 'HSK ระดับ 4', '汉语水平考试四级', '4️⃣', 4, 1200, 'intermediate'),
  ('hsk_5', 'hsk', 2, (SELECT id FROM vocabulary_categories WHERE slug = 'hsk'), 'HSK Level 5', 'HSK ระดับ 5', '汉语水平考试五级', '5️⃣', 5, 2500, 'advanced'),
  ('hsk_6', 'hsk', 2, (SELECT id FROM vocabulary_categories WHERE slug = 'hsk'), 'HSK Level 6', 'HSK ระดับ 6', '汉语水平考试六级', '6️⃣', 6, 5000, 'advanced');

-- ═══════════════════════════════════════════════════════════════
-- LEVEL 3: HSK Subcategories (HSK 1 only — expandable)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO vocabulary_categories (slug, category_type, level, parent_id, name_en, name_th, name_zh, icon, priority, difficulty)
VALUES
  ('hsk1_greetings', 'hsk', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'hsk_1'), 'Greetings', 'คำทักทาย', '问候', '👋', 1, 'beginner'),
  ('hsk1_numbers', 'hsk', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'hsk_1'), 'Numbers', 'ตัวเลข', '数字', '🔢', 2, 'beginner'),
  ('hsk1_time', 'hsk', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'hsk_1'), 'Time', 'เวลา', '时间', '⏰', 3, 'beginner'),
  ('hsk1_people', 'hsk', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'hsk_1'), 'People', 'บุคคล', '人物', '👤', 4, 'beginner');

-- ═══════════════════════════════════════════════════════════════
-- LEVEL 2: Topic Categories
-- ═══════════════════════════════════════════════════════════════

INSERT INTO vocabulary_categories (slug, category_type, level, parent_id, name_en, name_th, name_zh, icon, priority, difficulty)
VALUES
  ('food_dining', 'topic', 2, (SELECT id FROM vocabulary_categories WHERE slug = 'topic'), 'Food & Dining', 'อาหารและการทานอาหาร', '饮食', '🍜', 1, 'beginner'),
  ('travel', 'topic', 2, (SELECT id FROM vocabulary_categories WHERE slug = 'topic'), 'Travel', 'การเดินทาง', '旅行', '✈️', 2, 'beginner'),
  ('shopping', 'topic', 2, (SELECT id FROM vocabulary_categories WHERE slug = 'topic'), 'Shopping', 'ช้อปปิ้ง', '购物', '🛍️', 3, 'beginner'),
  ('work_business', 'topic', 2, (SELECT id FROM vocabulary_categories WHERE slug = 'topic'), 'Work & Business', 'งานและธุรกิจ', '工作', '💼', 4, 'intermediate'),
  ('health_medical', 'topic', 2, (SELECT id FROM vocabulary_categories WHERE slug = 'topic'), 'Health & Medical', 'สุขภาพและการแพทย์', '健康', '💊', 5, 'intermediate'),
  ('technology', 'topic', 2, (SELECT id FROM vocabulary_categories WHERE slug = 'topic'), 'Technology', 'เทคโนโลยี', '科技', '📱', 6, 'intermediate'),
  ('daily_life', 'topic', 2, (SELECT id FROM vocabulary_categories WHERE slug = 'topic'), 'Daily Life', 'ชีวิตประจำวัน', '日常生活', '🏠', 7, 'beginner'),
  ('education', 'topic', 2, (SELECT id FROM vocabulary_categories WHERE slug = 'topic'), 'Education', 'การศึกษา', '教育', '📖', 8, 'beginner'),
  ('entertainment', 'topic', 2, (SELECT id FROM vocabulary_categories WHERE slug = 'topic'), 'Entertainment', 'ความบันเทิง', '娱乐', '🎬', 9, 'beginner'),
  ('relationships', 'topic', 2, (SELECT id FROM vocabulary_categories WHERE slug = 'topic'), 'Relationships', 'ความสัมพันธ์', '关系', '❤️', 10, 'intermediate');

-- ═══════════════════════════════════════════════════════════════
-- LEVEL 3: Topic Subcategories
-- ═══════════════════════════════════════════════════════════════

-- Food & Dining subs
INSERT INTO vocabulary_categories (slug, category_type, level, parent_id, name_en, name_th, name_zh, icon, priority, difficulty)
VALUES
  ('food_basics', 'topic', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'food_dining'), 'Basic Foods', 'อาหารพื้นฐาน', '基本食物', '🍚', 1, 'beginner'),
  ('food_ordering', 'topic', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'food_dining'), 'Ordering Food', 'การสั่งอาหาร', '点菜', '📋', 2, 'beginner'),
  ('food_chinese_dishes', 'topic', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'food_dining'), 'Chinese Dishes', 'อาหารจีน', '中国菜', '🥟', 3, 'intermediate'),
  ('food_thai_in_chinese', 'topic', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'food_dining'), 'Thai Food in Chinese', 'อาหารไทยเป็นภาษาจีน', '泰国菜', '🇹🇭', 4, 'intermediate'),
  ('food_drinks', 'topic', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'food_dining'), 'Drinks', 'เครื่องดื่ม', '饮料', '🧋', 5, 'beginner'),
  ('food_taste', 'topic', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'food_dining'), 'Taste', 'รสชาติ', '味道', '👅', 6, 'beginner');

-- Travel subs
INSERT INTO vocabulary_categories (slug, category_type, level, parent_id, name_en, name_th, name_zh, icon, priority, difficulty)
VALUES
  ('travel_airport', 'topic', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'travel'), 'Airport', 'สนามบิน', '机场', '🛫', 1, 'intermediate'),
  ('travel_hotel', 'topic', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'travel'), 'Hotel', 'โรงแรม', '酒店', '🏨', 2, 'beginner'),
  ('travel_directions', 'topic', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'travel'), 'Asking Directions', 'การถามทาง', '问路', '🧭', 3, 'beginner'),
  ('travel_transportation', 'topic', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'travel'), 'Transportation', 'การเดินทาง', '交通', '🚇', 4, 'beginner'),
  ('travel_sightseeing', 'topic', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'travel'), 'Sightseeing', 'ท่องเที่ยว', '观光', '📸', 5, 'beginner');

-- Shopping subs
INSERT INTO vocabulary_categories (slug, category_type, level, parent_id, name_en, name_th, name_zh, icon, priority, difficulty)
VALUES
  ('shopping_basics', 'topic', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'shopping'), 'Shopping Basics', 'การซื้อของพื้นฐาน', '购物基础', '💰', 1, 'beginner'),
  ('shopping_clothes', 'topic', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'shopping'), 'Clothes', 'เสื้อผ้า', '衣服', '👔', 2, 'beginner'),
  ('shopping_bargaining', 'topic', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'shopping'), 'Bargaining', 'การต่อรอง', '讨价还价', '🤝', 3, 'intermediate');

-- Work & Business subs
INSERT INTO vocabulary_categories (slug, category_type, level, parent_id, name_en, name_th, name_zh, icon, priority, difficulty)
VALUES
  ('work_office', 'topic', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'work_business'), 'Office', 'ออฟฟิศ', '办公室', '🖥️', 1, 'intermediate'),
  ('work_meetings', 'topic', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'work_business'), 'Meetings', 'การประชุม', '会议', '📊', 2, 'intermediate'),
  ('work_email', 'topic', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'work_business'), 'Email', 'อีเมล', '电子邮件', '📧', 3, 'intermediate');

-- Health subs
INSERT INTO vocabulary_categories (slug, category_type, level, parent_id, name_en, name_th, name_zh, icon, priority, difficulty)
VALUES
  ('health_symptoms', 'topic', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'health_medical'), 'Symptoms', 'อาการ', '症状', '🤒', 1, 'intermediate'),
  ('health_hospital', 'topic', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'health_medical'), 'Hospital', 'โรงพยาบาล', '医院', '🏥', 2, 'intermediate'),
  ('health_pharmacy', 'topic', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'health_medical'), 'Pharmacy', 'ร้านขายยา', '药店', '💊', 3, 'intermediate');

-- Technology subs
INSERT INTO vocabulary_categories (slug, category_type, level, parent_id, name_en, name_th, name_zh, icon, priority, difficulty)
VALUES
  ('tech_devices', 'topic', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'technology'), 'Devices', 'อุปกรณ์', '设备', '💻', 1, 'beginner'),
  ('tech_apps', 'topic', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'technology'), 'Apps', 'แอพพลิเคชั่น', '应用', '📲', 2, 'beginner'),
  ('tech_internet', 'topic', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'technology'), 'Internet', 'อินเทอร์เน็ต', '互联网', '🌐', 3, 'beginner');

-- Daily Life subs
INSERT INTO vocabulary_categories (slug, category_type, level, parent_id, name_en, name_th, name_zh, icon, priority, difficulty)
VALUES
  ('daily_family', 'topic', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'daily_life'), 'Family', 'ครอบครัว', '家庭', '👨‍👩‍👧‍👦', 1, 'beginner'),
  ('daily_house', 'topic', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'daily_life'), 'House', 'บ้าน', '房屋', '🏡', 2, 'beginner'),
  ('daily_routines', 'topic', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'daily_life'), 'Daily Routines', 'กิจวัตร', '日常', '⏰', 3, 'beginner');

-- ═══════════════════════════════════════════════════════════════
-- LEVEL 2: Grammar Categories
-- ═══════════════════════════════════════════════════════════════

INSERT INTO vocabulary_categories (slug, category_type, level, parent_id, name_en, name_th, name_zh, icon, priority, difficulty)
VALUES
  ('measure_words', 'grammar', 2, (SELECT id FROM vocabulary_categories WHERE slug = 'grammar'), 'Measure Words (量词)', 'ลักษณนาม (量词)', '量词', '📏', 1, 'beginner'),
  ('particles', 'grammar', 2, (SELECT id FROM vocabulary_categories WHERE slug = 'grammar'), 'Particles (助词)', 'คำช่วย (助词)', '助词', '✨', 2, 'beginner'),
  ('time_expressions', 'grammar', 2, (SELECT id FROM vocabulary_categories WHERE slug = 'grammar'), 'Time Expressions', 'การบอกเวลา', '时间表达', '⏳', 3, 'intermediate'),
  ('connectors', 'grammar', 2, (SELECT id FROM vocabulary_categories WHERE slug = 'grammar'), 'Connectors', 'คำเชื่อม', '连接词', '🔗', 4, 'intermediate');

-- Grammar subcategories (Measure Words)
INSERT INTO vocabulary_categories (slug, category_type, level, parent_id, name_en, name_th, name_zh, icon, priority, difficulty)
VALUES
  ('mw_people', 'grammar', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'measure_words'), 'People', 'คน', '人', '👤', 1, 'beginner'),
  ('mw_objects', 'grammar', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'measure_words'), 'Objects', 'สิ่งของ', '物品', '📦', 2, 'beginner'),
  ('mw_animals', 'grammar', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'measure_words'), 'Animals', 'สัตว์', '动物', '🐾', 3, 'beginner');

-- ═══════════════════════════════════════════════════════════════
-- LEVEL 2: Special Categories
-- ═══════════════════════════════════════════════════════════════

INSERT INTO vocabulary_categories (slug, category_type, level, parent_id, name_en, name_th, name_zh, icon, priority, difficulty)
VALUES
  ('idioms', 'special', 2, (SELECT id FROM vocabulary_categories WHERE slug = 'special'), 'Chinese Idioms (成语)', 'สำนวนจีน (成语)', '成语', '🎭', 1, 'advanced'),
  ('slang', 'special', 2, (SELECT id FROM vocabulary_categories WHERE slug = 'special'), 'Slang & Colloquial', 'ภาษาพูด/แสลง', '俗语', '💬', 2, 'intermediate'),
  ('business_formal', 'special', 2, (SELECT id FROM vocabulary_categories WHERE slug = 'special'), 'Business Formal', 'ภาษาธุรกิจ (formal)', '商务用语', '🎩', 3, 'advanced'),
  ('thai_context', 'special', 2, (SELECT id FROM vocabulary_categories WHERE slug = 'special'), 'Essential for Thai Learners', 'คำที่คนไทยต้องรู้', '泰国学生必学', '🇹🇭', 4, 'beginner');

-- 🇹🇭 Thai Context subcategories (unique differentiator!)
INSERT INTO vocabulary_categories (slug, category_type, level, parent_id, name_en, name_th, name_zh, icon, priority, difficulty)
VALUES
  ('thai_food_chinese', 'special', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'thai_context'), 'Thai Food in Chinese', 'อาหารไทยเป็นภาษาจีน', '泰国菜', '🍛', 1, 'beginner'),
  ('thai_places', 'special', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'thai_context'), 'Places in Thailand', 'สถานที่ในไทย', '泰国地名', '📍', 2, 'beginner'),
  ('thai_buddhism', 'special', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'thai_context'), 'Buddhism', 'พุทธศาสนา', '佛教', '🙏', 3, 'intermediate'),
  ('thai_culture', 'special', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'thai_context'), 'Thai Culture', 'วัฒนธรรมไทย', '泰国文化', '🪷', 4, 'intermediate');

-- Idioms subcategories
INSERT INTO vocabulary_categories (slug, category_type, level, parent_id, name_en, name_th, name_zh, icon, priority, difficulty)
VALUES
  ('idioms_4char', 'special', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'idioms'), '4-Character Idioms', 'สำนวนสี่ตัวอักษร', '四字成语', '4️⃣', 1, 'advanced'),
  ('idioms_common', 'special', 3, (SELECT id FROM vocabulary_categories WHERE slug = 'idioms'), 'Common Sayings', 'คำพูดที่ใช้บ่อย', '常用语', '💡', 2, 'intermediate');
