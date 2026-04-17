# Fix all syntax errors in AddSale.tsx
$content = Get-Content "src\pages\AddSale.tsx" -Raw

# Fix 1: Remove the problematic closing brace and duplicate lines
$pattern1 = '}\s*}\s*};\s*\n\s*\n\s*const remainingItems'
$replacement1 = '});' + "`r`n" + '                          ' + "`r`n" + '                          const remainingItems'
$content = $content -replace $pattern1, $replacement1

# Fix 2: Ensure proper line endings for the remainingItems section
$pattern2 = 'const remainingItems = items\.map\(\(item, index\) => \(\{ \.\.\.item, originalIndex: index \}\)\)\s*\.filter\(\(\_, index\) => !usedIndices\.has\(index\)\);'
$replacement2 = 'const remainingItems = items.map((item, index) => ({ ...item, originalIndex: index }))' + "`r`n" + '                            .filter((_, index) => !usedIndices.has(index));'
$content = $content -replace $pattern2, $replacement2

# Fix 3: Ensure proper closing of the IIFE
$pattern3 = '\)\(\)\)}'
$replacement3 = ')())}' + "`r`n" + '                      </div>'
$content = $content -replace $pattern3, $replacement3

# Write back to file
Set-Content "src\pages\AddSale.tsx" -Value $content -NoNewline

Write-Host "Fixed all syntax errors in AddSale.tsx"
