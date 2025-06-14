import { Sequelize } from 'sequelize';
import { config } from 'dotenv';

config();

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgresql://kyc_verification_user:q35ciqsT3sn6K903ydTBDGqSz3IgZZdq@dpg-d111qaidbo4c739ij1l0-a.singapore-postgres.render.com/kyc_verification', {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  retry: {
    max: 3,
    match: [/Deadlock/i, /Connection lost/i, /Connection terminated/i]
  }
});

export { sequelize }; 