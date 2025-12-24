# Clear Next.js and build caches
Write-Host "Clearing Next.js cache..." -ForegroundColor Yellow

# Clear .next folder
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✓ Cleared .next cache" -ForegroundColor Green
} else {
    Write-Host "✓ .next folder not found" -ForegroundColor Gray
}

# Clear node_modules/.cache if exists
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "✓ Cleared node_modules/.cache" -ForegroundColor Green
}

# Clear TypeScript cache
if (Test-Path ".tsbuildinfo") {
    Remove-Item -Force ".tsbuildinfo"
    Write-Host "✓ Cleared TypeScript cache" -ForegroundColor Green
}

Write-Host "`nCache cleared! Now restart your dev server with: npm run dev" -ForegroundColor Cyan


