const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { generateReferralCode } = require('../utils/referral');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = [
      {
        id: uuidv4(),
        email: 'admin@growstack.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        onboardingStep: 'completed',
        kycStatus: 'verified',
        referralCode: generateReferralCode(),
        deviceFingerprint: 'admin-device',
        lastActive: new Date(),
        fraudScore: 0,
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        email: 'user@growstack.com',
        password: hashedPassword,
        firstName: 'Demo',
        lastName: 'User',
        role: 'user',
        onboardingStep: 'signup',
        kycStatus: 'pending',
        referralCode: generateReferralCode(),
        deviceFingerprint: 'user-device',
        lastActive: new Date(),
        fraudScore: 0,
        isBlocked: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Users', users, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', {
      email: {
        [Sequelize.Op.in]: ['admin@growstack.com', 'user@growstack.com']
      }
    }, {});
  }
}; 