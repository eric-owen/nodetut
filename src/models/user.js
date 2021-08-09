const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    validate(value) {
      if (value < 0) {
        throw new Error('age must be a pos num');
      }
    },
    default: 0,
  },

  password: {
    required: true,
    trime: true,
    type: String,
    validate(value) {
      if (
        !validator.isStrongPassword(value, {
          minLength: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
      ) {
        throw new Error('Is Not Strong Password');
      }
    },
  },

  email: {
    type: String,
    required: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('email not valid');
      }
    },
    trim: true,
    lowercase: true,
  },
});

userSchema.pre('save', async function (next) {
  const user = this;
  const hash = await bcrypt.hash(user.password, 8);
  this.password = hash;
  next();
});
const User = mongoose.model('User', userSchema);

module.exports = User;
