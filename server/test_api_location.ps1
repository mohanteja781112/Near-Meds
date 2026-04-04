# NearMeds API Location Test Script

$baseUrl = "http://localhost:5000/api"

# Register a new user to ensure we can login
Write-Host "--- Registering New User ---" -ForegroundColor Cyan
$rand = Get-Random
$registerBody = @{
    fullName = "Test User $rand"
    email    = "testuser$rand@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -ContentType "application/json" -Body $registerBody
    $token = $registerResponse.token
    Write-Host "Registration Successful" -ForegroundColor Green
}
catch {
    Write-Host "Registration Failed: $($_.Exception.Message)" -ForegroundColor Red
    # Try login with hardcoded if registration fails (e.g. if email somehow exists)
    Write-Host "Attempting fallback login..." -ForegroundColor Yellow
}

if (-not $token) {
    # Login fallback
    Write-Host "--- Logging in (Fallback) ---" -ForegroundColor Cyan
    $loginBody = @{
        email    = "test@example.com"
        password = "password123"
    } | ConvertTo-Json

    try {
        $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
        $token = $loginResponse.token
        Write-Host "Login Successful" -ForegroundColor Green
    }
    catch {
        Write-Host "Login Failed. Exiting." -ForegroundColor Red
        exit
    }
}

$headers = @{
    Authorization = "Bearer $token"
}

# 1. Test Save Location
Write-Host "`n--- 1. Testing Save Location ---" -ForegroundColor Cyan
$locationBody = @{
    label       = "Home Test"
    address     = "123 Test St, Test City"
    coordinates = @{ lat = 12.34; lng = 56.78 }
    source      = "MANUAL"
    isDefault   = $true
} | ConvertTo-Json

try {
    $savedLoc = Invoke-RestMethod -Uri "$baseUrl/location/save" -Method Post -Headers $headers -ContentType "application/json" -Body $locationBody
    Write-Host "Location Saved: $($savedLoc.label)" -ForegroundColor Green
    $locId = $savedLoc._id
}
catch {
    Write-Host "Save Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Test Get Locations
if ($locId) {
    Write-Host "`n--- 2. Testing Get User Locations ---" -ForegroundColor Cyan
    try {
        $locations = Invoke-RestMethod -Uri "$baseUrl/location/user-locations" -Method Get -Headers $headers
        Write-Host "Locations Retrieved: $($locations.Count)" -ForegroundColor Green
        $locations | ForEach-Object { Write-Host " - $($_.label) ($($_.address))" -ForegroundColor Gray }
    }
    catch {
        Write-Host "Get Locations Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 3. Test Delete Location
if ($locId) {
    Write-Host "`n--- 3. Testing Delete Location ---" -ForegroundColor Cyan
    try {
        Invoke-RestMethod -Uri "$baseUrl/location/$locId" -Method Delete -Headers $headers
        Write-Host "Location Deleted Successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "Delete Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}
