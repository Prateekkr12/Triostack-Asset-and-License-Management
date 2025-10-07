# Triostack Asset Manager - Start Script
# This script loads environment variables from .env files and starts both servers

Write-Host "🚀 Starting Triostack Asset Manager servers..." -ForegroundColor Green
Write-Host ""

# Check if backend .env exists
if (-not (Test-Path "backend\.env")) {
    Write-Host "⚠️  Warning: backend\.env not found!" -ForegroundColor Yellow
    Write-Host "   Creating from backend\.env.example..." -ForegroundColor Yellow
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "   ✅ Created backend\.env - Please update with your credentials" -ForegroundColor Green
    Write-Host ""
}

# Check if frontend .env.local exists
if (-not (Test-Path "frontend\.env.local")) {
    Write-Host "⚠️  Warning: frontend\.env.local not found!" -ForegroundColor Yellow
    Write-Host "   Creating from frontend\.env.local.example..." -ForegroundColor Yellow
    Copy-Item "frontend\.env.local.example" "frontend\.env.local"
    Write-Host "   ✅ Created frontend\.env.local" -ForegroundColor Green
    Write-Host ""
}

Write-Host "📡 Backend will run on: http://localhost:8000" -ForegroundColor Cyan
Write-Host "🌐 Frontend will run on: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🗄️  Environment variables loaded from .env files" -ForegroundColor Cyan
Write-Host ""

# Start both servers concurrently
npm run dev
