# Chekni printerga yuborish skripti
param(
    [string]$HtmlFile = "test-receipt-80mm.html",
    [string]$PrinterName = "Xprinter XP-365B"
)

Write-Host "🖨️  Chek chop etilmoqda..." -ForegroundColor Green
Write-Host "📄 Fayl: $HtmlFile" -ForegroundColor Cyan
Write-Host "🖨️  Printer: $PrinterName" -ForegroundColor Cyan

# HTML faylni ochish va chop etish
$ie = New-Object -ComObject InternetExplorer.Application
$ie.Visible = $false

$fullPath = (Resolve-Path $HtmlFile).Path
$ie.Navigate($fullPath)

# Sahifa yuklanishini kutish
while ($ie.Busy -or $ie.ReadyState -ne 4) {
    Start-Sleep -Milliseconds 100
}

Start-Sleep -Seconds 1

# Chop etish
$ie.ExecWB(6, 2)  # 6 = OLECMDID_PRINT, 2 = OLECMDEXECOPT_DONTPROMPTUSER

Start-Sleep -Seconds 2

$ie.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ie) | Out-Null

Write-Host "✅ Chek muvaffaqiyatli chop etildi!" -ForegroundColor Green
