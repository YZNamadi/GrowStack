'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Referrals', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      referrerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      referredId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      referralCode: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed', 'rewarded'),
        defaultValue: 'pending',
      },
      rewardAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      rewardCurrency: {
        type: Sequelize.STRING,
        defaultValue: 'NGN',
      },
      rewardPaid: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      rewardPaidAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      fraudScore: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add indexes
    await queryInterface.addIndex('Referrals', ['referrerId']);
    await queryInterface.addIndex('Referrals', ['referredId']);
    await queryInterface.addIndex('Referrals', ['referralCode']);
    await queryInterface.addIndex('Referrals', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Referrals');
  },
}; 