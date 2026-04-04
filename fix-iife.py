#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re

with open('src/pages/Sales.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern: <div className="space-y-2"> dan keyin bo'sh qator va // Mahsulotlarni guruhlaymiz
pattern = r'(<div className="space-y-2">)\s*\n\s*\n\s*(// Mahsulotlarni guruhlaymiz)'
replacement = r'\1\n                          {(() => {\n                            \2'

if re.search(pattern, content):
    print("✅ Pattern topildi!")
    content = re.sub(pattern, replacement, content)
    print("✅ Almashtirildi!")
    
    with open('src/pages/Sales.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Fayl saqlandi!")
else:
    print("❌ Pattern topilmadi!")
    # Pattern qismlarini alohida qidirib ko'ramiz
    if '<div className="space-y-2">' in content:
        print("  ✓ <div className=\"space-y-2\"> topildi")
    if '// Mahsulotlarni guruhlaymiz' in content:
        print("  ✓ // Mahsulotlarni guruhlaymiz topildi")
