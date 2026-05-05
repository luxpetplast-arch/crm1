const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StripeTransaction = sequelize.define('StripeTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  stripeId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  type: {
    type: DataTypes.ENUM('charge', 'refund', 'transfer', 'payout'),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'usd',
  },
  status: {
    type: DataTypes.ENUM('pending', 'succeeded', 'failed', 'canceled'),
    defaultValue: 'pending',
  },
  description: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  tableName: 'stripe_transactions',
  timestamps: true,
});

module.exports = StripeTransaction;
