# Fix syntax errors in AddSale.tsx
$content = Get-Content "src\pages\AddSale.tsx" -Raw

# Fix the problematic section around line 1168
$oldText = "});
                          
                          const remainingItems = items.map((item, index) => ({ ...item, originalIndex: index }))
                            .filter((_, index) => !usedIndices.has(index));"

$newText = "});
                          
                          const remainingItems = items.map((item, index) => ({ ...item, originalIndex: index }))
                            .filter((_, index) => !usedIndices.has(index));"

$content = $content -replace [regex]::Escape($oldText), $newText

# Write back to file
Set-Content "src\pages\AddSale.tsx" -Value $content -NoNewline

Write-Host "Fixed syntax errors in AddSale.tsx"
