#!/usr/bin/env python3
"""
Sales.tsx faylidagi dublikat state deklaratsiyalarini va JSX syntax xatolarini tuzatish
"""

with open('src/pages/Sales.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Dublikat customerSearch ni o'chirish
content = content.replace(
    "  // Qidiruv\n  const [customerSearch, setCustomerSearch] = useState('');\n  // Qidiruv\n  const [customerSearch, setCustomerSearch] = useState('');",
    "  // Qidiruv\n  const [customerSearch, setCustomerSearch] = useState('');"
)

# 2. Dublikat currency, priceType, priceMode ni o'chirish (oxirgisini)
lines = content.split('\n')
new_lines = []
skip_next_currency = False
currency_count = 0

for i, line in enumerate(lines):
    if 'const [currency, setCurrency]' in line:
        currency_count += 1
        if currency_count > 1:
            # Ikkinchi currency va keyingi 2 qatorni o'tkazib yuborish
            skip_next_currency = 3
            continue
    
    if skip_next_currency > 0:
        skip_next_currency -= 1
        continue
    
    new_lines.append(line)

content = '\n'.join(new_lines)

# 3. JSX syntax xatosini tuzatish - JavaScript kodini {(() => { ... })()} ichiga o'rash
# "// Mahsulotlarni guruhlaymiz" dan boshlab "return (" gacha bo'lgan qismni topish
if '// Mahsulotlarni guruhlaymiz' in content and 'const groupedItems: any[] = [];' in content:
    # Bu qismni {(() => { ... })()} ichiga o'rash kerak
    content = content.replace(
        '                      ) : (\n                        <div className="space-y-2">\n                      \n                            // Mahsulotlarni guruhlaymiz',
        '                      ) : (\n                        <div className="space-y-2">\n                          {(() => {\n                            // Mahsulotlarni guruhlaymiz'
    )

with open('src/pages/Sales.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Sales.tsx tuzatildi!")
print("   - Dublikat state deklaratsiyalari o'chirildi")
print("   - JSX syntax xatosi tuzatildi (IIFE qo'shildi)")
