import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

export enum ExperimentStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed'
}

export interface ExperimentAttributes {
  id?: number;
  name: string;
  description: string;
  variants: {
    name: string;
    weight: number;
    config: Record<string, any>;
  }[];
  startDate: Date;
  endDate: Date;
  status: ExperimentStatus;
  createdBy: number;
  metadata: {
    targetAudience?: string[];
    successMetrics?: string[];
    notes?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

class Experiment extends Model<ExperimentAttributes> implements ExperimentAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public variants!: {
    name: string;
    weight: number;
    config: Record<string, any>;
  }[];
  public startDate!: Date;
  public endDate!: Date;
  public status!: ExperimentStatus;
  public createdBy!: number;
  public metadata!: {
    targetAudience?: string[];
    successMetrics?: string[];
    notes?: string;
  };
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Experiment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    variants: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ExperimentStatus)),
      defaultValue: ExperimentStatus.DRAFT,
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: 'Experiment',
    indexes: [
      {
        fields: ['status'],
      },
      {
        fields: ['createdBy'],
      },
      {
        fields: ['startDate'],
      },
      {
        fields: ['endDate'],
      },
    ],
  }
);

export default Experiment; 