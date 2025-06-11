import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import User from '../models/User';
import Referral, { ReferralStatus } from '../models/Referral';
import { createEvent } from '../services/event.service';
import { Op } from 'sequelize';

export const getReferralCode = async (
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
        referralCode: req.user.referralCode,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getReferralStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { startDate, endDate } = req.query;
    const where: any = { referrerId: req.user.id };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate as string);
      }
    }

    const referrals = await Referral.findAll({
      where,
      include: [
        {
          model: User,
          as: 'referred',
          attributes: ['id', 'email', 'firstName', 'lastName'],
        },
      ],
    });

    const stats = {
      total: referrals.length,
      completed: referrals.filter((r) => r.status === ReferralStatus.COMPLETED).length,
      rewarded: referrals.filter((r) => r.status === ReferralStatus.REWARDED).length,
      pending: referrals.filter((r) => r.status === ReferralStatus.PENDING).length,
      totalRewards: referrals.reduce((sum, r) => sum + Number(r.rewardAmount), 0),
    };

    res.json({
      status: 'success',
      data: {
        stats,
        referrals,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getReferralTree = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, depth = 3 } = req.query;
    const targetUserId = userId ? parseInt(userId as string) : req.user?.id;

    if (!targetUserId) {
      throw new AppError('User ID is required', 400);
    }

    const buildTree = async (userId: number, currentDepth: number): Promise<any> => {
      if (currentDepth <= 0) return null;

      const user = await User.findByPk(userId, {
        attributes: ['id', 'email', 'firstName', 'lastName', 'referralCode'],
      });

      if (!user) return null;

      const referrals = await Referral.findAll({
        where: { referrerId: userId },
        include: [
          {
            model: User,
            as: 'referred',
            attributes: ['id', 'email', 'firstName', 'lastName', 'referralCode'],
          },
        ],
      });

      const children = await Promise.all(
        referrals.map((referral) =>
          buildTree(referral.referredId, currentDepth - 1)
        )
      );

      return {
        user,
        referrals: referrals.map((referral) => ({
          ...referral.toJSON(),
          children: children[referrals.indexOf(referral)],
        })),
      };
    };

    const tree = await buildTree(targetUserId, parseInt(depth as string));

    res.json({
      status: 'success',
      data: {
        tree,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const claimReward = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const { referralId } = req.body;

    const referral = await Referral.findOne({
      where: {
        id: referralId,
        referrerId: req.user.id,
        status: ReferralStatus.COMPLETED,
        rewardPaid: false,
      },
    });

    if (!referral) {
      throw new AppError('Invalid referral or reward already claimed', 400);
    }

    // Update referral status and mark reward as paid
    await referral.update({
      status: ReferralStatus.REWARDED,
      rewardPaid: true,
      rewardPaidAt: new Date(),
    });

    // Track reward claim event
    await createEvent({
      userId: req.user.id,
      eventName: 'referral_reward_claimed',
      properties: {
        referralId,
        rewardAmount: referral.rewardAmount,
        rewardCurrency: referral.rewardCurrency,
      },
    });

    res.json({
      status: 'success',
      data: {
        referral,
      },
    });
  } catch (error) {
    next(error);
  }
}; 