import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  PUSH = 'push'
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  DELIVERED = 'delivered',
  READ = 'read'
}

export enum NotificationType {
  KYC_REMINDER = 'kyc_reminder',
  REFERRAL_REWARD = 'referral_reward',
  INACTIVITY = 'inactivity',
  WELCOME = 'welcome',
  CUSTOM = 'custom'
}

export interface NotificationAttributes {
  id?: number;
  userId: number;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  title: string;
  content: string;
  read: boolean;
  metadata: {
    templateId?: string;
    variables?: Record<string, any>;
    retryCount?: number;
    error?: string;
    deliveredAt?: Date;
    readAt?: Date;
    sentAt?: Date;
  };
  scheduledFor: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

class Notification extends Model<NotificationAttributes> implements NotificationAttributes {
  public id!: number;
  public userId!: number;
  public type!: NotificationType;
  public channel!: NotificationChannel;
  public status!: NotificationStatus;
  public title!: string;
  public content!: string;
  public read!: boolean;
  public metadata!: {
    templateId?: string;
    variables?: Record<string, any>;
    retryCount?: number;
    error?: string;
    deliveredAt?: Date;
    readAt?: Date;
    sentAt?: Date;
  };
  public scheduledFor!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM(...Object.values(NotificationType)),
      allowNull: false,
    },
    channel: {
      type: DataTypes.ENUM(...Object.values(NotificationChannel)),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(NotificationStatus)),
      defaultValue: NotificationStatus.PENDING,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    scheduledFor: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Notification',
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['scheduledFor'],
      },
      {
        fields: ['read'],
      },
    ],
  }
);

// Associations
Notification.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

export default Notification; 