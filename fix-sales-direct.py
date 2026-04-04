#!/usr/bin/env python3
# -*- coding: utf-8 -*-

with open('src/pages/Sales.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Muammoli qismni topish va tuzatish
old_text = '''                        <div className="space-y-2">
                      
                            // Mahsulotlarni guruhlaymiz'''

new_text = '''                        <div className="space-y-2">
                          {(() => {
                            // Mahsulotlarni guruhlaymiz'''

if old_text in content:
    content = content.replace(old_text, new_text)
    print('✅ Muammoli qism topildi va tuzatildi!')
else:
    print('❌ Muammoli qism topilmadi!')
    print('Qidirilayotgan matn:')
    print(repr(old_text))

with open('src/pages/Sales.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('✅ Fayl saqlandi!')
