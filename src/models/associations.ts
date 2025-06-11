import User from './User';
import Referral from './Referral';
import Event from './Event';
import Notification from './Notification';
import Experiment from './Experiment';

// User associations
User.hasMany(Referral, { foreignKey: 'referrerId', as: 'referrals' });
User.hasMany(Referral, { foreignKey: 'referredId', as: 'referredUsers' });
User.hasMany(Event, { foreignKey: 'userId', as: 'events' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
User.hasMany(Experiment, { foreignKey: 'createdBy', as: 'experiments' });

// Referral associations
Referral.belongsTo(User, { foreignKey: 'referrerId', as: 'referrer' });
Referral.belongsTo(User, { foreignKey: 'referredId', as: 'referred' });

// Event associations
Event.belongsTo(User, { foreignKey: 'userId', as: 'eventUser' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'userId', as: 'notificationUser' });

// Experiment associations
Experiment.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' }); 