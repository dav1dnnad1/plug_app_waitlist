# PLUG Waitlist - File Structure Setup Script
# Run this in PowerShell from your project root directory

Write-Host "Setting up PLUG Waitlist file structure..." -ForegroundColor Cyan
Write-Host ""

# Create directories
$directories = @(
    "app\api\send-confirmation",
    "app\api\resend-confirmation",
    "app\api\confirm-email",
    "app\confirm",
    "lib"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Created directory: $dir" -ForegroundColor Green
    } else {
        Write-Host "Directory already exists: $dir" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "File structure created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Copy the provided files to their respective locations"
Write-Host "2. Run: npm install @supabase/supabase-js resend framer-motion lucide-react"
Write-Host "3. Create .env.local with your environment variables"
Write-Host "4. Run: npm run dev"
Write-Host ""