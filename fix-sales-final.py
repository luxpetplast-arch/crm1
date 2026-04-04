#!/usr/bin/env python3
# -*- coding: utf-8 -*-

with open('src/pages/Sales.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 749-qator bo'sh qator (0-indexed: 748)
# Uni {(() => { bilan almashtirish
if len(lines) > 748:
    old_line = lines[748]
    print(f'748-index (749-qator): {repr(old_line)}')
    
    if old_line.strip() == '':
        # Bo'sh qatorni IIFE ochish bilan almashtirish
        # Indentatsiyani saqlab qolish
        indent = len(old_line) - len(old_line.lstrip())
        lines[748] = ' ' * (indent + 2) + '{(() => {\n'
        print(f'Yangi qator: {repr(lines[748])}')
        print('✅ Bo\'sh qator IIFE ochish bilan almashtirildi!')
    else:
        print('❌ 749-qator bo\'sh emas!')

with open('src/pages/Sales.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('✅ Fayl saqlandi!')
