// MongoDB Models
const User = require('./User');
const Branch = require('./Branch');
const Customer = require('./Customer');
const Product = require('./Product');
const Sale = require('./Sale');
const Income = require('./Income');
const Expense = require('./Expense');
const StripeTransaction = require('./StripeTransaction');

module.exports = {
  User,
  Branch,
  Customer,
  Product,
  Sale,
  Income,
  Expense,
  StripeTransaction
};

