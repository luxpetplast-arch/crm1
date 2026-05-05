const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  address: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  debt: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  totalPurchase: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  telegramUserId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  branches: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: [],
  },
}, {
  tableName: 'customers',
  timestamps: true,
});

// Add virtual _id field for MongoDB compatibility
Customer.addHook('afterFind', (result) => {
  if (Array.isArray(result)) {
    result.forEach(customer => {
      if (customer && customer.id) customer._id = customer.id;
    });
  } else if (result && result.id) {
    result._id = result.id;
  }
});

module.exports = Customer;
