'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM('admin', 'marketer', 'analyst', 'user'),
        defaultValue: 'user',
      },
      onboardingStep: {
        type: Sequelize.ENUM('email', 'phone', 'bvn', 'selfie', 'kyc_complete'),
        defaultValue: 'email',
      },
      kycStatus: {
        type: Sequelize.ENUM('pending', 'failed', 'successful'),
        defaultValue: 'pending',
      },
      referralCode: {
        type: Sequelize.STRING,
        unique: true,
      },
      referredBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      deviceFingerprint: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastActive: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      fraudScore: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      isBlocked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'suspended', 'deleted'),
        defaultValue: 'active',
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  },
}; 
 