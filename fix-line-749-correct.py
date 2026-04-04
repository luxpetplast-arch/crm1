#!/usr/bin/env python3
# -*- coding: utf-8 -*-

with open('src/pages/Sales.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 749-qator (0-indexed: 748) bo'sh qator
print(f'748-index (749-qator): {repr(lines[748])}')
print(f'749-index (750-qator): {repr(lines[749])}')

# 749-qatorni {(() => { bilan almashtirish
lines[748] = '                          {(() => {\n'

with open('src/pages/Sales.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('✅ 749-qator tuzatildi!')
