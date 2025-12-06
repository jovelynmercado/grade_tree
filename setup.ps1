# GradeTree Setup Script
# This script automates the entire setup process for the GradeTree project
# Run as: .\setup.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GradeTree - Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Make script tolerant: capture non-fatal problems and always exit 0
$Script:SetupWarnings = @()

function Add-Warning {
    param([string]$message)
    $Script:SetupWarnings += $message
    Write-Host "⚠️  $message" -ForegroundColor Yellow
}

function Add-Info {
    param([string]$message)
    Write-Host "   $message"
}

try {

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
    Add-Warning "Missing prerequisites:"
    foreach ($prereq in $missingPrereqs) {
        Add-Info "- $prereq"
    }
    Write-Host ""
    Add-Info "Please install the missing prerequisites or continue at your own risk:"
    Add-Info "  1. Node.js: https://nodejs.org/en"
    Add-Info "  2. Git: https://git-scm.com/downloads/win"
    Write-Host ""
    $r = Read-Host "Continue anyway? (y/n)"
    if ($r -ne 'y' -and $r -ne 'Y') {
        throw "User cancelled due to missing prerequisites"
    } else {
        Add-Warning "Proceeding despite missing prerequisites. Some steps may fail."
    }
} else {
    Write-Host "" 
    Write-Host "✅ All prerequisites are installed!" -ForegroundColor Green
}

# ============================================================
# STEP 2: Verify Project Directory
# ============================================================
Write-Section "Step 2: Verifying Project Directory"

if (-not (Test-Path "package.json")) {
    Add-Warning "package.json not found. Are you in the project root?"
    $r = Read-Host "Continue anyway? (y/n)"
    if ($r -ne 'y' -and $r -ne 'Y') {
        throw "User cancelled: not in project root"
    } else {
        Add-Warning "Proceeding - many steps may fail if not in project root"
    }
} else {
    Write-Host "✅ Project directory verified" -ForegroundColor Green
    Write-Host "   Location: $(Get-Location)" -ForegroundColor Green
}

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
    
    $attempts = 0
    do {
        $databaseUrl = Read-Host "Enter your DATABASE_URL (from Neon or PostgreSQL)"
        $attempts++
        if ([string]::IsNullOrWhiteSpace($databaseUrl)) {
            Add-Warning "DATABASE_URL cannot be empty (attempt $attempts of 3)."
            if ($attempts -lt 3) { Add-Info "Please re-enter the DATABASE_URL." }
        }
    } while ([string]::IsNullOrWhiteSpace($databaseUrl) -and $attempts -lt 3)

    if ([string]::IsNullOrWhiteSpace($databaseUrl)) {
        Add-Warning "DATABASE_URL left empty after multiple attempts. Using placeholder value."
        $databaseUrl = "postgresql://user:password@localhost:5432/grade_tree?sslmode=disable"
    }
    
    $envContent = @"
# Database connection
DATABASE_URL=$databaseUrl

# Server port
PORT=5000

# Environment
NODE_ENV=development
"@
    
    try {
        $envContent | Out-File -FilePath ".env" -Encoding UTF8 -Force
        Write-Host "✅ .env file created successfully" -ForegroundColor Green
    } catch {
        Add-Warning "Failed to write .env file: $_"
    }
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

try {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Add-Warning "npm install reported errors (exit code $LASTEXITCODE). Please inspect output above. Continuing anyway."
    } else {
        Write-Host ""; Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
    }
} catch {
    Add-Warning "npm install failed with exception: $_. Continuing anyway."
}

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
    Add-Warning "Some required files are missing; the project may not run correctly. See list above."
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

} catch {
    Add-Warning "Setup encountered an error: $_"
} finally {
    Write-Host ""
    if ($Script:SetupWarnings.Count -gt 0) {
        Write-Host "========================================" -ForegroundColor Yellow
        Write-Host "  ⚠️  Setup finished with warnings" -ForegroundColor Yellow
        Write-Host "========================================" -ForegroundColor Yellow
        foreach ($w in $Script:SetupWarnings) { Write-Host "- $w" -ForegroundColor Yellow }
    } else {
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  ✅ Setup finished (no warnings)" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "Note: This script is designed to be idempotent and tolerant. If something didn't complete, check the messages above and re-run." -ForegroundColor Cyan
    
    # Prompt to start dev server in the current terminal (no new window)
    $startDev = Read-Host "Start dev server now in this terminal? (Y/n)"
    if ([string]::IsNullOrWhiteSpace($startDev) -or $startDev -eq 'y' -or $startDev -eq 'Y') {
        try {
            Write-Host "Starting dev server in current terminal (use Ctrl+C to stop)." -ForegroundColor Cyan
            npm run dev
        } catch {
            Add-Warning "Failed to start dev server in current terminal: $_"
            Add-Info "You can start it manually by running: npm run dev"
        }
    } else {
        Add-Info "Skipping dev server start. Run npm run dev to start manually."
    }

    exit 0
}
