import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import bcrypt from 'bcryptjs';

export enum UserRole {
  ADMIN = 'admin',
  MARKETER = 'marketer',
  ANALYST = 'analyst',
  USER = 'user'
}

export enum OnboardingStep {
  EMAIL = 'email',
  PHONE = 'phone',
  BVN = 'bvn',
  SELFIE = 'selfie',
  KYC_COMPLETE = 'kyc_complete'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DELETED = 'deleted'
}

export interface UserAttributes {
  id?: number;
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  onboardingStep: OnboardingStep;
  kycStatus: 'pending' | 'failed' | 'successful';
  referralCode: string;
  referredBy: number | null;
  deviceFingerprint: string;
  lastActive: Date;
  fraudScore: number;
  isBlocked: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public phone!: string;
  public password!: string;
  public firstName!: string;
  public lastName!: string;
  public role!: UserRole;
  public status!: UserStatus;
  public onboardingStep!: OnboardingStep;
  public kycStatus!: 'pending' | 'failed' | 'successful';
  public referralCode!: string;
  public referredBy!: number | null;
  public deviceFingerprint!: string;
  public lastActive!: Date;
  public fraudScore!: number;
  public isBlocked!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      defaultValue: UserRole.USER,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(UserStatus)),
      defaultValue: UserStatus.ACTIVE,
    },
    onboardingStep: {
      type: DataTypes.ENUM(...Object.values(OnboardingStep)),
      defaultValue: OnboardingStep.EMAIL,
    },
    kycStatus: {
      type: DataTypes.ENUM('pending', 'failed', 'successful'),
      defaultValue: 'pending',
    },
    referralCode: {
      type: DataTypes.STRING,
      unique: true,
    },
    referredBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    deviceFingerprint: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastActive: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    fraudScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
        // Generate unique referral code
        user.referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      },
    },
    indexes: [
      {
        fields: ['phone'],
        unique: true
      }
    ],
  }
);

export default User; 