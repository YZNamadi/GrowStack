const axios = require('axios');

const API_URL = 'http://localhost:3000/api/v1';
let authToken = null;
let userId = null;

const makeRequest = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error in ${method.toUpperCase()} ${endpoint}:`, error.response?.data || error.message);
    return null;
  }
};

const testAllEndpoints = async () => {
  console.log('Starting endpoint tests...\n');

  // 1. Test Auth Endpoints
  console.log('Testing Auth Endpoints:');

  // Register
  console.log('\n1. Testing Register:');
  const uniqueSuffix = `${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
  const registerData = {
    email: `test${uniqueSuffix}@example.com`,
    password: 'Test123!@#',
    firstName: 'Test',
    lastName: 'User',
    phone: `+234${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    deviceFingerprint: `test-fingerprint-${uniqueSuffix}`,
    role: 'admin' // This will work in development/test environment
  };
  const registerResponse = await makeRequest('post', '/auth/register', registerData);
  console.log('Register Response:', registerResponse);

  if (registerResponse?.data?.user?.id) {
    userId = registerResponse.data.user.id;
  }

  // Login
  console.log('\n2. Testing Login:');
  const loginResponse = await makeRequest('post', '/auth/login', {
    email: registerData.email,
    password: registerData.password,
    deviceFingerprint: registerData.deviceFingerprint
  });
  console.log('Login Response:', loginResponse);

  if (loginResponse?.data?.tokens?.accessToken) {
    authToken = loginResponse.data.tokens.accessToken;
    console.log('\nAuthentication token obtained successfully');
  } else {
    console.error('Failed to obtain authentication token');
    return;
  }

  // 2. Test User Endpoints
  console.log('\nTesting User Endpoints:');

  // Get Profile
  console.log('\n3. Testing Get Profile:');
  const profileResponse = await makeRequest('get', '/users/profile');
  console.log('Profile Response:', profileResponse);

  // Update Profile
  console.log('\n4. Testing Update Profile:');
  const updateResponse = await makeRequest('put', '/users/profile', {
    firstName: 'Updated',
    lastName: 'Name'
  });
  console.log('Update Profile Response:', updateResponse);

  // 3. Test Referral Endpoints
  console.log('\nTesting Referral Endpoints:');

  // Get Referral Code
  console.log('\n5. Testing Get Referral Code:');
  const referralCodeResponse = await makeRequest('get', '/referrals/code');
  console.log('Referral Code Response:', referralCodeResponse);

  // Get Referrals
  console.log('\n6. Testing Get Referrals:');
  const referralsResponse = await makeRequest('get', '/referrals');
  console.log('Referrals Response:', referralsResponse);

  // 4. Test Event Endpoints
  console.log('\nTesting Event Endpoints:');

  // Track Event
  console.log('\n7. Testing Track Event:');
  const trackEventResponse = await makeRequest('post', '/events/track', {
    eventName: 'test_event',
    properties: { test: true },
    metadata: { source: 'test' }
  });
  console.log('Track Event Response:', trackEventResponse);

  // 5. Test Experiment Endpoints
  console.log('\nTesting Experiment Endpoints:');

  // Create Experiment
  console.log('\n8. Testing Create Experiment:');
  const createExperimentResponse = await makeRequest('post', '/experiments', {
    name: 'Test Experiment',
    description: 'Test Description',
    variants: [{ name: 'A' }, { name: 'B' }],
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000).toISOString()
  });
  console.log('Create Experiment Response:', createExperimentResponse);

  // 6. Test Notification Endpoints
  console.log('\nTesting Notification Endpoints:');

  // Send Notification
  console.log('\n9. Testing Send Notification:');
  const sendNotificationResponse = await makeRequest('post', '/notifications/send', {
    userId: userId,
    type: 'custom',
    channel: 'email',
    title: 'Test Notification',
    content: 'This is a test notification'
  });
  console.log('Send Notification Response:', sendNotificationResponse);

  // 7. Test Analytics Endpoints
  console.log('\nTesting Analytics Endpoints:');

  // Get Onboarding Analytics
  console.log('\n10. Testing Get Onboarding Analytics:');
  const onboardingAnalyticsResponse = await makeRequest('get', '/analytics/onboarding');
  console.log('Onboarding Analytics Response:', onboardingAnalyticsResponse);

  // Get Referral Analytics
  console.log('\n11. Testing Get Referral Analytics:');
  const referralAnalyticsResponse = await makeRequest('get', '/analytics/referrals');
  console.log('Referral Analytics Response:', referralAnalyticsResponse);

  // Get Event Analytics
  console.log('\n12. Testing Get Event Analytics:');
  const eventAnalyticsResponse = await makeRequest('get', '/analytics/events');
  console.log('Event Analytics Response:', eventAnalyticsResponse);

  // Get Notification Analytics
  console.log('\n13. Testing Get Notification Analytics:');
  const notificationAnalyticsResponse = await makeRequest('get', '/analytics/notifications');
  console.log('Notification Analytics Response:', notificationAnalyticsResponse);

  // Get Retention Analytics
  console.log('\n14. Testing Get Retention Analytics:');
  const retentionAnalyticsResponse = await makeRequest('get', '/analytics/retention');
  console.log('Retention Analytics Response:', retentionAnalyticsResponse);

  console.log('\nAll endpoint tests completed!');
};

// Run the tests
testAllEndpoints().catch(console.error); 