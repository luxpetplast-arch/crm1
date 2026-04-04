#!/usr/bin/env python3
# -*- coding: utf-8 -*-

with open('src/pages/Sales.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 749-qator (0-indexed: 748) bo'sh qator bo'lishi kerak
# Uni {(() => { bilan almashtirish
if len(lines) > 748:
    print(f'748-qator (749-qator fayl raqami): {repr(lines[748])}')
    # Bo'sh qatorni IIFE ochish bilan almashtirish
    lines[748] = '                          {(() => {\n'
    print(f'Yangi qator: {repr(lines[748])}')

with open('src/pages/Sales.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('✅ 749-qator tuzatildi!')
