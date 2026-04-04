#!/usr/bin/env python3
# -*- coding: utf-8 -*-

with open('src/pages/Sales.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# "// Mahsulotlarni guruhlaymiz" ni topish
for i, line in enumerate(lines):
    if '// Mahsulotlarni guruhlaymiz' in line:
        print(f'Topildi {i+1}-qatorda!')
        print(f'Oldingi 2 qator:')
        if i > 0:
            print(f'{i}: {repr(lines[i-1])}')
        if i > 1:
            print(f'{i-1}: {repr(lines[i-2])}')
        print(f'Hozirgi qator:')
        print(f'{i+1}: {repr(line)}')
        print(f'Keyingi qator:')
        if i < len(lines) - 1:
            print(f'{i+2}: {repr(lines[i+1])}')
        break
