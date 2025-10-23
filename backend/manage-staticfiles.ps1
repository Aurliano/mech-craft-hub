# Static Files Management Script for PWA (Windows PowerShell)
# This script manages static files and prevents PWA conflicts

param(
    [Parameter(Position=0)]
    [ValidateSet("clean", "collect", "both")]
    [string]$Action = "clean"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Function to clean staticfiles
function Clean-StaticFiles {
    Write-Status "Cleaning staticfiles directory..."
    
    # Remove PWA files from staticfiles
    $pwaFiles = @(
        "staticfiles/icons",
        "staticfiles/screenshots", 
        "staticfiles/service-worker.js",
        "staticfiles/manifest.json",
        "staticfiles/web.config",
        "staticfiles/pwa-debug.js",
        "staticfiles/pwa-test.js",
        "staticfiles/mime-test.js"
    )
    
    foreach ($file in $pwaFiles) {
        if (Test-Path $file) {
            Remove-Item -Path $file -Recurse -Force
            Write-Host "Removed: $file"
        }
    }
    
    Write-Success "Staticfiles cleaned"
}

# Function to collect static files
function Collect-Static {
    Write-Status "Collecting static files..."
    
    # Set environment variable for Django
    $env:SECRET_KEY = "test-secret-key"
    
    python manage.py collectstatic --noinput --clear
    
    # Clean PWA files after collection
    Clean-StaticFiles
    
    Write-Success "Static files collected and cleaned"
}

# Main execution
switch ($Action) {
    "clean" {
        Clean-StaticFiles
    }
    "collect" {
        Collect-Static
    }
    "both" {
        Clean-StaticFiles
        Collect-Static
    }
}

Write-Host ""
Write-Host "=== PWA Static Files Management ===" -ForegroundColor $Green
Write-Host "Action: $Action" -ForegroundColor $Blue
Write-Host "PWA files are now excluded from staticfiles" -ForegroundColor $Green
Write-Host ""
Write-Host "To use this script:" -ForegroundColor $Yellow
Write-Host "  .\manage-staticfiles.ps1 clean   - Remove PWA files from staticfiles" -ForegroundColor $Blue
Write-Host "  .\manage-staticfiles.ps1 collect  - Collect static files and clean PWA files" -ForegroundColor $Blue
Write-Host "  .\manage-staticfiles.ps1 both     - Clean and collect" -ForegroundColor $Blue
