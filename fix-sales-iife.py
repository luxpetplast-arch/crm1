#!/usr/bin/env python3
# -*- coding: utf-8 -*-

with open('src/pages/Sales.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 750-qatorni topish (0-indexed: 749)
for i, line in enumerate(lines):
    if '// Mahsulotlarni guruhlaymiz' in line:
        print(f'✅ Topildi {i+1}-qatorda!')
        
        # Oldingi qator bo'sh bo'lishi kerak
        if i > 0 and lines[i-1].strip() == '':
            print(f'✅ {i}-qator bo\'sh, uni IIFE ochish bilan almashtiramiz')
            lines[i-1] = '                          {(() => {\n'
            
            # Faylga yozish
            with open('src/pages/Sales.tsx', 'w', encoding='utf-8') as f:
                f.writelines(lines)
            
            print('✅ Fayl tuzatildi va saqlandi!')
        else:
            print(f'❌ Oldingi qator bo\'sh emas: {repr(lines[i-1])}')
        
        break
else:
    print('❌ "// Mahsulotlarni guruhlaymiz" topilmadi!')
