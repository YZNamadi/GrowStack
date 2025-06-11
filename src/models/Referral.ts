import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export enum ReferralStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REWARDED = 'rewarded'
}

export interface ReferralAttributes {
  id?: number;
  referrerId: number;
  referredId: number;
  referralCode: string;
  status: ReferralStatus;
  rewardAmount: number;
  rewardCurrency: string;
  rewardPaid: boolean;
  rewardPaidAt: Date | null;
  fraudScore: number;
  metadata: {
    ip?: string;
    deviceId?: string;
    userAgent?: string;
    source?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

class Referral extends Model<ReferralAttributes> implements ReferralAttributes {
  public id!: number;
  public referrerId!: number;
  public referredId!: number;
  public referralCode!: string;
  public status!: ReferralStatus;
  public rewardAmount!: number;
  public rewardCurrency!: string;
  public rewardPaid!: boolean;
  public rewardPaidAt!: Date | null;
  public fraudScore!: number;
  public metadata!: {
    ip?: string;
    deviceId?: string;
    userAgent?: string;
    source?: string;
  };
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Referral.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    referrerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    referredId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    referralCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ReferralStatus)),
      defaultValue: ReferralStatus.PENDING,
    },
    rewardAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    rewardCurrency: {
      type: DataTypes.STRING,
      defaultValue: 'NGN',
    },
    rewardPaid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    rewardPaidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fraudScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: 'Referral',
    indexes: [
      {
        fields: ['referrerId'],
      },
      {
        fields: ['referredId'],
      },
      {
        fields: ['referralCode'],
      },
      {
        fields: ['status'],
      },
    ],
  }
);

export default Referral; 