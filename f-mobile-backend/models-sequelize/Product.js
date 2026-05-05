const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sku: {
    type: DataTypes.STRING,
    unique: true,
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  costPrice: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  sellPrice: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  currency: {
    type: DataTypes.ENUM('USD', 'UZS'),
    defaultValue: 'USD',
  },
  sellCurrency: {
    type: DataTypes.ENUM('USD', 'UZS'),
    defaultValue: 'USD',
  },
  imeiList: {
    type: DataTypes.JSONB,
    defaultValue: [],
  },
  imei: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  branch: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  tableName: 'products',
  timestamps: true,
});

// Add virtual _id field for MongoDB compatibility
Product.addHook('afterFind', (result) => {
  if (Array.isArray(result)) {
    result.forEach(product => {
      if (product && product.id) product._id = product.id;
    });
  } else if (result && result.id) {
    result._id = result.id;
  }
});

module.exports = Product;
