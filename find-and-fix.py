#!/usr/bin/env python3
# -*- coding: utf-8 -*-

with open('src/pages/Sales.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# "// Mahsulotlarni guruhlaymiz" ni topish
for i, line in enumerate(lines):
    if '// Mahsulotlarni guruhlaymiz' in line:
        print(f'Topildi {i+1}-qatorda!')
        print(f'\nOldingi 2 qator:')
        if i >= 2:
            print(f'  {i-1}: {repr(lines[i-2])}')
        if i >= 1:
            print(f'  {i}: {repr(lines[i-1])}')
        print(f'\nHozirgi qator:')
        print(f'  {i+1}: {repr(lines[i])}')
        
        # Oldingi qator bo'sh bo'lsa, uni {(() => { bilan almashtirish
        if i > 0 and lines[i-1].strip() == '':
            print(f'\n✅ {i}-qator bo\'sh! Uni tuzatamiz...')
            # Indentatsiyani oldingi-oldingi qatordan olish
            if i >= 2:
                prev_indent = len(lines[i-2]) - len(lines[i-2].lstrip())
                lines[i-1] = ' ' * (prev_indent + 2) + '{(() => {\n'
            else:
                lines[i-1] = '                          {(() => {\n'
            
            print(f'Yangi qator: {repr(lines[i-1])}')
            
            # Faylga yozish
            with open('src/pages/Sales.tsx', 'w', encoding='utf-8') as f:
                f.writelines(lines)
            
            print('\n✅ Fayl tuzatildi va saqlandi!')
        else:
            print(f'\n❌ Oldingi qator bo\'sh emas: {repr(lines[i-1])}')
        
        break
