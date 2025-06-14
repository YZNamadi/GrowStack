# Test API Endpoints Script

$baseUrl = "http://localhost:3000/api"
$headers = @{
    "Content-Type" = "application/json"
}

# Test Data
$testUser = @{
    email = "test@example.com"
    password = "securepassword"
    firstName = "Test"
    lastName = "User"
    phone = "+1234567890"
}

# Function to make API calls
function Test-Endpoint {
    param (
        [string]$method,
        [string]$endpoint,
        [object]$body = $null,
        [hashtable]$customHeaders = @{}
    )
    
    $url = "$baseUrl$endpoint"
    $requestHeaders = $headers.Clone()
    foreach ($key in $customHeaders.Keys) {
        $requestHeaders[$key] = $customHeaders[$key]
    }
    
    try {
        if ($body) {
            $bodyJson = $body | ConvertTo-Json
            $response = Invoke-WebRequest -Uri $url -Method $method -Headers $requestHeaders -Body $bodyJson
        } else {
            $response = Invoke-WebRequest -Uri $url -Method $method -Headers $requestHeaders
        }
        Write-Host "✅ $method $endpoint - Status: $($response.StatusCode)"
        Write-Host "Response: $($response.Content)`n"
        return $response.Content | ConvertFrom-Json
    } catch {
        Write-Host "❌ $method $endpoint - Error: $($_.Exception.Message)`n"
        return $null
    }
}

# 1. Test Authentication Endpoints
Write-Host "`n=== Testing Authentication Endpoints ===`n"

# Register
$registerResponse = Test-Endpoint -method "POST" -endpoint "/auth/register" -body $testUser
$token = $null
if ($registerResponse -and $registerResponse.data.token) {
    $token = $registerResponse.data.token
    $headers["Authorization"] = "Bearer $token"
}

# Login
$loginResponse = Test-Endpoint -method "POST" -endpoint "/auth/login" -body @{
    email = $testUser.email
    password = $testUser.password
}

# 2. Test User Profile Endpoints
Write-Host "`n=== Testing User Profile Endpoints ===`n"

# Get Profile
Test-Endpoint -method "GET" -endpoint "/users/profile"

# Update Profile
Test-Endpoint -method "PUT" -endpoint "/users/profile" -body @{
    firstName = "Updated"
    lastName = "Name"
    phone = "+1987654321"
}

# 3. Test Referral Endpoints
Write-Host "`n=== Testing Referral Endpoints ===`n"

# Get Referral Stats
Test-Endpoint -method "GET" -endpoint "/referrals/stats"

# Get Referral Link
Test-Endpoint -method "GET" -endpoint "/referrals/link"

# 4. Test Onboarding Endpoints
Write-Host "`n=== Testing Onboarding Endpoints ===`n"

# Update Onboarding Step
Test-Endpoint -method "POST" -endpoint "/onboarding/step" -body @{
    step = "kyc"
    metadata = @{
        documentType = "passport"
        documentNumber = "AB123456"
    }
}

# 5. Test Notification Endpoints
Write-Host "`n=== Testing Notification Endpoints ===`n"

# Get Notifications
Test-Endpoint -method "GET" -endpoint "/notifications"

# 6. Test Event Endpoints
Write-Host "`n=== Testing Event Endpoints ===`n"

# Track Event
Test-Endpoint -method "POST" -endpoint "/events/track" -body @{
    eventName = "test_event"
    properties = @{
        test = "value"
    }
}

# Get User Events
Test-Endpoint -method "GET" -endpoint "/events"

Write-Host "`n=== Testing Complete ===`n" 