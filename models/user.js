const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, index: true },
  password: { type: String, required: true, select: false },
  default: { type: Boolean, required: false, default: false },
  isActive: { type: Boolean, required: false, default: true }
}, { timestamps: true });

module.exports = model('User', userSchema, 'users');