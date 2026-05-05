const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Branch = sequelize.define('Branch', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  phone: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
  manager: {
    type: DataTypes.STRING,
    defaultValue: '',
  },
}, {
  tableName: 'branches',
  timestamps: true,
});

// Add virtual _id field for MongoDB compatibility
Branch.addHook('afterFind', (result) => {
  if (Array.isArray(result)) {
    result.forEach(branch => {
      if (branch && branch.id) branch._id = branch.id;
    });
  } else if (result && result.id) {
    result._id = result.id;
  }
});

module.exports = Branch;
