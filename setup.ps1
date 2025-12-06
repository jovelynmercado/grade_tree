# GradeTree Setup Script
# This script automates the entire setup process for the GradeTree project
# Run as: .\setup.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GradeTree - Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Host "⚠️  Warning: This script should ideally be run as Administrator for some operations." -ForegroundColor Yellow
    Write-Host "   Continue anyway? (y/n)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne 'y' -and $response -ne 'Y') {
        Write-Host "Setup cancelled." -ForegroundColor Red
        exit 1
    }
}

# Function to check if a command exists
function Test-CommandExists {
    param($command)
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Function to print section headers
function Write-Section {
    param([string]$title)
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "  $title" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
}

# ============================================================
# STEP 1: Check Prerequisites
# ============================================================
Write-Section "Step 1: Checking Prerequisites"

$prerequisites = @{
    "node" = "Node.js"
    "npm" = "npm"
    "git" = "Git"
}

$missingPrereqs = @()

foreach ($cmd in $prerequisites.Keys) {
    if (Test-CommandExists $cmd) {
        $version = & $cmd --version 2>$null
        Write-Host "✅ $($prerequisites[$cmd]) is installed" -ForegroundColor Green
        Write-Host "   Version: $version"
    } else {
        Write-Host "❌ $($prerequisites[$cmd]) is NOT installed" -ForegroundColor Red
        $missingPrereqs += $prerequisites[$cmd]
    }
}

if ($missingPrereqs.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️  Missing prerequisites:" -ForegroundColor Red
    foreach ($prereq in $missingPrereqs) {
        Write-Host "   - $prereq" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Please install the missing prerequisites:" -ForegroundColor Yellow
    Write-Host "  1. Node.js: https://nodejs.org/en" -ForegroundColor Yellow
    Write-Host "  2. Git: https://git-scm.com/downloads/win" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Setup cancelled." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ All prerequisites are installed!" -ForegroundColor Green

# ============================================================
# STEP 2: Verify Project Directory
# ============================================================
Write-Section "Step 2: Verifying Project Directory"

if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found!" -ForegroundColor Red
    Write-Host "   Please run this script from the project root directory." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project directory verified" -ForegroundColor Green
Write-Host "   Location: $(Get-Location)" -ForegroundColor Green

# ============================================================
# STEP 3: Check and Create .env File
# ============================================================
Write-Section "Step 3: Environment Configuration"

if (Test-Path ".env") {
    Write-Host "✅ .env file exists" -ForegroundColor Green
    Write-Host "   Skipping .env creation" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file not found" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Creating .env file..." -ForegroundColor Cyan
    Write-Host ""
    
    $databaseUrl = Read-Host "Enter your DATABASE_URL (from Neon or PostgreSQL)"
    
    if ([string]::IsNullOrWhiteSpace($databaseUrl)) {
        Write-Host "❌ DATABASE_URL cannot be empty!" -ForegroundColor Red
        Write-Host "   Get your DATABASE_URL from: https://neon.tech" -ForegroundColor Yellow
        exit 1
    }
    
    $envContent = @"
# Database connection
DATABASE_URL=$databaseUrl

# Server port
PORT=5000

# Environment
NODE_ENV=development
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ .env file created successfully" -ForegroundColor Green
}

# ============================================================
# STEP 4: Clear Previous Build Cache
# ============================================================
Write-Section "Step 4: Cleaning Previous Build Cache"

Write-Host "Removing old build cache..."

$cacheDirs = @(
    "node_modules\.vite",
    ".vite",
    "dist"
)

foreach ($dir in $cacheDirs) {
    if (Test-Path $dir) {
        Remove-Item -Path $dir -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Removed: $dir" -ForegroundColor Green
    }
}

Write-Host "✅ Build cache cleaned" -ForegroundColor Green

# ============================================================
# STEP 5: Install Dependencies
# ============================================================
Write-Section "Step 5: Installing Dependencies"

Write-Host "Running: npm install" -ForegroundColor Cyan
Write-Host ""

npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ npm install failed!" -ForegroundColor Red
    Write-Host "   Please check the errors above and try again." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green

# ============================================================
# STEP 6: Verify Setup
# ============================================================
Write-Section "Step 6: Verifying Setup"

$requiredFiles = @(
    "package.json",
    ".env",
    "tsconfig.json",
    "vite.config.ts",
    "server/index.ts",
    "client/src/main.tsx"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file (missing)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "❌ Some required files are missing!" -ForegroundColor Red
    exit 1
}

# ============================================================
# STEP 7: Success Summary
# ============================================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ Setup Completed Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start the development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Open your browser and navigate to:" -ForegroundColor White
Write-Host "   http://127.0.0.1:5000" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Login with admin credentials:" -ForegroundColor White
Write-Host "   Email: admin@gmail.com" -ForegroundColor Yellow
Write-Host "   Password: admin123" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. (Optional) Seed sample data:" -ForegroundColor White
Write-Host "   node seed-students.js" -ForegroundColor Yellow
Write-Host "   node expand-data.js" -ForegroundColor Yellow
Write-Host ""

Write-Host "📚 For more information, see README.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green
