import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

export interface EventAttributes {
  id?: number;
  userId: number;
  eventName: string;
  properties: Record<string, any>;
  metadata: {
    ip?: string;
    userAgent?: string;
    deviceId?: string;
    platform?: string;
  };
  timestamp?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

class Event extends Model<EventAttributes> implements EventAttributes {
  public id!: number;
  public userId!: number;
  public eventName!: string;
  public properties!: Record<string, any>;
  public metadata!: {
    ip?: string;
    userAgent?: string;
    deviceId?: string;
    platform?: string;
  };
  public timestamp!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Event.init(
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
    eventName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    properties: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Event',
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['eventName'],
      },
      {
        fields: ['createdAt'],
      },
      {
        fields: ['timestamp'],
      },
    ],
  }
);

// Associations
Event.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

export default Event; 