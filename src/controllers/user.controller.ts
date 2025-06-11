import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import User from '../models/User';
import { createEvent } from '../services/event.service';

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    res.json({
      status: 'success',
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          phone: req.user.phone,
          role: req.user.role,
          onboardingStep: req.user.onboardingStep,
          kycStatus: req.user.kycStatus,
          referralCode: req.user.referralCode,
          lastActive: req.user.lastActive,
          createdAt: req.user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { firstName, lastName, phone } = req.body;

    await req.user.update({
      firstName: firstName || req.user.firstName,
      lastName: lastName || req.user.lastName,
      phone: phone || req.user.phone,
    });

    // Track profile update event
    await createEvent({
      userId: req.user.id,
      eventName: 'profile_updated',
      properties: {
        updatedFields: Object.keys(req.body),
      },
    });

    res.json({
      status: 'success',
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          phone: req.user.phone,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role,
          onboardingStep: user.onboardingStep,
          kycStatus: user.kycStatus,
          isBlocked: user.isBlocked,
          lastActive: user.lastActive,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserBlockStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await user.update({ isBlocked });

    // Track user block/unblock event
    await createEvent({
      userId: user.id,
      eventName: isBlocked ? 'user_blocked' : 'user_unblocked',
      properties: {
        blockedBy: req.user?.id,
      },
    });

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          isBlocked: user.isBlocked,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}; 