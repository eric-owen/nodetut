const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) throw new Error('email not valid');
    },
    trim: true,
    lowercase: true,
  },

  tokens: [{
    token: {
      type: String,
      required: true,
    },
  }],
});

userSchema.methods.generateAuthToken = async function generate() {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, 'testing');

  user.tokens = user.tokens.concat({ token });
  await user.save();

  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  // eslint-disable-next-line no-use-before-define
  const user = await User.findOne({ email });
  if (!user) throw new Error('unable to login');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('unable to login');

  return user;
};

userSchema.pre('save', async function hashPass(next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
