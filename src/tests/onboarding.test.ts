import request from 'supertest';
import { app } from '../app';
import { User } from '../models';
import { OnboardingStep } from '../types';

describe('Onboarding Endpoints', () => {
  let userToken: string;
  let adminToken: string;
  let userId: string;

  beforeAll(async () => {
    // Create regular user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'onboarding@test.com',
        password: 'password123',
        firstName: 'Onboarding',
        lastName: 'User'
      });

    userToken = userResponse.body.data.token;
    userId = userResponse.body.data.user.id;

    // Create admin user
    const adminResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'admin@test.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User'
      });

    adminToken = adminResponse.body.data.token;

    // Update admin role
    await User.update(
      { role: 'admin' },
      { where: { email: 'admin@test.com' } }
    );
  });

  afterAll(async () => {
    await User.destroy({ where: {} });
  });

  describe('POST /api/onboarding/step', () => {
    it('should update onboarding step for authenticated user', async () => {
      const response = await request(app)
        .post('/api/onboarding/step')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          step: OnboardingStep.KYC,
          metadata: {
            documentType: 'passport',
            documentNumber: 'AB123456'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.onboardingStep).toBe(OnboardingStep.KYC);
    });

    it('should not allow invalid step progression', async () => {
      const response = await request(app)
        .post('/api/onboarding/step')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          step: OnboardingStep.COMPLETED
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .post('/api/onboarding/step')
        .send({
          step: OnboardingStep.KYC
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/onboarding/stats', () => {
    it('should get onboarding statistics for admin', async () => {
      const response = await request(app)
        .get('/api/onboarding/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalUsers');
      expect(response.body.data).toHaveProperty('usersByStep');
      expect(response.body.data).toHaveProperty('dropOffs');
    });

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .get('/api/onboarding/stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/onboarding/stats');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/onboarding/time-stats', () => {
    it('should get onboarding time statistics for admin', async () => {
      const response = await request(app)
        .get('/api/onboarding/time-stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('averageTimeByStep');
      expect(response.body.data).toHaveProperty('medianTimeByStep');
    });

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .get('/api/onboarding/time-stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });
  });
}); 