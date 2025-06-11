import request from 'supertest';
import { app } from '../app';
import { User, Referral } from '../models';
import { ReferralStatus } from '../types';

describe('Referral Endpoints', () => {
  let userToken: string;
  let referrerToken: string;
  let referrerId: string;
  let referralCode: string;

  beforeAll(async () => {
    // Create referrer user
    const referrerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'referrer@test.com',
        password: 'password123',
        firstName: 'Referrer',
        lastName: 'User'
      });

    referrerToken = referrerResponse.body.data.token;
    referrerId = referrerResponse.body.data.user.id;
    referralCode = referrerResponse.body.data.user.referralCode;

    // Create regular user
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'user@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        referralCode
      });

    userToken = userResponse.body.data.token;
  });

  afterAll(async () => {
    await User.destroy({ where: {} });
    await Referral.destroy({ where: {} });
  });

  describe('GET /api/referrals/stats', () => {
    it('should get referral statistics for authenticated user', async () => {
      const response = await request(app)
        .get('/api/referrals/stats')
        .set('Authorization', `Bearer ${referrerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalReferrals');
      expect(response.body.data).toHaveProperty('activeReferrals');
      expect(response.body.data).toHaveProperty('completedReferrals');
      expect(response.body.data).toHaveProperty('totalRewards');
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/referrals/stats');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/referrals/link', () => {
    it('should get referral link for authenticated user', async () => {
      const response = await request(app)
        .get('/api/referrals/link')
        .set('Authorization', `Bearer ${referrerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('referralCode');
      expect(response.body.data).toHaveProperty('referralLink');
      expect(response.body.data.referralCode).toBe(referralCode);
    });

    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/referrals/link');

      expect(response.status).toBe(401);
    });
  });

  describe('Referral Creation', () => {
    it('should create referral when user registers with valid code', async () => {
      const referral = await Referral.findOne({
        where: {
          referrerId,
          referralCode
        }
      });

      expect(referral).toBeTruthy();
      expect(referral?.status).toBe(ReferralStatus.PENDING);
    });

    it('should not create referral with invalid code', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid@test.com',
          password: 'password123',
          firstName: 'Invalid',
          lastName: 'User',
          referralCode: 'invalid-code'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
}); 