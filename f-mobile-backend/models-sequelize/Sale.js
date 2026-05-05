const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sale = sequelize.define('Sale', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  cashier: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  branch: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  customer: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  items: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  totalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  paidAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  change: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'UZS',
  },
  paymentMethods: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'completed',
  },
  notes: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
}, {
  tableName: 'sales',
  timestamps: true,
});

// Add virtual _id field for MongoDB compatibility
Sale.addHook('afterFind', (result) => {
  if (Array.isArray(result)) {
    result.forEach(sale => {
      if (sale && sale.id) sale._id = sale.id;
    });
  } else if (result && result.id) {
    result._id = result.id;
  }
});

module.exports = Sale;
