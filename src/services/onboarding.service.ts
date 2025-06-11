import User, { OnboardingStep } from '../models/User';
import { createEvent } from './event.service';
import { AppError } from '../middleware/errorHandler';

export const updateOnboardingStep = async (
  userId: number,
  step: OnboardingStep,
  metadata?: Record<string, any>
) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Validate step progression
  const currentStepIndex = Object.values(OnboardingStep).indexOf(user.onboardingStep);
  const newStepIndex = Object.values(OnboardingStep).indexOf(step);

  if (newStepIndex <= currentStepIndex) {
    throw new AppError('Cannot move to a previous or current step', 400);
  }

  // Update user's onboarding step
  await user.update({ onboardingStep: step });

  // Track step completion event
  await createEvent({
    userId,
    eventName: 'onboarding_step_completed',
    properties: {
      step,
      previousStep: user.onboardingStep,
      ...metadata,
    },
  });

  return user;
};

export const getOnboardingStats = async (timeRange?: { startDate: Date; endDate: Date }) => {
  const where: any = {};
  if (timeRange) {
    where.createdAt = {
      [User.sequelize.Op.between]: [timeRange.startDate, timeRange.endDate],
    };
  }

  const users = await User.findAll({ where });

  const stats = {
    total: users.length,
    byStep: Object.values(OnboardingStep).reduce((acc, step) => {
      acc[step] = users.filter((user) => user.onboardingStep === step).length;
      return acc;
    }, {} as Record<OnboardingStep, number>),
    dropoffs: Object.values(OnboardingStep).reduce((acc, step, index, steps) => {
      if (index < steps.length - 1) {
        const currentStepCount = users.filter((user) => user.onboardingStep === step).length;
        const nextStepCount = users.filter((user) => user.onboardingStep === steps[index + 1]).length;
        acc[step] = currentStepCount - nextStepCount;
      }
      return acc;
    }, {} as Record<OnboardingStep, number>),
  };

  return stats;
};

export const getOnboardingTimeStats = async () => {
  const users = await User.findAll({
    where: {
      onboardingStep: OnboardingStep.KYC_COMPLETE,
    },
  });

  const timeStats = users.map((user) => {
    const signupTime = user.createdAt;
    const kycCompleteTime = user.updatedAt;
    const timeToComplete = kycCompleteTime.getTime() - signupTime.getTime();

    return {
      userId: user.id,
      timeToComplete: Math.round(timeToComplete / (1000 * 60 * 60)), // Convert to hours
    };
  });

  const averageTime = timeStats.reduce((sum, stat) => sum + stat.timeToComplete, 0) / timeStats.length;

  return {
    averageTimeToComplete: Math.round(averageTime),
    timeStats,
  };
}; 