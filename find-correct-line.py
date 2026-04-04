#!/usr/bin/env python3
# -*- coding: utf-8 -*-

with open('src/pages/Sales.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# "// Mahsulotlarni guruhlaymiz" ni topish
for i, line in enumerate(lines):
    if '// Mahsulotlarni guruhlaymiz' in line:
        print(f'Topildi {i+1}-qatorda (0-indexed: {i})!')
        print(f'\nOldingi 3 qator:')
        for j in range(max(0, i-3), i):
            print(f'  {j+1}: {repr(lines[j])}')
        print(f'\nHozirgi qator:')
        print(f'  {i+1}: {repr(line)}')
        print(f'\nKeyingi 2 qator:')
        for j in range(i+1, min(len(lines), i+3)):
            print(f'  {j+1}: {repr(lines[j])}')
        
        # Bo'sh qatorni topish
        if i > 0 and lines[i-1].strip() == '':
            print(f'\n✅ {i}-qator (fayl: {i+1}) bo\'sh qator!')
            print(f'Bu qatorni {{(() => {{ bilan almashtirish kerak')
            
            # Tuzatish
            lines[i-1] = '                          {(() => {\n'
            
            with open('src/pages/Sales.tsx', 'w', encoding='utf-8') as f:
                f.writelines(lines)
            
            print('✅ Tuzatildi!')
        break
