const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'UZS',
  },
  description: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  vendor: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
}, {
  tableName: 'expenses',
  timestamps: true,
});

module.exports = Expense;
