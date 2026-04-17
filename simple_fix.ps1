# Simple fix for AddSale.tsx syntax errors
$content = Get-Content "src\pages\AddSale.tsx" -Raw

# Fix the main issue - remove extra closing brace
$content = $content -replace '}\);', '});'

# Write back to file
Set-Content "src\pages\AddSale.tsx" -Value $content -NoNewline

Write-Host "Applied simple fix to AddSale.tsx"
