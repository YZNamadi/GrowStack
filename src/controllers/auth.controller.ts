import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../middleware/errorHandler';
import User, { UserRole, OnboardingStep, UserStatus } from '../models/User';
import Referral, { ReferralStatus } from '../models/Referral';
import { createEvent } from '../services/event.service';
import { Op } from 'sequelize';

interface RegisterBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  deviceFingerprint: string;
  referralCode?: string;
  role?: UserRole;
}

interface LoginBody {
  email: string;
  password: string;
  deviceFingerprint: string;
}

const generateTokens = (user: User) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

export const register = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      deviceFingerprint,
      referralCode,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      throw new AppError('User already exists', 400);
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      deviceFingerprint,
      role: (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') && req.body.role ? req.body.role : UserRole.USER,
      onboardingStep: OnboardingStep.EMAIL,
      kycStatus: 'pending',
      isBlocked: false,
      lastActive: new Date(),
      fraudScore: 0,
      referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      status: UserStatus.ACTIVE
    });

    // Handle referral if provided
    if (referralCode) {
      const referrer = await User.findOne({
        where: { referralCode },
      });

      if (referrer) {
        // Create referral record
        await Referral.create({
          referrerId: referrer.id,
          referredId: user.id,
          referralCode,
          status: ReferralStatus.PENDING,
          rewardAmount: 0,
          rewardCurrency: 'NGN',
          rewardPaid: false,
          fraudScore: 0,
          metadata: {}
        });
      }
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Track registration event
    await createEvent({
      userId: user.id,
      eventName: 'user_registered',
      properties: {
        referralCode,
        deviceFingerprint,
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<{}, {}, LoginBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, deviceFingerprint } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if user is blocked
    if (user.isBlocked) {
      throw new AppError('Account is blocked', 403);
    }

    // Update device fingerprint and last active
    await user.update({
      deviceFingerprint,
      lastActive: new Date(),
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Track login event
    await createEvent({
      userId: user.id,
      eventName: 'user_logged_in',
      properties: {
        deviceFingerprint,
      },
    });

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as { id: number };

    // Find user
    const user = await User.findByPk(decoded.id);
    if (!user) {
      throw new AppError('User not found', 401);
    }

    // Generate new tokens
    const tokens = generateTokens(user);

    res.json({
      status: 'success',
      data: {
        tokens,
      },
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid refresh token', 401));
    } else {
      next(error);
    }
  }
}; 