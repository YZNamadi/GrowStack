const { v4: uuidv4 } = require('uuid');
const { ReferralStatus } = require('../types');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get admin and user IDs
    const [admin, user] = await queryInterface.sequelize.query(
      `SELECT id, referralCode FROM "Users" WHERE email IN ('admin@growstack.com', 'user@growstack.com')`
    );

    const referrals = [
      {
        id: uuidv4(),
        referrerId: admin[0].id,
        referredId: user[0].id,
        referralCode: admin[0].referralCode,
        status: ReferralStatus.PENDING,
        rewardAmount: 50.00,
        rewardCurrency: 'USD',
        rewardPaid: false,
        fraudScore: 0,
        metadata: {
          source: 'seeder',
          createdAt: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        referrerId: user[0].id,
        referredId: admin[0].id,
        referralCode: user[0].referralCode,
        status: ReferralStatus.COMPLETED,
        rewardAmount: 50.00,
        rewardCurrency: 'USD',
        rewardPaid: true,
        rewardPaidAt: new Date(),
        fraudScore: 0,
        metadata: {
          source: 'seeder',
          completedAt: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Referrals', referrals, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Referrals', {
      metadata: {
        source: 'seeder'
      }
    }, {});
  }
}; 