# NearMeds API Test Script for PowerShell

$baseUrl = "http://localhost:5000/api/auth"

Write-Host "--- 1. Testing Health Check ---" -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5000/" -Method Get
    Write-Host "Success: $health" -ForegroundColor Green
} catch {
    Write-Host "Failed to connect to server. Is it running?" -ForegroundColor Red
    exit
}

Write-Host "`n--- 2. Testing Registration ---" -ForegroundColor Cyan
$registerBody = @{
    fullName = "Test User"
    email    = "testuser_" + (Get-Random) + "@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/register" -Method Post -ContentType "application/json" -Body $registerBody
    Write-Host "Registration Successful!" -ForegroundColor Green
    Write-Host "Token: $($response.token.Substring(0, 20))..." -ForegroundColor Gray
    
    $token = $response.token
} catch {
    Write-Host "Registration Failed: $($_.Exception.Message)" -ForegroundColor Red
    # Continue to login test
}

Write-Host "`n--- 3. Testing Login ---" -ForegroundColor Cyan
# Using the email from registration if available, else a default
$loginEmail = if ($registerBody) { ($registerBody | ConvertFrom-Json).email } else { "test@example.com" }
$loginBody = @{
    email    = $loginEmail
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/login" -Method Post -ContentType "application/json" -Body $loginBody
    Write-Host "Login Successful!" -ForegroundColor Green
    $token = $loginResponse.token
} catch {
    Write-Host "Login Failed: $($_.Exception.Message)" -ForegroundColor Red
}

if ($token) {
    Write-Host "`n--- 4. Testing Protected Route (Get Me) ---" -ForegroundColor Cyan
    try {
        $profile = Invoke-RestMethod -Uri "$baseUrl/me" -Method Get -Headers @{ Authorization = "Bearer $token" }
        Write-Host "Profile Retrieved: $($profile.fullName) ($($profile.email))" -ForegroundColor Green
    } catch {
        Write-Host "Profile Fetch Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "`nSkipping Protected Route test (No Token)" -ForegroundColor Yellow
}
