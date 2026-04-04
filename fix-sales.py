#!/usr/bin/env python3
# -*- coding: utf-8 -*-

with open('src/pages/Sales.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 748-qatorni tuzatish (0-indexed: 747)
if len(lines) > 747:
    # 748-qator: bo'sh qator o'rniga IIFE ochish
    if '                      ' in lines[747] and lines[747].strip() == '':
        lines[747] = '                          {(() => {\n'
        print(f'✅ 748-qator tuzatildi: {repr(lines[747])}')
    else:
        print(f'⚠️ 748-qator kutilganidek emas: {repr(lines[747])}')

with open('src/pages/Sales.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('✅ Fayl saqlandi!')
